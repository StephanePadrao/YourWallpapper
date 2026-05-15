import { createRNG } from '../noise';
import { resolveColors, interpolatePalette } from '../palette';
import type { StyleWavesParams } from '../types';

export function generateWavesSVG(params: StyleWavesParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	const base = resolveColors(params.palette);
	const n = params.numBands;
	const colors = interpolatePalette(base, n);
	const isVert = params.direction === 'vertical';

	// For vertical direction we swap roles of width/height so the same math applies
	const W = isVert ? height : width;
	const H = isVert ? width : height;

	const bandH = H / n;
	const amp = (params.amplitude / 100) * bandH * 1.6;
	const freq = params.frequency;
	const turbAmt = (params.turbulence / 100) * Math.PI * 0.4;

	const basePhase = rng() * Math.PI * 2;
	const phases: number[] = [];
	for (let i = 0; i <= n; i++) phases.push(basePhase + (rng() - 0.5) * turbAmt);

	function wavePos(bnd: number, x: number): number {
		if (bnd <= 0) return -amp * 3;
		if (bnd >= n) return H + amp * 3;
		const base = (bnd / n) * H;
		const a = Math.sin(2 * Math.PI * freq * (x / W) + phases[bnd]);
		const b = Math.sin(4 * Math.PI * freq * (x / W) + phases[bnd] * 1.3) * 0.22;
		return base + amp * (a + b);
	}

	const SEG = 64;

	function bandPath(top: number, bot: number): string {
		const pts: string[] = [];
		if (!isVert) {
			for (let s = 0; s <= SEG; s++) {
				const x = (s / SEG) * W;
				pts.push(`${s === 0 ? 'M' : 'L'}${x.toFixed(1)},${wavePos(top, x).toFixed(1)}`);
			}
			for (let s = SEG; s >= 0; s--) {
				const x = (s / SEG) * W;
				pts.push(`L${x.toFixed(1)},${wavePos(bot, x).toFixed(1)}`);
			}
		} else {
			// vertical: waves run along y-axis, bands stack left-right
			for (let s = 0; s <= SEG; s++) {
				const y = (s / SEG) * H; // H = width in this orientation
				pts.push(`${s === 0 ? 'M' : 'L'}${wavePos(top, y).toFixed(1)},${y.toFixed(1)}`);
			}
			for (let s = SEG; s >= 0; s--) {
				const y = (s / SEG) * H;
				pts.push(`L${wavePos(bot, y).toFixed(1)},${y.toFixed(1)}`);
			}
		}
		return pts.join(' ') + ' Z';
	}

	const paths = colors.map((color, i) =>
		`<path d="${bandPath(i, i + 1)}" fill="${color}"/>`
	);

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${colors[0]}"/>
${paths.join('\n')}
</svg>`;
}
