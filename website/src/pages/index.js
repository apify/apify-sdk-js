import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import Hightlights from '../components/Highlights';

// function Hero() {
//     return (
//         <header className={clsx('hero container', styles.heroBanner)}>
//             <div className="container">
//                 <div className="row">
//                     <div className="col col--7">
//                         <div className="row">
//                             <p className={styles.tagline}>
//                                 The scalable <span>web crawling</span>,<br />
//                                 <span>scraping</span> and <span>automation library</span><br />
//                                 for JavaScript/Node.js
//                             </p>
//                         </div>
//                         <div className={styles.heroButtons}>
//                             <Link to="#try" className={styles.getStarted}>Try it out</Link>
//                             <Link to="docs/guides/getting-started" className={styles.seeExamples}>Get Started</Link>
//                             <Link to="docs/examples/basic-crawler" className={styles.seeExamples}>See examples</Link>
//                             <iframe src="https://ghbtns.com/github-btn.html?user=apify&repo=apify-ts&type=star&count=true&size=large" frameBorder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe>
//                         </div>
//                     </div>
//                     <div className="col col--5" style={{ textAlign: 'center' }}>
//                         <img src={require('../../static/img/API.png').default} className={clsx(styles.hideSmall)} />
//                     </div>
//                 </div>
//             </div>
//         </header>
//     );
// }
//
// function Features() {
//     return (
//         <section className={clsx('container', styles.features)}>
//             <div className="row">
//                 <div className="col col--6">
//                     <img src={require('../../static/img/chrome_scrape.gif').default} className={clsx(styles.hideSmall)} />
//                 </div>
//                 <div className="col col--4">
//                     <h2>Easy crawling</h2>
//                     <p>There are three main classes that you can use to start crawling the web in no time. Need to crawl plain HTML? Use the blazing fast CheerioCrawler. For complex websites that use React, Vue or other front-end javascript libraries and require JavaScript execution, spawn a headless browser with PlaywrightCrawler or PuppeteerCrawler.</p>
//                 </div>
//                 <div className="col col--2"></div>
//             </div>
//             <div className="row">
//                 <div className="col col--4">
//                     <h2>Powerful tools</h2>
//                     <p>All the crawlers are automatically scaled based on available system resources using the AutoscaledPool class. When you run your code on the Apify Platform, you can also take advantage of a pool of proxies to avoid detection. For data storage, you can use the Dataset, KeyValueStore and RequestQueue classes.</p>
//                 </div>
//                 <div className="col col--2"></div>
//                 <div className="col col--6">
//                     <img src={require('../../static/img/source_code.png').default} style={{ border: '1px solid white' }} className={clsx(styles.hideSmall)} />
//                 </div>
//             </div>
//         </section>
//     );
// }
//
// const example = `import { PuppeteerCrawler } from '@crawlee/puppeteer';
//
// const crawler = new PuppeteerCrawler({
//     async requestHandler({ request, page, enqueueLinks }) {
//         const title = await page.title();
//         ${'console.log(`Title of ${request.url}`: ${title});'}
//         await enqueueLinks();
//     },
// });
//
// await crawler.addRequests(['https://www.iana.org/']);
// await crawler.run();
// `;
//
// function ActorExample() {
//     return (
//         <section id="try" className="container">
//             <h2>Try it out</h2>
//             <p>Install Apify SDK into a Node.js project. You must have Node.js 16 or higher installed.</p>
//             <CodeBlock className="language-bash">
//                 npm install @crawlee/puppeteer puppeteer
//             </CodeBlock>
//             <p>Copy the following code into a file in the project, for example <code>main.mjs</code>:</p>
//             <CodeBlock className="language-typescript">
//                 {example}
//             </CodeBlock>
//             <p>Execute the following command in the project's folder and watch it recursively crawl IANA with Puppeteer and Chromium.</p>
//             <CodeBlock className="language-bash">
//                 node main.js
//             </CodeBlock>
//         </section>
//     );
// }

export default function Home() {
    const href = useBaseUrl('/api/apify');
    React.useEffect(() => {
        window.location.href = href;
    }, []);

    return null;
    // const { siteConfig } = useDocusaurusContext();
    // return (
    //     <Layout
    //         title={siteConfig.title}
    //         description="Description will go into a meta tag in <head />">
    //         <Hero />
    //         <Hightlights />
    //         <Features />
    //         <ActorExample />
    //     </Layout>
    // );
}

