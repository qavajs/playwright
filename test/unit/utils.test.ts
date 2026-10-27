import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { GraphQl, parseCoords, parseCoordsAsObject, responseBody, tryThen } from '../../src/utils';

describe('parseCoords', () => {
    test('parses comma separated coordinates', () => {
        assert.deepEqual(parseCoords('10, 20'), [10, 20]);
        assert.deepEqual(parseCoords('10,20.5'), [10, 20.5]);
    });

    test('parses coordinates as object', () => {
        assert.deepEqual(parseCoordsAsObject('-1 , 2'), { x: -1, y: 2 });
    });
});

describe('GraphQl', () => {
    test('builds body from query and variables', () => {
        const request = new GraphQl();
        request.query = 'query { user(id: $id) { name } }';
        request.variables = '{ "id": 1 }';
        assert.equal(request.method, 'POST');
        assert.deepEqual(request.headers, { 'Content-Type': 'application/json' });
        assert.deepEqual(request.data, { query: 'query { user(id: $id) { name } }', variables: { id: 1 } });
    });

    test('throws clear error on invalid variables json', () => {
        const request = new GraphQl();
        assert.throws(() => { request.variables = '{ id: 1 }'; }, /GraphQL variables are not valid json/);
    });
});

describe('responseBody', () => {
    test('sends strings and buffers as body', () => {
        assert.deepEqual(responseBody('text'), { body: 'text' });
        const buffer = Buffer.from('binary');
        assert.deepEqual(responseBody(buffer), { body: buffer });
    });

    test('sends objects and arrays as json', () => {
        assert.deepEqual(responseBody({ a: 1 }), { json: { a: 1 } });
        assert.deepEqual(responseBody([1, 2]), { json: [1, 2] });
    });
});

describe('tryThen', () => {
    test('repeats action until condition is met', async () => {
        let attempts = 0;
        let actions = 0;
        await tryThen(
            expect,
            async () => { if (++attempts < 3) throw new Error('not yet'); },
            async () => { actions++; },
            { timeout: 1_000, interval: 10 }
        );
        assert.equal(attempts, 3);
        assert.equal(actions, 2);
    });

    test('fails when condition is not met within timeout', async () => {
        let actions = 0;
        const start = Date.now();
        await assert.rejects(tryThen(
            expect,
            async () => { throw new Error('never'); },
            async () => { actions++; },
            { timeout: 300, interval: 50 }
        ));
        assert.ok(Date.now() - start < 2_000, 'should stop shortly after timeout');
        assert.ok(actions > 1, 'should repeat action');
    });
});
