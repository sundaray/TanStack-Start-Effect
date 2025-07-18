import { Schema } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { formOptions } from "@tanstack/react-form";
import {
  createServerValidate,
  ServerValidateError,
} from "@tanstack/react-form/start";
import { getFormData } from "@tanstack/react-form/start";
import { ToolUploadFormSchema } from "@/lib/schema";

// Create form options that can be shared between client and server
export const formOpts = formOptions({
  defaultValues: {
    name: "",
    website: "",
  },
});

const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: ({ value }) => {
    const result = Schema.decodeUnknownSync(ToolUploadFormSchema)(value);
    return undefined;
  },
});

// Server function to handle form submission
export const handleToolUploadForm = createServerFn({
  method: "POST",
}).handler(async (ctx) => {
  try {
    const validatedData = serverValidate(ctx.data);
    console.log("Form validated successfully: ", validatedData);
  } catch (error) {
    if (error instanceof ServerValidateError) {
      console.log("Validation errors: ", error.response);
    }
  }
});

// Server function to get form data from server validation
export const getToolUploadFormData = createServerFn({
  method: "GET",
}).handler(async () => {
  return getFormData();
});
