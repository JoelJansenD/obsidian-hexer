import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
        },
        plugins: { boundaries },
        settings: {
            'boundaries/elements': [
                { type: 'logic',     pattern: 'src/logic/*' },
                { type: 'rendering', pattern: 'src/rendering/*' },
                { type: 'obsidian',  pattern: 'src/obsidian/*' },
            ],
        },
        rules: {
            'boundaries/element-types': ['error', {
                default: 'disallow',
                rules: [
                    { from: 'rendering', allow: ['logic'] },
                    { from: 'obsidian',  allow: ['logic', 'rendering'] },
                ],
            }],
            'boundaries/external': ['error', {
                default: 'allow',
                rules: [
                    { from: ['logic'],     disallow: ['obsidian'] },
                    { from: ['rendering'], disallow: ['obsidian'] },
                ],
            }],
        },
    },
);
