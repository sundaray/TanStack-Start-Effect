import { createFileRoute } from "@tanstack/react-router";
import { ToolUploadForm } from "@/components/tool-upload-form";
import { getToolUploadFormData } from "@/lib/actions/tool-upload-action";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async function () {
    return { formState: await getToolUploadFormData() };
  },
});

function Home() {
  const { formState } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background p-4">
      <ToolUploadForm initialState={formState} />
    </div>
  );
}
