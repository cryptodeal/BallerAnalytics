export interface MaterialInfo {
	ks?: number[] | undefined;
	kd?: number[] | undefined;
	ke?: number[] | undefined;
	map_kd?: string | undefined;
	map_ks?: string | undefined;
	map_ke?: string | undefined;
	norm?: string | undefined;
	map_bump?: string | undefined;
	bump?: string | undefined;
	map_d?: string | undefined;
	ns?: number | undefined;
	d?: number | undefined;
	tr?: number | undefined;
}

export interface MaterialCreatorOptions {
	/**
	 * side: Which side to apply the material
	 * THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
	 */
	side?: Side;
	/*
	 * wrap: What type of wrapping to apply for textures
	 * THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
	 */
	wrap?: Wrapping;
	/*
	 * normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
	 * Default: false, assumed to be already normalized
	 */
	normalizeRGB?: boolean;
	/*
	 * ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
	 * Default: false
	 */
	ignoreZeroRGBs?: boolean;
	/*
	 * invertTrProperty: Use values 1 of Tr field for fully opaque. This option is useful for obj
	 * exported from 3ds MAX, vcglib or meshlab.
	 * Default: false
	 */
	invertTrProperty?: boolean;
}

export interface TexParams {
	scale: Vector2;
	offset: Vector2;
	url: string;
}

export interface WorkerExtRefData extends ExtRefData {
	imageData?: ImageData;
}

export interface WorkerLoadedExtRefData extends WorkerExtRefData {
	imageData: ImageData;
}

export type WorkerLoadedExtRef = {
	data: ArrayBuffer;
	width: number;
	height: number;
	src: string;
};

export type MainExtRefImageData = {
	imageData: ImageData;
	width: number;
	height: number;
	src: string;
};

export type WorkerLoaderMessage = Record<string, WorkerLoadedExtRef>;

export interface WorkerLoaderMessageEvent extends MessageEvent {
	data: WorkerLoaderMessage;
}

export interface MainMessageEventImageData extends MessageEvent {
	data: MainExtRefImageData;
}

export interface MTLWorkerListenerEventData {
	mtl: string;
	obj: string;
	extRefHelpers?: ExtRefData[];
}

export interface MTLWorkerListenerEvent extends MessageEvent {
	data: MTLWorkerListenerEventData;
}

export type LoadedResources = Record<string, WorkerLoadedExtRefData>;

