Feature: Factions
    Factions represent the groups that lay claim to the hexes of a map.

    Background:
        Given I have opened a Hexer file
        And I have selected the faction layer

    Scenario: Creating a new faction
        When I create a new faction
        Then a new faction is created
        And the faction is active
