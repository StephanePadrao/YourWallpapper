import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Temporary redirect until PR-7 (landing page) makes /create the main generator
export const load: PageServerLoad = ({ url }) => {
	const s = url.searchParams.get('s');
	redirect(307, s ? `/?s=${s}` : '/');
};
