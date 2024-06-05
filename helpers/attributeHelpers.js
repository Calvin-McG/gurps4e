import {actorHelpers} from "./actorHelpers.js";
import {skillHelpers} from "./skillHelpers.js";

export class attributeHelpers {

    /**
     * This method takes in an actor and returns their magical ST
     * @param actor - A complete actor object
     * @returns {number}
     */
    static calcMST(actor) {
        let totalMagicAttribute = 0;
        if (actor.system.magic) { // Character has the magic block
            // Calculate the total magical attribute

            if (actor.system.magic.attribute != "") { // Attribute is not blank
                totalMagicAttribute += skillHelpers.getBaseAttrValue(actor.system.magic.attribute, actor);
            }
            totalMagicAttribute += actor.system.magic.attributeMod ? actor.system.magic.attributeMod : 0;
            totalMagicAttribute += actor.system.magic.magery ? actor.system.magic.magery : 0;
        }
        return totalMagicAttribute;
    }

    /**
     * This method takes in an actor and returns their TK ST
     * @param actor - A complete actor object
     * @returns {number}
     */
    static calcTKST(actor){
        let tkSst = 0; // Default TK strength is zero
        if (typeof actor.system.tk !== "undefined") { // If the actor has a tk object
            if (typeof actor.system.tk.magnitude === "number") { // If the actor has a value for their tk striking
                tkSst = actor.system.tk.magnitude + actor.system.tk.strikingAdj;
            }
        }
        return tkSst;
    }

    /**
     * This method takes in a damage input string to determine what type of ST is being used.
     * This helps with throwing range calculations.
     * @param damageInput A damage input string
     * @returns {string}
     */
    static stType(damageInput){
        if (damageInput.toLowerCase().includes("mthr") || damageInput.toLowerCase().includes("msw")) {
            return "M";
        }
        else if (damageInput.toLowerCase().includes("tkthr") || damageInput.toLowerCase().includes("tksw")) {
            return "TK";
        }
        else {
            return "ST";
        }
    }

