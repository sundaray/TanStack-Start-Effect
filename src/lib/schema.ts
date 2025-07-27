import { Schema } from "effect";

// --- Constants for File Validation ---
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_LOGO_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_SCREENSHOT_SIZE_IN_BYTES = 5 * 1024 * 1024; // 5MB

const mb = (bytes: number) => `${bytes / 1024 / 1024}MB`;

// This schema validates the raw FileList from an <input type="file">
const FileSchema = (
  maxSizeInBytes: number,
  {
    requiredMsg,
    typeMsg,
    sizeMsg,
  }: { requiredMsg: string; typeMsg: string; sizeMsg: string }
) =>
  Schema.instanceOf(FileList).pipe(
    Schema.filter((files) => files.length === 1, {
      message: () => requiredMsg,
    }),
    Schema.filter((files) => ACCEPTED_IMAGE_TYPES.includes(files[0].type), {
      message: () => typeMsg,
    }),
    Schema.filter((files) => files[0].size <= maxSizeInBytes, {
      message: () => sizeMsg,
    }),
    // We transform the valid FileList into a single File for easier handling later
    Schema.transform(Schema.instanceOf(File), {
      decode: (fileList) => fileList[0],
      encode: (file) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        return dataTransfer.files;
      },
    })
  );

// --- The Main Form Schema ---
export const ToolUploadFormSchema = Schema.Struct({
  // pricingModel: Schema.Literal("Free", "Premium", "Freemium").annotations({
  //   message: () => ({
  //     message: "Please select a pricing model.",
  //     override: true,
  //   }),
  // }),
  // logo: Schema.optionalWith(
  //   Schema.NullOr(
  //     FileSchema(MAX_LOGO_SIZE_IN_BYTES, {
  //       requiredMsg: "A logo file is required.",
  //       typeMsg: "Invalid file type. Only JPG and PNG are accepted.",
  //       sizeMsg: `Logo file size must not exceed ${mb(MAX_LOGO_SIZE_IN_BYTES)}.`,
  //     })
  //   ),
  //   { default: () => null }
  // ),
  // homePageScreenshot: Schema.optionalWith(
  //   Schema.NullOr(
  //     FileSchema(MAX_SCREENSHOT_SIZE_IN_BYTES, {
  //       requiredMsg: "A homepage screenshot is required.",
  //       typeMsg: "Invalid file type. Only JPG and PNG are accepted.",
  //       sizeMsg: `Screenshot file size must not exceed ${mb(MAX_SCREENSHOT_SIZE_IN_BYTES)}.`,
  //     })
  //   ),
  //   { default: () => null }
  // ),
});

export const ForgotPasswordFormSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Email is required." })
  ),
});

export const pricingOptions = ["Free", "Paid", "Freemium"] as const;

const PricingOption = Schema.String.pipe(
  Schema.filter(
    (value): value is (typeof pricingOptions)[number] =>
      pricingOptions.includes(value as any),
    {
      // This message is a fallback for a server-side error or manipulated data.
      message: () => "Invalid pricing option selected.",
    }
  )
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
    Schema.nonEmptyString({ message: () => "A tagline is required." }),
    Schema.maxLength(100, {
      message: () => "Tagline must be 100 characters or fewer.",
    })
  ),
  description: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Please eneter a description." })
  ),
  categories: Schema.Array(
    Schema.Trim.pipe(
      Schema.nonEmptyString({ message: () => "Category name can't be empty." })
    )
  ).pipe(
    Schema.minItems(1, {
      message: () => "Please select/create at least one category.",
    }),
    Schema.maxItems(3, {
      message: () => "You can select a maximum of three categories.",
    })
  ),
  pricing: Schema.String.pipe(
    // 1. This is the check that will run first on an empty form.
    Schema.nonEmptyString({ message: () => "Please select a pricing model." }),
    // 2. If the string is not empty, it will then be checked against our refinement.
    Schema.extend(PricingOption)
  ),
});

export type ToolSubmissionFormData = Schema.Schema.Type<
  typeof ToolSubmissionSchema
>;
