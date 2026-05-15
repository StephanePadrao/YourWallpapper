<script lang="ts">
	import { onMount } from 'svelte';
	import { generateCapsulesSVG } from '$lib/generators/style-b/capsules';
	import { DEFAULT_STYLE_B_PARAMS } from '$lib/generators/constants';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let svgString = $state('');

	onMount(() => {
		const params = {
			...DEFAULT_STYLE_B_PARAMS,
			seed: data.seed,
			palette: data.palette
		};
		svgString = generateCapsulesSVG(params, 1200, 800);
	});
</script>

<svelte:head>
	<title>{data.seed} — YourWallpaper</title>
	<meta property="og:title" content="{data.seed} — YourWallpaper" />
	<meta property="og:image" content={data.ogUrl} />
	<meta property="og:url" content={data.shareUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={data.ogUrl} />
</svelte:head>

<div class="mx-auto max-w-[var(--max-w-content)] px-[var(--spacing-page)] py-12">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="font-serif text-2xl">{data.seed}</h1>
			<p class="mt-1 text-sm text-[var(--color-muted)]">Palette : {data.palette}</p>
		</div>
		<a
			href="/?seed={encodeURIComponent(data.seed)}&palette={encodeURIComponent(typeof data.palette === 'string' ? data.palette : 'Twilight')}"
			class="rounded border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-surface)] transition-colors"
		>
			Modifier ce wallpaper →
		</a>
	</div>

	<div class="overflow-hidden rounded-xl shadow-xl">
		{#if svgString}
			{@html svgString}
		{:else}
			<div class="flex h-96 items-center justify-center bg-[var(--color-surface)] text-[var(--color-muted)]">
				Chargement…
			</div>
		{/if}
	</div>
</div>