    static strikingStrengthToThrustDiceAndAdds(sst){
        let dice = 0;
        let adds = 0;

        let split = this.strikingStrengthToThrust(sst).split("d6");
        dice = parseInt(split[0]);
        adds = parseInt(split[1]);

        if (isNaN(adds)) {
            adds = 0;
        }

        return [dice, adds];
    }
    static strikingStrengthToThrust(sst){
        let thrust = "";

        switch(sst) {
            case 0:
                thrust = "0";
                break;
            case 1:
                thrust = "1d6-6";
                break;
            case 2:
                thrust = "1d6-6";
                break;
            case 3:
                thrust = "1d6-5";
                break;
            case 4:
                thrust = "1d6-5";
                break;
            case 5:
                thrust = "1d6-4";
                break;
            case 6:
                thrust = "1d6-4";
                break;
            case 7:
                thrust = "1d6-3";
                break;
            case 8:
                thrust = "1d6-3";
                break;
            case 9:
                thrust = "1d6-2";
                break;
            case 10:
                thrust = "1d6-2";
                break;
            case 11:
                thrust = "1d6-1";
                break;
            case 12:
                thrust = "1d6-1";
                break;
            case 13:
                thrust = "1d6";
                break;
            case 14:
                thrust = "1d6";
                break;
            case 15:
                thrust = "1d6+1";
                break;
            case 16:
                thrust = "1d6+1";
                break;
            case 17:
                thrust = "1d6+2";
                break;
            case 18:
                thrust = "1d6+2";
                break;
            case 19:
                thrust = "2d6-1";
                break;
            case 20:
                thrust = "2d6-1";
                break;
            case 21:
                thrust = "2d6";
                break;
            case 22:
                thrust = "2d6";
                break;
            case 23:
                thrust = "2d6+1";
                break;
            case 24:
                thrust = "2d6+1";
                break;
            case 25:
                thrust = "2d6+2";
                break;
            case 26:
                thrust = "2d6+2";
                break;
            case 27:
                thrust = "3d6-1";
                break;
            case 28:
                thrust = "3d6-1";
                break;
            case 29:
                thrust = "3d6";
                break;
            case 30:
                thrust = "3d6";
                break;
            case 31:
                thrust = "3d6+1";
                break;
            case 32:
                thrust = "3d6+1";
                break;
            case 33:
                thrust = "3d6+2";
                break;
            case 34:
                thrust = "3d6+2";
                break;
            case 35:
                thrust = "4d6-1";
                break;
            case 36:
                thrust = "4d6-1";
                break;
            case 37:
                thrust = "4d6";
                break;
            case 38:
                thrust = "4d6";
                break;
            case 39:
                thrust = "4d6+1";
                break;
            case 40:
                thrust = "4d6+1";
                break;
            case 41:
                thrust = "4d6+1";
                break;
            case 42:
                thrust = "4d6+1";
                break;
            case 43:
                thrust = "4d6+1";
                break;
            case 44:
                thrust = "4d6+1";
                break;
            case 45:
                thrust = "5d6";
                break;
            case 46:
                thrust = "5d6";
                break;
            case 47:
                thrust = "5d6";
                break;
            case 48:
                thrust = "5d6";
                break;
            case 49:
                thrust = "5d6";
                break;
            case 50:
                thrust = "5d6+2";
                break;
            case 51:
                thrust = "5d6+2";
                break;
            case 52:
                thrust = "5d6+2";
                break;
            case 53:
                thrust = "5d6+2";
                break;
            case 54:
                thrust = "5d6+2";
                break;
            case 55:
                thrust = "6d6";
                break;
            case 56:
                thrust = "6d6";
                break;
            case 57:
                thrust = "6d6";
                break;
            case 58:
                thrust = "6d6";
                break;
            case 59:
                thrust = "6d6";
                break;
            case 60:
                thrust = "7d6-1";
                break;
            case 61:
                thrust = "7d6-1";
                break;
            case 62:
                thrust = "7d6-1";
                break;
            case 63:
                thrust = "7d6-1";
                break;
            case 64:
                thrust = "7d6-1";
                break;
            case 65:
                thrust = "7d6+1";
                break;
            case 66:
                thrust = "7d6+1";
                break;
            case 67:
                thrust = "7d6+1";
                break;
            case 68:
                thrust = "7d6+1";
                break;
            case 69:
                thrust = "7d6+1";
                break;
            case 70:
                thrust = "8d6";
                break;
            case 71:
                thrust = "8d6";
                break;
            case 72:
                thrust = "8d6";
                break;
            case 73:
                thrust = "8d6";
                break;
            case 74:
                thrust = "8d6";
                break;
            case 75:
                thrust = "8d6+2";
                break;
            case 76:
                thrust = "8d6+2";
                break;
            case 77:
                thrust = "8d6+2";
                break;
            case 78:
                thrust = "8d6+2";
                break;
            case 79:
                thrust = "8d6+2";
                break;
            case 80:
                thrust = "9d6";
                break;
            case 81:
                thrust = "9d6";
                break;
            case 82:
                thrust = "9d6";
                break;
            case 83:
                thrust = "9d6";
                break;
            case 84:
                thrust = "9d6";
                break;
            case 85:
                thrust = "9d6+2";
                break;
            case 86:
                thrust = "9d6+2";
                break;
            case 87:
                thrust = "9d6+2";
                break;
            case 88:
                thrust = "9d6+2";
                break;
            case 89:
                thrust = "9d6+2";
                break;
            case 90:
                thrust = "10d6";
                break;
            case 91:
                thrust = "10d6";
                break;
            case 92:
                thrust = "10d6";
                break;
            case 93:
                thrust = "10d6";
                break;
            case 94:
                thrust = "10d6";
                break;
            case 95:
                thrust = "10d6+2";
                break;
            case 96:
                thrust = "10d6+2";
                break;
            case 97:
                thrust = "10d6+2";
                break;
            case 98:
                thrust = "10d6+2";
                break;
            case 99:
                thrust = "10d6+2";
                break;
            case 100:
                thrust = "11d6";
                break;
            default:
                thrust = "11d6";
                break;
        }

        return thrust;
    }

