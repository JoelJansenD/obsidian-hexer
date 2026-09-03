// @vitest-environment happy-dom
import EditorActionBar from "./EditorActionBar";

const createActionBar = () => {
    const onZoomToFit = vi.fn();
    const onToggleMode = vi.fn();
    const onPrint = vi.fn();
    const parent = document.createElement('div');
    const bar = new EditorActionBar(parent, { onZoomToFit, onToggleMode, onPrint });
    return { bar, parent, onZoomToFit, onToggleMode, onPrint };
};

const toggle = (parent: HTMLElement) => parent.querySelector<HTMLElement>('[data-hexer-action="toggle-mode"]')!;
const click = (el: HTMLElement) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

describe('EditorActionBar', () => {
    it('renders the mode toggle, zoom-to-fit and print buttons', () => {
        // Act
        const { parent } = createActionBar();

        // Assert
        expect(toggle(parent)).not.toBeNull();
        expect(parent.querySelector('[aria-label="Zoom to fit"]')).not.toBeNull();
        expect(parent.querySelector('[aria-label="Print"]')).not.toBeNull();
    });

    it('invokes the print callback when its button is clicked', () => {
        // Arrange
        const { parent, onPrint } = createActionBar();

        // Act
        click(parent.querySelector<HTMLElement>('[aria-label="Print"]')!);

        // Assert
        expect(onPrint).toHaveBeenCalledOnce();
    });

    it('invokes the toggle callback when the mode button is clicked', () => {
        // Arrange
        const { parent, onToggleMode } = createActionBar();

        // Act
        click(toggle(parent));

        // Assert
        expect(onToggleMode).toHaveBeenCalledOnce();
    });

    it('invokes the zoom-to-fit callback when its button is clicked', () => {
        // Arrange
        const { parent, onZoomToFit } = createActionBar();

        // Act
        click(parent.querySelector<HTMLElement>('[aria-label="Zoom to fit"]')!);

        // Assert
        expect(onZoomToFit).toHaveBeenCalledOnce();
    });

    it('advertises entering edit while in view mode', () => {
        // Arrange
        const { bar, parent } = createActionBar();

        // Act
        bar.setMode('view');

        // Assert — the toggle offers the action it switches *to*.
        expect(toggle(parent).getAttribute('aria-label')).toBe('Edit');
    });

    it('advertises returning to view while in edit mode', () => {
        // Arrange
        const { bar, parent } = createActionBar();

        // Act
        bar.setMode('edit');

        // Assert
        expect(toggle(parent).getAttribute('aria-label')).toBe('View');
    });
});
