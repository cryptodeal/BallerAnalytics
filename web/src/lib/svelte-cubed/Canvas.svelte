<script lang="ts">
	import { set_root } from './context';
	import { onDestroy, onMount } from 'svelte';
	import { NoToneMapping, PCFShadowMap, Scene, WebGLRenderer } from 'three';
	import type { Color, FogBase, Material, Plane, Texture, ToneMapping, ShadowMapType } from 'three';
	import type { PrecisionOpts, PowerPrefOpts } from './types';

	export let background: Color | Texture = null;
	export let environment: Texture = null;
	export let fog: FogBase = null;
	export let overrideMaterial: Material = null;
	export let precision: PrecisionOpts = 'highp';
	export let powerPreference: PowerPrefOpts = 'default';
	export let alpha = false;
	export let premultipliedAlpha = true;
	export let antialias = false;
	export let stencil = true;
	export let preserveDrawingBuffer = false;
	export let failIfMajorPerformanceCaveat = false;
	export let depth = true;
	export let logarithmicDepthBuffer = false;
	export let autoClear = true;
	export let autoClearColor = true;
	export let autoClearDepth = true;
	export let autoClearStencil = true;
	export let checkShaderErrors = true;
	// export let gammaFactor = 2;
	export let localClippingEnabled = false;
	export let physicallyCorrectLights = false;
	export let outputEncoding: number = undefined;
	export let clippingPlanes: Plane[] = [];
	export let shadows: boolean | ShadowMapType = undefined;
	export let toneMapping: ToneMapping = NoToneMapping;
	export let toneMappingExposure = 1;
	/** additional props */
	export let width: number = undefined;
	export let height: number = undefined;
	export let pixelRatio = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1;
	/** public methods */
	export function info() {
		const { info, extensions, capabilities } = root.renderer;
		return { info, extensions, capabilities };
	}
	let _width: number;
	let _height: number;
	let container: HTMLElement;
	let frame: number = null;
	const run = (fn: FunctionConstructor) => fn();
	const invalidate = () => {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = null;
			before_render.forEach(run);
			root.renderer.render(root.scene, root.camera.object);
		});
	};
	const before_render: Array<() => void> = [];
	const root = set_root({
		canvas: null,
		scene: null,
		renderer: null,
		camera: {
			object: null,
			callback: () => {
				console.warn('no camera is set');
			},
			set: (camera, callback) => {
				root.camera.object = camera;
				root.camera.callback = callback;
				if (root.controls.callback) {
					root.controls.callback(root.camera.object, root.canvas);
				}
				invalidate();
			}
		},
		controls: {
			object: null,
			callback: null,
			set: (callback) => {
				root.controls.callback = callback;
				if (root.camera.object) {
					root.controls.object = callback(root.camera.object, root.canvas);
				}
			}
		},
		before_render(fn) {
			before_render.push(fn);
			onDestroy(() => {
				const i = before_render.indexOf(fn);
				before_render.splice(i, 1);
			});
		},
		invalidate
	});
	onMount(() => {
		root.renderer = new WebGLRenderer({
			canvas: root.canvas,
			precision,
			powerPreference,
			alpha,
			premultipliedAlpha,
			antialias,
			stencil,
			preserveDrawingBuffer,
			failIfMajorPerformanceCaveat,
			depth,
			logarithmicDepthBuffer
		});
		root.scene = new Scene();
		resize();
		return () => {
			console.log('disposing of renderer');
			root.renderer.forceContextLoss();
			root.renderer.dispose();
		};
	});
	const resize = () => {
		if (width === undefined) {
			_width = container.clientWidth / pixelRatio;
		}
		if (height === undefined) {
			_height = container.clientHeight / pixelRatio;
		}
	};
	$: if (root.scene) {
		root.scene.background = background;
		root.scene.environment = environment;
		root.scene.fog = fog;
		root.scene.overrideMaterial = overrideMaterial;
	}
	$: if (root.renderer) {
		root.renderer.autoClear = autoClear;
		root.renderer.autoClearColor = autoClearColor;
		root.renderer.autoClearDepth = autoClearDepth;
		root.renderer.autoClearStencil = autoClearStencil;
		root.renderer.debug.checkShaderErrors = checkShaderErrors;
		// root.renderer.gammaFactor = gammaFactor;
		root.renderer.localClippingEnabled = localClippingEnabled;
		root.renderer.physicallyCorrectLights = physicallyCorrectLights;
		if (outputEncoding != null) root.renderer.outputEncoding = outputEncoding;
		root.renderer.clippingPlanes = clippingPlanes;
		root.renderer.toneMapping = toneMapping;
		root.renderer.toneMappingExposure = toneMappingExposure;
		if (shadows) {
			root.renderer.shadowMap.enabled = true;
			/* TODO allow some way to control this? */
			root.renderer.shadowMap.autoUpdate = true;
			root.renderer.shadowMap.type = shadows === true ? PCFShadowMap : shadows;
		} else {
			root.renderer.shadowMap.enabled = false;
		}
		invalidate();
	}
	$: if (root.renderer) {
		const w = width !== undefined ? width : _width;
		const h = height !== undefined ? height : _height;
		root.renderer.setSize(w, h, false);
		root.camera.callback(w, h);
		root.renderer.setPixelRatio(pixelRatio);
		invalidate();
	}
</script>

<svelte:window on:resize={resize} />
<div class="container" bind:this={container}>
	<canvas bind:this={root.canvas} />

	{#if root.scene}
		<slot />
	{/if}
</div>

<style>
	.container,
	canvas {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}
</style>
