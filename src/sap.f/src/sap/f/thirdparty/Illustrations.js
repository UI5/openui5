sap.ui.define(['exports', 'sap/f/thirdparty/Theme'], (function (exports, Theme) { 'use strict';

	const c=new Map([["sap_horizon","V5"],["sap_horizon_dark","V5"],["sap_horizon_hcb","V5/HC"],["sap_horizon_hcw","V5/HC"]]),o="V4",l=new Map,n=Theme.m("SVGIllustration.registry",new Map),a=Theme.m("SVGIllustration.promises",new Map),m=()=>{const e=Theme.r();return c.has(e)?c.get(e):o},p=e=>{let t=m();const[s,r]=e.split("/");let i=`${s}/${t}/${r}`;return !l.has(i)&&t!==o&&(t=o,i=`${s}/${t}/${r}`),{registryKey:i,collection:t}},f=(e,t)=>{const s=t.collection||o;n.set(`${t.set}/${s}/${e}`,{dialogSvg:t.dialogSvg,sceneSvg:t.sceneSvg,spotSvg:t.spotSvg,dotSvg:t.dotSvg,title:t.title,subtitle:t.subtitle});},T=e=>{const{registryKey:t}=p(e);if(!a.has(t)){if(!l.has(t)){const r=e.startsWith("fiori/")?e.replace("fiori/",""):e;throw new Error(`No loader registered for the ${e} illustration. Probably you forgot to import the "@ui5/webcomponents-fiori/dist/illustrations/${r}.js" module. Or you can import the "@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations.js" module that will make all illustrations available, but fetch only the ones used.`)}const s=l.get(t);a.set(t,s(t));}return a.get(t)},h=e=>{const{registryKey:t}=p(e);return n.get(t)},d=async e=>{const{registryKey:t}=p(e);return await T(e),n.get(t)};

	exports.d = d;
	exports.f = f;
	exports.h = h;

}));
