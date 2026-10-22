import { When } from '@qavajs/playwright-runner-adapter';
import { sleep, tryThen } from './utils';
import type { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import type { Locator } from '@playwright/test';
import type { StateValidation, MemoryValue, Validation } from './types';

/** timeout of single condition check */
const timeout = 5_000;

/**
 * Explicit wait
 * @param {number} ms - milliseconds
 * @example I wait 1000 ms
 */
When('I wait {int} ms', async function (ms: number) {
    await sleep(ms);
});


/**
 * Click element until target element text matches condition
 * @param {Locator} clickLocator - element to click
 * @param {Locator} targetLocator - element to wait condition on
 * @param {StateValidation} validation - validation condition
 * @example I click 'Refresh Button' until 'Order Status' to be visible
 */
When(
    'I click {locator} until {locator} {state}',
    async function (this: QavajsPlaywrightWorld, clickLocator: Locator, targetLocator: Locator, validation: StateValidation) {
        await tryThen(
            this.expect,
            () => validation(targetLocator, { timeout }),
            () => clickLocator.click()
        );
    }
);

/**
 * Click element until text of target element matches expected condition
 * @param {Locator} clickLocator - element to click
 * @param {Locator} targetLocator - element to check text of
 * @param {Validation} validation - validation function (e.g. to be equal)
 * @param {MemoryValue} expected - expected value to compare
 * @example I click 'Refresh Button' until text of 'Order Status' to be equal 'Processing'
 */
When(
    'I click {locator} until text of {locator} {validation} {value}',
    async function (this: QavajsPlaywrightWorld, clickLocator: Locator, targetLocator: Locator, validation: Validation, expected: MemoryValue) {
        await tryThen(
            this.expect,
            async () => validation(await targetLocator.innerText({ timeout }), await expected.value()),
            () => clickLocator.click()
        );
    }
);

/**
 * Click element until value of target input matches expected condition
 * @param {Locator} clickLocator - element to click
 * @param {Locator} targetLocator - input element to check value of
 * @param {Validation} validation - validation function (e.g. to be equal)
 * @param {MemoryValue} expected - expected value to compare
 * @example I click 'Refresh Button' until value of 'Order Status Input' to be equal 'Processing'
 */
When(
    'I click {locator} until value of {locator} {validation} {value}',
    async function (this: QavajsPlaywrightWorld, clickLocator: Locator, targetLocator: Locator, validation: Validation, expected: MemoryValue) {
        await tryThen(
            this.expect,
            async () => validation(await targetLocator.inputValue({ timeout }), await expected.value()),
            () => clickLocator.click()
        );
    }
);

/**
 * Refresh page until target element matches state condition
 * @param {Locator} targetLocator - element to wait condition on
 * @param {StateValidation} validation - validation condition
 * @example I refresh page until 'Order Status' to be visible
 */
When(
    'I refresh page until {locator} {state}',
    async function (this: QavajsPlaywrightWorld, targetLocator: Locator, validation: StateValidation) {
        await tryThen(
            this.expect,
            () => validation(targetLocator, { timeout }),
            () => this.page.reload()
        );
    }
);

/**
 * Refresh page until text of target element matches expected condition
 * @param {Locator} targetLocator - element to check text of
 * @param {Validation} validation - validation function (e.g. to be equal)
 * @param {MemoryValue} expected - expected value to compare
 * @example I refresh page until text of 'Order Status' to be equal 'Processing'
 */
When(
    'I refresh page until text of {locator} {validation} {value}',
    async function (this: QavajsPlaywrightWorld, targetLocator: Locator, validation: Validation, expected: MemoryValue) {
        await tryThen(
            this.expect,
            async () => validation(await targetLocator.innerText({ timeout }), await expected.value()),
            () => this.page.reload()
        );
    }
);

/**
 * Refresh page until value of target input matches expected condition
 * @param {Locator} targetLocator - element to check input value of
 * @param {Validation} validation - validation function (e.g. to be equal)
 * @param {MemoryValue} expected - expected value to compare
 * @example I refresh page until value of 'Order Status Input' to be equal 'Processing'
 */
When(
    'I refresh page until value of {locator} {validation} {value}',
    async function (this: QavajsPlaywrightWorld, targetLocator: Locator, validation: Validation, expected: MemoryValue) {
        await tryThen(
            this.expect,
            async () => validation(await targetLocator.inputValue({ timeout }), await expected.value()),
            () => this.page.reload()
        );
    }
);
