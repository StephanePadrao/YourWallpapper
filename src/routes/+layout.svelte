<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/client/supabase';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const supabase = createSupabaseBrowserClient();
	let isDark = $state(false);

	onMount(() => {
		const saved = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		isDark = saved === 'dark' || (!saved && prefersDark);
		applyTheme(isDark);

		const { data: listener } = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				invalidate('supabase:auth');
			}
		});
		return () => listener.subscription.unsubscribe();
	});

	function applyTheme(dark: boolean) {
		document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	}

	function toggleTheme() {
		isDark = !isDark;
		applyTheme(isDark);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://api.fontshare.com" crossorigin="" />
	<link href="https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,700&display=swap" rel="stylesheet"/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
	<meta
		name="description"
		content="Génère des fonds d'écran procéduraux paramétriques, partageables par URL, exportables en haute résolution pour tous tes appareils Apple."
	/>
</svelte:head>

<div class="root">
	<header class="header">
		<div class="header-left">
		<a href="/" class="logo">YourWallpaper</a>
		<span class="tagline">Des wallpapers qui n'existent que pour toi.</span>
	</div>

		<nav class="nav">
			<a href="#pricing" class="nav-link nav-link--pricing">Tarifs</a>
			<button
				onclick={toggleTheme}
				class="theme-toggle"
				title={isDark ? 'Mode clair' : 'Mode sombre'}
				aria-label="Basculer le thème"
			>
				{#if isDark}
					<!-- Sun -->
					<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
						<circle cx="7.5" cy="7.5" r="2.8"/>
						<line x1="7.5" y1="0.8" x2="7.5" y2="2.2"/>
						<line x1="7.5" y1="12.8" x2="7.5" y2="14.2"/>
						<line x1="0.8" y1="7.5" x2="2.2" y2="7.5"/>
						<line x1="12.8" y1="7.5" x2="14.2" y2="7.5"/>
						<line x1="2.7" y1="2.7" x2="3.7" y2="3.7"/>
						<line x1="11.3" y1="11.3" x2="12.3" y2="12.3"/>
						<line x1="11.3" y1="3.7" x2="12.3" y2="2.7"/>
						<line x1="2.7" y1="12.3" x2="3.7" y2="11.3"/>
					</svg>
				{:else}
					<!-- Moon -->
					<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
						<path d="M2.2 7.5A5.3 5.3 0 0 0 11 13A5.3 5.3 0 0 1 4 4A5.3 5.3 0 0 0 2.2 7.5Z"/>
					</svg>
				{/if}
			</button>

			<a href="/account" class="nav-link">
				{data.user ? 'Compte' : 'Connexion'}
			</a>
		</nav>
	</header>

	<main class="main">
		{@render children()}
	</main>
</div>

<style>
	.root {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: var(--color-bg);
		color: var(--color-fg);
	}

	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		border-bottom: 1px solid var(--color-border);
		background: var(--header-bg);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: 16px;
	}

	.logo {
		font-family: var(--font-serif);
		font-size: 17px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--color-fg);
		text-decoration: none;
		flex-shrink: 0;
	}

	.tagline {
		font-size: 11px;
		color: var(--color-muted);
		letter-spacing: 0.01em;
		display: none;
	}

	@media (min-width: 900px) {
		.tagline { display: inline; }
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.nav-link--pricing {
		color: var(--color-accent);
		font-weight: 500;
	}
	.nav-link--pricing:hover { color: var(--color-accent); opacity: 0.75; }

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		cursor: pointer;
		color: var(--color-muted);
		border-radius: 6px;
		padding: 0;
		transition: color 150ms;
	}
	.theme-toggle:hover { color: var(--color-fg); }

	.nav-link {
		font-size: 13px;
		color: var(--color-muted);
		text-decoration: none;
		transition: color 150ms;
	}
	.nav-link:hover { color: var(--color-fg); }

	.main {
		display: flex;
		flex: 1;
		flex-direction: column;
	}
</style>
