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
            sensorsRequest.dataCallback = (data) => {
                this.send(data);
            }
        }

        this.sensors = new SensorsEngine(sensorsRequest);
    }

    async set({
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
            await this.network.set(network);
        }

        if (typeof sensors !== 'undefined') {
            await this.sensors.set(sensors);
        }

    }

    async cleanup() {
        await this.sensors.cleanup();
        await this.network.cleanup();
    }

    async init() {
        await this.network.init();
        await this.sensors.init();
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
// must init on EngineComponent mount
// (no top-level await in react)
export const engine = new Engine();

export default Engine;
