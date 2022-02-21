import {
	Color,
	FrontSide,
	MeshPhongMaterial,
	RepeatWrapping,
	Vector2,
	sRGBEncoding,
	ImageBitmapLoader,
	Texture,
	CanvasTexture
} from 'three';
import type { Side, Wrapping, Material, Mapping, LoadingManager } from 'three';
import type { MaterialInfo, MaterialCreatorOptions, TexParams } from './types';

/* Loads a Wavefront .mtl file specifying materials */
export class MTLLoader {
	materialOptions: MaterialCreatorOptions;

	setMaterialOptions(value: MaterialCreatorOptions): void {
		this.materialOptions = value;
	}

	parse(text: string): MaterialCreator {
		const lines = text.split('\n');
		let info = {};
		const delimiter_pattern = /\s+/;
		const materialsInfo = {};

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			line = line.trim();

			if (line.length === 0 || line.charAt(0) === '#') {
				/* Blank line or comment ignore */
				continue;
			}

			const pos = line.indexOf(' ');

			let key = pos >= 0 ? line.substring(0, pos) : line;
			key = key.toLowerCase();

			let value = pos >= 0 ? line.substring(pos + 1) : '';
			value = value.trim();

			if (key === 'newmtl') {
				/* New material */

				info = { name: value };
				materialsInfo[value] = info;
			} else {
				if (key === 'ka' || key === 'kd' || key === 'ks' || key === 'ke') {
					const ss = value.split(delimiter_pattern, 3);
					info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];
				} else {
					info[key] = value;
				}
			}
		}
		const materialCreator = new MaterialCreator(this.materialOptions);
		materialCreator.setMaterials(materialsInfo);
		return materialCreator;
	}
}

export class MaterialCreator {
	options: MaterialCreatorOptions;
	materialsInfo: { [key: string]: MaterialInfo };
	materials: { [key: string]: Material };
	private materialsArray: Material[];
	nameLookup: { [key: string]: number };
	side: Side;
	manager: LoadingManager;
	wrap: Wrapping;
	crossOrigin: string;

