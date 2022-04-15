import { loadResource } from './core/utils';
import type { AssetLoaderEvent } from './types';

/* declare worker state management & variables */
const ctx: Worker = self as unknown as Worker;

ctx.addEventListener('message', (event: AssetLoaderEvent) => {
	const { paths } = event.data;
	if (Array.isArray(paths)) {
		for (let i = 0; i < paths.length; i++) {
			loadResource(paths[i]).then((data) => {
				ctx.postMessage(data, [data]);
			});
		}
	} else {
		loadResource(paths).then((data) => {
			ctx.postMessage(data, [data]);
		});
	}
});
