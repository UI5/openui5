# ESLint Code Checks

UI5 uses ESLint to check JavaScript sources.  

## Rule Set

The current set of enabled rules can be found in the top-level [.eslintrc.json](/.eslintrc.json) file.  
Those rules apply to all JavaScript code that is part of the OpenUI5 project repository.

## Library-Specific Rule Set

Library projects may decide on a stricter rule set for the whole library or parts of it.  
Rules from the central rule set **MUST NOT** be overridden with a lower severity.

Example: [src/sap.ui.fl/.eslintrc.json](../src/sap.ui.fl/.eslintrc.json)

## Directory-Specific Configuration

Place library- or tool-specific ESLint configuration in a local `.eslintrc.json` next to
(or in the nearest common parent of) the affected files. Do not add directory-specific
`overrides` to the top-level configuration; it defines the shared repository defaults.

Local configurations inherit those defaults. Do not set `"root": true` in a local config,
and use an `overrides` block when only some files in that directory need different settings.
The `files` patterns are relative to the directory containing the local `.eslintrc.json`.
The library-specific rule-severity requirement above still applies.

### Node.js Build and Verification Scripts

Node.js scripts need runtime-specific settings rather than the browser defaults. Put these
settings in the script directory's local configuration (for example,
`scripts/webcomponents/.eslintrc.json`), scoped to the relevant JavaScript files:

- Set `env.node` to `true` and `env.browser` to `false`.
- Use `parserOptions.sourceType: "commonjs"` for CommonJS scripts, or `"module"` for ES modules.
- Keep necessary runtime adaptations, such as global strict mode for CommonJS scripts or
  console output for command-line tools, local to those scripts. They must not relax the
  rules for productive library code.

Examples of existing local tool configurations are
[lib/builder/.eslintrc.json](../lib/builder/.eslintrc.json) and
[lib/jsdoc/.eslintrc.json](../lib/jsdoc/.eslintrc.json).

## Execute Checks

See [Developing OpenUI5 > Running the Static Code Checks (ESLint)](./developing.md#running-the-static-code-checks-eslint)
