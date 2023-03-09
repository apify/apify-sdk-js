"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7619],{8025:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>c,frontMatter:()=>o,metadata:()=>p,toc:()=>m});var a=n(87462),r=n(63366),l=(n(67294),n(3905)),i=["components"],o={id_old:"version-2.3.0-utils",title:"utils",id:"utils"},s=void 0,p={unversionedId:"api/utils",id:"version-2.3/api/utils",title:"utils",description:"A namespace that contains various utilities.",source:"@site/versioned_docs/version-2.3/api/utils.md",sourceDirName:"api",slug:"/api/utils",permalink:"/sdk/js/docs/2.3/api/utils",draft:!1,tags:[],version:"2.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1678376167,formattedLastUpdatedAt:"Mar 9, 2023",frontMatter:{id_old:"version-2.3.0-utils",title:"utils",id:"utils"},sidebar:"version-2.3/docs",previous:{title:"PseudoUrl",permalink:"/sdk/js/docs/2.3/api/pseudo-url"},next:{title:"utils.log",permalink:"/sdk/js/docs/2.3/api/log"}},u={},m=[{value:"<code>utils.URL_NO_COMMAS_REGEX</code>",id:"utilsurl_no_commas_regex",level:2},{value:"<code>utils.URL_WITH_COMMAS_REGEX</code>",id:"utilsurl_with_commas_regex",level:2},{value:"<code>utils.enqueueLinks(options)</code>",id:"utilsenqueuelinksoptions",level:2},{value:"<code>utils.requestAsBrowser(options)</code>",id:"utilsrequestasbrowseroptions",level:2},{value:"<code>utils.isDocker(forceReset)</code>",id:"utilsisdockerforcereset",level:2},{value:"<code>utils.sleep(millis)</code>",id:"utilssleepmillis",level:2},{value:"<code>utils.downloadListOfUrls(options)</code>",id:"utilsdownloadlistofurlsoptions",level:2},{value:"<code>utils.extractUrls(options)</code>",id:"utilsextracturlsoptions",level:2},{value:"<code>utils.htmlToText(html)</code>",id:"utilshtmltotexthtml",level:2},{value:"<code>utils.purgeLocalStorage([folder])</code>",id:"utilspurgelocalstoragefolder",level:2}],d={toc:m},k="wrapper";function c(e){var t=e.components,n=(0,r.Z)(e,i);return(0,l.kt)(k,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("a",{name:"utils"}),(0,l.kt)("p",null,"A namespace that contains various utilities."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Example usage:")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\n...\n\n// Sleep 1.5 seconds\nawait Apify.utils.sleep(1500);\n")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"url_no_commas_regex"}),(0,l.kt)("h2",{id:"utilsurl_no_commas_regex"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.URL_NO_COMMAS_REGEX")),(0,l.kt)("p",null,"Default regular expression to match URLs in a string that may be plain text, JSON, CSV or other. It supports common URL characters and does not\nsupport URLs containing commas or spaces. The URLs also may contain Unicode letters (not symbols)."),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"url_with_commas_regex"}),(0,l.kt)("h2",{id:"utilsurl_with_commas_regex"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.URL_WITH_COMMAS_REGEX")),(0,l.kt)("p",null,"Regular expression that, in addition to the default regular expression ",(0,l.kt)("inlineCode",{parentName:"p"},"URL_NO_COMMAS_REGEX"),", supports matching commas in URL path and query. Note,\nhowever, that this may prevent parsing URLs from comma delimited lists, or the URLs may become malformed."),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"enqueuelinks"}),(0,l.kt)("h2",{id:"utilsenqueuelinksoptions"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.enqueueLinks(options)")),(0,l.kt)("p",null,"The function finds elements matching a specific CSS selector (HTML anchor (",(0,l.kt)("inlineCode",{parentName:"p"},"<a>"),") by default) either in a Puppeteer page, or in a Cheerio object\n(parsed HTML), and enqueues the URLs in their ",(0,l.kt)("inlineCode",{parentName:"p"},"href")," attributes to the provided ",(0,l.kt)("a",{parentName:"p",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue")),". If you're looking to find URLs\nin JavaScript heavy pages where links are not available in ",(0,l.kt)("inlineCode",{parentName:"p"},"href")," elements, but rather navigations are triggered in click handlers see\n",(0,l.kt)("a",{parentName:"p",href:"../api/puppeteer#enqueuelinksbyclickingelements",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"puppeteer.enqueueLinksByClickingElements()")),"."),(0,l.kt)("p",null,"Optionally, the function allows you to filter the target links' URLs using an array of ",(0,l.kt)("a",{parentName:"p",href:"../api/pseudo-url",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PseudoUrl"))," objects and override settings\nof the enqueued ",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," objects."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Example usage")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"await Apify.utils.enqueueLinks({\n    page,\n    requestQueue,\n    selector: 'a.product-detail',\n    pseudoUrls: ['https://www.example.com/handbags/[.*]', 'https://www.example.com/purses/[.*]'],\n});\n")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("strong",{parentName:"p"},(0,l.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,l.kt)("inlineCode",{parentName:"p"},"object")," - All ",(0,l.kt)("inlineCode",{parentName:"p"},"enqueueLinks()")," parameters are passed via an options object with the following keys:"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[page]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"PuppeteerPage")," | ",(0,l.kt)("inlineCode",{parentName:"li"},"PlaywrightPage")," - Puppeteer ",(0,l.kt)("a",{parentName:"li",href:"https://pptr.dev/#?product=Puppeteer&show=api-class-page",target:"_blank",rel:"noopener"},(0,l.kt)("inlineCode",{parentName:"a"},"Page"))," object. Either\n",(0,l.kt)("inlineCode",{parentName:"li"},"page")," or ",(0,l.kt)("inlineCode",{parentName:"li"},"$")," option must be provided."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[limit]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"Number")," - Limit the count of actually enqueued URLs to this number. Useful for testing across the entire crawling scope."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[$]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"CheerioAPI")," - ",(0,l.kt)("a",{parentName:"li",href:"https://github.com/cheeriojs/cheerio",target:"_blank",rel:"noopener"},(0,l.kt)("inlineCode",{parentName:"a"},"Cheerio"))," function with loaded HTML. Either ",(0,l.kt)("inlineCode",{parentName:"li"},"page")," or ",(0,l.kt)("inlineCode",{parentName:"li"},"$")," option must be\nprovided."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"requestQueue")),": ",(0,l.kt)("a",{parentName:"li",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue"))," - A request queue to which the URLs will be enqueued."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[selector]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")," ",(0,l.kt)("code",null," = ",'"',"'","a","'",'"')," - A CSS selector matching links to be enqueued."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[baseUrl]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")," - A base URL that will be used to resolve relative URLs when using Cheerio. Ignored when using Puppeteer, since the\nrelative URL resolution is done inside the browser automatically."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[pseudoUrls]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"Array<Object<string, *&gt;>")," | ",(0,l.kt)("inlineCode",{parentName:"li"},"Array.&lt;string>")," - An array of ",(0,l.kt)("a",{parentName:"li",href:"../api/pseudo-url",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PseudoUrl")),"s matching the URLs to\nbe enqueued, or an array of strings or RegExps or plain Objects from which the ",(0,l.kt)("a",{parentName:"li",href:"../api/pseudo-url",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PseudoUrl")),"s can be constructed.")),(0,l.kt)("p",{parentName:"li"},"The plain objects must include at least the ",(0,l.kt)("inlineCode",{parentName:"p"},"purl")," property, which holds the pseudo-URL string or RegExp. All remaining keys will be used as the\n",(0,l.kt)("inlineCode",{parentName:"p"},"requestTemplate")," argument of the ",(0,l.kt)("a",{parentName:"p",href:"../api/pseudo-url",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"PseudoUrl"))," constructor, which lets you specify special properties for the enqueued\n",(0,l.kt)("a",{parentName:"p",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," objects."),(0,l.kt)("p",{parentName:"li"},"If ",(0,l.kt)("inlineCode",{parentName:"p"},"pseudoUrls")," is an empty array, ",(0,l.kt)("inlineCode",{parentName:"p"},"null")," or ",(0,l.kt)("inlineCode",{parentName:"p"},"undefined"),", then the function enqueues all links found on the page."),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[transformRequestFunction]")),": ",(0,l.kt)("a",{parentName:"li",href:"../typedefs/request-transform",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestTransform"))," - Just before a new ",(0,l.kt)("a",{parentName:"li",href:"../api/request",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Request"))," is\nconstructed and enqueued to the ",(0,l.kt)("a",{parentName:"li",href:"../api/request-queue",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestQueue")),", this function can be used to remove it or modify its contents such as\n",(0,l.kt)("inlineCode",{parentName:"li"},"userData"),", ",(0,l.kt)("inlineCode",{parentName:"li"},"payload")," or, most importantly ",(0,l.kt)("inlineCode",{parentName:"li"},"uniqueKey"),". This is useful when you need to enqueue multiple ",(0,l.kt)("inlineCode",{parentName:"li"},"Requests")," to the queue that share\nthe same URL, but differ in methods or payloads, or to dynamically update or create ",(0,l.kt)("inlineCode",{parentName:"li"},"userData"),".")),(0,l.kt)("p",{parentName:"li"},"For example: by adding ",(0,l.kt)("inlineCode",{parentName:"p"},"keepUrlFragment: true")," to the ",(0,l.kt)("inlineCode",{parentName:"p"},"request")," object, URL fragments will not be removed when ",(0,l.kt)("inlineCode",{parentName:"p"},"uniqueKey")," is computed."),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("strong",{parentName:"p"},"Example:")),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"{\n    transformRequestFunction: request => {\n        request.userData.foo = 'bar';\n        request.keepUrlFragment = true;\n        return request;\n    };\n}\n")))),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"../typedefs/queue-operation-info",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Promise<Array<QueueOperationInfo>>"))," - Promise that resolves to an array of\n",(0,l.kt)("a",{parentName:"p",href:"../typedefs/queue-operation-info",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"QueueOperationInfo"))," objects."),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"requestasbrowser"}),(0,l.kt)("h2",{id:"utilsrequestasbrowseroptions"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.requestAsBrowser(options)")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"IMPORTANT:")," This function uses an insecure version of HTTP parser by default and also ignores SSL/TLS errors. This is very useful in scraping,\nbecause it allows bypassing certain anti-scraping walls, but it also exposes some vulnerability. For other than scraping scenarios, please set\n",(0,l.kt)("inlineCode",{parentName:"p"},"useInsecureHttpParser: false")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"ignoreSslErrors: false"),"."),(0,l.kt)("p",null,"Sends a HTTP request that looks like a request sent by a web browser, fully emulating browser's HTTP headers. It uses HTTP2 by default for Node 12+."),(0,l.kt)("p",null,"This function is useful for web scraping of websites that send the full HTML in the first response. Thanks to this function, the target web server has\nno simple way to find out the request hasn't been sent by a human's web browser. Using a headless browser for such requests is an order of magnitude\nmore resource-intensive than this function."),(0,l.kt)("p",null,"The function emulates the Chrome and Firefox web browsers. If you want more control over the browsers and their versions, use the\n",(0,l.kt)("inlineCode",{parentName:"p"},"headerGeneratorOptions")," property. You can find more info in the readme of the ",(0,l.kt)("a",{parentName:"p",href:"https://github.com/apify/header-generator",target:"_blank",rel:"noopener"},(0,l.kt)("inlineCode",{parentName:"a"},"header-generator")),"\nlibrary."),(0,l.kt)("p",null,"Internally, the function uses the ",(0,l.kt)("a",{parentName:"p",href:"https://github.com/apify/got-scraping",target:"_blank",rel:"noopener"},(0,l.kt)("inlineCode",{parentName:"a"},"got-scraping"))," library to perform the request. All ",(0,l.kt)("inlineCode",{parentName:"p"},"options")," not recognized\nby this function are passed to it so see it for more details."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Example usage:")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-js"},"const Apify = require('apify');\n\nconst { utils: { requestAsBrowser } } = Apify;\n\n...\n\nconst response = await requestAsBrowser({ url: 'https://www.example.com/' });\n\nconst html = response.body;\nconst status = response.statusCode;\nconst contentType = response.headers['content-type'];\n")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,l.kt)("a",{parentName:"li",href:"../typedefs/request-as-browser-options",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"RequestAsBrowserOptions"))," - All ",(0,l.kt)("inlineCode",{parentName:"li"},"requestAsBrowser")," configuration options.")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"../typedefs/request-as-browser-result",target:null,rel:null},(0,l.kt)("inlineCode",{parentName:"a"},"Promise<RequestAsBrowserResult>"))," - The result can be various objects, but it will always be like a\n",(0,l.kt)("a",{parentName:"p",href:"https://nodejs.org/api/http.html#http_class_http_incomingmessage",target:"_blank",rel:"noopener"},"Node.js HTTP response stream")," with a 'body' property for the parsed response body,\nunless the 'stream' option is used."),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"isdocker"}),(0,l.kt)("h2",{id:"utilsisdockerforcereset"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.isDocker(forceReset)")),(0,l.kt)("p",null,"Returns a ",(0,l.kt)("inlineCode",{parentName:"p"},"Promise")," that resolves to true if the code is running in a Docker container."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"forceReset")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"boolean"))),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise<boolean>")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"sleep"}),(0,l.kt)("h2",{id:"utilssleepmillis"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.sleep(millis)")),(0,l.kt)("p",null,"Returns a ",(0,l.kt)("inlineCode",{parentName:"p"},"Promise")," that resolves after a specific period of time. This is useful to implement waiting in your code, e.g. to prevent overloading of\ntarget website or to avoid bot detection."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Example usage:")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre"},"const Apify = require('apify');\n\n...\n\n// Sleep 1.5 seconds\nawait Apify.utils.sleep(1500);\n")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"millis")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"number")," - Period of time to sleep, in milliseconds. If not a positive number, the returned promise resolves immediately.")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"downloadlistofurls"}),(0,l.kt)("h2",{id:"utilsdownloadlistofurlsoptions"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.downloadListOfUrls(options)")),(0,l.kt)("p",null,"Returns a promise that resolves to an array of urls parsed from the resource available at the provided url. Optionally, custom regular expression and\nencoding may be provided."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"object"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"url")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")," - URL to the file"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[encoding]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")," ",(0,l.kt)("code",null," = ",'"',"'","utf8","'",'"')," - The encoding of the file."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[urlRegExp]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"RegExp")," ",(0,l.kt)("code",null," = URL_NO_COMMAS_REGEX")," - Custom regular expression to identify the URLs in the file to extract. The\nregular expression should be case-insensitive and have global flag set (i.e. ",(0,l.kt)("inlineCode",{parentName:"li"},"/something/gi"),").")))),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise<Array<string>>")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"extracturls"}),(0,l.kt)("h2",{id:"utilsextracturlsoptions"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.extractUrls(options)")),(0,l.kt)("p",null,"Collects all URLs in an arbitrary string to an array, optionally using a custom regular expression."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"object"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"string")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[urlRegExp]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"RegExp")," ",(0,l.kt)("code",null," = Apify.utils.URL_NO_COMMAS_REGEX"))))),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Array<string>")),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"htmltotext"}),(0,l.kt)("h2",{id:"utilshtmltotexthtml"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.htmlToText(html)")),(0,l.kt)("p",null,"The function converts a HTML document to a plain text."),(0,l.kt)("p",null,"The plain text generated by the function is similar to a text captured by pressing Ctrl+A and Ctrl+C on a page when loaded in a web browser. The\nfunction doesn't aspire to preserve the formatting or to be perfectly correct with respect to HTML specifications. However, it attempts to generate\nnewlines and whitespaces in and around HTML elements to avoid merging distinct parts of text and thus enable extraction of data from the text (e.g.\nphone numbers)."),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Example usage")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"const text = htmlToText('<html><body>Some text</body></html>');\nconsole.log(text);\n")),(0,l.kt)("p",null,"Note that the function uses ",(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/cheerio",target:"_blank",rel:"noopener"},"cheerio")," to parse the HTML. Optionally, to avoid duplicate parsing of HTML and\nthus improve performance, you can pass an existing Cheerio object to the function instead of the HTML text. The HTML should be parsed with the\n",(0,l.kt)("inlineCode",{parentName:"p"},"decodeEntities")," option set to ",(0,l.kt)("inlineCode",{parentName:"p"},"true"),". For example:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"const cheerio = require('cheerio');\nconst html = '<html><body>Some text</body></html>';\nconst text = htmlToText(cheerio.load(html, { decodeEntities: true }));\n")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"html")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")," | ",(0,l.kt)("inlineCode",{parentName:"li"},"CheerioAPI")," - HTML text or parsed HTML represented using a ",(0,l.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/cheerio",target:"_blank",rel:"noopener"},"cheerio")," function.")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"string")," - Plain text"),(0,l.kt)("hr",null),(0,l.kt)("a",{name:"purgelocalstorage"}),(0,l.kt)("h2",{id:"utilspurgelocalstoragefolder"},(0,l.kt)("inlineCode",{parentName:"h2"},"utils.purgeLocalStorage([folder])")),(0,l.kt)("p",null,"Cleans up the local storage folder created when testing locally. This is useful in the event you are debugging your code locally."),(0,l.kt)("p",null,"Be careful as this will remove the folder you provide and everything in it!"),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},(0,l.kt)("inlineCode",{parentName:"strong"},"[folder]")),": ",(0,l.kt)("inlineCode",{parentName:"li"},"string")," - The folder to clean up")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Returns"),":"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise<void>")),(0,l.kt)("hr",null))}c.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>c});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),m=p(n),k=r,c=m["".concat(s,".").concat(k)]||m[k]||d[k]||l;return n?a.createElement(c,i(i({ref:t},u),{},{components:n})):a.createElement(c,i({ref:t},u))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,i=new Array(l);i[0]=k;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[m]="string"==typeof e?e:r,i[1]=o;for(var p=2;p<l;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"}}]);