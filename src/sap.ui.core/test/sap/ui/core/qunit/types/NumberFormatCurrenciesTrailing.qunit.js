/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Locale",
	"sap/base/Log"
], function (Formatting, Localization, NumberFormat, Locale, Log) {
	"use strict";
	const sDefaultLanguage = Localization.getLanguage();

	var getCurrencyInstance = function(options, oLocale) {
		if (!options) {
			options = {};
		}
		return NumberFormat.getCurrencyInstance(options, oLocale);
	};

	/*
		\xa0 is "NO-BREAK SPACE"
		\ufeff is "ZERO WIDTH NO-BREAK SPACE"

		CLDR uses different whitespace characters in its patterns
	*/

	QUnit.module("sap.ui.core.format.NumberFormat - trailing currencies", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach() {
			Localization.setLanguage("en-US");
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},
		after() {
			Localization.setLanguage(sDefaultLanguage);
		},
		afterEach() {
			// ensure custom currencies are reset
			Formatting.setCustomCurrencies();
		}
	});

	QUnit.test("Currency format with sMeasure", function (assert) {
		const oFormat = getCurrencyInstance();
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "-123,456.79" + "\xa0" + "EUR", "-123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "-123,456.79" + "\xa0" + "EUR", "-123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "123,457" + "\xa0" + "JPY", "123456.789 JPY");
		assert.strictEqual(oFormat.format([123456.789, "JPY"]), "123,457" + "\xa0" + "JPY", "123456.789 JPY");
		assert.strictEqual(oFormat.format(-123456.789, "JPY"), "-123,457" + "\xa0" + "JPY", "-123456.789 JPY");
		assert.strictEqual(oFormat.format([-123456.789, "JPY"]), "-123,457" + "\xa0" + "JPY", "-123456.789 JPY");
		assert.strictEqual(oFormat.format([-123456.789, "ABC"]), "-123,456.79" + "\xa0" + "ABC", "-123456.789 ABC");
		assert.strictEqual(oFormat.format(123456.789, "£"), "£123,456.79", "£123456.789 EUR - Not trailing because it's not a valid currency code.");
		assert.strictEqual(oFormat.format([123456.789, "£"]), "£123,456.79", "£123456.789 EUR - Not trailing because it's not a valid currency code.");
		assert.strictEqual(oFormat.format(-123456.789, "£"), "£" + "\ufeff" + "-123,456.79", "£-123456.789 EUR - Not trailing because it's not a valid currency code.");
		assert.strictEqual(oFormat.format([-123456.789, "£"]), "£" + "\ufeff" + "-123,456.79", "£-123456.789 EUR - Not trailing because it's not a valid currency code.");
	});

	QUnit.test("Currency format with sMeasure and style", function (assert) {
		let oFormat = getCurrencyInstance({style: "long"});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123K" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "£"), "£123K", "£123456.789 - Not trailing because it's not a valid currency code.");

		oFormat = getCurrencyInstance({style: "short"});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123K" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "£"), "£123K", "£123456.789 - Not trailing because it's not a valid currency code.");

		oFormat = getCurrencyInstance({style: "standard"});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "£"), "£123,456.79", "£123456.789 - Not trailing because it's not a valid currency code.");

		oFormat = getCurrencyInstance({style: "foo"});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "£"), "£123,456.79", "£123456.789 - Not trailing because it's not a valid currency code.");
	});

	QUnit.test("Currency format with sMeasure and currencyContext accounting", function (assert) {
		const oFormat = getCurrencyInstance({currencyContext: "accounting"});
		// Using negative numbers since only then the result will defer from "standard" currency context
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "(123,456.79" + "\xa0" + "EUR)", "-123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "£"), "(£123,456.79)", "£-123456.789 - Not trailing because it's not a valid currency code.");
	});

	QUnit.test("Currency format for locale DE", function (assert) {
		const oLocale = new Locale("de-DE");
		// currency only supports "short" style. Therefore, result should be the same for both styles.
		["long", "short"].forEach(function(sStyle) {
			const oFormat = getCurrencyInstance({ style: sStyle }, oLocale);
			// thousand format for locale "de" does not reformat the number (pattern: "100000-other": "0")
			assert.strictEqual(oFormat.format(123456.789, "EUR"), "123.457" + "\xa0" + "EUR");
			assert.strictEqual(oFormat.format(-123456.789, "JPY"), "-123.457" + "\xa0" + "JPY");

			// million format for locale "de" does reformat the number (pattern: "1000000-other": "0 Mio'.' ¤")
			assert.strictEqual(oFormat.format(47123456.789, "EUR"), "47" + "\xa0" + "Mio." + "\xa0" + "EUR");
			assert.strictEqual(oFormat.format(-47123456.789, "JPY"), "-47" + "\xa0" + "Mio." + "\xa0" + "JPY");
		});
	});

	QUnit.test("Currency format with different parameters undefined", function (assert) {
		const oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F",
					decimals: 3
				}
			}
		});
		assert.strictEqual(oFormat.format(undefined, undefined), "", "no values returns an empty string");
		assert.strictEqual(oFormat.format(1234.56, undefined), "1,234.56", "only number formatted");
		assert.strictEqual(oFormat.format(1234.5728, "FOB"), "F" + "\xa0" + "1,234.573", "formatted both");
	});

	QUnit.test("Currency format with sMeasure - unknown currency", function (assert) {
		const oFormat = getCurrencyInstance();

		// Unknown measure parameter
		assert.strictEqual(oFormat.format(123456.789, "£"), "£123,456.79" , "£123456.789");
		assert.strictEqual(oFormat.format([-123456.789, "£"]), "£\ufeff-123,456.79" , "£-123456.789");
		assert.strictEqual(oFormat.format(123456.789, "ASDEF"), "ASDEF" + "\xa0" + "123,456.79", "ASDEF 123456.789");
		assert.strictEqual(oFormat.format([-123456.789, "ASDEF"]), "ASDEF" + "\ufeff" + "-123,456.79", "ASDEF -123456.789");

		// Invalid or no measure parameter
		assert.strictEqual(oFormat.format(123456.789, undefined), "123,456.79", "123456.79 undefined");
		assert.strictEqual(oFormat.format(-123456.789, undefined), "-123,456.79", "-123456.79 undefined");
		assert.strictEqual(oFormat.format([123456.789, undefined]), "123,456.79", "123456.79 undefined");
		assert.strictEqual(oFormat.format([-123456.789, undefined]), "-123,456.79", "-123456.789 undefined");
		assert.strictEqual(oFormat.format([-123456.789, false]), "", "-123456.789 false");
		assert.strictEqual(oFormat.format([-123456.789, NaN]), "", "-123456.789 NaN");
		assert.strictEqual(oFormat.format([-123456.789, null]), "-123,456.79", "-123456.789 null");
	});

	QUnit.test("Currency format with sMeasure and showMeasure as symbol", function (assert) {
		const oFormat = getCurrencyInstance({
			currencyCode: false // Show symbol instead of currency code
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "€\ufeff" + "-123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "€\ufeff" + "-123,456.79", "123456.789 EUR");
	});

	QUnit.test("Currency format with custom number of decimals", function (assert) {
		let oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.strictEqual(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.strictEqual(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.79 BTC");

		// set custom currency digits
		Formatting.setCustomCurrencies({
			"EUR": { "digits": 1 },
			"JPY": { "digits": 3 },
			"CZK": { "digits": 3 },
			"BTC": { "digits": 5 }
		});

		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.8", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,456.789", "123456.789 YEN");
		assert.strictEqual(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.789", "123456.789 CZK");
		assert.strictEqual(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.78900", "123456.789 BTC");

		// add custom currencies
		Formatting.addCustomCurrencies({
			"DEFAULT": { "digits": 6 }
		});
		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.8", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "MON"), "MON\xa0" + "123,456.789000", "123456.789 MON");

		// reset custom currencies
		Formatting.setCustomCurrencies();

		oFormat = getCurrencyInstance({
			currencyCode: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.strictEqual(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.strictEqual(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.789 BTC");
	});

	QUnit.test("Currency format with sMeasure and showMeasure set to false", function (assert) {
		const oFormat = getCurrencyInstance({
			showMeasure: false
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "-123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "-123,456.79", "123456.789 EUR");
	});

	QUnit.test("Format using currency instance", function (assert) {
		const oFormat = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		});
		this.oLogMock.expects("error").withExactArgs("Currency 'EUR' is unknown.");
		const sResult = oFormat.format(123456.789, "EUR"); // Empty string "";

		assert.strictEqual(sResult, "", "Empty string formatted.");
		assert.deepEqual(oFormat.parse(""), [NaN, undefined], "[NaN, undefined] is returned.");

		// emptyString: ""
		const oFormat2 = getCurrencyInstance({
			emptyString: "",
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		});
		this.oLogMock.expects("error").withExactArgs("Currency 'EUR' is unknown.");
		const sResult2 = oFormat2.format(123456.789, "EUR"); // Empty string "";

		assert.strictEqual(sResult2, "", "Empty string formatted.");
		assert.deepEqual(oFormat2.parse(""), ["", undefined], "['', undefined] is returned.");

		const oFormat3 = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"symbol": "Ƀ"
				}
			}
		});
		this.oLogMock.expects("error").withExactArgs("Currency 'Ƀ' is unknown.");
		assert.strictEqual(oFormat3.format(123456.789, "Ƀ"), "", "Empty string formatted");
		assert.deepEqual(oFormat3.parse("123,456.789Ƀ"), [123456.789, "BTC"], "[123456.789, \"BTC\"] is returned.");
	});

	QUnit.test("Parse symbol only", function(assert) {
		const oFormat = getCurrencyInstance({
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"EURO": {
					decimals: 2,
					symbol: "€"
				},
				"Bitcoin": {
					decimals: 5,
					symbol: "Ƀ"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$"), null, "Null is returned.");
		assert.deepEqual(oFormat.parse("€"), null, "Null is returned.");
		assert.deepEqual(oFormat.parse("Ƀ"), null, "Null is returned.");
	});

	QUnit.test("Missing decimals information in defined custom currencies", function (assert) {
		const oFormat = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ"
				}
			}
		});

		const sResult = oFormat.format(123456.789, "BTC");

		assert.strictEqual(sResult, "123,456.79" + "\xa0" + "BTC", "Default decimals are 2");
	});

	QUnit.test("Custom Currencies defined via currency instance options", function (assert) {

		// Format $, to make sure there is no space between the symbol and the formatted number value
		const oFormat1 = getCurrencyInstance({
			currencyCode: false
		});
		const sResult1 = oFormat1.format(123456.789, "USD");

		assert.strictEqual(sResult1, "$123,456.79", "$123,456.79");

		// currencyCode: true
		const oFormat = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		});
		const sResult = oFormat.format(123456.789, "BTC");

		assert.strictEqual(sResult, "123,456.789" + "\xa0" + "BTC", "BTC 123,456.789");
		assert.deepEqual(oFormat.parse(sResult), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		// currencyCode: false
		var oFormat2 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		});
		const sResult2 = oFormat2.format(123456.789, "BTC");

		assert.strictEqual(sResult2, "Ƀ\xa0123,456.789", "Ƀ\xa0123,456.789");
		assert.deepEqual(oFormat.parse(sResult2), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		const oFormat3 = getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}, new Locale("de-x-sapufmt"));
		const sResult3 = oFormat3.format(123456.789, "BTC");

		assert.strictEqual(sResult3, "123.456,789" + "\xa0" + "BTC", "123.456,789 BTC");
		assert.deepEqual(oFormat3.parse(sResult3), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		const oFormat4 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}, new Locale("de-x-sapufmt"));
		const sResult4 = oFormat4.format(123456.789, "BTC");

		assert.strictEqual(sResult4, "123.456,789" + "\xa0" + "Ƀ", "123.456,789 Ƀ");
		assert.deepEqual(oFormat4.parse(sResult4), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		// currencyCode: true
		const oFormat5 = getCurrencyInstance({
			customCurrencies: {
				"Ƀ": {
					"isoCode": "BTC",
					"decimals": 3
				}
			}
		});
		const sResult5 = oFormat5.format(123456.789, "Ƀ");

		assert.strictEqual(sResult5, "123,456.789" + "\xa0" + "Ƀ", "123,456.789 Ƀ");
		assert.deepEqual(oFormat5.parse(sResult5), [123456.789, "Ƀ"], "Array [123456.789, 'Ƀ'] is returned.");

		// currencyCode: false
		const oFormat6 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"Ƀ": {
					"isoCode": "BTC",
					"decimals": 3
				}
			}
		});
		const sResult6 = oFormat6.format(123456.789, "Ƀ");

		assert.strictEqual(sResult6, "Ƀ" + "\xa0" + "123,456.789", "Ƀ 123,456.789");
		assert.deepEqual(oFormat6.parse(sResult6), [123456.789, "Ƀ"], "Array [123456.789, 'Ƀ'] is returned.");
	});

	QUnit.test("'decimals' set on FormatOptions and custom currency", function (assert) {
		const oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€",
					decimals: 6
				}
			},
			decimals: 1
		});

		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,234.572800", "formatted with 6 decimals - en");

		const oFormatDE = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"HOD": {
					symbol: "H$",
					decimals: 4
				}
			},
			decimals: 1
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5728, "HOD"), "1.234,5728" + "\xa0" + "H$", "formatted with 4 decimals - de");
	});

	QUnit.test("'decimals' only set on format-options", function (assert) {
		// custom currency
		const oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€"
				}
			},
			decimals: 3
		});

		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,234.573", "formatted with default 2 decimals - en");

		// known currency
		const oFormatDE = getCurrencyInstance({
			currencyCode: false,
			decimals: 1
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5728, "HUF"), "1.234,6" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
	});

	QUnit.test("no 'decimals' set at all", function (assert) {
		const oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€"
				}
			}
		});

		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,234.57", "formatted with default 2 decimals - en");

		const oFormatDE = getCurrencyInstance({
			currencyCode: false
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5728, "HUF"), "1.235" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
	});

	QUnit.test("Format with currency symbol w/o symbol mixed in", function (assert) {
		const oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"Bitcoin": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		});
		const sResult = oFormat.format(123456.789, "Bitcoin");

		assert.strictEqual(sResult, "Ƀ" + "\xa0" + "123,456.789", "'Ƀ\xa0123,456.789' is formatted");
		assert.deepEqual(oFormat.parse(sResult), [123456.789, 'Bitcoin'], "[123456.789, 'Bitcoin']");
	});

	QUnit.test("Format with currency symbol with isoCode lookup", function (assert) {
		Formatting.addCustomCurrencies({
			"BTC": {
				"symbol": "Ƀ",
				"decimals": 5
			}
		});

		const oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"Bitcoin": {
					"decimals": 3,
					"isoCode": "BTC"
				},
				"EURO": {
					"decimals": 2,
					"isoCode": "EUR"
				},
				"DOLLAR": {
					"decimals": 4
				}
			}
		});

		// symbol lookup in global configuration
		assert.strictEqual(oFormat.format(123456.789, "Bitcoin"), "Ƀ" + "\xa0" + "123,456.789", "Ƀ\xa0123,456.789 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// symbol lookup in CLDR
		assert.strictEqual(oFormat.format(123456.789, "EURO"), "€123,456.79", "€123,456.79 - symbol lookup in CLDR");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "EURO")), [123456.79, "EURO"], "[123456.79, 'EURO']");

		// currency symbol is n/a in the options
		assert.strictEqual(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies with symbol from global config", function (assert) {
		Formatting.addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			},
			"Bitcoin": {
				"digits": 3
			},
			"DOLLAR": {
				"digits": 4
			}
		});

		const oFormat = getCurrencyInstance({
			currencyCode: false
		});

		assert.strictEqual(oFormat.format(123456.789, "BTC"), "Ƀ" + "\xa0" + "123,456.79", "Ƀ\xa0123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.strictEqual(oFormat.format(123456.789, "Bitcoin"), "Bitcoin" + "\xa0" + "123,456.789", "Bitcoin\xa0123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.strictEqual(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies from global config", function (assert) {
		Formatting.addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			},
			"Bitcoin": {
				"digits": 3
			},
			"DOLLAR": {
				"digits": 4
			}
		});

		const oFormat = getCurrencyInstance({
			currencyCode: true
		});

		assert.strictEqual(oFormat.format(123456.789, "BTC"), "123,456.79" + "\xa0" + "BTC", "Ƀ\xa0123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.strictEqual(oFormat.format(123456.789, "Bitcoin"), "123,456.789" + "\xa0" + "Bitcoin", "Bitcoin\xa0123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.strictEqual(oFormat.format(123456.789, "DOLLAR"), "123,456.7890" + "\xa0" + "DOLLAR", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Custom Currencies instance overwrites global configuration", function (assert) {
		// global configuration
		Formatting.addCustomCurrencies({
			"DOLLAR": {
				"symbol": "$",
				"digits": 5
			}
		});

		const oCustomCurrencyOptions = {
			"DOLLAR": {
				"symbol": "$",
				"decimals": 3
			}
		};

		const oFormat1 = getCurrencyInstance({
			customCurrencies: oCustomCurrencyOptions
		});

		const oFormat2 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: oCustomCurrencyOptions
		});

		assert.strictEqual(oFormat1.format(12345.6789, "DOLLAR"), "12,345.679" + "\xa0" + "DOLLAR", "DOLLAR 12,345.679");
		assert.deepEqual(oFormat1.parse(oFormat1.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		// Parse with symbol
		assert.deepEqual(oFormat1.parse("$12,345.679"), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		assert.strictEqual(oFormat2.format(12345.6789, "DOLLAR"), "$12,345.679", "$12,345.679");
		assert.deepEqual(oFormat2.parse(oFormat2.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");
	});

	QUnit.test("Currencies with numbers in their names", function(assert) {
		// English
		const oFormatEN = getCurrencyInstance({
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		});

		// these assertions also check if the longest match is found
		assert.strictEqual(oFormatEN.format(1234.5678, "4DOL"), "1,234.574DOL");
		assert.deepEqual(oFormatEN.parse("4DOL 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("4DOL1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		// smaller match should win
		assert.strictEqual(oFormatEN.format(1234.5678, "DO"), "1,234.5678" + "\xa0" + "DO", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO 1,234.5678"), [1234.5678, "DO"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO1,234.56789"), [1234.56789, "DO"], "parse in English locale - number at the start - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "D4OL"), "1,234.6" + "\xa0" + "D4OL", "format in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "1,234.568" + "\xa0" + "DOL4", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL4 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL41,234.568"), null, "parse in English locale - number at the end - no delimiter");

		// negative values
		assert.strictEqual(oFormatEN.format(-1234.56789, "DO"), "-1,234.5679" + "\xa0" + "DO", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("DO -1,234.568"), [-1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("DO-1,234.568"), [-1234.568, "DO"], "parse in English locale - short match - no delimiter");

		// reserved chars "." and ","
		assert.deepEqual(oFormatEN.parse("DOL4.568"), null, "parse in English locale - number at the end - not valid");
		assert.deepEqual(oFormatEN.parse("DOL4,234.568"), null, "parse in English locale - number at the end - not valid");

		// German
		const oFormatDE = getCurrencyInstance({
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		// these assertions also check if the longest match is found
		assert.strictEqual(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "4DOL", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 4DOL"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,574DOL"), null, "parse in German locale - number at the start - no delimiter");

		// smaller match should win
		assert.strictEqual(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "DO", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,5678 DO"), [1234.5678, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,56789DO"), [1234.56789, "DO"], "parse in German locale - short match - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "D4OL", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "DOL4", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		// negative values
		assert.strictEqual(oFormatDE.format(-1234.56789, "DO"), "-1.234,5679" + "\xa0" + "DO", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568 DO"), [-1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568DO"), [-1234.568, "DO"], "parse in German locale - short match - no delimiter");

		// reserved chars "." and ","
		assert.deepEqual(oFormatDE.parse("568,4DOL"), null, "parse in German locale - number at the start - not valid");
		assert.deepEqual(oFormatDE.parse("568.4DOL"), null, "parse in German locale - number at the start - not valid");
	});

	QUnit.test("Currencies with numbers in their names - currencyCode: false", function(assert) {
		// English
		const oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DO": {
					"symbol": "My#",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"isoCode": "USD",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!!",
					"decimals": 2
				}
			}
		});

		assert.strictEqual(oFormatEN.format(1234.5678, "4DOL"), "!!1,234.57");
		assert.deepEqual(oFormatEN.parse("!! 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("!!1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "D4OL"), "§1,234.6");
		assert.deepEqual(oFormatEN.parse("§ 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("§1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.strictEqual(oFormatEN.format(1234.56789, "DO"), "My#1,234.5679");
		assert.deepEqual(oFormatEN.parse("My# 1,234.568"), [1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My#1,234.568"), [1234.568, "DO"], "parse in English locale - short match - no delimiter");

		assert.strictEqual(oFormatEN.format(-1234.5678, "DOL4"), "$" + "\ufeff" + "-1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ -1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$-1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.strictEqual(oFormatEN.format(-1234.56789, "DO"), "My#" + "\ufeff" + "-1,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My# -1,234.568"), [-1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My#-1,234.568"), [-1234.568, "DO"], "parse in English locale - short match - no delimiter");

		// German
		const oFormatDE = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DO": {
					"symbol": "My#",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"isoCode": "USD",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		assert.strictEqual(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "!!", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 !!"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57!!"), [1234.57, "4DOL"], "parse in German locale - number at the start - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "§", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 §"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6§"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 $"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568$"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.strictEqual(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568 My#"), [1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568My#"), [1234.568, "DO"], "parse in German locale - short match - no delimiter");

		assert.strictEqual(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568 $"), [-1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568$"), [-1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.strictEqual(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568 My#"), [-1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568My#"), [-1234.568, "DO"], "parse in German locale - short match - no delimiter");
	});

	QUnit.test("Currencies with numbers in their names - currencyContext: 'accounting'", function(assert) {
		// English
		const oFormatEN = getCurrencyInstance({
			currencyContext: "accounting",
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		});

		// these assertions also check if the longest match is found
		assert.strictEqual(oFormatEN.format(1234.5678, "4DOL"), "1,234.574DOL");
		assert.strictEqual(oFormatEN.format(-1234.5678, "4DOL"), "(1,234.574DOL)");

		// smaller match should win
		assert.strictEqual(oFormatEN.format(1234.5678, "DO"), "1,234.5678\xa0DO", "format in English locale - short match");
		assert.strictEqual(oFormatEN.format(-1234.5678, "DO"), "(1,234.5678\xa0DO)", "format in English locale - short match");

		assert.strictEqual(oFormatEN.format(1234.5678, "D4OL"), "1,234.6\xa0D4OL", "format in English locale - number in the middle");
		assert.strictEqual(oFormatEN.format(-1234.5678, "D4OL"), "(1,234.6\xa0D4OL)", "format in English locale - number in the middle");

		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "1,234.568\xa0DOL4", "format in English locale - number at the end");
		assert.strictEqual(oFormatEN.format(-1234.5678, "DOL4"), "(1,234.568\xa0DOL4)", "format in English locale - number at the end");

		// German
		const oFormatDE = getCurrencyInstance({
			currencyContext: "accounting",
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		// these assertions also check if the longest match is found
		assert.strictEqual(oFormatDE.format(1234.5678, "4DOL"), "1.234,57\xa04DOL", "format in German locale - number at the start");
		assert.strictEqual(oFormatDE.format(-1234.5678, "4DOL"), "-1.234,57\xa04DOL", "format in German locale - number at the start");

		// smaller match should win
		assert.strictEqual(oFormatDE.format(1234.5678, "DO"), "1.234,5678\xa0DO", "format in German locale - short match");
		assert.strictEqual(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678\xa0DO", "format in German locale - short match");

		assert.strictEqual(oFormatDE.format(1234.5678, "D4OL"), "1.234,6\xa0D4OL", "format in German locale - number in the middle");
		assert.strictEqual(oFormatDE.format(-1234.5678, "D4OL"), "-1.234,6\xa0D4OL", "format in German locale - number in the middle");

		assert.strictEqual(oFormatDE.format(1234.5678, "DOL4"), "1.234,568\xa0DOL4", "format in German locale - number at the end");
		assert.strictEqual(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568\xa0DOL4", "format in German locale - number at the end");
	});

	QUnit.test("Currencies with numbers in their names - Log", function(assert) {
		this.oLogMock.expects("error")
			.withExactArgs("Symbol '$' is defined multiple times in custom currencies.", undefined, "NumberFormat");

		// English
		const oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DOL": {
					"symbol": "$",
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				}
			}
		});

		assert.strictEqual(oFormatEN.format(1234.5678, "DOL"), "$1,234.6", "format in English locale - number at the start");
		assert.strictEqual(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the start");
	});

	QUnit.test("Multiple custom currencies with same currency symbol", function(assert) {
		this.oLogMock.expects("error")
			.withExactArgs("Symbol 'µ' is defined multiple times in custom currencies.", undefined, "NumberFormat");
		const oFormat = getCurrencyInstance({
			customCurrencies: {
				"IOTA": {
					decimals: 3,
					symbol: "y"
				},
				"MON": {
					decimals: 2,
					symbol: "µ"
				},
				"MONERO": {
					decimals: 5,
					symbol: "µ"
				}
			}
		});

		assert.strictEqual(oFormat.format(12345.6789, "MON"), "12,345.68" + "\xa0" + "MON", "MON 12,345.68");
		assert.strictEqual(oFormat.format(12345.6789, "MONERO"), "12,345.67890" + "\xa0" + "MONERO", "MONERO 12,345.6789");
		this.oLogMock.expects("error")
			.withExactArgs("The parsed currency symbol 'µ' is defined multiple times in custom currencies."
				+ "Therefore the result is not distinct.");
		assert.deepEqual(oFormat.parse("µ12,345.679"), [12345.679, undefined], "[12345.679, undefined] returned.");

		this.oLogMock.expects("error")
			.withExactArgs("Symbol '€' is defined multiple times in custom currencies.", undefined, "NumberFormat");
		const oFormat2 = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"EUR5": {
					"isoCode": "EUR",
					decimals: 5
				},
				"EU": {
					symbol: "€",
					decimals: 2
				}
			}
		});

		assert.strictEqual(oFormat2.format(12345.6789, "EUR5"), "€12,345.67890", "€12,345.68");
		assert.strictEqual(oFormat2.format(12345.6789, "EU"), "€12,345.68", "€12,345.6789");
		this.oLogMock.expects("error")
			.withExactArgs("The parsed currency symbol '€' is defined multiple times in custom currencies."
				+ "Therefore the result is not distinct.");
		assert.deepEqual(oFormat2.parse("€12,345.679"), [12345.679, undefined], "[12345.679, undefined] returned.");
	});

	QUnit.test("Duplicated symbol defined via custom currency", function(assert) {
		Formatting.setCustomCurrencies({
			"EURO": {
				"digits": 5,
				"isoCode": "EUR"
			}
		});

		this.oLogMock.expects("error")
			.withExactArgs("Symbol '€' is defined multiple times in custom currencies.", undefined, "NumberFormat");
		const oFormat = getCurrencyInstance({
			currencyCode: false
		});

		this.oLogMock.expects("error")
			.withExactArgs("The parsed currency symbol '€' is defined multiple times in custom currencies."
				+ "Therefore the result is not distinct.");
		assert.deepEqual(oFormat.parse("€12,345.679"), [12345.679, undefined], "Duplicated symbol found");
	});

	QUnit.test("Currency that is named with digits only", function(assert) {
		const oFormat = getCurrencyInstance({
			showNumber: true,
			showMeasure: true,
			customCurrencies: {
				"180": {
					decimals: 2
				}
			}
		});

		assert.strictEqual(oFormat.format(123, "180"), "123.00180", "formatting [123, '180']");

		assert.deepEqual(oFormat.parse("123.00 180"), [123, "180"], "parsing 123.00 180");
		assert.deepEqual(oFormat.parse("123.00180"), [123, "180"], "parsing 123.00 180");
		assert.deepEqual(oFormat.parse("12300180"), [12300, "180"], "parsing 123.00 180");
	});

	QUnit.test("Currencies with undefined symbol", function(assert) {

		const oFormat = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					symbol: "Ƀ"
				},
				"Bitcoin": {
					isoCode: "foo",
					"decimals": 3
				},
				"DOLLAR": {
					isoCode: "foo",
					"decimals": 4
				}
			}
		});

		assert.strictEqual(oFormat.format(123, "Bitcoin"), "Bitcoin\xa0123.000");
	});

	QUnit.test("decimals = 0", function (assert) {
		const oFormatEN = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€",
					decimals: 0
				}
			}
		});
		assert.strictEqual(oFormatEN.format(undefined, undefined), "", "no values returns an empty string - en");
		assert.strictEqual(oFormatEN.format(1234.56, undefined), "1,234.56", "only number formatted - en");
		assert.strictEqual(oFormatEN.format(1234.5728, "FOB"), "F€1,235", "formatted both - en");

		const oFormatDE = getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"HOD": {
					symbol: "H$",
					decimals: 0
				}
			}
		}, new Locale("de"));
		assert.strictEqual(oFormatDE.format(undefined, undefined), "", "no values returns an empty string - de");
		assert.strictEqual(oFormatDE.format(1234.56, undefined), "1.234,56", "only number formatted - de");
		assert.strictEqual(oFormatDE.format(1234.5728, "HOD"), "1.235" + "\xa0" + "H$", "formatted both - de");
	});

	QUnit.test("Parse simple number", function(assert) {
		const oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});

		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "123.457"), ["123.457", "DOLLAR"], "['123.457', 'DOLLAR']");

		// Ignore decimal setting (5) for the IOTA currency
		assert.deepEqual(oFormat.parse("IOTA" + "\xa0" + "123.45788888"), ["123.45788888", "IOTA"], "['123.4578888', 'IOTA']");

		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "123,456.789"), ["123456.789", "DOLLAR"], "['123456.789', 'DOLLAR']");

		// Max safe integer (2^53)-1  ->  9007199254740991
		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "9,007,199,254,740,991.000"), ["9007199254740991.000", "DOLLAR"], "['9007199254740991.000', 'DOLLAR']");

		// Larger than max safe integer
		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "9,007,199,254,740,991,678.000"), ["9007199254740991678.000", "DOLLAR"], "['9007199254740991678.000', 'DOLLAR']");
	});

	QUnit.test("Parse negative number (with and w/o invisible non-breaking space)", function(assert) {
		const oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});
		assert.deepEqual(oFormat.parse("DOLLAR-123.457"), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("DOLLAR" + "\ufeff" + "-123.457"), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");

		assert.deepEqual(oFormat.parse(oFormat.format(-123.457, "DOLLAR")), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");
	});

	QUnit.test("Parse simple number with symbol", function(assert) {
		const oFormat = getCurrencyInstance({
			currencyCode: false,
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 4,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$123.457"), ["123.457", "DOLLAR"], "['123.457', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("y123.457"), ["123.457", "IOTA"], "['123.457', 'IOTA']");

		// Don't show thousands separator in parsing result
		assert.deepEqual(oFormat.parse("$123,456.789"), ["123456.789", "DOLLAR"], "['123456.789', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("y 123,456.789"), ["123456.789", "IOTA"], "['123456.789', 'IOTA']");
		assert.deepEqual(oFormat.parse("y123,456.789"), ["123456.789", "IOTA"], "['123456.789', 'IOTA']");
	});

	QUnit.test("Parse unknown currency", function (assert) {
		const oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		});

		assert.deepEqual(oFormat.parse("EUR 123456,789"), null, "null is returned.");
	});

	QUnit.test("Parse symbol only", function (assert) {
		const oFormat = getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"Dollar": {
					"decimals": 5,
					"symbol": "$"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$"), null, "Null is returned.");
	});

	QUnit.test("Currency format with showMeasure true and currencyContext accounting", function (assert) {
		const oFormat = getCurrencyInstance({
			showMeasure: true,
			currencyContext: "accounting"
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "(123,456.79" + "\xa0" + "EUR)", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "(123,456.79" + "\xa0" + "EUR)", "123456.789 EUR");
	});

	QUnit.test("Currency format with showMeasure false and currencyContext accounting", function (assert) {
		const oFormat = getCurrencyInstance({
			showMeasure: false,
			currencyContext: "accounting"
		});
		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "(123,456.79)", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "(123,456.79)", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeasure specific locale ko", function (assert) {
		// The currency pattern is defined in "ko" as: ¤#,##0.00;(¤#,##0.00) where the pattern after ';'
		// should be used for negative numbers.
		const oFormat = getCurrencyInstance({
			currencyContext: "accounting"
		}, new Locale("ko"));

		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "(123,456.79" + "\xa0" + "EUR)", "-123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "(123,456.79" + "\xa0" + "EUR)", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeasure and set decimal option to overwrite the default number of decimal", function (assert) {
		const oFormat = getCurrencyInstance({
			decimals: 1
		});

		assert.strictEqual(oFormat.format(123456.789, "EUR"), "123,456.8" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format([123456.789, "EUR"]), "123,456.8" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format(-123456.789, "EUR"), "-123,456.8" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "-123,456.8" + "\xa0" + "EUR", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeasure and the precision option should be ignored", function (assert) {
		const oFormat = getCurrencyInstance({
			precision: 7
		});

		assert.strictEqual(oFormat.format(123456, "EUR"), "123,456.00" + "\xa0" + "EUR", "123456 EUR");
		assert.strictEqual(oFormat.format([123456.7, "EUR"]), "123,456.70" + "\xa0" + "EUR", "123456.7 EUR");
		assert.strictEqual(oFormat.format(-123456.78, "EUR"), "-123,456.78" + "\xa0" + "EUR", "-123456.78 EUR");
		assert.strictEqual(oFormat.format([-123456.789, "EUR"]), "-123,456.79" + "\xa0" + "EUR", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeasure and style short. The default precision option shouldn't be ignored", function (assert) {
		const oFormat = getCurrencyInstance({
			style: "short"
		});

		assert.strictEqual(oFormat.format(123456, "EUR"), "123K" + "\xa0" + "EUR", "123456 EUR");
		assert.strictEqual(oFormat.format([1234567.8, "EUR"]), "1.2M" + "\xa0" + "EUR", "123456.7 EUR");
		assert.strictEqual(oFormat.format(12345678.9, "EUR"), "12M" + "\xa0" + "EUR", "-123456.78 EUR");
	});

	QUnit.test("check space between currency code and number in different scenarios", function (assert) {
		// in "en-US" locale there's no space in the currency pattern
		// space should be inserted when it's necessary
		let oCurrencyCodeFormatter = getCurrencyInstance();
		let oCurrencySymbolFormatter = getCurrencyInstance({
				currencyCode: false
			});

		assert.strictEqual(oCurrencyCodeFormatter.format(123456.789, "EUR"), "123,456.79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "-123,456.79" + "\xa0" + "EUR", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "EUR"), "€" + "123,456.79", "123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "€\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "HKD"), "HK$123,456.79", "123456.789 HKD");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "HK$\ufeff-123,456.79", "-123456.789 HKD");

		// in "de-DE" locale there's already space in the currency pattern: #,##0.00 ¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = getCurrencyInstance(new Locale("de-DE"));
		oCurrencySymbolFormatter = getCurrencyInstance({
			currencyCode: false
		}, new Locale("de-DE"));

		assert.strictEqual(oCurrencyCodeFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.strictEqual(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "EUR", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "€", "123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "€", "-123456.789 EUR");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "HKD"), "123.456,79" + "\xa0" + "HK$", "123456.789 HKD");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "-123.456,79" + "\xa0" + "HK$", "-123456.789 HKD");

		// in "uk" locale there's no space in the currency pattern and the symbol is at the end: #,##0.00¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = getCurrencyInstance({
			currencyContext: "accounting"
		}, new Locale("uk"));
		oCurrencySymbolFormatter = getCurrencyInstance({
			currencyCode: false,
			currencyContext: "accounting"
		}, new Locale("uk"));

		assert.strictEqual(oCurrencyCodeFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0" + "UAH", "123456.789 UAH");
		assert.strictEqual(oCurrencyCodeFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0" + "UAH", "-123456.789 UAH");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0\u20b4", "123456.789 UAH");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0\u20b4", "-123456.789 UAH");
		assert.strictEqual(oCurrencySymbolFormatter.format(123456.789, "UAK"), "123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "123456.789 UAK");
		assert.strictEqual(oCurrencySymbolFormatter.format(-123456.789, "UAK"), "-123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "-123456.789 UAK");
	});


	QUnit.test("Parse special characters (RTL) in currency string", function (assert) {
		const oFormatter = getCurrencyInstance({
			showMeasure: false,
			parseAsString: true

		}, new Locale("he"));

		assert.deepEqual(oFormatter.parse("702.00"), ["702.00", undefined], "can be parsed properly");
		// from hebrew
		assert.deepEqual(oFormatter.parse("\u200f702.00\u200e"), ["702.00", undefined], "rtl character wrapped number can be parsed properly");
	});




	QUnit.test("parse currency format", function (assert) {
		let oFormat = getCurrencyInstance();
		let aResult = oFormat.parse("EUR -12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-12345.67, "EUR"]);

		aResult = oFormat.parse("-12,345.67 EURO");
		assert.strictEqual(aResult, null, "Currency parser should return null");

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-12345.67, "EUR"]);

		aResult = oFormat.parse("USD23.4567");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [23.4567, "USD"]);

		aResult = oFormat.parse("EUR-1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-1234567.89, "EUR"]);

		aResult = oFormat.parse("EUR");
		assert.strictEqual(aResult, null, "String with currency code only can't be parsed");

		aResult = oFormat.parse("1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [1234567.89, undefined]);

		aResult = oFormat.parse("€" + " 1,234,567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [1234567.89, "EUR"]);

		aResult = oFormat.parse("$ 1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [1234567.89, "USD"]);

		oFormat = getCurrencyInstance({
			showMeasure: false
		});

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.strictEqual(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("USD23.4567");
		assert.strictEqual(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("EUR-1234567.89");
		assert.strictEqual(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("EUR");
		assert.strictEqual(aResult, null, "String with currency code only can't be parsed");

		aResult = oFormat.parse("1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [1234567.89, undefined]);

		oFormat = getCurrencyInstance({
			parseAsString: true
		});

		aResult = oFormat.parse("EUR-12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, ["-12345.67", "EUR"]);

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, ["-12345.67", "EUR"]);

		aResult = oFormat.parse("EUR-00012,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, ["-12345.67", "EUR"]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, ["-12345678901123456.78", "EUR"]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, ["-12345678901123456345678901123456.78", "EUR"]);

		oFormat = getCurrencyInstance({}, new Locale("de"));
		aResult = oFormat.parse("-12.345,67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-12345.67, "EUR"]);

		aResult = oFormat.parse("23,4567 USD");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [23.4567, "USD"]);

		aResult = oFormat.parse("23,4567 $");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [23.4567, "USD"]);

		aResult = oFormat.parse("-1234567,89EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-1234567.89, "EUR"]);

	});

	QUnit.test("parse currency with a currency code having more than or less than 3 letters", function (assert) {
		let oFormat = getCurrencyInstance();
		let aResult = oFormat.parse("EURO 1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EU 1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EUR1,234.00");
		assert.deepEqual(aResult, [1234, "EUR"], "[1234, 'EUR']");

		aResult = oFormat.parse("EURO1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EU1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		// de locale
		oFormat = getCurrencyInstance({}, new Locale("de"));
		aResult = oFormat.parse("1.234,00 EU");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00 EURO");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EURO");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EU");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EUR");
		assert.deepEqual(aResult, [1234, "EUR"], "[1234, 'EUR']");


	});

	QUnit.test("parse currency short format", function (assert) {
		const oFormat = getCurrencyInstance();
		let aResult = oFormat.parse("GBP 5");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [5, "GBP"]);

		aResult = oFormat.parse("SEK 6");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [6, "SEK"]);

		aResult = oFormat.parse("12 EUR K");
		assert.strictEqual(aResult, null, "Currency between number and scale cannot be parsed");

		aResult = oFormat.parse("EUR-12K");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-12000, "EUR"]);

		aResult = oFormat.parse("-12K EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-12000, "EUR"]);

		aResult = oFormat.parse("USD23M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [23000000, "USD"]);

		aResult = oFormat.parse("EUR -12 million");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [-12000000, "EUR"]);

		aResult = oFormat.parse("EUR 0.00T");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [0, "EUR"]);

		aResult = oFormat.parse("EUR 0.2M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [200000, "EUR"]);
	});

	QUnit.test("currency for 'he' locale with big number. Contains no RTL characters", function (assert) {
		//setup
		const oFormat = getCurrencyInstance({
			showMeasure: false
		}, new Locale("he"));

		// input and output
		const iExpectedNumber = 50000;

		// execution
		const sFormatResult = oFormat.format(iExpectedNumber);
		assert.strictEqual(sFormatResult, "\u200F50,000.00\u00A0\u200F", "can be formatted '" + sFormatResult + "' (RTL character)");

		const aParseResult = oFormat.parse(sFormatResult);
		assert.deepEqual(aParseResult, [50000, undefined], "should match input number " + iExpectedNumber);
	});

	QUnit.test("currency format/parse for currencies with letter 'K' in the measure symbol", function(assert) {
		//setup
		const oFormat = getCurrencyInstance({
			showMeasure: true
		}, new Locale("en"));


		["SEK", "DKK"].forEach(function(sCurrencyMeasure) {

			// input and output
			const iExpectedNumber = 12345;
			assert.ok(iExpectedNumber, "Input: " + iExpectedNumber + ", " + sCurrencyMeasure);

			// execution
			const sFormatResult = oFormat.format(iExpectedNumber, sCurrencyMeasure);
			assert.ok(sFormatResult, "Formatted: " + sFormatResult);

			const aParseResult = oFormat.parse(sFormatResult);
			assert.deepEqual(aParseResult, [iExpectedNumber, sCurrencyMeasure], "Parsed: " + aParseResult.join(", "));
		});
	});

	QUnit.test("format/parse indian lakhs/crores", function (assert) {
		const oLocale = new Locale("en-IN");
		let oFormat = getCurrencyInstance({}, oLocale);

		assert.strictEqual(oFormat.format(100000, "INR"), "1,00,000.00" + "\xa0" + "INR", "INR is formatted with correct grouping");
		assert.strictEqual(oFormat.format(10000000, "INR"), "1,00,00,000.00" + "\xa0" + "INR", "INR is formatted with correct grouping");
		assert.strictEqual(oFormat.format(10000000000, "INR"), "10,00,00,00,000.00" + "\xa0" + "INR", "INR is formatted with correct grouping");
		assert.strictEqual(oFormat.format(1000000000000, "INR"), "10,00,00,00,00,000.00" + "\xa0" + "INR", "INR is formatted with correct grouping");
		assert.strictEqual(oFormat.format(100000000000000, "INR"), "10,00,00,00,00,00,000.00" + "\xa0" + "INR", "INR is formatted with correct grouping");

		oFormat = getCurrencyInstance({ style: "short" }, oLocale);

		assert.strictEqual(oFormat.format(100000, "INR"), "1 Lk" + "\xa0" + "INR", "INR is formatted as Lk/Cr");
		assert.strictEqual(oFormat.format(10000000, "INR"), "1 Cr" + "\xa0" + "INR", "INR is formatted as Lk/Cr");
		assert.strictEqual(oFormat.format(10000000000, "INR"), "1,000 Cr" + "\xa0" + "INR", "INR is formatted as Lk/Cr");
		assert.strictEqual(oFormat.format(1000000000000, "INR"), "1 Lk Cr" + "\xa0" + "INR", "INR is formatted as Lk/Cr");
		assert.strictEqual(oFormat.format(100000000000000, "INR"), "100 Lk Cr" + "\xa0" + "INR");

		assert.strictEqual(oFormat.format(100000, "USD"), "100k" + "\xa0" + "USD", "USD is formatted as M/B/T");
		assert.strictEqual(oFormat.format(1000000, "USD"), "1m" + "\xa0" + "USD", "USD is formatted as M/B/T");
		assert.strictEqual(oFormat.format(1000000000, "USD"), "1bn" + "\xa0" + "USD", "USD is formatted as M/B/T");

		let aResult = oFormat.parse("INR 12 Lk");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [1200000, "INR"]);

		aResult = oFormat.parse("12 Lk INR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [1200000, "INR"]);

		aResult = oFormat.parse("INR 12 Cr");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [120000000, "INR"]);

		aResult = oFormat.parse("EUR 12m");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.deepEqual(aResult, [12000000, "EUR"]);
	});

	QUnit.test("getScale", function (assert) {
		const oLocale = new Locale("en");
		let oFormat = getCurrencyInstance({style: "short", shortRefNumber: 1234}, oLocale);
		assert.strictEqual(oFormat.getScale(), "K\xa0\u00a4", "scale is correctly retrieved");

		oFormat = getCurrencyInstance({style: "short"}, oLocale);
		assert.strictEqual(oFormat.getScale(), undefined, "scale not retrieved");

		oFormat = getCurrencyInstance({}, oLocale);
		assert.strictEqual(oFormat.getScale(), undefined, "scale not retrieved");
	});

	// RTL

	var aLocales = [
		"ar_SA",
		"de_DE",
		"da_DK",
		"en_GB",
		"en_US",
		"es_MX",
		"es_ES",
		"fr_FR",
		"ja_JP",
		"id_ID",
		"it_IT",
		"ro_RO",
		"ru_RU",
		"pt_BR",
		"hi_IN",
		"tr_TR",
		"th_TH",
		"nl_NL",
		"pl_PL",
		"ko_KR",
		"zh_TW",
		"zh_CN"
	];

	function isTrailing(sFormatted) {
		return sFormatted.search(/\d+/) < sFormatted.search(/EUR/);
	}
	aLocales.forEach(function(sLocale) {
		const oLocale = new Locale(sLocale);
		QUnit.test("standard " + sLocale, function (assert) {
			const oFormat = getCurrencyInstance({}, oLocale);
			const sResult = oFormat.format(100000, "EUR");
			assert.ok(isTrailing(sResult), "Locale " + sLocale +  " '" + sResult + "'");
		});

		QUnit.test("accounting " + sLocale, function (assert) {
			// positive
			const oFormat = getCurrencyInstance({
				currencyContext: "accounting"
			}, oLocale);
			const sResult = oFormat.format(100000, "EUR");
			assert.ok(isTrailing(sResult), "Locale " + sLocale +  " '" + sResult + "'");
			// negative
			const sResultNegative = oFormat.format(-100000, "EUR");
			assert.ok(isTrailing(sResultNegative), "Locale " + sLocale +  " '" + sResultNegative + "'");
		});

		QUnit.test("style " + sLocale, function (assert) {
			const oFormat = getCurrencyInstance({style: "short"}, oLocale);
			const sResult = oFormat.format(10, "EUR");
			assert.ok(isTrailing(sResult), "Locale " + sLocale +  " '" + sResult + "'");

			const sResultBig = oFormat.format(100000000, "EUR");
			assert.ok(isTrailing(sResultBig), "Locale " + sLocale +  " '" + sResultBig + "'");
		});
	});


	QUnit.test("standard " + "fa_IR", function (assert) {
		const oFormat = getCurrencyInstance({}, new Locale("fa_IR"));
		const sResult = oFormat.format(100000, "EUR");
		assert.strictEqual(sResult, "\u200e\u202aEUR\u202c\u00a0100,000.00");
	});

	QUnit.test("accounting " + "fa_IR", function (assert) {
		// positive
		const oFormat = getCurrencyInstance({
			currencyContext: "accounting"
		}, new Locale("fa_IR"));
		const sResult = oFormat.format(100000, "EUR");
		assert.strictEqual(sResult, "\u200e\u202aEUR\u202c\u00a0100,000.00");
		// negative
		const sResultNegative = oFormat.format(-100000, "EUR");
		assert.strictEqual(sResultNegative, "\u200e(\u202aEUR\u202c\u00a0100,000.00)");
	});

	QUnit.test("style " + "fa_IR", function (assert) {
		const oFormat = getCurrencyInstance({style: "short"}, new Locale("fa_IR"));
		const sResult = oFormat.format(10, "EUR");
		assert.strictEqual(sResult, "\u200e\u202aEUR\u202c\u00a010");

		const sResultBig = oFormat.format(100000000, "EUR");
		assert.strictEqual(sResultBig, "\u200e100\u00a0میلیون\u00a0\u202aEUR\u202c");
	});


	QUnit.test("standard " + "he_IL", function (assert) {
		const oFormat = getCurrencyInstance({}, new Locale("he_IL"));
		const sResult = oFormat.format(100000, "EUR");
		assert.strictEqual(sResult, "\u200f100,000.00\u00a0\u200fEUR\u200e");
	});

	QUnit.test("accounting " + "he_IL", function (assert) {
		// positive
		const oFormat = getCurrencyInstance({
			currencyContext: "accounting"
		}, new Locale("he_IL"));
		const sResult = oFormat.format(100000, "EUR");
		assert.strictEqual(sResult, "\u200f100,000.00\u00a0\u200fEUR\u200e");
		// negative
		const sResultNegative = oFormat.format(-100000, "EUR");
		assert.strictEqual(sResultNegative, "\u200f\u200e-100,000.00\u00a0\u200fEUR\u200e");
	});

	QUnit.test("style " + "he_IL", function (assert) {
		const oFormat = getCurrencyInstance({style: "short"}, new Locale("he_IL"));
		const sResult = oFormat.format(10, "EUR");
		assert.strictEqual(sResult, "\u200f10\u00a0\u200fEUR\u200e");

		const sResultBig = oFormat.format(100000000, "EUR");
		assert.strictEqual(sResultBig, "\u200f100M\u200f\u00a0\u200f\u200eEUR");
	});

	QUnit.test("overwrite configuration config", function (assert) {
		Formatting.setTrailingCurrencyCode(false);
		assert.notOk(NumberFormat.getCurrencyInstance().oFormatOptions.trailingCurrencyCode, "taken from config");

		Formatting.setTrailingCurrencyCode(true);
		assert.notOk(NumberFormat.getCurrencyInstance({pattern:"0"}).oFormatOptions.trailingCurrencyCode, "overwritten by pattern");
		assert.notOk(NumberFormat.getCurrencyInstance({currencyCode:false}).oFormatOptions.trailingCurrencyCode, "overwritten by currencyCode");
		assert.notOk(NumberFormat.getCurrencyInstance({trailingCurrencyCode:false}).oFormatOptions.trailingCurrencyCode, "overwritten by trailingCurrencyCode");

		// combined
		assert.notOk(NumberFormat.getCurrencyInstance({currencyCode:false, trailingCurrencyCode:false}).oFormatOptions.trailingCurrencyCode, "overwritten by currencyCode and trailingCurrencyCode");
		assert.notOk(NumberFormat.getCurrencyInstance({pattern:"0", currencyCode:false}).oFormatOptions.trailingCurrencyCode, "overwritten by currencyCode and pattern");
		assert.notOk(NumberFormat.getCurrencyInstance({pattern:"0", trailingCurrencyCode:false}).oFormatOptions.trailingCurrencyCode, "overwritten by trailingCurrencyCode and pattern");
		assert.notOk(NumberFormat.getCurrencyInstance({pattern:"0", currencyCode:false, trailingCurrencyCode:false}).oFormatOptions.trailingCurrencyCode, "overwritten by pattern and currencyCode");
		assert.notOk(NumberFormat.getCurrencyInstance({pattern:"0", currencyCode:false, trailingCurrencyCode:true}).oFormatOptions.trailingCurrencyCode, "overwritten by pattern and currencyCode");
	});
});
