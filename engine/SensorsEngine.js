import { Platform } from 'react-native';

import {
    Accelerometer,
    Gyroscope,
    // Barometer,
    Magnetometer,
    // MagnetometerUncalibrated,
    // Pedometer,
} from 'expo-sensors';

import { Gravity } from '@ircam/sc-motion';

// for heading
import * as Location from 'expo-location';

// import throttle from 'lodash/throttle';

import Lowpass from '../helpers/Lowpass';
import { timestampGet } from '../helpers/timestamp';

// helpers

const sensorsIntervalMin = 0; // milliseconds
// const sensorsSetThrottlePeriod = 2000; //  milliseconds

// @see https://w3c.github.io/accelerometer/#accelerometer-interface
const g = 9.80665;
const accelerometerNormalise =
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

// @see // https://w3c.github.io/gyroscope/#gyroscope-interface
// placeholder
const gyroscopeNormalise = (data) => data;

const radToDegree = 360 / (2 * Math.PI);
const rotationRateNormalise = (data) => ({
    alpha: data.z * radToDegree, // yaw
    beta: data.x * radToDegree,  // pitch
    gamma: data.y * radToDegree, // roll
});

// placeholder
const magnetometerNormalise = (data) => data;

// @see https://docs.expo.dev/versions/latest/sdk/location/#locationheadingobject
const headingNormalise = (data) => {
    const { trueHeading: geographic, magHeading: magnetic, accuracy: accuracyIndex } = data;
    let accuracy;
    switch (accuracyIndex) {
        case 0:
            accuracy = 65;
            break;
        case 1:
            accuracy = 50;
            break;
        case 2:
            accuracy = 35;
            break;
        case 3:
            accuracy = 20;
            break;
        default:
            accuracy = -1;
            break;
    }

    return {
        geographic,
        magnetic,
        accuracy,
    };
};

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
            lowpassFrequency: 0.01,
        });

        this.sensorsEmulation = sensorsEmulation;
        if (this.sensorsEmulation) {
            console.warn('Sensors emulation');
        }

        this.sensorsEmulationId = null;

        // // attempt to compensate request to match user-specified value
        // this.intervalCompensated = null;

        this.sensorsLastTime = null;
        this.intervalId = null;

        // this.intervalSetThrottled = throttle(this.intervalSet.bind(this),  sensorsSetThrottlePeriod, {
        //     leading: true,  // do not wait to trigger
        //     trailing: true, // be sure to apply last request
        // });

        // By default, gyroscope triggers the sending of data, as it appears to come last
        // When it is not available, 'accelerometer' is used as master
        this.sensorsMaster = 'gyroscope';

        this.accelerometerSubscribeId = null;
        this.accelerometerListener = null;
        // last normalised value
        this.accelerometer = null;

        // note that gyroscope is master, it should be subscribed last
        this.gyroscopeSubscribeId = null;
        this.gyroscopeListener = null;
        // last normalised value
        this.gyroscope = null;

        this.gravityProcessor = null;
        this.gravity = null;

        this.magnetometerSubscribeId = null;
        this.magnetometerListener = null;
        // last normalised value
        this.magnetometer = null;

        // ask once
        this.headingPermissionRequested = false;
        this.headingSubscribeId = null;
        this.headingListener = null;
        // last normalised value
        this.heading = null;

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

        await this.headingUnsubscribe();
    }

    async init() {
        await this.cleanup();
        this.intervalEstimateInit();
        const {
            accelerometerAvailable,
            gyroscopeAvailable,
            magnetometerAvailable,
            headingAvailable,
        } = await this.sensorsAvailable();

        if (accelerometerAvailable) {
            // define master before any subscription
            if(!gyroscopeAvailable) {
                this.sensorsMaster = 'accelerometer';
            }

            // subscribe optional sensors first
            if(headingAvailable) {
                await this.headingSubscribe();
            }

            if (magnetometerAvailable) {
                await this.magnetometerSubscribe();
            }

            // subscribe almost last, as it is used as a backup master
            await this.accelerometerSubscribe();

            if (gyroscopeAvailable) {
                // subscribe last, as  it triggers data report
                await this.gyroscopeSubscribe();

                // gravity requires accelerometer and gyroscope
                this.gravityProcessor = new Gravity({
                    sampleRate: 1000 / this.interval,
                    outputApi: 'v3',
                });
            }

            // set interval after subscription

            // @TODO: find why, sometimes, the interval is 100 ms on iOS
            // (after the device went to sleep and woke up again)
            // set to something different, then call is again
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
                headingAvailable,
            });
        }
    }

    async sensorsAvailable() {
        if (this.sensorsEmulation) {
            return {
                accelerometerAvailable: true,
                gyroscopeAvailable: true,
                magnetometerAvailable: true,
                headingAvailable: true,
            };
        }

        const accelerometerPermission = await Accelerometer.getPermissionsAsync();
        const gyroscopePermission = await Gyroscope.getPermissionsAsync();
        const magnetometerPermission = await Magnetometer.getPermissionsAsync();

        // Heading does not request permission on get, and multiple requests are annoying
        // and disturb all processes.
        // On init, the asynchronous calls from SensorsComponent and SensorsEngine are pending,
        // so we need to accept both.
        let headingPermission = {};

        // @note(2026/02/16 - Benjamin) - to be fixed
        // Bypass in android Expo development and preview build, because
        //  `requestForegroundPermissionsAsync` never resolve, so the app is stuck
        // here and we never get any data.
        // Not sure I understand the problem or the solution though, but it seems
        // heading is just accessible according to Localisation is check or not
        // in settings.
        // related: https://github.com/expo/expo/issues/28284
        if (Platform.OS === 'android'
            && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'preview')
        ) {
          this.headingPermissionRequested = true;
        }

        if (!this.headingPermissionRequested) {
            try {
                headingPermission = await Location.requestForegroundPermissionsAsync();
                this.headingPermissionRequested = true;
            } catch (error) {
                console.error('Location.requestForegroundPermissionsAsync', error);
                headingPermission.granted = false;
            }
        } else {
            try {
                headingPermission = await Location.getForegroundPermissionsAsync();
            } catch (error) {
                console.error('Location.getForegroundPermissionsAsync', error);
                headingPermission.granted = false;
            }
        }

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
        const magnetometerAvailable = await Magnetometer.isAvailableAsync();

        const headingAvailable = await Location.hasServicesEnabledAsync();

        // console.log({
        //     accelerometerPermission,
        //     gyroscopePermission,
        //     magnetometerPermission,
        //     headingPermission,
        //     accelerometerAvailable,
        //     gyroscopeAvailable,
        //     magnetometerAvailable,
        //     headingAvailable,
        // });

        return {
            accelerometerAvailable: accelerometerAvailable && accelerometerPermission.granted,
            gyroscopeAvailable: gyroscopeAvailable && gyroscopePermission.granted,
            magnetometerAvailable: magnetometerAvailable && magnetometerPermission.granted,
            headingAvailable: headingAvailable && headingPermission.granted,
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
                this.accelerometer = accelerometerNormalise(data);

                if (this.sensorsMaster === 'accelerometer') {

                    this.intervalEstimateUpdate();
                    this.gravityUpdate();
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
    }

    async accelerometerUnsubscribe() {
        clearTimeout(this.accelerometerSubscribeId);

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        if (accelerometerAvailable && this.accelerometerListener) {
            Accelerometer.removeSubscription(this.accelerometerListener);
        }

        this.accelerometerListener = null;
    }

    // gyroscope is master: subscribe last
    async gyroscopeSubscribe() {
        clearTimeout(this.gyroscopeSubscribeId);

        if (this.sensorsEmulation) {
            return;
        }

        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
        if (gyroscopeAvailable) {
            this.gyroscopeListener = Gyroscope.addListener(data => {
                this.gyroscope = gyroscopeNormalise(data);

                if (this.sensorsMaster === 'gyroscope') {
                    this.intervalEstimateUpdate();
                    this.gravityUpdate();
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

    gravityUpdate() {
        const { accelerometer, gyroscope } = this;
        if (this.gravityProcessor && accelerometer && gyroscope) {
            const { accelerometer, gyroscope } = this;
            try {
                const gravity = this.gravityProcessor.process({
                    api: 'v3',
                    accelerometer,
                    gyroscope,
                });
                Object.assign(this, gravity);
            } catch (error) {
                console.error('Gravity processor error', error.message);
            }
        }
    }

    async magnetometerSubscribe() {
        clearTimeout(this.magnetometerSubscribeId);

        if (this.sensorsEmulation) {
            return;
        }

        const magnetometerAvailable = await Magnetometer.isAvailableAsync();
        if (magnetometerAvailable) {
            this.magnetometerListener = Magnetometer.addListener(data => {
                this.magnetometer = magnetometerNormalise(data);
            });
        } else {
            // try again later
            clearTimeout(this.magnetometerSubscribeId);
            this.intervalId = setTimeout(() => {
                this.magnetometerSubscribe();
            }, 1000);
        }
    }

    async magnetometerUnsubscribe() {
        clearTimeout(this.magnetometerSubscribeId);

        const magnetometerAvailable = await Magnetometer.isAvailableAsync();
        if (magnetometerAvailable && this.magnetometerListener) {
            Magnetometer.removeSubscription(this.magnetometerListener);

        }
        this.magnetometerListener = null;
    }

    async headingSubscribe() {
        clearTimeout(this.headingSubscribeId);

        if (this.sensorsEmulation) {
            return;
        }

        const headingAvailable = Location.hasServicesEnabledAsync();
        if (headingAvailable) {
            this.headingListener = await Location.watchHeadingAsync(data => {
                this.heading = headingNormalise(data);
            });
        } else {
            // try again later
            clearTimeout(this.headingSubscribeId);
            this.intervalId = setTimeout(() => {
                this.headingSubscribe();
            }, 1000);
        }
    }

    async headingUnsubscribe() {
        clearTimeout(this.headingSubscribeId);

        const headingAvailable = await Location.hasServicesEnabledAsync();
        if (headingAvailable && this.headingListener) {
            this.headingListener.remove();

        }
        this.headingListener = null;
    }

    sensorsReport() {
        if (typeof this.dataCallback === 'function') {
            const timestamp = timestampGet();

            const interval = this.intervalEstimate || this.interval;
            const frequency = 1000 / interval;

            const {
                accelerometer,
                gyroscope,
                gravity,
                magnetometer,
                heading,
            } = this;

            if(accelerometer) {
                Object.assign(accelerometer, { timestamp, frequency });
            }

            if(gyroscope) {
                Object.assign(gyroscope, { timestamp, frequency });
            }

            if(gravity) {
                Object.assign(gravity, { timestamp, frequency });
            }

            if(magnetometer) {
                Object.assign(magnetometer, { timestamp, frequency });
            }

            if(heading) {
                Object.assign(heading, { timestamp, frequency });
            }

            const values = {
                timestamp,
                accelerometer,
                gyroscope,
                gravity,
                magnetometer,
                heading,
                // devicemotion: {
                //     interval,
                //     accelerationIncludingGravity: accelerometer,
                //     rotationRate: rotationRateNormalise(gyroscope),
                // },
            };

            // remove empty values
            Object.keys(values).forEach((key) => {
                if (values[key] === null || values[key] === undefined) {
                    delete values[key];
                }
            });

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
                    accelerometer: {
                        x: Math.random() * 2 - 1,
                        y: Math.random() * 2 - 1,
                        z: Math.random() * 2 - 1,
                    },

                    gyroscope: {
                        x: Math.random() * 2 - 1,
                        y: Math.random() * 2 - 1,
                        z: Math.random() * 2 - 1,
                    },

                    magnetometer: {
                        x: Math.random() * 100 - 50,
                        y: Math.random() * 100 - 50,
                        z: Math.random() * 100 - 50,
                    },

                    heading: {
                        accuracy: 35,
                        geographic: Math.random() * 360,
                        magnetic: Math.random() * 360,
                    }
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

            // no interval for heading

            Accelerometer.setUpdateInterval(intervalRequest);

            // gyroscope might not be present
            if (gyroscopeAvailable) {
                Gyroscope.setUpdateInterval(intervalRequest);
                if (this.gravityProcessor) {
                    const sampleRate = 1000 / this.intervalRequest;
                    this.gravityProcessor.set({ sampleRate });
                }
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
            if (this.gravityProcessor) {
                const sampleRate = 1000 / this.intervalEstimate;
                this.gravityProcessor.set({ sampleRate });
            }

            // @TODO: should we compensate for inaccurate sensors sample period ?
            // Android seems to add one display frame (1/60 ?)

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
        // initialise expected interval with request
        this.intervalEstimateLowpass.process(this.interval);
        this.intervalEstimate = null;
        this.sensorsLastTime = null;
        this.intervalCompensated = null;
    }

}
export default SensorsEngine;
