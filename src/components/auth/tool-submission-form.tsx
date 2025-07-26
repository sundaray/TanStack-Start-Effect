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
import { X, Plus, Search } from "lucide-react";
import { FormField } from "@/components/form-field";

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
      <div>
        <Label htmlFor="categories">
          Categories
          <span className="text-xs font-normal text-neutral-500">
            (Select/create up to 3)
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
            const filteredSuggestions = PREDEFINED_CATEGORIES.filter(
              (cat) =>
                !selectedCategories.includes(cat) &&
                cat.toLowerCase().includes(categoryInput.toLowerCase())
            );

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
              <div>
                {/* Selected Categories */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map((category, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm"
                      >
                        <span className="text-sm text-blue-600">
                          {index === 0 ? "Primary" : `Secondary`}:
                        </span>
                        <span className="text-blue-600 font-medium">
                          {category}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1.5"
                          aria-label={`Remove ${category}`}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category Input */}
                {canAddMore && (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
                      <Input
                        id="categories"
                        className="border-neutral-300 mt-2 pl-8"
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
                        onFocus={() => {
                          setShowSuggestions(true);
                          // Show all categories when focusing with empty input
                          if (!categoryInput) {
                            setCategoryInput("");
                          }
                        }}
                        onBlur={() => {
                          field.onBlur();
                          // Delay to allow clicking on suggestions
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        placeholder={
                          selectedCategories.length === 0
                            ? ""
                            : "Add another category"
                        }
                        aria-invalid={fieldError ? "true" : "false"}
                        aria-describedby={fieldError ? fieldErrorId : undefined}
                        disabled={isProcessing}
                        autoComplete="off"
                      />
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-y-auto">
                        {categoryInput ? (
                          <>
                            {/* Filtered suggestions */}
                            {filteredSuggestions.length > 0 ? (
                              filteredSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                                  onClick={() => addCategory(suggestion)}
                                >
                                  {suggestion}
                                </button>
                              ))
                            ) : (
                              /* No matches found */
                              <div className="p-3 text-center text-sm text-gray-500">
                                No matching categories
                              </div>
                            )}

                            {/* Create new category option */}
                            {!PREDEFINED_CATEGORIES.some(
                              (cat) =>
                                cat.toLowerCase() ===
                                categoryInput.toLowerCase()
                            ) && (
                              <div
                                className={
                                  filteredSuggestions.length > 0
                                    ? "border-t"
                                    : ""
                                }
                              >
                                <button
                                  type="button"
                                  className="w-full px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-center gap-2 transition-colors"
                                  onClick={() => addCategory(categoryInput)}
                                >
                                  <Plus className="size-4" />
                                  Create "{categoryInput}"
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          /* Show all available categories when no search input */
                          PREDEFINED_CATEGORIES.filter(
                            (cat) => !selectedCategories.includes(cat)
                          ).map((category) => (
                            <button
                              key={category}
                              type="button"
                              className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                              onClick={() => addCategory(category)}
                            >
                              {category}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Max categories message */}
                {!canAddMore && (
                  <p className="text-sm text-neutral-500 mt-2">
                    All set! You've selected/created 3 categories (maximum
                    allowed).
                  </p>
                )}

                {/* Help text - only show when no error and no categories selected */}
                {selectedCategories.length < 3 && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Start typing to search existing categories or create your
                    own.
                  </p>
                )}
                <FormFieldMessage
                  errorMessage={fieldError?.message}
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
