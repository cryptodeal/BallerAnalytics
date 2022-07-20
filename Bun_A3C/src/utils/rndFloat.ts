import { dlopen, suffix } from 'bun:ffi';

const {
	symbols: { rndFloat }
} = dlopen(import.meta.dir + `/librndFloat.${suffix}`, {
	rndFloat: {
		args: [],
		returns: 'f64'
	}
});

export { rndFloat };
