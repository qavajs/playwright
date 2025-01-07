import { DataTable, Then } from '@cucumber/cucumber';
import { Dialog, Locator } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { valueExpect } from './validationExpect';
import { dataTable2Array } from './utils/utils';
import { MemoryValue, StateValidation, Validation } from './types';

/**
 * Verify element condition
 * @param {string} alias - element to wait condition
 * @param {string} condition - wait condition
 * @example I expect 'Header' to be visible
 * @example I expect 'Loading' not to be present
 * @example I expect 'Search Bar > Submit Button' to be clickable
 */
Then('I expect {locator} {state}', async function (locator: Locator, expect: StateValidation) {
    await expect(locator);
});

/**
 * Verify that text of element satisfies condition
 * @param {string} alias - element to get text
 * @param {string} validationType - validation
 * @param {string} value - expected result
 * @example I expect text of '#1 of Search Results' equals to 'google'
 * @example I expect text of '#2 of Search Results' does not contain 'yahoo'
 */
Then(
    'I expect text of {locator} {validation} {value}',
    async function (this: QavajsPlaywrightWorld, locator: Locator, valueExpect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        const actualValue = () => locator.innerText();
        await valueExpect.poll(actualValue, expectedValue);
    }
);

/**
 * Verify value of element
 * @param {string} alias - element to verify
 * @param {string} validationType - validation
 * @param {string} value - expected value
 * @example I expect value of 'Search Input' to be equal 'text'
 */
Then(
    'I expect value of {locator} {validation} {value}',
    async function (locator: Locator, expect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        const actualValue = () => locator.evaluate(
            (node: any) => node.value
        );
        await expect.poll(actualValue, expectedValue);
    }
);

/**
 * Verify that property of element satisfies condition
 * @param {string} property - element to verify
 * @param {string} alias - element to verify
 * @param {string} validationType - validation
 * @param {string} value - expected value
 * @example I expect 'value' property of 'Search Input' to be equal 'text'
 * @example I expect 'innerHTML' property of 'Label' to contain '<b>'
 */
Then(
    'I expect {value} property of {locator} {validation} {value}',
    async function (property: MemoryValue, locator: Locator, expect: Validation, expected: MemoryValue) {
        const propertyName = await property.value();
        const expectedValue = await expected.value();
        const actualValue = () => locator.evaluate((node: any, propertyName: string) => node[propertyName], propertyName);
        await expect.poll(actualValue, expectedValue);
    }
);

/**
 * Verify that attribute of element satisfies condition
 * @param {string} attribute - element to verify
 * @param {string} alias - element to verify
 * @param {string} validationType - validation
 * @param {string} value - expected value
 * @example I expect 'href' attribute of 'Home Link' to contain '/home'
 */
Then(
    'I expect {value} attribute of {locator} {validation} {value}',
    async function (attribute: MemoryValue, locator: Locator, expect: Validation, expected: MemoryValue) {
        const attributeName = await attribute.value();
        const expectedValue = await expected.value();
        const actualValue = () => locator.getAttribute(attributeName);
        await expect.poll(actualValue, expectedValue);
    }
);

/**
 * Verify that current url satisfies condition
 * @param {string} validationType - validation
 * @param {string} expected - expected value
 * @example I expect current url contains 'wikipedia'
 * @example I expect current url equals 'https://wikipedia.org'
 */
Then(
    'I expect current url {validation} {value}',
    async function (expect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        const actualValue = () => this.page.url();
        await expect.poll(actualValue, expectedValue);
    }
);

/**
 * Verify that number of element in collection satisfies condition
 * @param {string} alias - collection to verify
 * @param {string} validationType - validation
 * @param {string} value - expected value
 * @example I expect number of elements in 'Search Results' collection to be equal '50'
 * @example I expect number of elements in 'Search Results' collection to be above '49'
 * @example I expect number of elements in 'Search Results' collection to be below '51'
 */
Then(
    'I expect number of elements in {locator} collection {validation} {value}',
    async function (locator: Locator, expect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        const actualValue = () => locator.count();
        await expect.poll(actualValue, expectedValue);
    }
);

/**
 * Verify that page title satisfies condition
 * @param {string} validationType - validation
 * @param {string} expected - expected value
 * @example I expect page title equals 'Wikipedia'
 */
Then(
    'I expect page title {validation} {value}',
    async function (expect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        const actualValue = () => this.page.title();
        await expect.poll(actualValue, expectedValue);

    }
);

/**
 * Verify collection condition
 * @param {string} alias - collection to wait condition
 * @param {string} condition - wait condition
 * @example I expect every element in 'Header > Links' collection to be visible
 * @example I expect every element in 'Loading Bars' collection not to be present
 */
Then('I expect every element in {locator} collection {state}', async function (collection: Locator, expect: StateValidation) {
    for (let i = 0; i < await collection.count(); i++) {
        const element = collection.nth(i);
        await expect(element);
    }
});

/**
 * Verify that all texts in collection satisfy condition
 * @param {string} alias - collection to get texts
 * @param {string} validationType - validation
 * @param {string} value - expected result
 * @example I expect text of every element in 'Search Results' collection equals to 'google'
 * @example I expect text of every element in 'Search Results' collection does not contain 'google'
 */
