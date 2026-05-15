#!/usr/bin/env node
/**
 * gen-masks.js
 *
 * Generates pixel-perfect screen mask PNGs from Apple device bezel PNGs.
 *
 * Algorithm:
 *   1. Decode RGBA pixels from bezel PNG (via sharp)
 *   2. BFS flood-fill from all image-edge transparent pixels
 *      → marks all "outer background" transparent areas as visited
 *   3. Any remaining unvisited transparent pixel = screen interior
 *   4. Output mask: screen interior → white opaque, everything else → transparent
 *   5. Apply as CSS mask-image for pixel-perfect wallpaper clipping
 *
 * Requires: pnpm add -D sharp  (or npm install --save-dev sharp)
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC = join(__dirname, '..', 'static', 'bezels');

const DEVICES = ['phone', 'ipad', 'monitor'];

async function processDevice(device) {
	const inPath  = join(STATIC, `${device}.png`);
	const outPath = join(STATIC, `${device}-mask.png`);

	// Decode to raw RGBA
	const { data, info } = await sharp(inPath)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const { width, height } = info;
	console.log(`  ${device}: ${width}×${height}`);

	// ── BFS flood fill from all edge-transparent pixels ──────────────────────
	const visited = new Uint8Array(width * height);
	const queue   = new Int32Array(width * height * 2); // pre-alloc for speed
	let qHead = 0, qTail = 0;

	const alphaAt = (x, y) => data[(y * width + x) * 4 + 3];
	const linearIdx = (x, y) => y * width + x;

	function seed(x, y) {
		const i = linearIdx(x, y);
		if (!visited[i] && alphaAt(x, y) < 128) {
			visited[i] = 1;
			queue[qTail++] = x;
			queue[qTail++] = y;
		}
	}

	// Seed from all 4 edges
	for (let x = 0; x < width;  x++) { seed(x, 0); seed(x, height - 1); }
	for (let y = 0; y < height; y++) { seed(0, y); seed(width - 1, y);   }

	// BFS (4-connected)
	while (qHead < qTail) {
		const x = queue[qHead++];
		const y = queue[qHead++];
		if (x > 0)         seed(x - 1, y);
		if (x < width - 1) seed(x + 1, y);
		if (y > 0)         seed(x, y - 1);
		if (y < height - 1)seed(x, y + 1);
	}

	// ── Build mask buffer ─────────────────────────────────────────────────────
	const mask = Buffer.alloc(width * height * 4, 0); // all transparent
	let screenPx = 0;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = linearIdx(x, y);
			if (alphaAt(x, y) < 128 && !visited[i]) {
				// Screen interior — make white & opaque
				const m = i * 4;
				mask[m]     = 255;
				mask[m + 1] = 255;
				mask[m + 2] = 255;
				mask[m + 3] = 255;
				screenPx++;
			}
		}
	}

	console.log(`    screen pixels: ${screenPx.toLocaleString()} (${(screenPx / (width * height) * 100).toFixed(1)}%)`);

	// ── Encode & write PNG ────────────────────────────────────────────────────
	const png = await sharp(mask, { raw: { width, height, channels: 4 } })
		.png({ compressionLevel: 6 })
		.toBuffer();

	writeFileSync(outPath, png);
	console.log(`    ✓ wrote ${outPath} (${Math.round(png.length / 1024)} KB)`);
}

async function main() {
	console.log('Generating bezel mask PNGs…\n');
	for (const device of DEVICES) {
		await processDevice(device);
	}
	console.log('\nAll masks done.');
}

main().catch(err => { console.error(err); process.exit(1); });
