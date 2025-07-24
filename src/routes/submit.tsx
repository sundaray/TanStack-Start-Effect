import { createFileRoute } from "@tanstack/react-router";
import { ToolSubmissionForm } from "@/components/auth/tool-submission-form";

export const Route = createFileRoute("/submit")({ component: Submit });

export default function Submit() {
  return (
    <div className="max-w-lg mx-auto py-8">
      <ToolSubmissionForm />
    </div>
  );
}
