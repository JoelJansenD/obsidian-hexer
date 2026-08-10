export const fileExplorer = {
    container: () => browser.$('.nav-files-container'),
    fileByExtension: (ext: string) => browser.$(`.tree-item-self[data-path$="${ext}"]`),
    menuItem: (title: string) => browser.$('.menu-item-title=' + title),
};

export const workspace = {
    leafByType: (type: string) => browser.$(`.workspace-leaf-content[data-type="${type}"]`),
};

export async function openContextMenu(target: ReturnType<typeof browser.$>): Promise<void> {
    await target.click({ button: 'right' });
}

/**
 * Creates a note in the vault through Obsidian's API so it is registered in the
 * vault index immediately (and thus offered by file suggesters). No-ops if the
 * note already exists.
 */
export async function createNote(path: string, content = ''): Promise<void> {
    await browser.executeObsidian(async ({ app }, args) => {
        if (!app.vault.getAbstractFileByPath(args.path)) {
            await app.vault.create(args.path, args.content);
        }
    }, { path, content });
}
