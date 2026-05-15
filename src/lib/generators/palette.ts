import { formatHex, interpolate, clampChroma } from 'culori';
import type { OklchColor, Palette, HarmonyType } from './types';
import { PALETTE_PRESETS } from './constants';
import { createRNG } from './noise';

export function oklchToHex(c: OklchColor): string {
	const clamped = clampChroma({ mode: 'oklch', l: c.l, c: c.c, h: c.h }, 'oklch', 'p3');
	return formatHex(clamped) ?? '#888888';
}

export function resolveColors(palette: string | OklchColor[]): string[] {
	if (typeof palette === 'string') {
		const preset = PALETTE_PRESETS.find((p) => p.name === palette);
		if (!preset) return resolveColors(PALETTE_PRESETS[0].colors);
		return preset.colors.map(oklchToHex);
	}
	return palette.map(oklchToHex);
}

export function generateHarmony(
	anchorHue: number,
	type: HarmonyType,
	count: number,
	chroma = 0.14,
	lightnessRange: [number, number] = [0.35, 0.88]
): OklchColor[] {
	const hues: number[] = [];
	switch (type) {
		case 'analogic':
			for (let i = 0; i < count; i++) hues.push((anchorHue + (i - Math.floor(count / 2)) * 30 + 360) % 360);
			break;
		case 'complementary':
			hues.push(anchorHue, (anchorHue + 180) % 360);
			while (hues.length < count) hues.push((anchorHue + (hues.length * 30)) % 360);
			break;
		case 'triadic':
			hues.push(anchorHue, (anchorHue + 120) % 360, (anchorHue + 240) % 360);
			while (hues.length < count) hues.push((anchorHue + (hues.length * 40)) % 360);
			break;
		case 'split-complementary':
			hues.push(anchorHue, (anchorHue + 150) % 360, (anchorHue + 210) % 360);
			while (hues.length < count) hues.push((anchorHue + (hues.length * 50)) % 360);
			break;
		case 'monochromatic':
			for (let i = 0; i < count; i++) hues.push(anchorHue);
			break;
	}

	const [lMin, lMax] = lightnessRange;
	return hues.slice(0, count).map((h, i) => ({
		l: lMin + (i / (count - 1)) * (lMax - lMin),
		c: chroma,
		h
	}));
}

export function randomPalette(seed: string): Palette {
	const rng = createRNG(seed + '-palette');
	const idx = Math.floor(rng() * PALETTE_PRESETS.length);
	return PALETTE_PRESETS[idx];
}

export function interpolatePalette(colors: string[], steps: number): string[] {
	if (steps <= colors.length) return colors.slice(0, steps);
	const lerp = interpolate(colors, 'oklch');
	return Array.from({ length: steps }, (_, i) => formatHex(lerp(i / (steps - 1))) ?? '#888');
}

// Converts a CSS hex color (#rrggbb) to an OklchColor without culori's converter
export function hexToOklch(hex: string): OklchColor {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const lin = (x: number) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
	const rl = lin(r), gl = lin(g), bl = lin(b);
	const l_ = Math.cbrt(0.4121656120 * rl + 0.5362752080 * gl + 0.0514575653 * bl);
	const m_ = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl);
	const s_ = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl);
	const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
	const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
	const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
	return {
		l: Math.max(0, Math.min(1, L)),
		c: Math.sqrt(a * a + bv * bv),
		h: ((Math.atan2(bv, a) * 180 / Math.PI) + 360) % 360,
	};
}
