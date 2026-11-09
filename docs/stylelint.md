# Stylelint Rules

This document describes every rule active in [`.stylelintrc.mjs`](../.stylelintrc.mjs) with passing (✅) and failing (❌) examples.

> **Note:** All rules use `defaultSeverity: "warning"` — the linter exits with code 0 even when violations are present. Always read the terminal output carefully instead of relying on the exit code.

Run the linter before committing any `.less` changes:

```sh
npm run lint:styles                          # all LESS files
npx stylelint "src/sap.m/**/*.less"          # one library
npx stylelint "src/sap.m/**/*.less" --fix    # auto-fix where possible
```

Two rules are **not** auto-fixable: `max-nesting-depth` and `selector-max-compound-selectors`.

### Local selector-complexity checks

`max-nesting-depth` and `selector-max-compound-selectors` provide local refactoring advice.
They are **disabled by default** for `npm run lint:styles`, direct Stylelint runs, and
Maven Stylelint. Central voters and nightly builds therefore do not report these findings.
All other checks, including the no-LESS-features warnings, remain enabled.

To include the two complexity checks in a local run on macOS, Windows, or Linux, use:

```sh
npm run lint:styles:complexity
npm run lint:styles:complexity -- --fix
```

The command selects [`scripts/stylelint/complexity.config.mjs`](../scripts/stylelint/complexity.config.mjs),
which reuses the default config and adds only these two rules. Both complexity checks
remain non-auto-fixable. The script also works with pnpm:

```sh
pnpm run lint:styles:complexity
pnpm run lint:styles:complexity --fix
```

For a specific library, explicitly select the local config:

```sh
npx stylelint "src/sap.m/**/*.less" --config scripts/stylelint/complexity.config.mjs
```

No environment variable or CI/Jenkins/Gerrit detection is involved. The former
`lint:styles:no-complexity` shortcut and `STYLELINT_DISABLE_COMPLEXITY_WARNINGS` opt-out
are no longer needed: the default configuration already excludes complexity findings.
Per-library severity overrides and all other rules are unchanged.

Run the configuration regression tests with:

```sh
node --test scripts/stylelint/test/config.test.mjs
```

### Excluded files

The root `.stylelintignore` and library-local copies exclude build outputs, dependencies,
generated theme artifacts, third-party sources, and legacy themes: `sap_bluecrystal`,
all `sap_belize*` variants (including `sap_belize_base`), and `sap_hcb`.
Keep the library-local copies in sync so Maven and root-level npm runs use the same exclusions.

---

## No LESS Features (`openui5/no-less-*`)

OpenUI5 is migrating all library styles from LESS features to **CSS custom properties** (`var(--...)`).
The rules below flag LESS constructs so touched files can be cleaned up incrementally.
All rules run only on `.less` files (via the `overrides` block in `.stylelintrc.mjs`) and require
`postcss-less` to see the full LESS AST.

All rules are at **`warning` severity** globally. Once a library is clean, set `severity: "error"` in
a per-library `.stylelintrc` override to gate future regressions:

```json
// src/sap.m/.stylelintrc.json — opt in to error severity for one lib
{
  "overrides": [{
    "files": ["**/*.less"],
    "rules": {
      "openui5/no-less-var-declaration": [true, { "severity": "error" }],
      "openui5/no-less-var-usage":       [true, { "severity": "error" }]
    }
  }]
}
```

### Per-library & changed-files linting (Maven)

The authoritative per-library, changed-files-only stylelint gate is the Maven `stylelintnode.build`
profile. It mirrors `eslintnode.build` — each library module runs independently. When
`sap.ui5.stylelint.onlyChangedFiles=true`, the default comparison is:

- **Gerrit voter:** `HEAD~1` to `HEAD`, if `GERRIT_NEWREV` (falling back to
  `GERRIT_PATCHSET_REVISION`) matches `HEAD`; otherwise the module is skipped.
- **Local:** `HEAD~1` to the working tree, including staged and unstaged changes but not
  untracked files, as in ESLint.

No target branch or remote is required. If the parent commit is unavailable (root commit
or shallow checkout), the runner warns and lints the whole library.

**Opt a library in** by adding to its `pom.xml` `<properties>`:

```xml
<sap.ui5.stylelint.skip.validation>false</sap.ui5.stylelint.skip.validation>
```

