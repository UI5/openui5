sap.ui.define([
	"sap/base/strings/camelize",
	"./ControlWrapper"
], function(
	camelize,
	ControlWrapper
) {
	"use strict";

	/**
	 * A fixture wrapper control that extends another ControlWrapper.
	 */
	const ExtendsControlWrapper = ControlWrapper.extend("webc.fixtures.ExtendsControlWrapper", {
		metadata: {
			// tag name is specified via the actual web component
			tag: "sample-webc",

			properties: {
				// string property
				yetAnotherText: "string"
			},
			aggregations: {
				// mapping to a slot of the same name as the aggregation
				subHeader: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
				}
			},
			events: {
				yetAnotherAction: {
					mapping: {
						to: "press-action"
					}
				}
			}
		},
		init: function(){
			// eslint-disable-next-line no-console
			console.log("ExtendsControlWrapper created");
		}
	});

	return ExtendsControlWrapper;
});
