/*global QUnit */

sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Tokenizer",
	"sap/m/OverflowToolbarTokenizer",
	"sap/m/Token",
	"sap/m/Title",
	"sap/ui/core/Icon",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/Text",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/ui/base/Event",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/m/library",
	"sap/ui/model/json/JSONModel"
], function(
	nextUIUpdate,
	Element,
	Library1,
	qutils,
	createAndAppendDiv,
	Tokenizer,
	OverflowToolbarTokenizer,
	Token,
	Title,
	Icon,
	ToolbarSpacer,
	Button,
	OverflowToolbar,
	Text,
	Dialog,
	Label,
	MultiInput,
	Event,
	Device,
	KeyCodes,
	Library,
	JSONModel
) {
	"use strict";

	createAndAppendDiv("content");

	QUnit.module("Initialization", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Test Label"
			});
		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
		}
	});

	QUnit.test("Control is instantiated with correct default properties", function(assert) {
		assert.ok(this.oOTBTokenizer, "OverflowToolbarTokenizer created");
		assert.strictEqual(this.oOTBTokenizer.getLabelText(), "Test Label", "Label text set correctly on initialization");
	});

	QUnit.test("No tokens are present initially", function(assert) {
		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 0, "Initially there are no tokens");
	});

	QUnit.module("Basic Token Handling", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer().placeAt("content");
		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
		}
	});

	QUnit.test("Added tokens are reflected in the tokens aggregation", async function(assert) {
		// Arrange
		this.oOTBTokenizer.addToken(new Token({ text: "Token A" }));
		this.oOTBTokenizer.addToken(new Token({ text: "Token B" }));

		// Act
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 2, "Tokens successfully added");
	});

	QUnit.test("Removing a token decreases the tokens aggregation length", async function(assert) {
		// Arrange
		const oToken = new Token({ text: "Token to Remove" });
		this.oOTBTokenizer.addToken(oToken);

		await nextUIUpdate();
		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 1, "One token added");

		// Act
		this.oOTBTokenizer.removeToken(oToken);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 0, "Token successfully removed");
	});

	QUnit.test("Firing tokenDelete event triggers the fireTokenDelete handler", async function(assert) {
		// Arrange
		const oTokenDeleteSpy = this.spy(this.oOTBTokenizer, "fireTokenDelete");
		const oToken = new Token({ text: "Token to Remove" });

		const oEvent = {
			getParameter: () => {
				return this.oOTBTokenizer._getTokensList().getItems()[0];
			}
		};

		this.oOTBTokenizer.addToken(oToken);
		await nextUIUpdate();

		// Act
		this.oOTBTokenizer._handleNMoreIndicatorPress();
		await nextUIUpdate();

		this.oOTBTokenizer._handleListItemDelete(oEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(oTokenDeleteSpy.called, "Token Delete event should be called");
	});

	QUnit.module("Label Behavior", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Some Label"
			}).placeAt("content");
		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
		}
	});

	QUnit.test("Changing the labelText property is reflected after rendering", async function(assert) {
		// Act
		this.oOTBTokenizer.setLabelText("New Label");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oOTBTokenizer.getLabelText(), "New Label", "Label text property successfully changed");
	});

	QUnit.module("Forced Narrow Mode", {
		beforeEach: async function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Some Label",
				width: "35%",
				tokens: [
					new Token({text: "Token 1", key: "0001"}),
					new Token({text: "Token 2", key: "0002"}),
					new Token({text: "Token 3", key: "0003"}),
					new Token({text: "Token 4 - long text example", key: "0004"}),
					new Token({text: "Token 5", key: "0005"}),
					new Token({text: "Token 6", key: "0006"}),
					new Token({text: "Token 7", key: "0007"}),
					new Token({text: "Token 8", key: "0008"}),
					new Token({text: "Token 9 - long text example 2", key: "0009"}),
					new Token({text: "Token 10", key: "0010"})
				]
			});

			this.oOTBTokenizer = new OverflowToolbarTokenizer();
			this.overflowToolbarWithTokenizer = new OverflowToolbar("overflow-toolbar", {
				width: '100%',
				ariaHasPopup: "dialog",
				tooltip : "This is a bar with tokenizer",
				content : [
				new Button({
						text : "Filter",
						type : "Default"
					}),
					this.oOTBTokenizer,
					new Title({text: "Title with Icon", level: "H1"}),
					new Icon({src : "sap-icon://collaborate"}),
					new ToolbarSpacer(),
					new Text({text: "Just a Simple Text"}),
					new Button({
						text : "Accept",
						type: "Accept"
					})
				]
			});

			this.overflowToolbarWithTokenizer.placeAt("content");
			await nextUIUpdate();

		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;

			this.overflowToolbarWithTokenizer.destroy();
			this.overflowToolbarWithTokenizer = null;
		}
	});

	QUnit.test("Setting overflowMode toggles the renderMode between Overflow and Narrow", async function(assert) {
		// Act
		this.oOTBTokenizer.setOverflowMode(true);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oOTBTokenizer.getRenderMode(), "Overflow", "Overflow render mode is set");

		// Act
		this.oOTBTokenizer.setOverflowMode(false);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oOTBTokenizer.getRenderMode(false), "Narrow", "Overflow render mode is disabled");
	});

	QUnit.module("Keyboard and Focus Handling", {
		beforeEach: async function() {
			this.oButton = new Button({
				text : "Filter",
				type : "Default"
			});
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Some Label",
				width: "35%",
				tokens: [
					new Token({text: "Token 1", key: "0001"}),
					new Token({text: "Token 2", key: "0002"}),
					new Token({text: "Token 3", key: "0003"}),
					new Token({text: "Token 4 - long text example", key: "0004"}),
					new Token({text: "Token 5", key: "0005"}),
					new Token({text: "Token 6", key: "0006"}),
					new Token({text: "Token 7", key: "0007"}),
					new Token({text: "Token 8", key: "0008"}),
					new Token({text: "Token 9 - long text example 2", key: "0009"}),
					new Token({text: "Token 10", key: "0010"})
				]
			});

			this.oOverflowToolbarWithTokenizer = new OverflowToolbar("overflow-toolbar", {
				width: '100%',
				ariaHasPopup: "dialog",
				tooltip : "This is a bar with tokenizer",
				content : [
					this.oButton,
					this.oOTBTokenizer,
					new Title({text: "Title with Icon", level: "H1"}),
					new Icon({src : "sap-icon://collaborate"}),
					new ToolbarSpacer(),
					new Text({text: "Just a Simple Text"}),
					new Button({
						text : "Accept",
						type: "Accept"
					})
				]
			});

			this.oOverflowToolbarWithTokenizer.placeAt("content");
			await nextUIUpdate();

	},
	afterEach: function() {
		this.oOTBTokenizer.destroy();
		this.oOTBTokenizer = null;

		this.oOverflowToolbarWithTokenizer.destroy();
		this.oOverflowToolbarWithTokenizer = null;
	}
	});

	QUnit.test("First token should have tabindex=0 when the tokenizer receives focus", async function(assert) {
		// Arrange
		const oFirstToken = this.oOTBTokenizer.getTokens()[0];
		const oMockEvent = { srcControl: oFirstToken };

		await nextUIUpdate();

		// Act
		this.oOTBTokenizer.onfocusin(oMockEvent);

		// Assert
		assert.strictEqual(oFirstToken.getDomRef().getAttribute("tabindex"), "0", "The first token has tabindex 0 on focusin");
	});

	QUnit.module("Switching between narrow and overflow modes", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Mode Test",
				tokens: [
					new Token({ text: "Sample Token 1" }),
					new Token({ text: "Sample Token 2" })
				]
			}).placeAt("content");
		},
		afterEach: async function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
			await nextUIUpdate();
		}
	});

	QUnit.test("renderMode switches from Narrow to Overflow and back correctly", async function(assert) {
		// Assert initial state
		assert.strictEqual(
			this.oOTBTokenizer.getRenderMode(),
			"Narrow",
			"Default render mode is Narrow"
		);

		// Act: switch to Overflow
		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getRenderMode(),
			"Overflow",
			"Render mode is changed to Overflow"
		);

		// Act: switch back to Narrow
		this.oOTBTokenizer.setProperty("renderMode", "Narrow");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getRenderMode(),
			"Narrow",
			"Render mode is switched back to Narrow"
		);
	});

	QUnit.module("Private API for Label Aggregation", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({labelText: "Initial Label"});
			this.oOTBTokenizer.placeAt("content");
		},
		afterEach: async function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
			await nextUIUpdate();
		}
	});

	QUnit.test("labelText property can be changed multiple times and each change is reflected", async function(assert) {
		assert.strictEqual(
			this.oOTBTokenizer.getLabelText(),
			"Initial Label",
			"Label text is initially set"
		);

		// Act: first change
		this.oOTBTokenizer.setLabelText("Another Label");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getLabelText(),
			"Another Label",
			"Label text updated the first time"
		);

		// Act: second change
		this.oOTBTokenizer.setLabelText("Final Label");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getLabelText(),
			"Final Label",
			"Label text successfully updated a second time"
		);
	});

	QUnit.test("Aggregation 'label' is created only when labelText is set", async function(assert) {
		// Assert: no label initially (was already set in beforeEach)
		assert.equal(this.oOTBTokenizer.getAggregation("label"), null, "No 'label' aggregation initially");

		// Act: set label text
		this.oOTBTokenizer.setLabelText("New Label");
		await nextUIUpdate();
		assert.ok(this.oOTBTokenizer.getAggregation("label"), "'label' aggregation created after labelText is set");
		assert.equal(this.oOTBTokenizer.getAggregation("label").getText(), "New Label", "Label text matches property");

		// Act: clear label text
		this.oOTBTokenizer.setLabelText("");
		await nextUIUpdate();
		assert.notOk(this.oOTBTokenizer.getAggregation("label"), "When the 'labelText' property is emptied, the label aggregation is removed");
	});

	QUnit.test("Aggregation 'label' updates text if labelText is changed repeatedly", async function(assert) {
		// Arrange
		this.oOTBTokenizer.setLabelText("Initial Label");
		await nextUIUpdate();

		const oLabel = this.oOTBTokenizer.getAggregation("label");
		assert.ok(oLabel, "Label is created");
		assert.equal(oLabel.getText(), "Initial Label", "Label text is correct initially");

		// Act: update labelText property
		this.oOTBTokenizer.setLabelText("Updated Label");
		await nextUIUpdate();

		// Assert
		assert.equal(oLabel.getText(), "Updated Label", "Label text is updated");
	});

	QUnit.module("Private API for moreItemsButton Aggregation", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Test Label"
			});
			this.oOTBTokenizer.placeAt("content");
		},
		afterEach: async function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
			await nextUIUpdate();
		}
	});

	QUnit.test("Aggregation 'moreItemsButton' is created initially as a private aggregation", async function(assert) {
		// Assert: null initially
		assert.strictEqual(this.oOTBTokenizer.getAggregation("moreItemsButton"), null, "moreItemsButton aggregation is null initially");

		// Act: set label and switch to Overflow mode
		this.oOTBTokenizer.setProperty("labelText", "This will become the button text");
		await nextUIUpdate();
		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();

		const oButton = this.oOTBTokenizer.getAggregation("moreItemsButton");

		// Assert
		assert.ok(oButton, "'moreItemsButton' is created in Overflow render mode");
		assert.ok(oButton.isA("sap.m.Button"), "Aggregation is indeed a sap.m.Button");
		assert.strictEqual(oButton.getText(), "This will become the button text", "The button text matches the labelText property");
	});

	QUnit.test("Update labelText changes 'moreItemsButton' text in Overflow mode", async function(assert) {
		// Arrange
		this.oOTBTokenizer.setProperty("labelText", "Button text");
		await nextUIUpdate();
		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();

		const oButton = this.oOTBTokenizer.getAggregation("moreItemsButton");
		assert.ok(oButton, "Button has been created");

		const sInitialLabel = this.oOTBTokenizer.getLabelText();
		assert.strictEqual(oButton.getText(), sInitialLabel, "Button text matches the initial label text");

		// Act
		this.oOTBTokenizer.setLabelText("Changed button text");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oButton.getText(), "Changed button text", "Button text updated when label changes");
	});

	QUnit.test("Removing the labelText does not break 'moreItemsButton' in Overflow mode", async function(assert) {
		// Arrange
		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();

		const oButton = this.oOTBTokenizer.getAggregation("moreItemsButton");

		// Act
		this.oOTBTokenizer.setLabelText("");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oButton.getText(), "", "Button text is cleared if label text is empty");
	});
});
