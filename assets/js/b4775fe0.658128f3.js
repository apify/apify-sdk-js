"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9498],{51296:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>p,default:()=>m,frontMatter:()=>l,metadata:()=>d,toc:()=>s});var r=n(87462),a=n(63366),o=(n(67294),n(3905)),i=["components"],l={id_old:"version-1.3-apify-env",title:"ApifyEnv",id:"apify-env"},p=void 0,d={unversionedId:"typedefs/apify-env",id:"version-1.3/typedefs/apify-env",title:"ApifyEnv",description:"Parsed representation of the APIFY_XXX environmental variables. This object is returned by the Apify.getEnv() function.",source:"@site/versioned_docs/version-1.3/typedefs/ApifyEnv.md",sourceDirName:"typedefs",slug:"/typedefs/apify-env",permalink:"/sdk/js/docs/1.3/typedefs/apify-env",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1694088438,formattedLastUpdatedAt:"Sep 7, 2023",frontMatter:{id_old:"version-1.3-apify-env",title:"ApifyEnv",id:"apify-env"},sidebar:"version-1.3/docs",previous:{title:"ApifyCallError",permalink:"/sdk/js/docs/1.3/api/apify-call-error"},next:{title:"DatasetContent",permalink:"/sdk/js/docs/1.3/typedefs/dataset-content"}},u={},s=[{value:"Properties",id:"properties",level:2},{value:"<code>actorId</code>",id:"actorid",level:3},{value:"<code>actorRunId</code>",id:"actorrunid",level:3},{value:"<code>actorTaskId</code>",id:"actortaskid",level:3},{value:"<code>userId</code>",id:"userid",level:3},{value:"<code>token</code>",id:"token",level:3},{value:"<code>startedAt</code>",id:"startedat",level:3},{value:"<code>timeoutAt</code>",id:"timeoutat",level:3},{value:"<code>defaultKeyValueStoreId</code>",id:"defaultkeyvaluestoreid",level:3},{value:"<code>defaultDatasetId</code>",id:"defaultdatasetid",level:3},{value:"<code>memoryMbytes</code>",id:"memorymbytes",level:3}],c={toc:s},k="wrapper";function m(e){var t=e.components,n=(0,a.Z)(e,i);return(0,o.kt)(k,(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("a",{name:"apifyenv"}),(0,o.kt)("p",null,"Parsed representation of the ",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_XXX")," environmental variables. This object is returned by the ",(0,o.kt)("a",{parentName:"p",href:"../api/apify#getenv",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Apify.getEnv()"))," function."),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"actorid"},(0,o.kt)("inlineCode",{parentName:"h3"},"actorId")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"ID of the actor (APIFY_ACTOR_ID)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"actorrunid"},(0,o.kt)("inlineCode",{parentName:"h3"},"actorRunId")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"ID of the actor run (APIFY_ACTOR_RUN_ID)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"actortaskid"},(0,o.kt)("inlineCode",{parentName:"h3"},"actorTaskId")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"ID of the actor task (APIFY_ACTOR_TASK_ID)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"userid"},(0,o.kt)("inlineCode",{parentName:"h3"},"userId")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"ID of the user who started the actor - note that it might be different than the owner ofthe actor (APIFY_USER_ID)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"token"},(0,o.kt)("inlineCode",{parentName:"h3"},"token")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"Authentication token representing privileges given to the actor run, it can be passed to various Apify APIs (APIFY_TOKEN)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"startedat"},(0,o.kt)("inlineCode",{parentName:"h3"},"startedAt")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Date")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"Date when the actor was started (APIFY_STARTED_AT)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"timeoutat"},(0,o.kt)("inlineCode",{parentName:"h3"},"timeoutAt")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Date")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"Date when the actor will time out (APIFY_TIMEOUT_AT)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"defaultkeyvaluestoreid"},(0,o.kt)("inlineCode",{parentName:"h3"},"defaultKeyValueStoreId")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"ID of the key-value store where input and output data of this actor is stored (APIFY_DEFAULT_KEY_VALUE_STORE_ID)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"defaultdatasetid"},(0,o.kt)("inlineCode",{parentName:"h3"},"defaultDatasetId")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"ID of the dataset where input and output data of this actor is stored (APIFY_DEFAULT_DATASET_ID)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"memorymbytes"},(0,o.kt)("inlineCode",{parentName:"h3"},"memoryMbytes")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")," | ",(0,o.kt)("inlineCode",{parentName:"p"},"null")),(0,o.kt)("p",null,"Amount of memory allocated for the actor, in megabytes (APIFY_MEMORY_MBYTES)"),(0,o.kt)("hr",null))}m.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),d=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=d(e.components);return r.createElement(p.Provider,{value:t},e.children)},s="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),s=d(n),k=a,m=s["".concat(p,".").concat(k)]||s[k]||c[k]||o;return n?r.createElement(m,i(i({ref:t},u),{},{components:n})):r.createElement(m,i({ref:t},u))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=k;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[s]="string"==typeof e?e:a,i[1]=l;for(var d=2;d<o;d++)i[d]=n[d];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"}}]);