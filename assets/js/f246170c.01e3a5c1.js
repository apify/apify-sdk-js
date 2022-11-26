"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9921],{3905:(e,r,t)=>{t.d(r,{Zo:()=>u,kt:()=>m});var n=t(67294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function p(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),c=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):p(p({},r),e)),t},u=function(e){var r=c(e.components);return n.createElement(l.Provider,{value:r},e.children)},s={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),f=c(t),m=a,d=f["".concat(l,".").concat(m)]||f[m]||s[m]||o;return t?n.createElement(d,p(p({ref:r},u),{},{components:t})):n.createElement(d,p({ref:r},u))}));function m(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,p=new Array(o);p[0]=f;var i={};for(var l in r)hasOwnProperty.call(r,l)&&(i[l]=r[l]);i.originalType=e,i.mdxType="string"==typeof e?e:a,p[1]=i;for(var c=2;c<o;c++)p[c]=t[c];return n.createElement.apply(null,p)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},14959:(e,r,t)=>{t.d(r,{Z:()=>i});var n=t(67294),a=t(39960),o=t(74477),p=t(52263);const i=function(e){var r=e.to,t=e.children,i=(0,o.E)(),l=i.version,c=i.isLast;if((0,p.default)().siteConfig.presets[0][1].docs.disableVersioning)return n.createElement(a.default,{to:"/api/"+r},t);var u=l+"/";return"current"===l?u="next/":c&&(u=""),n.createElement(a.default,{to:"/api/"+u+r},t)}},39493:(e,r,t)=>{t.d(r,{B:()=>i,T:()=>p});var n=t(67294),a=t(39960),o="https://crawlee.dev",p=function(e){var r=e.to,t=e.children,p=e.version;return n.createElement(a.default,{href:o+"/api"+(p?"/"+p:"")+"/"+r},t)},i=function(e){var r=e.to,t=e.children;return n.createElement(a.default,{href:o+"/"+r},t)}},67444:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>f,contentTitle:()=>u,default:()=>w,frontMatter:()=>c,metadata:()=>s,toc:()=>m});var n=t(87462),a=t(63366),o=(t(67294),t(3905)),p=t(41435),i=(t(14959),t(39493));var l=["components"],c={id:"puppeteer-recursive-crawl",title:"Puppeteer recursive crawl"},u=void 0,s={unversionedId:"examples/puppeteer-recursive-crawl",id:"examples/puppeteer-recursive-crawl",title:"Puppeteer recursive crawl",description:"Run the following example to perform a recursive crawl of a website using PuppeteerCrawler.",source:"@site/../docs/examples/puppeteer_recursive_crawl.mdx",sourceDirName:"examples",slug:"/examples/puppeteer-recursive-crawl",permalink:"/docs/next/examples/puppeteer-recursive-crawl",draft:!1,tags:[],version:"current",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1669423052,formattedLastUpdatedAt:"Nov 26, 2022",frontMatter:{id:"puppeteer-recursive-crawl",title:"Puppeteer recursive crawl"},sidebar:"docs",previous:{title:"Puppeteer crawler",permalink:"/docs/next/examples/puppeteer-crawler"},next:{title:"Puppeteer with proxy",permalink:"/docs/next/examples/puppeteer-with-proxy"}},f={},m=[],d={toc:m};function w(e){var r=e.components,t=(0,a.Z)(e,l);return(0,o.kt)("wrapper",(0,n.Z)({},d,t,{components:r,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Run the following example to perform a recursive crawl of a website using ",(0,o.kt)(i.T,{to:"puppeteer-crawler/class/PuppeteerCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler")),"."),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"To run this example on the Apify Platform, select the ",(0,o.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," image for your Dockerfile.")),(0,o.kt)(p.Z,{className:"language-js",mdxType:"CodeBlock"},"import { Actor } from 'apify';\nimport { PuppeteerCrawler } from 'crawlee';\n\nawait Actor.init();\n\nconst crawler = new PuppeteerCrawler({\n    async requestHandler({ request, page, enqueueLinks }) {\n        const title = await page.title();\n        console.log(`Title of ${request.url}: ${title}`);\n\n        await enqueueLinks({\n            pseudoUrls: ['https://www.iana.org/[.*]'],\n        });\n    },\n    maxRequestsPerCrawl: 10,\n});\n\nawait crawler.run(['https://www.iana.org/']);\n\nawait Actor.exit();\n"))}w.isMDXComponent=!0}}]);