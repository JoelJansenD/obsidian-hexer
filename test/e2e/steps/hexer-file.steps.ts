import { Given, Then, When } from '@cucumber/cucumber';
import { fileExplorer, openContextMenu, workspace } from '../support/obsidian.page';
import { CURRENT_VERSION, initialFileContent } from '../../../src/logic/HexerData';
import { obsidianPage } from 'wdio-obsidian-service';

const HEXER_EXT = '.hexer.md';

Given('a Hexer file exists', async () => {
    // Write the app's canonical empty document. fromFrontmatter is the identity,
    // so opening a hand-rolled partial file (missing camera/mapSettings/rivers/…)
    // would make the editor's first render throw.
    await obsidianPage.write(`test${HEXER_EXT}`, initialFileContent);
});

Given('I have no open views', async () => {
    await browser.executeObsidian(async ({app}) => {
        app.workspace.iterateRootLeaves((leaf) => leaf.detach());
    });
});


When('I open the Hexer file', async () => {
    await fileExplorer.fileByExtension(HEXER_EXT).click();
});

When('I open the Hexer file in Markdown mode', async () => {
    await openContextMenu(fileExplorer.fileByExtension(HEXER_EXT));
    await fileExplorer.menuItem('Open as Markdown').click();
});

When('I create a new Hexer file', async function () {
    await openContextMenu(fileExplorer.container());
    await fileExplorer.menuItem('New Hexer file').click();
});

Then('a new Hexer file will be created', async () => {
    await fileExplorer.fileByExtension(HEXER_EXT).waitForExist({ timeout: 5000 });
});

Then('the file will have a valid datetime format', async () => {
    const filePath = await fileExplorer.fileByExtension(HEXER_EXT).getAttribute('data-path');
    const fileName = filePath?.split('/').pop() ?? '';
    const regex = /^\d{14}\.hexer\.md$/;

    if (!regex.test(fileName)) {
        throw new Error(`Invalid file name format: ${fileName}`);
    }
});

Then('the file will have the most recent version', async () => {
    const filePath = await fileExplorer.fileByExtension(HEXER_EXT).getAttribute('data-path');
    const version = await browser.execute((path) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obsidian = (window as any).app;
        const file = obsidian.vault.getFileByPath(path!);
        if (!file) return null;
        return obsidian.metadataCache.getFileCache(file)?.frontmatter?.hexer?.version ?? null;
    }, filePath);

    if (version !== CURRENT_VERSION) {
        throw new Error(`Expected version "${CURRENT_VERSION}" but got "${version}"`);
    }
});

Then('the Hexer view will be opened for the file', async () => {
    await workspace.leafByType('hexer-view').waitForExist({ timeout: 5000 });
});

Then('the Hexer file will be opened in Markdown mode', async () => {
    await workspace.leafByType('markdown').waitForExist({ timeout: 5000 });

    if (await workspace.leafByType('hexer-view').isExisting()) {
        throw new Error('Expected the Hexer view not to be opened, but it was');
    }
});
