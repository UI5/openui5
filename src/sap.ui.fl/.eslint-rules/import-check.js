/**
 * @fileoverview Enforces that every sap.ui.define call contains a specific dependency.
 */

"use strict";

module.exports = {
	meta: {
		type: "problem",
		docs: {
			description: "sap.ui.define must include the specified dependency",
			recommended: false,
		},
		schema: [
			{
				type: "object",
				properties: {
					dependency: { type: "string" },
				},
				additionalProperties: false,
			},
		],
		messages: {
			importCheck:
				"'{{dep}}' must be included in the dependency array of sap.ui.define",
		},
	},

	create(context) {
		const TARGET_DEP = `sap/ui/fl/${process.env.FOLDER}/_internal/init`;

		function isSapUiDefine(node) {
			// Matches sap.ui.define( … )
			return (
				node.callee?.type === "MemberExpression" &&
				node.callee.property?.name === "define" &&
				node.callee.object?.type === "MemberExpression" &&
				node.callee.object.property?.name === "ui" &&
				node.callee.object.object?.name === "sap"
			);
		}

		return {
			CallExpression(node) {
				if (!isSapUiDefine(node)) {
					return;
				}

				const depsArg = node.arguments?.[0];
				if (depsArg?.type !== "ArrayExpression") {
					return;
				}

				const hasTarget = depsArg.elements.some(
					(el) => el.type === "Literal" && el.value === TARGET_DEP
				);

				if (!hasTarget) {
					context.report({
						node: depsArg,
						messageId: "importCheck",
						data: {
							dep: TARGET_DEP,
						},
					});
				}
			},
		};
	},
};

