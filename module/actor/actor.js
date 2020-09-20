/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class gurpsActor extends Actor {

  /**
   * Override the create() function to provide additional GURPS4e functionality.
   *
   * This overridden create() function adds flags to an actor upon creation.
   *
   * @param {Object} data        Barebones actor data which this function adds onto.
   * @param {Object} options     (Unused) Additional options which customize the creation workflow.
   *
   */
  static async create(data, options) {

    // Set the actor flags
    data.flags = {
      myFlags: true,
      useTextBoxForDamage: game.settings.get("gurps4e", "useTextBoxForDamage")
    }
    super.create(data, options); // Follow through the the rest of the Actor creation process upstream
  }

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;

    // Make separate methods for each Actor type (minchar, npc, etc.) to keep
    // things organized. 
    if (actorData.type === 'minchar') this._prepareCharacterData(actorData);
  }

  /**
   * Handle how changes to a Token attribute bar are applied to the Actor.
   * This allows for game systems to override this behavior and deploy special logic.
   * @param {string} attribute    The attribute path
   * @param {number} value        The target attribute value
   * @param {boolean} isDelta     Whether the number represents a relative change (true) or an absolute change (false)
   * @param {boolean} isBar       Whether the new value is part of an attribute bar, or just a direct value
   * @return {Promise}
   */
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    const current = getProperty(this.data.data, attribute);
    if (isBar) {
      if (isDelta) value = Math.clamped(current.min, Number(current.value) + value, current.max);

      // TODO: insert a call to the status check method
      this.setConditions(value, attribute);

      return this.update({ [`data.${attribute}.value`]: value });
    } else {
      if (isDelta) value = Number(current) + value;

      // TODO: insert a call to the status check method
      this.setConditions(value, attribute);

      return this.update({ [`data.${attribute}`]: value });
    }
  }

  /**
   * Prepare minchar type specific data
   * 
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    // Set minimum HP and FP
    data.secondaryAttributes.hp.min = -data.secondaryAttributes.hp.max * 5;
    data.secondaryAttributes.fp.min = -data.secondaryAttributes.fp.max;

    // Set Movement rates
    let move = data.secondaryAttributes.move;
    move.step = Math.ceil(move.value / 5);
    move.half = Math.ceil(move.value / 2);
    move.sprint = Math.ceil(move.value * 1.2);


    // Set the formulae for all the attack dice if useTextBoxForDamage is false
    if (actorData.flags.useTextBoxForDamage === undefined || !actorData.flags.useTextBoxForDamage) {
      for (let [id, attack] of Object.entries(data.attacks)) {
        calculateDice(attack);
      }
    }
  }

  setConditions(newValue, attrName) {
    var attrValue;
    var attrMax;
    var attrState;

    if (attrName.includes('.hp')) { // Hit points update

      // Assign the variables
      if (attrName.includes('.max')) {
        attrMax = newValue;
        attrValue = this.data.data.secondaryAttributes.hp.value;
      } else {
        attrValue = newValue;
        attrMax = this.data.data.secondaryAttributes.hp.max;
      }
      let ratio = attrValue / attrMax;
      // set the limits
      switch (Math.trunc(ratio)) {
        case 0: {
          if (ratio <= 0) { // collapse
            attrState = '[C]';
            break;
          } else if (attrValue < (attrMax / 3)) { // reeling
            attrState = '[R]';
            break;
          }
          // healthy, no break
        }
        case 1: { // healthy
          attrState = '[H]';
          break;
        }
        case -1: { // death check at -1
          attrState = '[-X]';
          break;
        }
        case -2: { // death check at -2
          attrState = '[-2X]';
          break;
        }
        case -3: { // death check at -3
          attrState = '[-3X]';
          break;
        }
        case -4: { // death check at -4
          attrState = '[-4X]';
          break;
        }
        default: { // dead
          attrState = '[DEAD]';
          break;
        }
      }
      this.update({ ['data.secondaryAttributes.hp.state']: attrState });
    } else { // Fatigue points update

      // Assign the variables
      if (attrName.includes('.max')) {
        attrMax = newValue;
        attrValue = this.data.data.secondaryAttributes.fp.value;
      } else {
        attrValue = newValue;
        attrMax = this.data.data.secondaryAttributes.fp.max;
      }
      let ratio = attrValue / attrMax;
      // set the limits
      switch (Math.trunc(ratio)) {
        case 0: {
          if (ratio <= 0) { // collapse
            attrState = '[C]';
            break;
          } else if (attrValue < (attrMax / 3)) { // tired
            attrState = '[T]';
            break;
          }
          // fresh, no break
        }
        case 1: { // fresh
          attrState = '[F]';
          break;
        }
        default: { // unconscious
          attrState = '[UNC]';
          break;
        }
      }
      // update the actor
      this.update({ ['data.secondaryAttributes.fp.state']: attrState });
    }
  }
}

// calculate the dice formula from a seed value
function calculateDice(attribute) {
  let value = attribute.seed;

  let dice = Math.floor(value / 4);
  let mod = value % 4 - 1;

  if (dice == 0) { // dice may not be zero
    dice = 1;
    mod -= 4;
  }
  value = dice + "d6";
  if (mod < 0) {
    value += mod;
  } else if (mod > 0) {
    value += ("+" + mod);
  }
  attribute.formula = value;
}
