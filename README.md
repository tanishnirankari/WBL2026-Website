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

The files and `assets/` directory at the repository root are a separate
prebuilt site copy. Its `index.html` refers to files by their current paths,
so edit the React app in `source-project/` and avoid moving or renaming the
root-level files unless you are intentionally updating that copy.

Generated dependencies (`node_modules/`) and build output (`dist/`) are not
where application source code should be edited.
