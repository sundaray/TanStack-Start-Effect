import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import {
  ToolSubmissionSchema,
  type ToolSubmissionFormData,
  pricingOptions,
} from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import axios from "axios";
import { submitTool } from "@/lib/submit-tool";
import { FormField } from "@/components/form-field";
import { CategoryInput } from "@/components/category-input";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropzoneInput } from "@/components/dropzone-input";

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

export const PREDEFINED_CATEGORIES = [
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
      description: "",
      categories: [],
      logo: undefined,
      homepageScreenshot: undefined,
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

      {/* 3. Description Field */}
      <FormField
        id="description"
        name="description"
        label="Description"
        control={control}
        disabled={isProcessing}
        renderField={({ field }) => (
          <RichTextEditor field={field} disabled={isProcessing} />
        )}
      />

      {/* Categories Field */}
      <FormField
        id="categories"
        name="categories"
        label="Categories"
        control={control}
        disabled={isProcessing}
        renderField={({ field, fieldState }) => (
          <CategoryInput
            field={field}
            fieldState={fieldState}
            disabled={isProcessing}
          />
        )}
      />

      {/* Pricing Field */}
      <FormField
        id="pricing"
        name="pricing"
        label="Pricing"
        control={control}
        disabled={isProcessing}
        renderField={({ field }) => (
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isProcessing}
          >
            <SelectTrigger className="mt-2 border-neutral-300 w-full">
              <SelectValue placeholder="Select a pricing model" />
            </SelectTrigger>
            <SelectContent>
              {pricingOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {/* Logo Field */}
      <FormField
        id="logo"
        name="logo"
        label="Logo"
        control={control}
        disabled={isProcessing}
        renderField={({ field }) => (
          <DropzoneInput field={field} disabled={isProcessing} />
        )}
      />

      {/* NEW: Homepage Screenshot Field */}
      <FormField
        id="homepageScreenshot"
        name="homepageScreenshot"
        label="Homepage Screenshot"
        control={control}
        disabled={isProcessing}
        renderField={({ field }) => (
          <DropzoneInput field={field} disabled={isProcessing} />
        )}
      />

      {/* Submit Button */}
      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit Tool"}
      </Button>
    </form>
  );
}
