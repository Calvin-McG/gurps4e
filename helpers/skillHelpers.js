import { attributeHelpers } from "./attributeHelpers.js";

export class skillHelpers {

    static trainingTimeToPoints(trainingTime, modifier) {
        let effectiveHours = 0;

        // Work out the number of hours needed per character point
        let neededHours;
        if (typeof modifier !== "undefined") { // If the modifier came through cleanly
            neededHours = 200 * (100 - Math.abs(modifier)) / 100; // Convert -10 or +10 both to a -10%
        }
        else {
            neededHours = 200;
        }

        // Total up the effect of each different type of training time
        if (typeof trainingTime.onTheJob !== "undefined" && !isNaN(trainingTime.onTheJob)) { // Value exists and is non NaN
            effectiveHours += trainingTime.onTheJob / 4;
        }
        if (typeof trainingTime.selfStudy !== "undefined" && !isNaN(trainingTime.selfStudy)) { // Value exists and is non NaN
            effectiveHours += trainingTime.selfStudy / 2;
        }
        if (typeof trainingTime.education !== "undefined" && !isNaN(trainingTime.education)) { // Value exists and is non NaN
            effectiveHours += trainingTime.education;
        }
        if (typeof trainingTime.intensiveTraining !== "undefined" && !isNaN(trainingTime.intensiveTraining)) { // Value exists and is non NaN
            effectiveHours += trainingTime.intensiveTraining / 0.5;
        }

        let dabbler = 0;

        if (game.settings.get("gurps4e", "hoursToDabblerPoints")) { // If we're letting partial training count as dabbler points
            if (effectiveHours < neededHours) { // They don't have enough hours to equal a full point
                if (effectiveHours >= (neededHours / 2)) { // They have half of what they need, or more
                    dabbler = 4
                }
                else if (effectiveHours >= (neededHours / 4)) { // They have a quarter of what they need, or more
                    dabbler = 2
                }
                else if (effectiveHours >= (neededHours / 8)) { // They have an eighth of what they need, or more
                    dabbler = 1
                }
            }
        }

        let effectivePoints = Math.floor(effectiveHours / neededHours * 100) / 100; // Round effective points to two decimals.

        return [Math.floor(effectiveHours * 100) / 100, effectivePoints, Math.floor(effectiveHours), Math.floor(effectivePoints), neededHours, dabbler]; // Return both two-decimal and no-decimal versions of our hour and point totals.
    }

    // This method computes the parry level
    // actor is the actor who has the parry
    // baseSkill is the name of the skill for which we are computing the parry
    // defenceMod is the modifier on the final parry, like the +2 on a staff or +3 on large shields.
    // block is a boolean, when true, calculate as for a block. Otherwise assume it's a parry
    static computeParryOrBlockLevel(actor, baseSkill, defenceMod, block) {
        let base = this.getBaseSkillOrAttributeLevel(actor, baseSkill);

        // Run the logic to convert a skill to a parry or block
        base = (+base / 2); // Half skill...
        base = +base + 3; // ...plus three.
        if (typeof defenceMod !== "undefined") {
            base = +base + +defenceMod; // Apply any further modifier, like the +2 from a staff or +3 for large shields.
        }

        if (actor.system.flag.combatReflexes) { // Apply combat reflexes if present
            base += 1;
        }

        if (block) { // If it's a block, apply any enhanced block. If it's a parry, apply any enhanced parry.
            if (actor.system.enhanced.block) {
                base += actor.system.enhanced.block;
            }
        }
        else {
            if (actor.system.enhanced.parry) {
                base += actor.system.enhanced.parry;
            }
        }

        return Math.floor(base); // Round down in case the division above left us with a decimal
    }

