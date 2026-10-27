import { defineConfig } from '@playwright/test';
import { baseConfig, browserProject, webServer } from './playwright.base.config';

/**
 * Config for CI (runs steps from compiled package)
 */
export default defineConfig(baseConfig, {
    testMatch: 'e2e.config.ts',
    expect: {
        timeout: 15_000
    },
    webServer,
    projects: [ browserProject ]
});
