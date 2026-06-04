import { Actor, ApifyClient, log } from 'apify';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const run = await client.run(process.env.ACTOR_RUN_ID).get();
const {
    value: { maxTotalChargeUsd },
} = await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('INPUT');

delete process.env.APIFY_IS_AT_HOME;
delete process.env.ACTOR_MAX_TOTAL_CHARGE_USD;

const actor = new Actor({
    useChargingLogDataset: true,
    testPayPerEvent: true,
    isAtHome: false,
    // The SDK treats `0`/unset as "no limit" — don't pass `Infinity`, which
    // isn't a valid config input (zod rejects non-finite numbers).
    maxTotalChargeUsd: maxTotalChargeUsd ?? 0,
    logLevel: 'DEBUG',
});

await actor.init();

const chargeResult = await actor.charge({
    eventName: 'foobar',
    count: 4,
});

log.info(`Charged: ${JSON.stringify(chargeResult)}`);

const chargingLogDataset = await actor.openDataset('charging_log');
const data = await chargingLogDataset.getData();

// Transfer contents of the local charging log dataset into the default dataset on the platform
await client.dataset(run.defaultDatasetId).pushItems(data.items);

await actor.exit();
