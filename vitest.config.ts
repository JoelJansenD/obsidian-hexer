import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            // The `obsidian` package ships types only, so tested modules that
            // import from it (e.g. the frontmatter YAML adapter) resolve to a
            // runtime stub instead. See test/mocks/obsidian.ts.
            obsidian: fileURLToPath(new URL('./test/mocks/obsidian.ts', import.meta.url)),
        },
    },
    test: {
        globals: true,
        // Default environment for the logic tests. View/DOM tests opt into a DOM
        // environment per file with a `// @vitest-environment happy-dom` docblock.
        environment: 'node',
        include: ['src/**/*.test.ts'],
        // Registers Obsidian's HTMLElement DOM helpers (createEl, createDiv, ...).
        // The setup guards on HTMLElement, so it is a no-op under the node environment.
        setupFiles: ['./test/obsidian-dom.setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/__test/**/*.ts'],
        }
    },
});
