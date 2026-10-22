import { isDeepStrictEqual } from 'node:util';
import { expect as base } from '@playwright/test';

/**
 * Check that every expected member is present in actual array (respecting duplicates)
 */
function includesMembers(actual: any[], expected: any[]): boolean {
    const rest = [...actual];
    return expected.every(member => {
        const index = rest.findIndex(item => isDeepStrictEqual(item, member));
        if (index === -1) return false;
        rest.splice(index, 1);
        return true;
    });
}

export const expect = base.extend({
    toSimpleEqual(actual: any, expected: any) {
        const name = 'to equal';
        const pass = actual == expected;
        return {
            expected,
            actual,
            name,
            message: () => `expected ${this.utils.printReceived(actual)} ${pass ? 'not ': ''}to equal ${this.utils.printExpected(expected)}`,
            pass,
        };
    },
    toHaveType(actual: any, expected: string) {
        const pass = typeof actual == expected;
        return {
            message: () => `expected ${this.utils.printReceived(actual)} ${pass ? 'not ': ''}to have type ${this.utils.printExpected(expected)}`,
            pass
        }
    },
    toSatisfy(actual: any, predicate: (actual: any) => boolean) {
        const pass = predicate(actual);
        return {
            message: () => `expected ${this.utils.printReceived(actual)} ${pass ? 'not ': ''}to satisfy ${this.utils.printExpected(predicate)}`,
            pass
        }
    },
    toHaveMembers(actual: unknown, expected: any[]) {
        const pass = Array.isArray(actual) &&
            Array.isArray(expected) &&
            actual.length === expected.length &&
            includesMembers(actual, expected);
        return {
            message: () => `expected ${this.utils.printReceived(actual)} ${pass ? 'not ': ''}to have members ${this.utils.printExpected(expected)}`,
            pass
        }
    },
    toIncludeMembers(actual: unknown, expected: any[]) {
        const pass = Array.isArray(actual) &&
            Array.isArray(expected) &&
            includesMembers(actual, expected);
        return {
            message: () => `expected ${this.utils.printReceived(actual)} ${pass ? 'not ': ''}to include members ${this.utils.printExpected(expected)}`,
            pass
        }
    }
});

export const validations = {
    EQUAL: 'equal',
    DEEPLY_EQUAL: 'deeply equal',
    STRICTLY_EQUAL: 'strictly equal',
    HAVE_MEMBERS: 'have member',
    INCLUDE_MEMBERS: 'include member',
    HAVE_PROPERTY: 'have property',
    MATCH: 'match',
    CONTAIN: 'contain',
    ABOVE: 'above',
    BELOW: 'below',
    GREATER: 'greater than',
    LESS: 'less than',
    HAVE_TYPE: 'have type',
    SATISFY: 'satisfy',
    CASE_INSENSITIVE_EQUAL: 'case insensitive equal',
};

const isClause = '(?:is |do |does |to )?';
const toBeClause = '(?:to )?(?:be )?';
const validationList = Object.values(validations).join('|');

/**
 * Source of validation regexp without capturing groups (except the outer one added by consumer).
 * Used to define {validation} parameter type, so it is always in sync with implemented validations
 */
export const validationRegexpSource = `${isClause}(?:not |to not )?${toBeClause}(?:softly )?(?:${validationList})(?:s|es)?`;

export const validationExtractRegexp = new RegExp(`^${isClause}(not |to not )?${toBeClause}(softly )?(?:(${validationList})(?:s|es)?)$`);

type ExpectOptions = {
    actual: any,
    expected?: any,
    reverse: boolean,
    poll?: boolean,
    soft?: boolean,
    message?: string
};

type ValueMatchers = ReturnType<typeof expect<unknown>>;

/**
 * Build expect clause. Poll and regular matchers share the same (custom) matchers at runtime,
 * so poll clause is narrowed to the regular matchers type
 */
function expectValue({ actual, reverse, poll, soft, message }: ExpectOptions): ValueMatchers {
    const softExpect = expect.configure({ soft });
    const expectClause = poll
        ? softExpect.poll(actual, message) as unknown as ValueMatchers
        : softExpect<unknown>(actual, message);
    return reverse ? expectClause.not : expectClause;
}

function toNumber(n: any): number {
    const parsedNumber = Number.parseFloat(n);
    if (Number.isNaN(parsedNumber)) {
        throw new Error(`${n} is not a number`);
    }
    return parsedNumber
}

function toRegexp(r: string | RegExp): RegExp {
    return r instanceof RegExp ? r : new RegExp(r)
}

const aboveFn = ({ expected, ...options }: ExpectOptions) => expectValue(options).toBeGreaterThan(toNumber(expected));
const belowFn = ({ expected, ...options }: ExpectOptions) => expectValue(options).toBeLessThan(toNumber(expected));

const expects: Record<string, (options: ExpectOptions) => any> = {
    [validations.EQUAL]:
        ({ expected, ...options }) => expectValue({ ...options, message: 'expect.toEqual' }).toSimpleEqual(expected),
    [validations.STRICTLY_EQUAL]:
        ({ expected, ...options }) => expectValue(options).toStrictEqual(expected),
    [validations.DEEPLY_EQUAL]:
        ({ expected, ...options }) => expectValue(options).toEqual(expected),
    [validations.HAVE_MEMBERS]:
        ({ expected, ...options }) => expectValue(options).toHaveMembers(expected),
    [validations.INCLUDE_MEMBERS]:
        ({ expected, ...options }) => expectValue(options).toIncludeMembers(expected),
    [validations.HAVE_PROPERTY]:
        ({ expected, ...options }) => expectValue(options).toHaveProperty(expected),
    [validations.MATCH]:
        ({ expected, ...options }) => expectValue(options).toMatch(toRegexp(expected)),
    [validations.CONTAIN]:
        ({ expected, ...options }) => expectValue(options).toContain(expected),
    [validations.ABOVE]: aboveFn,
    [validations.BELOW]: belowFn,
    [validations.GREATER]: aboveFn,
    [validations.LESS]: belowFn,
    [validations.HAVE_TYPE]:
        ({ expected, ...options }) => expectValue(options).toHaveType(expected),
    [validations.CASE_INSENSITIVE_EQUAL]:
        ({ expected, actual, ...options }) => expectValue({ ...options, actual: actual.toLowerCase() }).toEqual(expected.toLowerCase()),
    [validations.SATISFY]:
        ({ expected, ...options }) => expectValue(options).toSatisfy(expected),
};

/**
 * Validate actual value against expected one
 * @param actual - actual value (or function returning value in case of poll)
 * @param expected - expected value
 * @param condition - validation condition (e.g. 'to equal')
 * @param options
 */
export function valueExpect(
    actual: any,
    expected: any,
    condition: string,
    options: {
        poll: boolean
    } = {
        poll: false
    }
) {
    const match = condition.match(validationExtractRegexp);
    if (!match) throw new Error(`${condition} expect is not implemented`);
    const [_, reverse, soft, validation] = match;
    const expectFn = expects[validation];
    if (!expectFn) throw new Error(`${validation} expect is not implemented`);
    return expectFn({
        actual,
        expected,
        reverse: Boolean(reverse),
        poll: options.poll,
        soft: Boolean(soft)
    });
}
