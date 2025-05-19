import { expect as base } from '@playwright/test';

export const expect = base.extend({
    toSimpleEqual(actual: any, expected: any) {
        const name = 'to equal';
        const pass = actual == expected;
        return {
            expected,
            actual,
            name,
            message: () => `expected ${this.utils.printExpected(actual)} ${pass ? 'not ': ''}to equal ${this.utils.printReceived(expected)}`,
            pass,
        };
    },
    toHaveType(actual: any, expected: string) {
        const pass = typeof actual == expected;
        return {
            message: () => `expected ${actual} ${pass ? 'not ': ''}to have type ${this.utils.printReceived(expected)}`,
            pass
        }
    },
});

export const validations = {
    EQUAL: 'equal',
    DEEPLY_EQUAL: 'deeply equal',
    STRICTLY_EQUAL: 'strictly equal',
    HAVE_MEMBERS: 'have member',
    MATCH: 'match',
    CONTAIN: 'contain',
    ABOVE: 'above',
    BELOW: 'below',
    GREATER: 'greater than',
    LESS: 'less than',
    HAVE_TYPE: 'have type',
    INCLUDE_MEMBERS: 'include member',
    MATCH_SCHEMA: 'match schema',
};

const isClause = '(?:is |do |does |to )?';
const notClause = '(?<reverse>not |to not )?';
const toBeClause = '(?:to )?(?:be )?';
const softClause = '(softly )?';
const validationClause = `(?:(?<validation>${Object.values(validations).join('|')})(?:s|es)?)`;

export const validationExtractRegexp = new RegExp(`^${isClause}${notClause}${toBeClause}${softClause}${validationClause}$`);

type ExpectOptions = {
    expected: any,
    actual?: any,
    reverse: boolean,
    poll?: boolean,
    soft?: boolean,
    message?: string
};

function expectValue({ expected, reverse, poll, soft, message }: ExpectOptions) {
    const softClause = expect.configure({ soft });
    const expectClause = poll ? softClause.poll(expected, message) : softClause(expected, message);
    return reverse ? expectClause.not : expectClause;
}

function toNumber(n: any): number {
    const parsedNumber = parseFloat(n);
    if (Number.isNaN(parsedNumber)) {
        throw new Error(`${n} is not a number`);
    }
    return parsedNumber
}

function toRegexp(r: string | RegExp): RegExp {
    return r instanceof RegExp ? r : new RegExp(r)
}

const aboveFn = ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, soft }).toBeGreaterThan(toNumber(actual));
const belowFn = ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, soft }).toBeLessThan(toNumber(actual));

const expects = {
    [validations.EQUAL]:
        // @ts-ignore
        ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, message: 'expect.toEqual', soft }).toSimpleEqual(actual),
    [validations.STRICTLY_EQUAL]:
        ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, soft }).toEqual(actual),
    [validations.DEEPLY_EQUAL]:
        ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, soft }).toEqual(actual),
    [validations.MATCH]:
        ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, soft }).toMatch(toRegexp(actual)),
    [validations.CONTAIN]:
        ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, soft }).toContain(actual),
    [validations.ABOVE]: aboveFn,
    [validations.BELOW]: belowFn,
    [validations.GREATER]: aboveFn,
    [validations.LESS]: belowFn,
    [validations.HAVE_TYPE]:
        // @ts-ignore
        ({ expected, actual, reverse, poll, soft }: ExpectOptions) => expectValue({ expected, reverse, poll, soft }).toHaveType(actual),
};

export function valueExpect(
    expected: any,
    actual: any,
    condition: string,
    options: {
        poll: boolean
    } = {
        poll: false
    }
) {
    const match = condition.match(validationExtractRegexp) as RegExpMatchArray;
    if (!match) throw new Error(`${condition} expect is not implemented`);
    const [_, reverse, soft, validation] = match;
    const expectFn = expects[validation];
    return expectFn({
        expected,
        actual,
        reverse: Boolean(reverse),
        poll: options.poll,
        soft: Boolean(soft)
    });
}
