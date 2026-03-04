/*!
 * ${copyright}
 */

// Provides helper sap.m.TitlePropagationSupport
sap.ui.define(["sap/ui/core/ControlBehavior"],
	function(ControlBehavior) {
		"use strict";

		/**
		 * This function can be used by a control developer to explicitly enrich the API of his/her element
		 * implementation with the API functions for the title propagation support. It must be called on the prototype
		 * of the element.
		 *
		 * <b>Usage Example:</b>
		 * <pre>
		 * sap.ui.define(['sap/ui/core/Element', 'sap/m/TitlePropagationSupport'], function(Element, TitlePropagationSupport) {
		 *    "use strict";
		 *    var MyElement = Element.extend("my.MyElement", {
		 *       metadata : {
		 *          aggregations: {
		 *              content: {...
		 *          }
		 *          //...
		 *       },
		 *       init: function () {
		 *          Element.prototype.init.call(this, arguments);
		 *          this._addTitlePropagationSupportDelegate(); // Here the delegate is added
		 *       },
		 *       //...
		 *    });
		 *
		 *    TitlePropagationSupport.call(MyElement.prototype, "content", function () {return this.getId() + "-title";});
		 *
		 *    return MyElement;
		 * }, true);
		 * </pre>
		 *
		 * This function adds the following private functions to the elements prototype:
		 * <ul>
		 * <li><code>_addTitlePropagationSupportDelegate</code></li>
		 * <li><code>_propagateTitleIdToChildControl</code></li>
		 * </ul>
		 *
		 * And adds a delegate which will be called <code>onBeforeRendering</code> of the enriched element to propagate
		 * the title ID
		 *
		 * <b>Note:</b> This function can only be used <i>within</i> control development. An application cannot add
		 * style class support on existing elements by calling this function.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @param {string} sAggregationName the name of the aggregation which should be affected
		 * @param {function} fnGetTitleInfo function that returns the title ID as a string,
		 *   or an object <code>{ id: string, role?: string }</code> containing the title ID and optionally the ARIA role
		 *   of the title's container
		 *
		 * @private
		 * @alias sap.m.TitlePropagationSupport
		 * @function
		 */
		return function (sAggregationName, fnGetTitleInfo) {
			// "this" is the prototype now when called with call()

			// Ensure only Elements are enhanced
			if (!this.isA("sap.ui.core.Element")) {
				return;
			}

			/**
			 * Method used to propagate the title control ID to the first control in the content aggregation
			 * if the control is of a specific type and has implemented the suggest method
			 * @private
			 * @return {boolean} if the ID is successfully propagated
			 */
			this._propagateTitleIdToChildControl = function () {

				var oAggregation = this.getMetadata().getAggregation(sAggregationName),
					aContent = oAggregation && oAggregation.get(this),
					vTitleInfo = fnGetTitleInfo && fnGetTitleInfo.call(this),
					oTitleData,
					oItem;

				// Note: in case accessibility mode is off we don't need the propagation
				if (!ControlBehavior.isAccessibilityEnabled() || !vTitleInfo || !aContent
					|| aContent.length === 0) {
						return false;
				}

				// Normalize: string -> { id: string }, object stays as-is
				if (typeof vTitleInfo === "string") {
					oTitleData = { id: vTitleInfo };
				} else if (vTitleInfo.id) {
					oTitleData = vTitleInfo;
				} else {
					return false;
				}

				// Propagate title ID only to first control in the content
				oItem = aContent[0];
				if (oItem && oItem._suggestTitleId && oItem.isA([
					"sap.ui.layout.form.SimpleForm",
					"sap.ui.layout.form.Form",
					"sap.ui.comp.smartform.SmartForm"])) {
						oItem._suggestTitleId(oTitleData);
						return true;
				}
				return false;
			};

			/**
			 * Method should be called from the enriched control init method for the event delegate to be successfully
			 * added
			 * @private
			 */
			this._initTitlePropagationSupport = function () {
				this.addEventDelegate({
					onBeforeRendering: this._propagateTitleIdToChildControl.bind(this)
				});
			};

		};

	});