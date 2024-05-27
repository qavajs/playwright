import { DataTable, When } from '@cucumber/cucumber';
import { dataTable2Object } from './utils/utils';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';

/**
 * Save text of element to memory
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save text of '#1 of Search Results' as 'firstSearchResult'
 */
When('I save text of {string} as {string}', async function (alias, key) {
    const element = await this.element(alias);
    const value = await element.innerText();
    this.setValue(key, value);
});

/**
 * Save property of element to memory
 * @param {string} property - property to store
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save 'checked' property of 'Checkbox' as 'checked'
 * @example I save '$prop' property of 'Checkbox' as 'checked'
 */
When('I save {string} property of {string} as {string}', async function (property, alias, key) {
    const element = await this.element(alias);
    const propertyName = await this.value(property);
    const value = await element.evaluate((node: any, propertyName: string) => node[propertyName], propertyName);
    this.setValue(key, value);
});

/**
 * Save attribute of element to memory
 * @param {string} attribute - attribute to store
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save 'href' attribute of 'Link' as 'linkHref'
 * @example I save '$prop' attribute of 'Link' as 'linkHref'
 */
When('I save {string} attribute of {string} as {string}', async function (attribute, alias, key) {
    const element = await this.element(alias);
    const attributeName = await this.value(attribute);
    const value = await element.getAttribute(attributeName);
    this.setValue(key, value);
});

/**
 * Save number of elements in collection to memory
 * @param {string} alias - collection to get value
 * @param {string} key - key to store value
 * @example I save number of elements in 'Search Results' as 'numberOfSearchResults'
 */
When('I save number of elements in {string} collection as {string}', async function (alias, key) {
    const collection = await this.element(alias);
    const value = await collection.count();
    this.setValue(key, value);
});

/**
 * Save array of texts of collection to memory
 * @param {string} alias - collection to get values
 * @param {string} key - key to store value
 * @example I save text of every element of 'Search Results' collection as 'searchResults'
 */
When(
    'I save text of every element of {string} collection as {string}',
    async function (alias: string, key: string) {
        const collection = await this.element(alias);
        const values = await collection.evaluateAll(
            (collection: Array<any>) => collection.map(e => e.innerText)
        );
        this.setValue(key, values);
    }
);

/**
 * Save array of attributes of collection to memory
 * @param {string} alias - collection to get values
 * @param {string} key - key to store value
 * @example I save 'checked' attribute of every element of 'Search > Checkboxes' collection as 'checkboxes'
 */
When(
    'I save {string} attribute of every element of {string} collection as {string}',
    async function (attribute: string, alias: string, key: string) {
        const collection = await this.element(alias);
        const values = await collection.evaluateAll(
            (collection: Array<any>, attr: string) => collection.map(e => e.attributes[attr].value),
            attribute
        );
        this.setValue(key, values);
    }
);

/**
 * Save array of property of collection to memory
 * @param {string} alias - collection to get values
 * @param {string} key - key to store value
 * @example I save 'href' property of every element of 'Search > Links' collection as 'hrefs'
 */
When(
    'I save {string} property of every element of {string} collection as {string}',
    async function (property: string, alias: string, key: string) {
        const collection = await this.element(alias);
        const values = await collection.evaluateAll(
            (collection: Array<any>, prop: string) => collection.map(e => e[prop]),
            property
        );
        this.setValue(key, values);
    }
);

/**
 * Save current url to memory
 * @param {string} key - key to store value
 * @example I save current url as 'currentUrl'
 */
When('I save current url as {string}', async function (key: string) {
    this.setValue(key, this.page.url());
});

/**
 * Save current page title to memory
 * @param {string} key - key to store value
 * @example I save page title as 'currentTitle'
 */
When('I save page title as {string}', async function (key: string) {
    const title = await this.page.title();
    this.setValue(key, title);
});

