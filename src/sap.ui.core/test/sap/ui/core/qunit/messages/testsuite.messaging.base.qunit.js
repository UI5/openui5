sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Messaging Base",
		defaults: {
			qunit: {
				version: "2.18",
				versions: {
					"2.18": {
						module: "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css: "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				}
			}
		},
		tests: {
			messagesDataBinding: {
				title: "Messaging: DataBinding Messages"
			},

			Message: {
				title: "Messaging: sap.ui.core.message.Message"
			},

			Messaging: {
				title: "Messaging: sap.ui.core.message.Messaging"
			},

			MessageMixin: {
				title: "Messaging: sap.ui.core.message.MessageMixin"
			},

			messagesGeneral: {
				title: "Messaging: General",
				ui5: {
					libs: "sap.m,sap.ui.layout",
					language: "en"
				}
			},

			messagesUsage: {
				title: "Messaging: Usage",
				loader: {
					paths: {
						"components": "test-resources/sap/ui/core/qunit/messages/components"
					}
				},
				ui5: {
					// test checks for hard coded English texts
					language: "en"
				}
			},

			messagesEnd2End: {
				title: "Messaging: End2End"
			}
		}
	};
});
