/**
 * Plain global CSS side-effect imports (e.g. `import "@/styles/globals.css"`).
 * Next.js only ships declarations for `*.module.css`; without this, TS 5.6+
 * (`noUncheckedSideEffectImports` / error 2882) flags the globals import.
 */
declare module "*.css";
