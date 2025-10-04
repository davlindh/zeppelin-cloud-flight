import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unicorn from "eslint-plugin-unicorn";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unicorn": unicorn,
      "import": importPlugin,
    },
    rules: {
      // React rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // Unicorn rules for consistency and performance
      "unicorn/consistent-function-scoping": "error",
      "unicorn/no-for-loop": "error",
      "unicorn/prefer-ternary": "error",
      "unicorn/no-useless-undefined": "error",

      // Import rules for consistency
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",

      "export-default": "off",
      "import/prefer-default-export": "off",
      "import/no-default-export": "warn",

      // General code quality
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",

      // Complexity rules
      "complexity": ["error", 12],
      "max-lines": ["warn", 600],
      "max-lines-per-function": ["warn", 80],
    },
  },
  // Override rules for specific files
  {
    files: ["src/utils/adminApi.ts"],
    rules: {
      "no-console": "off", // Allow console statements for error logging
      "complexity": ["error", 20], // Higher complexity allowance for db operations
      "max-lines-per-function": ["warn", 120], // Allow longer functions for db operations
      "@typescript-eslint/no-explicit-any": "off", // Allow any for database operations
    },
  },
  {
    files: ["src/components/admin/submission-inbox/components/SubmissionDetailModal.tsx"],
    rules: {
      "complexity": ["error", 25], // Higher complexity allowance for file type detection
    },
  }
);