/* eslint-disable max-classes-per-file */
// /**
//  * Copyright (c) 2017-present, Facebook, Inc.
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  */
// import Layout from '@theme/Layout';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
//
// const React = require('react');
//
// const CompLibrary = {
//     Container: (props) => <div {...props}></div>,
//     GridBlock: (props) => <div {...props}></div>,
//     MarkdownBlock: (props) => <div {...props}></div>,
// };
//
// const { MarkdownBlock } = CompLibrary;
// /* Used to read markdown */
// const { Container } = CompLibrary;
// const { GridBlock } = CompLibrary;
//
// const siteConfig = require('../../docusaurus.config.js');
//
// function imgUrl(img) {
//     return `${siteConfig.baseUrl}img/${img}`;
// }
//
// function docUrl(doc, language) {
//     return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
// }
//
// function pageUrl(page, language) {
//     return siteConfig.baseUrl + (language ? `${language}/` : '') + page;
// }
//
// class Button extends React.Component {
//     render() {
//         return (
//             <div className="pluginWrapper buttonWrapper">
//                 <a
//                     className="button"
//                     href={this.props.href}
//                     target={this.props.target}
//                 >
//                     {this.props.children}
//                 </a>
//             </div>
//         );
//     }
// }
//
// Button.defaultProps = {
//     target: '_self',
// };
//
// const SplashContainer = (props) => (
//     <div className="homeContainer">
//         <div className="homeSplashFade">
//             <div className="wrapper homeWrapper">{props.children}</div>
//         </div>
//     </div>
// );
//
// const Logo = (props) => (
//     <div className="projectLogo">
//         <img src={props.img_src} alt="Project Logo" />
//     </div>
// );
//
// const ProjectTitle = () => (
//     <h2 className="projectTitle">
//         {siteConfig.title}
//         <small>{siteConfig.tagline}</small>
//     </h2>
// );
//
// const PromoSection = (props) => (
//     <div className="section promoSection">
//         <div className="promoRow">
//             <div className="pluginRowBlock">{props.children}</div>
//         </div>
//     </div>
// );
//
// class HomeSplash extends React.Component {
//     render() {
//         const language = this.props.language || '';
//         return (
//             <SplashContainer>
//                 {/* <Logo img_src={imgUrl('apify_logo.svg')}/> */}
//                 <div className="inner">
//                     <ProjectTitle />
//                     <PromoSection>
//                         <Button href="#try">Try It Out</Button>
//                         <Button
//                             href={docUrl('guides/getting-started', language)}
//                         >
//                             Learn the Basics
//                         </Button>
//                         <Button
//                             href={docUrl(
//                                 'examples/crawl-multiple-urls',
//                                 language
//                             )}
//                         >
//                             See Examples
//                         </Button>
//                         <Button
//                             href="https://apify.typeform.com/to/eV6Rqb"
//                             target="_blank"
//                         >
//                             Give Feedback
//                         </Button>
//                     </PromoSection>
//                 </div>
//                 <a
//                     className="github-button"
//                     href={this.props.config.customFields.repoUrl}
//                     data-icon="octicon-star"
//                     data-count-href="/apify/apify-js/stargazers"
//                     data-show-count="true"
//                     data-count-aria-label="# stargazers on GitHub"
//                     aria-label="Star Apify SDK on GitHub"
//                 >
//                     Star
//                 </a>
//             </SplashContainer>
//         );
//     }
// }
//
// const Block = (props) => (
//     <Container
//         padding={props.paddingBottomOnly ? ['bottom'] : ['bottom', 'top']}
//         id={props.id}
//         background={props.background}
//     >
//         <GridBlock
//             align={props.gridBlockAlign || 'center'}
//             contents={props.children}
//             layout={props.layout}
//         />
//     </Container>
// );
//
// const Features = () => (
//     <Block layout="fourColumn" paddingBottomOnly>
//         {[
//             {
//                 content:
//                     '**JavaScript** is the language of the web. Apify SDK builds on popular tools like [playwright](https://www.npmjs.com/package/playwright), ' +
//                     '[puppeteer](https://www.npmjs.com/package/puppeteer) and [cheerio](https://www.npmjs.com/package/cheerio), ' +
//                     'to deliver **large-scale high-performance** web scraping and crawling of any website.',
//                 image: imgUrl('javascript_logo.svg'),
//                 imageAlign: 'top',
//                 title: 'Runs on JavaScript',
//             },
//             {
//                 content:
//                     'Run **headless Chrome, Firefox, WebKit** or other browsers, manage **lists and queues** of URLs to crawl, ' +
//                     'run crawlers in **parallel** at maximum system capacity. ' +
//                     'Handle **storage and export** of results and rotate **proxies**.',
//                 image: imgUrl('robot.png'),
//                 imageAlign: 'top',
//                 title: 'Automates any web workflow',
//             },
//             {
//                 content:
//                     'Apify SDK can be used **stand-alone** on your own systems or it can run as a **serverless microservice on the Apify Platform**. ' +
//                     '[Get started with Apify Platform](https://console.apify.com/actors)',
//                 image: imgUrl('cloud_icon.svg'),
//                 imageAlign: 'top',
//                 title: 'Works on any system',
//             },
//         ]}
//     </Block>
// );
//
// const EasyCrawling = () => (
//     <Block background="light" gridBlockAlign="left">
//         {[
//             {
//                 content:
//                     'There are three main classes that you can use to start crawling the web in no time. ' +
//                     'Need to crawl plain HTML? Use the **blazing fast** [`CheerioCrawler`](docs/examples/cheerio-crawler).\n' +
//                     'For complex websites that use **React**, **Vue** or other front-end javascript libraries and require JavaScript execution, ' +
//                     'spawn a headless browser with [`PlaywrightCrawler`](docs/api/playwright-crawler) or ' +
//                     '[`PuppeteerCrawler`](docs/examples/puppeteer-crawler)',
//                 image: imgUrl('chrome_scrape.gif'),
//                 imageAlign: 'right',
//                 title: 'Easy crawling',
//             },
//         ]}
//     </Block>
// );
//
// const PowerfulTools = () => (
//     <Block gridBlockAlign="left">
//         {[
//             {
//                 content:
//                     'All the crawlers are automatically **scaled** based on available system resources using the [`AutoscaledPool`](docs/api/autoscaled-pool) class. ' +
//                     'When you run your code on the [Apify Platform](https://console.apify.com/actors), you can also take advantage of a [pool of proxies](https://apify.com/proxy) to avoid detection. ' +
//                     'For data storage, you can use the [`Dataset`](docs/api/dataset), [`KeyValueStore`](docs/api/key-value-store) and [`RequestQueue`](docs/api/request-queue) classes.',
//                 image: imgUrl('source_code.png'),
//                 imageAlign: 'left',
//                 title: 'Powerful tools',
//             },
//         ]}
//     </Block>
// );
//
// const TryOut = () => (
//     <Block id="try" background="light" gridBlockAlign="left">
//         {[
//             {
//                 content:
//                     'Install **Apify SDK** into a Node.js project. You must have Node.js 10 or higher installed.\n' +
//                     '```\n' +
//                     'npm install apify puppeteer\n' +
//                     '```\n' +
//                     'Copy the following code into a file in the project, for example `main.js`:\n' +
//                     '```\n' +
//                     "const Apify = require('apify');\n" +
//                     '\n' +
//                     'Apify.main(async () => {\n' +
//                     '    const requestQueue = await Apify.openRequestQueue();\n' +
//                     "    await requestQueue.addRequest({ url: 'https://www.iana.org/' });\n" +
//                     '\n' +
//                     '    const crawler = new Apify.PuppeteerCrawler({\n' +
//                     '        requestQueue,\n' +
//                     '        handlePageFunction: async ({ request, page }) => {\n' +
//                     '            const title = await page.title();\n' +
//                     '            console.log(`Title of ${request.url}: ${title}`);\n' +
//                     '            await Apify.utils.enqueueLinks({\n' +
//                     '               requestQueue,\n' +
//                     '               page,\n' +
//                     "               pseudoUrls: ['https://www.iana.org/[.*]'],\n" +
//                     '            });\n' +
//                     '        },\n' +
//                     '    });\n' +
//                     '\n' +
//                     '    await crawler.run();\n' +
//                     '});\n' +
//                     '```\n' +
//                     "Execute the following command in the project's folder and watch it recursively crawl " +
//                     '[IANA](https://www.iana.org) with Puppeteer and Chromium.\n' +
//                     '```\n' +
//                     'node main.js\n' +
//                     '```\n',
//                 // image: imgUrl('apify_logo.svg'),
//                 // imageAlign: 'right',
//                 title: 'Try it out',
//             },
//         ]}
//     </Block>
// );
//
// class Index extends React.Component {
//     render() {
//         const language = this.props.language || '';
//
//         return (
//             <div>
//                 <HomeSplash language={language} config={siteConfig} />
//                 <div className="mainContainer">
//                     <Features />
//                     <EasyCrawling />
//                     <PowerfulTools />
//                     <TryOut />
//                 </div>
//             </div>
//         );
//     }
// }
//
// export default (props) => (
//     <Layout>
//         <Index {...props} />
//     </Layout>
// );
