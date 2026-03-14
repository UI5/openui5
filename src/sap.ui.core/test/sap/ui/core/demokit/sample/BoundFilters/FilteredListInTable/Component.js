sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.BoundFilters.FilteredListInTable.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getModel().setData({
				customers: [
					{ key: 1, name: "TechCorp Solutions", region: "Americas", accountManagerId: 1 },
					{ key: 4, name: "Innovation Systems Inc", region: "Americas", accountManagerId: 1 },
					{ key: 2, name: "Global Industries Ltd", region: "EMEA", accountManagerId: 6 },
					{ key: 3, name: "Asia Pacific Ventures", region: "APJ", accountManagerId: 10 },
					{ key: 8, name: "Continental Solutions", region: "EMEA", accountManagerId: 6 },
					{ key: 5, name: "European Tech Group", region: "EMEA", accountManagerId: 8 },
					{ key: 6, name: "Pacific Rim Enterprises", region: "APJ", accountManagerId: 10 },
					{ key: 7, name: "Digital Dynamics Corp", region: "Americas", accountManagerId: 3 },
					{ key: 10, name: "Atlantic Technologies", region: "Americas", accountManagerId: 3 },
					{ key: 9, name: "Eastern Markets Ltd", region: "APJ", accountManagerId: 11 },
					{ key: 11, name: "Nordic Innovations", region: "EMEA", accountManagerId: 8 },
					{ key: 12, name: "Southeast Asia Holdings", region: "APJ", accountManagerId: 11 },
					{ key: 13, name: "North American Systems", region: "Americas", accountManagerId: 5 },
					{ key: 14, name: "Mediterranean Group", region: "EMEA", accountManagerId: 7 },
					{ key: 15, name: "Indo-Pacific Corp", region: "APJ", accountManagerId: 12 },
					{ key: 16, name: "Western Digital Solutions", region: "Americas", accountManagerId: 2 },
					{ key: 17, name: "Alpine Technologies", region: "EMEA", accountManagerId: 7 },
					{ key: 18, name: "Oceanic Enterprises", region: "APJ", accountManagerId: 12 },
					{ key: 19, name: "Great Lakes Industries", region: "Americas", accountManagerId: 2 },
					{ key: 20, name: "Baltic Solutions Ltd", region: "EMEA", accountManagerId: 8 }
				],
				accountManagers: [
					{ id: 1, firstName: "John", lastName: "Smith", region: "Americas" },
					{ id: 2, firstName: "Sarah", lastName: "Johnson", region: "Americas" },
					{ id: 3, firstName: "Mike", lastName: "Williams", region: "Americas" },
					{ id: 4, firstName: "Jennifer", lastName: "Brown", region: "Americas" },
					{ id: 5, firstName: "David", lastName: "Jones", region: "Americas" },
					{ id: 6, firstName: "Emma", lastName: "Anderson", region: "EMEA" },
					{ id: 7, firstName: "Lucas", lastName: "Mueller", region: "EMEA" },
					{ id: 8, firstName: "Sophie", lastName: "Dubois", region: "EMEA" },
					{ id: 9, firstName: "Marco", lastName: "Rossi", region: "EMEA" },
					{ id: 10, firstName: "Yuki", lastName: "Tanaka", region: "APJ" },
					{ id: 11, firstName: "Raj", lastName: "Patel", region: "APJ" },
					{ id: 12, firstName: "Li", lastName: "Chen", region: "APJ" },
					{ id: 13, firstName: "Priya", lastName: "Sharma", region: "APJ" }
				]
			});
		}
	});
});
