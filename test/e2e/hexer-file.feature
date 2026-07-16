Feature: Hexer File
  The Hexer file 

  Background:
    Given the Hexer view is open

  Scenario: Creating a new Hexer file
    When I create a new Hexer file
    Then a new Hexer file will be created
    And the file will have a valid datetime format
    And the file will have the most recent version
    And the Hexer view will be opened for the new file