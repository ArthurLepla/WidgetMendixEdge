const base = require("@mendix/pluggable-widgets-tools/configs/eslint.ts.base.json");

module.exports = {
    ...base,
    parserOptions: {
        ...base.parserOptions,
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname
    },
    rules: {
        ...base.rules,
        "@typescript-eslint/ban-ts-comment": "warn"
    },
    ignorePatterns: [
        ...base.ignorePatterns,
        ".eslintrc.js",
        "prettier.config.js"
    ]
};
