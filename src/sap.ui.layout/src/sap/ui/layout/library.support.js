/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.ui.layout library to the support infrastructure.
 */
sap.ui.define(["./rules/Form.support"], function(FormSupport) {
"use strict";

return {
	name: "sap.ui.layout",
	niceName: "UI5 Layout Library",
	ruleset: [
		FormSupport
	]
};

});