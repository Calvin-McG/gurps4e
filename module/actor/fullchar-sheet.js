import { SuccessRoll, SuccessRollRenderer, DamageRoll, DamageRollRenderer } from "../../lib/gurps-foundry-roll-lib/gurps-foundry-roll-lib.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class gurpsActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["gurps4e", "sheet", "actor"],
      template: "systems/gurps4e/templates/actor/fullchar-sheet.html",
      width: 540,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    for (const item of data.items) {
      if (item.data.onMain) {
        switch (item.type) {
          case "Rollable":
            data.data.skills.push(item);
            break;
          default: // not a supported type
            return ui.notifications.error("This type of item is not supported in the system!");
        }
      }
    }
    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable checks.
    html.find('.rollable').click(this._onRoll.bind(this));

    // track and handle changes to HP and FP
    html.find('.sec-attr').change(this._onSecondaryAttributeChange.bind(this));
  }

  /* -------------------------------------------- */


  /**
   * Handle changes to secondary attribute number fields.
   * @param {Event} event   The originating change event
   * @private
   */
  _onSecondaryAttributeChange(event) {
    event.preventDefault();
    let value = event.target.value;
    let name = event.target.name;
    this.actor.setConditions(value, name);
  }


  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
  * Handle clickable rolls.
  * @param {Event} event   The originating click event
  * @private
  */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const executeRoll = (roll, renderer) => {
      roll.roll();
      const flavor = dataset.label || null;
      renderer.render(roll, { template: 'systems/gurps4e/lib/gurps-foundry-roll-templates/templates/roll.html' }, { flavor }).then((html) => {
        ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker({ actor: this.actor }), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
      });
    }

    const executeSuccessRoll = modList => {
      const trait = dataset.trait || null;
      executeRoll(SuccessRoll.fromData({ level: dataset.level, trait, modList }), new SuccessRollRenderer());
    };

    const prepareModList = mods => mods.map(mod => ({ ...mod, modifier: parseInt(mod.modifier, 10) })).filter(mod => mod.modifier !== 0);

    if (dataset.type === 'skill') {
      const modList = prepareModList([{ modifier: this.actor.data.data.gmod.value, description: 'global modifier' }]);
      executeSuccessRoll(modList);
    } else if (dataset.type === 'defense') {
      const modList = prepareModList([
        { modifier: this.actor.data.data.gmod.value, description: 'global modifier' },
        { modifier: this.actor.data.data.dmod.value, description: 'DB' }
      ]);
      executeSuccessRoll(modList);
    } else if (dataset.type === 'damage') {
      let gMod = parseInt(this.actor.data.data.gmod.value, 10);
      if (gMod > 0) {
        gMod = `+${gMod}`;
      }
      executeRoll(DamageRoll.fromFormula(gMod !== 0 ? `${dataset.roll}${gMod}` : dataset.roll), new DamageRollRenderer());
    } else {
      console.log("Rollable element triggered with an unsupported data-type (supported types are 'skill', 'damage' and 'defense'");
    }

    this.actor.update({ ["data.gmod.value"]: 0 });
  }

}
