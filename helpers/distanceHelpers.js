
export class distanceHelpers {

    static getRayEnd(originX, originY, length, direction, gridSizeRaw) {
        let directionInRadians = (direction) * Math.PI / 180.0;

        return {
            x: originX + (length * gridSizeRaw * Math.cos(directionInRadians)),
            y: originY + (length * gridSizeRaw * Math.sin(directionInRadians))
        };
    }

    // point is an object with x and y values and is the point you are measuring to.
    // x1, y1 to x2, y2 is your line segment.
    static distanceFromBeamToPoint(point, x1, y1, x2, y2, gridSizeRaw) {
        let A = point.x - x1;
        let B = point.y - y1;
        let C = x2 - x1;
        let D = y2 - y1;

        let dot = A * C + B * D;
        let len_sq = C * C + D * D;
        let param = -1;

        if (len_sq != 0) { // In case of 0 length line
            param = dot / len_sq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        let dx = point.x - xx;
        let dy = point.y - yy;
        return {
            "distance": Math.sqrt(dx * dx + dy * dy) / gridSizeRaw,
            "adjacent": (0 < param <= 1) // If param is more than zero but not more than 1, our point is adjacent to the line segment.
        };
    }

    // gridSizeRaw takes in the value from canvas.scene.grid.size
    // The points are each tokens.
    static measureDistance(point1, point2, gridSizeRaw) {
        let rawDistance = this.measureRawDistance(point1, point2)

        return rawDistance / gridSizeRaw;
    }

    static measureRawDistance(point1, point2) {
        let a = point1.x - point2.x;
        let b = point1.y - point2.y;

        return Math.sqrt( a*a + b*b )
    }

    // This method takes in a number of squares or hexes, and the grid's Unit.
    static convertToYards(dist, gridUnits) {
        // If there's an s at the end of the string, remove it
        if (gridUnits.charAt(gridUnits.length - 1).toLowerCase() === "s"){
            gridUnits = gridUnits.slice(0, -1);
        }

        let selectedUnit = this.getUnitByPossibleNames(gridUnits.toLowerCase())

        return dist * selectedUnit.mult;
    }

    // This method takes in a number of yards and the grid's Unit and returns a raw distance
    static yardsToRaw(yards, gridUnits) {
        // If there's an s at the end of the string, remove it
        if (gridUnits.charAt(gridUnits.length - 1).toLowerCase() === "s"){
            gridUnits = gridUnits.slice(0, -1);
        }

        let selectedUnit = this.getUnitByPossibleNames(gridUnits.toLowerCase())

        return yards / selectedUnit.mult;
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
                "mult": 1760 * 1.151 / 10,
            },
            {
                "possibleNames" : ["furlong", "fur"],
                "name": "furlong",
                "names": "furlongs",
                "mult": 220,
            },
            {
                "possibleNames" : ["rope", "rp"], // Using Byzantine ropes of 60 feet
                "name": "rope",
                "names": "ropes",
                "mult": 20,
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
                "mult": 22,
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
                "possibleNames" : ["ell", "el"],
                "name": "ell",
                "names": "ells",
                "mult": 1.25,
            },
            {
                "possibleNames" : ["cubit", "cu"],
                "name": "cubit",
                "names": "cubits",
                "mult": 4 / 3, // Using rough value for a Roman Cubit. Royal cubits are the same mult as fathoms
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
                "mult": 0.25,
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
                "names": "inches",
                "mult": 1 / 36,
            },
        ]
    }

    // This method returns the short range distance penalty, which is the negative number of yards.
    static shortDistancePenalty(distance) {
        return (-1 * Math.round(Math.abs(distance)));
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
