import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { valueExpect, validationExtractRegexp, validationRegexpSource, validations } from '../../src/validationExpect';

const validationRegexp = new RegExp(`^(${validationRegexpSource})$`);

describe('validation regexp', () => {
    const conditions = [
        'to equal',
        'not to equal',
        'to not equal',
        'does not equal',
        'equals',
        'to softly equal',
        'to be strictly equal',
        'to deeply equal',
        'to have members',
        'to include members',
        'to have property',
        'to be greater than',
        'to be less than',
        'to be above',
        'to be below',
        'to match',
        'to contain',
        'to have type',
        'to satisfy',
        'to case insensitive equal',
    ];

    for (const condition of conditions) {
        test(`parameter type matches '${condition}'`, () => {
            assert.match(condition, validationRegexp);
            assert.match(condition, validationExtractRegexp);
        });
    }

    test('every declared validation is implemented', () => {
        for (const validation of Object.values(validations)) {
            assert.doesNotThrow(() => {
                try {
                    valueExpect(1, 1, `to ${validation}`);
                } catch (err: any) {
                    if (err.message.includes('is not implemented')) throw err;
                }
            }, validation);
        }
    });
});

describe('valueExpect', () => {
    const passing: Array<[any, any, string]> = [
        ['1', 1, 'to equal'],
        [1, 2, 'not to equal'],
        [1, 1, 'to strictly equal'],
        [{ a: 1 }, { a: 1 }, 'to deeply equal'],
        [[3, 2, 1], [1, 2, 3], 'to have members'],
        [[{ a: 1 }, 2], [2, { a: 1 }], 'to have members'],
        [[1, 2, 3], [3], 'to include members'],
        [[1, 2], [1, 2, 3], 'not to include members'],
        [[1, 2], [1, 2, 3], 'not to have members'],
        [{ a: 1 }, 'a', 'to have property'],
        [2, 1, 'to be greater than'],
        [1, 2, 'to be below'],
        ['test', 'tes.', 'to match'],
        ['test', 'es', 'to contain'],
        ['test', 'string', 'to have type'],
        ['Test', 'test', 'to case insensitive equal'],
        ['1', (arg: string) => arg === '1', 'to satisfy'],
    ];

    for (const [actual, expected, condition] of passing) {
        test(`${JSON.stringify(actual)} ${condition} ${String(expected)}`, () => {
            assert.doesNotThrow(() => valueExpect(actual, expected, condition));
        });
    }

    const failing: Array<[any, any, string]> = [
        ['1', 2, 'to equal'],
        [1, '1', 'to strictly equal'],
        [{ a: undefined }, {}, 'to strictly equal'],
        [[1, 2], [1, 2, 3], 'to have members'],
        [[1, 1, 2], [1, 2, 2], 'to have members'],
        [[1, 2], [3], 'to include members'],
        [1, 2, 'to be above'],
    ];

    for (const [actual, expected, condition] of failing) {
        test(`fails: ${JSON.stringify(actual)} ${condition} ${JSON.stringify(expected)}`, () => {
            assert.throws(() => valueExpect(actual, expected, condition));
        });
    }

    test('throws on unknown validation', () => {
        assert.throws(() => valueExpect(1, 1, 'to be awesome'), /is not implemented/);
    });
});

describe('soft validation', () => {
    test('soft clause is recognized', () => {
        const match = 'to softly equal'.match(validationExtractRegexp);
        assert.equal(match?.[2], 'softly ');
        assert.equal(match?.[3], 'equal');
    });

    test('passing soft validation does not throw', () => {
        assert.doesNotThrow(() => valueExpect(1, 1, 'to softly equal'));
        assert.doesNotThrow(() => valueExpect(1, 2, 'not to softly equal'));
    });
});
