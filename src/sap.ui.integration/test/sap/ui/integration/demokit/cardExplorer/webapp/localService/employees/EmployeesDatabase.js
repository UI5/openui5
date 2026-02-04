sap.ui.define([
	"sap/ui/thirdparty/jquery"
], function (jQuery) {
	"use strict";

	let aEmployees = null;

	function loadData() {
		return new Promise(function (resolve, reject) {
			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/employees/employees.json"), {
				dataType: "json"
			})
				.done(function (data) {
					aEmployees = data.employees;
					resolve();
				})
				.fail(function (jqXHR, sTextStatus, sError) {
					reject(sError);
				});
		});
	}

	return {
		init: function () {
			this._pLoadData = this._pLoadData || loadData();

			return this._pLoadData.then(function () {
				return aEmployees;
			});
		},

		getData: function () {
			return aEmployees;
		},

		getById: function (employeeId) {
			return aEmployees.find(function (emp) {
                return emp.EmployeeID === employeeId;
            });
		},

		edit: function(employeeId, edits) {
			const employee = aEmployees.find(function (emp) {
				return emp.EmployeeID === employeeId;
			});

			if (employee) {
				Object.keys(edits).forEach(function (key) {
					if (key) {
						aEmployees[employeeId][key] = edits[key];
					}
				});

				return true;
			}

			return false;
		}
	};
});