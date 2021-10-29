import { attributeHelpers } from '../../helpers/attributeHelpers.js';

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class gurpsItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   * 
   * Note: This does not appear to do anything that is not already accomplished
   * by template.json but may be part of the functionality required for dynamic 
   * updating of items inline. TBC
   * 
   * Note: This method is called on every item belonging to the actor, not just
   * the one being edited. So, if all the prepareItem methods are pointless we
   * should eliminate them.
   *
   * itemData includes:
   *  _id:""
   *  name:""
   *  type:""
   *  img:""
   *  data:{} - which is specific to a type as defined in template.json
   *    notes:"" - all types have one
   */
  prepareData() {
    super.prepareData();
    // Get the Item's data
    let itemData = this.data;
    let data = itemData.data; // this.data.data

    switch (this.data.type) {
      case "Equipment":
        this._prepareEquipmentData(itemData, data);
        break;
      case "Rollable":
        this._prepareRollableData();
        break;
      case "Spell":
        this._prepareSpellData();
        this.prepareAfflictionData(itemData, data)
        break;
      case "Trait":
        this._prepareTraitData();
        break;
      default: // not a supported type
        return ui.notifications.error("This type of item is not supported in the system!");
    }
    this.prepareAttackData()
  }

  _prepareEquipmentData(itemData, data) {
    // Check for undefined on cost, weight, and quantity
    if (typeof data.cost === undefined || typeof data.cost == null) { // Undefined set to 0
      this.data.data.cost = 0;
      this._data.data.cost = 0;
    }
    if (typeof data.weight === undefined || typeof data.weight == null) { // Undefined set to 0
      this.data.data.weight = 0;
      this._data.data.weight = 0;
    }
    if (typeof data.quantity === undefined || typeof data.quantity == null) { // Undefined set to 0
      this.data.data.quantity = 0;
      this._data.data.quantity = 0;
    }

    //Calculated total weight and cost
    this._data.data.ttlCost = (data.cost * data.quantity);
    this._data.data.ttlWeight = (data.weight * data.quantity);
    this.data.data.ttlCost = (data.cost * data.quantity);
    this.data.data.ttlWeight = (data.weight * data.quantity);

    //Constrain TL to valid values
    if (typeof data.tl === undefined || typeof data.tl == null) { // Undefined set to 0
      this._data.data.tl = 0;
      this.data.data.tl = 0;
    }
    if (data.tl < 0){//Too low
      this._data.data.tl = 0;
      this.data.data.tl = 0;
    }
    else if (data.tl > 12){//Too high
      this._data.data.tl = 12;
      this.data.data.tl = 12;
    }


    //Constrain LC to valid values
    if (typeof data.lc === undefined || typeof data.lc == null) { // Undefined set to 0
      data.lc = 0;
    }
    if (data.lc < 0){//Too low
      this._data.data.lc = 0;
      this.data.data.lc = 0;
    }
    else if (data.lc > 4){//Too high
      this._data.data.lc = 4;
      this.data.data.lc = 4;
    }
  }

  prepareAttackData() {
    //Check to see if there is an actor yet
    if (this.actor){
      if (this.actor.data) {
        let damage;
        //Do logic stuff for melee profiles
        if (this.data.data.melee) {
          let meleeKeys = Object.keys(this.data.data.melee);
          if (meleeKeys.length) {//Check to see if there are any melee profiles
            for (let k = 0; k < meleeKeys.length; k++) {
              if (this.data.data.melee[meleeKeys[k]].name) {//Check to see if name is filled in. Otherwise don't bother.
                let level = 0;
                let mod = +this.data.data.melee[meleeKeys[k]].skillMod;
                let parry = 0;
                let block = 0;

                if (this.data.data.melee[meleeKeys[k]].skill.toLowerCase() == "dx") {
                  level = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
                } else {
                  //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.data.items._source.length; i++) {
                    if (this.actor.data.items._source[i].type === "Rollable") {
                      if (this.data.data.melee[meleeKeys[k]].skill === this.actor.data.items._source[i].name) {
                        level = +this.computeSkillLevel(this.actor.data.items._source[i].data.category,
                            this.actor.data.items._source[i].data.defaults, this.actor.data.items._source[i].data.difficulty,
                            this.actor.data.items._source[i].data.baseAttr, this.actor.data.items._source[i].data.baseSkill,
                            this.actor.data.items._source[i].data.minLevel, this.actor.data.items._source[i].data.maxLevel,
                            this.actor.data.items._source[i].data.dabblerPoints, this.actor.data.items._source[i].data.points,
                            this.actor.data.items._source[i].data.mod);
                      }
                    }
                  }
                }

                level = level + mod;//Update the skill level with the skill modifier
                this.data.data.melee[meleeKeys[k]].level = level//Update skill level

                if (Number.isInteger(+this.data.data.melee[meleeKeys[k]].parryMod)) {//If parry mod is a number, compute normally
                  parry = Math.floor(+(level / 2 + 3) + +this.data.data.melee[meleeKeys[k]].parryMod);//Calculate the parry value
                  if (this.actor.data.data.enhanced.parry) {
                    parry += this.actor.data.data.enhanced.parry;
                  }
                  if (this.actor.data.data.flag.combatReflexes) {
                    parry += 1;
                  }
                } else {//If it's not a number, display the entry
                  parry = this.data.data.melee[meleeKeys[k]].parryMod;
                }
                this.data.data.melee[meleeKeys[k]].parry = parry//Update parry value

                if (Number.isInteger(+this.data.data.melee[meleeKeys[k]].blockMod)) {//If block mod is a number, compute normally
                  block = Math.floor(+(level / 2 + 3) + +this.data.data.melee[meleeKeys[k]].blockMod);//Calculate the block value
                  if (this.actor.data.data.enhanced.block) {
                    block += this.actor.data.data.enhanced.block;
                  }
                  if (this.actor.data.data.flag.combatReflexes) {
                    block += 1;
                  }
                } else {
                  block = this.data.data.melee[meleeKeys[k]].blockMod;
                }
                damage = this.damageParseSwThr(this.data.data.melee[meleeKeys[k]].damageInput);//Update damage value
                this.data.data.melee[meleeKeys[k]].block = block; // Update block value
                this.data.data.melee[meleeKeys[k]].type = "melee"; // Update attack type
                this.data.data.melee[meleeKeys[k]].damage = damage;

                // Validation for Armour Divisor
                if (!(this.data.data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.melee[meleeKeys[k]].armorDivisor >= 0)
                ) {
                  this.data.data.melee[meleeKeys[k]].armorDivisor = 1;
                }
              }
            }
          }
        }

        //Do logic stuff for ranged profiles
        if (this.data.data.ranged) {
          let rangedKeys = Object.keys(this.data.data.ranged);
          if (rangedKeys.length) {//Check to see if there are any ranged profiles
            for (let k = 0; k < rangedKeys.length; k++) {
              if (this.data.data.ranged[rangedKeys[k]].name) {//Check to see if name is filled in
                let level = 0;
                let mod = +this.data.data.ranged[rangedKeys[k]].skillMod;

                if (this.data.data.ranged[rangedKeys[k]].skill.toLowerCase() == "dx") {
                  level = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
                } else {
                  //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.data.items.length; i++) {
                    if (this.actor.data.items[i].type === "Rollable") {
                      if (this.data.data.ranged[rangedKeys[k]].skill === this.actor.data.items[i].name) {
                        level = +this.computeSkillLevel(this.actor.data.items[i].data.category, this.actor.data.items[i].data.defaults, this.actor.data.items[i].data.difficulty, this.actor.data.items[i].data.baseAttr, this.actor.data.items[i].data.baseSkill, this.actor.data.items[i].data.minLevel, this.actor.data.items[i].data.maxLevel, this.actor.data.items[i].data.dabblerPoints, this.actor.data.items[i].data.points, this.actor.data.items[i].data.mod);
                      }
                    }
                  }
                }
                level = level + mod;//Update the skill level with the skill modifier
                this.data.data.ranged[rangedKeys[k]].level = level;
                this.data.data.ranged[rangedKeys[k]].type = "ranged"; // Update attack type
                damage = this.damageParseSwThr(this.data.data.ranged[rangedKeys[k]].damageInput);
                this.data.data.ranged[rangedKeys[k]].damage = damage;

                if (typeof this.data.data.ranged[rangedKeys[k]].rcl == "undefined" || this.data.data.ranged[rangedKeys[k]].rcl <= 0) { // Catch invalid values for rcl. Value must exist and be at least one.
                  this.data.data.ranged[rangedKeys[k]].rcl = 1;
                }
                if (typeof this.data.data.ranged[rangedKeys[k]].rof == "undefined" || this.data.data.ranged[rangedKeys[k]].rof <= 0) { // Catch invalid values for rof. Value must exist and be at least one.
                  this.data.data.ranged[rangedKeys[k]].rof = 1;
                }
                if (typeof this.data.data.ranged[rangedKeys[k]].acc == "undefined" || this.data.data.ranged[rangedKeys[k]].acc < 0) { // Catch invalid values for Acc. Value must exist and be at least zero.
                  this.data.data.ranged[rangedKeys[k]].acc = 0;
                }

                // Validation for bulk
                if (typeof this.data.data.ranged[rangedKeys[k]].bulk == "undefined" || this.data.data.ranged[rangedKeys[k]].bulk == "") { // Must exist.
                  this.data.data.ranged[rangedKeys[k]].bulk = -2;
                } else if (this.data.data.ranged[rangedKeys[k]].bulk > 0) { // Must be less than zero. Set positive values to negative equivilent
                  this.data.data.ranged[rangedKeys[k]].bulk = -this.data.data.ranged[rangedKeys[k]].bulk;
                }

                // Validation for Armour Divisor
                if (!(this.data.data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.ranged[rangedKeys[k]].armorDivisor >= 0)
                ) {
                  this.data.data.ranged[rangedKeys[k]].armorDivisor = 1;
                }
              }
            }
          }
        }

        if (this.data.data.affliction) {
          let afflictionKeys = Object.keys(this.data.data.affliction);
          if (afflictionKeys.length) {//Check to see if there are any melee profiles
            for (let k = 0; k < afflictionKeys.length; k++) {
              if (this.data.data.affliction[afflictionKeys[k]].name) {//Check to see if name is filled in. Otherwise don't bother.

                damage = this.damageParseSwThr(this.data.data.affliction[afflictionKeys[k]].damageInput);//Update damage value

                this.data.data.affliction[afflictionKeys[k]].level = this.data.data.level;
                this.data.data.affliction[afflictionKeys[k]].type = "affliction"; // Update attack type
                this.data.data.affliction[afflictionKeys[k]].damage = damage;

                // Validation for Armour Divisor
                if (!(this.data.data.affliction[afflictionKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.affliction[afflictionKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.affliction[afflictionKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.affliction[afflictionKeys[k]].armorDivisor >= 0)
                ) {
                  this.data.data.affliction[afflictionKeys[k]].armorDivisor = 1;
                }
              }
            }
          }
        }
      }
    }
  }

  damageParseSwThr(damage){
    let smDiscount = attributeHelpers.calcSMDiscount(this.actor.data.data.bio.sm)
    let st = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.strength, smDiscount)
    let sst = attributeHelpers.calcStrikingSt(st, this.actor.data.data.primaryAttributes.striking, smDiscount);
    let thr = attributeHelpers.strikingStrengthToThrust(sst);//Get thrust damage
    let sw = attributeHelpers.strikingStrengthToSwing(sst);//Get swing damage

    damage = damage.toLowerCase();//Fix any case specific issues
    damage = damage.replace("thr", thr);//Replace thrust
    damage = damage.replace("sw", sw)//Replace swing

    return damage;
  }

  getBaseAttrValue(baseAttr) {
    let base = 0;
    if (baseAttr.toUpperCase() == 'ST' || baseAttr.toUpperCase() == 'STRENGTH'){
      let smDiscount = attributeHelpers.calcSMDiscount(this.actor.data.data.bio.sm)
      base = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.strength, smDiscount);
    }
    else if (baseAttr.toUpperCase() == 'DX' || baseAttr.toUpperCase() == 'DEXTERITY') {
      base = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
    }
    else if (baseAttr.toUpperCase() == 'IQ' || baseAttr.toUpperCase() == 'INTELLIGENCE') {
      base = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence);
    }
    else if (baseAttr.toUpperCase() == 'HT' || baseAttr.toUpperCase() == 'HEALTH') {
      base = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.health, 1);
    }
    else if (baseAttr.toUpperCase() == 'PER' || baseAttr.toUpperCase() == 'PERCEPTION') {
      base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence), this.actor.data.data.primaryAttributes.perception);
    }
    else if (baseAttr.toUpperCase() == 'WILL') {
      base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence), this.actor.data.data.primaryAttributes.will);
    }
    return base;
  }

  onePointInSkill(baseAttr, difficulty) {
    let baseAttrValue = this.getBaseAttrValue(baseAttr)

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

  defaultIsWorth(baseAttr, difficulty, dfault){
    let baseAttrValue = this.getBaseAttrValue(baseAttr);
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

  pointsToBonus(pts, difficulty){
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

  computeSkillLevelWithoutDefaults(difficulty, baseAttr, points, mod) {
    let level = 0;
    if (this.actor.data) { // Make sure there's an actor before computing skill level
      let base = this.getBaseAttrValue(baseAttr) // Get the base value of the relevant attribute
      // Compute skill value based on points spent on the skill
      level = base + this.pointsToBonus(points, difficulty) + mod;
    }

    return level;
  }

  computeSkillLevel(category, defaults, difficulty, baseAttr, baseSkill, minLevel, maxLevel, dabblerPoints, pts, mod) {
    let level = 0;
    if (this.actor.data) { // Make sure there's an actor before computing skill level
      let base = 0;
      let points = pts;
      let skillDefaultArray = [];
      let attrDefaultArray = [];
      let dabblerBonus = Math.min(dabblerPoints, 3) // If they have four points in dabbler, the bonus is only +3
      let smDiscount = attributeHelpers.calcSMDiscount(this.actor.data.data.bio.sm);
      let st = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.strength, smDiscount)
      let dx = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
      let iq = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence);
      let ht = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.health, 1);
      let per = attributeHelpers.calcPerOrWill(iq, this.actor.data.data.primaryAttributes.perception);
      let will = attributeHelpers.calcPerOrWill(iq, this.actor.data.data.primaryAttributes.will);

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
            for (let i = 0; i < this.actor.data.items._source.length; i++) { // Loop through the list of items
              if (this.actor.data.items._source[i].type === "Rollable") { // Make sure it's a Rollable
                if (this.actor.data.items._source[i].data.category === "skill") { // Make sure it's a skill and not a technique
                    if (this.actor.data.items._source[i].data.points > 0) { // Make sure it has more than 0 points
                      if (defaults[q].skill === this.actor.data.items._source[i].name) { // Make sure it matches the name
                        let defaultLevel = this.computeSkillLevelWithoutDefaults(this.actor.data.items._source[i].data.difficulty, this.actor.data.items._source[i].data.baseAttr, this.actor.data.items._source[i].data.points, this.actor.data.items._source[i].data.mod)
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
          bestAttrDefault = Math.min(bestAttrDefault, this.onePointInSkill(baseAttr, difficulty)-1) // Cap the boosted default to one less than what you'd get spending points
          level = Math.max(bestAttrDefault, bestSkillDefault, 0) + mod; // Set the value either to their best default or 0, whichever is highest, plus the modifier
        }
        else if(points > 0){ // They have spent points, calculate accordingly, including buying up from defaults
          base = this.getBaseAttrValue(baseAttr) // Get the base value of the relevant attribute
          let bestDefault = Math.max(...skillDefaultArray, ...attrDefaultArray); // Get the best default

          if (bestDefault >= this.onePointInSkill(baseAttr, difficulty)){ // The best default is equal to or better than what you'd get by spending points. Account for Improving Skills from Default (B. 173)
            points = points + this.defaultIsWorth(baseAttr, difficulty, bestDefault); // The effective point value is whatever they put in, plus whatever their default is worth.
          }

          // Compute skill value based on effective points spent on the skill
          level = base + this.pointsToBonus(points, difficulty) + mod;
        }
      }

      else {//It's a technique
        //Loop through all the skills on the sheet, find the one they picked and set that as the base
        for (let i = 0; i < this.actor.data.items._source.length; i++){
          if (this.actor.data.items._source[i].type === "Rollable"){
            if (this.actor.data.items._source[i].data.category === "skill"){
              if (baseSkill === this.actor.data.items._source[i].name){
                base = this.computeSkillLevelWithoutDefaults(this.actor.data.items._source[i].data.difficulty,
                    this.actor.data.items._source[i].data.baseAttr, this.actor.data.items._source[i].data.points,
                    this.actor.data.items._source[i].data.mod)

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

  computeSpellLevel(points, mod, attributeMod, difficulty, magery, attribute) {
    let level = 0;
    let totalMagicAttribute = 0;
    if (attribute != "") { // Attribute is not blank
      totalMagicAttribute += this.getBaseAttrValue(attribute)
    }
    totalMagicAttribute += attributeMod ? attributeMod : 0;
    totalMagicAttribute += magery ? magery : 0;
    this.data.data.magicalAbility = totalMagicAttribute;

    if (points <= 0 || (difficulty == "W" && points < 3)) { // They haven't spent any points, or have spent too few points to make a difference for a Wildcard skill. Display default, after account for dabbler
      level = mod;
    }
    else if(points > 0){ // They have spent points, calculate accordingly, including buying up from defaults
      // Compute skill value based on effective points spent on the skill
      level = totalMagicAttribute + this.pointsToBonus(points, difficulty) + mod;
    }

    return level;
  }

  _prepareSpellData() {
    if (this.actor){
      if (this.actor.data.data.magic) {

        // Calculate the total magical attribute
        let totalMagicAttribute = 0;
        let points = this.data.data.points;
        let mod = this.data.data.mod;
        let attributeMod = this.actor.data.data.magic.attributeMod;
        let difficulty = this.data.data.difficulty;
        let magery = this.actor.data.data.magic.magery;
        let attribute = this.actor.data.data.magic.attribute;

        let level = this.computeSpellLevel(points, mod, attributeMod, difficulty, magery, attribute)

        if (attribute != "") { // Attribute is not blank
          totalMagicAttribute += this.getBaseAttrValue(attribute)
        }

        totalMagicAttribute += attributeMod ? attributeMod : 0;
        totalMagicAttribute += magery ? magery : 0;
        this.data.data.magicalAbility = totalMagicAttribute;

        this.data.data.level = level;
        this._data.data.level = level;
      }
    }
  }

  _prepareRollableData() {
    if (this.data.data.category == ""){//The category will be blank upon initialization. Set it to skill so that the form's dynamic elements display correctly the first time it's opened.
      this.data.data.category = "skill";
    }

    if(this.data.data && this.actor){
      let level = this.computeSkillLevel(this.data.data.category, this.data.data.defaults, this.data.data.difficulty,
          this.data.data.baseAttr, this.data.data.baseSkill, this.data.data.minLevel, this.data.data.maxLevel,
          this.data.data.dabblerPoints, this.data.data.points, this.data.data.mod)

      this.data.data.level = level;
    }
  }

  _prepareTraitData() {}

  prepareAfflictionData(itemData, data) {}
}
