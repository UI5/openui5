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
		tests: mTests
	};
});
