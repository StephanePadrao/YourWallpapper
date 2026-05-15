const WATERMARK_TEXT = 'yourwallpaper.app';

export function applyWatermarkToSVG(svgString: string, width: number, height: number): string {
	const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.018));
	const patternSize = fontSize * 8;

	// Diagonal repeated text pattern
	const pattern = `<defs>
  <pattern id="wm" x="0" y="0" width="${patternSize}" height="${patternSize}" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
    <text font-family="system-ui,sans-serif" font-size="${fontSize}" fill="rgba(255,255,255,0.08)" x="0" y="${fontSize}">${WATERMARK_TEXT}</text>
  </pattern>
</defs>
<rect width="${width}" height="${height}" fill="url(#wm)"/>`;

	return svgString.replace('</svg>', `${pattern}\n</svg>`);
}
