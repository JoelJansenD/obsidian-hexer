import { Then, When } from '@wdio/cucumber-framework';
import { MapConfigurationContext } from '../support/contexts/map-configuration.context';

When('I change the map name to {string}', async function (this: MapConfigurationContext, name: string) {
    this.expectedMapName = name;
    return 'pending';
});

When('I set the hex orientation to pointy top', async function (this: MapConfigurationContext) {
    return 'pending';
});

Then('the map name is updated to {string}', async function (this: MapConfigurationContext, name: string) {
    return 'pending';
});

Then('the hex orientation is pointy top', async function (this: MapConfigurationContext) {
    return 'pending';
});
