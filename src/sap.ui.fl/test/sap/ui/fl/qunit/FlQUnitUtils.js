sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils"
], function(
	merge,
	FlexState,
	Loader,
	Storage,
	StorageUtils
) {
	"use strict";

	var FlQUnitUtils = {};

	/**
	 * Stubs the function sap.ui.require. The aStubInformation property expects an object with the following properties:
	 * name: this path will be stubbed in the sap.ui.require. Can be a string (sync request) or array
	 * stub: the new return value for that path. Can be an object directly or an array in case of multiple paths
	 * error: only valid for async case. If set the error function is used instead of the success function
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {object[]} aStubInformation - Information about the needed stubs
	 * @returns {object} The stub
	 */
	FlQUnitUtils.stubSapUiRequire = function(sandbox, aStubInformation) {
		var oRequireStub = sandbox.stub(sap.ui, "require");
		aStubInformation.forEach(function(oStubInformation) {
			oRequireStub
			.withArgs(oStubInformation.name)
			.callsFake(function(sModuleName, fnSuccess, fnError) {
				// the function can be called synchronously, then there is no success / error function
				// and the stub has to be returned directly
				if (!fnSuccess) {
					return oStubInformation.stub;
				}
				if (oStubInformation.error) {
					fnError(oStubInformation.stub);
				} else {
					if (Array.isArray(oStubInformation.stub)) {
						fnSuccess(...oStubInformation.stub);
					}
					fnSuccess(oStubInformation.stub);
				}
			});
		});
		oRequireStub.callThrough();
		return oRequireStub;
	};

	/**
	 * Stubs the sap.ui.require function and calls the check function with every path that is requested.
	 * If that function returns true the call is stubbed and the passed stub is returned.
	 * Otherwise the original require function is called.
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {function} fnCheck - Check function
	 * @param {object} oStub - Stub to be returned by sap.ui.define
	 * @returns {object} The Stub
	 */
	FlQUnitUtils.stubSapUiRequireDynamically = function(sandbox, fnCheck, oStub) {
		var oRequireStub = sandbox.stub(sap.ui, "require");
		oRequireStub.callsFake(function(...aArgs) {
			const [vModuleName, fnSuccess] = aArgs;
			if (fnCheck(vModuleName)) {
				if (oStub) {
					fnSuccess(oStub);
				} else {
					fnSuccess();
				}
			} else {
				oRequireStub.wrappedMethod.apply(this, aArgs);
			}
		});
		return oRequireStub;
	};

	/**
	 * Returns a stub handler to be used with callsFake
	 * It will return a promise which will resolve after a timeout of 0
	 * This ensures that all microtasks like resolved promise handlers would be processed before
	 * and allows testing that the result is properly awaited
	 * Additionally it does not allow concurrent calls while the promise has not resolved
	 *
	 * @param {object} assert - QUnit Assert
	 * @param {any} [result] - Optional result to resolve with
	 * @returns {function} The stub function
	 */
	FlQUnitUtils.resolveWithDelayedCallWhichMustNotBeInParallel = function(assert, result) {
		var inProgress = false;
		return function() {
			return new Promise(function(resolve) {
				// Delay resolution to simulate a slow call
				assert.notOk(inProgress, "Should not do concurrent calls but wait for each other");
				inProgress = true;
				setTimeout(function() {
					inProgress = false;
					resolve(result);
				}, 0);
			});
		};
	};

	/**
	 * Stubs the Loader with the given data and initializes the FlexState with that data.
	 * The data has to be an object containing the necessary parts of the response (like changes, variants, ...)
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {string} sReference - Flex Reference
	 * @param {object} oData - Data that should be loaded
	 * @param {string} [sComponentId] - Component ID
	 */
	FlQUnitUtils.initializeFlexStateWithData = async function(sandbox, sReference, oData, sComponentId) {
		sandbox.stub(Storage, "loadFlexData").resolves(merge(StorageUtils.getEmptyFlexDataResponse(), oData || {}));
		sandbox.stub(Storage, "loadVariantsAuthors").resolves({});
		await FlexState.initialize({
			reference: sReference,
			componentId: sComponentId || sReference
		});
	};

	/**
	 * Stubs the FlexObjectsSelector to return the given flex objects in addition to the ones already present.
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aFlexObjects - Flex objects that should be returned by the FlexObjectSelector
	 * @returns {object} The created stub
	 */
	FlQUnitUtils.stubFlexObjectsSelector = function(sandbox, aFlexObjects) {
		const oFlexObjectsSelector = FlexState.getFlexObjectsDataSelector();
		const oGetFlexObjectsStub = sandbox.stub(oFlexObjectsSelector, "get");
		oGetFlexObjectsStub.callsFake(function(...aArgs) {
			return aFlexObjects.concat(oGetFlexObjectsStub.wrappedMethod.apply(this, aArgs));
		});
		oFlexObjectsSelector.checkUpdate();
		return oGetFlexObjectsStub;
	};

	return FlQUnitUtils;
});
