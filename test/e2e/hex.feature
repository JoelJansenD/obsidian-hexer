Feature: Rainbow Hex View
  A hex that cycles through 7 ROYGBIV colours on click

  Background:
    Given the Hexer view is open

  Scenario: View opens at the first colour
    Then the hex displays colour index 0

  Scenario: Clicking the hex advances the colour
    When I click the hex
    Then the hex displays colour index 1

  Scenario: Clicking through all 7 colours wraps back to the start
    When I click the hex 7 times
    Then the hex displays colour index 0