**Key properties** (reactor defaults in root `pom.xml`; override via `-D`):

| Property | Default | Description |
|---|---|---|
| `sap.ui5.stylelint.skip.validation` | `true` | Set to `false` to opt a library in |
| `sap.ui5.stylelint.onlyChangedFiles` | `true` | Lint changed files relative to the previous commit by default |
| `sap.ui5.stylelint.diffBase` | (unset) | Optional plugin property: use this ref's merge-base with `HEAD` instead |
| `sap.ui5.stylelint.failonerror` | `true` | Fail build on `error`-severity findings |
| `sap.ui5.stylelint.sendGerritComment` | `true` | Post results as Gerrit inline comments |
| `sap.ui5.stylelint.quite` | `true` | Suppress info output |
| `sap.ui5.stylelint.tools.version` | `0.1.5` | Prebuilt `stylelint-tools` runner version downloaded from the npm registry |

The profile selects `mavenProject=com.sap.openui5:reactor` from Maven's collected reactor model.
The owning project may be excluded by `-pl`, but must be included in that model and supply
`package.json` and `package-lock.json`. This keeps OpenUI5 dependencies rooted in OpenUI5 even
when `openui5.build` includes it in a SAPUI5 reactor. An explicit `packageJson` remains available
for path-based setups, but is ignored when `mavenProject` is configured.
Stylelint, plugins, configs and custom syntaxes are declared in that manifest and locked by
`package-lock.json`; there are no corresponding Maven dependency-version pins.
The first participating library runs `npm ci --include=dev` at the root, even if
`node_modules` already exists. Other libraries in the same Maven invocation wait
for and reuse that preparation. Workspace manifests are coordinated by npm's actual installation
root (`npm prefix`), rather than treating each workspace directory as an independent tree.
Missing manifests, inconsistent lockfiles and npm failures fail the build. The runner TGZ is retrieved with `npm pack` using the project's
npm registry/authentication configuration, then unpacked by node-core; it is not installed.
The pack command does not install dependencies or execute package scripts.

**Run changed-files lint for one library:**

```sh
mvn -P stylelintnode.build -pl :sap.m verify \
  -Dsap.ui5.stylelint.skip.validation=false \
  -Dsap.ui5.stylelint.onlyChangedFiles=true
```

**Run full-library lint (no changed-files filter):**

```sh
mvn -P stylelintnode.build -pl :sap.m verify \
  -Dsap.ui5.stylelint.skip.validation=false \
  -Dsap.ui5.stylelint.onlyChangedFiles=false
```

To explicitly compare against a branch's merge-base, add
`-Dsap.ui5.stylelint.diffBase=origin/<branch>` or set `STYLELINT_DIFF_BASE` (the explicit
plugin option takes precedence). In this override mode, local runs also include
untracked files; Gerrit runs only include committed changes and still check the patchset
revision. Invalid explicit refs fail the run rather than silently skipping validation.

---

### `function-disallowed-list` (LESS color functions)

LESS color manipulation functions are forbidden — use `color-mix()` or CSS custom properties instead.

Disallowed: `darken`, `lighten`, `saturate`, `desaturate`, `fade`, `fadein`, `fadeout`, `mix`,
`spin`, `tint`, `shade`, `greyscale`, `contrast`.

❌ Bad
```less
.sapMBtn {
	background: darken(@sapUiButtonBackground, 10%);
	color: lighten(@sapUiBrand, 5%);
	border-color: fade(@sapUiTextColor, 60%);
}
```

✅ Good — use CSS custom properties or color-mix()
```less
.sapMBtn {
	background: var(--sapButton_Background);
	color: var(--sapBrandColor);
}
```

---

### `openui5/no-less-var-declaration`

LESS `@variable:` declarations are forbidden. Use CSS custom properties (`--name: value`).

Theme parameters (`@sapUi*`, `@_sap*`) are **allowlisted** in phase 1 — they are resolved
at build time and require a dedicated migration. Only non-theme variables are flagged.

❌ Bad
```less
@mySize: 16px;
@myColor: #333;
```

✅ Good — CSS custom property
```less
:root {
	--mySize: 16px;
	--myColor: #333;
}
```

---

### `openui5/no-less-var-usage`

LESS `@variable` references used as values are forbidden. Use `var(--name)`.

Theme parameters (`@sapUi*`, `@_sap*`) are allowlisted in phase 1.

