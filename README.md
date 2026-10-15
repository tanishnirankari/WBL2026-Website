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
  .github/       Website deployment workflow
  dist/          Generated website output (created by the build)
```

The root `index.html` and `assets/` directory are a separate prebuilt site
copy. Its images are served from `source-project/public/images/`, the same
folder used by the editable app. Make image changes in that one folder; edit
the React app in `source-project/` rather than generated files in `assets/`.

Generated dependencies (`node_modules/`) and build output (`dist/`) are not
where application source code should be edited.
