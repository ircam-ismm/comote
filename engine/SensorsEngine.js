import { Platform } from 'react-native';

import {
    Accelerometer,
    Gyroscope,
    // Barometer,
    // Magnetometer,
    // MagnetometerUncalibrated,
    // Pedometer,
} from 'expo-sensors';

// import throttle from 'lodash/throttle';

import Lowpass from '../helpers/Lowpass';

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
const normalizeGyroscope =
    (Platform.OS === 'android'
        ? (data) => ({
            alpha: data.z * radToDegree, // yaw
            beta: data.x * radToDegree,  // pitch
            gamma: data.y * radToDegree, // roll
        })
        : (data) => ({
            alpha: data.z * radToDegree, // yaw
            beta: data.x * radToDegree,  // pitch
            gamma: data.y * radToDegree, // roll
        })
    );

export class SensorsEngine {
    constructor({
        dataCallback = null,
        availableCallback = null,
        interval = 1000 / 60, // in milliseconds
    } = {}) {
        this.dataCallback = dataCallback;
        this.availableCallback = availableCallback;

        this.interval = interval; // user-specified
        this.intervalRequest = this.interval; // sensors setUpdateInterval
        this.intervalEstimate = null;
        this.intervalEstimateLowpass = new Lowpass({
            lowpassFrequency: 0.1,
        });
        
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
        this.accelerationIncludingGravity = null;

        this.gyroscopeSubscribeId = null;
        this.gyroscopeListener = null;

        this.init();
    }

    set(attributes) {
        Object.assign(this, attributes);
        this.init();
    }

    cleanup() {
        clearTimeout(this.intervalId);

        this.accelerometerUnsubscribe();
        this.gyroscopeUnsubscribe();
    }

    async init() {
        this.intervalEstimateInit();

        const {
            accelerometerAvailable,
            gyroscopeAvailable,
        } = await this.sensorsAvailable();

        if (accelerometerAvailable && gyroscopeAvailable) {
            this.cleanup();
            this.accelerometerSubscribe();
            // subscribe last, as it triggers data report
            this.gyroscopeSubscribe();

            // set interval after subscription
            await this.intervalSet();
        } else {
            // console.error('Sensors not available!');
        }

        if (typeof this.availableCallback === 'function') {
            this.availableCallback({
                accelerometerAvailable,
                gyroscopeAvailable,
            });
        }
    }

    async sensorsAvailable() {
        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
        return {
            accelerometerAvailable,
            gyroscopeAvailable,
        };
    }

    async accelerometerSubscribe() {
        clearTimeout(this.accelerometerSubscribeId);

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        if (accelerometerAvailable) {
            this.accelerometerListener = Accelerometer.addListener(data => {
                this.accelerationIncludingGravity = normalizeAccelerometer(data);
            });
        } else {
            // try again later
            clearTimeout(this.accelerometerSubscribeId);
            this.intervalId = setTimeout(() => {
                this.accelerometerSubscribe();
            }, 1000);
        }
    };

    accelerometerUnsubscribe = () => {
        clearTimeout(this.accelerometerSubscribeId);
        if (this.accelerometerListener) {
            Accelerometer.removeSubscription(this.accelerometerListener);
        }
        this.accelerometerListener = null;
    };

    // gyroscope is master: subscribe last
    async gyroscopeSubscribe() {
        clearTimeout(this.gyroscopeSubscribeId);

        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();

        if (gyroscopeAvailable) {
            this.gyroscopeListener = Gyroscope.addListener(data => {
                this.rotationRate = normalizeGyroscope(data);

                // gyroscope is master (last)
                this.intervalEstimateUpdate();
                this.sensorsReport();
            });
        } else {
            // try again later
            clearTimeout(this.gyroscopeSubscribeId);
            this.gyroscopeSubscribeId = setTimeout(() => {
                this.gyroscopeSubscribe();
            }, 1000);

        }
    }

    gyroscopeUnsubscribe() {
        clearTimeout(this.gyroscopeSubscribeId);
        if(this.gyroscopeListener) {
            Gyroscope.removeSubscription(this.gyroscopeListener);
        }
        this.gyroscopeListener = null;
    }

    sensorsReport() {

        if (typeof this.dataCallback === 'function') {
            const {
                accelerationIncludingGravity,
                rotationRate,
            } = this;

            const interval = this.intervalEstimate || this.interval;            

            this.dataCallback({
                interval,
                accelerationIncludingGravity,
                rotationRate,
            });
        }

    }

    async intervalSet(interval = this.interval, {
        compensated = false,
    } = {}) {
        // console.log('sensors.intervalSet', interval, {compensated});

        const intervalLimited = Math.max(sensorsIntervalMin, interval);

        clearTimeout(this.intervalId);
        this.intervalEstimateInit();
        if (compensated) {
            this.intervalCompensated = intervalLimited;
            this.intervalRequest = this.intervalCompensated;
        } else {
            this.interval = intervalLimited;
            // no compensation, yet, before any interval estimate
            this.intervalRequest = this.interval;
        }

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        const gyroscopeAvailable = await Gyroscope.isAvailableAsync();

        if (accelerometerAvailable
            && gyroscopeAvailable) {
            Accelerometer.setUpdateInterval(this.intervalRequest);
            Gyroscope.setUpdateInterval(this.intervalRequest);
        } else {
            // try again later
            clearTimeout(this.intervalId);
            this.intervalId = setTimeout(() => {
                this.intervalSet(this.intervalRequest);
            }, 1000);
        }
    }

    intervalEstimateUpdate() {
        const now = global.performance.now();

        if(this.sensorsLastTime) {
            const past = this.sensorsLastTime;
            const measure = (now - past);

            if(!this.intervalEstimate) {
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