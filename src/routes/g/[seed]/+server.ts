import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Legacy /g/[seed] links — redirect to / with legacy params
export const GET: RequestHandler = ({ params, url }) => {
	const { seed } = params;
	const palette = url.searchParams.get('palette');
	const qs = new URLSearchParams({ seed });
	if (palette) qs.set('palette', palette);
	redirect(301, `/?${qs}`);
};