/**
 * Save page screenshot into memory
 * @param {string} key - key to store value
 * @example I save screenshot as 'screenshot'
 */
When('I save screenshot as {string}', async function(key: string) {
    const screenshot = await this.page.screenshot();
    this.setValue(key, screenshot);
});

/**
 * Save full page screenshot into memory
 * @param {string} key - key to store value
 * @example I save full page screenshot as 'screenshot'
 */
When('I save full page screenshot as {string}', async function(key: string) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.setValue(key, screenshot);
});

/**
 * Save element screenshot into memory
 * @param {string} alias - element to get screenshot
 * @param {string} key - key to store value
 * @example I save screenshot of 'Header > Logo' as 'screenshot'
 */
When('I save screenshot of {string} as {string}', async function(alias: string, key: string) {
    const element = await this.element(alias);
    const screenshot = await element.screenshot();
    this.setValue(key, screenshot);
});

/**
 * Save css property of element to memory
 * @param {string} property - property to store
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save 'color' css property of 'Checkbox' as 'checkboxColor'
 * @example I save '$propertyName' property of 'Checkbox' as 'checkboxColor'
 */
When('I save {string} css property of {string} as {string}', async function (property, alias, key) {
    const element = await this.element(alias);
    const propertyName = await this.value(property);
    const value = await element.evaluate(
        (node: Element, propertyName: string) => getComputedStyle(node).getPropertyValue(propertyName),
        propertyName
    );
    this.setValue(key, value);
});

/**
 * Save bounding client rect to memory
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example
 * When I save bounding rect of 'Node' as 'boundingRect'
 * Then I expect '$boundingRect.width' to equal '42'
 */
When('I save bounding rect of {string} as {string}', async function (this: QavajsPlaywrightWorld, alias: string, key: string) {
    const element = await this.element(alias);
    const value = await element.evaluate((node: Element) => node.getBoundingClientRect());
    this.setValue(key, value);
});

/**
 * Save value to memory
 * @param {string} alias - value to save or alias for previously saved value
 * @param {string} key - key to store value
 * @example I save 'value' to memory as 'key'
 * @example I save '$getRandomUser()' to memory as 'user'
 */
When(
    'I save {string} to memory as {string}',
    async function (this: QavajsPlaywrightWorld, alias: string, key: string) {
        const value: string = await this.value(alias);
        this.setValue(key, value);
    }
);

When(
    'I save multiline string to memory as {string}:',
    async function (this: QavajsPlaywrightWorld, key: string, multilineString: string) {
        const value: string = await this.value(multilineString);
        this.setValue(key, value);
    }
);

/**
 * Save value to memory
 * @param {string} key - key to store value
 * @param {string} value - value to save or alias for previously saved value
 * @example I set 'key' = 'value'
 */
When(
    'I set {string} = {string}',
    async function (this: QavajsPlaywrightWorld, key: string, value: string) {
        const resolvedValue: string = await this.value(value);
        this.setValue(key, resolvedValue);
    }
);

/**
 * Save json value to memory
 * @param {string} key - key to store value
 * @param {string} json - multiline string
 * @example I save json to memory as 'key':
 * """
 * {
 *     "someKey": "someValue"
 * }
 * """
 */
When(
    'I save json to memory as {string}:',
    async function (this: QavajsPlaywrightWorld, key: string, json: string) {
        const value: string = await this.value(json);
        this.setValue(key, JSON.parse(value));
    }
);

/**
 * Save key-value pairs to memory
 * @param {string} key - key to store value
 * @param {string} kv - key-value
 * @example I save key-value pairs to memory as 'key':
 * | someKey      | 42               |
 * | someOtherKey | $valueFromMemory |
 */
When(
    'I save key-value pairs to memory as {string}:',
    async function (this: QavajsPlaywrightWorld, key: string, kv: DataTable) {
        const value = await dataTable2Object(this, kv);
        this.setValue(key, value);
    }
);
