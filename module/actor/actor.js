import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { distanceHelpers } from '../../helpers/distanceHelpers.js';

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

		//Total up spent and remaining points
		this.recalcAtrPoints();
		this.recalcTraitPoints();
		this.recalcSkillPoints();
		this.recalcPointTotals();

		//Convert spent points into their effective values
		this.recalcAtrValues();

		//Recalculate encumberance values, along with effective dodge and move. Do this last so move and dodge is correct.
		this.recalcEncValues();

		//Set up categories for each type
		this.setupCategories();
	}

	recalcAtrValues(){
		let smDiscount = attributeHelpers.calcSMDiscount(this.data.data.bio.sm);

		//ST
		let st = attributeHelpers.calcStOrHt(this.data.data.primaryAttributes.strength, smDiscount);
		this.data.data.primaryAttributes.strength.value = st;

		//DX
		let dx = attributeHelpers.calcDxOrIq(this.data.data.primaryAttributes.dexterity);
		this.data.data.primaryAttributes.dexterity.value = dx;

		//IQ
		let iq = attributeHelpers.calcDxOrIq(this.data.data.primaryAttributes.intelligence);
		this.data.data.primaryAttributes.intelligence.value = iq;

		//HT
		let ht = attributeHelpers.calcStOrHt(this.data.data.primaryAttributes.health, 1);
		this.data.data.primaryAttributes.health.value = ht;

		//Per
		let per = attributeHelpers.calcPerOrWill(iq, this.data.data.primaryAttributes.perception);
		this.data.data.primaryAttributes.perception.value = per;

		//Will
		let will = attributeHelpers.calcPerOrWill(iq, this.data.data.primaryAttributes.will);
		this.data.data.primaryAttributes.will.value = will;

		//Fright
		let fr = attributeHelpers.calcFright(will, this.data.data.primaryAttributes.fright);
		this.data.data.primaryAttributes.fright.value = fr;

		//Speed
		let speed = attributeHelpers.calcSpeed(dx, ht, this.data.data.primaryAttributes.speed);
		this.data.data.primaryAttributes.speed.value = speed;

		//Move
		let move = attributeHelpers.calcMove(speed, this.data.data.primaryAttributes.move);
		this.data.data.primaryAttributes.move.value = move;

		//Dodge
		let dodge = attributeHelpers.calcDodge(speed, this.data.data.primaryAttributes.dodge);
		this.data.data.primaryAttributes.dodge.value = dodge;

		//Lifting ST
		let lst = attributeHelpers.calcLiftingSt(st, this.data.data.primaryAttributes.lifting, smDiscount)
		this.data.data.primaryAttributes.lifting.value = lst;

		//Striking ST
		let sst = attributeHelpers.calcStrikingSt(st, this.data.data.primaryAttributes.striking, smDiscount);
		this.data.data.primaryAttributes.striking.value = sst;

		//Swing and Thrust
		this.data.data.baseDamage.thrust = attributeHelpers.strikingStrengthToThrust(sst);
		this.data.data.baseDamage.swing = attributeHelpers.strikingStrengthToSwing(sst);

		//HT Subdue
		let hts = attributeHelpers.calcHealthSubdue(ht, this.data.data.primaryAttributes.subdue);
		this.data.data.primaryAttributes.subdue.value = hts;

		//HT Kill
		var htk = attributeHelpers.calcHealthKill(ht, this.data.data.primaryAttributes.death);
		this.data.data.primaryAttributes.death.value = htk;

		//HP
		var hp = attributeHelpers.calcHP(st, this.data.data.reserves.hp, smDiscount);
		this.data.data.reserves.hp.max = hp;

		//FP
		var fp = attributeHelpers.calcFP(ht, this.data.data.reserves.fp);
		this.data.data.reserves.fp.max = fp;

		//ER
		var er = attributeHelpers.calcER(this.data.data.reserves.er);
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
		let total = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills + +unspent;
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

	setupCategories() {
		this.data.traitCategories = [];
		this.data.equipmentCategories = [];
		this.data.rollableCategories = [];

		this.data.traitCategories.push("");
		this.data.equipmentCategories.push("");
		this.data.rollableCategories.push("");

		for (let w = 0; w < this.data.items.length; w++) {
			if(this.data.items[w].data.subCategory){
				if(this.data.items[w].data.subCategory.trim() != ""){//If subcategory is not blank
					if(this.data.items[w].type == "Trait"){
						if(!this.data.traitCategories.includes(this.data.items[w].data.subCategory.trim())){//Make sure the trait array doesn't already contain the category.
							this.data.traitCategories.push(this.data.items[w].data.subCategory.trim())
						}
					}
					else if (this.data.items[w].type == "Rollable"){
						if (!this.data.rollableCategories.includes(this.data.items[w].data.subCategory.trim())) {//Make sure the rollable array doesn't already contain the category.
							this.data.rollableCategories.push(this.data.items[w].data.subCategory.trim())
						}
					}
					else if (this.data.items[w].type == "Equipment"){
						if (!this.data.equipmentCategories.includes(this.data.items[w].data.subCategory.trim())) {//Make sure the item array doesn't already contain the category.
							this.data.equipmentCategories.push(this.data.items[w].data.subCategory.trim())
						}
					}
				}
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

	//==========================
	//This section is for macro methods
	//==========================


	test(){
		console.log("Test Worked")
	}

	//Return a dialog that tells the user to pick a target
	noTargetsDialog(){
		let noTargetsDialogContent = "<div>You need to select a target.</div>";

		let noTargetsDialog = new Dialog({
			title: "Select a target",
			content: noTargetsDialogContent,
			buttons: {
				ok: {
					icon: '<i class="fas fa-check"></i>',
					label: "Ok"
				}
			},
			default: "ok"
		})

		return noTargetsDialog;
	}

	singleTargetDialog(selfToken, targetToken){
		//This is the bit where we figure out where every one is, along with distances and range penalties.
		console.log(canvas.scene.data.gridUnits)

		let distance = distanceHelpers.convertToYards(canvas.grid.measureDistance(selfToken, targetToken), canvas.scene.data.gridUnits);
		let distancePenalty = distanceHelpers.distancePenalty(distance);

		console.log(distance);



		let singleTargetModal = new Dialog({
			title: "SHOW ME YOUR MOVES",
			content: htmlContent,
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Select Your Attack",
					callback: (html) => {
						console.log(html.find('#target').val())
						console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId))
						game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value = 9;//Set the value to the new one so we can work with it within the macro
						game.actors.get(targetArray[html.find('#target').val()].data.actorId).update({ ['data.reserves.hp.value']: 9 });//Use .update so it can be referenced by the rest of Foundry
						console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value)
						console.log(selfCoords)
						game.actors.get(targetArray[html.find('#target').val()].data.actorId).test();
						selfActor.test()
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: () => {

					}
				}
			},
			default: "noMod",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		})

		return singleTargetModal;
	}
}
