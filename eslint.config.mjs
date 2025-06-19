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
      // TypeScript específicas - modo permissivo inicial
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      
      // Next.js específicas
      "@next/next/no-assign-module-variable": "warn",
      
      // React específicas
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      
      // Gerais - modo permissivo
      "prefer-const": "warn",
      "no-var": "warn",
      "no-console": "off", // permitir console.log durante desenvolvimento
      "eqeqeq": "warn",
      "curly": "off", // permitir if sem chaves inicialmente
    },
  },
];

export default eslintConfig;
