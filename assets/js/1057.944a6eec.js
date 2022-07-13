"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1057],{7684:(e,n,t)=>{t.r(n),t.d(n,{default:()=>b});var a=t(7462),r=t(7294),l=t(6010),i=t(3791),c=t(8596),s=t(5281),o=t(9960),m=t(4996),u=t(5999);function d(e){return r.createElement("svg",(0,a.Z)({viewBox:"0 0 24 24"},e),r.createElement("path",{d:"M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z",fill:"currentColor"}))}const v={breadcrumbsContainer:"breadcrumbsContainer_Z_bl",breadcrumbHomeIcon:"breadcrumbHomeIcon_OVgt"};function f(e){var n=e.children,t=e.href,a="breadcrumbs__link";return e.isLast?r.createElement("span",{className:a,itemProp:"name"},n):t?r.createElement(o.default,{className:a,href:t,itemProp:"item"},r.createElement("span",{itemProp:"name"},n)):r.createElement("span",{className:a},n)}function p(e){var n=e.children,t=e.active,i=e.index,c=e.addMicrodata;return r.createElement("li",(0,a.Z)({},c&&{itemScope:!0,itemProp:"itemListElement",itemType:"https://schema.org/ListItem"},{className:(0,l.Z)("breadcrumbs__item",{"breadcrumbs__item--active":t})}),n,r.createElement("meta",{itemProp:"position",content:String(i+1)}))}function h(){var e=(0,m.Z)("/");return r.createElement("li",{className:"breadcrumbs__item"},r.createElement(o.default,{"aria-label":(0,u.I)({id:"theme.docs.breadcrumbs.home",message:"Home page",description:"The ARIA label for the home page in the breadcrumbs"}),className:(0,l.Z)("breadcrumbs__link",v.breadcrumbsItemLink),href:e},r.createElement(d,{className:v.breadcrumbHomeIcon})))}function b(){var e=(0,i.s1)(),n=(0,c.Ns)();return e?r.createElement("nav",{className:(0,l.Z)(s.k.docs.docBreadcrumbs,v.breadcrumbsContainer),"aria-label":(0,u.I)({id:"theme.docs.breadcrumbs.navAriaLabel",message:"Breadcrumbs",description:"The ARIA label for the breadcrumbs"})},r.createElement("ul",{className:"breadcrumbs",itemScope:!0,itemType:"https://schema.org/BreadcrumbList"},n&&r.createElement(h,null),e.map((function(n,t){var a=t===e.length-1;return r.createElement(p,{key:t,active:a,index:t,addMicrodata:!!n.href},r.createElement(f,{href:n.href,isLast:a},n.label))})))):null}},4966:(e,n,t)=>{t.r(n),t.d(n,{default:()=>o});var a=t(7462),r=t(7294),l=t(5999),i=t(6010),c=t(9960);function s(e){var n=e.permalink,t=e.title,a=e.subLabel,l=e.isNext;return r.createElement(c.default,{className:(0,i.Z)("pagination-nav__link",l?"pagination-nav__link--next":"pagination-nav__link--prev"),to:n},a&&r.createElement("div",{className:"pagination-nav__sublabel"},a),r.createElement("div",{className:"pagination-nav__label"},t))}function o(e){var n=e.previous,t=e.next;return r.createElement("nav",{className:"pagination-nav docusaurus-mt-lg","aria-label":(0,l.I)({id:"theme.docs.paginator.navAriaLabel",message:"Docs pages navigation",description:"The ARIA label for the docs pagination"})},n&&r.createElement(s,(0,a.Z)({},n,{subLabel:r.createElement(l.Z,{id:"theme.docs.paginator.previous",description:"The label used to navigate to the previous doc"},"Previous")})),t&&r.createElement(s,(0,a.Z)({},t,{subLabel:r.createElement(l.Z,{id:"theme.docs.paginator.next",description:"The label used to navigate to the next doc"},"Next"),isNext:!0})))}},4364:(e,n,t)=>{t.r(n),t.d(n,{default:()=>s});var a=t(7294),r=t(6010),l=t(5999),i=t(4477),c=t(5281);function s(e){var n=e.className,t=(0,i.E)();return t.badge?a.createElement("span",{className:(0,r.Z)(n,c.k.docs.docVersionBadge,"badge badge--secondary")},a.createElement(l.Z,{id:"theme.docs.versionBadge.label",values:{versionLabel:t.label}},"Version: {versionLabel}")):null}},2503:(e,n,t)=>{t.r(n),t.d(n,{default:()=>d});var a=t(7462),r=t(3366),l=t(7294),i=t(6010),c=t(5999),s=t(6668);const o="anchorWithStickyNavbar_LWe7",m="anchorWithHideOnScrollNavbar_WYt5";var u=["as","id"];function d(e){var n=e.as,t=e.id,d=(0,r.Z)(e,u),v=(0,s.L)().navbar.hideOnScroll;return"h1"!==n&&t?l.createElement(n,(0,a.Z)({},d,{className:(0,i.Z)("anchor",v?m:o),id:t}),d.children,l.createElement("a",{className:"hash-link",href:"#"+t,title:(0,c.I)({id:"theme.common.headingLinkTitle",message:"Direct link to heading",description:"Title for link to heading"})},"\u200b")):l.createElement(n,(0,a.Z)({},d,{id:void 0}))}},2435:(e,n,t)=>{t.r(n),t.d(n,{default:()=>y});var a=t(7462),r=t(7294),l=t(3366),i=t(5742),c=["mdxType","originalType"];var s=t(1435);var o=t(9960);var m=t(6010),u=t(2389),d=t(6043);const v="details_lb9f",f="isBrowser_bmU9",p="collapsibleContent_i85q";var h=["summary","children"];function b(e){return!!e&&("SUMMARY"===e.tagName||b(e.parentElement))}function g(e,n){return!!e&&(e===n||g(e.parentElement,n))}function E(e){var n=e.summary,t=e.children,i=(0,l.Z)(e,h),c=(0,u.Z)(),s=(0,r.useRef)(null),o=(0,d.u)({initialState:!i.open}),E=o.collapsed,N=o.setCollapsed,L=(0,r.useState)(i.open),Z=L[0],_=L[1];return r.createElement("details",(0,a.Z)({},i,{ref:s,open:Z,"data-collapsed":E,className:(0,m.Z)(v,c&&f,i.className),onMouseDown:function(e){b(e.target)&&e.detail>1&&e.preventDefault()},onClick:function(e){e.stopPropagation();var n=e.target;b(n)&&g(n,s.current)&&(e.preventDefault(),E?(N(!1),_(!0)):N(!0))}}),null!=n?n:r.createElement("summary",null,"Details"),r.createElement(d.z,{lazy:!1,collapsed:E,disableSSRStyle:!0,onCollapseTransitionEnd:function(e){N(e),_(!e)}},r.createElement("div",{className:p},t)))}const N="details_b_Ee";function L(e){var n=Object.assign({},e);return r.createElement(E,(0,a.Z)({},n,{className:(0,m.Z)("alert alert--info",N,n.className)}))}var Z=t(2503);function _(e){return r.createElement(Z.default,e)}const C="containsTaskList_mC6p";const k="img_ev3q";const y={head:function(e){var n=r.Children.map(e.children,(function(e){return r.isValidElement(e)?function(e){var n;if(null!=(n=e.props)&&n.mdxType&&e.props.originalType){var t=e.props,a=(t.mdxType,t.originalType,(0,l.Z)(t,c));return r.createElement(e.props.originalType,a)}return e}(e):e}));return r.createElement(i.Z,e,n)},code:function(e){var n=["a","b","big","i","span","em","strong","sup","sub","small"];return r.Children.toArray(e.children).every((function(e){return"string"==typeof e&&!e.includes("\n")||(0,r.isValidElement)(e)&&n.includes(e.props.mdxType)}))?r.createElement("code",e):r.createElement(s.Z,e)},a:function(e){return r.createElement(o.default,e)},pre:function(e){var n;return r.createElement(s.Z,(0,r.isValidElement)(e.children)&&"code"===(null==(n=e.children.props)?void 0:n.originalType)?e.children.props:Object.assign({},e))},details:function(e){var n=r.Children.toArray(e.children),t=n.find((function(e){var n;return r.isValidElement(e)&&"summary"===(null==(n=e.props)?void 0:n.mdxType)})),l=r.createElement(r.Fragment,null,n.filter((function(e){return e!==t})));return r.createElement(L,(0,a.Z)({},e,{summary:t}),l)},ul:function(e){return r.createElement("ul",(0,a.Z)({},e,{className:(n=e.className,(0,m.Z)(n,(null==n?void 0:n.includes("contains-task-list"))&&C))}));var n},img:function(e){return r.createElement("img",(0,a.Z)({loading:"lazy"},e,{className:(n=e.className,(0,m.Z)(n,k))}));var n},h1:function(e){return r.createElement(_,(0,a.Z)({as:"h1"},e))},h2:function(e){return r.createElement(_,(0,a.Z)({as:"h2"},e))},h3:function(e){return r.createElement(_,(0,a.Z)({as:"h3"},e))},h4:function(e){return r.createElement(_,(0,a.Z)({as:"h4"},e))},h5:function(e){return r.createElement(_,(0,a.Z)({as:"h5"},e))},h6:function(e){return r.createElement(_,(0,a.Z)({as:"h6"},e))}}},9407:(e,n,t)=>{t.r(n),t.d(n,{default:()=>m});var a=t(7462),r=t(3366),l=t(7294),i=t(6010),c=t(8011);const s="tableOfContents_bqdL";var o=["className"];function m(e){var n=e.className,t=(0,r.Z)(e,o);return l.createElement("div",{className:(0,i.Z)(s,"thin-scrollbar",n)},l.createElement(c.Z,(0,a.Z)({},t,{linkClassName:"table-of-contents__link toc-highlight",linkActiveClassName:"table-of-contents__link--active"})))}},9286:(e,n,t)=>{t.r(n),t.d(n,{default:()=>b});var a=t(7294),r=t(6010),l=t(6043),i=t(8011),c=t(7462),s=t(3366),o=t(5999);const m="tocCollapsibleButton_TO0P",u="tocCollapsibleButtonExpanded_MG3E";var d=["collapsed"];function v(e){var n=e.collapsed,t=(0,s.Z)(e,d);return a.createElement("button",(0,c.Z)({type:"button"},t,{className:(0,r.Z)("clean-btn",m,!n&&u,t.className)}),a.createElement(o.Z,{id:"theme.TOCCollapsible.toggleButtonLabel",description:"The label used by the button on the collapsible TOC component"},"On this page"))}const f="tocCollapsible_ETCw",p="tocCollapsibleContent_vkbj",h="tocCollapsibleExpanded_sAul";function b(e){var n=e.toc,t=e.className,c=e.minHeadingLevel,s=e.maxHeadingLevel,o=(0,l.u)({initialState:!0}),m=o.collapsed,u=o.toggleCollapsed;return a.createElement("div",{className:(0,r.Z)(f,!m&&h,t)},a.createElement(v,{collapsed:m,onClick:u}),a.createElement(l.z,{lazy:!0,className:p,collapsed:m},a.createElement(i.Z,{toc:n,minHeadingLevel:c,maxHeadingLevel:s})))}},8011:(e,n,t)=>{t.d(n,{Z:()=>d});var a=t(7462),r=t(3366),l=t(7294),i=t(6668),c=t(9665),s=t(6841);function o(e){var n=e.toc,t=e.className,a=e.linkClassName,r=e.isChild;return n.length?l.createElement("ul",{className:r?void 0:t},n.map((function(e){return l.createElement("li",{key:e.id},l.createElement("a",{href:"#"+e.id,className:null!=a?a:void 0,dangerouslySetInnerHTML:{__html:e.value}}),l.createElement(o,{isChild:!0,toc:e.children,className:t,linkClassName:a}))}))):null}const m=l.memo(o);var u=["toc","className","linkClassName","linkActiveClassName","minHeadingLevel","maxHeadingLevel"];function d(e){var n=e.toc,t=e.className,o=void 0===t?"table-of-contents table-of-contents__left-border":t,d=e.linkClassName,v=void 0===d?"table-of-contents__link":d,f=e.linkActiveClassName,p=void 0===f?void 0:f,h=e.minHeadingLevel,b=e.maxHeadingLevel,g=(0,r.Z)(e,u),E=(0,i.L)(),N=null!=h?h:E.tableOfContents.minHeadingLevel,L=null!=b?b:E.tableOfContents.maxHeadingLevel,Z=(0,c.b)({toc:n,minHeadingLevel:N,maxHeadingLevel:L}),_=(0,l.useMemo)((function(){if(v&&p)return{linkClassName:v,linkActiveClassName:p,minHeadingLevel:N,maxHeadingLevel:L}}),[v,p,N,L]);return(0,s.S)(_),l.createElement(m,(0,a.Z)({toc:Z,className:o,linkClassName:v},g))}},6841:(e,n,t)=>{t.d(n,{S:()=>s});var a=t(7294),r=t(6668);function l(e){var n=e.getBoundingClientRect();return n.top===n.bottom?l(e.parentNode):n}function i(e,n){var t,a,r=n.anchorTopOffset,i=e.find((function(e){return l(e).top>=r}));return i?function(e){return e.top>0&&e.bottom<window.innerHeight/2}(l(i))?i:null!=(a=e[e.indexOf(i)-1])?a:null:null!=(t=e[e.length-1])?t:null}function c(){var e=(0,a.useRef)(0),n=(0,r.L)().navbar.hideOnScroll;return(0,a.useEffect)((function(){e.current=n?0:document.querySelector(".navbar").clientHeight}),[n]),e}function s(e){var n=(0,a.useRef)(void 0),t=c();(0,a.useEffect)((function(){if(!e)return function(){};var a=e.linkClassName,r=e.linkActiveClassName,l=e.minHeadingLevel,c=e.maxHeadingLevel;function s(){var e=function(e){return Array.from(document.getElementsByClassName(e))}(a),s=function(e){for(var n=e.minHeadingLevel,t=e.maxHeadingLevel,a=[],r=n;r<=t;r+=1)a.push("h"+r+".anchor");return Array.from(document.querySelectorAll(a.join()))}({minHeadingLevel:l,maxHeadingLevel:c}),o=i(s,{anchorTopOffset:t.current}),m=e.find((function(e){return o&&o.id===function(e){return decodeURIComponent(e.href.substring(e.href.indexOf("#")+1))}(e)}));e.forEach((function(e){!function(e,t){t?(n.current&&n.current!==e&&n.current.classList.remove(r),e.classList.add(r),n.current=e):e.classList.remove(r)}(e,e===m)}))}return document.addEventListener("scroll",s),document.addEventListener("resize",s),s(),function(){document.removeEventListener("scroll",s),document.removeEventListener("resize",s)}}),[e,t])}},9665:(e,n,t)=>{t.d(n,{a:()=>c,b:()=>o});var a=t(3366),r=t(7294),l=["parentIndex"];function i(e){var n=e.map((function(e){return Object.assign({},e,{parentIndex:-1,children:[]})})),t=Array(7).fill(-1);n.forEach((function(e,n){var a=t.slice(2,e.level);e.parentIndex=Math.max.apply(Math,a),t[e.level]=n}));var r=[];return n.forEach((function(e){var t=e.parentIndex,i=(0,a.Z)(e,l);t>=0?n[t].children.push(i):r.push(i)})),r}function c(e){return(0,r.useMemo)((function(){return i(e)}),[e])}function s(e){var n=e.toc,t=e.minHeadingLevel,a=e.maxHeadingLevel;return n.flatMap((function(e){var n=s({toc:e.children,minHeadingLevel:t,maxHeadingLevel:a});return function(e){return e.level>=t&&e.level<=a}(e)?[Object.assign({},e,{children:n})]:n}))}function o(e){var n=e.toc,t=e.minHeadingLevel,a=e.maxHeadingLevel;return(0,r.useMemo)((function(){return s({toc:i(n),minHeadingLevel:t,maxHeadingLevel:a})}),[n,t,a])}}}]);