/*!
 * ${copyright}
 */
/*
 * This is the UI5 Core Models configuration file for BeforePush.js
 *
 * You can find more information about how to configure the BeforePush test in the main test runner
 * file (BeforePush.js).
 */
sap.ui.define([
	"sap/ui/core/qunit/internal/testsuite.models.qunit"
], (oTestSuite) => {
	"use strict";

	const sCSS = `
		/* simple css inspired by ui5 theme */
		body {
			font-family: "72", "72full", Arial, Helvetica, sans-serif;
			font-size: 0.875rem;
			line-height: 1.4;
			color: #32363a;
			margin: 0.5rem 1rem;
		}
		h1 {
			font-size: 1.75rem;
			font-weight: 400;
			margin: 0;
		}
		h2 {
			font-size: 1.25rem;
			font-weight: 400;
			margin: 1rem 0 0.5rem 0;
		}
		a {
			color: #0070f2;
			text-decoration: none;
		}
		a:hover {
			text-decoration: underline;
		}
		#actions {
			margin-bottom: 0.5rem;
		}
		ul {
			list-style: none;
			padding: 0;
			margin: 0.5rem 0;
		}
		ol {
			margin-top: 0;
		}
		li > div {
			cursor: pointer;
		}
		#apps {
			border-collapse: collapse;
			width: 100%;
			margin-top: 0.5rem;
		}
		#apps td {
			padding: 0.15rem 1rem;
			border-bottom: 1px solid #e5e5e5;
		}
		#apps td:first-child {
			padding-left: 0;
		}
		#apps tr:hover {
			background-color: #ebf8ff;
		}
		#status:empty {
			display: none;
		}
	`;

	const oStyle = document.createElement('style');
	oStyle.textContent = sCSS;
	document.head.appendChild(oStyle);
	const sSuite = "Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/internal/testsuite.models.qunit&test=";

	const mTests = {
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/internal/samples/odata/twoFields/testsuite.qunit&test=OPA.TwoFields" : "both",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/internal/samples/odata/v2/SalesOrders/testsuite.qunit&test=OPA.SalesOrders" : "both",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/internal/samples/odata/v2/Products/testsuite.qunit&test=OPA.Products" : "both",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/odata/type/testsuite.odata.types.qunit&test=OPA.ViewTemplate.Types&supportAssistant=true" : "both",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/odata/type/testsuite.odata.types.qunit&test=OPA.ViewTemplate.Types&realOData=true" : "both",
		"../../../sap/m/demokit/cart/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/cart/testsuite.qunit&test=integration/opaTestsComponent": "both",
		"../../../sap/m/demokit/cart/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/cart/testsuite.qunit&test=integration/opaTestsGherkinComponent": "both",
		"qunit/internal/AnnotationParser.qunit.html?hidepassed&coverage" : "both"
	};

	const mApps = {};

	Object.keys(oTestSuite.tests).forEach((sTest) => {
		mTests[`${sSuite}${sTest}`] = "both";
	});

	// Type Samples
	mApps["TypeCurrency"] = ["demokit/sample/common/index.html?component=TypeCurrency"];
	mApps["TypeDateAsDate"] = ["demokit/sample/common/index.html?component=TypeDateAsDate"];
	mApps["TypeDateAsString"] = ["demokit/sample/common/index.html?component=TypeDateAsString"];
	mApps["TypeDateTime"] = ["demokit/sample/common/index.html?component=TypeDateTime"];
	mApps["TypeFileSize"] = ["demokit/sample/common/index.html?component=TypeFileSize"];
	mApps["TypeFloat"] = ["demokit/sample/common/index.html?component=TypeFloat"];
	mApps["TypeInteger"] = ["demokit/sample/common/index.html?component=TypeInteger"];
	mApps["TypeTimeAsTime"] = ["demokit/sample/common/index.html?component=TypeTimeAsTime"];

	// Format Samples
	mApps["NumberFormat"] = ["NumberFormat.html"];
	mApps["DateFormat"] = ["DateFormat.html"];

	// OData Types V2
	mApps["DateTimeV2"] = ["demokit/sample/common/index.html?component=odata.types.v2.DateTime"];
	mApps["DateTimeOffsetV2"] = ["demokit/sample/common/index.html?component=odata.types.v2.DateTimeOffset"];
	mApps["TimeV2"] = ["demokit/sample/common/index.html?component=odata.types.v2.Time"];

	// OData Types V4
	mApps["DateV4"] = ["demokit/sample/common/index.html?component=odata.types.v4.Date"];
	mApps["DateTimeOffsetV4"] = ["demokit/sample/common/index.html?component=odata.types.v4.DateTimeOffset"];
	mApps["TimeOfDayV4"] = ["demokit/sample/common/index.html?component=odata.types.v4.TimeOfDay"];

	// ViewTemplate.types Sample (the other ViewTemplate apps are owned by V4)
	mApps["ViewTemplate.types"] = [
		"demokit/sample/common/index.html?component=ViewTemplate.types",
		"demokit/sample/common/index.html?component=ViewTemplate.types&realOData=true",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/odata/type/testsuite.odata.types.qunit&test=OPA.ViewTemplate.Types&supportAssistant=true",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/odata/type/testsuite.odata.types.qunit&test=OPA.ViewTemplate.Types&realOData=true"
	];

	// OData V2 Internal Samples
	mApps["TwoFields"] = [
		"internal/samples/odata/twoFields/index.html",
		null,
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/internal/samples/odata/twoFields/testsuite.qunit&test=OPA.TwoFields"
	];
	mApps["Products"] = [
		"internal/samples/odata/v2/Products/index.html",
		"internal/samples/odata/v2/Products/index.html?realOData=true",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/internal/samples/odata/v2/Products/testsuite.qunit&test=OPA.Products"
	];
	mApps["SalesOrders"] = [
		"internal/samples/odata/v2/SalesOrders/index.html",
		"internal/samples/odata/v2/SalesOrders/index.html?realOData=true",
		"Test.qunit.html?testsuite=test-resources/sap/ui/core/internal/samples/odata/v2/SalesOrders/testsuite.qunit&test=OPA.SalesOrders"
	];
	mApps["TreeTable"] = [
		"internal/samples/odata/v2/TreeTable/index.html"
	];

	// Shopping Cart App
	mApps["Cart"] = [
		"../../../sap/m/demokit/cart/webapp/index.html",
		null,
		"../../../sap/m/demokit/cart/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/cart/testsuite.qunit&test=integration/opaTestsComponent",
		"../../../sap/m/demokit/cart/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/cart/testsuite.qunit&test=integration/opaTestsGherkinComponent"
	];

	return {
		apps : mApps,
		serviceURLs : [
			"/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/"
		],
		tests: mTests
	};
});
