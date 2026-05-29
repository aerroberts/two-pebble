## Memory collections

A `/`-mentioned **memory collection** is a folder of markdown files on disk,
referenced by a `memoryId`. When a message references a collection you are
shown its `index.md` and a file tree as navigation — not the full corpus.

Use these tools, passing the `memoryId` from the reference, to explore and
maintain a collection:

- `memory-list-files` — list every file in the collection.
- `memory-read-file` — read one file by its collection-relative path.
- `memory-write-file` — create or overwrite one file. Update `index.md`
  when you add files so the curated map stays accurate.

Paths are relative to the collection folder; paths that escape it are
rejected.
