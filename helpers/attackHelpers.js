export class attackHelpers {

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
