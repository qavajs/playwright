import { type Browser, type BrowserContext, type Page, Locator } from '@playwright/test';

type SelectorDefinition = string | ((argument: string) => string) | ((argument: any) => any) | null;

export class Selector {
    selector: SelectorDefinition;
    component!: Function;
    type: string = 'simple';

    constructor(selector: SelectorDefinition, type?: string) {
        this.selector = selector;
        if (type) {
            this.type = type;
        }
    }

    /**
     * Define current locator as component
     * @param { new () => void } component
     */
    as(component: new () => void) {
        this.component = component;
        return this;
    }
}

export type NativeSelectorParams = {
    driver: Browser;
    browser: Browser;
    context: BrowserContext;
    page: Page;
    parent: Locator;
    argument: string;
};

/**
 * Define selector
 */
export interface LocatorDefinition {
    (selector: any): Selector;

    /**
     * Define selector as a template
     * @param {(argument: string) => string} selector - selector template
     */
    template: (selector: (argument: string) => string) => Selector;

    /**
     * Define selector using native wdio API
     * @param {(argument: string) => string} selector - selector function
     */
    native: (selector: (params: NativeSelectorParams) => Locator) => Selector;

    /**
     * Define component
     * @param { new () => void } component
     */
    as: (component: new () => void) => Selector;
}

export const locator: LocatorDefinition = function locator(selector: any): Selector {
    return new Selector(selector);
}

locator.template = function(selector: (argument: string) => string) {
    return new Selector(selector, 'template');
}

locator.native = function(selector: (params: NativeSelectorParams) => Locator) {
    return new Selector(selector, 'native');
}

locator.as = function (component: new () => void) {
    const selector = new Selector(null);
    selector.component = component;
    return selector;
}

export class ChainItem {
    alias: string;
    argument?: string;
    selector: any;
    type: string;

    constructor({ alias, argument, selector, type }: { alias: string, argument?: string, selector?: string, type: string }) {
        this.alias = alias;
        this.argument = argument;
        this.selector = selector;
        this.type = type;
    }
}

export function query(root: any, path: string) {
    const elements = path.split(/\s*>\s*/);
    const tokens = [];
    let currentComponent = typeof root === 'function' ? new root() : root;
    let currentAlias = 'page object root';
    for (const element of elements) {
        const groups = element.match(/^(?<alias>.+?)(?:\((?<argument>.+)\))?$/)?.groups as { alias: string, argument: string };
        const alias = groups.alias.replace(/\s/g, '');
        let currentElement = currentComponent[alias];
        if (!currentElement && (!currentComponent.defaultResolver || typeof currentComponent.defaultResolver !== 'function')) {
            throw new Error(`Alias '${alias}' has not been found in '${currentAlias}'`);
        }
        if (!currentElement && currentComponent.defaultResolver) {
            currentElement = {};
            currentElement.selector = currentComponent.defaultResolver({ alias: groups.alias, argument: groups.argument });
            currentElement.type = 'native';
        }
        currentAlias = groups.alias;
        currentComponent = currentElement.component ? new currentElement.component() : null;

        tokens.push(new ChainItem({
            alias,
            argument: groups.argument,
            selector: currentElement.selector,
            type: currentElement.type,
        }));
    }

    return tokens;
}

export function element(this: any, path: string): Locator {
    const chain = query(this.config.pageObject, path);
    const page = this.page as Page;
    let current = page as unknown as Locator;
    for (const item of chain) {
        switch (item.type) {
            case 'simple': current = item.selector ? current.locator(item.selector) : current; break;
            case 'template': current = current.locator(item.selector(item.argument)); break;
            case 'native': current = item.selector({
                driver: this.driver,
                browser: this.browser,
                context: this.context,
                page: this.page,
                parent: current,
                argument: item.argument
            }); break;
        }
    }
    this.log(`${path} -> ${current}`);
    return current.describe(`${path} -> ${current}`)
}