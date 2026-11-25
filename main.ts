// Two Robots in an Elevator — make.fun entry (program/v1)
// Writes one line of awkward small talk one robot says to another in an
// elevator, to $MAKEFUN_OUTPUT_DIR/entry.txt (default ./output/entry.txt).
// Gate: UTF-8 text, 1-200 characters, single line, not only whitespace.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// The entry is built from three named parts so the joke's beats stay
// visible in the code: the greeting, the confession, and the machine-logic
// punchline (an exit protocol too polite to say goodbye).
const GREETING = "Going up? Same.";
const CONFESSION =
  "I've been riding this elevator for forty minutes because";
const PUNCHLINE = "my exit protocol is too polite to say goodbye first.";

function buildEntry(): string {
  return [GREETING, CONFESSION, PUNCHLINE].join(" ");
}

type GateReport = { ok: boolean; reason: string; chars: number };

function validateEntry(text: string): GateReport {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    return { ok: false, reason: `length ${chars} outside 1-200`, chars };
  }
  if (text.trim().length === 0) {
    return { ok: false, reason: "blank", chars };
  }
  if (text.includes("\n")) {
    return { ok: false, reason: "not a single line", chars };
  }
  return { ok: true, reason: "gate passes", chars };
}

function verifyWritten(path: string, expected: string): string {
  const written = readFileSync(path, "utf8");
  const back = validateEntry(written);
  if (!back.ok || written !== expected) {
    throw new Error("verification failed: written entry differs");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

const ENTRY = buildEntry();
const gate = validateEntry(ENTRY);
if (!gate.ok) {
  console.error(`gate failed: ${gate.reason}`);
  process.exit(1);
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "./output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");
const sha = verifyWritten(outPath, ENTRY);
console.log(`gate passes: ${gate.chars} characters, 1 line, sha256 ${sha}`);
console.log(`wrote ${outPath}`);
console.log(`verified: ${JSON.stringify(ENTRY)}`);
