import Memory from './memory';
import App from './page_object';

export default {
    paths: ['test-e2e/features/*.feature'],
    require: [
        'src/*.ts',
        'test-e2e/step_definitions/*.ts'
    ],
    memory: new Memory(),
    pageObject: App
}

export const electron = {
    paths: ['test-e2e/features/electron/*.feature'],
    require: [
        'src/*.ts',
        'test-e2e/step_definitions/electron/*.ts',
        'test-e2e/step_definitions/*.ts'
    ],
    memory: new Memory(),
    pageObject: App
}