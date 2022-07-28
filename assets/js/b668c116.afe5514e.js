"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3978],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=r.createContext({}),u=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=u(e.components);return r.createElement(p.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=u(n),m=i,g=d["".concat(p,".").concat(m)]||d[m]||c[m]||a;return n?r.createElement(g,o(o({ref:t},s),{},{components:n})):r.createElement(g,o({ref:t},s))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=d;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var u=2;u<a;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},8690:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>p,default:()=>m,frontMatter:()=>l,metadata:()=>u,toc:()=>c});var r=n(7462),i=n(3366),a=(n(7294),n(3905)),o=["components"],l={id:"upgrading-to-v3",title:"Upgrading to v3"},p=void 0,u={unversionedId:"upgrading/upgrading-to-v3",id:"upgrading/upgrading-to-v3",title:"Upgrading to v3",description:"- TS rewrite",source:"@site/../docs/upgrading/upgrading_v3.md",sourceDirName:"upgrading",slug:"/upgrading/upgrading-to-v3",permalink:"/apify-sdk-js/docs/upgrading/upgrading-to-v3",draft:!1,tags:[],version:"current",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1659039801,formattedLastUpdatedAt:"Jul 28, 2022",frontMatter:{id:"upgrading-to-v3",title:"Upgrading to v3"}},s={},c=[{value:"Breaking changes",id:"breaking-changes",level:3}],d={toc:c};function m(e){var t=e.components,n=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"TS rewrite"),(0,a.kt)("li",{parentName:"ul"},"monorepo split...")),(0,a.kt)("h3",{id:"breaking-changes"},"Breaking changes"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"Apify.call()")," is now just a shortcut for running ",(0,a.kt)("inlineCode",{parentName:"li"},"ApifyClient.actor(actorId).call(input, options)"),", while also taking the token inside env vars into account"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"Apify.callTask()")," is now just a shortcut for running ",(0,a.kt)("inlineCode",{parentName:"li"},"ApifyClient.task(taskId).call(input, options)"),", while also taking the token inside env vars into account"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"Apify.metamorph()")," is now just a shortcut for running ",(0,a.kt)("inlineCode",{parentName:"li"},"ApifyClient.task(taskId).metamorph(input, options)"),", while also taking the ACTOR_RUN_ID inside env vars into account"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"Apify.waitForRunToFinish()")," has been removed, use ",(0,a.kt)("inlineCode",{parentName:"li"},"ApifyClient.waitForFinish()")," instead"),(0,a.kt)("li",{parentName:"ul"},"(internal) ",(0,a.kt)("inlineCode",{parentName:"li"},"QueueOperationInfo.request")," is no longer available"),(0,a.kt)("li",{parentName:"ul"},"(internal) ",(0,a.kt)("inlineCode",{parentName:"li"},"Request.handledAt")," is now string date in ISO format"),(0,a.kt)("li",{parentName:"ul"},"(perf/internal) ",(0,a.kt)("inlineCode",{parentName:"li"},"Request.inProgress")," and ",(0,a.kt)("inlineCode",{parentName:"li"},"Request.reclaimed")," are now ",(0,a.kt)("inlineCode",{parentName:"li"},"Set"),"s instead of dictionaries"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"injectUnderscore")," from puppeteer utils has been removed")))}m.isMDXComponent=!0}}]);