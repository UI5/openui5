sap.ui.define([
	'sap/ui/test/Opa5',
	"sap/ui/test/matchers/I18NText",
	'sap/ui/test/actions/Press'
], function (Opa5, I18NText, Press) {
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
					// The settings/about button is a fiori:ShellBarItem in the ShellBar
					// header (id "aboutMenuButton"); its press fires onOpenAboutMenu, which
					// opens the "aboutMenu" Web Component menu.
					return this.waitFor({
						id: "aboutMenuButton",
						success: function (oShellBarItem) {
							oShellBarItem.fireClick();
						},
						errorMessage: "Settings menu button (aboutMenuButton) not found"
					});
				},

				iSelectAppearanceOption: function (sKey) {
					// The appearance options are Web Component menu items (webcc:MenuItem)
					// inside the "aboutMenu" menu, identified by their "action" custom data.
					// The menu renders into the static area (outside the "App" view) and its
					// items live in the Menu's shadow DOM, so their light-DOM host has no
					// rendered box - OPA's default visibility filter would never find them.
					// Search with visible:false across the whole registry, then simulate a
					// real user click on the item's interactive <li> inside its shadow DOM.
					// Clicking the shadow <li> (rather than firing the Menu's "itemClick"
					// event directly) exercises the full web component interaction chain -
					// ListItem activation, the List's item-click, the Menu closing its
					// popup - so the test fails if any part of that real click path breaks.
					return this.waitFor({
						viewName: undefined,
						visible: false,
						controlType: "sap.f.gen.ui5.webcomponents.dist.MenuItem",
						matchers: function (oItem) {
							return oItem.getCustomData().some(function (oData) {
								return oData.getKey() === "action" && oData.getValue() === sKey;
							});
						},
						success: function (aItems) {
							var oItem = aItems[0],
								oHost = oItem.getDomRef(),
								oClickTarget = oHost && oHost.shadowRoot
									&& oHost.shadowRoot.querySelector("li[part='native-li']");

							Opa5.assert.ok(oClickTarget, "Appearance menu item '" + sKey + "' has a clickable shadow element");
							oClickTarget.click();
						},
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
