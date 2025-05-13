import { getNetworkStateAsync } from 'expo-network';

// react-native URL is incomplete
import isURL from 'validator/es/lib/isURL';
import urlParse from 'url-parse';

import dgram from 'react-native-udp';

import OSC from 'osc-js';

import { format } from '@ircam/sc-motion';

import { apiStringToVersion } from '../helpers/api';

function frequencyToInterval(frequency) {
    if(frequency) {
        return 1000 / frequency;
    } else {
        return 0;
    }
}

const { accelerometerGyroscopeToDevicemotion } = format;
export class NetworkEngine {
    constructor({
        webSocketReadyStateCallback = null,
        oscReadyStateCallback = null,
    } = {}) {
        this.webSocket = null;
        this.webSocketUrl = null;
        this.webSocketEnabled = false;
        this.webSocketReadyStateCallback = webSocketReadyStateCallback;
        this.webSocketReadyStateSet('CLOSED');
        this.webSocketUpdateId = null;
        this.webSocketEventListeners = [];

        this.osc = null;
        this.oscUrl = null;
        this.oscHostname = null;
        this.oscPort = null;

        this.oscEnabled = false;
        this.oscReadyStateCallback = oscReadyStateCallback;
        this.oscReadyStateSet('CLOSED');
        this.oscUpdateId = null;

        this.outputApi = 'v3';
    }

    async set(attributes) {
        Object.assign(this, attributes);
        await this.init();
    }

    async cleanup() {
        await this.webSocketClose();
        await this.oscClose();
    }

    async init() {
        await this.webSocketUpdate();
        await this.oscUpdate();
    }

    async webSocketClose(webSocket = this.webSocket) {
        clearTimeout(this.webSocketUpdateId);
        if (webSocket) {
            this.webSocketEventListeners.forEach(({ socket, state, callback }) => {
                socket.removeEventListener(state, callback);
            });

            if (webSocket.readyState === webSocket.OPEN
                || webSocket.readyState === webSocket.CONNECTING) {
                await new Promise((resolve, reject) => {
                    const resolveOnClose = () => {
                        webSocket.removeEventListener('close', resolveOnClose);
                        resolve();
                    };
                    webSocket.addEventListener('close', resolveOnClose);
                    webSocket.close();
                });
            }
        }

        this.webSocketEventListeners = [];
        this.webSocket = null;
        this.webSocketReadyStateUpdate();
    }

    async webSocketUpdate() {
        clearTimeout(this.webSocketUpdateId);

        const networkState = await getNetworkStateAsync();
        if(networkState.isConnected === false) {
            this.webSocketUpdateId = setTimeout(() => this.webSocketUpdate(), 1000);
            return;
        }

        if (!this.webSocketEnabled || !this.webSocketUrl) {
            clearTimeout(this.webSocketUpdateId);
            await this.webSocketClose();
            return;
        }

        // validate URL before creating socket,
        // because (native) error is not caught and will crash application
        const urlValidated = isURL(this.webSocketUrl, {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: ['ws', 'wss'],
            require_host: true,
        });

        if (!urlValidated) {
            clearTimeout(this.webSocketUpdateId);
            await this.webSocketClose();
            return;
        }

        // warning: (native) error is not caught and will crash application
        try {
            clearTimeout(this.webSocketUpdateId);
            await this.webSocketClose();

            this.webSocket = new WebSocket(this.webSocketUrl);

            // 'error' triggers 'close' later: no need to double callback
            ['open', 'close'].forEach((state) => {
                const callback = async () => {

                    // clear time-out in any case
                    clearTimeout(this.webSocketUpdateId);
                    this.webSocketReadyStateUpdate();

                    // 'error' triggers 'close' later: no need to double callback
                    if (state === 'close') {
                        // try again later
                        clearTimeout(this.webSocketUpdateId);
                        await this.webSocketClose();
                        this.webSocketUpdateId = setTimeout(() => this.webSocketUpdate(), 1000);
                    }
                };

                this.webSocket.addEventListener(state, callback);

                this.webSocketEventListeners.push({
                    socket: this.webSocket,
                    state,
                    callback,
                });
            });

        } catch (error) {
            console.error(`Error while creating webSocket with url '${this.webSocketUrl}'`);
            console.error(error.message);

            // try again later
            clearTimeout(this.webSocketUpdateId);
            await this.webSocketClose();
            this.webSocketUpdateId = setTimeout(() => this.webSocketUpdate(), 1000);
        }

        this.webSocketReadyStateUpdate();
    };

    webSocketReadyStateSet(state) {
        this.webSocketReadyState = state;
        if (typeof this.webSocketReadyStateCallback === 'function') {
            this.webSocketReadyStateCallback(this.webSocketReadyState);
        }
    }

