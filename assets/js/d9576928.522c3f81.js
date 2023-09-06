"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5852],{30433:(e,t,a)=>{a.d(t,{Z:()=>i});var n=a(67294),r=a(34334);const o={tabItem:"tabItem_Ymn6"};function i(e){var t=e.children,a=e.hidden,i=e.className;return n.createElement("div",{role:"tabpanel",className:(0,r.Z)(o.tabItem,i),hidden:a},t)}},65559:(e,t,a)=>{a.d(t,{Z:()=>m});var n=a(87462),r=a(67294),o=a(34334),i=a(63735),l=a(38224),s=a(5730);const u={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function p(e){var t=e.className,a=e.block,l=e.selectedValue,s=e.selectValue,p=e.tabValues,c=[],d=(0,i.o5)().blockElementScrollPositionUntilNextRender,m=function(e){var t=e.currentTarget,a=c.indexOf(t),n=p[a].value;n!==l&&(d(t),s(n))},h=function(e){var t,a=null;switch(e.key){case"Enter":m(e);break;case"ArrowRight":var n,r=c.indexOf(e.currentTarget)+1;a=null!=(n=c[r])?n:c[0];break;case"ArrowLeft":var o,i=c.indexOf(e.currentTarget)-1;a=null!=(o=c[i])?o:c[c.length-1]}null==(t=a)||t.focus()};return r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":a},t)},p.map((function(e){var t=e.value,a=e.label,i=e.attributes;return r.createElement("li",(0,n.Z)({role:"tab",tabIndex:l===t?0:-1,"aria-selected":l===t,key:t,ref:function(e){return c.push(e)},onKeyDown:h,onClick:m},i,{className:(0,o.Z)("tabs__item",u.tabItem,null==i?void 0:i.className,{"tabs__item--active":l===t})}),null!=a?a:t)})))}function c(e){var t=e.lazy,a=e.children,n=e.selectedValue,o=(Array.isArray(a)?a:[a]).filter(Boolean);if(t){var i=o.find((function(e){return e.props.value===n}));return i?(0,r.cloneElement)(i,{className:"margin-top--md"}):null}return r.createElement("div",{className:"margin-top--md"},o.map((function(e,t){return(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==n})})))}function d(e){var t=(0,l.Y)(e);return r.createElement("div",{className:(0,o.Z)("tabs-container",u.tabList)},r.createElement(p,(0,n.Z)({},e,t)),r.createElement(c,(0,n.Z)({},e,t)))}function m(e){var t=(0,s.Z)();return r.createElement(d,(0,n.Z)({key:String(t)},e))}},38224:(e,t,a)=>{a.d(t,{Y:()=>d});var n=a(67294),r=a(16550),o=a(34423),i=a(20636),l=a(99200);function s(e){return function(e){var t,a;return null!=(t=null==(a=n.Children.map(e,(function(e){if(!e||(0,n.isValidElement)(e)&&(t=e.props)&&"object"==typeof t&&"value"in t)return e;var t;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})))?void 0:a.filter(Boolean))?t:[]}(e).map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes,default:t.default}}))}function u(e){var t=e.values,a=e.children;return(0,n.useMemo)((function(){var e=null!=t?t:s(a);return function(e){var t=(0,i.l)(e,(function(e,t){return e.value===t.value}));if(t.length>0)throw new Error('Docusaurus error: Duplicate values "'+t.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[t,a])}function p(e){var t=e.value;return e.tabValues.some((function(e){return e.value===t}))}function c(e){var t=e.queryString,a=void 0!==t&&t,i=e.groupId,l=(0,r.k6)(),s=function(e){var t=e.queryString,a=void 0!==t&&t,n=e.groupId;if("string"==typeof a)return a;if(!1===a)return null;if(!0===a&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=n?n:null}({queryString:a,groupId:i});return[(0,o._X)(s),(0,n.useCallback)((function(e){if(s){var t=new URLSearchParams(l.location.search);t.set(s,e),l.replace(Object.assign({},l.location,{search:t.toString()}))}}),[s,l])]}function d(e){var t,a,r,o,i=e.defaultValue,s=e.queryString,d=void 0!==s&&s,m=e.groupId,h=u(e),g=(0,n.useState)((function(){return function(e){var t,a=e.defaultValue,n=e.tabValues;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(a){if(!p({value:a,tabValues:n}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+a+'" but none of its children has the corresponding value. Available values are: '+n.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return a}var r=null!=(t=n.find((function(e){return e.default})))?t:n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:i,tabValues:h})})),f=g[0],k=g[1],y=c({queryString:d,groupId:m}),b=y[0],w=y[1],v=(t=function(e){return e?"docusaurus.tab."+e:null}({groupId:m}.groupId),a=(0,l.Nk)(t),r=a[0],o=a[1],[r,(0,n.useCallback)((function(e){t&&o.set(e)}),[t,o])]),N=v[0],C=v[1],x=function(){var e=null!=b?b:N;return p({value:e,tabValues:h})?e:null}();return(0,n.useLayoutEffect)((function(){x&&k(x)}),[x]),{selectedValue:f,selectValue:(0,n.useCallback)((function(e){if(!p({value:e,tabValues:h}))throw new Error("Can't select invalid tab value="+e);k(e),w(e),C(e)}),[w,C,h]),tabValues:h}}},68889:(e,t,a)=>{a.d(t,{Z:()=>l});var n=a(67294),r=a(88746),o=a(6141),i=a(6832);const l=function(e){var t=e.to,a=e.children,l=(0,o.E)(),s=l.version,u=l.isLast;if((0,i.default)().siteConfig.presets[0][1].docs.disableVersioning)return n.createElement(r.default,{to:"/api/"+t},a);var p=s+"/";return"current"===s?p="next/":u&&(p=""),n.createElement(r.default,{to:"/api/"+p+t},a)}},26569:(e,t,a)=>{a.d(t,{B:()=>l,T:()=>i});var n=a(67294),r=a(88746),o="https://crawlee.dev",i=function(e){var t=e.to,a=e.children,i=e.version;return n.createElement(r.default,{href:o+"/api"+(i?"/"+i:"")+"/"+t},a)},l=function(e){var t=e.to,a=e.children;return n.createElement(r.default,{href:o+"/"+t},a)}},21685:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>y,contentTitle:()=>f,default:()=>N,frontMatter:()=>g,metadata:()=>k,toc:()=>b});var n=a(87462),r=a(63366),o=(a(67294),a(3905)),i=(a(68889),a(26569)),l=a(65559),s=a(30433),u=a(14563);const p='# Specify the base Docker image. You can read more about\n# the available images at https://crawlee.dev/docs/guides/docker-images\n# You can also use any other image from Docker Hub.\nFROM apify/actor-node:16\n\n# Copy just package.json and package-lock.json\n# to speed up the build using Docker layer cache.\nCOPY package*.json ./\n\n# Install NPM packages, skip optional and development dependencies to\n# keep the image small. Avoid logging too much and print the dependency\n# tree for debugging\nRUN npm --quiet set progress=false \\\n    && npm install --omit=dev --omit=optional \\\n    && echo "Installed NPM packages:" \\\n    && (npm list --omit=dev --all || true) \\\n    && echo "Node.js version:" \\\n    && node --version \\\n    && echo "NPM version:" \\\n    && npm --version\n\n# Next, copy the remaining files and directories with the source code.\n# Since we do this after NPM install, quick build will be really fast\n# for most source file changes.\nCOPY . ./\n\n\n# Run the image.\nCMD npm start --silent\n',c='# Specify the base Docker image. You can read more about\n# the available images at https://crawlee.dev/docs/guides/docker-images\n# You can also use any other image from Docker Hub.\nFROM apify/actor-node:16 AS builder\n\n# Copy just package.json and package-lock.json\n# to speed up the build using Docker layer cache.\nCOPY package*.json ./\n\n# Install all dependencies. Don\'t audit to speed up the installation.\nRUN npm install --include=dev --audit=false\n\n# Next, copy the source files using the user set\n# in the base image.\nCOPY . ./\n\n# Install all dependencies and build the project.\n# Don\'t audit to speed up the installation.\nRUN npm run build\n\n# Create final image\nFROM apify/actor-node:16\n\n# Copy only built JS files from builder image\nCOPY --from=builder /usr/src/app/dist ./dist\n\n# Copy just package.json and package-lock.json\n# to speed up the build using Docker layer cache.\nCOPY package*.json ./\n\n# Install NPM packages, skip optional and development dependencies to\n# keep the image small. Avoid logging too much and print the dependency\n# tree for debugging\nRUN npm --quiet set progress=false \\\n    && npm install --omit=dev --omit=optional \\\n    && echo "Installed NPM packages:" \\\n    && (npm list --omit=dev --all || true) \\\n    && echo "Node.js version:" \\\n    && node --version \\\n    && echo "NPM version:" \\\n    && npm --version\n\n# Next, copy the remaining files and directories with the source code.\n# Since we do this after NPM install, quick build will be really fast\n# for most source file changes.\nCOPY . ./\n\n\n# Run the image.\nCMD npm run start:prod --silent\n',d='# Specify the base Docker image. You can read more about\n# the available images at https://crawlee.dev/docs/guides/docker-images\n# You can also use any other image from Docker Hub.\nFROM apify/actor-node-playwright-chrome:16\n\n# Copy just package.json and package-lock.json\n# to speed up the build using Docker layer cache.\nCOPY --chown=myuser package*.json ./\n\n# Install NPM packages, skip optional and development dependencies to\n# keep the image small. Avoid logging too much and print the dependency\n# tree for debugging\nRUN npm --quiet set progress=false \\\n    && npm install --omit=dev --omit=optional \\\n    && echo "Installed NPM packages:" \\\n    && (npm list --omit=dev --all || true) \\\n    && echo "Node.js version:" \\\n    && node --version \\\n    && echo "NPM version:" \\\n    && npm --version\n\n# Next, copy the remaining files and directories with the source code.\n# Since we do this after NPM install, quick build will be really fast\n# for most source file changes.\nCOPY --chown=myuser . ./\n\n\n# Run the image.\nCMD npm start --silent\n',m='# Specify the base Docker image. You can read more about\n# the available images at https://crawlee.dev/docs/guides/docker-images\n# You can also use any other image from Docker Hub.\nFROM apify/actor-node-playwright-chrome:16 AS builder\n\n# Copy just package.json and package-lock.json\n# to speed up the build using Docker layer cache.\nCOPY --chown=myuser package*.json ./\n\n# Install all dependencies. Don\'t audit to speed up the installation.\nRUN npm install --include=dev --audit=false\n\n# Next, copy the source files using the user set\n# in the base image.\nCOPY --chown=myuser . ./\n\n# Install all dependencies and build the project.\n# Don\'t audit to speed up the installation.\nRUN npm run build\n\n# Create final image\nFROM apify/actor-node-playwright-chrome:16\n\n# Copy only built JS files from builder image\nCOPY --from=builder --chown=myuser /home/myuser/dist ./dist\n\n# Copy just package.json and package-lock.json\n# to speed up the build using Docker layer cache.\nCOPY --chown=myuser package*.json ./\n\n# Install NPM packages, skip optional and development dependencies to\n# keep the image small. Avoid logging too much and print the dependency\n# tree for debugging\nRUN npm --quiet set progress=false \\\n    && npm install --omit=dev --omit=optional \\\n    && echo "Installed NPM packages:" \\\n    && (npm list --omit=dev --all || true) \\\n    && echo "Node.js version:" \\\n    && node --version \\\n    && echo "NPM version:" \\\n    && npm --version\n\n# Next, copy the remaining files and directories with the source code.\n# Since we do this after NPM install, quick build will be really fast\n# for most source file changes.\nCOPY --chown=myuser . ./\n\n\n# Run the image. If you know you won\'t need headful browsers,\n# you can remove the XVFB start script for a micro perf gain.\nCMD ./start_xvfb_and_run_cmd.sh && npm run start:prod --silent\n';var h=["components"],g={id:"docker-images",title:"Running in Docker",description:"Example Docker images to run your crawlers"},f=void 0,k={unversionedId:"guides/docker-images",id:"guides/docker-images",title:"Running in Docker",description:"Example Docker images to run your crawlers",source:"@site/../docs/guides/docker_images.mdx",sourceDirName:"guides",slug:"/guides/docker-images",permalink:"/sdk/js/docs/next/guides/docker-images",draft:!1,tags:[],version:"current",lastUpdatedBy:"Martin Ad\xe1mek",lastUpdatedAt:1694001335,formattedLastUpdatedAt:"Sep 6, 2023",frontMatter:{id:"docker-images",title:"Running in Docker",description:"Example Docker images to run your crawlers"},sidebar:"docs",previous:{title:"TypeScript Actors",permalink:"/sdk/js/docs/next/guides/type-script-actor"},next:{title:"Examples",permalink:"/sdk/js/docs/next/examples"}},y={},b=[{value:"Overview",id:"overview",level:2},{value:"Versioning",id:"versioning",level:2},{value:"Node.js versioning",id:"nodejs-versioning",level:3},{value:"Automation library versioning",id:"automation-library-versioning",level:3},{value:"Pre-release tags",id:"pre-release-tags",level:3},{value:"Best practices",id:"best-practices",level:2},{value:"Warning about image size",id:"warning-about-image-size",level:3},{value:"Apify Docker Images",id:"apify-docker-images",level:2},{value:"actor-node",id:"actor-node",level:3},{value:"actor-node-puppeteer-chrome",id:"actor-node-puppeteer-chrome",level:3},{value:"actor-node-playwright",id:"actor-node-playwright",level:3},{value:"actor-node-playwright-chrome",id:"actor-node-playwright-chrome",level:3},{value:"actor-node-playwright-firefox",id:"actor-node-playwright-firefox",level:3},{value:"actor-node-playwright-webkit",id:"actor-node-playwright-webkit",level:3},{value:"Example Dockerfile",id:"example-dockerfile",level:2}],w={toc:b},v="wrapper";function N(e){var t=e.components,a=(0,r.Z)(e,h);return(0,o.kt)(v,(0,n.Z)({},w,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Running headless browsers in Docker requires a lot of setup to do it right. But there's no need to worry about that, because we already created base images that you can freely use. We use them every day on the ",(0,o.kt)("a",{parentName:"p",href:"./apify-platform",target:null,rel:null},"Apify Platform"),"."),(0,o.kt)("p",null,"All images can be found in their ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/apify/apify-actor-docker",target:"_blank",rel:"noopener"},"GitHub repo")," and in our ",(0,o.kt)("a",{parentName:"p",href:"https://hub.docker.com/orgs/apify",target:"_blank",rel:"noopener"},"DockerHub"),"."),(0,o.kt)("h2",{id:"overview"},"Overview"),(0,o.kt)("p",null,"Browsers are pretty big, so we try to provide a wide variety of images to suit the specific needs. Here's a full list of our Docker images."),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#actor-node",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"apify/actor-node"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#actor-node-puppeteer-chrome",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"apify/actor-node-puppeteer-chrome"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#actor-node-playwright",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"apify/actor-node-playwright"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#actor-node-playwright-chrome",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"apify/actor-node-playwright-chrome"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#actor-node-playwright-firefox",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"apify/actor-node-playwright-firefox"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#actor-node-playwright-webkit",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"apify/actor-node-playwright-webkit")))),(0,o.kt)("h2",{id:"versioning"},"Versioning"),(0,o.kt)("p",null,"Each image is tagged with up to 2 version tags, depending on the type of the image. One for Node.js version and second for pre-installed web automation library version. If you use the image name without a version tag, you'll always get the latest available version."),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"We recommend always using at least the Node.js version tag in production Dockerfiles. It will ensure that a future update of Node.js will not break our automations.")),(0,o.kt)("h3",{id:"nodejs-versioning"},"Node.js versioning"),(0,o.kt)("p",null,"Our images are built with multiple Node.js versions to ensure backwards compatibility. Currently, Node.js ",(0,o.kt)("strong",{parentName:"p"},"versions 16 and 18 are supported")," (legacy versions still exist, see DockerHub). To select the preferred version, use the appropriate number as the image tag."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"# Use Node.js 16\nFROM apify/actor-node:16\n")),(0,o.kt)("h3",{id:"automation-library-versioning"},"Automation library versioning"),(0,o.kt)("p",null,"Images that include a pre-installed automation library, which means all images that include ",(0,o.kt)("inlineCode",{parentName:"p"},"puppeteer")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"playwright")," in their name, are also tagged with the pre-installed version of the library. For example, ",(0,o.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome:16-13.7.0")," comes with Node.js 16 and Puppeteer v13.7.0. If you try to install a different version of Puppeteer into this image, you may run into compatibility issues, because the Chromium version bundled with ",(0,o.kt)("inlineCode",{parentName:"p"},"puppeteer")," will not match the version of Chromium that's pre-installed."),(0,o.kt)("p",null,"Similarly ",(0,o.kt)("inlineCode",{parentName:"p"},"apify/actor-node-playwright-firefox:14-1.21.1")," runs on Node.js 14 and is pre-installed with the Firefox version that comes with v1.21.1."),(0,o.kt)("p",null,"Installing ",(0,o.kt)("inlineCode",{parentName:"p"},"apify/actor-node-puppeteer-chrome")," (without a tag) will install the latest available version of Node.js and ",(0,o.kt)("inlineCode",{parentName:"p"},"puppeteer"),"."),(0,o.kt)("h3",{id:"pre-release-tags"},"Pre-release tags"),(0,o.kt)("p",null,"We also build pre-release versions of the images to test the changes we make. Those are typically denoted by a ",(0,o.kt)("inlineCode",{parentName:"p"},"beta")," suffix, but it can vary depending on our needs. If you need to try a pre-release version, you can do it like this:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"# Without library version.\nFROM apify/actor-node:16-beta\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"# With library version.\nFROM apify/actor-node-playwright-chrome:16-1.10.0-beta\n")),(0,o.kt)("h2",{id:"best-practices"},"Best practices"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Node.js version tag should ",(0,o.kt)("strong",{parentName:"li"},"always")," be used."),(0,o.kt)("li",{parentName:"ul"},"The automation library version tag should be used for ",(0,o.kt)("strong",{parentName:"li"},"added security"),"."),(0,o.kt)("li",{parentName:"ul"},"Asterisk ",(0,o.kt)("inlineCode",{parentName:"li"},"*")," should be used as the automation library version in our ",(0,o.kt)("inlineCode",{parentName:"li"},"package.json")," files.")),(0,o.kt)("p",null,"It makes sure the pre-installed version of Puppeteer or Playwright is not re-installed on build. This is important, because those libraries are only guaranteed to work with specific versions of browsers, and those browsers come pre-installed in the image."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"FROM apify/actor-node-playwright-chrome:16\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "dependencies": {\n        "crawlee": "^3.0.0",\n        "playwright": "*"\n    }\n}\n')),(0,o.kt)("h3",{id:"warning-about-image-size"},"Warning about image size"),(0,o.kt)("p",null,"Browsers are huge. If you don't need them all in your image, it's better to use a smaller image with only the one browser you need."),(0,o.kt)("p",null,"You should also be careful when installing new dependencies. Nothing prevents you from installing Playwright into the",(0,o.kt)("inlineCode",{parentName:"p"},"actor-node-puppeteer-chrome")," image, but the resulting image will be about 3 times larger and extremely slow to download and build."),(0,o.kt)("p",null,"When you use only what you need, you'll be rewarded with reasonable build and start times."),(0,o.kt)("h2",{id:"apify-docker-images"},"Apify Docker Images"),(0,o.kt)("h3",{id:"actor-node"},"actor-node"),(0,o.kt)("p",null,"This is the smallest image we have based on Alpine Linux. It does not include any browsers, and it's therefore best used with ",(0,o.kt)(i.T,{to:"cheerio-crawler/class/CheerioCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"CheerioCrawler")),". It benefits from lightning fast builds and container startups."),(0,o.kt)("p",null,"\u200b",(0,o.kt)(i.T,{to:"puppeteer-crawler/class/PuppeteerCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler")),", ",(0,o.kt)(i.T,{to:"playwright-crawler/class/PlaywrightCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PlaywrightCrawler"))," and other browser based features will ",(0,o.kt)("strong",{parentName:"p"},"NOT")," work with this image."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"FROM apify/actor-node:16\n")),(0,o.kt)("h3",{id:"actor-node-puppeteer-chrome"},"actor-node-puppeteer-chrome"),(0,o.kt)("p",null,"This image includes Puppeteer (Chromium) and the Chrome browser. It can be used with ",(0,o.kt)(i.T,{to:"cheerio-crawler/class/CheerioCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"CheerioCrawler"))," and ",(0,o.kt)(i.T,{to:"puppeteer-crawler/class/PuppeteerCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler")),", but ",(0,o.kt)("strong",{parentName:"p"},"NOT")," with ",(0,o.kt)(i.T,{to:"playwright-crawler/class/PlaywrightCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PlaywrightCrawler")),"."),(0,o.kt)("p",null,"The image supports XVFB by default, so you can run both ",(0,o.kt)("inlineCode",{parentName:"p"},"headless")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"headful")," browsers with it."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"FROM apify/actor-node-puppeteer-chrome:16\n")),(0,o.kt)("h3",{id:"actor-node-playwright"},"actor-node-playwright"),(0,o.kt)("p",null,"A very large and slow image that can run all Playwright browsers: Chromium, Chrome, Firefox, WebKit. Everything is installed. If you need to develop or test with multiple browsers, this is the image to choose, but in most cases, it's better to use the specialized images below."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"FROM apify/actor-node-playwright:16\n")),(0,o.kt)("h3",{id:"actor-node-playwright-chrome"},"actor-node-playwright-chrome"),(0,o.kt)("p",null,"Similar to ",(0,o.kt)("a",{parentName:"p",href:"#actor-node-puppeteer-chrome",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"actor-node-puppeteer-chrome")),", but for Playwright. You can run ",(0,o.kt)(i.T,{to:"cheerio-crawler/class/CheerioCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"CheerioCrawler"))," and ",(0,o.kt)(i.T,{to:"playwright-crawler/class/PlaywrightCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PlaywrightCrawler")),", but ",(0,o.kt)("strong",{parentName:"p"},"NOT")," ",(0,o.kt)(i.T,{to:"puppeteer-crawler/class/PuppeteerCrawler",mdxType:"CrawleeApiLink"},(0,o.kt)("inlineCode",{parentName:"p"},"PuppeteerCrawler")),"."),(0,o.kt)("p",null,"It uses the ",(0,o.kt)("a",{parentName:"p",href:"https://playwright.dev/docs/api/environment-variables/",target:"_blank",rel:"noopener"},(0,o.kt)("inlineCode",{parentName:"a"},"PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD"))," environment variable to block installation of more browsers into the image to keep it small. If you want more browsers, either use the ",(0,o.kt)("a",{parentName:"p",href:"#actor-node-playwright",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"actor-node-playwright"))," image override this env var."),(0,o.kt)("p",null,"The image supports XVFB by default, so we can run both ",(0,o.kt)("inlineCode",{parentName:"p"},"headless")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"headful")," browsers with it."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"FROM apify/actor-node-playwright-chrome:16\n")),(0,o.kt)("h3",{id:"actor-node-playwright-firefox"},"actor-node-playwright-firefox"),(0,o.kt)("p",null,"Same idea as ",(0,o.kt)("a",{parentName:"p",href:"#actor-node-playwright-chrome",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"actor-node-playwright-chrome")),", but with Firefox\npre-installed."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"FROM apify/actor-node-playwright-firefox:16\n")),(0,o.kt)("h3",{id:"actor-node-playwright-webkit"},"actor-node-playwright-webkit"),(0,o.kt)("p",null,"Same idea as ",(0,o.kt)("a",{parentName:"p",href:"#actor-node-playwright-chrome",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"actor-node-playwright-chrome")),", but with WebKit\npre-installed."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-dockerfile"},"FROM apify/actor-node-playwright-webkit:16\n")),(0,o.kt)("h2",{id:"example-dockerfile"},"Example Dockerfile"),(0,o.kt)("p",null,"To use the above images, it's necessary to have a ",(0,o.kt)("a",{parentName:"p",href:"https://docs.docker.com/engine/reference/builder/",target:"_blank",rel:"noopener"},(0,o.kt)("inlineCode",{parentName:"a"},"Dockerfile")),". You can either use this example, or bootstrap your projects with the ",(0,o.kt)(i.B,{to:"docs/introduction/setting-up",mdxType:"CrawleeLink"},"Crawlee CLI")," which automatically adds the correct Dockerfile into our project folder."),(0,o.kt)(l.Z,{mdxType:"Tabs"},(0,o.kt)(s.Z,{value:"node+js",label:"Node+JavaScript",mdxType:"TabItem"},(0,o.kt)(u.Z,{language:"dockerfile",mdxType:"CodeBlock"},p)),(0,o.kt)(s.Z,{value:"node+ts",label:"Node+TypeScript",mdxType:"TabItem"},(0,o.kt)(u.Z,{language:"dockerfile",mdxType:"CodeBlock"},c)),(0,o.kt)(s.Z,{value:"browser+js",label:"Browser+JavaScript",mdxType:"TabItem"},"This example is for Playwright. If you want to use Puppeteer, simply replace ",(0,o.kt)("b",null,"playwright"),"with ",(0,o.kt)("b",null,"puppeteer")," in the ",(0,o.kt)("code",null,"FROM")," declaration.",(0,o.kt)(u.Z,{language:"dockerfile",mdxType:"CodeBlock"},d)),(0,o.kt)(s.Z,{value:"browser+ts",label:"Browser+TypeScript",mdxType:"TabItem"},"This example is for Playwright. If you want to use Puppeteer, simply replace ",(0,o.kt)("b",null,"playwright"),"with ",(0,o.kt)("b",null,"puppeteer")," in both ",(0,o.kt)("code",null,"FROM")," declarations.",(0,o.kt)(u.Z,{language:"dockerfile",mdxType:"CodeBlock"},m))))}N.isMDXComponent=!0},3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>h});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),u=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},p=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=u(a),m=r,h=c["".concat(s,".").concat(m)]||c[m]||d[m]||o;return a?n.createElement(h,i(i({ref:t},p),{},{components:a})):n.createElement(h,i({ref:t},p))}));function h(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,i=new Array(o);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[c]="string"==typeof e?e:r,i[1]=l;for(var u=2;u<o;u++)i[u]=a[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}m.displayName="MDXCreateElement"}}]);