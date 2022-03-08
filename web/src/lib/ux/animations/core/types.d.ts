type GLTFVersion = 1 | 2;
type GLTFType = 'GLTF';
type AccessorDataType = 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4';

interface BinChunkItem {
	arrayBuffer: ArrayBuffer;
	byteLength: number;
	byteOffset: number;
}

interface IGLTFResultHeader {
	byteLength: number;
	byteOffset: number;
	hasBinChunks: boolean;
}

interface IGLTFResultJsonAccessor {
	bufferView: number;
	byteOffset: number;
	componentType: number;
	count: number;
	max: [number, number, number];
	min: [number, number, number];
	type: AccessorDataType;
}

interface IGLTFResultJsonAsset {
	extras: {
		author: string;
		license: string;
		source: string;
		title: string;
	};
	generator: string;
	version: string;
}

interface IGLTFResultJsonBufferViews {
	buffer: number;
	byteLength: number;
	byteOffset: number;
}

interface IGLTFResultJson {
	accessors: IGLTFResultJsonAccessor[];
	asset: IGLTFResultJsonAsset;
	bufferViews: IGLTFResultJsonBufferViews[];
}

export interface IGLTFResult {
	binChunks: BinChunkItem[];
	header: IGLTFResultHeader;
	json: IGLTFResultJson;
	type: GLTFType;
	version: GLTFVersion;
}
