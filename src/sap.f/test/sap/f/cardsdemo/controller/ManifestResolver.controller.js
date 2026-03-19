sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/util/SkeletonCard"
], function (Controller, SkeletonCard) {
	"use strict";

	var aManifests = {
		"objectCard": {
			path: "sap/f/cardsdemo/bundles/objectbundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/objectbundle/"
		},
		"objectCardFormInputs": {
			path: "sap/f/cardsdemo/cardcontent/objectcontent/formWithValidations.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/objectcontent/"
		},
		"calendarCard": {
			path: "sap/f/cardsdemo/bundles/calendarBundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/calendarBundle/"
		},
		"listCard": {
			path: "sap/f/cardsdemo/bundles/listbundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/listbundle/"
		},
		"listCardGrouping": {
			path: "sap/f/cardsdemo/cardcontent/listContent/groups.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"listCardNoData": {
			path: "sap/f/cardsdemo/cardcontent/listContent/noData.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"listCardBulletGraphActions": {
			path: "sap/f/cardsdemo/cardcontent/listContent/bulletGraphAndActions.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"dynamicStatusText": {
			path: "sap/f/cardsdemo/bundles/dynamicStatusTextBundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/dynamicStatusTextBundle/"
		},
		"stackedBar": {
			path: "sap/f/cardsdemo/cardcontent/listContent/stackedBar.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"withDataError": {
			path: "sap/f/cardsdemo/cardcontent/listContent/withDataError.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"tableCard1": {
			path: "sap/f/cardsdemo/bundles/tablebundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/tablebundle/"
		},
		"tableCard2": {
			path: "sap/f/cardsdemo/cardcontent/tablecontent/bindings.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/tableContent/"
		},
		"tableCardGroups": {
			path: "sap/f/cardsdemo/cardcontent/tablecontent/groups.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/tableContent/"
		},
		"tableCardNoData": {
			path: "sap/f/cardsdemo/cardcontent/tablecontent/noData.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/tableContent/"
		},
		"timelineCard": {
			path: "sap/f/cardsdemo/bundles/timelinebundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/timelinebundle/"
		},
		"filtersCard": {
			path: "sap/f/cardsdemo/cardcontent/cardFilters/manifest.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/cardFilters/"
		},
		"cardWithSevereError": {
			path: "sap/f/cardsdemo/cardcontent/withSevereError.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/"
		},
		"cardWithExtension": {
			path: "sap/f/cardsdemo/cardcontent/withExtension.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/"
		},
		"customSettings": {
			path: "sap/f/cardsdemo/cardcontent/customSettings/manifest.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/customSettings/",
			customSettings: {
				feature1: true,
				feature2: true,
				feature3: "default value",
				showHeader: true,
				isPreview: true
			}
		},
		"customSettingsSDKOnly": {
			path: "sap/f/cardsdemo/cardcontent/customSettings/sdkOnly.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/customSettings/",
			customSettings: {
				feature1: true,
				feature2: false,
				showHeader: true,
				isPreview: false
			}
		},
		"customSettingsManifestOnly": {
			path: "sap/f/cardsdemo/cardcontent/customSettings/manifestOnly.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/customSettings/"
		},
		"customSettingsComplexBindings": {
			path: "sap/f/cardsdemo/cardcontent/customSettings/complexBindings.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/customSettings/",
			customSettings: {
				minValue: 10,
				maxValue: 80,
				threshold: 65,
				prefix: "SDK: ",
				enableWarnings: false
			}
		},
		"customSettingsWithObjects": {
			path: "sap/f/cardsdemo/cardcontent/customSettings/withObjects.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/customSettings/",
			customSettings: {
				theme: {
					primaryColor: "#007bff",
					secondaryColor: "#6c757d",
					fontSize: 14
				},
				features: ["feature1", "feature2", "feature3"],
				apiConfig: {
					endpoint: "https://sdk.example.com/api",
					timeout: 5000
				}
			}
		},
		"customSettingsObjectOverride": {
			path: "sap/f/cardsdemo/cardcontent/customSettings/objectOverride.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/customSettings/",
			customSettings: {
				theme: {
					primaryColor: "#007bff",
					secondaryColor: "#6c757d",
					fontSize: 14
				},
				metadata: {
					version: "1.0.0",
					author: "SDK"
				}
			}
		},
		"customSettingsObjectNoOverride": {
			path: "sap/f/cardsdemo/cardcontent/customSettings/objectNoOverride.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/customSettings/",
			customSettings: {
				apiConfig: {
					endpoint: "https://sdk.example.com/api",
					timeout: 5000,
					retries: 3
				},
				features: ["analytics", "logging"]
			}
		}
	};

	return Controller.extend("sap.f.cardsdemo.controller.ManifestResolver", {

		onInit: function () {
			this.onManifestChange();
		},

		onManifestChange: function () {
			var sSelectedKey = this.byId("manifestId").getSelectedKey(),
				oManifest = aManifests[sSelectedKey];

			this.byId("baseUrlInp").setValue(sap.ui.require.toUrl(oManifest.baseUrl));

			fetch(sap.ui.require.toUrl(oManifest.path))
				.then(function (res) {
					return res.json();
				})
				.then(function (manifest) {
					this.byId("editor").setValue(JSON.stringify(manifest, null, "\t"));
				}.bind(this));
		},

		onResolveManifestPress: function () {
			this.resolveManifest();
		},

		resolveManifest: function () {
			const sSelectedKey = this.byId("manifestId").getSelectedKey();
			const oManifestConfig = aManifests[sSelectedKey];
			const oCard = new SkeletonCard({
					manifest: JSON.parse(this.byId("editor").getValue()),
					baseUrl: this.byId("baseUrlInp").getValue()
				});
			const errorOutput = this.byId("error");
			const output = this.byId("output");

			if (oManifestConfig.customSettings) {
				oCard.setProperty("customSettings", oManifestConfig.customSettings);
			}

			errorOutput.setVisible(false);
			output.setValue("");

			oCard.attachStateChanged(function () {
				oCard.resolveManifest()
					.then(function (res) {
						output.setValue(JSON.stringify(res, null, "\t"));
					});
			});

			oCard.startManifestProcessing();
		}
	});
});