sap.ui.define(['module', 'exports'], (function (module, exports) { 'use strict';

	const o$c=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

	const u$c=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$c=()=>typeof document>"u"?null:o$c('meta[name="ui5-shared-resources"]',document.head,u$c),m$a=(t,o)=>{const r=t.split(".");let e=l$c();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

	const g$8=m$a("Tags",new Map),d$a=new Set;let i$e=new Map,c$g;const m$9=-1,h$5=e=>{d$a.add(e),g$8.set(e,h$4());},w$7=e=>d$a.has(e),R$2=()=>d$a.size>0,T$4=()=>[...d$a.values()],$$1=e=>{let n=g$8.get(e);n===void 0&&(n=m$9),i$e.has(n)||i$e.set(n,new Set),i$e.get(n).add(e),c$g||(c$g=setTimeout(()=>{y$6(),i$e=new Map,c$g=void 0;},1e3));},y$6=()=>{const e=b$5(),n=h$4(),l=e[n];let t="Multiple UI5 Web Components instances detected.";e.length>1&&(t=`${t}
Loading order (versions before 1.1.0 not listed): ${e.map(s=>`
${s.description}`).join("")}`),[...i$e.keys()].forEach(s=>{let o,r;s===m$9?(o=1,r={description:"Older unknown runtime"}):(o=I$2(n,s),r=e[s]);let a;o>0?a="an older":o<0?a="a newer":a="the same",t=`${t}

"${l.description}" failed to define ${i$e.get(s).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...i$e.get(s)].sort().join(", ")}.`,o>0?t=`${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!`:t=`${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;}),t=`${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md.`,console.warn(t);};

	const e$9={version:"2.23.2",major:2,minor:23,patch:2,suffix:"",isNext:false,buildTime:1782484484};

	let s$e,t$j={include:[/./],exclude:[]};const o$b=new Map,p$3=e=>{if(!e.match(/^[a-zA-Z0-9_-]+$/))throw new Error("Only alphanumeric characters and dashes allowed for the scoping suffix");R$2()&&console.warn("Setting the scoping suffix must be done before importing any components. For proper usage, read the scoping section: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md."),s$e=e;},c$f=()=>s$e,g$7=e=>{if(!e||!e.include)throw new Error('"rules" must be an object with at least an "include" property');if(!Array.isArray(e.include)||e.include.some(n=>!(n instanceof RegExp)))throw new Error('"rules.include" must be an array of regular expressions');if(e.exclude&&(!Array.isArray(e.exclude)||e.exclude.some(n=>!(n instanceof RegExp))))throw new Error('"rules.exclude" must be an array of regular expressions');e.exclude=e.exclude||[],t$j=e,o$b.clear();},m$8=()=>t$j,i$d=e=>{if(!o$b.has(e)){const n=t$j.include.some(r=>e.match(r))&&!t$j.exclude.some(r=>e.match(r));o$b.set(e,n);}return o$b.get(e)},d$9=e=>{if(i$d(e))return c$f()},f$b=(e,n=false)=>{if(!n)return e;const r=`v${e$9.version.replaceAll(".","-")}`,a=/(--_?ui5)([^,:)\s]+)/g;return e.replaceAll(a,`$1-${r}$2`)};

	let s$d,u$b="";const c$e=new Map,o$a=m$a("Runtimes",[]),d$8=()=>{if(s$d===void 0){s$d=o$a.length;const e=e$9;o$a.push({...e,get scopingSuffix(){return c$f()},get registeredTags(){return T$4()},get scopingRules(){return m$8()},alias:u$b,description:`Runtime ${s$d} - ver ${e.version}${""}`,importMetaUrl:new URL(sap.ui.require.toUrl("sap/f/thirdparty/Icons"), document.baseURI).href});}},h$4=()=>s$d,a$e=(e,t)=>{if(e.isNext||t.isNext)return e.buildTime-t.buildTime;const r=e.major-t.major;if(r)return r;const n=e.minor-t.minor;if(n)return n;const i=e.patch-t.patch;return i||new Intl.Collator(void 0,{numeric:true,sensitivity:"base"}).compare(e.suffix,t.suffix)},I$2=(e,t)=>{const r=`${e},${t}`;if(c$e.has(r))return c$e.get(r);const n=o$a[e],i=o$a[t];if(!n||!i)throw new Error("Invalid runtime index supplied");const m=a$e(n,i);return c$e.set(r,m),m},b$5=()=>o$a;

	const c$d=typeof document>"u",i$c=(e,t)=>t?`${e}|${t}`:e,l$b=e=>e===void 0?true:I$2(h$4(),parseInt(e))>=1,y$5=(e,t,r="",s)=>{const d=h$4(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$c(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},S$1=(e,t,r="",s)=>{if(c$d)return;const d=h$4(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$c(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$b(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},a$d=(e,t="")=>c$d?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$c(e,t)),f$a=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$c(e,t));},R$1=(e,t,r="",s)=>{a$d(t,r)?S$1(e,t,r,s):y$5(e,t,r,s);},m$7=(e,t)=>e===void 0?t:t===void 0?e:`${e} ${t}`;

	const e$8=new Map,s$c=(t,r)=>{e$8.set(t,r);},n$f=t=>e$8.get(t);

	var c$c={},e$7=c$c.hasOwnProperty,a$c=c$c.toString,o$9=e$7.toString,l$a=o$9.call(Object),i$b=function(r){var t,n;return !r||a$c.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$7.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$9.call(n)===l$a):true)};

	var c$b=Object.create(null),u$a=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?void 0:c$b;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$b(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$b(n)?n:{},r[a]=u$a(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

	const e$6=function(n,t){return u$a(true,false,...arguments)};

	const _$1={themes:{default:"sap_horizon",all:["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_horizon","sap_horizon_auto","sap_horizon_dark","sap_horizon_hc_auto","sap_horizon_hcb","sap_horizon_hcw"]},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$5=_$1.themes.default,s$b=_$1.themes.all,a$b=_$1.languages.default,r$i=_$1.locales.default,n$e=_$1.locales.all;

	var u$9=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$9||{});

	let i$a = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

	const e$4=new i$a,t$i="configurationReset",i$9=n=>{e$4.attachEvent(t$i,n);};

	const o$8=typeof document>"u",n$d={search(){return o$8?"":window.location.search}},i$8=()=>o$8?"":window.location.hostname,c$a=()=>o$8?"":window.location.port,a$a=()=>o$8?"":window.location.protocol,s$a=()=>o$8?"":window.location.href,u$8=()=>n$d.search();

	let g$6=false,t$h={animationMode:u$9.Full,theme:e$5,themeRoot:void 0,rtl:void 0,language:void 0,timezone:void 0,calendarType:void 0,secondaryCalendarType:void 0,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true,ignoreUrlParams:false};const y$4=()=>(o$7(),t$h.animationMode),C$5=()=>(o$7(),t$h.theme),T$3=()=>(o$7(),t$h.themeRoot),S=()=>(o$7(),t$h.language),U$2=()=>(o$7(),t$h.fetchDefaultLanguage),L$3=()=>(o$7(),t$h.noConflict),F=()=>(o$7(),t$h.defaultFontLoading),b$4=()=>(o$7(),t$h.enableDefaultTooltips),I$1=()=>(o$7(),t$h.ignoreUrlParams),D$2=()=>(o$7(),t$h.calendarType),R=()=>(o$7(),t$h.formatSettings),i$7=new Map;i$7.set("true",true),i$7.set("false",false);const M$1=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$h=e$6(t$h,e));}},z=()=>{const n=new URLSearchParams(u$8());n.forEach((e,r)=>{const a=r.split("sap-").length;a===0||a===r.split("sap-ui-").length||l$9(r,e,"sap");}),n.forEach((e,r)=>{r.startsWith("sap-ui")&&l$9(r,e,"sap-ui");});},E$1=n=>n.split("@")[1],w$6=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,l$9=(n,e,r)=>{const a=e.toLowerCase(),s=n.split(`${r}-`)[1];i$7.has(e)&&(e=i$7.get(a)),s==="theme"?(t$h.theme=w$6(s,e),e&&e.includes("@")&&(t$h.themeRoot=E$1(e))):t$h[s]=e;},j=()=>{const n=n$f("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$h=e$6(t$h,e);},o$7=()=>{typeof document>"u"||g$6||(u$7(),g$6=true);},u$7=n=>{M$1(),t$h.ignoreUrlParams||z(),j();};

	let l$8 = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

	const t$g=new Set,n$c=e=>{t$g.add(e);},r$h=e=>t$g.has(e);

	const i$6=new Set,m$6=new i$a,n$b=new l$8;let t$f,a$9,d$7,s$9;const l$7=async e=>{n$b.add(e),await U$1();},c$9=e=>{i$6.add(e);},f$9=e=>{i$6.delete(e);},u$6=e=>{m$6.fireEvent("beforeComponentRender",e),c$9(e),e._render();},P$2=e=>{n$b.remove(e),f$9(e);},U$1=async()=>{s$9||(s$9=new Promise(e=>{window.requestAnimationFrame(()=>{n$b.process(u$6),s$9=null,e(),d$7||(d$7=setTimeout(()=>{d$7=void 0,n$b.isEmpty()&&T$2();},200));});})),await s$9;},y$3=()=>t$f||(t$f=new Promise(e=>{a$9=e,window.requestAnimationFrame(()=>{n$b.isEmpty()&&(t$f=void 0,e());});}),t$f),C$4=()=>{const e=T$4().map(r=>customElements.whenDefined(r));return Promise.all(e)},w$5=async()=>{await C$4(),await y$3();},T$2=()=>{n$b.isEmpty()&&a$9&&(a$9(),a$9=void 0,t$f=void 0);},b$3=async e=>{i$6.forEach(r=>{const o=r.constructor,E=o.getMetadata().getTag(),p=r$h(o),g=o.getMetadata().isLanguageAware(),v=o.getMetadata().isThemeAware();(!e||e.tag===E||e.rtlAware&&p||e.languageAware&&g||e.themeAware&&v)&&l$7(r);}),await w$5();};

	const t$e=new i$a,r$g="themeRegistered",n$a=e=>{t$e.attachEvent(r$g,e);},s$8=e=>t$e.fireEvent(r$g,e);

	const l$6=new Map,T$1=new Map,h$3=new Map,u$5=new Map,a$8=new Set,f$8=(e,r,t,s="root")=>{T$1.set(`${e}/${r}`,t),u$5.set(e,{cssVariablesTarget:s}),a$8.add(r),s$8(r);},L$2=async(e,r,t)=>{const s=`${e}_${r}_${t||""}`,o=l$6.get(s);if(o!==void 0)return o;if(!a$8.has(r)){const p=[...a$8.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$5}. Registered themes are: ${p}`),c$8(e,e$5)}const[n,g]=await Promise.all([c$8(e,r),t?c$8(e,t,true):void 0]),i=m$7(n,g);return i&&l$6.set(s,i),i},c$8=async(e,r,t=false)=>{const o=(t?h$3:T$1).get(`${e}/${r}`);if(!o){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await o(r);}catch(g){console.error(e,g.message);return}return n},m$5=()=>u$5,w$4=e=>a$8.has(e);

	const r$f=new Set,s$7=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$6=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$f.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$f.add("decode"));return}try{return JSON.parse(a)}catch{r$f.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$f.add("parse"));}}},d$6=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$f.has("object")||(console.warn("Malformed theme metadata Object",e),r$f.add("object"));return}return {themeName:t,baseThemeName:a}},m$4=()=>{const e=s$7();if(!e||e==="none")return;const t=o$6(e);if(t)return d$6(t)};

	const t$d=new i$a,d$5="themeLoaded",o$5=e=>{t$d.attachEvent(d$5,e);},n$9=e=>{t$d.detachEvent(d$5,e);},r$e=e=>t$d.fireEvent(d$5,e);

	const d$4=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

	const a$7=t=>{const e=document.querySelector(`META[name="${t}"]`);return e&&e.getAttribute("content")},g$5=(t,e=false)=>{const n=a$7("sap-allowed-theme-origins")??a$7("sap-allowedThemeOrigins");return n?e?true:n.split(",").some(r=>r==="*"||t===r.trim()):false},l$5=t=>{let e,n=false;try{if(t.startsWith(".")||t.startsWith("/")&&!t.startsWith("//"))e=new URL(t,s$a()).toString(),n=!0;else {const r=t.startsWith("//")?new URL(t,s$a()):new URL(t),i=r.origin,o=new URL(s$a()).origin;if(n=i===o,i&&g$5(i,n))e=r.toString();else return}return e.endsWith("/")||(e=`${e}/`),`${e}UI5/`}catch{return}};

	let t$c;i$9(()=>{t$c=void 0;});const r$d=()=>(t$c===void 0&&(t$c=T$3()),t$c),f$7=(e,o)=>`${o}Base/baseLib/${e}/css_variables.css`,s$6=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o);const n=r$d();if(!n)return;const i=l$5(n);if(!i){console.warn(`The ${n} is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`);return}await d$4(f$7(e,i),{"sap-ui-webcomponents-theme":e});};

	const t$b=new Map;let e$3;const n$8=()=>(e$3||(e$3=new CSSStyleSheet),e$3),r$c=(o,s)=>{t$b.set(o,s);const S=Array.from(t$b.values()).join(`
`);n$8().replaceSync(S);};

	let _lib="ui5",_package="webcomponents-theming";const a$6="@"+_lib+"/"+_package,E=()=>m$5().has(a$6),U=async e=>{if(!E())return;const t=await L$2(a$6,e);t&&R$1(t,"data-ui5-theme-properties",a$6,e);},w$3=()=>{f$a("data-ui5-theme-properties",a$6);},I=async(e,t)=>{const o=[...m$5().entries()].map(async([s,{cssVariablesTarget:n}])=>{if(s===a$6)return;const i=await L$2(s,e,t);i&&(n==="root"?R$1(i,`data-ui5-component-properties-${h$4()}`,s):n==="host"&&r$c(s,i));});return Promise.all(o)},O$1=async e=>{const t=m$4();if(t)return t;const r=n$f("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(r$d())return await s$6(e),m$4()},b$2=async e=>{const t=await O$1(e);!t||e!==t.themeName?await U(e):w$3();const r=t&&t.themeName===e?e:void 0,o=t&&t.baseThemeName,s=w$4(e)?e:o||e$5;await I(s,r),B$1(o),r$e(e);};

	const d$3=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

	var r$b = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.36.3/content/Base/baseLib/baseTheme/fonts/72-Regular.woff2) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
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

	let o$4;i$9(()=>{o$4=void 0;});const a$5=()=>(o$4===void 0&&(o$4=F()),o$4);

	const n$7=()=>{const t=n$f("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&a$4();},a$4=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$5()||t||R$1(r$b,"data-ui5-font-face");};

	var s$5 = ":root{--_ui5-cozy-size:var(--_ui5-f2d95f8);--_ui5-compact-size: ;--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5-cozy-size: ;--_ui5-compact-size:var(--_ui5-f2d95f8);--_ui5_content_density:compact}";

	const r$a=()=>{R$1(s$5,"data-ui5-system-css-vars");};

	var t$a = "html:not(.ui5-content-native-scrollbars){scrollbar-color:var(--sapScrollBar_FaceColor) var(--sapScrollBar_TrackColor)}";

	const l$4=()=>{R$1(t$a,"data-ui5-scrollbar-styles");};

	const t$9=typeof document>"u",e$2={get userAgent(){return t$9?"":navigator.userAgent},get touch(){return t$9?false:"ontouchstart"in window||navigator.maxTouchPoints>0},get chrome(){return t$9?false:/(Chrome|CriOS)/.test(e$2.userAgent)},get firefox(){return t$9?false:/Firefox/.test(e$2.userAgent)},get safari(){return t$9?false:!e$2.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e$2.userAgent)},get webkit(){return t$9?false:/webkit/.test(e$2.userAgent)},get windows(){return t$9?false:navigator.platform.indexOf("Win")!==-1},get macOS(){return t$9?false:!!navigator.userAgent.match(/Macintosh|Mac OS X/i)},get iOS(){return t$9?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e$2.userAgent.match(/Mac/)&&"ontouchend"in document)},get android(){return t$9?false:!e$2.windows&&/Android/.test(e$2.userAgent)},get androidPhone(){return t$9?false:e$2.android&&/(?=android)(?=.*mobile)/i.test(e$2.userAgent)},get ipad(){return t$9?false:/ipad/i.test(e$2.userAgent)||/Macintosh/i.test(e$2.userAgent)&&"ontouchend"in document},_isPhone(){return u$4(),e$2.touch&&!r$9}};let o$3,i$5,r$9;const s$4=()=>{if(t$9||!e$2.windows)return  false;if(o$3===void 0){const n=e$2.userAgent.match(/Windows NT (\d+).(\d)/);o$3=n?parseFloat(n[1]):0;}return o$3>=8},c$7=()=>{if(t$9||!e$2.webkit)return  false;if(i$5===void 0){const n=e$2.userAgent.match(/(webkit)[ /]([\w.]+)/);i$5=n?parseFloat(n[1]):0;}return i$5>=537.1},u$4=()=>{if(t$9)return  false;if(r$9===void 0){if(e$2.ipad){r$9=true;return}if(e$2.touch){if(s$4()){r$9=true;return}if(e$2.chrome&&e$2.android){r$9=!/Mobile Safari\/[.0-9]+/.test(e$2.userAgent);return}let n=window.devicePixelRatio?window.devicePixelRatio:1;e$2.android&&c$7()&&(n=1),r$9=Math.min(window.screen.width/n,window.screen.height/n)>=600;return}r$9=e$2.userAgent.indexOf("Touch")!==-1||e$2.android&&!e$2.androidPhone;}},l$3=()=>e$2.touch,h$2=()=>e$2.safari,g$4=()=>e$2.chrome,b$1=()=>e$2.firefox,a$3=()=>(u$4(),(e$2.touch||s$4())&&r$9),d$2=()=>e$2._isPhone(),f$6=()=>t$9?false:!a$3()&&!d$2()||s$4(),m$3=()=>a$3()&&f$6(),w$2=()=>e$2.iOS,A$2=()=>e$2.macOS,P$1=()=>e$2.android||e$2.androidPhone;

	let t$8=false;const i$4=()=>{h$2()&&w$2()&&!t$8&&(document.body.addEventListener("touchstart",()=>{}),t$8=true);};

	let r$8=false,i$3,p$2=false;const m$2=new i$a,w$1=()=>r$8,O=t=>{if(!r$8){m$2.attachEvent("boot",t);return}t();},f$5=async()=>{const t=n$f("OpenUI5Support"),e=t?t.isOpenUI5Detected():false,o=n$f("F6Navigation");t&&(o&&o.destroy(),await t.init()),o&&!e&&o.init();},c$6=()=>{if(p$2)return;const t=n$f("OpenUI5Support");t&&(p$2=t.attachListeners());},u$3=async()=>{if(i$3!==void 0)return i$3;const t=async e=>{if(d$8(),typeof document>"u"){e();return}n$a(b),await f$5(),await d$3(),await b$2(r$6()),c$6(),n$7(),r$a(),l$4(),i$4(),e(),r$8=true,m$2.fireEvent("boot");};return i$3=new Promise(t),i$3},P=async()=>{await u$3(),await f$5(),c$6(),await b$2(r$6());},b=t=>{if(!r$8)return;const e=r$6(),o=A$1();(t===e||t===o)&&b$2(e);};

	const g$3=()=>m$a("ConfigChange.eventProvider",new i$a),r$7=()=>m$a("ConfigChange.values",{}),a$2="configChange",t$7=new Set,d$1=(n,e)=>{r$7()[n]=e,t$7.add(n);try{g$3().fireEvent(a$2,{name:n,value:e});}finally{t$7.delete(n);}},C$3=(n,e)=>{g$3().attachEvent(a$2,i=>{i.name===n&&!t$7.has(n)&&e(i.value);});},f$4=n=>r$7()[n];

	let t$6,o$2;i$9(()=>{t$6=void 0;}),C$3("theme",e=>{t$6=e,w$1()&&b$2(t$6).then(()=>b$3({themeAware:true}));});const r$6=()=>(t$6===void 0&&(t$6=f$4("theme")??C$5()),t$6),l$2=async e=>{t$6!==e&&(t$6=e,d$1("theme",e),w$1()&&(await b$2(t$6),await b$3({themeAware:true})));},y$2=()=>e$5,m$1=()=>{const e=r$6();return C$2(e)?!e.startsWith("sap_horizon"):!m$4()?.baseThemeName?.startsWith("sap_horizon")},C$2=e=>s$b.includes(e),A$1=()=>o$2,B$1=e=>{o$2=e;};

	const t$5=typeof document>"u",o$1=()=>{if(t$5)return a$b;const a=navigator.languages,n=()=>navigator.language;return a&&a[0]||n()||a$b};

	const e$1=new i$a,n$6="languageChange",t$4=a=>{e$1.attachEvent(n$6,a);},r$5=a=>{e$1.detachEvent(n$6,a);},o=a=>e$1.fireEventAsync(n$6,a);

	let n$5,t$3;i$9(()=>{n$5=void 0,t$3=void 0;});let a$1=false;C$3("language",e=>{n$5=e,a$1=true,o(e).then(()=>{a$1=false,w$1()&&b$3({languageAware:true});});});const c$5=()=>a$1,L$1=()=>(n$5===void 0&&(n$5=f$4("language")??S()),n$5),h$1=async e=>{n$5!==e&&(a$1=true,n$5=e,d$1("language",e),await o(e),a$1=false,w$1()&&await b$3({languageAware:true}));},C$1=()=>a$b,p$1=e=>{t$3=e;},D$1=()=>(t$3===void 0&&(t$3=U$2()),t$3);

	const n$4=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;let r$4 = class r{constructor(s){const t=n$4.exec(s.replace(/_/g,"-"));if(t===null)throw new Error(`The given language ${s} does not adhere to BCP-47.`);this.sLocaleId=s,this.sLanguage=t[1]||a$b,this.sScript=t[2]||"",this.sRegion=t[3]||"",this.sVariant=t[4]&&t[4].slice(1)||null,this.sExtension=t[5]&&t[5].slice(1)||null,this.sPrivateUse=t[6]||null,this.sLanguage&&(this.sLanguage=this.sLanguage.toLowerCase()),this.sScript&&(this.sScript=this.sScript.toLowerCase().replace(/^[a-z]/,i=>i.toUpperCase())),this.sRegion&&(this.sRegion=this.sRegion.toUpperCase());}getLanguage(){return this.sLanguage}getScript(){return this.sScript}getRegion(){return this.sRegion}getVariant(){return this.sVariant}getVariantSubtags(){return this.sVariant?this.sVariant.split("-"):[]}getExtension(){return this.sExtension}getExtensionSubtags(){return this.sExtension?this.sExtension.slice(2).split("-"):[]}getPrivateUse(){return this.sPrivateUse}getPrivateUseSubtags(){return this.sPrivateUse?this.sPrivateUse.slice(2).split("-"):[]}hasPrivateUseSubtag(s){return this.getPrivateUseSubtags().indexOf(s)>=0}toString(){const s=[this.sLanguage];return this.sScript&&s.push(this.sScript),this.sRegion&&s.push(this.sRegion),this.sVariant&&s.push(this.sVariant),this.sExtension&&s.push(this.sExtension),this.sPrivateUse&&s.push(this.sPrivateUse),s.join("-")}};

	const r$3=new Map,n$3=t=>(r$3.has(t)||r$3.set(t,new r$4(t)),r$3.get(t)),c$4=t=>{try{if(t&&typeof t=="string")return n$3(t)}catch{}return new r$4(r$i)},s$3=t=>{const e=L$1();return e?n$3(e):c$4(o$1())};

	const _=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i,c$3=/(?:^|-)(saptrc|sappsd)(?:-|$)/i,f$3={he:"iw",yi:"ji",nb:"no",sr:"sh"},p=i=>{let e;if(!i)return r$i;if(typeof i=="string"&&(e=_.exec(i.replace(/_/g,"-")))){let t=e[1].toLowerCase(),n=e[3]?e[3].toUpperCase():void 0;const s=e[2]?e[2].toLowerCase():void 0,r=e[4]?e[4].slice(1):void 0,o=e[6];return t=f$3[t]||t,o&&(e=c$3.exec(o))||r&&(e=c$3.exec(r))?`en_US_${e[1].toLowerCase()}`:(t==="zh"&&!n&&(s==="hans"?n="CN":s==="hant"&&(n="TW")),t+(n?"_"+n+(r?"_"+r.replace("-","_"):""):""))}return r$i};

	const r$2={zh_HK:"zh_TW",in:"id"},n$2=t=>{if(!t)return r$i;if(r$2[t])return r$2[t];const L=t.lastIndexOf("_");return L>=0?t.slice(0,L):t!==r$i?r$i:""};

	const d=new Set,m=new Set,g$2=new Map,l$1=new Map,u$2=new Map,$=(n,t,e)=>{const r=`${n}/${t}`;u$2.set(r,e);},f$2=(n,t)=>{g$2.set(n,t);},A=n=>g$2.get(n),h=(n,t)=>{const e=`${n}/${t}`;return u$2.has(e)},B=(n,t)=>{const e=`${n}/${t}`,r=u$2.get(e);return r&&!l$1.get(e)&&l$1.set(e,r(t)),l$1.get(e)},M=n=>{d.has(n)||(console.warn(`[${n}]: Message bundle assets are not configured. Falling back to English texts.`,` Add \`import "${n}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`),d.add(n));},L=(n,t)=>t!==a$b&&!h(n,t),w=async n=>{const t=s$3().getLanguage(),e=s$3().getRegion(),r=s$3().getVariant();let s=t+(e?`-${e}`:"")+(r?`-${r}`:"");if(L(n,s))for(s=p(s);L(n,s);)s=n$2(s);const I=D$1();if(s===a$b&&!I){f$2(n,null);return}if(!h(n,s)){M(n);return}try{const o=await B(n,s);f$2(n,o);}catch(o){const a=o;m.has(a.message)||(m.add(a.message),console.error(a.message));}};t$4(n=>{const t=[...g$2.keys()];return Promise.all(t.map(w))});

	const t$2=new Map,e=(n,o)=>{t$2.set(n,o);},c$2=n=>t$2.get(n);

	var t$1=(o=>(o.SAPIconsV4="SAP-icons-v4",o.SAPIconsV5="SAP-icons-v5",o.SAPIconsTNTV2="tnt-v2",o.SAPIconsTNTV3="tnt-v3",o.SAPBSIconsV1="business-suite-v1",o.SAPBSIconsV2="business-suite-v2",o))(t$1||{});const s$2=new Map;s$2.set("SAP-icons",{legacy:"SAP-icons-v4",sap_horizon:"SAP-icons-v5"}),s$2.set("tnt",{legacy:"tnt-v2",sap_horizon:"tnt-v3"}),s$2.set("business-suite",{legacy:"business-suite-v1",sap_horizon:"business-suite-v2"});const c$1=(n,e)=>{if(s$2.has(n)){s$2.set(n,{...e,...s$2.get(n)});return}s$2.set(n,e);},r$1=n=>{const e=m$1()?"legacy":"sap_horizon";return s$2.has(n)?s$2.get(n)[e]:n};

	var t=(s=>(s["SAP-icons"]="SAP-icons-v4",s.horizon="SAP-icons-v5",s["SAP-icons-TNT"]="tnt",s.BusinessSuiteInAppSymbols="business-suite",s))(t||{});const n$1=e=>t[e]?t[e]:e;

	const i$2=o=>{const t=c$2(r$6());return !o&&t?n$1(t):o?r$1(o):r$1("SAP-icons")};

	const g$1=/('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g,i$1=(n,t)=>(t=t||[],n.replace(g$1,(p,s,e,r,o)=>{if(s)return "'";if(e)return e.replace(/''/g,"'");if(r){const a=typeof r=="string"?parseInt(r):r;return String(t[a])}throw new Error(`[i18n]: pattern syntax error at pos ${o}`)}));

	const r=new Map;let s$1;let u$1 = class u{constructor(e){this.packageName=e;}getText(e,...i){if(typeof e=="string"&&(e={key:e,defaultText:e}),!e||!e.key)return "";const t=A(this.packageName);t&&!t[e.key]&&console.warn(`Key ${e.key} not found in the i18n bundle, the default text will be used`);const l=t&&t[e.key]?t[e.key]:e.defaultText||e.key;return i$1(l,i)}};const a=n=>{if(r.has(n))return r.get(n);const e=new u$1(n);return r.set(n,e),e},f$1=async n=>s$1?s$1(n):(await w(n),a(n)),y$1=n=>{s$1=n;};

	const T="legacy",s=new Map,c=m$a("SVGIcons.registry",new Map),i=m$a("SVGIcons.promises",new Map),l="ICON_NOT_FOUND",C=(e,t)=>{s.set(e,t);},N=async e=>{if(!i.has(e)){if(!s.has(e))throw new Error(`No loader registered for the ${e} icons collection. Probably you forgot to import the "AllIcons.js" module for the respective package.`);const t=s.get(e);i.set(e,t(e));}return i.get(e)},f=e=>{Object.keys(e.data).forEach(t=>{const o=e.data[t];y(t,{pathData:o.path||o.paths,ltr:o.ltr,viewBox:o.viewBox,accData:o.acc,collection:e.collection,packageName:e.packageName});});},y=(e,t)=>{const o=`${t.collection}/${e}`,a={collection:t.collection,packageName:t.packageName,pathData:t.pathData,viewBox:t.viewBox,ltr:t.ltr,accData:t.accData,customTemplate:t.customTemplate};c.set(o,a);},u=e=>{e.startsWith("sap-icon://")&&(e=e.replace("sap-icon://",""));let t;return [e,t]=e.split("/").reverse(),e=e.replace("icon-",""),t&&(t=n$1(t)),{name:e,collection:t}},D=e=>{const{name:t,collection:o}=u(e);return g(o,t)},n=async e=>{const{name:t,collection:o}=u(e);let a=l;try{a=await N(i$2(o));}catch(r){console.error(r.message);}if(a===l)return a;const p=g(o,t);return p||(Array.isArray(a)?a.forEach(r=>{f(r),c$1(o,{[r.themeFamily||T]:r.collection});}):f(a),g(o,t))},g=(e,t)=>{const o=`${i$2(e)}/${t}`;return c.get(o)},x=async e=>{if(!e)return;let t=D(e);if(t||(t=await n(e)),t&&t!==l&&t.accData)return t.packageName?(await f$1(t.packageName)).getText(t.accData):t.accData?.defaultText||""};

	exports.$ = $;
	exports.$$1 = $$1;
	exports.A = A$2;
	exports.C = C;
	exports.C$1 = C$1;
	exports.D = D;
	exports.D$1 = D$2;
	exports.D$2 = D$1;
	exports.I = I$1;
	exports.L = L$3;
	exports.L$1 = L$1;
	exports.O = O;
	exports.P = P$1;
	exports.P$1 = P;
	exports.P$2 = P$2;
	exports.R = R$1;
	exports.R$1 = R;
	exports.a = a$a;
	exports.a$1 = a$e;
	exports.a$2 = a$3;
	exports.b = b$4;
	exports.b$1 = b$3;
	exports.b$2 = b$1;
	exports.c = c$a;
	exports.c$1 = c$9;
	exports.c$2 = c$5;
	exports.c$3 = c$f;
	exports.c$4 = c$2;
	exports.d = d$2;
	exports.d$1 = d$9;
	exports.e = e$9;
	exports.e$1 = e$6;
	exports.e$2 = e;
	exports.f = f$8;
	exports.f$1 = f$6;
	exports.f$2 = f$1;
	exports.f$3 = f$b;
	exports.f$4 = f$9;
	exports.g = g$4;
	exports.g$1 = g$7;
	exports.h = h$2;
	exports.h$1 = h$5;
	exports.h$2 = h$1;
	exports.i = i$8;
	exports.i$1 = i$9;
	exports.i$2 = i$a;
	exports.i$3 = i$d;
	exports.i$4 = i$2;
	exports.l = l$3;
	exports.l$1 = l$2;
	exports.l$2 = l$7;
	exports.m = m$a;
	exports.m$1 = m$8;
	exports.m$2 = m$3;
	exports.n = n;
	exports.n$1 = n$f;
	exports.n$2 = n$8;
	exports.n$3 = n$e;
	exports.n$4 = n$c;
	exports.n$5 = n$9;
	exports.o = o$c;
	exports.o$1 = o$5;
	exports.p = p$3;
	exports.p$1 = p$1;
	exports.r = r$6;
	exports.r$1 = r$i;
	exports.r$2 = r$5;
	exports.s = s$c;
	exports.s$1 = s$3;
	exports.t = t$4;
	exports.t$1 = t$1;
	exports.u = u$1;
	exports.u$1 = u$9;
	exports.u$2 = u$6;
	exports.u$3 = u$3;
	exports.w = w$5;
	exports.w$1 = w$2;
	exports.w$2 = w$7;
	exports.x = x;
	exports.y = y;
	exports.y$1 = y$4;
	exports.y$2 = y$2;
	exports.y$3 = y$1;

}));
