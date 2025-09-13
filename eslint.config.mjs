import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "warn",
      "jsx-a11y/alt-text": "warn",
      "prefer-const": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
];

export default eslintConfig;
