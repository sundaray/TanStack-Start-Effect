import { Schema } from "effect";

export const ForgotPasswordFormSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Email is required." })
  ),
});

export const pricingOptions = ["Free", "Paid", "Freemium"] as const;

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
    Schema.nonEmptyString({ message: () => "Description is required." })
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
  pricing: Schema.Literal(...pricingOptions).annotations({
    message: () => ({
      message: "Pricing is required.",
      override: true,
    }),
  }),
  logo: Schema.optional(Schema.instanceOf(File)),
  homepageScreenshot: Schema.instanceOf(File).annotations({
    message: () => "Homepage screenshot is required.",
  }),
});

export type ToolSubmissionFormData = Schema.Schema.Type<
  typeof ToolSubmissionSchema
>;
