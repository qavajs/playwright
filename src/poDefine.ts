import { When } from '@qavajs/playwright-runner-adapter';
import { type MemoryValue } from './types';
import { locator } from './pageObject';

/**
 * Register selector as page object
 * @param {string} selectorKey - selector to register
 * @param {string} aliasKey - alias of element
 * @example
 * When I define '#someId' as 'My Button' locator
 * And I click 'My Button'
 */
When('I define {value} as {value} locator', async function (selectorKey: MemoryValue, aliasKey: MemoryValue) {
    const selector = await selectorKey.value();
    const alias = (await aliasKey.value()).replace(/\s/g, '');
    const pageObjectRef = this.config.pageObject.prototype ?? this.config.pageObject;
    pageObjectRef[alias] = locator(selector);
});
