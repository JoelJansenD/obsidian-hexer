Feature: Map Configuration
    Map configuration controls map-wide settings such as the map's name and the orientation of its hexes.

    Background:
        Given I have opened a Hexer file
        And I am in edit mode

    Scenario: Changing the map name and hex orientation
        When I change the map name to "The Shattered Realms"
        And I set the hex orientation to pointy top
        Then the map name is updated to "The Shattered Realms"
        And the hex orientation is pointy top

    Scenario: Changing the map to an empty name
        When I change the map name to ""
        Then a validation message is shown
