Feature: Icon
  Icons can be placed on hexes and can be selected from a predefined set of icons.
  They can be used to represent various features or points of interest on the hex map.

  Background:
    Given I have opened a Hexer file
    And I have selected the icon layer
    And I have selected the castle icon
    And I have selected a blue icon colour
  
  Scenario: Placing an icon on an empty hex hex
    Given I have selected the brush tool
    When I click an empty hex
    Then the hex will have a blue castle icon
  
  Scenario: Overwriting an existing icon
    Given I have selected the brush tool
    When I click a hex with an icon
    Then the hex will have a blue castle icon
  
  Scenario: Placing multiple icons by dragging
    Given I have selected the brush tool
    When I click and drag across multiple hexes
    Then every hovered hex will have a blue castle icon

  Scenario: Erasing an icon
    Given I have selected the eraser tool
    When I click a hex with an icon
    Then the icon will be erased

  Scenario: Erasing multiple icons by dragging
    Given I have selected the eraser tool
    When I click and drag across multiple hexes
    Then every hovered icon will be erased