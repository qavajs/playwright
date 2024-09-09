import { When } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { parseCoords, parseCoordsAsObject, sleep } from './utils/utils';

/**
 * Opens provided url
 * @param {string} url - url to navigate
 * @example I open 'https://google.com'
 */
When('I open {string} url', async function (this: QavajsPlaywrightWorld, url: string) {
    const urlValue = await this.value(url);
    await this.page.goto(urlValue);
});

/**
 * Type text to element
 * @param {string} alias - element to type
 * @param {string} value - value to type
 * @example I type 'wikipedia' to 'Google Input'
 */
When('I type {string} to {string}', async function (this: QavajsPlaywrightWorld, value: string, alias: string) {
    const element = await this.element(alias);
    const typeValue = await this.value(value);
    await element.fill(typeValue);
});

/**
 * Type text to element sending fine-grained keyboard events
 * @param {string} alias - element to type
 * @param {string} value - value to type
 * @example I type 'wikipedia' chars to 'Google Input'
 */
When('I type {string} chars to {string}', async function (this: QavajsPlaywrightWorld, value: string, alias: string) {
    const element = await this.element(alias);
    const typeValue = await this.value(value);
    await element.pressSequentially(typeValue);
});

/**
 * Click element
 * @param {string} alias - element to click
 * @example I click 'Google Button'
 */
When('I click {string}', async function (this: QavajsPlaywrightWorld, alias: string) {
    const element = await this.element(alias);
    await element.click();
});

/**
 * Click element via script
 * @param {string} alias - element to click
 * @example I force click 'Google Button'
 */
When('I force click {string}', async function (this: QavajsPlaywrightWorld, alias: string) {
    const element = await this.element(alias);
    await element.evaluate((e: HTMLElement) => e.click());
});

/**
 * Right click element
 * @param {string} alias - element to right click
 * @example I right click 'Google Button'
 */
When('I right click {string}', async function (this: QavajsPlaywrightWorld, alias: string) {
    const element = await this.element(alias);
    await element.click({ button: 'right' });
});

/**
 * Double click element
 * @param {string} alias - double element to click
 * @example I double click 'Google Button'
 */
When('I double click {string}', async function (alias: string) {
    const element = await this.element(alias);
    await element.dblclick();
});

/**
 * Clear input
 * @param {string} alias - element to clear
 * @example I clear 'Google Input'
 */
When('I clear {string}', async function (alias: string) {
    const element = await this.element(alias);
    await element.fill('');
});

/**
 * Switch to parent frame
 * @example I switch to parent frame
 */
When('I switch to parent frame', async function (this: QavajsPlaywrightWorld) {
    this.po.setDriver(this.page);
});

/**
 * Switch to frame by index
 * @param {number} index - index to switch
 * @example I switch to 2 frame
 */
When('I switch to {int} frame', async function (this: QavajsPlaywrightWorld, index: number) {
    await this.expect.poll(() => this.page.frames()?.length).toBeGreaterThan(index);
    this.po.setDriver(this.page.frames()[index] as unknown as Page)
});

/**
 * Switch to frame by alias
 * @param {string} index - alias to switch
 * @example I switch to 'IFrame' frame
 */
When('I switch to {string} frame', async function (this: QavajsPlaywrightWorld, frameAlias: string) {
    const frame = await this.element(frameAlias);
    const frameHandle = await frame.elementHandle();
    if (!frameHandle) throw new Error(`Frame '${frameHandle}' does not exist!`);
    this.po.setDriver(await frameHandle.contentFrame() as unknown as Page)
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
    this.po.setDriver(this.page)
    await this.page.bringToFront();
});

/**
 * Switch to window by title or url
 * @param {string} matcher - url or title of window to switch
 * @example I switch to 'google' window
 */
When('I switch to {string} window', async function (matcher: string) {
    const urlOrTitle = await this.value(matcher);
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
            message: `Page matching ${urlOrTitle} was not found`
        }
    ).toBeDefined();
    const targetPage = await poll() as Page;
    this.page = targetPage;
    this.po.setDriver(targetPage)
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
When('I hover over {string}', async function (alias: string) {
    const element = await this.element(alias);
    await element.hover();
});

/**
 * Select option with certain text from select element
 * @param {string} option - option to select
 * @param {string} alias - alias of select
 * @example I select '1900' option from 'Registration Form > Date Of Birth'
 * @example I select '$dateOfBirth' option from 'Registration Form > Date Of Birth' dropdown
 */
When('I select {string} option from {string} dropdown', async function (option: string, alias: string) {
    const optionValue = await this.value(option);
    const select = await this.element(alias);
    await select.selectOption({ label: optionValue });
});

