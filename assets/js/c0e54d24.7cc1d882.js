"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2378],{12363:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>u,contentTitle:()=>p,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>c});var r=a(87462),n=a(63366),l=(a(67294),a(3905)),o=["components"],i={id_old:"version-2.3.0-playwright-crawler",title:"PlaywrightCrawler",id:"playwright-crawler"},p=void 0,s={unversionedId:"api/playwright-crawler",id:"version-2.3/api/playwright-crawler",title:"PlaywrightCrawler",description:"Provides a simple framework for parallel crawling of web pages using headless Chromium, Firefox and Webkit browsers with",source:"@site/versioned_docs/version-2.3/api/PlaywrightCrawler.md",sourceDirName:"api",slug:"/api/playwright-crawler",permalink:"/sdk/js/docs/2.3/api/playwright-crawler",draft:!1,tags:[],version:"2.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1686040008,formattedLastUpdatedAt:"Jun 6, 2023",frontMatter:{id_old:"version-2.3.0-playwright-crawler",title:"PlaywrightCrawler",id:"playwright-crawler"},sidebar:"version-2.3/docs",previous:{title:"CheerioCrawler",permalink:"/sdk/js/docs/2.3/api/cheerio-crawler"},next:{title:"PuppeteerCrawler",permalink:"/sdk/js/docs/2.3/api/puppeteer-crawler"}},u={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>stats</code>",id:"stats",level:3},{value:"<code>requestList</code>",id:"requestlist",level:3},{value:"<code>requestQueue</code>",id:"requestqueue",level:3},{value:"<code>sessionPool</code>",id:"sessionpool",level:3},{value:"<code>proxyConfiguration</code>",id:"proxyconfiguration",level:3},{value:"<code>browserPool</code>",id:"browserpool",level:3},{value:"<code>autoscaledPool</code>",id:"autoscaledpool",level:3},{value:"<code>new PlaywrightCrawler(options)</code>",id:"new-playwrightcrawleroptions",level:2},{value:"<code>playwrightCrawler.optionsShape</code>",id:"playwrightcrawleroptionsshape",level:2}],d={toc:c},h="wrapper";function m(e){var t=e.components,a=(0,n.Z)(e,o);return(0,l.kt)(h,(0,r.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("a",{name:"playwrightcrawler"}),(0,l.kt)("p",null,"Provides a simple framework for parallel crawling of web pages using headless Chromium, Firefox and Webkit browsers with\n",(0,l.kt)("a",{parentName:"p",href:"https://github.com/microsoft/playwright",target:"_blank",rel:"noopener"},"Playwright"),". The URLs to crawl are fed either from a static list of URLs or from a dynamic queue of URLs\nenabling recursive crawling of websites."),(0,l.kt)("p",null,"Since ",(0,l.kt)("inlineCode",{parentName:"p"},"Playwright")," uses headless browser to download web pages and extract data, it is useful for crawling of websites that require to execute\nJavaScript. If the target website doesn't need JavaScript, consider using ",(0,l.kt)("a",{parentName:"p",href:"../api/cheerio-crawler",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"CheerioCrawler")),", which downloads the pages using\nraw HTTP requests and is about 10x faster."),(0,l.kt)("p",null,"The source URLs are represented using ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," objects that are fed from ",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))," or\n",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))," instances provided by the\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/playwright-crawler-options#requestlist",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions.requestList"))," or\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/playwright-crawler-options#requestqueue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions.requestQueue"))," constructor options, respectively."),(0,l.kt)("p",null,"If both ",(0,l.kt)("a",{parentName:"p",href:"../typedefs/playwright-crawler-options#requestlist",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions.requestList"))," and\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/playwright-crawler-options#requestqueue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions.requestQueue"))," are used, the instance first processes URLs from the\n",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))," and automatically enqueues all of them to ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))," before it starts their\nprocessing. This ensures that a single URL is not crawled multiple times."),(0,l.kt)("p",null,"The crawler finishes when there are no more ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," objects to crawl."),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"PlaywrightCrawler")," opens a new Chrome page (i.e. tab) for each ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," object to crawl and then calls the function provided by\nuser as the ",(0,l.kt)("a",{parentName:"p",href:"../typedefs/playwright-crawler-options#handlepagefunction",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions.handlePageFunction"))," option."),(0,l.kt)("p",null,"New pages are only opened when there is enough free CPU and memory available, using the functionality provided by the\n",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," class. All ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," configuration options can be passed to the\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/playwright-crawler-options#autoscaledpooloptions",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions.autoscaledPoolOptions"))," parameter of the ",(0,l.kt)("inlineCode",{parentName:"p"},"PlaywrightCrawler"),"\nconstructor. For user convenience, the ",(0,l.kt)("inlineCode",{parentName:"p"},"minConcurrency")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"maxConcurrency")," ",(0,l.kt)("a",{parentName:"p",href:"../typedefs/autoscaled-pool-options",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPoolOptions"))," are\navailable directly in the ",(0,l.kt)("inlineCode",{parentName:"p"},"PlaywrightCrawler")," constructor."),(0,l.kt)("p",null,"Note that the pool of Playwright instances is internally managed by the ",(0,l.kt)("inlineCode",{parentName:"p"},"BrowserPool")," class. Many constructor options such as\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/playwright-crawler-options#maxopenpagesperinstance",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions.maxOpenPagesPerInstance"))," or"),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Example usage:")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"const crawler = new Apify.PlaywrightCrawler({\n    requestList,\n    handlePageFunction: async ({ page, request }) => {\n        // This function is called to extract data from a single web page\n        // 'page' is an instance of Playwright.Page with page.goto(request.url) already called\n        // 'request' is an instance of Request class with information about the page to load\n        await Apify.pushData({\n            title: await page.title(),\n            url: request.url,\n            succeeded: true,\n        });\n    },\n    handleFailedRequestFunction: async ({ request }) => {\n        // This function is called when the crawling of a request failed too many times\n        await Apify.pushData({\n            url: request.url,\n            succeeded: false,\n            errors: request.errorMessages,\n        });\n    },\n});\n\nawait crawler.run();\n")),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"stats"},(0,l.kt)("inlineCode",{parentName:"h3"},"stats")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/statistics",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Statistics"))),(0,l.kt)("p",null,"Contains statistics about the current run."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"requestlist"},(0,l.kt)("inlineCode",{parentName:"h3"},"requestList")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestList"))," class that manages the crawler's ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request")),"s. Only available if\nused by the crawler."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"requestqueue"},(0,l.kt)("inlineCode",{parentName:"h3"},"requestQueue")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))," class that manages the crawler's ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request")),"s. Only available if\nused by the crawler."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"sessionpool"},(0,l.kt)("inlineCode",{parentName:"h3"},"sessionPool")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"SessionPool"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"SessionPool"))," class that manages the crawler's ",(0,l.kt)("a",{parentName:"p",href:"../api/session",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Session")),"s. Only available if\nused by the crawler."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"proxyconfiguration"},(0,l.kt)("inlineCode",{parentName:"h3"},"proxyConfiguration")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/proxy-configuration",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"ProxyConfiguration"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/proxy-configuration",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"ProxyConfiguration"))," class that manages the crawler's proxies. Only available if used by\nthe crawler."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"browserpool"},(0,l.kt)("inlineCode",{parentName:"h3"},"browserPool")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"BrowserPool")),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("inlineCode",{parentName:"p"},"BrowserPool")," class that manages the crawler's browsers. For more information about it, see the\n",(0,l.kt)("a",{parentName:"p",href:"https://github.com/apify/browser-pool",target:"_blank",rel:"noopener"},(0,l.kt)("inlineCode",{parentName:"a"},"browser-pool")," module"),"."),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"autoscaledpool"},(0,l.kt)("inlineCode",{parentName:"h3"},"autoscaledPool")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Type"),": ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))),(0,l.kt)("p",null,"A reference to the underlying ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," class that manages the concurrency of the crawler. Note that this property is\nonly initialized after calling the ",(0,l.kt)("a",{parentName:"p",href:"../api/cheerio-crawler#run",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"CheerioCrawler.run()"))," function. You can use it to change the concurrency settings on\nthe fly, to pause the crawler by calling ",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool#pause",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool.pause()"))," or to abort it by calling\n",(0,l.kt)("a",{parentName:"p",href:"../api/autoscaled-pool#abort",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"AutoscaledPool.abort()")),"."),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"playwrightcrawler"}),(0,l.kt)("h2",{id:"new-playwrightcrawleroptions"},(0,l.kt)("inlineCode",{parentName:"h2"},"new PlaywrightCrawler(options)")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,l.kt)("a",{parentName:"li",href:"../typedefs/playwright-crawler-options",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawlerOptions"))," - All ",(0,l.kt)("inlineCode",{parentName:"li"},"PlaywrightCrawler")," parameters are passed via an options\nobject.")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"optionsshape"}),(0,l.kt)("h2",{id:"playwrightcrawleroptionsshape"},(0,l.kt)("inlineCode",{parentName:"h2"},"playwrightCrawler.optionsShape")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Internal"),":"),(0,l.kt)("hr",null))}m.isMDXComponent=!0},3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>m});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var p=r.createContext({}),s=function(e){var t=r.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},u=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,p=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),c=s(a),h=n,m=c["".concat(p,".").concat(h)]||c[h]||d[h]||l;return a?r.createElement(m,o(o({ref:t},u),{},{components:a})):r.createElement(m,o({ref:t},u))}));function m(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,o=new Array(l);o[0]=h;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[c]="string"==typeof e?e:n,o[1]=i;for(var s=2;s<l;s++)o[s]=a[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,a)}h.displayName="MDXCreateElement"}}]);