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
	let iLastUsedId = 500000001;

	function SandboxModel(mParameters) {
		return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, {
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {},
			aRegExps : [{
				regExp : /^GET [\w\/]+\/SalesOrderList\?/,
				response : {buildResponse : buildGetCollectionResponse}
			}, {
				regExp : /^POST [\w\/]+\/SalesOrderList/,
				response : {buildResponse : buildPostResponse}
			}, {
				regExp : /^GET [\w\/]+\/SalesOrderList\('([^']*)'\)/,
				response : {buildResponse : buildGetSingleResponse}
			}, {
				regExp : /^PATCH [\w\/]+\/SalesOrderList\('([^']*)'\)$/,
				response : {buildResponse : buildPatchResponse}
			}, {
				regExp : /^DELETE [\w\/]+\/SalesOrderList\('([^']*)'\)$/,
				response : {buildResponse : buildDeleteResponse, code : 204}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/SimpleNonDraft/data"
		});
	}

	/**
	 * Builds a response for a GET request on the "SalesOrderList" collection. The current state of
	 * aData is evaluated on every call so that a refresh reflects entities that were created,
	 * patched, or deleted in the meantime. A static response object cannot be used here because the
	 * sandbox serializes it once at setup time and would ignore all later mutations of aData.
	 *
	 * @param {string[]} _aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildGetCollectionResponse(_aMatches, oResponse) {
		oResponse.message = JSON.stringify({value : aData});
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

		iLastUsedId += 1;
		const oSalesOrder = {
			BuyerID : oRequestBody.BuyerID,
			CreatedAt : new Date().toISOString(),
			CurrencyCode : oRequestBody.CurrencyCode ?? "EUR",
			GrossAmount : "0.00",
			LifecycleStatusDesc : "New",
			Note : oRequestBody.Note ?? "",
			SalesOrderID : "0" + iLastUsedId
		};
		aData.push(oSalesOrder);
		oResponse.message = JSON.stringify(oSalesOrder);

		oSalesOrder.SO_2_BP = {
			BusinessPartnerID : oSalesOrder.BuyerID,
			CompanyName : mIdToCompanyName[oSalesOrder.BuyerID]
		};
	}

	/**
	 * Builds a response for a GET request on a specific "SalesOrder" instance addressed by its key
	 * predicate. The OData V4 model sends this request to read data not included in the POST
	 * response. The entity is looked up in aData where it was stored by buildPostResponse.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildGetSingleResponse(aMatches, oResponse) {
		const sSalesOrderID = aMatches[1];
		oResponse.message = JSON.stringify(aData.find((oRow) => oRow.SalesOrderID === sSalesOrderID));
	}

	/**
	 * Builds a response for a PATCH request on a specific "SalesOrder" instance addressed by its key
	 * predicate. The matching entity in aData is updated with the request payload so that the change
	 * survives a later refresh (GET on the collection).
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 * @param {object} oRequest - Request object to get PATCH body from
	 */
	function buildPatchResponse(aMatches, oResponse, oRequest) {
		const sSalesOrderID = aMatches[1];
		const oRequestBody = JSON.parse(oRequest.requestBody);
		const oEntity = aData.find((oRow) => oRow.SalesOrderID === sSalesOrderID);

		Object.assign(oEntity, oRequestBody);
		oResponse.message = JSON.stringify(oEntity);
	}

	/**
	 * Builds a response for a DELETE request on a specific "SalesOrder" instance by removing the
	 * matching entity from the mocked back-end data so that it does not reappear on refresh. No
	 * response body is built here: the fixture declares <code>code : 204</code> (No Content), which
	 * is the standard OData response for a successful DELETE, so the response object is not needed.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 */
	function buildDeleteResponse(aMatches) {
		const sSalesOrderID = aMatches[1];
		const iIndex = aData.findIndex((oRow) => oRow.SalesOrderID === sSalesOrderID);

		if (iIndex >= 0) {
			aData.splice(iIndex, 1);
		}
	}

	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
