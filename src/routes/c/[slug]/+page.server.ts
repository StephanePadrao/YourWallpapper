import type { PageServerLoad } from './$types';
import { PUBLIC_APP_URL } from '$env/static/public';

export const load: PageServerLoad = ({ params, url }) => {
	const { slug } = params;
	const stateB64 = url.searchParams.get('s') ?? '';
	const shareUrl = `${PUBLIC_APP_URL}/c/${slug}${stateB64 ? `?s=${stateB64}` : ''}`;
	const editUrl = `/?s=${stateB64}`;
	const ogUrl = `${PUBLIC_APP_URL}/api/og?seed=${encodeURIComponent(slug)}`;

	return { slug, stateB64, shareUrl, editUrl, ogUrl };
};