/**
 * Select option with certain text from select element
 * @param {number} optionIndex - index of option to select
 * @param {string} alias - alias of select
 * @example I select 1 option from 'Registration Form > Date Of Birth' dropdown
 */
When('I select {int}(st|nd|rd|th) option from {string} dropdown', async function (optionIndex: number, alias: string) {
    const select = await this.element(alias);
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
    'I click {string} text in {string} collection',
    async function (value: string, alias: string) {
        const resolvedValue = await this.value(value);
        const collection = await this.element(alias);
        await collection.getByText(resolvedValue).click();
    }
);

/**
 * Scroll by provided offset
 * @param {string} - offset string in 'x, y' format
 * @example
 * When I scroll by '0, 100'
 */
When('I scroll by {string}', async function (offset: string) {
    const [x, y] = parseCoords(await this.value(offset));
    await this.page.mouse.wheel(x, y);
});

/**
 * Scroll to element
 * @param {string} alias - alias of element
 * @example I scroll to 'Element'
 */
When('I scroll to {string}', async function (alias) {
    const element = await this.element(alias);
    await element.scrollIntoViewIfNeeded();
});

/**
 * Scroll by provided offset in element
 * @param {string} - offset string in 'x, y' format
 * @param {string} - element alias
 * @example
 * When I scroll by '0, 100' in 'Overflow Container'
 */
When('I scroll by {string} in {string}', async function (offset: string, alias: string) {
    const [x, y] = parseCoords(await this.value(offset));
    const element = await this.element(alias);
    await element.hover();
    await this.page.mouse.wheel(x, y);
});

/**
 * Scroll until specified element to be visible
 * @param {string} - target element
 * @example
 * When I scroll until 'Row 99' to be visible
 */
When('I scroll until {string} to be visible', async function (targetAlias: string) {
    const locator = await this.element(targetAlias);
    const isVisible = () => locator.isVisible();
    while (!await isVisible()) {
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
When('I scroll in {string} until {string} to be visible', async function (scrollAlias: string, targetAlias: string) {
    const element = await this.element(scrollAlias);
    await element.hover();
    const locator = await this.element(targetAlias);
    const isVisible = () => locator.isVisible();
    while (!await isVisible()) {
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
When('I upload {string} file to {string}', async function (value: string, alias: string) {
    const element = await this.element(alias);
    const filePath = await this.value(value);
    await element.setInputFiles(filePath);
});

/**
 * Provide file url to file chooser
 * @param {string} alias - element that invokes upload file chooser
 * @param {string} value - file path
 * @example I upload '/folder/file.txt' by clicking 'Upload Button'
 */
When('I upload {string} file by clicking {string}', async function (value: string, alias: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    const button = await this.element(alias);
    await button.click();
    const fileChooser = await fileChooserPromise;
    const filePath = await this.value(value);
    await fileChooser.setFiles(filePath);
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
    await new Promise<void>((resolve)=> this.page.once('dialog', async (dialog) => {
        await dialog.dismiss();
        resolve();
    }));
});

/**
 * I type {string} to alert
 * @example I type 'coffee' to alert
 */
When('I type {string} to alert', async function (this: QavajsPlaywrightWorld, value: string) {
    await new Promise<void>((resolve)=> this.page.once('dialog', async (dialog) => {
        await dialog.accept(value);
        resolve();
    }))
});

/**
 * Drag&Drop one element to another
 * @param {string} elementAlias - element to drag
 * @param {string} targetAlias - target
 * @example I drag and drop 'Bishop' to 'E4'
 */
When('I drag and drop {string} to {string}', async function (elementAlias, targetAlias) {
    const element = await this.element(elementAlias);
    const target = await this.element(targetAlias);
    await element.dragTo(target);
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
        this.po.setDriver(this.page)
        await this.page.bringToFront();
    }
});

/**
 * Click certain coordinates in element
 * @param {string} coords - x, y coordinates to click
 * @param {string} alias - element to click
 * @example When I click '0, 20' coordinates in 'Element'
 */
When('I click {string} coordinates in {string}', async function (coords: string, alias: string) {
    const coordinates = await this.value(coords);
    const element = await this.element(alias);
    const coordsObject = typeof coordinates === 'string' ? parseCoordsAsObject(coordinates) : coordinates;
    await element.click({position: coordsObject});
});

/**
 * Resize browser's window
 * @param {string} size - desired size
 * @example I set window size '1366,768'
 */
When('I set window size {string}', async function (size: string) {
    const viewPort = await this.value(size);
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
When('I tap {string}', async function (alias: string) {
    const element = await this.element(alias);
    await element.tap();
});
