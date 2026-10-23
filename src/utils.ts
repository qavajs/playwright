import { type DataTable } from '@qavajs/playwright-runner-adapter';
import { type QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { type APIRequestContext, type APIResponse, type Expect } from '@playwright/test';

/**
 * Parse 'x, y' string to coordinates array
 * @param {string} coords - 'x, y' string
 * @return {number[]} - coords array
 */
export function parseCoords(coords: string): number[] {
    return coords.split(/\s?,\s?/).map((c: string) => Number.parseFloat(c))
}

/**
 * Parse 'x, y' string to coordinates object
 * @param {string} coords - 'x, y' string
 * @return {{x: number, y: number}} - coords object
 */
export function parseCoordsAsObject(coords: string): { x: number, y: number } {
    const [x, y] = parseCoords(coords);
    return {x, y}
}

/**
 * Browser side getter of element property (passed to locator.evaluate)
 */
export const propertyOf = (node: any, property: string) => node[property];

/**
 * Browser side getter of element computed css property (passed to locator.evaluate)
 */
export const cssPropertyOf = (node: Element, property: string) => getComputedStyle(node).getPropertyValue(property);

export async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(0), ms));
}

/**
 * Transform key-value data table to JS object
 * @param ctx
 * @param dataTable
 * @return {Object}
 */
export async function dataTable2Object(ctx: QavajsPlaywrightWorld, dataTable: DataTable): Promise<Record<string, any>> {
    const obj: Record<string, any> = {};
    for (const [key, value] of dataTable.raw()) {
        obj[key] = await ctx.value(value);
    }
    return obj;
}

/**
 * Transform key-value data table to array
 * @param ctx
 * @param dataTable
 * @return {any[]}
 */
export function dataTable2Array(ctx: QavajsPlaywrightWorld, dataTable: DataTable): Promise<any[]> {
    return Promise.all(dataTable.raw().map(([value]) => ctx.value(value)));
}

export type HttpRequestOptions = Parameters<APIRequestContext['fetch']>[1];

export async function sendHttpRequest(world: QavajsPlaywrightWorld, requestUrl: string, options: HttpRequestOptions): Promise<APIResponse> {
    const response = await world.request.fetch(requestUrl, options);
    Object.defineProperty(response, 'payload', {
        get(): any {
            if (this._isPayloadSet) return this._payload;
            throw new Error(`'payload' property is not set.\nCall 'I parse {string} body as {bodyParsingType}' step`);
        },
        set(value: any) {
            this._isPayloadSet = true;
            this._payload = value;
        }
    });
    return response;
}

export class GraphQl {
    method = 'POST';
    headers = {'Content-Type': 'application/json'}
    _query = '';
    _variables = {};
    data = {};

    private updateBody() {
        this.data = {query: this._query, variables: this._variables};
    };

    set query(query: string) {
        this._query = query;
        this.updateBody();
    };

    set variables(variables: string) {
        try {
            this._variables = JSON.parse(variables);
        } catch (error) {
            throw new Error(`GraphQL variables are not valid json: ${(error as Error).message}\n${variables}`);
        }
        this.updateBody();
    };
}

/**
 * Build fulfill options: strings and buffers are sent as is, other values are serialized as json
 */
export function responseBody(body: unknown): { body: string | Buffer } | { json: unknown } {
    return typeof body === 'string' || Buffer.isBuffer(body)
        ? { body }
        : { json: body };
}

/** max total time to repeat action until condition is met */
export const untilTimeout = 60_000;
/** pause between action and next condition check (gives app time to react on action) */
export const untilInterval = 5_000;

/**
 * Repeat action until condition is met
 * @param expect - expect instance
 * @param tryFn - condition, throws if not met
 * @param thenFn - action performed when condition is not met
 * @param options - total timeout and pause between attempts
 */
export async function tryThen(
    expect: Expect<any>,
    tryFn: () => Promise<unknown>,
    thenFn: () => Promise<unknown>,
    { timeout = untilTimeout, interval = untilInterval }: { timeout?: number, interval?: number } = {}
) {
    await expect(async () => {
        try {
            await tryFn();
        } catch (error) {
            await thenFn();
            throw error;
        }
    }).toPass({
        timeout,
        intervals: [ interval ]
    });
}
