import { When } from '@qavajs/playwright-runner-adapter';
import { parseCoords } from './utils/utils';
import { MemoryValue } from './types';

/**
 * Press mouse key
 * @param {string} button - button to press (left, right, middle)
 * @example When I press left mouse button
 */
When('I press {mouseButton} mouse button', async function (button) {
    await this.page.mouse.down({ button });
});

/**
 * Release mouse key
 * @param {string} button - button to release (left, right, middle)
 * @example When I release left mouse button
 */
When('I release {mouseButton} mouse button', async function (button) {
    await this.page.mouse.up({ button });
});

/**
 * Move mouse to coordinates
 * @param {string} coords - x, y coordinates to move
 * @example When I move mouse to '10, 15'
 */
When('I move mouse to {value}', async function (coords: MemoryValue){
    const [x, y] = parseCoords(await coords.value());
    await this.page.mouse.move(x, y);
});

/**
 * Scroll mouse wheel by x, y offset
 * @param {string} coords - x, y offset to scroll
 * @example When I scroll mouse wheel by '0, 15'
 */
When('I scroll mouse wheel by {value}', async function (offset: MemoryValue) {
    const [x, y] = parseCoords(await offset.value());
    await this.page.mouse.wheel(x, y);
});
