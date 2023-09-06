"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1777],{40524:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>i,default:()=>m,frontMatter:()=>l,metadata:()=>s,toc:()=>c});var r=n(87462),a=n(63366),o=(n(67294),n(3905)),p=["components"],l={id:"puppeteer-launch-context",title:"PuppeteerLaunchContext"},i=void 0,s={unversionedId:"typedefs/puppeteer-launch-context",id:"version-2.3/typedefs/puppeteer-launch-context",title:"PuppeteerLaunchContext",description:"_Deprecated_",source:"@site/versioned_docs/version-2.3/typedefs/PuppeteerLaunchContext.md",sourceDirName:"typedefs",slug:"/typedefs/puppeteer-launch-context",permalink:"/sdk/js/docs/2.3/typedefs/puppeteer-launch-context",draft:!1,tags:[],version:"2.3",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1694001335,formattedLastUpdatedAt:"Sep 6, 2023",frontMatter:{id:"puppeteer-launch-context",title:"PuppeteerLaunchContext"},sidebar:"version-2.3/docs",previous:{title:"PuppeteerCrawlerOptions",permalink:"/sdk/js/docs/2.3/typedefs/puppeteer-crawler-options"},next:{title:"ProxyConfigurationOptions",permalink:"/sdk/js/docs/2.3/typedefs/proxy-configuration-options"}},u={},c=[{value:"Properties",id:"properties",level:2},{value:"<code>launchOptions</code>",id:"launchoptions",level:3},{value:"<code>proxyUrl</code>",id:"proxyurl",level:3},{value:"<code>userAgent</code>",id:"useragent",level:3},{value:"<code>useChrome</code>",id:"usechrome",level:3},{value:"<code>launcher</code>",id:"launcher",level:3},{value:"<code>useIncognitoPages</code>",id:"useincognitopages",level:3},{value:"<code>stealth</code>",id:"stealth",level:3},{value:"<code>stealthOptions</code>",id:"stealthoptions",level:3}],d={toc:c},h="wrapper";function m(e){var t=e.components,n=(0,a.Z)(e,p);return(0,o.kt)(h,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("a",{name:"puppeteerlaunchcontext"}),(0,o.kt)("h1",{id:"puppeteerlaunchcontext"},(0,o.kt)("del",{parentName:"h1"},(0,o.kt)("inlineCode",{parentName:"del"},"PuppeteerLaunchContext"))),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("em",{parentName:"strong"},"Deprecated"))),(0,o.kt)("p",null,"Apify extends the launch options of Puppeteer. You can use any of the Puppeteer compatible\n",(0,o.kt)("a",{parentName:"p",href:"https://pptr.dev/#?product=Puppeteer&show=api-puppeteerlaunchoptions",target:"_blank",rel:"noopener"},(0,o.kt)("inlineCode",{parentName:"a"},"LaunchOptions"))," options by providing the ",(0,o.kt)("inlineCode",{parentName:"p"},"launchOptions")," property."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Example:")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"// launch a headless Chrome (not Chromium)\nconst launchContext = {\n    // Apify helpers\n    useChrome: true,\n    proxyUrl: 'http://user:password@some.proxy.com'\n    // Native Puppeteer options\n    launchOptions: {\n        headless: true,\n        args: ['--some-flag'],\n    }\n}\n")),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"launchoptions"},(0,o.kt)("inlineCode",{parentName:"h3"},"launchOptions")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"Record<string, any>")),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"puppeteer.launch")," ",(0,o.kt)("a",{parentName:"p",href:"https://pptr.dev/#?product=Puppeteer&version=v13.5.1&show=api-puppeteerlaunchoptions",target:"_blank",rel:"noopener"},"options")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"proxyurl"},(0,o.kt)("inlineCode",{parentName:"h3"},"proxyUrl")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")),(0,o.kt)("p",null,"URL to a HTTP proxy server. It must define the port number, and it may also contain proxy username and password."),(0,o.kt)("p",null,"Example: ",(0,o.kt)("inlineCode",{parentName:"p"},"http://bob:pass123@proxy.example.com:1234"),"."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"useragent"},(0,o.kt)("inlineCode",{parentName:"h3"},"userAgent")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"User-Agent")," HTTP header used by the browser. If not provided, the function sets ",(0,o.kt)("inlineCode",{parentName:"p"},"User-Agent")," to a reasonable default to reduce the chance of\ndetection of the crawler."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"usechrome"},(0,o.kt)("inlineCode",{parentName:"h3"},"useChrome")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"boolean")," ",(0,o.kt)("code",null," = false")),(0,o.kt)("p",null,"If ",(0,o.kt)("inlineCode",{parentName:"p"},"true")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"executablePath")," is not set, Puppeteer will launch full Google Chrome browser available on the machine rather than the bundled Chromium.\nThe path to Chrome executable is taken from the ",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_CHROME_EXECUTABLE_PATH")," environment variable if provided, or defaults to the typical Google\nChrome executable location specific for the operating system. By default, this option is ",(0,o.kt)("inlineCode",{parentName:"p"},"false"),"."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"launcher"},(0,o.kt)("inlineCode",{parentName:"h3"},"launcher")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"*")),(0,o.kt)("p",null,"Already required module (",(0,o.kt)("inlineCode",{parentName:"p"},"Object"),"). This enables usage of various Puppeteer wrappers such as ",(0,o.kt)("inlineCode",{parentName:"p"},"puppeteer-extra"),"."),(0,o.kt)("p",null,"Take caution, because it can cause all kinds of unexpected errors and weird behavior. Apify SDK is not tested with any other library besides\n",(0,o.kt)("inlineCode",{parentName:"p"},"puppeteer")," itself."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"useincognitopages"},(0,o.kt)("inlineCode",{parentName:"h3"},"useIncognitoPages")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"boolean")," ",(0,o.kt)("code",null," = false")),(0,o.kt)("p",null,"With this option selected, all pages will be opened in a new incognito browser context. This means they will not share cookies nor cache and their\nresources will not be throttled by one another."),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"stealth"},(0,o.kt)("inlineCode",{parentName:"h3"},"stealth")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"boolean")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"stealthoptions"},(0,o.kt)("inlineCode",{parentName:"h3"},"stealthOptions")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Type"),": ",(0,o.kt)("a",{parentName:"p",href:"../typedefs/stealth-options",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"StealthOptions"))),(0,o.kt)("hr",null))}m.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var i=r.createContext({}),s=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},u=function(e){var t=s(e.components);return r.createElement(i.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,i=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=s(n),h=a,m=c["".concat(i,".").concat(h)]||c[h]||d[h]||o;return n?r.createElement(m,p(p({ref:t},u),{},{components:n})):r.createElement(m,p({ref:t},u))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,p=new Array(o);p[0]=h;var l={};for(var i in t)hasOwnProperty.call(t,i)&&(l[i]=t[i]);l.originalType=e,l[c]="string"==typeof e?e:a,p[1]=l;for(var s=2;s<o;s++)p[s]=n[s];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}h.displayName="MDXCreateElement"}}]);