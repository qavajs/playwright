import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I expect viewport size to equal {string}', async function (expectedSize) {
    const expectedValue = await this.value(expectedSize);
    const actualValue = this.page.viewportSize();
    expect(actualValue).toEqual(expectedValue);
})
