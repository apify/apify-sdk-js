"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1704],{23160:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>s,contentTitle:()=>l,default:()=>f,frontMatter:()=>p,metadata:()=>u,toc:()=>c});var n=t(87462),o=t(63366),i=(t(67294),t(3905)),a=["components"],p={id:"upgrading-to-v2",title:"Upgrading to v2"},l=void 0,u={unversionedId:"upgrading/upgrading-to-v2",id:"version-3.1/upgrading/upgrading-to-v2",title:"Upgrading to v2",description:"- BREAKING: Require Node.js >=15.10.0 because HTTP2 support on lower Node.js versions is very buggy.",source:"@site/versioned_docs/version-3.1/upgrading/upgrading_v2.md",sourceDirName:"upgrading",slug:"/upgrading/upgrading-to-v2",permalink:"/sdk/js/docs/upgrading/upgrading-to-v2",draft:!1,tags:[],version:"3.1",lastUpdatedBy:"Apify Bot",lastUpdatedAt:1690808330,formattedLastUpdatedAt:"Jul 31, 2023",frontMatter:{id:"upgrading-to-v2",title:"Upgrading to v2"},sidebar:"docs",previous:{title:"Upgrading to v1",permalink:"/sdk/js/docs/upgrading/upgrading-to-v1"},next:{title:"Upgrading to v3",permalink:"/sdk/js/docs/upgrading/upgrading-to-v3"}},s={},c=[],d={toc:c},g="wrapper";function f(e){var r=e.components,t=(0,o.Z)(e,a);return(0,i.kt)(g,(0,n.Z)({},d,t,{components:r,mdxType:"MDXLayout"}),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"BREAKING"),": Require Node.js >=15.10.0 because HTTP2 support on lower Node.js versions is very buggy."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"BREAKING"),": Bump ",(0,i.kt)("inlineCode",{parentName:"li"},"cheerio")," to ",(0,i.kt)("inlineCode",{parentName:"li"},"1.0.0-rc.10")," from ",(0,i.kt)("inlineCode",{parentName:"li"},"rc.3"),". There were breaking changes in ",(0,i.kt)("inlineCode",{parentName:"li"},"cheerio")," between the versions so this bump might be breaking for you as well."),(0,i.kt)("li",{parentName:"ul"},"Remove ",(0,i.kt)("inlineCode",{parentName:"li"},"LiveViewServer")," which was deprecated before release of SDK v1.")))}f.isMDXComponent=!0},3905:(e,r,t)=>{t.d(r,{Zo:()=>s,kt:()=>f});var n=t(67294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function a(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=n.createContext({}),u=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):a(a({},r),e)),t},s=function(e){var r=u(e.components);return n.createElement(l.Provider,{value:r},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},g=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),c=u(t),g=o,f=c["".concat(l,".").concat(g)]||c[g]||d[g]||i;return t?n.createElement(f,a(a({ref:r},s),{},{components:t})):n.createElement(f,a({ref:r},s))}));function f(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var i=t.length,a=new Array(i);a[0]=g;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p[c]="string"==typeof e?e:o,a[1]=p;for(var u=2;u<i;u++)a[u]=t[u];return n.createElement.apply(null,a)}return n.createElement.apply(null,t)}g.displayName="MDXCreateElement"}}]);