import { createFileRoute } from "@tanstack/react-router";
import { ToolSubmissionForm } from "@/components/auth/tool-submission-form";

export const Route = createFileRoute("/submit")({ component: Submit });

export default function Submit() {
  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-4xl tracking-tight text-neutral-900 font-semibold text-center">
        Submit your AI tool
      </h1>
      <h2 className="text-2xl text-neutral-500 text-center">
        Get a do-follow backlink for free.
      </h2>
      <ToolSubmissionForm />
    </div>
  );
}
