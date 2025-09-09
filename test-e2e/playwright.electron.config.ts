import { defineConfig } from '@playwright/test';
import { defineCucumber } from '../index';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: defineCucumber({
        config: 'test-e2e/config.ts',
        profile: 'electron'
    }),
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 2,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { open: 'never', outputFolder: 'report' }],
        ['junit', { outputFile: 'report/report.xml' }]
    ],
    expect: {
        timeout: 15000
    },

    use: {},

    /* Configure projects for major browsers */
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
