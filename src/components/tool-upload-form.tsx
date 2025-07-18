import { Schema } from "effect";
import {
  useForm,
  useStore,
  useTransform,
  mergeForm,
} from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formOpts,
  handleToolUploadForm,
} from "@/lib/actions/tool-upload-action";
import { ToolUploadFormSchema } from "@/lib/schema";

interface ToolUploadFormProps {
  initialState: any;
}

export function ToolUploadForm({ initialState }: ToolUploadFormProps) {
  console.log("🏗️ SimpleForm rendering with initialState:", initialState);

  const form = useForm({
    ...formOpts,
    // Merge server state with client form
    transform: useTransform(
      (baseForm) => {
        console.log("🔄 Transform running - baseForm:", baseForm);
        console.log("🔄 Transform running - initialState:", initialState);
        const merged = mergeForm(baseForm, initialState);
        console.log("🔄 Transform result:", merged);
        return merged;
      },
      [initialState]
    ),
    validators: {
      // ✨ Single schema validation at form level
      // Errors will automatically propagate to the correct fields
      onBlur: function ({ value }) {
        console.log(
          "🔍 Form-level onBlur validation triggered with value:",
          value
        );

        try {
          // Try to validate using Effect Schema
          const result = Schema.decodeUnknownSync(ToolUploadFormSchema)(value);
          console.log("✅ Schema validation passed:", result);
          return undefined; // No errors
        } catch (error) {
          console.log("❌ Schema validation failed:", error);

          // For Effect Schema, we need to extract field-specific errors
          // Effect gives us detailed error information
          if (error && typeof error === "object") {
            // Try to extract field-specific errors from Effect Schema
            const errorString = String(error);
            console.log("❌ Error string:", errorString);

            // For now, return a general form error
            // In a more sophisticated setup, you'd parse the Effect error
            // to extract field-specific errors
            return "Please fix the validation errors";
          }

          return "Form validation failed";
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
