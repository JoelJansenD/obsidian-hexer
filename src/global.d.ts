declare module '*.svg' {
    const content: string;
    export default content;
}

// Obsidian's desktop runtime is Electron with Node integration, which exposes a
// CommonJS `require`. Declared minimally so plugin code can lazily load Electron/
// Node modules (gated behind Platform.isDesktopApp). Typed as `unknown` to force
// an explicit cast at each call site rather than leaking `any`.
declare function require(module: string): unknown;
