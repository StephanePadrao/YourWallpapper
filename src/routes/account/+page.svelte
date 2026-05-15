<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/client/supabase';
	import { goto } from '$app/navigation';
	import { PUBLIC_PAYMENT_ENABLED } from '$env/static/public';
	import type { PageData } from './$types';

	const paymentEnabled = PUBLIC_PAYMENT_ENABLED === 'true';

	let { data }: { data: PageData } = $props();

	const supabase = createSupabaseBrowserClient();
	let signingIn = $state(false);
	let email = $state('');
	let magicSent = $state(false);
	let signInError = $state('');

	async function sendMagicLink() {
		signingIn = true;
		signInError = '';
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: `${window.location.origin}/account` }
		});
		if (error) signInError = error.message;
		else magicSent = true;
		signingIn = false;
	}

	async function signOut() {
		await supabase.auth.signOut();
		goto('/');
	}

	const isPro = $derived(data.subscription?.status === 'active');
	const subEndDate = $derived(
		data.subscription?.current_period_end
			? new Date(data.subscription.current_period_end).toLocaleDateString('fr-FR')
			: null
	);
</script>

<svelte:head>
	<title>Mon compte — YourWallpaper</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-[var(--spacing-page)] py-12">

	{#if !data.user}
		<!-- Sign in -->
		<div class="space-y-6">
			<div>
				<h1 class="font-serif text-3xl">Connexion</h1>
				<p class="mt-2 text-[var(--color-muted)]">
					Reçois un lien magique par email — pas de mot de passe.
				</p>
			</div>

			{#if magicSent}
				<div class="rounded-lg border border-[var(--color-border)] p-6 text-center">
					<p class="text-lg">✉️ Lien envoyé !</p>
					<p class="mt-2 text-sm text-[var(--color-muted)]">Vérifie ta boîte mail ({email}).</p>
				</div>
			{:else}
				<form onsubmit={(e) => { e.preventDefault(); sendMagicLink(); }} class="space-y-4">
					<div>
						<label for="email" class="mb-1 block text-sm font-medium">Email</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							placeholder="toi@example.com"
							class="w-full rounded border border-[var(--color-border)] bg-transparent px-4 py-2 focus:border-[var(--color-fg)] focus:outline-none"
						/>
					</div>
					{#if signInError}
						<p class="text-sm text-red-500">{signInError}</p>
					{/if}
					<button
						type="submit"
						disabled={signingIn}
						class="w-full rounded bg-[var(--color-fg)] px-4 py-2.5 font-medium text-[var(--color-bg)] hover:opacity-80 disabled:opacity-40 transition-opacity"
					>
						{signingIn ? 'Envoi…' : 'Envoyer le lien magique'}
					</button>
				</form>
			{/if}
		</div>

	{:else}
		<!-- Account info -->
		<div class="space-y-8">
			<div class="flex items-start justify-between">
				<div>
					<h1 class="font-serif text-3xl">Mon compte</h1>
					<p class="mt-1 text-[var(--color-muted)]">{data.user.email}</p>
				</div>
				<button
					onclick={signOut}
					class="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
				>
					Déconnexion
				</button>
			</div>

			<!-- Subscription status -->
			<section class="rounded-lg border border-[var(--color-border)] p-6">
				<h2 class="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--color-muted)]">
					Abonnement
				</h2>
				{#if isPro}
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium">Pro actif</p>
							{#if subEndDate}
								<p class="text-sm text-[var(--color-muted)]">Renouvellement le {subEndDate}</p>
							{/if}
						</div>
						<span class="rounded-full bg-[var(--color-fg)] px-3 py-1 text-xs font-medium text-[var(--color-bg)]">
							PRO
						</span>
					</div>
				{:else if paymentEnabled}
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium">Tier gratuit</p>
							<p class="text-sm text-[var(--color-muted)]">Export ≤ 2560×1440 avec watermark</p>
						</div>
						<a
							href="/checkout/pro"
							class="rounded bg-[var(--color-fg)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] hover:opacity-80 transition-opacity"
						>
							Passer Pro — €4.99/mois
						</a>
					</div>
				{:else}
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">Tier gratuit</p>
								<p class="text-sm text-[var(--color-muted)]">Export ≤ 2560×1440 avec watermark</p>
							</div>
						</div>
						<div class="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
							<p class="text-sm font-medium">Abonnement Pro — bientôt disponible</p>
							<p class="mt-1 text-xs text-[var(--color-muted)]">
								Export haute résolution sans watermark, toutes résolutions Apple, licence personnelle illimitée.
								<br />Tarif prévu : <strong>€4.99/mois</strong> ou <strong>€29/an</strong>.
							</p>
						</div>
					</div>
				{/if}
			</section>

			<!-- Purchase history -->
			{#if data.purchases.length > 0}
				<section>
					<h2 class="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--color-muted)]">
						Historique des achats
					</h2>
					<div class="space-y-2">
						{#each data.purchases as purchase}
							<div class="flex items-center justify-between rounded border border-[var(--color-border)] px-4 py-3 text-sm">
								<div>
									<span class="font-medium capitalize">{purchase.type.replace('_', ' ')}</span>
									{#if purchase.asset_hash}
										<span class="ml-2 font-mono text-xs text-[var(--color-muted)]">
											#{purchase.asset_hash.slice(0, 8)}
										</span>
									{/if}
								</div>
								<div class="text-right text-[var(--color-muted)]">
									{purchase.amount_cents ? `€${(purchase.amount_cents / 100).toFixed(2)}` : '—'}
									<br />
									<span class="text-xs">{new Date(purchase.created_at).toLocaleDateString('fr-FR')}</span>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>
