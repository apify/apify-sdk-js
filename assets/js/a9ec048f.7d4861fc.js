"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3651],{14922:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>w,frontMatter:()=>p,metadata:()=>l,toc:()=>u});var r=n(87462),a=n(63366),s=(n(67294),n(3905)),o=["components"],p={id_old:"version-1.3-capture-screenshot",title:"Capture a screenshot",id:"capture-screenshot"},i=void 0,l={unversionedId:"examples/capture-screenshot",id:"version-1.3/examples/capture-screenshot",title:"Capture a screenshot",description:"To run this example on the Apify Platform, select the apify/actor-node-puppeteer-chrome image for your Dockerfile.",source:"@site/versioned_docs/version-1.3/examples/capture_screenshot.md",sourceDirName:"examples",slug:"/examples/capture-screenshot",permalink:"/sdk/js/docs/1.3/examples/capture-screenshot",draft:!1,editUrl:"https://github.com/apify/apify-sdk-js/edit/master/website/versioned_docs/version-1.3/examples/capture_screenshot.md",tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1698960215,formattedLastUpdatedAt:"Nov 2, 2023",frontMatter:{id_old:"version-1.3-capture-screenshot",title:"Capture a screenshot",id:"capture-screenshot"},sidebar:"version-1.3/docs",previous:{title:"Call actor",permalink:"/sdk/js/docs/1.3/examples/call-actor"},next:{title:"Cheerio crawler",permalink:"/sdk/js/docs/1.3/examples/cheerio-crawler"}},c={},u=[],m={toc:u},h="wrapper";function w(e){var t=e.components,n=(0,a.Z)(e,o);return(0,s.kt)(h,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("blockquote",null,(0,s.kt)("p",{parentName:"blockquote"},"To run this example on the Apify Platform, select the ",(0,s.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," image for your Dockerfile.")),(0,s.kt)("p",null,"This example captures a screenshot of a web page using ",(0,s.kt)("inlineCode",{parentName:"p"},"Puppeteer"),". It would look almost exactly the same with ",(0,s.kt)("inlineCode",{parentName:"p"},"Playwright"),"."),(0,s.kt)("p",null,"\\\nUsing ",(0,s.kt)("inlineCode",{parentName:"p"},"page.screenshot()"),":"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\nApify.main(async () => {\n    const url = 'http://www.example.com/';\n    // Start a browser\n    const browser = await Apify.launchPuppeteer();\n    // Open new tab in the browser\n    const page = await browser.newPage();\n    // Navigate to the URL\n    await page.goto(url);\n    // Capture the screenshot\n    const screenshot = await page.screenshot();\n    // Save the screenshot to the default key-value store\n    await Apify.setValue('my-key', screenshot, { contentType: 'image/png' });\n    // Close Puppeteer\n    await browser.close();\n});\n")),(0,s.kt)("p",null,"\\\nUsing ",(0,s.kt)("inlineCode",{parentName:"p"},"Apify.utils.puppeteer.saveSnapshot()"),":"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\nApify.main(async () => {\n    const url = 'http://www.example.com/';\n    // Start a browser\n    const browser = await Apify.launchPuppeteer();\n    // Open new tab in the browser\n    const page = await browser.newPage();\n    // Navigate to the URL\n    await page.goto(url);\n    // Capture the screenshot\n    await Apify.utils.puppeteer.saveSnapshot(page, { key: 'my-key', saveHtml: false });\n    // Close Puppeteer\n    await browser.close();\n});\n")),(0,s.kt)("p",null,"This example captures a screenshot of multiple web pages when using ",(0,s.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler"),":"),(0,s.kt)("p",null,"\\\nUsing ",(0,s.kt)("inlineCode",{parentName:"p"},"page.screenshot()"),":"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\nApify.main(async () => {\n    // Add URLs to a RequestList\n    const requestList = await Apify.openRequestList('start-urls', [\n        { url: 'http://www.example.com/page-1' },\n        { url: 'http://www.example.com/page-2' },\n        { url: 'http://www.example.com/page-3' },\n    ]);\n    // Function called for each URL\n    const handlePageFunction = async ({ request, page }) => {\n        // Capture the screenshot with Puppeteer\n        const screenshot = await page.screenshot();\n        // Convert the URL into a valid key\n        const key = request.url.replace(/[:/]/g, '_');\n        // Save the screenshot to the default key-value store\n        await Apify.setValue(key, screenshot, { contentType: 'image/png' });\n    };\n    // Create a PuppeteerCrawler\n    const crawler = new Apify.PuppeteerCrawler({\n        requestList,\n        handlePageFunction,\n    });\n    // Run the crawler\n    await crawler.run();\n});\n")),(0,s.kt)("p",null,"\\\nUsing ",(0,s.kt)("inlineCode",{parentName:"p"},"Apify.utils.puppeteer.saveSnapshot()"),":"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\nApify.main(async () => {\n    // Add URLs to a RequestList\n    const requestList = await Apify.openRequestList('start-urls', [\n        { url: 'http://www.example.com/page-1' },\n        { url: 'http://www.example.com/page-2' },\n        { url: 'http://www.example.com/page-3' },\n    ]);\n    // Function called for each URL\n    const handlePageFunction = async ({ request, page }) => {\n        // Convert the URL into a valid key\n        const key = request.url.replace(/[:/]/g, '_');\n        // Capture the screenshot\n        await Apify.utils.puppeteer.saveSnapshot(page, { key, saveHtml: false });\n    };\n    // Create a PuppeteerCrawler\n    const crawler = new Apify.PuppeteerCrawler({\n        requestList,\n        handlePageFunction,\n    });\n    // Run the crawler\n    await crawler.run();\n});\n")),(0,s.kt)("p",null,"In both examples using ",(0,s.kt)("inlineCode",{parentName:"p"},"page.screenshot()"),", a ",(0,s.kt)("inlineCode",{parentName:"p"},"key")," variable is created based on the URL of the web page. This variable is used as the key when saving\neach screenshot into a key-value store."))}w.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>w});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var i=r.createContext({}),l=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=l(e.components);return r.createElement(i.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,s=e.originalType,i=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),u=l(n),h=a,w=u["".concat(i,".").concat(h)]||u[h]||m[h]||s;return n?r.createElement(w,o(o({ref:t},c),{},{components:n})):r.createElement(w,o({ref:t},c))}));function w(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var s=n.length,o=new Array(s);o[0]=h;var p={};for(var i in t)hasOwnProperty.call(t,i)&&(p[i]=t[i]);p.originalType=e,p[u]="string"==typeof e?e:a,o[1]=p;for(var l=2;l<s;l++)o[l]=n[l];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}h.displayName="MDXCreateElement"}}]);