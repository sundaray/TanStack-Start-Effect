import { createFileRoute } from "@tanstack/react-router";
import { ToolUploadForm } from "@/components/tool-upload-form";
import { getToolUploadFormData } from "@/lib/actions/tool-upload-action";

export const Route = createFileRoute("/submit")({
  loader: async () => {
    // This gets the form data including any validation errors from the server
    const formData = await getToolUploadFormData();
    return { formData };
  },
  component: Submit,
});

export default function Submit() {
  const { formData } = Route.useLoaderData();

  return (
    <div className="max-w-lg mx-auto py-8">
      <ToolUploadForm initialState={formData} />
    </div>
  );
}
