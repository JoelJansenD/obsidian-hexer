Feature: Camera
  The camera frames the map in the viewport. The user can pan it with the mouse,
  zoom it under the cursor, and fit the whole map back into view. Panning and
  zooming persist but never create an undo entry of their own.

  Background:
    Given I have opened a Hexer file

  Scenario: Panning with the middle mouse button
    When I drag the middle mouse button 100 px right and 60 px down
    Then the whole scene shifts right and down by 100,60
    And no undo entry is created
    But the document is marked dirty

  Scenario: Wheel zoom is anchored at the cursor
    When I scroll the wheel up one notch over a painted hex
    Then the zoom increases by a factor of 1.1
    And that hex stays under the pointer

  Scenario: Zoom to fit frames all content
    Given the map has hexes and a river spread across a wide area
    When I click the zoom to fit button on the action bar
    Then every hex and every path node is visible within the viewport
    And no undo entry is created
    But the document is marked dirty
