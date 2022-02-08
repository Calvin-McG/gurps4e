import { attributeHelpers } from "./attributeHelpers.js";

export class skillHelpers {
    static computeSkillLevel(actor, item) {
        let level = 0;
        if (actor.data) { // Make sure there's an actor before computing skill level
            let category = item.category;
            let defaults = item.defaults;
            let difficulty = item.difficulty;
            let baseAttr = item.baseAttr;
            let baseSkill = item.baseSkill;
            let minLevel = item.minLevel;
            let maxLevel = item.maxLevel;
            let dabblerPoints = item.dabblerPoints;
            let pts = item.points;
            let mod = item.mod;
            let base = 0;
            let points = pts;
            let skillDefaultArray = [];
            let attrDefaultArray = [];
            let dabblerBonus = Math.min(dabblerPoints, 3) // If they have four points in dabbler, the bonus is only +3
            let smDiscount = attributeHelpers.calcSMDiscount(actor.data.data.bio.sm);
            let st = attributeHelpers.calcStOrHt(actor.data.data.primaryAttributes.strength, smDiscount)
            let dx = attributeHelpers.calcDxOrIq(actor.data.data.primaryAttributes.dexterity);
            let iq = attributeHelpers.calcDxOrIq(actor.data.data.primaryAttributes.intelligence);
            let ht = attributeHelpers.calcStOrHt(actor.data.data.primaryAttributes.health, 1);
            let per = attributeHelpers.calcPerOrWill(iq, actor.data.data.primaryAttributes.perception);
            let will = attributeHelpers.calcPerOrWill(iq, actor.data.data.primaryAttributes.will);

            if (category === 'skill') { // It's a skill
                // Figure out defaults
                let q = 0;
                while (defaults[q]) { // While the current entry is not null
                    // Check attributes first, add any results to the array of attribute defaults
                    if (defaults[q].skill.toUpperCase() === 'ST' || defaults[q].skill.toUpperCase() === 'STRENGTH') {
                        attrDefaultArray.push(st + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'DX' || defaults[q].skill.toUpperCase() === 'DEXTERITY') {
                        attrDefaultArray.push(dx + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'IQ' || defaults[q].skill.toUpperCase() === 'INTELLIGENCE') {
                        attrDefaultArray.push(iq + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'HT' || defaults[q].skill.toUpperCase() === 'HEALTH') {
                        attrDefaultArray.push(ht + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'PER' || defaults[q].skill.toUpperCase() === 'PERCEPTION') {
                        attrDefaultArray.push(per + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'WILL') {
                        attrDefaultArray.push(will + +defaults[q].mod);
                    }
                    // Then check other skills, add any results to the array of skill defaults
                    else {
                        for (let i = 0; i < actor.data.items._source.length; i++) { // Loop through the list of items
                            if (actor.data.items._source[i].type === "Rollable") { // Make sure it's a Rollable
                                if (actor.data.items._source[i].data.category === "skill") { // Make sure it's a skill and not a technique
                                    if (actor.data.items._source[i].data.points > 0) { // Make sure it has more than 0 points
                                        if (defaults[q].skill === actor.data.items._source[i].name) { // Make sure it matches the name
                                            let defaultLevel = this.computeSkillLevelWithoutDefaults(actor, actor.data.items._source[i].data.difficulty, actor.data.items._source[i].data.baseAttr, actor.data.items._source[i].data.points, actor.data.items._source[i].data.mod)
                                            skillDefaultArray.push(+defaultLevel + +defaults[q].mod);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    q++;
                }
                // We now have a lists of all skill and attribute defaults
                // Add zeros to both arrays to make sure they're not empty. Otherwise Math.max evaluates to -Infinity
                attrDefaultArray.push(0);
                skillDefaultArray.push(0);

                if (points <= 0 || (difficulty == "W" && points < 3)) { // They haven't spent any points, or have spent too few points to make a difference for a Wildcard skill. Display default, after account for dabbler
                    let bestAttrDefault = Math.max(...attrDefaultArray); // Get all the attr defaults and pick the highest
                    let bestSkillDefault = Math.max(...skillDefaultArray); // Get all the skill defaults and pick the highest
                    bestAttrDefault += +dabblerBonus; // Add the dabbler bonus, but only to the attr default (Per PU2:16)
                    bestAttrDefault = Math.min(bestAttrDefault, this.onePointInSkill(baseAttr, difficulty, actor)-1) // Cap the boosted default to one less than what you'd get spending points
                    level = Math.max(bestAttrDefault, bestSkillDefault, 0) + mod; // Set the value either to their best default or 0, whichever is highest, plus the modifier
                }
                else if(points > 0){ // They have spent points, calculate accordingly, including buying up from defaults
                    base = this.getBaseAttrValue(baseAttr, actor) // Get the base value of the relevant attribute
                    let bestDefault = Math.max(...skillDefaultArray, ...attrDefaultArray); // Get the best default

                    if (bestDefault >= this.onePointInSkill(baseAttr, difficulty, actor)){ // The best default is equal to or better than what you'd get by spending points. Account for Improving Skills from Default (B. 173)
                        points = points + this.defaultIsWorth(baseAttr, difficulty, bestDefault, actor); // The effective point value is whatever they put in, plus whatever their default is worth.
                    }

                    // Compute skill value based on effective points spent on the skill
                    level = base + this.pointsToBonus(points, difficulty) + mod;
                }
            }

            else { // It's a technique
                // Loop through all the skills on the sheet, find the one they picked and set that as the base
                for (let i = 0; i < actor.data.items._source.length; i++){
                    if (actor.data.items._source[i].type === "Rollable"){
                        if (actor.data.items._source[i].data.category === "skill"){
                            if (baseSkill === actor.data.items._source[i].name){
                                base = this.computeSkillLevelWithoutDefaults(actor, actor.data.items._source[i].data)

                                this.data.data.baseSkillLevel = base;
                            }
                        }
                    }
                }

                //Modify Base Skill with Base Penalty
                level = base + minLevel;

                //Adjust for difficulty
                if (difficulty == 'A') {
                    if (points > 0){//They have spent points
                        level = level + points;
                    }
                }
                else if (difficulty == 'H') {
                    if (points >= 2){//They have spent enough points to matter
                        level = level + points - 1;//First level costs 2, every other costs 1
                    }
                }
                level = Math.min((level + mod), (maxLevel + base));
            }
        }
        return level;
    }

    static computeSkillLevelWithoutDefaults(actor, difficulty, baseAttr, points, mod) {
        let level = 0;
        if (actor.data) { // Make sure there's an actor before computing skill level
            let base = this.getBaseAttrValue(baseAttr, actor) // Get the base value of the relevant attribute
            // Compute skill value based on points spent on the skill
            level = base + this.pointsToBonus(points, difficulty) + mod;
        }

        return level;
    }

    static computeSpellLevel(actor, points, mod, attributeMod, difficulty, magery, attribute) {
        let level = 0;
        let totalMagicAttribute = 0;
        if (attribute != "") { // Attribute is not blank
            totalMagicAttribute += this.getBaseAttrValue(attribute, actor)
        }
        totalMagicAttribute += attributeMod ? attributeMod : 0;
        totalMagicAttribute += magery ? magery : 0;
        actor.data.data.magicalAbility = totalMagicAttribute;

        if (points <= 0 || (difficulty == "W" && points < 3)) { // They haven't spent any points, or have spent too few points to make a difference for a Wildcard skill. Display default, after account for dabbler
            level = mod;
        }
        else if(points > 0){ // They have spent points, calculate accordingly, including buying up from defaults
            // Compute skill value based on effective points spent on the skill
            level = totalMagicAttribute + this.pointsToBonus(points, difficulty) + mod;
        }

        return level;
    }

    static getBaseAttrValue(baseAttr, actor) {
        let base = 0;
        if (baseAttr.toUpperCase() == 'ST' || baseAttr.toUpperCase() == 'STRENGTH'){
            let smDiscount = attributeHelpers.calcSMDiscount(actor.data.data.bio.sm)
            base = attributeHelpers.calcStOrHt(actor.data.data.primaryAttributes.strength, smDiscount);
        }
        else if (baseAttr.toUpperCase() == 'DX' || baseAttr.toUpperCase() == 'DEXTERITY') {
            base = attributeHelpers.calcDxOrIq(actor.data.data.primaryAttributes.dexterity);
        }
        else if (baseAttr.toUpperCase() == 'IQ' || baseAttr.toUpperCase() == 'INTELLIGENCE') {
            base = attributeHelpers.calcDxOrIq(actor.data.data.primaryAttributes.intelligence);
        }
        else if (baseAttr.toUpperCase() == 'HT' || baseAttr.toUpperCase() == 'HEALTH') {
            base = attributeHelpers.calcStOrHt(actor.data.data.primaryAttributes.health, 1);
        }
        else if (baseAttr.toUpperCase() == 'PER' || baseAttr.toUpperCase() == 'PERCEPTION') {
            base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(actor.data.data.primaryAttributes.intelligence), actor.data.data.primaryAttributes.perception);
        }
        else if (baseAttr.toUpperCase() == 'WILL') {
            base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(actor.data.data.primaryAttributes.intelligence), actor.data.data.primaryAttributes.will);
        }
        return base;
    }

    static onePointInSkill(baseAttr, difficulty, actor) {
        let baseAttrValue = this.getBaseAttrValue(baseAttr, actor)

        switch (difficulty){
            case "E":
                return baseAttrValue;
            case "A":
                return baseAttrValue-1;
            case "H":
                return baseAttrValue-2;
            case "VH":
                return baseAttrValue-3;
            case "W":
                return baseAttrValue-4;
            default:
                return -1;
        }
    }

    static defaultIsWorth(baseAttr, difficulty, dfault, actor){
        let baseAttrValue = this.getBaseAttrValue(baseAttr, actor);
        let difference = dfault - baseAttrValue;
        let worth = 0;

        if (difficulty == "E"){
            if (difference == 0){
                worth = 1;
            }
            else if (difference == 1){
                worth = 2;
            }
            else if (difference > 1){
                worth = (difference - 1) * 4;
            }
        }
        else if (difficulty == "A"){
            if (difference == -1){
                worth = 1;
            }
            else if (difference == 0){
                worth = 2;
            }
            else if (difference > 0){
                worth = (difference) * 4;
            }
        }
        else if (difficulty == "H"){
            if (difference == -2){
                worth = 1;
            }
            else if (difference == -1){
                worth = 2;
            }
            else if (difference > -1){
                worth = (difference + 1) * 4;
            }
        }
        else if (difficulty == "VH"){
            if (difference == -3){
                worth = 1;
            }
            else if (difference == -2){
                worth = 2;
            }
            else if (difference > -2){
                worth = (difference + 2) * 4;
            }
        }
        else if (difficulty == "W"){
            if (difference == -3){
                worth = 3;
            }
            else if (difference == -2){
                worth = 6;
            }
            else if (difference > -2){
                worth = (difference + 2) * 12;
            }
        }
        return worth;
    }

    static pointsToBonus(pts, difficulty){
        let points = pts;
        let bonus = 0;

        //Correct for Wilcard point costs
        if (difficulty == "W"){
            points = Math.floor(points/3)//Wildcards cost triple, but otherwise behave as VH skills
        }

        //Get base skill modifier for points spent
        if (points == 1){
            bonus = 0;
        }
        else if (points == 2 || points == 3){
            bonus = 1
        }
        else if (points >= 4){
            bonus = 1 + +Math.floor(points/4);
        }

        //Correct for difficulty
        switch (difficulty){
            case "E":
                bonus = bonus;
                break;
            case "A":
                bonus = bonus - 1;
                break;
            case "H":
                bonus = bonus - 2;
                break;
            case "VH":
            case "W":
                bonus = bonus - 3;
                break;
            default:
                bonus = bonus;
                break;
        }

        return bonus;
    }
}
