import { Element } from './element';

/* Manage all instances of FictionalElement in worker */
export class ElementManager {
	public targets: Map<string, Element>;
	constructor() {
		this.targets = new Map();
	}

	makeElement(id: string): Element {
		const element = new Element();
		this.targets.set(id, element);
		return element;
	}

	getElement(id: string): Element {
		return this.targets.get(id);
	}

	hasElement(id: string): boolean {
		return this.targets.has(id);
	}

	deleteElement(id: string): boolean {
		return this.targets.delete(id);
	}

	clear(): void {
		this.targets.clear();
	}
}
