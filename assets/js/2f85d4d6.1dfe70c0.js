"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3891],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>c});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=a.createContext({}),o=function(e){var t=a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=o(e.components);return a.createElement(u.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,u=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=o(n),c=r,h=m["".concat(u,".").concat(c)]||m[c]||d[c]||i;return n?a.createElement(h,s(s({ref:t},p),{},{components:n})):a.createElement(h,s({ref:t},p))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,s=new Array(i);s[0]=m;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l.mdxType="string"==typeof e?e:r,s[1]=l;for(var o=2;o<i;o++)s[o]=n[o];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},98578:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>u,default:()=>c,frontMatter:()=>l,metadata:()=>o,toc:()=>d});var a=n(87462),r=n(63366),i=(n(67294),n(3905)),s=["components"],l={id:"request-list",title:"RequestList"},u=void 0,o={unversionedId:"api/request-list",id:"version-2.3/api/request-list",title:"RequestList",description:"Represents a static list of URLs to crawl. The URLs can be provided either in code or parsed from a text file hosted on the web. RequestList is used",source:"@site/versioned_docs/version-2.3/api/RequestList.md",sourceDirName:"api",slug:"/api/request-list",permalink:"/docs/2.3/api/request-list",draft:!1,tags:[],version:"2.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1662007468,formattedLastUpdatedAt:"Sep 1, 2022",frontMatter:{id:"request-list",title:"RequestList"},sidebar:"version-2.3/docs",previous:{title:"Request",permalink:"/docs/2.3/api/request"},next:{title:"RequestQueue",permalink:"/docs/2.3/api/request-queue"}},p={},d=[{value:"<code>new RequestList(options)</code>",id:"new-requestlistoptions",level:2},{value:"<code>requestList.requests</code>",id:"requestlistrequests",level:2},{value:"<code>requestList.initialize()</code>",id:"requestlistinitialize",level:2},{value:"<code>requestList.persistState()</code>",id:"requestlistpersiststate",level:2},{value:"<code>requestList.getState()</code>",id:"requestlistgetstate",level:2},{value:"<code>requestList.isEmpty()</code>",id:"requestlistisempty",level:2},{value:"<code>requestList.isFinished()</code>",id:"requestlistisfinished",level:2},{value:"<code>requestList.fetchNextRequest()</code>",id:"requestlistfetchnextrequest",level:2},{value:"<code>requestList.markRequestHandled(request)</code>",id:"requestlistmarkrequesthandledrequest",level:2},{value:"<code>requestList.reclaimRequest(request)</code>",id:"requestlistreclaimrequestrequest",level:2},{value:"<code>requestList.length()</code>",id:"requestlistlength",level:2},{value:"<code>requestList.handledCount()</code>",id:"requestlisthandledcount",level:2}],m={toc:d};function c(e){var t=e.components,n=(0,r.Z)(e,s);return(0,i.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("a",{name:"requestlist"}),(0,i.kt)("p",null,"Represents a static list of URLs to crawl. The URLs can be provided either in code or parsed from a text file hosted on the web. ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," is used\nby ",(0,i.kt)("a",{parentName:"p",href:"../api/basic-crawler",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"BasicCrawler")),", ",(0,i.kt)("a",{parentName:"p",href:"../api/cheerio-crawler",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"CheerioCrawler")),", ",(0,i.kt)("a",{parentName:"p",href:"../api/puppeteer-crawler",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"PuppeteerCrawler"))," and\n",(0,i.kt)("a",{parentName:"p",href:"../api/playwright-crawler",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"PlaywrightCrawler"))," as a source of URLs to crawl."),(0,i.kt)("p",null,"Each URL is represented using an instance of the ",(0,i.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Request"))," class. The list can only contain unique URLs. More precisely, it can only\ncontain ",(0,i.kt)("inlineCode",{parentName:"p"},"Request")," instances with distinct ",(0,i.kt)("inlineCode",{parentName:"p"},"uniqueKey")," properties. By default, ",(0,i.kt)("inlineCode",{parentName:"p"},"uniqueKey")," is generated from the URL, but it can also be overridden. To\nadd a single URL to the list multiple times, corresponding ",(0,i.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Request"))," objects will need to have different ",(0,i.kt)("inlineCode",{parentName:"p"},"uniqueKey")," properties. You\ncan use the ",(0,i.kt)("inlineCode",{parentName:"p"},"keepDuplicateUrls")," option to do this for you when initializing the ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," from sources."),(0,i.kt)("p",null,"Once you create an instance of ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList"),", you need to call the ",(0,i.kt)("a",{parentName:"p",href:"../api/request-list#initialize",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"RequestList.initialize()"))," function before the\ninstance can be used. After that, no more URLs can be added to the list. Unlike ",(0,i.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"RequestQueue")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," is static but it\ncan contain even millions of URLs."),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Note that ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," can be used together with ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestQueue")," by the same crawler. In such cases, each request from ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," is enqueued\ninto ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestQueue")," first and then consumed from the latter. This is necessary to avoid the same URL being processed more than once (from the list\nfirst and then possibly from the queue). In practical terms, such a combination can be useful when there is a large number of initial URLs, but more\nURLs would be added dynamically by the crawler.")),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," has an internal state where it stores information about which requests were already handled, which are in progress and which were\nreclaimed. The state may be automatically persisted to the default ",(0,i.kt)("a",{parentName:"p",href:"../api/key-value-store",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"KeyValueStore"))," by setting the ",(0,i.kt)("inlineCode",{parentName:"p"},"persistStateKey")," option\nso that if the Node.js process is restarted, the crawling can continue where it left off. The automated persisting is launched upon receiving the\n",(0,i.kt)("inlineCode",{parentName:"p"},"persistState")," event that is periodically emitted by ",(0,i.kt)("a",{parentName:"p",href:"../api/apify#events",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Apify.events")),"."),(0,i.kt)("p",null,"The internal state is closely tied to the provided sources (URLs). If the sources change on actor restart, the state will become corrupted and\n",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," will raise an exception. This typically happens when the sources is a list of URLs downloaded from the web. In such case, use the\n",(0,i.kt)("inlineCode",{parentName:"p"},"persistRequestsKey")," option in conjunction with ",(0,i.kt)("inlineCode",{parentName:"p"},"persistStateKey"),", to make the ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," store the initial sources to the default key-value store\nand load them after restart, which will prevent any issues that a live list of URLs might cause."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Basic usage:")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"// Use a helper function to simplify request list initialization.\n// State and sources are automatically persisted. This is a preferred usage.\nconst requestList = await Apify.openRequestList('my-request-list', [\n    'http://www.example.com/page-1',\n    { url: 'http://www.example.com/page-2', method: 'POST', userData: { foo: 'bar' } },\n    { requestsFromUrl: 'http://www.example.com/my-url-list.txt', userData: { isFromUrl: true } },\n]);\n")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Advanced usage:")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"// Use the constructor to get more control over the initialization.\nconst requestList = new Apify.RequestList({\n    sources: [\n        // Separate requests\n        { url: 'http://www.example.com/page-1', method: 'GET', headers: { ... } },\n        { url: 'http://www.example.com/page-2', userData: { foo: 'bar' }},\n\n        // Bulk load of URLs from file `http://www.example.com/my-url-list.txt`\n        // Note that all URLs must start with http:// or https://\n        { requestsFromUrl: 'http://www.example.com/my-url-list.txt', userData: { isFromUrl: true } },\n    ],\n\n    // Persist the state to avoid re-crawling which can lead to data duplications.\n    // Keep in mind that the sources have to be immutable or this will throw an error.\n    persistStateKey: 'my-state',\n});\n\nawait requestList.initialize();\n")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"exports.requestlist"}),(0,i.kt)("h2",{id:"new-requestlistoptions"},(0,i.kt)("inlineCode",{parentName:"h2"},"new RequestList(options)")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,i.kt)("a",{parentName:"li",href:"../typedefs/request-list-options",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"RequestListOptions"))," - All ",(0,i.kt)("inlineCode",{parentName:"li"},"RequestList")," configuration options")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"requests"}),(0,i.kt)("h2",{id:"requestlistrequests"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.requests")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"initialize"}),(0,i.kt)("h2",{id:"requestlistinitialize"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.initialize()")),(0,i.kt)("p",null,"Loads all remote sources of URLs and potentially starts periodic state persistence. This function must be called before you can start using the\ninstance in a meaningful way."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"persiststate"}),(0,i.kt)("h2",{id:"requestlistpersiststate"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.persistState()")),(0,i.kt)("p",null,"Persists the current state of the ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," into the default ",(0,i.kt)("a",{parentName:"p",href:"../api/key-value-store",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"KeyValueStore")),". The state is persisted automatically in\nregular intervals, but calling this method manually is useful in cases where you want to have the most current state available after you pause or stop\nfetching its requests. For example after you pause or abort a crawl. Or just before a server migration."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"getstate"}),(0,i.kt)("h2",{id:"requestlistgetstate"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.getState()")),(0,i.kt)("p",null,"Returns an object representing the internal state of the ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList")," instance. Note that the object's fields can change in future releases."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"../typedefs/request-list-state",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"RequestListState"))),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"isempty"}),(0,i.kt)("h2",{id:"requestlistisempty"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.isEmpty()")),(0,i.kt)("p",null,"Resolves to ",(0,i.kt)("inlineCode",{parentName:"p"},"true")," if the next call to ",(0,i.kt)("a",{parentName:"p",href:"../api/request-list#fetchnextrequest",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"RequestList.fetchNextRequest()"))," function would return ",(0,i.kt)("inlineCode",{parentName:"p"},"null"),",\notherwise it resolves to ",(0,i.kt)("inlineCode",{parentName:"p"},"false"),". Note that even if the list is empty, there might be some pending requests currently being processed."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<boolean>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"isfinished"}),(0,i.kt)("h2",{id:"requestlistisfinished"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.isFinished()")),(0,i.kt)("p",null,"Returns ",(0,i.kt)("inlineCode",{parentName:"p"},"true")," if all requests were already handled and there are no more left."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<boolean>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"fetchnextrequest"}),(0,i.kt)("h2",{id:"requestlistfetchnextrequest"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.fetchNextRequest()")),(0,i.kt)("p",null,"Gets the next ",(0,i.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Request"))," to process. First, the function gets a request previously reclaimed using the\n",(0,i.kt)("a",{parentName:"p",href:"../api/request-list#reclaimrequest",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"RequestList.reclaimRequest()"))," function, if there is any. Otherwise it gets the next request from sources."),(0,i.kt)("p",null,"The function's ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise")," resolves to ",(0,i.kt)("inlineCode",{parentName:"p"},"null")," if there are no more requests to process."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Promise<(Request|null)>"))),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"markrequesthandled"}),(0,i.kt)("h2",{id:"requestlistmarkrequesthandledrequest"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.markRequestHandled(request)")),(0,i.kt)("p",null,"Marks request as handled after successful processing."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"strong"},"request")),": ",(0,i.kt)("a",{parentName:"li",href:"../api/request",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Request")))),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"reclaimrequest"}),(0,i.kt)("h2",{id:"requestlistreclaimrequestrequest"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.reclaimRequest(request)")),(0,i.kt)("p",null,"Reclaims request to the list if its processing failed. The request will become available in the next ",(0,i.kt)("inlineCode",{parentName:"p"},"this.fetchNextRequest()"),"."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},(0,i.kt)("inlineCode",{parentName:"strong"},"request")),": ",(0,i.kt)("a",{parentName:"li",href:"../api/request",target:null,rel:null},(0,i.kt)("inlineCode",{parentName:"a"},"Request")))),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"length"}),(0,i.kt)("h2",{id:"requestlistlength"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.length()")),(0,i.kt)("p",null,"Returns the total number of unique requests present in the ",(0,i.kt)("inlineCode",{parentName:"p"},"RequestList"),"."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("hr",null),(0,i.kt)("a",{name:"handledcount"}),(0,i.kt)("h2",{id:"requestlisthandledcount"},(0,i.kt)("inlineCode",{parentName:"h2"},"requestList.handledCount()")),(0,i.kt)("p",null,"Returns number of handled requests."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Returns"),":"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("hr",null))}c.isMDXComponent=!0}}]);