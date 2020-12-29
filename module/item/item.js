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
        break;
      case "Hit-Location":
        this._prepareHitLocationData(itemData, data);
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
    //Calculated total weight and cost
    this._data.data.ttlCost = (data.cost * data.quantity);
    this._data.data.ttlWeight = (data.weight * data.quantity);
    this.data.data.ttlCost = (data.cost * data.quantity);
    this.data.data.ttlWeight = (data.weight * data.quantity);

    //Constrain TL to valid values
    if (data.tl < 0){//Too low
      this._data.data.tl = 0;
      this.data.data.tl = 0;
    }
    else if (data.tl > 12){//Too high
      this._data.data.tl = 12;
      this.data.data.tl = 12;
    }


    //Constrain LC to valid values
    if (data.lc < 0){//Too low
      this._data.data.lc = 0;
      this.data.data.lc = 0;
    }
    else if (data.lc > 4){//Too high
      this._data.data.lc = 4;
      this.data.data.lc = 4;
    }

    this.prepareAttackData(itemData, data)
  }

  prepareAttackData(itemData, data) {
    //Check to see if there is an actor yet
    if (this.actor){
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
              level = +this.actor.data.data.primaryAttributes.dexterity.value;
            }
            else {
              //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
              for (let i = 0; i < this.actor.data.items.length; i++){
                if (this.actor.data.items[i].type === "Rollable"){
                  if (this.actor.data.items[i].data.category === "skill" || this.actor.data.items[i].data.category === "technique"){
                    if (data.melee[meleeKeys[k]].skill === this.actor.data.items[i].name){
                      level = +this.actor.data.items[i].data.level;
                    }
                  }
                }
              }
            }

            level = level + mod;//Update the skill level with the skill modifier
            this._data.data.melee[meleeKeys[k]].level = level//Update skill level

            if (Number.isInteger(+data.melee[meleeKeys[k]].parryMod)){//If parry mod is a number, compute normally
              parry = Math.floor(+( level / 2 + 3 ) + +data.melee[meleeKeys[k]].parryMod);//Calculate the parry value
            }
            else {//If it's not a number, display the entry
              parry = data.melee[meleeKeys[k]].parryMod;

            }
            this._data.data.melee[meleeKeys[k]].parry = parry//Update parry value

            if (Number.isInteger(+data.melee[meleeKeys[k]].blockMod)) {//If block mod is a number, compute normally
              block = Math.floor(+( level / 2 + 3 ) + +data.melee[meleeKeys[k]].blockMod);//Calculate the block value
            }
            else {
              block = data.melee[meleeKeys[k]].blockMod;
            }
            this._data.data.melee[meleeKeys[k]].block = block//Update block value

            //Do the logic to parse out thr/sw damage to dice
            let damage = data.melee[meleeKeys[k]].damageInput;
            let thr = this.actor.data.data.baseDamage.thrust;
            let sw = this.actor.data.data.baseDamage.swing;

            damage = damage.toLowerCase();
            damage = damage.replace("thr", thr);
            damage = damage.replace("sw", sw)

            this._data.data.melee[meleeKeys[k]].damage = damage//Update damage value
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
              level = +this.actor.data.data.primaryAttributes.dexterity.value;
            }
            else {
              //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
              for (let i = 0; i < this.actor.data.items.length; i++){
                if (this.actor.data.items[i].type === "Rollable"){
                  if (this.actor.data.items[i].data.category === "skill" || this.actor.data.items[i].data.category === "technique"){
                    if (data.ranged[rangedKeys[k]].skill === this.actor.data.items[i].name){
                      level = +this.actor.data.items[i].data.level;
                    }
                  }
                }
              }
            }
            level = level + mod;//Update the skill level with the skill modifier
            this._data.data.ranged[rangedKeys[k]].level = level

            //Do the logic to parse out thr/sw damage to dice
            let damage = data.ranged[rangedKeys[k]].damageInput;//Grab the damageInput string from the attack
            let thr = this.actor.data.data.baseDamage.thrust;//Get thrust damage
            let sw = this.actor.data.data.baseDamage.swing;//Get swing damage

            damage = damage.toLowerCase();//Fix any case specific issues
            damage = damage.replace("thr", thr);//Replace thrust
            damage = damage.replace("sw", sw)//Replace swing

            this._data.data.ranged[rangedKeys[k]].damage = damage
          }
        }
      }
    }
  }

  _prepareHitLocationData(itemData, data) {
    // Override common default icon
  }

  getBaseAttrValue(baseAttr) {
    let base = 0;
    if (baseAttr == 'ST'){
      base = this.actor.data.data.primaryAttributes.strength.value;
    }
    else if (baseAttr == 'DX') {
      base = this.actor.data.data.primaryAttributes.dexterity.value;
    }
    else if (baseAttr == 'IQ') {
      base = this.actor.data.data.primaryAttributes.intelligence.value;
    }
    else if (baseAttr == 'HT') {
      base = this.actor.data.data.primaryAttributes.health.value;
    }
    else if (baseAttr == 'Per') {
      base = this.actor.data.data.primaryAttributes.perception.value;
    }
    else if (baseAttr == 'Will') {
      base = this.actor.data.data.primaryAttributes.will.value;
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

  _prepareRollableData(itemData, data) {
    if(data && this.actor){
      // Override common default icon
      let base = 0;
      let level = 0;
      let skillDefaultArray = [];
      let attrDefaultArray = [];
      let points = data.points;
      let dabblerBonus = Math.min(data.dabblerPoints, 3)//If they have four points in dabbler, the bonus is only +3

      if (data.category == 'skill') {//It's a skill
        //Figure out defaults
        let q = 0;
        while (data.defaults[q]) {//While the current entry is not null

          //Check attributes first, add any results to the array of attribute defaults
          if (data.defaults[q].skill.toUpperCase() == 'ST') {
            attrDefaultArray.push(+this.actor.data.data.primaryAttributes.strength.value + +data.defaults[q].mod);
          } else if (data.defaults[q].skill.toUpperCase() == 'DX') {
            attrDefaultArray.push(+this.actor.data.data.primaryAttributes.dexterity.value + +data.defaults[q].mod);
          } else if (data.defaults[q].skill.toUpperCase() == 'IQ') {
            attrDefaultArray.push(+this.actor.data.data.primaryAttributes.intelligence.value + +data.defaults[q].mod);
          } else if (data.defaults[q].skill.toUpperCase() == 'HT') {
            attrDefaultArray.push(+this.actor.data.data.primaryAttributes.health.value + +data.defaults[q].mod);
          } else if (data.defaults[q].skill.toUpperCase() == 'PER') {
            attrDefaultArray.push(+this.actor.data.data.primaryAttributes.perception.value + +data.defaults[q].mod);
          } else if (data.defaults[q].skill.toUpperCase() == 'WILL') {
            attrDefaultArray.push(+this.actor.data.data.primaryAttributes.will.value + +data.defaults[q].mod);
          }
          //Then check other skills, add any results to the array of skill defaults
          else {
            for (let i = 0; i < this.actor.data.items.length; i++) {
              if (this.actor.data.items[i].type === "Rollable") {
                if (this.actor.data.items[i].data.category === "skill") {
                  if (data.defaults[q].skill === this.actor.data.items[i].name) {
                    skillDefaultArray.push(+this.actor.data.items[i].data.level + +data.defaults[q].mod);
                  }
                }
              }
            }
          }
          q++;
        }
        //We now have a lists of all skill and attribute defaults

        if (points <= 0 || (data.difficulty == "W" && points < 3)) {//They haven't spent any points, or have spent too few points to make a difference for a Wildcard skill. Display default, after account for dabbler
          let bestAttrDefault = Math.max(...attrDefaultArray);
          bestAttrDefault += +dabblerBonus;

          bestAttrDefault = Math.min(bestAttrDefault, this.onePointInSkill(data.baseAttr, data.difficulty)-1);//Set the value either to the best attribute default plus the dabbler bonus, or one less than what they'd get if they spent actual points.
          level = Math.max(bestAttrDefault, Math.max(...skillDefaultArray))
        }
        else if(points > 0){//They have spent points, calculate accordingly, including buying up from defaults
          base = this.getBaseAttrValue(data.baseAttr)//Get the base value of the relevant attribute
          let bestDefault = Math.max(...skillDefaultArray, ...attrDefaultArray);//Get the best default

          if (bestDefault >= this.onePointInSkill(data.baseAttr, data.difficulty)){//The best default is equal to or better than what you'd get by spending points. Account for Improving Skills from Default (B. 173)
            points = points + this.defaultIsWorth(data.baseAttr, data.difficulty, bestDefault);//The effective point value is whatever they put in, plus whatever their default is worth.
          }

          //Compute skill value based on effective points spent on the skill
          level = base + this.pointsToBonus(points, data.difficulty) + data.mod;
        }
      }

      else {//It's a technique

        //Loop through all the skills on the sheet, find the one they picked and set that as the base
        for (let i = 0; i < this.actor.data.items.length; i++){
          if (this.actor.data.items[i].type === "Rollable"){
            if (this.actor.data.items[i].data.category === "skill"){
              if (data.baseSkill === this.actor.data.items[i].name){
                base = +this.actor.data.items[i].data.level;
                this._data.data.baseSkillLevel = base;
                this.data.data.baseSkillLevel = base;
              }
            }
          }
        }

        //Modify Base Skill with Base Penalty
        level = base + data.minLevel;

        //Adjust for difficulty
        if (data.difficulty == 'A') {
          if (points > 0){//They have spent points
            level = level + points;
          }
        }
        else if (data.difficulty == 'H') {
          if (points >= 2){//They have spent enough points to matter
            level = level + points - 1;//First level costs 2, every other costs 1
          }
        }
        level = Math.min((level + data.mod), (data.maxLevel + base));

      }

      this.update({ ['data.level']: level });//This field does need to use this.update, otherwise anything that is computed before this won't get correct skill values.
    }
  }

  _prepareTraitData(itemData, data) {
    this.prepareAttackData(itemData, data)
  }
}
