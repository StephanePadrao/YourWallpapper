import type {
	Resolution, Palette,
	StyleCapsulesParams, StyleGeoParams, StyleTopoParams, StyleSmileyParams,
	StyleWavesParams, StyleBlobsParams, StyleFluidParams, StyleHexParams,
	StyleDiagParams, StyleGradientParams, StyleStripsParams, StyleRingsParams
} from './types';

export const RESOLUTIONS: Resolution[] = [
	// Generic
	{ width: 1920, height: 1080, label: '1920×1080', deviceName: 'FHD', group: 'generic' },
	{ width: 2560, height: 1440, label: '2560×1440', deviceName: 'QHD', group: 'generic' },
	{ width: 3840, height: 2160, label: '3840×2160', deviceName: '4K UHD', group: 'generic' },
	{ width: 5120, height: 2880, label: '5120×2880', deviceName: '5K', group: 'generic' },
	{ width: 7680, height: 4320, label: '7680×4320', deviceName: '8K', group: 'generic' },
	// iPhone
	{ width: 1320, height: 2868, label: '1320×2868', deviceName: 'iPhone 17 Pro Max', group: 'apple' },
	{ width: 1206, height: 2622, label: '1206×2622', deviceName: 'iPhone 17 Pro', group: 'apple' },
	{ width: 1170, height: 2532, label: '1170×2532', deviceName: 'iPhone 17 / Air', group: 'apple' },
	// iPad
	{ width: 2752, height: 2752, label: '2752×2752', deviceName: 'iPad Pro 13" M4/M5', group: 'apple' },
	{ width: 2420, height: 1668, label: '2420×1668', deviceName: 'iPad Pro 11"', group: 'apple' },
	{ width: 1640, height: 2360, label: '1640×2360', deviceName: 'iPad Air', group: 'apple' },
	// Mac
	{ width: 2560, height: 1664, label: '2560×1664', deviceName: 'MacBook Air 13"', group: 'apple' },
	{ width: 2880, height: 1864, label: '2880×1864', deviceName: 'MacBook Air 15"', group: 'apple' },
	{ width: 3024, height: 1964, label: '3024×1964', deviceName: 'MacBook Pro 14"', group: 'apple' },
	{ width: 3456, height: 2234, label: '3456×2234', deviceName: 'MacBook Pro 16"', group: 'apple' },
	{ width: 4480, height: 2520, label: '4480×2520', deviceName: 'iMac 24" M4', group: 'apple' },
	{ width: 5120, height: 2880, label: '5120×2880', deviceName: 'Studio Display 27"', group: 'apple' },
	{ width: 6016, height: 3384, label: '6016×3384', deviceName: 'Pro Display XDR 32"', group: 'apple' }
];

export const DEFAULT_RESOLUTION = RESOLUTIONS[0]; // 1920×1080

export const FREE_TIER_MAX_PIXELS = 2560 * 1440;

export const HARD_LIMIT_WIDTH = 8192;
export const HARD_LIMIT_HEIGHT = 8192;

export const PALETTE_PRESETS: Palette[] = [
	{
		name: 'Twilight',
		colors: [
			{ l: 0.28, c: 0.10, h: 290 },
			{ l: 0.42, c: 0.15, h: 300 },
			{ l: 0.58, c: 0.18, h: 20 },
			{ l: 0.75, c: 0.14, h: 35 },
			{ l: 0.88, c: 0.07, h: 55 }
		]
	},
	{
		name: 'Nordic',
		colors: [
			{ l: 0.28, c: 0.05, h: 220 },
			{ l: 0.45, c: 0.07, h: 215 },
			{ l: 0.62, c: 0.06, h: 205 },
			{ l: 0.78, c: 0.04, h: 198 },
			{ l: 0.92, c: 0.02, h: 190 }
		]
	},
	{
		name: 'Spring Meadow',
		colors: [
			{ l: 0.30, c: 0.12, h: 145 },
			{ l: 0.48, c: 0.16, h: 140 },
			{ l: 0.65, c: 0.18, h: 130 },
			{ l: 0.80, c: 0.14, h: 120 },
			{ l: 0.92, c: 0.08, h: 110 }
		]
	},
	{
		name: 'Coral Reef',
		colors: [
			{ l: 0.35, c: 0.14, h: 185 },
			{ l: 0.50, c: 0.12, h: 40 },
			{ l: 0.65, c: 0.18, h: 20 },
			{ l: 0.78, c: 0.16, h: 10 },
			{ l: 0.90, c: 0.08, h: 50 }
		]
	},
	{
		name: 'Brutalist',
		colors: [
			{ l: 0.15, c: 0.00, h: 0 },
			{ l: 0.32, c: 0.00, h: 0 },
			{ l: 0.52, c: 0.00, h: 0 },
			{ l: 0.72, c: 0.00, h: 0 },
			{ l: 0.90, c: 0.00, h: 0 }
		]
	},
	{
		name: 'Deep Ocean',
		colors: [
			{ l: 0.15, c: 0.09, h: 240 },
			{ l: 0.28, c: 0.14, h: 235 },
			{ l: 0.44, c: 0.16, h: 225 },
			{ l: 0.62, c: 0.12, h: 215 },
			{ l: 0.80, c: 0.07, h: 200 }
		]
	},
	{
		name: 'Desert Dunes',
		colors: [
			{ l: 0.40, c: 0.10, h: 65 },
			{ l: 0.55, c: 0.14, h: 55 },
			{ l: 0.70, c: 0.16, h: 50 },
			{ l: 0.82, c: 0.12, h: 45 },
			{ l: 0.92, c: 0.06, h: 60 }
		]
	},
	{
		name: 'Sakura',
		colors: [
			{ l: 0.55, c: 0.10, h: 355 },
			{ l: 0.68, c: 0.13, h: 5 },
			{ l: 0.78, c: 0.12, h: 15 },
			{ l: 0.88, c: 0.08, h: 350 },
			{ l: 0.95, c: 0.04, h: 340 }
		]
	},
	{
		name: 'Forest',
		colors: [
			{ l: 0.22, c: 0.09, h: 155 },
			{ l: 0.35, c: 0.13, h: 148 },
			{ l: 0.52, c: 0.15, h: 140 },
			{ l: 0.68, c: 0.11, h: 135 },
			{ l: 0.82, c: 0.06, h: 130 }
		]
	},
	{
		name: 'Midnight',
		colors: [
			{ l: 0.12, c: 0.08, h: 280 },
			{ l: 0.25, c: 0.14, h: 275 },
			{ l: 0.40, c: 0.18, h: 265 },
			{ l: 0.58, c: 0.15, h: 255 },
			{ l: 0.75, c: 0.10, h: 245 }
		]
	},
	{
		name: 'Citrus',
		colors: [
			{ l: 0.55, c: 0.18, h: 75 },
			{ l: 0.68, c: 0.20, h: 65 },
			{ l: 0.78, c: 0.18, h: 55 },
			{ l: 0.88, c: 0.14, h: 45 },
			{ l: 0.95, c: 0.08, h: 80 }
		]
	},
	{
		name: 'Lavender',
		colors: [
			{ l: 0.42, c: 0.12, h: 300 },
			{ l: 0.58, c: 0.14, h: 295 },
			{ l: 0.72, c: 0.12, h: 285 },
			{ l: 0.84, c: 0.08, h: 275 },
			{ l: 0.94, c: 0.04, h: 265 }
		]
	}
];

