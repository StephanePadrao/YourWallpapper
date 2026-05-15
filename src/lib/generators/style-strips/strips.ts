import { createRNG } from '../noise';
import { resolveColors, interpolatePalette } from '../palette';
import type { StyleStripsParams } from '../types';

export function generateStripsSVG(params: StyleStripsParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	void rng;
	const base = resolveColors(params.palette);
	const palette = interpolatePalette(base, params.count);

	const isVert = params.direction === 'vertical';
	const dim = isVert ? width : height;
	const crossDim = isVert ? height : width;

	// gap is a % of strip width, converted to px
	const totalAvail = dim;
	const gapFraction = params.gap / 100;
	// stripSize * count + gapPx * (count - 1) = dim
	// stripSize * count + gapFraction * stripSize * (count - 1) = dim
	// stripSize * (count + gapFraction * (count - 1)) = dim
	const stripSize = totalAvail / (params.count + gapFraction * (params.count - 1));
	const gapPx = stripSize * gapFraction;
	const rx = (params.rounded / 100) * stripSize * 0.5;

	const bg = palette[0];
	const strips: string[] = [];

	for (let i = 0; i < params.count; i++) {
		const pos = i * (stripSize + gapPx);
		const color = palette[i];
		if (isVert) {
			strips.push(
				`<rect x="${pos.toFixed(1)}" y="0" width="${stripSize.toFixed(1)}" height="${crossDim}" rx="${rx.toFixed(1)}" fill="${color}"/>`
			);
		} else {
			strips.push(
				`<rect x="0" y="${pos.toFixed(1)}" width="${crossDim}" height="${stripSize.toFixed(1)}" rx="${rx.toFixed(1)}" fill="${color}"/>`
			);
		}
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${bg}"/>
${strips.join('\n')}
</svg>`;
}
