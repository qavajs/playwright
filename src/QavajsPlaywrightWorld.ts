import { join } from 'node:path';
import { PlaywrightWorld } from '@qavajs/playwright-runner-adapter';
import { PageObject, $, $$ } from '@qavajs/po-playwright';
import memory from '@qavajs/memory';
import { expect } from './validationExpect';

export class QavajsPlaywrightWorld extends PlaywrightWorld {
    config: any;
    memory!: typeof memory;
    po!: PageObject;
    $!: typeof $;
    $$!: typeof $$;
    expect = expect;

    constructor(options: any) {
        super(options);
        const config = require(join(process.cwd(), process.env.CONFIG ?? 'config.js'));
        const profile = process.env.PROFILE ?? 'default';
        this.config = config[profile];
    }

    async element(alias: string) {
        return this.po.getElement(await this.memory.getValue(alias));
    }

    async value(expression: string) {
        return this.memory.getValue(expression);
    }

    setValue(key: string, value: any) {
        this.memory.setValue(key, value);
    }
}
