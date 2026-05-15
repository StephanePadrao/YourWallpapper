import type { Tier } from './types';

const WATERMARK_TEXT = 'yourwallpaper.app';

function injectSVGWatermark(svgString: string): string {
	const fontSize = 14;
	const watermark = `<text font-family="system-ui,sans-serif" font-size="${fontSize}" fill="rgba(255,255,255,0.55)" x="98%" y="97%" text-anchor="end">${WATERMARK_TEXT}</text>`;
	return svgString.replace('</svg>', `${watermark}\n</svg>`);
}

export function downloadSVG(svgEl: SVGSVGElement, filename: string, tier: Tier): void {
	let svgString = svgEl.outerHTML;
	if (tier === 'anonymous' || tier === 'free') {
		svgString = injectSVGWatermark(svgString);
	}
	const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	triggerDownload(URL.createObjectURL(blob), `${filename}.svg`);
}

export function downloadFromUrl(url: string, filename: string, ext: string): void {
	triggerDownload(url, `${filename}.${ext}`);
}

function triggerDownload(url: string, filename: string): void {
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	// Revoke object URL after a tick to allow the download to start
	if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildFilename(style: string, palette: string | object, seed: string): string {
	const paletteName = typeof palette === 'string' ? palette : 'custom';
	return `yourwallpaper-${style.toLowerCase()}-${paletteName.toLowerCase().replace(/\s/g, '-')}-${seed.slice(0, 8)}`;
}
