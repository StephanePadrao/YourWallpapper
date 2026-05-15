import { createRNG } from '../noise';
import { resolveColors, interpolatePalette } from '../palette';
import type { StyleRingsParams } from '../types';

export function generateRingsSVG(params: StyleRingsParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	void rng;
	const base = resolveColors(params.palette);
	const palette = interpolatePalette(base, params.numRings);

	const cx = width / 2;
	let cy: number;
	switch (params.origin) {
		case 'top':    cy = 0; break;
		case 'bottom': cy = height; break;
		default:       cy = height / 2;
	}

	// Max radius = farthest corner from origin
	const maxR = Math.sqrt(
		Math.pow(Math.max(cx, width - cx), 2) +
		Math.pow(Math.max(Math.abs(cy), Math.abs(height - cy)), 2)
	);

	// Each "slot" is maxR / numRings wide; stroke fills (1 - spacing%) of that
	const slotR = maxR / params.numRings;
	const strokeW = slotR * (1 - params.spacing / 100) * params.lineWidth / 6;

	const rings: string[] = [];

	// Draw outer rings first so inner are on top
	for (let i = params.numRings - 1; i >= 0; i--) {
		const t = (i + 0.5) / params.numRings; // 0 = innermost, 1 = outermost
		const r = t * maxR;
		const color = palette[Math.round((1 - t) * (params.numRings - 1))]; // inner = end of palette
		rings.push(
			`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" ` +
			`fill="none" stroke="${color}" stroke-width="${strokeW.toFixed(1)}"/>`
		);
	}

	const bg = palette[0];

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${bg}"/>
${rings.join('\n')}
</svg>`;
}
