/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(
	FlexCommand
) {
	"use strict";

	/**
	 * Adds an IFrame
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.command.AddIFrame
	 */
	const AddIFrame = FlexCommand.extend("sap.ui.rta.command.AddIFrame", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				baseId: {
					type: "string",
					group: "content"
				},
				targetAggregation: {
					type: "string",
					group: "content"
				},
				index: {
					type: "int",
					group: "content"
				},
				url: {
					type: "string",
					group: "content"
				},
				width: {
					type: "string",
					group: "content"
				},
				height: {
					type: "string",
					group: "content"
				},
				title: {
					type: "string",
					group: "content"
				},
				advancedSettings: {
					type: "object",
					defaultValue: {},
					group: "content"
				},
				// This setting must be default true because the feature that allows this to be false is not
				// yet available in all browsers.
				// For the end user, when the feature is available, the property will be false by default on the dialog.
				allowFocusWithoutUserActivation: {
					type: "boolean",
					defaultValue: true,
					group: "content"
				},
				changeType: {
					type: "string",
					defaultValue: "addIFrame"
				}
			},
			associations: {},
			events: {}
		}
	});

	// Override to avoid url to be 'bound'
	AddIFrame.prototype.applySettings = function(...aArgs) {
		const mSettings = aArgs[0];
		const mSettingsWithoutUrl = {};
		Object.keys(mSettings)
		.filter((sSettingName) => sSettingName !== "url")
		.forEach((sSettingName) => {
			mSettingsWithoutUrl[sSettingName] = mSettings[sSettingName];
		});
		aArgs[0] = mSettingsWithoutUrl;
		FlexCommand.prototype.applySettings.apply(this, aArgs);
		this.setUrl(mSettings.url);
	};

	AddIFrame.prototype._getChangeSpecificData = function() {
		const mChangeSpecificData = FlexCommand.prototype._getChangeSpecificData.call(this);
		const { title: sTitle, ...oContent } = mChangeSpecificData.content;
		// When the browser does not support the Permissions Policy, the dialog never sets this
		// property. Persisting the metadata default in that case would silently start blocking
		// focus once the browser gains support, so we strip it from the change content unless
		// it was explicitly set on the command.
		if (this.isPropertyInitial("allowFocusWithoutUserActivation")) {
			delete oContent.allowFocusWithoutUserActivation;
		}
		return {
			changeType: mChangeSpecificData.changeType,
			content: oContent,
			texts: sTitle
				? {
					title: {
						value: sTitle,
						type: "XTIT"
					}
				}
				: {}
		};
	};

	return AddIFrame;
});