Then(
    'I expect text of every element in {locator} collection {validation} {value}',
    async function (collection: Locator, expect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        for (let i = 0; i < await collection.count(); i++) {
            const actualValue = () => collection.nth(i).innerText();
            await expect.poll(actualValue, expectedValue);
        }
    }
);

/**
 * Verify that all particular attributes in collection satisfy condition
 * @param {string} alias - collection to get attrs
 * @param {string} validationType - validation
 * @param {string} value - expected result
 * @example I expect 'href' attribute of every element in 'Search Results' collection to contain 'google'
 */
Then(
    'I expect {value} attribute of every element in {locator} collection {validation} {value}',
    async function (attribute: MemoryValue, collection: Locator, expect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        const attributeName = await attribute.value();
        for (let i = 0; i < await collection.count(); i++) {
            const actualValue = () => collection.nth(i).getAttribute(attributeName);
            await expect.poll(actualValue, expectedValue);
        }
    }
);

/**
 * Verify that all particular properties in collection satisfy condition
 * @param {string} alias - collection to get props
 * @param {string} validationType - validation
 * @param {string} value - expected result
 * @example I expect 'href' property of every element in 'Search Results' collection to contain 'google'
 */
Then(
    'I expect {value} property of every element in {locator} collection {validation} {value}',
    async function (property: MemoryValue, collection: Locator, expect: Validation, expected: MemoryValue) {
        const expectedValue = await expected.value();
        const propertyName = await property.value();
        for (let i = 0; i < await collection.count(); i++) {
            const actualValue = () => collection.nth(i).evaluate(
                (node: any, property: string) => node[property], propertyName
            );
            await expect.poll(actualValue, expectedValue);
        }
    }
);

/**
 * Verify that css property of element satisfies condition
 * @param {string} property - element to verify
 * @param {string} alias - element to verify
 * @param {string} validationType - validation
 * @param {string} value - expected value
 * @example I expect 'color' css property of 'Search Input' to be equal 'rgb(42, 42, 42)'
 * @example I expect 'font-family' css property of 'Label' to contain 'Fira'
 */
Then(
    'I expect {value} css property of {locator} {validation} {value}',
    async function (property: MemoryValue, locator: Locator, expect: Validation, expected: MemoryValue) {
        const propertyName = await property.value();
        const expectedValue = await expected.value();
        const actualValue = () => locator.evaluate(
            (node: Element, propertyName: string) => getComputedStyle(node).getPropertyValue(propertyName),
            propertyName
        );
        await expect.poll(actualValue, expectedValue);
    }
);

/**
 * Verify that text of an alert meets expectation
 * @param {string} validationType - validation
 * @param {string} value - expected text value
 * @example I expect text of alert does not contain 'coffee'
 */
Then(
    'I expect text of alert {validation} {value}',
    async function (expect: Validation, expected: MemoryValue) {
        const actualValue = () => new Promise<string>(resolve => this.page.once('dialog', async (dialog: Dialog) => {
            resolve(dialog.message());
        }));
        const expectedValue = await expected.value();
        await expect.poll(actualValue, expectedValue);
    }
);

// simple validation

/**
 * Verify that value from memory satisfies validation against other value
 * @param {string} value1 - first value
 * @param {string} validation - validation
 * @param {string} value2 - second value
 * @example I expect '$value' equals to '$anotherValue'
 * @example I expect '$value' does not contain '56'
 */
Then(
    'I expect {value} {validation} {value}',
    async function (value1: MemoryValue, expect: Validation, value2: MemoryValue) {
        expect(await value1.value(), await value2.value());
    });

/**
 * Verify that at least x elements in array pass validation
 * @param {string} arr - arr
 * @param {string} validation - validation
 * @param {string} expectedValue - expected value
 * @example I expect at least 1 element in '$arr' array to be above '$expectedValue'
 * @example I expect at least 2 elements in '$arr' array to be above '50'
 */
Then(
    'I expect at least {int} element(s) in {value} array {validation} {value}',
    async function (expectedNumber: number, arr: MemoryValue, expect: Validation, expected: MemoryValue) {
        const array: Array<any> = await arr.value();
        const expectedValue: any = await expected.value();
        const failCounter = { fail: 0, pass: 0 };
        for (const value of array) {
            try {
                console.log(value, expectedValue)
                expect(value, expectedValue);
                failCounter.pass++;
            } catch (err) {
                failCounter.fail++;
            }
        }
        if (failCounter.pass < expectedNumber) {
            throw new Error(`Less than ${expectedNumber} pass ${expect.type} verification`);
        }
    }
);

/**
 * Verify that every element in array satisfies validation against other value
 * @param {string} arr - arr
 * @param {string} validation - validation
 * @param {string} expectedValue - expected value
 * @example I expect every element in '$arr' array to be above '$expectedValue'
 * @example I expect every element in '$arr' array to be above '50'
 */
