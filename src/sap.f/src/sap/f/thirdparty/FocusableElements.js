sap.ui.define(['exports', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/Theme'], (function (exports, ListItemBase, webcomponentsBase, Theme) { 'use strict';

	const n=/^(?:a|area)$/i,a=/^(?:input|select|textarea|button)$/i,r=e=>{if(e.disabled)return  false;const t=e.getAttribute("tabindex");return t!=null?parseInt(t)>=0:a.test(e.nodeName)||n.test(e.nodeName)&&!!e.href};

	const c=e=>e.hasAttribute("data-ui5-focus-trap"),d=e=>{const l=getComputedStyle(e);return e.scrollHeight>e.clientHeight&&["scroll","auto"].indexOf(l.overflowY)>=0||e.scrollWidth>e.clientWidth&&["scroll","auto"].indexOf(l.overflowX)>=0},b=async(e,l)=>!e||ListItemBase.i(e)?null:u(e,true),H=async(e,l)=>!e||ListItemBase.i(e)?null:u(e,false),T=e=>e.hasAttribute("data-ui5-focus-redirect")||!ListItemBase.i(e),L=e=>{if(webcomponentsBase.v(e)){const l=e.getAttribute("tabindex");if(l!==null&&parseInt(l)<0)return  true}return  false},u=async(e,l,r$1)=>{let t,s,n=-1;e.shadowRoot?t=l?e.shadowRoot.firstElementChild:e.shadowRoot.lastElementChild:e instanceof HTMLSlotElement&&e.assignedNodes()?(s=e.assignedElements(),n=l?0:s.length-1,t=s[n]):t=l?e.firstElementChild:e.lastElementChild;let i;for(;t;){const m=t;if(!ListItemBase.i(m)&&!L(m)){if(webcomponentsBase.v(t)&&(await t._waitForDomRef(),t=t.getDomRef()),!t||ListItemBase.i(t))return null;if(t.nodeType===1&&T(t)&&!c(t)){if(r(t)||(i=await u(t,l),!Theme.h()&&!i&&d(t)))return t&&typeof t.focus=="function"?t:null;if(i)return i&&typeof i.focus=="function"?i:null}}t=l?m.nextElementSibling:m.previousElementSibling,s&&!s[n].contains(t)&&(n=l?n+1:n-1,t=s[n]);}return null};

	exports.H = H;
	exports.b = b;

}));
