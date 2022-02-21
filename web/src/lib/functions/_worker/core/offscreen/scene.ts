import {
	PerspectiveCamera,
	Scene,
	// ImageBitmapLoader,
	// CanvasTexture,
	// IcosahedronGeometry,
	// MeshMatcapMaterial,
	Group,
	WebGLRenderer,
	AmbientLight,
	DirectionalLight
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../TestLoader';
import type { MTLLoader as threeMTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

let camera: PerspectiveCamera,
	scene: Scene,
	renderer: WebGLRenderer,
	group: Group,
	ambientLight: AmbientLight,
	directionalLight: DirectionalLight;

/* worker logic */
export function init(
	canvas: OffscreenCanvas,
	width: number,
	height: number,
	darkMode: boolean,
	pixelRatio: number,
	obj?: string,
	mtl?: string
) {
	camera = new PerspectiveCamera(30, width / height, 1, 1000);
	camera.position.z = 2;

	scene = new Scene();
	// scene.fog = new Fog(0x444466, 100, 400);
	// scene.background = new Color(0x444466);
	scene.background = null;

	/* parse obj & mtl here */
	const materials = new MTLLoader().parse(mtl) as unknown as threeMTLLoader.MaterialCreator;
	materials.preload();
	group = new OBJLoader().setMaterials(materials).parse(obj);
	scene.add(group);
	ambientLight = new AmbientLight(0xffffff, darkMode ? 1.4 : 2);
	scene.add(ambientLight);
	directionalLight = new DirectionalLight(0xffffff, darkMode ? 0.4 : 0.6);
	scene.add(directionalLight);
	renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(width, height, false);
	animate();
}

function animate() {
	if (renderer) {
		group.rotation.y = -Date.now() / 900;

		renderer.render(scene, camera);

		if (self.requestAnimationFrame) {
			self.requestAnimationFrame(animate);
		} else {
			// Firefox
		}
	}
}

export function updateSize(width: number, height: number, darkMode: boolean) {
	if (camera) {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}

	let tempIntensity = darkMode ? 1.4 : 2;
	if (ambientLight && ambientLight.intensity !== tempIntensity)
		ambientLight.intensity = tempIntensity;

	tempIntensity = darkMode ? 0.4 : 0.6;
	if (directionalLight && directionalLight.intensity !== tempIntensity)
		directionalLight.intensity = tempIntensity;
	if (renderer) renderer.setSize(width, height, false);
}
