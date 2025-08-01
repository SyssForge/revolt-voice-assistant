// public/audio-processor.js

class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];
        
        if (input.length > 0) {
            for (let channel = 0; channel < output.length; channel++) {
                output[channel].set(input[channel]);
            }
        }
        
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);