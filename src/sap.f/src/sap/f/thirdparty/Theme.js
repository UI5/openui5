sap.ui.define(['module', 'exports'], (function (module, exports) { 'use strict';

	const o$a=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

	const u$9=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$9=()=>typeof document>"u"?null:o$a('meta[name="ui5-shared-resources"]',document.head,u$9),m$9=(t,o)=>{const r=t.split(".");let e=l$9();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

	const g$6=m$9("Tags",new Map),d$9=new Set;let i$b=new Map,c$a;const m$8=-1,h$3=e=>{d$9.add(e),g$6.set(e,h$2());},w$6=e=>d$9.has(e),R$2=()=>d$9.size>0,T$3=()=>[...d$9.values()],$=e=>{let n=g$6.get(e);n===void 0&&(n=m$8),i$b.has(n)||i$b.set(n,new Set),i$b.get(n).add(e),c$a||(c$a=setTimeout(()=>{y$4(),i$b=new Map,c$a=void 0;},1e3));},y$4=()=>{const e=b$5(),n=h$2(),l=e[n];let t="Multiple UI5 Web Components instances detected.";e.length>1&&(t=`${t}
Loading order (versions before 1.1.0 not listed): ${e.map(s=>`
${s.description}`).join("")}`),[...i$b.keys()].forEach(s=>{let o,r;s===m$8?(o=1,r={description:"Older unknown runtime"}):(o=I$2(n,s),r=e[s]);let a;o>0?a="an older":o<0?a="a newer":a="the same",t=`${t}

"${l.description}" failed to define ${i$b.get(s).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...i$b.get(s)].sort().join(", ")}.`,o>0?t=`${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!`:t=`${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;}),t=`${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md.`,console.warn(t);};

	const e$7={version:"2.23.1",major:2,minor:23,patch:1,suffix:"",isNext:false,buildTime:1781204653};

	let s$b,t$d={include:[/./],exclude:[]};const o$9=new Map,p$1=e=>{if(!e.match(/^[a-zA-Z0-9_-]+$/))throw new Error("Only alphanumeric characters and dashes allowed for the scoping suffix");R$2()&&console.warn("Setting the scoping suffix must be done before importing any components. For proper usage, read the scoping section: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md."),s$b=e;},c$9=()=>s$b,g$5=e=>{if(!e||!e.include)throw new Error('"rules" must be an object with at least an "include" property');if(!Array.isArray(e.include)||e.include.some(n=>!(n instanceof RegExp)))throw new Error('"rules.include" must be an array of regular expressions');if(e.exclude&&(!Array.isArray(e.exclude)||e.exclude.some(n=>!(n instanceof RegExp))))throw new Error('"rules.exclude" must be an array of regular expressions');e.exclude=e.exclude||[],t$d=e,o$9.clear();},m$7=()=>t$d,i$a=e=>{if(!o$9.has(e)){const n=t$d.include.some(r=>e.match(r))&&!t$d.exclude.some(r=>e.match(r));o$9.set(e,n);}return o$9.get(e)},d$8=e=>{if(i$a(e))return c$9()},f$8=(e,n=false)=>{if(!n)return e;const r=`v${e$7.version.replaceAll(".","-")}`,a=/(--_?ui5)([^,:)\s]+)/g;return e.replaceAll(a,`$1-${r}$2`)};

	let s$a,u$8="";const c$8=new Map,o$8=m$9("Runtimes",[]),d$7=()=>{if(s$a===void 0){s$a=o$8.length;const e=e$7;o$8.push({...e,get scopingSuffix(){return c$9()},get registeredTags(){return T$3()},get scopingRules(){return m$7()},alias:u$8,description:`Runtime ${s$a} - ver ${e.version}${""}`,importMetaUrl:new URL(sap.ui.require.toUrl("sap/f/thirdparty/Theme"), document.baseURI).href});}},h$2=()=>s$a,a$b=(e,t)=>{if(e.isNext||t.isNext)return e.buildTime-t.buildTime;const r=e.major-t.major;if(r)return r;const n=e.minor-t.minor;if(n)return n;const i=e.patch-t.patch;return i||new Intl.Collator(void 0,{numeric:true,sensitivity:"base"}).compare(e.suffix,t.suffix)},I$2=(e,t)=>{const r=`${e},${t}`;if(c$8.has(r))return c$8.get(r);const n=o$8[e],i=o$8[t];if(!n||!i)throw new Error("Invalid runtime index supplied");const m=a$b(n,i);return c$8.set(r,m),m},b$5=()=>o$8;

	const g$4=typeof document>"u",i$9=(e,t)=>t?`${e}|${t}`:e,l$8=e=>e===void 0?true:I$2(h$2(),parseInt(e))>=1,c$7=(e,t,r="",s)=>{const d=h$2(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$9(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},y$3=(e,t,r="",s)=>{const d=h$2(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$9(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$8(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},S$1=(e,t="")=>g$4?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$9(e,t)),f$7=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$9(e,t));},R$1=(e,t,r="",s)=>{S$1(t,r)?y$3(e,t,r,s):c$7(e,t,r,s);},m$6=(e,t)=>e===void 0?t:t===void 0?e:`${e} ${t}`;

	const e$6=new Map,s$9=(t,r)=>{e$6.set(t,r);},n$8=t=>e$6.get(t);

	var c$6={},e$5=c$6.hasOwnProperty,a$a=c$6.toString,o$7=e$5.toString,l$7=o$7.call(Object),i$8=function(r){var t,n;return !r||a$a.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$5.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$7.call(n)===l$7):true)};

	var c$5=Object.create(null),u$7=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?void 0:c$5;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$8(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$8(n)?n:{},r[a]=u$7(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

	const e$4=function(n,t){return u$7(true,false,...arguments)};

	const _={themes:{default:"sap_horizon",all:["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_horizon","sap_horizon_auto","sap_horizon_dark","sap_horizon_hc_auto","sap_horizon_hcb","sap_horizon_hcw"]},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$3=_.themes.default,s$8=_.themes.all,a$9=_.languages.default,r$b=_.locales.default,n$7=_.locales.all;

	var u$6=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$6||{});

	let i$7 = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

	const e$2=new i$7,t$c="configurationReset",i$6=n=>{e$2.attachEvent(t$c,n);};

	const o$6=typeof document>"u",n$6={search(){return o$6?"":window.location.search}},i$5=()=>o$6?"":window.location.hostname,c$4=()=>o$6?"":window.location.port,a$8=()=>o$6?"":window.location.protocol,s$7=()=>o$6?"":window.location.href,u$5=()=>n$6.search();

	let g$3=false,t$b={animationMode:u$6.Full,theme:e$3,themeRoot:void 0,rtl:void 0,language:void 0,timezone:void 0,calendarType:void 0,secondaryCalendarType:void 0,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true,ignoreUrlParams:false};const y$2=()=>(o$5(),t$b.animationMode),C$3=()=>(o$5(),t$b.theme),T$2=()=>(o$5(),t$b.themeRoot),S=()=>(o$5(),t$b.language),U$2=()=>(o$5(),t$b.fetchDefaultLanguage),L$1=()=>(o$5(),t$b.noConflict),F=()=>(o$5(),t$b.defaultFontLoading),b$4=()=>(o$5(),t$b.enableDefaultTooltips),I$1=()=>(o$5(),t$b.ignoreUrlParams),D=()=>(o$5(),t$b.calendarType),R=()=>(o$5(),t$b.formatSettings),i$4=new Map;i$4.set("true",true),i$4.set("false",false);const M=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$b=e$4(t$b,e));}},z=()=>{const n=new URLSearchParams(u$5());n.forEach((e,r)=>{const a=r.split("sap-").length;a===0||a===r.split("sap-ui-").length||l$6(r,e,"sap");}),n.forEach((e,r)=>{r.startsWith("sap-ui")&&l$6(r,e,"sap-ui");});},E$1=n=>n.split("@")[1],w$5=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,l$6=(n,e,r)=>{const a=e.toLowerCase(),s=n.split(`${r}-`)[1];i$4.has(e)&&(e=i$4.get(a)),s==="theme"?(t$b.theme=w$5(s,e),e&&e.includes("@")&&(t$b.themeRoot=E$1(e))):t$b[s]=e;},j=()=>{const n=n$8("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$b=e$4(t$b,e);},o$5=()=>{typeof document>"u"||g$3||(u$4(),g$3=true);},u$4=n=>{M(),t$b.ignoreUrlParams||z(),j();};

	let l$5 = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

	const t$a=new Set,n$5=e=>{t$a.add(e);},r$a=e=>t$a.has(e);

	const i$3=new Set,m$5=new i$7,n$4=new l$5;let t$9,a$7,d$6,s$6;const l$4=async e=>{n$4.add(e),await U$1();},c$3=e=>{i$3.add(e);},f$6=e=>{i$3.delete(e);},u$3=e=>{m$5.fireEvent("beforeComponentRender",e),c$3(e),e._render();},P$2=e=>{n$4.remove(e),f$6(e);},U$1=async()=>{s$6||(s$6=new Promise(e=>{window.requestAnimationFrame(()=>{n$4.process(u$3),s$6=null,e(),d$6||(d$6=setTimeout(()=>{d$6=void 0,n$4.isEmpty()&&T$1();},200));});})),await s$6;},y$1=()=>t$9||(t$9=new Promise(e=>{a$7=e,window.requestAnimationFrame(()=>{n$4.isEmpty()&&(t$9=void 0,e());});}),t$9),C$2=()=>{const e=T$3().map(r=>customElements.whenDefined(r));return Promise.all(e)},w$4=async()=>{await C$2(),await y$1();},T$1=()=>{n$4.isEmpty()&&a$7&&(a$7(),a$7=void 0,t$9=void 0);},b$3=async e=>{i$3.forEach(r=>{const o=r.constructor,E=o.getMetadata().getTag(),p=r$a(o),g=o.getMetadata().isLanguageAware(),v=o.getMetadata().isThemeAware();(!e||e.tag===E||e.rtlAware&&p||e.languageAware&&g||e.themeAware&&v)&&l$4(r);}),await w$4();};

	const t$8=new i$7,r$9="themeRegistered",n$3=e=>{t$8.attachEvent(r$9,e);},s$5=e=>t$8.fireEvent(r$9,e);

	const l$3=new Map,T=new Map,h$1=new Map,u$2=new Map,a$6=new Set,f$5=(e,r,t,s="root")=>{T.set(`${e}/${r}`,t),u$2.set(e,{cssVariablesTarget:s}),a$6.add(r),s$5(r);},L=async(e,r,t)=>{const s=`${e}_${r}_${t||""}`,o=l$3.get(s);if(o!==void 0)return o;if(!a$6.has(r)){const p=[...a$6.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$3}. Registered themes are: ${p}`),c$2(e,e$3)}const[n,g]=await Promise.all([c$2(e,r),t?c$2(e,t,true):void 0]),i=m$6(n,g);return i&&l$3.set(s,i),i},c$2=async(e,r,t=false)=>{const o=(t?h$1:T).get(`${e}/${r}`);if(!o){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await o(r);}catch(g){console.error(e,g.message);return}return n},m$4=()=>u$2,w$3=e=>a$6.has(e);

	const r$8=new Set,s$4=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$4=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$8.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$8.add("decode"));return}try{return JSON.parse(a)}catch{r$8.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$8.add("parse"));}}},d$5=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$8.has("object")||(console.warn("Malformed theme metadata Object",e),r$8.add("object"));return}return {themeName:t,baseThemeName:a}},m$3=()=>{const e=s$4();if(!e||e==="none")return;const t=o$4(e);if(t)return d$5(t)};

	const t$7=new i$7,d$4="themeLoaded",o$3=e=>{t$7.attachEvent(d$4,e);},n$2=e=>{t$7.detachEvent(d$4,e);},r$7=e=>t$7.fireEvent(d$4,e);

	const d$3=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

	const a$5=t=>{const e=document.querySelector(`META[name="${t}"]`);return e&&e.getAttribute("content")},g$2=(t,e=false)=>{const n=a$5("sap-allowed-theme-origins")??a$5("sap-allowedThemeOrigins");return n?e?true:n.split(",").some(r=>r==="*"||t===r.trim()):false},l$2=t=>{let e,n=false;try{if(t.startsWith(".")||t.startsWith("/")&&!t.startsWith("//"))e=new URL(t,s$7()).toString(),n=!0;else {const r=t.startsWith("//")?new URL(t,s$7()):new URL(t),i=r.origin,o=new URL(s$7()).origin;if(n=i===o,i&&g$2(i,n))e=r.toString();else return}return e.endsWith("/")||(e=`${e}/`),`${e}UI5/`}catch{return}};

	let t$6;i$6(()=>{t$6=void 0;});const r$6=()=>(t$6===void 0&&(t$6=T$2()),t$6),f$4=(e,o)=>`${o}Base/baseLib/${e}/css_variables.css`,s$3=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o);const n=r$6();if(!n)return;const i=l$2(n);if(!i){console.warn(`The ${n} is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`);return}await d$3(f$4(e,i),{"sap-ui-webcomponents-theme":e});};

	const t$5=new Map;let e$1;const n$1=()=>(e$1||(e$1=new CSSStyleSheet),e$1),r$5=(o,s)=>{t$5.set(o,s);const S=Array.from(t$5.values()).join(`
`);n$1().replaceSync(S);};

	let _lib="ui5",_package="webcomponents-theming";const a$4="@"+_lib+"/"+_package,E=()=>m$4().has(a$4),U=async e=>{if(!E())return;const t=await L(a$4,e);t&&R$1(t,"data-ui5-theme-properties",a$4,e);},w$2=()=>{f$7("data-ui5-theme-properties",a$4);},I=async(e,t)=>{const o=[...m$4().entries()].map(async([s,{cssVariablesTarget:n}])=>{if(s===a$4)return;const i=await L(s,e,t);i&&(n==="root"?R$1(i,`data-ui5-component-properties-${h$2()}`,s):n==="host"&&r$5(s,i));});return Promise.all(o)},O$1=async e=>{const t=m$3();if(t)return t;const r=n$8("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(r$6())return await s$3(e),m$3()},b$2=async e=>{const t=await O$1(e);!t||e!==t.themeName?await U(e):w$2();const r=t&&t.themeName===e?e:void 0,o=t&&t.baseThemeName,s=w$3(e)?e:o||e$3;await I(s,r),B(o),r$7(e);};

	const d$2=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

	var n = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Regular.woff2) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72-Semibold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Semiboldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72-SemiboldDuplex";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex.woff2) format("woff2"),local("72-SemiboldDuplex");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-SemiboldDuplexfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex-full.woff2) format("woff2")}
@font-face{font-family:"72-Light";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Lightfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72Black";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Blackfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72-BoldItalic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic-full.woff2) format("woff2")}
@font-face{font-family:"72-Condensed";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Condensed-full.woff2) format("woff2");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-CondensedBold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold-full.woff2) format("woff2")}
@font-face{font-family:"72-Italic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Italic-full.woff2) format("woff2")}
@font-face{font-family:"72Mono";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular.woff2) format("woff2"),local("72Mono");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Monofull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72Mono-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold.woff2) format("woff2"),local("72Mono-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Mono-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold-full.woff2) format("woff2")}`;

	let o$2;i$6(()=>{o$2=void 0;});const a$3=()=>(o$2===void 0&&(o$2=F()),o$2);

	const a$2=()=>{const t=n$8("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&f$3();},f$3=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$3()||t||S$1("data-ui5-font-face")||c$7(n,"data-ui5-font-face");};

	var s$2 = ":root{--_ui5-cozy-size:var(--_ui5-f2d95f8);--_ui5-compact-size: ;--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5-cozy-size: ;--_ui5-compact-size:var(--_ui5-f2d95f8);--_ui5_content_density:compact}";

	const r$4=()=>{R$1(s$2,"data-ui5-system-css-vars");};

	var t$4 = "html:not(.ui5-content-native-scrollbars){scrollbar-color:var(--sapScrollBar_FaceColor) var(--sapScrollBar_TrackColor)}";

	const s$1=()=>{S$1("data-ui5-scrollbar-styles")||c$7(t$4,"data-ui5-scrollbar-styles");};

	const t$3=typeof document>"u",e={get userAgent(){return t$3?"":navigator.userAgent},get touch(){return t$3?false:"ontouchstart"in window||navigator.maxTouchPoints>0},get chrome(){return t$3?false:/(Chrome|CriOS)/.test(e.userAgent)},get firefox(){return t$3?false:/Firefox/.test(e.userAgent)},get safari(){return t$3?false:!e.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e.userAgent)},get webkit(){return t$3?false:/webkit/.test(e.userAgent)},get windows(){return t$3?false:navigator.platform.indexOf("Win")!==-1},get macOS(){return t$3?false:!!navigator.userAgent.match(/Macintosh|Mac OS X/i)},get iOS(){return t$3?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e.userAgent.match(/Mac/)&&"ontouchend"in document)},get android(){return t$3?false:!e.windows&&/Android/.test(e.userAgent)},get androidPhone(){return t$3?false:e.android&&/(?=android)(?=.*mobile)/i.test(e.userAgent)},get ipad(){return t$3?false:/ipad/i.test(e.userAgent)||/Macintosh/i.test(e.userAgent)&&"ontouchend"in document},_isPhone(){return u$1(),e.touch&&!r$3}};let o$1,i$2,r$3;const s=()=>{if(t$3||!e.windows)return  false;if(o$1===void 0){const n=e.userAgent.match(/Windows NT (\d+).(\d)/);o$1=n?parseFloat(n[1]):0;}return o$1>=8},c$1=()=>{if(t$3||!e.webkit)return  false;if(i$2===void 0){const n=e.userAgent.match(/(webkit)[ /]([\w.]+)/);i$2=n?parseFloat(n[1]):0;}return i$2>=537.1},u$1=()=>{if(t$3)return  false;if(r$3===void 0){if(e.ipad){r$3=true;return}if(e.touch){if(s()){r$3=true;return}if(e.chrome&&e.android){r$3=!/Mobile Safari\/[.0-9]+/.test(e.userAgent);return}let n=window.devicePixelRatio?window.devicePixelRatio:1;e.android&&c$1()&&(n=1),r$3=Math.min(window.screen.width/n,window.screen.height/n)>=600;return}r$3=e.userAgent.indexOf("Touch")!==-1||e.android&&!e.androidPhone;}},l$1=()=>e.touch,h=()=>e.safari,g$1=()=>e.chrome,b$1=()=>e.firefox,a$1=()=>(u$1(),(e.touch||s())&&r$3),d$1=()=>e._isPhone(),f$2=()=>t$3?false:!a$1()&&!d$1()||s(),m$2=()=>a$1()&&f$2(),w$1=()=>e.iOS,A$1=()=>e.macOS,P$1=()=>e.android||e.androidPhone;

	let t$2=false;const i$1=()=>{h()&&w$1()&&!t$2&&(document.body.addEventListener("touchstart",()=>{}),t$2=true);};

	let r$2=false,i,p=false;const m$1=new i$7,w=()=>r$2,O=t=>{if(!r$2){m$1.attachEvent("boot",t);return}t();},f$1=async()=>{const t=n$8("OpenUI5Support"),e=t?t.isOpenUI5Detected():false,o=n$8("F6Navigation");t&&(o&&o.destroy(),await t.init()),o&&!e&&o.init();},c=()=>{if(p)return;const t=n$8("OpenUI5Support");t&&(p=t.attachListeners());},u=async()=>{if(i!==void 0)return i;const t=async e=>{if(d$7(),typeof document>"u"){e();return}n$3(b),await f$1(),await d$2(),await b$2(r()),c(),a$2(),r$4(),s$1(),i$1(),e(),r$2=true,m$1.fireEvent("boot");};return i=new Promise(t),i},P=async()=>{await u(),await f$1(),c(),await b$2(r());},b=t=>{if(!r$2)return;const e=r(),o=A();(t===e||t===o)&&b$2(e);};

	const g=()=>m$9("ConfigChange.eventProvider",new i$7),r$1=()=>m$9("ConfigChange.values",{}),a="configChange",t$1=new Set,d=(n,e)=>{r$1()[n]=e,t$1.add(n);try{g().fireEvent(a,{name:n,value:e});}finally{t$1.delete(n);}},C$1=(n,e)=>{g().attachEvent(a,i=>{i.name===n&&!t$1.has(n)&&e(i.value);});},f=n=>r$1()[n];

	let t,o;i$6(()=>{t=void 0;}),C$1("theme",e=>{t=e,w()&&b$2(t).then(()=>b$3({themeAware:true}));});const r=()=>(t===void 0&&(t=f("theme")??C$3()),t),l=async e=>{t!==e&&(t=e,d("theme",e),w()&&(await b$2(t),await b$3({themeAware:true})));},y=()=>e$3,m=()=>{const e=r();return C(e)?!e.startsWith("sap_horizon"):!m$3()?.baseThemeName?.startsWith("sap_horizon")},C=e=>s$8.includes(e),A=()=>o,B=e=>{o=e;};

	exports.$ = $;
	exports.A = A$1;
	exports.C = C$1;
	exports.D = D;
	exports.I = I$1;
	exports.L = L$1;
	exports.O = O;
	exports.P = P$1;
	exports.P$1 = P;
	exports.P$2 = P$2;
	exports.R = R;
	exports.S = S;
	exports.S$1 = S$1;
	exports.U = U$2;
	exports.a = a$8;
	exports.a$1 = a$9;
	exports.a$2 = a$b;
	exports.a$3 = a$1;
	exports.b = b$4;
	exports.b$1 = b$3;
	exports.b$2 = b$1;
	exports.c = c$4;
	exports.c$1 = c$7;
	exports.c$2 = c$3;
	exports.c$3 = c$9;
	exports.d = d$1;
	exports.d$1 = d;
	exports.d$2 = d$8;
	exports.e = e$7;
	exports.e$1 = e$4;
	exports.f = f$5;
	exports.f$1 = f$2;
	exports.f$2 = f;
	exports.f$3 = f$8;
	exports.f$4 = f$6;
	exports.g = g$1;
	exports.g$1 = g$5;
	exports.h = h;
	exports.h$1 = h$3;
	exports.i = i$5;
	exports.i$1 = i$7;
	exports.i$2 = i$6;
	exports.i$3 = i$a;
	exports.l = l$1;
	exports.l$1 = l;
	exports.l$2 = l$4;
	exports.m = m$9;
	exports.m$1 = m;
	exports.m$2 = m$7;
	exports.m$3 = m$2;
	exports.n = n$8;
	exports.n$1 = n$1;
	exports.n$2 = n$7;
	exports.n$3 = n$5;
	exports.n$4 = n$2;
	exports.o = o$a;
	exports.o$1 = o$3;
	exports.p = p$1;
	exports.r = r;
	exports.r$1 = r$b;
	exports.s = s$9;
	exports.u = u$6;
	exports.u$1 = u$3;
	exports.u$2 = u;
	exports.w = w$4;
	exports.w$1 = w;
	exports.w$2 = w$1;
	exports.w$3 = w$6;
	exports.y = y$2;
	exports.y$1 = y;

}));
