import { isDeepStrictEqual } from 'node:util';
import { expect as base, type ExpectMatcherState, type Locator } from '@playwright/test';

/**
 * Subset of playwright matcher context (`this` of custom matcher) used by matchers
 */
type MatcherContext = {
    isNot: boolean;
    promise: string;
    timeout: number;
    utils: any;
};

type MatcherResult = {
    name: string;
    pass: boolean;
    message: () => string;
    expected?: unknown;
    actual?: unknown;
    log?: string[];
    timeout?: number;
};

/**
 * Options to poll actual value inside a single matcher call (single report step)
 */
export type PollOptions = {
    /** poll actual value (receiver of the matcher must be a getter) */
    poll?: boolean;
    /** locator the value belongs to (printed in error message) */
    locator?: Locator;
    /** description of polled value, e.g. 'text' or "'href' attribute" */
    property?: string;
    /** poll timeout, defaults to expect timeout */
    timeout?: number;
    /** pauses between attempts, the last one is repeated; defaults to expect.poll intervals */
    intervals?: number[];
};

/** actual value getter; receives time left for a single attempt, so it can be passed to locator methods */
export type Getter = (options: { timeout: number }) => unknown;

type Printed = { printedExpected?: string; printedReceived?: string; printedDiff?: string };

type MatcherDefinition = {
    /** returns true if actual value satisfies expected one; may throw if values can't be compared */
    check(this: MatcherContext, actual: any, expected: any): boolean;
    /** print diff of expected and actual values (for equality matchers) */
    diff?: boolean;
    /** custom printing of expected and received values */
    print?(this: MatcherContext, actual: any, expected: any): Printed;
};

/** same intervals as expect.poll */
const pollIntervals = [100, 250, 500, 1000];

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

/**
 * Check that object has property by path (same path format as toHaveProperty: 'a.b[0].c' or ['a', 'b'])
 */
function hasPath(actual: unknown, path: string | string[]): boolean {
    const keys = Array.isArray(path) ? path : String(path).split(/[.[\]]+/).filter(Boolean);
    let current: any = actual;
    for (const key of keys) {
        if (current === null || current === undefined || !(key in Object(current))) return false;
        current = current[key];
    }
    return keys.length > 0;
}

/**
 * Recursive equality with the same semantics as toEqual: properties with undefined value are ignored,
 * arrays, plain objects, maps and sets are compared recursively
 * (playwright does not expose `this.equals` to custom matchers)
 */
