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
const softClause = '(softly )?';
const validationClause = `(${Object.values(conditionValidations).join('|')})`;

export const conditionWaitExtractRegexp = new RegExp(`^${notClause}${toBeClause}${softClause}${validationClause}$`);

function expectLocator(locator: Locator, reverse: boolean, soft: boolean) {
    const expectClause = expect.configure({ soft });
    return reverse ? expectClause(locator).not : expectClause(locator);
}

const expects = {
    [conditionValidations.PRESENT]: async (
        locator: Locator,
        reverse: boolean,
        soft: boolean,
        options?: { timeout: number },
    ) => expectLocator(locator, reverse, soft).toBeAttached(options),
    [conditionValidations.VISIBLE]: (
        locator: Locator,
        reverse: boolean,
        soft: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse, soft).toBeVisible(options),
    [conditionValidations.INVISIBLE]: (
        locator: Locator,
        reverse: boolean,
        soft: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse, soft).toBeHidden(options),
    [conditionValidations.IN_VIEWPORT]: (
        locator: Locator,
        reverse: boolean,
        soft: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse, soft).toBeInViewport(options),
    [conditionValidations.ENABLED]: (
        locator: Locator,
        reverse: boolean,
        soft: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse, soft).toBeEnabled(options),
    [conditionValidations.DISABLED]: (
        locator: Locator,
        reverse: boolean,
        soft: boolean,
        options?: { timeout: number }
    ) => expectLocator(locator, reverse, soft).toBeDisabled(options)
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
    const [_, reverse, soft, validation] = match;
    const expectFn = expects[validation];
    await expectFn(locator, Boolean(reverse), Boolean(soft), options);
}
