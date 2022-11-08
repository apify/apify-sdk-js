"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5097],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),d=p(n),m=a,h=d["".concat(s,".").concat(m)]||d[m]||c[m]||o;return n?r.createElement(h,l(l({ref:t},u),{},{components:n})):r.createElement(h,l({ref:t},u))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,l=new Array(o);l[0]=d;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:a,l[1]=i;for(var p=2;p<o;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},64380:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>m,frontMatter:()=>i,metadata:()=>p,toc:()=>c});var r=n(87462),a=n(63366),o=(n(67294),n(3905)),l=["components"],i={id_old:"version-1.3-basic-crawler-options",title:"BasicCrawlerOptions",id:"basic-crawler-options"},s=void 0,p={unversionedId:"typedefs/basic-crawler-options",id:"version-1.3/typedefs/basic-crawler-options",title:"BasicCrawlerOptions",description:"Properties",source:"@site/versioned_docs/version-1.3/typedefs/BasicCrawlerOptions.md",sourceDirName:"typedefs",slug:"/typedefs/basic-crawler-options",permalink:"/docs/1.3/typedefs/basic-crawler-options",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1667904057,formattedLastUpdatedAt:"Nov 8, 2022",frontMatter:{id_old:"version-1.3-basic-crawler-options",title:"BasicCrawlerOptions",id:"basic-crawler-options"},sidebar:"version-1.3/docs",previous:{title:"AutoscaledPoolOptions",permalink:"/docs/1.3/typedefs/autoscaled-pool-options"},next:{title:"CheerioCrawlerOptions",permalink:"/docs/1.3/typedefs/cheerio-crawler-options"}},u={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>handleRequestFunction</code>",id:"handlerequestfunction",level:3},{value:"<code>requestList</code>",id:"requestlist",level:3},{value:"<code>requestQueue</code>",id:"requestqueue",level:3},{value:"<code>handleRequestTimeoutSecs</code>",id:"handlerequesttimeoutsecs",level:3},{value:"<code>handleFailedRequestFunction</code>",id:"handlefailedrequestfunction",level:3},{value:"<code>maxRequestRetries</code>",id:"maxrequestretries",level:3},{value:"<code>maxRequestsPerCrawl</code>",id:"maxrequestspercrawl",level:3},{value:"<code>autoscaledPoolOptions</code>",id:"autoscaledpooloptions",level:3},{value:"<code>minConcurrency</code>",id:"minconcurrency",level:3},{value:"<code>maxConcurrency</code>",id:"maxconcurrency",level:3},{value:"<code>useSessionPool</code>",id:"usesessionpool",level:3},{value:"<code>sessionPoolOptions</code>",id:"sessionpooloptions",level:3}],d={toc:c};function m(e){var t=e.components,n=(0,a.Z)(e,l);return(0,o.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("a",{name:"basiccrawleroptions"}),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"handlerequestfunction"},(0,o.kt)("inlineCode",{parentName:"h3"},"handleRequestFunction")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("a",{parentName:"p",href:"../typedefs/handle-request",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"HandleRequest"))),(0,o.kt)("p",null,"User-provided function that performs the logic of the crawler. It is called for each URL to crawl."),(0,o.kt)("p",null,"The function receives the following object as an argument:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"{\n  request: Request,\n  session: Session,\n  crawler: BasicCrawler,\n}\n")),(0,o.kt)("p",null,"where the ",(0,o.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Request"))," instance represents the URL to crawl."),(0,o.kt)("p",null,"The function must return a promise, which is then awaited by the crawler."),(0,o.kt)("p",null,"If the function throws an exception, the crawler will try to re-crawl the request later, up to ",(0,o.kt)("inlineCode",{parentName:"p"},"option.maxRequestRetries")," times. If all the retries\nfail, the crawler calls the function provided to the ",(0,o.kt)("inlineCode",{parentName:"p"},"handleFailedRequestFunction")," parameter. To make this work, you should ",(0,o.kt)("strong",{parentName:"p"},"always")," let your\nfunction throw exceptions rather than catch them. The exceptions are logged to the request using the\n",(0,o.kt)("a",{parentName:"p",href:"../api/request#pusherrormessage",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Request.pushErrorMessage()"))," function."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"requestlist"},(0,o.kt)("inlineCode",{parentName:"h3"},"requestList")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"RequestList"))),(0,o.kt)("p",null,"Static list of URLs to be processed. Either ",(0,o.kt)("inlineCode",{parentName:"p"},"requestList")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"requestQueue")," option must be provided (or both)."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"requestqueue"},(0,o.kt)("inlineCode",{parentName:"h3"},"requestQueue")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"RequestQueue"))),(0,o.kt)("p",null,"Dynamic queue of URLs to be processed. This is useful for recursive crawling of websites. Either ",(0,o.kt)("inlineCode",{parentName:"p"},"requestList")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"requestQueue")," option must be\nprovided (or both)."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"handlerequesttimeoutsecs"},(0,o.kt)("inlineCode",{parentName:"h3"},"handleRequestTimeoutSecs")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")," ",(0,o.kt)("code",null," = 60")),(0,o.kt)("p",null,"Timeout in which the function passed as ",(0,o.kt)("inlineCode",{parentName:"p"},"handleRequestFunction")," needs to finish, in seconds."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"handlefailedrequestfunction"},(0,o.kt)("inlineCode",{parentName:"h3"},"handleFailedRequestFunction")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("a",{parentName:"p",href:"../typedefs/handle-failed-request",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"HandleFailedRequest"))),(0,o.kt)("p",null,"A function to handle requests that failed more than ",(0,o.kt)("inlineCode",{parentName:"p"},"option.maxRequestRetries")," times."),(0,o.kt)("p",null,"The function receives the following object as an argument:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"{\n  request: Request,\n  error: Error,\n  session: Session,\n  crawler: BasicCrawler,\n}\n")),(0,o.kt)("p",null,"where the ",(0,o.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Request"))," instance corresponds to the failed request, and the ",(0,o.kt)("inlineCode",{parentName:"p"},"Error")," instance represents the last error thrown during\nprocessing of the request."),(0,o.kt)("p",null,"See ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/apify/apify-js/blob/master/src/crawlers/basic_crawler.js#L11",target:"_blank",rel:"noopener"},"source code")," for the default implementation of this function."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"maxrequestretries"},(0,o.kt)("inlineCode",{parentName:"h3"},"maxRequestRetries")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")," ",(0,o.kt)("code",null," = 3")),(0,o.kt)("p",null,"Indicates how many times the request is retried if\n",(0,o.kt)("a",{parentName:"p",href:"../typedefs/basic-crawler-options#handlerequestfunction",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"BasicCrawlerOptions.handleRequestFunction"))," fails."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"maxrequestspercrawl"},(0,o.kt)("inlineCode",{parentName:"h3"},"maxRequestsPerCrawl")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")),(0,o.kt)("p",null,"Maximum number of pages that the crawler will open. The crawl will stop when this limit is reached. Always set this value in order to prevent infinite\nloops in misconfigured crawlers. Note that in cases of parallel crawling, the actual number of pages visited might be slightly higher than this value."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"autoscaledpooloptions"},(0,o.kt)("inlineCode",{parentName:"h3"},"autoscaledPoolOptions")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("a",{parentName:"p",href:"../typedefs/autoscaled-pool-options",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"AutoscaledPoolOptions"))),(0,o.kt)("p",null,"Custom options passed to the underlying ",(0,o.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," constructor. Note that the ",(0,o.kt)("inlineCode",{parentName:"p"},"runTaskFunction")," and\n",(0,o.kt)("inlineCode",{parentName:"p"},"isTaskReadyFunction")," options are provided by ",(0,o.kt)("inlineCode",{parentName:"p"},"BasicCrawler")," and cannot be overridden. However, you can provide a custom implementation of\n",(0,o.kt)("inlineCode",{parentName:"p"},"isFinishedFunction"),"."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"minconcurrency"},(0,o.kt)("inlineCode",{parentName:"h3"},"minConcurrency")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")," ",(0,o.kt)("code",null," = 1")),(0,o.kt)("p",null,"Sets the minimum concurrency (parallelism) for the crawl. Shortcut to the corresponding ",(0,o.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," option."),(0,o.kt)("p",null,(0,o.kt)("em",{parentName:"p"},"WARNING:")," If you set this value too high with respect to the available system memory and CPU, your crawler will run extremely slow or crash. If\nyou're not sure, just keep the default value and the concurrency will scale up automatically."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"maxconcurrency"},(0,o.kt)("inlineCode",{parentName:"h3"},"maxConcurrency")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")," ",(0,o.kt)("code",null," = 1000")),(0,o.kt)("p",null,"Sets the maximum concurrency (parallelism) for the crawl. Shortcut to the corresponding ",(0,o.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," option."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"usesessionpool"},(0,o.kt)("inlineCode",{parentName:"h3"},"useSessionPool")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"boolean")," ",(0,o.kt)("code",null," = true")),(0,o.kt)("p",null,"Basic crawler will initialize the ",(0,o.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"SessionPool"))," with the corresponding ",(0,o.kt)("inlineCode",{parentName:"p"},"sessionPoolOptions"),". The session instance will be than\navailable in the ",(0,o.kt)("inlineCode",{parentName:"p"},"handleRequestFunction"),"."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"sessionpooloptions"},(0,o.kt)("inlineCode",{parentName:"h3"},"sessionPoolOptions")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("a",{parentName:"p",href:"../typedefs/session-pool-options",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"SessionPoolOptions"))),(0,o.kt)("p",null,"The configuration options for ",(0,o.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"SessionPool"))," to use."),(0,o.kt)("hr",null))}m.isMDXComponent=!0}}]);