❌ Bad
```less
.sapMBtn {
	font-size: @mySize;
	color: @myColor;
}
```

✅ Good
```less
.sapMBtn {
	font-size: var(--mySize);
	color: var(--myColor);
}
```

---

### `openui5/no-less-mixin`

LESS mixin definitions and calls are forbidden.

❌ Bad
```less
.myMixin(@color) {
	color: @color;
	border: 1px solid @color;
}

.sapMBtn {
	.myMixin(@sapUiBrand);
}
```

✅ Good — extract shared declarations to a plain CSS class or use custom properties
```less
.sapMBtn {
	color: var(--sapBrandColor);
	border: 1px solid var(--sapBrandColor);
}
```

---

### `openui5/no-less-guard`

LESS `when(...)` guards and conditional loops are forbidden.

❌ Bad
```less
.myMixin() when (@myVar = true) {
	display: block;
}
```

✅ Good — use CSS `@layer`, `@supports`, or static declarations

---

### CSS-compatible nesting with `&`

The `&` nesting selector is valid native CSS and is allowed. There is no blanket
`openui5/no-parent-selector` rule.

✅ Good — CSS-compatible nesting
```less
.sapMBtn {
	&.sapMBtnActive {
		background: red;
	}
	&:hover {
		opacity: 0.8;
	}
}
```

LESS-only selector concatenation such as `&Active` is not valid native CSS. Rewrite it
using a complete class name (for example, `.sapMBtnActive`). Removing the blanket `&`
check does not add a dedicated concatenation check.

---

### `openui5/no-less-arithmetic` *(Phase 3 — disabled)*

Flags arithmetic in LESS variable values (e.g. `@x: 10px + 5px`). Deferred because of
potential `calc(~"...")` entanglement. Enable when the `calc()` migration is understood.

---

### `openui5/no-less-interpolation` *(Phase 3 — disabled)*

Flags LESS escape strings (`~"..."`) and variable interpolation (`@{varName}`). Deferred for
the same reason as `no-less-arithmetic`.

---

## Phased severity rollout

| Phase | What ships | Notes |
|---|---|---|
| **0** | `postcss-less` + `customSyntax` in overrides | Changes how all existing rules see `.less`. Re-baseline before enabling new rules. |
| **1** | Color functions, mixins, guards, LESS vars — all at `warning` | Theme params allowlisted; CSS-compatible `&` nesting allowed. |
| **2** | Flip LESS-var rules to `error` per library | One library at a time via per-lib `.stylelintrc`. CI gates new violations only (changed-files mode). |
| **3** | `no-less-arithmetic`, `no-less-interpolation` | After `calc()` migration is understood. |

---

## Formatting & Style (`@stylistic/` plugin)

### `@stylistic/indentation: ["tab"]`

Use tabs for indentation, never spaces.

❌ Bad
```css
.sapMBtn {
    color: red;
}
```

✅ Good
```css
.sapMBtn {
	color: red;
}
```

---

### `@stylistic/declaration-colon-space-after: "always"`

Always put exactly one space after the `:` in a declaration.

❌ Bad
```css
.sapMBtn {
	color:red;
}
```

✅ Good
```css
.sapMBtn {
	color: red;
}
```

---

### `@stylistic/string-quotes: "single"`

String values must use single quotes, not double quotes.

❌ Bad
```css
.sapMBtn::after {
	content: "arrow";
}
```

✅ Good
```css
.sapMBtn::after {
	content: 'arrow';
}
```

---

### `@stylistic/no-eol-whitespace: true`

No trailing whitespace at the end of lines.

❌ Bad — line ends with spaces
```css
.sapMBtn {   
	color: red;   
}
```

✅ Good
```css
.sapMBtn {
	color: red;
}
```

---

## Values

### `alpha-value-notation: "number"`

Alpha / opacity values must be written as numbers between 0 and 1, not as percentages.

❌ Bad
```css
.sapMBtn {
	color: rgb(0 0 0 / 50%);
	background: rgba(255, 255, 255, 80%);
}
```

✅ Good
```css
.sapMBtn {
	color: rgb(0 0 0 / 0.5);
	background: rgba(255, 255, 255, 0.8);
}
```

---

### `length-zero-no-unit: true`

Zero lengths must not include a unit.

