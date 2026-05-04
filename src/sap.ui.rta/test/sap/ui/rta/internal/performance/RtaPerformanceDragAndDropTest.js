window.startDragAndDrop = function() {
	"use strict";
	sap.ui.require([
		"dt/performance/PerformanceTestUtil"
	], function(
		DtPerformanceTestUtil
	) {
		function fnRecursiveloop(aEvents) {
			var aEvent = aEvents.shift();
			if (aEvent) {
				setTimeout(function() {
					document.getElementById(aEvent[1]).dispatchEvent(new Event(aEvent[0]));
					fnRecursiveloop(aEvents);
				}, aEvent[0] === "dragenter" ? 50 : 0);
			}
		}

		fetch("./dragAndDrop/dragDropEvents.json")
			.then(function(oResponse) { return oResponse.json(); })
			.then(function(aEvents) {
				DtPerformanceTestUtil.measureApplyStylePerformance("applyStylesDragDrop", 3000);

				fnRecursiveloop(aEvents);
			});
	});
};

window.startResizeTest = function() {
	"use strict";
	sap.ui.require([
		"dt/performance/PerformanceTestUtil"
	], function(
		DtPerformanceTestUtil
	) {
		DtPerformanceTestUtil.measureApplyStylePerformance("applyStylesResize", 2000);

		var iStartWidth = document.getElementById("content").getBoundingClientRect().width;
		var aWidthsToTest = [450, 300, 650, 500];
		var iJumpsInPxls = 5;
		var iNextWidth = iStartWidth - (iStartWidth % iJumpsInPxls);

		function setContentWidth(iWidth) {
			document.getElementById("content").style.width = iWidth + "px";
		}

		(function fnRecursiveloop(aWidthsToTest) {
			var iTargetWidth = aWidthsToTest.shift();
			if (iTargetWidth) {
				var iCurrentWidth;
				for (iCurrentWidth = iStartWidth - (iStartWidth % iJumpsInPxls);
					iCurrentWidth !== iTargetWidth;
					iCurrentWidth = (iTargetWidth > iStartWidth) ? iCurrentWidth + iJumpsInPxls : iCurrentWidth - iJumpsInPxls
				) {
					setTimeout(setContentWidth, 0, iCurrentWidth);
				}
				iStartWidth = iCurrentWidth;
				iNextWidth = iCurrentWidth;
				setTimeout(function() {
					document.getElementById("content").style.width = iNextWidth + "px";
					fnRecursiveloop(aWidthsToTest, iStartWidth, iJumpsInPxls);
				}, 100);
			}
		})(aWidthsToTest, iStartWidth, iJumpsInPxls);
	});
};