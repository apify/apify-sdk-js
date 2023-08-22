"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9750],{84777:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>f,frontMatter:()=>p,metadata:()=>d,toc:()=>u});var o=n(87462),r=n(63366),i=(n(67294),n(3905)),a=["components"],p={id_old:"version-1.3-playwright-goto-options",title:"PlaywrightGotoOptions",id:"playwright-goto-options"},l=void 0,d={unversionedId:"typedefs/playwright-goto-options",id:"version-1.3/typedefs/playwright-goto-options",title:"PlaywrightGotoOptions",description:"Properties",source:"@site/versioned_docs/version-1.3/typedefs/PlaywrightGotoOptions.md",sourceDirName:"typedefs",slug:"/typedefs/playwright-goto-options",permalink:"/sdk/js/docs/1.3/typedefs/playwright-goto-options",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1692721412,formattedLastUpdatedAt:"Aug 22, 2023",frontMatter:{id_old:"version-1.3-playwright-goto-options",title:"PlaywrightGotoOptions",id:"playwright-goto-options"}},s={},u=[{value:"Properties",id:"properties",level:2},{value:"<code>timeout</code>",id:"timeout",level:3},{value:"<code>waitUntil</code>",id:"waituntil",level:3},{value:"<code>referer</code>",id:"referer",level:3}],c={toc:u},m="wrapper";function f(e){var t=e.components,n=(0,r.Z)(e,a);return(0,i.kt)(m,(0,o.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("a",{name:"playwrightgotooptions"}),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"timeout"},(0,i.kt)("inlineCode",{parentName:"h3"},"timeout")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"Maximum operation time in milliseconds, defaults to 30 seconds, pass ",(0,i.kt)("inlineCode",{parentName:"p"},"0")," to disable timeout. The default value can be changed by using the\nbrowserContext.setDefaultNavigationTimeout(timeout), browserContext.setDefaultTimeout(timeout), page.setDefaultNavigationTimeout(timeout) or\npage.setDefaultTimeout(timeout) methods."),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"waituntil"},(0,i.kt)("inlineCode",{parentName:"h3"},"waitUntil")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"&quot;domcontentloaded&quot;")," | ",(0,i.kt)("inlineCode",{parentName:"p"},"&quot;load&quot;")," | ",(0,i.kt)("inlineCode",{parentName:"p"},"&quot;networkidle&quot;")),(0,i.kt)("p",null,"When to consider operation succeeded, defaults to ",(0,i.kt)("inlineCode",{parentName:"p"},"load"),". Events can be either: - ",(0,i.kt)("inlineCode",{parentName:"p"},"'domcontentloaded'")," - consider operation to be finished when the\n",(0,i.kt)("inlineCode",{parentName:"p"},"DOMContentLoaded")," event is fired. - ",(0,i.kt)("inlineCode",{parentName:"p"},"'load'")," - consider operation to be finished when the ",(0,i.kt)("inlineCode",{parentName:"p"},"load")," event is fired. - ",(0,i.kt)("inlineCode",{parentName:"p"},"'networkidle'")," - consider\noperation to be finished when there are no network connections for at least ",(0,i.kt)("inlineCode",{parentName:"p"},"500")," ms."),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"referer"},(0,i.kt)("inlineCode",{parentName:"h3"},"referer")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("p",null,"Referer header value. If provided it will take preference over the referer header value set by page.setExtraHTTPHeaders(headers)."),(0,i.kt)("hr",null))}f.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var o=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=o.createContext({}),d=function(e){var t=o.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},s=function(e){var t=d(e.components);return o.createElement(l.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},m=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),u=d(n),m=r,f=u["".concat(l,".").concat(m)]||u[m]||c[m]||i;return n?o.createElement(f,a(a({ref:t},s),{},{components:n})):o.createElement(f,a({ref:t},s))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,a=new Array(i);a[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[u]="string"==typeof e?e:r,a[1]=p;for(var d=2;d<i;d++)a[d]=n[d];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}m.displayName="MDXCreateElement"}}]);