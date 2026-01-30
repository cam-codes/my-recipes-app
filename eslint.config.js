import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "**/dist/**",       // ignores everything under any dist/ folder
      "**/node_modules/**",
      "**/.vite/**",      // optional: Vite cache
      "**/coverage/**",   // if you have coverage reports
    ],
  },
  // base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["frontend/src/**/*.{ts,tsx,js,jsx}"],
    plugins: { solid },
    rules: {
      "solid/reactivity": "error",
      "solid/no-destructure": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  },
  // Relaxed rules for test files
  {
    files: ["frontend/**/*.{test,spec}.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",  // ← fully disable check in tests
    },
  },
  // prettier must come last to override conflicting rules
  prettier
];
