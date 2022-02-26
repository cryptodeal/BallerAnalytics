import type { Face, FacesMtlsIdx } from './types';

export class OBJLoader {
	data: string;
	vertices: Array<[number, number, number, number]> = [];
	normals: Array<[number, number, number]> = [];
	textureCoords: Array<[number, number, number]> = [];
	faces: Face[] = [];
	facesMaterialsIndex: FacesMtlsIdx[] = [{ materialName: null, materialStartIndex: 0 }];
	materials = [];
	decoder = new TextDecoder('utf-8');

	constructor(data?: string | Uint8Array) {
		if (data instanceof Uint8Array) {
			this.data = this.decoder.decode(data);
		} else this.data = data;
	}

	parseObj(line: string) {
		/* Don't parse comments */
		const commentStart = line.indexOf('#');
		if (commentStart != -1) {
			line = line.substring(0, commentStart);
		}
		line = line.trim();

		const splitLine = line.split(/\s+/);

		if (splitLine[0] === 'v') {
			const vertex: [number, number, number, number] = [
				Number(splitLine[1]),
				Number(splitLine[2]),
				Number(splitLine[3]),
				splitLine[4] ? 1 : Number(splitLine[4])
			];
			this.vertices.push(vertex);
		} else if (splitLine[0] === 'vt') {
			const textureCoord: [number, number, number] = [
				Number(splitLine[1]),
				Number(splitLine[2]),
				splitLine[3] ? 1 : Number(splitLine[3])
			];
			this.textureCoords.push(textureCoord);
		} else if (splitLine[0] === 'vn') {
			const normal: [number, number, number] = [
				Number(splitLine[1]),
				Number(splitLine[2]),
				Number(splitLine[3])
			];
			this.normals.push(normal);
		} else if (splitLine[0] === 'f') {
			const face: Face = {
				indices: [],
				texture: [],
				normal: []
			};

			for (let i = 1; i < splitLine.length; ++i) {
				const dIndex = splitLine[i].indexOf('//');
				const splitFaceIndices = splitLine[i].split(/\W+/);

				if (dIndex > 0) {
					/*Vertex Normal Indices Without Texture Coordinate Indices*/
					face.indices.push(splitFaceIndices[0]);
					face.normal.push(splitFaceIndices[1]);
				} else {
					if (splitFaceIndices.length === 1) {
						/*Vertex Indices*/
						face.indices.push(splitFaceIndices[0]);
					} else if (splitFaceIndices.length === 2) {
						/*Vertex Texture Coordinate Indices*/
						face.indices.push(splitFaceIndices[0]);
						face.texture.push(splitFaceIndices[1]);
					} else if (splitFaceIndices.length === 3) {
						/*Vertex Normal Indices*/
						face.indices.push(splitFaceIndices[0]);
						face.texture.push(splitFaceIndices[1]);
						face.normal.push(splitFaceIndices[2]);
					}
				}
			}

			this.faces.push(face);
		} else if (splitLine[0] === 'usemtl') {
			if (this.faces.length === 0) {
				this.facesMaterialsIndex[0].materialName = splitLine[1];
			} else {
				const materialName = splitLine[1];
				const materialStartIndex = this.faces.length;

				this.facesMaterialsIndex.push({
					materialName,
					materialStartIndex
				});
			}
		}
	}

	parseMtl(line: string, currentMat) {
		/*Not include comment*/
		const commentStart = line.indexOf('#');
		if (commentStart != -1) {
			line = line.substring(0, commentStart);
		}

		line = line.trim();
		const splitedLine = line.split(/\s+/);

		if (splitedLine[0] === 'newmtl') {
			if (currentMat.name) {
				this.materials.push(currentMat);
				currentMat = {};
			}
			currentMat.name = splitedLine[1];
		} else if (splitedLine[0] === 'Ka') {
			currentMat.ambient = [];
			for (let i = 0; i < 3; ++i) {
				currentMat.ambient.push(splitedLine[i + 1]);
			}
		} else if (splitedLine[0] === 'Kd') {
			currentMat.diffuse = [];
			for (let i = 0; i < 3; ++i) {
				currentMat.diffuse.push(splitedLine[i + 1]);
			}
		} else if (splitedLine[0] === 'Ks') {
			currentMat.specular = [];
			for (let i = 0; i < 3; ++i) {
				currentMat.specular.push(splitedLine[i + 1]);
			}
		} else if (splitedLine[0] === 'Ns') {
			currentMat.specularExponent = splitedLine[1];
		} else if (splitedLine[0] === 'd' || splitedLine[0] === 'Tr') {
			currentMat.transparent = splitedLine[1];
		} else if (splitedLine[0] === 'illum') {
			currentMat.illumMode = splitedLine[1];
		} else if (splitedLine[0] === 'map_Ka') {
			currentMat.ambientMap = splitedLine[1];
		} else if (splitedLine[0] === 'map_Kd') {
			currentMat.diffuseMap = splitedLine[1];
		} else if (splitedLine[0] === 'map_Ks') {
			currentMat.specularMap = splitedLine[1];
		} else if (splitedLine[0] === 'map_d') {
			currentMat.alphaMat = splitedLine[1];
		} else if (splitedLine[0] === 'map_bump' || splitedLine[0] === 'bump') {
			currentMat.bumpMap = splitedLine[1];
		} else if (splitedLine[0] === 'disp') {
			currentMat.displacementMap = splitedLine[1];
		}

		return currentMat;
	}
}
