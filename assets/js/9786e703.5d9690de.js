"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9641],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>y});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var i=r.createContext({}),p=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},d=function(e){var t=p(e.components);return r.createElement(i.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),m=p(n),c=o,y=m["".concat(i,".").concat(c)]||m[c]||u[c]||a;return n?r.createElement(y,s(s({ref:t},d),{},{components:n})):r.createElement(y,s({ref:t},d))}));function y(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,s=new Array(a);s[0]=c;var l={};for(var i in t)hasOwnProperty.call(t,i)&&(l[i]=t[i]);l.originalType=e,l[m]="string"==typeof e?e:o,s[1]=l;for(var p=2;p<a;p++)s[p]=n[p];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},26495:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>i,default:()=>c,frontMatter:()=>l,metadata:()=>p,toc:()=>m});var r=n(87462),o=n(63366),a=(n(67294),n(3905)),s=["components"],l={id_old:"version-1.3-system-status-options",title:"SystemStatusOptions",id:"system-status-options"},i=void 0,p={unversionedId:"typedefs/system-status-options",id:"version-1.3/typedefs/system-status-options",title:"SystemStatusOptions",description:"Properties",source:"@site/versioned_docs/version-1.3/typedefs/SystemStatusOptions.md",sourceDirName:"typedefs",slug:"/typedefs/system-status-options",permalink:"/docs/1.3/typedefs/system-status-options",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1674866175,formattedLastUpdatedAt:"Jan 28, 2023",frontMatter:{id_old:"version-1.3-system-status-options",title:"SystemStatusOptions",id:"system-status-options"},sidebar:"version-1.3/docs",previous:{title:"StealthOptions",permalink:"/docs/1.3/typedefs/stealth-options"},next:{title:"CheerioHandlePage",permalink:"/docs/1.3/typedefs/cheerio-handle-page"}},d={},m=[{value:"Properties",id:"properties",level:2},{value:"<code>currentHistorySecs</code>",id:"currenthistorysecs",level:3},{value:"<code>maxMemoryOverloadedRatio</code>",id:"maxmemoryoverloadedratio",level:3},{value:"<code>maxEventLoopOverloadedRatio</code>",id:"maxeventloopoverloadedratio",level:3},{value:"<code>maxCpuOverloadedRatio</code>",id:"maxcpuoverloadedratio",level:3},{value:"<code>maxClientOverloadedRatio</code>",id:"maxclientoverloadedratio",level:3},{value:"<code>snapshotter</code>",id:"snapshotter",level:3}],u={toc:m};function c(e){var t=e.components,n=(0,o.Z)(e,s);return(0,a.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("a",{name:"systemstatusoptions"}),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"currenthistorysecs"},(0,a.kt)("inlineCode",{parentName:"h3"},"currentHistorySecs")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 5")),(0,a.kt)("p",null,"Defines max age of snapshots used in the ",(0,a.kt)("a",{parentName:"p",href:"../api/system-status#getcurrentstatus",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"SystemStatus.getCurrentStatus()"))," measurement."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxmemoryoverloadedratio"},(0,a.kt)("inlineCode",{parentName:"h3"},"maxMemoryOverloadedRatio")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 0.2")),(0,a.kt)("p",null,"Sets the maximum ratio of overloaded snapshots in a memory sample. If the sample exceeds this ratio, the system will be overloaded."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxeventloopoverloadedratio"},(0,a.kt)("inlineCode",{parentName:"h3"},"maxEventLoopOverloadedRatio")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 0.6")),(0,a.kt)("p",null,"Sets the maximum ratio of overloaded snapshots in an event loop sample. If the sample exceeds this ratio, the system will be overloaded."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxcpuoverloadedratio"},(0,a.kt)("inlineCode",{parentName:"h3"},"maxCpuOverloadedRatio")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 0.4")),(0,a.kt)("p",null,"Sets the maximum ratio of overloaded snapshots in a CPU sample. If the sample exceeds this ratio, the system will be overloaded."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxclientoverloadedratio"},(0,a.kt)("inlineCode",{parentName:"h3"},"maxClientOverloadedRatio")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 0.3")),(0,a.kt)("p",null,"Sets the maximum ratio of overloaded snapshots in a Client sample. If the sample exceeds this ratio, the system will be overloaded."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"snapshotter"},(0,a.kt)("inlineCode",{parentName:"h3"},"snapshotter")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../api/snapshotter",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"Snapshotter"))),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"Snapshotter")," instance to be queried for ",(0,a.kt)("inlineCode",{parentName:"p"},"SystemStatus"),"."),(0,a.kt)("hr",null))}c.isMDXComponent=!0}}]);