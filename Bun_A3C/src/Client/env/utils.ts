export const genStepArray = (max: number, step: number) => {
	const stepArray = [];
	for (let i = 0; i < max; i += step) {
		stepArray.push([i, i + step]);
	}
	return stepArray;
};
