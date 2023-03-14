"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3861],{80592:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>p,toc:()=>d});var s=n(87462),o=n(63366),a=(n(67294),n(3905)),i=["components"],r={id_old:"version-1.3-session",title:"Session",id:"session"},l=void 0,p={unversionedId:"api/session",id:"version-1.3/api/session",title:"Session",description:"Sessions are used to store information such as cookies and can be used for generating fingerprints and proxy sessions. You can imagine each session as",source:"@site/versioned_docs/version-1.3/api/Session.md",sourceDirName:"api",slug:"/api/session",permalink:"/sdk/js/docs/1.3/api/session",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"Vlad Frangu",lastUpdatedAt:1678789724,formattedLastUpdatedAt:"Mar 14, 2023",frontMatter:{id_old:"version-1.3-session",title:"Session",id:"session"},sidebar:"version-1.3/docs",previous:{title:"AutoscaledPool",permalink:"/sdk/js/docs/1.3/api/autoscaled-pool"},next:{title:"SessionPool",permalink:"/sdk/js/docs/1.3/api/session-pool"}},u={},d=[{value:"<code>new Session(options)</code>",id:"new-sessionoptions",level:2},{value:"<code>session.userData</code>",id:"sessionuserdata",level:2},{value:"<code>session.isBlocked()</code>",id:"sessionisblocked",level:2},{value:"<code>session.isExpired()</code>",id:"sessionisexpired",level:2},{value:"<code>session.isMaxUsageCountReached()</code>",id:"sessionismaxusagecountreached",level:2},{value:"<code>session.isUsable()</code>",id:"sessionisusable",level:2},{value:"<code>session.markGood()</code>",id:"sessionmarkgood",level:2},{value:"<code>session.getState()</code>",id:"sessiongetstate",level:2},{value:"<code>session.retire()</code>",id:"sessionretire",level:2},{value:"<code>session.markBad()</code>",id:"sessionmarkbad",level:2},{value:"<code>session.retireOnBlockedStatusCodes(statusCode, [blockedStatusCodes])</code>",id:"sessionretireonblockedstatuscodesstatuscode-blockedstatuscodes",level:2},{value:"<code>session.setCookiesFromResponse(response)</code>",id:"sessionsetcookiesfromresponseresponse",level:2},{value:"<code>session.setPuppeteerCookies(cookies, url)</code>",id:"sessionsetpuppeteercookiescookies-url",level:2},{value:"<code>session.getPuppeteerCookies(url)</code>",id:"sessiongetpuppeteercookiesurl",level:2},{value:"<code>session.getCookieString(url)</code>",id:"sessiongetcookiestringurl",level:2}],k={toc:d},c="wrapper";function m(e){var t=e.components,n=(0,o.Z)(e,i);return(0,a.kt)(c,(0,s.Z)({},k,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("a",{name:"session"}),(0,a.kt)("p",null,"Sessions are used to store information such as cookies and can be used for generating fingerprints and proxy sessions. You can imagine each session as\na specific user, with its own cookies, IP (via proxy) and potentially a unique browser fingerprint. Session internal state can be enriched with custom\nuser data for example some authorization tokens and specific headers in general."),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"exports.session"}),(0,a.kt)("h2",{id:"new-sessionoptions"},(0,a.kt)("inlineCode",{parentName:"h2"},"new Session(options)")),(0,a.kt)("p",null,"Session configuration."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"options")),": ",(0,a.kt)("a",{parentName:"li",href:"../typedefs/session-options",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"SessionOptions")))),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"userdata"}),(0,a.kt)("h2",{id:"sessionuserdata"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.userData")),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"isblocked"}),(0,a.kt)("h2",{id:"sessionisblocked"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.isBlocked()")),(0,a.kt)("p",null,"indicates whether the session is blocked. Session is blocked once it reaches the ",(0,a.kt)("inlineCode",{parentName:"p"},"maxErrorScore"),"."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"isexpired"}),(0,a.kt)("h2",{id:"sessionisexpired"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.isExpired()")),(0,a.kt)("p",null,"Indicates whether the session is expired. Session expiration is determined by the ",(0,a.kt)("inlineCode",{parentName:"p"},"maxAgeSecs"),". Once the session is older than\n",(0,a.kt)("inlineCode",{parentName:"p"},"createdAt + maxAgeSecs")," the session is considered expired."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"ismaxusagecountreached"}),(0,a.kt)("h2",{id:"sessionismaxusagecountreached"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.isMaxUsageCountReached()")),(0,a.kt)("p",null,"Indicates whether the session is used maximum number of times. Session maximum usage count can be changed by ",(0,a.kt)("inlineCode",{parentName:"p"},"maxUsageCount")," parameter."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"isusable"}),(0,a.kt)("h2",{id:"sessionisusable"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.isUsable()")),(0,a.kt)("p",null,"Indicates whether the session can be used for next requests. Session is usable when it is not expired, not blocked and the maximum usage count has not\nbe reached."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"markgood"}),(0,a.kt)("h2",{id:"sessionmarkgood"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.markGood()")),(0,a.kt)("p",null,"This method should be called after a successful session usage. It increases ",(0,a.kt)("inlineCode",{parentName:"p"},"usageCount")," and potentially lowers the ",(0,a.kt)("inlineCode",{parentName:"p"},"errorScore")," by the\n",(0,a.kt)("inlineCode",{parentName:"p"},"errorScoreDecrement"),"."),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"getstate"}),(0,a.kt)("h2",{id:"sessiongetstate"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.getState()")),(0,a.kt)("p",null,"Gets session state for persistence in KeyValueStore."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"../typedefs/session-state",target:null,rel:null},(0,a.kt)("inlineCode",{parentName:"a"},"SessionState"))," - represents session internal state."),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"retire"}),(0,a.kt)("h2",{id:"sessionretire"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.retire()")),(0,a.kt)("p",null,"Marks session as blocked and emits event on the ",(0,a.kt)("inlineCode",{parentName:"p"},"SessionPool")," This method should be used if the session usage was unsuccessful and you are sure that\nit is because of the session configuration and not any external matters. For example when server returns 403 status code. If the session does not work\ndue to some external factors as server error such as 5XX you probably want to use ",(0,a.kt)("inlineCode",{parentName:"p"},"markBad")," method."),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"markbad"}),(0,a.kt)("h2",{id:"sessionmarkbad"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.markBad()")),(0,a.kt)("p",null,"Increases usage and error count. Should be used when the session has been used unsuccessfully. For example because of timeouts."),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"retireonblockedstatuscodes"}),(0,a.kt)("h2",{id:"sessionretireonblockedstatuscodesstatuscode-blockedstatuscodes"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.retireOnBlockedStatusCodes(statusCode, [blockedStatusCodes])")),(0,a.kt)("p",null,"With certain status codes: ",(0,a.kt)("inlineCode",{parentName:"p"},"401"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"403")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"429")," we can be certain that the target website is blocking us. This function helps to do this conveniently\nby retiring the session when such code is received. Optionally the default status codes can be extended in the second parameter."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"statusCode")),": ",(0,a.kt)("inlineCode",{parentName:"li"},"number")," - HTTP status code"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"[blockedStatusCodes]")),": ",(0,a.kt)("inlineCode",{parentName:"li"},"Array<number>")," - Custom HTTP status codes that means blocking on particular website.")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"boolean")," - whether the session was retired."),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"setcookiesfromresponse"}),(0,a.kt)("h2",{id:"sessionsetcookiesfromresponseresponse"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.setCookiesFromResponse(response)")),(0,a.kt)("p",null,"Saves cookies from an HTTP response to be used with the session. It expects an object with a ",(0,a.kt)("inlineCode",{parentName:"p"},"headers")," property that's either an ",(0,a.kt)("inlineCode",{parentName:"p"},"Object")," (typical\nNode.js responses) or a ",(0,a.kt)("inlineCode",{parentName:"p"},"Function")," (Puppeteer Response)."),(0,a.kt)("p",null,"It then parses and saves the cookies from the ",(0,a.kt)("inlineCode",{parentName:"p"},"set-cookie")," header, if available."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"response")),": ",(0,a.kt)("inlineCode",{parentName:"li"},"PuppeteerResponse")," | ",(0,a.kt)("inlineCode",{parentName:"li"},"IncomingMessage"))),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"setpuppeteercookies"}),(0,a.kt)("h2",{id:"sessionsetpuppeteercookiescookies-url"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.setPuppeteerCookies(cookies, url)")),(0,a.kt)("p",null,"Saves an array with cookie objects to be used with the session. The objects should be in the format that\n",(0,a.kt)("a",{parentName:"p",href:"https://pptr.dev/#?product=Puppeteer&version=v2.0.0&show=api-pagecookiesurls",target:"_blank",rel:"noopener"},"Puppeteer uses"),", but you can also use this function to set cookies\nmanually:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"[\n  { name: 'cookie1', value: 'my-cookie' },\n  { name: 'cookie2', value: 'your-cookie' }\n]\n")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"cookies")),": ",(0,a.kt)("inlineCode",{parentName:"li"},"Array<PuppeteerCookie>")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"url")),": ",(0,a.kt)("inlineCode",{parentName:"li"},"string"))),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"getpuppeteercookies"}),(0,a.kt)("h2",{id:"sessiongetpuppeteercookiesurl"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.getPuppeteerCookies(url)")),(0,a.kt)("p",null,"Returns cookies in a format compatible with puppeteer and ready to be used with ",(0,a.kt)("inlineCode",{parentName:"p"},"page.setCookie"),"."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"url")),": ",(0,a.kt)("inlineCode",{parentName:"li"},"string")," - website url. Only cookies stored for this url will be returned")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Array<PuppeteerCookie>")),(0,a.kt)("hr",null),(0,a.kt)("a",{name:"getcookiestring"}),(0,a.kt)("h2",{id:"sessiongetcookiestringurl"},(0,a.kt)("inlineCode",{parentName:"h2"},"session.getCookieString(url)")),(0,a.kt)("p",null,"Returns cookies saved with the session in the typical key1=value1; key2=value2 format, ready to be used in a cookie header or elsewhere."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Parameters"),":"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"strong"},"url")),": ",(0,a.kt)("inlineCode",{parentName:"li"},"string"))),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Returns"),":"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"string")," - represents ",(0,a.kt)("inlineCode",{parentName:"p"},"Cookie")," header."),(0,a.kt)("hr",null))}m.isMDXComponent=!0},3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var s=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);t&&(s=s.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,s)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function r(e,t){if(null==e)return{};var n,s,o=function(e,t){if(null==e)return{};var n,s,o={},a=Object.keys(e);for(s=0;s<a.length;s++)n=a[s],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(s=0;s<a.length;s++)n=a[s],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=s.createContext({}),p=function(e){var t=s.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=p(e.components);return s.createElement(l.Provider,{value:t},e.children)},d="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return s.createElement(s.Fragment,{},t)}},c=s.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,u=r(e,["components","mdxType","originalType","parentName"]),d=p(n),c=o,m=d["".concat(l,".").concat(c)]||d[c]||k[c]||a;return n?s.createElement(m,i(i({ref:t},u),{},{components:n})):s.createElement(m,i({ref:t},u))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=c;var r={};for(var l in t)hasOwnProperty.call(t,l)&&(r[l]=t[l]);r.originalType=e,r[d]="string"==typeof e?e:o,i[1]=r;for(var p=2;p<a;p++)i[p]=n[p];return s.createElement.apply(null,i)}return s.createElement.apply(null,n)}c.displayName="MDXCreateElement"}}]);