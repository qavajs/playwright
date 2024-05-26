import { DataTable } from '@cucumber/cucumber';
import {QavajsPlaywrightWorld} from '../PlaywrightWorld';

function normalizeScenarioName(name: string): string {
    return name.replace(/\W/g, '-')
}

/**
 * Parse 'x, y' string to coordinates array
 * @param {string} coords - 'x, y' string
 * @return {number[]} - coords array
 */
export function parseCoords(coords: string): number[] {
    return coords.split(/\s?,\s?/).map((c: string) => parseFloat(c ?? 0))
}

export async function throwTimeoutError(fn: Function, message: string) {
    try {
        await fn()
    } catch (err: any) {
        if (err.message.includes('exceeded while waiting on the predicate')) {
            throw new Error(message);
        }
        throw err
    }
}

/**
 * Parse 'x, y' string to coordinates object
 * @param {string} coords - 'x, y' string
 * @return {{x: number, y: number}} - coords object
 */
export function parseCoordsAsObject(coords: string): { x: number, y: number } {
    const [x, y] = coords.split(/\s?,\s?/).map((c: string) => parseFloat(c ?? 0));
    return {x, y}
}

export async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(0), ms));
}

/**
 * Transform key-value data table to JS object
 * @param ctx
 * @param dataTable
 * @return {Object}
 */
export async function dataTable2Object(ctx: QavajsPlaywrightWorld, dataTable: DataTable): Promise<{ [key: string]: string }> {
    const obj: { [key: string]: string } = {};
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
