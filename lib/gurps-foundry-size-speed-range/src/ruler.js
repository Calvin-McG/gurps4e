import { SSRT } from '../../gurps-foundry-ssrt-lib/src/js/SSRT.js';

export const getRulerSegmentLabel = (segmentDistance, totalDistance, isTotal) => {
    const units = canvas.scene.data.gridUnits;

    let label = getDistanceWithMod(segmentDistance, units);

    if (isTotal && segmentDistance !== totalDistance) {
        label += ` [${getDistanceWithMod(totalDistance, units)}]`;
    }

    return label;
};

const getDistanceWithMod = (distance, units) => {
    let label = `${Math.round(distance * 100) / 100} ${units}`;
    try {
        label += ` (${SSRT.speedRangeFromExpression({ expression: `${distance} ${units}` })})`;
    } catch (e) {}

    return label;
};
