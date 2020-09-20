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

    return;

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
