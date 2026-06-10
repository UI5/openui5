/*!
 * ${copyright}
 */

sap.ui.define([
], function () {
		"use strict";

		return {
			serialize: function serializeRule(rule) {
				var replacer = function (key, value) {
					if (typeof value === "function") {
						return value.toString();
					} else {
						return value;
					}
				};

				var result = JSON.stringify(rule, replacer);
				return result;
			},
			deserialize: function (serializedRule) {
				var rule;

				if (typeof serializedRule === 'string') {
					rule = JSON.parse(serializedRule);
				} else {
					rule = serializedRule;
				}

				return rule;
			}
		};
	});
