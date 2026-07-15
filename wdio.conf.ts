import path from 'path';
import { globSync } from 'node:fs';

const stepDefinitions = globSync('test/e2e/steps/**/*.ts').map((f) => path.resolve(f));

export const config: WebdriverIO.Config = {
    runner: 'local',
    framework: 'cucumber',
    specs: ['./test/e2e/**/*.feature'],
    maxInstances: 1,

    capabilities: [{
        browserName: 'obsidian',
        browserVersion: 'latest',
        'wdio:obsidianOptions': {
            installerVersion: 'earliest',
            plugins: ['.'],
            vault: './test/vault',
        },
    }],

    services: ['obsidian'],
    reporters: ['obsidian'],

    cacheDir: path.resolve('.obsidian-cache'),
    cucumberOpts: {
        import: stepDefinitions,
        timeout: 60000,
    },
    logLevel: 'warn',
};
