import type { PageServerLoad } from './$types';
import { DEFAULT_STYLE_B_PARAMS } from '$lib/generators/constants';
import { PUBLIC_APP_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ params, url }) => {
	const seed = params.seed;
	const palette = url.searchParams.get('palette') ?? DEFAULT_STYLE_B_PARAMS.palette;
	const style = url.searchParams.get('style') ?? 'B';

	const paletteStr = typeof palette === 'string' ? palette : 'Twilight';
	const ogUrl = `${PUBLIC_APP_URL}/api/og?seed=${encodeURIComponent(seed)}&palette=${encodeURIComponent(paletteStr)}`;
	const shareUrl = `${PUBLIC_APP_URL}/g/${seed}?palette=${encodeURIComponent(paletteStr)}&style=${style}`;

	return { seed, palette, style, ogUrl, shareUrl };
};
