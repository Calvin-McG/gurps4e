import { generalHelpers } from "./generalHelpers.js";

export class attackHelpers {

    static buildLocationLabel(target, locationHit) {
        // Build the location label
        let firstLocation = getProperty(target.system.bodyType.body, locationHit.split(".")[0]);
        let secondLocation = getProperty(target.system.bodyType.body, locationHit);
        let firstLabel = firstLocation ? firstLocation.label : "";
        let secondLabel = secondLocation? secondLocation.label: "";
        let locationLabel;
        if (firstLabel === secondLabel){
            locationLabel = firstLabel;
        }
        else if (firstLabel === ''){
            locationLabel = secondLabel;
        }
        else {
            locationLabel = firstLabel + " - " + secondLabel;
        }

        return locationLabel;
    }

    static damageAddsToDice(damage) {
        let diceStrings = damage.match(/(\+|\-)?\d+d6/g); // Regex fetches "#d6", plus any +/1 sign
        let diceCount = 0;

        let addsString = damage;
        for (let k = 0; k < diceStrings.length; k++) { // Loop through our collected dice
            addsString = addsString.replace(diceStrings[k], ""); // From the original string, remove all the dice we got above.
            let dice = diceStrings[k].match(/(\+|\-)?\d+d/g);
            diceCount += parseInt(dice[0].slice(0, -1));
        }

        let adds = eval(addsString); // Eval the remaining adds to get a single number.
        if (typeof adds === "undefined") { // eval() on an empty string returns undefined
            adds = 0; // Store a zero instead.
        }

        if (game.settings.get("gurps4e", "addsToDice")) { // If we're converting extra adds to dice
            damage = generalHelpers.pointsToDiceAndAddsString((diceCount * 3.5) + adds); // Convert all dice to adds, and then back to adds and dice.
        }
        else {
            damage = (diceCount + "d6" + adds); // Otherwise, take it as is.
        }

        console.log(damage)

        return damage;
    }

    // This method takes in 1/2D and Max range and returns a single sensibly formatted string
    static formatRange(halfRange, maxRange) {
        let returnString = "";

        // First, check maxRange for data integrity
        if (typeof maxRange === "undefined" || maxRange === "" || Number.isNaN(maxRange) || maxRange <= 0) { // If maxRange is fucky
            maxRange = Infinity; // Default to Infinity
        }

        // Then check halfRange for data integrity
        if (typeof halfRange === "undefined" || halfRange === "" || Number.isNaN(halfRange) || halfRange <= 0) { // If halfRange is fucky
            halfRange = Infinity; // Default to Infinity
        }
        else if (halfRange > maxRange) { // Check to see if halfRange is greater than maxRange
            // By this point maxRange should be correctly formatted, either a proper number or Infinity. So if halfRange is greater, they must both be proper numbers
            halfRange = maxRange; // Set them the same
        }

        if (halfRange >= maxRange) { // Half range is the same or greater than max
            if (maxRange === Infinity) { // Check to see if maxRange is Infinity
                returnString = "∞"; // Return an Infinity symbol, instead of the word Infinity.
            }
            else {
                returnString = maxRange; // Return only the single max range value.
            }
        }
        else { // Half range is less than max
            returnString = halfRange + " / ";  // Display halfRange as normal

            if (maxRange === Infinity) { // Check to see if maxRange is Infinity
                returnString += "∞"; // Return an Infinity symbol, instead of the word Infinity.
            }
            else {
                returnString += maxRange; // Return only the single max range value.
            }
        }

        return returnString;
    }

    static calcThrowingRange(dx, level, st, skillName, mult) {
        let trainingSTBonus = this.getTrainingSTBonus(dx, level, skillName, st);

        return Math.round((st + trainingSTBonus) * mult);
    }

    // This method gets training bonus ST, per the chart on Technical Grappling 48
    static getTrainingSTBonus(dx, level, skillName, st) {
        let expandedTrainingBonus = game.settings.get("gurps4e", "expandedTrainingBonuses") // Get the game setting that controls expanded training bonuses.
        let percentageBasedTrainingBonuses = game.settings.get("gurps4e", "percentageBasedTrainingBonuses") // Get the game setting that controls percentageBasedTrainingBonuses
        let cinematicTrainingBonusAccrual = game.settings.get("gurps4e", "cinematicTrainingBonusAccrual") // Get the game setting that controls cinematicTrainingBonusAccrual
        let cinematicTrainingBonusCap = game.settings.get("gurps4e", "cinematicTrainingBonusCap") // Get the game setting that controls cinematicTrainingBonusAccrual

        let trainingSTBonus = 0;
        let dxDifference = level - dx;
        let progression = "none";
        let adjustment = 0;

        switch(skillName.toLowerCase()) {
            case "throwing art":
                progression = "average";
                break;
            case "throwing":
            case "thrown":
            case "throw":
                progression = "slow";
                break;
            default:
                break;
        }

        if (progression === "fast") {
            adjustment = 0;
        }
        else if (progression === "average") {
            adjustment = -1;
        }
        else if (progression === "slow") {
            adjustment = -2;
        }

        if (progression !== "none") {
            if ((dxDifference + adjustment) === -1) {
                trainingSTBonus = 1;
            }
            else if ((dxDifference + adjustment) === 0) {
                trainingSTBonus = 2;
            }
            else if ((dxDifference + adjustment) === 1) {
                trainingSTBonus = 3;
            }
            else if ((dxDifference + adjustment) === 2 || (dxDifference + adjustment) === 3) {
                trainingSTBonus = 4;
            }
            else if ((dxDifference + adjustment) >= 4) {
                trainingSTBonus = 5 + Math.floor(((dxDifference + adjustment) - 4)/3) // Every full +3 gives an extra +1. So 4 gives a +5, and 7 gives a +6
            }

            if (!expandedTrainingBonus) { // If we're not using expanded training bonuses
                trainingSTBonus = Math.min(trainingSTBonus, 2) // Then the cap is 2
            }
            else { // If we are using expanded training bonuses then we can check for cinematic vs realistic cap
                if (cinematicTrainingBonusCap) { // If we're using the cinematic training bonus cap.
                    trainingSTBonus = Math.min(trainingSTBonus, 10) // Then the training bonus cannot be more than 10.
                }
                else { // Otherwise we're using the realistic cap.
                    trainingSTBonus = Math.min(trainingSTBonus, 5) // Then the training bonus cannot be more than 5.
                }
            }

            if (cinematicTrainingBonusAccrual) { // If we're using the cinematic training bonus accrual.
                trainingSTBonus *= 2; // Then each +1 is worth double.
            }

            if (percentageBasedTrainingBonuses) { // If we're using the percentage based training bonuses
                trainingSTBonus = Math.round(st * (trainingSTBonus * 0.1)); // Work out what the difference in value would be so we can return a consistently formatted value for the bonus.
            }
        }

        return trainingSTBonus;
    }
}
