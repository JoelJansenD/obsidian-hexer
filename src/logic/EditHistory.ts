import { HexerData } from "./HexerData";

/**
 * The undo/redo timeline for a single map. Owns the snapshot policy: every
 * recorded edit is cloned on the way in and every restored state is cloned on
 * the way out, so the history is insulated from outside mutation.
 *
 * Commits that share a stroke key coalesce into one entry — a whole brush drag
 * (which emits a commit per `mousemove`) collapses to a single undo step rather
 * than one step per painted hex. An absent or changed key opens a fresh entry,
 * so discrete clicks and sidebar edits each undo on their own.
 */
export class EditHistory {
    private readonly past: HexerData[] = [];
    private readonly future: HexerData[] = [];
    private present: HexerData;
    private openStroke: symbol | null = null;

    constructor(initial: HexerData) {
        this.present = initial.clone();
    }

    /** Whether there is a prior state to fall back to. */
    public get canUndo(): boolean {
        return this.past.length > 0;
    }

    /** Whether an undone state is waiting to be reapplied. */
    public get canRedo(): boolean {
        return this.future.length > 0;
    }

    /**
     * Records a committed edit as the new present state. Passing the same
     * `stroke` as the previous commit folds this edit into the current undo
     * entry; a new or omitted key starts a new one. Recording always clears the
     * redo branch.
     */
    public record(next: HexerData, stroke?: symbol): void {
        const coalesce = stroke !== undefined && stroke === this.openStroke;
        if (!coalesce) {
            this.past.push(this.present);
        }
        this.present = next.clone();
        this.future.length = 0;
        this.openStroke = stroke ?? null;
    }

    /** Steps back one entry, returning the restored state, or null if there is none. */
    public undo(): HexerData | null {
        const previous = this.past.pop();
        if (previous === undefined) {
            return null;
        }
        this.future.push(this.present);
        this.present = previous;
        this.openStroke = null;
        return this.present.clone();
    }

    /** Steps forward one entry, returning the reapplied state, or null if there is none. */
    public redo(): HexerData | null {
        const next = this.future.pop();
        if (next === undefined) {
            return null;
        }
        this.past.push(this.present);
        this.present = next;
        this.openStroke = null;
        return this.present.clone();
    }
}
