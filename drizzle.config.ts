import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",

  // The directory where Drizzle Kit can write temporary files or migrations.
  out: "./src/drizzle",

  dialect: "postgresql",

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  verbose: true,
  strict: true,
});
