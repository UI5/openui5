/*!
 * ${copyright}
 */

// Provides default renderer for HTML elements
sap.ui.define([
	"../Element",
	"../Control",
	"sap/base/strings/hyphenate"
],
function(Element, Control, hyphenate) {
	"use strict";

	/**
	 * HTMLElement renderer.
	 *
	 * @namespace
	 * @alias sap.ui.core.html.HTMLElementRenderer
	 * @since 1.154.0
	 * @static
	 */
	const HTMLElementRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement an object representation of the control that should be rendered
	 */
	HTMLElementRenderer.render = function(oRm, oHTMLElement){
		const sTag = oHTMLElement.getMetadata().getTag();
		const isVoid = oHTMLElement.getMetadata().isVoid();

		// choose correct APIs depending on if the tag is a void element
		const renderStartAPI = isVoid ? "voidStart" : "openStart";
		const renderEndAPI = isVoid ? "voidEnd" : "openEnd";

		// Opening tag
		oRm[renderStartAPI](sTag, oHTMLElement);

		// Properties with mapping="property"
		this.renderAttributeProperties(oRm, oHTMLElement);
		// Properties with mapping="style"
		this.renderStyleProperties(oRm, oHTMLElement);
		// Properties, managed by associations
		this.renderAssociationProperties(oRm, oHTMLElement);
		// Tooltip aggregation
		this.renderTooltipAggregation(oRm, oHTMLElement);
		// Hook for customization
		this.customRenderInOpeningTag(oRm, oHTMLElement);
		// Attributes/Styles that the component sets internally
		this.preserveUnmanagedAttributes(oRm, oHTMLElement);
		// Styles that the component sets internally
		this.preserveUnmanagedStyles(oRm, oHTMLElement);

		oRm[renderEndAPI]();

		// void elements do not have additional content
		if (!isVoid) {
			// Properties with mapping="textContent"
			this.renderTextContentProperties(oRm, oHTMLElement);
			// Properties with mapping="slot"
			this.renderSlotProperties(oRm, oHTMLElement);
			// Aggregations
			this.renderAggregations(oRm, oHTMLElement);
			// Hook for customization (additional children)
			this.customRenderInsideTag(oRm, oHTMLElement);

			// Closing custom element tag
			oRm.close(sTag);
		}
	};

	/**
	 * Renders attributes, based on the control's properties
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.renderAttributeProperties = function(oRm, oHTMLElement) {
		const oAttrProperties = oHTMLElement.getMetadata().getPropertiesByMapping("property");

		const aPropsToAlwaysSet = ["enabled"].concat(Object.entries(oHTMLElement.getMetadata().getPropertyDefaults()).map(([key, value]) => {
			return value !== undefined && value !== false ? key : null;
		})); // some properties can be initial and still have a non-default value due to side effects (e.g. EnabledPropagator)

		for (const sPropName in oAttrProperties) {
			const oPropData = oAttrProperties[sPropName];

			// "rel" is handled unconditionally after the loop: it must be augmented with "noopener"
			// when "target" opens a new browsing context, even if the author never set "rel"
			// (a formatter/loop entry would be skipped for an unset property). See _relForTarget.
			if (sPropName === "rel") {
				continue;
			}

			if (oHTMLElement.isPropertyInitial(sPropName) && !aPropsToAlwaysSet.includes(sPropName)) {
				continue; // do not set attributes for properties that were not explicitly set or bound
			}

			let vPropValue = oPropData.get(oHTMLElement);
			if (oPropData.type === "object" || typeof vPropValue === "object") {
				continue; // Properties of type "object" and custom-type properties with object values are set during onAfterRendering
			}

			const sAttrName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
			if (oPropData._fnMappingFormatter) {
				vPropValue = oHTMLElement[oPropData._fnMappingFormatter].call(oHTMLElement, vPropValue);
			}

			if (oPropData.type === "boolean") {
				if (vPropValue) {
					oRm.attr(sAttrName, "");
				}
			} else {
				if (vPropValue != null) {
					oRm.attr(sAttrName, vPropValue);
				}
			}
		}

		// Reverse-tabnabbing defense for <a>/<area>: emit the effective "rel" (author tokens plus
		// "noopener" when "target" opens a new browsing context). Handled here rather than via a
		// property formatter so it also applies when the author did not set "rel" at all.
		if (oAttrProperties["rel"]) {
			const sRel = oHTMLElement._relForTarget(oHTMLElement.getProperty("rel"));
			if (sRel) {
				oRm.attr("rel", sRel);
			}
		}
	};

	/**
	 * Preserves attributes that the component set on itself internally (such as private attributes and the attribute that mimics the tag, e.g. "ui5-button")
	 * This is necessary as otherwise Patcher.js will remove them upon each re-rendering
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.preserveUnmanagedAttributes = function(oRm, oHTMLElement) {
		const oDomRef = oHTMLElement.getDomRef();
		if (!oDomRef) {
			return; // First rendering - the unmanaged attributes haven't been set yet
		}

		const aAttributes = oDomRef.getAttributeNames();
		const aSkipList = ["id", "data-sap-ui", "style", "class", "__is-busy"];
		aAttributes.forEach((sAttr) => {
			if (aSkipList.includes(sAttr)) {
				return; // Skip attributes, set by the framework
			}

			if (oHTMLElement.getMetadata().isManagedAttribute(sAttr)) {
				return;
			}

			const sValue = oDomRef.getAttribute(sAttr); // Repeat the value from DOM
			if (sValue !== null) {
				oRm.attr(sAttr, sValue);
			}
		});
	};

	/**
	 * Preserves styles that the component set on itself internally (such as position top, left and CSS Variables)
	 * This is necessary as otherwise Patcher.js will remove them upon each re-rendering
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.preserveUnmanagedStyles = function(oRm, oHTMLElement) {
		const oDomRef = oHTMLElement.getDomRef();
		if (!oDomRef) {
			return; // First rendering - the unmanaged styles haven't been set yet
		}
		const aSetStyles = Array.prototype.slice.apply(oDomRef.style);
		if (aSetStyles.length === 0) {
			return; // No styles set at all
		}

		const oStyleProperties = oHTMLElement.getMetadata().getPropertiesByMapping("style");
		const aManagedStyles = [];
		for (const sPropName in oStyleProperties) {
			const oPropData = oStyleProperties[sPropName];
			const sStyleName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
			aManagedStyles.push(sStyleName);
		}

		aSetStyles.forEach((sStyle) => {
			if (aManagedStyles.includes(sStyle)) {
				return; // Do not preserve any managed styles
			}
			const sValue = sStyle.startsWith("--") ? window.getComputedStyle(oDomRef).getPropertyValue(sStyle) : oDomRef.style[sStyle]; // CSS Values can only be read from getComputedStyle
			oRm.style(sStyle, sValue);
		});
	};

	/**
	 * Renders styles, based on the control's properties
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.renderStyleProperties = function(oRm, oHTMLElement) {
		const oStyleProperties = oHTMLElement.getMetadata().getPropertiesByMapping("style");
		for (const sPropName in oStyleProperties) {
			const oPropData = oStyleProperties[sPropName];
			const sStyleName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
			let vPropValue = oPropData.get(oHTMLElement);
			if (oPropData._fnMappingFormatter) {
				vPropValue = oHTMLElement[oPropData._fnMappingFormatter].call(oHTMLElement, vPropValue);
			}

			if (vPropValue != null) {
				oRm.style(sStyleName, vPropValue);
			}
		}
	};

	/**
	 * Renders properties, controlled by associations
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.renderAssociationProperties = function(oRm, oHTMLElement) {
		const oAssociations = oHTMLElement.getMetadata().getAssociationsWithMapping();
		for (const sAssocName in oAssociations) {
			const oAssocData = oAssociations[sAssocName];
			let vAssocValue = oAssocData.get(oHTMLElement);
			const sAttrName = hyphenate(oAssocData._sMapTo); // The name of the attribute to be set with the association's ID value
			if (oAssocData._fnMappingFormatter) {
				vAssocValue = oHTMLElement[oAssocData._fnMappingFormatter].call(oHTMLElement, vAssocValue);
			}

			if (!oAssocData.multiple && vAssocValue && typeof vAssocValue === "object") {
				vAssocValue = vAssocValue.getId(); // The value will be the control ID, held by the association
			}

			if (vAssocValue) { // Only set the property, if the association is set
				oRm.attr(sAttrName, vAssocValue);
			}
		}
	};

	/**
	 * Transforms the tooltip aggregation to a tooltip attribute - components that support this attribute will use it
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.renderTooltipAggregation = function(oRm, oHTMLElement) {
		const sTooltipText = oHTMLElement.getTooltip_Text();
		if (sTooltipText) {
			oRm.attr("tooltip", sTooltipText);
		}
	};

	/**
	 * Renders text inside the component, if it has a property of type textContent
	 * Normally a single property of this type is expected (such as button text), but if more than one are set, they are all rendered
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.renderTextContentProperties = function(oRm, oHTMLElement) {
		const oTextContentProperties = oHTMLElement.getMetadata().getPropertiesByMapping("textContent");
		for (const sPropName in oTextContentProperties) {
			const oPropData = oTextContentProperties[sPropName];
			let vPropValue = oPropData.get(oHTMLElement);
			if (oPropData._fnMappingFormatter) {
				vPropValue = oHTMLElement[oPropData._fnMappingFormatter].call(oHTMLElement, vPropValue);
			}

			if (vPropValue != null) {
				oRm.text(vPropValue);
			}
		}
	};

	/**
	 * Renders properties as slotted text inside a div/span or another tag
	 * This is mostly useful for value state message as Web Components get the value state message as slotted text
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.renderSlotProperties = function(oRm, oHTMLElement) {
		const oSlotProperties = oHTMLElement.getMetadata().getPropertiesByMapping("slot");
		for (const sPropName in oSlotProperties) {
			const oPropData = oSlotProperties[sPropName];
			let vPropValue = oPropData.get(oHTMLElement);
			if (oPropData._fnMappingFormatter) {
				vPropValue = oHTMLElement[oPropData._fnMappingFormatter].call(oHTMLElement, vPropValue);
			}
			// WebComponentMetadata defines the render output, e.g. { mapping: { slotName: "valueStateMessage", to: "div", ... } }
			const sTag = oPropData._sMapTo ? oPropData._sMapTo : "span";
			const sSlotName = oPropData._sSlotName || sPropName;

			if (vPropValue) {
				oRm.openStart(sTag);
				oRm.attr("slot", sSlotName);
				oRm.openEnd();
				oRm.text(vPropValue);
				oRm.close(sTag);
			}
		}
	};

	/**
	 * Render children.
	 * Note: for each child, RenderManager.js will set the "slot" attribute automatically
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.renderAggregations = function(oRm, oHTMLElement) {
		const oAggregations = oHTMLElement.getMetadata().getAllAggregations();
		const oBaseAggregations = Control.getMetadata().getAllAggregations();
		for (const sAggName in oAggregations) {
			if (Object.hasOwn(oBaseAggregations, sAggName)) {
				continue; // Skip aggregations derived from Element.js / Control.js such as dependents and layoutData
			}

			const aggData = oAggregations[sAggName];
			const aggValue = aggData.get(oHTMLElement);

			if (aggData.multiple) {
				aggValue.forEach((oChild) => this.renderChild(oRm, oChild));
			} else if (aggValue) {
				this.renderChild(oRm, aggValue);
			}
		}
	};

	/**
	 * Renders a single aggregated child control.
	 *
	 * A sap.ui.core.html.TextContent child is rendered as native text content,
	 * so it does not introduce a wrapper element in the DOM.
	 * Any other control is rendered normally.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.Control} oChild the aggregated child control
	 */
	HTMLElementRenderer.renderChild = function(oRm, oChild) {
		if (oChild.isA("sap.ui.core.html.TextContent")) {
			oRm.text(oChild.getText());
		} else {
			oRm.renderControl(oChild);
		}
	};

	/**
	 * Hook. For future use.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.customRenderInOpeningTag = function(oRm, oHTMLElement) {};

	/**
	 * Hook. For future use.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager
	 * @param {sap.ui.core.html.HTMLElement} oHTMLElement instance of an HTML control
	 */
	HTMLElementRenderer.customRenderInsideTag = function(oRm, oHTMLElement) {};

	return HTMLElementRenderer;

});
