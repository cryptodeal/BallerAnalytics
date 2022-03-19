import { Scene, WebGLRenderer, PerspectiveCamera, DirectionalLight, AmbientLight } from 'three';
import basketball from '$models/test.glb?url';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export function init(data: {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	inputElement: HTMLElement;
	pixelRatio: number;
}) {
	let group;
	const { canvas, inputElement, pixelRatio } = data;

	const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(canvas.width, canvas.height, false);
	const camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 2000);
	camera.zoom = 1;
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 3;

	const controls = new OrbitControls(camera, inputElement);
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.listenToKeyEvents(inputElement);
	controls.update();

	const scene = new Scene();
	scene.background = null;

	const ambientLight = new AmbientLight(0xffffff, 0.75);
	scene.add(ambientLight);
	const directionalLight = new DirectionalLight(0xffffff, 0.5);
	directionalLight.position.x = -1;
	directionalLight.position.y = 3;
	directionalLight.position.z = 2;
	scene.add(directionalLight);

	const ktx2Loader = new KTX2Loader().setTranscoderPath('/scripts/').detectSupport(renderer);
	const loader = new GLTFLoader();
	loader.setKTX2Loader(ktx2Loader);
	loader.load(basketball, function (gltf) {
		group = gltf.scene;
		group.rotation.x = 0.025;
		group.rotation.z = 0.025;
		scene.add(group);
	});

	const pickPosition = { x: -2, y: -2 };
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

	function render() {
		if (group) group.rotation.y = -new Date() / 900;

		if (resizeRendererToDisplaySize(renderer)) {
			camera.aspect = inputElement.clientWidth / inputElement.clientHeight;
			camera.updateProjectionMatrix();
		}
		controls.update();

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

	inputElement.addEventListener('mousemove', setPickPosition, { capture: true, passive: false });
	inputElement.addEventListener('mouseout', clearPickPosition, { capture: true, passive: false });
	inputElement.addEventListener('mouseleave', clearPickPosition, { capture: true, passive: false });

	inputElement.addEventListener(
		'touchstart',
		(event) => {
			// prevent the window from scrolling
			event.preventDefault();
			setPickPosition(event.touches[0]);
		},
		{ capture: true, passive: false }
	);

	inputElement.addEventListener(
		'touchmove',
		(event) => {
			setPickPosition(event.touches[0]);
		},
		{ capture: true, passive: false }
	);

	inputElement.addEventListener('touchend', clearPickPosition, { capture: true, passive: false });
}
