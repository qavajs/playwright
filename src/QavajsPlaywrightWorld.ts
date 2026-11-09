import { inspect } from 'node:util';
import { PlaywrightWorld } from '@qavajs/playwright-runner-adapter';
import type { Dialog } from '@playwright/test';
import memory from '@qavajs/memory';
import { expect } from './validationExpect';
import { element } from './pageObject';
import { flushLogsAfterDefinitions, Masker, type LoggerConfig, type LoggerOutput } from './logger';

export type QavajsConfig = PlaywrightWorld['config'] & {
    memory?: object;
    pageObject?: any;
    logger?: LoggerConfig;
};

export type QavajsWorldOptions = ConstructorParameters<typeof PlaywrightWorld>[0];

export class QavajsPlaywrightWorld extends PlaywrightWorld {
    config: QavajsConfig;
    memory: typeof memory = memory;
    expect = expect;
    element = element;
    /** dialog that has been opened, but not handled yet */
    dialog?: Dialog;
    /** masks sensitive values in logs */
    masker: Masker;
    /** logs of the current step (`step` logger output) */
    private logBuffer: string[] = [];
    private readonly logOutput: LoggerOutput;

    constructor(options: QavajsWorldOptions) {
        super(options);
        this.config = (options.config ?? {}) as QavajsConfig;
        this.logOutput = this.config.logger?.output ?? 'console';
        this.masker = new Masker(this.config.logger?.mask);
        this.log = (data: unknown) => this.writeLog(typeof data === 'string' ? data : inspect(data));
        if (this.logOutput === 'step') {
            flushLogsAfterDefinitions(this.supportCodeLibrary);
        }
        if (this.config.memory) {
            memory.register(this.config.memory);
        }
        memory.setLogger({ log: (message: string) => this.writeLog(message, true) });
    }

    value(expression: string): any {
        return this.memory.getValue(expression);
    }

    setValue(key: string, value: any) {
        this.memory.setValue(key, value);
    }

    /**
     * Attach logs collected during the current step as a single `log` attachment.
     * Called automatically when a step or hook finishes if logger output is `step`.
     */
    async flushLogs(): Promise<void> {
        if (this.logBuffer.length === 0) return;
        const body = this.logBuffer.join('\n');
        this.logBuffer = [];
        try {
            // unlike `testInfo.attach`, pushing does not add `Attach "log"` step to the report:
            // attachment is added to the current step directly
            this.test.info().attachments.push({ name: 'log', contentType: 'text/plain', body: Buffer.from(body) });
        } catch {
            // e.g. test has already finished
            console.log(body);
        }
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

    private writeLog(message: string, fromMemory = false): void {
        if (this.logOutput === 'off') return;
        const masked = fromMemory ? this.masker.maskMemoryLog(message) : this.masker.mask(message);
        if (this.logOutput === 'step') {
            this.logBuffer.push(masked);
        } else {
            console.log(this.consolePrefix() + masked);
        }
    }

    /**
     * Worker index prefix, so logs of parallel workers can be told apart in console
     */
    private consolePrefix(): string {
        try {
            const info = this.test.info();
            return info.config.workers > 1 ? `[worker ${info.parallelIndex}] ` : '';
        } catch {
            return '';
        }
    }
}
