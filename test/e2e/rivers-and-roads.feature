Feature: Rivers and Road
    Rivers and roads can be placed on hexes. They both use the same pathing mechanism, the only difference being the rendering of the paths.

    Background:
        Given I have opened a Hexer file
        Given I have selected the river layer

    Scenario: Creating a new river
        When I create a new river
        Then a new river is created
        And the river is selected