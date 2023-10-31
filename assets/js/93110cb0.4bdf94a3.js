"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4359],{68889:(e,t,n)=>{n.d(t,{Z:()=>c});var a=n(67294),r=n(88746),o=n(6141),l=n(6832);const c=function(e){var t=e.to,n=e.children,c=(0,o.E)(),s=c.version,i=c.isLast;if((0,l.default)().siteConfig.presets[0][1].docs.disableVersioning)return a.createElement(r.default,{to:"/api/"+t},n);var d=s+"/";return"current"===s?d="next/":i&&(d=""),a.createElement(r.default,{to:"/api/"+d+t},n)}},26569:(e,t,n)=>{n.d(t,{B:()=>c,T:()=>l});var a=n(67294),r=n(88746),o="https://crawlee.dev",l=function(e){var t=e.to,n=e.children,l=e.version;return a.createElement(r.default,{href:o+"/api"+(l?"/"+l:"")+"/"+t},n)},c=function(e){var t=e.to,n=e.children;return a.createElement(r.default,{href:o+"/"+t},n)}},19556:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>b,contentTitle:()=>m,default:()=>v,frontMatter:()=>p,metadata:()=>u,toc:()=>h});var a=n(87462),r=n(63366),o=(n(67294),n(3905)),l=(n(14563),n(68889)),c=n(26569);const s={code:"import { Actor } from 'apify';\nimport { launchPuppeteer } from 'crawlee';\n\nawait Actor.init();\n\n// Launch the web browser.\nconst browser = await launchPuppeteer();\n\n// Create and navigate new page\nconsole.log('Open target page');\nconst page = await browser.newPage();\nawait page.goto('https://github.com/search/advanced');\n\n// Fill form fields and select desired search options\nconsole.log('Fill in search form');\nawait page.type('#adv_code_search input.js-advanced-search-input', 'apify-js');\nawait page.type('#search_from', 'apify');\nawait page.type('#search_date', '>2015');\nawait page.select('select#search_language', 'JavaScript');\n\n// Submit the form and wait for full load of next page\nconsole.log('Submit search form');\nawait Promise.all([\n    page.waitForNavigation(),\n    page.click('#adv_code_search button[type=\"submit\"]'),\n]);\n\n// Obtain and print list of search results\nconst results = await page.$$eval('div.f4.text-normal a', (nodes) => nodes.map((node) => ({\n    url: node.href,\n    name: node.innerText,\n})));\n\nconsole.log('Results:', results);\n\n// Store data in default dataset\nawait Actor.pushData(results);\n\n// Close browser\nawait browser.close();\n\nawait Actor.exit();\n",hash:"eyJ1IjoiRWdQdHczb2VqNlRhRHQ1cW4iLCJ2IjoxfQ.eyJpbnB1dCI6IntcImNvZGVcIjpcImltcG9ydCB7IEFjdG9yIH0gZnJvbSAnYXBpZnknO1xcbmltcG9ydCB7IGxhdW5jaFB1cHBldGVlciB9IGZyb20gJ2NyYXdsZWUnO1xcblxcbmF3YWl0IEFjdG9yLmluaXQoKTtcXG5cXG4vLyBMYXVuY2ggdGhlIHdlYiBicm93c2VyLlxcbmNvbnN0IGJyb3dzZXIgPSBhd2FpdCBsYXVuY2hQdXBwZXRlZXIoKTtcXG5cXG4vLyBDcmVhdGUgYW5kIG5hdmlnYXRlIG5ldyBwYWdlXFxuY29uc29sZS5sb2coJ09wZW4gdGFyZ2V0IHBhZ2UnKTtcXG5jb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XFxuYXdhaXQgcGFnZS5nb3RvKCdodHRwczovL2dpdGh1Yi5jb20vc2VhcmNoL2FkdmFuY2VkJyk7XFxuXFxuLy8gRmlsbCBmb3JtIGZpZWxkcyBhbmQgc2VsZWN0IGRlc2lyZWQgc2VhcmNoIG9wdGlvbnNcXG5jb25zb2xlLmxvZygnRmlsbCBpbiBzZWFyY2ggZm9ybScpO1xcbmF3YWl0IHBhZ2UudHlwZSgnI2Fkdl9jb2RlX3NlYXJjaCBpbnB1dC5qcy1hZHZhbmNlZC1zZWFyY2gtaW5wdXQnLCAnYXBpZnktanMnKTtcXG5hd2FpdCBwYWdlLnR5cGUoJyNzZWFyY2hfZnJvbScsICdhcGlmeScpO1xcbmF3YWl0IHBhZ2UudHlwZSgnI3NlYXJjaF9kYXRlJywgJz4yMDE1Jyk7XFxuYXdhaXQgcGFnZS5zZWxlY3QoJ3NlbGVjdCNzZWFyY2hfbGFuZ3VhZ2UnLCAnSmF2YVNjcmlwdCcpO1xcblxcbi8vIFN1Ym1pdCB0aGUgZm9ybSBhbmQgd2FpdCBmb3IgZnVsbCBsb2FkIG9mIG5leHQgcGFnZVxcbmNvbnNvbGUubG9nKCdTdWJtaXQgc2VhcmNoIGZvcm0nKTtcXG5hd2FpdCBQcm9taXNlLmFsbChbXFxuICAgIHBhZ2Uud2FpdEZvck5hdmlnYXRpb24oKSxcXG4gICAgcGFnZS5jbGljaygnI2Fkdl9jb2RlX3NlYXJjaCBidXR0b25bdHlwZT1cXFwic3VibWl0XFxcIl0nKSxcXG5dKTtcXG5cXG4vLyBPYnRhaW4gYW5kIHByaW50IGxpc3Qgb2Ygc2VhcmNoIHJlc3VsdHNcXG5jb25zdCByZXN1bHRzID0gYXdhaXQgcGFnZS4kJGV2YWwoJ2Rpdi5mNC50ZXh0LW5vcm1hbCBhJywgKG5vZGVzKSA9PiBub2Rlcy5tYXAoKG5vZGUpID0-ICh7XFxuICAgIHVybDogbm9kZS5ocmVmLFxcbiAgICBuYW1lOiBub2RlLmlubmVyVGV4dCxcXG59KSkpO1xcblxcbmNvbnNvbGUubG9nKCdSZXN1bHRzOicsIHJlc3VsdHMpO1xcblxcbi8vIFN0b3JlIGRhdGEgaW4gZGVmYXVsdCBkYXRhc2V0XFxuYXdhaXQgQWN0b3IucHVzaERhdGEocmVzdWx0cyk7XFxuXFxuLy8gQ2xvc2UgYnJvd3NlclxcbmF3YWl0IGJyb3dzZXIuY2xvc2UoKTtcXG5cXG5hd2FpdCBBY3Rvci5leGl0KCk7XFxuXCJ9Iiwib3B0aW9ucyI6eyJidWlsZCI6ImxhdGVzdCIsImNvbnRlbnRUeXBlIjoiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCIsIm1lbW9yeSI6NDA5NiwidGltZW91dCI6MTgwfX0.DmRFuL_IvNKlGP6PPjiqTNvmyuQDiP_ZX9s7i9fnV-E"};var i,d=["components"],p={id:"forms",title:"Forms"},m=void 0,u={unversionedId:"examples/forms",id:"examples/forms",title:"Forms",description:"This example demonstrates how to use PuppeteerCrawler to",source:"@site/../docs/examples/forms.mdx",sourceDirName:"examples",slug:"/examples/forms",permalink:"/sdk/js/docs/next/examples/forms",draft:!1,editUrl:"https://github.com/apify/apify-sdk-js/edit/master/website/../docs/examples/forms.mdx",tags:[],version:"current",lastUpdatedBy:"Vlad Frangu",lastUpdatedAt:1698752548,formattedLastUpdatedAt:"Oct 31, 2023",frontMatter:{id:"forms",title:"Forms"},sidebar:"docs",previous:{title:"Crawl some links on a website",permalink:"/sdk/js/docs/next/examples/crawl-some-links"},next:{title:"Dataset Map and Reduce methods",permalink:"/sdk/js/docs/next/examples/map-and-reduce"}},b={},h=[],f=(i="RunnableCodeBlock",function(e){return console.warn("Component "+i+" was not imported, exported, or provided by MDXProvider as global scope"),(0,o.kt)("div",e)}),y={toc:h},g="wrapper";function v(e){var t=e.components,n=(0,r.Z)(e,d);return(0,o.kt)(g,(0,a.Z)({},y,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"This example demonstrates how to use ",(0,o.kt)(c.T,{to:"puppeteer-crawler/class/PuppeteerCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler"))," to\nautomatically fill and submit a search form to look up repositories on ",(0,o.kt)("a",{parentName:"p",href:"https://github.com",target:"_blank",rel:"noopener"},"GitHub")," using headless Chrome / Puppeteer.\nThe actor first fills in the search term, repository owner, start date and language of the repository, then submits the form\nand prints out the results. Finally, the results are saved either on the Apify platform to the\ndefault ",(0,o.kt)(l.Z,{to:"apify/class/Dataset",mdxType:"ApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"dataset"))," or on the local machine as JSON files in ",(0,o.kt)("inlineCode",{parentName:"p"},"./storage/datasets/default"),"."),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"To run this example on the Apify Platform, select the ",(0,o.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," image for your Dockerfile.")),(0,o.kt)(f,{className:"language-js",type:"puppeteer",mdxType:"RunnableCodeBlock"},s))}v.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>b});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),i=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=i(e.components);return a.createElement(s.Provider,{value:t},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,d=c(e,["components","mdxType","originalType","parentName"]),p=i(n),u=r,b=p["".concat(s,".").concat(u)]||p[u]||m[u]||o;return n?a.createElement(b,l(l({ref:t},d),{},{components:n})):a.createElement(b,l({ref:t},d))}));function b(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=u;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c[p]="string"==typeof e?e:r,l[1]=c;for(var i=2;i<o;i++)l[i]=n[i];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);