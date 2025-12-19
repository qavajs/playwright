# Change Log

All notable changes to the "@qavajs/playwright" will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

:rocket: - new feature  
:beetle: - bugfix  
:x: - deprecation/removal  
:pencil: - chore  
:microscope: - experimental

## [3.9.0]
- :rocket: added steps to work with custom properties (script results) in memory and validations
```gherkin
When I save '$js(element => element.value)' custom property of 'Element' as 'value'
Then I expect '$js(element => element.value)' custom property of 'Element' to be equal '123'
When I save '$js(element => element.nodeName)' custom property of every element of 'Collection' collection as 'nodeNames'
Then I expect '$js(element => element.nodeName)' custom property of every element in 'Collection' collection to equal 'LI'
```

## [3.8.0]
- :beetle: added step for uploading multiple files `I upload '{value}' file by clicking '{locator}'`

## [3.7.1]
- :beetle: fixed parameter type for `I save file to {value} by clicking {locator}` step

## [3.7.0]
- :rocket: added `I save file to {value} by clicking {locator}` step

## [3.6.0]
- :rocket: moved main declarations to package json
- :rocket: added `I refress page until...` and `I click until...` steps

## [3.5.0]
- :rocket: added `into` preposition to type and type chars steps
- :rocket: added `MemoryValue` and `Validation` types export

## [3.4.0]
- :rocket: added `electron` world property to interact with main electron process
- :rocket: added step to interact with electron app menu
```gherkin
When I click 'Test > Open Page' electron menu
```

- :rocket: added capability to execute script on electron main process
```gherkin
Scenario: evaluate script on main process
  When I execute '$js(async ({ app }) => app.showAboutPanel())' script on electron app

Scenario: evaluate script on main process and save result to memory
  When I execute '$js(async ({ app }) => app.getAppPath())' script on electron app and save result as 'appPath'
  Then I expect '$appPath' memory value to contain 'test-e2e/apps/electron'
```

## [3.3.0]
- :rocket: added `to satisfy` validation to verify user-defined expectation provided as predicate
```Gherkin
Then I expect '$value' to satisfy '$either(1, 2)'
```
where `$either` is a function
```typescript
function either(...expected) {
    return function (actual) {
        return expected.includes(actual)
    }
}
```

## [3.2.0]
- :rocket: Added capability to provide _defaultResolver_ to define default logic to identify element
```typescript
class App {
    defaultResolver({ alias }: { alias: string }) {
      return ({ parent }: { parent: Locator }) => parent.getByText(alias);
    }
}
```

## [3.1.0]
- :rocket: updated playwright to 1.53.0
- :rocket: added support of `locator.describe()` to log alias and corresponding locator

## [3.0.0]
- :rocket: [Breaking Change] added `@cucumber/cucumber` and `@qavajs/playwright-runner-adapter` as dependencies with re-exports
- :rocket: [Breaking Change] moved steps from `index.js` to `steps.js`
```typescript
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
- :rocket: added capability to provide `softly` suffix to perform soft validations
```gherkin
When I expect 'question' to softly equal '42'
```

## [2.5.0]
- :rocket: added steps to work with file system
- :beetle: fixed passing timeout to function returned by `state` parameter type

## [2.4.0]
- :rocket: added capability to pass timeout to function returned by `state` parameter type
- :rocket: added js maps

## [2.3.1]
- :rocket: added capability to pass `pageObject` property as object
- :beetle: fixed simple equal title

## [2.3.0]
- :beetle: fixed publishing workflow
- :rocket: added `locator.as` method to define top level components (like pages)
```typescript
export class App {
  LoginPage = locator.as(LoginPage);
}

class LoginPage {
  username = locator('#username');
  password = locator('#password');
}
```

## [2.2.0]
- :rocket: added memory processor to locator parameter type

## [2.1.1]
- :beetle: fixed library exports

## [2.1.0]
- :rocket: added readable page object errors
- :rocket: added page object logs

## [2.0.0]
- :rocket: added new page object approach

## [0.4.1]
- :beetle: added require for http

## [0.4.0]
- :rocket: added http steps

## [0.3.0]
- :rocket: exposed _expect_ into world

## [0.2.0]
- :rocket: added built-in page object
- :beetle: added utils.ts to steps bundle
- :pencil: updated dependencies
 
## [0.1.0]
- :rocket: initial implementation

