import type { Style, OklchColor } from '$lib/generators/types';
import type { GeneratorStore } from '$lib/generators/types';
import { type DeviceConfig, DEVICES } from '$lib/devices';

export interface URLState {
	v: 1;
	sty: Style;
	dev: string;              // DeviceConfig.id or "libre:WxH"
	pal: string | number[][]; // preset name or [[l,c,h], ...]
	opts: Record<string, unknown>; // active style params (including seed)
}

export interface DecodedState {
	style: Style;
	device: DeviceConfig;
	palette: string | OklchColor[];
	opts: Record<string, unknown>;
}

// FNV-1a 32-bit (mirrors createRNG in noise.ts — same hash, different use)
function fnv1a(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

const SLUG_WORDS = [
	'wave','mist','bloom','drift','echo','haze','glow','pulse',
	'void','steel','aurora','dusk','fog','prism','zenith','flux',
	'ember','ridge','tide','veil',
];

export function makeSlug(style: Style, seed: string): string {
	const parts = seed.toLowerCase().replace(/[^a-z0-9]+/g, '-').split('-').filter(Boolean);
	const w1 = parts[0] ?? SLUG_WORDS[fnv1a(seed + '0') % SLUG_WORDS.length];
	const w2 = parts[1] ?? SLUG_WORDS[fnv1a(seed + '1') % SLUG_WORDS.length];
	const hash4 = fnv1a(seed).toString(36).padStart(5, '0').slice(-4);
	return `${style}-${w1}-${w2}-${hash4}`;
}

export function encodeState(store: GeneratorStore): string {
	const rawParams = getStyleParams(store);
	const { palette, ...opts } = rawParams;

	const pal: string | number[][] =
		typeof palette === 'string'
			? palette
			: (palette as OklchColor[]).map(c => [
					Math.round(c.l * 1000) / 1000,
					Math.round(c.c * 1000) / 1000,
					Math.round(c.h * 10) / 10,
				]);

	const dev =
		store.device.id === 'libre'
			? `libre:${store.device.resolution.width}x${store.device.resolution.height}`
			: store.device.id;

	const state: URLState = { v: 1, sty: store.style, dev, pal, opts };
	const json = JSON.stringify(state);
	return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeState(b64: string): DecodedState | null {
	try {
		const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
		const state = JSON.parse(json) as URLState;
		if (state.v !== 1) return null;

		let device: DeviceConfig | undefined;
		if (state.dev.startsWith('libre:')) {
			const [w, h] = state.dev.slice(6).split('x').map(Number);
			device = {
				id: 'libre', label: 'Personnalisé',
				resolution: { width: w || 1920, height: h || 1080 },
				group: 'free', bezelFamily: 'none',
			};
		} else {
			device = DEVICES.find(d => d.id === state.dev);
		}
		if (!device) return null;

		const palette: string | OklchColor[] =
			typeof state.pal === 'string'
				? state.pal
				: (state.pal as number[][]).map(([l, c, h]) => ({ l, c, h }));

		return { style: state.sty, device, palette, opts: state.opts };
	} catch {
		return null;
	}
}

export function applyDecodedState(decoded: DecodedState, store: GeneratorStore): void {
	store.style = decoded.style;
	store.device = { ...decoded.device, resolution: { ...decoded.device.resolution } };

	const params = { ...(decoded.opts as Record<string, unknown>), palette: decoded.palette };

	switch (decoded.style) {
		case 'capsules': Object.assign(store.capsulesParams, params); break;
		case 'geo':      Object.assign(store.geoParams, params); break;
		case 'topo':     Object.assign(store.topoParams, params); break;
		case 'smiley':   Object.assign(store.smileyParams, params); break;
		case 'waves':    Object.assign(store.wavesParams, params); break;
		case 'blobs':    Object.assign(store.blobsParams, params); break;
		case 'fluid':    Object.assign(store.fluidParams, params); break;
		case 'hex':      Object.assign(store.hexParams, params); break;
		case 'diag':     Object.assign(store.diagParams, params); break;
		case 'gradient': Object.assign(store.gradientParams, params); break;
		case 'strips':   Object.assign(store.stripsParams, params); break;
		case 'rings':    Object.assign(store.ringsParams, params); break;
	}
}

export function makeShareUrl(origin: string, slug: string, store: GeneratorStore): string {
	const s = encodeState(store);
	return `${origin}/c/${slug}?s=${s}`;
}

function getStyleParams(store: GeneratorStore): Record<string, unknown> {
	switch (store.style) {
		case 'capsules':  return store.capsulesParams as unknown as Record<string, unknown>;
		case 'geo':       return store.geoParams as unknown as Record<string, unknown>;
		case 'topo':      return store.topoParams as unknown as Record<string, unknown>;
		case 'smiley':    return store.smileyParams as unknown as Record<string, unknown>;
		case 'waves':     return store.wavesParams as unknown as Record<string, unknown>;
		case 'blobs':     return store.blobsParams as unknown as Record<string, unknown>;
		case 'fluid':     return store.fluidParams as unknown as Record<string, unknown>;
		case 'hex':       return store.hexParams as unknown as Record<string, unknown>;
		case 'diag':      return store.diagParams as unknown as Record<string, unknown>;
		case 'gradient':  return store.gradientParams as unknown as Record<string, unknown>;
		case 'strips':    return store.stripsParams as unknown as Record<string, unknown>;
		case 'rings':     return store.ringsParams as unknown as Record<string, unknown>;
	}
}
