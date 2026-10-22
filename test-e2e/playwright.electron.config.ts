import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.base.config';

/**
 * Config for electron e2e tests
 */
export default defineConfig(baseConfig, {
    testMatch: 'electron.config.ts',
    expect: {
        timeout: 15_000
    },
    projects: [
        {
            name: 'electron',
            use: {
                launchOptions: {
                    args: [
                        'test-e2e/apps/electron/main.js',
                        '--no-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ],
                }
            },
        }
    ]
});
