import { When } from '@qavajs/playwright-runner-adapter';
import { Locator, Page } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { parseCoords, parseCoordsAsObject, sleep } from './utils';
import { MemoryValue } from './types';

/**
 * Opens provided url
 * @param {string} url - url to navigate
 * @example I open 'https://google.com'
 */
When('I open {value} url', async function (this: QavajsPlaywrightWorld, url: MemoryValue) {
    await this.page.goto(await url.value());
});

/**
 * Type text to element
 * @param {string} alias - element to type
 * @param {string} value - value to type
 * @example I type 'wikipedia' to 'Google Input'
 */
When('I type {value} (in)to {locator}', async function (this: QavajsPlaywrightWorld, type: MemoryValue, locator: Locator) {
    await locator.fill(await type.value());
});

/**
 * Type text to element sending fine-grained keyboard events
 * @param {string} alias - element to type
 * @param {string} value - value to type
 * @example I type 'wikipedia' chars to 'Google Input'
 */
When('I type {value} chars (in)to {locator}', async function (this: QavajsPlaywrightWorld, type: MemoryValue, locator: Locator) {
    await locator.pressSequentially(await type.value());
});

/**
 * Click element
 * @param {string} alias - element to click
 * @example I click 'Google Button'
 */
When('I click {locator}', async function (this: QavajsPlaywrightWorld, locator: Locator) {
    await locator.click();
});

/**
 * Click element via script
 * @param {string} alias - element to click
 * @example I force click 'Google Button'
 */
When('I force click {locator}', async function (this: QavajsPlaywrightWorld, locator: Locator) {
    await locator.evaluate((e: HTMLElement) => e.click());
});

/**
 * Right click element
 * @param {string} alias - element to right click
 * @example I right click 'Google Button'
 */
When('I right click {locator}', async function (this: QavajsPlaywrightWorld, locator: Locator) {
    await locator.click({ button: 'right' });
});

/**
 * Double click element
 * @param {string} alias - double element to click
 * @example I double click 'Google Button'
 */
When('I double click {locator}', async function (locator: Locator) {
    await locator.dblclick();
});

/**
 * Clear input
 * @param {string} alias - element to clear
 * @example I clear 'Google Input'
 */
When('I clear {locator}', async function (locator: Locator) {
    await locator.clear();
});

/**
 * Switch to window by index
 * @param {number} index - index to switch
 * @example I switch to 2 window
 */
When('I switch to {int} window', async function (this: QavajsPlaywrightWorld, index: number) {
    await this.expect.poll(
        () => this.context.pages()?.length,
    ).toBeGreaterThan(index - 1);
    this.page = this.context.pages()[index - 1];
    await this.page.bringToFront();
});

/**
 * Switch to window by title or url
 * @param {string} matcher - url or title of window to switch
 * @example I switch to 'google' window
 */
When('I switch to {value} window', async function (matcher: MemoryValue) {
    const urlOrTitle = await matcher.value();
    const poll = async () => {
        const pages = this.context.pages();
        for (const currentPage of pages) {
            if (currentPage.url().includes(urlOrTitle) || (await currentPage.title()).includes(urlOrTitle)) {
                return currentPage
            }
        }
    }
    await this.expect.poll(
        poll,
        {
            message: `expect '${urlOrTitle}' window to be present`
        }
    ).toBeDefined();
    const targetPage = await poll() as Page;
    this.page = targetPage;
    await targetPage.bringToFront();
});

/**
 * Refresh current this.page
 * @example I refresh this.page
 */
When('I refresh page', async function () {
    await this.page.reload();
});

/**
 * Press button
 * @param {string} key - key to press
 * @example I press 'Enter' key
 * @example I press 'Control+C' keys
 */
When('I press {string} key(s)', async function (key: string) {
    await this.page.press('body', key);
});

/**
 * Press button given number of times
 * @param {string} key - key to press
 * @param {number} num - number of times
 * @example I press 'Enter' key 5 times
 * @example I press 'Control+V' keys 5 times
 */
When('I press {string} key(s) {int} time(s)', async function (key: string, num: number) {
    for (let i: number = 0; i < num; i++) {
        await this.page.keyboard.press(key);
    }
});

/**
 * Hover over element
 * @param {string} alias - element to hover over
 * @example I hover over 'Google Button'
 */
When('I hover over {locator}', async function (locator: Locator) {
    await locator.hover();
});

/**
 * Select option with certain text from select element
 * @param {string} option - option to select
 * @param {string} alias - alias of select
 * @example I select '1900' option from 'Registration Form > Date Of Birth'
 * @example I select '$dateOfBirth' option from 'Registration Form > Date Of Birth' dropdown
 */
When('I select {value} option from {locator} dropdown', async function (option: MemoryValue, select: Locator) {
    await select.selectOption({ label: await option.value() });
});

/**
 * Select option with certain text from select element
 * @param {number} optionIndex - index of option to select
 * @param {string} alias - alias of select
 * @example I select 1 option from 'Registration Form > Date Of Birth' dropdown
 */
When('I select {int}(st|nd|rd|th) option from {locator} dropdown', async function (optionIndex: number, select: Locator) {
    await select.selectOption({ index: optionIndex - 1 });
});

/**
 * Click on element with desired text in collection
 * @param {string} expectedText - text to click
 * @param {string} alias - collection to search text
 * @example I click 'google' text in 'Search Engines' collection
 * @example I click '$someVarWithText' text in 'Search Engines' collection
 */
When(
    'I click {value} text in {locator} collection',
    async function (text: MemoryValue, collection: Locator) {
        const hasText = await text.value();
        await collection.filter({ hasText }).click();
    }
);

