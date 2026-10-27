import { When } from '@qavajs/playwright-runner-adapter';
import { sleep, tryThen } from './utils';
import type { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import type { Locator } from '@playwright/test';
import type { StateValidation, MemoryValue, Validation } from './types';

/** timeout of single condition check */
const timeout = 5_000;

const textOf = (locator: Locator) => locator.innerText({ timeout });
const valueOf = (locator: Locator) => locator.inputValue({ timeout });

/**
 * Repeat action until element matches state condition
 */
function untilState(world: QavajsPlaywrightWorld, action: () => Promise<unknown>, targetLocator: Locator, validation: StateValidation) {
    return tryThen(
        world.expect,
        () => validation(targetLocator, { timeout }),
        action
    );
}

/**
 * Repeat action until actual value of element matches expected value
 */
function untilValue(
    world: QavajsPlaywrightWorld,
    action: () => Promise<unknown>,
    getActual: () => Promise<unknown>,
    validation: Validation,
    expected: MemoryValue
) {
    return tryThen(
        world.expect,
        async () => validation(await getActual(), await expected.value()),
        action
    );
}

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
        await untilState(this, () => clickLocator.click(), targetLocator, validation);
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
        await untilValue(this, () => clickLocator.click(), () => textOf(targetLocator), validation, expected);
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
        await untilValue(this, () => clickLocator.click(), () => valueOf(targetLocator), validation, expected);
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
        await untilState(this, () => this.page.reload(), targetLocator, validation);
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
        await untilValue(this, () => this.page.reload(), () => textOf(targetLocator), validation, expected);
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
        await untilValue(this, () => this.page.reload(), () => valueOf(targetLocator), validation, expected);
    }
);
