sap.ui.define(['exports', 'sap/f/thirdparty/encodeXML'], (function (exports, encodeXML) { 'use strict';

	const r=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

	function a(r$1,e,s,i){return r$1.replaceAll(new RegExp(r(e),`${i?"i":""}g`),s)}function f(r,e){if(!r||!e)return r;const s=n=>{const[g,l]=n.split("");for(;r.indexOf(n)>=0||e.indexOf(n)>=0;)n=`${g}${n}${l}`;return n},i=s("12"),t=s("34");let o=encodeXML.fnEncodeXML(a(r,e,n=>`${i}${n}${t}`,true));return [[i,"<b>"],[t,"</b>"]].forEach(([n,g])=>{o=a(o,n,g,false);}),o}

	exports.f = f;

}));
