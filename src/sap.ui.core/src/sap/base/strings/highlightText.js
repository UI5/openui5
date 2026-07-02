/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/security/encodeXML"
], function (encodeXML) {
	"use strict";

	function createLowerCaseIndexMap(sText) {
		const aLowerIndexToOriginalStart = [];
		const aLowerIndexToOriginalEnd = [];
		let iOriginalIndex = 0;

		for (const sCharacter of sText) {
			const sLowerCharacter = sCharacter.toLowerCase();
			const iOriginalEnd = iOriginalIndex + sCharacter.length;

			for (let iLowerIndex = 0; iLowerIndex < sLowerCharacter.length; iLowerIndex++) {
				aLowerIndexToOriginalStart.push(iOriginalIndex);
				aLowerIndexToOriginalEnd.push(iOriginalEnd);
			}

			iOriginalIndex = iOriginalEnd;
		}

		return {
			aLowerIndexToOriginalStart,
			aLowerIndexToOriginalEnd
		};
	}

	/**
	 * Generates highlighted HTML markup for the given text based on a search term.
	 * All case-insensitive occurrences of the search term are wrapped in
	 * <code>&lt;span&gt;</code> elements with the given CSS class.
	 *
	 * If no match is found, the text is returned XML-encoded without any wrapping.
	 *
	 * @example
	 * sap.ui.require(["sap/base/strings/highlightText"], function(highlightText){
	 *      highlightText("My Account Action", "Ac", "myHighlight");
	 *      // "My <span class="myHighlight">Ac</span>count <span class="myHighlight">Ac</span>tion"
	 * });
	 *
	 * @function
	 * @since 1.151
	 * @alias module:sap/base/strings/highlightText
	 * @param {string|null} sText The full text to highlight within
	 * @param {string|null} sHighlightedText The search term to highlight
	 * @param {string} sClass The CSS class to apply to the highlight span
	 * @returns {string} XML-encoded HTML string with matching portions wrapped in highlight spans
	 * @private
	 * @ui5-restricted sap.tnt
	 */
	const highlightText = function (sText, sHighlightedText, sClass) {
		sText = sText || "";
		sHighlightedText = sHighlightedText || "";

		const sLowerText = sText.toLowerCase();
		const sLowerHighlight = sHighlightedText.toLowerCase();
		const iHighlightLength = sLowerHighlight.length;
		let iIndex = sLowerText.indexOf(sLowerHighlight);

		if (!iHighlightLength || iIndex === -1) {
			return encodeXML(sText);
		}

		// Lowercasing can expand a single character (for example Turkish dotted İ).
		// The index map keeps the lowercase search positions aligned with the original text slices.
		const oLowerCaseIndexMap = createLowerCaseIndexMap(sText);

		let sResult = "";
		let iLastEnd = 0;

		while (iIndex > -1) {
			const iOriginalStart = oLowerCaseIndexMap.aLowerIndexToOriginalStart[iIndex];
			const iOriginalEnd = oLowerCaseIndexMap.aLowerIndexToOriginalEnd[iIndex + iHighlightLength - 1];

			sResult += encodeXML(sText.slice(iLastEnd, iOriginalStart)) +
				'<span class="' + sClass + '">' + encodeXML(sText.slice(iOriginalStart, iOriginalEnd)) + '</span>';
			iLastEnd = iOriginalEnd;
			iIndex = sLowerText.indexOf(sLowerHighlight, iIndex + iHighlightLength);
		}

		sResult += encodeXML(sText.slice(iLastEnd));

		return sResult;
	};

	return highlightText;
});
