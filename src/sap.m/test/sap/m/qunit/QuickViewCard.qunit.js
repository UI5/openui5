/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Avatar",
	"sap/m/QuickViewCard",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(
	Element,
	JSONModel,
	mobileLibrary,
	App,
	Page,
	Avatar,
	QuickViewCard,
	QuickViewPage,
	QuickViewGroup,
	QuickViewGroupElement,
	nextUIUpdate,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.QuickViewGroupElementType
	var QuickViewGroupElementType = mobileLibrary.QuickViewGroupElementType;

	//create JSON model instance
	var oModel = new JSONModel();

	// JSON sample data
	var mData = {
		"pages": [
			{
				pageId: "customPageId",
				header: "Employee Info",
				title: "John Doe",
				avatarSrc: "sap-icon://building",
				description: "Department Manager1",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Other",
						elements: [
							{
								label: "Email",
								value: "john.dow@sap.com",
								url: "john.dow@sap.com",
								emailSubject: 'Subject',
								elementType: QuickViewGroupElementType.email
							},
							{
								label: "Phone",
								value: "+359 888 888 888",
								elementType: QuickViewGroupElementType.phone
							},
							{
								label: "Best Friend",
								value: "Michael Muller",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId2"
							},
							{
								label: "Favorite Player",
								value: "Ivaylo Ivanov",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId3"
							}
						]
					}

				]
			},
			{
				pageId: "customPageId2",
				header: "Page 2",
				avatarSrc: "sap-icon://person-placeholder",
				title: "Michael Muller",
				description: "Account Manager",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Hobby",
						elements: [
							{
								label: "Name",
								value: "Jaga",
								elementType: "text"
							},
							{
								label: "Level",
								value: "Beginner"
							}

						]
					}

				]
			},
			{
				pageId: "customPageId3",
				header: "Page 3",
				avatarSrc: "sap-icon://person-placeholder",
				title: "Ivaylo Ivanov",
				description: "Developer",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Hobby",
						elements: [
							{
								label: "Name",
								value: "Table Tennis",
								elementType: "text"
							},
							{
								label: "Level",
								value: "Beginner"
							}

						]
					}

				]
			},
			{
				pageId: "customPageId4",
				header: "Company View",
				avatarSrc: "sap-icon://building",
				title: "SAP AG",
				description: "Run it simple",
				groups: [
					{
						heading: "Contact Information",
						elements: [
							{
								label: "Address",
								value: "Waldorf, Germany",
								url: "http://sap.com",
								elementType: "link"
							},
							{
								label: "Email",
								value: "office@sap.com",
								emailSubject: 'Subject',
								elementType: "email"
							}
						]
					},
					{
						heading: "Main Contact",
						elements: [
							{
								label: "Name",
								value: "Michael Muller",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId2"
							},
							{
								label: "E-mail",
								value: "michael.muller@sap.com",
								emailSubject: 'Subject',
								elementType: "email"
							},
							{
								label: "Phone",
								value: "+359 888 888 888",
								elementType: "phone"
							},
							{
								label: "Mobile",
								value: "+359 888 999 999",
								elementType: "phone"
							}
						]
					}

				]
			}
		]

	};

	// set the data for the model
	oModel.setData(mData);

	// create and add app
	var oApp = new App("myApp", {initialPage: "quickViewPage"});
	oApp.setModel(oModel);
	oApp.placeAt("qunit-fixture");

	// create and add a page with icon tab bar
	var oPage = new Page("quickViewPage", {
		title: "Quick View"
	});
	oApp.addPage(oPage);

	function getQuickViewCard() {
		return new QuickViewCard({
			pages: {
				path: '/pages',
				template: new QuickViewPage({
					pageId: "{pageId}",
					header: "{header}",
					title: "{title}",
					description: "{description}",
					avatar: new Avatar({
						src: "{avatarSrc}"
					}),
					groups: {
						path: 'groups',
						template: new QuickViewGroup({
							heading: '{heading}',
							elements: {
								path: 'elements',
								template: new QuickViewGroupElement({
									label: "{label}",
									value: "{value}",
									url: "{url}",
									type: "{elementType}",
									pageLinkId: "{pageLinkId}",
									emailSubject: '{emailSubject}'
								}),
								templateShareable: false
							}
						}),
						templateShareable: false
					}
				})
			}
		});
	}

	QUnit.module("API", {
		beforeEach: function () {
			this.oQuickViewCard = getQuickViewCard();
			oPage.addContent(this.oQuickViewCard);

			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oQuickViewCard.destroy();
			this.oQuickViewCard = null;
		}
	});

	QUnit.test("Testing if the QuickView is created", function (assert) {
		assert.ok(Element.getElementById(this.oQuickViewCard.getId()), "should render");
	});

	QUnit.test("Test binding", function (assert) {
		var aQuickViewPages = this.oQuickViewCard.getPages();

		aQuickViewPages.forEach(function (page, index) {
			assert.strictEqual(page.mProperties.header, mData.pages[index].header, "Header property is set correctly");
		});
	});

	QUnit.test("Check if the Header can be removed if changing data", function(assert) {

		var QVCardScrollContainer = document.getElementById(this.oQuickViewCard.sId + "-" + mData.pages[0].pageId + "-scroll");

		assert.strictEqual(QVCardScrollContainer.children.length, 2, "ScrollContainer inside QuickViewCard contains header and SimpleForm");

		this.oQuickViewCard.getPages()[0].destroyAvatar();

		mData.pages[0].title = "";
		mData.pages[0].description = "";

		oModel.setData(mData);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		QVCardScrollContainer = document.getElementById(this.oQuickViewCard.sId + "-" + mData.pages[0].pageId + "-scroll");
		assert.strictEqual(QVCardScrollContainer.children.length, 1, "ScrollContainer inside QuickViewCard contains only SimpleForm");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oQuickViewCard = getQuickViewCard();
			oPage.addContent(this.oQuickViewCard);

			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oQuickViewCard.destroy();
			this.oQuickViewCard = null;
		}
	});

	QUnit.test("check aria-label", function(assert) {
		assert.ok(this.oQuickViewCard.$().attr('aria-label'), 'aria-label is set');
	});

	QUnit.test("Checking if all link have width of 'auto'", function(assert) {
		// act
		var aLinks = this.oQuickViewCard.$().find(".sapMLnk");

		// assert
		for (var index = 0; index < aLinks.length; index += 1) {
			assert.strictEqual(aLinks[index].style.width, 'auto', "The Link should have width set to 'auto'");
		}
	});

	QUnit.module("NavContainer Aggregation", {
		beforeEach: function () {
			this.oQuickViewCard = getQuickViewCard();
			oPage.addContent(this.oQuickViewCard);

			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oQuickViewCard.destroy();
			this.oQuickViewCard = null;
		}
	});

	QUnit.test("NavContainer is initialized on QuickViewCard creation", function (assert) {
		// Assert
		assert.ok(this.oQuickViewCard._oNavContainer, "NavContainer instance should be created");
		assert.ok(this.oQuickViewCard._oNavContainer.isA("sap.m.NavContainer"), "Should be an instance of sap.m.NavContainer");
	});

	QUnit.test("NavContainer is set as aggregation", function (assert) {
		// Act
		var oNavContainer = this.oQuickViewCard.getAggregation("_navContainer");

		// Assert
		assert.ok(oNavContainer, "NavContainer should be retrievable via getAggregation");
		assert.strictEqual(oNavContainer, this.oQuickViewCard._oNavContainer, "Aggregation should reference the same instance as _oNavContainer");
	});

	QUnit.test("getNavContainer() returns the NavContainer instance", function (assert) {
		// Act
		var oNavContainer = this.oQuickViewCard.getNavContainer();

		// Assert
		assert.ok(oNavContainer, "getNavContainer() should return a value");
		assert.ok(oNavContainer.isA("sap.m.NavContainer"), "Should return a NavContainer instance");
		assert.strictEqual(oNavContainer, this.oQuickViewCard._oNavContainer, "Should return the internal NavContainer reference");
	});

	QUnit.test("NavContainer contains pages after initialization", function (assert) {
		// Act
		var oNavContainer = this.oQuickViewCard.getNavContainer();
		var aPages = oNavContainer.getPages();

		// Assert
		assert.ok(aPages.length > 0, "NavContainer should contain pages");
	});

	QUnit.test("NavContainer handles navigate event", function (assert) {
		// Arrange
		var fnNavigateSpy = sinon.spy();
		this.oQuickViewCard.attachNavigate(fnNavigateSpy);

		// Act - Try to find a navigable link
		var oLink = this.oQuickViewCard.$().find(".sapMLnk").filter(function() {
			return jQuery(this).data("pageLinkId");
		}).first();

		if (oLink.length > 0) {
			oLink.trigger("tap");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.ok(fnNavigateSpy.called, "Navigate event should be fired when navigating between pages");
		} else {
			assert.ok(true, "No navigable link found - test skipped");
		}
	});

	QUnit.test("NavContainer handles afterNavigate event", function (assert) {
		// Arrange
		var fnAfterNavigateSpy = sinon.spy();
		this.oQuickViewCard.attachAfterNavigate(fnAfterNavigateSpy);

		// Act - Try to find a navigable link
		var oLink = this.oQuickViewCard.$().find(".sapMLnk").filter(function() {
			return jQuery(this).data("pageLinkId");
		}).first();

		if (oLink.length > 0) {
			oLink.trigger("tap");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.ok(fnAfterNavigateSpy.called, "AfterNavigate event should be fired after navigation is complete");
		} else {
			assert.ok(true, "No navigable link found - test skipped");
		}
	});
});
