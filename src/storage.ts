import { When } from '@qavajs/playwright-runner-adapter';
import { Cookie } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { MemoryValue } from './types';

type StorageType = 'localStorage' | 'sessionStorage';

/**
 * Set cookie
 * @param {string} cookie - cookie name
 * @param {string} value - value to set
 * @example I set 'userID' cookie as 'user1'
 * @example I set 'userID' cookie as '$userIdCookie'
 */
When('I set {value} cookie as {value}', async function (this: QavajsPlaywrightWorld, cookie: MemoryValue, value: MemoryValue) {
    const cookieValue = await value.value();
    const cookieObject = typeof cookieValue === 'object' ? cookieValue : { value: cookieValue };
    if (!cookieObject.url && !cookieObject.domain && !cookieObject.path) {
        cookieObject.url = this.page.url();
    }
    await this.context.addCookies([{ name: await cookie.value(), ...cookieObject }]);
});

/**
 * Save cookie value to memory
 * @param {string} cookie - cookie name
 * @param {string} key - memory key
 * @example I save value of 'auth' cookie as 'authCookie'
 */
When('I save value of {value} cookie as {value}', async function (this: QavajsPlaywrightWorld, cookie: MemoryValue, key: MemoryValue) {
    const cookieName = await cookie.value();
    const cookies = await this.context.cookies();
    const cookieValue = cookies.find((c: Cookie) => c.name === cookieName);
    key.set(cookieValue);
});

/**
 * Set value of local/session storage
 * @param {string} storageKey - local/session storage key to set value
 * @param {string} storageType - storage type (local or session)
 * @param {string} value - value to set
 * @example I set 'username' local storage value as 'user1'
 * @example I set '$sessionStorageKey' session storage value as '$sessionStorageValue'
 */
When('I set {value} {storageType} storage value as {value}', async function (this: QavajsPlaywrightWorld, storageKey: MemoryValue, storage: StorageType, value: MemoryValue) {
    const storageValue = await value.value();
    // storage keeps strings only, so other values are serialized as json
    const serializedValue = typeof storageValue === 'string' ? storageValue : JSON.stringify(storageValue);
    await this.page.evaluate(function([storageKey, storage, value]: [string, StorageType, string]) {
        window[storage].setItem(storageKey, value);
    }, [await storageKey.value(), storage, serializedValue] as [string, StorageType, string]);
});

/**
 * Save value of local/session storage to memory
 * @param {string} storageKey - local/session storage key to set value
 * @param {string} storageType - storage type (local or session)
 * @param {string} key - memory key
 * @example I save value of 'username' local storage as 'localStorageValue'
 * @example I save value of '$sessionStorageKey' session storage as 'sessionStorageValue'
 */
When('I save value of {value} {storageType} storage as {value}', async function (this: QavajsPlaywrightWorld, storageKey: MemoryValue, storage: StorageType, key: MemoryValue) {
    const value = await this.page.evaluate(function ([storageKey, storage]: [string, StorageType]) {
        return window[storage].getItem(storageKey);
    }, [await storageKey.value(), storage] as [string, StorageType]);
    key.set(value);
});

