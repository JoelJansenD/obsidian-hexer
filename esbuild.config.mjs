import esbuild from 'esbuild';
import builtins from 'builtin-modules';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
    entryPoints: ['src/obsidian/main.ts'],
    bundle: true,
    external: [
        'obsidian',
        'electron',
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
});

if (prod) {
    await context.rebuild();
    context.dispose();
} else {
    await context.watch();
}
