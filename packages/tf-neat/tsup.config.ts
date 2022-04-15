import { Options } from 'tsup';

export default <Options>{
	splitting: true,
	clean: true,
	entryPoints: ['src/*.ts', 'src/**/*.ts'],
	format: ['cjs', 'esm'],
	dts: false
};
