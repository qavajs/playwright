import { When } from '@qavajs/playwright-runner-adapter';
import { Route } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { MemoryValue } from './types';
import { responseBody } from './utils';

/**
 * Create simple mock instance
 * @param {string} urlTemplate - minimatch url template to mock
 * @param {string} memoryKey - memory key to store mock instance
 * @example When I create mock for '/yourservice/**' as 'mock1'
 * @example When I create mock for '$mockUrlTemplate' as 'mock1'
 */
When('I create mock for {value} as {value}', async function (urlTemplate: MemoryValue, memoryKey: MemoryValue) {
    const url = await urlTemplate.value();
    memoryKey.set(url);
});

async function respondWith(this: QavajsPlaywrightWorld, mockKey: MemoryValue, statusCode: MemoryValue, body: string): Promise<void> {
    const mockUrl: string = await mockKey.value();
    const statusCodeValue = await statusCode.value();
    const responseStatusCode: number = Number.parseInt(statusCodeValue, 10);
    if (Number.isNaN(responseStatusCode)) throw new Error(`Status code '${statusCodeValue}' is not a number`);
    const fulfillBody = responseBody(await this.value(body));
    await this.context.route(mockUrl, async (route: Route) => {
        await route.fulfill({
            ...fulfillBody,
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
When('I set {value} mock to respond {value} with:', respondWith);

/**
 * Add mocking rule to respond with desired status code and payload
 * Mock applies to all pages of current browser context
 * @param {string} mockKey - memory key to get mock instance
 * @param {string} statusCode - status code
 * @param {string} body - response body (objects and arrays are sent as json)
 * @example
 * When I create mock for '/yourservice/**' as 'myServiceMock'
 * And I set '$myServiceMock' mock to respond '200' with '$response'
 */
When('I set {value} mock to respond {value} with {string}', respondWith);

/**
 * Add mocking rule to abort request with certain reason
 * @param {string} mockKey - memory key to get mock instance
 * @param {string} reason - reason string see https://playwright.dev/docs/api/class-route#route-abort
 * @example
 * When I create mock for '/yourservice/**' as 'myServiceMock'
 * And I set '$myServiceMock' mock to abort with 'Failed' reason
 */
When('I set {value} mock to abort with {value} reason', async function (this: QavajsPlaywrightWorld, mockKey: MemoryValue, reason: MemoryValue) {
    const mockUrl: string = await mockKey.value();
    const errorCode: string = await reason.value();
    await this.context.route(mockUrl, async (route: Route) => {
        await route.abort(errorCode);
    });
});

/**
 * Restore mock
 * @param {string} mockKey - memory key to get mock instance
 * @example When I restore '$myServiceMock' mock
 */
When('I restore {value} mock', async function (this: QavajsPlaywrightWorld, mockKey: MemoryValue) {
    const mockUrl: string = await mockKey.value();
    await this.context.unroute(mockUrl);
});

/**
 * Restore all mocks
 * @example When I restore all mocks
 */
When('I restore all mocks', async function (this: QavajsPlaywrightWorld) {
    await this.context.unrouteAll();
});