export const DEFAULT_CAPSULES_PARAMS: StyleCapsulesParams = {
	seed: 'yourwallpaper',
	palette: 'Twilight',
	layout: 'row',
	gridCols: 6,
	gridRows: 5,
	heightVariation: 60,
	count: 7,
	overlap: 32,
	gradientIntensity: 80,
};

export const CAPSULES_CONSTRAINTS = {
	gridCols: { min: 3, max: 10 },
	gridRows: { min: 3, max: 10 },
	heightVariation: { min: 0, max: 100 },
	gradientIntensity: { min: 0, max: 100 }
};

export const DEFAULT_GEO_PARAMS: StyleGeoParams = {
	seed: 'yourwallpaper',
	palette: 'Coral Reef',
	shapeType: 'circle',
	count: 24,
	spacing: 10,
	sizeVariation: 60,
	gradientIntensity: 70
};

export const DEFAULT_TOPO_PARAMS: StyleTopoParams = {
	seed: 'yourwallpaper',
	palette: 'Nordic',
	layers: 14,
	smoothness: 65,
	lineWeight: 1,
	filled: true
};

export const DEFAULT_SMILEY_PARAMS: StyleSmileyParams = {
	seed: 'yourwallpaper',
	palette: 'Citrus',
	expression: 'smile',
	arrangement: 'brick',
	columns: 8,
	spacing: 15,
	rotation: 0,
	colorMode: 'multi',
	renderMode: 'filled',
};

export const SMILEY_EXPRESSIONS: StyleSmileyParams['expression'][] = [
	'smile', 'wink', 'cool', 'surprised', 'love', 'laugh'
];

export const DEFAULT_WAVES_PARAMS: StyleWavesParams = {
	seed: 'ocean-drift',
	palette: 'Deep Ocean',
	numBands: 14,
	amplitude: 18,
	frequency: 0.8,
	turbulence: 15,
	direction: 'horizontal',
};

export const DEFAULT_BLOBS_PARAMS: StyleBlobsParams = {
	seed: 'hills-bloom',
	palette: 'Coral Reef',
	numBlobs: 5,
	ringCount: 10,
	blobSize: 50,
	organicness: 65,
};

export const DEFAULT_FLUID_PARAMS: StyleFluidParams = {
	seed: 'fluid-aurora',
	palette: 'Midnight',
	numPoints: 3,
	lineTexture: true,
	lineSpacing: 3,
	lineOpacity: 4,
};

export const DEFAULT_HEX_PARAMS: StyleHexParams = {
	seed: 'hex-mosaic',
	palette: 'Twilight',
	cellSize: 50,
	gradientType: 'diagonal',
	gradientAngle: 135,
	gapSize: 1,
};

export const DEFAULT_DIAG_PARAMS: StyleDiagParams = {
	seed: 'silver-cross',
	palette: 'Nordic',
	numBands: 8,
	direction: 'diagonal',
	angle: 45,
	opacity: 55,
	bandWidth: 65,
};

export const DEFAULT_GRADIENT_PARAMS: StyleGradientParams = {
	seed: 'sunset-mesh',
	palette: 'Twilight',
	numPoints: 4,
	smoothness: 70,
};

export const DEFAULT_STRIPS_PARAMS: StyleStripsParams = {
	seed: 'warm-bars',
	palette: 'Desert Dunes',
	count: 7,
	direction: 'vertical',
	gap: 2,
	rounded: 20,
};

export const DEFAULT_RINGS_PARAMS: StyleRingsParams = {
	seed: 'night-rings',
	palette: 'Midnight',
	numRings: 12,
	origin: 'bottom',
	spacing: 22,
	lineWidth: 6,
};

// Backward compat
export const DEFAULT_STYLE_B_PARAMS = DEFAULT_CAPSULES_PARAMS;
export const STYLE_B_CONSTRAINTS = CAPSULES_CONSTRAINTS;
