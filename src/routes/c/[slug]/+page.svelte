<script lang="ts">
	import { onMount } from 'svelte';
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
	import { decodeState, applyDecodedState } from '$lib/url-state';
	import { generator } from '$lib/stores/generator.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let svgString = $state('');
	let ready = $state(false);

	onMount(() => {
		if (data.stateB64) {
			const decoded = decodeState(data.stateB64);
			if (decoded) applyDecodedState(decoded, generator);
		} else {
			// No state — use slug as seed with default style
			generator.capsulesParams.seed = data.slug;
		}

		const W = 900;
		const H = Math.round(W * generator.device.resolution.height / generator.device.resolution.width);

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
		ready = true;
	});
</script>

<svelte:head>
	<title>{data.slug} — YourWallpaper</title>
	<meta property="og:title" content="{data.slug} — YourWallpaper" />
	<meta property="og:image" content={data.ogUrl} />
	<meta property="og:url" content={data.shareUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={data.ogUrl} />
</svelte:head>

<div class="permalink-page">
	<header class="permalink-header">
		<a href="/" class="back-link">← YourWallpaper</a>
		<div class="slug-info">
			<span class="slug-text">{data.slug}</span>
		</div>
		<a href={data.editUrl} class="edit-btn">Modifier ce design →</a>
	</header>

	<div class="preview-wrap">
		{#if ready && svgString}
			<div class="preview-frame">
				{@html svgString}
			</div>
		{:else}
			<div class="preview-loading">Génération…</div>
		{/if}
	</div>
</div>

<style>
	.permalink-page { min-height: 100dvh; display: flex; flex-direction: column; background: var(--color-bg); }
	.permalink-header {
		display: flex; align-items: center; gap: 16px; padding: 16px 24px;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-raised);
	}
	.back-link { font-size: 13px; color: var(--color-muted); text-decoration: none; white-space: nowrap; }
	.back-link:hover { color: var(--color-fg); }
	.slug-info { flex: 1; min-width: 0; }
	.slug-text { font-size: 13px; font-weight: 500; color: var(--color-fg); font-family: var(--font-mono, monospace); }
	.edit-btn {
		flex-shrink: 0; font-size: 12px; font-weight: 500;
		padding: 6px 14px; border-radius: 7px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-fg); text-decoration: none;
		transition: background 120ms;
	}
	.edit-btn:hover { background: var(--color-surface-2); }
	.preview-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 24px; }
	.preview-frame {
		max-width: min(900px, 100%); width: 100%;
		border-radius: 12px; overflow: hidden;
		border: 1px solid var(--color-border);
		box-shadow: 0 20px 60px rgba(0,0,0,0.15);
	}
	.preview-frame :global(svg) { display: block; width: 100%; height: auto; }
	.preview-loading { font-size: 13px; color: var(--color-muted); }
</style>
