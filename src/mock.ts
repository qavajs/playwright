import { When } from '@cucumber/cucumber';
import { Route } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';

/**
 * Create simple mock instance
 * @param {string} urlTemplate - minimatch url template to mock
 * @param {string} memoryKey - memory key to store mock instance
 * @example When I create mock for '/yourservice/**' as 'mock1'
 * @example When I create mock for '$mockUrlTemplate' as 'mock1'
 */
When('I create mock for {string} as {string}', async function (urlTemplate: string, memoryKey: string) {
    const url = await this.value(urlTemplate);
    this.setValue(memoryKey, url);
});

async function respondWith(this: QavajsPlaywrightWorld, mockKey: string, statusCode: string, body: string): Promise<void> {
    const mockUrl: string = await this.value(mockKey);
    const responseStatusCode: number = parseInt(await this.value(statusCode));
    const responseBody = await this.value(body);
    await this.page.route(mockUrl, async (route: Route) => {
        await route.fulfill({
            body: responseBody,
            status: responseStatusCode
        });
    });
}

/**
 * Add mocking rule to respond with desired status code and payload
 * @param {string} mockKey - memory key to get mock instance
 * @param {string} statusCode - status code
 * @param {string} body - response body
 * @example
 * When I create mock for '/yourservice/**' as 'myServiceMock'
 * And I set '$myServiceMock' mock to respond '200' with:
 * """
 * {
 *     "status": "success"
 * }
 * """
 */
When('I set {string} mock to respond {string} with:', respondWith);

/**
 * Add mocking rule to respond with desired status code and payload
 * @param {string} mockKey - memory key to get mock instance
 * @param {string} statusCode - status code
 * @param {string} body - response body
 * @example
 * When I create mock for '/yourservice/**' as 'myServiceMock'
 * And I set '$myServiceMock' mock to respond '200' with '$response'
 */
When('I set {string} mock to respond {string} with {string}', respondWith);

/**
 * Add mocking rule to abort request with certain reason
 * @param {string} mockKey - memory key to get mock instance
 * @param {string} reason - reason string see https://playwright.dev/docs/api/class-route#route-abort
 * @example
 * When I create mock for '/yourservice/**' as 'myServiceMock'
 * And I set '$myServiceMock' mock to abort with 'Failed' reason
 */
When('I set {string} mock to abort with {string} reason', async function (mockKey: string, reason: string) {
    const mockUrl: string = await this.value(mockKey);
    const errorCode: string = await this.value(reason);
    await this.page.route(mockUrl, async (route: Route) => {
        await route.abort(errorCode);
    });
});

/**
 * Restore mock
 * @param {string} mockKey - memory key to get mock instance
 * @example When I restore '$myServiceMock'
 */
When('I restore {string} mock', async function (mockKey: string) {
    const mockUrl: string = await this.value(mockKey);
    await this.page.unroute(mockUrl);
});

/**
 * Restore all mocks
 * @example When I restore all mocks
 */
When('I restore all mocks', async function () {
    //@ts-ignore
    this.page._routes = [];
});
