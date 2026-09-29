sap.ui.define(['exports', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/parameters-bundle3.css'], (function (exports, ManagedStyles, parametersBundle_css, parametersBundle_css$1) { 'use strict';

	ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
	ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
	var UserSettingViewCss = `.ui5-user-settings-view-container{container-type:inline-size}.ui5-user-settings-view{padding:1rem}.user-settings-appearance-view-top-header{margin-top:.5rem}.user-settings-appearance-view-top-header::part(title){font-size:var(--sapFontHeader5Size)}
`;

	exports.UserSettingViewCss = UserSettingViewCss;

}));
