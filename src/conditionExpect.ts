import { expect } from './validationExpect';
import { Locator } from '@playwright/test';

export const conditionValidations = {
    PRESENT: 'present',
    VISIBLE: 'visible',
    INVISIBLE: 'invisible',
    IN_VIEWPORT: 'in viewport',
    ENABLED: 'enabled',
    DISABLED: 'disabled'
}

const notClause = '(not )?';
const toBeClause = 'to (?:be )?';
const validationClause = `(${Object.values(conditionValidations).join('|')})`;

export const conditionWaitExtractRegexp = new RegExp(`^${notClause}${toBeClause}${validationClause}$`);
export const conditionWaitRegexp = new RegExp(`(${notClause}${toBeClause}${validationClause})`);

function expectLocator(locator: Locator, reverse: boolean) {
    return reverse ? expect(locator).not : expect(locator);
}

const expects = {
    [conditionValidations.PRESENT]: async (
        locator: Locator,
        reverse: boolean,
        options?: { timeout: number },
    ) => expectLocator(locator, reverse).toBeAttached(options),
    [conditionValidations.VISIBLE]: (
        locator: Locator,
        reverse: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse).toBeVisible(options),
    [conditionValidations.INVISIBLE]: (
        locator: Locator,
        reverse: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse).toBeHidden(options),
    [conditionValidations.IN_VIEWPORT]: (
        locator: Locator,
        reverse: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse).toBeInViewport(options),
    [conditionValidations.ENABLED]: (
        locator: Locator,
        reverse: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse).toBeEnabled(options),
    [conditionValidations.DISABLED]: (
        locator: Locator,
        reverse: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse).toBeDisabled(options)
}

/**
 * Wait for locator state
 * @param {Locator} locator - locator
 * @param condition
 * @param options
 * @return {Promise<void>}
 */
export async function conditionExpect(
    locator: Locator,
    condition: string,
    options?: { timeout: number },
): Promise<void> {
    const match = condition.match(conditionWaitExtractRegexp) as RegExpMatchArray;
    if (!match) throw new Error(`${condition} expect is not implemented`);
    const [_, reverse, validation] = match;
    const expectFn = expects[validation];
    await expectFn(locator, Boolean(reverse), options);
}
