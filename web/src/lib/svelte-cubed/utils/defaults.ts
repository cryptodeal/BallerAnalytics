import { BufferGeometry, MeshNormalMaterial } from 'three';
import type { Material } from 'three';
import type { Position, Rotation, Scale } from '../types';

export const position: Position = [0, 0, 0];

export const rotation: Rotation = [0, 0, 0];

export const scale: Scale = [1, 1, 1];

export const geometry: BufferGeometry = new BufferGeometry();

export const material: Material = new MeshNormalMaterial();
