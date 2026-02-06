# @qavajs/playwright
qavajs implementation for playwright test runner

## Installation

```bash
npm install @qavajs/playwright
```

## Configuration
create `qavajs.config.ts`
```typescript
import { defineConfig } from '@qavajs/playwright';
import Memory from './memory';
import App from './page_object';

export default defineConfig({
    paths: ['features/*.feature'],
    require: [
        'node_modules/@qavajs/playwright/steps.js', // package steps
        'step_definitions/*.ts' // custom step definitions
    ],
    memory: new Memory(),
    pageObject: new App()
});
```
playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testMatch: 'qavajs.config.ts',
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
