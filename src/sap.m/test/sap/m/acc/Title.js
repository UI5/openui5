sap.ui.define(["sap/ui/core/library", "sap/m/Title"], function(coreLibrary, Title) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	new Title({
		text: "Sample Title",
		level: TitleLevel.H1
	}).placeAt("content");
});
