import * as Units from './Units.js';
import * as Methods from './Methods.js';

/**
 * Converts input value to yards
 *
 * @param {number} value
 * @param {string} inputUnit
 * @param {string} conversionMethod
 * @returns {number}
 */
export default function ({ value, inputUnit, conversionMethod }) {
    if (inputUnit === Units.YD) {
        return value;
    }

    return Units.isMetric(inputUnit) ? metersToYards(metricToMeters(value, inputUnit), conversionMethod) : customaryToYards(value, inputUnit);
}

function customaryToYards(customaryValue, inputUnit) {
    if (Units.isMetric(inputUnit)) {
        throw new Error('Trying to convert a US customary unit to yards as part of customaryToYards');
    }

    else if (inputUnit === Units.MI) {
        return customaryValue * 1760;
    }

    else if (inputUnit === Units.FT) {
        return customaryValue / 3;
    }

    else if (inputUnit === Units.IN) {
        return customaryValue / 36;
    }

    else if (inputUnit === Units.YD) {
        return customaryValue;
    }

    else if (inputUnit === Units.LI) {
        return customaryValue * (33/50);
    }

    else if (inputUnit === Units.RD) {
        return customaryValue * (16.5/3);
    }

    else if (inputUnit === Units.CH) {
        return customaryValue * 11;
    }

    else if (inputUnit === Units.FUR) {
        return customaryValue * 110;
    }

    else if (inputUnit === Units.LEA) {
        return customaryValue * 1760 * 3;
    }

    else if (inputUnit === Units.SP) {
        return customaryValue * 0.75;
    }

    else if (inputUnit === Units.FTM) {
        return customaryValue * 2;
    }

    else if (inputUnit === Units.SH) {
        return customaryValue * 2 * 15;
    }

    else if (inputUnit === Units.CB) {
        return customaryValue * 2 * 120;
    }

    else if (inputUnit === Units.NM) {
        return customaryValue * 1760 * 1.151;
    }

    else if (inputUnit === Units.PC) {
        return customaryValue * 3 * 2.5;
    }

    else if (inputUnit === Units.ST) {
        return customaryValue * 3 * 2.5 * 2;
    }

    else if (inputUnit === Units.GD) {
        return customaryValue * 3 * 2.5 * 2;
    }

    else if (inputUnit === Units.RP) {
        return customaryValue * 3 * 2.5 * 2 * 4;
    }

    throw new Error(`Using unsupported input unit ${inputUnit} in customaryToYards`);
}

function metersToYards(meters, conversionMethod) {
    if (conversionMethod === Methods.real) {
        return meters / 1.09361;
    }

    if (conversionMethod === Methods.meterEqualsYard) {
        return meters;
    }

    throw new Error(`Using unsupported conversion method ${conversionMethod} in metersToYards`);
}

function metricToMeters(metricValue, inputUnit) {
    if (!Units.isMetric(inputUnit)) {
        throw new Error('Trying to convert a non-metric unit to meters as part of metricToMeters');
    }

    if (inputUnit === Units.CM) {
        return metricValue / 100;
    }

    if (inputUnit === Units.KM) {
        return metricValue * 1000;
    }

    if (inputUnit === Units.M) {
        return metricValue;
    }

    throw new Error(`Using unsupported input unit ${inputUnit} in metricToMeters`);
}