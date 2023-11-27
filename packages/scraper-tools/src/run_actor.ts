import log from '@apify/log';
import type { FinalStatistics } from '@crawlee/core';
import { Actor } from 'apify';

export interface CrawlerSetup {
    name: string;
    createCrawler: () => Promise<CommonCrawler>;
}

export type CrawlerSetupConstructor = new (input: any) => CrawlerSetup;

export interface CommonCrawler {
    run(): Promise<FinalStatistics>;
}

export function runActor(CrawlerSetup: CrawlerSetupConstructor) {
    void Actor.main(async () => {
        log.debug('Reading INPUT.');
        const input = await Actor.getInput();
        if (!input) throw new Error('INPUT cannot be empty!');

        // Get crawler setup and startup options.
        const setup = new CrawlerSetup(input);
        log.info(`Configuring ${setup.name}.`);
        const crawler = await setup.createCrawler();

        log.info('Configuration completed. Starting the scrape.');
        await crawler.run();
        log.info(`${setup.name} finished.`);
    });
}
