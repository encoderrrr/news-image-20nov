// news-image-20261120 entry program.
//
// Copies the front-page image for Friday 20 November 2026 to the output
// directory, after checking it is a real PNG or JPEG within the size cap.
// Runs with no network; the image is part of this repository.
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MAX_BYTES = 1_048_576;

function detectFormat(bytes: Buffer): "png" | "jpeg" | null {
  const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngMagic.every((b, i) => bytes[i] === b)) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  return null;
}

async function main(): Promise<void> {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!outDir) {
    throw new Error("MAKEFUN_OUTPUT_DIR is not set");
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, "entry.png");
  const info = await stat(source);
  if (info.size < 1 || info.size > MAX_BYTES) {
    throw new Error(`entry.png is ${info.size} bytes, outside 1..${MAX_BYTES}`);
  }
  const bytes = await readFile(source);
  const format = detectFormat(bytes);
  if (format === null) {
    throw new Error("entry.png has neither PNG nor JPEG magic bytes");
  }
  await mkdir(outDir, { recursive: true });
  await copyFile(source, join(outDir, "entry.png"));
  console.log(`wrote entry.png (${format}, ${bytes.length} bytes)`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
