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
    // Configuração global
    rules: {
      // TypeScript específicas - modo permissivo inicial
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^(error|err|_|index)$", // Ignorar args comum 
          "varsIgnorePattern": "^(error|err|_|key|index)$", // Ignorar variáveis comuns
          "caughtErrorsIgnorePattern": "^(error|err|_)$" // Ignorar catches não utilizados
        }
      ],
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
  // Configuração específica para arquivos de teste
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@next/next/no-assign-module-variable": "off", // Permitir module.exports em testes
    },
  },
];

export default eslintConfig;
