"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3280],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>g});var n=t(7294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=n.createContext({}),u=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},c=function(e){var r=u(e.components);return n.createElement(l.Provider,{value:r},e.children)},s={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=u(t),g=o,f=d["".concat(l,".").concat(g)]||d[g]||s[g]||a;return t?n.createElement(f,i(i({ref:r},c),{},{components:t})):n.createElement(f,i({ref:r},c))}));function g(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var a=t.length,i=new Array(a);i[0]=d;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p.mdxType="string"==typeof e?e:o,i[1]=p;for(var u=2;u<a;u++)i[u]=t[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},730:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>c,contentTitle:()=>l,default:()=>g,frontMatter:()=>p,metadata:()=>u,toc:()=>s});var n=t(7462),o=t(3366),a=(t(7294),t(3905)),i=["components"],p={id:"upgrading-to-v2",title:"Upgrading to v2"},l=void 0,u={unversionedId:"upgrading/upgrading-to-v2",id:"upgrading/upgrading-to-v2",title:"Upgrading to v2",description:"- BREAKING: Require Node.js >=15.10.0 because HTTP2 support on lower Node.js versions is very buggy.",source:"@site/../docs/upgrading/upgrading_v2.md",sourceDirName:"upgrading",slug:"/upgrading/upgrading-to-v2",permalink:"/apify-sdk-js/docs/upgrading/upgrading-to-v2",draft:!1,tags:[],version:"current",lastUpdatedBy:"Andrey Bykov",lastUpdatedAt:1659079797,formattedLastUpdatedAt:"Jul 29, 2022",frontMatter:{id:"upgrading-to-v2",title:"Upgrading to v2"}},c={},s=[],d={toc:s};function g(e){var r=e.components,t=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,n.Z)({},d,t,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"BREAKING"),": Require Node.js >=15.10.0 because HTTP2 support on lower Node.js versions is very buggy."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"BREAKING"),": Bump ",(0,a.kt)("inlineCode",{parentName:"li"},"cheerio")," to ",(0,a.kt)("inlineCode",{parentName:"li"},"1.0.0-rc.10")," from ",(0,a.kt)("inlineCode",{parentName:"li"},"rc.3"),". There were breaking changes in ",(0,a.kt)("inlineCode",{parentName:"li"},"cheerio")," between the versions so this bump might be breaking for you as well."),(0,a.kt)("li",{parentName:"ul"},"Remove ",(0,a.kt)("inlineCode",{parentName:"li"},"LiveViewServer")," which was deprecated before release of SDK v1.")))}g.isMDXComponent=!0}}]);