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
    console.log(this.actor.data.data);
    //return;

    // all types have one. Might as well update it here
    data.notes = data.notes || "note";

    switch (itemData.type) {
      case "Item": // legacy item type
        this._prepareItemData(itemData, data);
        break;
      case "Equipment":
        this._prepareEquipmentData(itemData, data);
        break;
      case "Hit-Location":
        this._prepareHitLocationData(itemData, data);
        break;
      case "Melee-Attack":
        this._prepareMeleeAttackData(itemData, data);
        break;
      case "Ranged-Attack":
        this._prepareRangedAttackData(itemData, data);
        break;
      case "Rollable":
        this._prepareRollableData(itemData, data);
        break;
      case "Modifier":
        this._prepareModifierData(itemData, data);
        break;
      case "Defence":
        this._prepareDefenceData(itemData, data);
        break;
      case "Trait":
        this._prepareTraitData(itemData, data);
        break;
      default: // not a supported type
        return ui.notifications.error(game.i18n.localize("GURPS4E.Error.BadItemtype"));
    }
  }

  _prepareItemData(itemData, data) {
    // Override common default icon
    data.quantity = data.quantity || 1;
    data.weight = data.weight || 0;
  }
  _prepareEquipmentData(itemData, data) {
    // Override common default icon
    data.quantity = data.quantity || 1;
    data.weight = data.weight || 0;
    data.cost = data.cost || "";
  }
  _prepareHitLocationData(itemData, data) {
    // Override common default icon
  }
  _prepareMeleeAttackData(itemData, data) {
    // Override common default icon
}
  _prepareRangedAttackData(itemData, data) {
    // Override common default icon
  }
  _prepareRollableData(itemData, data) {
    // Override common default icon
    console.log(data);
    let attr = 0;
    let skill = 0;
    let points = data.points;

    if (data.baseAttr == 'ST'){
      attr = this.actor.data.data.primaryAttributes.strength.value;
    }
    else if (data.baseAttr == 'DX') {
      attr = this.actor.data.data.primaryAttributes.dexterity.value;
    }
    else if (data.baseAttr == 'IQ') {
      attr = this.actor.data.data.primaryAttributes.intelligence.value;
    }
    else if (data.baseAttr == 'HT') {
      attr = this.actor.data.data.primaryAttributes.health.value;
    }
    else if (data.baseAttr == 'Per') {
      attr = this.actor.data.data.primaryAttributes.perception.value;
    }
    else if (data.baseAttr == 'Will') {
      attr = this.actor.data.data.primaryAttributes.will.value;
    }

    if (data.difficulty != 'W') {//It's not a wildcard
      if (points > 0){//They have spent points

        //Determine base points to skill level conversion
        if(points == 1){
          skill = attr;
        }
        else if(points == 2 || points == 3){
          skill = attr + 1;
        }
        else if(points >= 4){
          skill = attr + 1 + Math.floor(points/4);
        }

        //Adjust for difficulty
        if (data.difficulty == 'E') {
          skill = skill;
        }
        else if (data.difficulty == 'A') {
          skill = skill - 1;
        }
        else if (data.difficulty == 'H') {
          skill = skill - 2;
        }
        else if (data.difficulty == 'VH') {
          skill = skill - 3;
        }
      }
      else {
        skill = 0;
      }
    }
    else {//It's a wildcard
      points = Math.floor(points/3);
      if (points > 0){//They have spent points
        //Determine base points to skill level conversion
        if(points == 1){
          skill = attr;
        }
        else if(points == 2 || points == 3){
          skill = attr + 1;
        }
        else if(points >= 4){
          skill = attr + 1 + Math.floor(points/4);
        }

        //Adjust for difficulty
        if (data.difficulty == 'E') {
          skill = skill;
        }
        else if (data.difficulty == 'A') {
          skill = skill - 1;
        }
        else if (data.difficulty == 'H') {
          skill = skill - 2;
        }
        else if (data.difficulty == 'VH') {
          skill = skill - 3;
        }
      }
      else {
        skill = 0;
      }
    }

    this.update({ ['data.level']: skill + data.mod });
  }
  _prepareModifierData(itemData, data) {
    // Override common default icon
  }
  _prepareDefenceData(itemData, data) {
    // Override common default icon
    
    data.defences = Object.entries(GURPS4E.defences).map(entry => {
      const [category, label] = entry;
      return {
          category,
          label,
          checked: category === data.category,
      }
  });
  }
  _prepareTraitData(itemData, data) {
    // Override common default icon
  }
}
