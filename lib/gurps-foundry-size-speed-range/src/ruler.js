import {distanceHelpers} from "../../../helpers/distanceHelpers.js";

export const getRulerSegmentLabel = (segment, totalDistance) => {
    const units = canvas.scene.grid.units;

    let label = getDistanceWithMod(segment.distance, units);

    if (segment.distance !== totalDistance) {
        label += ` [${getDistanceWithMod(totalDistance, units)}]`;
    }

    return label;
};

const getDistanceWithMod = (distance, units) => {
    let label = `${Math.round(distance * 100) / 100} ${units}`;

    if (distance > 1){
        label += "s";
    }

    let distanceInYards = distanceHelpers.convertToYards(distance, units);

    let distancePenalty = distanceHelpers.distancePenalty(distanceInYards);

    try {
        label += " <" + distancePenalty + ">";
    } catch (e) {
        console.error(e)
    }

    return label;
};
