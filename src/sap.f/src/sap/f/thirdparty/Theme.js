sap.ui.define(['exports'], (function (exports) { 'use strict';

	const o$a=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

	const u$8=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$a=()=>typeof document>"u"?null:o$a('meta[name="ui5-shared-resources"]',document.head,u$8),m$7=(t,o)=>{const r=t.split(".");let e=l$a();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

	const g$6=m$7("Tags",new Map),d$7=new Set;let i$d=new Map,c$7;const m$6=-1,h$4=e=>{d$7.add(e),g$6.set(e,I$1());},w$4=e=>d$7.has(e),R$2=()=>d$7.size>0,T$2=()=>[...d$7.values()],$$1=e=>{let n=g$6.get(e);n===void 0&&(n=m$6),i$d.has(n)||i$d.set(n,new Set),i$d.get(n).add(e),c$7||(c$7=setTimeout(()=>{y$2(),i$d=new Map,c$7=void 0;},1e3));},y$2=()=>{const e=$(),n=I$1(),l=e[n];let t="Multiple UI5 Web Components instances detected.";e.length>1&&(t=`${t}
Loading order (versions before 1.1.0 not listed): ${e.map(s=>`
${s.description}`).join("")}`),[...i$d.keys()].forEach(s=>{let o,r;s===m$6?(o=1,r={description:"Older unknown runtime"}):(o=b$3(n,s),r=e[s]);let a;o>0?a="an older":o<0?a="a newer":a="the same",t=`${t}

"${l.description}" failed to define ${i$d.get(s).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...i$d.get(s)].sort().join(", ")}.`,o>0?t=`${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!`:t=`${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;}),t=`${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md.`,console.warn(t);};

	const e$7={version:"2.15.0",major:2,minor:15,patch:0,suffix:"",isNext:false,buildTime:1759500145};

	let s$b,t$b={include:[/^ui5-/],exclude:[]};const o$9=new Map,l$9=e=>{if(!e.match(/^[a-zA-Z0-9_-]+$/))throw new Error("Only alphanumeric characters and dashes allowed for the scoping suffix");R$2()&&console.warn("Setting the scoping suffix must be done before importing any components. For proper usage, read the scoping section: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md."),s$b=e;},c$6=()=>s$b,p$3=e=>{if(!e||!e.include)throw new Error('"rules" must be an object with at least an "include" property');if(!Array.isArray(e.include)||e.include.some(n=>!(n instanceof RegExp)))throw new Error('"rules.include" must be an array of regular expressions');if(e.exclude&&(!Array.isArray(e.exclude)||e.exclude.some(n=>!(n instanceof RegExp))))throw new Error('"rules.exclude" must be an array of regular expressions');e.exclude=e.exclude||[],t$b=e,o$9.clear();},m$5=()=>t$b,i$c=e=>{if(!o$9.has(e)){const n=t$b.include.some(r=>e.match(r))&&!t$b.exclude.some(r=>e.match(r));o$9.set(e,n);}return o$9.get(e)},g$5=e=>{if(i$c(e))return c$6()},d$6=e=>{const n=`v${e$7.version.replaceAll(".","-")}`,r=/(--_?ui5)([^,:)\s]+)/g;return e.replaceAll(r,`$1-${n}$2`)};

	let i$b,s$a="";const u$7=new Map,r$8=m$7("Runtimes",[]),x=()=>{if(i$b===void 0){i$b=r$8.length;const e=e$7;r$8.push({...e,get scopingSuffix(){return c$6()},get registeredTags(){return T$2()},get scopingRules(){return m$5()},alias:s$a,description:`Runtime ${i$b} - ver ${e.version}${""}`});}},I$1=()=>i$b,b$3=(e,m)=>{const o=`${e},${m}`;if(u$7.has(o))return u$7.get(o);const t=r$8[e],n=r$8[m];if(!t||!n)throw new Error("Invalid runtime index supplied");if(t.isNext||n.isNext)return t.buildTime-n.buildTime;const c=t.major-n.major;if(c)return c;const a=t.minor-n.minor;if(a)return a;const f=t.patch-n.patch;if(f)return f;const l=new Intl.Collator(void 0,{numeric:true,sensitivity:"base"}).compare(t.suffix,n.suffix);return u$7.set(o,l),l},$=()=>r$8;

	const g$4=typeof document>"u",i$a=(e,t)=>t?`${e}|${t}`:e,l$8=e=>e===void 0?true:b$3(I$1(),parseInt(e))===1,c$5=(e,t,r="",s)=>{const d=I$1(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$a(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},y$1=(e,t,r="",s)=>{const d=I$1(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$a(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$8(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},S$2=(e,t="")=>g$4?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$a(e,t)),f$3=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$a(e,t));},R$1=(e,t,r="",s)=>{S$2(t,r)?y$1(e,t,r,s):c$5(e,t,r,s);},m$4=(e,t)=>e===void 0?t:t===void 0?e:`${e} ${t}`;

	const e$6=new Map,s$9=(t,r)=>{e$6.set(t,r);},n$8=t=>e$6.get(t);

	var c$4={},e$5=c$4.hasOwnProperty,a$9=c$4.toString,o$8=e$5.toString,l$7=o$8.call(Object),i$9=function(r){var t,n;return !r||a$9.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$5.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$8.call(n)===l$7):true)};

	var c$3=Object.create(null),u$6=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?void 0:c$3;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$9(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$9(n)?n:{},r[a]=u$6(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

	const e$4=function(n,t){return u$6(true,false,...arguments)};

	const _={themes:{default:"sap_horizon",all:["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_horizon","sap_horizon_dark","sap_horizon_hcb","sap_horizon_hcw"]},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$3=_.themes.default,s$8=_.themes.all,a$8=_.languages.default,r$7=_.locales.default,l$6=_.locales.all;

	const o$7=typeof document>"u",n$7={search(){return o$7?"":window.location.search}},i$8=()=>o$7?"":window.location.hostname,c$2=()=>o$7?"":window.location.port,a$7=()=>o$7?"":window.location.protocol,s$7=()=>o$7?"":window.location.href,u$5=()=>n$7.search();

	const s$6=e=>{const t=document.querySelector(`META[name="${e}"]`);return t&&t.getAttribute("content")},o$6=e=>{const t=s$6("sap-allowed-theme-origins")??s$6("sap-allowedThemeOrigins");return t?t.split(",").some(n=>n==="*"||e===n.trim()):false},a$6=(e,t)=>{const n=new URL(e).pathname;return new URL(n,t).toString()},g$3=e=>{let t;try{if(e.startsWith(".")||e.startsWith("/"))t=new URL(e,s$7()).toString();else {const n=new URL(e),r=n.origin;r&&o$6(r)?t=n.toString():t=a$6(n.toString(),s$7());}return t.endsWith("/")||(t=`${t}/`),`${t}UI5/`}catch{}};

	var u$4=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$4||{});

	let i$7 = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

	const e$2=new i$7,t$a="configurationReset",i$6=n=>{e$2.attachEvent(t$a,n);};

	let p$2=false,t$9={animationMode:u$4.Full,theme:e$3,themeRoot:void 0,rtl:void 0,language:void 0,timezone:void 0,calendarType:void 0,secondaryCalendarType:void 0,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true};const C$1=()=>(o$5(),t$9.animationMode),T$1=()=>(o$5(),t$9.theme),S$1=()=>{if(o$5(),t$9.themeRoot!==void 0){if(!g$3(t$9.themeRoot)){console.warn(`The ${t$9.themeRoot} is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`);return}return t$9.themeRoot}},L=()=>(o$5(),t$9.language),R=()=>(o$5(),t$9.fetchDefaultLanguage),F$1=()=>(o$5(),t$9.noConflict),U$2=()=>(o$5(),t$9.defaultFontLoading),b$2=()=>(o$5(),t$9.enableDefaultTooltips),D=()=>(o$5(),t$9.calendarType),M=()=>(o$5(),t$9.formatSettings),i$5=new Map;i$5.set("true",true),i$5.set("false",false);const w$3=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$9=e$4(t$9,e));}},z=()=>{const n=new URLSearchParams(u$5());n.forEach((e,r)=>{const a=r.split("sap-").length;a===0||a===r.split("sap-ui-").length||g$2(r,e,"sap");}),n.forEach((e,r)=>{r.startsWith("sap-ui")&&g$2(r,e,"sap-ui");});},E$1=n=>{const e=n.split("@")[1];return g$3(e)},P$5=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,g$2=(n,e,r)=>{const a=e.toLowerCase(),s=n.split(`${r}-`)[1];i$5.has(e)&&(e=i$5.get(a)),s==="theme"?(t$9.theme=P$5(s,e),e&&e.includes("@")&&(t$9.themeRoot=E$1(e))):t$9[s]=e;},j=()=>{const n=n$8("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$9=e$4(t$9,e);},o$5=()=>{typeof document>"u"||p$2||(l$5(),p$2=true);},l$5=n=>{w$3(),z(),j();};

	let l$4 = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

	const t$8=new Set,n$6=e=>{t$8.add(e);},r$6=e=>t$8.has(e);

	const s$5=new Set,d$5=new i$7,n$5=new l$4;let t$7,a$5,m$3,i$4;const l$3=async e=>{n$5.add(e),await P$4();},c$1=e=>{d$5.fireEvent("beforeComponentRender",e),s$5.add(e),e._render();},h$3=e=>{n$5.remove(e),s$5.delete(e);},P$4=async()=>{i$4||(i$4=new Promise(e=>{window.requestAnimationFrame(()=>{n$5.process(c$1),i$4=null,e(),m$3||(m$3=setTimeout(()=>{m$3=void 0,n$5.isEmpty()&&U$1();},200));});})),await i$4;},y=()=>t$7||(t$7=new Promise(e=>{a$5=e,window.requestAnimationFrame(()=>{n$5.isEmpty()&&(t$7=void 0,e());});}),t$7),I=()=>{const e=T$2().map(r=>customElements.whenDefined(r));return Promise.all(e)},f$2=async()=>{await I(),await y();},U$1=()=>{n$5.isEmpty()&&a$5&&(a$5(),a$5=void 0,t$7=void 0);},C=async e=>{s$5.forEach(r=>{const o=r.constructor,u=o.getMetadata().getTag(),w=r$6(o),p=o.getMetadata().isLanguageAware(),E=o.getMetadata().isThemeAware();(!e||e.tag===u||e.rtlAware&&w||e.languageAware&&p||e.themeAware&&E)&&l$3(r);}),await f$2();};

	const t$6=new i$7,r$5="themeRegistered",n$4=e=>{t$6.attachEvent(r$5,e);},s$4=e=>t$6.fireEvent(r$5,e);

	const l$2=new Map,h$2=new Map,u$3=new Map,T=new Set,i$3=new Set,p$1=(e,r,t)=>{h$2.set(`${e}/${r}`,t),T.add(e),i$3.add(r),s$4(r);},m$2=async(e,r,t)=>{const g=`${e}_${r}_${t||""}`,s=l$2.get(g);if(s!==void 0)return s;if(!i$3.has(r)){const $=[...i$3.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$3}. Registered themes are: ${$}`),a$4(e,e$3)}const[n,d]=await Promise.all([a$4(e,r),t?a$4(e,t,true):void 0]),o=m$4(n,d);return o&&l$2.set(g,o),o},a$4=async(e,r,t=false)=>{const s=(t?u$3:h$2).get(`${e}/${r}`);if(!s){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await s(r);}catch(d){console.error(e,d.message);return}return n},w$2=()=>T,P$3=e=>i$3.has(e);

	const r$4=new Set,s$3=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$4=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$4.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$4.add("decode"));return}try{return JSON.parse(a)}catch{r$4.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$4.add("parse"));}}},d$4=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$4.has("object")||(console.warn("Malformed theme metadata Object",e),r$4.add("object"));return}return {themeName:t,baseThemeName:a}},m$1=()=>{const e=s$3();if(!e||e==="none")return;const t=o$4(e);if(t)return d$4(t)};

	const t$5=new i$7,d$3="themeLoaded",o$3=e=>{t$5.attachEvent(d$3,e);},n$3=e=>{t$5.detachEvent(d$3,e);},r$3=e=>t$5.fireEvent(d$3,e);

	const d$2=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

	let t$4;i$6(()=>{t$4=void 0;});const n$2=()=>(t$4===void 0&&(t$4=S$1()),t$4),u$2=e=>`${n$2()}Base/baseLib/${e}/css_variables.css`,i$2=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o),await d$2(u$2(e),{"sap-ui-webcomponents-theme":e});};

	let _lib="ui5",_package="webcomponents-theming";const s$2="@"+_lib+"/"+_package,S=()=>w$2().has(s$2),P$2=async e=>{if(!S())return;const t=await m$2(s$2,e);t&&R$1(t,"data-ui5-theme-properties",s$2,e);},E=()=>{f$3("data-ui5-theme-properties",s$2);},U=async(e,t)=>{const o=[...w$2()].map(async a=>{if(a===s$2)return;const i=await m$2(a,e,t);i&&R$1(i,`data-ui5-component-properties-${I$1()}`,a);});return Promise.all(o)},k=async e=>{const t=m$1();if(t)return t;const r=n$8("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(n$2())return await i$2(e),m$1()},w$1=async e=>{const t=await k(e);!t||e!==t.themeName?await P$2(e):E();const r=P$3(e)?e:t&&t.baseThemeName;await U(r||e$3,t&&t.themeName===e?e:void 0),r$3(e);};

	const d$1=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

	var n$1 = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Regular.woff2) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72-Semibold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Semiboldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72-SemiboldDuplex";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex.woff2) format("woff2"),local("72-SemiboldDuplex");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-SemiboldDuplexfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex-full.woff2) format("woff2")}
@font-face{font-family:"72-Light";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Lightfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72Black";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Blackfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72-BoldItalic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic-full.woff2) format("woff2")}
@font-face{font-family:"72-Condensed";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed-full.woff2) format("woff2");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-CondensedBold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold-full.woff2) format("woff2")}
@font-face{font-family:"72-Italic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic-full.woff2) format("woff2")}
@font-face{font-family:"72Mono";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular.woff2) format("woff2"),local("72Mono");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Monofull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72Mono-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold.woff2) format("woff2"),local("72Mono-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Mono-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold-full.woff2) format("woff2")}`;

	let o$2;i$6(()=>{o$2=void 0;});const a$3=()=>(o$2===void 0&&(o$2=U$2()),o$2);

	const a$2=()=>{const t=n$8("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&f$1();},f$1=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$3()||t||S$2("data-ui5-font-face")||c$5(n$1,"data-ui5-font-face");};

	var a$1 = ":root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}";

	const e$1=()=>{S$2("data-ui5-system-css-vars")||c$5(a$1,"data-ui5-system-css-vars");};

	var t$3 = "html:not(:has(.ui5-content-native-scrollbars)){scrollbar-color:var(--sapScrollBar_FaceColor) var(--sapScrollBar_TrackColor)}";

	const s$1=()=>{S$2("data-ui5-scrollbar-styles")||c$5(t$3,"data-ui5-scrollbar-styles");};

	const t$2=typeof document>"u",e={get userAgent(){return t$2?"":navigator.userAgent},get touch(){return t$2?false:"ontouchstart"in window||navigator.maxTouchPoints>0},get chrome(){return t$2?false:/(Chrome|CriOS)/.test(e.userAgent)},get firefox(){return t$2?false:/Firefox/.test(e.userAgent)},get safari(){return t$2?false:!e.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e.userAgent)},get webkit(){return t$2?false:/webkit/.test(e.userAgent)},get windows(){return t$2?false:navigator.platform.indexOf("Win")!==-1},get macOS(){return t$2?false:!!navigator.userAgent.match(/Macintosh|Mac OS X/i)},get iOS(){return t$2?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e.userAgent.match(/Mac/)&&"ontouchend"in document)},get android(){return t$2?false:!e.windows&&/Android/.test(e.userAgent)},get androidPhone(){return t$2?false:e.android&&/(?=android)(?=.*mobile)/i.test(e.userAgent)},get ipad(){return t$2?false:/ipad/i.test(e.userAgent)||/Macintosh/i.test(e.userAgent)&&"ontouchend"in document},_isPhone(){return u$1(),e.touch&&!r$2}};let o$1,i$1,r$2;const s=()=>{if(t$2||!e.windows)return  false;if(o$1===void 0){const n=e.userAgent.match(/Windows NT (\d+).(\d)/);o$1=n?parseFloat(n[1]):0;}return o$1>=8},c=()=>{if(t$2||!e.webkit)return  false;if(i$1===void 0){const n=e.userAgent.match(/(webkit)[ /]([\w.]+)/);i$1=n?parseFloat(n[1]):0;}return i$1>=537.1},u$1=()=>{if(t$2)return  false;if(r$2===void 0){if(e.ipad){r$2=true;return}if(e.touch){if(s()){r$2=true;return}if(e.chrome&&e.android){r$2=!/Mobile Safari\/[.0-9]+/.test(e.userAgent);return}let n=window.devicePixelRatio?window.devicePixelRatio:1;e.android&&c()&&(n=1),r$2=Math.min(window.screen.width/n,window.screen.height/n)>=600;return}r$2=e.userAgent.indexOf("Touch")!==-1||e.android&&!e.androidPhone;}},l$1=()=>e.touch,h$1=()=>e.safari,g$1=()=>e.chrome,b=()=>e.firefox,a=()=>(u$1(),(e.touch||s())&&r$2),d=()=>e._isPhone(),f=()=>t$2?false:!a()&&!d()||s(),m=()=>a()&&f(),w=()=>e.iOS,A=()=>e.macOS,P$1=()=>e.android||e.androidPhone;

	let t$1=false;const i=()=>{h$1()&&w()&&!t$1&&(document.body.addEventListener("touchstart",()=>{}),t$1=true);};

	let o=false,r$1;const p=new i$7,h=()=>o,P=t=>{if(!o){p.attachEvent("boot",t);return}t();},b$1=async()=>{if(r$1!==void 0)return r$1;const t=async n=>{if(x(),typeof document>"u"){n();return}n$4(F);const e=n$8("OpenUI5Support"),f=e?e.isOpenUI5Detected():false,s=n$8("F6Navigation");e&&await e.init(),s&&!f&&s.init(),await d$1(),await w$1(r()),e&&e.attachListeners(),a$2(),e$1(),s$1(),i(),n(),o=true,p.fireEvent("boot");};return r$1=new Promise(t),r$1},F=t=>{o&&t===r()&&w$1(r());};

	let t;i$6(()=>{t=void 0;});const r=()=>(t===void 0&&(t=T$1()),t),u=async e=>{t!==e&&(t=e,h()&&(await w$1(t),await C({themeAware:true})));},g=()=>e$3,n=()=>{const e=r();return l(e)?!e.startsWith("sap_horizon"):!m$1()?.baseThemeName?.startsWith("sap_horizon")},l=e=>s$8.includes(e);

	exports.$ = $$1;
	exports.A = A;
	exports.C = C;
	exports.C$1 = C$1;
	exports.D = D;
	exports.F = F$1;
	exports.L = L;
	exports.M = M;
	exports.P = P;
	exports.P$1 = P$1;
	exports.R = R;
	exports.S = S$2;
	exports.a = a$7;
	exports.a$1 = a$8;
	exports.a$2 = a;
	exports.b = b$2;
	exports.b$1 = b$1;
	exports.b$2 = b;
	exports.c = c$2;
	exports.c$1 = c$5;
	exports.c$2 = c$1;
	exports.c$3 = c$6;
	exports.d = d;
	exports.d$1 = d$6;
	exports.e = e$4;
	exports.f = f;
	exports.f$1 = f$2;
	exports.g = g$1;
	exports.g$1 = g$5;
	exports.g$2 = g;
	exports.h = h$1;
	exports.h$1 = h;
	exports.h$2 = h$3;
	exports.h$3 = h$4;
	exports.i = i$8;
	exports.i$1 = i$7;
	exports.i$2 = i$6;
	exports.i$3 = i$c;
	exports.l = l$6;
	exports.l$1 = l$3;
	exports.l$2 = l$1;
	exports.l$3 = l$9;
	exports.m = m$7;
	exports.m$1 = m$5;
	exports.m$2 = m;
	exports.n = n;
	exports.n$1 = n$8;
	exports.n$2 = n$6;
	exports.n$3 = n$3;
	exports.o = o$a;
	exports.o$1 = o$3;
	exports.p = p$1;
	exports.p$1 = p$3;
	exports.r = r;
	exports.r$1 = r$7;
	exports.s = s$9;
	exports.u = u$4;
	exports.u$1 = u;
	exports.w = w;
	exports.w$1 = w$4;

}));
