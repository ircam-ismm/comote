import { Platform } from 'react-native';

import {
    Accelerometer,
    Gyroscope,
    // Barometer,
    Magnetometer,
    // MagnetometerUncalibrated,
    // Pedometer,
} from 'expo-sensors';

// import throttle from 'lodash/throttle';

import Lowpass from '../helpers/Lowpass';

// By default, gyroscope triggers the sending of data, as it appears to come last
// When it is not available, 'accelerometer' is used as master
 let sensorsMaster ='gyroscope';

// helpers

const sensorsIntervalMin = 0; // milliseconds
// const sensorsSetThrottlePeriod = 2000; //  milliseconds

// @see - https://www.w3.org/TR/orientation-event/#devicemotion
// @todo - https://w3c.github.io/accelerometer/
const g = 9.80665;
const normalizeAccelerometer =
    (Platform.OS === 'android'
        ? (data) => ({
            x: data.x * g,
            y: data.y * g,
            z: data.z * g,
        })
        : (data) => ({
            x: -data.x * g,
            y: -data.y * g,
            z: -data.z * g,
        })
    );

const radToDegree = 360 / (2 * Math.PI);
const normalizeGyroscope = (data) => ({
    alpha: data.z * radToDegree, // yaw
    beta: data.x * radToDegree,  // pitch
    gamma: data.y * radToDegree, // roll
});

// placeholder
const normalizeMagnetometer = (data) => data;

export class SensorsEngine {
    constructor({
        dataCallback = null,
        availableCallback = null,
        interval = 1000 / 60, // in milliseconds
        sensorsEmulation = !!process.env.EXPO_PUBLIC_SENSORS_EMULATION,
    } = {}) {
        this.dataCallback = dataCallback;
        this.availableCallback = availableCallback;

        this.interval = interval; // user-specified
        this.intervalRequest = this.interval; // sensors setUpdateInterval
        this.intervalEstimate = null;
        this.intervalEstimateLowpass = new Lowpass({
            lowpassFrequency: 0.1,
        });

        this.sensorsEmulation = sensorsEmulation;
        if (this.sensorsEmulation) {
            console.warn('Sensors emulation');
        }

        this.sensorsEmulationId = null;

        // // attempt to compensate request to rea user-specified
        // this.intervalCompensated = null;

        this.sensorsLastTime = null;
        this.intervalId = null;

        // this.intervalSetThrottled = throttle(this.intervalSet.bind(this),  sensorsSetThrottlePeriod, {
        //     leading: true,  // do not wait to triggger
        //     trailing: true, // be sure to aply last request
        // });

        this.accelerometerSubscribeId = null;
        this.accelerometerListener = null;
        // last normalised value
        this.accelerationIncludingGravity = null;

        // note that gyroscope is master, it should be subscribed last
        this.gyroscopeSubscribeId = null;
        this.gyroscopeListener = null;
        // last normalised value
        this.rotationRate = null;

        this.magnetometerSubscribeId = null;
        this.magnetometerListener = null;
        // last normalised value
        this.magnetometer = null;

        this.init();
    }

    async set(attributes) {
        Object.assign(this, attributes);
        await this.init();
    }

    async cleanup() {
        clearTimeout(this.intervalId);

        // unsubscribe first, as it triggers data report
        await this.gyroscopeUnsubscribe();

        await this.accelerometerUnsubscribe();

        // unsubscribe optional sensors last
        await this.magnetometerUnsubscribe();
    }

    async init() {
        await this.cleanup();
        this.intervalEstimateInit();

        const {
            accelerometerAvailable,
            gyroscopeAvailable,
            magnetometerAvailable,
        } = await this.sensorsAvailable();

        if (accelerometerAvailable) {
            // define master before any subscription
            if(!gyroscopeAvailable) {
                sensorsMaster = 'accelerometer';
            }

            // subscribe optional sensors first
            if (magnetometerAvailable) {
                await this.magnetometerSubscribe();
            }

            // subscribe almost last, as it is used as a backup master
            await this.accelerometerSubscribe();

            if (gyroscopeAvailable) {
                // subscribe last, as  it triggers data report
                await this.gyroscopeSubscribe();
            }

            // set interval after subscription

            // @TODO: find why, sometimes, the interval is 100 ms on iOS
            // (after the device went to sleep and woke up again)
            await this.intervalSet(this.interval + 2, { fake: true });
            // await new Promise((resolve) => { setTimeout(resolve, 1000); });
            await this.intervalSet();


        } else {
            // console.error('Sensors not available!');
        }

        if (typeof this.availableCallback === 'function') {
            this.availableCallback({
                accelerometerAvailable,
                gyroscopeAvailable,
                magnetometerAvailable,
            });
        }
    }

