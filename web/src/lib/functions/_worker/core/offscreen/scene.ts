import {
	PerspectiveCamera,
	Scene,
	Group,
	WebGLRenderer,
	AmbientLight,
	DirectionalLight
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

let camera: PerspectiveCamera,
	scene: Scene,
	renderer: WebGLRenderer,
	group: Group,
	ambientLight: AmbientLight,
	directionalLight: DirectionalLight;
// orbitControls: OrbitControls;

/* worker logic */
export function init(
	canvas: OffscreenCanvas,
	width: number,
	height: number,
	darkMode: boolean,
	pixelRatio: number,
	path: string
) {
	scene = new Scene();
	// scene.fog = new Fog(0x444466, 100, 400);
	// scene.background = new Color(0x444466);
	scene.background = null;

	// orbitControls =  new OrbitControls(camera, renderer.domElement)

	/* parse glb w KTX2 images here */

	renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(width, height, false);
	const ktx2Loader = new KTX2Loader().setTranscoderPath('/scripts/').detectSupport(renderer);
	const loader = new GLTFLoader();
	loader.setKTX2Loader(ktx2Loader);
	loader.load(path, function (gltf) {
		camera = new PerspectiveCamera(45, width / height, 0.1, 2000);
		camera.zoom = 1;
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 3;
		ambientLight = new AmbientLight(0xffffff, darkMode ? 0.6 : 1);
		scene.add(ambientLight);
		directionalLight = new DirectionalLight(0xffffff, darkMode ? 0.4 : 0.6);
		directionalLight.position.x = -1;
		directionalLight.position.y = 3;
		directionalLight.position.z = 2;
		scene.add(directionalLight);
		group = gltf.scene;
		group.rotation.x = 0.025;
		group.rotation.z = 0.025;
		scene.add(group);
		animate();
	});
}

function animate() {
	if (renderer) {
		group.rotation.y = -Date.now() / 900;
		// orbitControls.update();

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

	let tempIntensity = darkMode ? 0.6 : 1;
	if (ambientLight && ambientLight.intensity !== tempIntensity)
		ambientLight.intensity = tempIntensity;

	tempIntensity = darkMode ? 0.4 : 0.6;
	if (directionalLight && directionalLight.intensity !== tempIntensity)
		directionalLight.intensity = tempIntensity;
	if (renderer) renderer.setSize(width, height, false);
}
