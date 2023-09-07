"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9796],{81051:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>p,toc:()=>d});var r=n(87462),o=n(63366),i=(n(67294),n(3905)),s=["components"],a={id:"system-info",title:"SystemInfo"},l=void 0,p={unversionedId:"typedefs/system-info",id:"version-2.3/typedefs/system-info",title:"SystemInfo",description:"Represents the current status of the system.",source:"@site/versioned_docs/version-2.3/typedefs/SystemInfo.md",sourceDirName:"typedefs",slug:"/typedefs/system-info",permalink:"/sdk/js/docs/2.3/typedefs/system-info",draft:!1,tags:[],version:"2.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1694045722,formattedLastUpdatedAt:"Sep 7, 2023",frontMatter:{id:"system-info",title:"SystemInfo"},sidebar:"version-2.3/docs",previous:{title:"SocialHandles",permalink:"/sdk/js/docs/2.3/typedefs/social-handles"},next:{title:"Changelog",permalink:"/sdk/js/docs/2.3/changelog"}},c={},d=[{value:"Properties",id:"properties",level:2},{value:"<code>isSystemIdle</code>",id:"issystemidle",level:3},{value:"<code>memInfo</code>",id:"meminfo",level:3},{value:"<code>eventLoopInfo</code>",id:"eventloopinfo",level:3},{value:"<code>cpuInfo</code>",id:"cpuinfo",level:3}],f={toc:d},u="wrapper";function m(e){var t=e.components,n=(0,o.Z)(e,s);return(0,i.kt)(u,(0,r.Z)({},f,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("a",{name:"systeminfo"}),(0,i.kt)("p",null,"Represents the current status of the system."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"issystemidle"},(0,i.kt)("inlineCode",{parentName:"h3"},"isSystemIdle")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"If true, system is being overloaded."),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"meminfo"},(0,i.kt)("inlineCode",{parentName:"h3"},"memInfo")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Object<string, *>")),(0,i.kt)("p",null,"Memory"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"eventloopinfo"},(0,i.kt)("inlineCode",{parentName:"h3"},"eventLoopInfo")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Object<string, *>")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"cpuinfo"},(0,i.kt)("inlineCode",{parentName:"h3"},"cpuInfo")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Type"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Object<string, *>")),(0,i.kt)("hr",null))}m.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},d="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),d=p(n),u=o,m=d["".concat(l,".").concat(u)]||d[u]||f[u]||i;return n?r.createElement(m,s(s({ref:t},c),{},{components:n})):r.createElement(m,s({ref:t},c))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,s=new Array(i);s[0]=u;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a[d]="string"==typeof e?e:o,s[1]=a;for(var p=2;p<i;p++)s[p]=n[p];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);