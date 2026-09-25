sap.ui.define(['exports', 'sap/f/thirdparty/ManagedStyles'], (function (exports, ManagedStyles) { 'use strict';

	let o;const s=[],l=e=>{e.style.position="absolute",e.style.clip="rect(1px,1px,1px,1px)",e.style.userSelect="none",e.style.left="-1000px",e.style.top="-1000px",e.style.pointerEvents="none";},p=()=>{const e=document.createElement("span"),t=document.createElement("span");return e.classList.add("ui5-invisiblemessage-polite"),t.classList.add("ui5-invisiblemessage-assertive"),e.setAttribute("aria-live","polite"),t.setAttribute("aria-live","assertive"),e.setAttribute("role","alert"),t.setAttribute("role","alert"),l(e),l(t),{polite:e,assertive:t}};ManagedStyles.O(()=>{if(o)return;o=p();const e=ManagedStyles.o("ui5-announcement-area");e.appendChild(o.polite),e.appendChild(o.assertive);});const u=e=>{if(s.some(n=>n.container===e))return;const t=p();e.appendChild(t.polite),e.appendChild(t.assertive),s.push({container:e,spans:t});},d=e=>{const t=s.findIndex(i=>i.container===e);if(t===-1)return;const[n]=s.splice(t,1);n.spans.polite.remove(),n.spans.assertive.remove();},v=(e,t)=>{let n=o;for(let a=s.length-1;a>=0;a--)if(s[a].container.isConnected){n=s[a].spans;break}const i=n.polite;i.textContent="",i.textContent=e,setTimeout(()=>{i.textContent===e&&(i.textContent="");},3e3);};

	exports.d = d;
	exports.u = u;
	exports.v = v;

}));
