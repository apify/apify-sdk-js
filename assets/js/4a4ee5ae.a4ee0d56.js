"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8006],{3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>f});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function s(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var l=r.createContext({}),p=function(e){var t=r.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):s(s({},t),e)),a},u=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),c=p(a),f=n,h=c["".concat(l,".").concat(f)]||c[f]||d[f]||o;return a?r.createElement(h,s(s({ref:t},u),{},{components:a})):r.createElement(h,s({ref:t},u))}));function f(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,s=new Array(o);s[0]=c;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:n,s[1]=i;for(var p=2;p<o;p++)s[p]=a[p];return r.createElement.apply(null,s)}return r.createElement.apply(null,a)}c.displayName="MDXCreateElement"},36342:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>f,frontMatter:()=>i,metadata:()=>p,toc:()=>d});var r=a(87462),n=a(63366),o=(a(67294),a(3905)),s=["components"],i={id_old:"version-1.3-result-storage",title:"Result Storage",id:"result-storage"},l=void 0,p={unversionedId:"guides/result-storage",id:"version-1.3/guides/result-storage",title:"Result Storage",description:"The Apify SDK has several result storage types that are useful for specific tasks. The data is stored either on local disk to a directory defined by the",source:"@site/versioned_docs/version-1.3/guides/result_storage.md",sourceDirName:"guides",slug:"/guides/result-storage",permalink:"/sdk/js/docs/1.3/guides/result-storage",draft:!1,tags:[],version:"1.3",lastUpdatedBy:"renovate[bot]",lastUpdatedAt:1677464937,formattedLastUpdatedAt:"Feb 27, 2023",frontMatter:{id_old:"version-1.3-result-storage",title:"Result Storage",id:"result-storage"},sidebar:"version-1.3/docs",previous:{title:"Request Storage",permalink:"/sdk/js/docs/1.3/guides/request-storage"},next:{title:"Environment Variables",permalink:"/sdk/js/docs/1.3/guides/environment-variables"}},u={},d=[{value:"Key-value store",id:"key-value-store",level:2},{value:"Dataset",id:"dataset",level:2}],c={toc:d};function f(e){var t=e.components,a=(0,n.Z)(e,s);return(0,o.kt)("wrapper",(0,r.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"The Apify SDK has several result storage types that are useful for specific tasks. The data is stored either on local disk to a directory defined by the\n",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_LOCAL_STORAGE_DIR")," environment variable, or on the ",(0,o.kt)("a",{parentName:"p",href:"../guides/apify-platform",target:null,rel:null},"Apify platform")," under the user account\nidentified by the API token defined by the ",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_TOKEN")," environment variable. If neither of these variables is defined, by default Apify SDK sets\n",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_LOCAL_STORAGE_DIR")," to ",(0,o.kt)("inlineCode",{parentName:"p"},"./apify_storage")," in the current working directory and prints a warning."),(0,o.kt)("p",null,"Typically, you will be developing the code on your local computer and thus set the ",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_LOCAL_STORAGE_DIR")," environment variable. Once the code is\nready, you will deploy it to the Apify platform, where it will automatically set the ",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_TOKEN")," environment variable and thus use cloud storage. No\ncode changes are needed."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Related links")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://docs.apify.com/storage",target:"_blank",rel:"noopener"},"Apify platform storage documentation")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://my.apify.com/storage",target:"_blank",rel:"noopener"},"View storage in Apify app")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://apify.com/docs/api/v2#/reference/key-value-stores",target:"_blank",rel:"noopener"},"Key-value stores API reference")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://docs.apify.com/api/v2#/reference/datasets",target:"_blank",rel:"noopener"},"Datasets API reference"))),(0,o.kt)("h2",{id:"key-value-store"},"Key-value store"),(0,o.kt)("p",null,"The key-value store is used for saving and reading data records or files. Each data record is represented by a unique key and associated with a MIME\ncontent type. Key-value stores are ideal for saving screenshots of web pages, PDFs or to persist the state of crawlers."),(0,o.kt)("p",null,"Each actor run is associated with a ",(0,o.kt)("strong",{parentName:"p"},"default key-value store"),", which is created exclusively for the actor run. By convention, the actor run input\nand output is stored in the default key-value store under the ",(0,o.kt)("inlineCode",{parentName:"p"},"INPUT")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"OUTPUT")," key, respectively. Typically the input and output is a JSON file,\nalthough it can be any other format."),(0,o.kt)("p",null,"In the Apify SDK, the key-value store is represented by the ",(0,o.kt)("a",{parentName:"p",href:"../api/key-value-store",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"KeyValueStore"))," class. In order to simplify access to the default\nkey-value store, the SDK also provides ",(0,o.kt)("a",{parentName:"p",href:"../api/apify#getvalue",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Apify.getValue()"))," and\n",(0,o.kt)("a",{parentName:"p",href:"../api/apify#setvalue",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Apify.setValue()"))," functions."),(0,o.kt)("p",null,"In local configuration, the data is stored in the directory specified by the ",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_LOCAL_STORAGE_DIR")," environment variable as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"{APIFY_LOCAL_STORAGE_DIR}/key_value_stores/{STORE_ID}/{KEY}.{EXT}\n")),(0,o.kt)("p",null,"Note that ",(0,o.kt)("inlineCode",{parentName:"p"},"{STORE_ID}")," is the name or ID of the key-value store. The default key value store has ID ",(0,o.kt)("inlineCode",{parentName:"p"},"default"),", unless you override it by setting the\n",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_DEFAULT_KEY_VALUE_STORE_ID")," environment variable. The ",(0,o.kt)("inlineCode",{parentName:"p"},"{KEY}")," is the key of the record and ",(0,o.kt)("inlineCode",{parentName:"p"},"{EXT}")," corresponds to the MIME content type of the\ndata value."),(0,o.kt)("p",null,"The following code demonstrates basic operations of key-value stores:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"// Get actor input from the default key-value store\nconst input = await Apify.getInput();\n\n// Write actor output to the default key-value store.\nawait Apify.setValue('OUTPUT', { myResult: 123 });\n\n// Open a named key-value store\nconst store = await Apify.openKeyValueStore('some-name');\n\n// Write record. JavaScript object is automatically converted to JSON,\n// strings and binary buffers are stored as they are\nawait store.setValue('some-key', { foo: 'bar' });\n\n// Read record. Note that JSON is automatically parsed to a JavaScript object,\n// text data returned as a string and other data is returned as binary buffer\nconst value = await store.getValue('some-key');\n\n// Delete record\nawait store.setValue('some-key', null);\n")),(0,o.kt)("p",null,"To see a real-world example of how to get the input from the key-value store, see the ",(0,o.kt)("a",{parentName:"p",href:"../examples/screenshots",target:null,rel:null},"Screenshots")," example."),(0,o.kt)("h2",{id:"dataset"},"Dataset"),(0,o.kt)("p",null,"Datasets are used to store structured data where each object stored has the same attributes, such as online store products or real estate offers. You\ncan imagine a dataset as a table, where each object is a row and its attributes are columns. Dataset is an append-only storage - you can only add new\nrecords to it but you cannot modify or remove existing records."),(0,o.kt)("p",null,"When the dataset is stored on the ",(0,o.kt)("a",{parentName:"p",href:"../guides/apify-platform",target:null,rel:null},"Apify platform"),", you can export its data to the following formats: HTML,\nJSON, CSV, Excel, XML and RSS. The datasets are displayed on the actor run details page and in the\n",(0,o.kt)("a",{parentName:"p",href:"https://my.apify.com/storage",target:"_blank",rel:"noopener"},"Storage")," section in the Apify app. The actual data is exported using the\n",(0,o.kt)("a",{parentName:"p",href:"https://apify.com/docs/api/v2#/reference/datasets/item-collection/get-items",target:"_blank",rel:"noopener"},"Get dataset items")," Apify API endpoint. This\nway you can easily share crawling results."),(0,o.kt)("p",null,"Each actor run is associated with a ",(0,o.kt)("strong",{parentName:"p"},"default dataset"),", which is created exclusively for the actor run. Typically, it is used to store crawling\nresults specific for the actor run. Its usage is optional."),(0,o.kt)("p",null,"In the Apify SDK, the dataset is represented by the ",(0,o.kt)("a",{parentName:"p",href:"/sdk/js/docs/1.3/api/dataset",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Dataset"))," class. In order to simplify writes to the default dataset, the SDK\nalso provides the ",(0,o.kt)("a",{parentName:"p",href:"../api/apify#pushdata",target:null,rel:null},(0,o.kt)("inlineCode",{parentName:"a"},"Apify.pushData()"))," function."),(0,o.kt)("p",null,"In local configuration, the data is stored in the directory specified by the ",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_LOCAL_STORAGE_DIR")," environment variable as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"{APIFY_LOCAL_STORAGE_DIR}/datasets/{DATASET_ID}/{INDEX}.json\n")),(0,o.kt)("p",null,"Note that ",(0,o.kt)("inlineCode",{parentName:"p"},"{DATASET_ID}")," is the name or ID of the dataset. The default dataset has ID ",(0,o.kt)("inlineCode",{parentName:"p"},"default"),", unless you override it by setting the\n",(0,o.kt)("inlineCode",{parentName:"p"},"APIFY_DEFAULT_DATASET_ID")," environment variable. Each dataset item is stored as a separate JSON file, where ",(0,o.kt)("inlineCode",{parentName:"p"},"{INDEX}")," is a zero-based index of the\nitem in the dataset."),(0,o.kt)("p",null,"The following code demonstrates basic operations of the dataset:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"// Write a single row to the default dataset\nawait Apify.pushData({ col1: 123, col2: 'val2' });\n\n// Open a named dataset\nconst dataset = await Apify.openDataset('some-name');\n\n// Write a single row\nawait dataset.pushData({ foo: 'bar' });\n\n// Write multiple rows\nawait dataset.pushData([{ foo: 'bar2', col2: 'val2' }, { col3: 123 }]);\n")),(0,o.kt)("p",null,"To see how to use the dataset to store crawler results, see the ",(0,o.kt)("a",{parentName:"p",href:"../examples/cheerio-crawler",target:null,rel:null},"Cheerio Crawler")," example."))}f.isMDXComponent=!0}}]);