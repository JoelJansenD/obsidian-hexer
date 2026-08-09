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
}
