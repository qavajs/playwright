# Change Log

All notable changes to the "@qavajs/playwright" will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

:rocket: - new feature  
:beetle: - bugfix  
:x: - deprecation/removal  
:pencil: - chore  
:microscope: - experimental

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

