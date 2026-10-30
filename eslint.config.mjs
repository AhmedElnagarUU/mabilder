import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".generator-build/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Owner-provided HTML/CSS design sources, converted into blocks by hand (docs/block-library-plan.md).
    "templates/**",
  ]),
]);

export default eslintConfig;
