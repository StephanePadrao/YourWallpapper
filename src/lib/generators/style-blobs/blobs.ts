import { createNoise2D } from 'simplex-noise';
import { createRNG } from '../noise';
import { resolveColors } from '../palette';
import type { StyleBlobsParams } from '../types';

function lerpHex(a: string, b: string, t: number): string {
	const ra = parseInt(a.slice(1, 3), 16);
	const ga = parseInt(a.slice(3, 5), 16);
	const ba = parseInt(a.slice(5, 7), 16);
	const rb = parseInt(b.slice(1, 3), 16);
	const gb = parseInt(b.slice(3, 5), 16);
	const bb = parseInt(b.slice(5, 7), 16);
	const r = Math.round(ra + (rb - ra) * t).toString(16).padStart(2, '0');
	const g = Math.round(ga + (gb - ga) * t).toString(16).padStart(2, '0');
	const bv = Math.round(ba + (bb - ba) * t).toString(16).padStart(2, '0');
	return `#${r}${g}${bv}`;
}

function catmullPath(pts: [number, number][]): string {
	const n = pts.length;
	let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
	for (let i = 0; i < n; i++) {
		const p0 = pts[(i - 1 + n) % n];
		const p1 = pts[i];
		const p2 = pts[(i + 1) % n];
		const p3 = pts[(i + 2) % n];
		const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
		const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
		const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
		const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
		d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
	}
	return d + 'Z';
}

function organicRing(
	cx: number, cy: number, r: number,
	noise2D: (x: number, y: number) => number,
	warpAmt: number, blobId: number,
	segments = 64
): [number, number][] {
	const pts: [number, number][] = [];
	for (let i = 0; i < segments; i++) {
		const theta = (i / segments) * 2 * Math.PI;
		// Fixed-frequency noise sampling — all rings share the same "shape"
		const nx = Math.cos(theta) + blobId * 13.7;
		const ny = Math.sin(theta) + blobId * 9.3;
		const warp = warpAmt * r * noise2D(nx, ny);
		const actualR = Math.max(r * 0.08, r + warp);
		pts.push([cx + actualR * Math.cos(theta), cy + actualR * Math.sin(theta)]);
	}
	return pts;
}

// Predefined spread positions (normalised 0–1)
const SPREAD: [number, number][] = [
	[0.15, 0.22], [0.78, 0.18], [0.48, 0.50],
	[0.14, 0.76], [0.80, 0.74], [0.50, 0.14],
	[0.82, 0.45], [0.30, 0.88],
];

export function generateBlobsSVG(params: StyleBlobsParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	const noise2D = createNoise2D(rng);
	const colors = resolveColors(params.palette);

	const bg = colors[0];
	const maxR = (params.blobSize / 100) * Math.min(width, height) * 0.65;
	const warpAmt = (params.organicness / 100) * 0.32;
	const K = params.ringCount;

	interface Blob { cx: number; cy: number; color: string; r: number }
	const blobs: Blob[] = [];

	for (let i = 0; i < params.numBlobs; i++) {
		const pos = SPREAD[i % SPREAD.length];
		const jx = (rng() - 0.5) * 0.18;
		const jy = (rng() - 0.5) * 0.18;
		blobs.push({
			cx: Math.max(0.08, Math.min(0.92, pos[0] + jx)) * width,
			cy: Math.max(0.08, Math.min(0.92, pos[1] + jy)) * height,
			color: colors[(i + 1) % colors.length],
			r: maxR * (0.65 + rng() * 0.7),
		});
	}

	// Larger blobs drawn first (underneath)
	blobs.sort((a, b) => b.r - a.r);

	const paths: string[] = [];

	for (const [bi, blob] of blobs.entries()) {
		// Draw rings outermost → innermost
		for (let k = K - 1; k >= 0; k--) {
			const t = k / (K - 1); // 0 = innermost, 1 = outermost
			const r = blob.r * (t * 0.88 + 0.12);
			// Color: innermost = peak color, outermost = blends into bg
			const blendT = Math.pow(t, 0.9) * 0.82;
			const color = lerpHex(blob.color, bg, blendT);
			const pts = organicRing(blob.cx, blob.cy, r, noise2D, warpAmt, bi);
			paths.push(`<path d="${catmullPath(pts)}" fill="${color}"/>`);
		}
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${bg}"/>
${paths.join('\n')}
</svg>`;
}
