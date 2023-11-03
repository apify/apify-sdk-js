"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1032],{68889:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(67294),r=n(88746),l=n(6141),c=n(6832);const i=function(e){var t=e.to,n=e.children,i=(0,l.E)(),o=i.version,s=i.isLast;if((0,c.default)().siteConfig.presets[0][1].docs.disableVersioning)return a.createElement(r.default,{to:"/api/"+t},n);var g=o+"/";return"current"===o?g="next/":s&&(g=""),a.createElement(r.default,{to:"/api/"+g+t},n)}},26569:(e,t,n)=>{n.d(t,{B:()=>i,T:()=>c});var a=n(67294),r=n(88746),l="https://crawlee.dev",c=function(e){var t=e.to,n=e.children,c=e.version;return a.createElement(r.default,{href:l+"/api"+(c?"/"+c:"")+"/"+t},n)},i=function(e){var t=e.to,n=e.children;return a.createElement(r.default,{href:l+"/"+t},n)}},90133:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>I,default:()=>y,frontMatter:()=>d,metadata:()=>p,toc:()=>h});var a=n(87462),r=n(63366),l=(n(67294),n(3905)),c=(n(14563),n(68889)),i=n(26569);const o={code:"import { Actor } from 'apify';\nimport { PlaywrightCrawler } from 'crawlee';\n\nawait Actor.init();\n\n// Create an instance of the PlaywrightCrawler class - a crawler\n// that automatically loads the URLs in headless Chrome / Playwright.\nconst crawler = new PlaywrightCrawler({\n    launchContext: {\n        // Here you can set options that are passed to the playwright .launch() function.\n        launchOptions: {\n            headless: true,\n        },\n    },\n\n    // Stop crawling after several pages\n    maxRequestsPerCrawl: 50,\n\n    // This function will be called for each URL to crawl.\n    // Here you can write the Playwright scripts you are familiar with,\n    // with the exception that browsers and pages are automatically managed by the Apify SDK.\n    // The function accepts a single parameter, which is an object with a lot of properties,\n    // the most important being:\n    // - request: an instance of the Request class with information such as URL and HTTP method\n    // - page: Playwright's Page object (see https://playwright.dev/docs/api/class-page)\n    async requestHandler({ request, page, enqueueLinks }) {\n        console.log(`Processing ${request.url}...`);\n\n        // A function to be evaluated by Playwright within the browser context.\n        const data = await page.$$eval('.athing', ($posts) => {\n            const scrapedData = [];\n\n            // We're getting the title, rank and URL of each post on Hacker News.\n            $posts.forEach(($post) => {\n                scrapedData.push({\n                    title: $post.querySelector('.title a').innerText,\n                    rank: $post.querySelector('.rank').innerText,\n                    href: $post.querySelector('.title a').href,\n                });\n            });\n\n            return scrapedData;\n        });\n\n        // Store the results to the default dataset.\n        await Actor.pushData(data);\n\n        // Find a link to the next page and enqueue it if it exists.\n        const infos = await enqueueLinks({\n            selector: '.morelink',\n        });\n\n        if (infos.processedRequests.length === 0) console.log(`${request.url} is the last page!`);\n    },\n\n    // This function is called if the page processing failed more than maxRequestRetries+1 times.\n    failedRequestHandler({ request }) {\n        console.log(`Request ${request.url} failed too many times.`);\n    },\n});\n\n// Run the crawler and wait for it to finish.\nawait crawler.run(['https://news.ycombinator.com/']);\n\nconsole.log('Crawler finished.');\n\nawait Actor.exit();\n",hash:"eyJ1IjoiRWdQdHczb2VqNlRhRHQ1cW4iLCJ2IjoxfQ.eyJpbnB1dCI6IntcImNvZGVcIjpcImltcG9ydCB7IEFjdG9yIH0gZnJvbSAnYXBpZnknO1xcbmltcG9ydCB7IFBsYXl3cmlnaHRDcmF3bGVyIH0gZnJvbSAnY3Jhd2xlZSc7XFxuXFxuYXdhaXQgQWN0b3IuaW5pdCgpO1xcblxcbi8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgUGxheXdyaWdodENyYXdsZXIgY2xhc3MgLSBhIGNyYXdsZXJcXG4vLyB0aGF0IGF1dG9tYXRpY2FsbHkgbG9hZHMgdGhlIFVSTHMgaW4gaGVhZGxlc3MgQ2hyb21lIC8gUGxheXdyaWdodC5cXG5jb25zdCBjcmF3bGVyID0gbmV3IFBsYXl3cmlnaHRDcmF3bGVyKHtcXG4gICAgbGF1bmNoQ29udGV4dDoge1xcbiAgICAgICAgLy8gSGVyZSB5b3UgY2FuIHNldCBvcHRpb25zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgcGxheXdyaWdodCAubGF1bmNoKCkgZnVuY3Rpb24uXFxuICAgICAgICBsYXVuY2hPcHRpb25zOiB7XFxuICAgICAgICAgICAgaGVhZGxlc3M6IHRydWUsXFxuICAgICAgICB9LFxcbiAgICB9LFxcblxcbiAgICAvLyBTdG9wIGNyYXdsaW5nIGFmdGVyIHNldmVyYWwgcGFnZXNcXG4gICAgbWF4UmVxdWVzdHNQZXJDcmF3bDogNTAsXFxuXFxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgZm9yIGVhY2ggVVJMIHRvIGNyYXdsLlxcbiAgICAvLyBIZXJlIHlvdSBjYW4gd3JpdGUgdGhlIFBsYXl3cmlnaHQgc2NyaXB0cyB5b3UgYXJlIGZhbWlsaWFyIHdpdGgsXFxuICAgIC8vIHdpdGggdGhlIGV4Y2VwdGlvbiB0aGF0IGJyb3dzZXJzIGFuZCBwYWdlcyBhcmUgYXV0b21hdGljYWxseSBtYW5hZ2VkIGJ5IHRoZSBBcGlmeSBTREsuXFxuICAgIC8vIFRoZSBmdW5jdGlvbiBhY2NlcHRzIGEgc2luZ2xlIHBhcmFtZXRlciwgd2hpY2ggaXMgYW4gb2JqZWN0IHdpdGggYSBsb3Qgb2YgcHJvcGVydGllcyxcXG4gICAgLy8gdGhlIG1vc3QgaW1wb3J0YW50IGJlaW5nOlxcbiAgICAvLyAtIHJlcXVlc3Q6IGFuIGluc3RhbmNlIG9mIHRoZSBSZXF1ZXN0IGNsYXNzIHdpdGggaW5mb3JtYXRpb24gc3VjaCBhcyBVUkwgYW5kIEhUVFAgbWV0aG9kXFxuICAgIC8vIC0gcGFnZTogUGxheXdyaWdodCdzIFBhZ2Ugb2JqZWN0IChzZWUgaHR0cHM6Ly9wbGF5d3JpZ2h0LmRldi9kb2NzL2FwaS9jbGFzcy1wYWdlKVxcbiAgICBhc3luYyByZXF1ZXN0SGFuZGxlcih7IHJlcXVlc3QsIHBhZ2UsIGVucXVldWVMaW5rcyB9KSB7XFxuICAgICAgICBjb25zb2xlLmxvZyhgUHJvY2Vzc2luZyAke3JlcXVlc3QudXJsfS4uLmApO1xcblxcbiAgICAgICAgLy8gQSBmdW5jdGlvbiB0byBiZSBldmFsdWF0ZWQgYnkgUGxheXdyaWdodCB3aXRoaW4gdGhlIGJyb3dzZXIgY29udGV4dC5cXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBwYWdlLiQkZXZhbCgnLmF0aGluZycsICgkcG9zdHMpID0-IHtcXG4gICAgICAgICAgICBjb25zdCBzY3JhcGVkRGF0YSA9IFtdO1xcblxcbiAgICAgICAgICAgIC8vIFdlJ3JlIGdldHRpbmcgdGhlIHRpdGxlLCByYW5rIGFuZCBVUkwgb2YgZWFjaCBwb3N0IG9uIEhhY2tlciBOZXdzLlxcbiAgICAgICAgICAgICRwb3N0cy5mb3JFYWNoKCgkcG9zdCkgPT4ge1xcbiAgICAgICAgICAgICAgICBzY3JhcGVkRGF0YS5wdXNoKHtcXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAkcG9zdC5xdWVyeVNlbGVjdG9yKCcudGl0bGUgYScpLmlubmVyVGV4dCxcXG4gICAgICAgICAgICAgICAgICAgIHJhbms6ICRwb3N0LnF1ZXJ5U2VsZWN0b3IoJy5yYW5rJykuaW5uZXJUZXh0LFxcbiAgICAgICAgICAgICAgICAgICAgaHJlZjogJHBvc3QucXVlcnlTZWxlY3RvcignLnRpdGxlIGEnKS5ocmVmLFxcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9KTtcXG5cXG4gICAgICAgICAgICByZXR1cm4gc2NyYXBlZERhdGE7XFxuICAgICAgICB9KTtcXG5cXG4gICAgICAgIC8vIFN0b3JlIHRoZSByZXN1bHRzIHRvIHRoZSBkZWZhdWx0IGRhdGFzZXQuXFxuICAgICAgICBhd2FpdCBBY3Rvci5wdXNoRGF0YShkYXRhKTtcXG5cXG4gICAgICAgIC8vIEZpbmQgYSBsaW5rIHRvIHRoZSBuZXh0IHBhZ2UgYW5kIGVucXVldWUgaXQgaWYgaXQgZXhpc3RzLlxcbiAgICAgICAgY29uc3QgaW5mb3MgPSBhd2FpdCBlbnF1ZXVlTGlua3Moe1xcbiAgICAgICAgICAgIHNlbGVjdG9yOiAnLm1vcmVsaW5rJyxcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgaWYgKGluZm9zLnByb2Nlc3NlZFJlcXVlc3RzLmxlbmd0aCA9PT0gMCkgY29uc29sZS5sb2coYCR7cmVxdWVzdC51cmx9IGlzIHRoZSBsYXN0IHBhZ2UhYCk7XFxuICAgIH0sXFxuXFxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGlmIHRoZSBwYWdlIHByb2Nlc3NpbmcgZmFpbGVkIG1vcmUgdGhhbiBtYXhSZXF1ZXN0UmV0cmllcysxIHRpbWVzLlxcbiAgICBmYWlsZWRSZXF1ZXN0SGFuZGxlcih7IHJlcXVlc3QgfSkge1xcbiAgICAgICAgY29uc29sZS5sb2coYFJlcXVlc3QgJHtyZXF1ZXN0LnVybH0gZmFpbGVkIHRvbyBtYW55IHRpbWVzLmApO1xcbiAgICB9LFxcbn0pO1xcblxcbi8vIFJ1biB0aGUgY3Jhd2xlciBhbmQgd2FpdCBmb3IgaXQgdG8gZmluaXNoLlxcbmF3YWl0IGNyYXdsZXIucnVuKFsnaHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS8nXSk7XFxuXFxuY29uc29sZS5sb2coJ0NyYXdsZXIgZmluaXNoZWQuJyk7XFxuXFxuYXdhaXQgQWN0b3IuZXhpdCgpO1xcblwifSIsIm9wdGlvbnMiOnsiYnVpbGQiOiJsYXRlc3QiLCJjb250ZW50VHlwZSI6ImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgiLCJtZW1vcnkiOjQwOTYsInRpbWVvdXQiOjE4MH19.kt3UXVDBPuO5BGjh8ZGuYNiKR_W8ilbU9XBQeJvrZFs"};var s,g=["components"],d={id:"playwright-crawler",title:"Playwright crawler"},I=void 0,p={unversionedId:"examples/playwright-crawler",id:"version-3.1/examples/playwright-crawler",title:"Playwright crawler",description:"This example demonstrates how to use PlaywrightCrawler",source:"@site/versioned_docs/version-3.1/examples/playwright_crawler.mdx",sourceDirName:"examples",slug:"/examples/playwright-crawler",permalink:"/sdk/js/docs/examples/playwright-crawler",draft:!1,editUrl:"https://github.com/apify/apify-sdk-js/edit/master/website/versioned_docs/version-3.1/examples/playwright_crawler.mdx",tags:[],version:"3.1",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1698960215,formattedLastUpdatedAt:"Nov 2, 2023",frontMatter:{id:"playwright-crawler",title:"Playwright crawler"},sidebar:"docs",previous:{title:"Dataset Map and Reduce methods",permalink:"/sdk/js/docs/examples/map-and-reduce"},next:{title:"Capture a screenshot using Puppeteer",permalink:"/sdk/js/docs/examples/capture-screenshot"}},u={},h=[],C=(s="RunnableCodeBlock",function(e){return console.warn("Component "+s+" was not imported, exported, or provided by MDXProvider as global scope"),(0,l.kt)("div",e)}),b={toc:h},m="wrapper";function y(e){var t=e.components,n=(0,r.Z)(e,g);return(0,l.kt)(m,(0,a.Z)({},b,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"This example demonstrates how to use ",(0,l.kt)(i.T,{to:"playwright-crawler/class/PlaywrightCrawler",mdxType:"CrawleeApiLink"},(0,l.kt)("inlineCode",{parentName:"p"},"PlaywrightCrawler")),"\nin combination with ",(0,l.kt)(c.Z,{to:"apify/class/RequestQueue",mdxType:"ApiLink"},(0,l.kt)("inlineCode",{parentName:"p"},"RequestQueue"))," to\nrecursively scrape the ",(0,l.kt)("a",{parentName:"p",href:"https://news.ycombinator.com",target:"_blank",rel:"noopener"},"Hacker News website")," using headless Chrome / Playwright."),(0,l.kt)("p",null,"The crawler starts with a single URL, finds links to next pages, enqueues them and continues until no more desired links are available. The results\nare stored to the default dataset. In local configuration, the results are stored as JSON files in ",(0,l.kt)("inlineCode",{parentName:"p"},"./storage/datasets/default")),(0,l.kt)("admonition",{type:"tip"},(0,l.kt)("p",{parentName:"admonition"},"To run this example on the Apify Platform, select the ",(0,l.kt)("inlineCode",{parentName:"p"},"apify/actor-node-playwright-chrome")," image for your Dockerfile.")),(0,l.kt)(C,{className:"language-js",type:"playwright",mdxType:"RunnableCodeBlock"},o))}y.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>g,kt:()=>u});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=a.createContext({}),s=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},g=function(e){var t=s(e.components);return a.createElement(o.Provider,{value:t},e.children)},d="mdxType",I={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},p=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,o=e.parentName,g=i(e,["components","mdxType","originalType","parentName"]),d=s(n),p=r,u=d["".concat(o,".").concat(p)]||d[p]||I[p]||l;return n?a.createElement(u,c(c({ref:t},g),{},{components:n})):a.createElement(u,c({ref:t},g))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,c=new Array(l);c[0]=p;var i={};for(var o in t)hasOwnProperty.call(t,o)&&(i[o]=t[o]);i.originalType=e,i[d]="string"==typeof e?e:r,c[1]=i;for(var s=2;s<l;s++)c[s]=n[s];return a.createElement.apply(null,c)}return a.createElement.apply(null,n)}p.displayName="MDXCreateElement"}}]);