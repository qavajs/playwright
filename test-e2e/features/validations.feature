Feature: validations

  Background:
    When I open '$valuesPage' url

  Scenario: element text
    Then I expect text of 'Simple Text Element' to be equal 'text value'
    Then I expect text of 'Simple Text Element' to contain 'text val'
    Then I expect text of 'Simple Text Element' not to equal 'not text value'
    Then I expect text of 'Simple Text Element' not to contain 'not text val'
    Then I expect text of 'Simple Text List Item By Index (2)' to be equal 'second value'
    Then I expect text of 'Simple Text List Item By Text (third)' to be equal 'third value'
    Then I expect text of 'Simple Text Element' to match '^text.+$'

  Scenario: collection number of elements
    Then I expect number of elements in 'Simple Text List Items' collection to be equal '3'
    Then I expect number of elements in 'Simple Text List Items' collection not to be equal '4'
    Then I expect number of elements in 'Simple Text List Items' collection to be greater than '2'
    Then I expect number of elements in 'Simple Text List Items' collection to be less than '4'

  Scenario: element value
    Then I expect value of 'Simple Text Input' to be equal '123'
    Then I expect value of 'Simple Text Input' not to be equal '1234'
    Then I expect value of 'Simple Text Input' to contain '12'

  Scenario: element property
    Then I expect 'value' property of 'Simple Text Input' to be equal '123'
    Then I expect 'value' property of 'Simple Text Input' not to be equal '1234'
    Then I expect 'value' property of 'Simple Text Input' to contain '12'

  Scenario: element attribute
    Then I expect 'name' attribute of 'Simple Text Input' to be equal 'textInputName'
    Then I expect 'name' attribute of 'Simple Text Input' not to be equal 'textInput'
    Then I expect 'name' attribute of 'Simple Text Input' to contain 'textInputName'

  Scenario: element custom property
    Then I expect '$js(e => e.value)' custom property of 'Simple Text Input' to be equal '123'
    Then I expect '$js(e => e.value)' custom property of 'Simple Text Input' not to be equal '1234'
    Then I expect '$js(e => e.value)' custom property of 'Simple Text Input' to contain '12'

  Scenario: current url
    Then I expect current url not to be equal 'https://qavajs.github.io/'
    Then I expect current url to contain 'values'

  Scenario: page title
    Then I expect page title to be equal '@qavajs'
    Then I expect page title not to be equal 'not @qavajs'
    Then I expect page title to be contain 'qava'

  Scenario: collection text of elements
    Then I expect text of every element in 'Simple Text List Items' collection to contain 'value'
    Then I expect text of every element in 'Simple Text List Items' collection not to be equal 'text'

  Scenario: collection attribute of elements
    Then I expect 'id' attribute of every element in 'Simple Text List Items' collection to contain 'Value'
    Then I expect 'id' attribute of every element in 'Simple Text List Items' collection not to contain 'fourth'

  Scenario: collection property of elements
    Then I expect 'nodeName' property of every element in 'Simple Text List Items' collection to equal 'LI'
    Then I expect 'nodeName' property of every element in 'Simple Text List Items' collection not to contain 'A'

  Scenario: collection custom property of elements
    Then I expect '$js(e => e.nodeName)' custom property of every element in 'Simple Text List Items' collection to equal 'LI'
    Then I expect '$js(e => e.nodeName)' custom property of every element in 'Simple Text List Items' collection not to contain 'A'

  Scenario: element css property
    Then I expect 'background-color' css property of 'Simple Text Input' to be equal 'rgb(95, 158, 160)'
    Then I expect 'font-size' css property of 'Simple Text List Item By Index (1)' to be equal '20px'

  Scenario Outline: collection condition
    Then I expect every element in '<collection>' collection <condition>

    Examples:
      | collection         | condition     |
      | Present Collection | to be present |

  Scenario: save result of sync computed to memory
    When I save "$getComputedString()" to memory as 'string1'
    Then I expect '$string1' to be equal 'I was computed'

  Scenario: save result of async computed to memory
    When I save "$getStringAsync()" to memory as 'string1'
    Then I expect '$string1' to be equal 'I was computed async'

  Scenario: escape $ in expected value
    Then I expect '\\$42' to be equal '\\$42'

  Scenario: set value
    When I set 'someKey' = 'someValue'
    Then I expect '$someKey' to be equal 'someValue'

  Scenario: save json to memory
    When I save json to memory as 'jsonKey':
    """
    {
      "key": 42
    }
    """
    Then I expect '$jsonKey.key' to be equal '42'

  Scenario: save multiline string to memory
    When I save multiline string to memory as 'multilineString':
    """
    Carriage
    return
    """
    Then I expect '$multilineString' to equal '$multilineMemoryValue'

  Scenario: save kv to memory
    When I save key-value pairs to memory as 'kv':
      | key        | 42          |
      | anotherKey | stringValue |
    Then I expect '$kv.key' to be equal '42'
    And I expect '$kv.anotherKey' to be equal 'stringValue'

  Scenario Outline: arr expectation (<validation>)
    When I expect every element in '$arr' array <validation> '<expectedValue>'

    Examples:
      | validation   | expectedValue |
      | not to equal | 10            |
      | to be above  | 0             |
      | have type    | number        |

  Scenario Outline: arr expectation (<sort>)
    When I expect '<array>' array to be sorted by '<sort>'

    Examples:
      | array       | sort        |
      | $arr        | $ascending  |
      | $reverseArr | $descending |

  Scenario: at least validation
    When I save '$js([1,2,3,4,5])' to memory as 'arr'
    Then I expect at least 1 element in '$arr' array to equal '1'
    And I expect at least 2 elements in '$arr' array to be above '2'

  Scenario: at least one of validation
    When I save '$js([1,2,3,4,5])' to memory as 'expected'
    Then I expect '1' to equal at least one of '$expected'

  Scenario: at least one of validation data table
    When I save '2' to memory as 'two'
    Then I expect '2' to equal at least one of:
      | 1    |
      | $two |
      | $two |

  Scenario: all of validation
    When I save '$js([2,3,4,5])' to memory as 'expected'
    Then I expect '$js(6)' to be greater than all of '$expected'

  Scenario: all of validation data table
    When I save '2' to memory as 'two'
    Then I expect '3' not to equal all of:
      | 1    |
      | $two |

  Scenario Outline: validation type (<validation>)
    When I expect '<argument1>' <validation> '<argument2>'

    Examples:
      | argument1      | argument2                                                      | validation                 |
      | 1              | 1                                                              | to equal                   |
      | 1              | 2                                                              | to not equal               |
      | test           | tes                                                            | to contain                 |
      | 1              | 1                                                              | to strictly equal          |
      | $js({ a: 1 })  | $js({ a: 1 })                                                  | to deeply equal            |
      | Test           | test                                                           | to case insensitive equal  |
#      | $js([1, 2, 3]) | $js([3])                                                       | to include members         |
#      | $js([3, 2, 1]) | $js([1, 2, 3])                                                 | to have members            |
#      | $js({ a: 1 })  | a                                                              | to have property           |
      | $js(2)         | $js(1)                                                         | to be greater than         |
      | $js(1)         | $js(2)                                                         | to be less than            |
      | test           | tes.                                                           | to match                   |
      | $js("Test")    | string                                                         | to have type               |
#      | $js({ a: 1 })  | $js({ type: "object", properties: { a: { type: "number" } } }) | to match schema            |
      | 1              | $js(arg => ["1","2"].includes(arg))                            | to satisfy                 |