function deepEqual(a: any, b: any): boolean {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (a instanceof Date || b instanceof Date) {
        return a instanceof Date && b instanceof Date && Object.is(a.getTime(), b.getTime());
    }
    if (a instanceof RegExp || b instanceof RegExp) {
        return a instanceof RegExp && b instanceof RegExp && String(a) === String(b);
    }
    if (Array.isArray(a) || Array.isArray(b)) {
        return Array.isArray(a) && Array.isArray(b) &&
            a.length === b.length &&
            a.every((item, index) => deepEqual(item, b[index]));
    }
    if (a instanceof Map || b instanceof Map) {
        return a instanceof Map && b instanceof Map &&
            a.size === b.size &&
            [...a].every(([key, value]) => b.has(key) && deepEqual(value, b.get(key)));
    }
    if (a instanceof Set || b instanceof Set) {
        return a instanceof Set && b instanceof Set &&
            a.size === b.size &&
            [...a].every(item => b.has(item) || [...b].some(other => deepEqual(item, other)));
    }
    const definedKeys = (o: object) => Object.keys(o).filter(key => (o as any)[key] !== undefined);
    const aKeys = definedKeys(a);
    const bKeys = definedKeys(b);
    return aKeys.length === bKeys.length &&
        aKeys.every(key => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
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

function ensureNumber(actual: unknown) {
    if (typeof actual !== 'number' && typeof actual !== 'bigint') {
        throw new Error(`received value must be a number or bigint, but got ${typeof actual}`);
    }
}

const definitions: Record<string, MatcherDefinition> = {
    toSimpleEqual: {
        check: (actual, expected) => actual == expected
    },
    toDeepEqual: {
        check: (actual, expected) => deepEqual(actual, expected),
        diff: true
    },
    toStrictlyEqual: {
        check: (actual, expected) => isDeepStrictEqual(actual, expected),
        diff: true
    },
    toHaveMembers: {
        check: (actual, expected) => Array.isArray(actual) &&
            Array.isArray(expected) &&
            actual.length === expected.length &&
            includesMembers(actual, expected)
    },
    toIncludeMembers: {
        check: (actual, expected) => Array.isArray(actual) &&
            Array.isArray(expected) &&
            includesMembers(actual, expected)
    },
    toHavePropertyPath: {
        check: (actual, expected) => hasPath(actual, expected),
        print(actual, expected) {
            return {
                printedExpected: `Expected path: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expected)}`,
                printedReceived: `Received:      ${this.utils.printReceived(actual)}`
            }
        }
    },
    toMatchRegExp: {
        check: (actual, expected) => typeof actual === 'string' && toRegexp(expected).test(actual),
        print(actual, expected) {
            return {
                printedExpected: `Expected pattern: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(toRegexp(expected))}`,
                printedReceived: `Received string:  ${this.utils.printReceived(actual)}`
            }
        }
    },
    toInclude: {
        check(actual, expected) {
            if (typeof actual === 'string') return actual.includes(String(expected));
            if (actual !== null && actual !== undefined && typeof actual[Symbol.iterator] === 'function') {
                return Array.from(actual as Iterable<unknown>).some(item => isDeepStrictEqual(item, expected));
            }
            return false;
        },
        print(actual, expected) {
            const isString = typeof actual === 'string';
            return {
                printedExpected: `${isString ? 'Expected substring: ' : 'Expected value: '}${this.isNot ? 'not ' : ''}${this.utils.printExpected(expected)}`,
                printedReceived: `${isString ? 'Received string:    ' : 'Received value: '}${this.utils.printReceived(actual)}`
            }
        }
    },
    toBeAbove: {
        check(actual, expected) {
            ensureNumber(actual);
            return actual > toNumber(expected);
        },
        print(actual, expected) {
            return {
                printedExpected: `Expected: ${this.isNot ? 'not ' : ''}> ${this.utils.printExpected(toNumber(expected))}`,
                printedReceived: `Received:   ${this.utils.printReceived(actual)}`
            }
        }
    },
    toBeBelow: {
        check(actual, expected) {
            ensureNumber(actual);
            return actual < toNumber(expected);
        },
        print(actual, expected) {
            return {
                printedExpected: `Expected: ${this.isNot ? 'not ' : ''}< ${this.utils.printExpected(toNumber(expected))}`,
                printedReceived: `Received:   ${this.utils.printReceived(actual)}`
            }
        }
    },
    toHaveType: {
        check: (actual, expected) => typeof actual == expected,
        print(actual, expected) {
            return {
                printedExpected: `Expected type: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expected)}`,
                printedReceived: `Received type: ${this.utils.printReceived(typeof actual)}\nReceived value: ${this.utils.printReceived(actual)}`
            }
        }
    },
    toSatisfy: {
        check: (actual, predicate: (actual: any) => boolean) => Boolean(predicate(actual)),
        print(actual, predicate) {
            return {
                printedExpected: `Expected: ${this.isNot ? 'not ' : ''}to satisfy ${this.utils.EXPECTED_COLOR(String(predicate))}`,
                printedReceived: `Received: ${this.utils.printReceived(actual)}`
            }
        }
    },
    toCaseInsensitiveEqual: {
        check: (actual, expected) => typeof actual === 'string' &&
            typeof expected === 'string' &&
            actual.toLowerCase() === expected.toLowerCase()
    }
};

/**
 * Format error message the same way as playwright native locator matchers do
 */
function formatMessage(ctx: MatcherContext, details: Printed & {
    matcherName: string;
    expectation?: string;
    locator?: Locator;
    poll?: boolean;
    timeout?: number;
    timedOut?: boolean;
    errorMessage?: string;
    log?: string[];
}): string {
    const { utils } = ctx;
    let message = details.poll
        ? utils.DIM_COLOR('expect(') + utils.RECEIVED_COLOR(details.locator ? 'locator' : 'received') +
            utils.DIM_COLOR(')' + (ctx.promise ? '.' + ctx.promise : '') + (ctx.isNot ? '.not' : '') + '.') +
            details.matcherName + utils.DIM_COLOR('(') + utils.EXPECTED_COLOR(details.expectation ?? 'expected') +
            utils.DIM_COLOR(')') + ' failed\n\n'
        : utils.matcherHint(details.matcherName, undefined, details.expectation, { isNot: ctx.isNot, promise: ctx.promise }) + '\n\n';
    let { printedExpected, printedReceived, printedDiff } = details;
    const diffLines = printedDiff?.split('\n');
    if (diffLines?.length === 2) {
        [printedExpected, printedReceived] = diffLines;
        printedDiff = undefined;
    }
    const align = !details.errorMessage &&
        Boolean(printedExpected?.startsWith('Expected:')) &&
        (!printedReceived || printedReceived.startsWith('Received:'));
    if (details.locator) message += `Locator: ${align ? ' ' : ''}${details.locator}\n`;
    if (details.errorMessage) {
        if (printedExpected) message += printedExpected + '\n';
        message += `Error: ${details.errorMessage}\n`;
    } else {
        if (printedDiff) {
            message += printedDiff + '\n';
        } else {
            if (printedExpected) message += printedExpected + '\n';
            if (printedReceived) message += printedReceived + '\n';
        }
    }
    if (details.timedOut && details.timeout) message += `Timeout: ${align ? ' ' : ''}${details.timeout}ms\n`;
    if (details.log?.length) message += `\nCall log:\n${utils.DIM_COLOR(details.log.join('\n'))}\n`;
    return message;
}

/**
 * Collapse repeated consecutive log entries the same way as playwright does (`3 × ...`)
 */
function compressLog(entries: string[]): string[] {
    const log: string[] = [];
    let previous: string | undefined;
    let count = 0;
    const flush = () => {
        if (previous !== undefined) log.push(`  - ${count > 1 ? `${count} × ` : ''}${previous}`);
    };
    for (const entry of entries) {
        if (entry === previous) {
            count++;
            continue;
        }
        flush();
        previous = entry;
        count = 1;
    }
    flush();
    return log;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout<T>(fn: () => T, timeout: number): Promise<Awaited<T>> {
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout ${timeout}ms exceeded`)), timeout);
    });
    try {
        return await Promise.race([Promise.resolve().then(fn), timeoutPromise]);
    } finally {
        clearTimeout(timer);
    }
}

function printPrimitive(utils: any, value: unknown, expected: unknown, isNot: boolean): Printed {
    return {
        printedExpected: `Expected: ${isNot ? 'not ' : ''}${utils.printExpected(expected)}`,
        printedReceived: `Received: ${utils.printReceived(value)}`
    };
}

function printed(ctx: MatcherContext, definition: MatcherDefinition, actual: unknown, expected: unknown): Printed {
    if (definition.print) return definition.print.call(ctx, actual, expected);
    if (definition.diff && !ctx.isNot) {
        return { printedDiff: ctx.utils.printDiffOrStringify(expected, actual, 'Expected', 'Received', true) };
    }
    return printPrimitive(ctx.utils, actual, expected, ctx.isNot);
}

/**
 * Poll value until it satisfies matcher (or timeout). All attempts are performed inside single matcher call,
 * so report contains single step, like for playwright native locator matchers
 */
async function pollMatcher(
    ctx: MatcherContext,
    matcherName: string,
    getter: Getter,
    check: (actual: any) => boolean,
    print: (actual: any) => Printed,
    { locator, property, timeout = ctx.timeout, intervals = pollIntervals }: PollOptions,
    expectation?: string
): Promise<MatcherResult> {
    const deadline = Date.now() + timeout;
    const target = property
        ? `${property}${locator ? ` of ${locator}` : ''}`
        : locator ? 'locator' : 'value';
    const entries = [`Expect "${matcherName}"${locator ? ` ${locator}` : ''} with timeout ${timeout}ms`];
    let actual: unknown;
    let error: Error | undefined;
    let pass = false;
    let timedOut = false;
    for (let attempt = 0; ; attempt++) {
        const remaining = Math.max(deadline - Date.now(), 1);
        try {
            actual = await withTimeout(() => getter({ timeout: remaining }), remaining);
            error = undefined;
            entries.push(`${target} resolved to ${ctx.utils.stringify(actual)}`);
            pass = check(actual);
        } catch (err) {
            error = err as Error;
            entries.push(`${target}: ${error.message.split('\n')[0]}`);
        }
        if (!error && pass !== ctx.isNot) break;
        if (Date.now() >= deadline) {
            timedOut = true;
            break;
        }
        const interval = intervals[Math.min(attempt, intervals.length - 1)];
        await sleep(Math.min(interval, deadline - Date.now()));
        // do not start attempt without time left, so error message reports last resolved value
        if (Date.now() >= deadline) {
            timedOut = true;
            break;
        }
    }
    if (error) pass = ctx.isNot;
    const log = compressLog(entries);
    return {
        name: matcherName,
        pass,
        actual,
        log,
        timeout: timedOut ? timeout : undefined,
        message: () => formatMessage(ctx, {
            ...(error ? { printedExpected: print(actual).printedExpected } : print(actual)),
            matcherName,
            expectation,
            locator,
            poll: true,
            timeout,
            timedOut,
            errorMessage: error?.message,
            log
        })
    };
}

function createMatcher(matcherName: string, definition: MatcherDefinition) {
    /**
     * @param actual - actual value or getter of actual value in case of poll
     * @param expected - expected value
     * @param options - poll options
     */
    return function (this: ExpectMatcherState, actual: any, expected: any, options?: PollOptions): MatcherResult | Promise<MatcherResult> {
        const ctx = this as unknown as MatcherContext;
        if (options?.poll) {
            return pollMatcher(
                ctx,
                matcherName,
                actual as Getter,
                value => definition.check.call(ctx, value, expected),
                value => printed(ctx, definition, value, expected),
                options
            );
        }
        const pass = definition.check.call(ctx, actual, expected);
        return {
            name: matcherName,
            pass,
            expected,
            actual,
            message: () => formatMessage(ctx, { ...printed(ctx, definition, actual, expected), matcherName })
        };
    }
}

export const expect = base.extend({
    toSimpleEqual: createMatcher('toSimpleEqual', definitions.toSimpleEqual),
    toDeepEqual: createMatcher('toDeepEqual', definitions.toDeepEqual),
    toStrictlyEqual: createMatcher('toStrictlyEqual', definitions.toStrictlyEqual),
    toHaveMembers: createMatcher('toHaveMembers', definitions.toHaveMembers),
    toIncludeMembers: createMatcher('toIncludeMembers', definitions.toIncludeMembers),
    toHavePropertyPath: createMatcher('toHavePropertyPath', definitions.toHavePropertyPath),
    toMatchRegExp: createMatcher('toMatchRegExp', definitions.toMatchRegExp),
    toInclude: createMatcher('toInclude', definitions.toInclude),
    toBeAbove: createMatcher('toBeAbove', definitions.toBeAbove),
    toBeBelow: createMatcher('toBeBelow', definitions.toBeBelow),
    toHaveType: createMatcher('toHaveType', definitions.toHaveType),
    toSatisfy: createMatcher('toSatisfy', definitions.toSatisfy),
    toCaseInsensitiveEqual: createMatcher('toCaseInsensitiveEqual', definitions.toCaseInsensitiveEqual),
    /**
     * Locator is visible and enabled
     */
    toBeClickable(this: ExpectMatcherState, locator: Locator, options: { timeout?: number } = {}): Promise<MatcherResult> {
        return pollMatcher(
            this as unknown as MatcherContext,
            'toBeClickable',
            async ({ timeout }) => {
                if (!await locator.isVisible()) return 'hidden';
                return await locator.isEnabled({ timeout }) ? 'clickable' : 'disabled';
            },
            state => state === 'clickable',
            state => ({
                printedExpected: `Expected: ${this.isNot ? 'not ' : ''}clickable`,
                printedReceived: `Received: ${state}`
            }),
            { locator, timeout: options.timeout },
            ''
        );
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

/**
 * Matcher implementing each validation
 */
const matchers: Record<string, keyof typeof definitions> = {
    [validations.EQUAL]: 'toSimpleEqual',
    [validations.DEEPLY_EQUAL]: 'toDeepEqual',
    [validations.STRICTLY_EQUAL]: 'toStrictlyEqual',
    [validations.HAVE_MEMBERS]: 'toHaveMembers',
    [validations.INCLUDE_MEMBERS]: 'toIncludeMembers',
    [validations.HAVE_PROPERTY]: 'toHavePropertyPath',
    [validations.MATCH]: 'toMatchRegExp',
    [validations.CONTAIN]: 'toInclude',
    [validations.ABOVE]: 'toBeAbove',
    [validations.BELOW]: 'toBeBelow',
    [validations.GREATER]: 'toBeAbove',
    [validations.LESS]: 'toBeBelow',
    [validations.HAVE_TYPE]: 'toHaveType',
    [validations.SATISFY]: 'toSatisfy',
    [validations.CASE_INSENSITIVE_EQUAL]: 'toCaseInsensitiveEqual',
};

/**
 * Validate actual value against expected one
 * @param actual - actual value (or getter returning value in case of poll)
 * @param expected - expected value
 * @param condition - validation condition (e.g. 'to equal')
 * @param options - poll options (locator and property are printed in error message)
 */
export function valueExpect(
    actual: any,
    expected: any,
    condition: string,
    options: PollOptions = { poll: false }
) {
    const match = condition.match(validationExtractRegexp);
    if (!match) throw new Error(`${condition} expect is not implemented`);
    const [_, reverse, soft, validation] = match;
    const matcherName = matchers[validation];
    if (!matcherName) throw new Error(`${validation} expect is not implemented`);
    const expectClause = expect.configure({ soft: Boolean(soft) })(actual);
    const matcher = (reverse ? expectClause.not : expectClause) as unknown as
        Record<string, (expected: any, options?: PollOptions) => any>;
    return matcher[matcherName](expected, options.poll ? options : undefined);
}
