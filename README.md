# @qavajs/playwright
[![npm](https://img.shields.io/npm/v/@qavajs/playwright)](https://www.npmjs.com/package/@qavajs/playwright)
[![license](https://img.shields.io/npm/l/@qavajs/playwright)](LICENSE)

Cucumber BDD step definitions for the Playwright test runner. Part of the [qavajs](https://github.com/qavajs) framework.

## Installation

```bash
npm install @qavajs/playwright
```

## Configuration

**`qavajs.config.ts`**
```typescript
import { defineConfig } from '@qavajs/playwright';
import Memory from './memory';
import App from './page_object';

export default defineConfig({
    paths: ['features/*.feature'],
    require: [
        'node_modules/@qavajs/playwright/steps.js', // built-in step definitions
        'step_definitions/*.ts'                      // custom step definitions
    ],
    memory: new Memory(),
    pageObject: new App()
});
```

**`playwright.config.ts`**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testMatch: 'qavajs.config.ts',
});
```

## Page Object

Define your page object using `locator` helpers exported from this package:

```typescript
import { locator } from '@qavajs/playwright';

class LoginPage {
    // Simple CSS/XPath/text selector
    UsernameInput = locator('#username');
    PasswordInput = locator('#password');
    SubmitButton  = locator('button[type="submit"]');

    // Template selector — argument passed via 'ElementName(arg)' syntax in steps
    RowByText = locator.template((text: string) => `tr:has-text("${text}")`);

    // Native Playwright locator — full access to page/context/parent
    ActiveTab = locator.native(({ page }) => page.locator('.tab.active'));
}

class App {
    LoginPage = locator.as(LoginPage);
}

export default App;
```

Reference nested elements in steps using `>` separator:
```gherkin
When I click 'LoginPage > SubmitButton'
When I click 'Table > RowByText(some text) > EditButton'
```

## Built-in Steps

### Navigation & Actions

| Step | Description |
|------|-------------|
| `I open {value} url` | Navigate to URL |
| `I refresh page` | Reload current page |
| `I open new tab` | Open a new blank tab |
| `I close current tab` | Close current tab and switch to first |
| `I switch to {int} window` | Switch to window by index (1-based) |
| `I switch to {value} window` | Switch to window matching URL or title |
| `I click back button` / `I click forward button` | Browser navigation |
| `I set window size {value}` | Resize browser window, e.g. `'1366,768'` |

### Interactions

| Step | Description |
|------|-------------|
| `I click {locator}` | Click element |
| `I force click {locator}` | Click via JS (`element.click()`) |
| `I right click {locator}` | Right-click element |
| `I double click {locator}` | Double-click element |
| `I tap {locator}` | Tap element (mobile) |
| `I hover over {locator}` | Hover over element |
| `I type {value} into {locator}` | Fill input (clears first) |
| `I type {value} chars into {locator}` | Type character by character |
| `I clear {locator}` | Clear input field |
| `I select {value} option from {locator} dropdown` | Select option by label text |
| `I select {int}st/nd/rd/th option from {locator} dropdown` | Select option by index |
| `I click {value} text in {locator} collection` | Click element with text in a collection |
| `I click {value} coordinates in {locator}` | Click at `'x, y'` coordinates within element |
| `I drag and drop {locator} to {locator}` | Drag & drop |

### Scrolling

| Step | Description |
|------|-------------|
| `I scroll by {value}` | Scroll page by offset `'x, y'` |
| `I scroll to {locator}` | Scroll element into view |
| `I scroll by {value} in {locator}` | Scroll inside a container |
| `I scroll until {locator} to be visible` | Scroll page until element is visible |
| `I scroll in {locator} until {locator} to be visible` | Scroll container until element is visible |

### Keyboard & Mouse

| Step | Description |
|------|-------------|
| `I press {string} key(s)` | Press key(s), e.g. `'Enter'`, `'Control+C'` |
| `I press {string} key(s) {int} time(s)` | Press key N times |
| `I hold down {value} key` | Hold keyboard key down |
| `I release {value} key` | Release keyboard key |
| `I press {mouseButton} mouse button` | Press mouse button (`left`, `right`, `middle`) |
| `I release {mouseButton} mouse button` | Release mouse button |
| `I move mouse to {value}` | Move mouse to `'x, y'` coordinates |
| `I scroll mouse wheel by {value}` | Scroll mouse wheel by `'x, y'` offset |

### Dialogs (Alerts)

| Step | Description |
|------|-------------|
| `I accept alert` | Accept dialog/alert |
| `I dismiss alert` | Dismiss dialog/alert |
| `I type {value} to alert` | Type text into a prompt dialog |

### File Handling

| Step | Description |
|------|-------------|
| `I upload {value} file to {locator}` | Set file on file input directly |
| `I upload {value} file by clicking {locator}` | Set file via file chooser dialog |
| `I upload files by clicking {locator}:` | Set multiple files via file chooser (data table) |
| `I save file to {value} by clicking {locator}` | Download file by clicking element |
| `I save {value} file content as {value}` | Read file as Buffer into memory |
| `I save {value} text file content as {value}` | Read text file (utf-8) into memory |
| `I expect {value} text file content {validation} {value}` | Validate text file content |
| `I expect file matching {value} regexp exists in {value}` | Assert file exists by regex in directory |
| `I expect {value} file exists` | Assert file exists at path |

### Validations

| Step | Description |
|------|-------------|
| `I expect {locator} {state}` | Validate element state (visible, present, clickable, etc.) |
| `I expect every element in {locator} collection {state}` | Validate state of every element in collection |
| `I expect text of {locator} {validation} {value}` | Validate element inner text |
| `I expect value of {locator} {validation} {value}` | Validate input value |
| `I expect {value} property of {locator} {validation} {value}` | Validate DOM property |
| `I expect {value} attribute of {locator} {validation} {value}` | Validate HTML attribute |
| `I expect {value} css property of {locator} {validation} {value}` | Validate computed CSS property |
| `I expect {value} custom property of {locator} {validation} {value}` | Validate result of custom JS on element |
| `I expect number of elements in {locator} collection {validation} {value}` | Validate collection size |
| `I expect text of every element in {locator} collection {validation} {value}` | Validate text of all elements |
| `I expect {value} attribute of every element in {locator} collection {validation} {value}` | Validate attribute of all elements |
| `I expect {value} property of every element in {locator} collection {validation} {value}` | Validate property of all elements |
| `I expect {value} custom property of every element in {locator} collection {validation} {value}` | Validate custom property of all elements |
| `I expect current url {validation} {value}` | Validate current page URL |
| `I expect page title {validation} {value}` | Validate page title |
| `I expect text of alert {validation} {value}` | Validate alert message text |
| `I expect {value} {validation} {value}` | Validate a memory value against another |
| `I expect every element in {value} array {validation} {value}` | Validate every item in an array |
| `I expect at least {int} element(s) in {value} array {validation} {value}` | Validate minimum number of passing items |
| `I expect {value} array to be sorted by {value}` | Validate array is sorted by comparator function |
| `I expect {value} array {validation}:` | Validate array members (data table) |
| `I expect {value} {validation} at least one of {value}` | Validate value matches at least one in array |
| `I expect {value} {validation} at least one of:` | Validate value matches at least one (data table) |
| `I expect {value} {validation} all of {value}` | Validate value satisfies all in array |
| `I expect {value} {validation} all of:` | Validate value satisfies all (data table) |

### Memory

| Step | Description |
|------|-------------|
| `I save text of {locator} as {value}` | Save element inner text to memory |
| `I save value of {locator} as {value}` | Save input value to memory |
| `I save {value} property of {locator} as {value}` | Save DOM property to memory |
| `I save {value} attribute of {locator} as {value}` | Save HTML attribute to memory |
| `I save {value} css property of {locator} as {value}` | Save computed CSS property to memory |
| `I save {value} custom property of {locator} as {value}` | Save custom JS result to memory |
| `I save number of elements in {locator} collection as {value}` | Save collection size to memory |
| `I save text of every element of {locator} collection as {value}` | Save array of texts to memory |
| `I save {value} attribute of every element of {locator} collection as {value}` | Save array of attributes to memory |
| `I save {value} property of every element of {locator} collection as {value}` | Save array of properties to memory |
| `I save {value} custom property of every element of {locator} collection as {value}` | Save array of custom JS results to memory |
| `I save current url as {value}` | Save current URL to memory |
| `I save page title as {value}` | Save page title to memory |
| `I save bounding rect of {locator} as {value}` | Save `DOMRect` to memory |
| `I save screenshot as {value}` | Save page screenshot (Buffer) to memory |
| `I save full page screenshot as {value}` | Save full-page screenshot (Buffer) to memory |
| `I save screenshot of {locator} as {value}` | Save element screenshot (Buffer) to memory |
| `I save {value} to memory as {value}` | Save any value or expression to memory |
| `I save multiline string to memory as {value}:` | Save multiline string to memory |
| `I save json to memory as {value}:` | Parse and save JSON string to memory |
| `I save key-value pairs to memory as {value}:` | Save data table as object to memory |
| `I set {value} = {value}` | Alias for saving a value to memory |

### Waits

| Step | Description |
|------|-------------|
| `I wait {int} ms` | Explicit pause in milliseconds |
| `I click {locator} until {locator} {state}` | Click until element reaches state |
| `I click {locator} until text of {locator} {validation} {value}` | Click until element text matches |
| `I click {locator} until value of {locator} {validation} {value}` | Click until input value matches |
| `I refresh page until {locator} {state}` | Refresh until element reaches state |
| `I refresh page until text of {locator} {validation} {value}` | Refresh until element text matches |
| `I refresh page until value of {locator} {validation} {value}` | Refresh until input value matches |

### Storage (Cookies & Web Storage)

| Step | Description |
|------|-------------|
| `I set {value} cookie as {value}` | Set a cookie (value or full cookie object) |
| `I save value of {value} cookie as {value}` | Save cookie object to memory |
| `I set {value} local/session storage value as {value}` | Set local or session storage item |
| `I save value of {value} local/session storage as {value}` | Save storage item to memory |

### HTTP Requests

Build and send HTTP requests using Playwright's `APIRequestContext`:

```gherkin
When I create 'POST' request 'myRequest'
And I add 'https://api.example.com/users' url to '$myRequest'
And I add headers to '$myRequest':
  | Content-Type | application/json |
And I add body to '$myRequest':
  """
  { "name": "qavajs" }
  """
And I send '$myRequest' request and save response as 'myResponse'
And I parse '$myResponse' body as 'json'
Then I expect '$myResponse.payload.name' to equal 'qavajs'
```

| Step | Description |
|------|-------------|
| `I create {string} request {value}` | Create request with HTTP method |
| `I create GraphQL request {value}` | Create a GraphQL request |
| `I add headers to {value}:` | Add headers from data table |
| `I add {value} headers to {value}` | Add headers from memory object |
| `I add body to {value}:` | Add body from multiline string |
| `I add {value} body to {value}` | Add body from memory value |
| `I add form data body to {value}:` | Add multipart form data body |
| `I add {value} url to {value}` | Set request URL |
| `I add {gqlRequestProperty} to GraphQL {value}:` | Set `query` or `variables` on GraphQL request |
| `I send {value} request and save response as {value}` | Send request and save response |
| `I parse {value} body as {bodyParsingType}` | Parse response body (`json`, `text`, `buffer`) |

### Network Mocking

```gherkin
When I create mock for '**/api/users' as 'usersMock'
And I set '$usersMock' mock to respond '200' with:
  """
  [{ "id": 1, "name": "mock user" }]
  """
# ... run test ...
When I restore '$usersMock' mock
```

| Step | Description |
|------|-------------|
| `I create mock for {value} as {value}` | Create route mock for URL pattern |
| `I set {value} mock to respond {value} with:` | Mock response with status and body (multiline) |
| `I set {value} mock to respond {value} with {string}` | Mock response with status and body (inline) |
| `I set {value} mock to abort with {value} reason` | Abort request with error code |
| `I restore {value} mock` | Remove mock for URL pattern |
| `I restore all mocks` | Remove all active mocks |

### Network Interception

```gherkin
When I create interception for '**/api/products' as 'productsIntercept'
And I click 'LoadButton'
And I save '$productsIntercept' response as 'productsResponse'
```

| Step | Description |
|------|-------------|
| `I create interception for {value} as {value}` | Start intercepting requests matching URL/predicate |
| `I wait for {value} response` | Wait for intercepted response to complete |
| `I save {value} response as {value}` | Save intercepted response to memory |

### JavaScript Execution

| Step | Description |
|------|-------------|
| `I execute {value} function` | Execute JS expression on the page |
| `I execute {value} function and save result as {value}` | Execute JS and save result to memory |
| `I execute {value} function on {locator}` | Execute JS with element as argument |
| `I execute {value} function on {locator} and save result as {value}` | Execute JS on element and save result |

### Electron

Additional steps available when using `QavajsPlaywrightElectronWorld`:

| Step | Description |
|------|-------------|
| `I execute {value} function/script on electron app` | Execute function in Electron main process |
| `I execute {value} function/script on electron app and save result as {value}` | Execute and save result from main process |
| `I click {value} electron menu` | Click application menu item by path (e.g. `'File > Save'`) |

## Memory Syntax

Values enclosed in `'single quotes'` in step definitions support memory interpolation:

- `'literal value'` — plain string
- `'$variableName'` — read value from memory
- `'$js(expression)'` — evaluate inline JavaScript
- `'$getUser()'` — call a registered memory function

## Development

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Build the library
npm run build

# Run e2e tests
npm run test:e2e

# Run Electron e2e tests
npm run test:e2e:electron
```