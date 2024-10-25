import { defineParameterType } from '@cucumber/cucumber';
import { valueExpect } from './validationExpect';
import { MemoryValue, type Validation } from './types';
import {conditionExpect} from "./conditionExpect";
import {Locator} from "@playwright/test";

function transformString(fn: (value: string) => any) {
    return function (s1: string, s2: string) {
        const expression = (s1 || s2 || '').replace(/\\"/g, '"').replace(/\\'/g, "'")
        return fn(expression);
    }
}

defineParameterType({
    name: 'validation',
    regexp: /((?:is |do |does |to )?(not |to not )?(?:to )?(?:be )?(equal|strictly equal|deeply equal|have member|match|contain|above|below|greater than|less than|have type)(?:s|es)?)/,
    transformer: condition => {
        const validation: Validation = function (AR: any, ER: any) {
            return valueExpect(AR, ER, condition);
        }
        validation.type = condition;
        validation.poll = function (AR: any, ER: any) {
            return valueExpect(AR, ER, condition, { poll: true });
        }
        return validation;
    },
    useForSnippets: false
});

defineParameterType({
    name: 'locator',
    regexp: /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/,
    transformer: function (s1: string, s2: string) {
        const world = this as any;
        return transformString(function (alias) {
            return world.element(alias);
        })(s1, s2);
    }
});

defineParameterType({
    name: 'value',
    regexp: /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/,
    transformer: transformString(expression => new MemoryValue(expression)),
});

defineParameterType({
    name: 'state',
    regexp: /((not )?to (?:be )?(present|clickable|visible|invisible|enabled|disabled|in viewport))/,
    transformer: (state) => (locator: Locator) => conditionExpect(locator, state),
    useForSnippets: false
});

defineParameterType({
    name: 'mouseButton',
    regexp: /(left|right|middle)/,
    transformer: p => p,
    useForSnippets: false
});

defineParameterType({
    name: 'browserButton',
    regexp: /(back|forward)/,
    transformer: p => p,
    useForSnippets: false
});

/**
 * Used for parsing responses body
 *
 * @returns {string}
 */
defineParameterType({
    name: 'bodyParsingType',
    regexp: /buffer|json|text/,
    transformer: (p) => p === 'buffer' ? 'body' : p,
    useForSnippets: false,
});

/**
 * Used to initialize one of two possible GraphQl body properties
 *
 * @returns {string}
 */
defineParameterType({
    name: 'gqlRequestProperty',
    regexp: /query|variables/,
    transformer: s => s
});