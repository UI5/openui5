/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
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
			deserialize: function (serializedRule, stringifyCheck) {
				var rule;

				if (typeof serializedRule === 'string') {
					rule = JSON.parse(serializedRule);
				} else {
					rule = serializedRule;
				}

				/* eslint-disable no-new-func */
				if (!stringifyCheck && rule.check !== undefined) {
					rule.check = new Function("return (" + rule.check + ")")();
				}
				/* eslint-enable no-new-func */

				return rule;
			}
		};
	}, true);
