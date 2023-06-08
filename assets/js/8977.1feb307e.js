"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8977],{55132:(e,r,t)=>{t.d(r,{D:()=>l,f:()=>s});var a=t(67294),n=t(58494),o=Symbol("EmptyContext"),u=a.createContext(o);function l(e){var r=e.children,t=(0,a.useState)(null),n=t[0],o=t[1],l=(0,a.useMemo)((function(){return{expandedItem:n,setExpandedItem:o}}),[n]);return a.createElement(u.Provider,{value:l},r)}function s(){var e=(0,a.useContext)(u);if(e===o)throw new n.i6("DocSidebarItemsExpandedStateProvider");return e}},20883:(e,r,t)=>{t.d(r,{a:()=>u});var a=t(67294),n=t(63735),o=t(68265);function u(e){var r=e.threshold,t=(0,a.useState)(!1),u=t[0],l=t[1],s=(0,a.useRef)(!1),i=(0,n.Ct)(),c=i.startScroll,d=i.cancelScroll;return(0,n.RF)((function(e,t){var a=e.scrollY,n=null==t?void 0:t.scrollY;n&&(s.current?s.current=!1:a>=n?(d(),l(!1)):a<r?l(!1):a+window.innerHeight<document.documentElement.scrollHeight&&l(!0))})),(0,o.S)((function(e){e.location.hash&&(s.current=!0,l(!1))})),{shown:u,scrollToTop:function(){return c(0)}}}},83129:(e,r,t)=>{t.r(r),t.d(r,{Collapsible:()=>s.z,ErrorBoundaryError:()=>F.aG,ErrorBoundaryTryAgainButton:()=>F.Cw,ErrorCauseBoundary:()=>F.QW,HtmlClassNameProvider:()=>f.FG,NavbarSecondaryMenuFiller:()=>v.Zo,PageMetadata:()=>f.d,ReactContextError:()=>d.i6,SkipToContentFallbackId:()=>D.u,SkipToContentLink:()=>D.l,ThemeClassNames:()=>i.k,composeProviders:()=>d.Qc,createStorageSlot:()=>n.WA,duplicates:()=>y.l,filterDocCardListItems:()=>u.MN,isMultiColumnFooterLinks:()=>S,isRegexpStringMatch:()=>P.F,listStorageKeys:()=>n._f,listTagsByLetters:()=>b,prefersReducedMotion:()=>c.n,processAdmonitionProps:()=>k,translateTagsPageTitle:()=>h,uniq:()=>y.j,useCollapsible:()=>s.u,useColorMode:()=>m.I,useContextualSearchFilters:()=>o._q,useCurrentSidebarCategory:()=>u.jA,useDocsPreferredVersion:()=>T.J,useEvent:()=>d.zX,useIsomorphicLayoutEffect:()=>d.LI,usePluralForm:()=>l.c,usePrevious:()=>d.D9,usePrismTheme:()=>E.p,useSearchLinkCreator:()=>C.M,useSearchQueryString:()=>C.K,useStorageSlot:()=>n.Nk,useThemeConfig:()=>a.L,useWindowSize:()=>p.i});var a=t(96793),n=t(99200),o=t(39105),u=t(30161),l=t(57880),s=t(17940),i=t(18015),c=t(39657),d=t(58494),f=t(44873),m=t(70524),v=t(82306),p=t(94980),g=t(11614),h=function(){return(0,g.I)({id:"theme.tags.tagsPageTitle",message:"Tags",description:"The title of the tag list page"})};function b(e){var r={};return Object.values(e).forEach((function(e){var t=function(e){return e[0].toUpperCase()}(e.label);null!=r[t]||(r[t]=[]),r[t].push(e)})),Object.entries(r).sort((function(e,r){var t=e[0],a=r[0];return t.localeCompare(a)})).map((function(e){return{letter:e[0],tags:e[1].sort((function(e,r){return e.label.localeCompare(r.label)}))}}))}var C=t(9512);function S(e){return"title"in e[0]}var P=t(88648),y=t(20636),E=t(99401),T=t(4049),M=t(67294);function k(e){var r,t=function(e){var r=M.Children.toArray(e),t=r.find((function(e){var r;return M.isValidElement(e)&&"mdxAdmonitionTitle"===(null==(r=e.props)?void 0:r.mdxType)})),a=M.createElement(M.Fragment,null,r.filter((function(e){return e!==t})));return{mdxAdmonitionTitle:null==t?void 0:t.props.children,rest:a}}(e.children),a=t.mdxAdmonitionTitle,n=t.rest,o=null!=(r=e.title)?r:a;return Object.assign({},e,o&&{title:o},{children:n})}var D=t(66470),F=t(48348)},85582:(e,r,t)=>{t.r(r),t.d(r,{AnnouncementBarProvider:()=>v.pl,BlogPostProvider:()=>d,Collapsible:()=>a.Collapsible,ColorModeProvider:()=>b.S,DEFAULT_SEARCH_TAG:()=>P.HX,DocProvider:()=>l.b,DocSidebarItemsExpandedStateProvider:()=>n.D,DocsPreferredVersionContextProvider:()=>m.L5,DocsSidebarProvider:()=>u.b,DocsVersionProvider:()=>o.q,ErrorBoundaryError:()=>a.ErrorBoundaryError,ErrorBoundaryTryAgainButton:()=>a.ErrorBoundaryTryAgainButton,ErrorCauseBoundary:()=>a.ErrorCauseBoundary,HtmlClassNameProvider:()=>a.HtmlClassNameProvider,NavbarProvider:()=>w.V,NavbarSecondaryMenuFiller:()=>a.NavbarSecondaryMenuFiller,PageMetadata:()=>a.PageMetadata,PluginHtmlClassNameProvider:()=>V.VC,ReactContextError:()=>a.ReactContextError,ScrollControllerProvider:()=>F.OC,SkipToContentFallbackId:()=>a.SkipToContentFallbackId,SkipToContentLink:()=>a.SkipToContentLink,ThemeClassNames:()=>a.ThemeClassNames,composeProviders:()=>a.composeProviders,containsLineNumbers:()=>S.nt,createStorageSlot:()=>a.createStorageSlot,docVersionSearchTag:()=>P.os,duplicates:()=>a.duplicates,filterDocCardListItems:()=>a.filterDocCardListItems,findFirstCategoryLink:()=>y.Wl,findSidebarCategory:()=>y.em,getPrismCssVariables:()=>S.QC,isActiveSidebarItem:()=>y._F,isDocsPluginEnabled:()=>y.cE,isMultiColumnFooterLinks:()=>a.isMultiColumnFooterLinks,isRegexpStringMatch:()=>a.isRegexpStringMatch,isSamePath:()=>I.Mg,keyboardFocusedClassName:()=>x.h,listStorageKeys:()=>a.listStorageKeys,listTagsByLetters:()=>a.listTagsByLetters,parseCodeBlockTitle:()=>S.bc,parseLanguage:()=>S.Vo,parseLines:()=>S.nZ,prefersReducedMotion:()=>a.prefersReducedMotion,processAdmonitionProps:()=>a.processAdmonitionProps,splitNavbarItems:()=>w.A,translateTagsPageTitle:()=>a.translateTagsPageTitle,uniq:()=>a.uniq,useAlternatePageUtils:()=>C.l,useAnnouncementBar:()=>v.nT,useBackToTopButton:()=>_.a,useBlogPost:()=>f,useCodeWordWrap:()=>A.F,useCollapsible:()=>a.useCollapsible,useColorMode:()=>a.useColorMode,useContextualSearchFilters:()=>a.useContextualSearchFilters,useCurrentSidebarCategory:()=>a.useCurrentSidebarCategory,useDoc:()=>l.k,useDocById:()=>y.xz,useDocRouteMetadata:()=>y.hI,useDocSidebarItemsExpandedState:()=>n.f,useDocsPreferredVersion:()=>a.useDocsPreferredVersion,useDocsPreferredVersionByPluginId:()=>m.Oh,useDocsSidebar:()=>u.V,useDocsVersion:()=>o.E,useDocsVersionCandidates:()=>y.lO,useEvent:()=>a.useEvent,useFilteredAndTreeifiedTOC:()=>D.b,useHideableNavbar:()=>L.c,useHistoryPopHandler:()=>k.Rb,useHistorySelector:()=>k.xL,useHomePageRoute:()=>I.Ns,useIsomorphicLayoutEffect:()=>a.useIsomorphicLayoutEffect,useKeyboardNavigation:()=>x.t,useLayoutDoc:()=>y.vY,useLayoutDocsSidebar:()=>y.oz,useLocalPathname:()=>M.b,useLocationChange:()=>T.S,useLockBodyScroll:()=>N.N,useNavbarMobileSidebar:()=>g.e,useNavbarSecondaryMenu:()=>h.Y,usePluralForm:()=>a.usePluralForm,usePrevious:()=>a.usePrevious,usePrismTheme:()=>a.usePrismTheme,useQueryStringValue:()=>k._X,useScrollController:()=>F.sG,useScrollPosition:()=>F.RF,useScrollPositionBlocker:()=>F.o5,useSearchLinkCreator:()=>a.useSearchLinkCreator,useSearchQueryString:()=>a.useSearchQueryString,useSidebarBreadcrumbs:()=>y.s1,useSmoothScrollTo:()=>F.Ct,useStorageSlot:()=>a.useStorageSlot,useTOCHighlight:()=>B.S,useTabs:()=>p.Y,useThemeConfig:()=>a.useThemeConfig,useTitleFormatter:()=>E.p,useTreeifiedTOC:()=>D.a,useWindowSize:()=>a.useWindowSize});var a=t(83129),n=t(55132),o=t(6141),u=t(50003),l=t(2791),s=t(67294),i=t(58494),c=s.createContext(null);function d(e){var r=e.children,t=e.content,a=e.isBlogPostPage,n=function(e){var r=e.content,t=e.isBlogPostPage;return(0,s.useMemo)((function(){return{metadata:r.metadata,frontMatter:r.frontMatter,assets:r.assets,toc:r.toc,isBlogPostPage:t}}),[r,t])}({content:t,isBlogPostPage:void 0!==a&&a});return s.createElement(c.Provider,{value:n},r)}function f(){var e=(0,s.useContext)(c);if(null===e)throw new i.i6("BlogPostProvider");return e}var m=t(4049),v=t(69061),p=t(38224),g=t(35022),h=t(42819),b=t(70524),C=t(13156),S=t(96066),P=t(39105),y=t(30161),E=t(71427),T=t(68265),M=t(15320),k=t(34423),D=t(94462),F=t(63735),I=t(18407),V=t(44873),w=t(83459),B=t(78586),L=t(3199),x=t(22768),N=t(69322),A=t(93442),_=t(20883)},38224:(e,r,t)=>{t.d(r,{Y:()=>f});var a=t(67294),n=t(16550),o=t(34423),u=t(20636),l=t(99200);function s(e){return function(e){var r,t;return null!=(r=null==(t=a.Children.map(e,(function(e){if(!e||(0,a.isValidElement)(e)&&(r=e.props)&&"object"==typeof r&&"value"in r)return e;var r;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})))?void 0:t.filter(Boolean))?r:[]}(e).map((function(e){var r=e.props;return{value:r.value,label:r.label,attributes:r.attributes,default:r.default}}))}function i(e){var r=e.values,t=e.children;return(0,a.useMemo)((function(){var e=null!=r?r:s(t);return function(e){var r=(0,u.l)(e,(function(e,r){return e.value===r.value}));if(r.length>0)throw new Error('Docusaurus error: Duplicate values "'+r.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[r,t])}function c(e){var r=e.value;return e.tabValues.some((function(e){return e.value===r}))}function d(e){var r=e.queryString,t=void 0!==r&&r,u=e.groupId,l=(0,n.k6)(),s=function(e){var r=e.queryString,t=void 0!==r&&r,a=e.groupId;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!a)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=a?a:null}({queryString:t,groupId:u});return[(0,o._X)(s),(0,a.useCallback)((function(e){if(s){var r=new URLSearchParams(l.location.search);r.set(s,e),l.replace(Object.assign({},l.location,{search:r.toString()}))}}),[s,l])]}function f(e){var r,t,n,o,u=e.defaultValue,s=e.queryString,f=void 0!==s&&s,m=e.groupId,v=i(e),p=(0,a.useState)((function(){return function(e){var r,t=e.defaultValue,a=e.tabValues;if(0===a.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!c({value:t,tabValues:a}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+t+'" but none of its children has the corresponding value. Available values are: '+a.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return t}var n=null!=(r=a.find((function(e){return e.default})))?r:a[0];if(!n)throw new Error("Unexpected error: 0 tabValues");return n.value}({defaultValue:u,tabValues:v})})),g=p[0],h=p[1],b=d({queryString:f,groupId:m}),C=b[0],S=b[1],P=(r=function(e){return e?"docusaurus.tab."+e:null}({groupId:m}.groupId),t=(0,l.Nk)(r),n=t[0],o=t[1],[n,(0,a.useCallback)((function(e){r&&o.set(e)}),[r,o])]),y=P[0],E=P[1],T=function(){var e=null!=C?C:y;return c({value:e,tabValues:v})?e:null}();return(0,a.useLayoutEffect)((function(){T&&h(T)}),[T]),{selectedValue:g,selectValue:(0,a.useCallback)((function(e){if(!c({value:e,tabValues:v}))throw new Error("Can't select invalid tab value="+e);h(e),S(e),E(e)}),[S,E,v]),tabValues:v}}},57880:(e,r,t)=>{t.d(r,{c:()=>i});var a=t(67294),n=t(6832),o=["zero","one","two","few","many","other"];function u(e){return o.filter((function(r){return e.includes(r)}))}var l={locale:"en",pluralForms:u(["one","other"]),select:function(e){return 1===e?"one":"other"}};function s(){var e=(0,n.default)().i18n.currentLocale;return(0,a.useMemo)((function(){try{return r=e,t=new Intl.PluralRules(r),{locale:r,pluralForms:u(t.resolvedOptions().pluralCategories),select:function(e){return t.select(e)}}}catch(a){return console.error('Failed to use Intl.PluralRules for locale "'+e+'".\nDocusaurus will fallback to the default (English) implementation.\nError: '+a.message+"\n"),l}var r,t}),[e])}function i(){var e=s();return{selectMessage:function(r,t){return function(e,r,t){var a=e.split("|");if(1===a.length)return a[0];a.length>t.pluralForms.length&&console.error("For locale="+t.locale+", a maximum of "+t.pluralForms.length+" plural forms are expected ("+t.pluralForms.join(",")+"), but the message contains "+a.length+": "+e);var n=t.select(r),o=t.pluralForms.indexOf(n);return a[Math.min(o,a.length-1)]}(t,r,e)}}}},97878:(e,r,t)=>{Object.defineProperty(r,"__esModule",{value:!0});var a=t(67294).createContext({options:{banner:"",breadcrumbs:!0,gitRefName:"master",minimal:!1,pluginId:"default",scopes:[]},reflections:{}});r.ApiDataContext=a},28977:(e,r,t)=>{var a=t(67294),n=t(83129),o=t(36544),u=t(6724),l=t(42826),s=t(34055),i=t(42279),c=t(95967),d=t(86467),f=t(35634),m=t(29969),v=t(33669),p=function(e){return e&&e.__esModule?e:{default:e}},g=p(a),h=p(o),b=p(u),C=p(l),S=p(s),P=p(i),y=p(c),E=p(d);e.exports=function(e){var r,t,a=e.children,o=e.heading,u=e.pageMetadata,l=e.pagingMetadata,s=e.toc,i=n.useWindowSize(),c=f.useBreadcrumbs(),d=s.length>0,p=d&&("desktop"===i||"ssr"===i);return g.default.createElement(g.default.Fragment,null,u,g.default.createElement("div",{className:"row"},g.default.createElement("div",{className:"col apiItemCol"},g.default.createElement(v.VersionBanner,null),g.default.createElement("div",{className:"apiItemContainer"},g.default.createElement("article",null,c&&g.default.createElement(h.default,null),g.default.createElement(C.default,null),d&&g.default.createElement(E.default,{className:(null!=(r=n.ThemeClassNames.docs.docTocMobile)?r:"")+" apiTocMobile",maxHeadingLevel:6,minHeadingLevel:1,toc:s}),g.default.createElement("div",{className:(null!=(t=n.ThemeClassNames.docs.docMarkdown)?t:"")+" markdown"},g.default.createElement("header",null,g.default.createElement(S.default,{as:"h1"},o)),g.default.createElement(P.default,null,a)),g.default.createElement(m.Footer,null)),l&&g.default.createElement(b.default,l))),p&&g.default.createElement("div",{className:"col col--3"},g.default.createElement(y.default,{className:n.ThemeClassNames.docs.docTocDesktop,maxHeadingLevel:6,minHeadingLevel:1,toc:s}))))}},29969:(e,r,t)=>{Object.defineProperty(r,"__esModule",{value:!0});var a=function(e){return e&&e.__esModule?e:{default:e}}(t(67294));r.Footer=function(){return a.default.createElement("footer",{className:"tsd-footer"},"Powered by"," ",a.default.createElement("a",{href:"https://github.com/milesj/docusaurus-plugin-typedoc-api"},"docusaurus-plugin-typedoc-api")," ","and ",a.default.createElement("a",{href:"https://typedoc.org/"},"TypeDoc"))}},33669:(e,r,t)=>{Object.defineProperty(r,"__esModule",{value:!0});var a=t(67294),n=t(88746),o=t(29394),u=t(83129),l=t(85582),s=function(e){return e&&e.__esModule?e:{default:e}},i=s(a),c=s(n);r.VersionBanner=function(){var e=l.useDocsVersion(),r=e.banner,t=e.docs,n=e.pluginId,s=e.version,d=o.useDocVersionSuggestions(n).latestVersionSuggestion,f=u.useDocsPreferredVersion(n).savePreferredVersionName,m=a.useCallback((function(){f(d.name)}),[d.name,f]);if(!r||!d)return null;var v=t[d.label];return i.default.createElement("div",{className:u.ThemeClassNames.docs.docVersionBanner+" alert alert--warning margin-bottom--md",role:"alert"},i.default.createElement("div",null,"unreleased"===r&&i.default.createElement(i.default.Fragment,null,"This is documentation for an unreleased version."),"unmaintained"===r&&i.default.createElement(i.default.Fragment,null,"This is documentation for version ",i.default.createElement("b",null,s),".")," ","For the latest API, see version"," ",i.default.createElement("b",null,i.default.createElement(c.default,{to:v.id,onClick:m},v.title)),"."))}},35634:(e,r,t)=>{Object.defineProperty(r,"__esModule",{value:!0});var a=t(67294),n=t(97878);r.useBreadcrumbs=function(){return a.useContext(n.ApiDataContext).options.breadcrumbs}}}]);