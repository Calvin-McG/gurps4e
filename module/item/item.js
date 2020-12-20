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

    // all types have one. Might as well update it here
    data.notes = data.notes || "note";

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
    this.update({ ['data.ttlCost']: (data.cost * data.quantity) });
    this.update({ ['data.ttlWeight']: (data.weight * data.quantity) });

    //Constrain TL to valid values
    if (data.tl < 0){//Too low
      this.update({ ['data.tl']: 0 });
    }
    else if (data.tl > 12){//Too high
      this.update({ ['data.tl']: 12 });
    }

    //Constrain LC to valid values
    if (data.lc < 0){//Too low
      this.update({ ['data.lc']: 0 });
    }
    else if (data.lc > 4){//Too high
      this.update({ ['data.lc']: 4 });
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
            level = level + mod;//Update the skill level with the skill modifier
            this.update({ ['data.melee.' + meleeKeys[k] + '.level' ]: level });//Update skill level

            if (Number.isInteger(+data.melee[meleeKeys[k]].parryMod)){//If parry mod is a number, compute normally
              parry = Math.floor(+( level / 2 + 3 ) + +data.melee[meleeKeys[k]].parryMod);//Calculate the parry value
            }
            else {//If it's not a number, display the entry
              parry = data.melee[meleeKeys[k]].parryMod;

            }
            this.update({ ['data.melee.' + meleeKeys[k] + '.parry' ]: parry });//Update the parry value

            if (Number.isInteger(+data.melee[meleeKeys[k]].blockMod)) {//If block mod is a number, compute normally
              block = Math.floor(+( level / 2 + 3 ) + +data.melee[meleeKeys[k]].blockMod);//Calculate the block value
            }
            else {
              block = data.melee[meleeKeys[k]].blockMod;
            }
            this.update({ ['data.melee.' + meleeKeys[k] + '.block' ]: block });//Update the block value


            //Do the logic to parse out thr/sw damage to dice
            let damage = data.melee[meleeKeys[k]].damageInput;
            let thr = this.actor.data.data.baseDamage.thrust;
            let sw = this.actor.data.data.baseDamage.swing;

            damage = damage.toLowerCase();
            damage = damage.replace("thr", thr);
            damage = damage.replace("sw", sw)

            this.update({ ['data.melee.' + meleeKeys[k] + '.damage' ]: damage });//Update the damage value
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
            level = level + mod;//Update the skill level with the skill modifier
            this.update({ ['data.ranged.' + rangedKeys[k] + '.level' ]: level });//Update skill level
          }
        }
      }
    }
  }

  _prepareHitLocationData(itemData, data) {
    // Override common default icon
  }
  _prepareRollableData(itemData, data) {

    if(data){
      // Override common default icon
      let base = 0;
      let level = 0;
      let points = data.points;

      if (data.category == 'skill'){//It's a skill
        if (data.baseAttr == 'ST'){
          base = this.actor.data.data.primaryAttributes.strength.value;
        }
        else if (data.baseAttr == 'DX') {
          base = this.actor.data.data.primaryAttributes.dexterity.value;
        }
        else if (data.baseAttr == 'IQ') {
          base = this.actor.data.data.primaryAttributes.intelligence.value;
        }
        else if (data.baseAttr == 'HT') {
          base = this.actor.data.data.primaryAttributes.health.value;
        }
        else if (data.baseAttr == 'Per') {
          base = this.actor.data.data.primaryAttributes.perception.value;
        }
        else if (data.baseAttr == 'Will') {
          base = this.actor.data.data.primaryAttributes.will.value;
        }

        if (data.difficulty != 'W') {//It's not a wildcard
          if (points > 0){//They have spent points

            //Determine base points to skill level conversion
            if(points == 1){
              level = base;
            }
            else if(points == 2 || points == 3){
              level = base + 1;
            }
            else if(points >= 4){
              level = base + 1 + Math.floor(points/4);
            }

            //Adjust for difficulty
            if (data.difficulty == 'E') {
              level = level;
            }
            else if (data.difficulty == 'A') {
              level = level - 1;
            }
            else if (data.difficulty == 'H') {
              level = level - 2;
            }
            else if (data.difficulty == 'VH') {
              level = level - 3;
            }
          }
          else {
            level = 0;
          }
        }
        else {//It's a wildcard
          points = Math.floor(points/3);
          if (points > 0){//They have spent points
            //Determine base points to skill level conversion
            if(points == 1){
              level = base;
            }
            else if(points == 2 || points == 3){
              level = base + 1;
            }
            else if(points >= 4){
              level = base + 1 + Math.floor(points/4);
            }

            //Adjust for difficulty (W is just 3xVH)
            level = level - 3;
          }
          else {
            level = 0;
          }
        }
        level = level + data.mod
      }
      else {//It's a technique

        //Loop through all the skills on the sheet, find the one they picked and set that as the base
        for (let i = 0; i < this.actor.data.items.length; i++){
          if (this.actor.data.items[i].type === "Rollable"){
            if (this.actor.data.items[i].data.category === "skill"){
              if (data.baseSkill === this.actor.data.items[i].name){
                base = +this.actor.data.items[i].data.level;
                this.update({ ['data.baseSkillLevel']: base });
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

      this.update({ ['data.level']: level });
    }
  }

  _prepareTraitData(itemData, data) {
    this.prepareAttackData(itemData, data)
  }
}
