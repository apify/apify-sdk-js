import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { pack, type Pack } from 'apify-test-tools/ad-hoc';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
    export interface ProvidedContext {
        packs: Pack[];
    }
}

/** Packs the SDK once per run; the tests pin their Actors to that tarball. Expects `pnpm build` to have run. */
export default async function setup(project: TestProject) {
    if (!process.env.TESTER_APIFY_TOKEN) {
        throw new Error('E2E tests need TESTER_APIFY_TOKEN');
    }
    project.provide('packs', await pack(process.cwd(), await mkdtemp(join(tmpdir(), 'apify-sdk-js-packs-'))));
}
