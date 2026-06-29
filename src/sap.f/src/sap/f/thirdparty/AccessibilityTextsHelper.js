sap.ui.define(['exports'], (function (exports) { 'use strict';

	const b=new WeakMap,o=new WeakMap,v={attributes:true,childList:true,characterData:true,subtree:true},A=e=>{const t=e;return t.accessibleNameRef?E(e):t.accessibleName?t.accessibleName:void 0},E=e=>{const t=e.accessibleNameRef?.split(" ")??[];let s="";return t.forEach((n,c)=>{const l=m(e,n),a=`${l&&l.textContent?l.textContent:""}`;a&&(s+=a,c<t.length-1&&(s+=" "));}),s},f=e=>{const t=new Set;u(e).forEach(r=>{t.add(r);});const n=e.accessibleNameRef,c=e.accessibleDescriptionRef,l=[n,c].filter(Boolean).join(" ");return (l?l.split(" "):[]).forEach(r=>{const i=m(e,r);i&&t.add(i);}),Array.from(t)},u=e=>{const t=e.getRootNode().querySelectorAll(`[for="${e.id}"]`);return Array.from(t)},m=(e,t)=>e.getRootNode().querySelector(`[id='${t}']`)||document.getElementById(t),M=e=>{const t=[];if(u(e).forEach(n=>{const c=n.textContent;c&&t.push(c);}),t.length)return t.join(" ")},k=e=>s=>{const n=s&&s.type==="property"&&s.name==="accessibleNameRef",c=s&&s.type==="property"&&s.name==="accessibleDescriptionRef";if(!n&&!c)return;const l=o.get(e);if(!l)return;const a=l.observedElements,r=f(e);a.forEach(i=>{r.includes(i)||d(l,i);}),r.forEach(i=>{a.includes(i)||(g(l,i),l.observedElements.push(i));}),l?.callback();},y=(e,t)=>{if(o.has(e))return;const s=f(e),n=k(e),c={host:e,observedElements:s,callback:t,invalidationCallback:n};o.set(e,c),e.attachInvalidate(n),s.forEach(l=>{g(c,l);}),t();},g=(e,t)=>{let s=b.get(t);if(!s){s={observer:null,callbacks:[]};const n=new MutationObserver(()=>{s.callbacks.forEach(a=>{a();});const l=document.getElementById(t.id);e.host.id===t.getAttribute("for")||l||d(e,t);});s.observer=n,n.observe(t,v),b.set(t,s);}s.callbacks.includes(e.callback)||s.callbacks.push(e.callback);},d=(e,t)=>{const s=b.get(t);s&&(s.callbacks=s.callbacks.filter(n=>n!==e.callback),s.callbacks.length||(s.observer?.disconnect(),b.delete(t))),e.observedElements=e.observedElements.filter(n=>n!==t);},T=e=>{const t=o.get(e);if(!t)return;[...t.observedElements].forEach(n=>{d(t,n);}),e.detachInvalidate(t.invalidationCallback),o.delete(e);},L=e=>{const t=e;return t.accessibleDescriptionRef?p(e):t.accessibleDescription?t.accessibleDescription:void 0},p=e=>{const t=e.accessibleDescriptionRef?.split(" ")??[];let s="";return t.forEach((n,c)=>{const l=m(e,n),a=`${l&&l.textContent?l.textContent:""}`;a&&(s+=a,c<t.length-1&&(s+=" "));}),s};

	exports.A = A;
	exports.E = E;
	exports.L = L;
	exports.M = M;
	exports.T = T;
	exports.p = p;
	exports.y = y;

}));
