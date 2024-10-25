import { When } from '@cucumber/cucumber';
import { Cookie } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { MemoryValue } from './types';

/**
 * Set cookie
 * @param {string} cookie - cookie name
 * @param {string} value - value to set
 * @example I set 'userID' cookie 'user1'
 * @example I set 'userID' cookie '$userIdCookie'
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
When('I set {value} {word} storage value as {value}', async function (storageKey: MemoryValue, storageType: string, value: MemoryValue) {
    const storage = storageType + 'Storage';
    await this.page.evaluate(function([storageKey, storage, value]: [string, 'localStorage' | 'sessionStorage', string]) {
        window[storage].setItem(storageKey, value);
    }, [await storageKey.value(), storage, await value.value()]);
});

/**
 * Save value of local/session storage to memory
 * @param {string} storageKey - local/session storage key to set value
 * @param {string} storageType - storage type (local or session)
 * @param {string} key - memory key
 * @example I save value of 'username' local storage as 'localStorageValue'
 * @example I save value of '$sessionStorageKey' session storage value as 'sessionStorageValue'
 */
When('I save value of {value} {word} storage as {value}', async function (storageKey: MemoryValue, storageType, key: MemoryValue) {
    const storage = storageType + 'Storage';
    const value = await this.page.evaluate(function ([storageKey, storage]: [string, 'localStorage' | 'sessionStorage']) {
        return window[storage].getItem(storageKey);
    }, [await storageKey.value(), storage]);
    key.set(value);
});

