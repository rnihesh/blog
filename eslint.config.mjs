import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"] },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    rules: {
      // AGENTS.md says "Path aliases: @/components, @/lib". As a prose bullet it got
      // ignored; as a lint rule it cannot be.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Use the @/ path alias instead of parent-relative imports (see AGENTS.md).",
            },
          ],
        },
      ],

      // The mount-gate pattern (`useEffect(() => setMounted(true), [])`) is how
      // next-themes avoids a hydration mismatch, and this repo uses it in eight
      // components deliberately. eslint-plugin-react-hooks v7 flags it by default.
      // Kept as a warning so a genuinely accidental cascading setState still shows up.
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  {
    // Node CommonJS tooling. require() is correct here, not a mistake to fix.
    files: ["scripts/**/*.js", "*.config.js"],
    languageOptions: {
      globals: { require: "readonly", module: "writable", process: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
