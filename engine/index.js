import { NetworkEngine } from "./NetworkEngine";
import { SensorsEngine } from "./SensorsEngine";

export class Engine {
    constructor({
        source = 'comote',
        id = 0,
        network = {},
        sensors = {},
    } = {}) {
        this.source = source;
        this.id = id;
        this.network = new NetworkEngine(network);

        const sensorsRequest = { ...sensors };
        if (typeof sensorsRequest.dataCallback === 'undefined') {
            sensorsRequest.dataCallback = (devicemotion) => {
                this.send({ devicemotion });
            }
        }

        this.sensors = new SensorsEngine(sensorsRequest);
    }

    set({
        source,
        id,
        network,
        sensors,
    } = {}) {
        if (typeof source !== 'undefined') {
            this.source = source;
        }

        if (typeof id !== 'undefined') {
            this.id = id;
        }

        if (typeof network !== 'undefined') {
            this.network.set(network);
        }

        if (typeof sensors !== 'undefined') {
            this.sensors.set(sensors);
        }

    }

    cleanup() {
        this.sensors.cleanup();
        this.network.cleanup();
    }

    init() {
        this.sensors.init();
        this.network.init();
    }

    send(message) {
        const { source, id } = this;
        this.network.send({
            source,
            id,
            ...message,
        })
    }
}

// single instance
export const engine = new Engine();

export default Engine;
