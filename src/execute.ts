import { When } from '@cucumber/cucumber';
import { QavajsPlaywrightWorld } from './PlaywrightWorld';

/**
 * Execute client function
 * @param {string} functionKey - memory key of function
 * @example I execute '$fn' function // fn is function reference
 * @example I execute 'window.scrollBy(0, 100)' function
 */
When('I execute {string} function', async function (this: QavajsPlaywrightWorld, functionKey: string) {
    const fn = await this.value(functionKey);
    await this.page.evaluate(fn);
});

/**
 * Execute client function and save result into memory
 * @param {string} functionKey - memory key of function
 * @param {string} memoryKey - memory key to store result
 * @example I execute '$fn' function and save result as 'result' // fn is function reference
 * @example I execute 'window.scrollY' function and save result as 'scroll'
 */
When('I execute {string} function and save result as {string}', async function (this: QavajsPlaywrightWorld, functionKey, memoryKey) {
    const fn = await this.value(functionKey);
    this.setValue(memoryKey, await this.page.evaluate(fn));
});

/**
 * Execute client function on certain element
 * @param {string} functionKey - memory key of function
 * @param {string} alias - alias of target element
 * @example I execute '$fn' function on 'Component > Element' // fn is function reference
 * @example I execute 'arguments[0].scrollIntoView()' function on 'Component > Element'
 */
When('I execute {string} function on {string}', async function (this: QavajsPlaywrightWorld, functionKey, alias) {
    let fn = await this.value(functionKey);
    const element = await this.element(alias);
    if (typeof fn === 'string') {
        fn = new Function('return ' + fn);
    }
    await element.evaluate(fn);
});

/**
 * Execute client function on certain element
 * @param {string} functionKey - memory key of function
 * @param {string} alias - alias of target element
 * @example I execute '$fn' function on 'Component > Element' and save result as 'innerText' // fn is function reference
 * @example I execute 'arguments[0].innerText' function on 'Component > Element' and save result as 'innerText'
 */
When(
    'I execute {string} function on {string} and save result as {string}',
    async function (this: QavajsPlaywrightWorld, functionKey, alias, memoryKey) {
        let fn = await this.value(functionKey);
        if (typeof fn === 'string') {
            fn = new Function('return ' + fn);
        }
        const element = await this.element(alias);
        this.setValue(memoryKey, await element.evaluate(fn));
    }
);
