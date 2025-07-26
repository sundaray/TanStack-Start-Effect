import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import {
  ToolSubmissionSchema,
  type ToolSubmissionFormData,
} from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import axios from "axios";
import { submitTool } from "@/lib/submit-tool";
import { FormField } from "@/components/form-field";
import { CategoryInput } from "@/components/category-input";

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

const PREDEFINED_CATEGORIES = [
  "Development",
  "Design",
  "Marketing",
  "Productivity",
  "AI/ML",
  "Analytics",
  "Communication",
  "Security",
];

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
      tagline: "",
      categories: [],
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
      <FormField
        id="nam"
        name="name"
        label="Name"
        type="text"
        control={control}
        disabled={isProcessing}
      />

      {/* Website Field */}
      <FormField
        id="website"
        name="website"
        label="Website"
        type="url"
        control={control}
        disabled={isProcessing}
      />

      {/* Tagline Field */}
      <FormField
        id="tagline"
        name="tagline"
        label="Tagline"
        type="text"
        control={control}
        disabled={isProcessing}
      />

      {/* Categories Field */}
      <FormField
        id="categories"
        name="categories"
        label="Categories"
        control={control}
        disabled={isProcessing}
        renderField={({ field }) => (
          <CategoryInput {...field} disabled={isProcessing} />
        )}
      />

      {/* Submit Button */}
      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit Tool"}
      </Button>
    </form>
  );
}
