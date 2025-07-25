import { createServerFn } from "@tanstack/react-start";
import { ToolSubmissionSchema, ToolSubmissionFormData } from "@/lib/schema";
import { Effect, Schema, ParseResult, Exit, Cause, Data } from "effect";

class FormValidationError extends Data.TaggedError("FormValidationError")<{
  readonly issues: ReadonlyArray<ParseResult.ArrayFormatterIssue>;
}> {}

function validateToolSubmission(data: unknown) {
  return Schema.decodeUnknown(ToolSubmissionSchema, {
    errors: "all",
  })(data).pipe(
    Effect.mapError(
      (error) =>
        new FormValidationError({
          issues: ParseResult.ArrayFormatter.formatErrorSync(error),
        })
    ),
    Effect.tapErrorTag("FormValidationError", (error) => Effect.log(error))
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
    const validationEffect = validateToolSubmission(data);
    const result = Effect.runSyncExit(validationEffect);

    return Exit.match(result, {
      onSuccess: (validatedData) => validatedData,
      onFailure: (cause) => {
        const failure = Cause.failureOption(cause);
        if (
          failure._tag === "Some" &&
          failure.value instanceof FormValidationError
        ) {
          const error = {
            name: "FormValidationError",
            issues: failure.value.issues,
          };
          throw error;
        }
        throw new Error(
          "An unexpected error occured on the server. please try again."
        );
      },
    });
  })
  .handler(({ data }) => Effect.runPromise(handleToolSubmission(data)));
