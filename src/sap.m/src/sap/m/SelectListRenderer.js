/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Element", "sap/ui/core/library", "sap/ui/core/IconPool", "sap/ui/Device", "sap/ui/core/Lib"],
	function(Element, coreLibrary, IconPool, Device, Library) {
		"use strict";

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		/**
		 * SelectList renderer.
		 *
		 * @namespace
		 */
		var SelectListRenderer = {
			apiVersion: 2
		};

		/**
		 * CSS class to be applied to the  root element of the SelectList.
		 *
		 * @readonly
		 * @const {string}
		 */
		SelectListRenderer.CSS_CLASS = "sapMSelectList";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.SelectList} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.render = function(oRm, oList) {
			this.writeOpenListTag(oRm, oList, { elementData: true });
			this.renderItems(oRm, oList);
			this.writeCloseListTag(oRm, oList);
		};

		SelectListRenderer.writeOpenListTag = function(oRm, oList, mStates) {
			var CSS_CLASS = SelectListRenderer.CSS_CLASS,
				tabIndex = oList.getProperty("_tabIndex");

			if (mStates.elementData) {
				oRm.openStart("ul", oList);
			} else {
				oRm.openStart("ul");
			}

			oRm.class(CSS_CLASS);

			if (oList.getShowSecondaryValues()) {
				oRm.class(CSS_CLASS + "TableLayout");
			}

			if (!oList.getEnabled()) {
				oRm.class(CSS_CLASS + "Disabled");
			}

			if (tabIndex) {
				oRm.attr("tabindex", tabIndex);
			}

			oRm.style("width", oList.getWidth());
			this.writeAccessibilityState(oRm, oList);
			oRm.openEnd();
		};

		SelectListRenderer.writeCloseListTag = function(oRm, oList) {
			oRm.close("ul");
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.SelectList} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.renderItems = function(oRm, oList) {
			var iSize = oList._getNonSeparatorItemsCount(),
				aItems = oList.getHideDisabledItems() ? oList.getEnabledItems() : oList.getItems(),
				oSelectedItem = oList.getSelectedItem(),
				iCurrentPosInSet = 1,
				oItemStates,
				bForceSelectedVisualState;

			var mGroupStates = SelectListRenderer._computeGroupStates(aItems);

			for (var i = 0; i < aItems.length; i++) {
				// should force selected state when there is no selected item for the
				// visual focus to be set on the first item when popover is opened
				bForceSelectedVisualState = i === 0 && !oSelectedItem;

				var oItem = aItems[i];
				oItemStates = {
					selected: oSelectedItem === oItem,
					setsize: iSize,
					elementData: true
				};

				if (oItem.isA("sap.ui.core.SeparatorItem") && oItem.getText()) {
					oItemStates.groupOwns = mGroupStates[oItem.getId()] ? mGroupStates[oItem.getId()].owns : [];
				} else if (!(oItem.isA("sap.ui.core.SeparatorItem")) && oItem.getEnabled()) {
					oItemStates.posinset = iCurrentPosInSet;
					iCurrentPosInSet++;
				}

				this.renderItem(oRm, oList, oItem, oItemStates, bForceSelectedVisualState);
			}
		};

		/**
		 * Pre-computes aria-owns lists for named group headers (SeparatorItems with text).
		 * Returns a map from group header ID to {owns: [itemId, ...]}.
		 *
		 * @param {sap.ui.core.Item[]} aItems
		 * @returns {Object} Map of group header IDs to {owns} arrays
		 * @private
		 */
		SelectListRenderer._computeGroupStates = function(aItems) {
			var mStates = {};
			var oCurrentGroup = null;

			aItems.forEach(function(oItem) {
				if (oItem.isA("sap.ui.core.SeparatorItem") && oItem.getText()) {
					oCurrentGroup = { owns: [] };
					mStates[oItem.getId()] = oCurrentGroup;
				} else if (!oItem.isA("sap.ui.core.SeparatorItem") && oCurrentGroup && oItem.getEnabled()) {
					oCurrentGroup.owns.push(oItem.getId());
				}
			});

			return mStates;
		};

		SelectListRenderer.renderDirAttr = function(oRm, sTextDir) {
			// check if textDirection property is not set to default "Inherit" and add "dir" attribute
			if (sTextDir !== TextDirection.Inherit) {
				oRm.attr("dir", sTextDir.toLowerCase());
			}
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.SelectList} oList An object representation of the control that should be rendered.
		 * @param {sap.ui.core.Element} oItem An object representation of the element that should be rendered.
		 * @param {object} mStates
		 * @param {boolean} bForceSelectedVisualState Forces the visual focus (selected state) to be se on the item.
		 */
		SelectListRenderer.renderItem = function(oRm, oList, oItem, mStates, bForceSelectedVisualState) {

			if (!(oItem instanceof Element)) {
				return;
			}

			var bEnabled = oItem.getEnabled(),
				oSelectedItem = oList.getSelectedItem(),
				CSS_CLASS = SelectListRenderer.CSS_CLASS,
				sTooltip = oItem.getTooltip_AsString(),
				sTextDir = oItem.getTextDirection(),
				bShowSecondaryValues = oList.getShowSecondaryValues(),
				bIsGroupHeader = oItem.isA("sap.ui.core.SeparatorItem") && oItem.getText(),
				oColumnsProportions;

			oRm.openStart("li", mStates.elementData ? oItem : null);

			if (!bShowSecondaryValues) {
				this.renderDirAttr(oRm, sTextDir);
			}

			if (oItem.getIcon && oItem.getIcon()) {
				oRm.class("sapMSelectListItemWithIcon");
			}

			if (bIsGroupHeader) {
				oRm.class(CSS_CLASS + "GroupItem");
			} else if (oItem.isA("sap.ui.core.SeparatorItem")) {
				oRm.class(CSS_CLASS + "SeparatorItem");

				if (bShowSecondaryValues) {
					oRm.class(CSS_CLASS + "Row");
				}
			} else {

				oRm.class(CSS_CLASS + "ItemBase");

				if (bShowSecondaryValues) {
					oRm.class(CSS_CLASS + "Row");
				} else {
					oRm.class(CSS_CLASS + "Item");
				}

				if (oItem.bVisible === false) {
					oRm.class(CSS_CLASS + "ItemBaseInvisible");
				}

				if (!bEnabled) {
					oRm.class(CSS_CLASS + "ItemBaseDisabled");
				}

				if (bEnabled && Device.system.desktop) {
					oRm.class(CSS_CLASS + "ItemBaseHoverable");
				}

				if (oItem === oSelectedItem || bForceSelectedVisualState) {
					oRm.class(CSS_CLASS + "ItemBaseSelected");
				}

				if (bEnabled) {
					oRm.attr("tabindex", "0");
				}
			}


			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}

			this.writeItemAccessibilityState.apply(this, arguments);

			oRm.openEnd();

			if (!bIsGroupHeader && bShowSecondaryValues) {
				oColumnsProportions = oList._getColumnsPercentages();

				oRm.openStart("span");
				oRm.class(CSS_CLASS + "Cell");
				oRm.class(CSS_CLASS + "FirstCell");
				if (oColumnsProportions) {
					oRm.style("width", oColumnsProportions.firstColumn);
				}
				oRm.attr("disabled", "disabled"); // fixes span obtaining focus in IE
				this.renderDirAttr(oRm, sTextDir);

				oRm.openEnd();

				this._renderIcon(oRm, oItem);

				oRm.text(oItem.getText());
				oRm.close("span");

				oRm.openStart("span");
				oRm.class(CSS_CLASS + "Cell");
				oRm.class(CSS_CLASS + "LastCell");
				if (oColumnsProportions) {
					oRm.style("width", oColumnsProportions.secondColumn);
				}
				oRm.attr("disabled", "disabled"); // fixes span obtaining focus in IE
				oRm.openEnd();

				if (typeof oItem.getAdditionalText === "function") {
					oRm.text(oItem.getAdditionalText());
				}

				oRm.close("span");
			} else if (bIsGroupHeader) {
				oRm.text(oItem.getText());
			} else {
				this._renderIcon(oRm, oItem);

				oRm.text(oItem.getText());
			}

			oRm.close("li");
		};

		/**
		 * Writes the accessibility state to the control's root element.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.SelectList} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.writeAccessibilityState = function(oRm, oList) {
			oRm.accessibilityState(oList, {
				role: "listbox"
			});
		};

		/**
		 * Writes the accessibility state to the item.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.SelectList} oList An object representation of the control that should be rendered.
		 * @param {sap.ui.core.Element} oItem An object representation of the element that should be rendered.
		 * @param {object} mStates
		 */
		SelectListRenderer.writeItemAccessibilityState = function(oRm, oList, oItem, mStates) {
			var bIsGroupHeader = oItem.isA("sap.ui.core.SeparatorItem") && oItem.getText();
			var sRole;

			if (bIsGroupHeader) {
				sRole = "group";
			} else if (oItem.isA("sap.ui.core.SeparatorItem")) {
				sRole = "separator";
			} else {
				sRole = "option";
			}

			var sDesc;

			if (!oItem.getText() && oItem.getIcon && oItem.getIcon()) {
				var oIconInfo = IconPool.getIconInfo(oItem.getIcon());
				if (oIconInfo) {
					sDesc = oIconInfo.text || oIconInfo.name;
				}
			}

			if (bIsGroupHeader) {
				var sGroupRoleDescription = Library.getResourceBundleFor("sap.m").getText("LIST_ITEM_GROUP_HEADER");
				oRm.accessibilityState(oItem, {
					role: sRole,
					label: oItem.getText(),
					roledescription: sGroupRoleDescription,
					owns: mStates.groupOwns && mStates.groupOwns.length ? mStates.groupOwns.join(" ") : undefined
				});
			} else {
				oRm.accessibilityState(oItem, {
					role: sRole,
					selected: mStates.selected,
					setsize: mStates.setsize,
					posinset: mStates.posinset,
					label: sDesc
				});
			}
		};

		SelectListRenderer._renderIcon = function(oRm, oItem) {
			if (oItem.getIcon && oItem.getIcon()) {
				oRm.icon(oItem.getIcon(), SelectListRenderer.CSS_CLASS + "ItemIcon", {
					id: oItem.getId() + "-icon"
				});
			}
		};

		return SelectListRenderer;

	}, /* bExport= */ true);