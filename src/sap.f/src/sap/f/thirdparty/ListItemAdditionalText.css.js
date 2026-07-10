sap.ui.define(['exports', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/parameters-bundle.css'], (function (exports, Theme, jsxRuntime, parametersBundle_css) { 'use strict';

	Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
	Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
	var listItemAdditionalTextCss = `.ui5-li-additional-text{margin:0 .25rem;color:var(--sapNeutralTextColor);font-size:var(--sapFontSize);min-width:3.75rem;text-align:end;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

	exports.listItemAdditionalTextCss = listItemAdditionalTextCss;

}));
