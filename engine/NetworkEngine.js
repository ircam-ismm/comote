import { getNetworkStateAsync } from 'expo-network';

// react-native URL is incomplete
import isURL from 'validator/es/lib/isURL';
import urlParse from 'url-parse';

import dgram from 'react-native-udp';

import OSC from 'osc-js';

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

        this.init();
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
        // because (native) error is not catched and will crash application
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

        // warning: (native) error is not catched and will crash application
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
        // because (native) error is not catched and will crash application
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

        // warning: (native) error is not catched and will crash application
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

    // @TODO - refactor, we probably can do better can do better than packing and
    // unpacking everything here
    send(data) {

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

            for (let key in data) {
                switch (key) {
                    case 'devicemotion': {
                        const address = `/${data.source}/${data.id}/${key}`;

                        const {
                            interval,
                            accelerationIncludingGravity,
                            rotationRate,
                        } = data[key];

                        // We need at least the accelerometer to work
                        if (!accelerationIncludingGravity) {
                            return;
                        }

                        const { x, y, z } = accelerationIncludingGravity;

                        // Keep same message format in case gyroscope is not available
                        const { alpha, beta, gamma } = rotationRate || {
                            alpha: 0,
                            beta: 0,
                            gamma: 0,
                        };
                        const values = [
                            interval,
                            x, y, z,
                            alpha, beta, gamma,
                        ];
                        const devicemotionMessage = new OSC.Message(address, ...values);

                        /////// optional sensors
                        let isBundle = false;
                        const messages = [devicemotionMessage];

                        const heading = data.heading;
                        if (heading) {
                            isBundle = true;
                            const address = `/${data.source}/${data.id}/heading`;
                            const {interval, accuracy, magneticHeading, trueHeading } = heading;
                            const values = [
                                interval,
                                accuracy,
                                magneticHeading,
                                trueHeading,
                            ];
                            const headingMessage = new OSC.Message(address, ...values);
                            messages.push(headingMessage);
                        }

                        const magnetometer = data.magnetometer;
                        if (magnetometer) {
                            isBundle = true;
                            const address = `/${data.source}/${data.id}/magnetometer`;
                            const {x, y, z} = magnetometer;
                            const values = [
                                interval,
                                x, y, z,
                            ];
                            const magnetometerMessage = new OSC.Message(address, ...values);
                            messages.push(magnetometerMessage);
                        }

                        /////// send everything
                        if(!isBundle) {
                            this.oscSend(devicemotionMessage, port, hostname, (err) => {
                                if (err) { return console.error(err); }
                            });
                        } else {
                            const date = data.timestamp;
                            const bundle = new OSC.Bundle(messages, date);
                            this.oscSend(bundle, port, hostname, (err) => {
                                if (err) { return console.error(err); }
                            });
                        }

                        break;
                    }
                    // control
                    case 'control': {
                        for (let name in data[key]) {
                            const address = `/${data.source}/${data.id}/${key}/${name}`;
                            const value = data[key][name];

                            const message = new OSC.Message(address, value);
                            this.oscSend(message, port, hostname, (err) => {
                                if (err) { return console.error(err); }
                            });
                        }
                        break;
                    }

                    default: {
                        break;
                    }
                }
            }
        }
    }


}
export default NetworkEngine;
