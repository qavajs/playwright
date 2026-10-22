import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CucumberExpression, ParameterType, ParameterTypeRegistry } from '@cucumber/cucumber-expressions';
import { validationRegexpSource } from '../../src/validationExpect';
import { conditionRegexpSource } from '../../src/conditionExpect';

/**
 * Verifies that every '@example' in step definition docs matches exactly one step of the same file,
 * so examples shown in IDE hints and docs can be copied to feature files as is
 */
const srcDir = join(__dirname, '../../src');
const quoted = /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/;
// keep in sync with src/parameterTypes.ts
const parameterTypes: Array<[string, RegExp]> = [
    ['validation', new RegExp(`(${validationRegexpSource})`)],
    ['locator', quoted],
    ['value', quoted],
    ['state', new RegExp(`(${conditionRegexpSource})`)],
    ['mouseButton', /(left|right|middle)/],
    ['storageType', /(local|session)/],
    ['browserButton', /(back|forward)/],
    ['bodyParsingType', /buffer|json|text/],
    ['gqlRequestProperty', /query|variables/],
];

const registry = new ParameterTypeRegistry();
for (const [name, regexp] of parameterTypes) {
    registry.defineParameterType(new ParameterType(name, regexp, null, (s: string) => s, false, false));
}

const steps: Array<{ file: string, pattern: string, expression: CucumberExpression }> = [];
const examples: Array<{ file: string, text: string }> = [];
for (const file of readdirSync(srcDir).filter(f => f.endsWith('.ts'))) {
    const code = readFileSync(join(srcDir, file), 'utf-8');
    for (const [, pattern] of code.matchAll(/(?:When|Then|Given)\(\s*'([^']+)'/g)) {
        steps.push({ file, pattern, expression: new CucumberExpression(pattern, registry) });
    }
    for (const [, example] of code.matchAll(/^\s*\*\s*@example\s*(.*)$/gm)) {
        const text = example
            .replace(/\s\/\/.*$/, '') // trailing comment
            .trim()
            .replace(/^(Given|When|Then|And)\s+/, '');
        if (text.startsWith('I ')) examples.push({ file, text });
    }
}

describe('step definition examples', () => {
    test('parameter types are in sync with parameterTypes.ts', () => {
        const declared = [...readFileSync(join(srcDir, 'parameterTypes.ts'), 'utf-8').matchAll(/name: '(\w+)'/g)].map(m => m[1]);
        assert.deepEqual(declared.sort(), parameterTypes.map(([name]) => name).sort());
    });

    for (const { file, text } of examples) {
        test(`${file}: ${text}`, () => {
            const matches = steps.filter(step => step.expression.match(text));
            assert.deepEqual(
                matches.map(step => `${step.file}: ${step.pattern}`),
                matches.filter(step => step.file === file).map(step => `${step.file}: ${step.pattern}`),
                'example matches step of another file'
            );
            assert.equal(matches.length, 1, `expected exactly one matching step, got: ${JSON.stringify(matches.map(m => m.pattern))}`);
        });
    }
});
