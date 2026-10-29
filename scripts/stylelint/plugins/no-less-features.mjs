/**
 * Stylelint plugin: openui5/no-less-features
 *
 * Provides per-category rules that flag LESS language features so touched code
 * can be migrated to CSS custom properties (var(--...)) incrementally.
 *
 * All rules require postcss-less as customSyntax to see the LESS AST.
 * Each rule carries its own severity so the four categories can be phased and
 * promoted from warning → error independently.
 *
 * Rules:
 *   openui5/no-less-var-declaration  - LESS @name: value; declarations
 *   openui5/no-less-var-usage        - LESS @name used as a property value
 *   openui5/no-less-mixin            - mixin definitions and calls
 *   openui5/no-less-guard            - when(...) guards and loops
 *   openui5/no-less-arithmetic       - arithmetic in LESS variable values
 *   openui5/no-less-interpolation    - ~"..." escape strings and @{...} interpolation
 *
 * Color functions (darken, lighten, fade, ...) are handled by the built-in
 * "function-disallowed-list" rule and need no custom code here.
 */

import stylelint from "stylelint";

const { createPlugin, utils: { report, ruleMessages, validateOptions } } = stylelint;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Default allow-pattern for LESS @variables: SAP theme parameters. */
const THEME_PARAM_RE = /^@(sapUi|_sap)/;

/** LESS @var in a CSS value: @word that is NOT a CSS custom property (--var). */
const LESS_VAR_IN_VALUE_RE = /@(?!--)(?:[a-zA-Z_-][\w-]*)/g;

/** Pattern indicating arithmetic in a LESS variable value. */
const ARITHMETIC_RE = /[@\d][.\w%]*\s*[+\-*/]\s*[@\d]/;

/** Interpolation: ~"..." escape string or @{...} variable interpolation. */
const INTERP_RE = /~["']|@\{/;

// ─── no-less-var-declaration ────────────────────────────────────────────────

const varDeclMessages = ruleMessages("openui5/no-less-var-declaration", {
	unexpected: (name) => `Unexpected LESS variable declaration "@${name}". Use CSS custom properties (--${name}: value).`,
});

const noLessVarDeclaration = createPlugin("openui5/no-less-var-declaration", (primaryOption, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, "openui5/no-less-var-declaration",
			{ actual: primaryOption, possible: [true] },
			{
				actual: secondaryOptions,
				possible: {
					allowPattern: [String],
					severity: ["warning", "error"],
				},
				optional: true,
			}
		);
		if (!validOptions) return;

		const severity = secondaryOptions?.severity ?? "warning";
		const allowPatterns = secondaryOptions?.allowPattern
			? (Array.isArray(secondaryOptions.allowPattern) ? secondaryOptions.allowPattern : [secondaryOptions.allowPattern])
			: [THEME_PARAM_RE.source];

		root.walkAtRules((node) => {
			if (!node.variable) return; // not a LESS @var declaration

			const varName = `@${node.name}`;
			if (allowPatterns.some((p) => new RegExp(p).test(varName))) return;

			report({
				message: varDeclMessages.unexpected(node.name),
				node,
				result,
				ruleName: "openui5/no-less-var-declaration",
				severity,
			});
		});
	};
});
noLessVarDeclaration.ruleName = "openui5/no-less-var-declaration";
noLessVarDeclaration.messages = varDeclMessages;

// ─── no-less-var-usage ──────────────────────────────────────────────────────

const varUsageMessages = ruleMessages("openui5/no-less-var-usage", {
	unexpected: (varRef) => `Unexpected LESS variable reference "${varRef}". Use CSS custom properties (var(--...)).`,
});

const noLessVarUsage = createPlugin("openui5/no-less-var-usage", (primaryOption, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, "openui5/no-less-var-usage",
			{ actual: primaryOption, possible: [true] },
			{
				actual: secondaryOptions,
				possible: {
					allowPattern: [String],
					severity: ["warning", "error"],
				},
				optional: true,
			}
		);
		if (!validOptions) return;

		const severity = secondaryOptions?.severity ?? "warning";
		const allowPatterns = secondaryOptions?.allowPattern
			? (Array.isArray(secondaryOptions.allowPattern) ? secondaryOptions.allowPattern : [secondaryOptions.allowPattern])
			: [THEME_PARAM_RE.source];

		const checkValue = (node, value) => {
			let match;
			const re = new RegExp(LESS_VAR_IN_VALUE_RE.source, "g");
			while ((match = re.exec(value)) !== null) {
				const varRef = match[0];
				if (allowPatterns.some((p) => new RegExp(p).test(varRef))) continue;

				report({
					message: varUsageMessages.unexpected(varRef),
					node,
					word: varRef,
					result,
					ruleName: "openui5/no-less-var-usage",
					severity,
				});
			}
		};

		root.walkDecls((node) => {
			if (node.variable) return; // skip LESS @var declaration nodes handled by no-less-var-declaration
			checkValue(node, node.value);
		});

		// Also check LESS variable values that themselves reference other variables
		root.walkAtRules((node) => {
			if (!node.variable) return;
			checkValue(node, node.params);
		});
	};
});
noLessVarUsage.ruleName = "openui5/no-less-var-usage";
noLessVarUsage.messages = varUsageMessages;

// ─── no-less-mixin ──────────────────────────────────────────────────────────

