import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

export class InitScene {
	public renderer: WebGLRenderer;
	public camera: PerspectiveCamera;
	public scene: Scene;
	public group: Group;
	public ambientLight: AmbientLight;
	public directionalLight: DirectionalLight;
	public animate;
	canvas: HTMLCanvasElement | OffscreenCanvas;
	htmlElement: unknown;

	constructor(
		canvas: OffscreenCanvas,
		width: number,
		height: number,
		darkMode: boolean,
		group: Group,
		renderer: WebGLRenderer,
		htmlElement: unknown
	) {
		this.renderer = renderer;
		this.canvas = canvas;
		this.htmlElement = htmlElement;
		this.scene = new Scene();
		this.scene.background = null;
		this.camera = new PerspectiveCamera(45, width / height, 0.1, 2000);
		this.camera.zoom = 1;
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.camera.position.z = 3;
		const controls = new OrbitControls(this.camera, this.htmlElement as HTMLElement);
		controls.enableZoom = false;
		controls.listenToKeyEvents(this.htmlElement as HTMLElement);
		controls.update();

		const ambientLight = new AmbientLight(0xffffff, darkMode ? 0.6 : 1);
		this.ambientLight = ambientLight;
		this.scene.add(this.ambientLight);
		this.directionalLight = new DirectionalLight(0xffffff, darkMode ? 0.4 : 0.6);
		this.directionalLight.position.x = -1;
		this.directionalLight.position.y = 3;
		this.directionalLight.position.z = 2;
		this.scene.add(this.directionalLight);
		group.rotation.x = 0.025;
		group.rotation.z = 0.025;
		this.group = group;
		this.scene.add(this.group);
		this.animate = () => {
			this.group.rotation.y = -Date.now() / 900;
			// orbitControls.update();

			this.renderer.render(this.scene, this.camera);

			if (self.requestAnimationFrame) {
				self.requestAnimationFrame(this.animate);
			} else {
				// Firefox
			}
		};
		this.animate();
	}

	static build(
		canvas: OffscreenCanvas,
		width: number,
		height: number,
		darkMode: boolean,
		pixelRatio: number,
		path: string,
		htmlElement: unknown
	) {
		const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(width, height, false);
		const ktx2Loader = new KTX2Loader().setTranscoderPath('/scripts/').detectSupport(renderer);
		const loader = new GLTFLoader();
		loader.setKTX2Loader(ktx2Loader);
		return loader.loadAsync(path).then((gltf) => {
			const group = gltf.scene;
			return new InitScene(canvas, width, height, darkMode, group, renderer, htmlElement);
		});
	}

	restyle(width: number, height: number, darkMode: boolean) {
		if (this.camera) {
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		}

		let tempIntensity = darkMode ? 0.6 : 1;
		if (this.ambientLight && this.ambientLight.intensity !== tempIntensity)
			this.ambientLight.intensity = tempIntensity;

		tempIntensity = darkMode ? 0.4 : 0.6;
		if (this.directionalLight && this.directionalLight.intensity !== tempIntensity)
			this.directionalLight.intensity = tempIntensity;
		if (this.renderer) this.renderer.setSize(width, height, false);
	}
}
