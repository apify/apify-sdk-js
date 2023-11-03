"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4364],{13485:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>m,frontMatter:()=>d,metadata:()=>l,toc:()=>c});var n=a(87462),r=a(63366),o=(a(67294),a(3905)),s=["components"],d={id_old:"version-1.3-add-data-to-dataset",title:"Add data to dataset",id:"add-data-to-dataset"},i=void 0,l={unversionedId:"examples/add-data-to-dataset",id:"version-1.3/examples/add-data-to-dataset",title:"Add data to dataset",description:"This example saves data to the default dataset. If the dataset doesn't exist, it will be created. You can save data to custom datasets by using",source:"@site/versioned_docs/version-1.3/examples/add_data_to_dataset.md",sourceDirName:"examples",slug:"/examples/add-data-to-dataset",permalink:"/sdk/js/docs/1.3/examples/add-data-to-dataset",draft:!1,editUrl:"https://github.com/apify/apify-sdk-js/edit/master/website/versioned_docs/version-1.3/examples/add_data_to_dataset.md",tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1698960215,formattedLastUpdatedAt:"Nov 2, 2023",frontMatter:{id_old:"version-1.3-add-data-to-dataset",title:"Add data to dataset",id:"add-data-to-dataset"},sidebar:"version-1.3/docs",previous:{title:"Accept user input",permalink:"/sdk/js/docs/1.3/examples/accept-user-input"},next:{title:"Basic crawler",permalink:"/sdk/js/docs/1.3/examples/basic-crawler"}},p={},c=[],u={toc:c},f="wrapper";function m(e){var t=e.components,a=(0,r.Z)(e,s);return(0,o.kt)(f,(0,n.Z)({},u,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"This example saves data to the default dataset. If the dataset doesn't exist, it will be created. You can save data to custom datasets by using\n",(0,o.kt)("a",{parentName:"p",href:"../api/apify#opendataset",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Apify.openDataset()"))),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const Apify = require('apify');\n\nApify.main(async () => {\n    const requestList = await Apify.openRequestList('start-urls', [\n        { url: 'http://www.example.com/page-1' },\n        { url: 'http://www.example.com/page-2' },\n        { url: 'http://www.example.com/page-3' },\n    ]);\n\n    // Function called for each URL\n    const handlePageFunction = async ({ request, body }) => {\n        // Save data to default dataset\n        await Apify.pushData({\n            url: request.url,\n            html: body,\n        });\n    };\n\n    const crawler = new Apify.CheerioCrawler({\n        requestList,\n        handlePageFunction,\n    });\n\n    // Run the crawler\n    await crawler.run();\n});\n")),(0,o.kt)("p",null,"Each item in this dataset will be saved to its own file in the following directory:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"{PROJECT_FOLDER}/apify_storage/datasets/default/\n")))}m.isMDXComponent=!0},3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>m});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function s(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var i=n.createContext({}),l=function(e){var t=n.useContext(i),a=t;return e&&(a="function"==typeof e?e(t):s(s({},t),e)),a},p=function(e){var t=l(e.components);return n.createElement(i.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),c=l(a),f=r,m=c["".concat(i,".").concat(f)]||c[f]||u[f]||o;return a?n.createElement(m,s(s({ref:t},p),{},{components:a})):n.createElement(m,s({ref:t},p))}));function m(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,s=new Array(o);s[0]=f;var d={};for(var i in t)hasOwnProperty.call(t,i)&&(d[i]=t[i]);d.originalType=e,d[c]="string"==typeof e?e:r,s[1]=d;for(var l=2;l<o;l++)s[l]=a[l];return n.createElement.apply(null,s)}return n.createElement.apply(null,a)}f.displayName="MDXCreateElement"}}]);