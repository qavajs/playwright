import { When } from '@cucumber/cucumber';
import { Cookie } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';

/**
 * Set cookie
 * @param {string} cookie - cookie name
 * @param {string} value - value to set
 * @example I set 'userID' cookie 'user1'
 * @example I set 'userID' cookie '$userIdCookie'
 */
When('I set {string} cookie as {string}', async function (this: QavajsPlaywrightWorld, cookie, value) {
    const cookieValue = await this.value(value);
    const cookieObject = typeof cookieValue === 'object' ? cookieValue : { value: cookieValue };
    if (!cookieObject.url && !cookieObject.domain && !cookieObject.path) {
        cookieObject.url = this.page.url();
    }
    await this.context.addCookies([{ name: await this.value(cookie), ...cookieObject }]);
});

/**
 * Save cookie value to memory
 * @param {string} cookie - cookie name
 * @param {string} key - memory key
 * @example I save value of 'auth' cookie as 'authCookie'
 */
When('I save value of {string} cookie as {string}', async function (this: QavajsPlaywrightWorld, cookie, key) {
    const cookieName = await this.value(cookie);
    const cookies = await this.context.cookies();
    const cookieValue = cookies.find((c: Cookie) => c.name === cookieName);
    this.setValue(key, cookieValue);
});

/**
 * Set value of local/session storage
 * @param {string} storageKey - local/session storage key to set value
 * @param {string} storageType - storage type (local or session)
 * @param {string} value - value to set
 * @example I set 'username' local storage value as 'user1'
 * @example I set '$sessionStorageKey' session storage value as '$sessionStorageValue'
 */
When('I set {string} {word} storage value as {string}', async function (storageKey, storageType, value) {
    const storage = storageType + 'Storage';
    await this.page.evaluate(function ([storageKey, storage, value]: [string, 'localStorage' | 'sessionStorage', string]) {
        window[storage].setItem(storageKey, value);
    }, [await this.value(storageKey), storage, await this.value(value)]);
});

/**
 * Save value of local/session storage to memory
 * @param {string} storageKey - local/session storage key to set value
 * @param {string} storageType - storage type (local or session)
 * @param {string} key - memory key
 * @example I save value of 'username' local storage as 'localStorageValue'
 * @example I save value of '$sessionStorageKey' session storage value as 'sessionStorageValue'
 */
When('I save value of {string} {word} storage as {string}', async function (storageKey, storageType, key) {
    const storage = storageType + 'Storage';
    const value = await this.page.evaluate(function ([storageKey, storage]: [string, 'localStorage' | 'sessionStorage']) {
        return window[storage].getItem(storageKey);
    }, [await this.value(storageKey), storage]);
    this.setValue(key, value);
});

