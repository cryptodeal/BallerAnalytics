/**
 * Equivalent of Python's AttributeError.
 */
export class AttributeError extends Error {
	constructor(message?: string) {
		super(message);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, AttributeError.prototype);
	}
}

/**
 * Equivalent of Python's RuntimeError.
 */
export class RuntimeError extends Error {
	constructor(message?: string) {
		super(message);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, RuntimeError.prototype);
	}
}

/**
 * Equivalent of Python's ValueError.
 */
export class ValueError extends Error {
	constructor(message?: string) {
		super(message);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, ValueError.prototype);
	}
}

/**
 * Equivalent of Python's NotImplementedError.
 */
export class NotImplementedError extends Error {
	constructor(message?: string) {
		super(message);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, NotImplementedError.prototype);
	}
}

/**
 * Equivalent of Python's AssertionError.
 */
export class AssertionError extends Error {
	constructor(message?: string) {
		super(message);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, AssertionError.prototype);
	}
}

/**
 * Equivalent of Python's IndexError.
 */
export class IndexError extends Error {
	constructor(message?: string) {
		super(message);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, IndexError.prototype);
	}
}
