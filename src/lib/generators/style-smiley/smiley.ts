import { createRNG } from '../noise';
import { resolveColors } from '../palette';
import type { StyleSmileyParams, SmileyExpression, SmileyRenderMode } from '../types';

function drawFace(
	cx: number,
	cy: number,
	r: number,
	expression: SmileyExpression,
	faceColor: string,
	detailColor: string,
	rotation: number,
	renderMode: SmileyRenderMode
): string {
	const ey = cy - r * 0.1; // eye center Y
	const er = r * 0.1; // eye radius
	const lx = cx - r * 0.3; // left eye X
	const rx2 = cx + r * 0.3; // right eye X
	const sw = r * 0.08; // stroke width
	const mY = cy + r * 0.18; // mouth Y baseline

	let eyes = '';
	let mouth = '';

	switch (expression) {
		case 'smile':
			eyes = `<circle cx="${lx.toFixed(1)}" cy="${ey.toFixed(1)}" r="${er.toFixed(1)}" fill="${detailColor}"/>
<circle cx="${rx2.toFixed(1)}" cy="${ey.toFixed(1)}" r="${er.toFixed(1)}" fill="${detailColor}"/>`;
			mouth = `<path d="M${(cx - r * 0.38).toFixed(1)},${mY.toFixed(1)} Q${cx.toFixed(1)},${(mY + r * 0.32).toFixed(1)} ${(cx + r * 0.38).toFixed(1)},${mY.toFixed(1)}" stroke="${detailColor}" fill="none" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>`;
			break;

		case 'wink':
			eyes = `<circle cx="${lx.toFixed(1)}" cy="${ey.toFixed(1)}" r="${er.toFixed(1)}" fill="${detailColor}"/>
<path d="M${(rx2 - r * 0.14).toFixed(1)},${ey.toFixed(1)} Q${rx2.toFixed(1)},${(ey + r * 0.1).toFixed(1)} ${(rx2 + r * 0.14).toFixed(1)},${ey.toFixed(1)}" stroke="${detailColor}" fill="none" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>`;
			mouth = `<path d="M${(cx - r * 0.38).toFixed(1)},${mY.toFixed(1)} Q${cx.toFixed(1)},${(mY + r * 0.32).toFixed(1)} ${(cx + r * 0.38).toFixed(1)},${mY.toFixed(1)}" stroke="${detailColor}" fill="none" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>`;
			break;

		case 'cool': {
			const gy = ey - r * 0.04;
			const gw = r * 0.36;
			const gh = r * 0.2;
			const gr = r * 0.07;
			eyes = `<rect x="${(lx - gw / 2).toFixed(1)}" y="${(gy - gh / 2).toFixed(1)}" width="${gw.toFixed(1)}" height="${gh.toFixed(1)}" rx="${gr.toFixed(1)}" fill="${detailColor}"/>
<rect x="${(rx2 - gw / 2).toFixed(1)}" y="${(gy - gh / 2).toFixed(1)}" width="${gw.toFixed(1)}" height="${gh.toFixed(1)}" rx="${gr.toFixed(1)}" fill="${detailColor}"/>
<line x1="${(lx + gw / 2).toFixed(1)}" y1="${gy.toFixed(1)}" x2="${(rx2 - gw / 2).toFixed(1)}" y2="${gy.toFixed(1)}" stroke="${detailColor}" stroke-width="${(sw * 0.7).toFixed(1)}"/>`;
			mouth = `<path d="M${(cx - r * 0.3).toFixed(1)},${(mY + r * 0.05).toFixed(1)} Q${cx.toFixed(1)},${(mY + r * 0.28).toFixed(1)} ${(cx + r * 0.3).toFixed(1)},${(mY + r * 0.05).toFixed(1)}" stroke="${detailColor}" fill="none" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>`;
			break;
		}

		case 'surprised':
			eyes = `<circle cx="${lx.toFixed(1)}" cy="${(ey - r * 0.04).toFixed(1)}" r="${(er * 1.2).toFixed(1)}" fill="${detailColor}"/>
<circle cx="${rx2.toFixed(1)}" cy="${(ey - r * 0.04).toFixed(1)}" r="${(er * 1.2).toFixed(1)}" fill="${detailColor}"/>`;
			mouth = `<ellipse cx="${cx.toFixed(1)}" cy="${(mY + r * 0.1).toFixed(1)}" rx="${(r * 0.2).toFixed(1)}" ry="${(r * 0.16).toFixed(1)}" fill="${detailColor}"/>`;
			break;

		case 'love': {
			const hs = r * 0.16;
			function heart(hx: number, hy: number): string {
				return `<path d="M${hx.toFixed(1)},${(hy - hs * 0.3).toFixed(1)} C${(hx - hs).toFixed(1)},${(hy - hs * 1.1).toFixed(1)} ${(hx - hs * 1.8).toFixed(1)},${hy.toFixed(1)} ${hx.toFixed(1)},${(hy + hs * 0.8).toFixed(1)} C${(hx + hs * 1.8).toFixed(1)},${hy.toFixed(1)} ${(hx + hs).toFixed(1)},${(hy - hs * 1.1).toFixed(1)} ${hx.toFixed(1)},${(hy - hs * 0.3).toFixed(1)}Z" fill="${detailColor}"/>`;
			}
			eyes = heart(lx, ey) + heart(rx2, ey);
			mouth = `<path d="M${(cx - r * 0.38).toFixed(1)},${mY.toFixed(1)} Q${cx.toFixed(1)},${(mY + r * 0.32).toFixed(1)} ${(cx + r * 0.38).toFixed(1)},${mY.toFixed(1)}" stroke="${detailColor}" fill="none" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>`;
			break;
		}

		case 'laugh':
			eyes = `<path d="M${(lx - r * 0.14).toFixed(1)},${(ey + r * 0.06).toFixed(1)} Q${lx.toFixed(1)},${(ey - r * 0.1).toFixed(1)} ${(lx + r * 0.14).toFixed(1)},${(ey + r * 0.06).toFixed(1)}" stroke="${detailColor}" fill="none" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>
<path d="M${(rx2 - r * 0.14).toFixed(1)},${(ey + r * 0.06).toFixed(1)} Q${rx2.toFixed(1)},${(ey - r * 0.1).toFixed(1)} ${(rx2 + r * 0.14).toFixed(1)},${(ey + r * 0.06).toFixed(1)}" stroke="${detailColor}" fill="none" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>`;
			mouth = `<path d="M${(cx - r * 0.42).toFixed(1)},${mY.toFixed(1)} Q${cx.toFixed(1)},${(mY + r * 0.5).toFixed(1)} ${(cx + r * 0.42).toFixed(1)},${mY.toFixed(1)}" stroke="${detailColor}" fill="${detailColor}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round"/>`;
			break;
	}

	const transform = rotation !== 0
		? ` transform="rotate(${rotation.toFixed(1)},${cx.toFixed(1)},${cy.toFixed(1)})"`
		: '';

	const outlineSW = r * 0.06;
	const faceCircle = renderMode === 'outline'
		? `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${faceColor}" stroke-width="${(outlineSW * 1.2).toFixed(1)}"/>`
		: `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${faceColor}"/>`;

	return `<g${transform}>
${faceCircle}
${eyes}
${mouth}
</g>`;
}