Then(
    'I expect every element in {value} array {validation} {value}',
    async function (arr: MemoryValue, expect: Validation, expected: MemoryValue) {
        const array: Array<any> = await arr.value();
        const expectedValue: any = await expected.value();
        for (const value of array) {
            expect(value, expectedValue);
        }
    }
);

/**
 * Verify that array is sorted by
 * @param {string} arr - memory key of array
 * @param {string} comparator - memory key of sort comparator function https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
 * Important: This module does not include implementation of sorting function,
 * as it may have various implementations for different types of compared data
 * @example I expect '$arr' array to be sorted by '$ascending'
 */
Then(
    'I expect {value} array to be sorted by {value}',
    async function (this: QavajsPlaywrightWorld, arr: MemoryValue, comparator: MemoryValue) {
        const array: Array<any> = await arr.value();
        if (!Array.isArray(array)) throw new Error(`'${arr.expression}' is not an array`);
        const comparatorFn: (a: any, b: any) => number = await comparator.value();
        if (typeof comparatorFn !== 'function') throw new Error(`'${comparator.expression}' is not implemented`);
        const arrayCopy: Array<any> = [...array];
        arrayCopy.sort(comparatorFn);
        this.expect(array).toEqual(arrayCopy);
    }
);

/**
 * Verify that array value from memory satisfies validation against other array in form of data table
 * @param {string} arr - memory key of array
 * @param {string} validation - validation
 * @param {DataTable} expected - expected array
 * @example
 * When I expect '$arr' array to have members:
 *  | uno  |
 *  | dos  |
 *  | tres |
 */
Then(
    'I expect {value} array {validation}:',
    async function (arr: MemoryValue, expect: Validation, members: DataTable) {
        const array = await arr.value();
        const membersArray = await Promise.all(
            members.raw().map(memberKey => this.value(memberKey.pop() as string))
        );
        expect(array, membersArray);
    }
);

function validateAnyOf(AR: any, ERs: any[], validation: (AR: any, ER: any) => void){
    const errorCollector: Error[] = [];
    for (const ER of ERs) {
        try {
            validation(AR, ER);
            return;
        } catch (err) {
            errorCollector.push(err as Error);
        }
    }
    throw new Error(errorCollector.map(err => err.message).join('\n'));
}

/**
 * Verify that the value satisfies validation with at least one value from the array
 * @param {string} actual - value to verify
 * @param {string} validation - validation
 * @param {string} expected - array of expected values
 * @example
 * When I expect '$text' to equal at least one of '$js(["free", "11.99"])'
 */
Then(
    'I expect {value} {validation} at least one of {value}',
    async function (actual: MemoryValue, expect: Validation, expected: MemoryValue) {
        const actualValue = await actual.value();
        const expectedValues = await expected.value();
        if (!(expectedValues instanceof Array)) throw new Error(`'${expected.expression}' parameter is not an array`);
        validateAnyOf(actualValue, expectedValues, expect);
    }
);

/**
 * Verify that the value satisfies validation with at least one value from the array
 * @param {string} actual - value to verify
 * @param {string} validation - validation
 * @param {string} expected - array of expected values
 * @example
 * When I expect '$text' to equal at least one of:
 *     | free  |
 *     | 11.99 |
 */
Then(
    'I expect {value} {validation} at least one of:',
    async function (this: QavajsPlaywrightWorld, actual: MemoryValue, expect: Validation, expected: DataTable) {
        const actualValue = await actual.value();
        const expectedValues = await dataTable2Array(this, expected);
        validateAnyOf(actualValue, expectedValues, expect);
    }
);

function validateAllOf(AR: any, ERs: any[], validation: (AR: any, ER: any) => void){
    const errorCollector: Error[] = [];
    for (const ER of ERs) {
        try {
            validation(AR, ER);
            return;
        } catch (err) {
            errorCollector.push(err as Error);
        }
    }
    if (errorCollector.length > 0) {
        throw new Error(errorCollector.map(err => err.message).join('\n'));
    }
}

/**
 * Verify that the value satisfies validation with all values from the array
 * @param {string} actual - value to verify
 * @param {string} validation - validation
 * @param {string} expected - array of expected values
 * @example
 * When I expect '$text' not to equal all of '$js(["free", "10.00"])'
 */
Then(
    'I expect {value} {validation} all of {value}',
    async function (actual: MemoryValue, expect: Validation, expected: MemoryValue) {
        const actualValue = await actual.value();
        const expectedValues = await expected.value();
        if (!(expectedValues instanceof Array)) throw new Error(`'${expected.expression}' parameter is not an array`);
        validateAllOf(actualValue, expectedValues, expect);
    }
);

/**
 * Verify that the value satisfies validation with all values from the array
 * @param {string} actual - value to verify
 * @param {string} validation - validation
 * @param {string} expected - array of expected values
 * @example
 * When I expect '$text' not to equal all of:
 *    | free  |
 *    | 10.00 |
 */
Then(
    'I expect {value} {validation} all of:',
    async function (this: QavajsPlaywrightWorld, actual: MemoryValue, expect: Validation, expected: DataTable) {
        const actualValue = await actual.value();
        const expectedValues = await dataTable2Array(this, expected);
        validateAllOf(actualValue, expectedValues, expect);
    }
);
