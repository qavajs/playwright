import { When } from '@cucumber/cucumber';
import { MemoryValue } from './types';

/**
 * Press and hold keyboard key
 * @param {string} key - key to press
 * @example When I hold down 'Q' key
 */
When('I hold down {value} key', async function (key: MemoryValue) {
    await this.page.keyboard.down(await key.value());
});

/**
 * Release keyboard key
 * @param {string} key - key to release
 * @example When I release 'A' key
 */
When('I release {value} key', async function (key: MemoryValue) {
    await this.page.keyboard.up(await key.value());
});
