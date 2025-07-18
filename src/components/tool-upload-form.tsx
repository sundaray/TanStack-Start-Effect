import { Schema, ParseResult } from "effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useForm,
  useStore,
  useTransform,
  mergeForm,
} from "@tanstack/react-form";
import {
  formOpts,
  handleToolUploadForm,
} from "@/lib/actions/tool-upload-action";
import { ToolUploadFormSchema } from "@/lib/schema";

interface ToolUploadFormProps {
  initialState: any;
}

export function ToolUploadForm({ initialState }: ToolUploadFormProps) {
  const form = useForm({
    ...formOpts,
    transform: useTransform(
      (baseForm) => {
        const merged = mergeForm(baseForm, initialState);
        return merged;
      },
      [initialState]
    ),
    validators: {
      onBlur: function ({ value }) {
        try {
          const result = Schema.decodeUnknownSync(ToolUploadFormSchema, {
            errors: "all",
          })(value);
          return undefined; // No errors
        } catch (error) {
          console.log("ParseError: ", error);
          const issues = ParseResult.ArrayFormatter.formatErrorSync(error);

          console.log("Issues: ", issues);
          const fieldErrors: Record<string, string> = {};

          // 3. Iterate over the structured issues to build the error object.
          for (const issue of issues) {
            const path = issue.path.join(".");
            if (path && issue.message) {
              // Assign the first error found for a given path
              if (!fieldErrors[path]) {
                fieldErrors[path] = issue.message;
              }
            }
          }

          console.log("Field errors: ", fieldErrors);

          // 4. Return errors in the format Tanstack Form expects for field propagation.
          return { fields: fieldErrors };
        }
      },
    },
  });

  // Subscribe to form errors for display
  const formErrors = useStore(form.store, (formState) => {
    console.log("📊 Form state updated:", {
      errors: formState.errors,
      canSubmit: formState.canSubmit,
      isSubmitting: formState.isSubmitting,
      values: formState.values,
    });
    return formState.errors;
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Simple Form</h2>

      <form
        action={handleToolUploadForm.url}
        method="post"
        encType="multipart/form-data"
        onSubmit={function (e) {
          console.log("🚀 Form submission triggered");
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Display form-level errors */}
        {formErrors.map((error, index) => {
          console.log("❌ Displaying form error:", error);
          return (
            <div
              key={index}
              className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
            >
              {error}
            </div>
          );
        })}

        {/* Name Field - No individual validators needed! */}
        <form.Field name="name">
          {(field) => {
            console.log("📝 Name field render - state:", field.state);
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={function (e) {
                    console.log("⌨️ Name field onChange:", e.target.value);
                    // Always needed for TanStack Form to receive changes
                    field.handleChange(e.target.value);
                  }}
                  onBlur={function () {
                    console.log("👁️ Name field onBlur triggered");
                    console.log("👁️ Current name value:", field.state.value);
                    // This will trigger form-level validation
                    field.handleBlur();
                  }}
                  placeholder="Enter your name"
                />
                {/* Field-specific errors (automatically propagated from schema) */}
                {field.state.meta.errors.map((error, index) => {
                  console.log("❌ Name field error:", error);
                  return (
                    <p key={index} className="text-sm text-destructive">
                      {error}
                    </p>
                  );
                })}
              </div>
            );
          }}
        </form.Field>

        {/* Website Field - No individual validators needed! */}
        <form.Field name="website">
          {(field) => {
            console.log("🌐 Website field render - state:", field.state);
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Website</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="url"
                  value={field.state.value}
                  onChange={function (e) {
                    console.log("⌨️ Website field onChange:", e.target.value);
                    // Always needed for TanStack Form to receive changes
                    field.handleChange(e.target.value);
                  }}
                  onBlur={function () {
                    console.log("👁️ Website field onBlur triggered");
                    console.log("👁️ Current website value:", field.state.value);
                    // This will trigger form-level validation
                    field.handleBlur();
                  }}
                  placeholder="https://example.com"
                />
                {/* Field-specific errors (automatically propagated from schema) */}
                {field.state.meta.errors.map((error, index) => {
                  console.log("❌ Website field error:", error);
                  return (
                    <p key={index} className="text-sm text-destructive">
                      {error}
                    </p>
                  );
                })}
              </div>
            );
          }}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe
          selector={function (formState) {
            const result = [formState.canSubmit, formState.isSubmitting];
            console.log("🔘 Submit button state:", {
              canSubmit: result[0],
              isSubmitting: result[1],
            });
            return result;
          }}
        >
          {function ([canSubmit, isSubmitting]) {
            return (
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full"
                onClick={() => console.log("🖱️ Submit button clicked")}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            );
          }}
        </form.Subscribe>
      </form>
    </div>
  );
}