    webSocketReadyStateUpdate() {
        let state;

        if (!this.webSocket) {
            state = 'CLOSED';
        } else {
            switch (this.webSocket.readyState) {
                case WebSocket.CONNECTING:
                    state = 'CONNECTING';
                    break;

                case WebSocket.OPEN:
                    state = 'OPEN';
                    break;

                case WebSocket.CLOSING:
                    state = 'CLOSING';
                    break;

                default:
                case WebSocket.CLOSED:
                    state = 'CLOSED';
                    break;
            }
        }
        this.webSocketReadyStateSet(state);
    }

    async oscClose() {
        clearTimeout(this.oscUpdateId);

        if (this.osc && this.oscReadyState === 'OPEN') {
            await new Promise( (resolve, reject) => {
                this.osc.close(() => {
                    resolve();
                });
            });
        }
        this.osc = null;
        this.oscReadyStateSet('CLOSED');
    }

    async oscUpdate() {
        clearTimeout(this.oscUpdateId);

        const networkState = await getNetworkStateAsync();
        if(networkState.isConnected === false) {
            this.oscUpdateId = setTimeout(() => this.oscUpdate(), 1000);
            return;
        }

        if (!this.oscEnabled || !this.oscUrl) {
            clearTimeout(this.oscUpdateId);
            await this.oscClose();
            return;
        }

        // validate URL before creating socket,
        // because (native) error is not caught and will crash application
        const urlValidated = isURL(this.oscUrl, {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: ['udp'],
            require_host: true,
            require_port: true,
        });

        if (!urlValidated) {
            clearTimeout(this.oscUpdateId);
            await this.oscClose();
            return;
        }

        // these are the remote informations
        const { hostname, port } = urlParse(this.oscUrl);

        if (!hostname || !port) {
            clearTimeout(this.oscUpdateId);
            await this.oscClose();
            return;
        }

        this.oscHostname = hostname;
        this.oscPort = parseInt(port, 10);

        // warning: (native) error is not catch and will crash application
        try {
            clearTimeout(this.oscUpdateId);
            await this.oscClose();

            this.oscReadyStateSet('OPENING');

            const socket = dgram.createSocket({
                type: 'udp4',
            });

            // dynamically find available port
            const localPort = 0;
            socket.bind(localPort);

            socket.once('listening', () => {
                clearTimeout(this.oscUpdateId);
                // Bug in react-native-udp: On Android, it is no longer possible
                //   to close or open a socket after that
                // socket.setBroadcast(true);
                this.osc = socket;
                this.oscReadyStateSet('OPEN');
            });

            socket.on('error', async (error) => {
                switch (error.key) {
                    case 'setBroadcast':
                        // Bug in react-native-udp@4.1.7:
                        //  try to set broadcast key on closed socket
                        break;

                    default:
                        console.error('OSC error:', error.message, error);
                        break;
                }

                // try again later
                clearTimeout(this.oscUpdateId);
                await this.oscClose();
                this.oscUpdateId = setTimeout(() => this.oscUpdate(), 1000);
            });

            socket.on('close', async () => {
                // try again later
                clearTimeout(this.oscUpdateId);
                await this.oscClose();
                this.oscUpdateId = setTimeout(() => this.oscUpdate(), 1000);
            });
        } catch (error) {
            console.error(`Error while creating udp socket:`, error.message);
            // try again later
            clearTimeout(this.oscUpdateId);
            await this.oscClose();
            this.oscUpdateId = setTimeout(() => this.oscUpdate(), 1000);
        }
    }

    oscReadyStateSet(state) {
        this.oscReadyState = state;
        if (typeof this.oscReadyStateCallback === 'function') {
            this.oscReadyStateCallback(this.oscReadyState);
        }
    }

    oscSend(message, port, hostname, errorCallback) {
        // be sure to release main loop between sends, to avoid blockage
        Promise.resolve().then(() => {

            if (!this.oscEnabled
                || !this.osc
                || this.oscReadyState !== 'OPEN') {
                return;
            }

            const binary = message.pack();
            this.osc.send(binary, 0, binary.byteLength, port, hostname, (error) => {
                if (typeof errorCallback === 'function') {
                    errorCallback(error);
                }
            });

        });
    }

    oscMessageAddTimestamp(message, timestamp) {
        message.add(timestamp);
        // we should use double type but
        //   - Bundle does not accept TypedMessages
        //   - changing messages.types crashes the application
    }

