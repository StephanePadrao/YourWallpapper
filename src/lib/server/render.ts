import PQueue from 'p-queue';

// Lazy-load resvg-js to avoid issues in non-node environments
let ResvgClass: typeof import('@resvg/resvg-js').Resvg | null = null;
async function getResvg() {
	if (!ResvgClass) {
		const mod = await import('@resvg/resvg-js');
		ResvgClass = mod.Resvg;
	}
	return ResvgClass;
}

const queue = new PQueue({ concurrency: 4, timeout: 10_000 });

export async function svgToPng(svgString: string): Promise<Buffer> {
	return queue.add(async () => {
		const Resvg = await getResvg();
		const resvg = new Resvg(svgString, {
			shapeRendering: 2, // geometricPrecision
			textRendering: 2, // optimizeLegibility
			imageRendering: 0 // optimizeQuality
		});
		const pngData = resvg.render();
		return Buffer.from(pngData.asPng());
	}) as Promise<Buffer>;
}

export async function svgToJpeg(svgString: string, quality = 92): Promise<Buffer> {
	// resvg-js outputs PNG only — convert via sharp if available, else return PNG
	// For MVP: just return PNG (JPEG support is a stretch goal)
	return svgToPng(svgString);
}
