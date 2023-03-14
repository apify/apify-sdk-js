"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7463],{91407:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>u,contentTitle:()=>p,default:()=>h,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var n=r(87462),a=r(63366),o=(r(67294),r(3905)),s=["components"],i={id_old:"version-1.3-puppeteer-crawler",title:"Puppeteer crawler",id:"puppeteer-crawler"},p=void 0,l={unversionedId:"examples/puppeteer-crawler",id:"version-1.3/examples/puppeteer-crawler",title:"Puppeteer crawler",description:"This example demonstrates how to use PuppeteerCrawler in combination with RequestQueue",source:"@site/versioned_docs/version-1.3/examples/puppeteer_crawler.md",sourceDirName:"examples",slug:"/examples/puppeteer-crawler",permalink:"/sdk/js/docs/1.3/examples/puppeteer-crawler",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"Vlad Frangu",lastUpdatedAt:1678789724,formattedLastUpdatedAt:"Mar 14, 2023",frontMatter:{id_old:"version-1.3-puppeteer-crawler",title:"Puppeteer crawler",id:"puppeteer-crawler"},sidebar:"version-1.3/docs",previous:{title:"Playwright crawler",permalink:"/sdk/js/docs/1.3/examples/playwright-crawler"},next:{title:"Puppeteer recursive crawl",permalink:"/sdk/js/docs/1.3/examples/puppeteer-recursive-crawl"}},u={},c=[],d={toc:c},f="wrapper";function h(e){var t=e.components,r=(0,a.Z)(e,s);return(0,o.kt)(f,(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"This example demonstrates how to use ",(0,o.kt)("a",{parentName:"p",href:"/docs/api/puppeteer-crawler",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"PuppeteerCrawler"))," in combination with ",(0,o.kt)("a",{parentName:"p",href:"/docs/api/request-queue",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"RequestQueue")),"\nto recursively scrape the ",(0,o.kt)("a",{parentName:"p",href:"https://news.ycombinator.com",target:"_blank",rel:"noopener"},"Hacker News website")," using headless Chrome / Puppeteer. The crawler starts with a single URL,\nfinds links to next pages, enqueues them and continues until no more desired links are available. The results are stored to the default dataset. In\nlocal configuration, the results are stored as JSON files in ",(0,o.kt)("inlineCode",{parentName:"p"},"./apify_storage/datasets/default")),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"To run this example on the Apify Platform, select the ",(0,o.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," image for your Dockerfile.")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\nApify.main(async () => {\n    // Apify.openRequestQueue() creates a preconfigured RequestQueue instance.\n    // We add our first request to it - the initial page the crawler will visit.\n    const requestQueue = await Apify.openRequestQueue();\n    await requestQueue.addRequest({ url: 'https://news.ycombinator.com/' });\n\n    // Create an instance of the PuppeteerCrawler class - a crawler\n    // that automatically loads the URLs in headless Chrome / Puppeteer.\n    const crawler = new Apify.PuppeteerCrawler({\n        requestQueue,\n\n        // Here you can set options that are passed to the Apify.launchPuppeteer() function.\n        launchContext: {\n            launchOptions: {\n                headless: true,\n                // Other Puppeteer options\n            },\n        },\n\n        // Stop crawling after several pages\n        maxRequestsPerCrawl: 50,\n\n        // This function will be called for each URL to crawl.\n        // Here you can write the Puppeteer scripts you are familiar with,\n        // with the exception that browsers and pages are automatically managed by the Apify SDK.\n        // The function accepts a single parameter, which is an object with the following fields:\n        // - request: an instance of the Request class with information such as URL and HTTP method\n        // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)\n        handlePageFunction: async ({ request, page }) => {\n            console.log(`Processing ${request.url}...`);\n\n            // A function to be evaluated by Puppeteer within the browser context.\n            const data = await page.$$eval('.athing', $posts => {\n                const scrapedData = [];\n\n                // We're getting the title, rank and URL of each post on Hacker News.\n                $posts.forEach($post => {\n                    scrapedData.push({\n                        title: $post.querySelector('.title a').innerText,\n                        rank: $post.querySelector('.rank').innerText,\n                        href: $post.querySelector('.title a').href,\n                    });\n                });\n\n                return scrapedData;\n            });\n\n            // Store the results to the default dataset.\n            await Apify.pushData(data);\n\n            // Find a link to the next page and enqueue it if it exists.\n            const infos = await Apify.utils.enqueueLinks({\n                page,\n                requestQueue,\n                selector: '.morelink',\n            });\n\n            if (infos.length === 0) console.log(`${request.url} is the last page!`);\n        },\n\n        // This function is called if the page processing failed more than maxRequestRetries+1 times.\n        handleFailedRequestFunction: async ({ request }) => {\n            console.log(`Request ${request.url} failed too many times.`);\n        },\n    });\n\n    // Run the crawler and wait for it to finish.\n    await crawler.run();\n\n    console.log('Crawler finished.');\n});\n")))}h.isMDXComponent=!0},3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>h});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),l=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(p.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),c=l(r),f=a,h=c["".concat(p,".").concat(f)]||c[f]||d[f]||o;return r?n.createElement(h,s(s({ref:t},u),{},{components:r})):n.createElement(h,s({ref:t},u))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,s=new Array(o);s[0]=f;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[c]="string"==typeof e?e:a,s[1]=i;for(var l=2;l<o;l++)s[l]=r[l];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"}}]);