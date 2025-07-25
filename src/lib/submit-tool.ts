import { createServerFn } from "@tanstack/react-start";
import { ToolSubmissionSchema, ToolSubmissionFormData } from "@/lib/schema";
import { Effect, Schema, ParseResult, Exit, Cause, Either } from "effect";

class FormValidationError extends Error {
  constructor(
    public readonly issues: ReadonlyArray<ParseResult.ArrayFormatterIssue>
  ) {
    super("Form validation failed.");
    this.name = "FormValidationError";
  }
}

function validateToolSubmission(data: unknown) {
  return Effect.gen(function* () {
    yield* Effect.log("Form data: ", data);
    const validateData = yield* Schema.decodeUnknown(ToolSubmissionSchema, {
      errors: "all",
    })(data);
    return validateData;
  }).pipe(
    Effect.tapErrorTag("ParseError", (error) =>
      Effect.log(
        "Formatted error:",
        ParseResult.ArrayFormatter.formatErrorSync(error)
      )
    )
  );
}

function handleToolSubmission(data: ToolSubmissionFormData) {
  return Effect.gen(function* () {
    yield* Effect.log(`Received data from validatro: ${data}`);
    return { success: true, message: "Tool submitted successfully." };
  });
}

export const submitTool = createServerFn({ method: "POST" })
  .validator((data) => {
    const validateEffect = validateToolSubmission(data);
    const validateEffectWithTransformedError = validateEffect.pipe(
      Effect.mapError((error) => {
        const formattedIssues =
          ParseResult.ArrayFormatter.formatErrorSync(error);
        return new FormValidationError(formattedIssues);
      })
    );
    const result = Effect.runSyncExit(validateEffectWithTransformedError);
    if (Exit.isSuccess(result)) {
      return result.value;
    } else {
      const error = Cause.failureOrCause(result.cause);
      throw Either.isLeft(error)
        ? error.left
        : new Error("An unknown defect occurred.");
    }
  })
  .handler(({ data }) => Effect.runPromise(handleToolSubmission(data)));
