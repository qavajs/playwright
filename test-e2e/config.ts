import Memory from './memory';
import App from './page_object';

export default {
    paths: ['test-e2e/features/*.feature'],
    require: [
        'src/*.ts',
        'test-e2e/step_definitions/*.ts'
    ],
    memory: new Memory(),
    pageObject: new App()
}
