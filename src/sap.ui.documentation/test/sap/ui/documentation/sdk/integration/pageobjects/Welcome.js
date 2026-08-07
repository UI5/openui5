sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/Press',
	'sap/ui/test/matchers/PropertyStrictEquals'
], function (Opa5, Press, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheWelcomePage: {
			viewName: "Welcome",
			actions: {
				iPressTheGetStartedButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({ name: "text", value: "Get Started with UI5" }),
						actions: new Press(),
						errorMessage: "The 'Get Started with UI5' button was not found"
					});
				}
			},
			assertions: {
				iShouldSeeTheWelcomePage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Welcome page was successfully displayed");
						},
						errorMessage: "The Welcome page was not displayed"
					});
				},
				iShouldSeeTheGetStartedTopicPage: function () {
					return this.waitFor({
						viewName: null,
						check: function () {
							return Opa5.getWindow().location.hash.indexOf("topic/8b49fc198bf04b2d9800fc37fecbb218") !== -1;
						},
						success: function () {
							Opa5.assert.ok(true, "URL hash updated to the Get Started topic");
						},
						errorMessage: "The URL hash was not updated after pressing Get Started"
					});
				}
			}
		}
	});

});
