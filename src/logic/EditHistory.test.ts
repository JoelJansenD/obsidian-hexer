import { EditHistory } from "./EditHistory";
import createHexerData from "../__test/createHexerData";
import { Hexagon } from "./hexagon";
import { getHex, setHex } from "./HexerData";

const hex = (q: number, r: number, terrainColor: string): Hexagon => ({ q, r, terrainColor, icon: null, factionId: null });

describe('EditHistory', () => {
    it('starts with nothing to undo or redo', () => {
        // Arrange / Act
        const history = new EditHistory(createHexerData());

        // Assert
        expect(history.canUndo).toBe(false);
        expect(history.canRedo).toBe(false);
    });

    it('undo restores the state before the recorded edit; redo reapplies it', () => {
        // Arrange
        const history = new EditHistory(createHexerData());
        const painted = createHexerData();
        setHex(painted, hex(0, 0, '#ff0000'));

        // Act
        history.record(painted);

        // Assert - undo returns the empty pre-edit state
        const undone = history.undo()!;
        expect(getHex(undone, 0, 0)).toBeUndefined();
        expect(history.canUndo).toBe(false);
        expect(history.canRedo).toBe(true);

        // Assert - redo reapplies the paint
        const redone = history.redo()!;
        expect(getHex(redone, 0, 0)).toEqual(hex(0, 0, '#ff0000'));
        expect(history.canRedo).toBe(false);
    });

    it('undo and redo return nothing when there is no history to move through', () => {
        // Arrange
        const history = new EditHistory(createHexerData());

        // Act / Assert
        expect(history.undo()).toBeNull();
        expect(history.redo()).toBeNull();
    });

    it('walks back through several discrete edits one at a time', () => {
        // Arrange
        const history = new EditHistory(createHexerData());
        const first = createHexerData();
        setHex(first, hex(0, 0, '#111111'));
        const second = createHexerData();
        setHex(second, hex(0, 0, '#111111'));
        setHex(second, hex(1, 0, '#222222'));

        // Act
        history.record(first);
        history.record(second);

        // Assert - the first undo drops only the last edit, leaving the earlier one
        const afterFirstUndo = history.undo()!;
        expect(getHex(afterFirstUndo, 1, 0)).toBeUndefined();
        expect(getHex(afterFirstUndo, 0, 0)).toEqual(hex(0, 0, '#111111'));

        // Assert - the second undo peels back to the empty starting state
        const afterSecondUndo = history.undo()!;
        expect(getHex(afterSecondUndo, 0, 0)).toBeUndefined();
        expect(history.canUndo).toBe(false);
    });

    it('coalesces commits sharing a stroke key into a single undo entry', () => {
        // Arrange - one brush drag emits many commits under the same stroke key
        const history = new EditHistory(createHexerData());
        const stroke = Symbol('stroke');
        const step1 = createHexerData();
        setHex(step1, hex(0, 0, '#abcdef'));
        const step2 = createHexerData();
        setHex(step2, hex(0, 0, '#abcdef'));
        setHex(step2, hex(1, 0, '#abcdef'));

        // Act
        history.record(step1, stroke);
        history.record(step2, stroke);

        // Assert - a single undo unwinds the whole stroke back to empty
        const undone = history.undo()!;
        expect(getHex(undone, 0, 0)).toBeUndefined();
        expect(getHex(undone, 1, 0)).toBeUndefined();
        expect(history.canUndo).toBe(false);
    });

    it('opens a fresh undo entry for each new stroke key', () => {
        // Arrange
        const history = new EditHistory(createHexerData());
        const firstStroke = createHexerData();
        setHex(firstStroke, hex(0, 0, '#111111'));
        const secondStroke = createHexerData();
        setHex(secondStroke, hex(0, 0, '#111111'));
        setHex(secondStroke, hex(1, 0, '#222222'));

        // Act - two separate strokes
        history.record(firstStroke, Symbol('a'));
        history.record(secondStroke, Symbol('b'));

        // Assert - undo unwinds one stroke at a time
        const afterFirstUndo = history.undo()!;
        expect(getHex(afterFirstUndo, 1, 0)).toBeUndefined();
        expect(getHex(afterFirstUndo, 0, 0)).toEqual(hex(0, 0, '#111111'));
        expect(getHex(history.undo()!, 0, 0)).toBeUndefined();
        expect(history.canUndo).toBe(false);
    });

    it('discards the redo future once a new edit is recorded', () => {
        // Arrange
        const history = new EditHistory(createHexerData());
        const painted = createHexerData();
        setHex(painted, hex(0, 0, '#ff0000'));
        history.record(painted);
        history.undo();

        // Act - a new edit after undoing invalidates the redo branch
        const diverged = createHexerData();
        setHex(diverged, hex(5, 5, '#00ff00'));
        history.record(diverged);

        // Assert
        expect(history.canRedo).toBe(false);
    });

    it('returns clones so external mutation cannot corrupt stored history', () => {
        // Arrange
        const history = new EditHistory(createHexerData());
        const painted = createHexerData();
        setHex(painted, hex(0, 0, '#ff0000'));
        history.record(painted);

        // Act - mutate the object returned from undo
        const undone = history.undo()!;
        setHex(undone, hex(9, 9, '#123456'));

        // Assert - redo still yields the pristine recorded state
        const redone = history.redo()!;
        expect(getHex(redone, 9, 9)).toBeUndefined();
        expect(getHex(redone, 0, 0)).toEqual(hex(0, 0, '#ff0000'));
    });
});
