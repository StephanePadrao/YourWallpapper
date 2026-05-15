import { createNoise2D } from 'simplex-noise';
import { contours } from 'd3-contour';
import { createRNG } from '../noise';
import { resolveColors } from '../palette';
import type { StyleTopoParams } from '../types';

function ringToPath(ring: [number, number][]): string {
	if (ring.length === 0) return '';
	const d = ring.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
	return d + ' Z';
}

function multiPolygonToPath(coords: [number, number][][][]): string {
	return coords
		.map((polygon) => polygon.map(ringToPath).join(' '))
		.join(' ');
}

export function generateTopoSVG(params: StyleTopoParams, width: number, height: number): string {
	const hexColors = resolveColors(params.palette);
	const rng = createRNG(params.seed);
	const noise2D = createNoise2D(rng);

	// Grid resolution — balance quality vs performance
	const gridW = 256;
	const gridH = Math.round(gridW * (height / width));
	const scaleX = width / gridW;
	const scaleY = height / gridH;

	// Noise scale: smoothness maps to noise frequency
	const noiseFreq = 0.5 + (1 - params.smoothness / 100) * 3.5;
	// Seed-based offset to vary the terrain
	const offsetX = rng() * 100;
	const offsetY = rng() * 100;

	// Generate height map
	const values = new Float64Array(gridW * gridH);
	for (let row = 0; row < gridH; row++) {
		for (let col = 0; col < gridW; col++) {
			const nx = (col / gridW) * noiseFreq + offsetX;
			const ny = (row / gridH) * noiseFreq + offsetY;
			// Layer octaves for more detail
			let v = noise2D(nx, ny) * 0.6;
			v += noise2D(nx * 2, ny * 2) * 0.25;
			v += noise2D(nx * 4, ny * 4) * 0.15;
			values[row * gridW + col] = v;
		}
	}

	// Build threshold levels
	const n = params.layers;
	const min = -0.85, max = 0.85;
	const thresholds = Array.from({ length: n }, (_, i) => min + (i / (n - 1)) * (max - min));

	// Generate contours (coordinates in grid space [0..gridW, 0..gridH])
	const contourGen = contours().size([gridW, gridH]).thresholds(thresholds);
	const bands = contourGen(Array.from(values));

	const bg = hexColors[0];

	// Scale coordinates from grid space to canvas space
	const paths = bands.map((band, i) => {
		const t = i / (bands.length - 1);
		const colorIdx = Math.floor(t * (hexColors.length - 1));
		const color = hexColors[colorIdx];

		// Scale coordinates
		const scaledCoords = band.coordinates.map((polygon) =>
			polygon.map((ring) =>
				ring.map(([x, y]) => [x * scaleX, y * scaleY] as [number, number])
			)
		);

		const d = multiPolygonToPath(scaledCoords);
		if (!d) return '';

		if (params.filled) {
			return `<path d="${d}" fill="${color}" opacity="0.75"/>`;
		} else {
			return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${params.lineWeight}" opacity="0.9"/>`;
		}
	});

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${bg}"/>
${paths.join('\n')}
</svg>`;
}
