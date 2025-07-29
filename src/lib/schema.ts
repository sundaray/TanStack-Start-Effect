import { Schema } from "effect";

export const ForgotPasswordFormSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Email is required." })
  ),
});

export const pricingOptions = ["Free", "Paid", "Freemium"] as const;

export const LOGO_MAX_SIZE_MB = 2;
export const SCREENSHOT_MAX_SIZE_MB = 5;
export const ACCEPTED_FILE_FORMATS = ["JPEG", "PNG", "WEBP"];

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formatMimeTypeForDisplay = (mimeType: string): string => {
  if (!mimeType) {
    return "UNKNOWN";
  }
  const parts = mimeType.split("/");
  const format = parts[1] || parts[0] || "UNKNOWN";
  return format.toUpperCase();
};

const FileSchema = (options: {
  maxSizeInMb: number;
  requiredMessage: string;
}) =>
  Schema.instanceOf(File, {
    message: () => options.requiredMessage,
  })
    .pipe(
      Schema.filter((file) => file.size <= options.maxSizeInMb * 1024 * 1024, {
        message: (issue) => {
          if (!(issue.actual instanceof File)) {
            return "Invalid file provided.";
          }
          return `File size cannot exceed ${
            options.maxSizeInMb
          }MB. The selected file is ${(issue.actual.size / 1024 / 1024).toFixed(
            2
          )}MB.`;
        },
      })
    )
    .pipe(
      Schema.filter((file) => ALLOWED_MIME_TYPES.includes(file.type), {
        message: (issue) => {
          if (!(issue.actual instanceof File)) {
            return "Invalid file format provided.";
          }
          const providedType = formatMimeTypeForDisplay(issue.actual.type);
          return `Invalid file format. Only JPG, PNG, or WEBP are allowed. You provided: ${providedType}`;
        },
      })
    );

export const ToolSubmissionSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.nonEmptyString({
      message: () => "Name is required.",
    })
  ),
  website: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Website URL is required." }),
    Schema.pattern(
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      {
        message: () => "Please enter a valid website URL",
      }
    )
  ),
  tagline: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Tagline is required." }),
    Schema.filter(
      (text) => text.trim().split(/\s+/).filter(Boolean).length <= 20,
      {
        message: () => "Tagline must be 20 words or fewer.",
      }
    )
  ),
  description: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Description is required." }),
    Schema.filter(
      (text) => text.trim().split(/\s+/).filter(Boolean).length <= 500,
      {
        message: () => "Description must be 500 words or fewer.",
      }
    )
  ),
  categories: Schema.Array(
    Schema.Trim.pipe(
      Schema.nonEmptyString({
        message: () => "At least one category is required.",
      })
    )
  ).pipe(
    Schema.minItems(1, {
      message: () => "At least one category is required.",
    }),
    Schema.maxItems(3, {
      message: () => "You can select a maximum of three categories.",
    })
  ),
  pricing: Schema.Literal(...pricingOptions).annotations({
    message: () => ({
      message: "Pricing is required.",
      override: true,
    }),
  }),
  logo: Schema.optional(
    FileSchema({
      maxSizeInMb: 2,
      requiredMessage: "Logo is required.",
    })
  ),
  homepageScreenshot: FileSchema({
    maxSizeInMb: 5,
    requiredMessage: "Homepage screenshot is required.",
  }),
});

export type ToolSubmissionFormData = Schema.Schema.Type<
  typeof ToolSubmissionSchema
>;
