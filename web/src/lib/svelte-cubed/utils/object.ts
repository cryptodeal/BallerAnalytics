import type { Object3D } from 'three';
import type { Position, Rotation, Scale } from '../types';

export function transform(object: Object3D, position: Position, rotation: Rotation, scale: Scale) {
	object.position.set(position[0], position[1], position[2]);

	object.rotation.set(rotation[0], rotation[1], rotation[2], rotation[3]);

	if (typeof scale === 'number') {
		object.scale.set(scale, scale, scale);
	} else {
		object.scale.set(scale[0], scale[1], scale[2]);
	}
}
