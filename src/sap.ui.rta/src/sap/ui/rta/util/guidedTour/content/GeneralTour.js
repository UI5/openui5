/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/fl/initial/api/Version"
], function(
	merge,
	Element,
	Lib,
	Version
) {
	"use strict";

	const GeneralTour = {};

	const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	function filterAvailableBurgerMenuActions(oGeneralTour) {
		const oCurrentGeneralTour = merge({}, oGeneralTour);
		const oControlsModelData = Element.getElementById("sapUIRta_toolbar").getModel("controls").getData();
		const oVersionsModelData = Element.getElementById("sapUIRta_toolbar").getModel("versions").getData();
		const aAvailableBurgerMenuActions = {
			newFeaturesOverview: true,
			translation: oControlsModelData.translation.visible,
			generalTour: true,
			appVariantMenu: oControlsModelData.appVariantMenu.visible,
			restore: oControlsModelData.restore.visible,
			highlightAllChanges: true,
			feedback: oControlsModelData.feedbackButton.visible,
			contextBasedAdaptations: oControlsModelData.contextBasedAdaptation.visible,
			discard: oVersionsModelData.displayedVersion === Version.Number.Draft,
			activate: true,
			publish: oVersionsModelData.publishVersionVisible,
			manageVersions: true
		};

		// Find the index of the burger menu step
		const nBurgerMenuStepIndex = oCurrentGeneralTour.steps.findIndex((oStep) =>
			oStep.title === oTextResources.getText("TIT_TOUR_GENERAL_STEP_BURGER_MENU_TITLE")
		);
		// Set the available actions
		oCurrentGeneralTour.steps[nBurgerMenuStepIndex].listContent = oCurrentGeneralTour.steps[nBurgerMenuStepIndex].listContent.filter((oItem) =>
			aAvailableBurgerMenuActions[oItem.id]
		);

		const nVersionsMenuStepIndex = oCurrentGeneralTour.steps.findIndex((oStep) =>
			oStep.title === oTextResources.getText("TIT_TOUR_GENERAL_STEP_VERSIONS_DROPDOWN_TITLE")
		);
		// Set the available actions
		oCurrentGeneralTour.steps[nVersionsMenuStepIndex].listContent = oCurrentGeneralTour.steps[nVersionsMenuStepIndex].listContent.filter((oItem) =>
			aAvailableBurgerMenuActions[oItem.id]
		);

		return oCurrentGeneralTour;
	}

	/**
	 * The `oGeneralTourContent` object defines the steps for the Guided Tour in the RTA toolbar.
	 * Each step provides information about a specific feature or functionality.
	 *
	 * To add a new step, include an object in the `steps` array with the following structure:
	 *
	 * {
	 *   title: <Title of the step>,
	 *   description: <Description of the step>,
	 *   listContent: [
	 *     {
	 *       id: <id of the action>,
	 *       title: <Title of the action>,
	 *       description: <Description of the action>,
	 *       icon: <Icon representing the action>
	 *     }
	 *   ],
	 *   markerSelector: <Selector for the UI element to highlight during the step>,
	 *   actionSelectors: [<Selectors for elements to trigger actions on during the steps>],
	 *   waitForElement: <Boolean indicating whether to wait for the element to become visible>
	 * }
	 */

	const oGeneralTourContent = {
		initialStateSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_modeSwitcher"],
		steps: [
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_NAVIGATION_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_NAVIGATION_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_modeSwitcher",
				actionSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_modeSwitcher"],
				action: { name: "fireChange", parameterName: "state", parameterValue: false }
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_UI_ADAPTATION_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_UI_ADAPTATION_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_modeSwitcher",
				actionSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_modeSwitcher"],
				action: { name: "fireChange", parameterName: "state", parameterValue: true }
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_EXIT_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_EXIT_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_exit"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_UNDO_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_UNDO_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_undo"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_REDO_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_REDO_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_redo"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_SAVE_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_SAVE_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_save",
				actionSelectors: []
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_VERSIONS_DROPDOWN_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_VERSIONS_DROPDOWN_DESCRIPTION"),
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_versionButton",
				listContent: [
					{
						id: "discard",
						title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_DISCARD_BUTTON_TITLE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_DISCARD_BUTTON_DESCRIPTION"),
						icon: "sap-icon://delete"
					},
					{
						id: "activate",
						title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_ACTIVATE_VERSION_BUTTON_TITLE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_ACTIVATE_VERSION_BUTTON_DESCRIPTION"),
						icon: "sap-icon://activate"
					},
					{
						id: "publish",
						title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_PUBLISH_BUTTON_TITLE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_PUBLISH_BUTTON_DESCRIPTION"),
						icon: "sap-icon://shipping-status"
					},
					{
						id: "manageVersions",
						title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_MANAGE_VERSIONS_BUTTON_TITLE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_MANAGE_VERSIONS_BUTTON_DESCRIPTION"),
						icon: "sap-icon://dimension"
					}
				]
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_BACK_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BACK_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_backButton"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_BURGER_MENU_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_DESCRIPTION"),
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_actionsMenu",
				listContent: [
					{
						id: "translation",
						title: oTextResources.getText("BTN_TRANSLATE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_TRANSLATIONS"),
						icon: "sap-icon://translate"
					},
					{
						id: "contextBasedAdaptations",
						title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_CONTEXT_BASED_ADAPTATIONS_TITLE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_CONTEXT_BASED_ADAPTATIONS_DESCRIPTION"),
						icon: "sap-icon://switch-views"
					},
					{
						id: "feedback",
						title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_FEEDBACK_BUTTON_TITLE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_FEEDBACK_BUTTON_DESCRIPTION"),
						icon: "sap-icon://feedback"
					},
					{
						id: "appVariantMenu",
						title: oTextResources.getText("BTN_MANAGE_APPS_TXT"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_APP_VARIANTS"),
						icon: "sap-icon://switch-views"
					},
					{
						id: "restore",
						title: oTextResources.getText("BTN_RESTORE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_RESTORE"),
						icon: "sap-icon://reset"
					},
					{
						id: "highlightAllChanges",
						title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_HIGHLIGHT_ALL_CHANGES_BUTTON_TITLE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_HIGHLIGHT_ALL_CHANGES_BUTTON_DESCRIPTION"),
						icon: "sap-icon://past"
					},
					{
						id: "newFeaturesOverview",
						title: oTextResources.getText("BTN_WHATS_NEW_DIALOG_OVERVIEW"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_NEW_FEATURES"),
						icon: "sap-icon://newspaper"
					},
					{
						id: "generalTour",
						title: oTextResources.getText("BTN_GUIDED_TOUR_START"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_GENERAL_TOUR"),
						icon: "sap-icon://map-3"
					}
				]
			}
		]
	};

	GeneralTour.getTourContent = function() {
		return filterAvailableBurgerMenuActions(oGeneralTourContent);
	};

	return GeneralTour;
});