# Package hints (do not treat as a runnable node project)

Reconstructed `package.json` in the Phase 2 scaffold was empty; deps recovered from the from-transcript / `.rej` intent for the same prototypes.

## Engines
- `node`: `>=22.12.0`

## Scripts (expected)
- `dev`: `astro dev --port 43123 --host`
- `build`: `astro build`
- `preview`: `astro preview --port 43123 --host`
- `test`: `vitest run`
- `test:watch`: `vitest`

## dependencies
- `astro`: `^7.2.9`
- `@astrojs/sitemap`: `^3.7.3`
- `@fontsource/ibm-plex-mono`: `^5.3.0`
- `@fontsource/ibm-plex-sans`: `^5.3.0`

## Starred chrome fonts (apps + tools cyan system)
Vault / `tokens-apps-and-tools.md` locks **Inter** + **IBM Plex Mono**. When porting, prefer Inter for UI (or keep IBM Plex Sans if already wired) and IBM Plex Mono for tabular numerals/formulas. Do not introduce a second brand font stack.

## devDependencies
- `vitest`: `^4.1.11`

## Note
This drop folder is **not** a full Astro app. Port modules into the live site; install deps in that repo, not here.
