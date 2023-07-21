"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8671],{88532:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>m,frontMatter:()=>o,metadata:()=>p,toc:()=>c});var r=n(87462),s=n(63366),a=(n(67294),n(3905)),i=["components"],o={id_old:"version-1.3-request-list-state",title:"RequestListState",id:"request-list-state"},l=void 0,p={unversionedId:"typedefs/request-list-state",id:"version-1.3/typedefs/request-list-state",title:"RequestListState",description:"Represents state of a RequestList. It can be used to resume a RequestList which has been previously",source:"@site/versioned_docs/version-1.3/typedefs/RequestListState.md",sourceDirName:"typedefs",slug:"/typedefs/request-list-state",permalink:"/sdk/js/docs/1.3/typedefs/request-list-state",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1689945596,formattedLastUpdatedAt:"Jul 21, 2023",frontMatter:{id_old:"version-1.3-request-list-state",title:"RequestListState",id:"request-list-state"},sidebar:"version-1.3/docs",previous:{title:"QueueOperationInfo",permalink:"/sdk/js/docs/1.3/typedefs/queue-operation-info"},next:{title:"SessionState",permalink:"/sdk/js/docs/1.3/typedefs/session-state"}},u={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>nextIndex</code>",id:"nextindex",level:3},{value:"<code>nextUniqueKey</code>",id:"nextuniquekey",level:3},{value:"<code>inProgress</code>",id:"inprogress",level:3}],d={toc:c},f="wrapper";function m(e){var t=e.components,n=(0,s.Z)(e,i);return(0,a.kt)(f,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("a",{name:"requestliststate"}),(0,a.kt)("p",null,"Represents state of a ",(0,a.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"RequestList")),". It can be used to resume a ",(0,a.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"RequestList"))," which has been previously\nprocessed. You can obtain the state by calling ",(0,a.kt)("a",{parentName:"p",href:"../api/request-list#getstate",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"RequestList.getState()"))," and receive an object with the following\nstructure:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"{\n    nextIndex: 5,\n    nextUniqueKey: 'unique-key-5'\n    inProgress: {\n        'unique-key-1': true,\n        'unique-key-4': true\n    },\n}\n")),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"nextindex"},(0,a.kt)("inlineCode",{parentName:"h3"},"nextIndex")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Position of the next request to be processed."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"nextuniquekey"},(0,a.kt)("inlineCode",{parentName:"h3"},"nextUniqueKey")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Key of the next request to be processed."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"inprogress"},(0,a.kt)("inlineCode",{parentName:"h3"},"inProgress")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Object<string, boolean>")),(0,a.kt)("p",null,"An object mapping request keys to a boolean value respresenting whether they are being processed at the moment."),(0,a.kt)("hr",null))}m.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var r=n(67294);function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,s=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(s[n]=e[n])}return s}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,s=e.mdxType,a=e.originalType,l=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=p(n),f=s,m=c["".concat(l,".").concat(f)]||c[f]||d[f]||a;return n?r.createElement(m,i(i({ref:t},u),{},{components:n})):r.createElement(m,i({ref:t},u))}));function m(e,t){var n=arguments,s=t&&t.mdxType;if("string"==typeof e||s){var a=n.length,i=new Array(a);i[0]=f;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[c]="string"==typeof e?e:s,i[1]=o;for(var p=2;p<a;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"}}]);