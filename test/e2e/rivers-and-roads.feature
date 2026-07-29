Feature: Rivers and Roads
    Rivers and roads can be placed on hexes. They both use the same pathing mechanism, the only difference being the rendering of the paths.

    Background:
        Given I have opened a Hexer file
        And I have selected the river layer

    Scenario: Creating a new river
        When I create a new river
        Then a new river is created
        And the river is selected
    
    Scenario: Editing a river
        Given I have a river
        When I edit the river
        Then the river is selected
