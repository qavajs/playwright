import { defineConfig } from '@playwright/test';
import { baseConfig, browserProject, webServer } from './playwright.base.config';

/**
 * Config for local debugging (runs steps from TypeScript sources)
 */
export default defineConfig(baseConfig, {
    testMatch: 'default.spec.ts',
    timeout: 15_000,
    expect: {
        timeout: 5_000,
        toPass: {
            timeout: 30_000,
            intervals: [ 5_000 ]
        }
    },
    webServer,
    projects: [ browserProject ]
});
