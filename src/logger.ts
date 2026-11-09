/**
 * Where step logs (memory resolution, locator resolution, `this.log` calls) are written:
 * - `console` - printed to stdout (default)
 * - `step` - collected and attached as a single `log` attachment of the step that produced them
 * - `off` - not written
 */
export type LoggerOutput = 'console' | 'step' | 'off';

export type LoggerConfig = {
    /** where logs are written, defaults to `console` */
    output?: LoggerOutput;
    /**
     * keys (memory keys, object properties, query parameters) whose values are masked in logs,
     * defaults to `defaultSecretPattern`; `false` disables masking
     */
    mask?: RegExp | false;
};

/** keys that usually hold sensitive values */
export const defaultSecretPattern = /passw(or)?d|passphrase|pwd|secret|token|api[-_]?key|authorization|credential|private[-_]?key|cookie/i;

export const MASK = '***';

/** shorter values are not masked when found in arbitrary text, otherwise too much would be replaced */
const MIN_SECRET_LENGTH = 3;

/** memory references in an expression, e.g. `$user.password` in `{$user.password}` */
const MEMORY_REFERENCE_REGEXP = /\$[\w$.]+/g;

/** memory logger messages: `$expression -> resolved value` and `$key <- saved value` */
const MEMORY_LOG_REGEXP = /^([\s\S]*?) (->|<-) ([\s\S]*)$/;

/**
 * Property-like pairs: `"key": "value"` (json), `key: 'value'` (inspect), `key=value` (query string),
 * `Key: value` (headers). Groups: key quote, key, separator, value.
 */
const PROPERTY_REGEXP = /(["']?)([\w$.-]+)\1(\s*[:=]\s*)("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|[^\s,;&}\]][^,;&}\]\n]*?(?=\s*(?:[,;&}\]\n]|$)))/g;

function unquote(value: string): string {
    return /^(["']).*\1$/s.test(value) ? value.slice(1, -1) : value;
}

/**
 * Masks sensitive values in log messages.
 * Values of secret keys are masked in place and remembered,
 * so the same values are masked wherever they appear later (e.g. typed into an input or interpolated into a url).
 */
export class Masker {
    private readonly pattern?: RegExp;
    private readonly secrets = new Set<string>();

    constructor(pattern: RegExp | false = defaultSecretPattern) {
        // drop stateful flags, so `test` does not depend on previous calls
        this.pattern = pattern ? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '')) : undefined;
    }

    get enabled(): boolean {
        return this.pattern !== undefined;
    }

    isSecretKey(key: string): boolean {
        return this.pattern?.test(key) ?? false;
    }

    /**
     * Remember value to be masked wherever it appears
     */
    addSecret(value: unknown): void {
        if (!this.enabled || (typeof value !== 'string' && typeof value !== 'number')) return;
        const secret = String(value).trim();
        if (secret.length >= MIN_SECRET_LENGTH && !secret.includes('\n') && secret !== MASK) {
            this.secrets.add(secret);
        }
    }

    /**
     * Mask values of secret properties and all remembered secrets in text
     */
    mask(text: string): string {
        if (!this.enabled) return text;
        const masked = text.replace(PROPERTY_REGEXP, (match, quote: string, key: string, separator: string, value: string) => {
            if (!this.isSecretKey(key)) return match;
            this.addSecret(unquote(value));
            const valueQuote = /^["']/.test(value) ? value[0] : '';
            return `${quote}${key}${quote}${separator}${valueQuote}${MASK}${valueQuote}`;
        });
        return this.maskSecrets(masked);
    }

    /**
     * Mask message of memory logger.
     * Value is masked entirely if expression references a secret key (e.g. `$password` or `{$user.token}`)
     */
    maskMemoryLog(message: string): string {
        const groups = MEMORY_LOG_REGEXP.exec(message);
        if (!this.enabled || !groups) return this.mask(message);
        const [, expression, direction, value] = groups;
        const references = expression.match(MEMORY_REFERENCE_REGEXP) ?? [];
        if (references.some(reference => this.isSecretKey(reference))) {
            this.addSecret(value);
            return `${this.maskSecrets(expression)} ${direction} ${MASK}`;
        }
        return this.mask(message);
    }

    private maskSecrets(text: string): string {
        // longer secrets first, so a secret containing another one is masked entirely
        const secrets = [...this.secrets].sort((a, b) => b.length - a.length);
        return secrets.reduce((masked, secret) => masked.replaceAll(secret, MASK), text);
    }
}

type Definition = { code: Function };
type LogOwner = { flushLogs?: () => Promise<void> };

const FLUSHES_LOGS = Symbol.for('qavajs.flushesLogs');

const DEFINITION_KEYS = [
    'stepDefinitions',
    'beforeTestCaseHookDefinitions',
    'afterTestCaseHookDefinitions',
    'beforeTestStepHookDefinitions',
    'afterTestStepHookDefinitions'
];

/**
 * Make step and hook definitions flush collected logs when they finish.
 * Flushing happens inside the step, so logs are attached to the step that produced them
 * (including nested steps run by `executeStep`) without extra hook steps in the report.
 * Definitions are wrapped once, so the library can be shared by all worlds of a worker.
 */
export function flushLogsAfterDefinitions(supportCodeLibrary: unknown): void {
    if (!supportCodeLibrary) return;
    for (const key of DEFINITION_KEYS) {
        const definitions = (supportCodeLibrary as Record<string, Definition[] | undefined>)[key] ?? [];
        for (const definition of definitions) {
            wrapDefinition(definition);
        }
    }
}

function wrapDefinition(definition: Definition): void {
    const code = definition.code as Function & { [FLUSHES_LOGS]?: boolean };
    if (typeof code !== 'function' || code[FLUSHES_LOGS]) return;
    const wrapped = async function (this: LogOwner, ...args: unknown[]) {
        try {
            return await code.apply(this, args);
        } finally {
            await this?.flushLogs?.();
        }
    };
    // keep arity and name: cucumber validates code length and prints function name
    Object.defineProperty(wrapped, 'length', { value: code.length });
    Object.defineProperty(wrapped, 'name', { value: code.name });
    Object.defineProperty(wrapped, FLUSHES_LOGS, { value: true });
    definition.code = wrapped;
}
