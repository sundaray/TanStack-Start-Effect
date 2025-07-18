import { Schema, ParseResult } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { formOptions } from "@tanstack/react-form";
import {
  createServerValidate,
  ServerValidateError,
  getFormData,
} from "@tanstack/react-form/start";
import { ToolUploadFormSchema } from "@/lib/schema";

// Create form options that can be shared between client and server
export const formOpts = formOptions({
  defaultValues: {
    name: "",
    website: "",
  },
});

// Create server validation
const serverValidate = createServerValidate({
  ...formOpts,
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

// Server function to handle form submission with validation
export const handleToolUploadForm = createServerFn({
  method: "POST",
}).handler(async (ctx) => {
  console.log("🚀 Server function called");

  try {
    // This will validate and throw ServerValidateError if validation fails
    const validatedData = await serverValidate(ctx.data);
    console.log("✅ Form validated successfully:", validatedData);

    // If we get here, validation passed
    // Handle successful submission (save to DB, etc.)
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ServerValidateError) {
      console.log("❌ Server validation error:", error.response);
      // The error is automatically stored for retrieval by getFormData()
      throw error;
    }
    console.error("❌ Unexpected error:", error);
    throw error;
  }
});

// Server function to get form data (including validation errors) from server
export const getToolUploadFormData = createServerFn({
  method: "GET",
}).handler(async () => {
  console.log("📥 Getting form data from server");

  try {
    // Try to get form data if it exists (after a form submission)
    const formData = await getFormData();
    console.log("📋 Form data from server:", formData);
    return formData;
  } catch (error) {
    // If there's no form submission context (like on initial page load),
    // return null or default values
    console.log("📋 No form data in context, returning defaults");
    return null;
  }
});