const mixinMessages = ruleMessages("openui5/no-less-mixin", {
	unexpectedDef: (selector) => `Unexpected LESS mixin definition "${selector}".`,
	unexpectedCall: (name) => `Unexpected LESS mixin call ".${name}(...)".`,
});

const noLessMixin = createPlugin("openui5/no-less-mixin", (primaryOption, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, "openui5/no-less-mixin",
			{ actual: primaryOption, possible: [true] },
			{ actual: secondaryOptions, possible: { severity: ["warning", "error"] }, optional: true }
		);
		if (!validOptions) return;

		const severity = secondaryOptions?.severity ?? "warning";

		// Mixin definitions: rule nodes whose selector has a class/id name followed
		// directly by ( — excludes CSS pseudo-selectors like :not(...), :nth-child(...)
		root.walkRules((node) => {
			if (/(?:^|[\s,])(?:#|\.)[^:(,\s]+\s*\(/.test(node.selector)) {
				report({
					message: mixinMessages.unexpectedDef(node.selector),
					node,
					result,
					ruleName: "openui5/no-less-mixin",
					severity,
				});
			}
		});

		// Mixin calls: atrule nodes with mixin: true (postcss-less flag)
		root.walkAtRules((node) => {
			if (node.mixin) {
				report({
					message: mixinMessages.unexpectedCall(node.name),
					node,
					result,
					ruleName: "openui5/no-less-mixin",
					severity,
				});
			}
		});
	};
});
noLessMixin.ruleName = "openui5/no-less-mixin";
noLessMixin.messages = mixinMessages;

// ─── no-less-guard ──────────────────────────────────────────────────────────

const guardMessages = ruleMessages("openui5/no-less-guard", {
	unexpected: (selector) => `Unexpected LESS guard/loop condition in "${selector}".`,
});

const noLessGuard = createPlugin("openui5/no-less-guard", (primaryOption, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, "openui5/no-less-guard",
			{ actual: primaryOption, possible: [true] },
			{ actual: secondaryOptions, possible: { severity: ["warning", "error"] }, optional: true }
		);
		if (!validOptions) return;

		const severity = secondaryOptions?.severity ?? "warning";

		root.walkRules((node) => {
			if (/\bwhen\s*\(/.test(node.selector)) {
				report({
					message: guardMessages.unexpected(node.selector),
					node,
					result,
					ruleName: "openui5/no-less-guard",
					severity,
				});
			}
		});
	};
});
noLessGuard.ruleName = "openui5/no-less-guard";
noLessGuard.messages = guardMessages;

// ─── no-less-arithmetic ─────────────────────────────────────────────────────

const arithmeticMessages = ruleMessages("openui5/no-less-arithmetic", {
	unexpected: (name, value) => `Unexpected LESS arithmetic in "@${name}: ${value}". Use calc() instead.`,
});

const noLessArithmetic = createPlugin("openui5/no-less-arithmetic", (primaryOption, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, "openui5/no-less-arithmetic",
			{ actual: primaryOption, possible: [true] },
			{ actual: secondaryOptions, possible: { severity: ["warning", "error"] }, optional: true }
		);
		if (!validOptions) return;

		const severity = secondaryOptions?.severity ?? "warning";

		root.walkAtRules((node) => {
			if (!node.variable) return;
			if (ARITHMETIC_RE.test(node.params)) {
				report({
					message: arithmeticMessages.unexpected(node.name, node.params),
					node,
					result,
					ruleName: "openui5/no-less-arithmetic",
					severity,
				});
			}
		});
	};
});
noLessArithmetic.ruleName = "openui5/no-less-arithmetic";
noLessArithmetic.messages = arithmeticMessages;

// ─── no-less-interpolation ──────────────────────────────────────────────────

const interpolMessages = ruleMessages("openui5/no-less-interpolation", {
	unexpected: (name, value) => `Unexpected LESS interpolation/escape string in "@${name}: ${value}".`,
});

const noLessInterpolation = createPlugin("openui5/no-less-interpolation", (primaryOption, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, "openui5/no-less-interpolation",
			{ actual: primaryOption, possible: [true] },
			{ actual: secondaryOptions, possible: { severity: ["warning", "error"] }, optional: true }
		);
		if (!validOptions) return;

		const severity = secondaryOptions?.severity ?? "warning";

		root.walkAtRules((node) => {
			if (!node.variable) return;
			if (INTERP_RE.test(node.params)) {
				report({
					message: interpolMessages.unexpected(node.name, node.params),
					node,
					result,
					ruleName: "openui5/no-less-interpolation",
					severity,
				});
			}
		});

		// Also flag @{...} interpolation used directly in selectors or property values
		root.walkDecls((node) => {
			if (INTERP_RE.test(node.value)) {
				report({
					message: `Unexpected LESS interpolation/escape in value "${node.value}".`,
					node,
					result,
					ruleName: "openui5/no-less-interpolation",
					severity,
				});
			}
		});
	};
});
noLessInterpolation.ruleName = "openui5/no-less-interpolation";
noLessInterpolation.messages = interpolMessages;

// ─── plugin export ──────────────────────────────────────────────────────────

export default [
	noLessVarDeclaration,
	noLessVarUsage,
	noLessMixin,
	noLessGuard,
	noLessArithmetic,
	noLessInterpolation,
];
