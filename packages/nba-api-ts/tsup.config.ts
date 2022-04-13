import { Options } from 'tsup';

export default <Options>{
	splitting: true,
	clean: true,
	entryPoints: ['src/*.ts', 'src/**/*.ts'],
  external: ['@napi-rs/*',' @napi-rs/pinyin-darwin-arm64'],
	format: ['cjs', 'esm'],
	dts: true,
	onSuccess: 'npm run build:fix'
};
