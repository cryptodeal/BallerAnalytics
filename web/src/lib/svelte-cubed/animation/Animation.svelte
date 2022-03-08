<script lang="ts">
	import { AnimationMixer } from 'three';
	import { setup } from '../context';

	import type { AnimationAction, AnimationClip } from 'three';
	export let clip: AnimationClip;
	export let time = 0;
	export let timeScale = 1;
	export let weight = 1;
	const { root, parent } = setup();
	const mixer = new AnimationMixer(parent);
	let action: AnimationAction;
	$: {
		action = mixer.clipAction(clip);
		action.play();
		/* TODO uncache stuff */
	}
	$: {
		action.weight = weight;
		mixer.timeScale = timeScale;
		mixer.setTime(time);
		root.invalidate();
	}
</script>