export interface RestructureMaterialParams {
	attenuationDistance?: number;
	attenuationColor?: Color;
	alphaMap?: null | Texture; // default null
	alphaTest?: number | undefined;
	alphaToCoverage?: boolean; // default false
	aoMap?: null | Texture; // default null when required
	aoMapIntensity?: number; // default 1
	blendDst?: BlendingDstFactor;
	blendDstAlpha?: null | number; // default null when required
	blendEquation?: BlendingEquation; // default AddEquation
	blendEquationAlpha?: null | number; // default null when required
	blending?: Blending; // default NormalBlending
	blendSrc?: BlendingSrcFactor | BlendingDstFactor; // default SrcAlphaFactor
	blendSrcAlpha?: null | number; // default null when required
	bumpMap?: null | Texture; // default null for MeshPhongMaterial
	bumpScale?: number; // default 1
	clearcoat?: number;
	clearcoatMap?: null | Texture; // default null when required
	clearcoatRoughness?: number;
	clearcoatRoughnessMap?: null | Texture; // default null when required
	clearcoatNormalScale?: Vector2;
	clearcoatNormalMap?: null | Texture; // default null when required
	clipIntersection?: boolean; // default false when required
	clipping?: boolean;
	clippingPlanes?: null | Plane[]; // default null when required
	clipShadows?: boolean; // default false
	color?: Color | ColorRepresentation; // default new Color( 0xffffff ) when required
	colorWrite?: boolean; // default true when required
	combine?: Combine; // default MultiplyOperation
	dashSize?: number; // default 3 when required
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	defines?: any;
	depthFunc?: DepthModes; // default LessEqualDepth
	depthPacking?: DepthPackingStrategies;
	depthTest?: boolean; // default true
	depthWrite?: boolean; // default true
	displacementBias?: number; // default is 0
	displacementMap?: null | Texture; // default null
	displacementScale?: number; // default 1
	dithering?: boolean; // default false
	emissive?: Color | ColorRepresentation; // default black when required
	emissiveIntensity?: number; // default 1
	emissiveMap?: null | Texture; // default null when required
	envMap?: null | Texture; // default null when required
	envMapIntensity?: number; // default 1
	extensions?: {
		derivatives?: boolean;
		fragDepth?: boolean;
		drawBuffers?: boolean;
		shaderTextureLOD?: boolean;
	};
	farDistance?: number;
	fragmentShader?: string;
	nearDistance?: number;
	flatShading?: boolean; // default false when required
	fog?: boolean; // default true when required
	format?: PixelFormat;
	gapSize?: number; // default 1 when required
	glslVersion?: GLSLVersion;
	gradientMap?: null | Texture; // default null when required
	ior?: number;
	lightMap?: null | Texture; // default null when required
	lightMapIntensity?: number; // default 1 when required
	lights?: boolean;
	linewidth?: number; // default 1
	linecap?: MaterialLinecap;
	linejoin?: MaterialLinejoin;
	map?: null | Texture; // default null when required
	matcap?: null | Texture; // default null when required
	metalness?: number;
	metalnessMap?: null | Texture; // default null when required
	name?: string; // default ''
	normalMap?: null | Texture; // default null when required
	normalMapType?: NormalMapTypes; // default TangentSpaceNormalMap
	normalScale?: Vector2; // default new Vector2( 1, 1 )
	opacity?: number; // default 1.0
	polygonOffset?: boolean; // default false
	polygonOffsetFactor?: number; // default 0
	polygonOffsetUnits?: number; // default 0
	precision?: null | MaterialPrecision; // default null
	premultipliedAlpha?: boolean; // default false when required
	referencePosition?: Vector3;
	reflectivity?: number; // default 1.0; range 0.0 - 1.0
	refractionRatio?: number; // default 0.98; index of refraction of air / index of refraction of material
	rotation?: number;
	roughness?: number;
	roughnessMap?: null | Texture; // default null when required
	scale?: number; // default 1 when required
	sheen?: number;
	sheenColor?: Color;
	sheenRoughness?: number;
	side?: Side; // default FrontSide
	size?: number;
	sizeAttenuation?: boolean;
	shadowSide?: null | Side; // default null when required
	shininess?: number; // default 30
	specular?: Color; // default new Color( 0x111111 )
	specularMap?: null | Texture; // default null
	specularIntensity?: number;
	specularIntensityMap?: null | Texture;
	specularColor?: Color;
	specularColorMap?: null | Texture;
	stencilFail?: StencilOp; // default KeepStencilOp
	stencilFunc?: StencilFunc; // default AlwaysStencilFunc
	stencilFuncMask?: number; // default 0xFF when required
	stencilRef?: number; // default 0 when required
	stencilWrite?: boolean; // default false
	stencilWriteMask?: number; // default 0xFF
	stencilZFail?: StencilOp; // default KeepStencilOp
	stencilZPass?: StencilOp; // default KeepStencilOp
	toneMapped?: boolean; // default true when required
	transmission?: number;
	transmissionMap?: null | Texture; // default null when required
	transparent?: boolean; // default false
	type: MaterialType; // default to type of material of the object
	uniforms?: { [uniform: string]: IUniform };
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	userData?: any; // default any
	vertexColors?: boolean; // default false when required
	vertexShader?: string;
	visible?: boolean; // default true
	wireframe?: boolean; // default false
	wireframeLinecap?: MaterialLinecap; // default 'round'
	wireframeLinejoin?: MaterialLinejoin; // default 'round'
	wireframeLinewidth?: number; // default 1
}

export interface RestructureTextureParams {
	anisotropy?: number;
	center?: Vector2;
	encoding?: TextureEncoding;
	flipY?: boolean;
	format?: PixelFormat;
	generateMipmaps?: boolean;
	image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageData | null;
	internalFormat?: PixelFormatGPU | null;
	isRenderTargetTexture?: boolean;
	magFilter?: TextureFilter; // default THREE.LinearFilter
	mapping?: Mapping; // default THREE.Texture.DEFAULT_MAPPING
	matrix?: Matrix3; // default new THREE.Matrix3()
	matrixAutoUpdate?: boolean; // default true
	minFilter?: TextureFilter; // default THREE.LinearMipmapLinearFilter
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mipmaps: any[]; // ImageData[] for 2D textures and CubeTexture[] for cube textures;
	name: string; // default ''
	needsPMREMUpdate?: boolean;
	offset?: Vector2; // default new THREE.Vector2( 0, 0 )
	premultiplyAlpha?: boolean; // default false
	repeat?: Vector2; // default new THREE.Vector2( 1, 1 )
	rotation?: number;
	type?: TextureDataType; // default THREE.UnsignedByteType
	unpackAlignment?: number; // default 4
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	userData?: any; // default any
	wrapS?: Wrapping; // default THREE.ClampToEdgeWrapping
	wrapT?: Wrapping; // default THREE.ClampToEdgeWrapping
}

export interface WorkerLoadedModelDataGeometry {
	attributes: {
		[name: string]: BufferAttribute | InterleavedBufferAttribute;
	};
	groups: {
		start: number;
		count: number;
		materialIndex?: number;
	}[];
}

export interface WorkerLoadedModelData {
	geometry: WorkerLoadedModelDataGeometry;
	material?: RestructureMaterialParams[];
}

export interface MTLWorkerMessageEvent extends MessageEvent {
	data: WorkerLoadedModelData;
}
