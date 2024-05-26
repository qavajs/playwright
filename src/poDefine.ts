import { When } from '@cucumber/cucumber';
import { QavajsPlaywrightWorld } from './PlaywrightWorld';

/**
 * Register selector as page object
 * @param {string} selectorKey - selector to register
 * @param {string} aliasKey - alias of element
 * @example
 * When I define '#someId' as 'My Button' element
 * And I click 'My Button'
 *
 * When I define 'li.selected' as 'Selected Items' collection
 * And I expect number of element in 'Selected Items' collection to equal '3'
 */
When('I define {string} as {string} {poType}', async function (
    this: QavajsPlaywrightWorld, selectorKey: string, aliasKey: string, poType: string
) {
    const selector = await this.value(selectorKey);
    const alias = (await this.value(aliasKey)).replace(/\s/g, '');
    const defineElement = poType === 'element' ? this.$ : this.$$;
    this.po.register({ [alias]: defineElement(selector) });
});
