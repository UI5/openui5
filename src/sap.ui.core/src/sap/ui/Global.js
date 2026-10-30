/*!
 * ${copyright}
 */

sap.ui.define([
],
	function() {
		"use strict";

		/**
		 * The <code>sap.ui</code> namespace is the central OpenAjax compliant entry
		 * point for UI related JavaScript functionality provided by SAP.
		 *
		 * @version ${version}
		 * @namespace
		 * @name sap.ui
		 * @public
		 */

		const Global = {
			/**
			 * The version of the sap.ui.core library
			 * @type string
			 */
			version: "${version}",
			// buildinfo.lastchange is deprecated and is therefore defaulted to empty string
			buildinfo : { lastchange : "", buildtime : "${buildtime}" }
		};

		return Global;
	});