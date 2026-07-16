import { Then, When } from '@cucumber/cucumber';
import { fileExplorer, openContextMenu, workspace } from '../support/obsidian.page';

const HEXER_EXT = '.hexer.md';

When('I create a new Hexer file', async function () {
    await openContextMenu(fileExplorer.container());
    await fileExplorer.menuItem('New Hexer file').click();
});

Then('a new Hexer file will be created', async () => {
    await fileExplorer.fileByExtension(HEXER_EXT).waitForExist({ timeout: 5000 });
});

Then('will have a valid datetime format', async () => {
    const filePath = await fileExplorer.fileByExtension(HEXER_EXT).getAttribute('data-path');
    const fileName = filePath?.split('/').pop() ?? '';
    const regex = /^\d{14}\.hexer\.md$/;

    if (!regex.test(fileName)) {
        throw new Error(`Invalid file name format: ${fileName}`);
    }
});

Then('the Hexer view will be opened for the new file', async () => {
    await workspace.leafByType('hexer-view').waitForExist({ timeout: 5000 });
});