    async sensorsAvailable() {
        if (this.sensorsEmulation) {
            return {
                accelerometerAvailable: true,
                gyroscopeAvailable: true,
                magnetometerAvailable: true,
            };
        }

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
        const magnetometerAvailable = await Magnetometer.isAvailableAsync();

        return {
            accelerometerAvailable,
            gyroscopeAvailable,
            magnetometerAvailable,
        };
    }

    async accelerometerSubscribe() {
        clearTimeout(this.accelerometerSubscribeId);

        if (this.sensorsEmulation) {
            return;
        }

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        if (accelerometerAvailable) {
            this.accelerometerListener = Accelerometer.addListener(data => {
                this.accelerationIncludingGravity = normalizeAccelerometer(data);

                if (sensorsMaster === 'accelerometer') {
                    this.intervalEstimateUpdate();
                    this.sensorsReport();
                }
            });
        } else {
            // try again later
            clearTimeout(this.accelerometerSubscribeId);
            this.intervalId = setTimeout(() => {
                this.accelerometerSubscribe();
            }, 1000);
        }
    };

    async accelerometerUnsubscribe() {
        clearTimeout(this.accelerometerSubscribeId);

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        if (accelerometerAvailable && this.accelerometerListener) {
            Accelerometer.removeSubscription(this.accelerometerListener);
        }

        this.accelerometerListener = null;
    };

    // gyroscope is master: subscribe last
    async gyroscopeSubscribe() {
        clearTimeout(this.gyroscopeSubscribeId);

        if (this.sensorsEmulation) {
            return;
        }

        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
        if (gyroscopeAvailable) {
            this.gyroscopeListener = Gyroscope.addListener(data => {
                this.rotationRate = normalizeGyroscope(data);

                if (sensorsMaster === 'gyroscope') {
                    this.intervalEstimateUpdate();
                    this.sensorsReport();
                }
            });
        } else {
            // try again later
            clearTimeout(this.gyroscopeSubscribeId);
            this.gyroscopeSubscribeId = setTimeout(() => {
                this.gyroscopeSubscribe();
            }, 1000);

        }
    }

    async gyroscopeUnsubscribe() {
        clearTimeout(this.gyroscopeSubscribeId);

        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
        if (gyroscopeAvailable && this.gyroscopeListener) {
            Gyroscope.removeSubscription(this.gyroscopeListener);
        }
        this.gyroscopeListener = null;
    }

    async magnetometerSubscribe() {
        clearTimeout(this.magnetometerSubscribeId);

        if (this.sensorsEmulation) {
            return;
        }

        const magnetometerAvailable = await Magnetometer.isAvailableAsync();
        if (magnetometerAvailable) {
            this.magnetometerListener = Magnetometer.addListener(data => {
                this.magnetometer = normalizeMagnetometer(data);
            });
        } else {
            // try again later
            clearTimeout(this.magnetometerSubscribeId);
            this.intervalId = setTimeout(() => {
                this.magnetometerSubscribe();
            }, 1000);
        }
    };

    async magnetometerUnsubscribe() {
        clearTimeout(this.magnetometerSubscribeId);

        const magnetometerAvailable = await Magnetometer.isAvailableAsync();
        if (magnetometerAvailable && this.magnetometerListener) {
            Magnetometer.removeSubscription(this.magnetometerListener);

        }
        this.magnetometerListener = null;
    };

