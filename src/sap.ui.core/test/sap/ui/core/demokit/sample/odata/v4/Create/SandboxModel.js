/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	let oCurrentSalesOrder;
	const aData = [{
		BuyerID : "0100000000",
		CreatedAt : "2025-10-28T12:00:00Z",
		CurrencyCode : "EUR",
		GrossAmount : "25867.03",
		LifecycleStatusDesc : "New",
		Note : "EPM DG: SO ID 0500000000 Deliver as fast as possible",
		SalesOrderID : "0500000000",
		SO_2_BP : {
			BusinessPartnerID : "0100000000",
			CompanyName : "SAP"
		}
	}, {
		BuyerID : "0100000004",
		CreatedAt : "2025-10-28T12:00:00Z",
		CurrencyCode : "USD",
		GrossAmount : "250.73",
		LifecycleStatusDesc : "New",
		Note : "EPM DG: SO ID 0500000001 Deliver as fast as possible",
		SalesOrderID : "0500000001",
		SO_2_BP : {
			BusinessPartnerID : "0100000004",
			CompanyName : "Panorama Studios"
		}
	}];
	const mIdToCompanyName = {
		"0100000000" : "SAP",
		"0100000001" : "Becker Berlin",
		"0100000002" : "DelBont Industries",
		"0100000003" : "Talpa",
		"0100000004" : "Panorama Studios"
	};
	let iInitialId = 500000001;

	function SandboxModel(mParameters) {
		return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, {
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {},
			aRegExps : [{
				regExp : /^GET [\w\/]+\/SalesOrderList\?/,
				response : {message : {value : aData}}
			}, {
				regExp : /^POST [\w\/]+\/SalesOrderList/,
				response : {buildResponse : buildPostResponse}
			}, {
				regExp : /^GET [\w\/]+\/SalesOrderList\(/,
				response : {buildResponse : buildGetSingleResponse}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/Create/data"
		});
	}

	/**
	 * Builds a response for any POST request on the "SalesOrderList" collection.
	 *
	 * @param {string[]} _aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 * @param {object} oRequest - Request object to get POST body from
	 */
	function buildPostResponse(_aMatches, oResponse, oRequest) {
		const oRequestBody = JSON.parse(oRequest.requestBody);
		if (!(oRequestBody.BuyerID in mIdToCompanyName)) {
			const oError
				= new Error(`Business Partner with key '${oRequestBody.BuyerID}' does not exist`);
			oError.target = "BuyerID";
			throw oError;
		}

		iInitialId += 1;
		oCurrentSalesOrder = {
			BuyerID : oRequestBody.BuyerID,
			CreatedAt : new Date().toISOString(),
			CurrencyCode : oRequestBody.CurrencyCode ?? "EUR",
			GrossAmount : "0.00",
			LifecycleStatusDesc : "New",
			Note : oRequestBody.Note ?? "",
			SalesOrderID : "0" + iInitialId
		};
		oResponse.message = JSON.stringify(oCurrentSalesOrder);

		oCurrentSalesOrder.SO_2_BP = {
			BusinessPartnerID : oCurrentSalesOrder.BuyerID,
			CompanyName : mIdToCompanyName[oCurrentSalesOrder.BuyerID]
		};
	}

	/**
	 * Builds a response for a GET request on a specific "SalesOrder" instance which was created by
	 * the previous POST.
	 *
	 * @param {string[]} _aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildGetSingleResponse(_aMatches, oResponse) {
		oResponse.message = JSON.stringify(oCurrentSalesOrder);
	}

	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
