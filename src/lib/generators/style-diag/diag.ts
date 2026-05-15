import { createRNG } from '../noise';
import { resolveColors, interpolatePalette } from '../palette';
import type { StyleDiagParams, DiagDirection } from '../types';

const DIRECTION_ANGLES: Record<DiagDirection, number> = {
	'horizontal':    0,
	'diagonal':      45,
	'diagonal-inv':  135,
	'vertical':      90,
};

export function generateDiagSVG(params: StyleDiagParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	void rng;
	const base = resolveColors(params.palette);
	const palette = interpolatePalette(base, params.numBands);

	const diag = Math.sqrt(width * width + height * height);
	const cx = width / 2;
	const cy = height / 2;
	const slotH = diag / params.numBands;
	const bandH = slotH * (params.bandWidth / 100);
	const halfDiag = diag / 2;
	const op = (params.opacity / 100).toFixed(3);

	const baseAngle = DIRECTION_ANGLES[params.direction ?? 'diagonal'];
	const totalAngle = baseAngle + (params.angle - 45); // angle is a fine-tune offset around 45

	const defs: string[] = [];
	const rects: string[] = [];

	for (let i = 0; i < params.numBands; i++) {
		const color = palette[i];
		const id = `db${i}`;
		defs.push(
			`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">` +
			`<stop offset="0%" stop-color="${color}" stop-opacity="0"/>` +
			`<stop offset="28%" stop-color="${color}" stop-opacity="${op}"/>` +
			`<stop offset="72%" stop-color="${color}" stop-opacity="${op}"/>` +
			`<stop offset="100%" stop-color="${color}" stop-opacity="0"/>` +
			`</linearGradient>`
		);
		const slotCenter = -halfDiag + (i + 0.5) * slotH;
		const y = slotCenter - bandH / 2;
		rects.push(
			`<rect x="${(-halfDiag).toFixed(1)}" y="${y.toFixed(1)}" width="${diag.toFixed(1)}" height="${bandH.toFixed(1)}" fill="url(#${id})"/>`
		);
	}

	const bg = palette[0];

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${defs.join('')}</defs>
<rect width="${width}" height="${height}" fill="${bg}"/>
<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${totalAngle.toFixed(1)})">
${rects.join('\n')}
</g>
</svg>`;
}
