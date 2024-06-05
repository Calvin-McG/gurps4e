import { generalHelpers } from "./generalHelpers.js";
import { attributeHelpers } from "./attributeHelpers.js";

export class attackHelpers {

    static damageParseSwThr(actor, damage){
        if (typeof actor.system !== "undefined" && typeof damage !== "undefined") {
            let smDiscount = attributeHelpers.calcSMDiscount(actor.system.bio.sm); // Get the SM discount so we can properly calculate ST

            // Begin section for traditional ST
            let st = attributeHelpers.calcStOrHt(actor.system.primaryAttributes.strength, smDiscount); // Get ST
            let sst = attributeHelpers.calcStrikingSt(st, actor.system.primaryAttributes.striking, smDiscount); // From ST, get Striking ST
            let thr = attributeHelpers.strikingStrengthToThrust(sst); // Get thrust damage based on String ST
            let sw = attributeHelpers.strikingStrengthToSwing(sst); // Get swing damage based on String ST

            // Begin section for magical ST, used by Grognard spells, and the really cool Crushing Fist
            let mSt = attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence); // Get IQ as the base magical attribute
            if (typeof actor.system.magic !== "undefined") { // If the actor has a magic object
                if (typeof actor.system.magic.magery === "number") { // If the actor has a value for their totalMagicAttribute (Usually IQ+M)
                    mSt += actor.system.magic.magery; // Set magical ST to the magic attribute
                }
            }
            let mThr = attributeHelpers.strikingStrengthToThrust(mSt); // Get thrust damage based on Magical ST
            let mSw = attributeHelpers.strikingStrengthToSwing(mSt); // Get swing damage based on Magical ST

            // Begin section for telekinetic ST
            let tkSst = 0; // Default TK strength is zero
            if (typeof actor.system.tk !== "undefined") { // If the actor has a tk object
                if (typeof actor.system.tk.magnitude === "number") { // If the actor has a value for their tk striking
                    tkSst += actor.system.tk.magnitude + actor.system.tk.strikingAdj;
                }
            }

            let tkThr = attributeHelpers.strikingStrengthToThrust(tkSst); // Get thrust damage based on TK Striking ST
            let tkSw  = attributeHelpers.strikingStrengthToSwing(tkSst); // Get swing damage based on TK Striking ST

            if (typeof damage == "undefined" || damage == null){
                damage = "0";
            }
            damage = damage.toLowerCase(); // Fix any case specific issues
            // First account for any cases of mThr or mSw
            damage = damage.replace("mthr", mThr); // Replace thrust
            damage = damage.replace("msw",  mSw); // Replace swing
            // Second account for any cases of tkThr or tkSw
            damage = damage.replace("tkthr", tkThr); // Replace thrust
            damage = damage.replace("tksw",  tkSw); // Replace swing
            // Then if thr or sw strings remain, replace those as well
            damage = damage.replace("thr", thr); // Replace thrust
            damage = damage.replace("sw", sw); // Replace swing
            return damage;
        }
        return "";
    }

    // This method takes in a base armour divisor and a level of hardening and returns the effective armour divisor
    // ad is the current armour divisor
    // hardening is the level of hardening
    static applyDRHardening(armourDivisor, hardening) {
        let ad = armourDivisor
        for (let i = 0; i < hardening; i++){ // Run the logic as many times as we have hardening levels.
            if (ad === Infinity || ad.toString().toLowerCase() !== "ignores armour") { // Infinite ad, and other non-cosmic ignores armour
                ad = 100; // reduce to ad 100, which is the next step down
            }
            else if (ad.toString().toLowerCase() !== "cosmic ignores armour") { // Cosmic ignores armour does not get reduced.
                return ad;
            }
            else if (ad >= 100) { // The next step after ad (100) is ad (10)
                ad = ad / 10; // So divide the value by 10
            }
            else if (ad >= 10) { // From ad (10) the next is ad (5)
                ad = ad / 2; // So divide the value by 2
            }
            else if (ad >= 5) { // From ad (5) the next is ad (3)
                ad = ad * 0.6; // So multiply the value by 0.6
            }
            else if (ad >= 3) { // From ad (3) the next is ad (2)
                ad = ad / 1.5; // So divide the value by 1.5
            }
            else if (ad >= 2) { // From ad (2) the next is ad (1)
                ad = ad / 2; // So divide the value by 2
            }
            else if (ad > 1) { // If looping through the above has left us with some strange decimal value but we still have levels of hardening to take care of...
                return 1; // Reduce ad to 1
            }
        }
        return ad;
    }

    static buildLocationLabel(target, locationHit) {
        // Build the location label
        let firstLocation = foundry.utils.getProperty(target.system.bodyType.body, locationHit.split(".")[0]);
        let secondLocation = foundry.utils.getProperty(target.system.bodyType.body, locationHit);
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

    static damageAddsToDiceWithBonusDamagePerDie(damage, bonusPerDie) {
        let diceCount = 0;
        let adds = 0;
        if (damage.toString().includes("d6")) {
            let diceStrings = damage.match(/(\+|\-)?\d+d6/g); // Regex fetches "#d6", plus any +/1 sign

            let addsString = damage;
            for (let k = 0; k < diceStrings.length; k++) { // Loop through our collected dice
                addsString = addsString.replace(diceStrings[k], ""); // From the original string, remove all the dice we got above.
                let dice = diceStrings[k].match(/(\+|\-)?\d+d/g);
                diceCount += parseInt(dice[0].slice(0, -1));
            }

            adds = eval(addsString.replace(/[a-zA-Z]/g, "")); // Strip out any letters and then eval the remaining adds to get a single number.
            if (typeof adds === "undefined") { // eval() on an empty string returns undefined
                adds = 0; // Store a zero instead.
            }

            if (game.settings.get("gurps4e", "addsToDice")) { // If we're converting extra adds to dice
                damage = generalHelpers.pointsToDiceAndAddsString((diceCount * 3.5) + adds + (diceCount * bonusPerDie)); // Convert all dice to adds, and then back to adds and dice.
            }
            else {
                damage = (diceCount + "d6" + adds); // Otherwise, take it as is.
            }
        }

        return  {
            "damage": damage,
            "dice": diceCount,
            "adds": adds
        };
    }

    static damageAddsToDice(damage) {
        return this.damageAddsToDiceWithBonusDamagePerDie(damage, 0);
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

    static getBonus(dx, level, skillName, st, damBonus) {
        let expandedTrainingBonus = game.settings.get("gurps4e", "expandedTrainingBonuses") // Get the game setting that controls expanded training bonuses.
        let percentageBasedTrainingBonuses = game.settings.get("gurps4e", "percentageBasedTrainingBonuses") // Get the game setting that controls percentageBasedTrainingBonuses
        let cinematicTrainingBonusAccrual = game.settings.get("gurps4e", "cinematicTrainingBonusAccrual") // Get the game setting that controls cinematicTrainingBonusAccrual
        let cinematicTrainingBonusCap = game.settings.get("gurps4e", "cinematicTrainingBonusCap") // Get the game setting that controls cinematicTrainingBonusAccrual

        let trainingSTBonus = 0;
        let dxDifference = level - dx;
        let progression = "none";
        let adjustment = 0;

        if (damBonus) { // damBonus is true, we're looking for just the bonus damage per dice
            switch(skillName.toLowerCase()) {
                case "boxing":
                case "weapon master":
                case "karate":
                case "sumo wrestling":
                case "sumo":
                case "throwing art":
                case "fast":
                    progression = "fast";
                    break;
                case "average":
                case "brawling":
                    progression = "average";
                    break;
                case "slow":
                    progression = "slow";
                    break;
                default:
                    progression = "none";
                    break;
            }
        }
        else { // damBonus is false, meaning we're looking for the ST bonus which can include throwing range.
            switch(skillName.toLowerCase()) {
                case "fast":
                    progression = "fast";
                    break;
                case "average":
                case "brawling":
                case "throwing art":
                    progression = "average";
                    break;
                case "boxing":
                case "weapon master":
                case "karate":
                case "sumo wrestling":
                case "sumo":
                case "judo":
                case "slow":
                case "throwing":
                case "thrown":
                case "throw":
                    progression = "slow";
                    break;
                default:
                    progression = "none";
                    break;
            }
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
           if ((dxDifference + adjustment) === 1) {
                trainingSTBonus = 1;
            }
            else if ((dxDifference + adjustment) === 2 || (dxDifference + adjustment) === 3) {
                trainingSTBonus = 2;
            }
            else if ((dxDifference + adjustment) >= 4) {
                trainingSTBonus = 3 + Math.floor(((dxDifference + adjustment) - 4)/3) // Every full +3 gives an extra +1. So 4 gives a +5, and 7 gives a +6
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

    // This method gets bonus damage per die, per the chart on Technical Grappling 48
    // skillName can take an actual skill, or the name of a progression type
    static getTrainingDamageBonus(dx, level, skillName, st) {
        return this.getBonus(dx, level, skillName, st, true);
    }

    // This method gets training bonus ST, per the chart on Technical Grappling 48
    // skillName can take an actual skill, or the name of a progression type
    static getTrainingSTBonus(dx, level, skillName, st) {
        return this.getBonus(dx, level, skillName, st, false);
    }
}
