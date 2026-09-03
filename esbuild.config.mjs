import esbuild from 'esbuild';
import builtins from 'builtin-modules';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
    entryPoints: ['src/obsidian/main.ts'],
    bundle: true,
    external: [
        'obsidian',
        'electron',
        '@electron/remote',
        '@codemirror/*',
        '@lezer/*',
        ...builtins,
    ],
    format: 'cjs',
    target: 'es2018',
    logLevel: 'info',
    sourcemap: prod ? false : 'inline',
    treeShaking: true,
    outfile: 'main.js',
    minify: prod,
    loader: { '.svg': 'text' },
});

const cssContext = await esbuild.context({
    entryPoints: ['src/styles.css'],
    bundle: true,
    logLevel: 'info',
    outfile: 'styles.css',
    minify: prod,
});

if (prod) {
    await Promise.all([context.rebuild(), cssContext.rebuild()]);
    context.dispose();
    cssContext.dispose();
} else {
    await Promise.all([context.watch(), cssContext.watch()]);
}
