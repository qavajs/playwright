import { When } from '@cucumber/cucumber';
import { sleep } from './utils/utils';

/**
 * Explicit wait
 * @param {number} ms - milliseconds
 * @example I wait 1000 ms
 */
When('I wait {int} ms', async function (ms: number) {
    await sleep(ms);
});
