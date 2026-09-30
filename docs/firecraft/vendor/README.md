# Three.js runtime

Three.js 0.186.1 (MIT), bundled from the official npm package using esbuild 0.25.10.
Only the WebGL renderer, scene, orthographic camera, plane, shader material, mesh,
and Vector2 exports are exposed. License: THREE-LICENSE.txt.

The module is served from this repository. No CDN requests are made by the page.
Rebuild: export the listed classes from `three/build/three.module.js` in an entry
file, then `npx --yes esbuild@0.25.10 entry.js --bundle --minify --format=esm --outfile=three.min.js`.