❌ Bad
```css
.sapMBtn {
	margin: 0px;
	padding: 0rem;
	border-width: 0px;
}
```

✅ Good
```css
.sapMBtn {
	margin: 0;
	padding: 0;
	border-width: 0;
}
```

---

### `value-keyword-case: ["lower", { ignoreKeywords: ["currentColor"] }]`

Keyword values must be lowercase. The only exception is `currentColor` (mixed-case is intentional).

❌ Bad
```css
.sapMBtn {
	display: Block;
	position: ABSOLUTE;
	cursor: Pointer;
}
```

✅ Good
```css
.sapMBtn {
	display: block;
	position: absolute;
	cursor: pointer;
	color: currentColor; /* exception */
}
```

---

### `keyframe-selector-notation: "keyword"`

Use the `from` and `to` keywords instead of `0%` and `100%` in keyframe selectors.

❌ Bad
```css
@keyframes sapMFade {
	0% { opacity: 1; }
	100% { opacity: 0; }
}
```

✅ Good
```css
@keyframes sapMFade {
	from { opacity: 1; }
	to { opacity: 0; }
}
```

Intermediate stops still use percentages (no keyword exists for them):

```css
@keyframes sapMSlide {
	from { transform: translateX(0); }
	50% { transform: translateX(50%); }
	to { transform: translateX(100%); }
}
```

---

## Selectors

### `selector-not-notation: "simple"`

Use multiple simple `:not()` calls rather than the CSS4 comma-list syntax inside a single `:not()`.

❌ Bad
```css
.sapMBtn:not(.sapMBtnDisabled, .sapMBtnActive) {
	color: red;
}
```

✅ Good
```css
.sapMBtn:not(.sapMBtnDisabled):not(.sapMBtnActive) {
	color: red;
}
```

---

### `selector-attribute-quotes: "always"`

Attribute selector values must always be quoted.

❌ Bad
```css
[type=text] { color: red; }
[data-sap-ui=true] { color: red; }
```

✅ Good
```css
[type='text'] { color: red; }
[data-sap-ui='true'] { color: red; }
```

---

### `selector-max-compound-selectors: [4, { disableFix: true }]`

A selector chain may contain at most 4 compound parts when using the **local complexity
configuration** (`npm run lint:styles:complexity`). The default config disables this rule.
It is **not auto-fixable** — violations require manual refactoring.

❌ Bad (5 compound parts)
```css
.sapUiForm .sapUiFormResGrid .sapUiRGLContainer .sapUiRGLContainerCont .sapMLabel {
	color: red;
}
```

✅ Good (4 or fewer parts)
```css
.sapUiRGLContainerCont .sapMLabel {
	color: red;
}
```

The linter message says: *"Please check for overly specific selector."*

---

### `selector-class-pattern: null`

Disabled — SAP class names such as `sapUiBtnDefault` or `sapMITBHead` do not follow standard kebab-case patterns.

---

## Nesting

### `max-nesting-depth: [4, { disableFix: true }]`

LESS nesting may be at most 4 levels deep when using the **local complexity configuration**
(`npm run lint:styles:complexity`). The default config disables this rule.
It is **not auto-fixable**.

❌ Bad (depth 5)
```less
.sapUiForm {
	.sapUiFormResGrid {
		.sapUiRGLContainer {
			.sapUiRGLContainerCont {
				.sapMLabel { // depth 5 ❌
					color: red;
				}
			}
		}
	}
}
```

✅ Good (depth ≤ 4)
```less
.sapUiForm {
	.sapUiFormResGrid {
		.sapUiRGLContainer {
			.sapMLabel { // depth 4 ✅
				color: red;
			}
		}
	}
}
```

The linter message says: *"Please check for overly specific selector."*

---

## Vendor Prefixes

### `property-no-vendor-prefix`

Vendor-prefixed properties are forbidden **except** for the following allow-list:
- `-webkit-user-select`
- `-webkit-text-size-adjust`
- `-webkit-appearance`
- Any `-*-placeholder*` property (e.g. `-webkit-input-placeholder`)

❌ Bad
```css
.sapMBtn {
	-webkit-border-radius: 4px;
	-moz-border-radius: 4px;
	-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
```

✅ Good — use unprefixed properties
```css
.sapMBtn {
	border-radius: 4px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
```

