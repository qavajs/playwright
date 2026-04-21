import { When } from '@qavajs/playwright-runner-adapter';
import { MemoryValue } from './types';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';

/**
 * Press and hold keyboard key
 * @param {string} key - key to press
 * @example When I hold down 'Q' key
 */
When('I hold down {value} key', async function (this: QavajsPlaywrightWorld, key: MemoryValue) {
    await this.page.keyboard.down(await key.value());
});

/**
 * Release keyboard key
 * @param {string} key - key to release
 * @example When I release 'A' key
 */
When('I release {value} key', async function (this: QavajsPlaywrightWorld, key: MemoryValue) {
    await this.page.keyboard.up(await key.value());
});
