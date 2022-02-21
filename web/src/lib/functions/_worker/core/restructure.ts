import type {
	WorkerLoadedModelDataGeometry,
	RestructureMaterialParams,
	RestructureTextureParams
} from './types';
import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DataTexture,
	MeshPhongMaterial,
	RGBAFormat,
	UnsignedByteType,
	Vector2,
	Vector3
} from 'three';
import type { MeshPhongMaterialParameters } from 'three';

export const restructureMaterial = (materialProps: RestructureMaterialParams) => {
	materialProps as MeshPhongMaterialParameters;
	restructureHelpers(materialProps);
	return new MeshPhongMaterial(materialProps);
};

export const restructureGeometry = (geometry: WorkerLoadedModelDataGeometry): BufferGeometry => {
	const resultingGeometry = new BufferGeometry();
	for (const key in geometry.attributes) {
		const { array, itemSize, normalized } = geometry.attributes[key];
		const attribute = new BufferAttribute(array, itemSize, normalized);
		resultingGeometry.setAttribute(key, attribute);
	}
	for (let i = 0; i < geometry.groups.length; i++) {
		const { start, count, materialIndex } = geometry.groups[i];
		resultingGeometry.addGroup(start, count, materialIndex);
	}
	return resultingGeometry;
};

export const restructureHelpers = (
	materialProps: RestructureMaterialParams
): RestructureMaterialParams => {
	for (const key in materialProps) {
		if (
			key.toLowerCase().includes('map') &&
			materialProps[key] !== null &&
			typeof materialProps[key] === 'object'
		) {
			const {
				anisotropy,
				// center,
				encoding,
				// flipY,
				// format,
				// generateMipmaps,
				image,
				// internalFormat,
				// isRenderTargetTexture,
				magFilter,
				mapping,
				// matrix,
				// matrixAutoUpdate,
				minFilter,
				// mipmaps,
				// name,
				// needsPMREMUpdate,
				// offset,
				// premultiplyAlpha,
				// repeat,
				// rotation,
				// type,
				// unpackAlignment,
				// userData,
				wrapS,
				wrapT
			} = materialProps[key] as RestructureTextureParams;
			if (!image) {
				throw new Error('Image is required for texture');
			} else {
				materialProps[key] = new DataTexture(
					new Uint8Array(image.data.buffer),
					image.width,
					image.height,
					RGBAFormat,
					UnsignedByteType,
					mapping,
					wrapS,
					wrapT,
					magFilter,
					minFilter,
					anisotropy,
					encoding
				);
				materialProps[key].needsUpdate = true;
			}
		} else if (
			typeof materialProps[key]?.r === 'number' &&
			typeof materialProps[key]?.g === 'number' &&
			typeof materialProps[key]?.b === 'number'
		) {
			const { r, g, b } = materialProps[key];
			materialProps[key] = new Color(r, g, b);
		} else if (
			typeof materialProps[key]?.x === 'number' &&
			typeof materialProps[key]?.y === 'number' &&
			typeof materialProps[key]?.z === 'number'
		) {
			const { x, y, z } = materialProps[key];
			materialProps[key] = new Vector3(x, y, z);
		} else if (
			typeof materialProps[key]?.x === 'number' &&
			typeof materialProps[key]?.y === 'number'
		) {
			const { x, y } = materialProps[key];
			materialProps[key] = new Vector2(x, y);
		}
	}
	return materialProps;
};
