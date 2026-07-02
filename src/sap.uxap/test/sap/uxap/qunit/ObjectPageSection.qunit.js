/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/core/mvc/XMLView",
	"sap/uxap/library",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSectionBase",
	"sap/m/Text",
	"sap/m/MessageStrip",
	"sap/m/Button",
	"sap/m/Panel"
],
function(Element, nextUIUpdate, XMLView, library, ObjectPageLayout, ObjectPageSubSection, ObjectPageSection, ObjectPageSectionBase, Text, MessageStrip, Button, Panel) {
	"use strict";
	const Importance = library.Importance;
	const ObjectPageSubSectionLayout = library.ObjectPageSubSectionLayout;

	/**
	 * Returns a Promise that resolves after the ObjectPageLayout fires onAfterRenderingDOMReady.
	 * @param {sap.uxap.ObjectPageLayout} oOPL The ObjectPageLayout instance to wait for
	 * @returns {Promise<void>} A Promise that resolves when the DOM is ready
	 */
	function waitForDOMReady(oOPL) {
		return new Promise((resolve) => {
			oOPL.attachEventOnce("onAfterRenderingDOMReady", resolve);
		});
	}

	QUnit.module("aatTest");

	QUnit.test("ObjectPageSection", function (assert) {

		return XMLView.create({
			id: "UxAP-13_objectPageSection",
			viewName: "view.UxAP-13_ObjectPageSection"
		}).then(async function(ObjectPageSectionView) {

			ObjectPageSectionView.placeAt('qunit-fixture');
			await nextUIUpdate();

			// get the object page section
			// By default title is not centered, CSS:0120061532 0001349139 2014
			const oSectionWithTwoSubSection = ObjectPageSectionView.byId("SectionWithSubSection");
			assert.strictEqual(oSectionWithTwoSubSection.$().find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden"), false, "My first section title is always visible");
			assert.strictEqual(oSectionWithTwoSubSection.$().find(".sapUxAPObjectPageSectionHeader").attr("aria-hidden"), undefined, "My first section title is NOT ignored by the screen reader");
			// Test by finding own class
			assert.strictEqual(oSectionWithTwoSubSection.$().find('.mysubsectiontotest').length == 2, true, "Section with two SubSections");


			const oSectionWithOneSubSection = ObjectPageSectionView.byId("SectionWithoneSubSection");
			const oSingleSubSectionInSection = oSectionWithOneSubSection.getSubSections()[0];
			assert.strictEqual(oSingleSubSectionInSection.$().find(".sapUxAPObjectPageSubSectionTitle").text(), "My third subSection Title", "Section with one SubSections");
			// Test by finding own class
			assert.strictEqual(oSectionWithOneSubSection.$().find(".mysubsectiontotest").length == 1, true, "Section with one SubSections");


			const oSectionWithoutSubSection = ObjectPageSectionView.byId("SectionWithoutSubSection");
			assert.strictEqual(oSectionWithoutSubSection.$().find(".sapUxAPObjectPageSectionHeader").length, 0, "My third section title without subsection");
			// Test by finding own class
			assert.strictEqual(oSectionWithoutSubSection.$().find(".mysubsectiontotest").length == 0, true, "Section without SubSection");


			// get the object page SubSection
			const oSubsection = ObjectPageSectionView.byId("subsection1");
			assert.strictEqual(oSubsection.getTitle(), "My first subSection Title", "My first subSection Title");

			const oSubsection2 = ObjectPageSectionView.byId("subsection2");
			assert.strictEqual(oSubsection2.getTitle(), "My second subSection Title", "My second subSection Title");

			const oSubsection3 = ObjectPageSectionView.byId("subsection3");
			assert.strictEqual(oSubsection3.$().find(".sapUxAPObjectPageSectionHeader").length, 0, "My third section without subsections");

			ObjectPageSectionView.destroy();
		});
	});

	QUnit.module("Section title visibility");

	QUnit.test("Title visibility with one section", async function(assert) {
		assert.expect(3);
		const oObjectPageLayout = new ObjectPageLayout("page02", {
			useIconTabBar: true,
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		assert.strictEqual(oObjectPageLayout.getSections()[0].getSubSections()[0]._isTitleAriaVisible(), true, "title is displayed when there is only 1 section");
		assert.strictEqual(oObjectPageLayout.getSections()[0].getSubSections()[0]._isTitleVisible(), true, "title is displayed when there is only 1 section");
		assert.strictEqual(oObjectPageLayout.getSections()[0].getSubSections()[0].getTitleVisible(), true, "title is displayed when there is only 1 section");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Title visibility with more than one section", async function(assert) {
		assert.expect(6);
		const oObjectPageLayout = new ObjectPageLayout("page02", {
				useIconTabBar: true,
				sections: [
					new ObjectPageSection({
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								blocks: [new Text({text: "test"})]
							})
						]
					}),
					new ObjectPageSection({
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								blocks: [new Text({text: "test"})]
							})
						]
					})
				]
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		const aSections = oObjectPageLayout.getSections();

		assert.strictEqual(aSections[0]._getInternalTitleVisible(), false, "title is hidden when there is more than 1 section");
		assert.strictEqual(aSections[1]._getInternalTitleVisible(), false, "title is hidden when there is more than 1 section");
		assert.strictEqual(aSections[0].getTitleVisible(), false, "title is hidden when there is more than 1 section");
		assert.strictEqual(aSections[1].getTitleVisible(), false, "title is hidden when there is more than 1 section");

		assert.strictEqual(aSections[0].getSubSections()[0]._isTitleAriaVisible(), true, "title is NOT hidden from the screen reader when there is more than 1 section");
		assert.strictEqual(aSections[1].getSubSections()[0]._isTitleAriaVisible(), true, "title is NOT hidden from the screen reader when there is more than 1 section");

		oObjectPageLayout.destroy();
	});

	QUnit.test("First Section title is visible by default, unless showTitle='false': anchor bar mode", async function(assert) {
		assert.expect(2);
		// Arrange
		const oSection = new ObjectPageSection({
				title: "Section Title",
				subSections: [
					new ObjectPageSubSection({
						title: "Title",
						blocks: [new Text({text: "test"})]
					}),
					new ObjectPageSubSection({
						title: "Title2",
						blocks: [new Text({text: "test"})]
					})
				]
			});
		const oObjectPageLayout = new ObjectPageLayout("my-opl", {
				sections: [
					oSection
				]
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSection.$().find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden"),
			false, "Title of first Section is visible");

		// Act
		oSection.setShowTitle(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSection.$().find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden"),
			true, "Title of first Section is not visible if showTitle=false");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("getTitleVisible with showTitle=false", async function(assert) {
		assert.expect(4);
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout("page02", {
				useIconTabBar: true,
				sections: [
					new ObjectPageSection({
						title: "Section Title",
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								blocks: [new Text({text: "test"})]
							}),
							new ObjectPageSubSection({
								title: "Title2",
								blocks: [new Text({text: "test"})]
							})
						]
					})
				]
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		const oSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];

		// Assert
		assert.strictEqual(oSubSection.getTitleVisible(), true, "title is visible");
		assert.strictEqual(oSubSection._getTitleControl().getVisible(), true, "title is visible");

		// Act
		oSubSection.setShowTitle(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSubSection.getTitleVisible(), false, "title is not visible");
		assert.strictEqual(oSubSection._getTitleControl().getVisible(), false, "title is not visible");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("getTitleVisible with importance level of SubSections", async function(assert) {
		assert.expect(4);
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout("page02", {
				useIconTabBar: true,
				sections: [
					new ObjectPageSection({
						title: "Section Title",
						showTitle: false,
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								importance: "Low",
								blocks: [new Text({text: "test"})]
							}),
							new ObjectPageSubSection({
								title: "Title2",
								blocks: [new Text({text: "test"})]
							})
						]
					})
				]
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		const oSection = oObjectPageLayout.getSections()[0];

		// Assert
		assert.strictEqual(oSection.getTitleVisible(), false, "title is not visible");
		assert.strictEqual(oSection._getTitleControl().getVisible(), false, "title is not visible");

		// Act
		oObjectPageLayout.setShowOnlyHighImportance(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSection.getTitleVisible(), false, "title is still not visible");
		assert.strictEqual(oSection._isTitleAriaVisible(), true, "title area is visible, as there is a hidden SubSection");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("_getTitle provides the title to show in anchorBar", function(assert) {
		const oSection = new ObjectPageSection({
				subSections: [
					new ObjectPageSubSection({
						title: "Title"
					})
				]
			});

		this.stub(oSection, "_hasPromotedSubSection").returns(true);

		assert.strictEqual(oSection._getTitle(), "Title", "title is correct");

		oSection.destroy();
	});

	const SectionBasePrototype = ObjectPageSectionBase.prototype;
	const SectionPrototype = ObjectPageSection.prototype;

	QUnit.module("Section/SubSection Importance");

	QUnit.test("Section with Promoted SubSection has hidden header", async function(assert) {
		assert.expect(1);

		const oObjectPageLayout = new ObjectPageLayout("page02", {
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await waitForDOMReady(oObjectPageLayout);
		await nextUIUpdate();
		const $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader').hasClass("sapUxAPObjectPageSectionHeaderHidden"), true, "subsection header is hidden");
		oObjectPageLayout.destroy();
	});

	QUnit.test("First section has expand buttons when hidden, when there is no promoted SubSection", async function(assert) {
		assert.expect(1);

		const oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: [
				new ObjectPageSection({
					title: "Title",
					importance: "Low",
					subSections: [
						new ObjectPageSubSection({
							blocks: [new Text({text: "test"})]
						})
					]
				}),
				new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title1",
							blocks: [new Text({text: "test1"})]
						})
					]
				})
			]
		});
		const oSection = oObjectPageLayout.getSections()[0];

		this.stub(oSection, "_getCurrentMediaContainerRange").callsFake(function() {
			return {
				name: "Tablet"
			};
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		assert.strictEqual(oSection._isTitleVisible(), true, "title is visible");

		oObjectPageLayout.destroy();
	});

	QUnit.test("First section has showMore button when content hidden, when there is no promoted SubSection", async function(assert) {
		assert.expect(1);

		const oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: [
				new ObjectPageSection({
					title: "Title",
					subSections: [
						new ObjectPageSubSection({
							importance: "Low",
							blocks: [new Text({text: "test"})]
						})
					]
				}),
				new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title1",
							blocks: [new Text({text: "test1"})]
						})
					]
				})
			]
		});
		const oSection = oObjectPageLayout.getSections()[0];

		this.stub(oSection, "_getCurrentMediaContainerRange").callsFake(function() {
			return {
				name: "Tablet"
			};
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		assert.strictEqual(oSection._isTitleVisible(), true, "title is visible");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Section with dynamically added title has button placeholders", async function(assert) {
		assert.expect(2);

		const oObjectPageLayout = new ObjectPageLayout("page02", {
				sections: new ObjectPageSection({
					showTitle: false,
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

		oObjectPageLayout.placeAt('qunit-fixture');

		oObjectPageLayout.getSections()[0].setShowTitle(true);
		await waitForDOMReady(oObjectPageLayout);
		await nextUIUpdate();
		const $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader').hasClass("sapUxAPObjectPageSectionHeaderHidden"), true, "subsection header is hidden");
		const $subSection = oObjectPageLayout.getSections()[0].getSubSections()[0].$();
		assert.strictEqual($subSection.find(".sapUxAPObjectPageSubSectionTitle").length, 1, "Section title is rendered in SubSection header");
		oObjectPageLayout.destroy();
	});

	QUnit.test("SubSection with dynamically added title has button placeholders", async function(assert) {
		assert.expect(1);

		const oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: new ObjectPageSection({
				subSections: [
					new ObjectPageSubSection({
						showTitle: false,
						title: "Title",
						blocks: [new Text({text: "test"})]
					})
				]
			})
		});
		const oSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];

		oObjectPageLayout.placeAt('qunit-fixture');

		oSubSection.setShowTitle(true);
		await nextUIUpdate();

		const $subSection = oSubSection.$();
		assert.strictEqual($subSection.find('.sapUxAPObjectPageSubSectionHeader .sapUiHiddenPlaceholder').length, 1, "subsection has 1 hidden placeholder");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Default state for hiding/showing the content", function (assert) {
		const oMockSection = {
			_getImportance: this.stub().returns(Importance.High)
		};

		SectionBasePrototype.init.call(oMockSection);

		assert.strictEqual(SectionBasePrototype._getIsHidden.call(oMockSection), false,
			"The section/subSection content should be initialized as visible");

		assert.strictEqual(SectionBasePrototype._shouldBeHidden.call(oMockSection), false,
			"When the section has high importance then it should never be hidden");
	});

	QUnit.test("Section title display/hide", async function(assert) {
		assert.expect(3);
		const oObjectPageLayout = new ObjectPageLayout({
			sections: new ObjectPageSection({
				title: "Title",
				subSections: [
					new ObjectPageSubSection({
						blocks: [new Text({text: "test"})]
					})
				]
			})
		});
		const oFirstSection = oObjectPageLayout.getSections()[0];
		let $oFirstSection;

		// Arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), false,
			"The correct styling is applied");

		// Act
		oFirstSection.setShowTitle(false);
		await nextUIUpdate();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), true,
			"The correct styling is applied");

		// Act
		oFirstSection.setShowTitle(true);
		await nextUIUpdate();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), false,
			"The correct styling is applied");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Behavior with different importance levels", function (assert) {
		const that = this;

		function fnGenerateTest(sImportance, sCurrentImportanceLevel, bExpectToBeHidden, assert) {
			const sShouldBeHidden = "The section should be hidden";
			const sShouldBeVisible = "The section should be visible";
			const oMockSection = {
					setImportance: function (sImportance) {
						this._getImportance = that.stub().returns(sImportance);
					}
				};

			oMockSection.setImportance(sImportance);

			SectionBasePrototype.init.call(oMockSection);
			oMockSection._sCurrentLowestImportanceLevelToShow = sCurrentImportanceLevel;

			assert.strictEqual(SectionBasePrototype._shouldBeHidden.call(oMockSection), bExpectToBeHidden,
				bExpectToBeHidden ? sShouldBeHidden : sShouldBeVisible);
		}

		fnGenerateTest(Importance.Low, Importance.Low, false, assert);
		fnGenerateTest(Importance.Medium, Importance.Low, false, assert);
		fnGenerateTest(Importance.High, Importance.Low, false, assert);

		fnGenerateTest(Importance.Low, Importance.Medium, true, assert);
		fnGenerateTest(Importance.Medium, Importance.Medium, false, assert);
		fnGenerateTest(Importance.High, Importance.Medium, false, assert);

		fnGenerateTest(Importance.Low, Importance.High, true, assert);
		fnGenerateTest(Importance.Medium, Importance.High, true, assert);
		fnGenerateTest(Importance.High, Importance.High, false, assert);
	});

	QUnit.test("Deciding the lowest importance level to show", function (assert) {
		const fnGenerateTest = function (sDevice, sExpectedImportance, assert) {
			assert.strictEqual(SectionPrototype._determineTheLowestLevelOfImportanceToShow(sDevice), sExpectedImportance,
				"On " + sDevice + " show " + sExpectedImportance + " importance and above content");
		};

		fnGenerateTest("Phone", Importance.High, assert);
		fnGenerateTest("Tablet", Importance.Medium, assert);
		fnGenerateTest("Desktop", Importance.Low, assert);

		assert.strictEqual(SectionPrototype._determineTheLowestLevelOfImportanceToShow("Desktop", true), Importance.High,
			"On Desktop you can override the default behaviour and show only High priorities");
	});

	QUnit.test("Updating visibility of Section DOM element", function(assert) {
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout();
		const oObjectPageSection = new ObjectPageSection();
		const oToggleSpy = this.spy();
		const jQueryObject = {
				children: this.stub().returns({
					toggle: oToggleSpy
				})
			};
		const oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

		this.stub(oObjectPageSection, "$").returns(jQueryObject);

		oObjectPageLayout.addSection(oObjectPageSection);

		// Act
		oObjectPageSection._updateShowHideState(false);

		// Assert
		assert.ok(oToggleSpy.notCalled, "toggling visibility function is not called when there is no change in Section's visibility");
		assert.ok(oRequestAdjustLayoutSpy.notCalled, "_requestAdjustLayout is not called when there is no change in Section's visibility");

		// Act
		oObjectPageSection._updateShowHideState(true);

		// Assert
		assert.ok(oToggleSpy.calledOnce, "toggling visibility function is called when there is change in Section's visibility");
		assert.ok(oRequestAdjustLayoutSpy.calledOnce, "_requestAdjustLayout is called when there is change in Section's visibility");

		// Clean-up
		oObjectPageSection.destroy();
	});

	QUnit.test("Updating visibility of SubSection DOM element", function(assert) {
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout();
		const oObjectPageSubSection = new ObjectPageSubSection();
		const oObjectPageSection = new ObjectPageSection({
				subSections: [oObjectPageSubSection]
			});
		const oToggleSpy = this.spy();
		const jQueryObject = {
				children: this.stub().returns({
					toggle: oToggleSpy
				})
			};
		const oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

		this.stub(oObjectPageSubSection, "$").returns(jQueryObject);

		oObjectPageLayout.addSection(oObjectPageSection);

		// Act
		oObjectPageSubSection._updateShowHideState(false);

		// Assert
		assert.ok(oToggleSpy.notCalled, "toggling visibility function is not called when there is no change in Section's visibility");
		assert.ok(oRequestAdjustLayoutSpy.notCalled, "_requestAdjustLayout is not called when there is no change in Section's visibility");

		// Act
		oObjectPageSubSection._updateShowHideState(true);

		// Assert
		assert.ok(oToggleSpy.calledTwice, "toggling visibility function is called twice (for SeeMore and sapUxAPBlock containers) when there is change in SubSection's visibility");
		assert.ok(oRequestAdjustLayoutSpy.calledOnce, "_requestAdjustLayout is called when there is change in SubSection's visibility");

		// Clean-up
		oObjectPageSubSection.destroy();
	});

	QUnit.test("Updating the show/hide state", function (assert) {
		const toggleSpy = this.spy();
		const jQueryObject = {
				children: this.stub().returns({
					toggle: toggleSpy
				})
			};
		const oMockSection = {
				_getObjectPageLayout: this.stub().returns(null),
				_sContainerSelector: '.someClass',
				_getIsHidden: this.stub().returns(this._isHidden),
				setImportance: function (sImportance) {
					this.getImportance = this.stub().returns(sImportance);
				},
				_isTitleVisible: function () {
					return true;
				},
				setTitleVisible: function () {
					return;
				},
				_updateShowHideState: this.spy(),
				_updateShowHideButton: this.spy(),
				$: this.stub().returns(jQueryObject)
			};

		SectionBasePrototype.init.call(this);
		oMockSection._isHidden = true;

		SectionBasePrototype._expandSection.call(oMockSection);
		assert.ok(oMockSection._updateShowHideState.calledWith(false));

		assert.ok(!oMockSection._getIsHidden());
		SectionBasePrototype._showHideContent.call(oMockSection);
		assert.ok(oMockSection._updateShowHideState.calledWith(true));

		assert.ok(!oMockSection._getIsHidden());

		SectionBasePrototype._updateShowHideState.call(oMockSection, true);

		assert.ok(jQueryObject.children.calledWith(oMockSection._sContainerSelector));
		assert.ok(jQueryObject.children().toggle.calledWith(false));

		SectionBasePrototype._updateShowHideState.call(oMockSection, false);

		assert.ok(jQueryObject.children.calledWith(oMockSection._sContainerSelector));
		assert.ok(jQueryObject.children().toggle.calledWith(true));
		assert.equal(oMockSection._updateShowHideButton.callCount, 2, "updateShowHideButton is called twice");
	});

	QUnit.test("Section show/hide all button text and visibility", function (assert) {
		const oButton = new Button({
				visible: false,
				text: "initialText"
			});
		const sExpectedText = "someText";
		const oSectionStub = {
				_getShowHideAllButton: this.stub().returns(oButton),
				_getShouldDisplayShowHideAllButton: this.stub().returns(true),
				_getShowHideAllButtonText: this.stub().returns(sExpectedText)
			};

		SectionPrototype._updateShowHideAllButton.call(oSectionStub, true);
		assert.ok(oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.setText("otherText");
		oSectionStub._getShouldDisplayShowHideAllButton = this.stub().returns(false);

		SectionPrototype._updateShowHideAllButton.call(oSectionStub, false);
		assert.ok(!oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.destroy();
	});

	QUnit.test("Section show/hide button text and visibility", function (assert) {
		const oButton = new Button({
				visible: false,
				text: "initialText"
			});
		const sExpectedText = "someText";
		const oSectionStub = {
				_getShowHideButton: this.stub().returns(oButton),
				_getShowHideButtonText: this.stub().returns(sExpectedText),
				_shouldBeHidden: this.stub().returns(true)
			};

		SectionPrototype._updateShowHideButton.call(oSectionStub, true);
		assert.ok(oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.setText("otherText");
		oSectionStub._shouldBeHidden = this.stub().returns(false);

		SectionPrototype._updateShowHideButton.call(oSectionStub, false);
		assert.ok(!oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.destroy();
	});

	QUnit.test("Testing ObjectPageSubSection._getClosestSection", function (assert) {
		return XMLView.create({
			id: "UxAP-13_objectPageSection",
			viewName: "view.UxAP-13_ObjectPageSection"
		}).then(function(ObjectPageSectionView) {
			const oSectionWithTwoSubSection = ObjectPageSectionView.byId("SectionWithSubSection");
			const oFirstSubSection = oSectionWithTwoSubSection.getSubSections()[0];
			const fnGetClosestSection = ObjectPageSection._getClosestSection;

			assert.equal(fnGetClosestSection(oFirstSubSection).getId(), oSectionWithTwoSubSection.getId());
			assert.equal(fnGetClosestSection(oSectionWithTwoSubSection).getId(), oSectionWithTwoSubSection.getId());

			ObjectPageSectionView.destroy();
		});
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			return XMLView.create({
				id: "UxAP-13_objectPageSection",
				viewName: "view.UxAP-13_ObjectPageSection"
			}).then(async function(oView) {
				this.ObjectPageSectionView = oView;
				this.ObjectPageSectionView.placeAt('qunit-fixture');
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function() {
			this.ObjectPageSectionView.destroy();
		}
	});

	QUnit.test("Fast nagivation", function (assert) {
		const oFirstSection = this.ObjectPageSectionView.byId("SectionWithSubSection");

		assert.strictEqual(oFirstSection.$().attr("data-sap-ui-fastnavgroup"), "true", "Sections are navigable via F6");
	});

	QUnit.test("Test aria-labelledby attribute", async function(assert) {
		assert.expect(8);

		const oFirstSection = this.ObjectPageSectionView.byId("SectionWithSubSection");
		const oSectionWithOneSubsection = this.ObjectPageSectionView.byId("SectionWithoneSubSection");
		const sSectionWithOneSubsectionAriaLabelledBy = oSectionWithOneSubsection.$().attr("aria-labelledby");
		const oThirdSubsection = this.ObjectPageSectionView.byId("subsection3");
		const oSectionWithoutTitle = this.ObjectPageSectionView.byId("SectionWithNoTitleAndTwoSubSections");
		const sSectionWithoutTitleAriaLabel = oSectionWithoutTitle.$().attr("aria-labelledby");
		const sSectionWithNotTitleAriaLabel = this.ObjectPageSectionView.byId("SectionWithHiddenTitleAndOneSubSectionWithHiddenTitle").$().attr("aria-labelledby");
		const oLastSection = this.ObjectPageSectionView.byId("SectionWithNoTitleAndOneSubSection");
		const sLastSectionAriaLabelledBy = oLastSection.$().attr("aria-labelledby");
		const oLastSectionFirstSubsection = oLastSection.getSubSections()[0];
		let sFirstSectionAriaLabelledBy = oFirstSection.$().attr("aria-labelledby");

		// assert
		assert.strictEqual(Element.getElementById(sFirstSectionAriaLabelledBy).getText(),
			oFirstSection.getTitle(), "aria-labelledby is set properly");
		assert.strictEqual(Element.getElementById(sSectionWithoutTitleAriaLabel).getText(),
			"", "sections without title, which have more than one subsection do not have aria-labelledby");
		assert.strictEqual(Element.getElementById(sSectionWithNotTitleAriaLabel).getId(), sSectionWithNotTitleAriaLabel,
			"sections with hidden title and only one subsection with hidden title have aria-labelledby pointing to the Section's anchor bar button");
		assert.strictEqual(Element.getElementById(sLastSectionAriaLabelledBy).getText(),
			oLastSectionFirstSubsection.getTitle(), "aria-labelledby is set properly"); //labelled by the subsection title

		// act
		oFirstSection.setTitle("New title");
		// assert
		assert.strictEqual(Element.getElementById(sFirstSectionAriaLabelledBy).getText(),
			oFirstSection.getTitle(), "aria-labelledby is updated properly");

		// act
		oFirstSection.setShowTitle(false);
		await nextUIUpdate();
		sFirstSectionAriaLabelledBy = oFirstSection.$().attr("aria-labelledby");

		// assert
		assert.strictEqual(Element.getElementById(sFirstSectionAriaLabelledBy).getId(),
			sFirstSectionAriaLabelledBy, "sections with hidden title have labelled by pointing to the Section's anchor bar button");

		// assert
		assert.strictEqual(Element.getElementById(sSectionWithOneSubsectionAriaLabelledBy).getText(),
			oThirdSubsection.getTitle(), "sections without title and only one subsection are labelled by the section`s title");

		// act
		// in this case the subsection title get propagated to the
		// section title property through _setInternalTitle function
		oLastSectionFirstSubsection.setTitle("My new title");
		await nextUIUpdate();

		// assert
		assert.strictEqual(Element.getElementById(sLastSectionAriaLabelledBy).getText(),
			oLastSectionFirstSubsection.getTitle(), "aria-labelledby is updated properly"); //labelled by the subsection title
	});

	QUnit.test("Test title heading element", async function(assert) {
		assert.expect(3);
		const oSectionWithOneSubsection = this.ObjectPageSectionView.byId("SectionWithSubSection");
		const oSectionHeader = oSectionWithOneSubsection.$().find(".sapUxAPObjectPageSectionHeader");

		// assert
		assert.strictEqual(oSectionHeader.find("h3").length, 1, "default H3 heading element is rendered");

		// act
		oSectionWithOneSubsection.setTitleLevel("H5");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oSectionHeader.find("h5").length, 1, "H5 heading element is correctly rendered");

		// act
		oSectionWithOneSubsection.setTitleLevel("Auto");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oSectionHeader.find("h3").length, 1, "default H3 heading element is rendered when titleLevel is set to Auto");

	});

	QUnit.test("aria-labelledby is correctly set when there is a Section with visible=false", async function(assert) {
		assert.expect(5);
		// Arrange
		// This test verifies that the aria-labelledby mapping uses the anchor bar item's key
		// property to find the corresponding section, rather than relying on array index matching.
		// The old implementation looped through all sections by index and matched them with
		// anchor bar items by the same index, which caused mismatches when invisible sections
		// were present (since invisible sections don't have anchor bar items).
		const oObjectPageLayout = new ObjectPageLayout({
			sections: [
					new ObjectPageSection("invisibleSection", {
					title: "Invisible Section",
					visible: false, // This section is invisible
					subSections: [
						new ObjectPageSubSection({
							title: "SubSection Invisible",
							blocks: [new Text({text: "Invisible Content"})]
						})
					]
				}),
				new ObjectPageSection("visibleSection1", {
					title: "Visible Section 1",
					showTitle: false, // Section title is hidden, so it should be labelled by the anchor bar item
					subSections: [
						new ObjectPageSubSection({
							blocks: [new Text({text: "Content 1"})]
						})
					]
				}),
				new ObjectPageSection("visibleSection2", {
					title: "Visible Section 2",
					showTitle: false, // Section title is hidden, so it should be labelled by the anchor bar item
					subSections: [
						new ObjectPageSubSection({
							blocks: [new Text({text: "Content 2"})]
						})
					]
				})
			]
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Get references
		const oVisibleSection1 = Element.getElementById("visibleSection1");
		const oVisibleSection2 = Element.getElementById("visibleSection2");
		const oAnchorBar = oObjectPageLayout.getAggregation("_anchorBar");
		const aAnchorBarItems = oAnchorBar.getItems();

		// Assert - verify anchor bar has only 2 items (for the 2 visible sections)
		assert.strictEqual(aAnchorBarItems.length, 2, "Anchor bar has 2 items for 2 visible sections");

		// Assert - verify anchor bar items have correct keys matching section IDs
		assert.strictEqual(aAnchorBarItems[0].getKey(), "visibleSection1",
			"First anchor bar item key matches first visible section ID");
		assert.strictEqual(aAnchorBarItems[1].getKey(), "visibleSection2",
			"Second anchor bar item key matches second visible section ID");

		// Assert - verify aria-labelledby is correctly set on each visible section
		// The aria-labelledby should reference the corresponding anchor bar button
		const sSection1AriaLabelledBy = oVisibleSection1.$().attr("aria-labelledby");
		const sSection2AriaLabelledBy = oVisibleSection2.$().attr("aria-labelledby");

		// Get the anchor bar button IDs
		const sAnchorBarItem1Id = aAnchorBarItems[0].getId();
		const sAnchorBarItem2Id = aAnchorBarItems[1].getId();

		// Assert - verify the aria-labelledby references point to the correct anchor bar buttons
		// This is the key assertion: visibleSection2 should be labelled by anchor bar item 2,
		// NOT by anchor bar item 1 (which would happen with the old index-based logic)
		assert.strictEqual(sSection1AriaLabelledBy, sAnchorBarItem1Id,
			"Visible Section 1 aria-labelledby correctly references first anchor bar button");
		assert.strictEqual(sSection2AriaLabelledBy, sAnchorBarItem2Id,
			"Visible Section 2 aria-labelledby correctly references second anchor bar button (not mismatched due to invisible section)");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.module("Invalidation", {
		beforeEach: async function() {
			this.oObjectPageLayout = new ObjectPageLayout("page", {
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

			this.oObjectPageLayout.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("Visibility change", function (assert) {

		// Setup
		const oSection = this.oObjectPageLayout.getSections()[0];
		const oInvalidateSpy = this.spy(oSection, "invalidate");

		// Act
		oSection.setVisible(false);

		// Check
		assert.equal(oInvalidateSpy.callCount, 1, "section is invalidated");
	});

	QUnit.test("_setAriaLabelledByAnchorButton does not lead to infinite rerendering loop", function(assert) {
		// Arrange
		const done = assert.async();
		let iRenderCount = 0;
		const oSubSection = new ObjectPageSubSection({
			title: "Original Title",
			blocks: [new Text({text: "test"})]
		});

		const oSection = new ObjectPageSection({
			title: "Test Section",
			subSections: [oSubSection]
		});

		const oObjectPageLayout = new ObjectPageLayout({
			sections: [oSection]
		});

		// Add the delegate that would cause infinite loop with the old implementation
		oSubSection.addEventDelegate({
			onAfterRendering: function() {
				// Change the title in onAfterRendering delegate
				// With the old implementation, this would cause infinite rerendering
				oSubSection.setTitle("Title Changed by Event Delegate!");
				iRenderCount++;
			}
		});

		// Place component in DOM
		oObjectPageLayout.placeAt('qunit-fixture');

		// Wait for the layout to render and stabilize
		setTimeout(function() {
			// Assert
			assert.strictEqual(iRenderCount, 2, "SubSection rendered two times (initial render + one re-render after title change)");

			// Verify subsection title was changed by delegate
			assert.strictEqual(oSubSection.getTitle(), "Title Changed by Event Delegate!", "SubSection title was changed by delegate");

			// Clean up
			oObjectPageLayout.destroy();
			done();
		}, 1000); // Give enough time for any potential rerender loop to occur
	});

	QUnit.module("Private methods", {
		beforeEach: async function() {
			this.oObjectPageLayout = new ObjectPageLayout("page", {
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						}),
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						}),
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

			this.oObjectPageLayout.placeAt('content');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("_getVisibleSubSections", async function(assert) {
		assert.expect(4);
		// Setup
		const oSection = this.oObjectPageLayout.getSections()[0];
		const aSubSections = oSection.getSubSections();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 3, "All sub sections are visible");

		aSubSections[1].setVisible(false);
		await nextUIUpdate();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 2, "Two visible sub sections and one sub section with visible=false");

		aSubSections[2].destroyBlocks();
		this.oObjectPageLayout._applyUxRules();
		await nextUIUpdate();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 1, "One visible sub section, one sub section with visible=false"
			+ "and one sub section with empty content");

		aSubSections[1].setVisible(true);
		await nextUIUpdate();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 2, "Two visible sub sections and one sub section with empty content");
	});

	QUnit.test("Visibility not changed", function (assert) {

		// Setup
		const oSection = this.oObjectPageLayout.getSections()[0];
		const oInvalidateSpy = this.spy(oSection, "invalidate");

		// Act: called setter with same value as current
		oSection.setVisible(true);

		// Check
		assert.equal(oInvalidateSpy.callCount, 0, "section is not invalidated");
	});

	QUnit.test("_getWrapTitle returns correct value based on wrapTitle property", function (assert) {
		// Arrange
		const oSection = new ObjectPageSection();

		// Act & Assert - default value is false
		assert.strictEqual(oSection._getWrapTitle(), false, "Default value of wrapTitle is returned (false)");

		// Act - change wrapTitle property to true
		oSection.setWrapTitle(true);

		// Assert - should return the new value
		assert.strictEqual(oSection._getWrapTitle(), true, "Returns true when wrapTitle is set to true");

		// Clean up
		oSection.destroy();
	});

	QUnit.test("Async unstashing", function (assert) {

		// Setup
		const oSection = this.oObjectPageLayout.getSections()[0];
		const oSpyConnectToModels = this.spy(ObjectPageSubSection.prototype, "connectToModelsAsync");
		const oSpyUnstash = this.spy(ObjectPageSubSection.prototype, "_unStashControlsAsync");

		// Act
		oSection.connectToModelsAsync();

		// Check
		assert.strictEqual(oSpyConnectToModels.callCount, 3, "connectToModelsAsync is called on each SubSection");
		assert.strictEqual(oSpyUnstash.callCount, 3, "_unStashControlsAsync is called on each SubSection");
	});

	QUnit.module("SubSection promoted");

	QUnit.test("Showing SubSection changes 'sapUxAPObjectPageSubSectionPromoted' class and forwards title level", async function(assert) {
		// Arrange
		const oObjectPageSubSection1 = new ObjectPageSubSection({
				title: "SubSection1",
				blocks: new Text({ text: "SubSection1" }),
				visible: false
			});
		const oObjectPageSubSection2 = new ObjectPageSubSection({
				title: "SubSection2",
				blocks: new Text({ text: "SubSection2" })
			});
		const oObjectPageSection1 = new ObjectPageSection({
				title: "Some title",
				subSections: [new ObjectPageSubSection({
					title: "SubSection Title",
					blocks: [new Text({text: "test"})]
				})]
			});
		const oObjectPageSection2 = new ObjectPageSection({
				title: "Section",
				subSections: [oObjectPageSubSection1, oObjectPageSubSection2]
			});
		const oObjectPageLayout = new ObjectPageLayout({
				sections: [ oObjectPageSection1, oObjectPageSection2 ]
			});
		const done = assert.async();

		assert.expect(10);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.strictEqual(oObjectPageSection2._hasPromotedSubSection(), true, "Section has promoted SubSection");
			assert.strictEqual(oObjectPageSubSection2._isPromoted(), true, "SubSection is promoted");
			assert.ok(oObjectPageSubSection2.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
				"SubSection has promoted CSS class");
			assert.strictEqual(oObjectPageSubSection2._getTitleControl().getTitleStyle(), oObjectPageSection2._getTitleControl().getTitleStyle(),
				"SubSection title style is the same as Section title style (inherited from Section)");
			assert.strictEqual(oObjectPageSubSection2._getTitleControl().getLevel(), oObjectPageSection2._getTitleControl().getLevel(),
				"SubSection title level is the same as Section title level (inherited from Section)");

			// Act
			oObjectPageSubSection1.setVisible(true);

			setTimeout(function () {
				// Assert
				assert.ok(!oObjectPageSubSection2.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
					"SubSection does not have promoted CSS class");
				assert.strictEqual(oObjectPageSection2._hasPromotedSubSection(), false, "Section does not have promoted SubSection");
				assert.strictEqual(oObjectPageSubSection2._isPromoted(), false, "SubSection is not promoted");
				assert.ok(oObjectPageSubSection2._getTitleControl().getTitleStyle() !== oObjectPageSection2._getTitleControl().getTitleStyle(),
					"SubSection title style is different than Section title style (back to its own)");
				assert.ok(oObjectPageSubSection2._getTitleControl().getLevel() !== oObjectPageSection2._getTitleControl().getLevel(),
					"SubSection title level is different than Section title level (back to its own)");

				// Clean-up
				oObjectPageLayout.destroy();
				done();
			}, 600);
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("Adding SubSection changes 'sapUxAPObjectPageSubSectionPromoted' class and forwards title settings", async function(assert) {
		// Arrange
		const oObjectPageSubSection1 = new ObjectPageSubSection({
				title: "SubSection1",
				blocks: new Text({ text: "SubSection1" })
			});
		const oObjectPageSubSection2 = new ObjectPageSubSection({
				title: "SubSection2",
				blocks: new Text({ text: "SubSection2" })
			});
		const oObjectPageSection1 = new ObjectPageSection({
				title: "Some title",
				subSections: [new ObjectPageSubSection({
					blocks: [new Text({text: "test"})]
				})]
			});
		const oObjectPageSection2 = new ObjectPageSection({
				title: "Section",
				subSections: [oObjectPageSubSection1]
			});
		const oObjectPageLayout = new ObjectPageLayout({
				sections: [ oObjectPageSection1, oObjectPageSection2 ]
			});
		const done = assert.async();

		assert.expect(10);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.ok(oObjectPageSubSection1.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
				"SubSection has promoted CSS class");
			assert.strictEqual(oObjectPageSection2._hasPromotedSubSection(), true, "Section has promoted SubSection");
			assert.strictEqual(oObjectPageSubSection1._isPromoted(), true, "SubSection is promoted");
			assert.strictEqual(oObjectPageSubSection1._getTitleControl().getTitleStyle(), oObjectPageSection2._getTitleControl().getTitleStyle(),
				"SubSection title style is the same as Section title style (inherited from Section)");
			assert.strictEqual(oObjectPageSubSection1._getTitleControl().getLevel(), oObjectPageSection2._getTitleControl().getLevel(),
				"SubSection title level is the same as Section title level (inherited from Section)");

			// Act
			oObjectPageSection2.addSubSection(oObjectPageSubSection2);

			setTimeout(function () {
				// Assert
				assert.ok(!oObjectPageSubSection1.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
					"SubSection does not have promoted CSS class");
				assert.strictEqual(oObjectPageSection2._hasPromotedSubSection(), false, "Section does not have promoted SubSection");
				assert.strictEqual(oObjectPageSubSection1._isPromoted(), false, "SubSection is not promoted");
				assert.ok(oObjectPageSubSection1._getTitleControl().getTitleStyle() !== oObjectPageSection2._getTitleControl().getTitleStyle(),
					"SubSection title style is different than Section title style (back to its own)");
				assert.ok(oObjectPageSubSection1._getTitleControl().getLevel() !== oObjectPageSection2._getTitleControl().getLevel(),
					"SubSection title level is different than Section title level (back to its own)");

				// Clean-up
				oObjectPageLayout.destroy();
				done();
			}, 600);
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("Removing SubSection changes 'sapUxAPObjectPageSubSectionPromoted' class and forwards title level", async function(assert) {
		// Arrange
		const oObjectPageSubSection1 = new ObjectPageSubSection({
				title: "SubSection1",
				blocks: new Text({ text: "SubSection1" })
			});
		const oObjectPageSubSection2 = new ObjectPageSubSection({
				title: "SubSection2",
				blocks: new Text({ text: "SubSection2" })
			});
		const oObjectPageSection1 = new ObjectPageSection({
				title: "Some title",
				subSections: [new ObjectPageSubSection({
					blocks: [new Text({text: "test"})]
				})]
			});
		const oObjectPageSection2 = new ObjectPageSection({
				title: "Section",
				subSections: [oObjectPageSubSection1, oObjectPageSubSection2]
			});
		const oObjectPageLayout = new ObjectPageLayout({
				sections: [ oObjectPageSection1, oObjectPageSection2 ]
			});
		const done = assert.async();

		assert.expect(10);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.ok(!oObjectPageSubSection1.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
					"SubSection does not have promoted CSS class");
			assert.strictEqual(oObjectPageSection2._hasPromotedSubSection(), false, "Section does not have promoted SubSection");
			assert.strictEqual(oObjectPageSubSection1._isPromoted(), false, "SubSection is not promoted");
			assert.ok(oObjectPageSubSection1._getTitleControl().getTitleStyle() !== oObjectPageSection2._getTitleControl().getTitleStyle(),
				"SubSection title style is different than Section title style");
			assert.ok(oObjectPageSubSection1._getTitleControl().getLevel() !== oObjectPageSection2._getTitleControl().getLevel(),
			"SubSection title level is different than Section title level");

			// Act
			oObjectPageSection2.removeSubSection(oObjectPageSubSection2);

			setTimeout(function () {
				// Assert
				assert.ok(oObjectPageSubSection1.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
					"SubSection has promoted CSS class");
				assert.strictEqual(oObjectPageSection2._hasPromotedSubSection(), true, "Section has promoted SubSection");
				assert.strictEqual(oObjectPageSubSection1._isPromoted(), true, "SubSection is promoted");
				assert.strictEqual(oObjectPageSubSection1._getTitleControl().getTitleStyle(), oObjectPageSection2._getTitleControl().getTitleStyle(),
					"SubSection title style is the same as Section title style (inherited from Section)");
				assert.strictEqual(oObjectPageSubSection1._getTitleControl().getLevel(), oObjectPageSection2._getTitleControl().getLevel(),
				"SubSection title level is the same as Section title level (inherited from Section)");

				// Clean-up
				oObjectPageLayout.destroy();
				done();
			}, 600);
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.module("Heading aggregation");

	QUnit.test("Heading is displayed correctly", async function(assert) {
		assert.expect(2);
		// Arrange
		const oMessageStrip = new MessageStrip({ text: "Simple message strip" });
		const oObjectPageLayout = new ObjectPageLayout({
				sections: new ObjectPageSection({
					title: "Section",
					heading: oMessageStrip,
					subSections: [
						new ObjectPageSubSection({
							title: "SubSection1",
							blocks: new Text({ text: "SubSection1" }),
							visible: false
						}),
						new ObjectPageSubSection({
							title: "SubSection2",
							blocks: new Text({ text: "SubSection2" })
						})
					]
				})
			});
		const oSection = oObjectPageLayout.getSections()[0];
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		const $section = oSection.getDomRef();
		const $strip = oMessageStrip.getDomRef();

		assert.ok($section.contains($strip), "Message strip is displayed correctly");

		oSection.destroyHeading();
		await nextUIUpdate();

		assert.notOk($section.contains($strip), "Message strip is displayed correctly");
	});

	QUnit.module("Layout", {
		beforeEach: async function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "Test"})]
						})
					]
				})
			});

			this.oObjectPage.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("updates to subsections aggregation invalidates the section", function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSection = oObjectPage.getSections()[0];
		const oSubSection = oSection.getSubSections()[0];
		const oSpy = this.spy(oSection, "invalidate");

		oSection.removeSubSection(oSubSection);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");

		oSpy.reset();
		oSection.addSubSection(oSubSection);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");

		oSpy.reset();
		oSection.insertSubSection(oSubSection.clone());
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");
	});

	QUnit.test("updates to subsections visibility invalidates the section", function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSection = oObjectPage.getSections()[0];
		const oSubSection = oSection.getSubSections()[0];
		const oSpy = this.spy(oSection, "invalidate");

		oSubSection.setVisible(false);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");

		oSpy.reset();
		oSubSection.setVisible(true);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");
	});

	QUnit.test("destroyed section does not recreate the grid", function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSection = oObjectPage.getSections()[0];

		oSection.destroy();

		assert.equal(oSection._getGrid(), null, "destroyed section does not recreate the grid");
	});

	QUnit.module("Properties", {
		beforeEach : async function() {
			this.oObjectPageLayout = new ObjectPageLayout({
				sections: [
					new ObjectPageSection({
						title: "Section 2",
						anchorBarButtonColor: "Positive",
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									new Panel({
										content: [new Text({text: "Content1"})]
									})]
							})
						]
					}),
					new ObjectPageSection({
						title: "Section 1",
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									new Panel({
										content: [new Text({text: "Content2"})]
									})]
							})
						]
					})
				]

			});

			this.oObjectPageLayout.placeAt("content");
			await nextUIUpdate();

		},
		afterEach : function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("anchorBarButtonColor property", function (assert) {
		const oObjectPage = this.oObjectPageLayout;
		const oAnchorBar = oObjectPage.getAggregation("_anchorBar");
		const oAnchorBarBtn = oAnchorBar.getItems()[0];
		const oSection = oObjectPage.getAggregation("sections")[0];

		assert.strictEqual(oAnchorBarBtn.getIconColor(), oSection.getAnchorBarButtonColor(), "The anchorBarButtonColor property is correctly set and color is applied to the anchorbar button");

	});

	QUnit.test("titleUppercase property sets proper CSS class", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPageLayout;
		const oSection = oObjectPage.getAggregation("sections")[0];

		oSection.setTitleUppercase(true);
		await nextUIUpdate();

		assert.ok(oSection._getTitleControl().hasStyleClass("sapUxAPObjectPageSectionTitleUppercase"), "The section has the proper CSS class");
	});

	QUnit.module("Single section with single subsection", {
		beforeEach: function() {
			return XMLView.create({
				id: "UxAP-14_objectPageSection",
				viewName: "view.UxAP-14_ObjectPageSection"
			}).then(async function(oView) {
				this.ObjectPageSectionView = oView;
				this.ObjectPageSectionView.placeAt('qunit-fixture');
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function() {
			this.ObjectPageSectionView.destroy();
		}
	});

	QUnit.test("Test role attribute of section with hidden title in different configurations", async function(assert) {
		// Arrange
		const oFirstSection = this.ObjectPageSectionView.byId("SectionHiddenTitle1");
		const oSecondSection = this.ObjectPageSectionView.byId("SectionHiddenTitle2");
		const oOPL = this.ObjectPageSectionView.byId("ObjectPageLayout");

		assert.expect(2);

		// Assert
		assert.strictEqual(oFirstSection.$().attr("role"), "region", "When there are multiple sections with hidden titles, section get a role attribute from the AnchorBar title");

		oOPL.removeAggregation("sections", oSecondSection);
		oSecondSection.destroy();
		await nextUIUpdate();
		// Assert
		assert.strictEqual(oFirstSection.$().attr("role"), undefined, "Single section with single subsection, section title is hidden, section does not get a role attribute");
	});

	QUnit.module("Sticky Header");

	QUnit.test("ObjectPageSection with multiple SubSections should not have sticky header", function(assert) {
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout({
			sections: [
				new ObjectPageSection({
					title: "Section with multiple subsections",
					subSections: [
						new ObjectPageSubSection({
							title: "Subsection 1",
							blocks: [new Text({text: "Content 1"})]
						}),
						new ObjectPageSubSection({
							title: "Subsection 2",
							blocks: [new Text({text: "Content 2"})]
						})
					]
				})
			]
		});

		// Act
		oObjectPageLayout.placeAt('qunit-fixture');

		// Assert
		const oSection = oObjectPageLayout.getSections()[0];
		const $sectionHeader = oSection.$().find(".sapUxAPObjectPageSectionHeader");
		assert.strictEqual(oSection._shouldHaveStickyHeader(), false,
			"Section with multiple SubSections does not have sticky header");
		assert.strictEqual($sectionHeader.hasClass("sapUxAPObjectPageSectionHeaderSticky"), false,
			"Section does not have sticky header CSS class");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("ObjectPageSection with one SubSection and titleOnTop should not have sticky header", async function(assert) {
		assert.expect(3);
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout({
			sections: [
				new ObjectPageSection({
					title: "Section Title",
					subSections: [
						new ObjectPageSubSection({
							title: "Subsection Title",
							blocks: [new Text({text: "Content"})]
						})
					]
				})
			]
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Assert
		const oSection = oObjectPageLayout.getSections()[0];
		const $sectionHeader = oSection.$().find(".sapUxAPObjectPageSectionHeader");

		assert.strictEqual($sectionHeader.hasClass("sapUxAPObjectPageSectionHeaderHidden"), true,
			"Section header is hidden when there's only one subsection (promoted)");
		assert.strictEqual(oSection._shouldHaveStickyHeader(), false,
			"Section with one SubSection and titleOnTop does not have sticky header");
		assert.strictEqual($sectionHeader.hasClass("sapUxAPObjectPageSectionHeaderSticky"), false,
			"Section does not have sticky header CSS class when header is hidden");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("ObjectPageSection with one SubSection and titleOnLeft should not have sticky header", async function(assert) {
		assert.expect(2);
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout({
			subSectionLayout: ObjectPageSubSectionLayout.TitleOnLeft,
			sections: [
				new ObjectPageSection({
					title: "Section Title",
					subSections: [
						new ObjectPageSubSection({
							title: "Subsection Title",
							blocks: [new Text({text: "Content"})]
						})
					]
				})
			]
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Assert
		const oSection = oObjectPageLayout.getSections()[0];
		const $sectionHeader = oSection.$().find(".sapUxAPObjectPageSectionHeader");

		assert.strictEqual(oSection._shouldHaveStickyHeader(), false,
			"Section with titleOnLeft should not have sticky header");
		assert.strictEqual($sectionHeader.hasClass("sapUxAPObjectPageSectionHeaderSticky"), false,
			"Section does not have sticky header CSS class when title is on left");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("ObjectPageSection with one SubSection (with NO title) should have sticky header", async function(assert) {
		assert.expect(2);
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout({
			sections: [
				new ObjectPageSection({
					title: "Section Title",
					subSections: [
						new ObjectPageSubSection({
							// No title for the subsection
							blocks: [new Text({text: "Content without subsection title"})]
						})
					]
				})
			]
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Assert
		const oSection = oObjectPageLayout.getSections()[0];
		const $sectionHeader = oSection.$().find(".sapUxAPObjectPageSectionHeader");

		assert.strictEqual(oSection._shouldHaveStickyHeader(), true,
			"Section with one SubSection without title should have sticky header");
		assert.strictEqual($sectionHeader.hasClass("sapUxAPObjectPageSectionHeaderSticky"), true,
			"Section has sticky header CSS class when it has one subsection without title");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("ObjectPageSection with one SubSection with titleOnLeft and NO subsection title visible should have sticky header", async function(assert) {
		assert.expect(2);
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout({
			subSectionLayout: ObjectPageSubSectionLayout.TitleOnLeft,
			sections: [
				new ObjectPageSection({
					title: "Section Title",
					subSections: [
						new ObjectPageSubSection({
							title: "Subsection Title",
							showTitle: false, // Title is NOT visible
							blocks: [new Text({text: "Content with titleOnLeft but no visible subsection title"})]
						})
					]
				})
			]
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Assert
		const oSection = oObjectPageLayout.getSections()[0];
		const $sectionHeader = oSection.$().find(".sapUxAPObjectPageSectionHeader");

		assert.strictEqual(oSection._shouldHaveStickyHeader(), true,
			"Section with one SubSection with titleOnLeft and NO subsection title visible should have sticky header");
		assert.strictEqual($sectionHeader.hasClass("sapUxAPObjectPageSectionHeaderSticky"), true,
			"Section has sticky header CSS class when it has one subsection with titleOnLeft and no visible subsection title");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("Sticky header position should be static in RTA mode", async function(assert) {
		assert.expect(3);
		// Arrange - create a section that gets sticky header
		// (one SubSection without visible title)
		const oObjectPageLayout = new ObjectPageLayout({
			sections: [
				new ObjectPageSection({
					title: "Section Title",
					subSections: [
						new ObjectPageSubSection({
							showTitle: false,
							blocks: [new Text({text: "Content"})]
						})
					]
				})
			]
		});

		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oSection = oObjectPageLayout.getSections()[0];
		const oHeaderDom = oSection.getDomRef("header");

		// Assert - sticky is applied initially
		assert.strictEqual(getComputedStyle(oHeaderDom).position, "sticky",
			"Section header position is sticky before RTA mode");

		// Act - simulate RTA mode
		document.body.classList.add("sapUiRtaMode");

		// Assert
		assert.strictEqual(getComputedStyle(oHeaderDom).position, "static",
			"Section header position is static in RTA mode");

		// Act - leave RTA mode
		document.body.classList.remove("sapUiRtaMode");

		// Assert
		assert.strictEqual(getComputedStyle(oHeaderDom).position, "sticky",
			"Section header position is sticky again after leaving RTA mode");

		// Clean up
		oObjectPageLayout.destroy();
	});
});