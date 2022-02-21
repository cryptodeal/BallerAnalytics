export class PolyfillOffscreenCanvas {
	public canvas;
	constructor(width, height, canvas) {
		this.canvas = canvas;
		this.canvas.width = width;
		this.canvas.height = height;

		this.canvas.convertToBlob = () => {
			return new Promise((resolve) => {
				this.canvas.toBlob(resolve);
			});
		};

		return this.canvas;
	}
}
