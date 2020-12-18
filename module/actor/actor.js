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
		console.log(this.data.data);
		super.prepareData();
		// console.log("prepareData actor");
        // console.log(this);

		//Total up spent and remaining points
		this.recalcAtrPoints();
		this.recalcTraitPoints();
		this.recalcSkillPoints();
		this.recalcPointTotals();

		//Convert spent points into their effective values
		this.recalcAtrValues();

		//Recalculate encumberance values, along with effective dodge and move. Do this last so move and dodge is correct.
		this.recalcEncValues();
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

	recalcAtrValues(){
		var smDiscount = Math.min((Math.max(((+10 - +this.data.data.bio.sm.value) / +10), 0.2)) , 1);

		//ST
		var st = +10 + +this.data.data.primaryAttributes.strength.mod + +Math.floor(this.data.data.primaryAttributes.strength.points / +(+10 * +smDiscount));
		this.update({ ['data.primaryAttributes.strength.value']: st });

		//DX
		var dx = +10 + +this.data.data.primaryAttributes.dexterity.mod + +Math.floor(this.data.data.primaryAttributes.dexterity.points/20);
		this.update({ ['data.primaryAttributes.dexterity.value']: dx });

		//IQ
		var iq = +10 + +this.data.data.primaryAttributes.intelligence.mod + +Math.floor(this.data.data.primaryAttributes.intelligence.points/20);
		this.update({ ['data.primaryAttributes.intelligence.value']: iq });

		//HT
		var ht = +10 + +this.data.data.primaryAttributes.health.mod + +Math.floor(this.data.data.primaryAttributes.health.points/10);
		this.update({ ['data.primaryAttributes.health.value']: ht });

		//Per
		var per = +iq + +this.data.data.primaryAttributes.perception.mod + +Math.floor(this.data.data.primaryAttributes.perception.points/5);
		this.update({ ['data.primaryAttributes.perception.value']: per });

		//Will
		var will = +iq + +this.data.data.primaryAttributes.will.mod + +Math.floor(this.data.data.primaryAttributes.will.points/5);
		this.update({ ['data.primaryAttributes.will.value']: will });

		//Fright
		var fr = +will + +this.data.data.primaryAttributes.fright.mod + +Math.floor(this.data.data.primaryAttributes.fright.points/2);
		this.update({ ['data.primaryAttributes.fright.value']: fr });

		//Speed
		var speed = Math.floor(((+(+dx + +ht) / +4) + +this.data.data.primaryAttributes.speed.mod + +(this.data.data.primaryAttributes.speed.points/20)) * +4) / +4;
		this.update({ ['data.primaryAttributes.speed.value']: speed });

		//Move
		var move = Math.floor(speed) + +this.data.data.primaryAttributes.move.mod + +Math.floor(this.data.data.primaryAttributes.move.points/5);
		this.update({ ['data.primaryAttributes.move.value']: move });

		//Dodge
		var dodge = Math.floor(speed) + +3 + +this.data.data.primaryAttributes.dodge.mod + +Math.floor(this.data.data.primaryAttributes.dodge.points/15);
		this.update({ ['data.primaryAttributes.dodge.value']: dodge });

		//Lifting ST
		var lst = +st + +this.data.data.primaryAttributes.lifting.mod + +Math.floor(this.data.data.primaryAttributes.lifting.points / +( +3 * +smDiscount));
		this.update({ ['data.primaryAttributes.lifting.value']: lst });

		//Striking ST
		var sst = +st + +this.data.data.primaryAttributes.striking.mod + +Math.floor(this.data.data.primaryAttributes.striking.points / +(+5 * +smDiscount));
		this.update({ ['data.primaryAttributes.striking.value']: sst });

		//HT Subdue
		var hts = +ht + +this.data.data.primaryAttributes.subdue.mod + +Math.floor(this.data.data.primaryAttributes.subdue.points/2);
		this.update({ ['data.primaryAttributes.subdue.value']: hts });

		//HT Kill
		var htk = +ht + +this.data.data.primaryAttributes.death.mod + +Math.floor(this.data.data.primaryAttributes.death.points/2);
		this.update({ ['data.primaryAttributes.death.value']: htk });

		//HP
		var hp = +st + +this.data.data.reserves.hp.mod + +Math.floor(this.data.data.reserves.hp.points / +( +2 * +smDiscount));
		this.update({ ['data.reserves.hp.max']: hp });

		//FP
		var fp = +ht + +this.data.data.reserves.fp.mod + +Math.floor(this.data.data.reserves.fp.points/3);
		this.update({ ['data.reserves.fp.max']: fp });

		//ER
		var er = +0 + +this.data.data.reserves.er.mod + +Math.floor(this.data.data.reserves.er.points/3);
		this.update({ ['data.reserves.er.max']: er });
	}

	recalcTraitPoints() {
        var traitPoints = +0;
		//Iterate through the list of traits. Advantages and Disadvantages
        for (let i = 0; i < this.data.items.length; i++){
            if (this.data.items[i].type === "Trait"){
                traitPoints = traitPoints += this.data.items[i].data.points
            }
        }
        this.update({ ['data.points.traits']: traitPoints });
	}

    recalcSkillPoints() {
        var skillPoints = +0;
        //Iterate through the list of skills. Advantages and Disadvantages
        for (let i = 0; i < this.data.items.length; i++){
            if (this.data.items[i].type === "Rollable"){
                skillPoints = skillPoints += this.data.items[i].data.points
            }
        }
        this.update({ ['data.points.skills']: skillPoints });
    }

	recalcEncValues(){
		var st = this.data.data.primaryAttributes.strength.value;
		var bl = ((st * st)/5);
		var move = this.data.data.primaryAttributes.move.value;
		var dodge = this.data.data.primaryAttributes.dodge.value;
		var carriedWeight = 0;
		var carriedCost = 0;

		this.update({ ['data.encumbrance.none.lbs']: bl });
		this.update({ ['data.encumbrance.light.lbs']: bl * 2 });
		this.update({ ['data.encumbrance.medium.lbs']: bl * 3 });
		this.update({ ['data.encumbrance.heavy.lbs']: bl * 6 });
		this.update({ ['data.encumbrance.xheavy.lbs']: bl * 10 });

		this.update({ ['data.encumbrance.none.move']: move });
		this.update({ ['data.encumbrance.light.move']: Math.max((Math.floor(move * 0.8)), 1) });
		this.update({ ['data.encumbrance.medium.move']: Math.max((Math.floor(move * 0.6)), 1) });
		this.update({ ['data.encumbrance.heavy.move']: Math.max((Math.floor(move * 0.4)), 1) });
		this.update({ ['data.encumbrance.xheavy.move']: Math.max((Math.floor(move * 0.2)), 1) });

		this.update({ ['data.encumbrance.none.dodge']: dodge });
		this.update({ ['data.encumbrance.light.dodge']: Math.max(dodge - 1, 1) });
		this.update({ ['data.encumbrance.medium.dodge']: Math.max(dodge - 2, 1) });
		this.update({ ['data.encumbrance.heavy.dodge']: Math.max(dodge - 3, 1) });
		this.update({ ['data.encumbrance.xheavy.dodge']: Math.max(dodge - 4, 1) });

		console.log(this.data.items);

		//Clear carried weight/cost before retotalling
		carriedWeight = 0;
		carriedCost = 0;
		//Running loop to total up weight and value for the sheet
		for (let l = 0; l < this.data.items.length; l++){
			if (this.data.items[l].type == "Equipment"){
				carriedWeight = this.data.items[l].data.ttlWeight + carriedWeight;
				carriedCost = this.data.items[l].data.ttlCost + carriedCost;
			}
		}
		//Assign total weight and cost
		this.update({ ['data.bio.carriedWeight']: carriedWeight });
		this.update({ ['data.bio.carriedValue']: carriedCost });
	}

	setTotalPoints(unspent) {
		var total;

		total = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills + +unspent;

		this.update({ ['data.points.total']: total });
	}

	recalcAtrPoints(){
		//Update point totals
		var attributePoints = +this.data.data.primaryAttributes.strength.points +
			+this.data.data.primaryAttributes.dexterity.points +
			+this.data.data.primaryAttributes.intelligence.points +
			+this.data.data.primaryAttributes.health.points +
			+this.data.data.primaryAttributes.perception.points +
			+this.data.data.primaryAttributes.will.points +
			+this.data.data.primaryAttributes.fright.points +
			+this.data.data.primaryAttributes.speed.points +
			+this.data.data.primaryAttributes.move.points +
			+this.data.data.primaryAttributes.dodge.points +
			+this.data.data.reserves.hp.points +
			+this.data.data.reserves.fp.points +
			+this.data.data.reserves.er.points +
			+this.data.data.bio.tl.points;
		this.update({ ['data.points.attributes']: attributePoints });
	}

	recalcPointTotals() {
		var unspent;
		var spent;

		spent = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills;

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
