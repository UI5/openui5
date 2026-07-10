sap.ui.define(['exports', 'sap/f/thirdparty/Theme'], (function (exports, Theme) { 'use strict';

	let t,n;const l=e=>{e.style.position="absolute",e.style.clip="rect(1px,1px,1px,1px)",e.style.userSelect="none",e.style.left="-1000px",e.style.top="-1000px",e.style.pointerEvents="none";};Theme.O(()=>{t&&n||(t=document.createElement("span"),n=document.createElement("span"),t.classList.add("ui5-invisiblemessage-polite"),n.classList.add("ui5-invisiblemessage-assertive"),t.setAttribute("aria-live","polite"),n.setAttribute("aria-live","assertive"),t.setAttribute("role","alert"),n.setAttribute("role","alert"),l(t),l(n),Theme.o("ui5-announcement-area").appendChild(t),Theme.o("ui5-announcement-area").appendChild(n));});const p=(e,s)=>{const i=t;i.textContent="",i.textContent=e,setTimeout(()=>{i.textContent===e&&(i.textContent="");},3e3);};

	exports.p = p;

}));
