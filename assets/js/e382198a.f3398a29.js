"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6552],{68889:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(67294),a=n(88746),c=n(6141),l=n(6832);const o=function(e){var t=e.to,n=e.children,o=(0,c.E)(),i=o.version,s=o.isLast;if((0,l.default)().siteConfig.presets[0][1].docs.disableVersioning)return r.createElement(a.default,{to:"/api/"+t},n);var p=i+"/";return"current"===i?p="next/":s&&(p=""),r.createElement(a.default,{to:"/api/"+p+t},n)}},26569:(e,t,n)=>{n.d(t,{B:()=>o,T:()=>l});var r=n(67294),a=n(88746),c="https://crawlee.dev",l=function(e){var t=e.to,n=e.children,l=e.version;return r.createElement(a.default,{href:c+"/api"+(l?"/"+l:"")+"/"+t},n)},o=function(e){var t=e.to,n=e.children;return r.createElement(a.default,{href:c+"/"+t},n)}},3463:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>I,contentTitle:()=>d,default:()=>G,frontMatter:()=>g,metadata:()=>u,toc:()=>C});var r=n(87462),a=n(63366),c=(n(67294),n(3905)),l=(n(14563),n(68889)),o=n(26569);const i={code:"import { Actor } from 'apify';\nimport { PuppeteerCrawler } from 'crawlee';\n\nawait Actor.init();\n\n// Create an instance of the PuppeteerCrawler class - a crawler\n// that automatically loads the URLs in headless Chrome / Puppeteer.\nconst crawler = new PuppeteerCrawler({\n    // Here you can set options that are passed to the launchPuppeteer() function.\n    launchContext: {\n        launchOptions: {\n            headless: true,\n            // Other Puppeteer options\n        },\n    },\n\n    // Stop crawling after several pages\n    maxRequestsPerCrawl: 50,\n\n    // This function will be called for each URL to crawl.\n    // Here you can write the Puppeteer scripts you are familiar with,\n    // with the exception that browsers and pages are automatically managed by the Apify SDK.\n    // The function accepts a single parameter, which is an object with the following fields:\n    // - request: an instance of the Request class with information such as URL and HTTP method\n    // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)\n    async requestHandler({ request, page, enqueueLinks }) {\n        console.log(`Processing ${request.url}...`);\n\n        // A function to be evaluated by Puppeteer within the browser context.\n        const data = await page.$$eval('.athing', ($posts) => {\n            const scrapedData = [];\n\n            // We're getting the title, rank and URL of each post on Hacker News.\n            $posts.forEach(($post) => {\n                scrapedData.push({\n                    title: $post.querySelector('.title a').innerText,\n                    rank: $post.querySelector('.rank').innerText,\n                    href: $post.querySelector('.title a').href,\n                });\n            });\n\n            return scrapedData;\n        });\n\n        // Store the results to the default dataset.\n        await Actor.pushData(data);\n\n        // Find a link to the next page and enqueue it if it exists.\n        const infos = await enqueueLinks({\n            selector: '.morelink',\n        });\n\n        if (infos.length === 0) console.log(`${request.url} is the last page!`);\n    },\n\n    // This function is called if the page processing failed more than maxRequestRetries+1 times.\n    failedRequestHandler({ request }) {\n        console.log(`Request ${request.url} failed too many times.`);\n    },\n});\n\n// Run the crawler and wait for it to finish.\nawait crawler.run(['https://news.ycombinator.com/']);\n\nconsole.log('Crawler finished.');\n\nawait Actor.exit();\n",hash:"eyJ1IjoiRWdQdHczb2VqNlRhRHQ1cW4iLCJ2IjoxfQ.eyJpbnB1dCI6IntcImNvZGVcIjpcImltcG9ydCB7IEFjdG9yIH0gZnJvbSAnYXBpZnknO1xcbmltcG9ydCB7IFB1cHBldGVlckNyYXdsZXIgfSBmcm9tICdjcmF3bGVlJztcXG5cXG5hd2FpdCBBY3Rvci5pbml0KCk7XFxuXFxuLy8gQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBQdXBwZXRlZXJDcmF3bGVyIGNsYXNzIC0gYSBjcmF3bGVyXFxuLy8gdGhhdCBhdXRvbWF0aWNhbGx5IGxvYWRzIHRoZSBVUkxzIGluIGhlYWRsZXNzIENocm9tZSAvIFB1cHBldGVlci5cXG5jb25zdCBjcmF3bGVyID0gbmV3IFB1cHBldGVlckNyYXdsZXIoe1xcbiAgICAvLyBIZXJlIHlvdSBjYW4gc2V0IG9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBsYXVuY2hQdXBwZXRlZXIoKSBmdW5jdGlvbi5cXG4gICAgbGF1bmNoQ29udGV4dDoge1xcbiAgICAgICAgbGF1bmNoT3B0aW9uczoge1xcbiAgICAgICAgICAgIGhlYWRsZXNzOiB0cnVlLFxcbiAgICAgICAgICAgIC8vIE90aGVyIFB1cHBldGVlciBvcHRpb25zXFxuICAgICAgICB9LFxcbiAgICB9LFxcblxcbiAgICAvLyBTdG9wIGNyYXdsaW5nIGFmdGVyIHNldmVyYWwgcGFnZXNcXG4gICAgbWF4UmVxdWVzdHNQZXJDcmF3bDogNTAsXFxuXFxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgZm9yIGVhY2ggVVJMIHRvIGNyYXdsLlxcbiAgICAvLyBIZXJlIHlvdSBjYW4gd3JpdGUgdGhlIFB1cHBldGVlciBzY3JpcHRzIHlvdSBhcmUgZmFtaWxpYXIgd2l0aCxcXG4gICAgLy8gd2l0aCB0aGUgZXhjZXB0aW9uIHRoYXQgYnJvd3NlcnMgYW5kIHBhZ2VzIGFyZSBhdXRvbWF0aWNhbGx5IG1hbmFnZWQgYnkgdGhlIEFwaWZ5IFNESy5cXG4gICAgLy8gVGhlIGZ1bmN0aW9uIGFjY2VwdHMgYSBzaW5nbGUgcGFyYW1ldGVyLCB3aGljaCBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGZpZWxkczpcXG4gICAgLy8gLSByZXF1ZXN0OiBhbiBpbnN0YW5jZSBvZiB0aGUgUmVxdWVzdCBjbGFzcyB3aXRoIGluZm9ybWF0aW9uIHN1Y2ggYXMgVVJMIGFuZCBIVFRQIG1ldGhvZFxcbiAgICAvLyAtIHBhZ2U6IFB1cHBldGVlcidzIFBhZ2Ugb2JqZWN0IChzZWUgaHR0cHM6Ly9wcHRyLmRldi8jc2hvdz1hcGktY2xhc3MtcGFnZSlcXG4gICAgYXN5bmMgcmVxdWVzdEhhbmRsZXIoeyByZXF1ZXN0LCBwYWdlLCBlbnF1ZXVlTGlua3MgfSkge1xcbiAgICAgICAgY29uc29sZS5sb2coYFByb2Nlc3NpbmcgJHtyZXF1ZXN0LnVybH0uLi5gKTtcXG5cXG4gICAgICAgIC8vIEEgZnVuY3Rpb24gdG8gYmUgZXZhbHVhdGVkIGJ5IFB1cHBldGVlciB3aXRoaW4gdGhlIGJyb3dzZXIgY29udGV4dC5cXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBwYWdlLiQkZXZhbCgnLmF0aGluZycsICgkcG9zdHMpID0-IHtcXG4gICAgICAgICAgICBjb25zdCBzY3JhcGVkRGF0YSA9IFtdO1xcblxcbiAgICAgICAgICAgIC8vIFdlJ3JlIGdldHRpbmcgdGhlIHRpdGxlLCByYW5rIGFuZCBVUkwgb2YgZWFjaCBwb3N0IG9uIEhhY2tlciBOZXdzLlxcbiAgICAgICAgICAgICRwb3N0cy5mb3JFYWNoKCgkcG9zdCkgPT4ge1xcbiAgICAgICAgICAgICAgICBzY3JhcGVkRGF0YS5wdXNoKHtcXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAkcG9zdC5xdWVyeVNlbGVjdG9yKCcudGl0bGUgYScpLmlubmVyVGV4dCxcXG4gICAgICAgICAgICAgICAgICAgIHJhbms6ICRwb3N0LnF1ZXJ5U2VsZWN0b3IoJy5yYW5rJykuaW5uZXJUZXh0LFxcbiAgICAgICAgICAgICAgICAgICAgaHJlZjogJHBvc3QucXVlcnlTZWxlY3RvcignLnRpdGxlIGEnKS5ocmVmLFxcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9KTtcXG5cXG4gICAgICAgICAgICByZXR1cm4gc2NyYXBlZERhdGE7XFxuICAgICAgICB9KTtcXG5cXG4gICAgICAgIC8vIFN0b3JlIHRoZSByZXN1bHRzIHRvIHRoZSBkZWZhdWx0IGRhdGFzZXQuXFxuICAgICAgICBhd2FpdCBBY3Rvci5wdXNoRGF0YShkYXRhKTtcXG5cXG4gICAgICAgIC8vIEZpbmQgYSBsaW5rIHRvIHRoZSBuZXh0IHBhZ2UgYW5kIGVucXVldWUgaXQgaWYgaXQgZXhpc3RzLlxcbiAgICAgICAgY29uc3QgaW5mb3MgPSBhd2FpdCBlbnF1ZXVlTGlua3Moe1xcbiAgICAgICAgICAgIHNlbGVjdG9yOiAnLm1vcmVsaW5rJyxcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgaWYgKGluZm9zLmxlbmd0aCA9PT0gMCkgY29uc29sZS5sb2coYCR7cmVxdWVzdC51cmx9IGlzIHRoZSBsYXN0IHBhZ2UhYCk7XFxuICAgIH0sXFxuXFxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGlmIHRoZSBwYWdlIHByb2Nlc3NpbmcgZmFpbGVkIG1vcmUgdGhhbiBtYXhSZXF1ZXN0UmV0cmllcysxIHRpbWVzLlxcbiAgICBmYWlsZWRSZXF1ZXN0SGFuZGxlcih7IHJlcXVlc3QgfSkge1xcbiAgICAgICAgY29uc29sZS5sb2coYFJlcXVlc3QgJHtyZXF1ZXN0LnVybH0gZmFpbGVkIHRvbyBtYW55IHRpbWVzLmApO1xcbiAgICB9LFxcbn0pO1xcblxcbi8vIFJ1biB0aGUgY3Jhd2xlciBhbmQgd2FpdCBmb3IgaXQgdG8gZmluaXNoLlxcbmF3YWl0IGNyYXdsZXIucnVuKFsnaHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS8nXSk7XFxuXFxuY29uc29sZS5sb2coJ0NyYXdsZXIgZmluaXNoZWQuJyk7XFxuXFxuYXdhaXQgQWN0b3IuZXhpdCgpO1xcblwifSIsIm9wdGlvbnMiOnsiYnVpbGQiOiJsYXRlc3QiLCJjb250ZW50VHlwZSI6ImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgiLCJtZW1vcnkiOjQwOTYsInRpbWVvdXQiOjE4MH19.88cqtP3DJA1811DUd2fOqdjsLFRPvz91Pi_WHe8Yt5U"};var s,p=["components"],g={id:"puppeteer-crawler",title:"Puppeteer crawler"},d=void 0,u={unversionedId:"examples/puppeteer-crawler",id:"examples/puppeteer-crawler",title:"Puppeteer crawler",description:"This example demonstrates how to use PuppeteerCrawler in combination",source:"@site/../docs/examples/puppeteer_crawler.mdx",sourceDirName:"examples",slug:"/examples/puppeteer-crawler",permalink:"/sdk/js/docs/next/examples/puppeteer-crawler",draft:!1,editUrl:"https://github.com/apify/apify-sdk-js/edit/master/website/../docs/examples/puppeteer_crawler.mdx",tags:[],version:"current",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1698960215,formattedLastUpdatedAt:"Nov 2, 2023",frontMatter:{id:"puppeteer-crawler",title:"Puppeteer crawler"},sidebar:"docs",previous:{title:"Capture a screenshot using Puppeteer",permalink:"/sdk/js/docs/next/examples/capture-screenshot"},next:{title:"Puppeteer recursive crawl",permalink:"/sdk/js/docs/next/examples/puppeteer-recursive-crawl"}},I={},C=[],m=(s="RunnableCodeBlock",function(e){return console.warn("Component "+s+" was not imported, exported, or provided by MDXProvider as global scope"),(0,c.kt)("div",e)}),b={toc:C},h="wrapper";function G(e){var t=e.components,n=(0,a.Z)(e,p);return(0,c.kt)(h,(0,r.Z)({},b,n,{components:t,mdxType:"MDXLayout"}),(0,c.kt)("p",null,"This example demonstrates how to use ",(0,c.kt)(o.T,{to:"puppeteer-crawler/class/PuppeteerCrawler",mdxType:"CrawleeApiLink"},(0,c.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler"))," in combination\nwith ",(0,c.kt)(l.Z,{to:"apify/class/RequestQueue",mdxType:"ApiLink"},(0,c.kt)("inlineCode",{parentName:"p"},"RequestQueue")),"\nto recursively scrape the ",(0,c.kt)("a",{parentName:"p",href:"https://news.ycombinator.com",target:"_blank",rel:"noopener"},"Hacker News website")," using headless Chrome / Puppeteer."),(0,c.kt)("p",null,"The crawler starts with a single URL, finds links to next pages, enqueues them and continues until no more desired links are available. The results\nare stored to the default dataset. In local configuration, the results are stored as JSON files in ",(0,c.kt)("inlineCode",{parentName:"p"},"./storage/datasets/default")),(0,c.kt)("admonition",{type:"tip"},(0,c.kt)("p",{parentName:"admonition"},"To run this example on the Apify Platform, select the ",(0,c.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," image for your Dockerfile.")),(0,c.kt)(m,{className:"language-js",type:"puppeteer",mdxType:"RunnableCodeBlock"},i))}G.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>I});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},c=Object.keys(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var i=r.createContext({}),s=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(i.Provider,{value:t},e.children)},g="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,c=e.originalType,i=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),g=s(n),u=a,I=g["".concat(i,".").concat(u)]||g[u]||d[u]||c;return n?r.createElement(I,l(l({ref:t},p),{},{components:n})):r.createElement(I,l({ref:t},p))}));function I(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var c=n.length,l=new Array(c);l[0]=u;var o={};for(var i in t)hasOwnProperty.call(t,i)&&(o[i]=t[i]);o.originalType=e,o[g]="string"==typeof e?e:a,l[1]=o;for(var s=2;s<c;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);