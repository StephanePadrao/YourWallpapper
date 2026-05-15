import { createRNG } from '../noise';
import { resolveColors, interpolatePalette } from '../palette';
import type { StyleBParams } from '../types';

const GLOSS_DEF = `<radialGradient id="gloss" cx="0.35" cy="0.20" r="0.70" gradientUnits="objectBoundingBox">
<stop offset="0%" stop-color="white" stop-opacity="0.50"/>
<stop offset="55%" stop-color="white" stop-opacity="0.07"/>
<stop offset="100%" stop-color="white" stop-opacity="0"/>
</radialGradient>`;

export function generateCapsulesSVG(
	params: StyleBParams,
	width: number,
	height: number
): string {
	const rng = createRNG(params.seed);
	const hexColors = resolveColors(params.palette);
	const opScale = params.gradientIntensity / 100;

	if (params.layout === 'row') {
		return generateRow(params, width, height, hexColors);
	}

	// ── Grid mode ──────────────────────────────────────────────────────────
	const { gridCols, gridRows, heightVariation } = params;
	const cellW = width / gridCols;
	const cellH = height / gridRows;
	const gap = cellW * 0.04;
	const capW = cellW - gap * 2;
	const rx = Math.min(capW * 0.45, cellH * 0.35);

	const numStops = hexColors.length;
	const stopTags = hexColors
		.map((color, i) => {
			const t = i / (numStops - 1);
			const opacity = i === 0 ? 0.6 + 0.4 * opScale : 1;
			return `<stop offset="${(t * 100).toFixed(1)}%" stop-color="${color}" stop-opacity="${opacity.toFixed(2)}"/>`;
		})
		.join('');

	const capsuleTags: string[] = [];
	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			const variation = (rng() - 0.5) * 2 * (heightVariation / 100);
			const capH = Math.max(cellH * (1 + variation), rx * 2.1);
			const vertOffset = (rng() - 0.5) * cellH * 0.25;
			const centerY = row * cellH + cellH * 0.5;
			const x = (col * cellW + gap).toFixed(2);
			const y = (centerY - capH * 0.5 + vertOffset).toFixed(2);
			const w = capW.toFixed(2);
			const h = capH.toFixed(2);
			const r = rx.toFixed(2);
			capsuleTags.push(
				`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#g)"/>`,
				`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gloss)"/>`
			);
		}
	}

	const bg = hexColors[Math.floor(hexColors.length / 2)];

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
${stopTags}
</linearGradient>
${GLOSS_DEF}
</defs>
<rect width="${width}" height="${height}" fill="${bg}"/>
${capsuleTags.join('\n')}
</svg>`;
}

function generateRow(
	params: StyleBParams,
	width: number,
	height: number,
	hexColors: string[]
): string {
	const n = params.count;
	const palette = interpolatePalette(hexColors, n);

	// Capsule proportions: height ~78% of canvas height, width ~28% of capsule height
	const capH = height * 0.78;
	const capW = capH * 0.28;
	const rx = capW / 2; // fully rounded ends

	const overlapPx = capW * (params.overlap / 100);
	const step = capW - overlapPx; // horizontal distance between consecutive capsule origins
	const totalW = capW + (n - 1) * step;
	const startX = (width - totalW) / 2;
	const cy = height / 2;

	// Each capsule also gets a per-capsule linearGradient (top dark → palette color → bottom dark)
	const defs: string[] = [GLOSS_DEF];
	const capsules: string[] = [];

	for (let i = n - 1; i >= 0; i--) {
		// Draw right-to-left so leftmost ends up on top
		const color = palette[i];
		const gId = `cg${i}`;
		const opScale = params.gradientIntensity / 100;
		defs.push(
			`<linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">` +
			`<stop offset="0%" stop-color="${color}" stop-opacity="${(0.55 + 0.45 * opScale).toFixed(2)}"/>` +
			`<stop offset="45%" stop-color="${color}" stop-opacity="1"/>` +
			`<stop offset="100%" stop-color="${color}" stop-opacity="${(0.6 + 0.4 * opScale).toFixed(2)}"/>` +
			`</linearGradient>`
		);
		const x = (startX + i * step).toFixed(1);
		const y = (cy - capH / 2).toFixed(1);
		const w = capW.toFixed(1);
		const h = capH.toFixed(1);
		const r = rx.toFixed(1);
		capsules.push(
			`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${gId})"/>`,
			`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gloss)"/>`
		);
	}

	const bg = hexColors[0];

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${defs.join('')}</defs>
<rect width="${width}" height="${height}" fill="${bg}"/>
${capsules.join('\n')}
</svg>`;
}
