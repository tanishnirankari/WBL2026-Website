# Winter Bash League 2026

## Where to start

The editable website is in [`source-project/`](./source-project/). See its
[README](./source-project/README.md) for setup, run, and build instructions.

## Repository map

```text
source-project/
  src/
    components/  Reusable page sections and UI
    pages/       Website pages
  public/
    images/      Website images copied into the built site
  backend/       Express API and database setup
  old_html/      Previous standalone HTML pages; kept for reference
../.github/
  workflows/     GitHub Pages deployment workflow
  dist/          Generated website output (created by the build)
```

The root `index.html` and `assets/` directory are a prebuilt snapshot, not the
editable source. The GitHub Pages workflow builds `source-project/` and deploys
its `dist/` output. Make changes in `source-project/src/` and
`source-project/public/images/`; do not edit the generated site files by hand.

`node_modules/` and `source-project/dist/` are generated locally. They are
ignored by Git and can be recreated with `npm ci` and `npm run build`.
