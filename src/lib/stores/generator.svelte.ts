import type {
	GeneratorStore, Style, OklchColor,
	StyleCapsulesParams, StyleGeoParams, StyleTopoParams, StyleSmileyParams,
	StyleWavesParams, StyleBlobsParams, StyleFluidParams, StyleHexParams,
	StyleDiagParams, StyleGradientParams, StyleStripsParams, StyleRingsParams,
	Resolution
} from '$lib/generators/types';
import {
	DEFAULT_CAPSULES_PARAMS, DEFAULT_GEO_PARAMS, DEFAULT_TOPO_PARAMS, DEFAULT_SMILEY_PARAMS,
	DEFAULT_WAVES_PARAMS, DEFAULT_BLOBS_PARAMS, DEFAULT_FLUID_PARAMS, DEFAULT_HEX_PARAMS,
	DEFAULT_DIAG_PARAMS, DEFAULT_GRADIENT_PARAMS, DEFAULT_STRIPS_PARAMS, DEFAULT_RINGS_PARAMS,
	DEFAULT_RESOLUTION
} from '$lib/generators/constants';

export const generator: GeneratorStore = $state({
	style: 'capsules' as Style,
	capsulesParams:  { ...DEFAULT_CAPSULES_PARAMS },
	geoParams:       { ...DEFAULT_GEO_PARAMS },
	topoParams:      { ...DEFAULT_TOPO_PARAMS },
	smileyParams:    { ...DEFAULT_SMILEY_PARAMS },
	wavesParams:     { ...DEFAULT_WAVES_PARAMS },
	blobsParams:     { ...DEFAULT_BLOBS_PARAMS },
	fluidParams:     { ...DEFAULT_FLUID_PARAMS },
	hexParams:       { ...DEFAULT_HEX_PARAMS },
	diagParams:      { ...DEFAULT_DIAG_PARAMS },
	gradientParams:  { ...DEFAULT_GRADIENT_PARAMS },
	stripsParams:    { ...DEFAULT_STRIPS_PARAMS },
	ringsParams:     { ...DEFAULT_RINGS_PARAMS },
	resolution:      DEFAULT_RESOLUTION,
	format:          'png' as const,
	svgPreview:      null,
	isRendering:     false,
	downloadUrl:     null,
});

export function getActiveParams() {
	switch (generator.style) {
		case 'capsules': return generator.capsulesParams;
		case 'geo':      return generator.geoParams;
		case 'topo':     return generator.topoParams;
		case 'smiley':   return generator.smileyParams;
		case 'waves':    return generator.wavesParams;
		case 'blobs':    return generator.blobsParams;
		case 'fluid':    return generator.fluidParams;
		case 'hex':      return generator.hexParams;
		case 'diag':     return generator.diagParams;
		case 'gradient': return generator.gradientParams;
		case 'strips':   return generator.stripsParams;
		case 'rings':    return generator.ringsParams;
	}
}

export function setStyle(style: Style) { generator.style = style; }
export function updateResolution(res: Resolution) { generator.resolution = res; }

type Mut<P> = { [K in keyof P]: P[K] };

export function updateCapsulesParam<K extends keyof StyleCapsulesParams>(k: K, v: StyleCapsulesParams[K]) {
	(generator.capsulesParams as Mut<StyleCapsulesParams>)[k] = v;
}
export function updateGeoParam<K extends keyof StyleGeoParams>(k: K, v: StyleGeoParams[K]) {
	(generator.geoParams as Mut<StyleGeoParams>)[k] = v;
}
export function updateTopoParam<K extends keyof StyleTopoParams>(k: K, v: StyleTopoParams[K]) {
	(generator.topoParams as Mut<StyleTopoParams>)[k] = v;
}
export function updateSmileyParam<K extends keyof StyleSmileyParams>(k: K, v: StyleSmileyParams[K]) {
	(generator.smileyParams as Mut<StyleSmileyParams>)[k] = v;
}
export function updateWavesParam<K extends keyof StyleWavesParams>(k: K, v: StyleWavesParams[K]) {
	(generator.wavesParams as Mut<StyleWavesParams>)[k] = v;
}
export function updateBlobsParam<K extends keyof StyleBlobsParams>(k: K, v: StyleBlobsParams[K]) {
	(generator.blobsParams as Mut<StyleBlobsParams>)[k] = v;
}
export function updateFluidParam<K extends keyof StyleFluidParams>(k: K, v: StyleFluidParams[K]) {
	(generator.fluidParams as Mut<StyleFluidParams>)[k] = v;
}
export function updateHexParam<K extends keyof StyleHexParams>(k: K, v: StyleHexParams[K]) {
	(generator.hexParams as Mut<StyleHexParams>)[k] = v;
}
export function updateDiagParam<K extends keyof StyleDiagParams>(k: K, v: StyleDiagParams[K]) {
	(generator.diagParams as Mut<StyleDiagParams>)[k] = v;
}
export function updateGradientParam<K extends keyof StyleGradientParams>(k: K, v: StyleGradientParams[K]) {
	(generator.gradientParams as Mut<StyleGradientParams>)[k] = v;
}
export function updateStripsParam<K extends keyof StyleStripsParams>(k: K, v: StyleStripsParams[K]) {
	(generator.stripsParams as Mut<StyleStripsParams>)[k] = v;
}
export function updateRingsParam<K extends keyof StyleRingsParams>(k: K, v: StyleRingsParams[K]) {
	(generator.ringsParams as Mut<StyleRingsParams>)[k] = v;
}

export function updateActivePalette(palette: string | OklchColor[]) {
	switch (generator.style) {
		case 'capsules': updateCapsulesParam('palette', palette); break;
		case 'geo':      updateGeoParam('palette', palette); break;
		case 'topo':     updateTopoParam('palette', palette); break;
		case 'smiley':   updateSmileyParam('palette', palette); break;
		case 'waves':    updateWavesParam('palette', palette); break;
		case 'blobs':    updateBlobsParam('palette', palette); break;
		case 'fluid':    updateFluidParam('palette', palette); break;
		case 'hex':      updateHexParam('palette', palette); break;
		case 'diag':     updateDiagParam('palette', palette); break;
		case 'gradient': updateGradientParam('palette', palette); break;
		case 'strips':   updateStripsParam('palette', palette); break;
		case 'rings':    updateRingsParam('palette', palette); break;
	}
}

export function updateActiveSeed(seed: string) {
	switch (generator.style) {
		case 'capsules': updateCapsulesParam('seed', seed); break;
		case 'geo':      updateGeoParam('seed', seed); break;
		case 'topo':     updateTopoParam('seed', seed); break;
		case 'smiley':   updateSmileyParam('seed', seed); break;
		case 'waves':    updateWavesParam('seed', seed); break;
		case 'blobs':    updateBlobsParam('seed', seed); break;
		case 'fluid':    updateFluidParam('seed', seed); break;
		case 'hex':      updateHexParam('seed', seed); break;
		case 'diag':     updateDiagParam('seed', seed); break;
		case 'gradient': updateGradientParam('seed', seed); break;
		case 'strips':   updateStripsParam('seed', seed); break;
		case 'rings':    updateRingsParam('seed', seed); break;
	}
}

export function getActivePalette(): string | OklchColor[] {
	return getActiveParams().palette;
}

export function getActiveSeed(): string {
	return getActiveParams().seed;
}
