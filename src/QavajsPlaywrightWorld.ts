import { join } from 'node:path';
import { PlaywrightWorld } from '@qavajs/playwright-runner-adapter';
import { PageObject, $, $$ } from '@qavajs/po-playwright';
import memory from '@qavajs/memory';
import { expect } from './validationExpect';
import { element } from './pageObject';

export class QavajsPlaywrightWorld extends PlaywrightWorld {
    config: any;
    memory!: typeof memory;
    po!: PageObject;
    $!: typeof $;
    $$!: typeof $$;
    expect = expect;
    element = element;
    
    constructor(options: any) {
        super(options);
        const config = require(join(process.cwd(), process.env.CONFIG ?? 'config.js'));
        const profile = process.env.PROFILE ?? 'default';
        this.config = config[profile];
    }

    value(expression: string): any {
        return this.memory.getValue(expression);
    }

    setValue(key: string, value: any) {
        this.memory.setValue(key, value);
    }
}
