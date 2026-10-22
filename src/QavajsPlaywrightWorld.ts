import { PlaywrightWorld } from '@qavajs/playwright-runner-adapter';
import type { Dialog } from '@playwright/test';
import memory from '@qavajs/memory';
import { expect } from './validationExpect';
import { element } from './pageObject';

export type QavajsConfig = PlaywrightWorld['config'] & {
    memory?: object;
    pageObject?: any;
};

export type QavajsWorldOptions = ConstructorParameters<typeof PlaywrightWorld>[0];

export class QavajsPlaywrightWorld extends PlaywrightWorld {
    config: QavajsConfig;
    memory: typeof memory = memory;
    expect = expect;
    element = element;
    /** dialog that has been opened, but not handled yet */
    dialog?: Dialog;

    constructor(options: QavajsWorldOptions) {
        super(options);
        this.config = (options.config ?? {}) as QavajsConfig;
        if (this.config.memory) {
            memory.register(this.config.memory);
        }
        memory.setLogger(this);
    }

    value(expression: string): any {
        return this.memory.getValue(expression);
    }

    setValue(key: string, value: any) {
        this.memory.setValue(key, value);
    }

    /**
     * Get dialog that is already open (e.g. checked by `I expect text of alert` step) or wait for the next one
     * @param {boolean} keepOpen - keep dialog to be handled by later steps
     */
    async waitForDialog({ keepOpen }: { keepOpen: boolean } = { keepOpen: false }): Promise<Dialog> {
        const dialog = this.dialog ?? await this.page.waitForEvent('dialog');
        this.dialog = keepOpen ? dialog : undefined;
        return dialog;
    }
}
