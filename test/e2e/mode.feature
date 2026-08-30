Feature: View and edit mode
  A map opens read-only in view mode. The user switches to edit mode to reveal
  the editing UI. Mode is session-only and never touches the map or undo history.

  Background:
    Given I have opened a Hexer file

  Scenario: Entering edit mode from the action bar
    When I click the mode toggle on the action bar
    Then the editor is in edit mode
    And the sidebar is visible
    And the paint-tool cluster is visible
    And the action bar is visible

  Scenario: Exiting edit mode from the action bar
    Given I am in edit mode
    When I click the mode toggle on the action bar
    Then the editor is in view mode
    And the sidebar is not visible
    And the paint-tool cluster is not visible
