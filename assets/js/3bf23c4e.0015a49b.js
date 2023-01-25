"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6668],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),c=p(n),m=a,k=c["".concat(s,".").concat(m)]||c[m]||u[m]||o;return n?r.createElement(k,i(i({ref:t},d),{},{components:n})):r.createElement(k,i({ref:t},d))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[c]="string"==typeof e?e:a,i[1]=l;for(var p=2;p<o;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},96225:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>s,default:()=>m,frontMatter:()=>l,metadata:()=>p,toc:()=>c});var r=n(87462),a=n(63366),o=(n(67294),n(3905)),i=["components"],l={id_old:"version-1.3-social-handles",title:"SocialHandles",id:"social-handles"},s=void 0,p={unversionedId:"typedefs/social-handles",id:"version-1.3/typedefs/social-handles",title:"SocialHandles",description:"Representation of social handles parsed from a HTML page.",source:"@site/versioned_docs/version-1.3/typedefs/SocialHandles.md",sourceDirName:"typedefs",slug:"/typedefs/social-handles",permalink:"/docs/1.3/typedefs/social-handles",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1674659015,formattedLastUpdatedAt:"Jan 25, 2023",frontMatter:{id_old:"version-1.3-social-handles",title:"SocialHandles",id:"social-handles"},sidebar:"version-1.3/docs",previous:{title:"SessionState",permalink:"/docs/1.3/typedefs/session-state"},next:{title:"SystemInfo",permalink:"/docs/1.3/typedefs/system-info"}},d={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>emails</code>",id:"emails",level:3},{value:"<code>phones</code>",id:"phones",level:3},{value:"<code>phonesUncertain</code>",id:"phonesuncertain",level:3},{value:"<code>linkedIns</code>",id:"linkedins",level:3},{value:"<code>twitters</code>",id:"twitters",level:3},{value:"<code>instagrams</code>",id:"instagrams",level:3},{value:"<code>facebooks</code>",id:"facebooks",level:3},{value:"<code>youtubes</code>",id:"youtubes",level:3}],u={toc:c};function m(e){var t=e.components,n=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("a",{name:"socialhandles"}),(0,o.kt)("p",null,"Representation of social handles parsed from a HTML page."),(0,o.kt)("p",null,"The object has the following structure:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"{\n  emails: String[],\n  phones: String[],\n  phonesUncertain: String[],\n  linkedIns: String[],\n  twitters: String[],\n  instagrams: String[],\n  facebooks: String[],\n  youtubes: String[],\n}\n")),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"emails"},(0,o.kt)("inlineCode",{parentName:"h3"},"emails")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"phones"},(0,o.kt)("inlineCode",{parentName:"h3"},"phones")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"phonesuncertain"},(0,o.kt)("inlineCode",{parentName:"h3"},"phonesUncertain")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"linkedins"},(0,o.kt)("inlineCode",{parentName:"h3"},"linkedIns")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"twitters"},(0,o.kt)("inlineCode",{parentName:"h3"},"twitters")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"instagrams"},(0,o.kt)("inlineCode",{parentName:"h3"},"instagrams")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"facebooks"},(0,o.kt)("inlineCode",{parentName:"h3"},"facebooks")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"youtubes"},(0,o.kt)("inlineCode",{parentName:"h3"},"youtubes")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,o.kt)("hr",null))}m.isMDXComponent=!0}}]);