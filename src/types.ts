import memory from '@qavajs/memory';
import {Locator} from "@playwright/test";

export class MemoryValue {
    constructor(public expression: string) {}

    /**
     * Return resolved value
     * @example
     * url.value()
     * @return Promise<any>
     */
    value() { return memory.getValue(this.expression) }

    /**
     * Set value to memory with provided key
     * @param value any - value to set
     * @example
     * url.set('https://qavajs.github.io/')
     */
    set(value: any): void { memory.setValue(this.expression, value); }
}

export interface Validation {
    (AR: any, ER: any): void;
    type: string;
    poll: (AR: any, ER: any) => Promise<void>
}

export type StateValidation = (locator: Locator) => Promise<void>;