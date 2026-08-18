sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/plugins/PluginBase",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/ui/core/UIArea",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/merge",
	"sap/base/i18n/Localization",
	// provides jQuery.fn.scrollLeftRTL
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(
	Table,
	TreeTable,
	AnalyticalTable,
	Column,
	RowAction,
	RowActionItem,
	PluginBase,
	SelectionPlugin,
	TableUtils,
	JSONModel,
	Control,
	CoreLibrary,
	UIArea,
	Device,
	jQuery,
	merge,
	Localization
) {
	"use strict";

	const TableQUnitUtils = {}; // TBD: Move global functions to this object
	const aData = [];
	const oDataTemplate = {};
	let mDefaultSettings = {};
	let iTouchPositionX;
	let iTouchPositionY;
	let oTouchTargetElement;

	const TestSelectionPlugin = SelectionPlugin.extend("sap.ui.table.test.TestSelectionPlugin", {
		init: function() {
			this.aSelectedRows = [];
		},
		setSelected: function(oRow, bSelected, mConfig) {
			let iIndex;

			if (bSelected) {
				iIndex = this.aSelectedRows.indexOf(oRow.getIndex());
				if (iIndex === -1) {
					this.aSelectedRows.push(oRow.getIndex());
				}
			} else {
				iIndex = this.aSelectedRows.indexOf(oRow.getIndex());
				this.aSelectedRows.splice(iIndex, 1);
			}

			this.fireSelectionChange();
		},
		isSelected: function(oRow) {
			return this.aSelectedRows.indexOf(oRow.getIndex()) > -1;
		},
		clearSelection: function() {
			this.aSelectedRows = [];
			this.fireSelectionChange();
		}
	});

	const TestControl = Control.extend("sap.ui.table.test.TestControl", {
		metadata: {
			properties: {
				"text": {type: "string", defaultValue: ""},
				"visible": {type: "boolean", defaultValue: true},
				"focusable": {type: "boolean", defaultValue: false},
				"tabbable": {type: "boolean", defaultValue: false}
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("span", oControl);
				if (oControl.getTabbable()) {
					oRm.attr("tabindex", "0");
				} else if (oControl.getFocusable()) {
					oRm.attr("tabindex", "-1");
				}
				if (!oControl.getVisible()) {
					oRm.style("display", "none");
				}
				oRm.openEnd();
				oRm.text(oControl.getText());
				oRm.close("span");
			}
		}
	});

	const TestInputControl = Control.extend("sap.ui.table.test.TestInputControl", {
		metadata: {
			properties: {
				"text": {type: "string", defaultValue: ""},
				"visible": {type: "boolean", defaultValue: true},
				"tabbable": {type: "boolean", defaultValue: true},
				"type": {type: "string", defaultValue: "text"}
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.voidStart("input", oControl);
				oRm.attr("type", oControl.getType());
				oRm.attr("value", oControl.getText());
				if (!oControl.getTabbable()) {
					oRm.attr("tabindex", "-1");
				}
				if (!oControl.getVisible()) {
					oRm.style("display", "none");
				}
				oRm.voidEnd();
			}
		}
	});

	const HeightTestControl = Control.extend("sap.ui.table.test.HeightTestControl", {
		metadata: {
			properties: {
				height: {type: "sap.ui.core.CSSSize", defaultValue: "1px"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", oControl.getHeight());
				oRm.style("width", "100px");
				oRm.style("overflow", "hidden");
				oRm.style("background", "linear-gradient(blue 1px, orange 1px, orange calc(100% - 1px), blue)");
				oRm.openEnd();
				oRm.close("div");
			}
		}
	});

	const TestLayoutControl = Control.extend("sap.ui.table.test.TestLayoutControl", {
		metadata: {
			aggregations: {
				items: {type: "sap.ui.core.Control", multiple: true, singularName: "item"}
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("display", "flex");
				oRm.style("flex-direction", "row");
				oRm.openEnd();
				oControl.getItems().forEach((oItem) => {
					oRm.renderControl(oItem);
				});
				oRm.close("div");
			}
		}
	});

	// This plugin helps to add hooks to the table, including the ones that are called during initialization of the table.
	const HelperPlugin = PluginBase.extend("sap.ui.table.test.HelperPlugin", {
		metadata: {
			events: {
				renderingTriggered: {}
			}
		}
	});

	HelperPlugin.prototype.onActivate = function(oTable) {
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RefreshRows, _fireRenderingTriggered, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UpdateRows, _fireRenderingTriggered, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UnbindRows, _fireRenderingTriggered, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsUnbound, onTableRowsUnbound, this);

		const wrapForRenderingDetection = (oObject, sFunctionName) => {
			const fnOriginalFunction = oObject[sFunctionName];
			oObject[sFunctionName] = function() {
				if (sFunctionName !== "rerenderControl" || arguments[0] === oTable) {
					this.fireRenderingTriggered();
				}
				fnOriginalFunction.apply(oObject, arguments);
			}.bind(this);
		};

		// Add wrappers and hooks for functions that inevitably trigger a "rowsUpdated" event.
		wrapForRenderingDetection(oTable, "invalidate");
		wrapForRenderingDetection(UIArea, "rerenderControl");
	};

	HelperPlugin.prototype.onDeactivate = function(oTable) {
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RefreshRows, _fireRenderingTriggered, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.UpdateRows, _fireRenderingTriggered, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.UnbindRows, _fireRenderingTriggered, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsUnbound, onTableRowsUnbound, this);
	};

	function _fireRenderingTriggered() {
		this.fireRenderingTriggered();
	}

	// If the table is unbound during initial rendering, it does not fire any rowsUpdated events. Handled in waitForFullRendering.
	function onTableRowsUnbound() {
		if (!this.getControl().getDomRef()) {
			this.fireRenderingTriggered();
		}
	}

	function TimeoutError(iMilliseconds) {
		const oError = new Error("Timed out" + (typeof iMilliseconds === "number" ? " after " + iMilliseconds + "ms" : ""));

		oError.name = "TimeoutError";
		oError.milliseconds = iMilliseconds;
		Object.setPrototypeOf(oError, Object.getPrototypeOf(this));

		if (Error.captureStackTrace) {
			Error.captureStackTrace(oError, TimeoutError);
		}

		return oError;
	}

	TimeoutError.prototype = Object.create(Error.prototype, {
		constructor: {
			value: Error,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});
	Object.setPrototypeOf(TimeoutError, Error);

	function ExpiringPromise(iTimeout, fnExecutor) {
		if (iTimeout == null || fnExecutor == null) {
			throw new Error("Invalid arguments");
		}

		let iTimeoutId;
		const pTimeout = new Promise((resolve, reject) => {
			iTimeoutId = setTimeout(() => {
				reject(new TimeoutError(iTimeout));
			}, iTimeout);
		});
		const pAction = new Promise(function() {
			fnExecutor.apply(this, Array.prototype.slice.call(arguments));
		});

		pAction.then(() => {
			clearTimeout(iTimeoutId);
		});

		return Promise.race([pTimeout, pAction]);
	}

	function deepCloneSettings(mSettings) {
		const oClone = merge({}, mSettings);

		// Clone all instances of type sap.ui.base.ManagedObject.
		for (const sProperty in oClone) {
			if (!oClone.hasOwnProperty(sProperty)) {
				continue;
			}

			const vValue = oClone[sProperty];

			if (TableUtils.isA(vValue, "sap.ui.base.ManagedObject")) {
				oClone[sProperty] = vValue.clone();
			} else if (Array.isArray(vValue)) {
				for (let i = 0; i < vValue.length; i++) {
					if (TableUtils.isA(vValue[i], "sap.ui.base.ManagedObject")) {
						vValue[i] = vValue[i].clone();
					}
				}
			}
		}

		return oClone;
	}

	TableUtils._getTableTemplateHelper = function() {
		// Esure that for test purposes the table helper mechanism is still in place for now
		return {
			createLabel: function(mConfig) {
				return new TestControl(mConfig);
			},
			createTextView: function(mConfig) {
				return new TestControl(mConfig);
			},
			addTableClass: function() {
				return "sapUiTableTest";
			},
			bFinal: true
		};
	};

	for (const TableClass of [Table, TreeTable]) {
		// TODO: Remove this once CreationRow is removed.
		const fnApplySettings = TableClass.prototype.applySettings;
		TableClass.prototype.applySettings = function(mSettings) {
			if (mSettings && "creationRow" in mSettings) {
				this.setCreationRow(mSettings.creationRow);
				delete mSettings.creationRow;
			}
			fnApplySettings.apply(this, arguments);
		};
	}

	function createTableSettings(TableClass, mSettings) {
		let aAllSettingKeys = Object.keys(TableClass.getMetadata().getAllSettings());

		aAllSettingKeys = aAllSettingKeys.concat(["creationRow"]); // TODO: Remove this once CreationRow is removed.

		return Object.keys(mSettings).reduce((oObject, sKey) => {
			if (aAllSettingKeys.includes(sKey)) {
				oObject[sKey] = mSettings[sKey];
			}
			return oObject;
		}, {});
	}

	function setExperimentalSettings(oTable, mSettings) {
		const aExperimentalProperties = ["_bVariableRowHeightEnabled", "_bLargeDataScrolling"];

		for (const sKey in mSettings) {
			if (aExperimentalProperties.includes(sKey)) {
				oTable[sKey] = mSettings[sKey];
			}
		}
	}

	function addAsyncHelpers(oTable, oHelperPlugin) {
		/**
		 * Returns a promise that resolves when the next <code>rowsUpdated</code> event is fired.
		 *
		 * @returns {Promise<Object>} A promise. Resolves with the event parameters.
		 */
		oTable.qunit.rowsUpdated = function() {
			return new Promise((resolve) => {
				oTable.attachEventOnce("rowsUpdated", (oEvent) => {
					resolve(oEvent.getParameters());
				});
			});
		};

		async function waitForRowsUpdatedAndFinalDomUpdates() {
			const mParameters = await oTable.qunit.rowsUpdated();
			if (oTable._isWaitingForData()) {
				return TableQUnitUtils.nextEvent("dataReceived", oTable.getBinding());
			} else {
				await TableQUnitUtils.nextFrame();
				return mParameters;
			}
		}

		function waitForFullRendering() {
			if (oTable.getBinding()) {
				return waitForRowsUpdatedAndFinalDomUpdates();
			}

			// A table without binding does not fire rowsUpdated events.
			return new Promise((resolve) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					if (oTable.getBinding()) { // In case the table has been bound in the meanwhile.
						waitForRowsUpdatedAndFinalDomUpdates().then(resolve);
					} else {
						TableQUnitUtils.nextFrame().then(resolve);
					}
				});
			});
		}

		// The promise for the most recently (re)triggered full rendering, or null when no rendering is currently pending (the table is "idle").
		let pLatestRendering = null;
		// A promise that resolves whenever "pLatestRendering" changes (a newer rendering is tracked, or it is reset to idle). It lets waiters
		// re-evaluate the latest rendering instead of blocking on a stale one. This is important because a superseded rendering might never
		// resolve on its own; for example, an unbind stops the "rowsUpdated" event that the preceding rendering was waiting for.
		let pLatestRenderingChanged;
		let fnResolveLatestRenderingChanged;

		function resetLatestRenderingChanged() {
			pLatestRenderingChanged = new Promise((resolve) => {
				fnResolveLatestRenderingChanged = resolve;
			});
		}
		resetLatestRenderingChanged();

		function signalLatestRenderingChanged() {
			const fnResolve = fnResolveLatestRenderingChanged;
			resetLatestRenderingChanged();
			fnResolve();
		}

		function trackRendering() {
			const pRendering = waitForFullRendering();

			pLatestRendering = pRendering;
			signalLatestRenderingChanged();
			pRendering.then(() => {
				if (pLatestRendering === pRendering) { // Reset to idle only if this rendering has not been superseded by a newer one.
					pLatestRendering = null;
					signalLatestRenderingChanged();
				}
			});

			return pRendering;
		}

		/**
		 * Returns a promise that resolves when no rendering is to be expected or when an ongoing rendering is finished.
		 *
		 * @param {function():boolean} [fnCheck]
		 *     A function that is called after rendering is finished. If it returns <code>false</code>, we wait for the next rendering to be finished
		 *     and execute the check function again. This cycle continues until either the check function returns <code>true</code> or a timeout
		 *     occurs.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.rendered = async function(fnCheck) {
			if (pLatestRendering != null) {
				// A rendering is pending. Wait until the table becomes idle again. We always follow the latest rendering: racing against
				// "pLatestRenderingChanged" ensures we re-read "pLatestRendering" when it is superseded or reset, rather than blocking on a
				// stale rendering that might never resolve. waitForFullRendering already settles the DOM, so no additional settle is needed.
				// eslint-disable-next-line no-unmodified-loop-condition -- reassigned by the rendering hooks while awaiting below
				while (pLatestRendering != null) {
					await Promise.race([pLatestRendering, pLatestRenderingChanged]);
				}
			} else {
				// Idle: nothing pending, but still wait for post-render scroll adjustments and one animation frame to settle the DOM.
				await TableQUnitUtils.nextFrame();
				if (pLatestRendering != null) { // A rendering was triggered during the animation frame.
					return oTable.qunit.rendered(fnCheck);
				}
			}

			if (!(fnCheck instanceof Function)) { // TODO: Some tests incorrectly pass a non-function here
				return;
			}

			await new ExpiringPromise(1000, async (resolve, reject) => {
				try {
					while (fnCheck() !== true) {
						await oTable.qunit.rendered();
					}
					resolve();
				} catch (oError) {
					reject(oError);
				}
			}).catch((oError) => {
				if (oError instanceof TimeoutError) {
					return; // This timeout is not a real error so we resolve the promise normally.
				}
				throw oError;
			});
		};

		/**
		 * Returns a promise that resolves when the rendering resulting from the next rendering trigger is finished.
		 *
		 * @returns {Promise<Object>} A promise. Resolves with the event parameters.
		 */
		oTable.qunit.nextRender = function() {
			return new Promise((resolve) => {
				let pRendering = waitForFullRendering();

				const attachResolver = function(pPromise) {
					pPromise.then((mParameters) => {
						if (pPromise === pRendering) { // Resolve only for the latest tracked rendering.
							oHelperPlugin.detachRenderingTriggered(onTriggered);
							resolve(mParameters);
						}
					});
				};
				const onTriggered = () => {
					pRendering = waitForFullRendering();
					attachResolver(pRendering);
				};

				attachResolver(pRendering);
				oHelperPlugin.attachRenderingTriggered(onTriggered);
			});
		};

		// Track the initial rendering and re-track on every subsequent trigger.
		trackRendering();
		oHelperPlugin.attachRenderingTriggered(trackRendering);

		/**
		 * Returns a promise that resolves when the next binding change event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.bindingChangeEvent = function() {
			const oBinding = oTable.getBinding();

			if (!oBinding) {
				return Promise.resolve();
			}

			return new Promise((resolve) => {
				oBinding.attachEventOnce("change", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the next vertical scroll event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.vScrolled = function() {
			return new Promise((resolve) => {
				const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
				TableQUnitUtils.addEventListenerOnce(oVSb, "scroll", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the next horizontal scroll event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.hScrolled = function() {
			return new Promise((resolve) => {
				const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
				TableQUnitUtils.addEventListenerOnce(oHSb, "scroll", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the next scroll event of the viewport is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.viewportScrolled = function() {
			return new Promise((resolve) => {
				TableQUnitUtils.addEventListenerOnce(oTable.getDomRef("tableCCnt"), "scroll", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the scrolling is performed and rendering is finished.
		 *
		 * @param {int} iScrollPosition The new vertical scroll position.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.scrollVSbTo = async function(iScrollPosition) {
			const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			const iOldScrollTop = oVSb.scrollTop;

			oVSb.scrollTop = iScrollPosition;

			if (oVSb.scrollTop !== iOldScrollTop) {
				await oTable.qunit.vScrolled();
				await oTable.qunit.rendered();
			}
		};

		/**
		 * Returns a promise that resolves when the scrolling is performed and rendering is finished.
		 *
		 * @param {int} iDistance The distance to scroll.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.scrollVSbBy = function(iDistance) {
			const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			return oTable.qunit.scrollVSbTo(oVSb.scrollTop + iDistance);
		};

		/**
		 * Returns a promise that resolves when the scrolling is performed and rendering is finished.
		 *
		 * @param {int} iScrollPosition The new horizontal scroll position.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.scrollHSbTo = function(iScrollPosition) {
			const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
			const $HSb = jQuery(oHSb);
			const bRTL = Localization.getRTL();
			const iOldScrollLeft = bRTL ? $HSb.scrollLeftRTL() : oHSb.scrollLeft;

			if (bRTL) {
				$HSb.scrollLeftRTL(iScrollPosition);
			} else {
				oHSb.scrollLeft = iScrollPosition;
			}

			if ((bRTL ? $HSb.scrollLeftRTL() : oHSb.scrollLeft) === iOldScrollLeft) {
				return Promise.resolve();
			} else {
				return oTable.qunit.hScrolled();
			}
		};

		/**
		 * Returns a promise that resolves when the height of the table's parent element is changed and rendering is finished.
		 *
		 * @param {Object} mSizes The new sizes.
		 * @param {string} [mSizes.height] The new height. Must be a valid CSSSize.
		 * @param {string} [mSizes.width] The new width. Must be a valid CSSSize.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.resize = async function(mSizes) {
			const oDomRef = oTable.getDomRef();
			const oContainerElement = oDomRef ? oDomRef.parentNode : null;

			if (!oContainerElement) {
				return;
			}

			const sOldHeight = oContainerElement.style.height;
			const sOldWidth = oContainerElement.style.width;

			if (oTable.qunit.sContainerOriginalHeight == null) {
				oTable.qunit.sContainerOriginalHeight = sOldHeight;
			}
			if (oTable.qunit.sContainerOriginalWidth == null) {
				oTable.qunit.sContainerOriginalWidth = sOldWidth;
			}

			if (mSizes.height != null) {
				oContainerElement.style.height = mSizes.height;
			}
			if (mSizes.width != null) {
				oContainerElement.style.width = mSizes.width;
			}

			if ((mSizes.height != null && mSizes.height !== sOldHeight) || (mSizes.width != null && mSizes.width !== sOldWidth)) {
				// Give the table time to react. The polling interval of the Auto row mode is 200ms.
				await TableQUnitUtils.sleep(250);
				await oTable.qunit.rendered();
			}
		};

		/**
		 * Returns a promise that resolves when the height of the table's parent element is changed to its original value and rendering is finished.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.resetSize = function() {
			return oTable.qunit.resize({
				height: oTable.qunit.sContainerOriginalHeight,
				width: oTable.qunit.sContainerOriginalWidth
			});
		};

		/**
		 * Focuses an element. If no focus events are fired, for example because the tab or browser window is in the background,
		 * artificial focus events are dispatched to the focused element.
		 *
		 * <b>Do not use this method if you need to check whether an element is focusable!</b>
		 *
		 * @param {HTMLElement} oElement The element to focus.
		 * @returns {Promise} A Promise that resolves after the focus events are fired and processed.
		 */
		oTable.qunit.focus = function(oElement) {
			let oEventListener;

			// Mirrors the scroll extension's focus handling schedule (see Scrolling#onfocusin).
			const whenFocusHandlingFinished = function() {
				return Promise.resolve().then(() => {
					if (Device.browser.safari) {
						return new Promise((resolve) => {
							setTimeout(resolve, 0);
						});
					}
				});
			};

			return new ExpiringPromise(0, function(resolve) {
				oEventListener = TableQUnitUtils.addEventListenerOnce(oElement, "focusin", () => {
					whenFocusHandlingFinished().then(resolve);
				});
				oElement.focus();
			}).catch((oError) => {
				if (oError instanceof TimeoutError) {
					// If the tab or browser are in the background, or the focus is in the dev tools, the are no focus events. To be able to continue
					// with the test execution, fake the focus events.
					oElement.dispatchEvent(new FocusEvent("focus"));
					oElement.dispatchEvent(new FocusEvent("focusin"));
					oEventListener.remove();
					return whenFocusHandlingFinished();
				}
				throw oError;
			});
		};

		/**
		 * Sets the content density and invalidates the table.
		 *
		 * @param {string} [sDensity] The content density value to be set.
		 * @returns {Promise} A promise that resolves after the rendering of the table is finished.
		 */
		oTable.qunit.setDensity = function(sDensity) {
			document.body.classList.remove("sapUiSizeCozy");
			document.body.classList.remove("sapUiSizeCompact");
			oTable.removeStyleClass("sapUiSizeCondensed");

			if (sDensity != null) {
				if (sDensity === "sapUiSizeCondensed") {
					document.body.classList.add("sapUiSizeCompact");
					oTable.addStyleClass("sapUiSizeCondensed");
				} else {
					document.body.classList.add(sDensity);
				}
			}

			oTable.invalidate();
			return oTable.qunit.rendered();
		};

		/**
		 * Resets to the original content density and invalidates the table.
		 *
		 * @returns {Promise} A promise that resolves after the rendering of the table is finished.
		 */
		oTable.qunit.resetDensity = function() {
			return oTable.qunit.setDensity("sapUiSizeCozy");
		};
	}

	function addHelpers(oTable) {
		/**
		 * Gets the data cell element.
		 *
		 * @param {int} iRowIndex Index of the row. Can be negative, for example -1 for the last row.
		 * @param {int} iColumnIndex Index of the column. Can be negative, for example -1 for the last column.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getDataCell = function(iRowIndex, iColumnIndex) {
			iColumnIndex = iColumnIndex < 0 ? oTable.getColumns().length + iColumnIndex : iColumnIndex;
			iRowIndex = iRowIndex < 0 ? oTable.getRows().length + iRowIndex : iRowIndex;
			return oTable.getDomRef("rows-row" + iRowIndex + "-col" + iColumnIndex);
		};

		/**
		 * Gets the column header cell element.
		 *
		 * @param {int} iColumnIndex Index of the column in the list of visible columns. Can be negative, for example -1 for the last column.
		 * @param {int} [iRowIndex] Index of the header row.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getColumnHeaderCell = function(iColumnIndex, iRowIndex = 0) {
			iColumnIndex = iColumnIndex < 0 ? oTable._getVisibleColumns().length + iColumnIndex : iColumnIndex;
			return document.getElementById(oTable._getVisibleColumns()[iColumnIndex].getId() + (iRowIndex > 0 ? "_" + iRowIndex : ""));
		};

		/**
		 * Gets the row header cell element.
		 *
		 * @param {int} iRowIndex Index of the row the cell is inside. Can be negative, for example -1 for the last row.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getRowHeaderCell = function(iRowIndex) {
			iRowIndex = iRowIndex < 0 ? oTable.getRows().length + iRowIndex : iRowIndex;
			return oTable.getDomRef("rowsel" + iRowIndex);
		};

		/**
		 * Gets the row action cell element.
		 *
		 * @param {int} iRowIndex Index of the row the cell is inside. Can be negative, for example -1 for the last row.
		 * @returns {HTMLElement} Returns the DOM element.
		 */
		oTable.qunit.getRowActionCell = function(iRowIndex) {
			iRowIndex = iRowIndex < 0 ? oTable.getRows().length + iRowIndex : iRowIndex;
			return oTable.getDomRef("rowact" + iRowIndex);
		};

		/**
		 * Gets the selectAll cell element.
		 *
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getSelectAllCell = function() {
			return oTable.getDomRef("selall");
		};

		/**
		 * Gets the row action header cell.
		 *
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getRowActionHeaderCell = function() {
			return oTable.getDomRef("rowacthdr");
		};

		/**
		 * A "touchstart" event is translated to a "mousedown" event by UI5. When the "mousedown" event is forwarded to the item navigation, it
		 * focuses the target element. When an element is focused, the browser scrolls it into the view. This method prevents this chain of events
		 * and is therefore useful when testing scrolling with touch events.
		 */
		oTable.qunit.preventFocusOnTouch = function() {
			oTable._getKeyboardExtension().suspendItemNavigation();
		};

		/**
		 * Sets the row states and invalidates the table. The row states are applied in the order in which they are provided. The row states are
		 * reset if no row states are provided.
		 * Only works in combination with client models.
		 *
		 * @param {object[]} [aRowStates] The row states to set.
		 * @returns {Promise} A promise that resolves after the rendering of the table is finished.
		 */
		oTable.qunit.setRowStates = function(aRowStates) {
			if (aRowStates) {
				if (!oTable.qunit._mSetRowStates) {
					oTable.qunit._mSetRowStates = {
						updateRowState: function(oState) {
							const oBinding = oTable.getBinding();
							const iDataIndex = oBinding?.getContexts(0, oBinding.getLength()).indexOf(oState.context);

							if (iDataIndex >= 0) {
								Object.assign(oState, oTable.qunit._mSetRowStates.rowStates[iDataIndex]);
							}
						}
					};
					TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, oTable.qunit._mSetRowStates.updateRowState);
				}
				oTable.qunit._mSetRowStates.rowStates = aRowStates;
			} else if (oTable.qunit._mSetRowStates) {
				TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, oTable.qunit._mSetRowStates.updateRowState);
				delete oTable.qunit._mSetRowStates;
			}

			oTable.getBinding().refresh(true);
			return oTable.qunit.rendered();
		};
	}

	TableQUnitUtils.TestSelectionPlugin = TestSelectionPlugin;
	TableQUnitUtils.TestControl = TestControl;
	TableQUnitUtils.TestInputControl = TestInputControl;
	TableQUnitUtils.HeightTestControl = HeightTestControl;
	TableQUnitUtils.TestLayoutControl = TestLayoutControl;
	TableQUnitUtils.ColumnHeaderMenu = Control.extend("sap.ui.table.test.TestContextMenu", {
		metadata: {
			interfaces: ["sap.ui.core.IColumnHeaderMenu"]
		},
		openBy: () => {},
		getAriaHasPopupType: () => { return CoreLibrary.aria.HasPopup.Menu; }
	});

	TableQUnitUtils.setDefaultSettings = function(mSettings) {
		mDefaultSettings = Object.assign({}, mSettings);
	};

	TableQUnitUtils.getDefaultSettings = function() {
		return mDefaultSettings;
	};

	TableQUnitUtils.createTable = function(TableClass, mSettings, fnBeforePlaceAt) {
		if (typeof TableClass === "function" && TableClass !== Table && TableClass !== TreeTable && TableClass !== AnalyticalTable) {
			fnBeforePlaceAt = TableClass;
			TableClass = Table;
		} else if (typeof TableClass === "object") {
			fnBeforePlaceAt = mSettings;
			mSettings = TableClass;
			TableClass = Table;
		} else if (typeof TableClass === "function" && typeof mSettings === "function") {
			fnBeforePlaceAt = mSettings;
			mSettings = undefined;
		}
		mSettings = Object.assign({}, deepCloneSettings(this.getDefaultSettings()), mSettings);
		TableClass = TableClass == null ? Table : TableClass;

		const oTable = new TableClass(createTableSettings(TableClass, mSettings));
		const oHelperPlugin = new HelperPlugin();

		Object.defineProperty(oTable, "qunit", {
			value: {}
		});

		oTable.addAggregation("_hiddenDependents", oHelperPlugin);
		setExperimentalSettings(oTable, mSettings);
		addAsyncHelpers(oTable, oHelperPlugin);
		addHelpers(oTable);

		if (typeof fnBeforePlaceAt === "function") {
			fnBeforePlaceAt(oTable, mSettings);
		}

		let sContainerId;
		if (typeof mSettings.placeAt === "string") {
			sContainerId = mSettings.placeAt;
		} else if (mSettings.placeAt !== false) {
			sContainerId = "qunit-fixture";
		}

		if (sContainerId != null) {
			oTable.placeAt(sContainerId);
		}

		return oTable;
	};

	TableQUnitUtils.createJSONModelWithEmptyRows = function(iLength) {
		return new JSONModel(new Array(iLength).fill({}));
	};

	TableQUnitUtils.createJSONModel = function(iLength) {
		fillDataUpTo(iLength);
		return new JSONModel(aData.slice(0, iLength));
	};

	function fillDataUpTo(iLength) {
		if (aData.length >= iLength) {
			return;
		}

		for (let i = aData.length; i < iLength; i++) {
			const oNewEntry = Object.assign({children: [{}]}, oDataTemplate);

			for (const sKey in oNewEntry) {
				if (sKey === "children") {
					continue;
				}
				oNewEntry[sKey] = oNewEntry[sKey] + "_" + i;
				oNewEntry.children[0][sKey] = oNewEntry[sKey] + "_child_0";
			}

			aData.push(oNewEntry);
		}
	}

	function addPropertyToData(sProperty) {
		if (aData.length === 0 || sProperty in aData[0]) {
			return;
		}

		oDataTemplate[sProperty] = sProperty;

		for (const [i, oItem] of aData.entries()) {
			oItem[sProperty] = sProperty + "_" + i;
			oItem.children[0][sProperty] = oItem[sProperty] + "_child_0";
		}
	}

	/**
	 * Creates a column that has test controls as template and label. Both template and label are text controls.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.id] Id for the new column.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                       The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {boolean} [mConfig.focusable=false] Whether the text is focusable.
	 * @param {boolean} [mConfig.tabbable=false] Whether the text is tabbable.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
	 * @param {boolean} [mConfig.templateHidden=false] Whether the <code>visible</code> property of the template should be set to <code>false</code>.
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createTextColumn = function(mConfig) {
		mConfig = typeof mConfig === "string" ? {text: mConfig} : Object.assign({}, mConfig);

		const oColumn = new Column(mConfig.id, {
			label: new TestControl({
				text: mConfig.label,
				focusable: mConfig.interactiveLabel === true,
				tabbable: mConfig.interactiveLabel === true
			}),
			template: new TestControl({
				text: mConfig.bind === true ? "{" + mConfig.text + "}" : mConfig.text,
				focusable: mConfig.focusable === true,
				tabbable: mConfig.tabbable === true,
				visible: !mConfig.templateHidden
			}),
			width: "100px"
		});

		if (mConfig.bind === true) {
			addPropertyToData(mConfig.text);
		}

		return oColumn;
	};

	/**
	 * Creates a column that has interactive (focusable & tabbable) test controls as template and label. Both template and label are text controls.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.id] Id for the new column.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                       The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createInteractiveTextColumn = function(mConfig) {
		mConfig = typeof mConfig === "string" ? {text: mConfig} : Object.assign({
			focusable: true,
			tabbable: true,
			interactiveLabel: true
		}, mConfig);

		return TableQUnitUtils.createTextColumn(mConfig);
	};

	/**
	 * Creates a column that has test controls as template and label. The template is an input control, and the label is a text control.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.id] Id for the new column.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                       The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {string} [mConfig.type=text] The type of the input element.
	 * @param {boolean} [mConfig.tabbable=true] Whether the input is tabbable.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createInputColumn = function(mConfig) {
		mConfig = typeof mConfig === "string" ? {text: mConfig} : Object.assign({}, mConfig);

		const oColumn = new Column(mConfig.id, {
			label: new TestControl({
				text: mConfig.label,
				focusable: mConfig.interactiveLabel === true,
				tabbable: mConfig.interactiveLabel === true
			}),
			template: new TestInputControl({
				text: mConfig.bind === true ? "{" + mConfig.text + "}" : mConfig.text,
				tabbable: mConfig.tabbable,
				type: mConfig.type
			}),
			width: "100px"
		});

		if (mConfig.bind === true) {
			addPropertyToData(mConfig.text);
		}

		return oColumn;
	};

	/**
	 * Creates an instance of a <code>RowAction</code> with items. Can be used as a row action template in the table.
	 *
	 * @param {object[]} [aItemSettings=[{type: "Navigation"}, {type: "Delete"}]]
	 *     The settings for the items. If no settings are provided, a navigation and a delete item are created. If <code>null</code> is provided, no
	 *     items are created.
	 * @returns {sap.ui.table.RowAction} Row action with items.
	 */
	TableQUnitUtils.createRowAction = function(aItemSettings = [
		{type: "Navigation"},
		{type: "Delete"}
	]) {
		return new RowAction({
			items: (aItemSettings ?? []).map((mItemSettings) => new RowActionItem(mItemSettings))
		});
	};

	/**
	 * Adds a delegate that listens to an event of an element once. The delegate is removed after the event.
	 *
	 * @param {sap.ui.core.Element} oElement The element to add the delegate to.
	 * @param {string} sEventName The name of the event.
	 * @param {Function} fnHandler The event handler.
	 * @param {boolean} [bCallBefore=false] Whether the listener is called before the listener of the element.
	 * @return {{remove: Function}} An object providing methods, for example to remove the delegate before it is called.
	 */
	TableQUnitUtils.addDelegateOnce = function(oElement, sEventName, fnHandler, bCallBefore) {
		const oDelegate = {};

		oDelegate[sEventName] = function() {
			this.removeEventDelegate(oDelegate);
			fnHandler.apply(this, arguments);
		};

		oElement.addDelegate(oDelegate, bCallBefore === true, oElement);

		return {
			remove: function() {
				oElement.removeEventDelegate(oDelegate);
			}
		};
	};

	/**
	 * Adds an event listener that listens to an event of an element once. THe listener is removed after the event.
	 *
	 * @param {HTMLElement} oElement The element to add the listener to.
	 * @param {string} sEventName The name of the event.
	 * @param {Function} fnHandler The event handler.
	 * @return {{remove: Function}} An object providing methods, for example to remove the listener before it is called.
	 */
	TableQUnitUtils.addEventListenerOnce = function(oElement, sEventName, fnHandler) {
		oElement.addEventListener(sEventName, function(oEvent) {
			oElement.removeEventListener(sEventName, fnHandler);
			fnHandler.call(this, oEvent);
		});

		return {
			remove: function() {
				oElement.removeEventListener(sEventName, fnHandler);
			}
		};
	};

	/**
	 * Returns a promise that resolves after a certain delay.
	 *
	 * @param {int} iMilliseconds The delay in milliseconds.
	 * @returns {Promise} A promise.
	 */
	TableQUnitUtils.sleep = function(iMilliseconds) {
		return new Promise((resolve) => {
			setTimeout(resolve, iMilliseconds);
		});
	};

	/**
	 * Returns a promise that resolves on the next animation frame.
	 *
	 * @returns {Promise} A promise.
	 */
	TableQUnitUtils.nextFrame = function() {
		return new Promise((resolve) => {
			window.requestAnimationFrame(resolve);
		});
	};

	/**
	 * Attachs an event handler for the next event with the given name to the given EventProvider instance.
	 *
	 * @param {string} sEventName Name of the event
	 * @param {sap.ui.base.EventProvider} oEventProvider EventProvider where the event handler is attached
	 * @returns {Promise<sap.ui.base.Event>} Resolves with the event instance
	 */
	TableQUnitUtils.nextEvent = (sEventName, oEventProvider) => {
		return new Promise((fnResolve) => {
			oEventProvider.attachEventOnce(sEventName, fnResolve);
		});
	};

	/**
	 * Checks if the "NoData" text of a table matches certain conditions.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {boolean} bVisible Whether the "NoData" text is expected to be visible.
	 * @param {string} [sTitle] Title of the test that prefixes all test messages.
	 */
	TableQUnitUtils.assertNoDataVisible = function(assert, oTable, bVisible, sTitle) {
		const sTestTitle = sTitle == null ? "" : sTitle + ": ";

		assert.equal(TableUtils.isNoDataVisible(oTable), bVisible, sTestTitle + "NoData visibility");

		if (!bVisible) {
			// If the NoData element is not visible, the table must have focusable elements (cells).
			assert.ok(oTable.qunit.getDataCell(0, oTable._getVisibleColumns()[0].getIndex()),
				sTestTitle + "If 'NoData' is not visible, rows are rendered");
		}
	};

	/**
	 * Checks if the correct number of rows is rendered.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {int} iFixedTop The number of fixed top rows.
	 * @param {int} iScrollable The number of scrollable rows.
	 * @param {int} iFixedBottom The number of fixed bottom rows.
	 */
	TableQUnitUtils.assertRenderedRows = function(assert, oTable, iFixedTop, iScrollable, iFixedBottom) {
		const oFixedTopRowContainer = oTable.getDomRef("table-fixrow");
		const oScrollableRowContainer = oTable.getDomRef("table");
		const oFixedBottomRowContainer = oTable.getDomRef("table-fixrow-bottom");
		const iFixedTopRowCount = oFixedTopRowContainer ? oFixedTopRowContainer.querySelectorAll(".sapUiTableRow").length : 0;
		const iScrollableTopRowCount = oScrollableRowContainer ? oScrollableRowContainer.querySelectorAll(".sapUiTableRow").length : 0;
		const iFixedBottomRowCount = oFixedBottomRowContainer ? oFixedBottomRowContainer.querySelectorAll(".sapUiTableRow").length : 0;

		assert.strictEqual(iFixedTopRowCount, iFixedTop, "Fixed top row count");
		assert.strictEqual(iScrollableTopRowCount, iScrollable, "Scrollable row count");
		assert.strictEqual(iFixedBottomRowCount, iFixedBottom, "Fixed bottom row count");
	};

	/**
	 * Checks if the row heights for the given test settings are correct.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {object} mTestSettings Test settings.
	 * @param {string} mTestSettings.density Current content density.
	 * @param {string} mTestSettings.title Title for the assertion.
	 * @param {number} mTestSettings.expectedHeight Expected row height.
	 */
	TableQUnitUtils.assertRowHeights = function(assert, oTable, mTestSettings) {
		const sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
		mTestSettings.title += " (Density=\"" + sDensity + "\")";

		const aRowDomRefs = oTable.getRows()[0].getDomRefs();
		assert.strictEqual(aRowDomRefs.rowSelector.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Selector height is ok");
		assert.strictEqual(aRowDomRefs.rowFixedPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Fixed part height is ok");
		assert.strictEqual(aRowDomRefs.rowScrollPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Scrollable part height is ok");
		assert.strictEqual(aRowDomRefs.rowAction.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Action height is ok");
	};

	/**
	 * Checks if the column header heights for the given test settings are correct.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {object} mTestSettings Test settings.
	 * @param {string} mTestSettings.density Current content density.
	 * @param {string} mTestSettings.title Title for the assertion.
	 * @param {number} mTestSettings.expectedHeight Expected column header height.
	 */
	TableQUnitUtils.assertColumnHeaderHeights = function(assert, oTable, mTestSettings) {
		const sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
		mTestSettings.title += " (Density=\"" + sDensity + "\")";

		const aRowDomRefs = oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
		const oColumnHeaderCnt = oTable.getDomRef().querySelector(".sapUiTableColHdrCnt");

		assert.strictEqual(aRowDomRefs[0].getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Fixed part height is ok");
		assert.strictEqual(aRowDomRefs[1].getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Scrollable part height is ok");
		assert.strictEqual(oColumnHeaderCnt.getBoundingClientRect().height, mTestSettings.expectedHeight + 1 /* border */,
			mTestSettings.title + ": Column header container height is ok");
	};

	/**
	 * Checks whether an element is focused.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @returns {jQuery} A jQuery object containing the active element.
	 */
	TableQUnitUtils.assertFocus = function(assert, oElement) {
		const $ActiveElement = jQuery(document.activeElement);
		const $Element = jQuery(oElement);

		assert.deepEqual(document.activeElement, $Element[0],
			"Focus is on: " + $ActiveElement.attr("id") + ", should be on: " + $Element.attr("id"));

		return $ActiveElement;
	};

	/**
	 * Focus an element that is outside of a table.
	 *
	 * @param {object} [assert] QUnit assert object. This parameter can be omitted.
	 * @param {string} [sId] Id of an element outside of the table.
	 * @throws {Error} If the focused element is inside a table.
	 * @returns {HTMLElement} The focused element.
	 */
	TableQUnitUtils.setFocusOutsideOfTable = function(assert, sId) {
		if (typeof assert === "string") {
			sId = assert;
		}

		sId = sId || "outerelement";
		const oOuterElement = document.getElementById(sId);
		oOuterElement.focus();

		if (oOuterElement.closest(".sapUiTable")) {
			throw new Error("Element with id '" + sId + "' is inside a table");
		}

		if (assert) {
			assert.deepEqual(oOuterElement, document.activeElement, "Outer element with id '" + sId + "' focused");
		}

		return oOuterElement;
	};

	TableQUnitUtils.createMouseWheelEvent = function(iScrollDelta, iDeltaMode, bShift) {
		return new window.WheelEvent("wheel", {
			deltaY: bShift ? 0 : iScrollDelta,
			deltaX: bShift ? iScrollDelta : 0,
			deltaMode: iDeltaMode,
			shiftKey: bShift,
			bubbles: true,
			cancelable: true
		});
	};

	TableQUnitUtils.createTouchEvent = function(sType, mParams) {
		if (Device.browser.firefox || Device.browser.safari) {
			return Object.assign(new Event(sType, {
				bubbles: true,
				cancelable: true
			}), mParams);
		} else {
			return new window.TouchEvent(sType, Object.assign({
				bubbles: true,
				cancelable: true
			}, mParams));
		}
	};

	TableQUnitUtils.createTouchObject = function(mParams) {
		if (Device.browser.firefox || Device.browser.safari) {
			const oTarget = mParams.target;

			delete mParams.target;

			return Object.assign(new Event({
				bubbles: true,
				cancelable: true,
				target: oTarget
			}), mParams);
		} else {
			return new window.Touch(mParams);
		}
	};

	TableQUnitUtils.startTouchScrolling = function(oTargetElement, iPageX, iPageY) {
		oTouchTargetElement = oTargetElement;
		const oTargetRect = oTargetElement.getBoundingClientRect();
		iTouchPositionX = iPageX || oTargetRect.left;
		iTouchPositionY = iPageY || oTargetRect.top;

		const oTouchEvent = this.createTouchEvent("touchstart", {
			touches: [
				this.createTouchObject({
					target: oTouchTargetElement,
					identifier: Date.now(),
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				})
			]
		});

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	};

	TableQUnitUtils.doTouchScrolling = function(iScrollDeltaX, iScrollDeltaY) {
		iTouchPositionX -= iScrollDeltaX || 0;
		iTouchPositionY -= iScrollDeltaY || 0;

		const oTouchEvent = this.createTouchEvent("touchmove", {
			touches: [
				this.createTouchObject({
					target: oTouchTargetElement,
					identifier: Date.now(),
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				})
			]
		});

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	};

	TableQUnitUtils.endTouchScrolling = function() {
		const oTouchEvent = this.createTouchEvent("touchend", {
			changedTouches: [
				this.createTouchObject({
					target: oTouchTargetElement,
					identifier: Date.now(),
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				})
			]
		});

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	};

	TableQUnitUtils.createScrollEvent = function() {
		return new window.Event("scroll");
	};

	/**
	 * Creates and returns an object that can be used to predefine QUnit tests to reuse them in multiple QUnit test pages.
	 *
	 * A shared test file declares its tests with the collector's QUnit-like API (<code>module</code>/<code>test</code>)
	 * instead of the global QUnit, then returns the collector. A consuming test page replays those tests into its own
	 * QUnit via <code>registerTo</code>, optionally passing a wrapper that can customize every test for that page.
	 *
	 * @example
	 * // The module that contains the reusable tests returns the QUnit test collector.
	 * const QUnitTestCollector = TableQUnitUtils.createQUnitTestCollector();
	 * QUnitTestCollector.module("My module", {
	 *     beforeEach: () => {...}
	 * });
	 * QUnitTestCollector.test("My test", function(assert) {...});
	 * return QUnitTestCollector;
	 *
	 * // The tests are registered in the QUnit test page.
	 * QUnitTestCollector.registerTo(QUnit);
	 *
	 * // Optionally, a wrapper can customize every reused test.
	 * QUnitTestCollector.registerTo(QUnit, function(assert, fnOriginalTest) {
	 *     return fnOriginalTest();
	 * });
	 * @returns {{module: function, test: function, registerTo: function}} A QUnit test collector
	 */
	TableQUnitUtils.createQUnitTestCollector = function() {
		const aRecordedCalls = [];
		let fnTestWrapper;

		// Route each recorded test body through the optional per-page wrapper.
		function wrapTest(fnTest) {
			return function(assert) {
				const fnOriginalTest = () => fnTest.apply(this, arguments);
				return fnTestWrapper ? fnTestWrapper.call(this, assert, fnOriginalTest) : fnOriginalTest();
			};
		}

		return {
			module: function(...aArguments) {
				aRecordedCalls.push({method: "module", arguments: aArguments});
			},
			test: function(sTitle, fnTest) {
				aRecordedCalls.push({method: "test", arguments: [sTitle, wrapTest(fnTest)]});
			},
			registerTo: function(QUnit, fnWrapper) {
				fnTestWrapper = fnWrapper;
				aRecordedCalls.forEach((oCall) => {
					QUnit[oCall.method](...oCall.arguments);
				});
			}
		};
	};

	TableQUnitUtils.hideTestContainer = function() {
		const oQunitFixture = document.getElementById("qunit-fixture");

		oQunitFixture.dataset.originalDisplayStyle = oQunitFixture.style.display;
		oQunitFixture.style.display = "none";

		return new Promise((resolve) => {
			window.requestAnimationFrame(resolve);
		});
	};

	TableQUnitUtils.showTestContainer = function() {
		const oQunitFixture = document.getElementById("qunit-fixture");

		oQunitFixture.style.display = oQunitFixture.dataset.originalDisplayStyle;
		delete oQunitFixture.dataset.originalDisplayStyle;

		return new Promise((resolve) => {
			window.requestAnimationFrame(resolve);
		});
	};

	return TableQUnitUtils;
});