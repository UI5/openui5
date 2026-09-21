sap.ui.define([
	"sap/ui/thirdparty/jquery"
	], function (jQuery) {
	"use strict";

	// check whether suite-ui-commons is available
	var bSuiteUiCommonsAvailable = false;
	jQuery.ajax({
		type: "HEAD",
		url: sap.ui.require.toUrl("sap/suite/ui/commons/library.js"),
		async: false,
		success: function() {
			bSuiteUiCommonsAvailable = true;
		}
	});

	return {
		name: "QUnit TestSuite for sap.ui.integration",
		defaults: {
			skip: bSuiteUiCommonsAvailable,
			qunit: {
				version: "edge"
			},
			sinon: {
				version: "edge"
			},
			ui5: {
				language: "en",
				compatVersion: "edge",
				libs: ["sap.f", "sap.m", "sap.ui.integration"], // Libraries to load upfront in addition to the library which is tested, if null no libs are loaded
				noConflict: true,
				// preload: "auto",
				"xx-waitForTheme": "init",
				resourceroots: {
					"qunit": "test-resources/sap/ui/integration/qunit/"
				}
			},
			coverage: {
				only: ["sap/ui/integration"]
			},
			autostart: true,
			page: "test-resources/sap/ui/integration/qunit/testsandbox.qunit.html?test={name}"
		},
		tests: {
			"Card": {
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card"
					]
				},
				module: [
					'./Card.qunit',
					'./CardDesigntime.qunit'
				]
			},
			"CardAsTile": { },
			"CardCleanup": { },
			"CardCustomSettings": {
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card"
					]
				}
			},
			"CardPagination": { },
			"CardLoading": {
				ui5: {
					libs: ["sap.ui.integration"]
				},
				coverage: {
					only: [
						"sap/ui/integration/cards/Header",
						"sap/f/cards/HeaderRenderer",
						"sap/ui/integration/cards/NumericHeader",
						"sap/f/cards/NumericHeaderRenderer",
						"sap/f/cards/NumericSideIndicator",
						"sap/f/cards/NumericSideIndicatorRenderer",
						"sap/ui/integration/cards/BaseContent",
						"sap/ui/integration/util/LoadingProvider"
					]
				},
				module: [
					'./loading/CardLoading.qunit'
				]
			},
			"CardExtension": {},
			"CardFormatters": {
				module: [
					"./formatters/CardFormatters.qunit",
					"./formatters/DateTimeFormatter.qunit",
					"./formatters/IconFormatter.qunit",
					"./formatters/InitialsFormatters.qunit",
					"./formatters/NumberFormatter.qunit",
					"./formatters/TextFormatter.qunit"
				]
			},
			"CardHostAndExtension": {},
			"CardMeasurements": {},
			"CardReadyState": {},
			"CardRole": { },
			"CardHost": {
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card",
						"sap/ui/integration/Host"
					]
				}
			},
			"CardContextDependencies": {
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card"
					]
				}
			},
			"CardDataHandling": {},
			"CardDataHandlingWithMock": {
				sinon: {
					version: "1"
				},
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card",
						"sap/ui/integration/util/RequestDataProvider",
						"sap/ui/integration/util/DataProvider"
					]
				}
			},
			"CardParameters": {},
			"integration/bundle/IntegrationBundle": {
			},
			"UI5InputText": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputText"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputText.qunit'
				]
			},
			"UI5InputNumber": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputNumber"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputNumber.qunit'
				]
			},
			"UI5InputToggle": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputToggle"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputToggle.qunit'
				]
			},
			"UI5InputDate": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputDate"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputDate.qunit'
				]
			},
			"UI5InputChoiceSet": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputChoiceSet"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputChoiceSet.qunit'
				]
			},
			"UI5InputTime": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputTime"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputTime.qunit'
				]
			},
			"ActionRender": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/overwrites/ActionRender"]
				},
				module: [
					'./cards/AdaptiveContent/ActionRender.qunit'
				]
			},
			"AdaptiveContentIntegration": {
				title: "Opa test Page for sap.f.AdaptiveContent",
				module: [
					'./cards/AdaptiveContent/AdaptiveContentIntegration.opa.qunit'
				]
			},
			"bindingFeatures/DateRange": {
				coverage: {
					only: ["sap/ui/integration/bindingFeatures/DateRange"]
				}
			},
			"cardbundle/CardStaticResources": {},
			"cards/Header": {},
			"cards/NumericHeader": {},
			"cards/HeaderInfoSection": {},
			"cards/BaseContent": {},
			"cards/AdaptiveCard": {},
			"cards/AnalyticalCard": {},
			"cards/CalendarCard": {},
			"cards/ComponentCard": {},
			"cards/ListCard": {},
			"cards/TableCard": {},
			"cards/ObjectCard": {},
			"cards/TimelineCard": {
				skip: !bSuiteUiCommonsAvailable
			},
			"cards/WebPageCard": {},
			"cards/AnalyticsCloudContent": {
				coverage: {
					only: [
						"sap/ui/integration/cards/AnalyticsCloudContent"
					]
				}
			},
			"cards/Footer": {},
			"cards/actions/CardActions": {
				module: [
					"./cards/actions/CardActions.qunit",
					"./cards/actions/CardInGridContainerActions.qunit",
					"./cards/actions/SemanticRoleListItemCardActions.qunit",
					"./cards/actions/ShowHideCardActions.qunit",
					"./cards/actions/SubmitAction.qunit"
				],
				coverage: {
					only: [
						"sap/ui/integration/cards/actions/",
						"sap/ui/integration/widgets/Card",
						"sap/ui/integration/util/openCardDialog"
					]
				}
			},
			"cards/filters/CardFiltering": {
				module: [
					"./cards/filters/CardFiltering.qunit",
					"./cards/filters/DateRangeFilter.qunit",
					"./cards/filters/FilterBarFactory.qunit",
					"./cards/filters/SearchFilter.qunit",
					"./cards/filters/SelectFilter.qunit",
					"./cards/filters/ComboBoxFilter.qunit"
				],
				coverage: {
					only: [
						"sap/ui/integration/cards/filters/",
						"sap/ui/integration/widgets/Card"
					]
				}
			},
			"controls/ActionsToolbar": {},
			"controls/ActionsStrip": {
				coverage: {
					only: [
						"sap/ui/integration/controls/ActionsStrip"
					]
				}
			},
			"controls/BlockingMessage": {
				coverage: {
					only: [
						"sap/ui/integration/controls/BlockingMessage",
						"sap/ui/integration/util/ErrorHandler"
					]
				}
			},
			"controls/ListContentItem": {},
			"controls/Microchart": {},
			"controls/MicrochartLegend": {},
			"customElements/CustomElements": {
				ui5: {
					libs: ["sap.ui.integration"]
				},
				coverage: {
					only: [
						"sap/ui/integration/customElements/"
					]
				}
			},
			"util/AnalyticsCloudHelper": {
				coverage: {
					only: ["sap/ui/integration/util/AnalyticsCloudHelper"]
				}
			},
			"util/BindingHelper": {
				coverage: {
					only: ["sap/ui/integration/util/BindingHelper"]
				}
			},
			"util/JSONBindingHelper": {
				coverage: {
					only: ["sap/ui/integration/util/JSONBindingHelper"]
				}
			},
			"util/BindingResolver": {
				coverage: {
					only: ["sap/ui/integration/util/BindingResolver"]
				}
			},
			"util/CardManifest": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardManifest"
					]
				}
			},
			"util/CardMerger": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				},
				sinon: false
			},
			"util/CardMergerWithChildCard": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				}
			},
			"util/CardMergerWithObjectPropertyTranslations": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				},
				sinon: false
			},
			"util/CardMergerWithOPTForUnMatchLanguages": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				},
				sinon: false
			},
			"util/CardMergerWithStringForUnMatchLanguages": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				},
				sinon: false
			},
			"util/CardMergerWithTranslationsOfUnMatchLanguages": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				},
				sinon: false
			},
			"util/CardMergerWithTranslationsOfUnderlineLanguages": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				},
				sinon: false
			},
			"util/CardObserver": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardObserver"
					]
				}
			},
			"util/SorterHelper": {
				coverage: {
					only: [
						"sap/ui/integration/util/SorterHelper"
					]
				}
			},
			"util/ContentFactory": {},
			"util/ManifestResolver": {},
			"util/SkeletonCard": {},
			"util/loadCardEditor": {},
			"util/openCardDialog":  {
				coverage: {
					only: [
						"sap/ui/integration/util/openCardDialog"
					]
				}
			},
			"util/openCardShowMore":  {
				coverage: {
					only: [
						"sap/ui/integration/util/openCardShowMore"
					]
				}
			},
			"util/subtitleToSubTitle": {},
			"model/ContextModel": {
				coverage: {
					only: [
						"sap/ui/integration/model/ContextModel"
					]
				}
			},
			"model/ObservableModel": {
				coverage: {
					only: [
						"sap/ui/integration/model/ObservableModel"
					]
				},
				sinon: {
					useFakeTimers: true
				}
			},
			"util/DataProvider": {
				module: [
					"./util/DataProvider.qunit",
					"./util/RequestDataProvider.qunit",
					"./util/CacheAndRequestDataProvider.qunit"
				],
				coverage: {
					only: [
						"sap/ui/integration/util/DataProviderFactory",
						"sap/ui/integration/util/DataProvider",
						"sap/ui/integration/util/RequestDataProvider",
						"sap/ui/integration/util/CacheAndRequestDataProvider"
					]
				}
			},
			"util/Destinations": {
				coverage: {
					only: ["sap/ui/integration/util/Destinations"]
				}
			},
			"util/Duration": {
				coverage: {
					only: ["sap/ui/integration/util/Duration"]
				}
			},
			"util/CsrfTokenHandler": {
				coverage: {
					only: ["sap/ui/integration/util/CsrfTokenHandler"]
				}
			},
			"util/Utils": {
				coverage: {
					only: [
						"sap/ui/integration/util/Utils"
					]
				},
				sinon: {
					useFakeTimers: true
				}
			},
			"util/OAuth3LOHelper": {
				coverage: {
					only: [
						"sap/ui/integration/util/OAuth3LOHelper"
					]
				},
				sinon: {
					useFakeTimers: true
				}
			},
			"delegate/OverflowHandler": {
				coverage: {
					only: [
						"sap/ui/integration/delegate/OverflowHandler"
					]
				}
			},
			"delegate/PreventKeyboardScrolling": {
				coverage: {
					only: [
						"sap/ui/integration/delegate/PreventKeyboardScrolling"
					]
				}
			},
			"extensions/OAuth3LO": {
				coverage: {
					only: [
						"sap/ui/integration/extensions/OAuth3LO"
					]
				}
			},
			"Editor Testsuite": {
				page: "test-resources/sap/ui/integration/qunit/testsuite.editor.qunit.html"
			},
			"Generic Testsuite": {
				page: "test-resources/sap/ui/integration/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});
