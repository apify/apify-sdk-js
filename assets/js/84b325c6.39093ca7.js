"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[675],{46897:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>h,frontMatter:()=>a,metadata:()=>p,toc:()=>c});var r=n(87462),o=n(63366),s=(n(67294),n(3905)),i=["components"],a={id_old:"version-1.3-snapshotter-options",title:"SnapshotterOptions",id:"snapshotter-options"},l=void 0,p={unversionedId:"typedefs/snapshotter-options",id:"version-1.3/typedefs/snapshotter-options",title:"SnapshotterOptions",description:"Properties",source:"@site/versioned_docs/version-1.3/typedefs/SnapshotterOptions.md",sourceDirName:"typedefs",slug:"/typedefs/snapshotter-options",permalink:"/sdk/js/docs/1.3/typedefs/snapshotter-options",draft:!1,editUrl:"https://github.com/apify/apify-sdk-js/edit/master/website/versioned_docs/version-1.3/typedefs/SnapshotterOptions.md",tags:[],version:"1.3",lastUpdatedBy:"Vlad Frangu",lastUpdatedAt:1698752548,formattedLastUpdatedAt:"Oct 31, 2023",frontMatter:{id_old:"version-1.3-snapshotter-options",title:"SnapshotterOptions",id:"snapshotter-options"},sidebar:"version-1.3/docs",previous:{title:"SessionPoolOptions",permalink:"/sdk/js/docs/1.3/typedefs/session-pool-options"},next:{title:"StealthOptions",permalink:"/sdk/js/docs/1.3/typedefs/stealth-options"}},d={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>eventLoopSnapshotIntervalSecs</code>",id:"eventloopsnapshotintervalsecs",level:3},{value:"<code>clientSnapshotIntervalSecs</code>",id:"clientsnapshotintervalsecs",level:3},{value:"<code>maxBlockedMillis</code>",id:"maxblockedmillis",level:3},{value:"<code>cpuSnapshotIntervalSecs</code>",id:"cpusnapshotintervalsecs",level:3},{value:"<code>maxUsedCpuRatio</code>",id:"maxusedcpuratio",level:3},{value:"<code>memorySnapshotIntervalSecs</code>",id:"memorysnapshotintervalsecs",level:3},{value:"<code>maxUsedMemoryRatio</code>",id:"maxusedmemoryratio",level:3},{value:"<code>maxClientErrors</code>",id:"maxclienterrors",level:3},{value:"<code>snapshotHistorySecs</code>",id:"snapshothistorysecs",level:3}],m={toc:c},u="wrapper";function h(e){var t=e.components,n=(0,o.Z)(e,i);return(0,s.kt)(u,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("a",{name:"snapshotteroptions"}),(0,s.kt)("h2",{id:"properties"},"Properties"),(0,s.kt)("h3",{id:"eventloopsnapshotintervalsecs"},(0,s.kt)("inlineCode",{parentName:"h3"},"eventLoopSnapshotIntervalSecs")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 0.5")),(0,s.kt)("p",null,"Defines the interval of measuring the event loop response time."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"clientsnapshotintervalsecs"},(0,s.kt)("inlineCode",{parentName:"h3"},"clientSnapshotIntervalSecs")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 1")),(0,s.kt)("p",null,"Defines the interval of checking the current state of the remote API client."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"maxblockedmillis"},(0,s.kt)("inlineCode",{parentName:"h3"},"maxBlockedMillis")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 50")),(0,s.kt)("p",null,"Maximum allowed delay of the event loop in milliseconds. Exceeding this limit overloads the event loop."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"cpusnapshotintervalsecs"},(0,s.kt)("inlineCode",{parentName:"h3"},"cpuSnapshotIntervalSecs")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 1")),(0,s.kt)("p",null,"Defines the interval of measuring CPU usage. This is only used when running locally. On the Apify platform, the statistics are provided externally at\na fixed interval."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"maxusedcpuratio"},(0,s.kt)("inlineCode",{parentName:"h3"},"maxUsedCpuRatio")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 0.95")),(0,s.kt)("p",null,"Defines the maximum usage of CPU. Exceeding this limit overloads the CPU."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"memorysnapshotintervalsecs"},(0,s.kt)("inlineCode",{parentName:"h3"},"memorySnapshotIntervalSecs")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 1")),(0,s.kt)("p",null,"Defines the interval of measuring memory consumption. This is only used when running locally. On the Apify platform, the statistics are provided\nexternally at a fixed interval. The measurement itself is resource intensive (25 - 50ms async). Therefore, setting this interval below 1 second is not\nrecommended."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"maxusedmemoryratio"},(0,s.kt)("inlineCode",{parentName:"h3"},"maxUsedMemoryRatio")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 0.7")),(0,s.kt)("p",null,"Defines the maximum ratio of total memory that can be used. Exceeding this limit overloads the memory."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"maxclienterrors"},(0,s.kt)("inlineCode",{parentName:"h3"},"maxClientErrors")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 1")),(0,s.kt)("p",null,"Defines the maximum number of new rate limit errors within the given interval."),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"snapshothistorysecs"},(0,s.kt)("inlineCode",{parentName:"h3"},"snapshotHistorySecs")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"number")," ",(0,s.kt)("code",null," = 60")),(0,s.kt)("p",null,"Sets the interval in seconds for which a history of resource snapshots will be kept. Increasing this to very high numbers will affect performance."),(0,s.kt)("hr",null))}h.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>h});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,s=e.originalType,l=e.parentName,d=a(e,["components","mdxType","originalType","parentName"]),c=p(n),u=o,h=c["".concat(l,".").concat(u)]||c[u]||m[u]||s;return n?r.createElement(h,i(i({ref:t},d),{},{components:n})):r.createElement(h,i({ref:t},d))}));function h(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var s=n.length,i=new Array(s);i[0]=u;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a[c]="string"==typeof e?e:o,i[1]=a;for(var p=2;p<s;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);