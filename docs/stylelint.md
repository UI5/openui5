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

A selector chain may contain at most 4 compound parts. This rule is **not auto-fixable** — violations require manual refactoring.

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

LESS nesting may be at most 4 levels deep. This rule is **not auto-fixable**.

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
