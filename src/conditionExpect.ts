import { Locator, expect } from '@playwright/test';

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
        reverse: boolean
    ) => expectLocator(locator, reverse).toBeAttached(),
    [conditionValidations.VISIBLE]: (
        locator: Locator,
        reverse: boolean
    ) => expectLocator(locator, reverse).toBeVisible(),
    [conditionValidations.INVISIBLE]: (
        locator: Locator,
        reverse: boolean
    ) => expectLocator(locator, reverse).toBeHidden(),
    [conditionValidations.IN_VIEWPORT]: (
        locator: Locator,
        reverse: boolean
    ) => expectLocator(locator, reverse).toBeInViewport(),
    [conditionValidations.ENABLED]: (
        locator: Locator,
        reverse: boolean
    ) => expectLocator(locator, reverse).toBeEnabled(),
    [conditionValidations.DISABLED]: (
        locator: Locator,
        reverse: boolean
    ) => expectLocator(locator, reverse).toBeDisabled()
}
/**
 * Wait for condition
 * @param {Locator} locator - locator
 * @param condition
 * @return {Promise<void>}
 */
export async function conditionExpect(
    locator: Locator,
    condition: string
) {
    const match = condition.match(conditionWaitExtractRegexp) as RegExpMatchArray;
    if (!match) throw new Error(`${condition} expect is not implemented`);
    const [_, reverse, validation] = match;
    const expectFn = expects[validation];
    await expectFn(locator, Boolean(reverse));
}
