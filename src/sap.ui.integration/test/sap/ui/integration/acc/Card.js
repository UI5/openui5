sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/Page",
	"sap/m/App",
	"sap/ui/integration/ActionDefinition"
], function(Card, List, CustomListItem, Page, App, ActionDefinition) {
	"use strict";

	var oListCardInteractive_Manifest = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.highlight.list.card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "/quickLinks"
						}
					}
				],
				"title": "Top 5 Products",
				"subtitle": "These are the top sellers this month",
				"icon": {
					"src": "sap-icon://desktop-mobile"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [{
						"Name": "Comfort Easy",
						"Description": "32 GB Digital Assistant with high-resolution color screen",
						"Highlight": "Error"
					},
					{
						"Name": "ITelO Vault",
						"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
						"Highlight": "Warning"
					},
					{
						"Name": "Notebook Professional 15",
						"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
						"Highlight": "Success"
					},
					{
						"Name": "Ergo Screen E-I",
						"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
						"Highlight": "Information"
					},
					{
						"Name": "Laser Professional Eco",
						"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
						"Highlight": "None"
					}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};
	var oListCard_Manifest = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.highlight.list.card",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "5 Products - no actions",
				"subtitle": "These are the top sellers this month",
				"icon": {
					"src": "sap-icon://desktop-mobile"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [{
						"Name": "Comfort Easy",
						"Description": "32 GB Digital Assistant with high-resolution color screen",
						"Highlight": "Error"
					},
					{
						"Name": "ITelO Vault",
						"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
						"Highlight": "Warning"
					},
					{
						"Name": "Notebook Professional 15",
						"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
						"Highlight": "Success"
					},
					{
						"Name": "Ergo Screen E-I",
						"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
						"Highlight": "Information"
					},
					{
						"Name": "Laser Professional Eco",
						"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
						"Highlight": "None"
					}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};

	var oNumericHeaderInteractive = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.line.card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "/quickLinks"
						}
					}
				],
				"type": "Numeric",
				"data": {
					"json": {
						"number": "65.34",
						"unit": "K",
						"trend": "Down",
						"state": "Error",
						"target": {
							"number": 100,
							"unit": "K"
						},
						"deviation": {
							"number": 34.7
						},
						"details": "Q1, 2018"
					}
				},
				"title": "Project Cloud Transformation",
				"subtitle": "Revenue",
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "{number}",
					"unit": "{unit}",
					"trend": "{trend}",
					"state": "{state}"
				},
				"details": "{details}",
				"sideIndicators": [
					{
						"title": "Target",
						"number": "{target/number}",
						"unit": "{target/unit}"
					},
					{
						"title": "Deviation",
						"number": "{deviation/number}",
						"unit": "%"
					}
				]
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant with high-resolution color screen",
							"Highlight": "Error"
						},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Highlight": "Warning"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};

	var oNumericHeader = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.line.card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"type": "Numeric",
				"data": {
					"json": {
						"number": "65.34",
						"unit": "K",
						"trend": "Down",
						"state": "Error",
						"target": {
							"number": 100,
							"unit": "K"
						},
						"deviation": {
							"number": 34.7
						},
						"details": "Q1, 2018"
					}
				},
				"title": "Project Cloud Transformation - no actions",
				"subtitle": "Revenue",
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "{number}",
					"unit": "{unit}",
					"trend": "{trend}",
					"state": "{state}"
				},
				"details": "{details}",
				"sideIndicators": [
					{
						"title": "Target",
						"number": "{target/number}",
						"unit": "{target/unit}"
					},
					{
						"title": "Deviation",
						"number": "{deviation/number}",
						"unit": "%"
					}
				]
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant with high-resolution color screen",
							"Highlight": "Error"
						},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Highlight": "Warning"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};

	var oListCardWithHeaderStateIconManifest = {
		"sap.app": {
			"id": "card.explorer.header.message.icon.card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "{parameters>/title/value}",
				"subtitle": "{parameters>/subtitle/value}",
				"icon": {
					"state": "Warning"
				},
				"status": {
					"text": "{parameters>/maxItems/value} of 20"
				}
			},
			"configuration": {
				"parameters": {
					"title": {
						"value": "Expiring Products"
					},
					"subtitle": {
						"value": "These products are about to expire"
					},
					"maxItems": {
						"value": 4
					}
				}
			},
			"content": {
				"data": {
					"json": [{
						"Name": "Comfort Easy",
						"Description": "32 GB Digital Assistant with high-resolution color screen",
						"Highlight": "Warning"
					},
					{
						"Name": "ITelO Vault",
						"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
						"Highlight": "Warning"
					}]
				},
				"maxItems": "{parameters>/maxItems/value}",
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};

	var oActionableHeaderListCardManifest = {
		"_version": "1.15.0",
		"sap.app": {
			"id": "cardsdemo.defaultHeader.actionableHeader",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Quick Links",
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com/index.html"
						}
					}
				]
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Career",
							"icon": "sap-icon://leads",
							"url": "https://www.sap.com/index.html"
						},
						{
							"Name": "Company Directory",
							"icon": "https://www.sap.com/index.html"
						}
					]
				},
				"item": {
					"icon": {
						"src": "{icon}"
					},
					"title": "{Name}",
					"actions": [
						{
							"type": "Navigation",
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}"
							}
						}
					]
				}
			}
		}
	};

	var oListCardWithTruncatedHeaderManifest = {
		"sap.app": {
			"id": "cardsdemo.defaultHeader.card5",
			"type": "card"
		},
		"sap.card": {
			"header": {
				"title": "This Line is the Title of Card and a very very very very very very very very very very very very very very very very very very long one",
				"titleMaxLines": 1,
				"subtitle": " Thi is a Card subtitle and a very very  very very very very very very very very very very very very very very very very  very very long one",
				"subtitleMaxLines": 1,
				"icon": {
					"text": "GK"
				},
				"status": {
					"text": "Count"
				},
				"dataTimestamp": "{parameters>/NOW_ISO}"
			},
			"type": "List"
		}
	};

	var oNumericHeaderListCardWithIndicatorsManifest = {
		"sap.app": {
			"id": "cardsdemo.kpiManifests.kpicard8",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"type": "Numeric",
				"data": {
					"json": {
						"n": "56",
						"u": "%",
						"trend": "Up",
						"valueColor": "Good"
					}
				},
				"title": "Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
				"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
				"status": {
					"text": "On Track"
				},
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "{n}",
					"unit": "{u}",
					"trend": "{trend}",
					"state": "{valueColor}"
				},
				"details": "Details, additional information, will directly truncate after there is no more space.Details, additional information, will directly truncate after there is no more space.",
				"dataTimestamp": "{parameters>/NOW_ISO}",
				"sideIndicators": [
					{
						"title": "Target Long Target Long Target Long Target Long",
						"number": "3252.234",
						"unit": "K"
					},
					{
						"title": "Deviation Long Deviation Deviation Long Deviation",
						"number": "22.43",
						"unit": "%"
					}
				]
			}
		}
	};

	var oNumericHeaderCardWithInfoSectionManifest = {
		"sap.card": {
			"header": {
				"type": "Numeric",
				"actions": [
					{
						"type": "Navigation"
					}
				],
				"data": {
					"json": {
						"number": "65.34",
						"unit": "K",
						"trend": "Down",
						"state": "Error",
						"target": {
							"number": 100,
							"unit": "K"
						},
						"deviation": {
							"number": 34.7,
							"state": "Critical"
						},
						"details": "Q1, 2018"
					}
				},
				"title": "Project Cloud Transformation",
				"subtitle": "Revenue",
				"unitOfMeasurement": "EUR",
				"infoSection": {
					"rows": [
						{
							"items": [
								{
									"type": "Status",
									"value": "On Track",
									"state": "Success",
									"inverted": true,
									"showStateIcon": true
								},
								{
									"type": "Status",
									"value": "OKR Relevant",
									"state": "None",
									"inverted": true,
									"showStateIcon": true
								},
								{
									"type": "Status",
									"value": "Interactive Status",
									"state": "Information",
									"inverted": true,
									"showStateIcon": true,
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "https://www.sap.com",
											"target": "_blank"
										}
									}]
								}
							]
						}
					]
				},
				"mainIndicator": {
					"number": "{number}",
					"unit": "{unit}",
					"trend": "{trend}",
					"state": "{state}"
				},
				"details": "{details}",
				"sideIndicators": [
					{
						"title": "Target",
						"number": "{target/number}",
						"unit": "{target/unit}"
					},
					{
						"title": "Deviation",
						"number": "{deviation/number}",
						"unit": "%",
						"state": "{deviation/state}"
					}
				]
			}
		}
	};

	var oCardWithCustomButtonManifest = {
		"sap.card": {
			"header": {
				"type": "Numeric",
				"data": {
					"json": {
						"number": "65.34",
						"unit": "K",
						"trend": "Down",
						"state": "Error",
						"target": {
							"number": 100,
							"unit": "K"
						},
						"deviation": {
							"number": 34.7,
							"state": "Critical"
						},
						"details": "Q1, 2018"
					}
				},
				"title": "Project Cloud Transformation",
				"subtitle": "Revenue",
				"unitOfMeasurement": "EUR",
				"infoSection": {
					"rows": [
						{
							"items": [
								{
									"type": "Status",
									"value": "On Track",
									"state": "Success",
									"inverted": true,
									"showStateIcon": true
								},
								{
									"type": "Status",
									"value": "OKR Relevant",
									"state": "None",
									"inverted": true,
									"showStateIcon": true
								},
								{
									"type": "Status",
									"value": "Interactive Status",
									"state": "Information",
									"inverted": true,
									"showStateIcon": true,
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "https://www.sap.com",
											"target": "_blank"
										}
									}]
								}
							]
						}
					]
				},
				"mainIndicator": {
					"number": "{number}",
					"unit": "{unit}",
					"trend": "{trend}",
					"state": "{state}"
				},
				"details": "{details}",
				"sideIndicators": [
					{
						"title": "Target",
						"number": "{target/number}",
						"unit": "{target/unit}"
					},
					{
						"title": "Deviation",
						"number": "{deviation/number}",
						"unit": "%",
						"state": "{deviation/state}"
					}
				]
			}
		}
	};

	var oFirstListCard = new Card({
		manifest: {
			"sap.app": {
				"id": "card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Card 1",
					"subtitle": "This is the first card"
				},
				"content": {
					"data": {
						"json": [
							{ "Name": "Item 1", "Description": "Description 1" },
							{ "Name": "Item 2", "Description": "Description 2" }
						]
					},
					"item": {
						"title": "{Name}",
						"description": "{Description}"
					}
				}
			}
		},
		width: "300px"
	});

	var oSecondListCard = new Card({
		manifest: {
			"sap.app": {
				"id": "card2"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Card 2",
					"subtitle": "This is the second card"
				},
				"content": {
					"data": {
						"json": [
							{ "Name": "Item A", "Description": "Description A" },
							{ "Name": "Item B", "Description": "Description B" }
						]
					},
					"item": {
						"title": "{Name}",
						"description": "{Description}"
					}
				}
			}
		},
		width: "300px"
	});

	var oList = new List({
		width: "300px",
		items: [
			new CustomListItem({
				content: [oFirstListCard],
				role: "listitem"
			}),
			new CustomListItem({
				content: [oSecondListCard],
				role: "listitem"
			})
		]
	});

	var oListCardInteractive = new Card({
		manifest: oListCardInteractive_Manifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oListCard = new Card({
		manifest: oListCard_Manifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oNumericHeaderCardInteractive = new Card({
		manifest: oNumericHeaderInteractive,
		width: "400px",
		height: "300px"
	}).addStyleClass("sapUiSmallMargin");

	var oNumericHeaderCard = new Card({
		manifest: oNumericHeader,
		width: "400px",
		height: "300px"
	}).addStyleClass("sapUiSmallMargin");

	var oListCardWithHeaderStateIcon = new Card({
		manifest: oListCardWithHeaderStateIconManifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oActionableHeaderListCard = new Card({
		manifest: oActionableHeaderListCardManifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oListCardWithTruncatedHeader = new Card({
		manifest: oListCardWithTruncatedHeaderManifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oNumericHeaderListCardWithIndicators = new Card({
		manifest: oNumericHeaderListCardWithIndicatorsManifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oNumericHeaderCardWithInfoSection = new Card({
		manifest: oNumericHeaderCardWithInfoSectionManifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oCardWithCustomButton = new Card({
		manifest: oCardWithCustomButtonManifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	oCardWithCustomButton.attachManifestReady(function () {
		oCardWithCustomButton.addActionDefinition(new ActionDefinition({
			type: "Custom",
			text: "Button"
		}));
	});

	var oPage = new Page("myPage", {
		content: [
			oListCardInteractive,
			oListCard,
			oNumericHeaderCardInteractive,
			oNumericHeaderCard,
			oListCardWithHeaderStateIcon,
			oActionableHeaderListCard,
			oListCardWithTruncatedHeader,
			oNumericHeaderListCardWithIndicators,
			oNumericHeaderCardWithInfoSection,
			oCardWithCustomButton,
			oList
		]
	}),
		oApp = new App("myApp", {
			initialPage:"myPage"
		});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
