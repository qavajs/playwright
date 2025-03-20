Feature: files

  Background:

  Scenario: expect file
    When I drop file 'file.txt' to './test-e2e/folder' after 800 ms
    When I expect './test-e2e/folder/file.txt' file exists

  Scenario: wait for file matching regexp in folder
    When I drop file 'file.txt' to './test-e2e/folder' after 800 ms
    When I expect file matching 'f.+\.txt' regexp exists in './test-e2e/folder'

  Scenario: expect file from memory
    When I drop file 'file.txt' to './test-e2e/folder' after 800 ms
    When I expect '$filePath' file exists

  Scenario: expect file matching regexp from memory in folder
    When I drop file 'file.txt' to './test-e2e/folder' after 800 ms
    When I expect file matching '$fileRegexp' regexp exists in '$folder'

  Scenario: save as buffer
    When I save 'test-e2e/static-folder/someTextFile.txt' file content as 'fileContent'
    Then I expect '$fileContent' to deeply equal '$buffer'

  Scenario: save as text
    When I save 'test-e2e/static-folder/someTextFile.txt' text file content as 'fileContent'
    Then I expect '$fileContent' to be equal '$textContent'

  Scenario: text file content
    When I expect 'test-e2e/static-folder/someTextFile.txt' text file content to contain 'this is text file content'
    When I expect 'test-e2e/static-folder/someTextFile.txt' text file content not to be equal 'wrong value'
    When I expect 'test-e2e/static-folder/someTextFile.txt' text file content to match '^this is text file.+'