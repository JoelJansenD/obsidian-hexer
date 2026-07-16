Feature: Hexer File
  The Hexer file 

  Background:
    Given the Hexer view is open

  @ignore
  Scenario: Creating a new Hexer file
    When I create a new Hexer file
    Then a new Hexer file will be created
    And will have a valid datetime format
    And the Hexer view will be opened for the new file