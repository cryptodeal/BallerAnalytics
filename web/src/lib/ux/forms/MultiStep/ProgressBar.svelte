<script lang="ts">
	export let steps = [],
		currentActive = 1;
	let circles, progress;

	export const handleProgress = (stepIncrement: number): void => {
		circles = document.querySelectorAll('.circle');
		if (stepIncrement == 1) {
			currentActive++;

			if (currentActive > circles.length) {
				currentActive = circles.length;
			}
		} else {
			currentActive--;

			if (currentActive < 1) {
				currentActive = 1;
			}
		}

		update();
	};

	function update() {
		circles.forEach((circle, idx) => {
			if (idx < currentActive) {
				circle.classList.add('active');
			} else {
				circle.classList.remove('active');
			}
		});

		const actives = document.querySelectorAll('.active');

		progress.style.width = ((actives.length - 1) / (circles.length - 1)) * 100 + '%';
	}
</script>

<div class="progress-container" bind:this={circles}>
	<div class="progress" bind:this={progress} />
	{#each steps as step, i}
		<div class="circle {i == 0 ? 'active' : ''}" data-title={step}>{i + 1}</div>
	{/each}
</div>
