"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1642],{77663:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>k,frontMatter:()=>o,metadata:()=>p,toc:()=>c});var r=a(87462),n=a(63366),l=(a(67294),a(3905)),i=["components"],o={id_old:"version-1.3-basic-crawler",title:"BasicCrawler",id:"basic-crawler"},s=void 0,p={unversionedId:"api/basic-crawler",id:"version-1.3/api/basic-crawler",title:"BasicCrawler",description:"Provides a simple framework for parallel crawling of web pages. The URLs to crawl are fed either from a static list of URLs or from a dynamic queue of",source:"@site/versioned_docs/version-1.3/api/BasicCrawler.md",sourceDirName:"api",slug:"/api/basic-crawler",permalink:"/sdk/js/docs/1.3/api/basic-crawler",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1685928295,formattedLastUpdatedAt:"Jun 5, 2023",frontMatter:{id_old:"version-1.3-basic-crawler",title:"BasicCrawler",id:"basic-crawler"},sidebar:"version-1.3/docs",previous:{title:"Configuration",permalink:"/sdk/js/docs/1.3/api/configuration"},next:{title:"CheerioCrawler",permalink:"/sdk/js/docs/1.3/api/cheerio-crawler"}},u={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>stats</code>",id:"stats",level:3},{value:"<code>requestList</code>",id:"requestlist",level:3},{value:"<code>requestQueue</code>",id:"requestqueue",level:3},{value:"<code>sessionPool</code>",id:"sessionpool",level:3},{value:"<code>autoscaledPool</code>",id:"autoscaledpool",level:3},{value:"<code>new BasicCrawler(options)</code>",id:"new-basiccrawleroptions",level:2},{value:"<code>basicCrawler.log</code>",id:"basiccrawlerlog",level:2},{value:"<code>basicCrawler.sessionPoolOptions</code>",id:"basiccrawlersessionpooloptions",level:2},{value:"<code>basicCrawler.run()</code>",id:"basiccrawlerrun",level:2}],d={toc:c},m="wrapper";function k(e){var t=e.components,a=(0,n.Z)(e,i);return(0,l.kt)(m,(0,r.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("a",{name:"basiccrawler"}),(0,l.kt)("p",null,"Provides a simple framework for parallel crawling of web pages. The URLs to crawl are fed either from a static list of URLs or from a dynamic queue of\nURLs enabling recursive crawling of websites."),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"BasicCrawler")," is a low-level tool that requires the user to implement the page download and data extraction functionality themselves. If you want a\ncrawler that already facilitates this functionality, please consider using ",(0,l.kt)("a",{parentName:"p",href:"../api/cheerio-crawler",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"CheerioCrawler")),",\n",(0,l.kt)("a",{parentName:"p",href:"../api/puppeteer-crawler",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PuppeteerCrawler"))," or ",(0,l.kt)("a",{parentName:"p",href:"../api/playwright-crawler",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawler")),"."),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"BasicCrawler")," invokes the user-provided ",(0,l.kt)("a",{parentName:"p",href:"../typedefs/basic-crawler-options#handlerequestfunction",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"BasicCrawlerOptions.handleRequestFunction"))," for\neach ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," object, which represents a single URL to crawl. The ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," objects are fed from the\n",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))," or the ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))," instances provided by the\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/basic-crawler-options#requestlist",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"BasicCrawlerOptions.requestList"))," or\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/basic-crawler-options#requestqueue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"BasicCrawlerOptions.requestQueue"))," constructor options, respectively."),(0,l.kt)("p",null,"If both ",(0,l.kt)("a",{parentName:"p",href:"../typedefs/basic-crawler-options#requestlist",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"BasicCrawlerOptions.requestList"))," and\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/basic-crawler-options#requestqueue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"BasicCrawlerOptions.requestQueue"))," options are used, the instance first processes URLs from the\n",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))," and automatically enqueues all of them to ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))," before it starts their\nprocessing. This ensures that a single URL is not crawled multiple times."),(0,l.kt)("p",null,"The crawler finishes if there are no more ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," objects to crawl."),(0,l.kt)("p",null,"New requests are only dispatched when there is enough free CPU and memory available, using the functionality provided by the\n",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," class. All ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," configuration options can be passed to the\n",(0,l.kt)("inlineCode",{parentName:"p"},"autoscaledPoolOptions")," parameter of the ",(0,l.kt)("inlineCode",{parentName:"p"},"BasicCrawler")," constructor. For user convenience, the ",(0,l.kt)("inlineCode",{parentName:"p"},"minConcurrency")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"maxConcurrency"),"\n",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," options are available directly in the ",(0,l.kt)("inlineCode",{parentName:"p"},"BasicCrawler")," constructor."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Example usage:")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"// Prepare a list of URLs to crawl\nconst requestList = new Apify.RequestList({\n    sources: [{ url: 'http://www.example.com/page-1' }, { url: 'http://www.example.com/page-2' }],\n});\nawait requestList.initialize();\n\n// Crawl the URLs\nconst crawler = new Apify.BasicCrawler({\n    requestList,\n    handleRequestFunction: async ({ request }) => {\n        // 'request' contains an instance of the Request class\n        // Here we simply fetch the HTML of the page and store it to a dataset\n        const { body } = await Apify.utils.requestAsBrowser(request);\n        await Apify.pushData({\n            url: request.url,\n            html: body,\n        });\n    },\n});\n\nawait crawler.run();\n")),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"stats"},(0,l.kt)("inlineCode",{parentName:"h3"},"stats")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/statistics",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Statistics"))),(0,l.kt)("p",null,"Contains statistics about the current run."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"requestlist"},(0,l.kt)("inlineCode",{parentName:"h3"},"requestList")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))," class that manages the crawler's ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request")),"s. Only available if\nused by the crawler."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"requestqueue"},(0,l.kt)("inlineCode",{parentName:"h3"},"requestQueue")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))," class that manages the crawler's ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request")),"s. Only available if\nused by the crawler."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"sessionpool"},(0,l.kt)("inlineCode",{parentName:"h3"},"sessionPool")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"SessionPool"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"SessionPool"))," class that manages the crawler's ",(0,l.kt)("a",{parentName:"p",href:"../api/session",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Session")),"s. Only available if\nused by the crawler."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"autoscaledpool"},(0,l.kt)("inlineCode",{parentName:"h3"},"autoscaledPool")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," class that manages the concurrency of the crawler. Note that this property is\nonly initialized after calling the ",(0,l.kt)("a",{parentName:"p",href:"../api/basic-crawler#run",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"BasicCrawler.run()"))," function. You can use it to change the concurrency settings on the\nfly, to pause the crawler by calling ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool#pause",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool.pause()"))," or to abort it by calling\n",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool#abort",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool.abort()")),"."),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"exports.basiccrawler"}),(0,l.kt)("h2",{id:"new-basiccrawleroptions"},(0,l.kt)("inlineCode",{parentName:"h2"},"new BasicCrawler(options)")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,l.kt)("a",{parentName:"li",href:"../typedefs/basic-crawler-options",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"BasicCrawlerOptions"))," - All ",(0,l.kt)("inlineCode",{parentName:"li"},"BasicCrawler")," parameters are passed via an options object.")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"log"}),(0,l.kt)("h2",{id:"basiccrawlerlog"},(0,l.kt)("inlineCode",{parentName:"h2"},"basicCrawler.log")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"sessionpooloptions"}),(0,l.kt)("h2",{id:"basiccrawlersessionpooloptions"},(0,l.kt)("inlineCode",{parentName:"h2"},"basicCrawler.sessionPoolOptions")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"run"}),(0,l.kt)("h2",{id:"basiccrawlerrun"},(0,l.kt)("inlineCode",{parentName:"h2"},"basicCrawler.run()")),(0,l.kt)("p",null,"Runs the crawler. Returns a promise that gets resolved once all the requests are processed."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,l.kt)("hr",null))}k.isMDXComponent=!0},3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>k});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),p=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},u=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=p(a),m=n,k=c["".concat(s,".").concat(m)]||c[m]||d[m]||l;return a?r.createElement(k,i(i({ref:t},u),{},{components:a})):r.createElement(k,i({ref:t},u))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,i=new Array(l);i[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[c]="string"==typeof e?e:n,i[1]=o;for(var p=2;p<l;p++)i[p]=a[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}m.displayName="MDXCreateElement"}}]);