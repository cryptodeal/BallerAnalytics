import { Options } from 'tsup';

export default <Options>{
	splitting: true,
	clean: true,
  external: ['@napi-rs/*',' @napi-rs/pinyin-darwin-arm64'],
	entryPoints: ['src/*.ts', 'src/**/*.ts'],
	format: ['cjs', 'esm'],
	dts: true,
};
