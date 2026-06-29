sap.ui.define(['exports'], (function (exports) { 'use strict';

	const t=r=>Array.from(r).filter(e=>e.nodeType!==Node.COMMENT_NODE&&(e.nodeType!==Node.TEXT_NODE||(e.nodeValue||"").trim().length!==0)).length>0;

	exports.t = t;

}));
