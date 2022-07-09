import { launchPuppeteer } from '@crawlee/puppeteer';
import { Browser, Page } from 'puppeteer';
import { createBundle } from '../src/internals/bundle.browser';

const NAMESPACE = 'Apify';

describe('Bundle', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await launchPuppeteer({ launchOptions: { headless: true } });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.evaluateOnNewDocument(createBundle, NAMESPACE);
    });

    afterEach(async () => {
        await page.close();
    });

    describe('Context', () => {
        const CONTEXT_OPTIONS = {
            crawlerSetup: {
                rawInput: '{}',
            },
            browserHandles: {
                apify: {},
                globalStore: {},
                log: {},
            },
            pageFunctionArguments: {
                request: {},
            },
        };

        beforeEach(async () => {
            await page.goto('about:chrome');
            await page.waitForFunction((namespace: string) => !!window[namespace], {}, NAMESPACE);
            await page.evaluate((namespace: string, contextOptions) => {
                window.contextInstance = window[namespace].createContext(contextOptions);
            }, NAMESPACE, CONTEXT_OPTIONS);
        });

        describe('waitFor', () => {
            it('should work with a number', async () => {
                const millis = await page.evaluate(async () => {
                    const ctx = window.contextInstance;
                    const start = Date.now();
                    await ctx.waitFor(10);
                    return Date.now() - start;
                });
                expect(millis).toBeGreaterThan(9);
            });

            it('should work with a selector', async () => {
                const millis = await page.evaluate(async () => {
                    const ctx = window.contextInstance;
                    const start = Date.now();
                    setTimeout(() => {
                        const el = document.createElement('div');
                        el.id = 'very-unique-id';
                        document.body.appendChild(el);
                    }, 10);
                    await ctx.waitFor('#very-unique-id');
                    return Date.now() - start;
                });
                expect(millis).toBeGreaterThan(9);
            });

            it('should work with a function', async () => {
                const millis = await page.evaluate(async () => {
                    const ctx = window.contextInstance;
                    let done = false;
                    const start = Date.now();
                    setTimeout(() => {
                        done = true;
                    }, 10);
                    await ctx.waitFor(() => done);
                    return Date.now() - start;
                });
                expect(millis).toBeGreaterThan(9);
            });
        });
    });
});
