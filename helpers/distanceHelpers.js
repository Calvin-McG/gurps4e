
export class distanceHelpers {
    static convertToYards(dist, gridUnits) {
        let distance = 0;

        // If there's an s at the end of the string, remove it
        if (gridUnits.charAt(gridUnits.length - 1).toLowerCase() === "s"){
            gridUnits = gridUnits.slice(0, -1);
        }

        let selectedUnit = this.getUnitByPossibleNames(gridUnits.toLowerCase())

        return dist * selectedUnit.mult;
    }

    static getUnitByName(name) {
        const units = this.listUnits();
        let result;
        if (typeof name != "undefined"){
            units.forEach( unit => {
                if (unit.name.toLowerCase() == name.toLowerCase()) {
                    result = unit;
                }
            })
        }

        return result;
    }

    // This method searches through the list of units in the system and checks the provided name against their possible names
    // It then returns that unit's object
    static getUnitByPossibleNames(name) {
        const units = this.listUnits(); // First, fetch the complete list of units
        let selectedUnit;
        units.forEach( unit => { // Loop through that list
            if (unit.possibleNames.includes(name.toLowerCase())) { // If the given name matches a possible name of the current iteration
                selectedUnit = unit; // Return it, ending the loop early
            }
        })

        return selectedUnit
    }

    // Provides a list of units that are useable by the system
    static listUnits() {
        // possibleNames is an array of any and all possible names someone might use for this unit of measurement
        // name is the non-plural primary name of the unit of measurement
        // names is the plural of the primary name
        // mult is the number of yards in one example of the unit.
        // IE: Multiply the number of units by this multiplier to get the number of yards.
        return [
            {
                "possibleNames" : ["league", "lea"],
                "name": "league",
                "names": "leagues",
                "mult": 1760 * 3,
            },
            {
                "possibleNames" : ["fathom", "ftm"],
                "name": "fathom",
                "names": "fathoms",
                "mult": 2,
            },
            {
                "possibleNames" : ["nautical mile", "nm", "nmi"],
                "name": "nautical mile",
                "names": "nautical miles",
                "mult": 1760 * 1.151,
            },
            {
                "possibleNames" : ["mi", "mile"],
                "name": "mile",
                "names": "miles",
                "mult": 1760,
            },
            {
                "possibleNames" : ["cable", "cb"],
                "name": "cable",
                "names": "cables",
                "mult": 240,
            },
            {
                "possibleNames" : ["furlong", "fur"],
                "name": "furlong",
                "names": "furlongs",
                "mult": 110,
            },
            {
                "possibleNames" : ["rope", "rp"],
                "name": "rope",
                "names": "ropes",
                "mult": 60,
            },
            {
                "possibleNames" : ["shackle", "sh"],
                "name": "shackle",
                "names": "shackles",
                "mult": 30,
            },
            {
                "possibleNames" : ["grade", "gd"],
                "name": "grade",
                "names": "grades",
                "mult": 15,
            },
            {
                "possibleNames" : ["step", "st"],
                "name": "step",
                "names": "steps",
                "mult": 2.5 / 3 / 2,
            },
            {
                "possibleNames" : ["chain", "ch"],
                "name": "chain",
                "names": "chains",
                "mult": 11,
            },
            {
                "possibleNames" : ["pace", "pc"],
                "name": "pace",
                "names": "paces",
                "mult": 2.5 / 3,
            },
            {
                "possibleNames" : ["rod", "rd"],
                "name": "rod",
                "names": "rods",
                "mult": 5.5,
            },
            {
                "possibleNames" : ["km", "kilometre", "kilometer"],
                "name": "kilometre",
                "names": "kilometres",
                "mult": 1 / 0.9144 * 1000,
            },
            {
                "possibleNames" : ["hectometre", "hectometer", "hm"],
                "name": "hectometre",
                "names": "hectometres",
                "mult": 1 / 0.9144 * 100,
            },
            {
                "possibleNames" : ["decametre", "decameter", "dam"],
                "name": "decametre",
                "names": "decametres",
                "mult": 1 / 0.9144 * 10,
            },
            {
                "possibleNames" : ["metre", "m", "meter"],
                "name": "metre",
                "names": "metres",
                "mult": 1 / 0.9144,
            },
            {
                "possibleNames" : ["decimetre", "decimeter", "dm"],
                "name": "decimetre",
                "names": "decimetres",
                "mult": 1 / 0.9144 / 10,
            },
            {
                "possibleNames" : ["centimetre", "centimeter", "cm"],
                "name": "centimetre",
                "names": "centimetres",
                "mult": 1 / 0.9144 / 100,
            },
            {
                "possibleNames" : [undefined, "", "yard", "yrd", "yd", "y"],
                "name": "yard",
                "names": "yards",
                "mult": 1,
            },
            {
                "possibleNames" : ["sp", "span"],
                "name": "span",
                "names": "spans",
                "mult": 0.75,
            },
            {
                "possibleNames" : ["link", "li", "lnk", "l"],
                "name": "link",
                "names": "links",
                "mult": (33 / 50 / 3),
            },
            {
                "possibleNames" : ["'", "foot", "feet", "ft"],
                "name": "foot",
                "names": "feet",
                "mult": 1 / 3,
            },
            {
                "possibleNames" : ["inch", "in", '"', "''"],
                "name": "inch",
                "names": "inchs",
                "mult": 1 / 36,
            },
        ]
    }

