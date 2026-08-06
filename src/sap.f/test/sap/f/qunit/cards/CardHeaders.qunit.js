/*global QUnit, sinon */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/m/library",
	"sap/m/Button",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Lib"
], (
	Card,
	CardHeader,
	CardNumericHeader,
	CardNumericSideIndicator,
	mLibrary,
	Button,
	Control,
	coreLibrary,
	DateFormat,
	UniversalDate,
	QUnitUtils,
	nextUIUpdate,
	KeyCodes,
	UI5Date,
	Library
) => {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const AvatarColor = mLibrary.AvatarColor;
	const AvatarSize = mLibrary.AvatarSize;
	const ValueColor = mLibrary.ValueColor;
	const WrappingType = mLibrary.WrappingType;
	const ValueState = coreLibrary.ValueState;

	const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue libero ut blandit faucibus. Phasellus sed urna id tortor consequat accumsan eget at leo. Cras quis arcu magna.";

	const clock = sinon.useFakeTimers();
	const oDateFormat = DateFormat.getDateTimeInstance({relative: true});
	const oNowUniversalDate = new UniversalDate(UI5Date.getInstance());
	clock.tick(60000);
	const TEXT_1_MIN_AGO = oDateFormat.format(oNowUniversalDate);
	clock.tick(60000);
	const TEXT_2_MIN_AGO = oDateFormat.format(oNowUniversalDate);
	clock.restore();

	QUnit.module("Headers");

	QUnit.test("NumericHeader renderer", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title", number: "{Number}" });

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader.$().find(".sapFCardNumericIndicators").length, 1, "NumericIndicators are rendered.");

		oHeader.destroy();
	});

	QUnit.test("Numeric Header indicator truncation", async function (assert) {
		// Arrange
		const sSampleNumber = "1234567812345678",
			oHeader = new CardNumericHeader({
				number: sSampleNumber
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert

		assert.strictEqual(oHeader._getNumericIndicators().$("mainIndicator-value-inner").html().length, sSampleNumber.length, "The numeric content is not truncated");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header unitOfMeasurement truncation", async function (assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		const oHeader = new CardNumericHeader({
			subtitle: "Lorem",
			unitOfMeasurement: "EUR EUR EUR"
		}),
			oCard = new Card({
				width: "300px",
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const iWidth = oHeader.$("unitOfMeasurement").width();

		// Act - set long subtitle so that there is no place for unitOfMeasurement
		oHeader.setSubtitle("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a libero nec risus egestas lacinia nec ac metus.");
		await nextUIUpdate(this.clock);
		this.clock.tick(400);

		// Assert
		assert.strictEqual(oHeader.$("unitOfMeasurement").width(), iWidth, "The unitOfMeasurement is not truncated");

		// Clean up
		oCard.destroy();
		this.clock.restore();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Default header tooltips", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			title: sLongText,
			subtitle: sLongText
		}),
			oCard = new Card({
				width: "300px",
				header: oHeader
			});

		oHeader.setProperty("useTooltips", true);

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("title-inner"), "mouseover");
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("subtitle-inner"), "mouseover");

		// Assert
		assert.strictEqual(oHeader.getDomRef("title-inner").title, sLongText, "The title has correct tooltip");
		assert.strictEqual(oHeader.getDomRef("subtitle-inner").title, sLongText, "The subtitle has correct tooltip");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Numeric header tooltips", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: sLongText,
			subtitle: sLongText,
			details: sLongText
		}),
			oCard = new Card({
				width: "300px",
				header: oHeader
			});

		oHeader.setProperty("useTooltips", true);

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("title-inner"), "mouseover");
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("subtitle-inner"), "mouseover");
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("details"), "mouseover");

		// Assert
		assert.strictEqual(oHeader.getDomRef("title-inner").title, sLongText, "The title has correct tooltip");
		assert.strictEqual(oHeader.getDomRef("subtitle-inner").title, sLongText, "The subtitle has correct tooltip");
		assert.strictEqual(oHeader.getDomRef("details").title, sLongText, "The subtitle has correct tooltip");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Default Header avatar default color", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			iconSrc: "sap-icon://accept"
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader._getAvatar().getBackgroundColor(), AvatarColor.Transparent, "Default background of avatar is 'Transparent'");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header and NumericHeader iconSize", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
				iconSrc: "sap-icon://accept",
				iconSize: AvatarSize.L
			}),
			oNumericHeader = new CardNumericHeader({
				iconSrc: "sap-icon://accept",
				iconSize: AvatarSize.L
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		oNumericHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader._getAvatar().getDisplaySize(), AvatarSize.L, "The iconSize is applied to the avatar of the Header");
		assert.strictEqual(oNumericHeader._getAvatar().getDisplaySize(), AvatarSize.L, "The iconSize is applied to the avatar of the NumericHeader");

		// Clean up
		oHeader.destroy();
		oNumericHeader.destroy();
	});

	QUnit.test("Header and NumericHeader iconAlt", async function (assert) {
		// Arrange
		const sIconAlt = "Icon alt text",
			oHeader = new CardHeader({
				iconSrc: "sap-icon://accept",
				iconAlt: sIconAlt
			}),
			oNumericHeader = new CardNumericHeader({
				iconSrc: "sap-icon://accept",
				iconAlt: sIconAlt
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		oNumericHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader._getAvatar().getTooltip(), sIconAlt, "The iconAlt is applied as tooltip to the avatar of the Header");
		assert.strictEqual(oNumericHeader._getAvatar().getTooltip(), sIconAlt, "The iconAlt is applied as tooltip to the avatar of the NumericHeader");

		// Clean up
		oHeader.destroy();
		oNumericHeader.destroy();
	});

	QUnit.test("Header and NumericHeader titleMaxLines", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
				title: sLongText,
				titleMaxLines: 5
			}),
			oNumericHeader = new CardNumericHeader({
				title: sLongText,
				titleMaxLines: 5
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		oNumericHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader.getAggregation("_title").getMaxLines(), 5, "The titleMaxLines is applied to the inner title of the Header");
		assert.strictEqual(oNumericHeader.getAggregation("_title").getMaxLines(), 5, "The titleMaxLines is applied to the inner title of the NumericHeader");

		// Clean up
		oHeader.destroy();
		oNumericHeader.destroy();
	});

	QUnit.test("NumericHeader detailsState", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			details: "Details",
			detailsState: ValueState.Error
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oHeader._getDetails().hasStyleClass("sapFCardNumericHeaderDetailsStateError"), "The detailsState style class is applied to the details control");

		// Act - change the state
		oHeader.setDetailsState(ValueState.Success);
		await nextUIUpdate();

		// Assert
		assert.notOk(oHeader._getDetails().hasStyleClass("sapFCardNumericHeaderDetailsStateError"), "The old detailsState style class is removed from the details control");
		assert.ok(oHeader._getDetails().hasStyleClass("sapFCardNumericHeaderDetailsStateSuccess"), "The new detailsState style class is applied to the details control");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header and NumericHeader dataTimestamp", async function (assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		const oNow = UI5Date.getInstance(),
			sTextNow = Library.getResourceBundleFor("sap.f").getText("CARD_HEADER_DATETIMESTAMP_NOW"),
			oHeader = new CardHeader({
				dataTimestamp: oNow.toISOString()
			}),
			oNumericHeader = new CardNumericHeader({
				dataTimestamp: oNow.toISOString()
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		oNumericHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp for 'now' is correct for Header");
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp for 'now' is correct for NumericHeader");

		// Act - wait 1 minute
		this.clock.tick(60100);

		// Assert
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), TEXT_1_MIN_AGO, "DataTimestamp is updated after 1m for Header");
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), TEXT_1_MIN_AGO, "DataTimestamp is updated after 1m for NumericHeader");

		// Act - set empty timestamp
		oHeader.setDataTimestamp(null);
		oNumericHeader.setDataTimestamp(null);

		// Assert
		assert.notOk(oHeader.getAggregation("_dataTimestamp"), "DataTimestamp is removed for Header");
		assert.notOk(oNumericHeader.getAggregation("_dataTimestamp"), "DataTimestamp is removed for NumericHeader");

		// Clean up
		oHeader.destroy();
		oNumericHeader.destroy();
		this.clock.restore();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("CardHeader dataTimestamp rounds and updates at minute boundaries", async function (assert) {
		this.clock = sinon.useFakeTimers();
		const oNow = UI5Date.getInstance(),
			sTextNow = Library.getResourceBundleFor("sap.f").getText("CARD_HEADER_DATETIMESTAMP_NOW"),
			oHeader = new CardHeader({
				dataTimestamp: oNow.toISOString()
			});

		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp for 'now' is correct for Header");

		this.clock.tick(44900);
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp is not changed after 44s for Header");

		this.clock.tick(200);
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), TEXT_1_MIN_AGO, "DataTimestamp is updated after 45s for Header");

		this.clock.tick(59000);
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), TEXT_1_MIN_AGO, "DataTimestamp is \"1 minute ago\" after 104s for Header");

		this.clock.tick(1000);
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), TEXT_2_MIN_AGO, "DataTimestamp is updated after 105s for Header");

		oHeader.destroy();
		this.clock.restore();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("CardNumericHeader dataTimestamp rounds and updates at minute boundaries", async function (assert) {
		this.clock = sinon.useFakeTimers();
		const oNow = UI5Date.getInstance(),
			sTextNow = Library.getResourceBundleFor("sap.f").getText("CARD_HEADER_DATETIMESTAMP_NOW"),
			oNumericHeader = new CardNumericHeader({
				dataTimestamp: oNow.toISOString()
			});

		oNumericHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp for 'now' is correct for Numeric Header");

		this.clock.tick(44900);
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp is not changed after 44s for Numeric Header");

		this.clock.tick(200);
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), TEXT_1_MIN_AGO, "DataTimestamp is updated after 45s for Numeric Header");

		this.clock.tick(59000);
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), TEXT_1_MIN_AGO, "DataTimestamp is \"1 minute ago\" after 104s for Numeric Header");

		this.clock.tick(1000);
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), TEXT_2_MIN_AGO, "DataTimestamp is updated after 105s for Numeric Header");

		oNumericHeader.destroy();
		this.clock.restore();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Side Indicator \"state\" property ", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			sideIndicators: new CardNumericSideIndicator({
				number: "5",
				state: "Error"
			})
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert

		assert.ok(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateError"), "SideIndicator has the right class applied");
		assert.notOk(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateGood"), "SideIndicator has the right class applied");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header's \"sideIndicatorsAlignment\" property ", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			sideIndicatorsAlignment: "End",
			number: 5
		});
		const oNumericIndicators = oHeader._getNumericIndicators();

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignEnd"), "Numeric header has the right class for alignment applied");
		assert.notOk(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignBegin"), "Numeric header has the right class for alignment applied");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Default Header with iconVisibility false", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			iconSrc: "sap-icon://accept",
			iconVisible: false
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(!!oHeader.$().find(".sapFCardHeaderImage").length, false, "Icon is not visible");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header with iconVisibility false", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			iconSrc: "sap-icon://accept",
			iconVisible: false
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(!!oHeader.$().find(".sapFCardHeaderImage").length, false, "Icon is not visible");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header Hyphenation", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			title: "pneumonoultramicroscopicsilicovolcanoconiosis",
			subtitle: "pneumonoultramicroscopicsilicovolcanoconiosis",
			wrappingType: WrappingType.Hyphenated
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader.getAggregation("_title").getWrappingType(), WrappingType.Hyphenated, "Title has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_subtitle").getWrappingType(), WrappingType.Hyphenated, "Subtitle has correct wrappingType");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header Hyphenation", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "pneumonoultramicroscopicsilicovolcanoconiosis",
			subtitle: "pneumonoultramicroscopicsilicovolcanoconiosis",
			details: "pneumonoultramicroscopicsilicovolcanoconiosis",
			detailsMaxLines: 2,
			wrappingType: WrappingType.Hyphenated
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader.getAggregation("_title").getWrappingType(), WrappingType.Hyphenated, "Title has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_subtitle").getWrappingType(), WrappingType.Hyphenated, "Subtitle has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_details").getWrappingType(), WrappingType.Hyphenated, "Details text has correct wrappingType");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header with main part only", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			title: "Title"
		}),
			oCard = new Card({
				header: oHeader
			});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderMainPartOnly"), "Header has correct class applied");
		assert.ok(oMainPartDomRef.classList.contains("sapFCardHeaderLastPart"), "Main part has correct class applied");
	});

	QUnit.test("Header with numeric part", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			number: "5"
		}),
			oCard = new Card({
				header: oHeader
			});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");
		const oNumericPartDomRef = oHeader.getDomRef().querySelector(".sapFCardNumericHeaderNumericPart");

		// Assert
		assert.notOk(oHeader.getDomRef().classList.contains("sapFCardHeaderMainPartOnly"), "Header has correct class applied");
		assert.notOk(oMainPartDomRef.classList.contains("sapFCardHeaderLastPart"), "Main part does NOT have 'sapFCardHeaderLastPart' class");
		assert.ok(oNumericPartDomRef.classList.contains("sapFCardHeaderLastPart"), "Numeric part has correct class applied");
	});

	QUnit.test("Header with icon state - Error", async function (assert) {
		const oHeader = new CardHeader({
			iconState: "Error"
		}),
			oCard = new Card({
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oAvatar = oHeader.getAggregation("_avatar").getDomRef();

		assert.ok(oAvatar, "The avatar is created.");
		assert.ok(oAvatar.classList.contains("sapFCardHeaderImageStateError"), "The sapFCardHeaderImageStateError class is correctly set.");

		oCard.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Header with icon state - Warning", async function (assert) {
		const oHeader = new CardHeader({
			iconState: "Warning"
		}),
			oCard = new Card({
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oAvatar = oHeader.getAggregation("_avatar").getDomRef();

		assert.ok(oAvatar, "The avatar is created.");
		assert.ok(oAvatar.classList.contains("sapFCardHeaderImageStateWarning"), "The sapFCardHeaderImageStateWarning class is correctly set.");

		oCard.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Header with icon state - Success", async function (assert) {
		const oHeader = new CardHeader({
			iconState: "Success"
		}),
			oCard = new Card({
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oAvatar = oHeader.getAggregation("_avatar").getDomRef();

		assert.ok(oAvatar, "The avatar is created.");
		assert.ok(oAvatar.classList.contains("sapFCardHeaderImageStateSuccess"), "The sapFCardHeaderImageStateSuccess class is correctly set.");

		oCard.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Header with icon state - Information", async function (assert) {
		const oHeader = new CardHeader({
			iconState: "Information"
		}),
			oCard = new Card({
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oAvatar = oHeader.getAggregation("_avatar").getDomRef();

		assert.ok(oAvatar, "The avatar is created.");
		assert.ok(oAvatar.classList.contains("sapFCardHeaderImageStateInformation"), "The sapFCardHeaderImageStateInformation class is correctly set.");

		oCard.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Default Header with state and iconVisibility false", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			iconState: "Information",
			iconVisible: false
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(!!oHeader.$().find(".sapFCardHeaderImage").length, false, "Icon is not visible");

		// Clean up
		oHeader.destroy();
	});

	QUnit.module("Headers press event");

	QUnit.test("Press is fired on Enter keydown for numeric header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		QUnitUtils.triggerKeydown(oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"), KeyCodes.ENTER);

		// Assert
		assert.ok(fnPressHandler.calledOnce, "The press event is fired on Enter keydown");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is fired on Space keyup for numeric header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		QUnitUtils.triggerKeyup(oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"), KeyCodes.SPACE);

		// Assert
		assert.ok(fnPressHandler.calledOnce, "The press event is fired on Space keyup");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press event is NOT fired when Enter or Space is pressed on the toolbar", async function (assert) {
		// Arrange
		const oToolbar = new Button(),
			oHeader = new CardNumericHeader({
				title: "Title",
				toolbar: oToolbar
			}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerKeydown(oToolbar.getDomRef(), KeyCodes.ENTER);
		QUnitUtils.triggerKeydown(oToolbar.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.ok(fnPressHandler.notCalled, "Enter or Space on the toolbar shouldn't result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is fired when the header is tapped", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title"
		}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("tap", oHeader.getDomRef());

		// Assert
		assert.notOk(fnPressHandler.called, "Tapping the header should NOT result in press event");

		// Act
		QUnitUtils.triggerEvent("tap", oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"));

		// Assert
		assert.ok(fnPressHandler.calledOnce, "Tapping the header should result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is NOT fired when the header with href is tapped", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			href: "https://www.sap.com"
		}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("tap", oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"), { ctrlKey: true });

		// Assert
		assert.ok(fnPressHandler.notCalled, "Tapping the header with href should NOT result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Header with href and target renders as a link", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			href: "https://www.sap.com",
			target: "_blank"
		}),
			oCard = new Card({
				header: oHeader
			});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oHeader.isLink(), "isLink returns true when href is set");
		const oFocusableDomRef = oHeader.getFocusDomRef();
		assert.strictEqual(oFocusableDomRef.tagName.toLowerCase(), "a", "The focusable element is rendered as an anchor element");
		assert.strictEqual(oFocusableDomRef.getAttribute("href"), "https://www.sap.com", "The href attribute is rendered correctly");
		assert.strictEqual(oFocusableDomRef.getAttribute("target"), "_blank", "The target attribute is rendered correctly");
		assert.strictEqual(oFocusableDomRef.getAttribute("rel"), "noopener noreferrer", "The rel attribute is rendered correctly");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is NOT fired when the toolbar is tapped", async function (assert) {
		// Arrange
		const oToolbar = new Button(),
			oHeader = new CardNumericHeader({
				title: "Title",
				toolbar: oToolbar
			}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("tap", oToolbar.getDomRef());

		// Assert
		assert.ok(fnPressHandler.notCalled, "Tapping the toolbar shouldn't result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Header toolbar");

	QUnit.test("sapFCardHeaderToolbarFocused CSS class", async function (assert) {
		const oToolbar = new Button(),
			oHeader = new CardHeader({
				title: "Title",
				toolbar: oToolbar
			}),
			oCard = new Card({
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("focusin", oToolbar.getDomRef());

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderToolbarFocused"), "When toolbar is focused, header should have CSS class set");

		// Act
		oHeader.invalidate();
		await nextUIUpdate();

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderToolbarFocused"), "After rendering CSS class should remain");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("Header", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({ title: "Title" });
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oTitleDomRef = oHeader.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");
		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "group" , "Header role is correct.");
		assert.notOk(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is not set");

		// Act
		oHeader.attachPress(function () { });
		await nextUIUpdate();

		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "button" , "Header role is correct.");
		assert.ok(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is set");

		oHeader.destroy();
	});

	QUnit.test("Numeric Header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title" });
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oTitleDomRef = oHeader.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");
		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "group" , "Header role is correct.");
		assert.notOk(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is not set");

		// Act
		oHeader.attachPress(function () { });
		await nextUIUpdate();

		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "button" , "Header role is correct.");
		assert.ok(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is set");

		oHeader.destroy();
	});

	QUnit.test("Numeric Header with number set a bit later", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			state: ValueColor.Error,
			sideIndicators: [
				new CardNumericSideIndicator({
					number: "5",
					state: ValueColor.Error
				})
			]
		});
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.equal(oHeader.$("focusable").attr("aria-labelledby").indexOf("mainIndicator"), -1, "'aria-labelledby' does not contain main indicator id");

		// Act
		oHeader.setNumber("22");
		await nextUIUpdate();

		// Assert
		assert.ok(oHeader.$("focusable").attr("aria-labelledby").indexOf("mainIndicator") > -1, "'aria-labelledby' contains main indicator id");

		// Clean up
		oHeader.destroy();
	});

	QUnit.module("Error in header", {
		beforeEach: function () {
			this.Error = Control.extend("Error", {
				renderer: {
					apiVersion: 2,
					render: function (oRm, oControl) {
						oRm.openStart("div", oControl).openEnd().close("div");
					}
				}
			});
		}
	});

	QUnit.test("Error in Default Header", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			title: "Title",
			subtitle: "Subtitle",
			statusText: "Status",
			iconSrc: "sap-icon://accept",
			toolbar: new Button()
		});
		const oError = new this.Error();

		oHeader.setAggregation("_error", oError);
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oError.getDomRef(), "Error is rendered.");
		assert.notOk(oHeader.getAggregation("_title").getDomRef(), "Title shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_subtitle").getDomRef(), "Subtitle shouldn't be rendered.");
		assert.notOk(oHeader.getDomRef("status"), "Status shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_avatar").getDomRef(), "Icon shouldn't be rendered.");
		assert.notOk(oHeader.getToolbar().getDomRef(), "Toolbar shouldn't be rendered.");
		assert.notOk(oHeader.$().hasClass("sapFCardHeaderLastPart"), "sapFCardHeaderLastPart class is not set");
		assert.ok(oHeader.$().hasClass("sapFCardHeaderMainPartOnly"), "sapFCardHeaderMainPartOnly class is set");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Error in Numeric Header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			subtitle: "Subtitle",
			statusText: "Status",
			iconSrc: "sap-icon://accept",
			toolbar: new Button(),
			number: "5",
			details: "Details",
			sideIndicators: [
				new CardNumericSideIndicator({
					number: "5"
				})
			]
		});
		const oError = new this.Error();

		oHeader.setAggregation("_error", oError);
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oError.getDomRef(), "Error is rendered.");
		assert.notOk(oHeader.getAggregation("_title").getDomRef(), "Title shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_subtitle").getDomRef(), "Subtitle shouldn't be rendered.");
		assert.notOk(oHeader.getDomRef("status"), "Status shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_avatar").getDomRef(), "Icon shouldn't be rendered.");
		assert.notOk(oHeader.getToolbar().getDomRef(), "Toolbar shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_numericIndicators").getDomRef(), "Numeric indicators shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_details").getDomRef(), "Details shouldn't be rendered.");
		assert.notOk(oHeader.$().hasClass("sapFCardHeaderLastPart"), "sapFCardHeaderLastPart class is not set");
		assert.notOk(oHeader.$().hasClass("sapFCardHeaderMainPartOnly"), "sapFCardHeaderMainPartOnly class is not set");

		// Clean up
		oHeader.destroy();
	});

	QUnit.module("XS zoom layout (ACC-260)", {
		beforeEach: function () {
			this.createCard = function (oHeader, sWidth) {
				this.oCard = new Card({
					width: sWidth || "180px",
					header: oHeader
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
				return this.oCard;
			}.bind(this);

			this.waitForXSClass = function (bExpected) {
				const oHeaderDomRef = this.oCard.getCardHeader().getDomRef();
				return new Promise((resolve) => {
					let iAttempts = 0;
					const fnCheck = function () {
						if (oHeaderDomRef.classList.contains("sapFCardXSHeader") === bExpected || iAttempts++ > 30) {
							resolve();
							return;
						}
						requestAnimationFrame(fnCheck);
					};
					fnCheck();
				});
			}.bind(this);
		},
		afterEach: function () {
			if (this.oCard) {
				this.oCard.destroy();
				this.oCard = null;
			}
		}
	});

	QUnit.test("Observer adds the sapFCardXSHeader class when the header is narrow", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title", number: "65" });
		this.createCard(oHeader, "150px");

		// Act
		await nextUIUpdate();
		await this.waitForXSClass(true);

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardXSHeader"), "Header DOM has the sapFCardXSHeader class at <= 180px width");
	});

	QUnit.test("Observer does not add the sapFCardXSHeader class above the threshold", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title", number: "65" });
		this.createCard(oHeader, "400px");

		// Act
		await nextUIUpdate();
		await this.waitForXSClass(false);

		// Assert
		assert.notOk(oHeader.getDomRef().classList.contains("sapFCardXSHeader"), "Header DOM does not have the sapFCardXSHeader class above 180px width");
	});

	QUnit.test("The sapFCardXSHeader class is re-applied after a re-render", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title", number: "65" });
		this.createCard(oHeader, "150px");

		await nextUIUpdate();
		await this.waitForXSClass(true);
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardXSHeader"), "XS class is present after the initial render");

		// Act - force a re-render; the DOM node is recreated, but the
		// ResizeHandler is only registered once, so onAfterRendering must
		// re-apply the class to the fresh DOM.
		oHeader.invalidate();
		await nextUIUpdate();
		await this.waitForXSClass(true);

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardXSHeader"), "XS class is still present after a re-render");
	});

	QUnit.test("C: Side indicators use a two-column grid at XS width", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			number: "65",
			sideIndicators: [
				new CardNumericSideIndicator({ title: "Target", number: "100" }),
				new CardNumericSideIndicator({ title: "Deviation", number: "34" }),
				new CardNumericSideIndicator({ title: "Forecast", number: "620" })
			]
		});
		this.createCard(oHeader);

		// Act
		await nextUIUpdate();
		await this.waitForXSClass(true);

		// Assert
		const oNumericIndicators = oHeader._getNumericIndicators().getDomRef();
		const oSide = oNumericIndicators.querySelector(".sapFCardNumericIndicatorsSide");
		const oIndicatorsStyle = window.getComputedStyle(oNumericIndicators);
		const oSideStyle = window.getComputedStyle(oSide);

		assert.strictEqual(oIndicatorsStyle.flexDirection, "column", "Indicators stack the value above the side indicators");
		assert.strictEqual(oSideStyle.display, "grid", "Side indicators are laid out in a grid");
		assert.strictEqual(oSideStyle.gridTemplateColumns.split(" ").length, 2, "Grid has two columns");
	});

	QUnit.test("C: Side indicators are not clipped horizontally at XS width", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			number: "65",
			sideIndicators: [
				new CardNumericSideIndicator({ title: "Target", number: "100" }),
				new CardNumericSideIndicator({ title: "Deviation", number: "34" }),
				new CardNumericSideIndicator({ title: "Forecast", number: "620" }),
				new CardNumericSideIndicator({ title: "Risk", number: "12" })
			]
		});
		this.createCard(oHeader);

		// Act
		await nextUIUpdate();
		await this.waitForXSClass(true);

		// Assert
		const oCardRect = this.oCard.getDomRef().getBoundingClientRect();
		oHeader.getSideIndicators().forEach((oIndicator) => {
			const oRect = oIndicator.getDomRef().getBoundingClientRect();
			assert.ok(oRect.right <= oCardRect.right + 1, "Side indicator '" + oIndicator.getTitle() + "' does not overflow the right edge");
			assert.ok(oRect.left >= oCardRect.left - 1, "Side indicator '" + oIndicator.getTitle() + "' does not overflow the left edge");
		});
	});

});