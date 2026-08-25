/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/IconPool', 'sap/m/library', 'sap/ui/Device', 'sap/ui/core/library', 'sap/ui/core/Lib'], function(Renderer, IconPool, library, Device, coreLibrary, Library) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.SelectType
	var SelectType = library.SelectType;

	/**
	 * Select renderer.
	 * @namespace
	 */
	var SelectRenderer = {
		apiVersion: 2
	};

	/**
	 * CSS class to be applied to the HTML root element of the Select control.
	 *
	 * @type {string}
	 */
	SelectRenderer.CSS_CLASS = "sapMSlt";

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 */
	SelectRenderer.render = function(oRm, oSelect) {
		var	sType = oSelect.getType(),
			bAutoAdjustWidth = oSelect.getAutoAdjustWidth(),
			bEditable = oSelect.getEditable(),
			bEnabled = oSelect.getEnabled(),
			sCSSWidth = oSelect.getWidth(),
			bWidthPercentage = sCSSWidth.indexOf("%") > -1,
			bSelectWithFlexibleWidth = bAutoAdjustWidth || sCSSWidth === "auto" || bWidthPercentage,
			CSS_CLASS = SelectRenderer.CSS_CLASS,
			bEditableAndEnabled = bEnabled && bEditable;

		oRm.openStart("div", oSelect);
		this.addClass(oRm, oSelect);
		oRm.class(CSS_CLASS);
		oRm.class(CSS_CLASS + oSelect.getType());

		if (!bEnabled) {
			oRm.class(CSS_CLASS + "Disabled");
		} else if (!bEditable) {
			oRm.class(CSS_CLASS + "Readonly");
		}

		if (bSelectWithFlexibleWidth && (sType === SelectType.Default)) {
			oRm.class(CSS_CLASS + "MinWidth");
		}

		if (bAutoAdjustWidth) {
			oRm.class(CSS_CLASS + "AutoAdjustedWidth");
		} else {
			oRm.style("width", sCSSWidth);
		}

		if (oSelect.getIcon()) {
			oRm.class(CSS_CLASS + "WithIcon");
		}

		if (bEditableAndEnabled && Device.system.desktop) {
			oRm.class(CSS_CLASS + "Hoverable");
		}

		oRm.class(CSS_CLASS + "WithArrow");

		if (oSelect.getValueState() !== ValueState.None && bEditableAndEnabled) {
			this.addValueStateClasses(oRm, oSelect);
		}

		oRm.style("max-width", oSelect.getMaxWidth());

		if (bEnabled) {
			oRm.attr("tabindex", "-1");
		}

		oRm.openEnd();
		this.renderFocusElement(oRm, oSelect);
		// Used in case control is in a form submitted by input[type="submit"].
		// Attribute "value" is holding the selectedKey property value.
		this.renderHiddenInput(oRm, oSelect);
		this.renderLabel(oRm, oSelect);

		switch (sType) {
			case SelectType.Default:
				this.renderArrow(oRm, oSelect);
				break;

			case SelectType.IconOnly:
				this.renderIcon(oRm, oSelect);
				break;

			// no default
		}

		var oList = oSelect.getList();

		if (oSelect._isShadowListRequired() && oList) {
			this.renderShadowList(oRm, oList);
		}

		this.renderAccessibilityDomNodes(oRm, oSelect);
		oRm.close("div");
	};

	/**
	 * Renders the element, which receives the focus.
	 * This element is holding the selectedItem text property in its textContent and it's announced by InvisibleMessage when changed.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 * @private
	 */
	 SelectRenderer.renderFocusElement = function (oRm, oSelect) {
		if (!oSelect.getEnabled()) {
			// Do not render the focus element when the Select is disabled.
			// This ensures that when the Select becomes enabled, a new DOM node
			// is inserted (instead of patching the existing one), which forces
			// screen readers like JAWS to create a fresh virtual-buffer entry
			// and correctly announce the selected value.
			return;
		}

		var oSelectedItem = oSelect.getSelectedItem(),
			bIconOnly = oSelect.getType() === SelectType.IconOnly;

		oRm.openStart("div", oSelect.getId() + "-hiddenSelect");

		this.writeAccessibilityState(oRm, oSelect);

		// Classes
		oRm.class("sapUiPseudoInvisibleText");
		oRm.class(SelectRenderer.CSS_CLASS + "HiddenSelect");

		// Attributes
		oRm.attr("tabindex", "0");

		oRm.openEnd();

		if (oSelectedItem && !bIconOnly) {
			// if icon only mode, the control is announced as standard
			// button and the selected value is not rendered
			oRm.text(oSelectedItem.getText());
		} else if (bIconOnly) {
			// For IconOnly Select (role="button"), aria-activedescendant is not allowed.
			// Render the selected item text in a hidden span so it can be referenced via
			// aria-describedby, letting screen readers (e.g. JAWS) announce the current
			// selection when the button gets focus.
			oRm.openStart("span", oSelect.getId() + "-selectedText");
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
			if (oSelectedItem) {
				oRm.text(oSelectedItem.getText());
			}
			oRm.close("span");
		}

		oRm.close('div');
	};

	/**
	 * Renders the input element, which receives the name and value attributes. This is needed because when select is inside a form
	 * submitted by input[type="submit"] the attributes will be taken from this input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 * @private
	 */
	SelectRenderer.renderHiddenInput = function (oRm, oSelect) {
		oRm.voidStart("input", oSelect.getId() + "-hiddenInput");

		// Attributes
		oRm.attr("name", oSelect.getName());
		oRm.attr("value", oSelect.getSelectedKey());
		oRm.attr("aria-readonly", "true");
		oRm.attr("tabindex", "-1");
		oRm.attr("aria-hidden", "true");

		if (!oSelect.getEnabled()) {
			oRm.attr("disabled", "disabled");
		} else if (!oSelect.getEditable()) {
			oRm.attr("readonly", "readonly");
		}

		// Classes
		oRm.class("sapUiPseudoInvisibleText");

		oRm.voidEnd();
	};

	/**
	 * Renders the select's label, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 * @private
	 */
	SelectRenderer.renderLabel = function(oRm, oSelect) {
		var sTextDir = oSelect.getTextDirection(),
			sTextAlign = Renderer.getTextAlign(oSelect.getTextAlign(), sTextDir),
			CSS_CLASS = SelectRenderer.CSS_CLASS,
			bEditableAndEnabled = oSelect.getEnabled() && oSelect.getEditable();

		oRm.openStart("span", oSelect.getId() + "-label");
		oRm.attr("aria-hidden", true);
		oRm.class(CSS_CLASS + "Label");

		if (oSelect.getValueState() !== ValueState.None && bEditableAndEnabled) {
			oRm.class(CSS_CLASS + "LabelState");
			oRm.class(CSS_CLASS + "Label" + oSelect.getValueState());
		}

		if (oSelect.getType() === SelectType.IconOnly) {
			oRm.class("sapUiPseudoInvisibleText");
		}

		if (sTextDir !== TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}

		oRm.style("text-align", sTextAlign);

		oRm.openEnd();

		// write the text of the selected item only if it has not been removed or destroyed
		// and when the Select isn't in IconOnly mode - BCP 1780431688

		if (oSelect.getType() !== SelectType.IconOnly) {
			oRm.renderControl(oSelect._getValueIcon());
			oRm.openStart("span", oSelect.getId() + "-labelText");
			oRm.class("sapMSelectListItemText");
			oRm.openEnd();
			oRm.text(oSelect._getSelectedItemText());
			oRm.close("span");
		}
		oRm.close("span");
	};

	/**
	 * Renders the select's arrow, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 * @private
	 */
	SelectRenderer.renderArrow = function(oRm, oSelect) {
		var CSS_CLASS = SelectRenderer.CSS_CLASS;

		oRm.openStart("span", oSelect.getId() + "-arrow");
		oRm.attr("aria-hidden", true);
		oRm.class(CSS_CLASS + "Arrow");

		if (oSelect.getValueState() !== ValueState.None) {
			oRm.class(CSS_CLASS + "ArrowState");
		}

		oRm.openEnd().close("span");
	};

	/**
	 * Renders the select's icon, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {string} oSelect An object representation of the control that should be rendered.
	 * @private
	 */
	SelectRenderer.renderIcon = function(oRm, oSelect) {
		var sTooltip = oSelect.getTooltip_AsString(),
			oIconInfo = IconPool.getIconInfo(oSelect.getIcon()),
			sIconText = oIconInfo && oIconInfo.text;

		oRm.icon(oSelect.getIcon(), SelectRenderer.CSS_CLASS + "Icon", {
			id: oSelect.getId() + "-icon",
			title: sTooltip || sIconText || null
		});
	};

	/**
	 * Renders a shadow list control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.SelectList} oList An object representation of the list that should be rendered.
	 * @private
	 */
	SelectRenderer.renderShadowList = function(oRm, oList) {
		var oListRenderer = oList.getRenderer();
		oListRenderer.writeOpenListTag(oRm, oList, { elementData: false });
		this.renderShadowItems(oRm, oList);
		oListRenderer.writeCloseListTag(oRm, oList);
	};

	/**
	 * Renders shadow items for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oList An object representation of the select that should be rendered.
	 * @private
	 */
	SelectRenderer.renderShadowItems = function(oRm, oList) {
		var oListRenderer = oList.getRenderer(),
			aItems = oList.getSelectableItems(),
			iSize = aItems.length,
			oSelectedItem = oList.getSelectedItem();

		for (var i = 0; i < iSize; i++) {
			oListRenderer.renderItem(oRm, oList, aItems[i], {
				selected: oSelectedItem === aItems[i],
				setsize: iSize,
				posinset: i + 1,
				elementData: false // avoid duplicated IDs in the DOM when the select control is rendered inside a dialog
			});
		}
	};

	/**
	 * This method is reserved for derived class to add extra classes to the HTML root element of the control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 * @protected
	 */
	SelectRenderer.addClass = function(oRm, oSelect) {};

	/**
	 * Add the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 */
	SelectRenderer.addValueStateClasses = function(oRm, oSelect) {
		oRm.class(SelectRenderer.CSS_CLASS + "State");
		oRm.class(SelectRenderer.CSS_CLASS + oSelect.getValueState());
	};

	/**
	 * Gets accessibility role.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 * @protected
	 */
	SelectRenderer.getAriaRole = function(oSelect) {
		switch (oSelect.getType()) {
			case SelectType.Default:
				return "combobox";

			case SelectType.IconOnly:
				// While the picker is open the field exposes a combobox role so that
				// aria-activedescendant (pointing to the active option in the listbox
				// popup) is valid - it is not allowed on role="button". When closed it is
				// a plain icon button.
				return oSelect.isOpen() ? "combobox" : "button";

			// no default
		}
	};

	/**
	 * Writes the accessibility state.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
	 */
	SelectRenderer.writeAccessibilityState = function(oRm, oSelect) {
		var sValueState = oSelect.getValueState(),
			oSelectedItem = oSelect.getSelectedItem(),
			bIconOnly = oSelect.getType() === SelectType.IconOnly,
			oValueIcon = oSelect._getValueIcon(),
			bEditableAndEnabled = oSelect.getEnabled() && oSelect.getEditable(),
			aLabels = [],
			aAriaLabelledBy = [],
			oAriaLabelledBy,
			sAriaDescribedBy,
			sActiveDescendant,
			sDesc;

		oSelect.getLabels().forEach(function (oLabel) {
			if (oLabel && oLabel.getId) {
				aLabels.push(oLabel.getId());
			}
		});

		// note: for an IconOnly Select the field exposes a combobox role while open
		// (see getAriaRole), so aria-activedescendant is valid in that state.
		if (oSelect.isOpen() && oSelectedItem && oSelectedItem.getDomRef()) {
			sActiveDescendant = oSelectedItem.getId();
		}

		if (oSelectedItem && !oSelectedItem.getText() && oSelectedItem.getIcon && oSelectedItem.getIcon()) {
			var oIconInfo = IconPool.getIconInfo(oSelectedItem.getIcon());
			if (oIconInfo) {
				sDesc = oIconInfo.text || oIconInfo.name;
			}
		}

		if (sValueState !== ValueState.None && bEditableAndEnabled) {
			sAriaDescribedBy = oSelect.getValueStateMessageId() + "-sr";
		}

		var aGroupHeaders = SelectRenderer._getGroupHeaderItems(oSelect);
		if (aGroupHeaders.length > 0 && bEditableAndEnabled) {
			var sGroupDescId = oSelect.getId() + "-groupDesc";
			sAriaDescribedBy = sAriaDescribedBy ? sAriaDescribedBy + " " + sGroupDescId : sGroupDescId;
		}

		// For IconOnly Select (role="button"), the selected item text is rendered
		// inside a hidden span (see renderFocusElement). Reference it via
		// aria-describedby so screen readers announce the current selection on focus
		// and whenever the selection changes.
		if (bIconOnly) {
			sAriaDescribedBy = (sAriaDescribedBy ? sAriaDescribedBy + " " : "") + oSelect.getId() + "-selectedText";
		}

		if (sDesc && oValueIcon) {
			aAriaLabelledBy.push(oValueIcon.getId());
		}

		if (aLabels.length) {
			aAriaLabelledBy = aAriaLabelledBy.concat(aLabels);
		}

		oAriaLabelledBy = {
			value: aAriaLabelledBy.join(" "),
			append: true
		};

		oRm.accessibilityState(null, {
			role: this.getAriaRole(oSelect),
			roledescription: bIconOnly ? undefined : oSelect._sAriaRoleDescription,
			readonly: bIconOnly ? undefined : oSelect.getEnabled() && !oSelect.getEditable(),
			required: oSelect._isRequired() || undefined,
			disabled: !oSelect.getEnabled() || undefined,
			expanded: oSelect.isOpen(),
			invalid: (oSelect.getValueState() === ValueState.Error && bEditableAndEnabled) ? true : undefined,
			labelledby: (bIconOnly || oAriaLabelledBy.value === "") ? undefined : oAriaLabelledBy,
			describedby: sAriaDescribedBy,
			activedescendant: sActiveDescendant,
			haspopup: oSelect.getEditable() ? "listbox" : undefined
		});
	};

	/**
	 * Render value state accessibility DOM nodes for screen readers.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Select} oControl An object representation of the control that should be rendered.
	 */
	SelectRenderer.renderAccessibilityDomNodes = function (oRm, oControl) {
		var sValueState = oControl.getValueState(),
			sValueStateText,
			bEditableAndEnabled = oControl.getEnabled() && oControl.getEditable();

		if (sValueState !== ValueState.None && bEditableAndEnabled) {
			sValueStateText = oControl._getValueStateText();
			oRm.openStart("div", oControl.getValueStateMessageId() + "-sr")
				.class("sapUiPseudoInvisibleText")
				.attr("aria-hidden", true)
				.openEnd()
				.text(sValueStateText)
				.close("div");
		}

		if (bEditableAndEnabled) {
			var aGroupHeaders = SelectRenderer._getGroupHeaderItems(oControl);
			if (aGroupHeaders.length > 0) {
				var iSelectableCount = oControl.getSelectableItems().length;
				var sGroupDesc = Library.getResourceBundleFor("sap.m").getText(
					"SELECT_RESULTS_IN_GROUPS", [iSelectableCount, aGroupHeaders.length]);
				oRm.openStart("div", oControl.getId() + "-groupDesc")
					.class("sapUiPseudoInvisibleText")
					.openEnd()
					.text(sGroupDesc)
					.close("div");
			}
		}
	};

	SelectRenderer._getGroupHeaderItems = function(oSelect) {
		return oSelect.getItems().filter(function(oItem) {
			return oItem.isA("sap.ui.core.SeparatorItem") && oItem.getText();
		});
	};

	return SelectRenderer;
});