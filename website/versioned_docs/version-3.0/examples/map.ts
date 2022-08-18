import { Actor } from 'apify';

await Actor.init();

const dataset = await Actor.openDataset<{ headingCount: number }>();

// calling map function and filtering through mapped items
const moreThan5headers = (await dataset.map((item) => item.headingCount)).filter((count) => count > 5);

// saving result of map to default Key-value store
await Actor.setValue('pages_with_more_than_5_headers', moreThan5headers);

await Actor.exit();