/**
 * Scroll by provided offset
 * @param {string} - offset string in 'x, y' format
 * @example
 * When I scroll by '0, 100'
 */
When('I scroll by {value}', async function (offset: MemoryValue) {
    const [x, y] = parseCoords(await offset.value());
    await this.page.mouse.wheel(x, y);
});

/**
 * Scroll to element
 * @param {string} alias - alias of element
 * @example I scroll to 'Element'
 */
When('I scroll to {locator}', async function (locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
});

/**
 * Scroll by provided offset in element
 * @param {string} - offset string in 'x, y' format
 * @param {string} - element alias
 * @example
 * When I scroll by '0, 100' in 'Overflow Container'
 */
When('I scroll by {value} in {locator}', async function (offset: MemoryValue, locator: Locator) {
    const [x, y] = parseCoords(await offset.value());
    await locator.hover();
    await this.page.mouse.wheel(x, y);
});

/**
 * Scroll until specified element to be visible
 * @param {string} - target element
 * @example
 * When I scroll until 'Row 99' to be visible
 */
When('I scroll until {locator} to be visible', async function (targetAlias: Locator) {
    while (!await targetAlias.isVisible()) {
        await this.page.mouse.wheel(0, 100);
        await sleep(50);
    }
});

/**
 * Scroll in container until specified element to be visible
 * @param {string} - scroll container
 * @param {string} - target element
 * @example
 * When I scroll in 'List' until 'Row 99' to be visible
 */
When('I scroll in {locator} until {locator} to be visible', async function (scrollLocator: Locator, targetLocator: Locator) {
    await scrollLocator.hover();
    while (!await targetLocator.isVisible()) {
        await this.page.mouse.wheel(0, 100);
        await sleep(50);
    }
});

/**
 * Provide file url to upload input
 * @param {string} alias - element to upload file
 * @param {string} value - file path
 * @example I upload '/folder/file.txt' to 'File Input'
 */
When('I upload {value} file to {locator}', async function (filePath: MemoryValue, locator: Locator) {
    await locator.setInputFiles(await filePath.value());
});

/**
 * Provide file url to file chooser
 * @param {string} alias - element that invokes upload file chooser
 * @param {string} value - file path
 * @example I upload '/folder/file.txt' by clicking 'Upload Button'
 */
When('I upload {value} file by clicking {locator}', async function (filePath: MemoryValue, locator: Locator) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await locator.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(await filePath.value());
});

/**
 * Accept alert
 * @example I accept alert
 */
When('I accept alert', async function (this: QavajsPlaywrightWorld) {
    await new Promise<void>((resolve)=> this.page.once('dialog', async (dialog) => {
        await dialog.accept();
        resolve();
    }));
});

/**
 * Dismiss alert
 * Playwright automatically dismisses all dialogs. This step is just to make it implicitly.
 * @example I dismiss alert
 */
When('I dismiss alert', async function (this: QavajsPlaywrightWorld) {
    await new Promise<void>(resolve => this.page.once('dialog', async (dialog) => {
        await dialog.dismiss();
        resolve();
    }));
});

/**
 * I type {string} to alert
 * @example I type 'coffee' to alert
 */
When('I type {value} to alert', async function (this: QavajsPlaywrightWorld, type: MemoryValue) {
    const typeValue = await type.value();
    await new Promise<void>(resolve => this.page.once('dialog', async (dialog) => {
        await dialog.accept(typeValue);
        resolve();
    }))
});

/**
 * Drag&Drop one element to another
 * @param {string} elementAlias - element to drag
 * @param {string} targetAlias - target
 * @example I drag and drop 'Bishop' to 'E4'
 */
When('I drag and drop {locator} to {locator}', async function (locator: Locator, target: Locator) {
    await locator.dragTo(target);
});

/**
 * Open new browser tab
 * @example I open new tab
 */
When('I open new tab', async function () {
    await this.page.evaluate(() => { window.open('about:blank', '_blank') });
});

/**
 * Close current tab
 * @example
 * Then I close current tab
 */
When('I close current tab', async function (this: QavajsPlaywrightWorld) {
    await this.page.close()
    this.page = this.context.pages()[0]
    if (this.page) {
        await this.page.bringToFront();
    }
});

/**
 * Click certain coordinates in element
 * @param {string} coords - x, y coordinates to click
 * @param {string} alias - element to click
 * @example When I click '0, 20' coordinates in 'Element'
 */
When('I click {value} coordinates in {locator}', async function (coords: MemoryValue, locator: Locator) {
    const coordinates = await coords.value();
    const coordsObject = typeof coordinates === 'string' ? parseCoordsAsObject(coordinates) : coordinates;
    await locator.click({position: coordsObject});
});

/**
 * Resize browser's window
 * @param {string} size - desired size
 * @example I set window size '1366,768'
 */
When('I set window size {value}', async function (size: MemoryValue) {
    const viewPort = await size.value();
    const {x, y} = parseCoordsAsObject(viewPort);
    await this.page.setViewportSize({width: x, height: y});
});

/**
 * Click browser button
 * @param {string} button - browser button
 * @example I click back button
 * @example I click forward button
 */
When('I click {browserButton} button', async function (button: 'back' | 'forward') {
    if (button === 'back') return this.page.goBack();
    if (button === 'forward') return this.page.goForward();
});

/**
 * Tap element
 * @param {string} alias - element to tap
 * @example I tap 'Google Button'
 */
When('I tap {locator}', async function (locator: Locator) {
    await locator.tap();
});
