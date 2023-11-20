import log from '@apify/log';
import { browserTools } from '@apify/scraper-tools';
import { launchPuppeteer, KeyValueStore } from 'crawlee';

describe('browserTools', () => {
    let browser: Awaited<ReturnType<typeof launchPuppeteer>>;

    beforeEach(async () => {
        browser = await launchPuppeteer({ launchOptions: { headless: true } });
    });

    afterEach(async () => {
        await browser.close();
    });

    describe('createBrowserHandle()', () => {
        it('should work', async () => {
            const page = await browser.newPage();
            const handle = await browserTools.createBrowserHandle(page, () => 42);
            const result = await page.evaluate((browserHandle: string) => {
                // @ts-expect-error We are not extending the window interface but we are extending the object
                return window[browserHandle]();
            }, handle);
            expect(result).toBe(42);
        });
    });

    describe('createBrowserHandlesForObject', () => {
        it('should work', async () => {
            const page = await browser.newPage();

            const instance = await KeyValueStore.open();
            const methods = ['getValue', 'setValue'] as const;

            const handlesMap = await browserTools.createBrowserHandlesForObject(page, instance, methods);

            expect(typeof handlesMap.getValue).toBe('object');
            expect(typeof handlesMap.getValue.value).toBe('string');
            expect(handlesMap.getValue.type).toBe('METHOD');
            expect(typeof handlesMap.setValue).toBe('object');
            expect(typeof handlesMap.setValue.value).toBe('string');
            expect(handlesMap.setValue.type).toBe('METHOD');
            expect(handlesMap.setValue.value).not.toStrictEqual(handlesMap.getValue.value);

            await page.evaluate(async (setValueHandle: string) => {
                // @ts-expect-error We are not extending the window interface but we are extending the object
                await window[setValueHandle]('123', 'hello', { contentType: 'text/plain' });
            }, handlesMap.setValue.value);
            const value = await instance.getValue('123');
            expect(value).toBe('hello');

            await instance.setValue('321', 'bye', { contentType: 'text/plain' });
            const valueFromBrowser = await page.evaluate(async (getValueHandle: string) => {
                // @ts-expect-error We are not extending the window interface but we are extending the object
                return window[getValueHandle]('321');
            }, handlesMap.getValue.value);
            expect(valueFromBrowser).toBe('bye');

            const nodeContext = {
                one: await instance.getValue('123'),
                three: await instance.getValue('321'),
            };

            const browserContext = await page.evaluate(async (gvh: string) => {
                return {
                    // @ts-expect-error We are not extending the window interface but we are extending the object
                    one: await window[gvh]('123'),
                    // @ts-expect-error We are not extending the window interface but we are extending the object
                    three: await window[gvh]('321'),
                };
            }, handlesMap.getValue.value);

            expect(nodeContext).toStrictEqual(browserContext);
        });
    });

    describe('dumpConsole()', () => {
        it('should work', async () => {
            let page = await browser.newPage();

            const debug = vitest.spyOn(log, 'debug');
            const info = vitest.spyOn(log, 'info');
            const warning = vitest.spyOn(log, 'warning');
            const error = vitest.spyOn(log, 'error');

            browserTools.dumpConsole(page);
            await page.evaluate(async () => {
                /* eslint-disable no-console */
                console.log('info');
                console.warn('warning');
                console.info('info');
                console.dir('info');
                console.error('error');
                console.debug('debug');

                await new Promise((r) => setTimeout(r, 10));
            });

            expect(debug).toBeCalledTimes(1);
            expect(debug).toBeCalledWith('debug');
            expect(info).toBeCalledTimes(3);
            expect(info).toBeCalledWith('info');
            expect(warning).toBeCalledTimes(1);
            expect(warning).toBeCalledWith('warning');
            expect(error).toBeCalledTimes(0);

            page = await browser.newPage();
            browserTools.dumpConsole(page, { logErrors: true });
            await page.evaluate(async () => {
                /* eslint-disable no-console */
                console.error('error');
                await new Promise((r) => setTimeout(r, 10));
            });

            expect(error).toBeCalledTimes(1);
            expect(error).toBeCalledWith('error');

            await browser.close();
        });
    });
});
