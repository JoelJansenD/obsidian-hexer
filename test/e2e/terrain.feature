Feature: Terrain
  Terrains are the backdrop of hexes and can be painted in any solid colour.

  Background:
    Given I have opened a Hexer file
    And I am in edit mode
    And I have selected the terrain layer
    And my selected colour is blue

  Scenario: Painting an empty hex
    Given I have selected the brush tool
    When I click an empty hex
    Then the hex terrain will be painted blue

  Scenario: Overwriting coloured terrain
    Given I have selected the brush tool
    When I click a hex with coloured terrain
    Then the hex terrain will be painted blue

  Scenario: Painting multiple hexes by dragging
    Given I have selected the brush tool
    When I click and drag across multiple hexes
    Then every hovered hex terrain will be painted blue

  Scenario: Erasing a hex terrain
    Given I have selected the eraser tool
    When I click a hex with coloured terrain
    Then the hex terrain will be erased

  Scenario: Erasing multiple hex terrains by dragging
    Given I have selected the eraser tool
    When I click and drag across multiple hexes
    Then every hovered hex terrain will be erased

  Scenario: Filling a hex with a terrain colour
    Given I have selected the bucket tool
    When I click a hex with coloured terrain
    Then every connected hex with the same terrain colour will be painted blue
