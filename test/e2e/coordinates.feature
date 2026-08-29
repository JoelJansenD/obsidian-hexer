Feature: Coordinate labels
  Each non-empty hex can be labelled with its q,r coordinate. The labels are
  drawn in map units, so they scale with the zoom, and switch off entirely once
  they would be too small on screen to read.

  Background:
    Given I have opened a Hexer file

  Scenario: Labels are drawn on the non-empty hexes when enabled
    Given coordinate labels are enabled
    When the map is rendered
    Then every non-empty hex shows its coordinate label

  Scenario: No labels are drawn when disabled
    Given coordinate labels are disabled
    When the map is rendered
    Then no coordinate labels are drawn

  Scenario: Labels switch off below the zoom threshold and back on above it
    Given coordinate labels are enabled
    When the map is zoomed out below the label threshold
    Then no coordinate labels are drawn
    When the map is zoomed back in above the label threshold
    Then every non-empty hex shows its coordinate label
