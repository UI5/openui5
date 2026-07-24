/* eslint-disable no-console */
/* @ts-nocheck */
sap.ui.define([
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/DisplayListItem",
	"sap/m/ObjectListItem",
	"sap/m/InputListItem",
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/ListItemAction",
	"sap/m/Tree",
	"sap/m/StandardTreeItem",
	"sap/m/CustomTreeItem",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/CheckBox",
	"sap/m/RadioButton",
	"sap/m/Switch",
	"sap/m/Slider",
	"sap/m/StepInput",
	"sap/m/DatePicker",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/ComboBox",
	"sap/m/SelectList",
	"sap/ui/core/Item",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter"
], function(
	List, StandardListItem, DisplayListItem, ObjectListItem, InputListItem,
	Table, ColumnListItem, Column, ListItemAction, Tree, StandardTreeItem, CustomTreeItem, Text, Button, Input, CheckBox,
	RadioButton, Switch, Slider, StepInput, DatePicker, SegmentedButton, SegmentedButtonItem,
	HBox, VBox, ComboBox, SelectList, Item, mLibrary, JSONModel, Sorter
) {
	"use strict";

	const PopinDisplay = mLibrary.PopinDisplay;
	const ListItemActionType = mLibrary.ListItemActionType;
	const ScreenSize = mLibrary.ScreenSize;

	// Always returns 4 actions (Edit, Delete, Approve, Share). The first
	// iVisibleCount are visible; the rest are invisible. Keeps row layout
	// stable across the matrix while letting tests assert "N actions".
	function buildActions(iVisibleCount) {
		const iVisible = Math.max(0, Math.min(4, iVisibleCount || 0));
		const aSpecs = [
			{ type: ListItemActionType.Edit },
			{ type: ListItemActionType.Delete },
			{ type: ListItemActionType.Custom, text: "Approve", icon: "sap-icon://accept" },
			{ type: ListItemActionType.Custom, text: "Share",   icon: "sap-icon://share" }
		];
		return aSpecs.map((oSpec, i) => new ListItemAction({
			type: oSpec.type,
			text: oSpec.text,
			icon: oSpec.icon,
			visible: i < iVisible
		}));
	}

	// "mode" is a property of the list, not of the individual item, so we do
	// not vary it per row. Each section sets one mode for the whole container.
	// Realistic order-management content so a SR retest can judge comprehensibility.
	const STATE_MATRIX = [
		{
			title: "PO-4837 · Acme GmbH",
			description: "€ 12,480 · delivery 12 Jul",
			info: "", infoState: "None",
			highlight: "None", highlightText: "",
			unread: false, counter: 0, selected: false, type: "Inactive", actions: 0
		},
		{
			title: "PO-4841 · Northwind Traders",
			description: "€ 3,120 · delivery 15 Jul · payment released",
			info: "Confirmed", infoState: "Success",
			highlight: "Success", highlightText: "",
			unread: true, counter: 3, selected: true, type: "Inactive", actions: 4
		},
		{
			title: "PO-4855 · Globex Corp",
			description: "€ 890 · last sync failed",
			info: "", infoState: "None",
			highlight: "Error", highlightText: "",
			unread: false, counter: 0, selected: false, type: "Active", actions: 2
		},
		{
			title: "PO-4859 · Initech",
			description: "€ 2,470 · awaiting VAT-ID review",
			info: "Pending", infoState: "Warning",
			highlight: "Warning", highlightText: "Urgent",
			unread: true, counter: 0, selected: false, type: "Navigation", actions: 0
		},
		{
			title: "PO-4862 · Umbrella Ltd",
			description: "€ 6,900 · needs approval",
			info: "", infoState: "None",
			highlight: "Information", highlightText: "",
			unread: false, counter: 0, selected: false, type: "Inactive", actions: 3
		},
		{
			title: "PO-4870 · Stark Industries",
			description: "€ 540 · archived",
			info: "", infoState: "None",
			highlight: "None", highlightText: "",
			unread: false, counter: 0, selected: false, type: "Inactive", actions: 0
		},
		{
			title: "PO-4874 · Wayne Enterprises",
			description: "€ 15,200 · view details or edit",
			info: "", infoState: "None",
			highlight: "None", highlightText: "",
			unread: false, counter: 0, selected: true, type: "DetailAndActive", actions: 2
		}
	];

	// ------------------------------------------------------------------
	// Live preview helpers
	// ------------------------------------------------------------------
	function resolveText(sId) {
		if (!sId) {
			return "";
		}
		const oEl = document.getElementById(sId);
		return oEl ? (oEl.textContent || oEl.innerText || "").trim() : "[#" + sId + " not found]";
	}

	function describeAria(oEl) {
		if (!oEl) {
			return "(no DOM)";
		}
		const sLB = oEl.getAttribute("aria-labelledby") || "";
		const sDB = oEl.getAttribute("aria-describedby") || "";
		const sRole = oEl.getAttribute("role") || "";
		const sRoleDesc = oEl.getAttribute("aria-roledescription") || "";
		const aLBText = sLB.split(/\s+/).filter(Boolean).map(resolveText);
		const aDBText = sDB.split(/\s+/).filter(Boolean).map(resolveText);
		const aNative = [
			"aria-selected", "aria-current", "aria-expanded", "aria-level",
			"aria-posinset", "aria-setsize", "aria-rowindex", "aria-rowcount",
			"aria-multiselectable", "aria-activedescendant"
		].flatMap((sAttr) => {
			return oEl.hasAttribute(sAttr) ? [sAttr + "=" + oEl.getAttribute(sAttr)] : [];
		});

		const aLines = [
			"role            : " + sRole,
			"roledescription : " + sRoleDesc,
			"labelledby      : [" + sLB + "]",
			"  resolved      : " + aLBText.join("  |  "),
			"describedby     : [" + sDB + "]",
			"  resolved      : " + aDBText.join("  |  "),
			"native ARIA     : " + (aNative.join(", ") || "(none)")
		];
		return aLines.join("\n");
	}

	// Find the navigation root for a focused list item — the <ul>/<table>/<div>
	// rendered by ListBaseRenderer.renderListStartAttributes that carries the
	// list-level ARIA. We walk up to either a role=list|listbox|tree|grid
	// element or to a class hint added by the renderer (sapMListUl).
	const LIST_ROOT_ROLES = { list: 1, listbox: 1, tree: 1, grid: 1 };
	function findListRoot(oFromEl) {
		let oEl = oFromEl;
		while (oEl && oEl !== document.body) {
			if (LIST_ROOT_ROLES[oEl.getAttribute?.("role")] || oEl.classList?.contains("sapMListUl")) {
				return oEl;
			}
			oEl = oEl.parentNode;
		}
		return null;
	}

	function buildLivePreview() {
		const oRow = document.createElement("div");
		oRow.className = "poc-preview-row";

		const oItemPane = document.createElement("pre");
		oItemPane.className = "poc-preview";
		oItemPane.id = "poc-live-preview-item";
		oItemPane.textContent = "List item — focus a list item to inspect its live ARIA composition.";

		const oRootPane = document.createElement("pre");
		oRootPane.className = "poc-preview";
		oRootPane.id = "poc-live-preview-root";
		oRootPane.textContent = "List root — focus a list item to inspect its container ARIA.";

		oRow.appendChild(oItemPane);
		oRow.appendChild(oRootPane);
		document.body.insertBefore(oRow, document.getElementById("content"));

		// SelectList renders <li class="sapMSelectListItem"> (role=option) which
		// is not a ListItemBase, so .sapMLIB doesn't match. Accept any common
		// list-item role as a generic fallback.
		const LIST_ITEM_ROLES = { option: 1, row: 1, treeitem: 1, listitem: 1 };

		document.addEventListener("focusin", (e) => {
			let oTarget = e.target;
			while (oTarget && oTarget !== document.body) {
				if (oTarget.classList?.contains("sapMLIB")
					|| oTarget.classList?.contains("sapMSelectListItemBase")
					|| LIST_ITEM_ROLES[oTarget.getAttribute?.("role")]) {
					oItemPane.textContent = "List item\n---------\n" + describeAria(oTarget);
					const oRoot = findListRoot(oTarget);
					oRootPane.textContent = oRoot
						? "List root\n---------\n" + describeAria(oRoot)
						: "List root — (none found)";
					return;
				}
				oTarget = oTarget.parentNode;
			}
		});
	}

	let iSectionId = 0;
	function newSection() {
		const sId = "poc-sec-" + (++iSectionId);
		const oDiv = document.createElement("div");
		oDiv.id = sId;
		document.getElementById("content").appendChild(oDiv);
		return sId;
	}

	// ------------------------------------------------------------------
	// Factories
	// ------------------------------------------------------------------
	function makeStandardListItem(oRow) {
		return new StandardListItem({
			title: oRow.title,
			description: oRow.description,
			info: oRow.info,
			infoState: oRow.infoState,
			highlight: oRow.highlight,
			highlightText: oRow.highlightText,
			counter: oRow.counter,
			selected: oRow.selected,
			type: oRow.type,
			unread: !!oRow.unread,
			actions: buildActions(oRow.actions)
		});
	}

	function makeColumnListItem(oRow) {
		return new ColumnListItem({
			highlight: oRow.highlight,
			highlightText: oRow.highlightText,
			selected: oRow.selected,
			type: oRow.type,
			unread: !!oRow.unread,
			actions: buildActions(oRow.actions),
			cells: [
				new Text({ text: oRow.title }),
				new Text({ text: oRow.description || "" }),
				new Text({ text: oRow.info || "" }),
				new Text({ text: String(oRow.counter) }),
				new Text({ text: oRow.selected ? "yes" : "no" })
			]
		});
	}

	// Parking-lot factory — sections 4/5 bind via a model template, but keep
	// this around for quick rewrites to a hand-built tree.
	function makeStandardTreeItem(oRow) {
		return new StandardTreeItem({
			title: oRow.title,
			highlight: oRow.highlight,
			highlightText: oRow.highlightText,
			counter: oRow.counter,
			selected: oRow.selected,
			type: oRow.type,
			unread: !!oRow.unread
		});
	}
	makeStandardTreeItem.unused = true;

	function makeCustomTreeItem(oRow) {
		return new CustomTreeItem({
			highlight: oRow.highlight,
			highlightText: oRow.highlightText,
			counter: oRow.counter,
			selected: oRow.selected,
			type: oRow.type,
			unread: !!oRow.unread,
			content: [
				new Text({ text: oRow.title }),
				new Text({ text: oRow.description || "" })
			]
		});
	}
	makeCustomTreeItem.unused = true;

	function makeObjectListItem(oRow) {
		return new ObjectListItem({
			title: oRow.title,
			intro: oRow.description,
			number: String(oRow.counter || 0),
			numberUnit: "EUR",
			highlight: oRow.highlight,
			highlightText: oRow.highlightText,
			selected: oRow.selected,
			type: oRow.type,
			unread: !!oRow.unread
		});
	}

	function makeDisplayListItem(oRow) {
		return new DisplayListItem({
			label: oRow.title,
			value: oRow.description || oRow.info || "(no value)",
			highlight: oRow.highlight,
			highlightText: oRow.highlightText,
			selected: oRow.selected,
			type: oRow.type,
			unread: !!oRow.unread
		});
	}

	// One control per matrix row so InputListItem demonstrates the full
	// "arbitrary controls in content" surface that the focus-time strategy
	// needs to support. Uses the framework default InputListItem layout.
	function makeContentControlForRow(iIdx, oRow) {
		switch (iIdx) {
			case 0: return new Input({ value: oRow.description || "", placeholder: "Type text…" });
			case 1: return new CheckBox({ text: "Enable feature", selected: true });
			case 2: return new HBox({ items: [
				new RadioButton({ groupName: "poc-rg-" + oRow.title, text: "Low", selected: true }),
				new RadioButton({ groupName: "poc-rg-" + oRow.title, text: "High" })
			] });
			case 3: return new Switch({ state: true });
			case 4: return new Slider({ value: 30, min: 0, max: 100 });
			case 5: return new StepInput({ value: 5, min: 0, max: 100 });
			case 6: return new SegmentedButton({
				selectedKey: "B",
				items: [
					new SegmentedButtonItem({ key: "A", text: "A" }),
					new SegmentedButtonItem({ key: "B", text: "B" }),
					new SegmentedButtonItem({ key: "C", text: "C" })
				]
			});
			default: return new DatePicker({ value: "" });
		}
	}

	function makeInputListItem(oRow, iIdx) {
		return new InputListItem({
			label: oRow.title,
			highlight: oRow.highlight,
			highlightText: oRow.highlightText,
			selected: oRow.selected,
			type: oRow.type,
			unread: !!oRow.unread,
			content: [makeContentControlForRow(iIdx || 0, oRow)]
		});
	}

	function wrapInList(aItems, sListAriaRole) {
		const oList = new List({ mode: "MultiSelect", inset: true });
		oList.applyAriaRole(sListAriaRole || "list");
		aItems.forEach((oItem) => oList.addItem(oItem));
		return oList;
	}
	wrapInList.unused = true;

	// ------------------------------------------------------------------
	// Build all sections
	// ------------------------------------------------------------------
	function buildSection1() {
		// role="list" is the default; Section 11 has the dedicated
		// GroupHeaderListItem demo so no group header is injected here.
		const oList = new List({
			headerText: "1. StandardListItem in role=list (render-time)",
			mode: "MultiSelect", showUnread: true, inset: true, itemActionCount: 2
		});
		STATE_MATRIX.forEach((oRow) => oList.addItem(makeStandardListItem(oRow)));
		oList.placeAt(newSection());
	}

	function buildSection2() {
		// sap.m.SelectList does not subclass ListBase, so the new renderer hooks
		// don't apply — kept here so the SR can compare option-role behavior
		// against the migrated StandardListItem set in Section 1.
		// SelectList has no headerText; render the section label as a plain DOM
		// heading next to it.
		const sId = newSection();
		const oH = document.createElement("h2");
		oH.textContent = "10. sap.m.SelectList (role=listbox, option items , public API)";
		document.getElementById(sId).appendChild(oH);
		new SelectList({
			items: STATE_MATRIX.map((oRow) => new Item({ key: oRow.title, text: oRow.title }))
		}).placeAt(sId);
	}

	function buildSection3() {
		const oTable = new Table({
			headerText: "2. ColumnListItem (focus-time)",
			mode: "MultiSelect",
			showUnread: true,
			fixedLayout: true,
			inset: true,
			itemActionCount: 2,
			columns: [
				new Column({ header: new Text({ text: "Title" }) }),
				new Column({ header: new Text({ text: "Description" }) }),
				new Column({ demandPopin: true, popinDisplay: PopinDisplay.Inline, minScreenWidth: ScreenSize.Tablet,
					header: new Text({ text: "Info" }) }),
				new Column({ demandPopin: true, popinDisplay: PopinDisplay.Inline, minScreenWidth: ScreenSize.Desktop,
					header: new Text({ text: "Counter" }) }),
				new Column({ demandPopin: true, popinDisplay: PopinDisplay.Inline, minScreenWidth: ScreenSize.Desktop,
					header: new Text({ text: "Selected" }) })
			]
		});
		STATE_MATRIX.forEach((oRow) => oTable.addItem(makeColumnListItem(oRow)));
		oTable.placeAt(newSection());
	}

	function buildSection4() {
		const oTree = new Tree({
			headerText: "3. StandardTreeItem (render-time)",
			mode: "MultiSelect", showUnread: true, inset: true
		});
		// Flat list with one child each so the expand-toggle slot is occupied.
		const oModel = new JSONModel({
			nodes: STATE_MATRIX.map((oRow) => ({
				title: oRow.title, highlight: oRow.highlight,
				highlightText: oRow.highlightText, unread: !!oRow.unread,
				counter: oRow.counter, selected: !!oRow.selected, type: oRow.type,
				children: [
					{ title: oRow.title + " , child", highlight: "None",
						highlightText: "", unread: false, counter: 0,
						selected: false, type: "Inactive", children: [] }
				]
			}))
		});
		oTree.setModel(oModel);
		oTree.bindItems({
			path: "/nodes",
			template: new StandardTreeItem({
				title: "{title}",
				highlight: "{highlight}",
				highlightText: "{highlightText}",
				counter: "{counter}",
				selected: "{selected}",
				type: "{type}"
			}),
			parameters: { arrayNames: ["children"] }
		});
		oTree.placeAt(newSection());
	}

	function buildSection5() {
		const oTree = new Tree({
			headerText: "4. CustomTreeItem (focus-time)",
			mode: "MultiSelect", showUnread: true, inset: true
		});
		const oModel = new JSONModel({
			nodes: STATE_MATRIX.map((oRow) => ({
				title: oRow.title, description: oRow.description || "",
				highlight: oRow.highlight, highlightText: oRow.highlightText,
				unread: !!oRow.unread, counter: oRow.counter,
				selected: !!oRow.selected, type: oRow.type,
				children: [{
					title: oRow.title + " , child",
					description: "Nested",
					highlight: "None", highlightText: "",
					unread: false, counter: 0, selected: false, type: "Inactive",
					children: []
				}]
			}))
		});
		oTree.setModel(oModel);
		oTree.bindItems({
			path: "/nodes",
			template: new CustomTreeItem({
				highlight: "{highlight}",
				highlightText: "{highlightText}",
				counter: "{counter}",
				selected: "{selected}",
				type: "{type}",
				content: [
					new VBox({
						items: [
							new Button({ text: "{title}", icon: "sap-icon://edit" }),
							new Text({ text: "{description}" })
						]
					})
				]
			}),
			parameters: { arrayNames: ["children"] }
		});
		oTree.placeAt(newSection());
	}

	function buildSection6() {
		const oList = new List({
			headerText: "5. ObjectListItem (render-time)",
			mode: "MultiSelect", showUnread: true, inset: true
		});
		STATE_MATRIX.forEach((oRow) => oList.addItem(makeObjectListItem(oRow)));
		oList.placeAt(newSection());
	}

	function buildSection7() {
		const oList = new List({
			headerText: "6. DisplayListItem (render-time)",
			mode: "MultiSelect", showUnread: true, inset: true
		});
		STATE_MATRIX.forEach((oRow) => oList.addItem(makeDisplayListItem(oRow)));
		oList.placeAt(newSection());
	}

	function buildSection8() {
		const oList = new List({
			headerText: "7. InputListItem (focus-time)",
			mode: "MultiSelect", showUnread: true, inset: true
		});
		STATE_MATRIX.forEach((oRow, i) => oList.addItem(makeInputListItem(oRow, i)));
		oList.placeAt(newSection());
	}

	function buildSection9() {
		const oList = new List({
			headerText: "8. Mixed list , render-time + focus-time items coexisting",
			mode: "MultiSelect", showUnread: true, inset: true
		});
		STATE_MATRIX.forEach((oRow, i) => {
			oList.addItem(i % 2 === 0 ? makeStandardListItem(oRow) : makeInputListItem(oRow, i));
		});
		oList.placeAt(newSection());
	}

	function buildSection10() {
		// Real grouping via Sorter — the framework inserts the
		// GroupHeaderListItems and isGrouped() returns true, so the list
		// root advertises the "Grouped" describedby state.
		const oList = new List({
			headerText: "9. List with GroupHeaderListItems (render-time)",
			inset: true
		});

		oList.setModel(new JSONModel({
			cities: [
				{ country: "Germany", city: "Berlin",  description: "Capital",         population: "3.8M" },
				{ country: "Germany", city: "Hamburg", description: "Port city",       population: "1.9M" },
				{ country: "Germany", city: "Munich",  description: "Bavaria",         population: "1.5M" },
				{ country: "Japan",   city: "Tokyo",   description: "Capital",         population: "13.9M" },
				{ country: "Japan",   city: "Osaka",   description: "Kansai",          population: "2.7M" },
				{ country: "Japan",   city: "Kyoto",   description: "Ancient capital", population: "1.5M" }
			]
		}));

		oList.bindItems({
			path: "/cities",
			sorter: new Sorter({
				path: "country",
				descending: false,
				group: function(oContext) {
					return oContext.getProperty("country");
				}
			}),
			template: new StandardListItem({
				title: "{city}",
				description: "{description}",
				info: "{population}"
			})
		});

		oList.placeAt(newSection());
	}

	function buildSection11() {
		// ComboBox has no headerText; render the section label as a plain DOM
		// heading next to it.
		const sId = newSection();
		const oH = document.createElement("h2");
		oH.textContent = "11. ComboBox embedding sap.m.List , aria-activedescendant virtual-focus test";
		document.getElementById(sId).appendChild(oH);
		new ComboBox({
			placeholder: "Type to filter; arrow to navigate options",
			items: STATE_MATRIX.map((oRow) => new Item({ key: oRow.title, text: oRow.title }))
		}).placeAt(sId);
	}

	// ------------------------------------------------------------------
	// Boot
	// ------------------------------------------------------------------
	const oContent = document.getElementById("content");
	const oHeader = document.createElement("h1");
	oHeader.className = "poc-heading";
	oHeader.textContent = "Announcement Order POC, SR Testing";
	oContent.insertBefore(oHeader, oContent.firstChild);

	buildLivePreview();

	buildSection1();
	buildSection3();
	buildSection4();
	buildSection5();
	buildSection6();
	buildSection7();
	buildSection8();
	buildSection9();
	buildSection10(); // List with GroupHeaderListItems (slot 9)
	buildSection2();  // sap.m.SelectList (slot 10)
	buildSection11(); // ComboBox (slot 11)
});
