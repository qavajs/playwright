# @qavajs/playwright
qavajs implementation for playwright test runner

## Installation

`npm install @qavajs/playwright`
`npm install @qavajs/playwright-runner-adapter`

## Configuration
cucumber.ts
```typescript
import Memory from './memory';
import App from './page_object';

export default {
    paths: ['features/*.feature'],
    require: [
        'node_modules/@qavajs/playwright/index.js', // package steps
        'step_definitions/*.ts' // custom step definitions
    ],
    memory: new Memory(),
    pageObject: new App()
}
```
playwright.config.ts
```typescript
import { defineCucumber } from '@qavajs/playwright-runner-adapter';

export default defineConfig({
    testDir: defineCucumber({
        config: 'test-e2e/config.ts',
        profile: 'smoke'
    }),
    ...
});
```

## Development and testing
Install dependencies
`npm install`

Install playwright browsers
`install:browsers`

Build lib
`npm run build`

Execute e2e browser tests
`npm run test:e2e`
