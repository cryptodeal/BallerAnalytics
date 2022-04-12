import { Options } from 'tsup';

export default <Options>{
	splitting: true,
	clean: true,
	entryPoints: ['src/*.ts', 'src/**/*.ts'],
  external: ['@napi-rs/*'],
	format: ['cjs', 'esm'],
	dts: true,
	onSuccess: 'npm run build:fix'
};
