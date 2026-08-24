/**
 * The part of a sidebar item the settings dialog edits, shared by every item
 * type that can be listed in the sidebar (paths, factions, ...).
 */
export interface ItemSettings {
    name: string;
    filePath: string | null;
}

/**
 * Options supplied by the calling UI when opening the item settings dialog.
 * The settings being edited are required; the listeners are optional and let
 * the caller decide what happens when the dialog is committed or dismissed.
 */
export interface ItemSettingsOptions {
    /** The settings the dialog starts from. */
    settings: ItemSettings;
    /** Called with the edited settings when the user commits the dialog. */
    onSave?: (settings: ItemSettings) => void;
    /** Called when the user dismisses the dialog without saving. */
    onCancel?: () => void;
}

/**
 * Options for previewing a linked note with Obsidian's native page preview.
 */
export interface FilePreviewOptions {
    /** Vault-relative path of the note to preview. */
    filePath: string;
    /** The originating hover event, forwarded to Obsidian's page preview. */
    event: MouseEvent;
    /** The element the preview popover anchors to. */
    targetEl: HTMLElement;
}

/**
 * Host-only operations the view delegates back to the Obsidian layer.
 *
 * The view layer must never import from `obsidian` directly. Instead the
 * obsidian layer injects an implementation of this interface, so the view can
 * trigger host behaviour (opening modals, navigating to files, ...) through
 * plain function types without knowing anything about Obsidian itself.
 */
export interface ObsidianInterop {
    /** Opens the settings dialog for a sidebar item, driven by the caller's options. */
    openItemSettings: (options: ItemSettingsOptions) => void;
    /** Shows Obsidian's native reading-view preview of the linked note on hover. */
    showFilePreview: (options: FilePreviewOptions) => void;
    /** Opens the linked note; a mod-click opens it in a new tab. */
    openFile: (filePath: string, event: MouseEvent) => void;
    openMapSettings: () => void;
}
