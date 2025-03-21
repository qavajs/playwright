Feature: memory

  Background:
    When I open '$valuesPage' url

  Scenario: element text
    When I save text of 'Simple Text Element' as 'memory'
    Then I expect '$memory' to be equal 'text value'

  Scenario: collection number of elements
    When I save number of elements in 'Simple Text List Items' collection as 'memory'
    Then I expect '$memory' to be equal '$js(3)'

  Scenario: element property
    When I save 'value' property of 'Simple Text Input' as 'memory'
    Then I expect '$memory' to be equal '123'

  Scenario: element attribute
    When I save 'name' attribute of 'Simple Text Input' as 'memory'
    Then I expect '$memory' to be equal 'textInputName'

  Scenario: current url
    When I save current url as 'memory'
    Then I expect '$memory' to contain 'values.html'

  Scenario: page title
    Then I save page title as 'memory'
    Then I expect '$memory' to be equal '@qavajs'

  Scenario: collection text of elements
    Then I save text of every element of 'Simple Text List Items' collection as 'memory'
    Then I expect '$memory' to deeply equal '$array("first value", "second value", "third value")'

  Scenario: collection attribute of elements
    Then I save 'id' attribute of every element of 'Simple Text List Items' collection as 'memory'
    Then I expect '$memory' to deeply equal '$array("firstValue", "secondValue", "thirdValue")'

  Scenario: collection property of elements
    Then I save 'nodeName' property of every element of 'Simple Text List Items' collection as 'memory'
    Then I expect '$memory' to deeply equal '$array("LI", "LI", "LI")'

  Scenario: element css property
    When I save 'background-color' css property of 'Simple Text Input' as 'color'
    When I save 'font-size' css property of 'Simple Text List Item By Index (1)' as 'fontSize'
    Then I expect '$color' to be equal 'rgb(95, 158, 160)'
    Then I expect '$fontSize' to be equal '20px'

  Scenario: page screenshot
    When I save screenshot as 'pageScreenshot'
    Then I expect '$pageScreenshot[0]' to be equal '$js(137)'

  Scenario: full page screenshot
    When I save full page screenshot as 'fullPageScreenshot'
    Then I expect '$fullPageScreenshot[0]' to be equal '$js(137)'

  Scenario: element screenshot
    When I save screenshot of 'Simple Text Input' as 'elementScreenshot'
    Then I expect '$elementScreenshot[0]' to be equal '$js(137)'

  Scenario: bounding rect
    When I save bounding rect of 'Simple Text Element' as 'boundingRect'
    Then I expect '$boundingRect.height' to be equal '$js(20)'
