import { createRNG } from '../noise';
import { resolveColors } from '../palette';
import type { StyleGradientParams } from '../types';

export function generateGradientSVG(params: StyleGradientParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	const colors = resolveColors(params.palette);

	const diag = Math.sqrt(width * width + height * height);
	// Larger smoothness → wider gradient blobs
	const gradR = diag * (0.45 + (params.smoothness / 100) * 0.55);

	// Spread positions: corners + center + mid-edges
	const anchors = [
		[0.12, 0.12], [0.88, 0.12], [0.50, 0.50],
		[0.12, 0.88], [0.88, 0.88],
	];

	const points: { x: number; y: number; color: string }[] = [];
	for (let i = 0; i < params.numPoints; i++) {
		const a = anchors[i % anchors.length];
		const jx = (rng() - 0.5) * 0.38;
		const jy = (rng() - 0.5) * 0.38;
		points.push({
			x: Math.max(0, Math.min(1, a[0] + jx)) * width,
			y: Math.max(0, Math.min(1, a[1] + jy)) * height,
			color: colors[i % colors.length],
		});
	}

	const defs: string[] = [];
	const rects: string[] = [];

	rects.push(`<rect width="${width}" height="${height}" fill="${points[0].color}"/>`);

	for (let i = 0; i < points.length; i++) {
		const p = points[i];
		const id = `mg${i}`;
		defs.push(
			`<radialGradient id="${id}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${gradR.toFixed(1)}" gradientUnits="userSpaceOnUse">` +
			`<stop offset="0%" stop-color="${p.color}" stop-opacity="1"/>` +
			`<stop offset="45%" stop-color="${p.color}" stop-opacity="0.72"/>` +
			`<stop offset="100%" stop-color="${p.color}" stop-opacity="0"/>` +
			`</radialGradient>`
		);
		rects.push(`<rect width="${width}" height="${height}" fill="url(#${id})"/>`);
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${defs.join('')}</defs>
${rects.join('\n')}
</svg>`;
}
