/*!
 * ${copyright}
 */

// Provides control sap.m.Title.
sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	"sap/ui/core/Element",
	'sap/ui/core/library',
	'./TitleRenderer',
	"sap/m/HyphenationSupport",
	'sap/ui/core/tooltip/TooltipEnablement',
	'sap/ui/core/ControlBehavior'
],
	function(Control, library, Element, coreLibrary, TitleRenderer, HyphenationSupport, TooltipEnablement, ControlBehavior) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.WrappingType
	var WrappingType = library.WrappingType;

	/**
	 * Constructor for a new Title control.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A simple, large-sized text with explicit header / title semantics.
	 *
	 * <h3>Overview</h3>
 	 * The <code>Title</code> control is a simple, large-sized text containing additional
 	 * semantic information for accessibility purposes.
	 *
	 * As of version 1.52, you can truncate or wrap long titles if the screen is narrower
	 * than the full title by using the with the use of the <code>wrapping</code>
	 * property.
	 *
	 * As of version 1.60, you can hyphenate the label's text with the use of the
	 * <code>wrappingType</code> property. For more information, see
	 * {@link topic:6322164936f047de941ec522b95d7b70 Text Controls Hyphenation}.
	 *
	 * As of version 1.87, you can set the <code>content</code> aggregation to use <code>sap.m.Link</code> or any control
	 * that implements <code>sap.ui.core.ITitleContent</code> interface. This control will be rendered instead of the text
	 * placed in <code>text</code> property. In this case the following properties of <code>sap.m.Title</code> control
	 * are overridden: <code>text</code>, <code>textAlign</code>, <code>textDirection</code>, or not used: <code>wrapping</code>,
	 * <code>wrappingType</code>. The <code>title</code> association will be ignored too.
	 *
	 * If the <code>title</code> association is used, <code>text</code>, <code>level</code> and <code>tooltip</code> properties
	 * will override the corresponding properties of the <code>sap.m.Title</code> control.
	 *
 	 * <h3>Usage</h3>
 	 * <h4>When to use</h4>
	 * <ul>
	 * <li>If you want to set the title above a table or form.</li>
	 * <li>If you want to show text in the page header.</li>
	 * </ul>
	 * <h4>When not to use</h4>
	 * <ul>
	 * <li>If the text is inside a text block.</li>
	 * <li>If The text is inside a form element.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.ITitle, sap.ui.core.IShrinkable
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.27.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Title
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/title/ Title}
	 */
	var Title = Control.extend("sap.m.Title", /** @lends sap.m.Title.prototype */ {
		metadata : {

			library : "sap.m",
			interfaces : [
				"sap.ui.core.ITitle",
				"sap.ui.core.IShrinkable",
				"sap.m.IHyphenation",
				"sap.m.IToolbarInteractiveControl"
			],
			properties : {

				/**
				 * Defines the text that should be displayed as a title.
				 *
				 * <b>Note:</b> this property is not used if there is a control added to the <code>content</code> aggregation
				 * <b>Note:</b> this property will be overridden if there is title element associated and it has <code>text</code> property set.
				 *
				 */
				text : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Defines the semantic level of the title.
				 * This information is e.g. used by assistive technologies like screenreaders to create a hierarchical site map for faster navigation.
				 * Depending on this setting either an HTML h1-h6 element is used or when using level <code>Auto</code> no explicit level information is written (HTML5 header element).
				 * This property does not influence the style of the control. Use the property <code>titleStyle</code> for this purpose instead.
				 *
				 * <b>Note:</b> this property will be overridden if there is title element associated and it has <code>level</code> property set.
				 */
				level : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto},

				/**
				 * Defines the style of the title.
				 * When using the <code>Auto</code> styling, the appearance of the title depends on the current position of the title (e.g. inside a <code>Toolbar</code>).
				 * This default behavior can be overridden by setting a different style explicitly.
				 * The actual appearance of the title and the different styles always depends on the theme being used.
				 */
				titleStyle : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto},

				/**
				 * Defines the width of the title.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

				/**
				 * Defines the alignment of the text within the title. <b>Note:</b> This property only has an effect if the overall width of the title control is
				 * larger than the displayed text.
				 *
				 * <b>Note:</b> this property will be overridden if there is a control added to the <code>content</code> aggregation
				 *
				 */
				textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Initial},

				/**
				 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
				 *
				 * <b>Note:</b> this property will be overridden if there is a control added to the <code>content</code> aggregation
				 *
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Enables text wrapping.
				 *
				 * <b>Note:</b> Wrapping must only be activated if the surrounding container allows flexible heights.
				 * <b>Note:</b> this property will be ignored if there is a control added to the <code>content</code> aggregation
				 *
				 * @since 1.52
				 */
				wrapping : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * Defines the type of text wrapping to be used (hyphenated or normal).
				 *
				 * <b>Note:</b> This property takes effect only when the <code>wrapping</code>
				 * property is set to <code>true</code>.
				 * <b>Note:</b> this property will be ignored if there is a control added to the <code>content</code> aggregation
				 *
				 * @since 1.60
				 */
				wrappingType : {type: "sap.m.WrappingType", group : "Appearance", defaultValue : WrappingType.Normal}

			},
			defaultAggregation : "content",
			aggregations : {
				/**
				 * Holds a control that implements <code>sap.ui.core.ITitleContent</code> and renders this control instead of simple text
				 *
				 * <b>Note:</b> if a control is placed in this aggregation, the following properties of <code>sap.m.Title</code>
				 * will be overridden - <code>text</code>, <code>textAlign</code>, <code>textDirection</code>; the following will be ignored -
				 * <code>wrapping</code>, <code>wrappingType</code>. The <code>title</code> association will be ignored too.
				 *
				 * @since 1.87
				 */
				content : {type : "sap.ui.core.ITitleContent", multiple : false}
			},
			associations : {

				/**
				 * Defines a relationship to a generic title description.
				 *
				 * <b>Note:</b> if a control is placed in <code>content</code> aggregation, the title element associated will be ignored;
				 * otherwise the properties <code>text</code>, <code>level</code> and </code>tooltip</code> (text only) of this element
				 * will override the corresponding properties of the <code>Title</code> control.
				 */
				title : {type : "sap.ui.core.Title", multiple : false}
			},
			designtime: "sap/m/designtime/Title.designtime"

		},

		renderer: TitleRenderer
	});

	/**
	 * Returns the DOM element to use for tooltip positioning.
	 *
	 * This method is called ONLY on user interaction (hover/focus).
	 * It performs DOM measurements to determine the optimal anchor element:
	 * - If text is truncated: returns outer element (tooltip spans full width)
	 * - If text is not truncated: returns inner element (tooltip aligns with text)
	 *
	 * This lazy evaluation ensures no layout thrashing during batch rendering of multiple titles.
	 * The method is invoked via TooltipEnablement's domRefProvider callback when the tooltip opens.
	 *
	 * @returns {HTMLElement|null} The DOM element for tooltip positioning
	 * @private
	 */
	Title.prototype._getTooltipAnchorElement = function() {
		const oOuterDomRef = this.getDomRef();
		const oInnerDomRef = this.getDomRef("inner");

		if (!oOuterDomRef || !oInnerDomRef) {
			return oOuterDomRef || oInnerDomRef || null;
		}

		if (oOuterDomRef.scrollWidth > oOuterDomRef.clientWidth) {
			return oOuterDomRef;
		}

		return oInnerDomRef;
	};

	/**
	 * Initializes the Title control.
	 * Sets up TooltipEnablement for Enhanced Tooltip support.
	 *
	 * @private
	 */
	Title.prototype.init = function() {
		if (TooltipEnablement.isEnhancedTooltipEnabled()) {
			this._oTooltipEnablement = new TooltipEnablement(this, {
				textProvider: this._getEnhancedTooltipText.bind(this),
				invisibleTextProvider: this._getTooltipText.bind(this),
				domRefProvider: this._getTooltipAnchorElement.bind(this),
				focusDomRefProvider: () => this.getDomRef()
			});
		}

		this._fnExtendedKeyboardNavigationChanged = this._onExtendedKeyboardNavigationChanged.bind(this);
		ControlBehavior.attachExtendedKeyboardNavigationChanged(
			this._fnExtendedKeyboardNavigationChanged
		);
	};

	/**
	 * Cleans up before the Title control is destroyed.
	 *
	 * @private
	 */
	Title.prototype.exit = function() {
		if (this._oTooltipEnablement) {
			this._oTooltipEnablement.destroy();
			this._oTooltipEnablement = null;
		}

		if (this._fnExtendedKeyboardNavigationChanged) {
			ControlBehavior.detachExtendedKeyboardNavigationChanged(
				this._fnExtendedKeyboardNavigationChanged
			);
			this._fnExtendedKeyboardNavigationChanged = null;
		}

		if (this._iUpdateTabIndexDelayedCallId) {
			clearTimeout(this._iUpdateTabIndexDelayedCallId);
			this._iUpdateTabIndexDelayedCallId = null;
		}
	};

	/**
	 * Gets the currently set title.
	 *
	 * @private
	 * @returns {sap.ui.core.Title} Instance of the associated sap.ui.core.Title if exists.
	 */
	Title.prototype._getTitle = function(){
		var sTitle = this.getTitle();

		if (sTitle) {
			var oTitle = Element.getElementById(sTitle);
			if (oTitle && oTitle.isA("sap.ui.core.Title")) {
				return oTitle;
			}
		}

		return null;
	};

	/**
	 * Title on change handler.
	 *
	 * @private
	 */
	Title.prototype._onTitleChanged = function(){
		this.invalidate();
	};

	/**
	 * Sets the title for a <code>sap.m.Title</code> or <code>sap.ui.core.Title</code>
	 *
	 * @public
	 * @param {sap.m.Title|sap.ui.core.Title} vTitle Given variant of a title which can be <code>sap.m.Title</code> or <code>sap.ui.core.Title</code>.
	 * @returns {this} this Title reference for chaining.
	 */
	Title.prototype.setTitle = function(vTitle){
		var that = this;

		var oOldTitle = this._getTitle();
		if (oOldTitle) {
			oOldTitle.invalidate = oOldTitle.__sapui5_title_originvalidate;
			oOldTitle.exit = oOldTitle.__sapui5_title_origexit;
			delete oOldTitle.__sapui5_title_origexit;
			delete oOldTitle.__sapui5_title_originvalidate;
		}

		this.setAssociation("title", vTitle);

		var oNewTitle = this._getTitle();
		if (oNewTitle) {
			oNewTitle.__sapui5_title_originvalidate = oNewTitle.invalidate;
			oNewTitle.__sapui5_title_origexit = oNewTitle.exit;
			oNewTitle.exit = function() {
				that._onTitleChanged();
				if (this.__sapui5_title_origexit) {
					this.__sapui5_title_origexit.apply(this, arguments);
				}
			};
			oNewTitle.invalidate = function() {
				that._onTitleChanged();
				this.__sapui5_title_originvalidate.apply(this, arguments);
			};
		}

		return this;
	};

	/**
	 * Gets the accessibility information for the <code>sap.m.Title</code> control.
	 *
	 * @returns {sap.ui.core.AccessibilityInfo} The accessibility info
	 * @protected
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	Title.prototype.getAccessibilityInfo = function() {
		var oTitle = this._getTitle() || this;
		return {
			role: "heading",
			description: oTitle.getText(),
			focusable: false
		};
	};

	/**
	 * Gets a map of texts which should be hyphenated.
	 *
	 * @private
	 * @returns {Object<string,string>} The texts to be hyphenated.
	 */
	Title.prototype.getTextsToBeHyphenated = function () {
		var oTitleAssociation = this._getTitle();
		return {
			"main": oTitleAssociation ? oTitleAssociation.getText() : this.getText()
		};
	};

	/**
	 * Gets the DOM refs where the hyphenated texts should be placed.
	 *
	 * @private
	 * @returns {map|null} The elements in which the hyphenated texts should be placed
	 */
	Title.prototype.getDomRefsForHyphenatedTexts = function () {
		var oDomRefs;
		if (!this._getTitle()) {
			oDomRefs = {
				"main": this.getDomRef("inner")
			};
		}
		return oDomRefs;
	};

	/**
	 * Turns property <code>titleStyle</code> to aria level. If it is not set, the default level is 2.
	 * @private
	 * @returns {int} The aria level.
	 */
	Title.prototype._getAriaLevel = function () {
		var iLevel = 2,
			LEVEL_POSITION = 1;

		if (this.getTitleStyle() !== TitleLevel.Auto) {
			iLevel = parseInt(this.getTitleStyle()[LEVEL_POSITION]);
		}

		return iLevel;
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolbar, sap.m.Toolbar
	 */
	Title.prototype._getToolbarInteractive = function () {
		return false;
	};

	/**
	 * Returns the visible tooltip text for Enhanced Tooltips.
	 *
	 * @returns {string} The tooltip text or empty string
	 * @private
	 */
	Title.prototype._getEnhancedTooltipText = function() {
		const sExplicitTooltip = this._getTooltipText();
		if (sExplicitTooltip) {
			return sExplicitTooltip;
		}

		if (this._isTextTruncated()) {
			const oAssociatedTitle = this._getTitle();
			return oAssociatedTitle && !this.getContent() ? oAssociatedTitle.getText() : this.getText();
		}

		return "";
	};

	/**
	 * Checks if the Title text is truncated in the DOM.
	 *
	 * @returns {boolean} True if text is truncated
	 * @private
	 */
	Title.prototype._isTextTruncated = function() {
		const oDomRef = this.getDomRef();
		if (!oDomRef) {
			return false;
		}

		return oDomRef.scrollWidth > oDomRef.clientWidth;
	};

	/**
	 * Handles Extended Keyboard Navigation mode changes.
	 *
	 * @private
	 */
	Title.prototype._onExtendedKeyboardNavigationChanged = function() {
		this.invalidate();
	};

	/**
	 * Determines if Title should be focusable in current state.
	 * Returns true if there's an explicit tooltip set or if text is truncated.
	 *
	 * @returns {boolean} True if Title should receive tabindex="0"
	 * @private
	 */
	Title.prototype._shouldBeFocusable = function() {
		if (!ControlBehavior.isExtendedKeyboardNavigationEnabled()) {
			return false;
		}

		if (this.getContent()) {
			return false;
		}

		if (!this._oTooltipEnablement) {
			return false;
		}

		const sExplicitTooltip = this._getTooltipText();
		if (sExplicitTooltip) {
			return true;
		}

		if (this._isTextTruncated()) {
			return true;
		}

		return false;
	};

	/**
	 * Updates the tabindex attribute based on focusability.
	 * Uses delayed execution to batch DOM reads and avoid layout thrashing.
	 * Called after rendering when Extended Keyboard Navigation mode is enabled.
	 *
	 * @private
	 */
	Title.prototype._updateTabIndex = function() {
		if (this._iUpdateTabIndexDelayedCallId) {
			clearTimeout(this._iUpdateTabIndexDelayedCallId);
			this._iUpdateTabIndexDelayedCallId = null;
		}

		this._iUpdateTabIndexDelayedCallId = setTimeout(() => {
			this._iUpdateTabIndexDelayedCallId = null;

			const oDomRef = this.getDomRef();
			if (!oDomRef) {
				return;
			}

			if (this._shouldBeFocusable()) {
				oDomRef.setAttribute("tabindex", "0");
			} else {
				oDomRef.removeAttribute("tabindex");
			}
		}, 0);
	};

	/**
	 * Called after the Title control is rendered.
	 *
	 * @private
	 */
	Title.prototype.onAfterRendering = function() {
		if (ControlBehavior.isExtendedKeyboardNavigationEnabled() && this._oTooltipEnablement) {
			this._updateTabIndex();
		}
	};

	/**
	* Get tooltip text
	* @returns {string} Tooltip text
	* @private
	*/
	Title.prototype._getTooltipText = function () {
		const oAssoTitle = this._getTitle();
		return oAssoTitle && !this.getContent() ? oAssoTitle.getTooltip_AsString() : this.getTooltip_AsString();
	};

	/**
	* Handle the mouseover event
	* @param {jQuery.Event} oEvent The event that occurred in the callout
	* @private
	*/
	Title.prototype.onmouseover = function (oEvent) {
		if (this._oTooltipEnablement) {
			return;
		}

		const oTarget = this.getDomRef();

		if (!oTarget || oTarget.offsetWidth >= oTarget.scrollWidth) {
			return;
		}

		const sTooltip = this._getTooltipText();
		let sText = this.getText();

		if (sTooltip) {
			sText += " - " + sTooltip;
		}

		oTarget.setAttribute("title", sText);
	};

	/**
	* Handle the onmouseout event
	* @param {jQuery.Event} oEvent The event that occurred in the callout
	* @private
	*/
	Title.prototype.onmouseout = function (oEvent) {
		if (this._oTooltipEnablement) {
			return;
		}

		const oTarget = this.getDomRef();
		const sTooltip = this._getTooltipText();

		if (!oTarget) {
			return;
		}

		if (sTooltip) {
			oTarget.setAttribute("title", sTooltip);
		} else {
			oTarget.removeAttribute("title");
		}
	};

	// Add hyphenation to Title functionality
	HyphenationSupport.mixInto(Title.prototype);

	return Title;

});
