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
        Given I have a river with the following nodes:
            | q | r |
            | 1 | 1 |
            | 2 | 1 |
        When I edit the river
        Then the river is selected

    Scenario: Drawing an edge to an existing hex
        Given I am editing a river with the following nodes:
            | q | r |
            | 1 | 1 |
            | 2 | 1 |
        And I click on the hex at 1,1
        When I click on the hex at 2,0
        Then the hex is added to the river
        And an edge is added between the two clicked hexes

    Scenario: Selecting an existing hex in a river
        Given I am editing a river with the following nodes:
            | q | r |
            | 1 | 1 |
            | 2 | 1 |
            | 2 | 2 |
        When I click on the hex at 1,1
        Then the hex is selected
        But no hex is added to the river
        And no edge is added

    Scenario: Connecting two existing hexes by double-clicking
        Given I am editing a river with the following nodes:
            | q | r |
            | 1 | 1 |
            | 2 | 1 |
            | 2 | 2 |
        And I click on the hex at 1,1
        When I double-click on the hex at 2,2
        Then an edge is added between the two clicked hexes
        But no hex is added to the river

    Scenario: Splitting an existing path at a clicked hex
        Given I am editing a river with the following nodes:
            | q | r |
            | 1 | 1 |
            | 5 | 1 |
        And I click on the hex at 5,1
        When I click on the hex at 3,1
        Then the edge between the hexes at 1,1 and 5,1 is removed
        And an edge is added between the hexes at 1,1 and 3,1
        And an edge is added between the hexes at 3,1 and 5,1
        And the hex is selected
