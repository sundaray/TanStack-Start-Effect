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
import { X, Plus } from "lucide-react";

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
  const [categoryInput, setCategoryInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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

      {/* Tagline Field */}
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Controller
          name="tagline"
          control={control}
          render={function ({ field }) {
            const fieldErrorId = getFieldErrorId(field.name, id);
            const fieldError = errors[field.name];
            return (
              <>
                <Input
                  {...field}
                  id="tagline"
                  className="mt-2"
                  placeholder="Brief description of your tool"
                  maxLength={100}
                  aria-invalid={fieldError ? "true" : "false"}
                  aria-describedby={fieldError ? fieldErrorId : undefined}
                  disabled={isProcessing}
                />
                {/* <div className="mt-1 text-sm text-gray-500">
                  {field.value.length}/100 characters
                </div> */}
                <FormFieldMessage
                  error={fieldError?.message}
                  errorId={fieldErrorId}
                />
              </>
            );
          }}
        />
      </div>
      {/* Categories Field */}
      <div className="space-y-2">
        <Label htmlFor="categories">
          Categories
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Select up to 3)
          </span>
        </Label>
        <Controller
          name="categories"
          control={control}
          render={function ({ field }) {
            const fieldErrorId = getFieldErrorId(field.name, id);
            const fieldError = errors[field.name];
            const selectedCategories = field.value || [];
            const canAddMore = selectedCategories.length < 3;

            // Filter suggestions based on input
            const filteredSuggestions = categoryInput.trim()
              ? PREDEFINED_CATEGORIES.filter(
                  (cat) =>
                    !selectedCategories.includes(cat) &&
                    cat.toLowerCase().includes(categoryInput.toLowerCase())
                )
              : [];

            function addCategory(category: string) {
              const trimmedCategory = category.trim();
              if (
                trimmedCategory &&
                !selectedCategories.includes(trimmedCategory) &&
                canAddMore
              ) {
                field.onChange([...selectedCategories, trimmedCategory]);
                setCategoryInput("");
                setShowSuggestions(false);
              }
            }

            function removeCategory(categoryToRemove: string) {
              field.onChange(
                selectedCategories.filter((cat) => cat !== categoryToRemove)
              );
            }

            return (
              <div className="space-y-3">
                {/* Selected Categories */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm"
                      >
                        <span className="text-xs font-medium text-blue-600">
                          {index === 0 ? "Primary" : `Secondary`}:
                        </span>
                        <span className="text-blue-800">{category}</span>
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-0.5"
                          aria-label={`Remove ${category}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category Input */}
                {canAddMore && (
                  <div className="relative">
                    <div className="relative">
                      <Input
                        id="categories"
                        value={categoryInput}
                        onChange={(e) => {
                          setCategoryInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (categoryInput.trim()) {
                              addCategory(categoryInput);
                            }
                          }
                          if (e.key === "Escape") {
                            setShowSuggestions(false);
                          }
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => {
                          // Delay to allow clicking on suggestions
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        placeholder={
                          selectedCategories.length === 0
                            ? "Type to search or create a category"
                            : "Add another category"
                        }
                        aria-invalid={fieldError ? "true" : "false"}
                        aria-describedby={fieldError ? fieldErrorId : undefined}
                        disabled={isProcessing}
                        autoComplete="off"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        Press Enter to add
                      </div>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && categoryInput && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-y-auto">
                        {filteredSuggestions.length > 0 ? (
                          <>
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b">
                              Suggested Categories
                            </div>
                            {filteredSuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                onClick={() => addCategory(suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </>
                        ) : null}

                        {/* Create new category option */}
                        {categoryInput.trim() &&
                          !PREDEFINED_CATEGORIES.some(
                            (cat) =>
                              cat.toLowerCase() === categoryInput.toLowerCase()
                          ) && (
                            <>
                              {filteredSuggestions.length > 0 && (
                                <div className="border-t" />
                              )}
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center gap-2"
                                onClick={() => addCategory(categoryInput)}
                              >
                                <Plus className="h-4 w-4" />
                                Create "{categoryInput}"
                              </button>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* Max categories message */}
                {!canAddMore && (
                  <p className="text-sm text-gray-500 italic">
                    Maximum of 3 categories reached
                  </p>
                )}

                {/* Help text */}
                {selectedCategories.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Start typing to search existing categories or create your
                    own
                  </p>
                )}

                <FormFieldMessage
                  error={fieldError?.message}
                  errorId={fieldErrorId}
                />
              </div>
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
