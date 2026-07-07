sap.ui.define([

], function () {
  "use strict";
  (function() {
	  "use strict";

	  // Redirect by default
	  var bRedirect = true;

	  function redirect() {
		  var sPathname = window.location.pathname,
				  sBasePath = sPathname.substr(0, sPathname.lastIndexOf('/')) + "/documentation.html",
				  sHash = window.location.hash;

		  if (!sHash) {
			  sHash = "#/controls";
		  }
		  window.location.href = window.location.origin + sBasePath + window.location.search + sHash;
	  }

	  try {
		  if (window.parent !== window && window.parent.sap && window.parent.sap.ui && window.parent.sap.ui.themedesigner) {
			  // we're in an iframe, loaded by theme designer - avoid redirect (bootstrap app from this index)
			  bRedirect = false;
		  }
	  } catch (err) {
		  // we're inside an iframe from another domain - redirect
	  }

	  if (bRedirect) {
		  redirect();
	  }
  })();
});