interface SmileyPlacement {
	cx: number;
	cy: number;
	colorIdx: number;
	rotation: number;
}

function computePlacements(
	params: StyleSmileyParams,
	width: number,
	height: number,
	rng: () => number
): SmileyPlacement[] {
	const cols = params.columns;
	const cellW = width / cols;
	const gap = cellW * (params.spacing / 100);
	const cellH = cellW; // square cells
	const rows = Math.ceil(height / cellH) + 1;
	const placements: SmileyPlacement[] = [];
	let colorIdx = 0;

	switch (params.arrangement) {
		case 'grid':
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					placements.push({
						cx: (col + 0.5) * cellW,
						cy: (row + 0.5) * cellH,
						colorIdx: colorIdx++,
						rotation: params.rotation + (rng() - 0.5) * 8
					});
				}
			}
			break;

		case 'brick':
			for (let row = 0; row < rows; row++) {
				const offset = row % 2 === 1 ? cellW * 0.5 : 0;
				for (let col = 0; col < cols + 1; col++) {
					const cx = (col + 0.5) * cellW + offset - cellW * 0.5;
					if (cx < -cellW || cx > width + cellW) continue;
					placements.push({
						cx,
						cy: (row + 0.5) * cellH,
						colorIdx: colorIdx++,
						rotation: params.rotation + (rng() - 0.5) * 8
					});
				}
			}
			break;

		case 'scatter': {
			const count = Math.round(cols * cols * (height / width));
			for (let i = 0; i < count; i++) {
				placements.push({
					cx: rng() * width,
					cy: rng() * height,
					colorIdx: colorIdx++,
					rotation: params.rotation + (rng() - 0.5) * 60
				});
			}
			break;
		}

		case 'rings': {
			const cx0 = width / 2, cy0 = height / 2;
			let ring = 0;
			let placed = 0;
			const total = cols * Math.ceil(height / cellH);
			while (placed < total) {
				if (ring === 0) {
					placements.push({ cx: cx0, cy: cy0, colorIdx: colorIdx++, rotation: params.rotation });
					placed++;
				} else {
					const ringR = ring * cellW * 1.0;
					const perimeter = 2 * Math.PI * ringR;
					const inRing = Math.max(6, Math.round(perimeter / (cellW * (1 + params.spacing / 60))));
					for (let i = 0; i < inRing; i++) {
						const angle = (i / inRing) * 2 * Math.PI;
						placements.push({
							cx: cx0 + ringR * Math.cos(angle),
							cy: cy0 + ringR * Math.sin(angle),
							colorIdx: colorIdx++,
							rotation: params.rotation + (ring % 2 === 0 ? 0 : 15)
						});
						placed++;
					}
				}
				ring++;
				if (ring > 20) break;
			}
			break;
		}
	}

	return placements;
}

