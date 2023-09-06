"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2538],{12741:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>m,contentTitle:()=>s,default:()=>x,frontMatter:()=>c,metadata:()=>u,toc:()=>y});var n=r(87462),o=r(63366),a=(r(67294),r(3905)),p=r(14563);const i="import { Actor } from 'apify';\nimport { PuppeteerCrawler } from 'crawlee';\n\nawait Actor.init();\n\n// Proxy connection is automatically established in the Crawler\nconst proxyConfiguration = await Actor.createProxyConfiguration();\n\nconst crawler = new PuppeteerCrawler({\n    proxyConfiguration,\n    async requestHandler({ page }) {\n        const status = await page.$eval('td.status', (el) => el.textContent);\n        console.log(`Proxy Status: ${status}`);\n    },\n});\n\nconsole.log('Running Puppeteer script...');\n\nawait crawler.run(['http://proxy.apify.com']);\n\nconsole.log('Puppeteer closed.');\n\nawait Actor.exit();\n";var l=["components"],c={id:"puppeteer-with-proxy",title:"Puppeteer with proxy"},s=void 0,u={unversionedId:"examples/puppeteer-with-proxy",id:"examples/puppeteer-with-proxy",title:"Puppeteer with proxy",description:"This example demonstrates how to load pages in headless Chrome / Puppeteer over Apify Proxy.",source:"@site/../docs/examples/puppeteer_with_proxy.mdx",sourceDirName:"examples",slug:"/examples/puppeteer-with-proxy",permalink:"/sdk/js/docs/next/examples/puppeteer-with-proxy",draft:!1,tags:[],version:"current",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1694001335,formattedLastUpdatedAt:"Sep 6, 2023",frontMatter:{id:"puppeteer-with-proxy",title:"Puppeteer with proxy"},sidebar:"docs",previous:{title:"Puppeteer recursive crawl",permalink:"/sdk/js/docs/next/examples/puppeteer-recursive-crawl"},next:{title:"Upgrading",permalink:"/sdk/js/docs/next/upgrading"}},m={},y=[],f={toc:y},d="wrapper";function x(e){var t=e.components,r=(0,o.Z)(e,l);return(0,a.kt)(d,(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"This example demonstrates how to load pages in headless Chrome / Puppeteer over ",(0,a.kt)("a",{parentName:"p",href:"https://docs.apify.com/proxy",target:"_blank",rel:"noopener"},"Apify Proxy"),"."),(0,a.kt)("p",null,"To make it work, you'll need an Apify account with access to the proxy. Visit the ",(0,a.kt)("a",{parentName:"p",href:"/docs/guides/apify-platform",target:null,rel:null},"Apify platform introduction")," to find how to log into your account from the SDK."),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"To run this example on the Apify Platform, select the ",(0,a.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," image for your Dockerfile.")),(0,a.kt)(p.Z,{className:"language-js",mdxType:"CodeBlock"},i))}x.isMDXComponent=!0},3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>f});var n=r(67294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},s=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},y=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),u=c(r),y=o,f=u["".concat(l,".").concat(y)]||u[y]||m[y]||a;return r?n.createElement(f,p(p({ref:t},s),{},{components:r})):n.createElement(f,p({ref:t},s))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,p=new Array(a);p[0]=y;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i[u]="string"==typeof e?e:o,p[1]=i;for(var c=2;c<a;c++)p[c]=r[c];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}y.displayName="MDXCreateElement"}}]);