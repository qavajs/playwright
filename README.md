# @qavajs/playwright
qavajs implementation for playwright test runner

## Installation

```bash
npm install @qavajs/playwright
```

## Configuration
cucumber.ts
```typescript
import Memory from './memory';
import App from './page_object';

export default {
    paths: ['features/*.feature'],
    require: [
        'node_modules/@qavajs/playwright/steps.js', // package steps
        'step_definitions/*.ts' // custom step definitions
    ],
    memory: new Memory(),
    pageObject: new App()
}
```
playwright.config.ts
```typescript
import { defineCucumber } from '@qavajs/playwright';

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
```bash
npm install
```

Install playwright browsers
```bash
install:browsers
```

Build lib
```bash
npm run build
```

Execute e2e browser tests
```bash
npm run test:e2e
```
