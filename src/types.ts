import { Locator } from '@playwright/test';
import type { Getter, PollOptions } from './validationExpect';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';

export class MemoryValue {
    constructor(public world: QavajsPlaywrightWorld, public expression: string) {}

    /**
     * Return resolved value
     * @example
     * url.value()
     * @return Promise<any>
     */
    value() { return this.world.value(this.expression) }

    /**
     * Set value to memory with provided key
     * @param value any - value to set
     * @example
     * url.set('https://qavajs.github.io/')
     */
    set(value: any): void { this.world.setValue(this.expression, value); }
}

export interface Validation {
    (AR: any, ER: any): void;
    type: string;
    /**
     * Poll actual value until it satisfies validation
     * @param AR - getter of actual value
     * @param ER - expected value
     * @param options - locator and description of polled value (printed in error message), timeout
     */
    poll: (AR: Getter, ER: any, options?: Omit<PollOptions, 'poll'>) => Promise<void>
}

export type StateValidation = (locator: Locator, options?: { timeout: number }) => Promise<void>;