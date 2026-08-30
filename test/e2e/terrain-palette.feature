Feature: Terrain palette
  A palette of ten quick-switch colours accompanies the terrain colour picker.
  Left-clicking a swatch makes its colour the active colour; right-clicking
  overrides the swatch with the current active colour.

  Background:
    Given I have opened a Hexer file
    And I am in edit mode
    And I have selected the terrain layer

  Scenario: Painting with a colour selected from the palette
    Given I have selected the brush tool
    When I select terrain palette swatch 3
    And I click an empty hex
    Then the hex terrain will match the selected palette swatch colour

  Scenario: Overriding a palette swatch colour
    When I override terrain palette swatch 3 with red
    Then terrain palette swatch 3 will show red
