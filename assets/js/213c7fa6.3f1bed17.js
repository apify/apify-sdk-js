"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6790],{3905:(e,r,t)=>{t.d(r,{Zo:()=>s,kt:()=>f});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function l(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?l(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=n.createContext({}),c=function(e){var r=n.useContext(p),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},s=function(e){var r=c(e.components);return n.createElement(p.Provider,{value:r},e.children)},u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=c(t),f=a,m=d["".concat(p,".").concat(f)]||d[f]||u[f]||l;return t?n.createElement(m,o(o({ref:r},s),{},{components:t})):n.createElement(m,o({ref:r},s))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var l=t.length,o=new Array(l);o[0]=d;var i={};for(var p in r)hasOwnProperty.call(r,p)&&(i[p]=r[p]);i.originalType=e,i.mdxType="string"==typeof e?e:a,o[1]=i;for(var c=2;c<l;c++)o[c]=t[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},69719:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>s,contentTitle:()=>p,default:()=>f,frontMatter:()=>i,metadata:()=>c,toc:()=>u});var n=t(87462),a=t(63366),l=(t(67294),t(3905)),o=["components"],i={id:"apify-call-error",title:"ApifyCallError"},p=void 0,c={unversionedId:"api/apify-call-error",id:"version-2.3/api/apify-call-error",title:"ApifyCallError",description:"The class represents exceptions thrown by the Apify.call() function.",source:"@site/versioned_docs/version-2.3/api/ApifyCallError.md",sourceDirName:"api",slug:"/api/apify-call-error",permalink:"/docs/2.3/api/apify-call-error",draft:!1,tags:[],version:"2.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1662007468,formattedLastUpdatedAt:"Sep 1, 2022",frontMatter:{id:"apify-call-error",title:"ApifyCallError"},sidebar:"version-2.3/docs",previous:{title:"ActorRun",permalink:"/docs/2.3/typedefs/actor-run"},next:{title:"ApifyEnv",permalink:"/docs/2.3/typedefs/apify-env"}},s={},u=[{value:"Properties",id:"properties",level:2},{value:"<code>message</code>",id:"message",level:3},{value:"<code>run</code>",id:"run",level:3},{value:"<code>name</code>",id:"name",level:3},{value:"<code>new ApifyCallError(run, [message])</code>",id:"new-apifycallerrorrun-message",level:2}],d={toc:u};function f(e){var r=e.components,t=(0,a.Z)(e,o);return(0,l.kt)("wrapper",(0,n.Z)({},d,t,{components:r,mdxType:"MDXLayout"}),(0,l.kt)("a",{name:"apifycallerror"}),(0,l.kt)("p",null,"The class represents exceptions thrown by the ",(0,l.kt)("a",{parentName:"p",href:"../api/apify#call",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Apify.call()"))," function."),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"message"},(0,l.kt)("inlineCode",{parentName:"h3"},"message")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"Error message"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"run"},(0,l.kt)("inlineCode",{parentName:"h3"},"run")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../typedefs/actor-run",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"ActorRun"))),(0,l.kt)("p",null,"Object representing the failed actor run."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"name"},(0,l.kt)("inlineCode",{parentName:"h3"},"name")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"Contains ",(0,l.kt)("inlineCode",{parentName:"p"},'"ApifyCallError"')),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"exports.apifycallerror"}),(0,l.kt)("h2",{id:"new-apifycallerrorrun-message"},(0,l.kt)("inlineCode",{parentName:"h2"},"new ApifyCallError(run, [message])")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"run")),": ",(0,l.kt)("a",{parentName:"li",href:"../typedefs/actor-run",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"ActorRun"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[message]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")," ",(0,l.kt)("code",null," = ",'"',"The actor invoked by Apify.call() did not succeed",'"'))),(0,l.kt)("hr",null))}f.isMDXComponent=!0}}]);