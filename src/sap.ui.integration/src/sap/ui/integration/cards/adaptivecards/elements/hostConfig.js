/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	return function () {
		return {
			"spacing": {
				"small": 8, // .sapUiTinyMarginTop
				"default": 16, // .sapUiSmallMarginTop
				"medium": 32, // .sapUiMediumMarginTop
				"large": 48, // .sapUiLargeMarginTop
				"extraLarge": 48, // .sapUiLargeMarginTop
				"padding": 16 // cozy and compact padding for card content
			},
			"separator": {
				"lineThickness": 1,
				"lineColor": "var(--sapToolbar_SeparatorColor)"
			},
			"supportsInteractivity": true,
			"fontTypes": {
				"default": {
					"fontFamily": "var(--sapFontFamily)",
					"fontSizes": {
						"small": 12, //@sapMFontSmallSize
						"default": 14, // @sapMFontMediumSize
						"medium": 14, // @sapMFontMediumSize
						"large": 16, // @sapMFontLargeSize
						"extraLarge": 20
					}
				},
				// default for monoscape
				"monospace": {}
			},
			"containerStyles": {
				"default": {
					// in order to get out of the box the card content background or use
					// CSS variable for tile background
					"backgroundColor": "transparent",
					"foregroundColors": {
						"default": {
							"default": "var(--sapTextColor)",
							"subtle": "var(--sapContent_LabelColor)"
						},
						"accent": {
							"default": "var(--sapInformativeTextColor)"
						},
						"attention": {
							"default": "var(--sapNegativeTextColor)"
						},
						"good": {
							"default": "var(--sapPositiveTextColor)"
						},
						"warning": {
							"default": "var(--sapCriticalTextColor)"
						}
					}
				},
				"emphasis": {
					"backgroundColor": "var(--sapTile_Background)",
					"foregroundColors": {
						"default": {
							"default": "var(--sapTextColor)"
						},
						"accent": {
							"default": "var(--sapInformativeTextColor)"
						},
						"attention": {
							"default": "var(--sapNegativeTextColor)"
						},
						"good": {
							"default": "var(--sapPositiveTextColor)"
						},
						"warning": {
							"default": "var(--sapCriticalTextColor)"
						}
					}
				},
				"accent": {
					"backgroundColor": "var(--sapInformationBackground)",
					"foregroundColors": {
						"default": {
							"default": "var(--sapTextColor)"
						},
						"accent": {
							"default": "var(--sapInformativeTextColor)"
						},
						"attention": {
							"default": "var(--sapNegativeTextColor)"
						},
						"good": {
							"default": "var(--sapPositiveTextColor)"
						},
						"warning": {
							"default": "var(--sapCriticalTextColor)"
						}
					}
				},
				"good": {
					"backgroundColor": "var(--sapSuccessBackground)",
					"foregroundColors": {
						"default": {
							"default": "var(--sapTextColor)"
						},
						"accent": {
							"default": "var(--sapInformativeTextColor)"
						},
						"attention": {
							"default": "var(--sapNegativeTextColor)"
						},
						"good": {
							"default": "var(--sapPositiveTextColor)"
						},
						"warning": {
							"default": "var(--sapCriticalTextColor)"
						}
					}
				},
				"attention": {
					"backgroundColor": "var(--sapErrorBackground)",
					"foregroundColors": {
						"default": {
							"default": "var(--sapTextColor)"
						},
						"accent": {
							"default": "var(--sapInformativeTextColor)"
						},
						"attention": {
							"default": "var(--sapNegativeTextColor)"
						},
						"good": {
							"default": "var(--sapPositiveTextColor)"
						},
						"warning": {
							"default": "var(--sapCriticalTextColor)"
						}
					}
				},
				"warning": {
					"backgroundColor": "var(--sapWarningBackground)",
					"foregroundColors": {
						"default": {
							"default": "var(--sapTextColor)"
						},
						"accent": {
							"default": "var(--sapInformativeTextColor)"
						},
						"attention": {
							"default": "var(--sapNegativeTextColor)"
						},
						"good": {
							"default": "var(--sapPositiveTextColor)"
						},
						"warning": {
							"default": "var(--sapCriticalTextColor)"
						}
					}
				}
			}
		};
	};
});
