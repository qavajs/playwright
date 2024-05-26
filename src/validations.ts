import { DataTable, Then } from '@cucumber/cucumber';
import { Dialog } from '@playwright/test';
import { QavajsPlaywrightWorld } from './PlaywrightWorld';
import { valueExpect } from './validationExpect';
import { conditionExpect } from './conditionExpect';
import { dataTable2Array } from './utils/utils';

/**
 * Verify element condition
 * @param {string} alias - element to wait condition
 * @param {string} condition - wait condition
 * @example I expect 'Header' to be visible
 * @example I expect 'Loading' not to be present
 * @example I expect 'Search Bar > Submit Button' to be clickable
 */
Then('I expect {string} {conditionWait}', async function (alias: string, condition: string) {
    const element = await this.element(alias);
    await conditionExpect(element, condition);
});

/**
 * Verify that text of element satisfies condition
 * @param {string} alias - element to get text
 * @param {string} validationType - validation
 * @param {string} value - expected result
 * @example I expect text of '#1 of Search Results' equals to 'google'
 * @example I expect text of '#2 of Search Results' does not contain 'yandex'
 */
Then(
    'I expect text of {string} {validation} {string}',
    async function (this: QavajsPlaywrightWorld, alias: string, validationType: string, value: any) {
        const expectedValue = await this.value(value);
        const element = await this.element(alias);
        const actualValue = () => element.innerText();
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect value of {string} {validation} {string}',
    async function (alias: string, validationType: string, value: string) {
        const expectedValue = await this.value(value);
        const element = await this.element(alias);
        const actualValue = () => element.evaluate(
            (node: any) => node.value
        );
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect {string} property of {string} {validation} {string}',
    async function (property: string, alias: string, validationType: string, value: string) {
        const propertyName = await this.value(property);
        const expectedValue = await this.value(value);
        const element = await this.element(alias);
        const actualValue = () => element.evaluate((node: any, propertyName: string) => node[propertyName], propertyName);
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect {string} attribute of {string} {validation} {string}',
    async function (attribute: string, alias: string, validationType: string, value: string) {
        const attributeName = await this.value(attribute);
        const expectedValue = await this.value(value);
        const element = await this.element(alias);
        const actualValue = () => element.getAttribute(attributeName);
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect current url {validation} {string}',
    async function (validationType: string, expected: string) {
        const expectedValue = await this.value(expected);
        const actualValue = () => this.page.url();
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect number of elements in {string} collection {validation} {string}',
    async function (alias: string, validationType: string, value: string) {
        const expectedValue = await this.value(value);
        const collection = await this.element(alias);
        const actualValue = () => collection.count();
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
    }
);

/**
 * Verify that page title satisfies condition
 * @param {string} validationType - validation
 * @param {string} expected - expected value
 * @example I expect page title equals 'Wikipedia'
 */
Then(
    'I expect page title {validation} {string}',
    async function (validationType: string, expected: string) {
        const expectedValue = await this.value(expected);
        const actualValue = () => this.page.title();
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });

    }
);

/**
 * Verify collection condition
 * @param {string} alias - collection to wait condition
 * @param {string} condition - wait condition
 * @example I expect every element in 'Header > Links' collection to be visible
 * @example I expect every element in 'Loading Bars' collection not to be present
 */
Then('I expect every element in {string} collection {conditionWait}', async function (alias: string, condition: string) {
    const collection = await this.element(alias);
    for (let i = 0; i < await collection.count(); i++) {
        const element = collection.nth(i);
        await conditionExpect(element, condition);
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
    'I expect text of every element in {string} collection {validation} {string}',
    async function (alias: string, validationType: string, value: string) {
        const expectedValue = await this.value(value);
        const collection = await this.element(alias);
        for (let i = 0; i < await collection.count(); i++) {
            const actualValue = () => collection.nth(i).innerText();
            await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect {string} attribute of every element in {string} collection {validation} {string}',
    async function (attribute: string, alias: string, validationType: string, value: string) {
        const expectedValue = await this.value(value);
        const collection = await this.element(alias);
        for (let i = 0; i < await collection.count(); i++) {
            const actualValue = () => collection.nth(i).getAttribute(attribute);
            await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect {string} property of every element in {string} collection {validation} {string}',
    async function (property: string, alias: string, validationType: string, value: string) {
        const expectedValue = await this.value(value);
        const collection = await this.element(alias);
        for (let i = 0; i < await collection.count(); i++) {
            const actualValue = () => collection.nth(i).evaluate(
                (node: any, property: string) => node[property], property
            );
            await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect {string} css property of {string} {validation} {string}',
    async function (property: string, alias: string, validationType: string, value: string) {
        const propertyName = await this.value(property);
        const expectedValue = await this.value(value);
        const element = await this.element(alias);
        const actualValue = () => element.evaluate(
            (node: Element, propertyName: string) => getComputedStyle(node).getPropertyValue(propertyName),
            propertyName
        );
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
    }
);

/**
 * Verify that text of an alert meets expectation
 * @param {string} validationType - validation
 * @param {string} value - expected text value
 * @example I expect text of alert does not contain 'coffee'
 */
Then(
    'I expect text of alert {validation} {string}',
    async function (validationType: string, expected: string) {
        const actualValue = () => new Promise<string>(resolve => this.page.once('dialog', async (dialog: Dialog) => {
            resolve(dialog.message());
        }));
        const expectedValue = await this.value(expected);
        await valueExpect(actualValue, expectedValue, validationType, { poll: true });
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
    'I expect {string} {validation} {string}',
    async function (value1: string, validationType: string, value2: string) {
        const val1: any = await this.value(value1);
        const val2: any = await this.value(value2);
        await valueExpect(val1, val2, validationType);
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
    'I expect at least {int} element(s) in {string} array {validation} {string}',
    async function (expectedNumber: number, arr: string, validationType: string, expectedValue: string) {
        const array: Array<any> = await this.value(arr);
        const val: any = await this.value(expectedValue);
        const failCounter = { fail: 0, pass: 0 };
        for (const value of array) {
            try {
                await valueExpect(value, val, validationType);
                failCounter.pass++;
            } catch (err) {
                failCounter.fail++;
            }
        }
        if (failCounter.pass < expectedNumber) {
            throw new Error(`Less than ${expectedNumber} pass ${validationType} verification`);
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
    'I expect every element in {string} array {validation} {string}',
    async function (arr: string, validationType: string, expectedValue: string) {
        const array: Array<any> = await this.value(arr);
        const val: any = await this.value(expectedValue);
        for (const value of array) {
            await valueExpect(value, val, validationType);
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
    'I expect {string} array to be sorted by {string}',
    async function (arr: string, comparator: string) {
        const array: Array<any> = await this.value(arr);
        if (!Array.isArray(array)) throw new Error(`'${arr}' is not an array`);
        const comparatorFn: (a: any, b: any) => number = await this.value(comparator);
        if (typeof comparatorFn !== 'function') throw new Error(`'${comparator}' is not implemented`);
        const arrayCopy: Array<any> = [...array];
        arrayCopy.sort(comparatorFn);
        await valueExpect(array, arrayCopy, 'to deeply equal');
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
    'I expect {string} array {validation}:',
    async function (arr: string, validationType: string, members: DataTable) {
        const array = await this.value(arr);
        const membersArray = await Promise.all(
            members.raw().map(memberKey => this.value(memberKey.pop() as string))
        );
        await valueExpect(array, membersArray, validationType);
    }
);

async function validateAnyOf(AR: any, ERs: any[], validation: (AR: any, ER: any) => Promise<void>){
    const errorCollector: Error[] = [];
    for (const ER of ERs) {
        try {
            await validation(AR, ER);
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
    'I expect {string} {validation} at least one of {string}',
    async function (actual: string, validationType: string, expected: string) {
        const actualValue = await this.value(actual);
        const expectedValues = await this.value(expected);
        if (!(expectedValues instanceof Array)) throw new Error(`'${expected}' parameter is not an array`);
        const validation = (AR: any, ER: any) => valueExpect(AR, ER, validationType);
        await validateAnyOf(actualValue, expectedValues, validation);
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
    'I expect {string} {validation} at least one of:',
    async function (this: QavajsPlaywrightWorld, actual: string, validationType: string, expected: DataTable) {
        const actualValue = await this.value(actual);
        const expectedValues = await dataTable2Array(this, expected);
        const validation = (AR: any, ER: any) => valueExpect(AR, ER, validationType);
        await validateAnyOf(actualValue, expectedValues, validation);
    }
);

async function validateAllOf(AR: any, ERs: any[], validation: (AR: any, ER: any) => Promise<void>){
    const errorCollector: Error[] = [];
    for (const ER of ERs) {
        try {
            await validation(AR, ER);
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
    'I expect {string} {validation} all of {string}',
    async function (actual: string, validationType: string, expected: string) {
        const actualValue = await this.value(actual);
        const expectedValues = await this.value(expected);
        if (!(expectedValues instanceof Array)) throw new Error(`'${expected}' parameter is not an array`);
        const validation = (AR: any, ER: any) => valueExpect(AR, ER, validationType);
        await validateAllOf(actualValue, expectedValues, validation);
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
    'I expect {string} {validation} all of:',
    async function (this: QavajsPlaywrightWorld, actual: string, validationType: string, expected: DataTable) {
        const actualValue = await this.value(actual);
        const expectedValues = await dataTable2Array(this, expected);
        const validation = (AR: any, ER: any) => valueExpect(AR, ER, validationType);
        await validateAllOf(actualValue, expectedValues, validation);
    }
);
