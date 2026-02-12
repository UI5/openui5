/*!
 * ${copyright}
 */
sap.ui.define([
	'./FlexBoxRenderer',
	'sap/ui/core/Renderer'
], function(FlexBoxRenderer, Renderer) {
	"use strict";

	return Renderer.extend.call(FlexBoxRenderer, "sap.m.VBoxRenderer", { apiVersion: 2 });
});
