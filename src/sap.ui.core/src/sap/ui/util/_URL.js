/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Enhanced URL class for UI5 framework internal use.
	 *
	 * Extends the native JavaScript URL class with additional functionality
	 * to provide URI.js-like behavior, serving as a replacement for the
	 * third-party URI.js library. This class preserves the original URL
	 * string and provides methods for relative path calculation and URL
	 * type detection that are commonly needed in UI5 framework operations.
	 *
	 * @class
	 * @extends URL
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @since 1.141.0
	 * @alias module:sap/ui/util/_URL
	 */
	class _URL extends URL {
		/**
		 * Private field storing the original URL without query parameters or hash fragments.
		 * @type {string}
		 * @private
		 */
		#plainUrl;

		/**
		 * Creates a new _URL instance.
		 *
		 * @param {string} url - The URL string to parse
		 * @param {string} [base=document.baseURI] - The base URL to resolve relative URLs against
		 */
		constructor(url, base = document.baseURI) {
			super(url, base);
			this.#plainUrl = String(url).replace(/[?#].*$/, '');
		}
		/**
		 * Gets the original URL string without query parameters or hash fragments.
		 *
		 * @returns {string} The original URL without query parameters or hash
		 */
		get plainUrl () {
			return this.#plainUrl;
		}

		/**
		 * Returns the original URL string with search parameters and hash fragments.
		 *
		 * @returns {string} The original URL with search parameters and hash
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		get sourceUrl () {
			return this.#plainUrl + this.search + this.hash;
		}

		/**
		 * Determines if the URL is absolute (has a protocol or is protocol-relative).
		 *
		 * @returns {boolean} True if the URL is absolute, false otherwise
		 * @example
		 * new _URL("https://example.com").isAbsolute() // true
		 * new _URL("//example.com").isAbsolute() // true
		 * new _URL("./path").isAbsolute() // false
		 * new _URL("/path").isAbsolute() // false
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		isAbsolute () {
			if (this.#plainUrl.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(this.#plainUrl)) {
				return true;
			}

			return false;
		}

		/**
		 * Calculates a relative path from one absolute URL to another.
		 * Used internally for URL resolution in component and manifest handling.
		 *
		 * @param {module:sap/ui/util/_URL} base The URL to resolve relative to
		 * @returns {string} The relative path, or absolute URL if origins differ
		 * @example
		 * // Returns "../lib/file.js"
		 * new _URL("/app/lib/file.js").relativeTo(new _URL("/app/src/component.js"))
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		relativeTo (base) {
			if (this.username || this.password || base.username || base.password) {
				throw new Error("URL should not contain username or password");
			}
			// If different origins, return absolute URL
			if (base.origin !== this.origin) {
				return this.href;
			}

			// Normalize paths
			let fromPath = base.pathname;
			let toPath = this.pathname;

			// If fromPath doesn't end with '/', it's a file - remove the filename to get directory
			if (!fromPath.endsWith('/')) {
				fromPath = fromPath.substring(0, fromPath.lastIndexOf('/') + 1);
			}

			// Remove trailing slash for comparison (but remember if toPath originally had one)
			const toPathHadTrailingSlash = toPath.endsWith('/');
			fromPath = fromPath.replace(/\/$/, '') || '/';
			toPath = toPath.replace(/\/$/, '') || '/';

			// Split paths into segments
			const fromSegments = fromPath.split('/').filter(function(s) { return s !== ''; });
			const toSegments = toPath.split('/').filter(function(s) { return s !== ''; });

			// Find common prefix
			let commonLength = 0;
			while (commonLength < fromSegments.length &&
				commonLength < toSegments.length &&
				fromSegments[commonLength] === toSegments[commonLength]) {
				commonLength++;
			}

			// Calculate '../' steps needed
			const upSteps = fromSegments.length - commonLength;
			const relativeParts = new Array(upSteps).fill('..');

			// Add remaining target segments
			relativeParts.push(...toSegments.slice(commonLength));

			// Build result
			let result = relativeParts.join('/') || '.';

			// Add trailing slash if original toUrl had one
			if (toPathHadTrailingSlash && result !== '.') {
				result += '/';
			}

			// Add search and hash if present in target
			if (this.search) {
				result += this.search;
			}
			if (this.hash) {
				result += this.hash;
			}

			return result;
		}
	}

	return _URL;
});
