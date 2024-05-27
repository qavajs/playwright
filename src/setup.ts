import { setWorldConstructor, Before } from '@cucumber/cucumber';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { po, $, $$ } from '@qavajs/po-playwright';

setWorldConstructor(QavajsPlaywrightWorld);

Before(async function (this: QavajsPlaywrightWorld) {
    po.init(this.page, { logger: this, timeout: 2000 });
    po.register(this.config.pageObject);
    this.po = po;
    this.$ = $;
    this.$$ = $$;
});
