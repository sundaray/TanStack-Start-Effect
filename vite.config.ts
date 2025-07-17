import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
});
