declare module 'culori' {
	interface OklchColor {
		mode: 'oklch';
		l: number;
		c: number;
		h: number;
	}
	type AnyColor = OklchColor | { mode: string; [key: string]: unknown };

	export function formatHex(color: AnyColor): string | undefined;
	export function clampChroma(color: AnyColor, mode?: string, destination?: string): AnyColor;
	export function interpolate(colors: (string | AnyColor)[], mode?: string): (t: number) => AnyColor;
	export function oklch(color: AnyColor): OklchColor | undefined;
}
