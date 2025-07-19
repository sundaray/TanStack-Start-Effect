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
  name: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Name is required." })
  ),
  website: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Website URL is required." }),
    Schema.filter(
      (string) => {
        try {
          const normalizedUrl =
            string.startsWith("http://") || string.startsWith("https://")
              ? string
              : `https://${string}`;
          new URL(normalizedUrl);
          return true;
        } catch (error) {
          return false;
        }
      },
      { message: () => "Please enter a valid URL (e.g., https://example.com)." }
    )
  ),
  // tagline: Schema.String.pipe(
  //   Schema.nonEmptyString({ message: () => "A tagline is required." }),
  //   Schema.maxLength(100, {
  //     message: () => "Tagline must be 100 characters or fewer.",
  //   })
  // ),
  // categories: Schema.Array(
  //   Schema.Trim.pipe(
  //     Schema.nonEmptyString({ message: () => "Category name can't be empty." })
  //   )
  // ).pipe(
  //   Schema.minItems(1, {
  //     message: () => "Please select at least one category.",
  //   }),
  //   Schema.maxItems(3, {
  //     message: () => "You can select a maximum of three categories.",
  //   })
  // ),
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
  password: Schema.String,
});
