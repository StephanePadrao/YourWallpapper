import { createRNG } from '../noise';
import { resolveColors } from '../palette';
import type { StyleFluidParams } from '../types';

export function generateFluidSVG(params: StyleFluidParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	const colors = resolveColors(params.palette);

	// Diagonal length — gradient sources radiate this far
	const diag = Math.sqrt(width * width + height * height);
	const gradR = diag * 0.72;

	// Place N color sources at seeded positions
	const points: { x: number; y: number; color: string }[] = [];
	// First source: anchor at a biased position (not fully random)
	const anchors = [
		[0.2, 0.2], [0.8, 0.2], [0.5, 0.6],
		[0.2, 0.8], [0.8, 0.75], [0.5, 0.1],
	];
	for (let i = 0; i < params.numPoints; i++) {
		const a = anchors[i % anchors.length];
		const jx = (rng() - 0.5) * 0.28;
		const jy = (rng() - 0.5) * 0.28;
		points.push({
			x: Math.max(0, Math.min(1, a[0] + jx)) * width,
			y: Math.max(0, Math.min(1, a[1] + jy)) * height,
			color: colors[i % colors.length],
		});
	}

	const defs: string[] = [];
	const rects: string[] = [];

	// Background: first color
	rects.push(`<rect width="${width}" height="${height}" fill="${points[0].color}"/>`);

	// Each subsequent point overlays a radial gradient
	for (let i = 0; i < points.length; i++) {
		const p = points[i];
		const id = `fg${i}`;
		defs.push(
			`<radialGradient id="${id}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${gradR.toFixed(1)}" gradientUnits="userSpaceOnUse">` +
			`<stop offset="0%" stop-color="${p.color}" stop-opacity="0.92"/>` +
			`<stop offset="55%" stop-color="${p.color}" stop-opacity="0.45"/>` +
			`<stop offset="100%" stop-color="${p.color}" stop-opacity="0"/>` +
			`</radialGradient>`
		);
		rects.push(`<rect width="${width}" height="${height}" fill="url(#${id})"/>`);
	}

	// Line texture overlay
	let lineLayer = '';
	if (params.lineTexture && params.lineOpacity > 0) {
		const sp = Math.max(2, params.lineSpacing);
		const op = (params.lineOpacity / 100).toFixed(3);
		defs.push(
			`<pattern id="lns" x="0" y="0" width="${sp}" height="1" patternUnits="userSpaceOnUse">` +
			`<rect x="0" y="0" width="${(sp / 2).toFixed(1)}" height="1" fill="rgba(0,0,0,${op})"/>` +
			`</pattern>`
		);
		lineLayer = `<rect width="${width}" height="${height}" fill="url(#lns)"/>`;
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${defs.join('')}</defs>
${rects.join('\n')}
${lineLayer}
</svg>`;
}
