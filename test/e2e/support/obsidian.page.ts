export const fileExplorer = {
    container: () => browser.$('.nav-files-container'),
    fileByExtension: (ext: string) => browser.$(`.tree-item-self[data-path$="${ext}"]`),
    menuItem: (title: string) => browser.$('.menu-item-title=' + title),
};

export async function openContextMenu(target: ReturnType<typeof browser.$>): Promise<void> {
    await target.click({ button: 'right' });
}
