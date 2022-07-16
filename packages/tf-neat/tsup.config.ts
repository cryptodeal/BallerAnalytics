import { Options } from 'tsup';

export default <Options>{
	splitting: true,
	target: 'node16',
	clean: true,
	entryPoints: ['src/*.ts', 'src/**/*.ts'],
	format: ['cjs', 'esm'],
	dts: true
};
