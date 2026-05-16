<script lang="ts">
	import { DEVICES, DEVICE_GROUP_LABELS } from '$lib/devices';
	import { generator, setDevice, setLibreResolution } from '$lib/stores/generator.svelte';

	const GROUPS = ['iphone', 'ipad', 'mac', 'screen', 'free'] as const;

	function onSelect(e: Event) {
		setDevice((e.target as HTMLSelectElement).value);
	}

	function onLibreW(e: Event) {
		const w = Math.max(100, Math.min(8192, parseInt((e.target as HTMLInputElement).value) || 1920));
		setLibreResolution(w, generator.device.resolution.height);
	}

	function onLibreH(e: Event) {
		const h = Math.max(100, Math.min(8192, parseInt((e.target as HTMLInputElement).value) || 1080));
		setLibreResolution(generator.device.resolution.width, h);
	}
</script>

<div class="device-picker">
	<select value={generator.device.id} onchange={onSelect} class="device-select">
		{#each GROUPS as group}
			{@const devs = DEVICES.filter(d => d.group === group)}
			{#if devs.length > 0}
				<optgroup label={DEVICE_GROUP_LABELS[group]}>
					{#each devs as d}
						<option value={d.id}>{d.label}{d.bezelFamily === 'none' && d.group !== 'free' ? ` — ${d.resolution.width}×${d.resolution.height}` : ''}</option>
					{/each}
				</optgroup>
			{/if}
		{/each}
	</select>

	{#if generator.device.id === 'libre'}
		<div class="libre-inputs">
			<input
				type="number"
				min="100"
				max="8192"
				value={generator.device.resolution.width}
				onchange={onLibreW}
				class="libre-input"
			/>
			<span class="libre-sep">×</span>
			<input
				type="number"
				min="100"
				max="8192"
				value={generator.device.resolution.height}
				onchange={onLibreH}
				class="libre-input"
			/>
			<span class="libre-unit">px</span>
		</div>
	{/if}
</div>

<style>
	.device-picker { display: flex; flex-direction: column; gap: 6px; }
	.device-select { width: 100%; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 28px 7px 10px; font-size: 12px; color: var(--color-fg); outline: none; cursor: pointer; transition: border-color 150ms; -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
	.device-select:focus { border-color: var(--color-muted); }
	.libre-inputs { display: flex; align-items: center; gap: 4px; }
	.libre-input { width: 68px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; padding: 5px 6px; font-size: 12px; color: var(--color-fg); text-align: center; outline: none; }
	.libre-input:focus { border-color: var(--color-muted); }
	.libre-sep, .libre-unit { font-size: 11px; color: var(--color-muted); flex-shrink: 0; }
</style>
