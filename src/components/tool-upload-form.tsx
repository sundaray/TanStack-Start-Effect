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

interface ToolUploadFormProps {
  initialState?: any;
}

export function ToolUploadForm({ initialState }: ToolUploadFormProps) {
  const form = useForm({
    ...formOpts,
    transform: useTransform(
      (baseForm) => {
        // This merges server validation state with client form
        if (initialState) {
          console.log("📋 Merging server state:", initialState);
          return mergeForm(baseForm, initialState);
        }
        return baseForm;
      },
      [initialState]
    ),
    validators: {
      onChange: ({ value }) => {
        // Client-side validation
        const errors: Record<string, string> = {};

        if (!value.name) {
          errors.name = "Name is required";
        }

        if (!value.website) {
          errors.website = "Website is required";
        } else {
          // Basic URL validation
          try {
            const url = value.website.startsWith("http")
              ? value.website
              : `https://${value.website}`;
            new URL(url);
          } catch {
            errors.website = "Please enter a valid URL";
          }
        }

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      },
    },
  });

  // Subscribe to form errors for display
  const formErrors = useStore(form.store, (formState) => formState.errors);

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Tool Upload Form</h2>

      <form
        action={handleToolUploadForm.url}
        method="post"
        className="space-y-4"
      >
        {/* Display form-level errors */}
        {formErrors.length > 0 && (
          <div className="space-y-2">
            {formErrors.map((error, index) => (
              <div
                key={index}
                className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
              >
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Name Field */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Enter tool name"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="space-y-1">
                  {field.state.meta.errors.map((error, idx) => (
                    <p key={idx} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Website Field */}
        <form.Field name="website">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Website</Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="https://example.com"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="space-y-1">
                  {field.state.meta.errors.map((error, idx) => (
                    <p key={idx} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(formState) => [
            formState.canSubmit,
            formState.isSubmitting,
          ]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