✅ Good — allowed exceptions
```css
.sapMInput {
	-webkit-user-select: none;
	-webkit-text-size-adjust: 100%;
	-webkit-appearance: none;
}

.sapMInput::-webkit-input-placeholder {
	color: @sapUiFieldPlaceholderTextColor;
}
```

---

### `at-rule-disallowed-list: ["-webkit-keyframes"]`

`@-webkit-keyframes` is forbidden. Use the standard `@keyframes`.

❌ Bad
```css
@-webkit-keyframes sapMFade {
	from { opacity: 1; }
	to { opacity: 0; }
}
```

✅ Good
```css
@keyframes sapMFade {
	from { opacity: 1; }
	to { opacity: 0; }
}
```

---

## Whitespace / Empty Lines

### `rule-empty-line-before: ["always", { ignore: ["after-comment"] }]`

Every rule block must be preceded by a blank line — except when it directly follows a comment.

❌ Bad
```less
.sapMBtn {
	color: red;
}
.sapMBtnInner {
	color: blue;
}
```

✅ Good
```less
.sapMBtn {
	color: red;
}

.sapMBtnInner {
	color: blue;
}
```

✅ Good — no blank line needed directly after a comment
```less
// Inner element
.sapMBtnInner {
	color: blue;
}
```

---

### `at-rule-empty-line-before`

At-rules must be preceded by a blank line, with two exceptions:
- `@import` — no blank line required
- At-rules whose name matches `/^_sap_/` or `/^_sap/` (SAP internal LESS parameters) — no blank line required

❌ Bad
```less
.sapMBtn {
	color: red;
}
@media (max-width: 600px) {
	.sapMBtn { font-size: 0.875rem; }
}
```

✅ Good
```less
.sapMBtn {
	color: red;
}

@media (max-width: 600px) {
	.sapMBtn { font-size: 0.875rem; }
}
```

✅ Good — consecutive `@import` without blank lines
```less
@import './Button.less';
@import './List.less';
@import './Input.less';
```

---

### `comment-empty-line-before: null`

Disabled — no restriction on whether a blank line must appear before comments.

---

## Declarations

### `declaration-block-no-redundant-longhand-properties`

Use shorthand properties instead of multiple longhand properties when a shorthand exists. The following shorthands are **exempt** (longhands are acceptable): `inset`, all `flex*` properties, `overflow`, `border`, `background`.

❌ Bad
```css
.sapMBtn {
	margin-top: 4px;
	margin-right: 8px;
	margin-bottom: 4px;
	margin-left: 8px;
	padding-top: 0;
	padding-right: 1rem;
	padding-bottom: 0;
	padding-left: 1rem;
}
```

✅ Good
```css
.sapMBtn {
	margin: 4px 8px;
	padding: 0 1rem;
}
```

✅ Good — `border` and `background` longhands are exempt
```css
.sapMBtn {
	border-top: 1px solid @sapUiBrand;
	border-bottom: 2px solid @sapUiBrand;
	background-color: @sapUiButtonBackground;
	background-image: none;
}
```

---

## Disabled Rules

These rules are explicitly set to `null` (off) because they would produce too many false positives with LESS syntax or SAP naming conventions.

| Rule | Reason |
|---|---|
| `at-rule-no-unknown` | LESS-specific at-rules (e.g. custom `@plugin`) look unknown to a CSS parser |
| `color-function-alias-notation` | Legacy `rgba()`/`hsla()` forms are widespread in the codebase |
| `color-function-notation` | Same — not enforcing modern `rgb()` single-function syntax |
| `color-hex-length` | No preferred hex shorthand/longhand convention |
| `declaration-property-value-no-unknown` | LESS variables used as property values look unknown to a CSS parser |
| `font-family-name-quotes` | Not enforced |
| `font-family-no-missing-generic-family-keyword` | Not enforced |
| `import-notation` | LESS `@import` syntax differs from standard CSS `@import` |
| `keyframes-name-pattern` | SAP keyframe names don't follow a standard pattern |
| `media-feature-range-notation` | Legacy range syntax is widespread |
| `media-query-no-invalid` | LESS media query expressions look invalid to a CSS parser |
| `no-descending-specificity` | Too many existing violations to enforce globally |
| `shorthand-property-no-redundant-values` | Not enforced |
| `custom-property-pattern` | SAP CSS custom property names (`--sap*`) don't match standard patterns |
| `property-no-deprecated` | Not enforced |
