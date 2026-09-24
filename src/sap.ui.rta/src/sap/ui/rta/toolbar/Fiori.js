/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Image",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/AdaptationRenderer"
], function(
	Log,
	Image,
	Adaptation,
	AdaptationRenderer
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Fiori control
	 *
	 * @class
	 * Contains implementation of Fiori specific toolbar
	 * @extends sap.ui.rta.toolbar.Adaptation
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Fiori
	 */
	const Fiori = Adaptation.extend("sap.ui.rta.toolbar.Fiori", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				ushellApi: {
					type: "any", // sap.ushell.api.RTA
					defaultValue: null
				}
			}
		},
		renderer: AdaptationRenderer,
		type: "fiori"
	});

	/**
	 * The Fiori toolbar is rendered into the dedicated RTA header area of the FLP shell layout
	 * (see sap.ushell.api.RTA#getRtaHeaderDomRef). This area is only available once the UI adaptation
	 * has been started, so the actual placement is deferred to {@link sap.ui.rta.toolbar.Fiori#show}.
	 * @override
	 */
	Fiori.prototype.placeToContainer = function() {
		// Intentionally left blank: placement happens in show() once startUIAdaptation
		// has reserved the RTA header area.
	};

	Fiori.prototype.show = async function(...aArgs) {
		await this.getUshellApi().startUIAdaptation();
		const oRtaHeaderDomRef = await this.getUshellApi().getRtaHeaderDomRef();
		this.placeAt(oRtaHeaderDomRef);
		return Adaptation.prototype.show.apply(this, aArgs);
	};

	Fiori.prototype.buildControls = async function(...aArgs) {
		const aControls = await Adaptation.prototype.buildControls.apply(this, aArgs);
		const sLogoPath = await this.getUshellApi().getLogoSrc();

		if (sLogoPath) {
			// getLogoDomRef only works in the direct shell scenario and returns undefined in iframe
			// scenarios; the size handling below falls back gracefully when no domRef is available.
			const oLogo = this.getUshellApi().getLogoDomRef();
			let iWidth;
			let iHeight;
			if (oLogo) {
				iWidth = oLogo.getBoundingClientRect().width;
				iHeight = oLogo.getBoundingClientRect().height;
				this._checkLogoSize(oLogo, iWidth, iHeight);
			} else {
				// without setting a width, the image will span the height of the toolbar, which doesn't look good.
				iWidth = "80%";
			}

			this.getControl("iconBox").addItem(
				new Image(`${this.getId()}_fragment--sapUiRta_icon`, {
					src: sLogoPath,
					// type check required because the image could have zero width and height
					width: typeof iWidth === "number" ? `${iWidth}px` : iWidth,
					height: typeof iHeight === "number" ? `${iHeight}px` : iHeight
				})
			);
		}
		return aControls;
	};

	/**
	 * @inheritDoc
	 */
	Fiori.prototype.hide = async function(...aArgs) {
		await Adaptation.prototype.hide.apply(this, aArgs);
		await this.getUshellApi().endUIAdaptation();
	};

	Fiori.prototype._checkLogoSize = function(oLogo, iWidth, iHeight) {
		const iNaturalWidth = oLogo.naturalWidth;
		const iNaturalHeight = oLogo.naturalHeight;

		if (Math.round(iWidth) !== iNaturalWidth || Math.round(iHeight) !== iNaturalHeight) {
			Log.error([
				"sap.ui.rta: please check Fiori Launchpad logo, expected size is",
				`${iWidth}x${iHeight},`,
				`but actual is ${iNaturalWidth}x${iNaturalHeight}`
			].join(" "));
		}
	};

	Fiori.prototype.destroy = function(...aArgs) {
		// In case of destroy() without normal hide() call.
		// endUIAdaptation is asynchronous, but destroy() cannot be, so this runs as a fire-and-forget cleanup.
		this.getUshellApi().endUIAdaptation();

		Adaptation.prototype.destroy.apply(this, aArgs);
	};

	Fiori.prototype.navigateBack = function() {
		this.getUshellApi().navigateBack();
	};

	return Fiori;
});
