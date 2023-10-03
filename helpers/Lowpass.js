import {hertzToNormalised} from './conversion.js';

export class Lowpass {
  constructor({
    sampleRate = 2, // in Hertz, or 2 for normalised frequency
    lowpassFrequency = 0.5, // in Hertz if sampleRate is defined, or normalised
  } = {}) {
    this.sampleRate = sampleRate,
    this.lowpassFrequency = lowpassFrequency;

    this.init();
  }

  set(attributes) {
    Object.assign(this, attributes);
    this.init();
  }

  init() {
    this.inputScale = Math.max(0,
                               Math.min(1,
                                        hertzToNormalised(this.lowpassFrequency, {
                                          sampleRate: this.sampleRate,
                                        }) ) );
    this.feedbackScale = 1 - this.inputScale;
  }

  process(inputValue) {
    if(typeof this.outputValueLast === 'undefined') {
      this.outputValueLast = inputValue;
    }

    const {inputScale, feedbackScale} = this;
    // be sure to recompute feedback now with last output value
    // for smooth transition of frequency change
    const feedback = this.outputValueLast * feedbackScale;

    const outputValue = inputValue * inputScale + feedback;
    this.outputValueLast = outputValue;
    return outputValue;
  }

  reset() {
    this.outputValueLast = undefined;
  }
}
export default Lowpass;