    static strikingStrengthToSwing(sst){
        let swing = "";

        switch(sst) {
            case 0:
                swing = "0";
                break;
            case 1:
                swing = "1d6-5";
                break;
            case 2:
                swing = "1d6-5";
                break;
            case 3:
                swing = "1d6-4";
                break;
            case 4:
                swing = "1d6-4";
                break;
            case 5:
                swing = "1d6-3";
                break;
            case 6:
                swing = "1d6-3";
                break;
            case 7:
                swing = "1d6-2";
                break;
            case 8:
                swing = "1d6-2";
                break;
            case 9:
                swing = "1d6-1";
                break;
            case 10:
                swing = "1d6";
                break;
            case 11:
                swing = "1d6+1";
                break;
            case 12:
                swing = "1d6+2";
                break;
            case 13:
                swing = "2d6-1";
                break;
            case 14:
                swing = "2d6";
                break;
            case 15:
                swing = "2d6+1";
                break;
            case 16:
                swing = "2d6+2";
                break;
            case 17:
                swing = "3d6-1";
                break;
            case 18:
                swing = "3d6";
                break;
            case 19:
                swing = "3d6+1";
                break;
            case 20:
                swing = "3d6+2";
                break;
            case 21:
                swing = "4d6-1";
                break;
            case 22:
                swing = "4d6";
                break;
            case 23:
                swing = "4d6+1";
                break;
            case 24:
                swing = "4d6+2";
                break;
            case 25:
                swing = "5d6-1";
                break;
            case 26:
                swing = "5d6";
                break;
            case 27:
                swing = "5d6+1";
                break;
            case 28:
                swing = "5d6+1";
                break;
            case 29:
                swing = "5d6+2";
                break;
            case 30:
                swing = "5d6+2";
                break;
            case 31:
                swing = "6d6-1";
                break;
            case 32:
                swing = "6d6-1";
                break;
            case 33:
                swing = "6d6";
                break;
            case 34:
                swing = "6d6";
                break;
            case 35:
                swing = "6d6+1";
                break;
            case 36:
                swing = "6d6+1";
                break;
            case 37:
                swing = "6d6+2";
                break;
            case 38:
                swing = "6d6+2";
                break;
            case 39:
                swing = "7d6-1";
                break;
            case 40:
                swing = "7d6-1";
                break;
            case 41:
                swing = "7d6-1";
                break;
            case 42:
                swing = "7d6-1";
                break;
            case 43:
                swing = "7d6-1";
                break;
            case 44:
                swing = "7d6-1";
                break;
            case 45:
                swing = "7d6+1";
                break;
            case 46:
                swing = "7d6+1";
                break;
            case 47:
                swing = "7d6+1";
                break;
            case 48:
                swing = "7d6+1";
                break;
            case 49:
                swing = "7d6+1";
                break;
            case 50:
                swing = "8d6-1";
                break;
            case 51:
                swing = "8d6-1";
                break;
            case 52:
                swing = "8d6-1";
                break;
            case 53:
                swing = "8d6-1";
                break;
            case 54:
                swing = "8d6-1";
                break;
            case 55:
                swing = "8d6+1";
                break;
            case 56:
                swing = "8d6+1";
                break;
            case 57:
                swing = "8d6+1";
                break;
            case 58:
                swing = "8d6+1";
                break;
            case 59:
                swing = "8d6+1";
                break;
            case 60:
                swing = "9d6";
                break;
            case 61:
                swing = "9d6";
                break;
            case 62:
                swing = "9d6";
                break;
            case 63:
                swing = "9d6";
                break;
            case 64:
                swing = "9d6";
                break;
            case 65:
                swing = "9d6+2";
                break;
            case 66:
                swing = "9d6+2";
                break;
            case 67:
                swing = "9d6+2";
                break;
            case 68:
                swing = "9d6+2";
                break;
            case 69:
                swing = "9d6+2";
                break;
            case 70:
                swing = "10d6";
                break;
            case 71:
                swing = "10d6";
                break;
            case 72:
                swing = "10d6";
                break;
            case 73:
                swing = "10d6";
                break;
            case 74:
                swing = "10d6";
                break;
            case 75:
                swing = "10d6+2";
                break;
            case 76:
                swing = "10d6+2";
                break;
            case 77:
                swing = "10d6+2";
                break;
            case 78:
                swing = "10d6+2";
                break;
            case 79:
                swing = "10d6+2";
                break;
            case 80:
                swing = "11d6";
                break;
            case 81:
                swing = "11d6";
                break;
            case 82:
                swing = "11d6";
                break;
            case 83:
                swing = "11d6";
                break;
            case 84:
                swing = "11d6";
                break;
            case 85:
                swing = "11d6+2";
                break;
            case 86:
                swing = "11d6+2";
                break;
            case 87:
                swing = "11d6+2";
                break;
            case 88:
                swing = "11d6+2";
                break;
            case 89:
                swing = "11d6+2";
                break;
            case 90:
                swing = "12d6";
                break;
            case 91:
                swing = "12d6";
                break;
            case 92:
                swing = "12d6";
                break;
            case 93:
                swing = "12d6";
                break;
            case 94:
                swing = "12d6";
                break;
            case 95:
                swing = "12d6+2";
                break;
            case 96:
                swing = "12d6+2";
                break;
            case 97:
                swing = "12d6+2";
                break;
            case 98:
                swing = "12d6+2";
                break;
            case 99:
                swing = "12d6+2";
                break;
            case 100:
                swing = "13d6";
                break;
            default:
                swing = "13d6";
                break;
        }

        return swing;
    }

