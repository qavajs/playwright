import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { locator, query } from '../../src/pageObject';

class Item {
    Title = locator('.title');
}

class App {
    Button = locator('#button');
    List = locator('ul').as(Item);
    ItemByText = locator.template((text: string) => `li:has-text("${text}")`);
    Root = locator.as(Item);
}

class AppWithResolver {
    defaultResolver({ alias, argument }: { alias: string, argument?: string }) {
        return () => `${alias}:${argument}`;
    }
}

describe('query', () => {
    test('throws clear error if page object is not defined', () => {
        assert.throws(() => query(undefined, 'Button'), /Page object is not defined in config, so 'Button' can not be resolved/);
    });

    test('throws clear error on empty path element', () => {
        assert.throws(() => query(App, 'List >  > Title'), /Path 'List >  > Title' contains empty element/);
    });

    test('resolves simple element', () => {
        const [item] = query(App, 'Button');
        assert.equal(item.alias, 'Button');
        assert.equal(item.selector, '#button');
        assert.equal(item.type, 'simple');
    });

    test('resolves nested component and ignores whitespace in alias', () => {
        const chain = query(App, 'List > Title');
        assert.deepEqual(chain.map(item => item.selector), ['ul', '.title']);
    });

    test('resolves template argument', () => {
        const [item] = query(App, 'Item By Text (Milk)');
        assert.equal(item.type, 'template');
        assert.equal(item.argument, 'Milk');
        assert.equal(item.selector(item.argument), 'li:has-text("Milk")');
    });

    test('resolves component without selector', () => {
        const chain = query(App, 'Root > Title');
        assert.deepEqual(chain.map(item => item.selector), [null, '.title']);
    });

    test('throws on unknown alias', () => {
        assert.throws(() => query(App, 'Missing'), /Alias 'Missing' has not been found in 'page object root'/);
        assert.throws(() => query(App, 'List > Missing'), /Alias 'Missing' has not been found in 'List'/);
    });

    test('falls back to default resolver', () => {
        const [item] = query(AppWithResolver, 'Some Element(1)');
        assert.equal(item.type, 'native');
        assert.equal(item.selector(), 'Some Element:1');
    });
});

describe('element', () => {
    test('passes world objects to native selector', async () => {
        const { element } = await import('../../src/pageObject');
        let params: any;
        const nativeLocator = { describe: (description: string) => ({ description }) };
        class NativeApp {
            Native = locator.native(p => {
                params = p;
                return nativeLocator as any;
            });
        }
        const world: any = {
            config: { pageObject: NativeApp },
            page: { name: 'page' },
            browser: { name: 'browser' },
            context: { name: 'context' },
            log: () => {}
        };
        element.call(world, 'Native(arg)');
        assert.equal(params.driver, world.browser);
        assert.equal(params.browser, world.browser);
        assert.equal(params.context, world.context);
        assert.equal(params.page, world.page);
        assert.equal(params.parent, world.page);
        assert.equal(params.argument, 'arg');
    });
});
