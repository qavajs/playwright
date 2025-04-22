import { After, Then, When } from '../../index';
import { expect } from '@playwright/test';
import {
    existsSync,
    mkdirSync,
    readdirSync,
    unlinkSync,
    writeFileSync
} from 'node:fs';
import { join } from 'node:path';

Then('I expect viewport size to equal {string}', async function (expectedSize) {
    const expectedValue = await this.value(expectedSize);
    const actualValue = this.page.viewportSize();
    expect(actualValue).toEqual(expectedValue);
});

When('I drop file {string} to {string} after {int} ms', function (file, dir, delay) {
    setTimeout(() => {
        existsSync(dir) || mkdirSync(dir);
        writeFileSync(join(dir, file), 'content', 'utf-8')
    }, delay);
});

After({tags: '@files'}, function () {
    const dir = './test-e2e/folder';
    readdirSync(dir).forEach(f => unlinkSync(`${dir}/${f}`));
});
