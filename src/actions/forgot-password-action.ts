import { Schema, ParseResult } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { formOptions } from "@tanstack/react-form";
import {
  createServerValidate,
  ServerValidateError,
  getFormData,
} from "@tanstack/react-form/start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { ToolUploadFormSchema } from "@/lib/schema";

// Server function to handle form submission
export const forgotPasswordAction = createServerFn({
  method: "POST",
})
  .validator((data: unknown) => {
    console.log("Form data");
  })
  .handler(async (ctx) => {
    console.log("🚀 Server function called");
  });
