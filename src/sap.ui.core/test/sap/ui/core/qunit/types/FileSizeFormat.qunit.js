/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/format/FileSizeFormat",
	"sap/ui/core/format/NumberFormat"
], function (Log, Formatting, Localization, Locale, LocaleData, FileSizeFormat, NumberFormat) {
	"use strict";

	const aBinaryUnitNames = ["Kibibyte", "Mebibyte", "Gibibyte", "Tebibyte", "Pebibyte", "Exbibyte", "Zebibyte", "Yobibyte"];
	const aDecimalUnitNames = ["Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Petabyte", "Exabyte", "Zettabyte", "Yottabyte"];
	const sDefaultLanguage = Localization.getLanguage();
	const oLocale = new Locale("en");

	function extractUnits(names) {
		return names.map(function (name) {
			const sPattern = FileSizeFormat.getInstance({}, oLocale).oLocaleData.getFileSizePattern(name);
			// trim the string
			return sPattern.split("{0}")[1].trim();
		});
	}

	const oFormatBinary = FileSizeFormat.getInstance({ binaryFilesize: true, maxFractionDigits: 2 }, oLocale);
	const oFormatDecimal = FileSizeFormat.getInstance({ binaryFilesize: false, maxFractionDigits: 2 }, oLocale);
	const oFormatDefault = FileSizeFormat.getInstance({}, oLocale);
	const aBinaryUnits = extractUnits(aBinaryUnitNames);
	const aDecimalUnits = extractUnits(aDecimalUnitNames);

	function checkFormat(format, value, expected) {
		let oFormat, sPrefix;

		switch (format) {
			case "binary":
				oFormat = oFormatBinary;
				sPrefix = "Binary";
				break;
			case "decimal":
				oFormat = oFormatDecimal;
				sPrefix = "Decimal";
				break;
			default:
				oFormat = oFormatDefault;
				sPrefix = "Default";
		}

		QUnit.config.current.assert.strictEqual(oFormat.format(value), expected, sPrefix + " format of '" + value + "': " + expected);
	}

	function checkParse(format, value, expected) {
		let oFormat, sPrefix;

		switch (format) {
			case "binary":
				oFormat = oFormatBinary;
				sPrefix = "Binary";
				break;
			case "decimal":
				oFormat = oFormatDecimal;
				sPrefix = "Decimal";
				break;
			default:
				oFormat = oFormatDefault;
				sPrefix = "Default";
		}

		QUnit.config.current.assert.strictEqual(oFormat.parse(value), expected, "Parse (" + sPrefix + " Formatter) of '" + value + "': " + expected);
	}

	function getHex(i, binary) {
		switch (i) {
			case 1:
				return binary ? "0x800" : "0x7d0";
			case 2:
				return binary ? "0x200000" : "0x1e8480";
			case 3:
				return binary ? "0x80000000" : "0x77359400";
			case 4:
				return binary ? "0x20000000000" : "0x1d1a94a2000";
			case 5:
				return binary ? "0x8000000000000" : "0x71afd498d0000";
			case 6:
				return binary ? "0x2000000000000000" : "0x1bc16d674ec80000";
			case 7:
				return binary ? "0x800000000000000000" : "0x6c6b935b8bbd400000";
			case 8:
				return binary ? "0x200000000000000000000" : "0x1a784379d99db40000000";
			default:
				return "0x0";
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.core.format.FileSizeFormat", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			Localization.setLanguage("en-US");
		},
		afterEach() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("format binary", function () {
		aBinaryUnits.forEach((sBinaryUnit, i) => {
			const iExponent = i + 1;
			checkFormat("binary", 2 * Math.pow(1024, iExponent), "2 " + sBinaryUnit);
			checkFormat("binary", 2 * Math.pow(1024, iExponent) + "", "2 " + sBinaryUnit);
			checkFormat("binary", getHex(iExponent, true), "2 " + sBinaryUnit);
		});

		checkFormat("binary", 888, "888 Bytes");
		checkFormat("binary", "888", "888 Bytes");
		checkFormat("binary", "0x378", "888 Bytes");
		checkFormat("binary", 1, "1 Byte");
		checkFormat("binary", "1", "1 Byte");
		checkFormat("binary", "0x1", "1 Byte");
		checkFormat("binary", 1048575, "1 MiB");
		checkFormat("binary", NaN, " Byte"); // NumberFormat by default formats NaN to empty string
	});

	QUnit.test("format decimal", function () {
		aDecimalUnits.forEach((sDecimalUnit, i) => {
			const iExponent = i + 1;
			checkFormat("decimal", 2 * Math.pow(1000, iExponent), "2 " + sDecimalUnit);
			checkFormat("decimal", 2 * Math.pow(1000, iExponent) + "", "2 " + sDecimalUnit);
			checkFormat("decimal", getHex(iExponent), "2 " + sDecimalUnit);
		});

		checkFormat("decimal", 888, "888 Bytes");
		checkFormat("decimal", "888", "888 Bytes");
		checkFormat("decimal", "0x378", "888 Bytes");
		checkFormat("decimal", 1, "1 Byte");
		checkFormat("decimal", "1", "1 Byte");
		checkFormat("decimal", "0x1", "1 Byte");
		checkFormat("decimal", 999999, "1 MB");
		checkFormat("decimal", NaN, " Byte");
	});

	QUnit.test("format default", function () {
		aDecimalUnits.forEach((sDecimalUnit, i) => {
			const iExponent = i + 1;
			checkFormat("default", 2 * Math.pow(1000, iExponent), "2 " + sDecimalUnit);
			checkFormat("default", 2 * Math.pow(1000, iExponent) + "", "2 " + sDecimalUnit);
			checkFormat("default", getHex(iExponent), "2 " + sDecimalUnit);
		});

		checkFormat("default", 888, "888 Bytes");
		checkFormat("default", "888", "888 Bytes");
		checkFormat("default", "0x378", "888 Bytes");
		checkFormat("default", 1, "1 Byte");
		checkFormat("default", "1", "1 Byte");
		checkFormat("default", "0x1", "1 Byte");
		checkFormat("default", NaN, " Byte");
	});

	QUnit.test("parse binary", function () {
		for (let i = 1; i < 9; i++) {
			checkParse("binary", "2 " + aBinaryUnits[i - 1], 2 * Math.pow(1024, i));
			checkParse("binary", "2 " + aDecimalUnits[i - 1], 2 * Math.pow(1000, i));
		}

		checkParse("binary", "888 Bytes", 888);
		checkParse("binary", "1 Byte", 1);
		checkParse("binary", "888", 888);
	});

	QUnit.test("parse decimal", function () {
		for (let i = 1; i < 9; i++) {
			checkParse("decimal", "2 " + aBinaryUnits[i - 1], 2 * Math.pow(1024, i));
			checkParse("decimal", "2 " + aDecimalUnits[i - 1], 2 * Math.pow(1000, i));
		}

		checkParse("decimal", "888 Bytes", 888);
		checkParse("decimal", "1 Byte", 1);
		checkParse("decimal", "888", 888);
	});

	QUnit.test("parse default", function () {
		for (let i = 1; i < 9; i++) {
			checkParse("default", "2 " + aBinaryUnits[i - 1], 2 * Math.pow(1024, i));
			checkParse("default", "2 " + aDecimalUnits[i - 1], 2 * Math.pow(1000, i));
		}

		checkParse("default", "888 Bytes", 888);
		checkParse("default", "1 Byte", 1);
		checkParse("default", "888", 888);
	});

	QUnit.test("create format instance without giving any option", function (assert) {
		assert.equal(FileSizeFormat.getInstance().format(100000), "100 KB", "BinarySize is set to false by default");
	});

	//*********************************************************************************************
	QUnit.test("createInstance: called with format options and locale", function (assert) {
		const oLocale = {
			toString() { return "~locale"; }
		};
		this.mock(LocaleData).expects("getInstance").withExactArgs(sinon.match.same(oLocale)).returns("~oLocaleData");
		this.mock(NumberFormat).expects("getFloatInstance").withExactArgs("~oFormatOptions", sinon.match.same(oLocale))
			.returns("~oNumberFormat");

		// code under test
		const oFormat = FileSizeFormat.createInstance("~oFormatOptions", oLocale);

		assert.ok(oFormat instanceof FileSizeFormat);
		assert.strictEqual(oFormat.oLocale, oLocale);
		assert.strictEqual(oFormat.oLocaleData, "~oLocaleData");
		assert.strictEqual(oFormat.oNumberFormat, "~oNumberFormat");
		assert.strictEqual(oFormat.bBinary, false);
	});

	//*********************************************************************************************
	QUnit.test("createInstance: first argument is a Locale; no format options", function (assert) {
		const oLocale = new Locale("en");
		this.mock(LocaleData).expects("getInstance").withExactArgs(sinon.match.same(oLocale)).returns("~oLocaleData");
		this.mock(NumberFormat).expects("getFloatInstance").withExactArgs(undefined, sinon.match.same(oLocale))
			.returns("~oNumberFormat");

		// code under test
		const oFormat = FileSizeFormat.createInstance(oLocale);

		assert.ok(oFormat instanceof FileSizeFormat);
		assert.strictEqual(oFormat.oLocale, oLocale);
		assert.strictEqual(oFormat.oLocaleData, "~oLocaleData");
		assert.strictEqual(oFormat.oNumberFormat, "~oNumberFormat");
		assert.strictEqual(oFormat.bBinary, false);
	});

	//*********************************************************************************************
	QUnit.test("createInstance: use binaryFilesize format option; no locale", function (assert) {
		let oLocale;
		const oFormatOptions = {binaryFilesize: "~binaryFilesize~anyTruthyValue"};
		this.mock(Formatting).expects("getLanguageTag").withExactArgs().returns("en");
		this.mock(LocaleData).expects("getInstance").withExactArgs(sinon.match((oLocale0) => {
				oLocale = oLocale0;
				assert.strictEqual(oLocale0.toString(), "en");
				return oLocale0 instanceof Locale;
			}))
			.returns("~oLocaleData");
		this.mock(NumberFormat).expects("getFloatInstance")
			.withExactArgs(sinon.match.same(oFormatOptions), sinon.match((oLocale0) => oLocale0 === oLocale))
			.returns("~oNumberFormat");

		// code under test
		const oFormat = FileSizeFormat.createInstance(oFormatOptions);

		assert.ok(oFormat instanceof FileSizeFormat);
		assert.strictEqual(oFormat.oLocale, oLocale);
		assert.strictEqual(oFormat.oLocaleData, "~oLocaleData");
		assert.strictEqual(oFormat.oNumberFormat, "~oNumberFormat");
		assert.strictEqual(oFormat.bBinary, true);
	});
});
