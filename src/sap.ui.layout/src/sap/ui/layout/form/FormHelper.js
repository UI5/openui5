/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/base/util/merge"
], function(
	Library,
	CoreLibrary,
	merge
) {
	"use strict";

	const _MHelper = {
		Label: undefined,
		Button: undefined,
		Text: undefined,
		Title: undefined,
		Library: undefined,
		TitleLevel: CoreLibrary.TitleLevel,
		init: function() {
			// normally this basic controls should be always loaded
			if (!this.bInitialized) {
				this.Label = sap.ui.require("sap/m/Label");
				this.Text = sap.ui.require("sap/m/Text");
				this.Button = sap.ui.require("sap/m/Button");
				this.Title = sap.ui.require("sap/m/Title");
				this.Library = sap.ui.require("sap/m/library");

				if (!this.Label || !this.Text || !this.Button || !this.Title || !this.Library) {
					if (!this.oInitPromise) {
						this.oInitPromise = new Promise(function(fResolve, fReject) {
							sap.ui.require(["sap/m/Label", "sap/m/Text", "sap/m/Button", "sap/m/Title", "sap/m/library"], function(Label, Text, Button, Title, Library) {
								this.Label = Label;
								this.Text = Text;
								this.Button = Button;
								this.Title = Title;
								this.Library = Library;
								this.bInitialized = true;
								fResolve(true);
							}.bind(this));
						}.bind(this));
					}
					return this.oInitPromise;
				} else if (this.oInitPromise) {
					delete this.oInitPromise; // not longer needed
				}
				this.bInitialized = true;
			}
			return null;
		},
		createLabel: function(sText, sId){
			return new this.Label(sId, {text: sText});
		},
		createButton: function(sId, fnPressFunction, oListener){
			const oButton = new this.Button(sId, {type: this.Library.ButtonType.Transparent});
			oButton.attachEvent("press", fnPressFunction, oListener); // attach event this way to have the right this-reference in handler
			return oButton;
		},
		setButtonContent: function(oButton, sText, sTooltip, sIcon, sIconHovered){
			oButton.setText(sText);
			oButton.setTooltip(sTooltip);
			oButton.setIcon(sIcon);
			oButton.setActiveIcon(sIconHovered);
		},
		addFormClass: function(){ return "sapUiFormM"; },
		setToolbar: function(oToolbar, oOldToolbar){
			if (oOldToolbar && oOldToolbar.setDesign) {
				// check for setDesign because we don't know what kind of custom toolbars might be used.
				oOldToolbar.setDesign(oOldToolbar.getDesign(), true);
			}
			if (oToolbar && oToolbar.setDesign) {
				const oProperty = oToolbar.getMetadata().getManagedProperty("design");
				if (oProperty && oProperty.type === "sap.m.ToolbarDesign") { // as custom toolbar could have different types
					oToolbar.setDesign(this.Library.ToolbarDesign.Transparent, true);
				}
			}
			return oToolbar;
		},
		getToolbarTitle: function(oToolbar) {
			// determine Title to point aria-label on this. As Fallback use the whole Toolbar
			if (oToolbar) {
				const aContent = oToolbar.getContent ? oToolbar.getContent() : []; // check for getContent because we don't know what kind of custom toolbars might be used.
				for (let i = 0; i < aContent.length; i++) {
					const oContent = aContent[i];
					if (oContent.isA("sap.m.Title")) {
						return oContent.getId();
					}
				}
				return oToolbar.getId(); // fallback
			}
		},
		createDelimiter: function(sDelimiter, sId){
			return new this.Text(sId, {text: sDelimiter, textAlign: CoreLibrary.TextAlign.Center});
		},
		createSemanticDisplayControl: function(sText, sId){
			return new this.Text(sId, {text: sText});
		},
		updateDelimiter: function(oText, sDelimiter){
			oText.setText(sDelimiter);
		},
		updateSemanticDisplayControl: function(oText, sText){
			oText.setText(sText);
		},
		isArrowKeySupported: function() {
			return false; /* disables the keyboard support for arrow keys */
		},
		createRenderingTitle: function(vTitle, sId, sDefaultLevel, sDefaultStyle) {
			const oSettings = {};
			if (typeof vTitle !== "string") {
				if (vTitle.getIcon() || vTitle.getEmphasized()) { // icon and emphasized is not supported by sap.m.Title
					return null;
				}
				if (vTitle.getId() === sId) {
					sId = sId + "--inner";
				}
			}

			const oRenderingTitle = new this.Title(sId, oSettings);
			this.updateRenderingTitle(vTitle, oRenderingTitle, sDefaultLevel, sDefaultStyle);
			return oRenderingTitle;
		},
		updateRenderingTitle: function(vTitle, oRenderingTitle, sDefaultLevel, sDefaultStyle) {
			let sText;
			let sLevel = sDefaultLevel;
			let vTooltip = oRenderingTitle.getTooltip();

			if (vTooltip && typeof vTooltip !== "string") {
				oRenderingTitle.destroyTooltip(); // just destroy and create new -> tooltip as object not supported in sap.m
			}
			vTooltip = null;

			if (typeof vTitle !== "string") {
				if (vTitle.getIcon() || vTitle.getEmphasized()) { // icon and emphasized is not supported by sap.m.Title
					oRenderingTitle.destroy();
					return;
				}
				if (vTitle.getLevel() !== this.TitleLevel.Auto) {
					sLevel = vTitle.getLevel();
				}
				sText = vTitle.getText();
				vTooltip = vTitle.getTooltip();
				if (vTooltip && typeof vTooltip !== "string") {
					vTooltip = vTooltip.clone("-inner");
				}
			} else {
				sText = vTitle;
			}

			oRenderingTitle.setText(sText);
			oRenderingTitle.setLevel(sLevel); // will be updated from theme parameter before rendering. But set here, if possible, to prevent unneeded updates while rendering.
			oRenderingTitle.setTitleStyle(sDefaultStyle === this.TitleLevel.Auto ? sLevel : sDefaultStyle); // if no default style maintened -> use same as level
			oRenderingTitle.setTooltip(vTooltip);
		}
	};

	/**
	 * @deprecated as of version 1.38 sap.ui.commons is deprecated, so test should only be executed if still available
	 */
	const _CommonsHelper = {
		init: function() {
			return null;
		},
		createLabel: function(sText, sId){
			return new sap.ui.commons.Label(sId, {text: sText});
		},
		createButton: function(sId, fPressFunction, oListener){
			const oButton = new sap.ui.commons.Button(sId, {lite: true});
			oButton.attachEvent('press', fPressFunction, oListener); // attach event this way to have the right this-reference in handler
			return oButton;
		},
		setButtonContent: function(oButton, sText, sTooltip, sIcon, sIconHovered){
			oButton.setText(sText);
			oButton.setTooltip(sTooltip);
			oButton.setIcon(sIcon);
			oButton.setIconHovered(sIconHovered);
		},
		getToolbarTitle: function(oToolbar) {
			// as no Title control as ToolbarItem exust just use Toolbar ID. (Let application point to the wanted control.)
			return oToolbar && oToolbar.getId();
		},
		createRenderingTitle: function(vTitle, sId, sDefaultLevel, sDefaultStyle) {
			return null; // in Commons render Title by Form
		},
		updateRenderingTitle: function(vTitle, oRenderingTitle, sDefaultLevel, sDefaultStyle) {
			return null; // in Commons render Title by Form
		}
	};

	/**
	 * Provides helper functions to create library dependent controls, like label, button, toolbar,
	 * used in {@link sap.ui.layout.form.Form Form}, {@link sap.ui.layout.form.FormContainer FormContainer}, {@link sap.ui.layout.form.FormElement FormElement},
	 * and {@link sap.ui.layout.form.SemanticFormElement SemanticFormElement}.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.119
	 * @alias sap.ui.layout.form.FormHelper
	 */
	const FormHelper = {
		init: function() { /* must return a Promise if modules still needs to be loaded. The promise must be fulfilled if everything is loaded. */
			// initially check the library. If found, overwrite functions
			if (Library.isLoaded("sap.m")) {
				merge(FormHelper, _MHelper);
				return this.init();
			}

			/**
			 * @deprecated as of version 1.38 sap.ui.commons is deprecated, so test should only be executed if still available
			 */
			if (Library.isLoaded("sap.ui.commons") && !Library.isLoaded("sap.m")) {
				merge(FormHelper, _CommonsHelper);
				return this.init();
			}

			return null;
		},
		createLabel: function(sText){ throw new Error("no Label control available!"); }, /* must return a Label control */
		createButton: function(sId, fPressFunction, oListener){ throw new Error("no Button control available!"); }, /* must return a button control */
		setButtonContent: function(oButton, sText, sTooltip, sIcon, sIconHovered){ throw new Error("no Button control available!"); },
		addFormClass: function(){ return null; },
		setToolbar: function(oToolbar, oOldToolbar){ return oToolbar; }, /* allow to overwrite toolbar settings */
		getToolbarTitle: function(oToolbar) { return oToolbar && oToolbar.getId(); }, /* To determine title ID in toolbar for aria-label */
		createDelimiter: function(sDelimiter, sId){ throw new Error("no delimiter control available!"); }, /* must return a kind of text control */
		createSemanticDisplayControl: function(sText, sId){ throw new Error("no display control available!"); }, /* must return a kind of text control */
		updateDelimiter: function(oDelimiter, sDelimiter){ throw new Error("no delimiter control available!"); },
		updateSemanticDisplayControl: function(oControl, sText){ throw new Error("no display control available!"); },
		isArrowKeySupported: function() { return true; }, /* enables the keyboard support for arrow keys */
		createRenderingTitle: function(vTitle, sId, sDefaultLevel, sDefaultStyle) { return null; }, /* per default use title rendering of FormLayout */
		updateRenderingTitle: function(vTitle, oRenderingTitle, sDefaultLevel, sDefaultStyle) { return null; } /* per default use title rendering of FormLayout */

	};

	return FormHelper;

}, /* bExport= */ false);