    static computeSkillLevel(actor, item, blockBuyingUpFromDefaults) {
        let level = 0;
        if (actor.system) { // Make sure there's an actor before computing skill level
            let category = item.category;
            let defaults = item.defaults;
            let difficulty = item.difficulty;
            let baseAttr = item.baseAttr;
            let baseSkill = "";
            if (item.baseSkill) {
                baseSkill = item.baseSkill.toUpperCase();
            }
            let minLevel = item.minLevel;
            let maxLevel = item.maxLevel;
            let dabblerPoints = 0;
            if (typeof item.dabblerPoints !== 'undefined') {
                dabblerPoints = item.dabblerPoints;
            }
            let defenceTechnique = typeof item.defenceTechnique !== "undefined" ? item.defenceTechnique : ""; // If we have a defenceTechnique value, use it. Otherwise default to ""
            let defenceTechniqueMod = defenceTechnique === "block" || defenceTechnique === "parry" ? item.defenceTechniqueMod : 0; // If it's a defence technique, store the mod. Otherwise set to zero.
            let halfPriceTechnique = item.halfPriceTechnique;
            let pts = item.points;
            let mod = item.mod;
            let base = 0;
            let points = pts;
            let skillDefaultArray = [];
            let attrDefaultArray = [];
            let dabblerBonus = Math.min(dabblerPoints, 3) // If they have four points in dabbler, the bonus is only +3
            let smDiscount = attributeHelpers.calcSMDiscount(actor.system.bio.sm);
            let st = attributeHelpers.calcStOrHt(actor.system.primaryAttributes.strength, smDiscount)
            let dx = attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.dexterity);
            let iq = attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence);
            let ht = attributeHelpers.calcStOrHt(actor.system.primaryAttributes.health, 1);
            let per = attributeHelpers.calcPerOrWill(iq, actor.system.primaryAttributes.perception);
            let will = attributeHelpers.calcPerOrWill(iq, actor.system.primaryAttributes.will);

