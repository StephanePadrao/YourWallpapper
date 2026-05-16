import type { DeviceConfig } from '$lib/devices';
export type { DeviceConfig };

export type Style =
	| 'capsules'
	| 'geo'
	| 'topo'
	| 'smiley'
	| 'waves'
	| 'blobs'
	| 'fluid'
	| 'hex'
	| 'diag'
	| 'gradient'
	| 'strips'
	| 'rings';

export type HarmonyType =
	| 'analogic'
	| 'complementary'
	| 'triadic'
	| 'split-complementary'
	| 'monochromatic';

export type Tier = 'anonymous' | 'free' | 'pro';
export type ExportFormat = 'png' | 'jpeg' | 'svg';

export interface OklchColor {
	l: number; // 0–1
	c: number; // 0–0.4
	h: number; // 0–360
}

export interface Palette {
	name: string;
	colors: OklchColor[];
}

export interface Resolution {
	width: number;
	height: number;
	label: string;
	deviceName?: string;
	group: 'generic' | 'apple';
}

export interface CommonParams {
	seed: string;
	palette: string | OklchColor[];
}

// ─── Capsules ────────────────────────────────────────────────────────────────
export type CapsuleLayout = 'grid' | 'row';
export interface StyleCapsulesParams extends CommonParams {
	layout: CapsuleLayout;
	// grid mode
	gridCols: number;        // 3–10
	gridRows: number;        // 3–10
	heightVariation: number; // 0–100
	// row mode
	count: number;           // 3–12
	overlap: number;         // 0–70 (%)
	// shared
	gradientIntensity: number; // 0–100
}

// ─── Géo ─────────────────────────────────────────────────────────────────────
export type GeoShape = 'circle' | 'rect' | 'oval';
export interface StyleGeoParams extends CommonParams {
	shapeType: GeoShape;
	count: number;          // 5–60
	spacing: number;        // 0–80
	sizeVariation: number;  // 0–100
	gradientIntensity: number; // 0–100
}

// ─── Topo ─────────────────────────────────────────────────────────────────────
export interface StyleTopoParams extends CommonParams {
	layers: number;      // 4–24
	smoothness: number;  // 0–100
	lineWeight: number;  // 0.5–4
	filled: boolean;
}

// ─── Smiley ───────────────────────────────────────────────────────────────────
export type SmileyExpression = 'smile' | 'wink' | 'cool' | 'surprised' | 'love' | 'laugh';
export type SmileyArrangement = 'grid' | 'brick' | 'scatter' | 'rings';
export type SmileyColorMode = 'mono' | 'multi' | 'gradient';
export type SmileyRenderMode = 'filled' | 'outline';
export interface StyleSmileyParams extends CommonParams {
	expression: SmileyExpression;
	arrangement: SmileyArrangement;
	columns: number;  // 3–20
	spacing: number;  // 0–60
	rotation: number; // -45–45
	colorMode: SmileyColorMode;
	renderMode: SmileyRenderMode;
}

// ─── Vagues ───────────────────────────────────────────────────────────────────
export type WaveDirection = 'horizontal' | 'vertical';
export interface StyleWavesParams extends CommonParams {
	numBands: number;   // 8–24
	amplitude: number;  // 0–60 (% of band height)
	frequency: number;  // 0.3–3 (waves per width)
	turbulence: number; // 0–100 (phase variation between bands)
	direction: WaveDirection;
}

// ─── Blobs ────────────────────────────────────────────────────────────────────
export interface StyleBlobsParams extends CommonParams {
	numBlobs: number;    // 3–7
	ringCount: number;   // 6–16
	blobSize: number;    // 20–80 (% of canvas short side)
	organicness: number; // 0–100 (noise warp strength)
}

// ─── Fluide ───────────────────────────────────────────────────────────────────
export interface StyleFluidParams extends CommonParams {
	numPoints: number;    // 2–5
	lineTexture: boolean;
	lineSpacing: number;  // 2–10 (px)
	lineOpacity: number;  // 0–25 (%)
}

// ─── Hexagonal ────────────────────────────────────────────────────────────────
export type HexGradientType = 'diagonal' | 'radial' | 'angular';
export interface StyleHexParams extends CommonParams {
	cellSize: number;          // 20–100
	gradientType: HexGradientType;
	gradientAngle: number;     // 0–360
	gapSize: number;           // 0–8 (px)
}

// ─── Diagonales ───────────────────────────────────────────────────────────────
export type DiagDirection = 'horizontal' | 'diagonal' | 'diagonal-inv' | 'vertical';
export interface StyleDiagParams extends CommonParams {
	numBands: number;   // 4–16
	direction: DiagDirection;
	angle: number;      // 0–180 degrees (fine-tune within direction)
	opacity: number;    // 20–100 (%)
	bandWidth: number;  // 20–100 (% of canvas diagonal / numBands)
}

// ─── Dégradé lisse ────────────────────────────────────────────────────────────
export interface StyleGradientParams extends CommonParams {
	numPoints: number; // 2–5
	smoothness: number; // 20–100
}

// ─── Bandes / Strips ──────────────────────────────────────────────────────────
export type StripDirection = 'vertical' | 'horizontal';
export interface StyleStripsParams extends CommonParams {
	count: number;          // 3–14
	direction: StripDirection;
	gap: number;            // 0–30 (% of strip width as gap)
	rounded: number;        // 0–100 (% corner radius relative to strip width)
}

// ─── Anneaux / Rings ─────────────────────────────────────────────────────────
export type RingOrigin = 'center' | 'bottom' | 'top';
export interface StyleRingsParams extends CommonParams {
	numRings: number;  // 5–24
	origin: RingOrigin;
	spacing: number;   // 0–70 (gap between rings as % of ring slot width)
	lineWidth: number; // 2–20 (stroke width multiplier)
}

// ─── Union ────────────────────────────────────────────────────────────────────
export type AnyStyleParams =
	| StyleCapsulesParams
	| StyleGeoParams
	| StyleTopoParams
	| StyleSmileyParams
	| StyleWavesParams
	| StyleBlobsParams
	| StyleFluidParams
	| StyleHexParams
	| StyleDiagParams
	| StyleGradientParams
	| StyleStripsParams
	| StyleRingsParams;

// ─── Store ────────────────────────────────────────────────────────────────────
export interface GeneratorStore {
	style: Style;
	capsulesParams: StyleCapsulesParams;
	geoParams: StyleGeoParams;
	topoParams: StyleTopoParams;
	smileyParams: StyleSmileyParams;
	wavesParams: StyleWavesParams;
	blobsParams: StyleBlobsParams;
	fluidParams: StyleFluidParams;
	hexParams: StyleHexParams;
	diagParams: StyleDiagParams;
	gradientParams: StyleGradientParams;
	stripsParams: StyleStripsParams;
	ringsParams: StyleRingsParams;
	device: DeviceConfig;
	format: ExportFormat;
	svgPreview: string | null;
	isRendering: boolean;
	downloadUrl: string | null;
}

export type StyleBParams = StyleCapsulesParams;
