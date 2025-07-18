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

// function toolFormValidator({ value }: { value: unknown }) {
//   try {
//     Schema.decodeUnknownSync(ToolUploadFormSchema, { errors: "all" })(value);
//     return undefined; // Success, no errors
//   } catch (error) {
//     const issues = ParseResult.ArrayFormatter.formatErrorSync(error);
//     const fieldErrors: Record<string, string> = {};

//     for (const issue of issues) {
//       const path = issue.path.join(".");
//       if (path && issue.message && !fieldErrors[path]) {
//         fieldErrors[path] = issue.message;
//       }
//     }
//     return { fields: fieldErrors };
//   }
// }

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
    // validators: {
    //   onBlur: toolFormValidator,
    //   onChange: toolFormValidator,
    // },
  });

  // Subscribe to form errors for display
  const formErrors = useStore(form.store, (formState) => {
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
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  onBlur={field.handleBlur}
                  placeholder="Enter your name"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="website">
          {(field) => {
            const error =
              field.state.meta.errorMap.onChange ??
              field.state.meta.errorMap.onBlur;
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Website</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onChange={function (e) {
                    field.handleChange(e.target.value);
                  }}
                  onBlur={field.handleBlur}
                  placeholder="https://example.com"
                />
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>
            );
          }}
        </form.Field>

        <form.Subscribe
          selector={function (formState) {
            const result = [formState.canSubmit, formState.isSubmitting];
            return result;
          }}
        >
          {function ([canSubmit, isSubmitting]) {
            return (
              <Button type="submit" disabled={!canSubmit} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            );
          }}
        </form.Subscribe>
      </form>
    </div>
  );
}
