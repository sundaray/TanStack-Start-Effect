import { Schema, ParseResult } from "effect";
import { createServerFn } from "@tanstack/react-start";
import {
  createServerValidate,
  ServerValidateError,
  getFormData,
} from "@tanstack/react-form/start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { ToolUploadFormSchema } from "@/lib/schema";
import { toolUploadFormOpts } from "@/config/form-config";

// Create server validation
const serverValidate = createServerValidate({
  ...toolUploadFormOpts,
  onServerValidate: ({ value }) => {
    console.log("🔍 Server validation running with value:", value);

    try {
      // Try to decode the value with the schema
      Schema.decodeUnknownSync(ToolUploadFormSchema)(value);
      console.log("✅ Validation passed");
      return undefined; // No errors
    } catch (error) {
      console.log("❌ Validation failed:", error);

      // Parse the Effect Schema error and convert to TanStack Form format
      const issues = ParseResult.ArrayFormatter.formatErrorSync(error);
      const fieldErrors: Record<string, string> = {};

      // Convert Effect Schema errors to field-specific errors
      for (const issue of issues) {
        const path = issue.path.join(".");
        if (path && issue.message) {
          fieldErrors[path] = issue.message;
        }
      }

      console.log("📋 Field errors:", fieldErrors);

      // Return errors in the format TanStack Form expects
      return {
        fields: fieldErrors,
      };
    }
  },
});

// Server function to handle form submission
export const handleToolUploadForm = createServerFn({
  method: "POST",
})
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid form data");
    }
    return data;
  })
  .handler(async (ctx) => {
    console.log("🚀 Server function called");

    try {
      // This will validate and throw ServerValidateError if validation fails
      const validatedData = await serverValidate(ctx.data);
      console.log("✅ Form validated successfully:", validatedData);

      // If we get here, validation passed
      // TODO: Save to database here
      console.log("📊 Valid form data received:", validatedData);

      // For now, just return success
      return "Form submitted successfully!";
    } catch (e) {
      if (e instanceof ServerValidateError) {
        console.log("❌ Server validation error:", e.response);
        // Return the response which includes the redirect
        return e.response;
      }

      console.error("❌ Unexpected error:", e);
      setResponseStatus(500);
      return "There was an internal error";
    }
  });

// Server function to get form data (including validation errors)
export const getToolUploadFormData = createServerFn({
  method: "GET",
}).handler(async () => {
  console.log("📥 Getting form data from server");
  return getFormData();
});
