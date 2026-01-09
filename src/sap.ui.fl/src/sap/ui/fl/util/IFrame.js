/*!
 * ${copyright}
 */

// Provides control sap.ui.fl.util.IFrame
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/util/getContainerUserInfo",
	"sap/base/security/URLListValidator",
	"sap/base/Log",
	"sap/ui/fl/util/IFrameRenderer",
	"sap/ui/core/library"
	// The iFrame control does not need to require its library module because no DataTypes are defined in fl library and the control
	// doesn't require any CSS from the library.css
], function(
	Control,
	JSONModel,
	getContainerUserInfo,
	URLListValidator,
	Log,
	IFrameRenderer
) {
	"use strict";

	function unbind(vValue) {
		if (vValue.parts && vValue.formatter) {
			return vValue.formatter.apply(null, vValue.parts.map(function(oPart) {
				if (oPart.model) {
					return `{${oPart.model}>${oPart.path}}`;
				}
				return `{${oPart.path}}`;
			}));
		}
		return vValue;
	}

	/**
	 * Constructor for a new <code>IFrame</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables integration of external applications using IFrames.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.fl.util.IFrame
	 */
	var IFrame = Control.extend("sap.ui.fl.util.IFrame", /** @lends sap.ui.fl.util.IFrame.prototype */ {
		metadata: {
			library: "sap.ui.fl",

			properties: {
				/**
				 * Determines the URL of the content.
				 */
				url: { type: "sap.ui.core.URI", group: "Misc", defaultValue: "about:blank" },

				/**
				 * Defines the <code>IFrame</code> width.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: "100%" },

				/**
				 * Defines the <code>IFrame</code> height.
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: "35vh" },

				/**
				 * Defines the title of the item.
				 */
				title: { type: "string", group: "Misc", defaultValue: undefined },

				/**
				 * Defines whether the <code>IFrame</code> was added as a new container.
				 */
				asContainer: { type: "boolean", group: "Misc", defaultValue: undefined },

				/**
				 * Defines the information required for handling rename of <code>IFrame</code> containers.
				 */
				renameInfo: { type: "object", group: "Data", defaultValue: null },

				/**
				 * Contains the Iframe sandbox attributes
				 */
				advancedSettings: {
					type: "object",
					defaultValue: {
						allowForms: true,
						allowPopups: true,
						allowScripts: true,
						allowModals: true,
						allowSameOrigin: true,
						additionalSandboxParameters: []
					}
				},

				/**
				 * Backup of the initial settings for the dialogs.
				 *
				 *  @private
				 *  @ui5-restricted sap.ui.fl
				 */
				_settings: {
					type: "object",
					group: "Data",
					defaultValue: null
				}
			},

			designtime: "sap/ui/fl/designtime/util/IFrame.designtime"
		},

		init(...aArgs) {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this, aArgs);
			}
			this._oInitializePromise = getContainerUserInfo()
			.then(function(oUserInfo) {
				this._oUserModel = new JSONModel(oUserInfo);
				this.setModel(this._oUserModel, "$user");
			}.bind(this));
		},

		waitForInit() {
			return this._oInitializePromise ? this._oInitializePromise : Promise.reject(new Error("Control not initialized"));
		},

		setUrl(sUrl) {
			// Could contain special characters from bindings that need to be encoded
			// Make sure that it was not encoded before
			let sEncodedUrl = decodeURI(sUrl) === sUrl ? encodeURI(sUrl) : sUrl;

			// Falsy values coming from bindings can lead to unexpected relative navigation
			sEncodedUrl ||= "about:blank";

			if (!IFrame.isValidUrl(sEncodedUrl).result) {
				Log.error("Provided URL is not valid as an IFrame src");
				return this;
			}

			const oNewUrl = IFrame._toUrl(sEncodedUrl);
			this.setProperty("url", oNewUrl.toString());
			return this;
		},

		getIFrameDomRef() {
			return this.getDomRef()?.querySelector("iframe");
		},

		getFocusDomRef() {
			return this.getIFrameDomRef();
		},

		applySettings(mSettings, ...aOtherArgs) {
			const { url, ...mOtherSettings } = mSettings || {};
			Control.prototype.applySettings.apply(this, [mOtherSettings, ...aOtherArgs]);
			Control.prototype.applySettings.apply(this, [{ url }, ...aOtherArgs]);
			if (mSettings) {
				let mMergedSettings = { ...this.getProperty("_settings") || {} };
				if (mSettings._settings) {
					mMergedSettings = { ...mMergedSettings, ...mSettings._settings };
				} else {
					Object.keys(mSettings)
					.filter(function(sPropertyName) {
						return mSettings[sPropertyName] !== undefined;
					})
					.forEach(function(sPropertyName) {
						mMergedSettings[sPropertyName] = unbind(mSettings[sPropertyName]);
					});
				}
				this.setProperty("_settings", { ...mMergedSettings });
			}
		},

		exit() {
			if (this._oUserModel) {
				this._oUserModel.destroy();
				delete this._oUserModel;
			}
		},

		renderer: IFrameRenderer
	});

	// Used for test stubbing
	IFrame._getDocumentLocation = function() {
		return document.location;
	};

	IFrame._toUrl = function(sUrl) {
		const oDocumentLocation = IFrame._getDocumentLocation();
		return new URL(sUrl, oDocumentLocation.href);
	};

	IFrame.VALIDATION_ERROR = {
		UNSAFE_PROTOCOL: "unsafeProtocol",
		MIXED_CONTENT: "mixedContent",
		FORBIDDEN_URL: "forbiddenUrl",
		INVALID_URL: "invalidUrl"
	};

	IFrame.isValidUrl = function(sUrl) {
		try {
			// Explicitly allow about:blank as a way to reset the iframe content
			// e.g. if the control is reused and no valid URL is provided
			if (sUrl === "about:blank") {
				return {
					result: true
				};
			}

			const oUrl = IFrame._toUrl(sUrl);

			// Forbid dangerous javascript pseudo protocol
			if (/javascript/i.test(oUrl.protocol)) {
				return {
					result: false,
					error: IFrame.VALIDATION_ERROR.UNSAFE_PROTOCOL
				};
			}

			if (
				// Forbid unsafe http embedding within https to conform with mixed content security restrictions
				/http(?!s)/.test(oUrl.protocol)
				// Exception: Host is using http, no protocol downgrade happening
				// Required for local testing and onPrem systems
				&& !/http(?!s)/.test(IFrame._getDocumentLocation().protocol)
			) {
				return {
					result: false,
					error: IFrame.VALIDATION_ERROR.MIXED_CONTENT
				};
			}

			// Take further customer restrictions into account
			// Since the validator doesn't return an error, use a generic error message
			if (!URLListValidator.validate(sUrl)) {
				return {
					result: false,
					error: IFrame.VALIDATION_ERROR.FORBIDDEN_URL
				};
			}

			return {
				result: true
			};
		} catch {
			// URL parsing failed
			return {
				result: false,
				error: IFrame.VALIDATION_ERROR.INVALID_URL
			};
		}
	};

	return IFrame;
});
