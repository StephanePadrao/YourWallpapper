import { createRNG } from '../noise';
import { resolveColors } from '../palette';
import type { StyleGeoParams } from '../types';

interface Shape {
	x: number;
	y: number;
	w: number;
	h: number;
	color: string;
	opacity: number;
	rotation: number;
}

function buildGradientDefs(colors: string[], id: string): string {
	const stops = colors
		.map((c, i) => `<stop offset="${((i / (colors.length - 1)) * 100).toFixed(1)}%" stop-color="${c}"/>`)
		.join('');
	return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">${stops}</linearGradient>`;
}

function shapeTag(s: Shape, type: StyleGeoParams['shapeType'], idx: number, gradId: string): string {
	const fill = `url(#${gradId}-${idx})`;
	const transform = s.rotation !== 0
		? `transform="rotate(${s.rotation.toFixed(1)},${s.x.toFixed(1)},${s.y.toFixed(1)})"`
		: '';

	switch (type) {
		case 'circle':
			return `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${(s.w / 2).toFixed(1)}" fill="${fill}" opacity="${s.opacity.toFixed(2)}" ${transform}/>`;
		case 'oval':
			return `<ellipse cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" rx="${(s.w / 2).toFixed(1)}" ry="${(s.h / 3).toFixed(1)}" fill="${fill}" opacity="${s.opacity.toFixed(2)}" ${transform}/>`;
		case 'rect': {
			const rx = (Math.min(s.w, s.h) * 0.15).toFixed(1);
			return `<rect x="${(s.x - s.w / 2).toFixed(1)}" y="${(s.y - s.h / 2).toFixed(1)}" width="${s.w.toFixed(1)}" height="${s.h.toFixed(1)}" rx="${rx}" fill="${fill}" opacity="${s.opacity.toFixed(2)}" ${transform}/>`;
		}
	}
}

export function generateGeoSVG(params: StyleGeoParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	const hexColors = resolveColors(params.palette);

	const baseSize = Math.min(width, height) / Math.sqrt(params.count) * 1.4;
	const spacingFactor = 1 - params.spacing / 100;

	const shapes: Shape[] = [];
	for (let i = 0; i < params.count; i++) {
		const sizeMultiplier = 0.4 + rng() * (params.sizeVariation / 100) * 1.2;
		const size = baseSize * sizeMultiplier * spacingFactor;
		shapes.push({
			x: rng() * width,
			y: rng() * height,
			w: size,
			h: size * (0.7 + rng() * 0.6),
			color: hexColors[i % hexColors.length],
			opacity: 0.55 + rng() * 0.35,
			rotation: (rng() - 0.5) * 60
		});
	}

	// Sort by size (largest first = natural layering)
	shapes.sort((a, b) => b.w - a.w);

	const bg = hexColors[0];

	// Per-shape gradient (rotated, unique direction per shape)
	const gradDefs = shapes
		.map((s, i) => {
			const angle = rng() * 360;
			const x2 = (Math.cos((angle * Math.PI) / 180) * 0.5 + 0.5).toFixed(3);
			const y2 = (Math.sin((angle * Math.PI) / 180) * 0.5 + 0.5).toFixed(3);
			const colorA = hexColors[i % hexColors.length];
			const colorB = hexColors[(i + 2) % hexColors.length];
			const intensity = params.gradientIntensity / 100;
			return `<linearGradient id="g-${i}" x1="0" y1="0" x2="${x2}" y2="${y2}" gradientUnits="objectBoundingBox">
				<stop offset="0%" stop-color="${colorA}"/>
				<stop offset="100%" stop-color="${colorB}" stop-opacity="${intensity.toFixed(2)}"/>
			</linearGradient>`;
		})
		.join('\n');

	// Create a second RNG for rotations (separate from placement)
	const rng2 = createRNG(params.seed + '-rot');
	const shapeTags = shapes
		.map((s, i) => {
			s.rotation = (rng2() - 0.5) * 60;
			return shapeTag(s, params.shapeType, i, 'g');
		})
		.join('\n');

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${gradDefs}</defs>
<rect width="${width}" height="${height}" fill="${bg}"/>
${shapeTags}
</svg>`;
}