    static calcSMDiscount(sm){
        let sizeMod = sm;

        if (sizeMod == "" || sizeMod == null || typeof sizeMod == "undefined") {
            sizeMod = 0;
        }

        return Math.min((Math.max(((+10 - +sizeMod.value) / +10), 0.2)) , 1);
    }

    static calcStOrHt(attribute, smDiscount){
        if (smDiscount) {
            return +10 + +attribute.mod + +Math.floor(+attribute.points / +(+10 * +smDiscount));
        }
        else {
            return +10 + +attribute.mod + +Math.floor(+attribute.points / +(+10 * +1));
        }
    }

    static calcDxOrIq(attribute){
        return +10 + +attribute.mod + +Math.floor(attribute.points/20);
    }

    static calcPerOrWill(iq, attribute){
        return +iq + +attribute.mod + +Math.floor(attribute.points/5);
    }

    static calcFright(will, fright){
        return +will + +fright.mod + +Math.floor(fright.points/2)
    }

    static calcSpeed(dx, ht, speed){
        return Math.floor(((+(+dx + +ht) / +4) + +speed.mod + +(speed.points/20)) * +4) / +4;
    }

    static calcMove(speed, move){
        return Math.floor(speed) + +move.mod + +Math.floor(move.points/5)
    }

    static calcDodge(speed, dodge){
        return Math.floor(speed) + +3 + +dodge.mod + +Math.floor(dodge.points/15);
    }

    // This method takes in only an actor object and returns their speed
    static getActorSpeed(actor) {
        let dx = this.calcDxOrIq(actor.system.primaryAttributes.dexterity)
        let ht = this.calcStOrHt(actor.system.primaryAttributes.health, 1);
        return this.calcSpeed(dx, ht, actor.system.primaryAttributes.speed);
    }

    // This method takes in only an actor object and returns their dodge
    // mod is optional
    static getActorDodge(actor, mod) {
        let speed = this.getActorSpeed(actor)
        let dodge = this.calcDodge(speed, actor.system.primaryAttributes.dodge)

        if (typeof mod !== "undefined") {
            dodge += mod;
        }

        if (actor.system.flag.combatReflexes) { // Apply any modifier for combat reflexes
            dodge += 1;
        }

        if (actor.system.enhanced.dodge){ // Apply any modifier for enhanced dodge
            dodge += actor.system.enhanced.dodge;
        }

        dodge += actorHelpers.fetchCurrentEncPenalty(actor); // Apply any penalty from the current enc level

        dodge *= actorHelpers.fetchStatePenalty(actor); // Apply any penalty from low fp or hp

        dodge = Math.max(dodge, 1); // Dodge is always at least one

        return dodge;
    }

    static calcLiftingSt(st, lifting, smDiscount){
        if (smDiscount) {
            return +st + +lifting.mod + +Math.floor(lifting.points / +( +3 * +smDiscount));
        }
        else {
            return +st + +lifting.mod + +Math.floor(lifting.points / +( +3 * +1));
        }
    }

    static calcStrikingSt(st, striking, smDiscount){
        if (smDiscount) {
            return +st + +striking.mod + +Math.floor(striking.points / +(+5 * +smDiscount));
        }
        else {
            return +st + +striking.mod + +Math.floor(striking.points / +(+5 * +1));
        }
    }

    static calcHealthSubdue(ht, subdue){
        return +ht + +subdue.mod + +Math.floor(subdue.points/2);
    }

    static calcHealthKill(ht, death){
        return +ht + +death.mod + +Math.floor(death.points/2);
    }

    static calcHP(st, hp, smDiscount){
        return +st + +hp.mod + +Math.floor(hp.points / +( +2 * +smDiscount));
    }

    static calcFP(ht, fp){
        return +ht + +fp.mod + +Math.floor(fp.points/3);
    }

    static calcER(er){
        return +er.mod + +Math.floor(er.points/3);
    }
}
