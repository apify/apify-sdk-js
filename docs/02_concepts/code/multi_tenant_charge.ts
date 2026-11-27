import { createServer } from 'node:http';

import { Actor } from 'apify';

await Actor.init();

const server = createServer(async (req, res) => {
    // The platform's readiness probe carries no request ID, so answer it without charging.
    if (req.headers['x-apify-container-server-readiness-probe']) {
        res.end('ok');
        return;
    }

    // highlight-start
    // The platform identifies the caller of each request with this header.
    // Pass it along so the charge lands on the caller's account.
    const requestId = req.headers['x-actor-request-id'] as string | undefined;
    await Actor.charge({ eventName: 'api-call', requestId });
    // highlight-end

    res.end('done');
});

server.listen(Actor.configuration.standbyPort);