    // This method returns the normal distance penalty based on the Size/Speed/Range table
    // Distance is given in yards.
    static distancePenalty(distance){
        if (distance <= 2) {
            return 0;
        }
        else if (distance <= 3) {
            return -1;
        }
        else if (distance <= 5) {
            return -2;
        }
        else if (distance <= 7) {
            return -3;
        }
        else if (distance <= 10) {
            return -4;
        }
        else if (distance <= 15) {
            return -5;
        }
        else if (distance <= 20) {
            return -6;
        }
        else if (distance <= 30) {
            return -7;
        }
        else if (distance <= 50) {
            return -8;
        }
        else if (distance <= 70) {
            return -9;
        }
        else if (distance <= 100) {
            return -10;
        }
        else {
            return Math.min(Math.floor(2 - (6 * Math.log10(distance))),0);
        }
    }

    // This method takes the distance in yards and returns the long range distance penalty
    static longDistancePenalty(distance){
        let penalty = 0;
        if (distance <= 200){
            penalty = 0;
        }
        else if (distance <= 880){ // Half a mile
            penalty = -1;
        }
        else if (distance <= (1760 * 1)){ // One mile
            penalty = -2;
        }
        else if (distance <= (1760 * 3)){ // Three miles, distance to the horizon for a 6ft humanoid
            penalty = -3;
        }
        else if (distance <= (1760 * 10)){ // Ten miles, distance to the horizon for a warship
            penalty = -4;
        }
        else if (distance <= (1760 * 30)){ // Thirty miles
            penalty = -5;
        }
        else if (distance <= (1760 * 100)){
            penalty = -6;
        }
        else if (distance <= (1760 * 300)){
            penalty = -7;
        }
        else if (distance <= (1760 * 1000)){
            penalty = -8;
        }
        else if (distance <= (1760 * 3000)){
            penalty = -9;
        }
        else if (distance <= (1760 * 10000)){ // Less than half the circumference of the earth (12,450 miles)
            penalty = -10;
        }
        else if (distance <= (1760 * 30000)){ // Greater than the circumference of the earth (24,901 miles)
            penalty = -11;
        }
        else if (distance <= (1760 * 100000)){
            penalty = -12;
        }
        else if (distance <= (1760 * 300000)){ // Distance from the centre of the earth to the centre of the moon (238,855 miles)
            penalty = -13;
        }
        else if (distance <= (1760 * 1000000)){
            penalty = -14;
        }
        else if (distance <= (1760 * 3000000)){
            penalty = -15;
        }
        else if (distance <= (1760 * 10000000)){
            penalty = -16;
        }
        else if (distance <= (1760 * 30000000)){
            penalty = -17;
        }
        else if (distance <= (1760 * 100000000)){ // Distance from the earth to the sun 90,000,000 mi
            penalty = -18;
        }
        else if (distance <= (1760 * 300000000)){ // Distance from one edge of Earth's orbit to the other 180,000,000 mi
            penalty = -19;
        }

        return penalty;
    }

    static sizeToDistance(sm){

        if (sm >= 0) {
            return Math.round(10 ** (((sm % 6)+2)/6)) * (10 ** Math.floor(sm/6));
        }
        else if (sm == -1) {
            return 1.5
        }
        else if (sm == -2) {
            return 1
        }
        else if (sm == -3) {
            return 2/3
        }
        else if (sm == -4) {
            return 0.5
        }
        else if (sm == -5) {
            return 1/3
        }
        else if (sm == -6) {
            return 2/3/3
        }
        else if (sm == -7) {
            return 3/7/3
        }
        else if (sm == -8) {
            return 1/4/3
        }
        else if (sm == -9) {
            return 1/6/3
        }
        else if (sm == -10) {
            return 1/8/3
        }
        else if (sm == -11) {
            return 1/36
        }
        else if (sm == -12) {
            return 2/3/36
        }
        else if (sm == -13) {
            return 1/2/36
        }
        else if (sm == -14) {
            return 1/3/36
        }
        else if (sm == -15) {
            return 1/5/36
        }
    }
}
