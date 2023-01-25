"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5085],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>k});var o=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=o.createContext({}),s=function(e){var t=o.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=s(e.components);return o.createElement(p.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},h=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,p=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),c=s(n),h=r,k=c["".concat(p,".").concat(h)]||c[h]||d[h]||a;return n?o.createElement(k,l(l({ref:t},u),{},{components:n})):o.createElement(k,l({ref:t},u))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=h;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[c]="string"==typeof e?e:r,l[1]=i;for(var s=2;s<a;s++)l[s]=n[s];return o.createElement.apply(null,l)}return o.createElement.apply(null,n)}h.displayName="MDXCreateElement"},79781:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>p,default:()=>h,frontMatter:()=>i,metadata:()=>s,toc:()=>c});var o=n(87462),r=n(63366),a=(n(67294),n(3905)),l=["components"],i={id_old:"version-1.3-puppeteer-crawler-options",title:"PuppeteerCrawlerOptions",id:"puppeteer-crawler-options"},p=void 0,s={unversionedId:"typedefs/puppeteer-crawler-options",id:"version-1.3/typedefs/puppeteer-crawler-options",title:"PuppeteerCrawlerOptions",description:"Properties",source:"@site/versioned_docs/version-1.3/typedefs/PuppeteerCrawlerOptions.md",sourceDirName:"typedefs",slug:"/typedefs/puppeteer-crawler-options",permalink:"/docs/1.3/typedefs/puppeteer-crawler-options",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1674659015,formattedLastUpdatedAt:"Jan 25, 2023",frontMatter:{id_old:"version-1.3-puppeteer-crawler-options",title:"PuppeteerCrawlerOptions",id:"puppeteer-crawler-options"},sidebar:"version-1.3/docs",previous:{title:"PlaywrightLaunchContext",permalink:"/docs/1.3/typedefs/playwright-launch-context"},next:{title:"PuppeteerLaunchContext",permalink:"/docs/1.3/typedefs/puppeteer-launch-context"}},u={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>handlePageFunction</code>",id:"handlepagefunction",level:3},{value:"<code>navigationTimeoutSecs</code>",id:"navigationtimeoutsecs",level:3},{value:"<code>handleFailedRequestFunction</code>",id:"handlefailedrequestfunction",level:3},{value:"<code>launchContext</code>",id:"launchcontext",level:3},{value:"<code>handlePageTimeoutSecs</code>",id:"handlepagetimeoutsecs",level:3},{value:"<code>browserPoolOptions</code>",id:"browserpooloptions",level:3},{value:"<code>persistCookiesPerSession</code>",id:"persistcookiespersession",level:3},{value:"<code>proxyConfiguration</code>",id:"proxyconfiguration",level:3},{value:"<code>preNavigationHooks</code>",id:"prenavigationhooks",level:3},{value:"<code>postNavigationHooks</code>",id:"postnavigationhooks",level:3},{value:"<code>requestList</code>",id:"requestlist",level:3},{value:"<code>requestQueue</code>",id:"requestqueue",level:3},{value:"<code>maxRequestRetries</code>",id:"maxrequestretries",level:3},{value:"<code>maxRequestsPerCrawl</code>",id:"maxrequestspercrawl",level:3},{value:"<code>autoscaledPoolOptions</code>",id:"autoscaledpooloptions",level:3},{value:"<code>minConcurrency</code>",id:"minconcurrency",level:3},{value:"<code>maxConcurrency</code>",id:"maxconcurrency",level:3},{value:"<code>useSessionPool</code>",id:"usesessionpool",level:3},{value:"<code>sessionPoolOptions</code>",id:"sessionpooloptions",level:3}],d={toc:c};function h(e){var t=e.components,n=(0,r.Z)(e,l);return(0,a.kt)("wrapper",(0,o.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("a",{name:"puppeteercrawleroptions"}),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"handlepagefunction"},(0,a.kt)("inlineCode",{parentName:"h3"},"handlePageFunction")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../typedefs/puppeteer-handle-page",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"PuppeteerHandlePage"))),(0,a.kt)("p",null,"Function that is called to process each request. It is passed an object with the following fields:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"{\n  request: Request,\n  response: Response,\n  page: Page,\n  session: Session,\n  browserController: BrowserController,\n  proxyInfo: ProxyInfo,\n  crawler: PuppeteerCrawler,\n}\n")),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"request")," is an instance of the ",(0,a.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"Request"))," object with details about the URL to open, HTTP method etc. ",(0,a.kt)("inlineCode",{parentName:"p"},"page")," is an instance of the\n",(0,a.kt)("inlineCode",{parentName:"p"},"Puppeteer")," ",(0,a.kt)("a",{parentName:"p",href:"https://pptr.dev/#?product=Puppeteer&show=api-class-page",target:"_blank",rel:"noopener"},(0,a.kt)("inlineCode",{parentName:"a"},"Page"))," ",(0,a.kt)("inlineCode",{parentName:"p"},"browserPool")," is an instance of the\n",(0,a.kt)("a",{parentName:"p",href:"https://github.com/apify/browser-pool#BrowserPool",target:"_blank",rel:"noopener"},(0,a.kt)("inlineCode",{parentName:"a"},"BrowserPool")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"browserController")," is an instance of the\n",(0,a.kt)("a",{parentName:"p",href:"https://github.com/apify/browser-pool#browsercontroller",target:"_blank",rel:"noopener"},(0,a.kt)("inlineCode",{parentName:"a"},"BrowserController")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"response")," is an instance of the ",(0,a.kt)("inlineCode",{parentName:"p"},"Puppeteer"),"\n",(0,a.kt)("a",{parentName:"p",href:"https://pptr.dev/#?product=Puppeteer&show=api-class-response",target:"_blank",rel:"noopener"},(0,a.kt)("inlineCode",{parentName:"a"},"Response")),", which is the main resource response as returned by\n",(0,a.kt)("inlineCode",{parentName:"p"},"page.goto(request.url)"),". The function must return a promise, which is then awaited by the crawler."),(0,a.kt)("p",null,"If the function throws an exception, the crawler will try to re-crawl the request later, up to ",(0,a.kt)("inlineCode",{parentName:"p"},"option.maxRequestRetries")," times. If all the retries\nfail, the crawler calls the function provided to the ",(0,a.kt)("inlineCode",{parentName:"p"},"handleFailedRequestFunction")," parameter. To make this work, you should ",(0,a.kt)("strong",{parentName:"p"},"always")," let your\nfunction throw exceptions rather than catch them. The exceptions are logged to the request using the\n",(0,a.kt)("a",{parentName:"p",href:"../api/request#pusherrormessage",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"Request.pushErrorMessage()"))," function."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"navigationtimeoutsecs"},(0,a.kt)("inlineCode",{parentName:"h3"},"navigationTimeoutSecs")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 60")),(0,a.kt)("p",null,"Timeout in which page navigation needs to finish, in seconds."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"handlefailedrequestfunction"},(0,a.kt)("inlineCode",{parentName:"h3"},"handleFailedRequestFunction")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../typedefs/handle-failed-request",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"HandleFailedRequest"))),(0,a.kt)("p",null,"A function to handle requests that failed more than ",(0,a.kt)("inlineCode",{parentName:"p"},"option.maxRequestRetries")," times."),(0,a.kt)("p",null,"The function receives the following object as an argument:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"{\n  request: Request,\n  response: Response,\n  page: Page,\n  session: Session,\n  browserController: BrowserController,\n  proxyInfo: ProxyInfo,\n  crawler: PuppeteerCrawler,\n}\n")),(0,a.kt)("p",null,"Where the ",(0,a.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"Request"))," instance corresponds to the failed request, and the ",(0,a.kt)("inlineCode",{parentName:"p"},"Error")," instance represents the last error thrown during\nprocessing of the request."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"launchcontext"},(0,a.kt)("inlineCode",{parentName:"h3"},"launchContext")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../typedefs/puppeteer-launch-context",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"PuppeteerLaunchContext"))),(0,a.kt)("p",null,"Options used by ",(0,a.kt)("a",{parentName:"p",href:"../api/apify#launchpuppeteer",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"Apify.launchPuppeteer()"))," to start new Puppeteer instances."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"handlepagetimeoutsecs"},(0,a.kt)("inlineCode",{parentName:"h3"},"handlePageTimeoutSecs")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 60")),(0,a.kt)("p",null,"Timeout in which the function passed as ",(0,a.kt)("inlineCode",{parentName:"p"},"handlePageFunction")," needs to finish, in seconds."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"browserpooloptions"},(0,a.kt)("inlineCode",{parentName:"h3"},"browserPoolOptions")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"BrowserPoolOptions")),(0,a.kt)("p",null,"Custom options passed to the underlying ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/apify/browser-pool#BrowserPool",target:"_blank",rel:"noopener"},(0,a.kt)("inlineCode",{parentName:"a"},"BrowserPool"))," constructor. You can tweak those to\nfine-tune browser management."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"persistcookiespersession"},(0,a.kt)("inlineCode",{parentName:"h3"},"persistCookiesPerSession")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," ",(0,a.kt)("code",null," = true")),(0,a.kt)("p",null,"Automatically saves cookies to Session. Works only if Session Pool is used."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"proxyconfiguration"},(0,a.kt)("inlineCode",{parentName:"h3"},"proxyConfiguration")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../api/proxy-configuration",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"ProxyConfiguration"))),(0,a.kt)("p",null,"If set, ",(0,a.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler")," will be configured for all connections to use ",(0,a.kt)("a",{parentName:"p",href:"https://my.apify.com/proxy",target:"_blank",rel:"noopener"},"Apify Proxy")," or your own Proxy URLs provided and\nrotated according to the configuration. For more information, see the ",(0,a.kt)("a",{parentName:"p",href:"https://docs.apify.com/proxy",target:"_blank",rel:"noopener"},"documentation"),"."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"prenavigationhooks"},(0,a.kt)("inlineCode",{parentName:"h3"},"preNavigationHooks")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../typedefs/puppeteer-hook",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"Array<PuppeteerHook>"))),(0,a.kt)("p",null,"Async functions that are sequentially evaluated before the navigation. Good for setting additional cookies or browser properties before navigation.\nThe function accepts two parameters, ",(0,a.kt)("inlineCode",{parentName:"p"},"crawlingContext")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"gotoOptions"),", which are passed to the ",(0,a.kt)("inlineCode",{parentName:"p"},"page.goto()")," function the crawler calls to\nnavigate. Example:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"preNavigationHooks: [\n    async (crawlingContext, gotoOptions) => {\n        const { page } = crawlingContext;\n        await page.evaluate((attr) => { window.foo = attr; }, 'bar');\n    }\n]\n")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"postnavigationhooks"},(0,a.kt)("inlineCode",{parentName:"h3"},"postNavigationHooks")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../typedefs/puppeteer-hook",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"Array<PuppeteerHook>"))),(0,a.kt)("p",null,"Async functions that are sequentially evaluated after the navigation. Good for checking if the navigation was successful. The function accepts\n",(0,a.kt)("inlineCode",{parentName:"p"},"crawlingContext")," as the only parameter. Example:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"postNavigationHooks: [\n    async (crawlingContext) => {\n        const { page } = crawlingContext;\n        if (hasCaptcha(page)) {\n            await solveCaptcha (page);\n        }\n    };\n]\n")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"requestlist"},(0,a.kt)("inlineCode",{parentName:"h3"},"requestList")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../api/request-list",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"RequestList"))),(0,a.kt)("p",null,"Static list of URLs to be processed. Either ",(0,a.kt)("inlineCode",{parentName:"p"},"requestList")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"requestQueue")," option must be provided (or both)."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"requestqueue"},(0,a.kt)("inlineCode",{parentName:"h3"},"requestQueue")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"RequestQueue"))),(0,a.kt)("p",null,"Dynamic queue of URLs to be processed. This is useful for recursive crawling of websites. Either ",(0,a.kt)("inlineCode",{parentName:"p"},"requestList")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"requestQueue")," option must be\nprovided (or both)."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxrequestretries"},(0,a.kt)("inlineCode",{parentName:"h3"},"maxRequestRetries")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 3")),(0,a.kt)("p",null,"Indicates how many times the request is retried if\n",(0,a.kt)("a",{parentName:"p",href:"../typedefs/puppeteer-crawler-options#handlepagefunction",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"PuppeteerCrawlerOptions.handlePageFunction"))," fails."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxrequestspercrawl"},(0,a.kt)("inlineCode",{parentName:"h3"},"maxRequestsPerCrawl")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Maximum number of pages that the crawler will open. The crawl will stop when this limit is reached. Always set this value in order to prevent infinite\nloops in misconfigured crawlers. Note that in cases of parallel crawling, the actual number of pages visited might be slightly higher than this value."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"autoscaledpooloptions"},(0,a.kt)("inlineCode",{parentName:"h3"},"autoscaledPoolOptions")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../typedefs/autoscaled-pool-options",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"AutoscaledPoolOptions"))),(0,a.kt)("p",null,"Custom options passed to the underlying ",(0,a.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," constructor. Note that the ",(0,a.kt)("inlineCode",{parentName:"p"},"runTaskFunction")," and\n",(0,a.kt)("inlineCode",{parentName:"p"},"isTaskReadyFunction")," options are provided by the crawler and cannot be overridden. However, you can provide a custom implementation of\n",(0,a.kt)("inlineCode",{parentName:"p"},"isFinishedFunction"),"."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"minconcurrency"},(0,a.kt)("inlineCode",{parentName:"h3"},"minConcurrency")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 1")),(0,a.kt)("p",null,"Sets the minimum concurrency (parallelism) for the crawl. Shortcut to the corresponding ",(0,a.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," option."),(0,a.kt)("p",null,(0,a.kt)("em",{parentName:"p"},"WARNING:")," If you set this value too high with respect to the available system memory and CPU, your crawler will run extremely slow or crash. If\nyou're not sure, just keep the default value and the concurrency will scale up automatically."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxconcurrency"},(0,a.kt)("inlineCode",{parentName:"h3"},"maxConcurrency")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")," ",(0,a.kt)("code",null," = 1000")),(0,a.kt)("p",null,"Sets the maximum concurrency (parallelism) for the crawl. Shortcut to the corresponding ",(0,a.kt)("a",{parentName:"p",href:"../api/autoscaled-pool",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"AutoscaledPool"))," option."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"usesessionpool"},(0,a.kt)("inlineCode",{parentName:"h3"},"useSessionPool")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," ",(0,a.kt)("code",null," = true")),(0,a.kt)("p",null,"Puppeteer crawler will initialize the ",(0,a.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"SessionPool"))," with the corresponding ",(0,a.kt)("inlineCode",{parentName:"p"},"sessionPoolOptions"),". The session instance will be\nthan available in the ",(0,a.kt)("inlineCode",{parentName:"p"},"handleRequestFunction"),"."),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"sessionpooloptions"},(0,a.kt)("inlineCode",{parentName:"h3"},"sessionPoolOptions")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Type"),": ",(0,a.kt)("a",{parentName:"p",href:"../typedefs/session-pool-options",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"SessionPoolOptions"))),(0,a.kt)("p",null,"The configuration options for ",(0,a.kt)("a",{parentName:"p",href:"../api/session-pool",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"SessionPool"))," to use."),(0,a.kt)("hr",null))}h.isMDXComponent=!0}}]);