sap.ui.define([
	"sap/ui/core/util/MockServer",
	"./EmployeesDatabase"
], function (MockServer, EmployeesDatabase) {
	"use strict";

	let oMockServer;

	function initMockServer() {
		oMockServer = new MockServer({
			rootUri: "/employees"
		});

		const aRequests = oMockServer.getRequests();

		aRequests.push({
			method: "GET",
			path: ".*",
			response: function (oXhr) {

				if (/\/([0-9]+)/.test(oXhr.url)) {
					const employeeId = /\/([0-9]+)/.exec(oXhr.url)[1];
					const employee = EmployeesDatabase.getById(employeeId);

					if (employee) {
						oXhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({ employee: employee }));
					} else {
						oXhr.respond(404, null, "Employee not found.");
					}

					return;
				}

				oXhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({ employees: EmployeesDatabase.getData() }));
			}
		});

		// update employee
		aRequests.push({
			method: "PUT",
			path: "\/edit\/([0-9]+)",
			response: function (oXhr) {
				const body = JSON.parse(oXhr.requestBody);
				const employeeId = /\/([0-9]+)/.exec(oXhr.url)[1];
				if (EmployeesDatabase.edit(employeeId, body)) {
					oXhr.respond(200, null, "Employee updated successfully.");
				} else {
					oXhr.respond(404, null, "Employee not found.");
				}
			}
		});

		oMockServer.setRequests(aRequests);
		oMockServer.start();
	}

	const oMockServerInterface = {
		_pInit: null,

		init: function () {
			this._pInit = this._pInit || EmployeesDatabase.init()
				.then(initMockServer);

			return this._pInit;
		},

		destroy: function () {
			if (!oMockServer) {
				return;
			}

			oMockServer.destroy();
			oMockServer = null;
			this._pInit = null;
		}
	};

	return oMockServerInterface;
});