    send(data) {
        if (!data || !this.outputApi) {
            return;
        }

        const outputApiVersion = apiStringToVersion(this.outputApi);
        console.log('outputApiVersion', outputApiVersion);
        if(!outputApiVersion) {
            console.error(`Invalid outputApi: ${this.outputApi}`);
            return;
        }

        if (outputApiVersion < 3) {
            // WebSocket format is a direct mapping of the data
            // It should be compatible with v2 and v3 format, with extra fields

            // already in v2 format: add interval
            [
                'heading',
                'magnetometer',
            ].forEach((sensor) => {
                if (data[sensor]) {
                    const { frequency } = data[sensor];
                    const interval = frequencyToInterval(frequency);
                    Object.assign(data[sensor], { interval });
                }
            });

            const { accelerometer, gyroscope } = data;
            if (accelerometer || gyroscope) {
                const devicemotion = accelerometerGyroscopeToDevicemotion({
                    accelerometer,
                    gyroscope,
                });

                const { frequency } = (accelerometer ? accelerometer : gyroscope);
                const interval = frequencyToInterval(frequency);
                Object.assign(devicemotion, { interval });

                Object.assign(data, { devicemotion });
            }

        }

        if (this.webSocketEnabled && this.webSocket
            && this.webSocketReadyState === 'OPEN'
            && this.webSocket.readyState === this.webSocket.OPEN) {
            const dataSerialised = JSON.stringify(data);
            this.webSocket.send(dataSerialised);
        }

        if (this.oscEnabled && this.osc
            && this.oscReadyState === 'OPEN'
            && this.oscUrl) {

            const hostname = this.oscHostname;
            const port = this.oscPort;
            const messages = [];

            // no data.api before v3
            const oscPrefix = (outputApiVersion < 3
              ? `/${data.source}/${data.id}`
              : `/${data.source}/${data.api}/${data.id}`
            );

            // since v3
            const { accelerometer } = data;
            if (accelerometer && outputApiVersion >= 3) {
                const address = `${oscPrefix}/accelerometer`;
                const { x, y, z, timestamp, frequency } = accelerometer;
                const message = new OSC.Message(address, x, y, z);
                this.oscMessageAddTimestamp(message, timestamp);
                message.add(frequency);
                messages.push(message);
            }

            // since v3
            const { gyroscope } = data;
            if (gyroscope && outputApiVersion >= 3) {
                const address = `${oscPrefix}/gyroscope`;
                const { x, y, z, timestamp, frequency } = gyroscope;
                const message = new OSC.Message(address, x, y, z);
                this.oscMessageAddTimestamp(message, timestamp);
                message.add(frequency);
                messages.push(message);
            }

            // until v2
            const { devicemotion } = data;
            if (devicemotion && outputApiVersion < 3) {
                const address = `${oscPrefix}/devicemotion`;
                const {
                    interval, // v2 format
                    accelerationIncludingGravity = { x: 0, y: 0, z: 0 },
                    rotationRate = { alpha: 0, beta: 0, gamma: 0 },
                } = devicemotion;
                const { x, y, z } = accelerationIncludingGravity;
                const { alpha, beta, gamma } = rotationRate;

                const message = new OSC.Message(
                    address,
                    interval,
                    x, y, z,
                    alpha, beta, gamma,
                );

                messages.push(message);
            }

            // since v3
            const { gravity } = data;
            if (gravity && outputApiVersion >= 3) {
                const address = `${oscPrefix}/gravity`;
                const { x, y, z, timestamp, frequency } = gravity;
                const message = new OSC.Message(address, x, y, z);
                this.oscMessageAddTimestamp(message, timestamp);
                message.add(frequency);
                messages.push(message);
            }

            // since v2
            const { magnetometer } = data;
            if (magnetometer) {
                let message;
                const address = `${oscPrefix}/magnetometer`;
                const { interval, x, y, z, timestamp, frequency } = magnetometer;
                if (outputApiVersion < 3) {
                    message = new OSC.Message(address, interval, x, y, z);
                } else {
                    message = new OSC.Message(address, x, y, z);
                    this.oscMessageAddTimestamp(message, timestamp);
                    message.add(frequency);
                }
                messages.push(message);
            }

            // since v2
            const { heading } = data;
            if (heading) {
                let message;
                const address = `${oscPrefix}/heading`;
                const {
                    interval,
                    magnetic,
                    geographic,
                    accuracy,
                    timestamp,
                    frequency,
                 } = heading;

                if (outputApiVersion < 3) {
                    message = new OSC.Message(address, interval, magnetic, geographic, accuracy);
                } else {
                    message = new OSC.Message(address, magnetic, geographic, accuracy);
                    this.oscMessageAddTimestamp(message, timestamp);
                    message.add(frequency);
                }
                messages.push(message);
            }

            // since v2
            const { control } = data;
            if (control) {
                const { timestamp } = control;

                for (let name in control) {
                    if (name === 'timestamp') {
                        continue;
                    }
                    const address = `${oscPrefix}/control/${name}`;

                    let value = control[name];
                    // use OSC simple integer type 'i' for boolean
                    if (typeof value === 'boolean') {
                        value = value ? 1 : 0;
                    }
                    const message = new OSC.Message(address, value);

                    if (outputApiVersion < 3) {
                        this.oscMessageAddTimestamp(message, timestamp);
                    }
                    messages.push(message);
                }
            }

            if (messages.length === 1) {
                this.oscSend(messages[0], port, hostname, (err) => {
                    if (err) { return console.error(err); }
                });
            } else if (messages.length > 1) {
                try {
                    const bundle = new OSC.Bundle(messages);
                    bundle.timetag.value.timestamp(data.timestamp);
                    this.oscSend(bundle, port, hostname, (err) => {
                        if (err) { return console.error(err); }
                    });
                }
                catch (e) {
                    console.error(e);
                }

            }

        }
    }

}
export default NetworkEngine;
