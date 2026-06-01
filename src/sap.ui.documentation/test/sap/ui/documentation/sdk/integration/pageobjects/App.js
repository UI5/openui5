sap.ui.define([
	'sap/ui/test/Opa5',
	"sap/ui/test/matchers/I18NText",
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/actions/Press'
], function (Opa5, I18NText, PropertyStrictEquals, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage: {
			viewName: "App",
			actions: {

				iPressTheWelcomeTabButton : function() {
					return this.waitFor({
						id: "sap_logo",
						actions: new Press(),
						errorMessage: "No welcomeTab button found"
					});
				},

				iPressTheTopicMasterTabButton : function() {
					return this.waitFor({
						id: "topicMasterTab",
						actions: new Press(),
						errorMessage: "No topicMasterTab button found"
					});
				},

				iPressTheApiMasterTabButton : function() {
					return this.waitFor({
						id: "apiMasterTab",
						actions: new Press(),
						errorMessage: "No apiMasterTab button found"
					});
				},

				iPressTheControlsMasterTabButton : function() {
					return this.waitFor({
						id: "controlsMasterTab",
						actions: new Press(),
						errorMessage: "No controlsMasterTab button found"
					});
				},

				iPressTheDemoAppsTabButton : function() {
					return this.waitFor({
						id: "demoAppsTab",
						actions: new Press(),
						errorMessage: "No demoAppsTab button found"
					});
				},

				iPressTheResourcesTabButton : function() {
					return this.waitFor({
						id: "resourcesTab",
						actions: new Press(),
						errorMessage: "No resourcesTab button found"
					});
				},

				iPressTheSettingsMenuButton: function () {
					// On narrow viewports (e.g. CI headless) the OverflowToolbar moves
					// aboutMenuButton into the overflow popover so it is not rendered.
					// Open the overflow first when that happens, then press the button.
					return this.waitFor({
						controlType: "sap.m.OverflowToolbar",
						matchers: function (oToolbar) {
							return oToolbar.$().hasClass("sapUiDemoKitHeaderOTB");
						},
						success: function (aToolbars) {
							var oToolbar = aToolbars[0];
							var oOverflowBtn = oToolbar.getAggregation("_overflowButton");
							if (oOverflowBtn && oOverflowBtn.getDomRef()) {
								return this.waitFor({
									controlType: "sap.m.ToggleButton",
									matchers: function (oBtn) {
										return oBtn === oOverflowBtn;
									},
									actions: new Press(),
									success: function () {
										return this.waitFor({
											id: "aboutMenuButton",
											actions: new Press(),
											errorMessage: "Settings menu button not found in overflow"
										});
									},
									errorMessage: "Overflow button not found"
								});
							}
							return this.waitFor({
								id: "aboutMenuButton",
								actions: new Press(),
								errorMessage: "Settings menu button not found"
							});
						},
						errorMessage: "DemoKit header toolbar not found"
					});
				},

				iSelectAppearanceOption: function (sKey) {
					// First open the "appearance" submenu, then press the leaf item
					return this.waitFor({
						controlType: "sap.m.MenuItem",
						matchers: new PropertyStrictEquals({ name: "key", value: "appearance" }),
						actions: new Press(),
						errorMessage: "Appearance submenu item not found"
					}).waitFor({
						controlType: "sap.m.MenuItem",
						matchers: new PropertyStrictEquals({ name: "key", value: sKey }),
						actions: new Press(),
						errorMessage: "Appearance menu item '" + sKey + "' not found"
					});
				}

			},

			assertions: {

				iShouldSeeTheAppPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The App page was successfully displayed");
						},
						errorMessage: "The App page was not displayed"
					});
				},

				iShouldSeeThemeApplied: function (sExpectedTheme) {
					return this.waitFor({
						check: function () {
							var Theming = Opa5.getWindow().sap.ui.require("sap/ui/core/Theming");
							return Theming && Theming.getTheme() === sExpectedTheme;
						},
						success: function () {
							Opa5.assert.ok(true, "Theme '" + sExpectedTheme + "' is applied");
						},
						errorMessage: "Theme '" + sExpectedTheme + "' was not applied"
					});
				}
			}
		}
	});

});
