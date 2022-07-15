import { Scene, WebGLRenderer, PerspectiveCamera, DirectionalLight, AmbientLight } from 'three';
import type { Group } from 'three';
import type { ElementProxyReceiver } from '../proxy/elementReceiver';
import basketball from '$models/test.glb?url';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

interface initData {
	canvas: OffscreenCanvas;
	inputElement: HTMLElement;
	pixelRatio: number;
	darkMode: boolean;
}

export function init(data: initData) {
	let group: Group;
	const { canvas, inputElement, pixelRatio, darkMode } = data;

	const renderer = new WebGLRenderer({
		antialias: true,
		canvas: canvas,
		alpha: true,
		powerPreference: 'high-performance'
	});
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
	controls.update();

	const scene = new Scene();
	scene.background = null;

	const ambientLight = new AmbientLight(0xffffff, darkMode ? 0.6 : 1);
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

	function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
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
		const { darkMode } = inputElement as unknown as ElementProxyReceiver;
		let tempIntensity = darkMode ? 0.6 : 1;
		if (ambientLight.intensity !== tempIntensity) ambientLight.intensity = tempIntensity;

		tempIntensity = darkMode ? 0.4 : 0.6;
		if (directionalLight.intensity !== tempIntensity) directionalLight.intensity = tempIntensity;

		if (resizeRendererToDisplaySize(renderer)) {
			camera.aspect = inputElement.clientWidth / inputElement.clientHeight;
			camera.updateProjectionMatrix();
		}
		controls.update();

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);

	function getCanvasRelativePosition(event: any) {
		const rect = inputElement.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	function setPickPosition(event: TouchEvent | MouseEvent) {
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
		(event: any) => {
			// prevent the window from scrolling
			event.preventDefault();
			setPickPosition(event.touches[0]);
		},
		{ capture: true, passive: false }
	);

	inputElement.addEventListener(
		'touchmove',
		(event: any) => {
			setPickPosition(event.touches[0]);
		},
		{ capture: true, passive: false }
	);

	inputElement.addEventListener('touchend', clearPickPosition, { capture: true, passive: false });
}
