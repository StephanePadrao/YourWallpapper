import type { RequestHandler } from './$types';
import { generateCapsulesSVG } from '$lib/generators/style-b/capsules';
import { svgToPng } from '$lib/server/render';
import { DEFAULT_STYLE_B_PARAMS } from '$lib/generators/constants';

export const GET: RequestHandler = async ({ url }) => {
	const seed = url.searchParams.get('seed') ?? DEFAULT_STYLE_B_PARAMS.seed;
	const palette = url.searchParams.get('palette') ?? DEFAULT_STYLE_B_PARAMS.palette;

	const params = { ...DEFAULT_STYLE_B_PARAMS, seed, palette, gridCols: 8, gridRows: 5 };
	const svgString = generateCapsulesSVG(params, 1200, 630);
	const buffer = await svgToPng(svgString);

	return new Response(new Uint8Array(buffer), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400, s-maxage=86400'
		}
	});
};
