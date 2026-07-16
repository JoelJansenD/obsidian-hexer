Feature: Hexer File
  The Hexer file is the file that stores all data related to the Hex map.

  Background:
    Given Obsidian is open

  Scenario: Creating a new Hexer file
    When I create a new Hexer file
    Then a new Hexer file will be created
    And the file will have a valid datetime format
    And the file will have the most recent version
    And the Hexer view will be opened for the file

  Scenario: Opening an existing Hexer file
    Given a Hexer file exists
    And I have no open views
    When I open the Hexer file
    Then the Hexer view will be opened for the file