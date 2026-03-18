sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.BoundFilters.FilterBar.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getModel().setData({teamMembers: [
				{firstName: "John", lastName: "Doe", age: 28, department: "Development", location: "Walldorf"},
				{firstName: "Jane", lastName: "Smith", age: 34, department: "Consulting", location: "New York"},
				{firstName: "Michael", lastName: "Johnson", age: 45, department: "Management", location: "Bangalore"},
				{firstName: "Emily", lastName: "Davis", age: 29, department: "Development", location: "Sydney"},
				{firstName: "Chris", lastName: "Brown", age: 38, department: "Consulting", location: "Berlin"},
				{firstName: "Jessica", lastName: "Williams", age: 41, department: "Development", location: "Walldorf"},
				{firstName: "David", lastName: "Jones", age: 52, department: "Management", location: "New York"},
				{firstName: "Sarah", lastName: "Miller", age: 27, department: "Development", location: "Bangalore"},
				{firstName: "Daniel", lastName: "Wilson", age: 33, department: "Consulting", location: "Sydney"},
				{firstName: "Laura", lastName: "Moore", age: 24, department: "Development", location: "Berlin"},
				{firstName: "James", lastName: "Taylor", age: 36, department: "Consulting", location: "Walldorf"},
				{firstName: "Emma", lastName: "Anderson", age: 30, department: "Development", location: "New York"},
				{firstName: "Robert", lastName: "Thomas", age: 50, department: "Consulting", location: "Bangalore"},
				{firstName: "Olivia", lastName: "Jackson", age: 22, department: "Development", location: "Sydney"},
				{firstName: "William", lastName: "White", age: 47, department: "Consulting", location: "Berlin"}
			]});
		}
	});
});
