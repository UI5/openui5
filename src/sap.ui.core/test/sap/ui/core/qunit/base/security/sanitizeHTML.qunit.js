/*global QUnit */
sap.ui.define([
	"sap/base/security/sanitizeHTML",
	"sap/ui/thirdparty/caja-html-sanitizer"
], function(sanitizeHTML) {
	"use strict";

	QUnit.module("Sanitizer Functionality");

	QUnit.test("valid HTML5", function(assert) {

		var sHTML = "<div><article></article><progress></progress></div>";
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = "<table><tr><td></td></tr></table>";
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = "<div><input><audio></audio></div>";
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><img draggable="true"><video></video></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

	});

	QUnit.test("obsolete HTML4 (not valid)", function(assert) {

		var sHTML = "<div><font></font><center></center></div>";
		var sResultHTML = "<div></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<table><tr><td><frame></frame></td></tr></table>";
		sResultHTML = "<table><tr><td></td></tr></table>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><dir></dir></div>";
		sResultHTML = "<div></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><img><nobr>Some Text</nobr></div>";
		sResultHTML = "<div><img>Some Text</div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

	});

	QUnit.test("dangerous code (not valid)", function(assert) {

		var sHTML = "<table><tr><td><script>alert('XSS attack');</" + "script></td></tr></table>";
		var sResultHTML = "<table><tr><td></td></tr></table>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><object></object><audio></audio></div>";
		sResultHTML = "<div><audio></audio></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><title></title><audio></audio></div>";
		sResultHTML = "<div><audio></audio></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<html><head></head><body><div></div></body></html>";
		sResultHTML = "<div></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

	});

	QUnit.test("valid URLs", function(assert) {

		var sHTML = '<div><a href="http://anonymous.org">Some Link</a></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<table><tr><td><a href="http://www.sap.com">SAP</a></td></tr></table>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><a href="https://sdn.sap.com">SDN</a><audio></audio></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><img draggable="true"><a href="http://www.sap.com/index.epx">SAP with path</a><video></video></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

	});

	QUnit.test("invalid URLs (not valid)", function(assert) {

		var sHTML = '<div><a href="xxxxx%%%%%%-----------;;;;;;">Some Link</a></div>';
		var sResultHTML = '<div><a>Some Link</a></div>';
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

	});

	QUnit.test("numeric font-weight", function(assert) {
		assert.equal(
			sanitizeHTML("<span style=\"font-weight: 900\"></span>"),
			"<span style=\"font-weight: 900\"></span>",
			"a standard numeric font-weight (900) is accepted");

		assert.equal(
			sanitizeHTML("<span style=\"font-weight: lighter\"></span>"),
			"<span style=\"font-weight: lighter\"></span>",
			"a named font-weight (lighter) is accepted");

		assert.equal(
			sanitizeHTML("<span style=\"font-weight: 451\"></span>"),
			"<span style=\"font-weight: \"></span>",
			"a CSS Font Level 4 value (451) is not accepted");
	});

	QUnit.test("Validate CSS display value", function(assert) {
		var input1 = '<div style="display: flex ; width: 100px ; background-color: aqua">HELLO</div>';
		assert.equal(sanitizeHTML(input1), input1, "display:flex is preserved");

		var input2 = '<div style="display: inline-flex ; width: 100px ; background-color: aqua">HELLO</div>';
		assert.equal(sanitizeHTML(input2), input2, "display:inline-flex is preserved");

		var input3 = '<div style="display: inline flow-root ; width: 100px ; background-color: aqua">HELLO</div>';
		assert.equal(sanitizeHTML(input3), input3, "display:inline flow-root is preserved");
	});

	QUnit.test("text-decoration-line CSS property", function(assert) {
		var inputUnderline = '<span style="text-decoration-line: underline">Underlined text</span>';
		assert.equal(sanitizeHTML(inputUnderline), inputUnderline, "text-decoration-line: underline is preserved");

		var inputOverline = '<span style="text-decoration-line: overline">Overlined text</span>';
		assert.equal(sanitizeHTML(inputOverline), inputOverline, "text-decoration-line: overline is preserved");

		var inputLineThrough = '<span style="text-decoration-line: line-through">Strikethrough text</span>';
		assert.equal(sanitizeHTML(inputLineThrough), inputLineThrough, "text-decoration-line: line-through is preserved");

		var inputNone = '<span style="text-decoration-line: none">No decoration</span>';
		assert.equal(sanitizeHTML(inputNone), inputNone, "text-decoration-line: none is preserved");

		var inputMultiple = '<span style="text-decoration-line: underline overline">Multiple decorations</span>';
		assert.equal(sanitizeHTML(inputMultiple), inputMultiple, "text-decoration-line with multiple values is preserved");

		var inputInvalid = '<span style="text-decoration-line: invalid-value">Invalid decoration</span>';
		assert.equal(sanitizeHTML(inputInvalid), '<span style="text-decoration-line: ">Invalid decoration</span>', "invalid text-decoration-line value is stripped");
	});

	QUnit.module("Sanitizer Performance", {
		before: function(assert) {
			// add a custom assertion "lower than"
			QUnit.assert.lt = function(actual, expected, message) {
				this.pushResult({
					result: actual < expected,
					actual: actual,
					expected: "< " + expected,
					message: message
				});
			};
		},
		after: function(assert) {
			delete QUnit.assert.lt;
		}
	});

	QUnit.test("lexCss", function(assert) {

		assert.equal(typeof window.lexCss, "function", "[precondition] there should be a global function 'lexCss'");

		[
			{
				input: "width: 100%",
				tokens: ["width", ":", " ", "100%"]
			},
			{
				input: "background-image: url(foobar.png);",
				tokens: ["background-image", ":", " ", "url(\"foobar.png\")", ";"]
			},
			{
				input: "background-image: url('foobar.png');",
				tokens: ["background-image", ":", " ", "url(\"foobar.png\")", ";"]
			},
			{
				input: "background-image: url(\"foobar.png\");",
				tokens: ["background-image", ":", " ", "url(\"foobar.png\")", ";"]
			},
			{
				input: "width: calc(100px+20em);",
				tokens: ["width", ":", " ", "calc(", "100px", "+20em", ")", ";"]
			},
			{
				input: "font: 10pt normal 'Helvetic Neue',sans-serif;",
				tokens: ["font", ":", " ", "10pt", " ", "normal", " ", "\"Helvetic Neue\"", ",", "sans-serif", ";"]
			},
			{
				input: "font-size:10.0pt; font-family:\\5320\\7265\\6669\\2020\\2020\\2020\\2020\\2020\\2020\\2020\\2020\\2020\\2020; color:black",
				tokens: [
					"font-size", ":", "10.0pt", ";", " ",
					"font-family", ":", "\u5320\u7265\u6669\u2020\u2020\u2020\u2020\u2020\u2020\u2020\u2020\u2020\u2020", ";", " ",
					"color", ":", "black"
				]
			}
		].forEach(function(oData) {
			var N = 4,
				t0, t1, tokens, i;

			// act
			t0 = Date.now();
			for (i = 0; i < N; i++) {
				tokens = window.lexCss(oData.input);
			}
			t1 = Date.now();

			// assert
			assert.deepEqual(tokens, oData.tokens, "tokenizing \"" + oData.input + "\" should return the expected tokens");
			assert.lt((t1 - t0) / N, 100, "avg. call time should be less than 100ms");
		});
	});

});
