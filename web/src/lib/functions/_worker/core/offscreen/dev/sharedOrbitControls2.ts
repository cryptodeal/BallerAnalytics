import {
	Group,
	AmbientLight,
	Raycaster,
	BoxGeometry,
	MeshPhongMaterial,
	Scene,
	WebGLRenderer,
	PerspectiveCamera,
	DirectionalLight,
	Mesh
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export function init(data: {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	inputElement: HTMLElement;
}) {
	const { canvas, inputElement } = data;
	console.log(canvas);
	const renderer = new WebGLRenderer({ canvas });

	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 4;

	const controls = new OrbitControls(camera, inputElement);
	controls.target.set(0, 0, 0);
	controls.update();

	const scene = new Scene();

	{
		const color = 0xffffff;
		const intensity = 1;
		const light = new DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		scene.add(light);
	}

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new BoxGeometry(boxWidth, boxHeight, boxDepth);

	function makeInstance(geometry, color, x) {
		const material = new MeshPhongMaterial({
			color
		});

		const cube = new Mesh(geometry, material);
		scene.add(cube);

		cube.position.x = x;

		return cube;
	}

	const cubes = [
		makeInstance(geometry, 0x44aa88, 0),
		makeInstance(geometry, 0x8844aa, -2),
		makeInstance(geometry, 0xaa8844, 2)
	];

	class PickHelper {
		public raycaster: Raycaster;
		public pickedObject;
		public pickedObjectSavedColor: number | string;

		constructor() {
			this.raycaster = new Raycaster();
			this.pickedObject = null;
			this.pickedObjectSavedColor = 0;
		}
		pick(
			normalizedPosition: {
				x: number;
				y: number;
			},
			scene: Scene,
			camera: PerspectiveCamera,
			time: number
		) {
			// restore the color if there is a picked object
			if (this.pickedObject) {
				this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
				this.pickedObject = undefined;
			}

			// cast a ray through the frustum
			this.raycaster.setFromCamera(normalizedPosition, camera);
			// get the list of objects the ray intersected
			const intersectedObjects = this.raycaster.intersectObjects(scene.children);
			if (intersectedObjects.length) {
				// pick the first object. It's the closest one
				this.pickedObject = intersectedObjects[0].object;
				// save its color
				this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
				// set its emissive color to flashing red/yellow
				this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xffff00 : 0xff0000);
			}
		}
	}

	const pickPosition = { x: -2, y: -2 };
	const pickHelper = new PickHelper();
	clearPickPosition();

	function resizeRendererToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		const width = inputElement.clientWidth;
		const height = inputElement.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	function render(time: number) {
		time *= 0.001;

		if (resizeRendererToDisplaySize(renderer)) {
			camera.aspect = inputElement.clientWidth / inputElement.clientHeight;
			camera.updateProjectionMatrix();
		}

		cubes.forEach((cube, ndx) => {
			const speed = 1 + ndx * 0.1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;
		});

		pickHelper.pick(pickPosition, scene, camera, time);

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);

	function getCanvasRelativePosition(event) {
		const rect = inputElement.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	function setPickPosition(event) {
		const pos = getCanvasRelativePosition(event);
		pickPosition.x = (pos.x / inputElement.clientWidth) * 2 - 1;
		pickPosition.y = (pos.y / inputElement.clientHeight) * -2 + 1; // note we flip Y
	}

	function clearPickPosition() {
		// unlike the mouse which always has a position
		// if the user stops touching the screen we want
		// to stop picking. For now we just pick a value
		// unlikely to pick something
		pickPosition.x = -100000;
		pickPosition.y = -100000;
	}

	inputElement.addEventListener('mousemove', setPickPosition);
	inputElement.addEventListener('mouseout', clearPickPosition);
	inputElement.addEventListener('mouseleave', clearPickPosition);

	inputElement.addEventListener(
		'touchstart',
		(event) => {
			// prevent the window from scrolling
			event.preventDefault();
			setPickPosition(event.touches[0]);
		},
		{ passive: false }
	);

	inputElement.addEventListener('touchmove', (event) => {
		setPickPosition(event.touches[0]);
	});

	inputElement.addEventListener('touchend', clearPickPosition);
}

export class InitScene {
	public renderer: WebGLRenderer;
	public camera: PerspectiveCamera;
	public scene: Scene;
	public group: Group;
	public ambientLight: AmbientLight;
	public directionalLight: DirectionalLight;
	public animate;
	public canvas: HTMLCanvasElement | OffscreenCanvas;
	public inputElement: HTMLElement;

	constructor(
		canvas: HTMLCanvasElement | OffscreenCanvas,
		inputElement: HTMLElement,
		renderer: WebGLRenderer,
		group: Group,
		darkMode: boolean
	) {
		this.renderer = renderer;
		this.inputElement = inputElement;
		this.canvas = canvas;
		this.scene = new Scene();
		this.scene.background = null;
		this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 2000);
		this.camera.zoom = 1;
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.camera.position.z = 3;
		const controls = new OrbitControls(this.camera, this.inputElement);
		controls.enableZoom = false;
		controls.listenToKeyEvents(this.inputElement);
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
		inputElement: HTMLElement,
		darkMode: boolean,
		path: string
	) {
		const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
		const ktx2Loader = new KTX2Loader().setTranscoderPath('/scripts/').detectSupport(renderer);
		const loader = new GLTFLoader();
		loader.setKTX2Loader(ktx2Loader);
		return loader.loadAsync(path).then((gltf) => {
			const group = gltf.scene;
			return new InitScene(canvas, inputElement, renderer, group, darkMode);
		});
	}

	restyle(width, height, darkMode) {
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
