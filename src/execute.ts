import { When } from '@cucumber/cucumber';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import {MemoryValue} from "./types";
import {Locator} from "@playwright/test";

/**
 * Execute client function
 * @param {string} functionKey - memory key of function
 * @example I execute '$fn' function // fn is function reference
 * @example I execute 'window.scrollBy(0, 100)' function
 */
When('I execute {value} function', async function (this: QavajsPlaywrightWorld, fn: MemoryValue) {
    await this.page.evaluate(await fn.value());
});

/**
 * Execute client function and save result into memory
 * @param {string} functionKey - memory key of function
 * @param {string} memoryKey - memory key to store result
 * @example I execute '$fn' function and save result as 'result' // fn is function reference
 * @example I execute 'window.scrollY' function and save result as 'scroll'
 */
When('I execute {value} function and save result as {value}', async function (this: QavajsPlaywrightWorld, fn: MemoryValue, memoryKey: MemoryValue) {
    memoryKey.set(await this.page.evaluate(await fn.value()));
});

/**
 * Execute client function on certain element
 * @param {string} functionKey - memory key of function
 * @param {string} alias - alias of target element
 * @example I execute '$fn' function on 'Component > Element' // fn is function reference
 * @example I execute 'arguments[0].scrollIntoView()' function on 'Component > Element'
 */
When('I execute {value} function on {locator}', async function (this: QavajsPlaywrightWorld, functionKey: MemoryValue, locator: Locator) {
    let fn = await functionKey.value();
    if (typeof fn === 'string') {
        fn = new Function('return ' + fn);
    }
    await locator.evaluate(fn);
});

/**
 * Execute client function on certain element
 * @param {string} functionKey - memory key of function
 * @param {string} alias - alias of target element
 * @example I execute '$fn' function on 'Component > Element' and save result as 'innerText' // fn is function reference
 * @example I execute 'arguments[0].innerText' function on 'Component > Element' and save result as 'innerText'
 */
When(
    'I execute {value} function on {locator} and save result as {value}',
    async function (this: QavajsPlaywrightWorld, functionKey: MemoryValue, locator: Locator, memoryKey: MemoryValue) {
        let fn = await functionKey.value();
        if (typeof fn === 'string') {
            fn = new Function('return ' + fn);
        }
        memoryKey.set(await locator.evaluate(fn));
    }
);
