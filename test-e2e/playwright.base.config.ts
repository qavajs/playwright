import { defineConfig, devices } from '@playwright/test';

/**
 * Settings shared by all e2e configs.
 * See https://playwright.dev/docs/test-configuration.
 */
export const baseConfig = defineConfig({
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only, so flaky tests are visible locally */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { open: 'never', outputFolder: 'report' }],
        ['junit', { outputFile: 'report/report.xml' }],
        ['@qavajs/playwright-console-reporter']
    ],
});

/** Static server serving test apps */
export const webServer = {
    command: 'npx tsx support/server.ts',
    url: 'http://localhost:3000/storage.html',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
} as const;

export const browserProject = {
    name: 'browser',
    use: {
        ...devices['Desktop Chrome'],
        hasTouch: true
    },
};
