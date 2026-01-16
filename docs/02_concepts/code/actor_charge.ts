import { Actor } from 'apify';

await Actor.init();

// highlight-start
// Charge for a single occurence of an event
await Actor.charge({ eventName: 'init' });
// highlight-end

// Prepare some mock results
const result = [
    { word: 'Lorem' },
    { word: 'Ipsum' },
    { word: 'Dolor' },
    { word: 'Sit' },
    { word: 'Amet' },
];

// highlight-start
// Shortcut for charging for each pushed dataset item
await Actor.pushData(result, 'result-item');
// highlight-end

// highlight-start
// Or you can charge for a given number of events manually
await Actor.charge({
    eventName: 'result-item',
    count: result.length,
});
// highlight-end

await Actor.exit();
