import { createRNG } from '../noise';
import { resolveColors, interpolatePalette } from '../palette';
import type { StyleHexParams } from '../types';

// Pointy-top hexagon corners
function hexCorners(cx: number, cy: number, s: number, gap: number): string {
	const r = s - gap / 2;
	const pts: string[] = [];
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 180) * (60 * i - 30);
		pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
	}
	return `M${pts.join(' L')} Z`;
}

function gradientValue(
	x: number, y: number, w: number, h: number,
	type: StyleHexParams['gradientType'], angle: number
): number {
	const nx = x / w - 0.5;
	const ny = y / h - 0.5;
	if (type === 'radial') {
		// 0 at corners, 1 at center
		return Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny) / 0.708);
	}
	if (type === 'angular') {
		// Rotates through the palette by angle from center
		return (Math.atan2(ny, nx) / (Math.PI * 2) + 0.5 + angle / 360) % 1;
	}
	// diagonal linear
	const rad = (angle * Math.PI) / 180;
	const proj = nx * Math.cos(rad) + ny * Math.sin(rad);
	return Math.max(0, Math.min(1, proj / 0.708 + 0.5));
}

export function generateHexSVG(params: StyleHexParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	void rng; // seeded but not used for placement (deterministic grid)
	const base = resolveColors(params.palette);
	// Interpolate to 64 steps for smooth hex-by-hex color mapping
	const palette = interpolatePalette(base, 64);

	const s = params.cellSize;
	const colW = s * Math.sqrt(3);
	const rowH = s * 1.5;
	const cols = Math.ceil(width / colW) + 2;
	const rows = Math.ceil(height / rowH) + 2;

	const hexes: string[] = [];

	for (let row = -1; row < rows; row++) {
		for (let col = -1; col < cols; col++) {
			const cx = col * colW + (row % 2 === 1 ? colW / 2 : 0);
			const cy = row * rowH;

			// Skip hexes whose centre is far outside the canvas
			if (cx + s < -s || cx - s > width + s) continue;
			if (cy + s < -s || cy - s > height + s) continue;

			const t = gradientValue(cx, cy, width, height, params.gradientType, params.gradientAngle);
			const colorIdx = Math.round(t * (palette.length - 1));
			const color = palette[Math.max(0, Math.min(palette.length - 1, colorIdx))];
			const d = hexCorners(cx, cy, s, params.gapSize);
			hexes.push(`<path d="${d}" fill="${color}"/>`);
		}
	}

	const bg = palette[0];

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${bg}"/>
${hexes.join('\n')}
</svg>`;
}
