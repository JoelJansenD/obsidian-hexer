import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
        },
        plugins: { boundaries },
        settings: {
            'boundaries/root-path': __dirname,
            'boundaries/elements': [
                { type: 'logic',     pattern: 'src/logic',     partialMatch: false },
                { type: 'rendering', pattern: 'src/view/rendering', partialMatch: false },
                { type: 'obsidian',  pattern: 'src/obsidian',  partialMatch: false },
            ],
            'import/resolver': {
                typescript: { alwaysTryTypes: true },
            },
        },
        rules: {
            'boundaries/dependencies': ['error', {
                default: 'allow',
                checkAllOrigins: true,
                policies: [
                    // logic may not import from rendering or obsidian elements
                    {
                        from: { element: { type: 'logic' } },
                        disallow: { to: { element: { type: ['rendering', 'obsidian'] } } },
                    },
                    // rendering may not import from obsidian elements
                    {
                        from: { element: { type: 'rendering' } },
                        disallow: { to: { element: { type: 'obsidian' } } },
                    },
                    // logic and rendering may not import the 'obsidian' npm package
                    {
                        from: { element: { type: ['logic', 'rendering'] } },
                        disallow: { to: { module: { origin: 'external', source: 'obsidian' } } },
                    },
                ],
            }],
        },
    },
);
