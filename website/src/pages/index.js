import React from 'react';
import clsx from 'clsx';
import Admonition from '@theme/Admonition';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import ThemedImage from '@theme/ThemedImage';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

function Hero() {
    return (
        <header className={clsx('container', styles.heroBanner)}>
            <div className="row padding-horiz--md">
                <div className="col col--7">
                    <div className={clsx(styles.relative, 'row')}>
                        <div className="col">
                            <h1 className={styles.tagline}>
                                Apify SDK for JavaScript and Node.js
                            </h1>
                            <h1 className={styles.tagline}>
                                <span>Apify SDK</span> for <span>JavaScript</span> and <span>Node.js</span>
                            </h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <h2>Toolkit for building <a href="https://docs.apify.com/actors">Actors</a>—serverless microservices running (not only) on the Apify platform.</h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className={styles.heroButtons}>
                                <Link to="docs/guides/apify-platform" className={styles.getStarted}>Get started</Link>
                                <iframe src="https://ghbtns.com/github-btn.html?user=apify&repo=apify-sdk-js&type=star&count=true&size=large" frameBorder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.relative, 'col', 'col--5')}>
                    <div className={styles.logoBlur}>
                        <img src={useBaseUrl('/img/logo-blur.png')} className={clsx(styles.hideSmall)} />
                    </div>
                    <div className={styles.codeBlock}>
                        <CodeBlock className="language-bash">
                            npx apify-cli create my-crawler
                        </CodeBlock>
                    </div>
                </div>
            </div>
        </header>
    );
}

function Features() {
    return (
        <section className={clsx('container', styles.features)}>
            <div className="row">
                <div className="col text--center">
                    <h2>Apify SDK v3 is out 🚀<br /> What's new? Read below 👇</h2>
                </div>
            </div>
            <div className="row">
                <div className="col col--6">
                    <p>
                        Four years ago, Apify released its <b>open-source Node.js</b> library for web scraping and automation, <b>Apify SDK</b>.
                        It became popular among the community, but there was a problem. Despite being open-source, <b>the library's name
                        caused users to think its features were restricted to the Apify platform</b>, which was never the case.
                    </p>
                    <p>
                        With this in mind, we decided to split Apify SDK into two libraries,
                        <a href="https://crawlee.dev" target="_blank" rel="noreferrer"><b> Crawlee</b></a> and <b>Apify SDK v3</b>.
                        <b> Crawlee</b> will retain all the <b>crawling and scraping-related tools </b>
                        and will always strive to be the best web scraping library for its community.
                        At the same time, <b>Apify SDK</b> will continue to exist, but keep only the Apify-specific features
                        related to <b>building actors</b> on the <a href="https://apify.com" target="_blank" rel="noreferrer"> <b>Apify platform</b></a>.
                    </p>
                </div>
                <div className="col col--6 text--center">
                    <ThemedImage
                        sources={{
                            light: useBaseUrl('/img/sdk-split-light.png'),
                            dark: useBaseUrl('/img/sdk-split-dark.png'),
                        }}
                        className={clsx(styles.hideSmall)} />
                </div>
            </div>
        </section>
    );
}

const crawleeExample = `// Apify SDK v3 uses named exports instead of the Apify object.
// You can import Dataset, KeyValueStore and more.
import { Actor } from 'apify';
// We moved all the crawling components to Crawlee.
// See the documentation on https://crawlee.dev
import { PlaywrightCrawler } from 'crawlee';

// Initialize the actor on the platform. This function connects your
// actor to platform events, storages and API. It replaces Apify.main()
await Actor.init();

const crawler = new PlaywrightCrawler({
    // handle(Page|Request)Functions of all Crawlers
    // are now simply called a requestHandler.
    async requestHandler({ request, page, enqueueLinks }) {
        const title = await page.title();
        console.log(\`Title of $\{request.loadedUrl} is '$\{title}'\`);

        // Use Actor instead of the Apify object to save data.
        await Actor.pushData({ title, url: request.loadedUrl });

        // We simplified enqueuing links a lot, see the docs.
        // This way the function adds only links to same hostname.
        await enqueueLinks();
    }
});

// You can now add requests to the queue directly from the run function.
// No need to create an instance of the queue separately.
await crawler.run(['https://crawlee.dev']);

// This function disconnects the actor from the platform
// and optionally sends an exit message.
await Actor.exit();
`;

