import { setWorldConstructor, Before } from '@cucumber/cucumber';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import memory from '@qavajs/memory';

setWorldConstructor(QavajsPlaywrightWorld);

Before({ name: 'Setup qavajs' }, async function (this: QavajsPlaywrightWorld) {
    memory.register(this.config.memory);
    memory.setLogger(this);
    this.memory = memory;
});
