/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**"]
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "no-unused-vars": "off",
      "no-console": "off"
    }
  }
];

export default eslintConfig;
