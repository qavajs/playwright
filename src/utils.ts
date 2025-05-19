import { When } from '@qavajs/playwright-runner-adapter';
import { sleep } from './utils/utils';

/**
 * Explicit wait
 * @param {number} ms - milliseconds
 * @example I wait 1000 ms
 */
When('I wait {int} ms', async function (ms: number) {
    await sleep(ms);
});
