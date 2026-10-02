// scripts/generate-manifests.js
const fs = require("fs");
const path = require("path");

const ROOT = "./curriculum";
const OUT  = "./_manifest.json";
const SKIP = new Set(["_manifest.json", ".DS_Store", "Thumbs.db"]);

function inferType(ext) {
  const e = ext.toLowerCase();
  if (e === ".json") return "json";
  if (e === ".pdf") return "pdf";
  if (e === ".txt") return "text";
  if (e === ".md") return "markdown";
  if ([".jpg",".jpeg",".png",".webp",".gif",".svg"].includes(e)) return "image";
  if ([".mp4",".webm",".mov",".m4v"].includes(e)) return "video";
  if ([".mp3",".wav",".m4a",".ogg"].includes(e)) return "audio";
  if (e === ".csv") return "csv";
  if ([".docx",".doc"].includes(e)) return "document";
  return "other";
}

function readJsonMetadata(filePath) {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const meta = raw.unit_metadata || raw.topic_metadata || raw.metadata || {};
    return {
      unit_number: meta.unit_number ?? null,
      unit_title: meta.unit_title ?? meta.topic_title ?? null,
      subject: meta.subject ?? null,
      class_level: meta.class_level ?? null,
    };
  } catch { return {}; }
}

const files = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (SKIP.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    const rel = path.relative(ROOT, full).split(path.sep).join("/");
    const ext = path.extname(entry.name);
    const stat = fs.statSync(full);

    const item = {
      path: rel,                              // e.g. "uganda/uce/s1/biology/unit_01.json"
      name: entry.name,
      extension: ext,
      type: inferType(ext),
      size_bytes: stat.size,
      modified: stat.mtime.toISOString(),
    };

    if (item.type === "json") Object.assign(item, readJsonMetadata(full));
    files.push(item);
  }
}

walk(ROOT);

// Sort: json units first by path, others after
files.sort((a, b) => a.path.localeCompare(b.path));

fs.writeFileSync(OUT, JSON.stringify({
  generated_at: new Date().toISOString(),
  total_files: files.length,
  files,
}, null, 2));

console.log(`Wrote ${OUT} — ${files.length} files`);