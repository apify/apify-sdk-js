"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[707],{68889:(e,t,r)=>{r.d(t,{Z:()=>c});var n=r(67294),a=r(88746),o=r(6141),l=r(6832);const c=function(e){var t=e.to,r=e.children,c=(0,o.E)(),i=c.version,s=c.isLast;if((0,l.default)().siteConfig.presets[0][1].docs.disableVersioning)return n.createElement(a.default,{to:"/api/"+t},r);var p=i+"/";return"current"===i?p="next/":s&&(p=""),n.createElement(a.default,{to:"/api/"+p+t},r)}},33328:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>u,contentTitle:()=>p,default:()=>y,frontMatter:()=>s,metadata:()=>d,toc:()=>m});var n=r(87462),a=r(63366),o=(r(67294),r(3905));r(14563),r(68889);const l={code:"import { gotScraping } from 'got-scraping';\n\n// Get the HTML of a web page\nconst { body } = await gotScraping({ url: 'https://www.example.com' });\nconsole.log(body);\n",hash:"eyJ1IjoiRWdQdHczb2VqNlRhRHQ1cW4iLCJ2IjoxfQ.eyJpbnB1dCI6IntcImNvZGVcIjpcImltcG9ydCB7IGdvdFNjcmFwaW5nIH0gZnJvbSAnZ290LXNjcmFwaW5nJztcXG5cXG4vLyBHZXQgdGhlIEhUTUwgb2YgYSB3ZWIgcGFnZVxcbmNvbnN0IHsgYm9keSB9ID0gYXdhaXQgZ290U2NyYXBpbmcoeyB1cmw6ICdodHRwczovL3d3dy5leGFtcGxlLmNvbScgfSk7XFxuY29uc29sZS5sb2coYm9keSk7XFxuXCJ9Iiwib3B0aW9ucyI6eyJidWlsZCI6ImxhdGVzdCIsImNvbnRlbnRUeXBlIjoiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCIsIm1lbW9yeSI6MTAyNCwidGltZW91dCI6MTgwfX0.0S1i1yD10_82mLCH3VWFtCZTU4-BDrDU1UGY208IqgE"};var c,i=["components"],s={id:"crawl-single-url",title:"Crawl a single URL"},p=void 0,d={unversionedId:"examples/crawl-single-url",id:"examples/crawl-single-url",title:"Crawl a single URL",description:"This example uses the got-scraping npm package",source:"@site/../docs/examples/crawl_single_url.mdx",sourceDirName:"examples",slug:"/examples/crawl-single-url",permalink:"/sdk/js/docs/next/examples/crawl-single-url",draft:!1,editUrl:"https://github.com/apify/apify-sdk-js/edit/master/website/../docs/examples/crawl_single_url.mdx",tags:[],version:"current",lastUpdatedBy:"Vlad Frangu",lastUpdatedAt:1698752548,formattedLastUpdatedAt:"Oct 31, 2023",frontMatter:{id:"crawl-single-url",title:"Crawl a single URL"},sidebar:"docs",previous:{title:"Crawl a website with relative links",permalink:"/sdk/js/docs/next/examples/crawl-relative-links"},next:{title:"Crawl a sitemap",permalink:"/sdk/js/docs/next/examples/crawl-sitemap"}},u={},m=[],g=(c="RunnableCodeBlock",function(e){return console.warn("Component "+c+" was not imported, exported, or provided by MDXProvider as global scope"),(0,o.kt)("div",e)}),f={toc:m},b="wrapper";function y(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)(b,(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"This example uses the ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/apify/got-scraping",target:"_blank",rel:"noopener"},(0,o.kt)("inlineCode",{parentName:"a"},"got-scraping"))," npm package\nto grab the HTML of a web page."),(0,o.kt)(g,{className:"language-js",type:"cheerio",mdxType:"RunnableCodeBlock"},l),(0,o.kt)("p",null,"If you don't want to hard-code the URL into the script, refer to the ",(0,o.kt)("a",{parentName:"p",href:"./accept-user-input",target:null,rel:null},"Accept User Input")," example."))}y.isMDXComponent=!0},3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>g});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var i=n.createContext({}),s=function(e){var t=n.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=s(e.components);return n.createElement(i.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,i=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),d=s(r),m=a,g=d["".concat(i,".").concat(m)]||d[m]||u[m]||o;return r?n.createElement(g,l(l({ref:t},p),{},{components:r})):n.createElement(g,l({ref:t},p))}));function g(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,l=new Array(o);l[0]=m;var c={};for(var i in t)hasOwnProperty.call(t,i)&&(c[i]=t[i]);c.originalType=e,c[d]="string"==typeof e?e:a,l[1]=c;for(var s=2;s<o;s++)l[s]=r[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"}}]);