import path from 'path';

export const config: WebdriverIO.Config = {
    runner: 'local',
    framework: 'mocha',
    specs: ['./test/e2e/**/*.e2e.ts'],
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
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },
    logLevel: 'warn',
};
