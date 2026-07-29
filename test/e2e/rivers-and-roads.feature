Feature: Rivers and Roads
    Rivers and roads can be placed on hexes. They both use the same pathing mechanism, the only difference being the rendering of the paths.

    Background:
        Given I have opened a Hexer file
        And I have selected the river layer
        And I have selected the polygon tool

    Scenario: Creating a new river
        When I create a new river
        Then a new river is created
        And the river is selected
    
    Scenario: Editing a river
        Given I have a river
        When I edit the river
        Then the river is selected

    Scenario: Adding a hex to a river
        Given I am editing a river
        When I click on a hex
        Then the hex is added to the river
        And no edge is added

    Scenario: Drawing an edge to an existing hex
        Given I am editing a river
        And I have clicked on a hex
        When I click on another hex
        Then the hex is added to the river
        And an edge is added between the two clicked hexes