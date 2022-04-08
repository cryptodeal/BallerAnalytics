import { tensor, randomNormal, tidy, clone } from '@tensorflow/tfjs';
/*
 *  Basic neural network; inspired by: https://github.com/llSourcell/Modeling_Evolution_with_TensorflowJS/blob/master/Docs/NeuroEvolution_nn.js.html
 *  and https://github.com/dionbeetson/neuroevolution-experiment/blob/master/js/ai/NeuralNetwork.js
 */
export class NeuralNetwork {
    input_nodes;
    hidden_nodes;
    output_nodes;
    input_weights;
    output_weights;
    constructor(input_nodes, hidden_nodes, output_nodes) {
        /* Set # of input nodes used in the NeuralNet */
        this.input_nodes = input_nodes;
        /* Set # of hidden nodes used in the NeuralNet */
        this.hidden_nodes = hidden_nodes;
        /* Set # of output nodes used in the NeuralNet */
        this.output_nodes = output_nodes;
        /* Initialize NeuralNet w random weights */
        this.input_weights = randomNormal([this.input_nodes, this.hidden_nodes]);
        this.output_weights = randomNormal([this.hidden_nodes, this.output_nodes]);
    }
    /* Feeds inputted 1D forward array through network */
    predict(user_input) {
        let output;
        tidy(() => {
            const input_layer = tensor(user_input, [1, this.input_nodes]);
            const hidden_layer = input_layer.matMul(this.input_weights).sigmoid();
            const output_layer = hidden_layer.matMul(this.output_weights).sigmoid();
            output = output_layer.dataSync();
        });
        return output;
    }
    /* Returns a new network with the same weights as original */
    clone() {
        return tidy(() => {
            const cloned = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);
            cloned.dispose();
            cloned.input_weights = clone(this.input_weights);
            cloned.output_weights = clone(this.output_weights);
            return cloned;
        });
    }
    /* Dispose of input & output weights from  memory */
    dispose() {
        this.input_weights.dispose();
        this.output_weights.dispose();
    }
    stringify() {
        const neuralNetJson = {
            input_weights: this.input_weights.arraySync(),
            output_weights: this.output_weights.arraySync()
        };
        return JSON.stringify(neuralNetJson);
    }
    save(key) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, this.stringify());
        }
    }
}
