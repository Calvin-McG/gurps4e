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
	 * @param {Object} data				Barebones actor data which this function adds onto.
	 * @param {Object} options		 (Unused) Additional options which customize the creation workflow.
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
	 * @param {string} attribute		The attribute path
	 * @param {number} value				The target attribute value
	 * @param {boolean} isDelta		 Whether the number represents a relative change (true) or an absolute change (false)
	 * @param {boolean} isBar			 Whether the new value is part of an attribute bar, or just a direct value
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
		data.reserves.hp.min = -data.reserves.hp.max * 5;
		data.reserves.fp.min = -data.reserves.fp.max;

		// Set Movement rates
		// let move = data.primaryAttributes.move.value;
		// move.step = Math.ceil(move.value / 5);
		// move.half = Math.ceil(move.value / 2);
		// move.sprint = Math.ceil(move.value * 1.2);

		// Set the formulae for all the attack dice if useTextBoxForDamage is false
		if (actorData.flags.useTextBoxForDamage === undefined || !actorData.flags.useTextBoxForDamage) {
			for (let [id, attack] of Object.entries(data.attacks)) {
				calculateDice(attack);
			}
		}
	}

	setAtrPoints(points, name) {
		var value = 10;
		var attributePoints = 0;

		//Calculate new stat based on point value, including the value of the attribute mod
	    if (name.includes("strength")){
			value = +value + +this.data.data.primaryAttributes.strength.mod + +Math.floor(points/10);
			this.update({ ['data.primaryAttributes.strength.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.health.points +
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.speed.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
        }
		else if (name.includes("dexterity")){
			value = +value + +this.data.data.primaryAttributes.dexterity.mod + +Math.floor(points/20);
			this.update({ ['data.primaryAttributes.dexterity.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.health.points +
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.speed.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}
		else if (name.includes("intelligence")){
			value = +value + +this.data.data.primaryAttributes.intelligence.mod + +Math.floor(points/20);
			this.update({ ['data.primaryAttributes.intelligence.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.health.points +
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.speed.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}
		else if (name.includes("health")){
			value = +value + +this.data.data.primaryAttributes.health.mod + +Math.floor(points/10);
			this.update({ ['data.primaryAttributes.health.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.speed.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}
		else if (name.includes("perception")){
			value = +value + +this.data.data.primaryAttributes.perception.mod + +Math.floor(points/5);
			this.update({ ['data.primaryAttributes.perception.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.health.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.speed.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}
		else if (name.includes("will")){
			value = +value + +this.data.data.primaryAttributes.will.mod + +Math.floor(points/5);
			this.update({ ['data.primaryAttributes.will.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.health.points +
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.speed.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}
		else if (name.includes("fright")){
			value = +value + +this.data.data.primaryAttributes.fright.mod + +Math.floor(points/2);
			this.update({ ['data.primaryAttributes.fright.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.health.points +
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.speed.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}
		else if (name.includes("speed")){
			value = Math.floor((+value + +this.data.data.primaryAttributes.speed.mod + +(points/20) - +5) * +4) / +4;
			this.update({ ['data.primaryAttributes.speed.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.health.points
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.move.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}
		else if (name.includes("move")){
			value = +value + +this.data.data.primaryAttributes.move.mod + +Math.floor(points/5) - +5;
			this.update({ ['data.primaryAttributes.move.value']: value });

			//Update point totals
			attributePoints = +this.data.data.primaryAttributes.strength.points +
				+this.data.data.primaryAttributes.dexterity.points +
				+this.data.data.primaryAttributes.intelligence.points +
				+this.data.data.primaryAttributes.health.points +
				+this.data.data.primaryAttributes.perception.points +
				+this.data.data.primaryAttributes.will.points +
				+this.data.data.primaryAttributes.fright.points +
				+this.data.data.primaryAttributes.speed.points +
				+points;
			this.update({ ['data.points.attributes']: attributePoints });
		}

		this.recalcPointsAtr(attributePoints);
	}

	setAtrMod(mod, name) {
		var value = 10;

		if (name.includes("strength")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.strength.points/10);
			this.update({ ['data.primaryAttributes.strength.value']: value });
		}
		else if (name.includes("dexterity")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.dexterity.points/20);
			this.update({ ['data.primaryAttributes.dexterity.value']: value });
		}
		else if (name.includes("intelligence")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.intelligence.points/20);
			this.update({ ['data.primaryAttributes.intelligence.value']: value });
		}
		else if (name.includes("health")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.health.points/10);
			this.update({ ['data.primaryAttributes.health.value']: value });
		}
		else if (name.includes("perception")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.perception.points/5);
			this.update({ ['data.primaryAttributes.perception.value']: value });
		}
		else if (name.includes("will")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.will.points/5);
			this.update({ ['data.primaryAttributes.will.value']: value });
		}
		else if (name.includes("fright")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.fright.points/2);
			this.update({ ['data.primaryAttributes.fright.value']: value });
		}
		else if (name.includes("speed")){
			value = Math.floor((+value + +mod + +(this.data.data.primaryAttributes.speed.points/20) - +5) * +4) / +4;
			this.update({ ['data.primaryAttributes.speed.value']: value });
		}
		else if (name.includes("move")){
			value = +value + +mod + +Math.floor(this.data.data.primaryAttributes.move.points/5) - +5;
			this.update({ ['data.primaryAttributes.move.value']: value });
		}

	}

	setTotalPoints(unspent) {
		var total;

		total = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills + +unspent;

		this.update({ ['data.points.total']: total });
	}

	recalcPoints() {
		var unspent;
		var spent;

		spent = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills;

		unspent = +this.data.data.points.total - +spent;

		this.update({ ['data.points.unspent']: unspent });
	}

	recalcPointsAtr(attributePoints) {
		var unspent;
		var spent;

		spent = +attributePoints + +this.data.data.points.traits + +this.data.data.points.skills;
		unspent = +this.data.data.points.total - +spent;

		this.update({ ['data.points.unspent']: unspent });
	}

	setConditions(newValue, attrName) {
		var attrValue;
		var attrMax;
		var attrState;

		if (attrName.includes('.hp')) { // Hit points update

			// Assign the variables
			if (attrName.includes('.max')) {
				attrMax = newValue;
				attrValue = this.data.data.reserves.hp.value;
			} else {
				attrValue = newValue;
				attrMax = this.data.data.reserves.hp.max;
			}
			let ratio = attrValue / attrMax;
			// set the limits
			switch (Math.trunc(ratio)) {
				case 0: {
					if (ratio <= 0) { // collapse
						attrState = 'Collapse';
						break;
					} else if (attrValue < (attrMax / 3)) { // reeling
						attrState = 'Reeling';
						break;
					}
					// healthy, no break
				}
				case 1: { // healthy
					attrState = 'Healthy';
					break;
				}
				case -1: { // death check at -1
					attrState = 'Death 1';
					break;
				}
				case -2: { // death check at -2
					attrState = 'Death 2';
					break;
				}
				case -3: { // death check at -3
					attrState = 'Death 3';
					break;
				}
				case -4: { // death check at -4
					attrState = 'Death 4';
					break;
				}
				default: { // dead
					attrState = 'Dead';
					break;
				}
			}
			this.update({ ['data.reserves.hp.state']: attrState });
		} else { // Fatigue points update

			// Assign the variables
			if (attrName.includes('.max')) {
				attrMax = newValue;
				attrValue = this.data.data.reserves.fp.value;
			} else {
				attrValue = newValue;
				attrMax = this.data.data.reserves.fp.max;
			}
			let ratio = attrValue / attrMax;
			// set the limits
			switch (Math.trunc(ratio)) {
				case 0: {
					if (ratio <= 0) { // collapse
						attrState = 'Collapse';
						break;
					} else if (attrValue < (attrMax / 3)) { // tired
						attrState = 'Tired';
						break;
					}
					// fresh, no break
				}
				case 1: { // fresh
					attrState = 'Fresh';
					break;
				}
				default: { // unconscious
					attrState = 'Unconscious';
					break;
				}
			}
			// update the actor
			this.update({ ['data.reserves.fp.state']: attrState });
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
