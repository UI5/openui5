/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Image",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/AdaptationRenderer",
	"sap/ui/rta/Utils"
], function(
	Log,
	Image,
	Adaptation,
	AdaptationRenderer,
	Utils
) {
	"use strict";

	/**
	 * This class is being assigned to the original Fiori Header Toolbar when RTA Toolbar shows
	 * @type {string}
	 */
	const FIORI_HIDDEN_CLASS = "sapUiRtaFioriHeaderInvisible";

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

	Fiori.prototype.init = function(...aArgs) {
		this._oRenderer = Utils.getFiori2Renderer();
		this._oFioriHeader = this._oRenderer.getRootControl().getShellHeader();
		Adaptation.prototype.init.apply(this, aArgs);
	};

	Fiori.prototype.show = function(...aArgs) {
		this._oFioriHeader.addStyleClass(FIORI_HIDDEN_CLASS);
		return Adaptation.prototype.show.apply(this, aArgs);
	};

	Fiori.prototype.buildControls = async function(...aArgs) {
		const aControls = await Adaptation.prototype.buildControls.apply(this, aArgs);
		const sLogoPath = this.getUshellApi().getLogo();

		if (sLogoPath) {
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
	Fiori.prototype.hide = function(...aArgs) {
		return Adaptation.prototype.hide.apply(this, aArgs)
		.then(function() {
			this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);
		}.bind(this));
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
		// In case of destroy() without normal hide() call
		this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);

		Adaptation.prototype.destroy.apply(this, aArgs);
	};

	Fiori.prototype.navigateBack = function() {
		this.getUshellApi().navigateBack();
	};

	return Fiori;
});