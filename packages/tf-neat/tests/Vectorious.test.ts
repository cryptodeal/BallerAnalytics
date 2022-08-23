import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { array, matrix, type NDArray } from 'vectorious';

let adjList: NDArray, reverseAdjList: NDArray;

const MatrixTest = suite('MatrixTest');

MatrixTest('create Matrix', () => {
	const mat = matrix(100, 100);
	for (let i = 0; i < 100; i++) {
		for (let j = 0; j < 100; j++) {
			mat.set(i, j, i + j);
			assert.equal(mat.get(i, j), i + j);
		}
	}
});

// MatrixTest.run();

const ArrayTest = suite('ArrayTest');

ArrayTest('create Array; set values in resulting matrix', () => {
	const size = 10000;
	const tempAdj = array();
	const tempReverse = array();
	for (let i = 0; i < size; i++) {
		tempAdj.push(i);
		tempReverse.push(i);
	}
	adjList = tempAdj.reshape(size, 1);
	reverseAdjList = tempReverse.reshape(size, 1);

	const tempAdj2 = array();
	const tempReverse2 = array();
	for (let i = 0; i < size; i++) {
		tempAdj2.push(i);
		tempReverse2.push(i);
	}
	adjList.augment(tempAdj2.reshape(size, 1));
	reverseAdjList.augment(tempReverse2.reshape(size, 1));
});

// ArrayTest.run();
