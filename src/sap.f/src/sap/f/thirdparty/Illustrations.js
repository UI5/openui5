sap.ui.define(['exports', 'sap/f/thirdparty/Theme'], (function (exports, Theme) { 'use strict';

	const u=new Map([["sap_horizon","V5"],["sap_horizon_dark","V5"],["sap_horizon_hcb","V5/HC"],["sap_horizon_hcw","V5/HC"]]),e="V4",i=new Map,l=Theme.m("SVGIllustration.registry",new Map),a=Theme.m("SVGIllustration.promises",new Map),I=()=>{const s=Theme.r();return u.has(s)?u.get(s):e},g=s=>{let t=I();const[o,r]=s.split("/");let n=`${o}/${t}/${r}`;return !i.has(n)&&t!==e&&(t=e,n=`${o}/${t}/${r}`),{registryKey:n,collection:t}},h=(s,t)=>{const o=t.collection||e;l.set(`${t.set}/${o}/${s}`,{dialogSvg:t.dialogSvg,sceneSvg:t.sceneSvg,spotSvg:t.spotSvg,dotSvg:t.dotSvg,title:t.title,subtitle:t.subtitle});},m=s=>{const{registryKey:t}=g(s);if(!a.has(t)){if(!i.has(t)){const r=s.startsWith("fiori/")?s.replace("fiori/",""):s;throw new Error(`No loader registered for the ${s} illustration. Probably you forgot to import the "@ui5/webcomponents-fiori/dist/illustrations/${r}.js" module. Or you can import the "@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations.js" module that will make all illustrations available, but fetch only the ones used.`)}const o=i.get(t);a.set(t,o(t));}return a.get(t)},d=s=>{const{registryKey:t}=g(s);return l.get(t)},S=async s=>{const{registryKey:t}=g(s);return await m(s),l.get(t)};

	exports.S = S;
	exports.d = d;
	exports.h = h;

}));
