import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        // Default environment for the logic tests. View/DOM tests opt into a DOM
        // environment per file with a `// @vitest-environment happy-dom` docblock.
        environment: 'node',
        include: ['src/**/*.test.ts'],
        // Registers Obsidian's HTMLElement DOM helpers (createEl, createDiv, ...).
        // The setup guards on HTMLElement, so it is a no-op under the node environment.
        setupFiles: ['./test/obsidian-dom.setup.ts'],
    },
});
