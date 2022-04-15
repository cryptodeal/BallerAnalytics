import type { ModelApi } from './ModelApi';

/* Controller for each individual Model of a given population */
export class Model {
	/* Variable declaration for use w BallerAnalytics */
	public _model: ModelApi;

	constructor(model: ModelApi) {
		this._model = model;
	}
}
