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
        Given I am editing the faction "The Verdant Circle"
        When I edit the faction's information
        And I change the faction's name to "The Iron Concord"
        And I attach a note to the faction
        And I save the faction settings
        Then the faction is updated with the new name
        And I can view the faction's attached note

    Scenario: Adding a faction to a hex
        Given I am editing the faction "The Verdant Circle"
        And I have selected the brush tool
        When I click an empty hex
        Then the faction is added to the hex

    Scenario: Replacing a hex's faction with a different faction
        Given I am editing the faction "The Ashen Pact"
        And I have selected the brush tool
        When I click a hex at 1,1
        Then the faction is added to the hex

    Scenario: Adding a faction to multiple hexes by dragging
        Given I am editing the faction "The Ashen Pact"
        And I have selected the brush tool
        When I click and drag across multiple hexes
        Then the faction is added to every hovered hex

    Scenario: Removing a faction from a hex
        Given I am editing the faction "The Verdant Circle"
        And I have selected the eraser tool
        When I click a hex with a faction
        Then the faction is removed from the hex

    Scenario: Removing a faction from multiple hexes by dragging
        Given I am editing the faction "The Verdant Circle"
        And I have selected the eraser tool
        When I click and drag across multiple hexes with a faction
        Then the faction is removed from every dragged hex

    Scenario: Filling a connected faction region with the bucket tool
        Given I am editing the faction "The Ashen Pact"
        And I have selected the bucket tool
        When I click an existing hex
        Then the connected hexes of the same faction are changed to the selected faction

    Scenario: Filling a non-existent hex with the bucket tool
        Given I am editing the faction "The Ashen Pact"
        And I have selected the bucket tool
        When I click a non-existent hex
        Then nothing changes
