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
    let data = itemData.data;

    switch (itemData.type) {
      case "Equipment":
        this._prepareEquipmentData(itemData, data);
        this.prepareAttackData(itemData, data)
        break;
      case "Rollable":
        this._prepareRollableData(itemData, data);
        break;
      case "Trait":
        this._prepareTraitData(itemData, data);
        break;
      default: // not a supported type
        return ui.notifications.error("This type of item is not supported in the system!");
    }
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

  prepareAttackData(itemData, data) {
    //Check to see if there is an actor yet
    if (this.actor){
      let damage;
      //Do logic stuff for melee profiles
      let meleeKeys = Object.keys(data.melee);
      if (meleeKeys.length){//Check to see if there are any melee profiles
        for (let k = 0; k < meleeKeys.length; k++){
          if (data.melee[meleeKeys[k]].name){//Check to see if name is filled in. Otherwise don't bother.
            let level = 0;
            let mod = +data.melee[meleeKeys[k]].skillMod;
            let parry = 0;
            let block = 0;

            if (data.melee[meleeKeys[k]].skill.toLowerCase() == "dx"){
              level = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
            }
            else {
              //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
              for (let i = 0; i < this.actor.data.items.length; i++){
                if (this.actor.data.items[i].type === "Rollable"){
                  if (this.actor.data.items[i].data.category === "skill" || this.actor.data.items[i].data.category === "technique"){
                    if (data.melee[meleeKeys[k]].skill === this.actor.data.items[i].name){
                      level = +this.computeSkillLevel(this.actor.data.items[i].data.category, this.actor.data.items[i].data.defaults, this.actor.data.items[i].data.difficulty, this.actor.data.items[i].data.baseAttr, this.actor.data.items[i].data.baseSkill, this.actor.data.items[i].data.minLevel, this.actor.data.items[i].data.maxLevel, this.actor.data.items[i].data.dabblerPoints, this.actor.data.items[i].data.points, this.actor.data.items[i].data.mod);
                    }
                  }
                }
              }
            }

            level = level + mod;//Update the skill level with the skill modifier
            this._data.data.melee[meleeKeys[k]].level = level//Update skill level

            if (Number.isInteger(+data.melee[meleeKeys[k]].parryMod)){//If parry mod is a number, compute normally
              parry = Math.floor(+( level / 2 + 3 ) + +data.melee[meleeKeys[k]].parryMod);//Calculate the parry value
              if (this.actor.data.data.enhanced.parry){
                parry += this.actor.data.data.enhanced.parry;
              }
              if (this.actor.data.data.flag.combatReflexes){
                parry += 1;
              }
            }
            else {//If it's not a number, display the entry
              parry = data.melee[meleeKeys[k]].parryMod;
            }
            this._data.data.melee[meleeKeys[k]].parry = parry//Update parry value

            if (Number.isInteger(+data.melee[meleeKeys[k]].blockMod)) {//If block mod is a number, compute normally
              block = Math.floor(+( level / 2 + 3 ) + +data.melee[meleeKeys[k]].blockMod);//Calculate the block value
              if (this.actor.data.data.enhanced.block){
                block += this.actor.data.data.enhanced.block;
              }
              if (this.actor.data.data.flag.combatReflexes){
                block += 1;
              }
            }
            else {
              block = data.melee[meleeKeys[k]].blockMod;
            }
            damage = this.damageParseSwThr(data.melee[meleeKeys[k]].damageInput);//Update damage value
            this._data.data.melee[meleeKeys[k]].block = block; // Update block value
            this.data.data.melee[meleeKeys[k]].block = block; // Update block value
            this._data.data.melee[meleeKeys[k]].type = "melee"; // Update attack type
            this.data.data.melee[meleeKeys[k]].type = "melee"; // Update attack type
            this._data.data.melee[meleeKeys[k]].damage = damage;
            this.data.data.melee[meleeKeys[k]].damage = damage;

            // Validation for Armour Divisor
            if (!(data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                data.melee[meleeKeys[k]].armorDivisor >= 0)
            ){
              this._data.data.melee[meleeKeys[k]].armorDivisor = 1;
              this.data.data.melee[meleeKeys[k]].armorDivisor = 1;
            }
          }
        }
      }


      //Do logic stuff for ranged profiles
      let rangedKeys = Object.keys(data.ranged);
      if (rangedKeys.length){//Check to see if there are any ranged profiles
        for (let k = 0; k < rangedKeys.length; k++){
          if (data.ranged[rangedKeys[k]].name){//Check to see if name is filled in
            let level = 0;
            let mod = +data.ranged[rangedKeys[k]].skillMod;

            if (data.ranged[rangedKeys[k]].skill.toLowerCase() == "dx"){
              level = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
            }
            else {
              //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
              for (let i = 0; i < this.actor.data.items.length; i++){
                if (this.actor.data.items[i].type === "Rollable"){
                  if (this.actor.data.items[i].data.category === "skill" || this.actor.data.items[i].data.category === "technique"){
                    if (data.ranged[rangedKeys[k]].skill === this.actor.data.items[i].name){
                      level = +this.computeSkillLevel(this.actor.data.items[i].data.category, this.actor.data.items[i].data.defaults, this.actor.data.items[i].data.difficulty, this.actor.data.items[i].data.baseAttr, this.actor.data.items[i].data.baseSkill, this.actor.data.items[i].data.minLevel, this.actor.data.items[i].data.maxLevel, this.actor.data.items[i].data.dabblerPoints, this.actor.data.items[i].data.points, this.actor.data.items[i].data.mod);
                    }
                  }
                }
              }
            }
            level = level + mod;//Update the skill level with the skill modifier
            this._data.data.ranged[rangedKeys[k]].level = level;
            this.data.data.ranged[rangedKeys[k]].level = level;
            this._data.data.ranged[rangedKeys[k]].type = "ranged"; // Update attack type
            this.data.data.ranged[rangedKeys[k]].type = "ranged"; // Update attack type
            damage = this.damageParseSwThr(data.ranged[rangedKeys[k]].damageInput);
            this._data.data.ranged[rangedKeys[k]].damage = damage;
            this._data.data.ranged[rangedKeys[k]].damage = damage;

            if (typeof data.ranged[rangedKeys[k]].rcl == "undefined" || data.ranged[rangedKeys[k]].rcl <= 0){ // Catch invalid values for rcl. Value must exist and be at least one.
              this._data.data.ranged[rangedKeys[k]].rcl = 1;
              this.data.data.ranged[rangedKeys[k]].rcl = 1;
            }
            if (typeof data.ranged[rangedKeys[k]].rof == "undefined" || data.ranged[rangedKeys[k]].rof <= 0){ // Catch invalid values for rof. Value must exist and be at least one.
              this._data.data.ranged[rangedKeys[k]].rof = 1;
              this.data.data.ranged[rangedKeys[k]].rof = 1;
            }
            if (typeof data.ranged[rangedKeys[k]].acc == "undefined" || data.ranged[rangedKeys[k]].acc < 0){ // Catch invalid values for Acc. Value must exist and be at least zero.
              this._data.data.ranged[rangedKeys[k]].acc = 0;
              this.data.data.ranged[rangedKeys[k]].acc = 0;
            }

            // Validation for bulk
            if (typeof data.ranged[rangedKeys[k]].bulk == "undefined" || data.ranged[rangedKeys[k]].bulk == ""){ // Must exist.
              this._data.data.ranged[rangedKeys[k]].bulk = -2;
              this.data.data.ranged[rangedKeys[k]].bulk = -2;
            }
            else if (data.ranged[rangedKeys[k]].bulk > 0){ // Must be less than zero. Set positive values to negative equivilent
              this._data.data.ranged[rangedKeys[k]].bulk = -data.ranged[rangedKeys[k]].bulk;
              this.data.data.ranged[rangedKeys[k]].bulk = -data.ranged[rangedKeys[k]].bulk;
            }

            // Validation for Armour Divisor
            if (!(data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                data.ranged[rangedKeys[k]].armorDivisor >= 0)
            ){
              this._data.data.ranged[rangedKeys[k]].armorDivisor = 1;
              this.data.data.ranged[rangedKeys[k]].armorDivisor = 1;
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

  computeSkillLevel(category, defaults, difficulty, baseAttr, baseSkill, minLevel, maxLevel, dabblerPoints, pts, mod){
    let base = 0;
    let level = 0;
    let points = pts;
    let skillDefaultArray = [];
    let attrDefaultArray = [];
    let dabblerBonus = Math.min(dabblerPoints, 3)//If they have four points in dabbler, the bonus is only +3
    let smDiscount = attributeHelpers.calcSMDiscount(this.actor.data.data.bio.sm);
    let st = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.strength, smDiscount)
    let dx = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
    let iq = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence);
    let ht = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.health, 1);
    let per = attributeHelpers.calcPerOrWill(iq, this.actor.data.data.primaryAttributes.perception);
    let will = attributeHelpers.calcPerOrWill(iq, this.actor.data.data.primaryAttributes.will);

    if (category === 'skill') {//It's a skill
      //Figure out defaults
      let q = 0;
      while (defaults[q]) {//While the current entry is not null
        //Check attributes first, add any results to the array of attribute defaults
        if (defaults[q].skill.toUpperCase() === 'ST' || defaults[q].skill.toUpperCase() === 'STRENGTH') {
          attrDefaultArray.push(st + +defaults[q].mod);
        } else if (defaults[q].skill.toUpperCase() === 'DX' || defaults[q].skill.toUpperCase() === 'DEXTERITY') {
          attrDefaultArray.push(dx + +defaults[q].mod);
        } else if (defaults[q].skill.toUpperCase() === 'IQ' || defaults[q].skill.toUpperCase() === 'INTELLIGENCE') {
          attrDefaultArray.push(iq + +defaults[q].mod);
        } else if (defaults[q].skill.toUpperCase() === 'HT' || defaults[q].skill.toUpperCase() === 'HEALTH') {
          attrDefaultArray.push(ht + +defaults[q].mod);
        } else if (defaults[q].skill.toUpperCase() === 'PER' || defaults[q].skill.toUpperCase() === 'PERCEPTION') {
          attrDefaultArray.push(per + +defaults[q].mod);
        } else if (defaults[q].skill.toUpperCase() === 'WILL') {
          attrDefaultArray.push(will + +defaults[q].mod);
        }
        //Then check other skills, add any results to the array of skill defaults
        else {
          for (let i = 0; i < this.actor.data.items.length; i++) {
            if (this.actor.data.items[i].type === "Rollable") {
              if (this.actor.data.items[i].data.category === "skill") {
                if (defaults[q].skill === this.actor.data.items[i].name) {
                  skillDefaultArray.push(+this.actor.data.items[i].data.level + +defaults[q].mod);
                }
              }
            }
          }
        }
        q++;
      }
      //We now have a lists of all skill and attribute defaults

      if (points <= 0 || (difficulty == "W" && points < 3)) {//They haven't spent any points, or have spent too few points to make a difference for a Wildcard skill. Display default, after account for dabbler
        let bestAttrDefault = Math.max(...attrDefaultArray);
        bestAttrDefault += +dabblerBonus;

        bestAttrDefault = Math.min(bestAttrDefault, this.onePointInSkill(baseAttr, difficulty)-1);//Set the value either to the best attribute default plus the dabbler bonus, or one less than what they'd get if they spent actual points.
        level = Math.max(bestAttrDefault, Math.max(...skillDefaultArray))
      }
      else if(points > 0){//They have spent points, calculate accordingly, including buying up from defaults
        base = this.getBaseAttrValue(baseAttr)//Get the base value of the relevant attribute
        let bestDefault = Math.max(...skillDefaultArray, ...attrDefaultArray);//Get the best default

        if (bestDefault >= this.onePointInSkill(baseAttr, difficulty)){//The best default is equal to or better than what you'd get by spending points. Account for Improving Skills from Default (B. 173)
          points = points + this.defaultIsWorth(baseAttr, difficulty, bestDefault);//The effective point value is whatever they put in, plus whatever their default is worth.
        }

        //Compute skill value based on effective points spent on the skill
        level = base + this.pointsToBonus(points, difficulty) + mod;
      }
    }

    else {//It's a technique

      //Loop through all the skills on the sheet, find the one they picked and set that as the base
      for (let i = 0; i < this.actor.data.items.length; i++){
        if (this.actor.data.items[i].type === "Rollable"){
          if (this.actor.data.items[i].data.category === "skill"){
            if (baseSkill === this.actor.data.items[i].name){
              base = +this.actor.data.items[i].data.level;
              this._data.data.baseSkillLevel = base;
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
    return level;
  }

  _prepareRollableData(itemData, data) {
    if (this.data.data.category == ""){//The category will be blank upon initilization. Set it to skill so that the form's dynamic elements display correctly the first time it's opened.
      this.data.data.category = "skill";
    }

    if(data && this.actor){
      let level = this.computeSkillLevel(data.category, data.defaults, data.difficulty, data.baseAttr, data.baseSkill, data.minLevel, data.maxLevel, data.dabblerPoints, data.points, data.mod)

      this._data.data.level = level;
      this.data.data.level = level;
    }
  }

  _prepareTraitData(itemData, data) {
    this.prepareAttackData(itemData, data)
  }
}
