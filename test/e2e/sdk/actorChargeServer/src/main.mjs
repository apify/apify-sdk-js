import { createServer } from 'node:http';

import { Actor } from 'apify';

await Actor.init();

const server = createServer(async (req, res) => {
    if (req.headers['x-apify-container-server-readiness-probe']) {
        res.end('ready');
        return;
    }

    const omitRequestId = new URL(req.url, 'http://localhost').searchParams.has('omitRequestId');
    const requestId = omitRequestId ? undefined : req.headers['x-actor-request-id'];
    const { isMultiTenant } = Actor.getChargingManager();
    res.setHeader('Content-Type', 'application/json');

    try {
        const { chargedCount } = await Actor.charge({ eventName: 'api-call', requestId });
        res.end(JSON.stringify({ isMultiTenant, chargedCount, requestId }));
    } catch (err) {
        res.end(JSON.stringify({ isMultiTenant, error: err.message }));
    }
});

server.listen(Actor.config.get('standbyPort'));
