"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1035],{3905:(e,s,n)=>{n.d(s,{Zo:()=>u,kt:()=>k});var o=n(67294);function t(e,s,n){return s in e?Object.defineProperty(e,s,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[s]=n,e}function i(e,s){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);s&&(o=o.filter((function(s){return Object.getOwnPropertyDescriptor(e,s).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var s=1;s<arguments.length;s++){var n=null!=arguments[s]?arguments[s]:{};s%2?i(Object(n),!0).forEach((function(s){t(e,s,n[s])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(s){Object.defineProperty(e,s,Object.getOwnPropertyDescriptor(n,s))}))}return e}function r(e,s){if(null==e)return{};var n,o,t=function(e,s){if(null==e)return{};var n,o,t={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],s.indexOf(n)>=0||(t[n]=e[n]);return t}(e,s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],s.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(t[n]=e[n])}return t}var l=o.createContext({}),p=function(e){var s=o.useContext(l),n=s;return e&&(n="function"==typeof e?e(s):a(a({},s),e)),n},u=function(e){var s=p(e.components);return o.createElement(l.Provider,{value:s},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var s=e.children;return o.createElement(o.Fragment,{},s)}},m=o.forwardRef((function(e,s){var n=e.components,t=e.mdxType,i=e.originalType,l=e.parentName,u=r(e,["components","mdxType","originalType","parentName"]),d=p(n),m=t,k=d["".concat(l,".").concat(m)]||d[m]||c[m]||i;return n?o.createElement(k,a(a({ref:s},u),{},{components:n})):o.createElement(k,a({ref:s},u))}));function k(e,s){var n=arguments,t=s&&s.mdxType;if("string"==typeof e||t){var i=n.length,a=new Array(i);a[0]=m;var r={};for(var l in s)hasOwnProperty.call(s,l)&&(r[l]=s[l]);r.originalType=e,r[d]="string"==typeof e?e:t,a[1]=r;for(var p=2;p<i;p++)a[p]=n[p];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}m.displayName="MDXCreateElement"},28633:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>u,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>p,toc:()=>d});var o=n(87462),t=n(63366),i=(n(67294),n(3905)),a=["components"],r={id_old:"version-1.3-session-pool",title:"SessionPool",id:"session-pool"},l=void 0,p={unversionedId:"api/session-pool",id:"version-1.3/api/session-pool",title:"SessionPool",description:"Handles the rotation, creation and persistence of user-like sessions. Creates a pool of Session instances, that are randomly",source:"@site/versioned_docs/version-1.3/api/SessionPool.md",sourceDirName:"api",slug:"/api/session-pool",permalink:"/docs/1.3/api/session-pool",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1674866175,formattedLastUpdatedAt:"Jan 28, 2023",frontMatter:{id_old:"version-1.3-session-pool",title:"SessionPool",id:"session-pool"},sidebar:"version-1.3/docs",previous:{title:"Session",permalink:"/docs/1.3/api/session"},next:{title:"ProxyConfiguration",permalink:"/docs/1.3/api/proxy-configuration"}},u={},d=[{value:"<code>sessionPool.sessions</code>",id:"sessionpoolsessions",level:2},{value:"<code>sessionPool.usableSessionsCount</code>",id:"sessionpoolusablesessionscount",level:2},{value:"<code>sessionPool.retiredSessionsCount</code>",id:"sessionpoolretiredsessionscount",level:2},{value:"<code>sessionPool.initialize()</code>",id:"sessionpoolinitialize",level:2},{value:"<code>sessionPool.addSession([options])</code>",id:"sessionpooladdsessionoptions",level:2},{value:"<code>sessionPool.getSession([sessionId])</code>",id:"sessionpoolgetsessionsessionid",level:2},{value:"<code>sessionPool.getState()</code>",id:"sessionpoolgetstate",level:2},{value:"<code>sessionPool.persistState()</code>",id:"sessionpoolpersiststate",level:2},{value:"<code>sessionPool.teardown()</code>",id:"sessionpoolteardown",level:2}],c={toc:d};function m(e){var s=e.components,n=(0,t.Z)(e,a);return(0,i.kt)("wrapper",(0,o.Z)({},c,n,{components:s,mdxType:"MDXLayout"}),(0,i.kt)("a",{name:"sessionpool"}),(0,i.kt)("p",null,"Handles the rotation, creation and persistence of user-like sessions. Creates a pool of ",(0,i.kt)("a",{parentName:"p",href:"/docs/1.3/api/session",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Session"))," instances, that are randomly\nrotated. When some session is marked as blocked, it is removed and new one is created instead (the pool never returns an unusable session). Learn more\nin the ",(0,i.kt)("a",{parentName:"p",href:"../guides/session-management",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Session management guide")),"."),(0,i.kt)("p",null,"You can create one by calling the ",(0,i.kt)("a",{parentName:"p",href:"../api/apify#opensessionpool",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Apify.openSessionPool"))," function."),(0,i.kt)("p",null,"Session pool is already integrated into crawlers, and it can significantly improve your scraper performance with just 2 lines of code."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Example usage:")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"const crawler = new Apify.CheerioCrawler({\n    useSessionPool: true,\n    persistCookiesPerSession: true,\n    // ...\n});\n")),(0,i.kt)("p",null,"You can configure the pool with many options. See the ",(0,i.kt)("a",{parentName:"p",href:"../typedefs/session-pool-options",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"SessionPoolOptions")),". Session pool is by default persisted\nin default ",(0,i.kt)("a",{parentName:"p",href:"../api/key-value-store",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"KeyValueStore")),". If you want to have one pool for all runs you have to specify\n",(0,i.kt)("a",{parentName:"p",href:"../typedefs/session-pool-options#persiststatekeyvaluestoreid",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"SessionPoolOptions.persistStateKeyValueStoreId")),"."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Advanced usage:")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"const sessionPool = await Apify.openSessionPool({\n    maxPoolSize: 25,\n    sessionOptions: {\n        maxAgeSecs: 10,\n        maxUsageCount: 150, // for example when you know that the site blocks after 150 requests.\n    },\n    persistStateKeyValueStoreId: 'my-key-value-store-for-sessions',\n    persistStateKey: 'my-session-pool',\n});\n\n// Get random session from the pool\nconst session1 = await sessionPool.getSession();\nconst session2 = await sessionPool.getSession();\nconst session3 = await sessionPool.getSession();\n\n// Now you can mark the session either failed or successful\n\n// Marks session as bad after unsuccessful usage -> it increases error count (soft retire)\nsession1.markBad();\n\n// Marks as successful.\nsession2.markGood();\n\n// Retires session -> session is removed from the pool\nsession3.retire();\n")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"sessions"}),(0,i.kt)("h2",{id:"sessionpoolsessions"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.sessions")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"usablesessionscount"}),(0,i.kt)("h2",{id:"sessionpoolusablesessionscount"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.usableSessionsCount")),(0,i.kt)("p",null,"Gets count of usable sessions in the pool."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"retiredsessionscount"}),(0,i.kt)("h2",{id:"sessionpoolretiredsessionscount"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.retiredSessionsCount")),(0,i.kt)("p",null,"Gets count of retired sessions in the pool."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"initialize"}),(0,i.kt)("h2",{id:"sessionpoolinitialize"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.initialize()")),(0,i.kt)("p",null,"Starts periodic state persistence and potentially loads SessionPool state from ",(0,i.kt)("a",{parentName:"p",href:"../api/key-value-store",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"KeyValueStore")),". It is called automatically\nby the ",(0,i.kt)("a",{parentName:"p",href:"../api/apify#opensessionpool",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Apify.openSessionPool"))," function."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"addsession"}),(0,i.kt)("h2",{id:"sessionpooladdsessionoptions"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.addSession([options])")),(0,i.kt)("p",null,"Adds a new session to the session pool. The pool automatically creates sessions up to the maximum size of the pool, but this allows you to add more\nsessions once the max pool size is reached. This also allows you to add session with overridden session options (e.g. with specific session id)."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"strong"},"[options]")),": ",(0,i.kt)("a",{parentName:"li",href:"/docs/1.3/api/session",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Session"))," | ",(0,i.kt)("a",{parentName:"li",href:"../typedefs/session-options",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"SessionOptions"))," - The configuration options for the session being\nadded to the session pool.")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"getsession"}),(0,i.kt)("h2",{id:"sessionpoolgetsessionsessionid"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.getSession([sessionId])")),(0,i.kt)("p",null,"Gets session. If there is space for new session, it creates and returns new session. If the session pool is full, it picks a session from the pool, If\nthe picked session is usable it is returned, otherwise it creates and returns a new one."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"strong"},"[sessionId]")),": ",(0,i.kt)("inlineCode",{parentName:"li"},"String")," - If provided, it returns the usable session with this id, ",(0,i.kt)("inlineCode",{parentName:"li"},"undefined")," otherwise.")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/docs/1.3/api/session",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Promise<Session>"))),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"getstate"}),(0,i.kt)("h2",{id:"sessionpoolgetstate"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.getState()")),(0,i.kt)("p",null,"Returns an object representing the internal state of the ",(0,i.kt)("inlineCode",{parentName:"p"},"SessionPool")," instance. Note that the object's fields can change in future releases."),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"persiststate"}),(0,i.kt)("h2",{id:"sessionpoolpersiststate"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.persistState()")),(0,i.kt)("p",null,"Persists the current state of the ",(0,i.kt)("inlineCode",{parentName:"p"},"SessionPool")," into the default ",(0,i.kt)("a",{parentName:"p",href:"../api/key-value-store",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"KeyValueStore")),". The state is persisted automatically in\nregular intervals."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"teardown"}),(0,i.kt)("h2",{id:"sessionpoolteardown"},(0,i.kt)("inlineCode",{parentName:"h2"},"sessionPool.teardown()")),(0,i.kt)("p",null,"Removes listener from ",(0,i.kt)("inlineCode",{parentName:"p"},"persistState")," event. This function should be called after you are done with using the ",(0,i.kt)("inlineCode",{parentName:"p"},"SessionPool")," instance."),(0,i.kt)("hr",null))}m.isMDXComponent=!0}}]);