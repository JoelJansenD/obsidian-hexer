Feature: Camera
  The camera frames the map in the viewport. The user can pan it with the mouse,
  zoom it under the cursor, and fit the whole map back into view. Panning and
  zooming persist but never create an undo entry of their own.

  Background:
    Given I have opened a Hexer file

  Scenario: Panning with the middle mouse button
    Given a hex is painted at 0,0 centred in the viewport
    When I drag the middle mouse button 100 px right and 60 px down
    Then the scene shifts by 100,60 and hex 0,0 is drawn right and down of centre
    And no undo entry is created
    But the document is marked dirty

  Scenario: Wheel zoom is anchored at the cursor
    Given a hex is painted with the pointer over its centre
    When I scroll the wheel up one notch over the hex
    Then the zoom increases by a factor of 1.1
    And the hex under the pointer stays under the pointer

  Scenario: Zoom to fit frames all content
    Given hexes and a river spread across a wide area, partly off-screen
    When I click the zoom to fit button on the action bar
    Then every hex and every path node is visible within the viewport with padding
    And no undo entry is created
    But the document is marked dirty
