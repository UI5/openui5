/*!
 * ${copyright}
 */

// Provides type sap.ui.unified.FileUploaderHttpRequestMethod
sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Types of HTTP request methods.
	 *
	 * @enum {string}
	 * @alias sap.ui.unified.FileUploaderHttpRequestMethod
	 * @public
	 * @since 1.81.0
	 */
	var FileUploaderHttpRequestMethod = {

		/**
		 * HTTP request POST method.
		 * @public
		 */
		POST : "POST",

		/**
		 * HTTP request PUT method.
		 * @public
		 */
		PUT : "PUT",

		/**
		 * HTTP request POST method.
		 * @public
		 * @deprecated Since 1.145.0, use {@link sap.ui.unified.FileUploaderHttpRequestMethod.POST} instead
		 */
		Post : "POST",

		/**
		 * HTTP request PUT method.
		 * @public
		 * @deprecated Since 1.145.0, use {@link sap.ui.unified.FileUploaderHttpRequestMethod.PUT} instead
		 */
		Put : "PUT"

	};

	DataType.registerEnum("sap.ui.unified.FileUploaderHttpRequestMethod", FileUploaderHttpRequestMethod);

	return FileUploaderHttpRequestMethod;

});