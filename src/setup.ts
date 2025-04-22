import { setWorldConstructor } from '@qavajs/playwright-runner-adapter';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';

setWorldConstructor(QavajsPlaywrightWorld);