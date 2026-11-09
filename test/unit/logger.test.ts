import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import { flushLogsAfterDefinitions, Masker } from '../../src/logger';

describe('Masker', () => {
    test('masks memory value of secret key', () => {
        const masker = new Masker();
        assert.equal(masker.maskMemoryLog('$password -> qwerty123'), '$password -> ***');
        assert.equal(masker.maskMemoryLog('$user.apiKey <- abc-def'), '$user.apiKey <- ***');
        assert.equal(masker.maskMemoryLog('Bearer {$token} -> Bearer xyz987'), 'Bearer {$token} -> ***');
    });

    test('does not mask regular memory values', () => {
        const masker = new Masker();
        assert.equal(masker.maskMemoryLog('$url -> https://qavajs.github.io'), '$url -> https://qavajs.github.io');
    });

    test('masks remembered secrets wherever they appear later', () => {
        const masker = new Masker();
        masker.maskMemoryLog('$password -> qwerty123');
        assert.equal(masker.mask('typed qwerty123 into Login > Password'), 'typed *** into Login > Password');
        assert.equal(masker.maskMemoryLog('{$base}?p={$pwd} -> /login?p=qwerty123'), '{$base}?p={$pwd} -> ***');
    });

    test('masks secret properties of json, inspect, query and header formats', () => {
        const masker = new Masker();
        assert.equal(
            masker.mask('$creds -> {\n  "login": "admin",\n  "password": "s3cret"\n}'),
            '$creds -> {\n  "login": "admin",\n  "password": "***"\n}'
        );
        assert.equal(masker.mask(inspect({ user: 'admin', token: 12345 })), "{ user: 'admin', token: *** }");
        assert.equal(masker.mask('/api?user=admin&api_key=k-1234&page=2'), '/api?user=admin&api_key=***&page=2');
        assert.equal(masker.mask('Authorization: Bearer abc.def'), 'Authorization: ***');
        // value found in property is remembered as well
        assert.equal(masker.mask('header value s3cret'), 'header value ***');
    });

    test('does not remember too short values', () => {
        const masker = new Masker();
        masker.maskMemoryLog('$pwd -> ab');
        assert.equal(masker.mask('tab'), 'tab');
    });

    test('custom pattern and disabled masking', () => {
        const custom = new Masker(/ssn/gi);
        assert.equal(custom.maskMemoryLog('$ssn -> 123-45-6789'), '$ssn -> ***');
        assert.equal(custom.maskMemoryLog('$password -> qwerty'), '$password -> qwerty');
        // global flag must not make checks stateful
        assert.equal(custom.maskMemoryLog('$ssn -> 987-65-4321'), '$ssn -> ***');

        const disabled = new Masker(false);
        assert.equal(disabled.maskMemoryLog('$password -> qwerty'), '$password -> qwerty');
    });
});

describe('flushLogsAfterDefinitions', () => {
    type Definition = { code: Function };

    function createWorld() {
        return {
            flushed: 0,
            async flushLogs() { this.flushed++; }
        };
    }

    function call(definition: Definition, thisArg: unknown, args: unknown[] = []): Promise<unknown> {
        return definition.code.apply(thisArg, args);
    }

    test('flushes logs after step and hook, keeps arity and result', async () => {
        const step: Definition = { code: async (a: string, b: string) => a + b };
        const hook: Definition = { code: () => 'skipped' };
        flushLogsAfterDefinitions({ stepDefinitions: [step], afterTestCaseHookDefinitions: [hook] });
        const world = createWorld();
        assert.equal(step.code.length, 2);
        assert.equal(await call(step, world, ['a', 'b']), 'ab');
        assert.equal(await call(hook, world), 'skipped');
        assert.equal(world.flushed, 2);
    });

    test('flushes logs when step fails', async () => {
        const step: Definition = { code: async () => { throw new Error('boom'); } };
        flushLogsAfterDefinitions({ stepDefinitions: [step] });
        const world = createWorld();
        await assert.rejects(() => call(step, world), /boom/);
        assert.equal(world.flushed, 1);
    });

    test('wraps definitions once and tolerates worlds without flushLogs', async () => {
        const step: Definition = { code: async () => 1 };
        const library = { stepDefinitions: [step] };
        flushLogsAfterDefinitions(library);
        const wrapped = step.code;
        flushLogsAfterDefinitions(library);
        assert.equal(step.code, wrapped);
        assert.equal(await call(step, {}), 1);
        assert.equal(await call(step, undefined), 1);
    });
});
