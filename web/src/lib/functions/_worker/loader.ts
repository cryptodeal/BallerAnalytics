import type {
	MTLWorkerListenerEvent,
	WorkerExtRefData,
	WorkerLoadedExtRef,
	WorkerLoaderMessage,
	MainMessageEventImageData
} from './core/types';
// import { parseMaterial } from './core/parseMaterials'
import { isMessageEventDataTest, loadResource } from './core/utils';
// import { MTLLoader } from './core/MTLLoader'
// import type { MTLLoader as threeMtlLoader } from 'three/examples/jsm/loaders/MTLLoader'
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
// import type { BufferGeometry, Material } from 'three'
// import { Mesh } from 'three'

/* declare worker state management & variables */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;
let workerExtRefHelpers: WorkerExtRefData[];
let workerMtl: string;
let workerObj: string;
// const loadedExtRef: LoadedResources = {}

ctx.addEventListener('message', (event: MTLWorkerListenerEvent | MainMessageEventImageData) => {
	const { data } = event;
	if (isMessageEventDataTest(data)) {
		const { mtl, obj, extRefHelpers } = data;
		if (!workerExtRefHelpers) workerExtRefHelpers = extRefHelpers as WorkerExtRefData[];
		if (!workerMtl) workerMtl = mtl;
		if (!workerObj) workerObj = obj;
		return Promise.all(
			extRefHelpers.map(({ src, width, height }) => {
				return loadResource(src).then((data) => {
					return { data, width, height, src };
				});
			})
		).then((res: WorkerLoadedExtRef[]) => {
			const transferrables = res.map(({ data }) => data);
			const messageData: WorkerLoaderMessage = {};
			for (const { data, height, src, width } of res) {
				messageData[src] = { data, width, height, src };
			}
			return ctx.postMessage(messageData, transferrables);
		});
	}
	/* else {
    workerExtRefHelpers[workerExtRefHelpers.findIndex(({src})=> src === data.src)].imageData = data.imageData
    loadedExtRef[data.src] =  workerExtRefHelpers[workerExtRefHelpers.findIndex(({src})=> src === data.src)] as WorkerLoadedExtRefData
    if(workerExtRefHelpers.filter(r => !r.imageData).length == 0){
      console.log(`loadedExtRef:\n`, loadedExtRef)
      // try loading the model here as all extref should exist 
      const mtlLoader = new MTLLoader(loadedExtRef)
      const materials = mtlLoader.parse(workerMtl, '') as unknown as threeMtlLoader.MaterialCreator;
      materials.preload()
      const resultingObject = new OBJLoader().setMaterials(materials).parse(workerObj);
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
          ctx.postMessage(message);
        } 
      });
      
    }
    
  } */
});