	constructor(options: MaterialCreatorOptions = {}) {
		this.options = options;
		this.materialsInfo = {};
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};
		this.side = this.options.side !== undefined ? this.options.side : FrontSide;
		this.wrap = this.options.wrap !== undefined ? this.options.wrap : RepeatWrapping;
	}

	setMaterials(materialsInfo: { [key: string]: MaterialInfo }): void {
		this.materialsInfo = this.convert(materialsInfo);
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};
	}

	convert(materialsInfo: { [key: string]: MaterialInfo }): { [key: string]: MaterialInfo } {
		if (!this.options) return materialsInfo;

		const converted = {};

		for (const mn in materialsInfo) {
			// Convert materials info into normalized form based on options

			const mat = materialsInfo[mn];

			const covmat = {};

			converted[mn] = covmat;

			for (const prop in mat) {
				let save = true;
				let value = mat[prop];
				const lprop = prop.toLowerCase();

				switch (lprop) {
					case 'kd':
					case 'ka':
					case 'ks':
						// Diffuse color (color under white light) using RGB values

						if (this.options && this.options.normalizeRGB) {
							value = [value[0] / 255, value[1] / 255, value[2] / 255];
						}

						if (this.options && this.options.ignoreZeroRGBs) {
							if (value[0] === 0 && value[1] === 0 && value[2] === 0) {
								// ignore

								save = false;
							}
						}

						break;

					default:
						break;
				}

				if (save) {
					covmat[lprop] = value;
				}
			}
		}

		return converted;
	}

	preload(): void {
		for (const mn in this.materialsInfo) {
			this.create(mn);
		}
	}

	getIndex(materialName: string): number {
		return this.nameLookup[materialName];
	}

	getAsArray(): Material[] {
		let index = 0;
		for (const mn in this.materialsInfo) {
			this.materialsArray[index] = this.create(mn);
			this.nameLookup[mn] = index;
			index++;
		}
		return this.materialsArray;
	}

	create(materialName: string): Material {
		if (this.materials[materialName] === undefined) {
			this.createMaterial_(materialName);
		}
		return this.materials[materialName];
	}

	createMaterial_(materialName: string): Material {
		// Create material

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const scope = this;
		const mat = this.materialsInfo[materialName];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const params: any = {
			name: materialName,
			side: this.side
		};

		function setMapForType(mapType, value) {
			if (params[mapType]) return; // Keep the first encountered texture

			const texParams = scope.getTextureParams(value, params);
			const map = scope.loadTexture(texParams.url);
			map.repeat.copy(texParams.scale);
			map.offset.copy(texParams.offset);

			map.wrapS = scope.wrap;
			map.wrapT = scope.wrap;

			if (mapType === 'map' || mapType === 'emissiveMap') {
				map.encoding = sRGBEncoding;
			}
			params[mapType] = map;
		}

		for (const prop in mat) {
			const value = mat[prop];
			let n;
			if (value === '') continue;
			switch (prop.toLowerCase()) {
				/* Ns is material specular exponent */

				case 'kd':
					// Diffuse color (color under white light) using RGB values

					params.color = new Color().fromArray(value).convertSRGBToLinear();

					break;

				case 'ks':
					// Specular color (color when light is reflected from shiny surface) using RGB values
					params.specular = new Color().fromArray(value).convertSRGBToLinear();

					break;

				case 'ke':
					// Emissive using RGB values
					params.emissive = new Color().fromArray(value).convertSRGBToLinear();

					break;

				case 'map_kd':
					// Diffuse texture map

					setMapForType('map', value);

					break;

				case 'map_ks':
					// Specular map

					setMapForType('specularMap', value);

					break;

				case 'map_ke':
					// Emissive map

					setMapForType('emissiveMap', value);

					break;

				case 'norm':
					setMapForType('normalMap', value);

					break;

				case 'map_bump':
				case 'bump':
					// Bump texture map

					setMapForType('bumpMap', value);

					break;

				case 'map_d':
					// Alpha map

					setMapForType('alphaMap', value);
					params.transparent = true;

					break;

				case 'ns':
					/** The specular exponent (defines the focus of the specular highlight)
					 *  A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000 */
					params.shininess = parseFloat(value);

					break;

				case 'd':
					n = parseFloat(value);

					if (n < 1) {
						params.opacity = n;
						params.transparent = true;
					}

					break;

				case 'tr':
					n = parseFloat(value);

					if (this.options && this.options.invertTrProperty) n = 1 - n;

					if (n > 0) {
						params.opacity = 1 - n;
						params.transparent = true;
					}

					break;

				default:
					break;
			}
		}

		this.materials[materialName] = new MeshPhongMaterial(params);
		return this.materials[materialName];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getTextureParams(value: string, matParams: any): TexParams {
		const texParams: TexParams = {
			scale: new Vector2(1, 1),
			offset: new Vector2(0, 0),
			url: undefined
		};

		const items = value.split(/\s+/);
		let pos;

		pos = items.indexOf('-bm');

		if (pos >= 0) {
			matParams.bumpScale = parseFloat(items[pos + 1]);
			items.splice(pos, 2);
		}

		pos = items.indexOf('-s');

		if (pos >= 0) {
			texParams.scale.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
			items.splice(pos, 4); // we expect 3 parameters here!
		}

		pos = items.indexOf('-o');

		if (pos >= 0) {
			texParams.offset.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
			items.splice(pos, 4); // we expect 3 parameters here!
		}

		texParams.url = items.join(' ').trim();
		return texParams;
	}

	loadTexture(url: string, mapping?: Mapping): Texture {
		const loader = new ImageBitmapLoader();
		const texture = loader.load(url, function (imgBitmap) {
			const texture = new CanvasTexture(imgBitmap);
			if (mapping !== undefined) texture.mapping = mapping;
			return texture;
		});
		return texture;
	}
}
