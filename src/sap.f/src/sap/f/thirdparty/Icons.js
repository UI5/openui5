sap.ui.define(['exports', 'sap/f/thirdparty/Theme'], (function (exports, Theme) { 'use strict';

	const t$5=typeof document>"u",o$1=()=>{if(t$5)return Theme.a$1;const a=navigator.languages,n=()=>navigator.language;return a&&a[0]||n()||Theme.a$1};

	const e$2=new Theme.i$1,n$5="languageChange",t$4=a=>{e$2.attachEvent(n$5,a);},r$5=a=>{e$2.detachEvent(n$5,a);},o=a=>e$2.fireEventAsync(n$5,a);

	let e$1,t$3;Theme.i$2(()=>{e$1=void 0,t$3=void 0;});let a$1=false;const s$4=()=>a$1,l$2=()=>(e$1===void 0&&(e$1=Theme.L()),e$1),L$1=async n=>{e$1!==n&&(a$1=true,e$1=n,await o(n),a$1=false,Theme.h$1()&&await Theme.C({languageAware:true}));},c$5=()=>Theme.a$1,m$1=n=>{t$3=n;},h$1=()=>(t$3===void 0&&(t$3=Theme.R()),t$3);

	const n$4=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;let r$4 = class r{constructor(s){const t=n$4.exec(s.replace(/_/g,"-"));if(t===null)throw new Error(`The given language ${s} does not adhere to BCP-47.`);this.sLocaleId=s,this.sLanguage=t[1]||Theme.a$1,this.sScript=t[2]||"",this.sRegion=t[3]||"",this.sVariant=t[4]&&t[4].slice(1)||null,this.sExtension=t[5]&&t[5].slice(1)||null,this.sPrivateUse=t[6]||null,this.sLanguage&&(this.sLanguage=this.sLanguage.toLowerCase()),this.sScript&&(this.sScript=this.sScript.toLowerCase().replace(/^[a-z]/,i=>i.toUpperCase())),this.sRegion&&(this.sRegion=this.sRegion.toUpperCase());}getLanguage(){return this.sLanguage}getScript(){return this.sScript}getRegion(){return this.sRegion}getVariant(){return this.sVariant}getVariantSubtags(){return this.sVariant?this.sVariant.split("-"):[]}getExtension(){return this.sExtension}getExtensionSubtags(){return this.sExtension?this.sExtension.slice(2).split("-"):[]}getPrivateUse(){return this.sPrivateUse}getPrivateUseSubtags(){return this.sPrivateUse?this.sPrivateUse.slice(2).split("-"):[]}hasPrivateUseSubtag(s){return this.getPrivateUseSubtags().indexOf(s)>=0}toString(){const s=[this.sLanguage];return this.sScript&&s.push(this.sScript),this.sRegion&&s.push(this.sRegion),this.sVariant&&s.push(this.sVariant),this.sExtension&&s.push(this.sExtension),this.sPrivateUse&&s.push(this.sPrivateUse),s.join("-")}};

	const r$3=new Map,n$3=t=>(r$3.has(t)||r$3.set(t,new r$4(t)),r$3.get(t)),c$4=t=>{try{if(t&&typeof t=="string")return n$3(t)}catch{}return new r$4(Theme.r$1)},s$3=t=>{const e=l$2();return e?n$3(e):c$4(o$1())};

	const _=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i,c$3=/(?:^|-)(saptrc|sappsd)(?:-|$)/i,f$3={he:"iw",yi:"ji",nb:"no",sr:"sh"},p=i=>{let e;if(!i)return Theme.r$1;if(typeof i=="string"&&(e=_.exec(i.replace(/_/g,"-")))){let t=e[1].toLowerCase(),n=e[3]?e[3].toUpperCase():void 0;const s=e[2]?e[2].toLowerCase():void 0,r=e[4]?e[4].slice(1):void 0,o=e[6];return t=f$3[t]||t,o&&(e=c$3.exec(o))||r&&(e=c$3.exec(r))?`en_US_${e[1].toLowerCase()}`:(t==="zh"&&!n&&(s==="hans"?n="CN":s==="hant"&&(n="TW")),t+(n?"_"+n+(r?"_"+r.replace("-","_"):""):""))}return Theme.r$1};

	const r$2={zh_HK:"zh_TW",in:"id"},n$2=t=>{if(!t)return Theme.r$1;if(r$2[t])return r$2[t];const L=t.lastIndexOf("_");return L>=0?t.slice(0,L):t!==Theme.r$1?Theme.r$1:""};

	const d=new Set,m=new Set,g$2=new Map,l$1=new Map,u$2=new Map,$=(n,t,e)=>{const r=`${n}/${t}`;u$2.set(r,e);},f$2=(n,t)=>{g$2.set(n,t);},A$1=n=>g$2.get(n),h=(n,t)=>{const e=`${n}/${t}`;return u$2.has(e)},B=(n,t)=>{const e=`${n}/${t}`,r=u$2.get(e);return r&&!l$1.get(e)&&l$1.set(e,r(t)),l$1.get(e)},M=n=>{d.has(n)||(console.warn(`[${n}]: Message bundle assets are not configured. Falling back to English texts.`,` Add \`import "${n}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`),d.add(n));},L=(n,t)=>t!==Theme.a$1&&!h(n,t),w$1=async n=>{const t=s$3().getLanguage(),e=s$3().getRegion(),r=s$3().getVariant();let s=t+(e?`-${e}`:"")+(r?`-${r}`:"");if(L(n,s))for(s=p(s);L(n,s);)s=n$2(s);const I=h$1();if(s===Theme.a$1&&!I){f$2(n,null);return}if(!h(n,s)){M(n);return}try{const o=await B(n,s);f$2(n,o);}catch(o){const a=o;m.has(a.message)||(m.add(a.message),console.error(a.message));}};t$4(n=>{const t=[...g$2.keys()];return Promise.all(t.map(w$1))});

	const t$2=new Map,e=(n,o)=>{t$2.set(n,o);},c$2=n=>t$2.get(n);

	var t$1=(o=>(o.SAPIconsV4="SAP-icons-v4",o.SAPIconsV5="SAP-icons-v5",o.SAPIconsTNTV2="tnt-v2",o.SAPIconsTNTV3="tnt-v3",o.SAPBSIconsV1="business-suite-v1",o.SAPBSIconsV2="business-suite-v2",o))(t$1||{});const s$2=new Map;s$2.set("SAP-icons",{legacy:"SAP-icons-v4",sap_horizon:"SAP-icons-v5"}),s$2.set("tnt",{legacy:"tnt-v2",sap_horizon:"tnt-v3"}),s$2.set("business-suite",{legacy:"business-suite-v1",sap_horizon:"business-suite-v2"});const c$1=(n,e)=>{if(s$2.has(n)){s$2.set(n,{...e,...s$2.get(n)});return}s$2.set(n,e);},r$1=n=>{const e=Theme.n()?"legacy":"sap_horizon";return s$2.has(n)?s$2.get(n)[e]:n};

	var t=(s=>(s["SAP-icons"]="SAP-icons-v4",s.horizon="SAP-icons-v5",s["SAP-icons-TNT"]="tnt",s.BusinessSuiteInAppSymbols="business-suite",s))(t||{});const n$1=e=>t[e]?t[e]:e;

	const i$2=o=>{const t=c$2(Theme.r());return !o&&t?n$1(t):o?r$1(o):r$1("SAP-icons")};

	const g$1=/('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g,i$1=(n,t)=>(t=t||[],n.replace(g$1,(p,s,e,r,o)=>{if(s)return "'";if(e)return e.replace(/''/g,"'");if(r){const a=typeof r=="string"?parseInt(r):r;return String(t[a])}throw new Error(`[i18n]: pattern syntax error at pos ${o}`)}));

	const r=new Map;let s$1;let u$1 = class u{constructor(e){this.packageName=e;}getText(e,...i){if(typeof e=="string"&&(e={key:e,defaultText:e}),!e||!e.key)return "";const t=A$1(this.packageName);t&&!t[e.key]&&console.warn(`Key ${e.key} not found in the i18n bundle, the default text will be used`);const l=t&&t[e.key]?t[e.key]:e.defaultText||e.key;return i$1(l,i)}};const a=n=>{if(r.has(n))return r.get(n);const e=new u$1(n);return r.set(n,e),e},f$1=async n=>s$1?s$1(n):(await w$1(n),a(n)),y$1=n=>{s$1=n;};

	const w="legacy",s=new Map,c=Theme.m("SVGIcons.registry",new Map),i=Theme.m("SVGIcons.promises",new Map),l="ICON_NOT_FOUND",C=(e,t)=>{s.set(e,t);},N=async e=>{if(!i.has(e)){if(!s.has(e))throw new Error(`No loader registered for the ${e} icons collection. Probably you forgot to import the "AllIcons.js" module for the respective package.`);const t=s.get(e);i.set(e,t(e));}return i.get(e)},f=e=>{Object.keys(e.data).forEach(t=>{const a=e.data[t];y(t,{pathData:a.path||a.paths,ltr:a.ltr,accData:a.acc,collection:e.collection,packageName:e.packageName});});},y=(e,t)=>{const a=`${t.collection}/${e}`,o={collection:t.collection,packageName:t.packageName,pathData:t.pathData,viewBox:t.viewBox,ltr:t.ltr,accData:t.accData,customTemplate:t.customTemplate};c.set(a,o);},u=e=>{e.startsWith("sap-icon://")&&(e=e.replace("sap-icon://",""));let t;return [e,t]=e.split("/").reverse(),e=e.replace("icon-",""),t&&(t=n$1(t)),{name:e,collection:t}},D=e=>{const{name:t,collection:a}=u(e);return g(a,t)},n=async e=>{const{name:t,collection:a}=u(e);let o=l;try{o=await N(i$2(a));}catch(r){console.error(r.message);}if(o===l)return o;const p=g(a,t);return p||(Array.isArray(o)?o.forEach(r=>{f(r),c$1(a,{[r.themeFamily||w]:r.collection});}):f(o),g(a,t))},g=(e,t)=>{const a=`${i$2(e)}/${t}`;return c.get(a)},A=async e=>{if(!e)return;let t=D(e);if(t||(t=await n(e)),t&&t!==l&&t.accData)return t.packageName?(await f$1(t.packageName)).getText(t.accData):t.accData?.defaultText||""};

	exports.$ = $;
	exports.A = A;
	exports.C = C;
	exports.D = D;
	exports.L = L$1;
	exports.c = c$2;
	exports.c$1 = c$5;
	exports.e = e;
	exports.f = f$1;
	exports.h = h$1;
	exports.i = i$2;
	exports.l = l$2;
	exports.m = m$1;
	exports.n = n;
	exports.r = r$5;
	exports.s = s$3;
	exports.s$1 = s$4;
	exports.t = t$4;
	exports.t$1 = t$1;
	exports.u = u$1;
	exports.y = y;
	exports.y$1 = y$1;

}));