export function generateSmileySVG(params: StyleSmileyParams, width: number, height: number): string {
	const rng = createRNG(params.seed);
	const hexColors = resolveColors(params.palette);

	const cellW = width / params.columns;
	const gap = cellW * (params.spacing / 100);
	const r = (cellW - gap * 2) / 2;

	const placements = computePlacements(params, width, height, rng);

	// Background: darkest color
	const bg = hexColors[0];

	const faces = placements.map((p) => {
		let faceColor: string;
		let detailColor: string;

		switch (params.colorMode) {
			case 'mono':
				faceColor = hexColors[1 % hexColors.length];
				detailColor = hexColors[0];
				break;
			case 'multi':
				faceColor = hexColors[p.colorIdx % hexColors.length];
				detailColor = hexColors[(p.colorIdx + 2) % hexColors.length];
				break;
			case 'gradient': {
				const t = p.cx / width;
				const idx = Math.floor(t * (hexColors.length - 1));
				faceColor = hexColors[idx];
				detailColor = hexColors[(idx + 2) % hexColors.length];
				break;
			}
		}

		// Skip faces that are fully outside the canvas
		if (p.cx + r < 0 || p.cx - r > width || p.cy + r < 0 || p.cy - r > height) return '';

		return drawFace(p.cx, p.cy, r * 0.88, params.expression, faceColor, detailColor, p.rotation, params.renderMode);
	});

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${bg}"/>
${faces.join('\n')}
</svg>`;
}
