"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2978],{68889:(e,t,r)=>{r.d(t,{Z:()=>s});var n=r(67294),a=r(88746),o=r(6141),i=r(6832);const s=function(e){var t=e.to,r=e.children,s=(0,o.E)(),l=s.version,c=s.isLast;if((0,i.default)().siteConfig.presets[0][1].docs.disableVersioning)return n.createElement(a.default,{to:"/api/"+t},r);var p=l+"/";return"current"===l?p="next/":c&&(p=""),n.createElement(a.default,{to:"/api/"+p+t},r)}},26569:(e,t,r)=>{r.d(t,{B:()=>s,T:()=>i});var n=r(67294),a=r(88746),o="https://crawlee.dev",i=function(e){var t=e.to,r=e.children,i=e.version;return n.createElement(a.default,{href:o+"/api"+(i?"/"+i:"")+"/"+t},r)},s=function(e){var t=e.to,r=e.children;return n.createElement(a.default,{href:o+"/"+t},r)}},75032:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>f,contentTitle:()=>m,default:()=>k,frontMatter:()=>u,metadata:()=>d,toc:()=>w});var n=r(87462),a=r(63366),o=(r(67294),r(3905)),i=r(61806),s=r(68889),l=r(26569);const c="import { Actor } from 'apify';\nimport { CheerioCrawler } from 'crawlee';\n\nawait Actor.init();\n\n// Create a CheerioCrawler\nconst crawler = new CheerioCrawler({\n    // Limits the crawler to only 10 requests (do not use if you want to crawl all links)\n    maxRequestsPerCrawl: 10,\n    // Function called for each URL\n    async requestHandler({ request, enqueueLinks }) {\n        console.log(request.url);\n        // Add some links from page to the crawler's RequestQueue\n        await enqueueLinks({\n            pseudoUrls: ['http[s?]://apify.com/[.+]/[.+]'],\n        });\n    },\n});\n\n// Define the starting URL and run the crawler\nawait crawler.run(['https://apify.com/store']);\n\nawait Actor.exit();\n";var p=["components"],u={id:"crawl-some-links",title:"Crawl some links on a website"},m=void 0,d={unversionedId:"examples/crawl-some-links",id:"examples/crawl-some-links",title:"Crawl some links on a website",description:"This CheerioCrawler example uses the pseudoUrls property in the enqueueLinks() method to only add links to the RequestQueue queue if they match the specified regular expression.",source:"@site/../docs/examples/crawl_some_links.mdx",sourceDirName:"examples",slug:"/examples/crawl-some-links",permalink:"/sdk/js/docs/next/examples/crawl-some-links",draft:!1,tags:[],version:"current",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1679010841,formattedLastUpdatedAt:"Mar 16, 2023",frontMatter:{id:"crawl-some-links",title:"Crawl some links on a website"},sidebar:"docs",previous:{title:"Crawl a sitemap",permalink:"/sdk/js/docs/next/examples/crawl-sitemap"},next:{title:"Forms",permalink:"/sdk/js/docs/next/examples/forms"}},f={},w=[],y={toc:w},h="wrapper";function k(e){var t=e.components,r=(0,a.Z)(e,p);return(0,o.kt)(h,(0,n.Z)({},y,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"This ",(0,o.kt)(l.T,{to:"cheerio-crawler/class/CheerioCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"CheerioCrawler"))," example uses the ",(0,o.kt)(l.T,{to:"core/class/PseudoUrl",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"pseudoUrls"))," property in the ",(0,o.kt)(l.T,{to:"cheerio-crawler/interface/CheerioRequestHandlerInputs#enqueueLinks",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"enqueueLinks()"))," method to only add links to the ",(0,o.kt)(s.Z,{to:"apify/class/RequestQueue",mdxType:"ApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"RequestQueue"))," queue if they match the specified regular expression."),(0,o.kt)(i.Z,{className:"language-js",mdxType:"CodeBlock"},c))}k.isMDXComponent=!0},3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=c(r),d=a,f=u["".concat(l,".").concat(d)]||u[d]||m[d]||o;return r?n.createElement(f,i(i({ref:t},p),{},{components:r})):n.createElement(f,i({ref:t},p))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=r[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"}}]);