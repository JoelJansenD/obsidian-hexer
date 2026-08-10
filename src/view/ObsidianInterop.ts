import { Path } from "../logic/path";

/**
 * Options supplied by the calling UI when opening the path settings dialog.
 * The path being edited is required; the listeners are optional and let the
 * caller decide what happens when the dialog is committed or dismissed.
 */
export interface PathSettingsOptions {
    /** The path the dialog edits. */
    path: Path;
    /** Called with the edited path when the user commits the dialog. */
    onSave?: (path: Path) => void;
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
    /** Opens the settings dialog for a path, driven by the caller's options. */
    openPathSettings: (options: PathSettingsOptions) => void;
    /** Shows Obsidian's native reading-view preview of the linked note on hover. */
    showFilePreview: (options: FilePreviewOptions) => void;
    /** Opens the linked note; a mod-click opens it in a new tab. */
    openFile: (filePath: string, event: MouseEvent) => void;
}
