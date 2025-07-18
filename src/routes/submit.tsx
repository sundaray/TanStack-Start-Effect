import { createFileRoute } from "@tanstack/react-router";
import { ToolUploadForm } from "@/components/tool-upload-form";

export const Route = createFileRoute("/submit")({
  component: Submit,
});

export default function Submit() {
  return (
    <div className="max-w-md mx-auto">
      <ToolUploadForm />
    </div>
  );
}
