"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3148],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>d});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},c=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),m=p(r),d=a,f=m["".concat(l,".").concat(d)]||m[d]||u[d]||o;return r?n.createElement(f,s(s({ref:t},c),{},{components:r})):n.createElement(f,s({ref:t},c))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,s=new Array(o);s[0]=m;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:a,s[1]=i;for(var p=2;p<o;p++)s[p]=r[p];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},23652:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>d,frontMatter:()=>i,metadata:()=>p,toc:()=>u});var n=r(87462),a=r(63366),o=(r(67294),r(3905)),s=["components"],i={id:"forms",title:"Forms"},l=void 0,p={unversionedId:"examples/forms",id:"version-2.3/examples/forms",title:"Forms",description:"This example demonstrates how to use PuppeteerCrawler",source:"@site/versioned_docs/version-2.3/examples/forms.md",sourceDirName:"examples",slug:"/examples/forms",permalink:"/docs/2.3/examples/forms",draft:!1,tags:[],version:"2.3",lastUpdatedBy:"Zuzka Pelechov\xe1",lastUpdatedAt:1662733047,formattedLastUpdatedAt:"Sep 9, 2022",frontMatter:{id:"forms",title:"Forms"},sidebar:"version-2.3/docs",previous:{title:"Crawl some links on a website",permalink:"/docs/2.3/examples/crawl-some-links"},next:{title:"Dataset Map and Reduce methods",permalink:"/docs/2.3/examples/map-and-reduce"}},c={},u=[],m={toc:u};function d(e){var t=e.components,r=(0,a.Z)(e,s);return(0,o.kt)("wrapper",(0,n.Z)({},m,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"This example demonstrates how to use ",(0,o.kt)("a",{parentName:"p",href:"/docs/api/puppeteer-crawler",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"PuppeteerCrawler")),"\nto automatically fill and submit a search form to look up repositories on\n",(0,o.kt)("a",{parentName:"p",href:"https://github.com",target:"_blank",rel:"noopener"},"GitHub")," using headless Chrome / Puppeteer.\nThe actor first fills in the search term, repository owner, start date and\nlanguage of the repository, then submits the form and prints out the results.\nFinally, the results are saved either on the Apify platform to the default\n",(0,o.kt)("a",{parentName:"p",href:"/docs/api/dataset",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"dataset")),"\nor on the local machine as JSON files in ",(0,o.kt)("inlineCode",{parentName:"p"},"./apify_storage/datasets/default"),"."),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"To run this example on the Apify Platform, select the ",(0,o.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," image for your Dockerfile.")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\nApify.main(async () => {\n    // Launch the web browser.\n    const browser = await Apify.launchPuppeteer();\n\n    // Create and navigate new page\n    console.log('Open target page');\n    const page = await browser.newPage();\n    await page.goto('https://github.com/search/advanced');\n\n    // Fill form fields and select desired search options\n    console.log('Fill in search form');\n    await page.type('#adv_code_search input.js-advanced-search-input', 'apify-js');\n    await page.type('#search_from', 'apify');\n    await page.type('#search_date', '>2015');\n    await page.select('select#search_language', 'JavaScript');\n\n    // Submit the form and wait for full load of next page\n    console.log('Submit search form');\n    await Promise.all([\n        page.waitForNavigation(),\n        page.click('#adv_code_search button[type=\"submit\"]'),\n    ]);\n\n    // Obtain and print list of search results\n    const results = await page.$$eval('div.f4.text-normal a', (nodes) => nodes.map((node) => ({\n        url: node.href,\n        name: node.innerText,\n    })));\n    console.log('Results:', results);\n\n    // Store data in default dataset\n    await Apify.pushData(results);\n\n    // Close browser\n    await browser.close();\n});\n")))}d.isMDXComponent=!0}}]);