    sensorsReport() {
        if (typeof this.dataCallback === 'function') {
            const {
                accelerationIncludingGravity,
                rotationRate,
                magnetometer,
            } = this;

            const interval = this.intervalEstimate || this.interval;

            const values = {
                devicemotion: {
                    interval,
                    accelerationIncludingGravity,
                    rotationRate,
                },
            };

            if(!rotationRate) {
                delete values.rotationRate;
            }

            if (!magnetometer) {
                delete values.magnetometer;
            } else {
                values.magnetometer = {
                    interval,
                };
                Object.assign(values.magnetometer, { ...magnetometer });
            }
            this.dataCallback(values);
        }

    }

    async intervalSet(interval = this.interval, {
        compensated = false,
        fake = false,
    } = {}) {
        const intervalLimited = Math.max(sensorsIntervalMin, interval);

        clearTimeout(this.intervalId);
        this.intervalEstimateInit();
        if (!fake) {
            if (compensated) {
                this.intervalCompensated = intervalLimited;
                this.intervalRequest = this.intervalCompensated;
            } else {
                this.interval = intervalLimited;
                // no compensation, yet, before any interval estimate
                this.intervalRequest = this.interval;
            }
        }
        const intervalRequest = (fake ? this.intervalRequest : interval);

        if (this.sensorsEmulation) {
            clearTimeout(this.sensorsEmulationId);
            this.sensorsEmulationId = setInterval( () => {

                Object.assign(this, {
                    accelerationIncludingGravity: {
                        x: Math.random() * 2 - 1,
                        y: Math.random() * 2 - 1,
                        z: Math.random() * 2 - 1,
                    },
                    rotationRate: {
                        alpha: Math.random() * 2 - 1,
                        beta: Math.random() * 2 - 1,
                        gamma: Math.random() * 2 - 1,
                    },
                    magnetometer: {
                        x: Math.random() * 360 - 180,
                        y: Math.random() * 360 - 180,
                        z: Math.random() * 360 - 180,
                    },
                });

                // emulation is master
                this.intervalEstimateUpdate();
                this.sensorsReport();

            }, this.intervalRequest);

            return;
        }

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
        const magnetometerAvailable = await Magnetometer.isAvailableAsync();

        // We need at least the accelerometer
        if (accelerometerAvailable) {

            // optional
            if (magnetometerAvailable) {
                Magnetometer.setUpdateInterval(intervalRequest);
            }

            Accelerometer.setUpdateInterval(intervalRequest);

            // gyroscope might not be present
            if (gyroscopeAvailable) {
                Gyroscope.setUpdateInterval(intervalRequest);
            }
        } else {
            // try again later
            clearTimeout(this.intervalId);
            this.intervalId = setTimeout(() => {
                this.intervalSet(this.intervalRequest, { compensated, fake });
            }, 1000);
        }
    }

    intervalEstimateUpdate() {
        const now = global.performance.now();

        if (this.sensorsLastTime) {
            const past = this.sensorsLastTime;
            const measure = (now - past);

            if (!this.intervalEstimate) {
                this.intervalEstimate = measure;
                // forget first sample
                return;
            }
            const estimate = this.intervalEstimateLowpass.process(measure);
            this.intervalEstimate = estimate;

            // @TODO: should we compensate for inaccurate sensors sample period ?
            // Android seems to add on display frame (1/60 ?)

            // This is bad, as it may change way too often

            // const request = this.intervalRequest;
            // const deviationAbsolute = estimate - this.interval;

            // // compensate request to reach user-specified interval
            // const compensated = request - deviationAbsolute;


            // if (Math.abs(deviationAbsolute) > 2
            //     && compensated > 0) {
            //     console.log('intervalSetThrottled >>>>>>', compensated, {
            //         request,
            //         estimate,
            //         compensated,
            //         deviationAbsolute,
            //     });

            //     this.intervalSetThrottled(compensated, { compensated: true });
            // }

        }
        this.sensorsLastTime = now;

    }

    intervalEstimateInit() {
        this.intervalEstimateLowpass.reset();
        this.intervalEstimate = null;
        this.sensorsLastTime = null;
        this.intervalCompensated = null;
    }

}
export default SensorsEngine;
