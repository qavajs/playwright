import { setWorldConstructor, Before } from '@cucumber/cucumber';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { po, $, $$ } from '@qavajs/po-playwright';
import memory from '@qavajs/memory';

setWorldConstructor(QavajsPlaywrightWorld);

Before(async function (this: QavajsPlaywrightWorld) {
    po.init(this.page, { logger: this, timeout: 2000 });
    po.register(this.config.pageObject);
    this.po = po;
    this.$ = $;
    this.$$ = $$;
    memory.register(this.config.memory);
    memory.setLogger(this);
    this.memory = memory;
});
