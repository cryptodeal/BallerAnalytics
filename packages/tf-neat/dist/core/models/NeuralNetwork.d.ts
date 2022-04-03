import type { Tensor } from '@tensorflow/tfjs';
export declare class NeuralNetwork {
    input_nodes: number;
    hidden_nodes: number;
    output_nodes: number;
    input_weights: Tensor;
    output_weights: Tensor;
    constructor(input_nodes: any, hidden_nodes: any, output_nodes: any);
    predict(user_input: number[]): any;
    clone(): NeuralNetwork;
    dispose(): void;
    stringify(): string;
    save(key: any): void;
}
