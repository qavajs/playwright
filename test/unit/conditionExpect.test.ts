import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { conditionRegexpSource, conditionValidations, conditionWaitExtractRegexp } from '../../src/conditionExpect';

const stateRegexp = new RegExp(`^(${conditionRegexpSource})$`);

describe('state regexp', () => {
    for (const condition of Object.values(conditionValidations)) {
        for (const phrase of [`to be ${condition}`, `not to be ${condition}`, `to be softly ${condition}`]) {
            test(`matches '${phrase}'`, () => {
                assert.match(phrase, stateRegexp);
                const match = phrase.match(conditionWaitExtractRegexp);
                assert.equal(match?.[3], condition);
            });
        }
    }

    test('clickable is supported', () => {
        assert.match('to be clickable', stateRegexp);
    });
});