            if (category === 'skill') { // It's a skill

                // Figure out defaults
                let q = 0;
                while (defaults[q]) { // While the current entry is not null
                    // Check attributes first, add any results to the array of attribute defaults
                    if (defaults[q].skill.toUpperCase() === 'ST' || defaults[q].skill.toUpperCase() === 'STRENGTH') {
                        attrDefaultArray.push(Math.min(20, st) + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'DX' || defaults[q].skill.toUpperCase() === 'DEXTERITY') {
                        attrDefaultArray.push(Math.min(20, dx) + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'IQ' || defaults[q].skill.toUpperCase() === 'INTELLIGENCE') {
                        attrDefaultArray.push(Math.min(20, iq) + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'HT' || defaults[q].skill.toUpperCase() === 'HEALTH') {
                        attrDefaultArray.push(Math.min(20, ht) + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'PER' || defaults[q].skill.toUpperCase() === 'PERCEPTION') {
                        attrDefaultArray.push(Math.min(20, per) + +defaults[q].mod);
                    }
                    else if (defaults[q].skill.toUpperCase() === 'WILL') {
                        attrDefaultArray.push(Math.min(20, will) + +defaults[q].mod);
                    }
                    // Then check other skills, add any results to the array of skill defaults
                    else {
                        for (let i = 0; i < actor.items.contents.length; i++) { // Loop through the list of items
                            if (actor.items.contents[i].type === "Rollable") { // Make sure it's a Rollable
                                if (actor.items.contents[i].system.category === "skill") { // Make sure it's a skill and not a technique
                                    if (actor.items.contents[i].system.points > 0) { // Make sure it has more than 0 points
                                        if (defaults[q].skill === actor.items.contents[i].name) { // Make sure it matches the name
                                            let defaultLevel = this.computeSkillLevelWithoutDefaults(actor, actor.items.contents[i].system.difficulty, actor.items.contents[i].system.baseAttr, actor.items.contents[i].system.points, actor.items.contents[i].system.mod)
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
                    if (bestAttrDefault > 0) { // If there's an actual attribute default
                        bestAttrDefault += +dabblerBonus; // Add the dabbler bonus, but only to the attr default (Per PU2:16)
                    }
                    bestAttrDefault = Math.min(bestAttrDefault, this.onePointInSkill(baseAttr, difficulty, actor)-1) // Cap the boosted default to one less than what you'd get spending points
                    level = Math.max(bestAttrDefault, bestSkillDefault, 0) + mod; // Set the value either to their best default or 0, whichever is highest, plus the modifier
                }
                else if(points > 0){ // They have spent points, calculate accordingly, including buying up from defaults
                    base = this.getBaseAttrValue(baseAttr, actor) // Get the base value of the relevant attribute
                    let bestDefault = Math.max(...skillDefaultArray, ...attrDefaultArray); // Get the best default

                    if (bestDefault >= this.onePointInSkill(baseAttr, difficulty, actor)){ // The best default is equal to or better than what you'd get by spending points. Account for Improving Skills from Default (B. 173)
                        if (!blockBuyingUpFromDefaults) {
                            points = points + this.defaultIsWorth(baseAttr, difficulty, bestDefault, actor); // The effective point value is whatever they put in, plus whatever their default is worth.
                        }
                    }

                    // Compute skill value based on effective points spent on the skill
                    level = base + this.pointsToBonus(points, difficulty) + mod;
                }
            }

            else { // It's a technique
                if (typeof defenceTechnique !== "undefined" && defenceTechnique === "") { // If it's not a defence technique, calculate base as for a skill.
                    base = this.getBaseSkillOrAttributeLevel(actor, baseSkill);
                }
                else if (defenceTechnique === "parry") {
                    base = this.computeParryOrBlockLevel(actor, baseSkill, defenceTechniqueMod, false);
                }
                else if (defenceTechnique === "block") {
                    base = this.computeParryOrBlockLevel(actor, baseSkill, defenceTechniqueMod, true);
                }
                else { // It's a dodge
                    base = attributeHelpers.getActorDodge(actor, defenceTechniqueMod);
                }

                item.baseSkillLevel = base;

                //Modify Base Skill with Base Penalty
                level = base + minLevel;

                //Adjust for difficulty
                if (difficulty === 'A') {
                    if (points > 0){ // They have spent points
                        level = level + points;
                        if (halfPriceTechnique) {
                            level += points; // If it's a half price technique, add the value from the points a second time.
                        }
                    }
                }
                else if (difficulty === 'H') {
                    if (points >= 2){//They have spent enough points to matter
                        level = level + points - 1;//First level costs 2, every other costs 1
                    }
                    if (halfPriceTechnique) {
                        level += points; // If it's a half price technique, add the value from the points a second time.
                    }
                }
                level = Math.min((level + mod), (maxLevel + base));
            }
        }
        return level;
    }

    // Actor is the actor object, baseSkill is the string we have been passed, which might also be an attribute
    static getBaseSkillOrAttributeLevel(actor, baseSkill) {
        let base = 0;

        baseSkill = baseSkill.toUpperCase();
        // TODO - Use fetchStat from actorHelpers 1855
        // First, check to see if they're basing the defence off of an attribute
        if (baseSkill === 'ST' || baseSkill=== 'STRENGTH') {
            base = attributeHelpers.calcStOrHt(actor.system.primaryAttributes.strength, attributeHelpers.calcSMDiscount(actor.system.bio.sm));
        }
        else if (baseSkill === 'DX' || baseSkill === 'DEXTERITY') {
            base = attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.dexterity);
        }
        else if (baseSkill === 'IQ' || baseSkill === 'INTELLIGENCE') {
            base = attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence);
        }
        else if (baseSkill === 'HT' || baseSkill === 'HEALTH') {
            base = attributeHelpers.calcStOrHt(actor.system.primaryAttributes.health, 1);
        }
        else if (baseSkill === 'PER' || baseSkill === 'PERCEPTION') {
            base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence), actor.system.primaryAttributes.perception);
        }
        else if (baseSkill === 'WILL') {
            base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence), actor.system.primaryAttributes.will);
        }
        else { // Only then check the skills to see if any match.
            for (let i = 0; i < actor.items.contents.length; i++){
                if (actor.items.contents[i].type === "Rollable"){
                    if (actor.items.contents[i].system.category === "skill"){
                        if (baseSkill === actor.items.contents[i].name.toUpperCase()){
                            base = this.computeSkillLevelWithoutDefaults(actor, actor.items.contents[i].system.difficulty, actor.items.contents[i].system.baseAttr, actor.items.contents[i].system.points, actor.items.contents[i].system.mod);
                        }
                    }
                }
            }
        }

        return base;
    }

    static computeSkillLevelWithoutDefaults(actor, difficulty, baseAttr, points, mod) {
        let level = 0;
        if (actor.system) { // Make sure there's an actor before computing skill level
            let base = this.getBaseAttrValue(baseAttr, actor) // Get the base value of the relevant attribute
            // Compute skill value based on points spent on the skill
            level = base + this.pointsToBonus(points, difficulty) + mod;
        }

        return level;
    }

    static computeSpellLevelFromActorAndSpell(actor, spell) {
        return this.computeSpellLevel(actor, spell.system.points, spell.system.mod, actor.system.magic.attributeMod, spell.system.difficulty, actor.system.magic.magery, actor.system.magic.attribute);
    }

    static computeSpellLevel(actor, points, mod, attributeMod, difficulty, magery, attribute) {
        let level = 0;
        let totalMagicAttribute = 0;
        if (attribute != "") { // Attribute is not blank
            totalMagicAttribute += this.getBaseAttrValue(attribute, actor)
        }
        totalMagicAttribute += attributeMod ? attributeMod : 0;
        totalMagicAttribute += magery ? magery : 0;
        actor.system.magicalAbility = totalMagicAttribute;

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
        if (baseAttr.toUpperCase() === 'ST' || baseAttr.toUpperCase() === 'STRENGTH'){
            let smDiscount = attributeHelpers.calcSMDiscount(actor.system.bio.sm)
            base = attributeHelpers.calcStOrHt(actor.system.primaryAttributes.strength, smDiscount);
        }
        else if (baseAttr.toUpperCase() === 'DX' || baseAttr.toUpperCase() === 'DEXTERITY') {
            base = attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.dexterity);
        }
        else if (baseAttr.toUpperCase() === 'IQ' || baseAttr.toUpperCase() === 'INTELLIGENCE') {
            base = attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence);
        }
        else if (baseAttr.toUpperCase() === 'HT' || baseAttr.toUpperCase() === 'HEALTH') {
            base = attributeHelpers.calcStOrHt(actor.system.primaryAttributes.health, 1);
        }
        else if (baseAttr.toUpperCase() === 'PER' || baseAttr.toUpperCase() === 'PERCEPTION') {
            base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence), actor.system.primaryAttributes.perception);
        }
        else if (baseAttr.toUpperCase() === 'WILL') {
            base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence), actor.system.primaryAttributes.will);
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

    // This method takes an actor and a skill name, and returns the item object for the rollable that matches name name.
    static getSkillObjectByName(name, actor){
        for (let i = 0; i < actor.items.contents.length; i++) { // Loop through all the items on the sheet.
            if (actor.items.contents[i].type.toLowerCase() === "rollable"){ // Only examine the rollables
                if (actor.items.contents[i].name.toLowerCase() === name.toLowerCase()) { // Check that the name matches what the method was given
                    return actor.items.contents[i]; // Return the skill we are currently looking at.
                }
            }
        }

        return undefined; // If nothing was found, return undefined.
    }

    static getSkillLevelByName(name, actor){
        let skill = this.getSkillObjectByName(name, actor);

        if (typeof skill === 'undefined') { // If there was no skill, return undefined.
            return undefined;
        }
        else { // There was a skill, so return the level.
            return skill.system.level;
        }
    }

    // Takes in effective skill and returns the chance of success.
    static skillLevelToProbability(skill) {
        if (skill > 16){ // Anything above a 16 still fails on 17+
            skill = 16;
        }
        else {
            skill = Math.round(skill); // Make sure there's no decimals
        }
        let prob = 0; // By default, assume probability of zero to cover skills below 3.
        switch(skill) {
            case 3:
                prob = 0.00462962962963;
                break;
            case 4:
                prob = 0.01851851851853;
                break;
            case 5:
                prob = 0.046296296296329995;
                break;
            case 6:
                prob = 0.09259259259263;
                break;
            case 7:
                prob = 0.16203703703703;
                break;
            case 8:
                prob = 0.25925925925922996;
                break;
            case 9:
                prob = 0.375;
                break;
            case 10:
                prob = 0.50;
                break;
            case 11:
                prob = 0.625;
                break;
            case 12:
                prob = 0.7407407407412299;
                break;
            case 13:
                prob = 0.8379629629634299;
                break;
            case 14:
                prob = 0.9074074074078298;
                break;
            case 15:
                prob = 0.9537037037041299;
                break;
            case 16:
                prob = 0.9814814814819299;
                break;
            default:
                break;
        }

        return prob;
    }
}
