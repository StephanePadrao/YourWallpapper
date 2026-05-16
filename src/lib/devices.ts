export type BezelFamily = 'phone' | 'ipad' | 'mac' | 'monitor' | 'none';

export interface BezelCoords {
	pngW: number;
	pngH: number;
	sx: number; // % from left
	sy: number; // % from top
	sw: number; // % width
	sh: number; // % height
}

export interface DeviceConfig {
	id: string;
	label: string;
	resolution: { width: number; height: number };
	group: 'iphone' | 'ipad' | 'mac' | 'screen' | 'free';
	bezelFamily: BezelFamily;
	bezelFile?: string; // base name → /bezels/{bezelFile}.png + /bezels/{bezelFile}-mask.png
}

// Pixel-exact screen areas from BFS mask bounding boxes (see scripts/gen-masks.js)
// phone:   x=72-1277 (1206px), y=69-2690 (2622px)  within 1350×2760 PNG
// ipad:    x=130-1769 (1640px), y=130-2489 (2360px) within 1900×2620 PNG
// monitor: x=140-5259 (5120px), y=140-3019 (2880px) within 5400×4160 PNG
export const BEZEL_COORDS: Record<string, BezelCoords> = {
	phone:   { pngW: 1350, pngH: 2760, sx: 5.3333, sy: 2.5000, sw: 89.3333, sh: 95.0000 },
	ipad:    { pngW: 1900, pngH: 2620, sx: 6.8421, sy: 4.9618, sw: 86.3158, sh: 90.0763 },
	monitor: { pngW: 5400, pngH: 4160, sx: 2.5926, sy: 3.3654, sw: 94.8148, sh: 69.2308 },
};

export const DEVICES: DeviceConfig[] = [
	// iPhone — all share phone.png (same aspect ratio ≈ 0.46:1)
	{ id: 'iphone17promax', label: 'iPhone 17 Pro Max', resolution: { width: 1320, height: 2868 }, group: 'iphone', bezelFamily: 'phone', bezelFile: 'phone' },
	{ id: 'iphone17pro',    label: 'iPhone 17 Pro',     resolution: { width: 1206, height: 2622 }, group: 'iphone', bezelFamily: 'phone', bezelFile: 'phone' },
	{ id: 'iphone17air',    label: 'iPhone 17 Air',     resolution: { width: 1170, height: 2532 }, group: 'iphone', bezelFamily: 'phone', bezelFile: 'phone' },
	{ id: 'iphone17',       label: 'iPhone 17',         resolution: { width: 1170, height: 2532 }, group: 'iphone', bezelFamily: 'phone', bezelFile: 'phone' },
	// iPad — ipad.png matches iPad Air 11" (1640×2360) exactly
	{ id: 'ipadair11', label: 'iPad Air 11"',  resolution: { width: 1640, height: 2360 }, group: 'ipad', bezelFamily: 'ipad', bezelFile: 'ipad' },
	{ id: 'ipadair13', label: 'iPad Air 13"',  resolution: { width: 2064, height: 2752 }, group: 'ipad', bezelFamily: 'none' },
	{ id: 'ipadpro13', label: 'iPad Pro 13"',  resolution: { width: 2752, height: 2752 }, group: 'ipad', bezelFamily: 'none' },
	// Mac — CSS frame (macbook.png not yet available)
	{ id: 'macbookpro16', label: 'MacBook Pro 16"', resolution: { width: 3456, height: 2234 }, group: 'mac', bezelFamily: 'mac' },
	{ id: 'macbookpro14', label: 'MacBook Pro 14"', resolution: { width: 3024, height: 1964 }, group: 'mac', bezelFamily: 'mac' },
	{ id: 'macbookair15', label: 'MacBook Air 15"', resolution: { width: 2880, height: 1864 }, group: 'mac', bezelFamily: 'mac' },
	{ id: 'macbookair13', label: 'MacBook Air 13"', resolution: { width: 2560, height: 1664 }, group: 'mac', bezelFamily: 'mac' },
	// Monitor / Screen
	{ id: '4k',        label: 'Écran 4K',            resolution: { width: 3840, height: 2160 }, group: 'screen', bezelFamily: 'monitor', bezelFile: 'monitor' },
	{ id: '5k',        label: 'Écran 5K',            resolution: { width: 5120, height: 2880 }, group: 'screen', bezelFamily: 'monitor', bezelFile: 'monitor' },
	{ id: '6k',        label: 'Pro Display XDR 6K',  resolution: { width: 6016, height: 3384 }, group: 'screen', bezelFamily: 'monitor', bezelFile: 'monitor' },
	{ id: 'ultrawide', label: 'Ultrawide 3440×1440', resolution: { width: 3440, height: 1440 }, group: 'screen', bezelFamily: 'none' },
	{ id: 'fhd',       label: 'Full HD 1920×1080',   resolution: { width: 1920, height: 1080 }, group: 'screen', bezelFamily: 'none' },
	// Libre
	{ id: 'libre', label: 'Personnalisé', resolution: { width: 1920, height: 1080 }, group: 'free', bezelFamily: 'none' },
];

export const DEFAULT_DEVICE: DeviceConfig = DEVICES.find(d => d.id === 'iphone17pro')!;

export const DEVICE_GROUP_LABELS: Record<DeviceConfig['group'], string> = {
	iphone: 'iPhone',
	ipad:   'iPad',
	mac:    'Mac',
	screen: 'Écran',
	free:   'Libre',
};
