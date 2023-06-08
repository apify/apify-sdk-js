"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7470,2610,9514],{27865:(e,t,n)=>{n.r(t),n.d(t,{default:()=>Ce});var a=n(67294),r=n(86010),l=n(44873),o=n(18015),i=n(39105),c=n(30161),s=n(6141),d=n(50003),u=n(64153),m=n(11614),b=n(20883);const p={backToTopButton:"backToTopButton_sjWU",backToTopButtonShow:"backToTopButtonShow_xfvO"};function f(){var e=(0,b.a)({threshold:300}),t=e.shown,n=e.scrollToTop;return a.createElement("button",{"aria-label":(0,m.I)({id:"theme.BackToTopButton.buttonAriaLabel",message:"Scroll back to top",description:"The ARIA label for the back to top button"}),className:(0,r.Z)("clean-btn",o.k.common.backToTopButton,p.backToTopButton,t&&p.backToTopButtonShow),type:"button",onClick:n})}var v=n(39657),E=n(16550),h=n(94980),g=n(96793),_=n(66001),k=n(87462);function C(e){return a.createElement("svg",(0,k.Z)({width:"20",height:"20","aria-hidden":"true"},e),a.createElement("g",{fill:"#7a7a7a"},a.createElement("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),a.createElement("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})))}const I={collapseSidebarButton:"collapseSidebarButton_PEFL",collapseSidebarButtonIcon:"collapseSidebarButtonIcon_kv0_"};function S(e){var t=e.onClick;return a.createElement("button",{type:"button",title:(0,m.I)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,m.I)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,r.Z)("button button--secondary button--outline",I.collapseSidebarButton),onClick:t},a.createElement(C,{className:I.collapseSidebarButtonIcon}))}var y=n(69061),x=n(63735),N=n(63366),T=n(55132),Z=n(58494),B=n(17940),A=n(18407),w=n(88746),L=n(5730),M=["item","onItemClick","activePath","level","index"];function P(e){var t=e.categoryLabel,n=e.onClick;return a.createElement("button",{"aria-label":(0,m.I)({id:"theme.DocSidebarItem.toggleCollapsedCategoryAriaLabel",message:"Toggle the collapsible sidebar category '{label}'",description:"The ARIA label to toggle the collapsible sidebar category"},{label:t}),type:"button",className:"clean-btn menu__caret",onClick:n})}function H(e){var t=e.item,n=e.onItemClick,l=e.activePath,i=e.level,s=e.index,d=(0,N.Z)(e,M),u=t.items,m=t.label,b=t.collapsible,p=t.className,f=t.href,v=(0,g.L)().docs.sidebar.autoCollapseCategories,E=function(e){var t=(0,L.Z)();return(0,a.useMemo)((function(){return e.href?e.href:!t&&e.collapsible?(0,c.Wl)(e):void 0}),[e,t])}(t),h=(0,c._F)(t,l),_=(0,A.Mg)(f,l),C=(0,B.u)({initialState:function(){return!!b&&(!h&&t.collapsed)}}),I=C.collapsed,S=C.setCollapsed,y=(0,T.f)(),x=y.expandedItem,H=y.setExpandedItem,W=function(e){void 0===e&&(e=!I),H(e?null:s),S(e)};return function(e){var t=e.isActive,n=e.collapsed,r=e.updateCollapsed,l=(0,Z.D9)(t);(0,a.useEffect)((function(){t&&!l&&n&&r(!1)}),[t,l,n,r])}({isActive:h,collapsed:I,updateCollapsed:W}),(0,a.useEffect)((function(){b&&null!=x&&x!==s&&v&&S(!0)}),[b,x,s,S,v]),a.createElement("li",{className:(0,r.Z)(o.k.docs.docSidebarItemCategory,o.k.docs.docSidebarItemCategoryLevel(i),"menu__list-item",{"menu__list-item--collapsed":I},p)},a.createElement("div",{className:(0,r.Z)("menu__list-item-collapsible",{"menu__list-item-collapsible--active":_})},a.createElement(w.default,(0,k.Z)({className:(0,r.Z)("menu__link",{"menu__link--sublist":b,"menu__link--sublist-caret":!f&&b,"menu__link--active":h}),onClick:b?function(e){null==n||n(t),f?W(!1):(e.preventDefault(),W())}:function(){null==n||n(t)},"aria-current":_?"page":void 0,"aria-expanded":b?!I:void 0,href:b?null!=E?E:"#":E},d),m),f&&b&&a.createElement(P,{categoryLabel:m,onClick:function(e){e.preventDefault(),W()}})),a.createElement(B.z,{lazy:!0,as:"ul",className:"menu__list",collapsed:I},a.createElement(q,{items:u,tabIndex:I?-1:0,onItemClick:n,activePath:l,level:i+1})))}var W=n(6832),F=n(71699),D=n(43399);const O={menuExternalLink:"menuExternalLink_iHpy"};var j=["item","onItemClick","activePath","level","index"];function R(e){var t=e.item,n=e.onItemClick,l=e.activePath,i=e.level,s=(e.index,(0,N.Z)(e,j)),d=t.href,u=t.label,m=t.className,b=t.autoAddBaseUrl,p=(0,c._F)(t,l),f=(0,F.Z)(d),v=(0,W.default)().siteConfig.url;return d.startsWith(v)&&(s.target="_self"),a.createElement("li",{className:(0,r.Z)(o.k.docs.docSidebarItemLink,o.k.docs.docSidebarItemLinkLevel(i),"menu__list-item",m),key:u},a.createElement(w.default,(0,k.Z)({className:(0,r.Z)("menu__link",!f&&O.menuExternalLink,{"menu__link--active":p}),autoAddBaseUrl:b,"aria-current":p?"page":void 0,to:d},f&&{onClick:n?function(){return n(t)}:void 0},s),u,!f&&a.createElement(D.Z,null)))}const V={menuHtmlItem:"menuHtmlItem_M9Kj"};function z(e){var t=e.item,n=e.level,l=e.index,i=t.value,c=t.defaultStyle,s=t.className;return a.createElement("li",{className:(0,r.Z)(o.k.docs.docSidebarItemLink,o.k.docs.docSidebarItemLinkLevel(n),c&&[V.menuHtmlItem,"menu__list-item"],s),key:l,dangerouslySetInnerHTML:{__html:i}})}var U=["item"];function G(e){var t=e.item,n=(0,N.Z)(e,U);switch(t.type){case"category":return a.createElement(H,(0,k.Z)({item:t},n));case"html":return a.createElement(z,(0,k.Z)({item:t},n));default:return a.createElement(R,(0,k.Z)({item:t},n))}}var K=["items"];function Y(e){var t=e.items,n=(0,N.Z)(e,K);return a.createElement(T.D,null,t.map((function(e,t){return a.createElement(G,(0,k.Z)({key:t,item:e,index:t},n))})))}const q=(0,a.memo)(Y),X={menu:"menu_SIkG",menuWithAnnouncementBar:"menuWithAnnouncementBar_GW3s"};function J(e){var t=e.path,n=e.sidebar,l=e.className,i=function(){var e=(0,y.nT)().isActive,t=(0,a.useState)(e),n=t[0],r=t[1];return(0,x.RF)((function(t){var n=t.scrollY;e&&r(0===n)}),[e]),e&&n}();return a.createElement("nav",{"aria-label":(0,m.I)({id:"theme.docs.sidebar.navAriaLabel",message:"Docs sidebar",description:"The ARIA label for the sidebar navigation"}),className:(0,r.Z)("menu thin-scrollbar",X.menu,i&&X.menuWithAnnouncementBar,l)},a.createElement("ul",{className:(0,r.Z)(o.k.docs.docSidebarMenu,"menu__list")},a.createElement(q,{items:n,activePath:t,level:1})))}const Q="sidebar_njMd",$="sidebarWithHideableNavbar_wUlq",ee="sidebarHidden_VK0M",te="sidebarLogo_isFc";function ne(e){var t=e.path,n=e.sidebar,l=e.onCollapse,o=e.isHidden,i=(0,g.L)(),c=i.navbar.hideOnScroll,s=i.docs.sidebar.hideable;return a.createElement("div",{className:(0,r.Z)(Q,c&&$,o&&ee)},c&&a.createElement(_.Z,{tabIndex:-1,className:te}),a.createElement(J,{path:t,sidebar:n}),s&&a.createElement(S,{onClick:l}))}const ae=a.memo(ne);var re=n(82306),le=n(35022),oe=function(e){var t=e.sidebar,n=e.path,l=(0,le.e)();return a.createElement("ul",{className:(0,r.Z)(o.k.docs.docSidebarMenu,"menu__list")},a.createElement(q,{items:t,activePath:n,onItemClick:function(e){"category"===e.type&&e.href&&l.toggle(),"link"===e.type&&l.toggle()},level:1}))};function ie(e){return a.createElement(re.Zo,{component:oe,props:e})}const ce=a.memo(ie);function se(e){var t=(0,h.i)(),n="desktop"===t||"ssr"===t,r="mobile"===t;return a.createElement(a.Fragment,null,n&&a.createElement(ae,e),r&&a.createElement(ce,e))}const de={expandButton:"expandButton_m80_",expandButtonIcon:"expandButtonIcon_BlDH"};function ue(e){var t=e.toggleSidebar;return a.createElement("div",{className:de.expandButton,title:(0,m.I)({id:"theme.docs.sidebar.expandButtonTitle",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),"aria-label":(0,m.I)({id:"theme.docs.sidebar.expandButtonAriaLabel",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),tabIndex:0,role:"button",onKeyDown:t,onClick:t},a.createElement(C,{className:de.expandButtonIcon}))}const me={docSidebarContainer:"docSidebarContainer_b6E3",docSidebarContainerHidden:"docSidebarContainerHidden_b3ry",sidebarViewport:"sidebarViewport_Xe31"};function be(e){var t,n=e.children,r=(0,d.V)();return a.createElement(a.Fragment,{key:null!=(t=null==r?void 0:r.name)?t:"noSidebar"},n)}function pe(e){var t=e.sidebar,n=e.hiddenSidebarContainer,l=e.setHiddenSidebarContainer,i=(0,E.TH)().pathname,c=(0,a.useState)(!1),s=c[0],d=c[1],u=(0,a.useCallback)((function(){s&&d(!1),!s&&(0,v.n)()&&d(!0),l((function(e){return!e}))}),[l,s]);return a.createElement("aside",{className:(0,r.Z)(o.k.docs.docSidebarContainer,me.docSidebarContainer,n&&me.docSidebarContainerHidden),onTransitionEnd:function(e){e.currentTarget.classList.contains(me.docSidebarContainer)&&n&&d(!0)}},a.createElement(be,null,a.createElement("div",{className:(0,r.Z)(me.sidebarViewport,s&&me.sidebarViewportHidden)},a.createElement(se,{sidebar:t,path:i,onCollapse:u,isHidden:s}),s&&a.createElement(ue,{toggleSidebar:u}))))}const fe={docMainContainer:"docMainContainer_gTbr",docMainContainerEnhanced:"docMainContainerEnhanced_Uz_u",docItemWrapperEnhanced:"docItemWrapperEnhanced_czyv"};function ve(e){var t=e.hiddenSidebarContainer,n=e.children,l=(0,d.V)();return a.createElement("main",{className:(0,r.Z)(fe.docMainContainer,(t||!l)&&fe.docMainContainerEnhanced)},a.createElement("div",{className:(0,r.Z)("container padding-top--md padding-bottom--lg",fe.docItemWrapper,t&&fe.docItemWrapperEnhanced)},n))}const Ee={docPage:"docPage__5DB",docsWrapper:"docsWrapper_BCFX"};function he(e){var t=e.children,n=(0,d.V)(),r=(0,a.useState)(!1),l=r[0],o=r[1];return a.createElement(u.Z,{wrapperClassName:Ee.docsWrapper},a.createElement(f,null),a.createElement("div",{className:Ee.docPage},n&&a.createElement(pe,{sidebar:n.items,hiddenSidebarContainer:l,setHiddenSidebarContainer:o}),a.createElement(ve,{hiddenSidebarContainer:l},t)))}var ge=n(2610),_e=n(56449);function ke(e){var t=e.versionMetadata;return a.createElement(a.Fragment,null,a.createElement(_e.Z,{version:t.version,tag:(0,i.os)(t.pluginId,t.version)}),a.createElement(l.d,null,t.noIndex&&a.createElement("meta",{name:"robots",content:"noindex, nofollow"})))}function Ce(e){var t=e.versionMetadata,n=(0,c.hI)(e);if(!n)return a.createElement(ge.default,null);var i=n.docElement,u=n.sidebarName,m=n.sidebarItems;return a.createElement(a.Fragment,null,a.createElement(ke,e),a.createElement(l.FG,{className:(0,r.Z)(o.k.wrapper.docsPages,o.k.page.docsDocPage,e.versionMetadata.className)},a.createElement(s.q,{version:t},a.createElement(d.b,{name:u,items:m},a.createElement(he,null,i)))))}},55132:(e,t,n)=>{n.d(t,{D:()=>i,f:()=>c});var a=n(67294),r=n(58494),l=Symbol("EmptyContext"),o=a.createContext(l);function i(e){var t=e.children,n=(0,a.useState)(null),r=n[0],l=n[1],i=(0,a.useMemo)((function(){return{expandedItem:r,setExpandedItem:l}}),[r]);return a.createElement(o.Provider,{value:i},t)}function c(){var e=(0,a.useContext)(o);if(e===l)throw new r.i6("DocSidebarItemsExpandedStateProvider");return e}},20883:(e,t,n)=>{n.d(t,{a:()=>o});var a=n(67294),r=n(63735),l=n(68265);function o(e){var t=e.threshold,n=(0,a.useState)(!1),o=n[0],i=n[1],c=(0,a.useRef)(!1),s=(0,r.Ct)(),d=s.startScroll,u=s.cancelScroll;return(0,r.RF)((function(e,n){var a=e.scrollY,r=null==n?void 0:n.scrollY;r&&(c.current?c.current=!1:a>=r?(u(),i(!1)):a<t?i(!1):a+window.innerHeight<document.documentElement.scrollHeight&&i(!0))})),(0,l.S)((function(e){e.location.hash&&(c.current=!0,i(!1))})),{shown:o,scrollToTop:function(){return d(0)}}}},97878:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0});var a=n(67294).createContext({options:{banner:"",breadcrumbs:!0,gitRefName:"master",minimal:!1,pluginId:"default",scopes:[]},reflections:{}});t.ApiDataContext=a},87716:(e,t,n)=>{var a=["options","packages"];function r(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}n(20060),n(98878);var l=n(67294),o=n(27865),i=n(97878),c=function(e){return e&&e.__esModule?e:{default:e}},s=c(l),d=c(o);function u(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function m(e,t,n){return Object.entries(e).forEach((function(a){var r=a[0],l=a[1];if("id"===r){var o="type"in e;(!o||o&&"reference"!==e.type)&&(t[Number(l)]=e,n&&(e.parentId=n.id))}else Array.isArray(l)?l.forEach((function(n){u(n)&&m(n,t,e)})):u(l)&&m(l,t,e)})),t}function b(e){var t={};return e.forEach((function(e){e.entryPoints.forEach((function(e){m(e.reflection,t)}))})),t}e.exports=function(e){var t=e.options,n=e.packages,o=r(e,a),c=l.useMemo((function(){return{options:t,reflections:b(n)}}),[t,n]);return s.default.createElement(i.ApiDataContext.Provider,{value:c},s.default.createElement("div",{className:"apiPage"},s.default.createElement(d.default,o)))}},2610:(e,t,n)=>{n.r(t),n.d(t,{default:()=>o});var a=n(67294),r=n(44873),l=n(64153);function o(){return a.createElement(a.Fragment,null,a.createElement(r.d,{title:"Page Not Found"}),a.createElement(l.Z,null,a.createElement("main",{className:"container margin-vert--xl"},a.createElement("div",{className:"row"},a.createElement("div",{className:"col col--6 col--offset-3"},a.createElement("h1",{className:"hero__title"},"Page Not Found"),a.createElement("p",null,"We could not find what you were looking for \ud83d\ude22"))))))}},20060:(e,t,n)=>{n.r(t)},98878:(e,t,n)=>{n.r(t)}}]);