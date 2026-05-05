/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/support/debug/UI5Debug",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Core",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/_ViewFactory",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/ControllerExtensionProvider",
	"sap/ui/core/XMLTemplateProcessor"
], function(UI5Debug, ManagedObject, Core, Component, ComponentRegistry, Element, _ViewFactory, XMLView, ControllerExtensionProvider, XMLTemplateProcessor) {
	"use strict";

	const { scope } = UI5Debug;
	const createdViews = scope();
	const spies = scope();

	// Spy for view creation to keep track of all created views
	spies._viewFactory = UI5Debug.spy(_ViewFactory, "create", (spyInfo) => {
		const fnLoadControllerExtensions = async (oView) => {
			const ownerComponent = Component.getOwnerComponentFor(oView);
			if (ownerComponent) {
				const sViewName = oView.getViewName();
				const sViewId = oView.getId();
				const sViewKey = `${sViewName}|${sViewId}`;
				const oViewEntry = {
					instance: oView
				};
				const controllerName = oView.getControllerName?.();
				oViewEntry.controllerExtensions = await ControllerExtensionProvider.getControllerExtensions(controllerName, ownerComponent.getId(), sViewId);
				createdViews[`${sViewKey}`] = oViewEntry;
			}
		};

		const originalReturn = spyInfo.originalFunction.apply(this, spyInfo.args);
		if (originalReturn instanceof Promise) {
			originalReturn.then(fnLoadControllerExtensions);
		} else {
			fnLoadControllerExtensions(originalReturn);
		}
		return {
			preventDefault: true,
			returnValue: originalReturn
		};
	});

	return {
		__help: [
			{cmd: "ui5.core.components", text: "ComponentRegistry \u2014 list all registered components"},
			{cmd: "ui5.core.owner($0)", text: "Get owner component for a DOM node or element"},
			{cmd: "ui5.core.getRouterFor($0)", text: "Get the router for an element"},
			{cmd: "ui5.core.routing($0)", text: "Trace route matches \u2014 .startTrace() / .stopTrace() / .getMatched()"},
			{cmd: "ui5.core.views.all()", text: "Get all tracked views with their controller extensions"},
			{cmd: "ui5.core.views.get(name)", text: "Get a specific view by name"},
			{cmd: "ui5.core.modules", text: "Direct references to Core, Component, Element, ManagedObject, XMLView"}
		],
		core: scope({
			components: ComponentRegistry,
			modules: scope({
				/**
				 * @returns {sap.ui.core.Component} Instance of sap.ui.core.Component
				 */
				Component,

				/**
				 * @returns {sap.ui.core.Core} Instance of sap.ui.core.Core
				 */
				Core,

				/**
				 * @returns {sap.ui.core.Element} Instance of sap.ui.core.Element
				 */
				Element,

				/**
				 * @returns {sap.ui.base.ManagedObject} Instance of sap.ui.base.ManagedObject
				 */
				ManagedObject,

				/**
				 * @returns {sap.ui.core.mvc.XMLView} Instance of sap.ui.core.mvc.XMLView
				 */
				XMLView,

				/**
				 * @returns {sap.ui.core.XMLTemplateProcessor} Instance of sap.ui.core.XMLTemplateProcessor
				 */
				XMLTemplateProcessor
			}),

			/**
			 * Returns the Component instance in whose "context" the given ManagedObject has been created or undefined.
			 * @param {HTMLElement | sap.ui.core.Element} oElement The element to get the owner component of
			 * @returns {sap.ui.core.Component | undefined} The owner component or <code>undefined</code>
			 */
			owner: function(oElement) {
				if (oElement instanceof HTMLElement) {
					oElement = Element.closestTo(oElement);
				}
				return Component.getOwnerComponentFor(oElement);
			},

			/**
			 * Finds the router of a UI5 element
			 * @param {HTMLElement | sap.ui.core.Element} oElement Element to find the router for
			 * @returns {undefined | sap.ui.core.routing.Router} The router if found, otherwise undefined
			 */
			getRouterFor: function(oElement) {
				return this.owner(oElement)?.getRouter();
			},

			routing: function(oDomNode) {
				const matched = [];
				const router = this.getRouterFor(oDomNode);
				const handler = (oEvent) => {
					matched.push(oEvent.getParameters());
				};
				return {
					startTrace: function() {
						if (!router) {
							throw new Error("Router not found");
						}
						router.attachRouteMatched(handler);
					},

					stopTrace: function() {
						router.detachRouteMatched(handler);
					},

					getMatched: function() {
						return matched;
					}
				};
			},

			views: scope({
				/**
				 * Gets a view with a specific name
				 * @param {string} sName Name of the view
				 * @returns {undefined | sap.ui.core.mvc.View} View instance if found or undefined if not
				 */
				get: function(sName) {
					return createdViews[sName];
				},

				/**
				 * Gets all views with their controller extensions
				 */
				all: function() {
					return createdViews;
				}
			}),
			spies
		})
	};
});
