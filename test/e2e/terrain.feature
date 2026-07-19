Feature: Painting Terrain
  Terrains are the backdrop of hexes and can be painted in any solid colour.

  Background:
    Given I have opened a Hexer file
    And I have selected the brush tool
    And I have selected the terrain layer
    And my selected colour is blue

  Scenario: Painting an empty hex
    When I click an empty hex
    Then the hex terrain will be painted blue

  Scenario: Overwriting coloured terrain
    When I click a hex with coloured terrain
    Then the hex terrain will be painted blue

  Scenario: Painting multiple hexes by dragging
    When I click and drag across multiple hexes
    Then every hovered hex terrain will be painted blue
