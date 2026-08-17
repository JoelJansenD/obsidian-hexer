Feature: Factions
    Factions represent the groups that lay claim to the hexes of a map.

    Background:
        Given I have opened a Hexer file
        And I have selected the faction layer

    Scenario: Creating a new faction
        When I create a new faction
        Then a new faction is created
        And the faction is active

    Scenario: Editing a faction's information
        Given I have an active faction
        When I edit the faction's information
        And I change the faction's name to "The Iron Concord"
        And I attach a note to the faction
        And I save the faction settings
        Then the faction is updated with the new name
        And I can view the faction's attached note
