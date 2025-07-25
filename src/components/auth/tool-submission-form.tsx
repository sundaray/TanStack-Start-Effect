import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import {
  ToolSubmissionSchema,
  type ToolSubmissionFormData,
} from "@/lib/schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import { FormFieldMessage } from "@/components/auth/form-field-message";
import { getFieldErrorId } from "@/lib/utils";
import axios from "axios";
import { submitTool } from "@/lib/submit-tool";

type FormValidationError = {
  name: "FormValidationError";
  issues: { path: string[]; message: string }[];
};

function isFormValidationError(error: unknown): error is FormValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as any).name === "FormValidationError" &&
    Array.isArray((error as any).issues)
  );
}

export function ToolSubmissionForm() {
  const id = useId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ToolSubmissionFormData>({
    resolver: effectTsResolver(ToolSubmissionSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      website: "",
    },
  });

  const onSubmit = async function (data: ToolSubmissionFormData) {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await submitTool({ data });
      if (result.success && result.message) {
        setSuccessMessage(result.message);
        reset();
      }
    } catch (error) {
      if (isFormValidationError(error)) {
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof ToolSubmissionFormData;
          setError(fieldName, {
            message: issue.message,
          });
        });
      } else {
        setErrorMessage(
          "An unexpected error occured on the server. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
      {message && <FormMessage message={message} type={messageType} />}

      {/* Name Field */}
      <div>
        <Label htmlFor="name">Name</Label>
        <Controller
          name="name"
          control={control}
          render={function ({ field }) {
            const fieldErrorId = getFieldErrorId(field.name, id);
            const fieldError = errors[field.name];
            return (
              <>
                <Input
                  {...field}
                  id="name"
                  className="mt-2 border-neutral-300"
                  placeholder="Enter tool name"
                  aria-invalid={fieldError ? "true" : "false"}
                  aria-describedby={fieldError ? fieldErrorId : undefined}
                  disabled={isProcessing}
                />
                <FormFieldMessage
                  error={fieldError?.message}
                  errorId={fieldErrorId}
                />
              </>
            );
          }}
        />
      </div>

      {/* Website Field */}
      <div>
        <Label htmlFor="website">Website</Label>
        <Controller
          name="website"
          control={control}
          render={function ({ field }) {
            const fieldErrorId = getFieldErrorId(field.name, id);
            const fieldError = errors[field.name];
            return (
              <>
                <Input
                  {...field}
                  id="website"
                  className="mt-2 border-neutral-300"
                  placeholder="https://example.com"
                  aria-invalid={fieldError ? "true" : "false"}
                  aria-describedby={fieldError ? fieldErrorId : undefined}
                  disabled={isProcessing}
                />
                <FormFieldMessage
                  error={fieldError?.message}
                  errorId={fieldErrorId}
                />
              </>
            );
          }}
        />
      </div>
      {/* Submit Button */}
      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit Tool"}
      </Button>
    </form>
  );
}
