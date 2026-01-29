/*global QUnit */
sap.ui.define([
	"sap/ui/dom/detectTextSelection",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(detectTextSelection, createAndAppendDiv) {
	"use strict";

	QUnit.module("Basic Functionality", {
		beforeEach: function() {
			this.oContainer = createAndAppendDiv("test-container");
			this.oContainer.innerHTML = '<div id="parent"><span id="child1">First text</span><span id="child2">Second text</span></div>';
			this.oParent = document.getElementById("parent");
			this.oChild1 = document.getElementById("child1");
			this.oChild2 = document.getElementById("child2");
		},
		afterEach: function() {
			// Clear any text selection
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}
			this.oContainer.remove();
		}
	});

	QUnit.test("Should return false when oDomRef is null", function(assert) {
		// Act
		const bResult = detectTextSelection(null);

		// Assert
		assert.strictEqual(bResult, false, "Returns false for null parameter");
	});

	QUnit.test("Should return false when oDomRef is undefined", function(assert) {
		// Act
		const bResult = detectTextSelection(undefined);

		// Assert
		assert.strictEqual(bResult, false, "Returns false for undefined parameter");
	});

	QUnit.test("Should return false when there is no text selection", function(assert) {
		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, false, "Returns false when no text is selected");
	});

	QUnit.test("Should return false when selection is empty string", function(assert) {
		// Arrange
		const oRange = document.createRange();
		oRange.selectNodeContents(this.oChild1);
		oRange.collapse(true); // Collapse to start, creating empty selection
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, false, "Returns false when selection is empty");
	});

	QUnit.test("Should return true when text is selected within child element", function(assert) {
		// Arrange - select text in child1
		const oRange = document.createRange();
		oRange.selectNodeContents(this.oChild1);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, true, "Returns true when text is selected in child element");
	});

	QUnit.test("Should return false when element itself is focusNode", function(assert) {
		// Arrange - This tests the oDomRef !== oFocusNode condition
		const oRange = document.createRange();
		oRange.selectNodeContents(this.oParent);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Mock the selection to have parent as focusNode (edge case)
		const oOriginalGetSelection = window.getSelection;
		const that = this;
		window.getSelection = function() {
			return {
				toString: function() { return "text"; },
				focusNode: that.oParent,
				anchorNode: that.oChild1
			};
		};

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Cleanup
		window.getSelection = oOriginalGetSelection;

		// Assert
		assert.strictEqual(bResult, true, "Returns true when anchorNode is child even if focusNode is parent");
	});

	QUnit.test("Should return false when element itself is both focusNode and anchorNode", function(assert) {
		// Arrange - Mock selection where element is both focus and anchor
		const oOriginalGetSelection = window.getSelection;
		const that = this;
		window.getSelection = function() {
			return {
				toString: function() { return "text"; },
				focusNode: that.oParent,
				anchorNode: that.oParent
			};
		};

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Cleanup
		window.getSelection = oOriginalGetSelection;

		// Assert
		assert.strictEqual(bResult, false, "Returns false when element is both focusNode and anchorNode");
	});

	QUnit.module("Text Selection with Multiple Elements", {
		beforeEach: function() {
			this.oContainer = createAndAppendDiv("test-container");
			this.oContainer.innerHTML = '<div id="parent"><p id="para1">First paragraph</p><p id="para2">Second paragraph</p></div>';
			this.oParent = document.getElementById("parent");
			this.oPara1 = document.getElementById("para1");
			this.oPara2 = document.getElementById("para2");
		},
		afterEach: function() {
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}
			this.oContainer.remove();
		}
	});

	QUnit.test("Should detect selection across multiple child elements", function(assert) {
		// Arrange - Select from para1 to para2
		const oRange = document.createRange();
		oRange.setStart(this.oPara1.firstChild, 0);
		oRange.setEnd(this.oPara2.firstChild, 6);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, true, "Returns true for selection across multiple children");
	});

	QUnit.test("Should return false when selection is in unrelated element", function(assert) {
		// Arrange - Create another element not related to parent
		const oUnrelated = document.createElement("div");
		oUnrelated.id = "unrelated";
		oUnrelated.textContent = "Unrelated text";
		document.body.appendChild(oUnrelated);

		const oRange = document.createRange();
		oRange.selectNodeContents(oUnrelated);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Cleanup
		oUnrelated.remove();

		// Assert
		assert.strictEqual(bResult, false, "Returns false when selection is in unrelated element");
	});

	QUnit.module("Newline Handling", {
		beforeEach: function() {
			this.oContainer = createAndAppendDiv("test-container");
			this.oContainer.innerHTML = '<div id="parent"><pre id="preformatted">Line 1\nLine 2\nLine 3</pre></div>';
			this.oParent = document.getElementById("parent");
			this.oPreformatted = document.getElementById("preformatted");
		},
		afterEach: function() {
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}
			this.oContainer.remove();
		}
	});

	QUnit.test("Should detect selection with single newline", function(assert) {
		// Arrange
		const oRange = document.createRange();
		oRange.selectNodeContents(this.oPreformatted);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, true, "Returns true for multi-line selection");
	});

	QUnit.test("Should handle selection with only newline character", function(assert) {
		// Arrange - Mock selection with only newline
		const oOriginalGetSelection = window.getSelection;
		const that = this;
		window.getSelection = function() {
			return {
				toString: function() { return "\n"; },
				focusNode: that.oPreformatted.firstChild,
				anchorNode: that.oPreformatted.firstChild
			};
		};

		// Act
		const bResult = detectTextSelection(that.oParent);

		// Cleanup
		window.getSelection = oOriginalGetSelection;

		// Assert
		assert.strictEqual(bResult, false, "Returns false when selection is only a newline character");
	});

	QUnit.module("Edge Cases with window.getSelection", {
		beforeEach: function() {
			this.oContainer = createAndAppendDiv("test-container");
			this.oContainer.innerHTML = '<div id="parent"><span id="child">Text content</span></div>';
			this.oParent = document.getElementById("parent");
			this.oChild = document.getElementById("child");
			this.oOriginalGetSelection = window.getSelection;
		},
		afterEach: function() {
			window.getSelection = this.oOriginalGetSelection;
			this.oContainer.remove();
		}
	});

	QUnit.test("Should return false when getSelection returns null", function(assert) {
		// Arrange
		window.getSelection = function() {
			return null;
		};

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, false, "Returns false when getSelection returns null");
	});

	QUnit.test("Should return true when only focusNode is valid", function(assert) {
		// Arrange
		const that = this;
		window.getSelection = function() {
			return {
				toString: function() { return "text"; },
				focusNode: that.oChild.firstChild,
				anchorNode: null
			};
		};

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, true, "Returns true when focusNode is valid child");
	});

	QUnit.test("Should return true when only anchorNode is valid", function(assert) {
		// Arrange
		const that = this;
		window.getSelection = function() {
			return {
				toString: function() { return "text"; },
				focusNode: null,
				anchorNode: that.oChild.firstChild
			};
		};

		// Act
		const bResult = detectTextSelection(this.oParent);

		// Assert
		assert.strictEqual(bResult, true, "Returns true when anchorNode is valid child");
	});

	QUnit.module("Integration with Real DOM", {
		beforeEach: function() {
			this.oContainer = createAndAppendDiv("test-container");
			this.oContainer.innerHTML =
				'<div id="list-item" style="padding: 10px; border: 1px solid #ccc;">' +
				'  <div id="title">Item Title</div>' +
				'  <div id="description">Item Description with more text</div>' +
				'</div>';
			this.oListItem = document.getElementById("list-item");
			this.oTitle = document.getElementById("title");
			this.oDescription = document.getElementById("description");
		},
		afterEach: function() {
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}
			this.oContainer.remove();
		}
	});

	QUnit.test("Should detect text selection in title", function(assert) {
		// Arrange
		const oRange = document.createRange();
		oRange.selectNodeContents(this.oTitle);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(this.oListItem);

		// Assert
		assert.strictEqual(bResult, true, "Detects selection in title within list item");
	});

	QUnit.test("Should detect partial text selection", function(assert) {
		// Arrange - Select only "Description" from "Item Description with more text"
		const oRange = document.createRange();
		const oTextNode = this.oDescription.firstChild;
		oRange.setStart(oTextNode, 5); // Start at "Description"
		oRange.setEnd(oTextNode, 16); // End after "Description"
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(this.oListItem);

		// Assert
		assert.strictEqual(bResult, true, "Detects partial text selection within child element");
	});

	QUnit.test("Should not detect when checking against wrong parent", function(assert) {
		// Arrange
		const oOtherElement = document.createElement("div");
		oOtherElement.textContent = "Other element";
		document.body.appendChild(oOtherElement);

		const oRange = document.createRange();
		oRange.selectNodeContents(this.oTitle);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(oOtherElement);

		// Cleanup
		oOtherElement.remove();

		// Assert
		assert.strictEqual(bResult, false, "Returns false when checking against wrong parent element");
	});

	QUnit.module("Performance and Stability", {
		beforeEach: function() {
			this.oContainer = createAndAppendDiv("test-container");
		},
		afterEach: function() {
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}
			this.oContainer.remove();
		}
	});

	QUnit.test("Should handle multiple consecutive calls", function(assert) {
		// Arrange
		this.oContainer.innerHTML = '<div id="parent"><span id="child">Text</span></div>';
		const oParent = document.getElementById("parent");
		const oChild = document.getElementById("child");

		const oRange = document.createRange();
		oRange.selectNodeContents(oChild);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act & Assert
		for (let i = 0; i < 10; i++) {
			const bResult = detectTextSelection(oParent);
			assert.strictEqual(bResult, true, "Call " + (i + 1) + " returns true consistently");
		}
	});

	QUnit.test("Should handle deeply nested elements", function(assert) {
		// Arrange - Create deeply nested structure
		this.oContainer.innerHTML =
			'<div id="level1">' +
			'  <div id="level2">' +
			'    <div id="level3">' +
			'      <div id="level4">' +
			'        <span id="deepChild">Deep text</span>' +
			'      </div>' +
			'    </div>' +
			'  </div>' +
			'</div>';

		const oLevel1 = document.getElementById("level1");
		const oDeepChild = document.getElementById("deepChild");

		const oRange = document.createRange();
		oRange.selectNodeContents(oDeepChild);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(oRange);

		// Act
		const bResult = detectTextSelection(oLevel1);

		// Assert
		assert.strictEqual(bResult, true, "Detects selection in deeply nested child");
	});
});
