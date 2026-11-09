import { fileURLToPath } from "node:url";

/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: [
    "@stylistic/stylelint-plugin",
    // Resolve relative to this config, independently of Maven's configBasedir.
    fileURLToPath(new URL("./scripts/stylelint/plugins/no-less-features.mjs", import.meta.url)),
  ],
  "defaultSeverity": "warning",
  rules: {
    "alpha-value-notation": "number",
    "at-rule-no-unknown": null,
    "at-rule-empty-line-before": [ "always",
      {
        "ignoreAtRules": ["import", "/^_sap_/", "/^_sap/"]
      }
    ],
    "comment-empty-line-before": null,
    "color-function-alias-notation": null,
    "color-function-notation": null,
    "color-hex-length": null,
    "declaration-property-value-no-unknown": null,
    "declaration-block-no-redundant-longhand-properties": [ true,
      {
        "ignoreShorthands": ["inset", "/flex/", "overflow", "border", "background"]
      }
    ],
    "font-family-name-quotes": null,
    "font-family-no-missing-generic-family-keyword": null,
    "keyframes-name-pattern": null,
    "keyframe-selector-notation": "keyword",
    "length-zero-no-unit": true,
    "import-notation": null,
    // Opt in to complexity advice locally with npm run lint:styles:complexity.
    "max-nesting-depth": null,
    "media-feature-range-notation": null,
    "media-query-no-invalid": null,
    "selector-max-compound-selectors": null,
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "property-no-vendor-prefix": [ true,
      {
        "ignoreProperties": ["-webkit-user-select", "-webkit-text-size-adjust", "-webkit-appearance", "/^-placeholder/"]
      }
    ],
    "property-no-deprecated": null,
    "at-rule-disallowed-list": ["-webkit-keyframes"],
    "rule-empty-line-before": ["always",
      {
        "ignore": ["after-comment"]
      }
    ],
    "selector-not-notation": "simple",
    "selector-attribute-quotes": "always",
    "shorthand-property-no-redundant-values": null,
    "value-keyword-case": [ "lower",
      {
        "ignoreKeywords": ["currentColor"]
      }
    ],
    "@stylistic/indentation": ["tab"],
    "@stylistic/declaration-colon-space-after": "always",
    "@stylistic/string-quotes": "single",
    "@stylistic/no-eol-whitespace": true,
    "@stylistic/block-opening-brace-space-before": "always",
    "@stylistic/selector-combinator-space-after": "always",
    "@stylistic/declaration-bang-space-before": "always",
  },
  overrides: [
    {
      // Use postcss-less so stylelint can parse the full LESS AST.
      // Without this, LESS constructs (variables, mixins, interpolation) are
      // silently ignored by the default CSS parser.
      //
      // Phase 1 "no LESS features" rules — all at warning severity.
      // Theme parameters (@sapUi* / @_sap*) are allowlisted so phase 1 only
      // flags non-theme LESS variables; the allowlist is dropped in a later phase.
      //
      // To flip the LESS-variable rules to error for a library that is clean,
      // override the severity secondary option in the library's own .stylelintrc:
      //   "openui5/no-less-var-declaration": [true, { "severity": "error" }]
      files: ["**/*.less"],
      customSyntax: "postcss-less",
      rules: {
        // ── Color functions ─────────────────────────────────────────────────
        // Flag LESS color manipulation functions. Use CSS color-mix() or
        // CSS custom properties instead.
        "function-disallowed-list": [
          ["darken", "lighten", "saturate", "desaturate", "fade", "fadein", "fadeout", "mix",
           "spin", "tint", "shade", "greyscale", "contrast"],
          { severity: "warning" }
        ],

        // ── LESS variables ──────────────────────────────────────────────────
        // Theme parameters (@sapUi* / @_sap*) are intentionally excluded via
        // allowPattern — they are resolved at build time and are too pervasive
        // to migrate in one shot.
        "openui5/no-less-var-declaration": [true, {
          allowPattern: ["^@(sapUi|_sap)"],
          severity: "warning",
        }],
        "openui5/no-less-var-usage": [true, {
          allowPattern: ["^@(sapUi|_sap)"],
          severity: "warning",
        }],

        // ── Mixins ──────────────────────────────────────────────────────────
        "openui5/no-less-mixin": [true, { severity: "warning" }],

        // ── Guards / loops ──────────────────────────────────────────────────
        "openui5/no-less-guard": [true, { severity: "warning" }],

        // ── Phase 3 (deferred) ───────────────────────────────────────────────
        // These rules have higher false-positive risk (calc() entanglement)
        // and are disabled until the calc() migration is understood:
        //   "openui5/no-less-arithmetic":    [true, { severity: "warning" }],
        //   "openui5/no-less-interpolation": [true, { severity: "warning" }],
      },
    }
  ]};
