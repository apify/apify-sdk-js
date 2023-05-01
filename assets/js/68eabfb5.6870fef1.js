"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4331],{98004:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>m,frontMatter:()=>s,metadata:()=>i,toc:()=>c});var r=n(87462),o=n(63366),p=(n(67294),n(3905)),a=["components"],s={id_old:"version-1.3-post-response-inputs",title:"PostResponseInputs",id:"post-response-inputs"},l=void 0,i={unversionedId:"typedefs/post-response-inputs",id:"version-1.3/typedefs/post-response-inputs",title:"PostResponseInputs",description:"Properties",source:"@site/versioned_docs/version-1.3/typedefs/PostResponseInputs.md",sourceDirName:"typedefs",slug:"/typedefs/post-response-inputs",permalink:"/sdk/js/docs/1.3/typedefs/post-response-inputs",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1682970883,formattedLastUpdatedAt:"May 1, 2023",frontMatter:{id_old:"version-1.3-post-response-inputs",title:"PostResponseInputs",id:"post-response-inputs"}},u={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>response</code>",id:"response",level:3},{value:"<code>request</code>",id:"request",level:3},{value:"<code>session</code>",id:"session",level:3},{value:"<code>proxyInfo</code>",id:"proxyinfo",level:3},{value:"<code>crawler</code>",id:"crawler",level:3}],d={toc:c},f="wrapper";function m(e){var t=e.components,n=(0,o.Z)(e,a);return(0,p.kt)(f,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,p.kt)("a",{name:"postresponseinputs"}),(0,p.kt)("h2",{id:"properties"},"Properties"),(0,p.kt)("h3",{id:"response"},(0,p.kt)("inlineCode",{parentName:"h3"},"response")),(0,p.kt)("p",null,(0,p.kt)("strong",{parentName:"p"},"Type"),": ",(0,p.kt)("inlineCode",{parentName:"p"},"IncomingMessage")," | ",(0,p.kt)("inlineCode",{parentName:"p"},"Readable")),(0,p.kt)("p",null,"stream"),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"request"},(0,p.kt)("inlineCode",{parentName:"h3"},"request")),(0,p.kt)("p",null,(0,p.kt)("strong",{parentName:"p"},"Type"),": ",(0,p.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,p.kt)("inlineCode",{parentName:"a"},"Request"))),(0,p.kt)("p",null,"Original instance fo the {Request} object. Must be modified in-place."),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"session"},(0,p.kt)("inlineCode",{parentName:"h3"},"session")),(0,p.kt)("p",null,(0,p.kt)("strong",{parentName:"p"},"Type"),": ",(0,p.kt)("a",{parentName:"p",href:"../api/session",target:null,rel:null},(0,p.kt)("inlineCode",{parentName:"a"},"Session"))),(0,p.kt)("p",null,"The current session"),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"proxyinfo"},(0,p.kt)("inlineCode",{parentName:"h3"},"proxyInfo")),(0,p.kt)("p",null,(0,p.kt)("strong",{parentName:"p"},"Type"),": ",(0,p.kt)("a",{parentName:"p",href:"../typedefs/proxy-info",target:null,rel:null},(0,p.kt)("inlineCode",{parentName:"a"},"ProxyInfo"))),(0,p.kt)("p",null,"An object with information about currently used proxy by the crawler and configured by the ",(0,p.kt)("a",{parentName:"p",href:"../api/proxy-configuration",target:null,rel:null},(0,p.kt)("inlineCode",{parentName:"a"},"ProxyConfiguration"))," class."),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"crawler"},(0,p.kt)("inlineCode",{parentName:"h3"},"crawler")),(0,p.kt)("p",null,(0,p.kt)("strong",{parentName:"p"},"Type"),": ",(0,p.kt)("a",{parentName:"p",href:"../api/cheerio-crawler",target:null,rel:null},(0,p.kt)("inlineCode",{parentName:"a"},"CheerioCrawler"))),(0,p.kt)("hr",null))}m.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},p=Object.keys(e);for(r=0;r<p.length;r++)n=p[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(r=0;r<p.length;r++)n=p[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),i=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=i(e.components);return r.createElement(l.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,p=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),c=i(n),f=o,m=c["".concat(l,".").concat(f)]||c[f]||d[f]||p;return n?r.createElement(m,a(a({ref:t},u),{},{components:n})):r.createElement(m,a({ref:t},u))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var p=n.length,a=new Array(p);a[0]=f;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[c]="string"==typeof e?e:o,a[1]=s;for(var i=2;i<p;i++)a[i]=n[i];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"}}]);