const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'data', 'trout');
const outDir = path.join(rootDir, 'data', 'trout-repo');
const rawDir = path.join(outDir, 'raw');
const normDir = path.join(outDir, 'normalized');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function slugify(input) {
  if (!input) {
    return 'untitled';
  }
  return input
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

function readJsonSafe(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

ensureDir(outDir);
ensureDir(rawDir);
ensureDir(normDir);

const sourceFiles = fs.readdirSync(srcDir);
const fileMeta = [];
const errors = [];
const entries = [];
const maps = [];
const jsonSources = [];

sourceFiles.forEach((name) => {
  const srcPath = path.join(srcDir, name);
  const stat = fs.statSync(srcPath);
  if (!stat.isFile()) {
    return;
  }

  const rawBuffer = fs.readFileSync(srcPath);
  const destPath = path.join(rawDir, name);
  fs.writeFileSync(destPath, rawBuffer);

  fileMeta.push({
    name,
    bytes: stat.size,
    sha256: sha256(rawBuffer),
    type: path.extname(name).toLowerCase().slice(1) || 'unknown'
  });
});

sourceFiles
  .filter((name) => name.toLowerCase().endsWith('.json'))
  .forEach((name) => {
    const srcPath = path.join(srcDir, name);
    const stat = fs.statSync(srcPath);
    const parsed = readJsonSafe(srcPath);

    if (!parsed.ok) {
      errors.push({ file: name, error: parsed.error });
      return;
    }

    const data = parsed.data;
    const isEmptyObject =
      data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0;

    if (isEmptyObject) {
      errors.push({ file: name, error: 'empty JSON object' });
      jsonSources.push({ file: name, bytes: stat.size, page_count: 0, has_maps: false });
      return;
    }

    let pageCount = 0;
    let hasMaps = false;

    if (Array.isArray(data.pages)) {
      data.pages.forEach((page, index) => {
        pageCount += 1;
        const title = page.title || page.source || page.page_title || null;
        entries.push({
          id: `${path.basename(name, '.json')}-${index + 1}-${slugify(title)}`,
          title,
          summary: page.summary || null,
          key_facts: Array.isArray(page.key_facts) ? page.key_facts : [],
          downloads: Array.isArray(page.downloads) ? page.downloads : [],
          source_file: name,
          source_index: index
        });
      });
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        pageCount += 1;
        const title = item.title || item.source || item.page_title || null;
        entries.push({
          id: `${path.basename(name, '.json')}-${index + 1}-${slugify(title)}`,
          title,
          summary: item.summary || null,
          key_facts: Array.isArray(item.key_facts) ? item.key_facts : [],
          downloads: Array.isArray(item.downloads) ? item.downloads : [],
          source_file: name,
          source_index: index
        });
      });
    } else if (data.pages) {
      errors.push({ file: name, error: 'pages is not an array' });
    }

    if (Array.isArray(data.maps)) {
      hasMaps = data.maps.length > 0;
      data.maps.forEach((mapName) => {
        maps.push({
          name: mapName,
          source_file: name
        });
      });
    }

    jsonSources.push({ file: name, bytes: stat.size, page_count: pageCount, has_maps: hasMaps });
  });

const indexPayload = {
  generated_at: new Date().toISOString(),
  source_directory: 'data/trout',
  entries,
  maps,
  json_sources: jsonSources
};

const manifestPayload = {
  generated_at: indexPayload.generated_at,
  source_directory: 'data/trout',
  raw_directory: 'data/trout-repo/raw',
  normalized_directory: 'data/trout-repo/normalized',
  files: fileMeta,
  entry_count: entries.length,
  map_count: maps.length,
  json_sources: jsonSources,
  errors
};

fs.writeFileSync(path.join(normDir, 'trout-index.json'), JSON.stringify(indexPayload, null, 2));
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifestPayload, null, 2));

console.log('Trout repository build complete.');
console.log(`Entries: ${entries.length}`);
console.log(`Maps: ${maps.length}`);
console.log(`Errors: ${errors.length}`);
