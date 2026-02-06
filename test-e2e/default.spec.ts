import Memory from './memory';
import App from './page_object';
import { defineConfig } from '@qavajs/playwright-runner-adapter';

export default defineConfig({
    paths: ['test-e2e/features/*.feature'],
    require: [
        'src/*.ts',
        'test-e2e/step_definitions/*.ts'
    ],
    memory: new Memory(),
    pageObject: new App()
});