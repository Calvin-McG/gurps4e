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
		super.create(data, options); // Follow through the the rest of the Actor creation process upstream
	}

	/**
	 * Augment the basic actor data with additional dynamic data.
	 */
	prepareData() {
		super.prepareData();

		console.log(this);
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
		this.data.data.primaryAttributes.strength.value = st;

		//DX
		var dx = +10 + +this.data.data.primaryAttributes.dexterity.mod + +Math.floor(this.data.data.primaryAttributes.dexterity.points/20);
		this.data.data.primaryAttributes.dexterity.value = dx;

		//IQ
		var iq = +10 + +this.data.data.primaryAttributes.intelligence.mod + +Math.floor(this.data.data.primaryAttributes.intelligence.points/20);
		this.data.data.primaryAttributes.intelligence.value = iq;

		//HT
		var ht = +10 + +this.data.data.primaryAttributes.health.mod + +Math.floor(this.data.data.primaryAttributes.health.points/10);
		this.data.data.primaryAttributes.health.value = ht;

		//Per
		var per = +iq + +this.data.data.primaryAttributes.perception.mod + +Math.floor(this.data.data.primaryAttributes.perception.points/5);
		this.data.data.primaryAttributes.perception.value = per;

		//Will
		var will = +iq + +this.data.data.primaryAttributes.will.mod + +Math.floor(this.data.data.primaryAttributes.will.points/5);
		this.data.data.primaryAttributes.will.value = will;

		//Fright
		var fr = +will + +this.data.data.primaryAttributes.fright.mod + +Math.floor(this.data.data.primaryAttributes.fright.points/2);
		this.data.data.primaryAttributes.fright.value = fr;

		//Speed
		var speed = Math.floor(((+(+dx + +ht) / +4) + +this.data.data.primaryAttributes.speed.mod + +(this.data.data.primaryAttributes.speed.points/20)) * +4) / +4;
		this.data.data.primaryAttributes.speed.value = speed;

		//Move
		var move = Math.floor(speed) + +this.data.data.primaryAttributes.move.mod + +Math.floor(this.data.data.primaryAttributes.move.points/5);
		this.data.data.primaryAttributes.move.value = move;

		//Dodge
		var dodge = Math.floor(speed) + +3 + +this.data.data.primaryAttributes.dodge.mod + +Math.floor(this.data.data.primaryAttributes.dodge.points/15);
		this.data.data.primaryAttributes.dodge.value = dodge;

		//Lifting ST
		var lst = +st + +this.data.data.primaryAttributes.lifting.mod + +Math.floor(this.data.data.primaryAttributes.lifting.points / +( +3 * +smDiscount));
		this.data.data.primaryAttributes.lifting.value = lst;

		//Striking ST
		var sst = +st + +this.data.data.primaryAttributes.striking.mod + +Math.floor(this.data.data.primaryAttributes.striking.points / +(+5 * +smDiscount));
		this.data.data.primaryAttributes.striking.value = sst;

		//Swing and Thrust
		switch(sst) {
			case 1:
				this.data.data.baseDamage.thrust = "1d6-6";
				this.data.data.baseDamage.swing = "1d6-5";
				break;
			case 2:
				this.data.data.baseDamage.thrust = "1d6-6";
				this.data.data.baseDamage.swing = "1d6-5";
				break;
			case 3:
				this.data.data.baseDamage.thrust = "1d6-5";
				this.data.data.baseDamage.swing = "1d6-4";
				break;
			case 4:
				this.data.data.baseDamage.thrust = "1d6-5";
				this.data.data.baseDamage.swing = "1d6-4";
				break;
			case 5:
				this.data.data.baseDamage.thrust = "1d6-4";
				this.data.data.baseDamage.swing = "1d6-3";
				break;
			case 6:
				this.data.data.baseDamage.thrust = "1d6-4";
				this.data.data.baseDamage.swing = "1d6-3";
				break;
			case 7:
				this.data.data.baseDamage.thrust = "1d6-3";
				this.data.data.baseDamage.swing = "1d6-2";
				break;
			case 8:
				this.data.data.baseDamage.thrust = "1d6-3";
				this.data.data.baseDamage.swing = "1d6-2";
				break;
			case 9:
				this.data.data.baseDamage.thrust = "1d6-2";
				this.data.data.baseDamage.swing = "1d6-1";
				break;
			case 10:
				this.data.data.baseDamage.thrust = "1d6-2";
				this.data.data.baseDamage.swing = "1d6";
				break;
			case 11:
				this.data.data.baseDamage.thrust = "1d6-1";
				this.data.data.baseDamage.swing = "1d6+1";
				break;
			case 12:
				this.data.data.baseDamage.thrust = "1d6-1";
				this.data.data.baseDamage.swing = "1d6+2";
				break;
			case 13:
				this.data.data.baseDamage.thrust = "1d6";
				this.data.data.baseDamage.swing = "2d6-1";
				break;
			case 14:
				this.data.data.baseDamage.thrust = "1d6";
				this.data.data.baseDamage.swing = "2d6";
				break;
			case 15:
				this.data.data.baseDamage.thrust = "1d6+1";
				this.data.data.baseDamage.swing = "2d6+1";
				break;
			case 16:
				this.data.data.baseDamage.thrust = "1d6+1";
				this.data.data.baseDamage.swing = "2d6+2";
				break;
			case 17:
				this.data.data.baseDamage.thrust = "1d6+2";
				this.data.data.baseDamage.swing = "3d6-1";
				break;
			case 18:
				this.data.data.baseDamage.thrust = "1d6+2";
				this.data.data.baseDamage.swing = "3d6";
				break;
			case 19:
				this.data.data.baseDamage.thrust = "2d6-1";
				this.data.data.baseDamage.swing = "3d6+1";
				break;
			case 20:
				this.data.data.baseDamage.thrust = "2d6-1";
				this.data.data.baseDamage.swing = "3d6+2";
				break;
			case 21:
				this.data.data.baseDamage.thrust = "2d6";
				this.data.data.baseDamage.swing = "4d6-1";
				break;
			case 22:
				this.data.data.baseDamage.thrust = "2d6";
				this.data.data.baseDamage.swing = "4d6";
				break;
			case 23:
				this.data.data.baseDamage.thrust = "2d6+1";
				this.data.data.baseDamage.swing = "4d6+1";
				break;
			case 24:
				this.data.data.baseDamage.thrust = "2d6+1";
				this.data.data.baseDamage.swing = "4d6+2";
				break;
			case 25:
				this.data.data.baseDamage.thrust = "2d6+2";
				this.data.data.baseDamage.swing = "5d6-1";
				break;
			case 26:
				this.data.data.baseDamage.thrust = "2d6+2";
				this.data.data.baseDamage.swing = "5d6";
				break;
			case 27:
				this.data.data.baseDamage.thrust = "3d6-1";
				this.data.data.baseDamage.swing = "5d6+1";
				break;
			case 28:
				this.data.data.baseDamage.thrust = "3d6-1";
				this.data.data.baseDamage.swing = "5d6+1";
				break;
			case 29:
				this.data.data.baseDamage.thrust = "3d6";
				this.data.data.baseDamage.swing = "5d6+2";
				break;
			case 30:
				this.data.data.baseDamage.thrust = "3d6";
				this.data.data.baseDamage.swing = "5d6+2";
				break;
			case 31:
				this.data.data.baseDamage.thrust = "3d6-+1";
				this.data.data.baseDamage.swing = "6d6-1";
				break;
			case 32:
				this.data.data.baseDamage.thrust = "3d6+1";
				this.data.data.baseDamage.swing = "6d6-1";
				break;
			case 33:
				this.data.data.baseDamage.thrust = "3d6+2";
				this.data.data.baseDamage.swing = "6d6";
				break;
			case 34:
				this.data.data.baseDamage.thrust = "3d6+2";
				this.data.data.baseDamage.swing = "6d6";
				break;
			case 35:
				this.data.data.baseDamage.thrust = "4d6-1";
				this.data.data.baseDamage.swing = "6d6+1";
				break;
			case 36:
				this.data.data.baseDamage.thrust = "4d6-1";
				this.data.data.baseDamage.swing = "6d6+1";
				break;
			case 37:
				this.data.data.baseDamage.thrust = "4d6";
				this.data.data.baseDamage.swing = "6d6+2";
				break;
			case 38:
				this.data.data.baseDamage.thrust = "4d6";
				this.data.data.baseDamage.swing = "6d6+2";
				break;
			case 39:
				this.data.data.baseDamage.thrust = "4d6+1";
				this.data.data.baseDamage.swing = "7d6-1";
				break;
			case 40:
				this.data.data.baseDamage.thrust = "4d6+1";
				this.data.data.baseDamage.swing = "7d6-1";
				break;
			case 41:
				this.data.data.baseDamage.thrust = "4d6+1";
				this.data.data.baseDamage.swing = "7d6-1";
				break;
			case 42:
				this.data.data.baseDamage.thrust = "4d6+1";
				this.data.data.baseDamage.swing = "7d6-1";
				break;
			case 43:
				this.data.data.baseDamage.thrust = "4d6+1";
				this.data.data.baseDamage.swing = "7d6-1";
				break;
			case 44:
				this.data.data.baseDamage.thrust = "4d6+1";
				this.data.data.baseDamage.swing = "7d6-1";
				break;
			case 45:
				this.data.data.baseDamage.thrust = "5d6";
				this.data.data.baseDamage.swing = "7d6+1";
				break;
			case 46:
				this.data.data.baseDamage.thrust = "5d6";
				this.data.data.baseDamage.swing = "7d6+1";
				break;
			case 47:
				this.data.data.baseDamage.thrust = "5d6";
				this.data.data.baseDamage.swing = "7d6+1";
				break;
			case 48:
				this.data.data.baseDamage.thrust = "5d6";
				this.data.data.baseDamage.swing = "7d6+1";
				break;
			case 49:
				this.data.data.baseDamage.thrust = "5d6";
				this.data.data.baseDamage.swing = "7d6+1";
				break;
			case 50:
				this.data.data.baseDamage.thrust = "5d6+2";
				this.data.data.baseDamage.swing = "8d6-1";
				break;
			case 51:
				this.data.data.baseDamage.thrust = "5d6+2";
				this.data.data.baseDamage.swing = "8d6-1";
				break;
			case 52:
				this.data.data.baseDamage.thrust = "5d6+2";
				this.data.data.baseDamage.swing = "8d6-1";
				break;
			case 53:
				this.data.data.baseDamage.thrust = "5d6+2";
				this.data.data.baseDamage.swing = "8d6-1";
				break;
			case 54:
				this.data.data.baseDamage.thrust = "5d6+2";
				this.data.data.baseDamage.swing = "8d6-1";
				break;
			case 55:
				this.data.data.baseDamage.thrust = "6d6";
				this.data.data.baseDamage.swing = "8d6+1";
				break;
			case 56:
				this.data.data.baseDamage.thrust = "6d6";
				this.data.data.baseDamage.swing = "8d6+1";
				break;
			case 57:
				this.data.data.baseDamage.thrust = "6d6";
				this.data.data.baseDamage.swing = "8d6+1";
				break;
			case 58:
				this.data.data.baseDamage.thrust = "6d6";
				this.data.data.baseDamage.swing = "8d6+1";
				break;
			case 59:
				this.data.data.baseDamage.thrust = "6d6";
				this.data.data.baseDamage.swing = "8d6+1";
				break;
			case 60:
				this.data.data.baseDamage.thrust = "7d6-1";
				this.data.data.baseDamage.swing = "9d6";
				break;
			case 61:
				this.data.data.baseDamage.thrust = "7d6-1";
				this.data.data.baseDamage.swing = "9d6";
				break;
			case 62:
				this.data.data.baseDamage.thrust = "7d6-1";
				this.data.data.baseDamage.swing = "9d6";
				break;
			case 63:
				this.data.data.baseDamage.thrust = "7d6-1";
				this.data.data.baseDamage.swing = "9d6";
				break;
			case 64:
				this.data.data.baseDamage.thrust = "7d6-1";
				this.data.data.baseDamage.swing = "9d6";
				break;
			case 65:
				this.data.data.baseDamage.thrust = "7d6+1";
				this.data.data.baseDamage.swing = "9d6+2";
				break;
			case 66:
				this.data.data.baseDamage.thrust = "7d6+1";
				this.data.data.baseDamage.swing = "9d6+2";
				break;
			case 67:
				this.data.data.baseDamage.thrust = "7d6+1";
				this.data.data.baseDamage.swing = "9d6+2";
				break;
			case 68:
				this.data.data.baseDamage.thrust = "7d6+1";
				this.data.data.baseDamage.swing = "9d6+2";
				break;
			case 69:
				this.data.data.baseDamage.thrust = "7d6+1";
				this.data.data.baseDamage.swing = "9d6+2";
				break;
			case 70:
				this.data.data.baseDamage.thrust = "8d6";
				this.data.data.baseDamage.swing = "10d6";
				break;
			case 71:
				this.data.data.baseDamage.thrust = "8d6";
				this.data.data.baseDamage.swing = "10d6";
				break;
			case 72:
				this.data.data.baseDamage.thrust = "8d6";
				this.data.data.baseDamage.swing = "10d6";
				break;
			case 73:
				this.data.data.baseDamage.thrust = "8d6";
				this.data.data.baseDamage.swing = "10d6";
				break;
			case 74:
				this.data.data.baseDamage.thrust = "8d6";
				this.data.data.baseDamage.swing = "10d6";
				break;
			case 75:
				this.data.data.baseDamage.thrust = "8d6+2";
				this.data.data.baseDamage.swing = "10d6+2";
				break;
			case 76:
				this.data.data.baseDamage.thrust = "8d6+2";
				this.data.data.baseDamage.swing = "10d6+2";
				break;
			case 77:
				this.data.data.baseDamage.thrust = "8d6+2";
				this.data.data.baseDamage.swing = "10d6+2";
				break;
			case 78:
				this.data.data.baseDamage.thrust = "8d6+2";
				this.data.data.baseDamage.swing = "10d6+2";
				break;
			case 79:
				this.data.data.baseDamage.thrust = "8d6+2";
				this.data.data.baseDamage.swing = "10d6+2";
				break;
			case 80:
				this.data.data.baseDamage.thrust = "9d6";
				this.data.data.baseDamage.swing = "11d6";
				break;
			case 81:
				this.data.data.baseDamage.thrust = "9d6";
				this.data.data.baseDamage.swing = "11d6";
				break;
			case 82:
				this.data.data.baseDamage.thrust = "9d6";
				this.data.data.baseDamage.swing = "11d6";
				break;
			case 83:
				this.data.data.baseDamage.thrust = "9d6";
				this.data.data.baseDamage.swing = "11d6";
				break;
			case 84:
				this.data.data.baseDamage.thrust = "9d6";
				this.data.data.baseDamage.swing = "11d6";
				break;
			case 85:
				this.data.data.baseDamage.thrust = "9d6+2";
				this.data.data.baseDamage.swing = "11d6+2";
				break;
			case 86:
				this.data.data.baseDamage.thrust = "9d6+2";
				this.data.data.baseDamage.swing = "11d6+2";
				break;
			case 87:
				this.data.data.baseDamage.thrust = "9d6+2";
				this.data.data.baseDamage.swing = "11d6+2";
				break;
			case 88:
				this.data.data.baseDamage.thrust = "9d6+2";
				this.data.data.baseDamage.swing = "11d6+2";
				break;
			case 89:
				this.data.data.baseDamage.thrust = "9d6+2";
				this.data.data.baseDamage.swing = "11d6+2";
				break;
			case 90:
				this.data.data.baseDamage.thrust = "10d6";
				this.data.data.baseDamage.swing = "12d6";
				break;
			case 91:
				this.data.data.baseDamage.thrust = "10d6";
				this.data.data.baseDamage.swing = "12d6";
				break;
			case 92:
				this.data.data.baseDamage.thrust = "10d6";
				this.data.data.baseDamage.swing = "12d6";
				break;
			case 93:
				this.data.data.baseDamage.thrust = "10d6";
				this.data.data.baseDamage.swing = "12d6";
				break;
			case 94:
				this.data.data.baseDamage.thrust = "10d6";
				this.data.data.baseDamage.swing = "12d6";
				break;
			case 95:
				this.data.data.baseDamage.thrust = "10d6+2";
				this.data.data.baseDamage.swing = "12d6+2";
				break;
			case 96:
				this.data.data.baseDamage.thrust = "10d6+2";
				this.data.data.baseDamage.swing = "12d6+2";
				break;
			case 97:
				this.data.data.baseDamage.thrust = "10d6+2";
				this.data.data.baseDamage.swing = "12d6+2";
				break;
			case 98:
				this.data.data.baseDamage.thrust = "10d6+2";
				this.data.data.baseDamage.swing = "12d6+2";
				break;
			case 99:
				this.data.data.baseDamage.thrust = "10d6+2";
				this.data.data.baseDamage.swing = "12d6+2";
				break;
			case 100:
				this.data.data.baseDamage.thrust = "11d6";
				this.data.data.baseDamage.swing = "13d6";
				break;
			default:
				this.data.data.baseDamage.thrust = "11d6";
				this.data.data.baseDamage.swing = "13d6";
				break;
		}

		//HT Subdue
		var hts = +ht + +this.data.data.primaryAttributes.subdue.mod + +Math.floor(this.data.data.primaryAttributes.subdue.points/2);
		this.data.data.primaryAttributes.subdue.value = hts;

		//HT Kill
		var htk = +ht + +this.data.data.primaryAttributes.death.mod + +Math.floor(this.data.data.primaryAttributes.death.points/2);
		this.data.data.primaryAttributes.death.value = htk;

		//HP
		var hp = +st + +this.data.data.reserves.hp.mod + +Math.floor(this.data.data.reserves.hp.points / +( +2 * +smDiscount));
		this.data.data.reserves.hp.max = hp;

		//FP
		var fp = +ht + +this.data.data.reserves.fp.mod + +Math.floor(this.data.data.reserves.fp.points/3);
		this.data.data.reserves.fp.max = fp;

		//ER
		var er = +0 + +this.data.data.reserves.er.mod + +Math.floor(this.data.data.reserves.er.points/3);
		this.data.data.reserves.er.max = er;
	}

	recalcTraitPoints() {
        var traitPoints = +0;
		//Iterate through the list of traits. Advantages and Disadvantages
        for (let i = 0; i < this.data.items.length; i++){
            if (this.data.items[i].type === "Trait"){
                traitPoints = traitPoints += this.data.items[i].data.points
            }
        }
		this.data.data.points.traits = traitPoints;
	}

    recalcSkillPoints() {
        var skillPoints = +0;
        //Iterate through the list of skills. Advantages and Disadvantages
        for (let i = 0; i < this.data.items.length; i++){
            if (this.data.items[i].type === "Rollable"){
                skillPoints = skillPoints += this.data.items[i].data.points
            }
        }
		this.data.data.points.skills = skillPoints;
    }

	recalcEncValues(){
		var st = this.data.data.primaryAttributes.lifting.value;
		var bl = Math.round(((st * st)/5));
		var move = this.data.data.primaryAttributes.move.value;
		var dodge = this.data.data.primaryAttributes.dodge.value;
		var carriedWeight = 0;
		var carriedCost = 0;

		this.data.data.encumbrance.none.lbs = bl;
		this.data.data.encumbrance.light.lbs = bl * 2;
		this.data.data.encumbrance.medium.lbs = bl * 3;
		this.data.data.encumbrance.heavy.lbs = bl * 6;
		this.data.data.encumbrance.xheavy.lbs = bl * 10;

		this.data.data.encumbrance.none.move = move;
		this.data.data.encumbrance.light.move = Math.max((Math.floor(move * 0.8)), 1);
		this.data.data.encumbrance.medium.move = Math.max((Math.floor(move * 0.6)), 1);
		this.data.data.encumbrance.heavy.move = Math.max((Math.floor(move * 0.4)), 1);
		this.data.data.encumbrance.xheavy.move = Math.max((Math.floor(move * 0.2)), 1);

		this.data.data.encumbrance.none.dodge = dodge;
		this.data.data.encumbrance.light.dodge = Math.max(dodge - 1, 1);
		this.data.data.encumbrance.medium.dodge = Math.max(dodge - 2, 1);
		this.data.data.encumbrance.heavy.dodge = Math.max(dodge - 3, 1);
		this.data.data.encumbrance.xheavy.dodge = Math.max(dodge - 4, 1);

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
		this.data.data.bio.carriedWeight = carriedWeight;
		this.data.data.bio.carriedValue = carriedCost;
	}

	setTotalPoints(unspent) {
		this.data.data.points.total = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills + +unspent;
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
		this.data.data.points.attributes = attributePoints;
	}

	recalcPointTotals() {
		var unspent;
		var spent;

		spent = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills;

		unspent = +this.data.data.points.total - +spent;

		this.data.data.points.unspent = unspent;
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
			this.data.data.reserves.hp.state = attrState;
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
			this.data.data.reserves.fp.state = attrState;
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
