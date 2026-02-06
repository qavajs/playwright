import { PlaywrightWorld } from '@qavajs/playwright-runner-adapter';
import memory from '@qavajs/memory';
import { expect } from './validationExpect';
import { element } from './pageObject';

export class QavajsPlaywrightWorld extends PlaywrightWorld {
    config: any;
    memory!: typeof memory;
    expect = expect;
    element = element;
    
    constructor(options: any) {
        super(options);
        this.config = options.config;
        if (this.config?.memory) {
            memory.register(this.config.memory);
            memory.setLogger(this);
            this.memory = memory;
        }
    }

    value(expression: string): any {
        return this.memory.getValue(expression);
    }

    setValue(key: string, value: any) {
        this.memory.setValue(key, value);
    }
}
