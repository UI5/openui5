/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/base/i18n/Localization",
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/ViewTemplate/types/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (Localization, Core, Lib, library, MessageType, Any, Main, opaTest, TestUtils) {
	"use strict";
	const sDefaultLanguage = Localization.getLanguage();
	const ValueState = library.ValueState;

	QUnit.module("sap.ui.core.sample.ViewTemplate.types", {
		before : () => {
			Localization.setLanguage("en-US");
		},
		after : () => {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	opaTest("Boolean Types", (Given, When, Then) => {
		When.onAnyPage.applySupportAssistant();
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		if (TestUtils.isRealOData()) {
			// Reset data in order to have a predefined starting point when testing with real OData
			When.onTheMainPage.changeBoolean();
			When.onTheMainPage.pressButton("saveButton");
			When.onTheMainPage.pressButton("resetButton");
		}

		// Test I1 - Boolean Input Field
		When.onTheMainPage.enterInputValue("I1", "NotABoolean");
		Then.onTheMainPage.checkInputValueState("I1", ValueState.Error);
		When.onTheMainPage.enterInputValue("I1", "Yes");
		Then.onTheMainPage.checkInputValueState("I1", ValueState.None, "");
		When.onTheMainPage.enterInputValue("I1", "No");
		Then.onTheMainPage.checkInputValueState("I1", ValueState.None, "");

		// Test booleanInput - NOT nullable
		When.onTheMainPage.enterInputValue("booleanInput", "Invalid");
		Then.onTheMainPage.checkInputIsDirty("booleanInput", true);
		When.onTheMainPage.pressButton("resetModelButton");
		Then.onTheMainPage.checkInputValue("booleanInput", "Yes");
		Then.onTheMainPage.checkInputIsDirty("booleanInput", false);

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();
		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("DateInterval Type", (Given, When, Then) => {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		// Test I2 - DateInterval (complex multi-part binding)
		When.onTheMainPage.enterInputValue("I2", "Apr 19, 2029 – Apr 20, 2029");
		Then.onTheMainPage.checkInputValueState("I2", ValueState.None, "");

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("DateTime Variants - V4 Date Types", (Given, When, Then) => {
		const aDateV4Tests = [
			{id : "I3", invalid : "InvalidDate", valid : "Apr 19, 2029"},
			{id : "I4", invalid : "", valid : "May 20, 2030"},
			{id : "I5", invalid : "32/13/2029", valid : "4/19/29"},
			{id : "I6", invalid : "BadDate", valid : "Apr 19, 2029"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aDateV4Tests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// DatePicker with dateValue binding
		When.onTheMainPage.enterDatePickerValue("I54", "Apr 19, 2029");
		Then.onTheMainPage.checkDatePickerValueState("I54", ValueState.None);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("DateTime Variants - V2 DateTime Types", (Given, When, Then) => {
		const aTests = [
			// DateTime fields
			{id : "I7", invalid : "InvalidDate", valid : "Apr 19, 2029, 8:25:21 AM"},
			{id : "I8", invalid : "", valid : "May 20, 2030, 9:30:00 AM"},
			{id : "I9", invalid : "BadDate", valid : "April 19, 2029, 8:25:21 AM GMT+02:00"},
			{id : "I10", invalid : "InvalidDate", valid : "April 19, 2029, 6:25:21 AM GMTZ"},
			// Date as DateTime fields
			{id : "I11", invalid : "BadDate", valid : "Apr 19, 2029"},
			{id : "I12", invalid : "", valid : "May 20, 2030"},
			{id : "I13", invalid : "32/13/29", valid : "4/19/29"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		aTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// DatePicker (V2)
		When.onTheMainPage.enterDatePickerValue("I55", "Apr 19, 2029");
		Then.onTheMainPage.checkDatePickerValueState("I55", ValueState.None);

		// DateTimePicker with dateValue binding
		When.onTheMainPage.enterDateTimePickerValue("I57", "Apr 19, 2029, 8:25:21 AM");
		Then.onTheMainPage.checkDateTimePickerValueState("I57", ValueState.None);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("DateTime Variants - DateTimeOffset Types", (Given, When, Then) => {
		const aDateTimeOffsetTests = [
			{id : "I14", invalid : "BadDate", valid : "Apr 19, 2029, 8:25:21 AM"},
			{id : "I15", invalid : "", valid : "May 20, 2030, 10:30:00 AM"},
			{id : "I16", invalid : "Invalid", valid : "April 19, 2029, 8:25:21 AM GMT+02:00"},
			{id : "I17", invalid : "BadDate", valid : "April 19, 2029, 6:25:21 AM GMTZ"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aDateTimeOffsetTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// DateTimePicker with dateValue binding
		When.onTheMainPage.enterDateTimePickerValue("I56", "Apr 19, 2029, 8:25:21 AM");
		Then.onTheMainPage.checkDateTimePickerValueState("I56", ValueState.None);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("DateTime Variants - Time Types", (Given, When, Then) => {
		const aTimeV2Tests = [
			{id : "I18", invalid : "25:00:00", valid : "8:25:21 AM"},
			{id : "I19", invalid : "", valid : "9:30:00 AM"},
			{id : "I20", invalid : "BadTime", valid : "8:25 AM"}
		];
		const aTimeOfDayV4Tests = [
			{id : "I21", invalid : "25:00:00", valid : "8:25:21 AM"},
			{id : "I22", invalid : "", valid : "9:30:45 AM"},
			{id : "I23", invalid : "BadTime", valid : "8:25 AM"},
			{id : "I24", invalid : "25:00", valid : "8:25:21 AM"},
			{id : "I25", invalid : "BadTime", valid : "8:25:21 AM"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		// Test Time (V2) fields
		aTimeV2Tests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// Switch to V4 for TimeOfDay fields
		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		// Test TimeOfDay (V4) fields
		aTimeOfDayV4Tests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// TimePicker with dateValue binding (V4)
		When.onTheMainPage.enterTimePickerValue("I58", "8:25:21 AM");
		Then.onTheMainPage.checkTimePickerValueState("I58", ValueState.None);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Decimal Types", (Given, When, Then) => {
		const oBundle = Lib.getResourceBundleFor("sap.ui.core");
		const aDecimalTests = [
			{id : "I26", invalid : "ABC", valid : "123.456"},
			{id : "I27", invalid : "", valid : "12345.678"},
			{id : "I28", invalid : "1.2345", valid : "123.456"},
			{id : "I29", invalid : "1.5", valid : "123"},
			{id : "I30", invalid : "", valid : "9876.5"},
			{id : "I90", invalid : "", valid : "123.45"},
			{id : "decimalEqualScale", invalid : "1.2", valid : "0.12345"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aDecimalTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// Special: decimalInput with minimum exclusive constraint
		When.onTheMainPage.enterInputValue("decimalInput", "100");
		Then.onTheMainPage.checkInputValueState("decimalInput", ValueState.Error,
			oBundle.getText("EnterNumberMinExclusive", ["100.000"]));
		When.onTheMainPage.enterInputValue("decimalInput", "101");
		Then.onTheMainPage.checkInputValueState("decimalInput", ValueState.None, "");

		// Special: parseEmptyValueToZero
		When.onTheMainPage.enterInputValue("I87", "");
		Then.onTheMainPage.checkInputValueState("I87", ValueState.None);
		Then.onTheMainPage.checkInputValue("I87", "0");

		// Special: StepInput
		When.onTheMainPage.enterStepInputValue("stepInput", "102");
		Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.Error,
			oBundle.getText("EnterNumberMax", ["99"]));
		When.onTheMainPage.enterStepInputValue("stepInput", "1.234", "102");
		Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.Error,
			oBundle.getText("EnterNumberWithPrecision", ["0"]));
		When.onTheMainPage.enterStepInputValue("stepInput", "0");
		Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.None);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Double Types", (Given, When, Then) => {
		const aDoubleTests = [
			{id : "I31", invalid : "XYZ", valid : "123.456"},
			{id : "I32", invalid : "", valid : "789.012"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aDoubleTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// Special: parseEmptyValueToZero
		When.onTheMainPage.enterInputValue("I88", "");
		Then.onTheMainPage.checkInputValueState("I88", ValueState.None);
		Then.onTheMainPage.checkInputValue("I88", "0");

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Single Types", (Given, When, Then) => {
		const aSingleTests = [
			{id : "I33", invalid : "ABC", valid : "12.34"},
			{id : "I34", invalid : "", valid : "56.78"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aSingleTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// Special: parseEmptyValueToZero
		When.onTheMainPage.enterInputValue("I89", "");
		Then.onTheMainPage.checkInputValueState("I89", ValueState.None);
		Then.onTheMainPage.checkInputValue("I89", "0");

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Guid Types", (Given, When, Then) => {
		const aGuidTests = [
			{id : "I35", invalid : "not-a-guid", valid : "12345678-1234-1234-1234-123456789012"},
			{id : "I36", invalid : "", valid : "87654321-4321-4321-4321-210987654321"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aGuidTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Integer-Based Data Types", (Given, When, Then) => {
		const aTests = [
			// Byte
			{id : "I37", invalid : "256", valid : "123"},
			{id : "I38", invalid : "", valid : "250"},
			// Int16
			{id : "I39", invalid : "ABC", valid : "12345"},
			{id : "I40", invalid : "", valid : "32000"},
			// Int32
			{id : "I41", invalid : "XYZ", valid : "123456"},
			{id : "I42", invalid : "", valid : "2000000"},
			// Int64
			{id : "I43", invalid : "", valid : "9876543"},
			{id : "I44", invalid : "ABC", valid : "9876543210"},
			{id : "I45", invalid : "", valid : "1234567890"},
			{id : "I46", invalid : "", valid : "999999"},
			// SByte
			{id : "I47", invalid : "ABC", valid : "123"},
			{id : "I48", invalid : "", valid : "100"}
		];
		const aParseEmptyToZeroTests = ["I82", "I83", "I84", "I85", "I86"];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// Test parseEmptyValueToZero fields
		aParseEmptyToZeroTests.forEach((sId) => {
			When.onTheMainPage.enterInputValue(sId, "");
			Then.onTheMainPage.checkInputValueState(sId, ValueState.None);
			Then.onTheMainPage.checkInputValue(sId, "0");
		});

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("String Types", (Given, When, Then) => {
		const aStringTests = [
			{id : "I49", invalid : "A".repeat(50), valid : "Test String"},
			{id : "I50", invalid : "", valid : "Required String"},
			{id : "I51", invalid : "ABC123", valid : "1234567"},
			{id : "I52", invalid : "12345678", valid : "1234567"},
			{id : "I53", invalid : "ABC", valid : "9876543"},
			{id : "I59", invalid : "ABC", valid : "1111111"},
			{id : "I61", invalid : "x".repeat(130), valid : "Europe/Berlin"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		aStringTests.forEach((oTest) => {
			When.onTheMainPage.enterInputValue(oTest.id, oTest.invalid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.Error);
			When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
			Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
		});

		// Special: I60 parseKeepsEmptyString - empty string is VALID not invalid
		When.onTheMainPage.enterInputValue("I60", "");
		Then.onTheMainPage.checkInputValue("I60", "");
		Then.onTheMainPage.checkInputValueState("I60", ValueState.None);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("DateTimeWithTimezone Types", (Given, When, Then) => {
		const aTests = [
			// DateTimeWithTimezone Input fields
			{id : "I62", valid : "Apr 19, 2029, 8:25:21 AM Europe/Berlin", type : "input"},
			{id : "I63", valid : "Apr 19, 2029, 8:25:21 AM", type : "input"},
			{id : "I64", valid : "Europe/Berlin", type : "input"},
			{id : "I65", valid : "Apr 19, 2029, 8:25:21 AM", type : "input"},
			{id : "I66", valid : "Apr 19, 2029, 8:25:21 AM", type : "input"},
			{id : "I67", valid : "Apr 19, 2029, 8:25:21 AM", type : "input"},
			{id : "I68", valid : "Europe/Berlin", type : "input"},
			{id : "I69", valid : "Apr 19, 2029, 8:25:21 AM Europe/Berlin", type : "input"},
			// DateTimePickers with timezone - only check ValueState
			{id : "I70", type : "pickerWithTimezone"},
			{id : "I72", type : "pickerWithTimezone"},
			{id : "I74", type : "pickerWithTimezone"},
			// DateTimePickers without timezone display - check value and ValueState
			{id : "I71", value : "Apr 19, 2029, 8:25:21 AM", type : "picker"},
			{id : "I73", value : "Apr 19, 2029, 8:25:21 AM", type : "picker"},
			{id : "I75", value : "Apr 19, 2029, 8:25:21 AM", type : "picker"}
		];

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		aTests.forEach((oTest) => {
			if (oTest.type === "input") {
				When.onTheMainPage.enterInputValue(oTest.id, oTest.valid);
				Then.onTheMainPage.checkInputValueState(oTest.id, ValueState.None, "");
			} else if (oTest.type === "pickerWithTimezone") {
				Then.onTheMainPage.checkDateTimePickerValueState(oTest.id, ValueState.None);
			} else if (oTest.type === "picker") {
				When.onTheMainPage.enterDateTimePickerValue(oTest.id, oTest.value);
				Then.onTheMainPage.checkDateTimePickerValueState(oTest.id, ValueState.None);
			}
		});

		// Note: I76-I81 are read-only fields (editable="false") - not tested

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("V4 Identification Section", (Given, When, Then) => {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.pressButton("toggleV4Button");
		Then.onTheMessagePopover.checkMessages([]);
		When.onTheMessagePopover.close();

		// Test Duration (Raw type - error expected)
		When.onTheMainPage.enterInputValue("Identification::Duration", "10 sec",
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
		Then.onTheMainPage.checkInputIsDirty("Identification::Duration", true,
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
		When.onTheMainPage.pressButton("messagesButton");
		Then.onTheMessagePopover.checkMessages([{
			message : "Type 'sap.ui.model.odata.type.Raw' does not support parsing",
			type : MessageType.Error
		}]);
		When.onTheMainPage.pressButton("resetModelButton");
		Then.onTheMainPage.checkInputValue("Identification::Duration", "",
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
		Then.onTheMainPage.checkInputIsDirty("Identification::Duration", false,
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");

		// Test String40 - parseKeepsEmptyString
		When.onTheMainPage.enterInputValue("Identification::String40", "",
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
		Then.onTheMainPage.checkInputValue("Identification::String40", "",
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
		Then.onTheMainPage.checkInputValueState("Identification::String40", ValueState.None, "",
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
		Then.onTheMainPage.checkInputIsDirty("Identification::String40", false,
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");

		// Test DateTimeOffset with TimezoneID
		When.onTheMainPage.enterInputValue("Identification::TimezoneID", "Europe/Berlin",
			"sap.ui.core.sample.ViewTemplate.types.TemplateV4");

		Then.onAnyPage.analyzeSupportAssistant();
		Then.iTeardownMyUIComponent();
	});

	Core.ready().then(() => {
		QUnit.start();
	});
});

