sap.ui.define(['exports'], (function (exports) { 'use strict';

  /**
   * Create hex string and pad to length with zeros.
   * @example
   * sap.ui.require(["sap/base/strings/toHex"], function(toHex){
   *      toHex(10, 2); // "0a"
   *      toHex(16, 2); // "10"
   * });
   *
   * @function
   * @since 1.58
   * @private
   * @alias module:sap/base/strings/toHex
   * @param {int} iChar UTF-16 character code
   * @param {int} [iLength=0] number of padded zeros
   * @returns {string} padded hex representation of the given character code
   */ /*!
       * OpenUI5
       * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
       * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
       */
  /*
   * IMPORTANT: This is a private module, its API must not be used and is subject to change.
   * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
   */

  var fnToHex = function (iChar, iLength) {
    var sHex = iChar.toString(16);
    return sHex;
  };

  /*!
   * OpenUI5
   * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
   * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
   */
  /* eslint-disable no-control-regex -- special characters are really needed here! */
  /**
   * RegExp and escape function for HTML escaping
   */
  var rHtml = /[\x00-\x2b\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g,
    rHtmlReplace = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/,
    mHtmlLookup = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "\"": "&quot;"
    };
  /* eslint-enable no-control-regex */

  var fnHtml = function (sChar) {
    var sEncoded = mHtmlLookup[sChar];
    if (!sEncoded) {
      if (rHtmlReplace.test(sChar)) {
        sEncoded = "&#xfffd;";
      } else {
        sEncoded = "&#x" + fnToHex(sChar.charCodeAt(0)) + ";";
      }
      mHtmlLookup[sChar] = sEncoded;
    }
    return sEncoded;
  };

  /*
   * Encoding according to the Secure Programming Guide
   * <SAPWIKI>/wiki/display/NWCUIAMSIM/XSS+Secure+Programming+Guide
   */

  /**
   * Encode the string for inclusion into XML content/attribute.
   *
   * @function
   * @since 1.58
   * @alias module:sap/base/security/encodeXML
   * @param {string} sString The string to be escaped
   * @returns {string} The encoded string
   * @SecValidate {0|return|XSS} validates the given string for XML contexts
   * @public
   */
  var fnEncodeXML = function (sString) {
    return sString.replace(rHtml, fnHtml);
  };

  exports.fnEncodeXML = fnEncodeXML;

}));
