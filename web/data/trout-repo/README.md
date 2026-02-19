# Trout Data Repository

This folder stores normalized trout data for the fly fishing module along with raw source files.

## Layout
- raw/ : Copies of the original source files from data/trout.
- normalized/trout-index.json : Normalized index for module ingestion.
- manifest.json : File inventory with sizes and SHA-256 checksums.
- build-trout-repo.js : Rebuild script to refresh the repo from data/trout.

## Build
From the workspace root:

node data/trout-repo/build-trout-repo.js

This rebuilds raw/ copies, regenerates normalized/trout-index.json, and updates manifest.json.
