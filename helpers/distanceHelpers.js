
export class distanceHelpers {
    static convertToYards(dist, gridUnits) {
        let distance = 0;

        // If there's an s at the end of the string, remove it
        if (gridUnits.charAt(gridUnits.length - 1).toLowerCase() === "s"){
            gridUnits = gridUnits.slice(0, -1);
        }

        switch (gridUnits.toLowerCase()) {
            case undefined:
            case 'yard':
            case 'yrd':
            case 'yd':
            case 'y':
                distance = dist;
                break;
            case 'mile':
            case 'mi':
                distance = dist * 1760;
                break;
            case 'foot':
            case 'feet':
            case 'ft':
            case "'":
                distance = dist / 3;
                break;
            case 'inch':
            case 'in':
            case '"':
            case "''":
                distance = dist / 36;
                break;
            case 'cm':
            case 'centimeter':
            case 'centimetre':
                distance = dist / 91.44;
                break;
            case 'm':
            case 'metre':
            case 'meter':
                distance = dist / 0.9144;
                break;
            case 'km':
            case 'kilometre':
            case 'kilometer':
                distance = dist * 0.0009144;
                break;
            case 'link':
            case 'li':
                distance = dist * (33/50);
                break;
            case 'rod':
            case 'rd':
                distance = dist * (16.5/3);
                break;
            case 'chain':
            case 'ch':
                distance = dist * 11;
                break;
            case 'furlong':
            case 'fur':
                distance = dist * 110;
                break;
            case 'league':
            case 'lea':
                distance = dist * 1760 * 3;
                break;
            case 'sp':
            case 'span':
                distance = dist * 0.75;
                break;
            case 'fathom':
            case 'ftm':
                distance = dist * 2;
                break;
            case 'sh':
            case 'shackle':
                distance = dist * 2 * 15;
                break;
            case 'cable':
            case 'cb':
                distance = dist * 2 * 120;
                break;
            case 'nautical mile':
            case 'nm':
            case 'nmi':
                distance = dist * 1760 * 1.151;
                break;
            case 'pc':
            case 'pace':
                distance = dist * 3 * 2.5;
                break;
            case 'gd':
            case 'st':
            case 'grade':
            case 'step':
                distance = dist * 3 * 2.5 * 2;
                break;
            case 'rp':
            case 'rope':
                distance = dist * 3 * 2.5 * 2 * 4;
                break;
            default:
                throw new Error("Can't match expression to length and unit of measure");
        }

        return distance;
    }

    static getUnitByName(name) {
        const units = this.listUnits();
        if (typeof name != "undefined"){
            units.forEach( unit => {
                if (unit.name.toLowerCase() == name.toLowerCase()) {
                    return unit;
                }
            })
        }

        return undefined;
    }

    // Provides a list of units that are useable by the system
    static listUnits() {
        // Mult is the number of yards in one example of the unit.
        // IE: Multiply the number of units by this multiplier to get the number of yards.
        let units = [
            {
                "name": "league",
                "names": "leagues",
                "mult": 1760 * 3,
            },
            {
                "name": "fathom",
                "names": "fathoms",
                "mult": 1760 * 2,
            },
            {
                "name": "nautical mile",
                "names": "nautical miles",
                "mult": 1760 * 1.151,
            },
            {
                "name": "mile",
                "names": "miles",
                "mult": 1760,
            },
            {
                "name": "kilometre",
                "names": "kilometres",
                "mult": 0.0009144,
            },
            {
                "name": "cable",
                "names": "cables",
                "mult": 240,
            },
            {
                "name": "furlong",
                "names": "furlongs",
                "mult": 110,
            },
            {
                "name": "rope",
                "names": "ropes",
                "mult": 60,
            },
            {
                "name": "shackle",
                "names": "shackles",
                "mult": 30,
            },
            {
                "name": "grade",
                "names": "grades",
                "mult": 15,
            },
            {
                "name": "step",
                "names": "steps",
                "mult": 15,
            },
            {
                "name": "chain",
                "names": "chains",
                "mult": 11,
            },
            {
                "name": "pace",
                "names": "paces",
                "mult": 7.5,
            },
            {
                "name": "rod",
                "names": "rods",
                "mult": 5.5,
            },
            {
                "name": "metre",
                "names": "metres",
                "mult": 1 / 0.9144,
            },
            {
                "name": "yard",
                "names": "yards",
                "mult": 1,
            },
            {
                "name": "span",
                "names": "spans",
                "mult": 0.75,
            },
            {
                "name": "link",
                "names": "links",
                "mult": (33 / 50),
            },
            {
                "name": "foot",
                "names": "feet",
                "mult": 1 / 3,
            },
            {
                "name": "inch",
                "names": "inchs",
                "mult": 1 / 36,
            },
            {
                "name": "centimetre",
                "names": "centimetres",
                "mult": 1 / 91.44,
            },

        ]

        return units;
    }

    // This method returns the normal distance penalty based on the Size/Speed/Range table
    static distancePenalty(distance){
        return Math.min(Math.floor(2 - (6 * Math.log10(distance))),0);
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
