import { accessSync, constants, readdirSync, readFileSync } from 'node:fs';
import { When } from '@qavajs/playwright-runner-adapter';
import { MemoryValue } from './types';

/**
 * Save file content to memory as buffer
 * @param {string} file - file path
 * @param {string} memoryKey - memory key
 * @example
 * When I save './folder/file.txt' file content as 'fileContent'
 * When I save '$filePath' file content as 'fileContent'
 */
When('I save {value} file content as {value}', async function (file: MemoryValue, memoryKey: MemoryValue) {
    const filePath = await file.value();
    const fileContent = readFileSync(filePath);
    memoryKey.set(fileContent);
});

/**
 * Save text file content to memory as text (utf-8)
 * @param {string} file - file path
 * @param {string} memoryKey - memory key
 * @example
 * When I save './folder/file.txt' text file content as 'fileContent'
 * When I save '$filePath' text file as 'fileContent'
 */
When('I save {value} text file content as {value}', async function (file: MemoryValue, memoryKey: MemoryValue) {
    const filePath = await file.value();
    const fileContent = readFileSync(filePath, 'utf-8');
    memoryKey.set(fileContent);
});

/**
 * Verify that file content satisfy validation
 * @param {string} file - file path
 * @param {string} validation - validation
 * @param {string} expectedValue - expected value
 * @example
 * When I expect './folder/file.txt' text file content to be equal 'file content'
 * When I expect '$filePath' text file content to contain '$content'
 */
When('I expect {value} text file content {validation} {value}', async function (file: MemoryValue, validation, expectedValue: MemoryValue) {
    const fileName = await file.value();
    const expected = await expectedValue.value();
    const fileContent = readFileSync(fileName, 'utf-8');
    validation(fileContent, expected);
});

/**
 * Expect file matching regexp to exist directory
 * @param {string} file - regexp pattern of file name to wait
 * @param {string} dir - folder path
 * @example
 * When I expect file matching 'f.+\.txt' regexp exists in './test-e2e/folder'
 * When I expect file matching '$fileRegexp' regexp exists in '$folder'
 */
When('I expect file matching {value} regexp exists in {value}', async function (file: MemoryValue, dir: MemoryValue) {
    const fileNameRegexp = new RegExp(await file.value());
    const dirName = await dir.value();
    await this.expect.poll(() => {
        const fileList = readdirSync(dirName);
        return fileList.find(f => fileNameRegexp.test(f));
    }, {
        message: `File matching '${fileNameRegexp}' does not exist`,
        intervals: [ 1000 ]
    }).toBeTruthy();
});

/**
 * Expect file to exist
 * @param {string} file - file path to wait
 * @example
 * When I expect './test-e2e/folder/file.txt' file exists
 * When I expect '$filePath' file exists
 */
When('I expect {value} file exists', async function (file: MemoryValue) {
    const fileName = await file.value();
    await this.expect.poll(() => {
        try {
            accessSync(fileName, constants.F_OK);
            return true
        } catch (err) {
            return false
        }
    }, {
        message: `File '${fileName}' does not exist`,
        intervals: [ 1000 ]
    }).toBeTruthy();
});