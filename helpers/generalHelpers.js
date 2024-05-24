export class generalHelpers {

    // Used for falls and collisions, this method returns the damage for an impact at a given velocity
    static velocityToDamage(hp, velocity) {
        let points = ((hp * velocity) / 100) * 3.5; // The formula from B430, multiplied by 3.5 since the original formula gives decimal dice and we want points of damage

        let soft = this.pointsToDiceAndAdds(points);
        let hard = this.pointsToDiceAndAdds(points * 2);

        let hardSoft = {
            "hard": hard.dice + "d6+" + hard.adds,
            "soft": soft.dice + "d6+" + soft.adds
        }

        return hardSoft;
    }

    static has(obj, key){ // obj is the Object you're checking, key is the nested key you're looking for.
        return key.split(".").every(function(x) {
            if(typeof obj != "object" || obj === null || ! x in obj)
                return false;
            obj = obj[x];
            return true;
        });
    }

    static rofToBonus(rof){
        let bonus = 0;
        if      (rof >= 2 && rof <= 4)  { bonus = 0}
        else if (rof >= 5 && rof <= 8)  { bonus = 1}
        else if (rof >= 9 && rof <= 12)  { bonus = 2}
        else if (rof >= 13 && rof <= 16)  { bonus = 3}
        else if (rof >= 17 && rof <= 24)  { bonus = 4}
        else if (rof >= 25)  { // At this point the scaling is logarithmic
            bonus = Math.floor(1.4427 * Math.log(rof) + 0.3562);
        }
        else {
            bonus = 0; // Make sure it doesn't return undefined.
        }

        return bonus;
    }

    static diceAndAddsToPoints(inputString) {
        if (inputString.includes("d6")) { // If we were passed a dice string
            let diceAndAdds = inputString.split("d6"); // Split the string on the d6
            let dice = parseInt(diceAndAdds[0]); // Die count will be before the d6
            let adds = parseInt(diceAndAdds[1]); // Adds will be after

            if (Number.isNaN(dice) || typeof dice === "undefined") { // If dice came through wrong, default to zero
                dice = 0
            }
            if (Number.isNaN(adds) || typeof adds === "undefined") { // If adds came through wrong, default to zero
                adds = 0
            }

            return (dice * 3.5) + adds; // Return the average damage given the above values.
        }
        else { // If we were not passed a dice string, such as a specific number
            return parseFloat(inputString);
        }
    }

    // This method takes in a number of points of damage and converts it to the maximum number of dice and minimum number of adds
    static pointsToDiceAndAdds(points) {
        let diceAndAdds = {
            "dice": 1,
            "adds": 0,
        }

        // Convert points to dice and adds, borrowing logic from HT 166, though not exactly due to how the system handles converting dice to points and back
        if (points < -2.5) { // -2.5 works out to 1d6-6, which is a valid thr value for low ST, if it's less than that, return zero
            diceAndAdds = {
                "dice": 0,
                "adds": 0,
            }
        }
        else if (points < 3.5) { // Special handling for point values less than 1 die to make sure stuff like low ST character thrust attacks don't resolve 1d6-1 down to +2 damage.
            if (points < -1.575) { // -1.5 points is 1d-5, this is slightly less and gives 1d6-6
                diceAndAdds.adds = -6;
            }
            else if (points < -0.525) { // -0.5 points is 1d-4, this is slightly less and gives 1d6-5
                diceAndAdds.adds = -5;
            }
            else if (points < 0.475) { // 0.5 points is 1d-3, this is slightly less and gives 1d6-4
                diceAndAdds.adds = -4;
            }
            else if (points < 1.425) { // 1.5 points is 1d-2, this is slightly less and gives 1d6-3
                diceAndAdds.adds = -3;
            }
            else if (points < 2.375) { // 2.5 points is 1d-1, this is slightly less and gives 1d6-2
                diceAndAdds.adds = -2;
            }
            else if (points < 3.325) { // 3.5 points is 1 die, this is slightly less and gives 1d6-1
                diceAndAdds.adds = -1;
            }
            else { // Point values over 3.325 (0.95 dice) round back up to 1 die
                diceAndAdds.adds = 0;
            }
        }
        else { // Otherwise run the logic normally
            diceAndAdds.dice = Math.floor(points/3.5);
            diceAndAdds.adds = Math.floor(3.5*(points/3.5-Math.floor(points/3.5)));
        }

        return diceAndAdds;
    }

    // This method returns the above, except formatted as a string that Foundry can parse.
    static pointsToDiceAndAddsString(points) {
        let diceAndAdds = this.pointsToDiceAndAdds(points); // First, get the object with our values
        let sign = diceAndAdds.adds > 0 ? "+" : ""; // Then check to see if we will need to manually add a '+' sign for the adds
        let returnString = "";

        if (diceAndAdds.dice !== 0) { // If we ended up with a non-zero amount of dice
            returnString = diceAndAdds.dice + "d6"; // Include them
        }

        if (diceAndAdds.adds !== 0) { // If we ended up with a non-zero amount of adds.
            returnString += sign + diceAndAdds.adds; // Append the sign if necessary, and any adds.
        }

        if (returnString.length === 0) { // If we somehow ended up with neither adds nor dice
            returnString = "0"; // Make sure to at least return a zero.
        }

        return returnString;
    }

    static correctAtoAn(string) {
        let vowels = ['a', 'e', 'i', 'o', 'u']

        // Loop through all the vowels
        for (let x = 0; x < vowels.length; x++) {
            string = string.replace(" a " + vowels[x], " an " + vowels[x]);
        }

        return string;
    }

    static diceAndAddsToGURPSOutput(dice, adds) {
        let result = "";
        if (dice === 0 && adds === 0) {
            result = "0";
        }
        else if (dice > 0){
            result = dice + "d6";
        }

        if (adds > 0 && dice > 0) {
            result += "+" + +adds;
        }
        else if (adds > 0 && dice <= 0) {
            result += "" + adds;
        }
        else if (adds < 0) {
            result += "-" + +Math.abs(+adds);
        }
        return result;
    }
}
