<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { PUBLIC_PAYMENT_ENABLED } from '$env/static/public';
	import { hexToOklch } from '$lib/generators/palette';
	import { generateCapsulesSVG } from '$lib/generators/style-b/capsules';
	import { generateGeoSVG } from '$lib/generators/style-geo/geo';
	import { generateTopoSVG } from '$lib/generators/style-topo/topo';
	import { generateSmileySVG } from '$lib/generators/style-smiley/smiley';
	import { generateWavesSVG } from '$lib/generators/style-waves/waves';
	import { generateBlobsSVG } from '$lib/generators/style-blobs/blobs';
	import { generateFluidSVG } from '$lib/generators/style-fluid/fluid';
	import { generateHexSVG } from '$lib/generators/style-hex/hex';
	import { generateDiagSVG } from '$lib/generators/style-diag/diag';
	import { generateGradientSVG } from '$lib/generators/style-gradient/gradient';
	import { generateStripsSVG } from '$lib/generators/style-strips/strips';
	import { generateRingsSVG } from '$lib/generators/style-rings/rings';
	import {
		PALETTE_PRESETS, SMILEY_EXPRESSIONS,
		DEFAULT_STRIPS_PARAMS, DEFAULT_WAVES_PARAMS, DEFAULT_GRADIENT_PARAMS,
		DEFAULT_RINGS_PARAMS, DEFAULT_CAPSULES_PARAMS, DEFAULT_TOPO_PARAMS,
		DEFAULT_BLOBS_PARAMS, DEFAULT_DIAG_PARAMS,
	} from '$lib/generators/constants';
	import {
		generator, setStyle,
		updateCapsulesParam, updateGeoParam, updateTopoParam, updateSmileyParam,
		updateWavesParam, updateBlobsParam, updateFluidParam, updateHexParam,
		updateDiagParam, updateGradientParam, updateStripsParam, updateRingsParam,
		updateActivePalette, updateActiveSeed, getActivePalette, getActiveSeed,
	} from '$lib/stores/generator.svelte';
	import { BEZEL_COORDS } from '$lib/devices';
	import DevicePicker from '$lib/components/DevicePicker.svelte';
	import { downloadSVG, downloadFromUrl, buildFilename } from '$lib/generators/export';
	import { makeSlug, makeShareUrl, decodeState, applyDecodedState, encodeState } from '$lib/url-state';
	import type {
		Style, GeoShape, SmileyExpression, SmileyArrangement, SmileyColorMode,
		SmileyRenderMode, HexGradientType, CapsuleLayout, WaveDirection,
		StripDirection, RingOrigin, DiagDirection, OklchColor,
	} from '$lib/generators/types';

	const paymentEnabled = PUBLIC_PAYMENT_ENABLED === 'true';

	const STYLES: { id: Style; label: string }[] = [
		{ id: 'capsules', label: 'Capsules' },
		{ id: 'strips',   label: 'Barres' },
		{ id: 'waves',    label: 'Vagues' },
		{ id: 'rings',    label: 'Anneaux' },
		{ id: 'gradient', label: 'Dégradé' },
		{ id: 'fluid',    label: 'Fluide' },
		{ id: 'blobs',    label: 'Blobs' },
		{ id: 'geo',      label: 'Géo' },
		{ id: 'topo',     label: 'Topo' },
		{ id: 'hex',      label: 'Hex' },
		{ id: 'diag',     label: 'Diag' },
		{ id: 'smiley',   label: 'Smiley' },
	];

	const SMILEY_LABELS: Record<SmileyExpression, string> = {
		smile: 'Sourire', wink: "Clin d'oeil",
		cool: 'Cool', surprised: 'Surpris',
		love: 'Amour', laugh: 'Rire',
	};
	const ARRANGEMENT_LABELS: Record<SmileyArrangement, string> = {
		grid: 'Grille', brick: 'Brique', scatter: 'Aléatoire', rings: 'Anneaux',
	};

	// ── Gallery ───────────────────────────────────────────────────────────────
	interface GalleryItem { svg: string; label: string; palette: string; }
	let galleryItems = $state<GalleryItem[]>([]);

	// ── State ─────────────────────────────────────────────────────────────────
	let svgContainer: HTMLDivElement | null = $state(null);
	let svgString = $state('');
	let isExporting = $state(false);
	let exportError = $state('');
	let showPaymentInfo = $state(false);
	let copied = $state(false);
	let customHexColors = $state(['#c850c0', '#4158d0', '#43e97b', '#f5a623', '#fa709a']);
	let isCustomPalette = $state(false);

	// ── Preview ───────────────────────────────────────────────────────────────
	const PREVIEW_W = 900;
	const previewH = $derived(
		Math.round(PREVIEW_W * generator.device.resolution.height / generator.device.resolution.width)
	);
	const previewAspect = $derived(generator.device.resolution.width / generator.device.resolution.height);
	const isHighRes = $derived(
		generator.device.resolution.width * generator.device.resolution.height > 2560 * 1440
	);
	const activePaletteStr = $derived(
		typeof getActivePalette() === 'string' ? (getActivePalette() as string) : '__custom__'
	);

	// ── Regenerate ────────────────────────────────────────────────────────────
	let rafId: number;
	function regenerate() {
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			const W = PREVIEW_W, H = previewH;
			switch (generator.style) {
				case 'capsules':  svgString = generateCapsulesSVG(generator.capsulesParams, W, H); break;
				case 'geo':       svgString = generateGeoSVG(generator.geoParams, W, H); break;
				case 'topo':      svgString = generateTopoSVG(generator.topoParams, W, H); break;
				case 'smiley':    svgString = generateSmileySVG(generator.smileyParams, W, H); break;
				case 'waves':     svgString = generateWavesSVG(generator.wavesParams, W, H); break;
				case 'blobs':     svgString = generateBlobsSVG(generator.blobsParams, W, H); break;
				case 'fluid':     svgString = generateFluidSVG(generator.fluidParams, W, H); break;
				case 'hex':       svgString = generateHexSVG(generator.hexParams, W, H); break;
				case 'diag':      svgString = generateDiagSVG(generator.diagParams, W, H); break;
				case 'gradient':  svgString = generateGradientSVG(generator.gradientParams, W, H); break;
				case 'strips':    svgString = generateStripsSVG(generator.stripsParams, W, H); break;
				case 'rings':     svgString = generateRingsSVG(generator.ringsParams, W, H); break;
			}
		});
	}

	$effect(() => {
		void previewH;
		switch (generator.style) {
			case 'capsules':  void JSON.stringify(generator.capsulesParams); break;
			case 'geo':       void JSON.stringify(generator.geoParams); break;
			case 'topo':      void JSON.stringify(generator.topoParams); break;
			case 'smiley':    void JSON.stringify(generator.smileyParams); break;
			case 'waves':     void JSON.stringify(generator.wavesParams); break;
			case 'blobs':     void JSON.stringify(generator.blobsParams); break;
			case 'fluid':     void JSON.stringify(generator.fluidParams); break;
			case 'hex':       void JSON.stringify(generator.hexParams); break;
			case 'diag':      void JSON.stringify(generator.diagParams); break;
			case 'gradient':  void JSON.stringify(generator.gradientParams); break;
			case 'strips':    void JSON.stringify(generator.stripsParams); break;
			case 'rings':     void JSON.stringify(generator.ringsParams); break;
		}
		regenerate();
	});

	onMount(() => {
		const url = $page.url;
		// New-style URL state (?s=base64url)
		const s = url.searchParams.get('s');
		if (s) {
			const decoded = decodeState(s);
			if (decoded) applyDecodedState(decoded, generator);
		} else {
			// Legacy params (?seed=&palette=)
			const seed = url.searchParams.get('seed');
			if (seed) updateActiveSeed(seed);
			const palette = url.searchParams.get('palette');
			if (palette && PALETTE_PRESETS.find((p) => p.name === palette)) updateActivePalette(palette);
		}
		updateUiAccent();
		regenerate();

		// Generate gallery examples (small size, deferred to not block main render)
		requestAnimationFrame(() => {
			const GW = 270, GH = 480;
			galleryItems = [
				{ svg: generateStripsSVG({ ...DEFAULT_STRIPS_PARAMS, count: 10, direction: 'vertical', gap: 2, rounded: 18, seed: 'gal-1' }, GW, GH), label: 'Barres', palette: 'Desert Dunes' },
				{ svg: generateWavesSVG({ ...DEFAULT_WAVES_PARAMS, numBands: 20, amplitude: 42, frequency: 1.3, turbulence: 48, seed: 'gal-2' }, GW, GH), label: 'Vagues', palette: 'Deep Ocean' },
				{ svg: generateGradientSVG({ ...DEFAULT_GRADIENT_PARAMS, numPoints: 4, smoothness: 78, seed: 'gal-3' }, GW, GH), label: 'Dégradé', palette: 'Twilight' },
				{ svg: generateRingsSVG({ ...DEFAULT_RINGS_PARAMS, numRings: 18, origin: 'bottom', spacing: 18, lineWidth: 8, seed: 'gal-4' }, GW, GH), label: 'Anneaux', palette: 'Midnight' },
				{ svg: generateCapsulesSVG({ ...DEFAULT_CAPSULES_PARAMS, layout: 'row', count: 7, overlap: 34, gradientIntensity: 85, seed: 'gal-5' }, GW, GH), label: 'Capsules', palette: 'Twilight' },
				{ svg: generateBlobsSVG({ ...DEFAULT_BLOBS_PARAMS, numBlobs: 4, ringCount: 12, blobSize: 55, organicness: 70, seed: 'gal-6' }, GW, GH), label: 'Blobs', palette: 'Coral Reef' },
			];
		});
	});

	// ── UI Accent (contextual theming) ────────────────────────────────────────
	function getUiAccentFromPalette(): string {
		const palette = getActivePalette();
		let colors: OklchColor[];
		if (typeof palette === 'string') {
			const preset = PALETTE_PRESETS.find(p => p.name === palette);
			colors = preset ? preset.colors : [];
		} else {
			colors = palette as OklchColor[];
		}
		if (!colors.length) return '';
		const dominant = colors.reduce((best, c) => c.c > best.c ? c : best, colors[0]);
		const l = Math.max(0.42, Math.min(0.65, dominant.l));
		return `oklch(${l.toFixed(3)} ${dominant.c.toFixed(3)} ${dominant.h.toFixed(1)})`;
	}

	function updateUiAccent() {
		if (typeof document === 'undefined') return;
		const accent = getUiAccentFromPalette();
		if (accent) document.documentElement.style.setProperty('--ui-accent', accent);
	}

	$effect(() => {
		void JSON.stringify(getActivePalette());
		updateUiAccent();
	});

	// ── Custom palette ────────────────────────────────────────────────────────
	function updateCustomColor(idx: number, hex: string) {
		customHexColors[idx] = hex;
		const oklch: OklchColor[] = customHexColors.map(hexToOklch);
		updateActivePalette(oklch);
		isCustomPalette = true;
	}
	function selectPreset(name: string) { isCustomPalette = false; updateActivePalette(name); }

	// ── Randomise ─────────────────────────────────────────────────────────────
	const WORDS = ['wave','mist','bloom','drift','echo','haze','glow','pulse','void','steel','aurora','dusk','fog','prism','zenith','flux','ember','ridge','tide','veil'];
	function rw() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
	function ri(a: number, b: number) { return Math.round(a + Math.random() * (b - a)); }
	function rf(a: number, b: number) { return parseFloat((a + Math.random() * (b - a)).toFixed(1)); }

	// Randomise shape/layout params only (keep palette)
	function randomizeShape() {
		const s = `${rw()}-${rw()}-${Date.now().toString(36)}`;
		switch (generator.style) {
			case 'capsules':
				updateCapsulesParam('seed', s);
				if (generator.capsulesParams.layout === 'grid') {
					updateCapsulesParam('gridCols', ri(3,10)); updateCapsulesParam('gridRows', ri(3,10));
					updateCapsulesParam('heightVariation', ri(0,100));
				} else {
					updateCapsulesParam('count', ri(3,12)); updateCapsulesParam('overlap', ri(0,65));
				}
				updateCapsulesParam('gradientIntensity', ri(30,100));
				break;
			case 'geo':
				updateGeoParam('seed', s);
				updateGeoParam('shapeType', (['circle','oval','rect'] as GeoShape[])[ri(0,2)]);
				updateGeoParam('count', ri(5,60)); updateGeoParam('spacing', ri(0,80));
				updateGeoParam('sizeVariation', ri(0,100)); updateGeoParam('gradientIntensity', ri(0,100));
				break;
			case 'topo':
				updateTopoParam('seed', s);
				updateTopoParam('layers', ri(4,24)); updateTopoParam('smoothness', ri(20,100));
				updateTopoParam('lineWeight', rf(0.5,4) as never); updateTopoParam('filled', Math.random() > 0.3);
				break;
			case 'smiley':
				updateSmileyParam('seed', s);
				updateSmileyParam('expression', SMILEY_EXPRESSIONS[ri(0, SMILEY_EXPRESSIONS.length-1)]);
				updateSmileyParam('arrangement', (['grid','brick','scatter','rings'] as SmileyArrangement[])[ri(0,3)]);
				updateSmileyParam('columns', ri(3,20)); updateSmileyParam('spacing', ri(0,60)); updateSmileyParam('rotation', ri(-45,45));
				break;
			case 'waves':
				updateWavesParam('seed', s);
				updateWavesParam('numBands', ri(8,24)); updateWavesParam('amplitude', ri(0,60));
				updateWavesParam('frequency', rf(0.3,3) as never); updateWavesParam('turbulence', ri(0,100));
				break;
			case 'blobs':
				updateBlobsParam('seed', s);
				updateBlobsParam('numBlobs', ri(3,7)); updateBlobsParam('ringCount', ri(6,16));
				updateBlobsParam('blobSize', ri(20,80)); updateBlobsParam('organicness', ri(0,100));
				break;
			case 'fluid':
				updateFluidParam('seed', s);
				updateFluidParam('numPoints', ri(2,5)); updateFluidParam('lineSpacing', ri(2,10)); updateFluidParam('lineOpacity', ri(0,25));
				break;
			case 'hex':
				updateHexParam('seed', s);
				updateHexParam('cellSize', ri(20,100));
				updateHexParam('gradientType', (['diagonal','radial','angular'] as HexGradientType[])[ri(0,2)]);
				updateHexParam('gradientAngle', ri(0,360)); updateHexParam('gapSize', ri(0,8));
				break;
			case 'diag':
				updateDiagParam('seed', s);
				updateDiagParam('numBands', ri(4,16));
				updateDiagParam('direction', (['horizontal','diagonal','diagonal-inv','vertical'] as DiagDirection[])[ri(0,3)]);
				updateDiagParam('angle', 45);
				updateDiagParam('opacity', ri(30,100)); updateDiagParam('bandWidth', ri(20,100));
				break;
			case 'gradient':
				updateGradientParam('seed', s);
				updateGradientParam('numPoints', ri(2,5)); updateGradientParam('smoothness', ri(20,100));
				break;
			case 'strips':
				updateStripsParam('seed', s);
				updateStripsParam('count', ri(3,14));
				updateStripsParam('direction', (['vertical','horizontal'] as StripDirection[])[ri(0,1)]);
				updateStripsParam('gap', ri(0,25)); updateStripsParam('rounded', ri(0,100));
				break;
			case 'rings':
				updateRingsParam('seed', s);
				updateRingsParam('numRings', ri(5,24));
				updateRingsParam('origin', (['center','bottom','top'] as RingOrigin[])[ri(0,2)]);
				updateRingsParam('spacing', ri(0,60)); updateRingsParam('lineWidth', ri(2,18));
				break;
		}
	}

	// Randomise everything (shape + palette)
	function randomizeAll() {
		const p = PALETTE_PRESETS[ri(0, PALETTE_PRESETS.length - 1)].name;
		isCustomPalette = false;
		updateActivePalette(p);
		randomizeShape();
	}

	// ── Export ────────────────────────────────────────────────────────────────
	function getActiveParamsForExport() {
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

	async function exportPNG() {
		if (!paymentEnabled && isHighRes) { showPaymentInfo = true; return; }
		isExporting = true; exportError = ''; showPaymentInfo = false;
		try {
			const res = await fetch('/api/render', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					style: generator.style,
					params: getActiveParamsForExport(),
					resolution: { width: generator.device.resolution.width, height: generator.device.resolution.height },
					format: generator.format,
				}),
			});
			if (res.status === 403) { showPaymentInfo = true; return; }
			if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur export');
			const { url } = await res.json();
			downloadFromUrl(url, buildFilename(generator.style, activePaletteStr, getActiveSeed()), generator.format);
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Erreur inconnue';
		} finally { isExporting = false; }
	}

	function exportSVGFile() {
		if (!svgContainer) return;
		const el = svgContainer.querySelector('svg');
		if (!el) return;
		downloadSVG(el as SVGSVGElement, buildFilename(generator.style, activePaletteStr, getActiveSeed()), 'free');
	}

	async function shareUrl() {
		const slug = makeSlug(generator.style, getActiveSeed());
		updateActiveSeed(slug); // seed becomes the slug for reproducibility
		const url = makeShareUrl(window.location.origin, slug, generator);
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>YourWallpaper — Générateur de fonds d'écran</title>
</svelte:head>

<div class="page">
<div class="layout">
	<aside class="sidebar">

		<!-- ── Style grid ── -->
		<div class="style-grid-wrap">
			<div class="style-grid">
				{#each STYLES as s}
					<button onclick={() => setStyle(s.id)} class="style-btn" class:style-btn--active={generator.style === s.id}>{s.label}</button>
				{/each}
			</div>
		</div>

		<!-- ── Random toolbar ── -->
		<div class="random-toolbar">
			<button onclick={randomizeShape} class="rand-btn rand-btn--shape" title="Nouvelles formes, garder les couleurs">
				<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
					<rect x="1" y="1" width="4" height="4" rx="1"/><rect x="7" y="1" width="4" height="4" rx="1"/><rect x="1" y="7" width="4" height="4" rx="1"/><rect x="7" y="7" width="4" height="4" rx="1"/>
				</svg>
				Formes
			</button>
			<button onclick={randomizeAll} class="rand-btn rand-btn--all" title="Tout randomiser">
				<svg width="11" height="11" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 1h3v3M9 12h3V9M1 4l3-3 3 3M4 1v8a2 2 0 0 0 2 2h1M12 9l-3 3-3-3"/>
				</svg>
				Tout
			</button>
		</div>

		<!-- ── Params ── -->
		<div class="params">

			<!-- Palette -->
			<section class="section">
				<p class="section-label">Palette</p>
				<div class="palette-grid">
					{#each PALETTE_PRESETS as preset}
						<button onclick={() => selectPreset(preset.name)} title={preset.name} class="swatch" class:swatch--active={!isCustomPalette && activePaletteStr === preset.name}>
							<div class="swatch-colors">
								{#each preset.colors as c}
									<div style="flex:1; background:oklch({c.l} {c.c} {c.h})"></div>
								{/each}
							</div>
							<span class="swatch-name">{preset.name}</span>
						</button>
					{/each}
				</div>
				<div class="custom-palette" class:custom-palette--active={isCustomPalette}>
					<p class="custom-label" class:custom-label--active={isCustomPalette}>Personnalisé</p>
					<div class="color-pickers">
						{#each customHexColors as hex, i}
							<label class="color-swatch" title="Couleur {i+1}">
								<span class="color-preview" style="background:{hex}"></span>
								<input type="color" value={hex} oninput={(e) => updateCustomColor(i, e.currentTarget.value)} class="color-input"/>
							</label>
						{/each}
					</div>
				</div>
			</section>

			<!-- ── Capsules ── -->
			{#if generator.style === 'capsules'}
				<section class="section">
					<p class="section-label">Disposition</p>
					<div class="chips">
						<button onclick={() => updateCapsulesParam('layout', 'row')} class="chip" class:chip--active={generator.capsulesParams.layout === 'row'}>Ligne</button>
						<button onclick={() => updateCapsulesParam('layout', 'grid')} class="chip" class:chip--active={generator.capsulesParams.layout === 'grid'}>Grille</button>
					</div>
				</section>

				{#if generator.capsulesParams.layout === 'row'}
					<section class="section">
						<p class="section-label">Options</p>
						<div class="sliders">
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Nombre</span><span class="slider-value">{generator.capsulesParams.count}</span></div>
								<input type="range" min="3" max="12" value={generator.capsulesParams.count} oninput={(e) => updateCapsulesParam('count', +e.currentTarget.value)}/>
							</label>
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Chevauchement</span><span class="slider-value">{generator.capsulesParams.overlap}%</span></div>
								<input type="range" min="0" max="70" value={generator.capsulesParams.overlap} oninput={(e) => updateCapsulesParam('overlap', +e.currentTarget.value)}/>
							</label>
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Dégradé</span><span class="slider-value">{generator.capsulesParams.gradientIntensity}%</span></div>
								<input type="range" min="0" max="100" value={generator.capsulesParams.gradientIntensity} oninput={(e) => updateCapsulesParam('gradientIntensity', +e.currentTarget.value)}/>
							</label>
						</div>
					</section>
				{:else}
					<section class="section">
						<p class="section-label">Grille</p>
						<div class="sliders">
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Colonnes</span><span class="slider-value">{generator.capsulesParams.gridCols}</span></div>
								<input type="range" min="3" max="10" value={generator.capsulesParams.gridCols} oninput={(e) => updateCapsulesParam('gridCols', +e.currentTarget.value)}/>
							</label>
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Rangées</span><span class="slider-value">{generator.capsulesParams.gridRows}</span></div>
								<input type="range" min="3" max="10" value={generator.capsulesParams.gridRows} oninput={(e) => updateCapsulesParam('gridRows', +e.currentTarget.value)}/>
							</label>
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Hauteur</span><span class="slider-value">{generator.capsulesParams.heightVariation}%</span></div>
								<input type="range" min="0" max="100" value={generator.capsulesParams.heightVariation} oninput={(e) => updateCapsulesParam('heightVariation', +e.currentTarget.value)}/>
							</label>
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Dégradé</span><span class="slider-value">{generator.capsulesParams.gradientIntensity}%</span></div>
								<input type="range" min="0" max="100" value={generator.capsulesParams.gradientIntensity} oninput={(e) => updateCapsulesParam('gradientIntensity', +e.currentTarget.value)}/>
							</label>
						</div>
					</section>
				{/if}

			<!-- ── Barres / Strips ── -->
			{:else if generator.style === 'strips'}
				<section class="section">
					<p class="section-label">Direction</p>
					<div class="chips">
						<button onclick={() => updateStripsParam('direction', 'vertical')} class="chip" class:chip--active={generator.stripsParams.direction === 'vertical'}>Vertical</button>
						<button onclick={() => updateStripsParam('direction', 'horizontal')} class="chip" class:chip--active={generator.stripsParams.direction === 'horizontal'}>Horizontal</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Nombre</span><span class="slider-value">{generator.stripsParams.count}</span></div>
							<input type="range" min="3" max="14" value={generator.stripsParams.count} oninput={(e) => updateStripsParam('count', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Espacement</span><span class="slider-value">{generator.stripsParams.gap}%</span></div>
							<input type="range" min="0" max="30" value={generator.stripsParams.gap} oninput={(e) => updateStripsParam('gap', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Arrondi</span><span class="slider-value">{generator.stripsParams.rounded}%</span></div>
							<input type="range" min="0" max="100" value={generator.stripsParams.rounded} oninput={(e) => updateStripsParam('rounded', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Vagues ── -->
			{:else if generator.style === 'waves'}
				<section class="section">
					<p class="section-label">Orientation</p>
					<div class="chips">
						<button onclick={() => updateWavesParam('direction', 'horizontal')} class="chip" class:chip--active={generator.wavesParams.direction === 'horizontal'}>Horizontal</button>
						<button onclick={() => updateWavesParam('direction', 'vertical')} class="chip" class:chip--active={generator.wavesParams.direction === 'vertical'}>Vertical</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Bandes</span><span class="slider-value">{generator.wavesParams.numBands}</span></div>
							<input type="range" min="8" max="24" value={generator.wavesParams.numBands} oninput={(e) => updateWavesParam('numBands', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Amplitude</span><span class="slider-value">{generator.wavesParams.amplitude}%</span></div>
							<input type="range" min="0" max="60" value={generator.wavesParams.amplitude} oninput={(e) => updateWavesParam('amplitude', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Fréquence</span><span class="slider-value">{generator.wavesParams.frequency}</span></div>
							<input type="range" min="0.3" max="3" step="0.1" value={generator.wavesParams.frequency} oninput={(e) => updateWavesParam('frequency', +e.currentTarget.value as never)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Turbulence</span><span class="slider-value">{generator.wavesParams.turbulence}%</span></div>
							<input type="range" min="0" max="100" value={generator.wavesParams.turbulence} oninput={(e) => updateWavesParam('turbulence', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Anneaux ── -->
			{:else if generator.style === 'rings'}
				<section class="section">
					<p class="section-label">Origine</p>
					<div class="chips">
						<button onclick={() => updateRingsParam('origin', 'bottom')} class="chip" class:chip--active={generator.ringsParams.origin === 'bottom'}>Bas</button>
						<button onclick={() => updateRingsParam('origin', 'center')} class="chip" class:chip--active={generator.ringsParams.origin === 'center'}>Centre</button>
						<button onclick={() => updateRingsParam('origin', 'top')} class="chip" class:chip--active={generator.ringsParams.origin === 'top'}>Haut</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Anneaux</span><span class="slider-value">{generator.ringsParams.numRings}</span></div>
							<input type="range" min="5" max="24" value={generator.ringsParams.numRings} oninput={(e) => updateRingsParam('numRings', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Espacement</span><span class="slider-value">{generator.ringsParams.spacing}%</span></div>
							<input type="range" min="0" max="70" value={generator.ringsParams.spacing} oninput={(e) => updateRingsParam('spacing', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Épaisseur</span><span class="slider-value">{generator.ringsParams.lineWidth}</span></div>
							<input type="range" min="2" max="20" value={generator.ringsParams.lineWidth} oninput={(e) => updateRingsParam('lineWidth', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Dégradé ── -->
			{:else if generator.style === 'gradient'}
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Points couleur</span><span class="slider-value">{generator.gradientParams.numPoints}</span></div>
							<input type="range" min="2" max="5" value={generator.gradientParams.numPoints} oninput={(e) => updateGradientParam('numPoints', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Douceur</span><span class="slider-value">{generator.gradientParams.smoothness}%</span></div>
							<input type="range" min="20" max="100" value={generator.gradientParams.smoothness} oninput={(e) => updateGradientParam('smoothness', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Fluide ── -->
			{:else if generator.style === 'fluid'}
				<section class="section">
					<p class="section-label">Sources</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Points</span><span class="slider-value">{generator.fluidParams.numPoints}</span></div>
							<input type="range" min="2" max="5" value={generator.fluidParams.numPoints} oninput={(e) => updateFluidParam('numPoints', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Texture</p>
					<div class="chips">
						<button onclick={() => updateFluidParam('lineTexture', true)} class="chip" class:chip--active={generator.fluidParams.lineTexture}>Activée</button>
						<button onclick={() => updateFluidParam('lineTexture', false)} class="chip" class:chip--active={!generator.fluidParams.lineTexture}>Désactivée</button>
					</div>
					{#if generator.fluidParams.lineTexture}
						<div class="sliders mt">
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Espacement</span><span class="slider-value">{generator.fluidParams.lineSpacing}px</span></div>
								<input type="range" min="2" max="10" value={generator.fluidParams.lineSpacing} oninput={(e) => updateFluidParam('lineSpacing', +e.currentTarget.value)}/>
							</label>
							<label class="slider-row">
								<div class="slider-header"><span class="slider-label">Opacité</span><span class="slider-value">{generator.fluidParams.lineOpacity}%</span></div>
								<input type="range" min="0" max="25" value={generator.fluidParams.lineOpacity} oninput={(e) => updateFluidParam('lineOpacity', +e.currentTarget.value)}/>
							</label>
						</div>
					{/if}
				</section>

			<!-- ── Blobs ── -->
			{:else if generator.style === 'blobs'}
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Blobs</span><span class="slider-value">{generator.blobsParams.numBlobs}</span></div>
							<input type="range" min="3" max="7" value={generator.blobsParams.numBlobs} oninput={(e) => updateBlobsParam('numBlobs', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Anneaux</span><span class="slider-value">{generator.blobsParams.ringCount}</span></div>
							<input type="range" min="6" max="16" value={generator.blobsParams.ringCount} oninput={(e) => updateBlobsParam('ringCount', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Taille</span><span class="slider-value">{generator.blobsParams.blobSize}%</span></div>
							<input type="range" min="20" max="80" value={generator.blobsParams.blobSize} oninput={(e) => updateBlobsParam('blobSize', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Organicité</span><span class="slider-value">{generator.blobsParams.organicness}%</span></div>
							<input type="range" min="0" max="100" value={generator.blobsParams.organicness} oninput={(e) => updateBlobsParam('organicness', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Géo ── -->
			{:else if generator.style === 'geo'}
				<section class="section">
					<p class="section-label">Forme</p>
					<div class="chips">
						<button onclick={() => updateGeoParam('shapeType', 'circle')} class="chip" class:chip--active={generator.geoParams.shapeType === 'circle'}>Cercle</button>
						<button onclick={() => updateGeoParam('shapeType', 'oval')} class="chip" class:chip--active={generator.geoParams.shapeType === 'oval'}>Ovale</button>
						<button onclick={() => updateGeoParam('shapeType', 'rect')} class="chip" class:chip--active={generator.geoParams.shapeType === 'rect'}>Rectangle</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Quantité</span><span class="slider-value">{generator.geoParams.count}</span></div>
							<input type="range" min="5" max="60" value={generator.geoParams.count} oninput={(e) => updateGeoParam('count', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Espacement</span><span class="slider-value">{generator.geoParams.spacing}%</span></div>
							<input type="range" min="0" max="80" value={generator.geoParams.spacing} oninput={(e) => updateGeoParam('spacing', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Variation</span><span class="slider-value">{generator.geoParams.sizeVariation}%</span></div>
							<input type="range" min="0" max="100" value={generator.geoParams.sizeVariation} oninput={(e) => updateGeoParam('sizeVariation', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Dégradé</span><span class="slider-value">{generator.geoParams.gradientIntensity}%</span></div>
							<input type="range" min="0" max="100" value={generator.geoParams.gradientIntensity} oninput={(e) => updateGeoParam('gradientIntensity', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Topo ── -->
			{:else if generator.style === 'topo'}
				<section class="section">
					<p class="section-label">Rendu</p>
					<div class="chips">
						<button onclick={() => updateTopoParam('filled', true)} class="chip" class:chip--active={generator.topoParams.filled}>Rempli</button>
						<button onclick={() => updateTopoParam('filled', false)} class="chip" class:chip--active={!generator.topoParams.filled}>Lignes</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Couches</span><span class="slider-value">{generator.topoParams.layers}</span></div>
							<input type="range" min="4" max="24" value={generator.topoParams.layers} oninput={(e) => updateTopoParam('layers', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Lissage</span><span class="slider-value">{generator.topoParams.smoothness}%</span></div>
							<input type="range" min="0" max="100" value={generator.topoParams.smoothness} oninput={(e) => updateTopoParam('smoothness', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Épaisseur</span><span class="slider-value">{generator.topoParams.lineWeight}</span></div>
							<input type="range" min="0.5" max="4" step="0.5" value={generator.topoParams.lineWeight} oninput={(e) => updateTopoParam('lineWeight', +e.currentTarget.value as never)}/>
						</label>
					</div>
				</section>

			<!-- ── Hex ── -->
			{:else if generator.style === 'hex'}
				<section class="section">
					<p class="section-label">Dégradé</p>
					<div class="chips">
						<button onclick={() => updateHexParam('gradientType', 'diagonal')} class="chip" class:chip--active={generator.hexParams.gradientType === 'diagonal'}>Diagonal</button>
						<button onclick={() => updateHexParam('gradientType', 'radial')} class="chip" class:chip--active={generator.hexParams.gradientType === 'radial'}>Radial</button>
						<button onclick={() => updateHexParam('gradientType', 'angular')} class="chip" class:chip--active={generator.hexParams.gradientType === 'angular'}>Angulaire</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Taille cellule</span><span class="slider-value">{generator.hexParams.cellSize}px</span></div>
							<input type="range" min="20" max="100" value={generator.hexParams.cellSize} oninput={(e) => updateHexParam('cellSize', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Angle</span><span class="slider-value">{generator.hexParams.gradientAngle}°</span></div>
							<input type="range" min="0" max="360" value={generator.hexParams.gradientAngle} oninput={(e) => updateHexParam('gradientAngle', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Espacement</span><span class="slider-value">{generator.hexParams.gapSize}px</span></div>
							<input type="range" min="0" max="8" value={generator.hexParams.gapSize} oninput={(e) => updateHexParam('gapSize', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Diag ── -->
			{:else if generator.style === 'diag'}
				<section class="section">
					<p class="section-label">Direction</p>
					<div class="chips">
						<button onclick={() => updateDiagParam('direction', 'horizontal')} class="chip" class:chip--active={generator.diagParams.direction === 'horizontal'}>— Horiz</button>
						<button onclick={() => updateDiagParam('direction', 'diagonal')} class="chip" class:chip--active={generator.diagParams.direction === 'diagonal'}>↗ Diag</button>
						<button onclick={() => updateDiagParam('direction', 'diagonal-inv')} class="chip" class:chip--active={generator.diagParams.direction === 'diagonal-inv'}>↘ Inv</button>
						<button onclick={() => updateDiagParam('direction', 'vertical')} class="chip" class:chip--active={generator.diagParams.direction === 'vertical'}>| Vert</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Bandes</span><span class="slider-value">{generator.diagParams.numBands}</span></div>
							<input type="range" min="4" max="16" value={generator.diagParams.numBands} oninput={(e) => updateDiagParam('numBands', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Rotation fine</span><span class="slider-value">{generator.diagParams.angle - 45 > 0 ? '+' : ''}{generator.diagParams.angle - 45}°</span></div>
							<input type="range" min="0" max="90" value={generator.diagParams.angle} oninput={(e) => updateDiagParam('angle', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Opacité</span><span class="slider-value">{generator.diagParams.opacity}%</span></div>
							<input type="range" min="20" max="100" value={generator.diagParams.opacity} oninput={(e) => updateDiagParam('opacity', +e.currentTarget.value)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Largeur</span><span class="slider-value">{generator.diagParams.bandWidth}%</span></div>
							<input type="range" min="20" max="100" value={generator.diagParams.bandWidth} oninput={(e) => updateDiagParam('bandWidth', +e.currentTarget.value)}/>
						</label>
					</div>
				</section>

			<!-- ── Smiley ── -->
			{:else if generator.style === 'smiley'}
				<section class="section">
					<p class="section-label">Rendu</p>
					<div class="chips">
						<button onclick={() => updateSmileyParam('renderMode', 'filled')} class="chip" class:chip--active={generator.smileyParams.renderMode === 'filled'}>Plein</button>
						<button onclick={() => updateSmileyParam('renderMode', 'outline')} class="chip" class:chip--active={generator.smileyParams.renderMode === 'outline'}>Contour</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Expression</p>
					<div class="chips chips--grid2">
						{#each SMILEY_EXPRESSIONS as expr}
							<button onclick={() => updateSmileyParam('expression', expr)} class="chip" class:chip--active={generator.smileyParams.expression === expr}>{SMILEY_LABELS[expr]}</button>
						{/each}
					</div>
				</section>
				<section class="section">
					<p class="section-label">Disposition</p>
					<div class="chips chips--grid2">
						{#each Object.entries(ARRANGEMENT_LABELS) as [v, lbl]}
							<button onclick={() => updateSmileyParam('arrangement', v as SmileyArrangement)} class="chip" class:chip--active={generator.smileyParams.arrangement === v}>{lbl}</button>
						{/each}
					</div>
				</section>
				<section class="section">
					<p class="section-label">Couleur</p>
					<div class="chips">
						<button onclick={() => updateSmileyParam('colorMode', 'mono')} class="chip" class:chip--active={generator.smileyParams.colorMode === 'mono'}>Uni</button>
						<button onclick={() => updateSmileyParam('colorMode', 'multi')} class="chip" class:chip--active={generator.smileyParams.colorMode === 'multi'}>Multi</button>
						<button onclick={() => updateSmileyParam('colorMode', 'gradient')} class="chip" class:chip--active={generator.smileyParams.colorMode === 'gradient'}>Dégradé</button>
					</div>
				</section>
				<section class="section">
					<p class="section-label">Options</p>
					<div class="sliders">
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Colonnes</span><span class="slider-value">{generator.smileyParams.columns}</span></div>
							<input type="range" min="3" max="20" value={generator.smileyParams.columns} oninput={(e) => updateSmileyParam('columns', +e.currentTarget.value as never)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Espacement</span><span class="slider-value">{generator.smileyParams.spacing}%</span></div>
							<input type="range" min="0" max="60" value={generator.smileyParams.spacing} oninput={(e) => updateSmileyParam('spacing', +e.currentTarget.value as never)}/>
						</label>
						<label class="slider-row">
							<div class="slider-header"><span class="slider-label">Rotation</span><span class="slider-value">{generator.smileyParams.rotation}°</span></div>
							<input type="range" min="-45" max="45" value={generator.smileyParams.rotation} oninput={(e) => updateSmileyParam('rotation', +e.currentTarget.value as never)}/>
						</label>
					</div>
				</section>
			{/if}

		</div><!-- /params -->

		<!-- ── Footer ── -->
		<div class="footer">
			<div class="permalink-row">
				<span class="permalink-base">yourwallpaper.app/</span>
				<input
					type="text"
					value={getActiveSeed()}
					oninput={(e) => updateActiveSeed(e.currentTarget.value)}
					placeholder="mon-wallpaper"
					class="permalink-input"
					spellcheck="false"
					autocomplete="off"
				/>
				<button onclick={shareUrl} class="copy-btn" title={copied ? 'Copié !' : 'Copier le permalien'}>
					{#if copied}
						<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="2,7 5.5,10.5 12,4"/>
						</svg>
					{:else}
						<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
							<rect x="4.5" y="4.5" width="7.5" height="8" rx="1.5"/>
							<path d="M10 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5H4.5"/>
						</svg>
					{/if}
				</button>
			</div>
			<DevicePicker />
			<p class="hint">{generator.device.resolution.width}×{generator.device.resolution.height}{isHighRes ? ' — résolution haute' : ''}</p>
			{#if showPaymentInfo}
				<div class="paywall-notice">
					<p class="paywall-title">Haute résolution — bientôt disponible</p>
					<p class="paywall-body">€2.99 one-shot ou Pro €4.99/mois. <a href="/account" class="paywall-link">Créer un compte</a></p>
				</div>
			{/if}
			{#if exportError}<p class="error-msg">{exportError}</p>{/if}
			<button onclick={exportPNG} disabled={isExporting} class="btn-primary">
				{isExporting ? 'Export en cours…' : 'Télécharger PNG'}
			</button>
			<div class="secondary-row">
				<button onclick={exportSVGFile} class="btn-secondary">SVG</button>
				<button onclick={shareUrl} class="btn-secondary btn-share">{copied ? '✓ Copié' : 'Partager'}</button>
			</div>
		</div>

	</aside>

	<!-- ─── Preview ── -->
	<div class="preview-area">
		{#if generator.device.bezelFamily === 'none'}
			<!-- Free / no bezel -->
			<div class="wallpaper-glow"></div>
			<div class="wallpaper-frame" style="aspect-ratio:{previewAspect}; max-height:calc(100dvh - 10rem); max-width:100%">
				<div bind:this={svgContainer} class="wallpaper-inner">
					{#if svgString}
						{@html svgString}
					{:else}
						<div class="preview-placeholder">Génération…</div>
					{/if}
				</div>
			</div>
		{:else if generator.device.bezelFile}
			<!-- PNG bezel (phone / ipad / monitor) -->
			{@const bz = BEZEL_COORDS[generator.device.bezelFile]}
			<div
				class="bezel-scene"
				style="height:{generator.device.bezelFamily === 'monitor' ? 'calc(100dvh - 10rem)' : 'calc(100dvh - 12rem)'}; aspect-ratio:{bz.pngW}/{bz.pngH}"
			>
				<div
					class="bezel-wallpaper"
					style="-webkit-mask-image:url('/bezels/{generator.device.bezelFile}-mask.png'); mask-image:url('/bezels/{generator.device.bezelFile}-mask.png'); -webkit-mask-size:100% 100%; mask-size:100% 100%"
				>
					<div
						class="bezel-screen-pos"
						style="left:{bz.sx}%; top:{bz.sy}%; width:{bz.sw}%; height:{bz.sh}%"
					>
						<div bind:this={svgContainer} class="wallpaper-inner">
							{#if svgString}
								{@html svgString}
							{:else}
								<div class="preview-placeholder">Génération…</div>
							{/if}
						</div>
					</div>
				</div>
				<img class="bezel-img" src="/bezels/{generator.device.bezelFile}.png" alt="" draggable="false"/>
			</div>
		{:else}
			<!-- Mac CSS frame -->
			<div
				class="bezel-mac"
				style="aspect-ratio:{generator.device.resolution.width}/{generator.device.resolution.height}; max-height:calc(100dvh - 12rem)"
			>
				<div class="bezel-mac-bar">
					<span class="mac-dot mac-dot--red"></span>
					<span class="mac-dot mac-dot--yellow"></span>
					<span class="mac-dot mac-dot--green"></span>
					<span class="mac-label">{generator.device.label}</span>
				</div>
				<div bind:this={svgContainer} class="bezel-mac-screen wallpaper-inner">
					{#if svgString}
						{@html svgString}
					{:else}
						<div class="preview-placeholder">Génération…</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Floating action buttons -->
		<div class="preview-actions">
			<button onclick={randomizeShape} class="preview-action" title="Nouvelles formes">
				<svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
					<rect x="1" y="1" width="4" height="4" rx="1"/><rect x="7" y="1" width="4" height="4" rx="1"/>
					<rect x="1" y="7" width="4" height="4" rx="1"/><rect x="7" y="7" width="4" height="4" rx="1"/>
				</svg>
			</button>
			<button onclick={shareUrl} class="preview-action" title={copied ? 'Copié !' : 'Copier le lien'}>
				{#if copied}
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="2,7 5.5,10.5 12,4"/>
					</svg>
				{:else}
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5.5 8.5a3 3 0 0 0 4.24 0l2-2a3 3 0 0 0-4.24-4.24l-1.12 1.12"/>
						<path d="M8.5 5.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 0 0 4.24 4.24l1.12-1.12"/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div><!-- /layout -->

<!-- ─── Gallery ─────────────────────────────────────────────────────────── -->
{#if galleryItems.length > 0}
<section class="gallery-section">
	<div class="content-wrap">
		<h2 class="content-title font-serif">Chaque wallpaper est unique.</h2>
		<p class="content-sub">Généré par algorithme, reproductible par URL. Aucune IA, aucun stock photo.</p>
		<div class="gallery-grid">
			{#each galleryItems as item}
				<div class="gallery-card">
					<div class="gallery-preview">{@html item.svg}</div>
					<p class="gallery-label">{item.label} <span class="gallery-dot">·</span> {item.palette}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
{/if}

<!-- ─── Pricing ───────────────────────────────────────────────────────────── -->
<section class="pricing-section" id="pricing">
	<div class="content-wrap">
		<h2 class="content-title">Simple. Sans abonnement imposé.</h2>
		<p class="content-sub">Paye ce que tu utilises. <strong class="no-signup">Aucune inscription requise</strong> pour commencer.</p>
		<div class="pricing-cards">

			<div class="pricing-card">
				<div class="pricing-tier">Gratuit</div>
				<div class="pricing-price">€0</div>
				<p class="pricing-tagline">Pour explorer sans limite</p>
				<ul class="pricing-features">
					<li>12 styles procéduraux</li>
					<li>Export SVG illimité</li>
					<li>Partage par URL</li>
					<li>PNG avec watermark</li>
					<li class="feat-off">Haute résolution</li>
				</ul>
				<a href="/account" class="pricing-cta pricing-cta--ghost">Commencer</a>
			</div>

			<div class="pricing-card pricing-card--accent">
				<div class="pricing-tier">One-shot</div>
				<div class="pricing-price">€1.99</div>
				<p class="pricing-tagline">Un wallpaper HD, pour toujours</p>
				<ul class="pricing-features">
					<li>PNG haute résolution</li>
					<li>Sans watermark</li>
					<li>Toutes résolutions Apple</li>
					<li>Re-téléchargement 1 an</li>
					<li class="feat-off">Génération illimitée</li>
				</ul>
				<a href="/account" class="pricing-cta pricing-cta--filled">Acheter — €1.99</a>
			</div>

			<div class="pricing-card">
				<div class="pricing-badge">Meilleur ratio</div>
				<div class="pricing-tier">Pack ×5</div>
				<div class="pricing-price">€4.99</div>
				<p class="pricing-tagline">5 wallpapers HD — soit €1/pièce</p>
				<ul class="pricing-features">
					<li>5 PNG haute résolution</li>
					<li>Sans watermark</li>
					<li>Toutes résolutions Apple</li>
					<li>Re-téléchargement 1 an</li>
					<li>Crédits non expirables</li>
				</ul>
				<a href="/account" class="pricing-cta pricing-cta--ghost">Acheter le pack</a>
			</div>

		</div>
	</div>
</section>

</div><!-- /page -->

<style>
	.layout { display: flex; height: calc(100dvh - 44px); overflow: hidden; }

	.sidebar {
		width: 288px; flex-shrink: 0;
		display: flex; flex-direction: column;
		border-right: 1px solid var(--color-border);
		background: var(--color-bg); overflow: hidden;
	}

	/* Style grid (replaces tab strip) */
	.style-grid-wrap { flex-shrink: 0; border-bottom: 1px solid var(--color-border); padding: 8px 8px 6px; }
	.style-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; }
	.style-btn {
		padding: 7px 4px; font-size: 11px; font-weight: 500; letter-spacing: -0.01em;
		border-radius: 7px; border: none; background: transparent;
		color: var(--color-muted); cursor: pointer; text-align: center;
		white-space: nowrap; transition: background 100ms, color 100ms;
	}
	.style-btn--active { background: var(--color-fg); color: var(--color-bg); }
	.style-btn:not(.style-btn--active):hover { background: var(--color-surface-2); color: var(--color-fg); }

	/* Random toolbar */
	.random-toolbar {
		flex-shrink: 0;
		display: flex;
		gap: 6px;
		padding: 8px 12px;
		border-bottom: 1px solid var(--color-border);
	}
	.rand-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 6px 8px;
		font-size: 11px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		transition: background 120ms, color 120ms;
	}
	.rand-btn--shape {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-muted);
	}
	.rand-btn--shape:hover { color: var(--color-fg); border-color: var(--color-muted); }
	.rand-btn--all {
		background: var(--color-fg);
		border: 1px solid var(--color-fg);
		color: var(--color-bg);
	}
	.rand-btn--all:hover { opacity: 0.78; }

	/* Params */
	.params { flex: 1; overflow-y: auto; padding: 6px 0 8px; }
	.section { padding: 14px 16px 0; }
	.section + .section { padding-top: 14px; border-top: 1px solid var(--color-border); margin-top: 2px; }
	.section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-fg); opacity: 0.45; margin: 0 0 10px; }

	/* Palette */
	.palette-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
	.swatch { border-radius: 8px; overflow: hidden; border: 1.5px solid var(--color-border); cursor: pointer; background: transparent; padding: 0; transition: border-color 120ms; }
	.swatch--active { border-color: var(--ui-accent, var(--color-fg)); box-shadow: 0 0 0 1px var(--ui-accent, var(--color-fg)); }
	.swatch:not(.swatch--active):hover { border-color: var(--color-muted); }
	.swatch-colors { display: flex; height: 32px; }
	.swatch-name { display: block; padding: 3px 4px; text-align: center; font-size: 9px; color: var(--color-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.custom-palette { margin-top: 8px; border: 1.5px solid var(--color-border); border-radius: 8px; padding: 8px 10px; transition: border-color 120ms; }
	.custom-palette--active { border-color: var(--color-fg); box-shadow: 0 0 0 1px var(--color-fg); }
	.custom-label { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-muted); margin: 0 0 8px; }
	.custom-label--active { color: var(--color-fg); }
	.color-pickers { display: flex; gap: 6px; }
	.color-swatch { position: relative; width: 32px; height: 32px; border-radius: 6px; overflow: hidden; cursor: pointer; flex-shrink: 0; }
	.color-preview { display: block; width: 100%; height: 100%; border-radius: 6px; border: 1px solid var(--color-border); }
	.color-input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; padding: 0; border: none; }

	/* Chips */
	.chips { display: flex; flex-wrap: wrap; gap: 5px; }
	.chips--grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
	.chip { padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 500; border: 1px solid var(--color-border); color: var(--color-muted); background: transparent; cursor: pointer; white-space: nowrap; transition: background 100ms, color 100ms, border-color 100ms, transform 80ms; }
	.chip--active { background: var(--color-fg); color: var(--color-bg); border-color: var(--color-fg); }
	.chip:not(.chip--active):hover { color: var(--color-fg); border-color: var(--color-muted); }
	.chip:active { transform: scale(0.96); }
	.chips--grid2 .chip { border-radius: 7px; text-align: center; }

	/* Sliders */
	.sliders { display: flex; flex-direction: column; gap: 14px; }
	.sliders.mt { margin-top: 12px; }
	.slider-row { display: flex; flex-direction: column; cursor: pointer; }
	.slider-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
	.slider-label { font-size: 13px; color: var(--color-fg); }
	.slider-value { font-family: var(--font-mono); font-size: 11px; color: var(--color-muted); }

	/* Footer */
	.footer { flex-shrink: 0; border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
	.permalink-row {
		display: flex; align-items: center;
		background: var(--color-surface); border: 1px solid var(--color-border);
		border-radius: 8px; overflow: hidden; transition: border-color 150ms;
	}
	.permalink-row:focus-within { border-color: var(--color-muted); }
	.permalink-base { font-family: var(--font-mono); font-size: 10px; color: var(--color-subtle); padding: 7px 0 7px 8px; white-space: nowrap; flex-shrink: 0; user-select: none; }
	.permalink-input { flex: 1; min-width: 0; background: transparent; border: none; padding: 7px 4px; font-family: var(--font-mono); font-size: 11px; color: var(--color-fg); outline: none; }
	.permalink-input::placeholder { color: var(--color-subtle); }
	.copy-btn { width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: transparent; border: none; border-left: 1px solid var(--color-border); color: var(--color-muted); cursor: pointer; transition: color 120ms, background 120ms; }
	.copy-btn:hover { color: var(--color-fg); background: var(--color-surface-2); }
	.hint { margin: 0; font-size: 11px; color: var(--color-muted); }
	.paywall-notice { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 12px; }
	.paywall-title { margin: 0 0 3px; font-size: 12px; font-weight: 500; color: var(--color-fg); }
	.paywall-body { margin: 0; font-size: 11px; color: var(--color-muted); }
	.paywall-link { color: var(--color-fg); text-underline-offset: 2px; }
	.error-msg { margin: 0; font-size: 11px; color: #e05252; }
	.btn-primary { width: 100%; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; letter-spacing: -0.01em; background: var(--color-accent); color: #fff; border: none; cursor: pointer; transition: opacity 150ms, transform 100ms; }
	.btn-primary:disabled { opacity: 0.35; cursor: default; }
	.btn-primary:not(:disabled):hover { opacity: 0.88; transform: translateY(-1px); }
	.secondary-row { display: flex; gap: 6px; }
	.btn-secondary { flex: 1; padding: 7px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; background: transparent; color: var(--color-muted); border: 1px solid var(--color-border); cursor: pointer; transition: color 120ms, border-color 120ms; text-align: center; }
	.btn-secondary:hover { color: var(--color-fg); border-color: var(--color-muted); }
	.btn-share { flex: 2; }

	/* Preview */
	.preview-area {
		flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
		gap: 14px; padding: 16px 32px;
		background-color: var(--color-surface);
		position: relative;
		overflow: hidden;
	}

	/* Wallpaper glow */
	.wallpaper-glow {
		position: absolute;
		width: 60%; aspect-ratio: 1;
		top: 50%; left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: var(--ui-accent, var(--color-fg));
		opacity: 0.07;
		filter: blur(90px);
		pointer-events: none;
		z-index: 0;
	}

	/* ── Bezel PNG overlay ── */
	/*
	 * bezel-scene: explicit height (inline) + aspect-ratio lets the browser derive width.
	 * This gives a definite containing-block height so all %-based children resolve correctly.
	 */
	.bezel-scene {
		position: relative;
		flex-shrink: 0;
		max-width: 100%;
		z-index: 1;
		filter: drop-shadow(0 24px 60px rgba(0,0,0,0.35)) drop-shadow(0 6px 18px rgba(0,0,0,0.2));
	}
	/* Wallpaper layer: fills entire bezel-scene; mask clips to exact screen shape */
	.bezel-wallpaper {
		position: absolute;
		inset: 0;
		z-index: 1;
	}
	/* Wallpaper positioned at screen coordinates inside the masked layer */
	.bezel-screen-pos {
		position: absolute;
	}
	/* Bezel PNG: overlays the device frame above the wallpaper */
	.bezel-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: fill;
		pointer-events: none;
		z-index: 2;
		display: block;
	}

	/* Wallpaper frame — free mode only */
	.wallpaper-frame {
		border-radius: 16px; overflow: hidden;
		box-shadow: 0 0 0 1px var(--color-border), var(--shadow-preview);
		transition: transform 300ms ease, box-shadow 300ms ease;
		flex-shrink: 0;
		z-index: 1;
	}
	.wallpaper-frame:hover {
		transform: translateY(-3px);
		box-shadow: 0 0 0 1px var(--color-border), 0 28px 90px rgba(0,0,0,0.20), 0 10px 28px rgba(0,0,0,0.12);
	}

	/* ── Mac CSS frame ── */
	.bezel-mac {
		position: relative; display: flex; flex-direction: column;
		border-radius: 10px 10px 0 0;
		border: 1.5px solid var(--color-border);
		background: var(--color-raised);
		box-shadow: var(--shadow-preview);
		overflow: hidden;
		max-width: 100%;
		flex-shrink: 0;
	}
	.bezel-mac-bar {
		display: flex; align-items: center; gap: 5px;
		padding: 6px 10px;
		background: color-mix(in oklch, var(--color-raised) 80%, transparent);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}
	.mac-dot { width: 8px; height: 8px; border-radius: 50%; display: block; }
	.mac-dot--red    { background: #ff5f57; }
	.mac-dot--yellow { background: #febc2e; }
	.mac-dot--green  { background: #28c840; }
	.mac-label { margin-left: auto; font-size: 10px; color: var(--color-muted); }
	.bezel-mac-screen { flex: 1; min-height: 0; }

	/* ── Floating preview actions (bottom-right) ── */
	.preview-actions {
		position: absolute; bottom: 14px; right: 14px; z-index: 10;
		display: flex; flex-direction: column; gap: 6px;
	}
	.preview-action {
		width: 32px; height: 32px;
		display: flex; align-items: center; justify-content: center;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		background: var(--color-raised);
		color: var(--color-muted);
		cursor: pointer;
		box-shadow: var(--shadow-sm);
		transition: color 120ms, background 120ms;
	}
	.preview-action:hover { color: var(--color-fg); background: var(--color-surface-2); }

	.wallpaper-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
	.wallpaper-inner :global(svg) { display: block; width: 100%; height: 100%; }
	.preview-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 12px; color: var(--color-muted); }

	/* ─── Page wrapper ─────────────────────────────────────────────────── */
	.page { display: flex; flex-direction: column; }

	/* ─── Shared section layout ─────────────────────────────────────────── */
	.content-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
	.content-title { font-family: var(--font-serif); font-size: clamp(28px, 3.5vw, 42px); font-weight: 600; letter-spacing: -0.03em; margin: 0 0 10px; line-height: 1.15; color: var(--color-fg); }
	.content-sub { font-size: 15px; color: var(--color-muted); margin: 0 0 48px; line-height: 1.5; }

	/* ─── Gallery ───────────────────────────────────────────────────────── */
	.gallery-section { padding: 80px 0; background: var(--color-bg); border-top: 1px solid var(--color-border); }
	.gallery-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
	@media (max-width: 900px) { .gallery-grid { grid-template-columns: repeat(3, 1fr); } }
	@media (max-width: 560px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); } }
	.gallery-card { display: flex; flex-direction: column; gap: 8px; cursor: pointer; }
	.gallery-card:hover .gallery-preview { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08); }
	.gallery-preview { aspect-ratio: 9/16; border-radius: 10px; overflow: hidden; border: 1px solid var(--color-border); transition: transform 240ms ease, box-shadow 240ms ease; }
	.gallery-preview :global(svg) { width: 100%; height: 100%; display: block; }
	.gallery-label { margin: 4px 0 0; font-size: 11px; color: var(--color-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.gallery-dot { color: var(--color-subtle); }

	/* ─── Pricing ───────────────────────────────────────────────────────── */
	.pricing-section { padding: 80px 0 100px; background: var(--color-bg); border-top: 1px solid var(--color-border); }
	.no-signup { font-weight: 600; color: var(--color-fg); }
	.pricing-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
	@media (max-width: 700px) { .pricing-cards { grid-template-columns: 1fr; } }
	.pricing-card { position: relative; border: 1.5px solid var(--color-border); border-radius: 16px; padding: 32px 28px; background: var(--color-bg); display: flex; flex-direction: column; }
	.pricing-card--accent { border-color: var(--color-accent); }
	.pricing-badge { position: absolute; top: -12px; left: 28px; background: var(--color-accent); color: #fff; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 100px; letter-spacing: 0.06em; text-transform: uppercase; }
	.pricing-tier { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-muted); margin-bottom: 14px; }
	.pricing-price { font-family: var(--font-serif); font-size: 44px; font-weight: 600; letter-spacing: -0.04em; line-height: 1; margin-bottom: 6px; color: var(--color-fg); }

	.pricing-tagline { font-size: 13px; color: var(--color-muted); margin: 0 0 24px; }
	.pricing-features { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
	.pricing-features li { font-size: 13px; padding-left: 20px; position: relative; color: var(--color-fg); line-height: 1.4; }
	.pricing-features li::before { content: '✓'; position: absolute; left: 0; color: var(--color-accent); font-size: 11px; font-weight: 700; top: 1px; }
	.feat-off { color: var(--color-muted) !important; }
	.feat-off::before { content: '·' !important; color: var(--color-subtle) !important; font-size: 16px !important; top: -1px !important; }
	.pricing-cta { display: block; text-align: center; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 500; letter-spacing: -0.01em; text-decoration: none; transition: opacity 150ms, transform 100ms; margin-top: auto; }
	.pricing-cta--ghost { border: 1.5px solid var(--color-border); color: var(--color-fg); background: transparent; }
	.pricing-cta--ghost:hover { border-color: var(--color-muted); opacity: 0.8; }
	.pricing-cta--filled { background: var(--color-accent); color: #fff; border: 1.5px solid var(--color-accent); }
	.pricing-cta--filled:hover { opacity: 0.88; transform: translateY(-1px); }
</style>