const standaloneExample = `import { Actor } from 'apify';

// Initialize the actor on the platform. This function connects your
// actor to platform events, storages and API. It replaces Apify.main()
await Actor.init();

const input = await Actor.getInput()

// Do something with the input in your own code.
const output = await magicallyCreateOutput(input)

await Actor.setValue('my-output', output);

// This function disconnects the actor from the platform
// and optionally sends an exit message.
await Actor.exit();
`;

function ActorExample() {
    return (
        <section className={clsx(styles.try, 'container')}>

            <h2 className="text--center">How it works now</h2>
            <div className="row">
                <div className="col">
                    <h3>Outside of the Apify platform</h3>
                </div>
            </div>
            <div className="row">
                <div className="col col--6">
                    <p>
                        If you want to use the <b>crawling functionality</b> of Apify SDK v2 outside of the Apify platform,
                        head to <a href="https://crawlee.dev" target="_blank" rel="noreferrer"><b> Crawlee documentation</b></a> to get started.
                        The interface is almost exactly the same as the original SDK, but we've made a lot of improvements under the hood
                        to improve the developer experience.
                    </p>
                </div>
                <div className="col col--6 padding-vert--lg">
                    <CodeBlock className="language-bash ">
                        npm install crawlee
                    </CodeBlock>
                </div>
            </div>
            <div className="row">
                <h3 className="col">On the Apify platform</h3>
            </div>
            <div className="row">
                <p className="col">
                    In <b>Apify SDK v2</b>, both the <b>crawling and actor building logic were mixed</b> together.
                    This made it easy to build crawlers on the Apify platform, but confusing to build anything else.
                    <b> Apify SDK v3 includes only the Apify platform specific functionality</b>. To build crawlers on the Apify
                    platform, you need to combine it with <a href="https://crawlee.dev" target="_blank" rel="noreferrer"><b>Crawlee</b></a>.
                    Or you can use it standalone for other projects.
                </p>
            </div>
            <div className="row">
                <div className="col">
                    <h3>Build a crawler like you're used to</h3>
                </div>
            </div>
            <div className="row">
                <p className="col col--6">
                    The following example shows how to build an <b>SDK-v2-like crawler on the Apify platform</b>.
                    To use <code>PlaywrightCrawler</code> you need to install 3 libraries. Apify SDK v3,
                    Crawlee and Playwright. In v2, you only needed to install Apify SDK v2 and Playwright.
                </p>
                <div className="col col--6 padding-vert--lg">
                    <CodeBlock className="language-bash">
                    npm install apify crawlee playwright
                    </CodeBlock>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Admonition type="caution" title="Don't forget about module imports">
                        To run the example, add a <code>"type": "module"</code> clause into your <code>package.json</code> or
                        copy it into a file with an <code>.mjs</code> suffix. This enables <code>import</code> statements in Node.js.
                        See <a href="https://nodejs.org/dist/latest-v16.x/docs/api/esm.html#enabling" target="_blank" rel="noreferrer">Node.js docs</a> for
                        more information.
                    </Admonition>
                    <CodeBlock language="javascript">
                        {crawleeExample}
                    </CodeBlock>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Admonition type="tip" title="upgrading guide">
                        <p>
                            For more information, see the
                            <a href="docs/upgrading/upgrading-to-v3" > upgrading guide</a> that explains all the changes in great detail.
                        </p>
                    </Admonition>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <h3>Build an actor without Crawlee</h3>
                </div>
            </div>
            <div className="row">
                <div className="col col--6">
                    <p>
                            If your actors are not crawlers, or you want to simply wrap existing code and turn it into
                            an actor on the Apify platform, you can do that with standalone Apify SDK v3.
                    </p>
                </div>
                <div className="col col--6">
                    <CodeBlock className="language-bash">
                            npm install apify
                    </CodeBlock>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CodeBlock language="javascript">
                        {standaloneExample}
                    </CodeBlock>
                </div>
            </div>
        </section>
    );
}

export default function Home() {
    const SvgLogo = require('@apify/docs-theme/static/img/apify_logo.svg').default;
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            description={siteConfig.description}>
            <Hero />
            <Features />
            <ActorExample />
            <div className="container">
                <div className="row">
                    <div className="col text--center padding-top--lg padding-bottom--xl">
                        <SvgLogo className={styles.bottomLogo} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
