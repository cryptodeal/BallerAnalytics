import type {
	MTLWorkerListenerEvent,
	WorkerLoadedExtRef,
	WorkerLoaderMessageData,
	WorkerLoadedExtRefData,
	MainMessageEventImageData,
	RestructureMaterialParams,
	WorkerLoadedModelData,
	WorkerExtRefData
} from './core/types';
import { parseMaterial } from './core/parseMaterials';
import { loadResource, isMessageEventDataTest } from './core/utils';
import type { Material, BufferGeometry } from 'three';
import { Mesh } from 'three';
import type { MTLLoader as threeMtlLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { MTLLoader } from '$lib/functions/_worker/core/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

/* declare worker state management & variables */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any,
	decoder = new TextDecoder('utf-8'),
	loadedExtRef: Record<string, WorkerLoadedExtRefData> = {};

let parsedMtl: string, parsedObj: string, workerExtRefHelpers: WorkerExtRefData[];

ctx.addEventListener('message', (event: MTLWorkerListenerEvent | MainMessageEventImageData) => {
	const { data } = event;
	console.log(`worker thread received message:`, data);
	if (isMessageEventDataTest(data)) {
		console.log(`isMessageEventDataTest: true`);
		const { extRefHelpers, mtl, obj } = data;
		if (!parsedMtl) parsedMtl = decoder.decode(mtl);
		if (!parsedObj) parsedObj = decoder.decode(obj);
		if (!workerExtRefHelpers) workerExtRefHelpers = extRefHelpers as WorkerExtRefData[];
		return Promise.all(
			extRefHelpers.map(({ src, width, height }) => {
				return loadResource(src).then((data) => {
					return { data, width, height, src };
				});
			})
		).then((res: WorkerLoadedExtRef[]) => {
			const transferrables = res.map(({ data }) => data);
			const finalLoaded: WorkerLoaderMessageData = {};
			for (const { data, height, src, width } of res) {
				finalLoaded[src] = { data, width, height, src };
			}
			return ctx.postMessage({ loadedExtRef: finalLoaded }, transferrables);
		});
	} else {
		console.log(`isMessageEventDataTest: false`);
		workerExtRefHelpers[workerExtRefHelpers.findIndex(({ src }) => src === data.src)].imageData =
			data.imageData;
		loadedExtRef[data.src] = workerExtRefHelpers[
			workerExtRefHelpers.findIndex(({ src }) => src === data.src)
		] as WorkerLoadedExtRefData;
		if (workerExtRefHelpers.filter((r) => !r.imageData).length == 0) {
			console.log(`loadedExtRef:\n`, loadedExtRef);
			// try loading the model here as all extref should exist
			const mtlLoader = new MTLLoader(loadedExtRef);
			const materials = mtlLoader.parse(parsedMtl) as unknown as threeMtlLoader.MaterialCreator;
			materials.preload();
			const resultingObject = new OBJLoader().setMaterials(materials).parse(parsedObj);
			resultingObject.children.map((child) => {
				if (child instanceof Mesh) {
					const {
						geometry,
						material
					}: { geometry: BufferGeometry | undefined; material: Material | undefined } = child;
					console.log('web worker material:', material);
					console.log('web worker geometry:', geometry);

					const parsedMaterials: RestructureMaterialParams[] = [];
					if (Array.isArray(material)) {
						material.forEach((m) => {
							parsedMaterials.push(parseMaterial(m));
						});
					} else {
						parsedMaterials.push(parseMaterial(material));
					}
					const parsedGeometry = {
						attributes: geometry.attributes,
						groups: geometry.groups
					};
					// Send material & geometry to main thread
					const message: WorkerLoadedModelData = {
						geometry: parsedGeometry,
						material: parsedMaterials
					};
					console.log(message);
					ctx.postMessage(message);
				}
			});
		}
	}
});
