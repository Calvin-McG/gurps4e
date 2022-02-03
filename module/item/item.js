import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { skillHelpers } from '../../helpers/skillHelpers.js';

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
        this._prepareEquipmentData();
        break;
      case "Rollable":
        this._prepareRollableData();
        break;
      case "Spell":
        this._prepareSpellData();
        break;
      case "Trait":
        this._prepareTraitData();
        break;
      case "Custom Weapon":
        this._prepareCustomWeaponData();
        break;
      default: // not a supported type
        return ui.notifications.error("This type of item is not supported in the system!");
    }
    this.prepareAttackData()
  }

  validateEquipmentBasics() {
    // Check for undefined on cost, weight, and quantity
    if (typeof this.data.data.cost === undefined || typeof this.data.data.cost == null) { // Undefined set to 0
      this.data.data.cost = 0;
    }
    if (typeof this.data.data.weight === undefined || typeof this.data.data.weight == null) { // Undefined set to 0
      this.data.data.weight = 0;
    }
    if (typeof this.data.data.quantity === undefined || typeof this.data.data.quantity == null) { // Undefined set to 0
      this.data.data.quantity = 0;
    }

    this.data.data.cost = Math.round(+this.data.data.cost * 100) / 100;
    this.data.data.weight = Math.round(+this.data.data.weight * 100) / 100;
    this.data.data.quantity = Math.round(+this.data.data.quantity);

    // Calculated total weight and cost
    this.data.data.ttlCost = Math.round((+this.data.data.cost * +this.data.data.quantity) * 100) / 100;
    this.data.data.ttlWeight = Math.round((+this.data.data.weight * +this.data.data.quantity) * 100) / 100;

    // Constrain TL to valid values
    if (typeof this.data.data.tl === undefined || typeof this.data.data.tl == null) { // Undefined set to 0
      this.data.data.tl = 0;
    }
    if (this.data.data.tl < 0){ // Too low
      this.data.data.tl = 0;
    }
    else if (this.data.data.tl > 12){ // Too high
      this.data.data.tl = 12;
    }

    //Constrain LC to valid values
    if (typeof this.data.data.lc === undefined || typeof this.data.data.lc == null) { // Undefined set to 4 (Open)
      this.data.data.lc = 4;
    }
    if (this.data.data.lc < 0){ // Too low
      this.data.data.lc = 0;
    }
    else if (this.data.data.lc > 4){ // Too high
      this.data.data.lc = 4;
    }
  }

  _prepareEquipmentData() {
    this.validateEquipmentBasics();
  }

  _prepareCustomWeaponData() {
    this.validateEquipmentBasics();


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
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data.category,
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
                  for (let i = 0; i < this.actor.data.items._source.length; i++) {
                    if (this.actor.data.items._source[i].type === "Rollable") {
                      if (this.data.data.ranged[rangedKeys[k]].skill === this.actor.data.items._source[i].name) {
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data.category,
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
          if (afflictionKeys.length) { // Check to see if there are any affliction profiles
            for (let k = 0; k < afflictionKeys.length; k++) {
              if (this.data.data.affliction[afflictionKeys[k]].name) { // Check to see if name is filled in. Otherwise don't bother.

                damage = this.damageParseSwThr(this.data.data.affliction[afflictionKeys[k]].damageInput); // Update damage value


                if (this.data.type == "Spell") {
                  this.data.data.affliction[afflictionKeys[k]].level = this.data.data.level;
                }
                else {
                  // Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.data.items._source.length; i++) {
                    if (this.actor.data.items._source[i].type === "Rollable") {
                      if (this.data.data.affliction[afflictionKeys[k]].skill === this.actor.data.items._source[i].name) {
                        this.data.data.affliction[afflictionKeys[k]].level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data.category,
                            this.actor.data.items._source[i].data.defaults, this.actor.data.items._source[i].data.difficulty,
                            this.actor.data.items._source[i].data.baseAttr, this.actor.data.items._source[i].data.baseSkill,
                            this.actor.data.items._source[i].data.minLevel, this.actor.data.items._source[i].data.maxLevel,
                            this.actor.data.items._source[i].data.dabblerPoints, this.actor.data.items._source[i].data.points,
                            this.actor.data.items._source[i].data.mod) + +this.data.data.affliction[afflictionKeys[k]].skillMod;;
                      }
                    }
                  }
                }

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

  _prepareSpellData() {
    if (this.actor) {
      if (this.actor.data) {
        if (this.actor.data.data) {
          if (this.actor.data.data.magic) {

            // Calculate the total magical attribute
            let totalMagicAttribute = 0;
            let points = this.data.data.points;
            let mod = this.data.data.mod;
            let attributeMod = this.actor.data.data.magic.attributeMod;
            let difficulty = this.data.data.difficulty;
            let magery = this.actor.data.data.magic.magery;
            let attribute = this.actor.data.data.magic.attribute;

            let level = skillHelpers.computeSpellLevel(this.actor, points, mod, attributeMod, difficulty, magery, attribute)

            if (attribute != "") { // Attribute is not blank
              totalMagicAttribute += this.getBaseAttrValue(attribute)
            }

            totalMagicAttribute += attributeMod ? attributeMod : 0;
            totalMagicAttribute += magery ? magery : 0;
            this.data.data.magicalAbility = totalMagicAttribute;

            this.data.data.level = level;
          }
        }
      }
    }
  }

  _prepareRollableData() {
    if (this.data.data.category == ""){//The category will be blank upon initialization. Set it to skill so that the form's dynamic elements display correctly the first time it's opened.
      this.data.data.category = "skill";
    }

    if(this.data.data && this.actor){
      let level = skillHelpers.computeSkillLevel(this.actor, this.data.data.category, this.data.data.defaults, this.data.data.difficulty,
          this.data.data.baseAttr, this.data.data.baseSkill, this.data.data.minLevel, this.data.data.maxLevel,
          this.data.data.dabblerPoints, this.data.data.points, this.data.data.mod)

      this.data.data.level = level;
    }
  }

  _prepareTraitData() {}
}
