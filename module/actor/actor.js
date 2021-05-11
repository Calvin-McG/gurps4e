import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { distanceHelpers } from '../../helpers/distanceHelpers.js';
import { generalHelpers } from '../../helpers/generalHelpers.js';
import { rollHelpers } from '../../helpers/rollHelpers.js';

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

		// Store the character's armour values for convenient use later.
		this.storeArmour()

		//Update hitlocation display thing to show selected damage types
		// this.displayDrTypes();

		//Update part specific HP
		this.partHP();
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
		let attributePoints = +this.data.data.primaryAttributes.strength.points +
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
		//this.update({ ['data.points.attributes']: attributePoints });
		this.data.data.points.attributes = attributePoints;
	}

	recalcPointTotals() {
		let unspent;
		let spent;

		spent = +this.data.data.points.attributes + +this.data.data.points.traits + +this.data.data.points.skills;

		unspent = +this.data.data.points.total - +spent;

		//this.update({ ['data.points.unspent']: unspent });
		this.data.data.points.unspent = unspent;
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
		let attrValue;
		let attrMax;
		let attrState;

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

	storeArmour(){
		// Create a function for filtering out armour
		function filterArmour(item){
			if (item.type == "Equipment"){ // Check to see if it is a piece of equipment
				if (item.data.armour != null){ // Check to see if data has the armour child object - This should really only be an issue when updating from a version that did not include this data structure.
					if (generalHelpers.has(item.data.armour, "name")){ // Check to see if the name child exists - Again, hopefully only relevant on version update.
						if (item.data.armour.bodyType.name.length > 0){ // Check to see if a body type has been set
							return true;
						}
					}
				}
			}
			return false;
		}

		// Create function for sorting armour by layer
		function sortArmourByLayer(a,b){
			if (a.data.armour.layer < b.data.armour.layer){
				return -1
			}
			if (a.data.armour.layer > b.data.armour.layer){
				return 1
			}
			return 0
		}

		// TODO - Create a set of arrays.
		// One array listing armour flexibility in the order it is layered.
		// One array listing the armour's hardness in the order it is layered. TODO - Consolidate all the damage type specific hardening into a single cell
		// One array for each damage type listing the armour's hardness in the order it is layered. (Like for switchDrTypes) - TODO - Make switchDrTypes just load from the results of this method.

		let armour = [{
			flexible: {},
			hardness: {},
			burn: {},
			cor: {},
			cr: {},
			cut: {},
			fat: {},
			imp: {},
			pi: {},
			tox: {},
		}];

		armour[0] = this.getArmour(this.data.data.bodyType.body); // Get the armour inherent in the body
		this.data.data.bodyType.drTypesOne = getProperty(armour[0], this.data.data.bodyType.damageTypeOne.toLowerCase());
		this.data.data.bodyType.drTypesTwo = getProperty(armour[0], this.data.data.bodyType.damageTypeTwo.toLowerCase());

		let items = this.data.items.filter(filterArmour); // Get the character's items and filter out anything that isn't armour
		items = items.sort(sortArmourByLayer); // Take the above list and sort by layer. Index 0 is lowest, index infinity is highest.

		for (let l = 0; l < items.length; l++){ // Loop through the characters items and apply any relevant DR.
			armour[l+1] = this.getArmour(items[l].data.armour.bodyType.body);

			let damageTypeOneObject = getProperty(armour[l+1], this.data.data.bodyType.damageTypeOne.toLowerCase());
			let damageTypeTwoObject = getProperty(armour[l+1], this.data.data.bodyType.damageTypeTwo.toLowerCase());
			let bodyParts = Object.keys(damageTypeOneObject);

			for (let q = 0; q < bodyParts.length; q++){
				this.data.data.bodyType.drTypesOne[bodyParts[q]] += damageTypeOneObject[bodyParts[q]]
				this.data.data.bodyType.drTypesTwo[bodyParts[q]] += damageTypeTwoObject[bodyParts[q]]
			}
		}
	}

	getArmour(object){
		let armour = { // Init the personalArmour object
			flexible: {},
			hardness: {},
			burn: {},
			cor: {},
			cr: {},
			cut: {},
			fat: {},
			imp: {},
			pi: {},
			tox: {},
		};
		if (object){ // Make sure they have a body
			let bodyParts = Object.keys(object); // Collect all the bodypart names

			for (let i = 0; i < bodyParts.length; i++){ // Loop through all the body parts
				if (bodyParts[i] == "skull" || bodyParts[i] == "brain"){ // Part has no sub-parts
					// For each dr type, add it to the object
					armour.burn[bodyParts[i]] = getProperty(object, bodyParts[i] + ".drBurn") ? +getProperty(object, bodyParts[i] + ".drBurn") : 0;
					armour.cor[bodyParts[i]]  = getProperty(object, bodyParts[i] + ".drCor")  ? +getProperty(object, bodyParts[i] + ".drCor") : 0;
					armour.cr[bodyParts[i]]   = getProperty(object, bodyParts[i] + ".drCr")   ? +getProperty(object, bodyParts[i] + ".drCr")  : 0;
					armour.cut[bodyParts[i]]  = getProperty(object, bodyParts[i] + ".drCut")  ? +getProperty(object, bodyParts[i] + ".drCut") : 0;
					armour.fat[bodyParts[i]]  = getProperty(object, bodyParts[i] + ".drFat")  ? +getProperty(object, bodyParts[i] + ".drFat") : 0;
					armour.imp[bodyParts[i]]  = getProperty(object, bodyParts[i] + ".drImp")  ? +getProperty(object, bodyParts[i] + ".drImp") : 0;
					armour.pi[bodyParts[i]]   = getProperty(object, bodyParts[i] + ".drPi")   ? +getProperty(object, bodyParts[i] + ".drPi")  : 0;
					armour.tox[bodyParts[i]]  = getProperty(object, bodyParts[i] + ".drTox")  ? +getProperty(object, bodyParts[i] + ".drTox") : 0;

					if (getProperty(object, bodyParts[i] + ".flexible")){ // Check to see if flexible exists and is true
						armour.flexible[bodyParts[i]] = true;
					}
					else {
						armour.flexible[bodyParts[i]] = false;
					}

					if (getProperty(object, bodyParts[i] + ".drHardening")){ // Check to see if the hardening value exists
						armour.hardness[bodyParts[i]] = getProperty(object, bodyParts[i] + ".drHardening"); // Set hardening
					}
				}
				else {
					let subParts = Object.keys(getProperty(object, bodyParts[i] + ".subLocation")); // Collect all the subpart names
					for (let n = 0; n < subParts.length; n++){ // Loop through all the subparts
						// For each dr type, add it to the object
						armour.burn[bodyParts[i] + subParts[n]] = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0;
						armour.cor[bodyParts[i] + subParts[n]]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0;
						armour.cr[bodyParts[i] + subParts[n]]   = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0;
						armour.cut[bodyParts[i] + subParts[n]]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0;
						armour.fat[bodyParts[i] + subParts[n]]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0;
						armour.imp[bodyParts[i] + subParts[n]]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0;
						armour.pi[bodyParts[i] + subParts[n]]   = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0;
						armour.tox[bodyParts[i] + subParts[n]]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0;

						if (getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".flexible")){ // Check to see if flexible exists and is true
							armour.flexible[bodyParts[i] + subParts[n]] = true;
						}
						else {
							armour.flexible[bodyParts[i] + subParts[n]] = false;
						}

						if (getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening")){ // Check to see if the hardening value exists
							armour.hardness[bodyParts[i] + subParts[n]] = +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening"); // Set hardening
						}
					}
				}
			}
		}
		return armour
	}

	// displayDrTypes(){
	// 	this.data.data.bodyType.drTypesOne = this.switchDrTypes(this.data.data.bodyType.damageTypeOne);
	// 	this.data.data.bodyType.drTypesTwo = this.switchDrTypes(this.data.data.bodyType.damageTypeTwo);
	// }
	//
	// switchDrTypes(damageType){
	// 	let drTypes = {};
	// 	if (this.data.data.bodyType.body){
	// 		let bodyParts = Object.keys(this.data.data.bodyType.body);
	//
	// 		for (let i = 0; i < bodyParts.length; i++){
	// 			if (bodyParts[i] == "skull" || bodyParts[i] == "brain"){//Part has no sub-parts
	// 				if (getProperty(this.data.data.bodyType.body, bodyParts[i] + ".dr" + damageType)) {
	// 					drTypes[bodyParts[i]] = getProperty(this.data.data.bodyType.body, bodyParts[i] + ".dr" + damageType) + ((getProperty(this.data.data.bodyType.body, bodyParts[i] + ".flexible")) ? '*' : '');
	// 				}
	// 				else {
	// 					drTypes[bodyParts[i]] = ""
	// 				}
	// 			}
	// 			else {
	// 				let subParts = Object.keys(getProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation"));
	// 				for (let n = 0; n < subParts.length; n++){
	// 					if (getProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n] + ".dr" + damageType)){
	// 						drTypes[bodyParts[i] + subParts[n]] = getProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n] + ".dr" + damageType) + ((getProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n] + ".flexible")) ? '*' : '');
	// 					}
	// 					else {
	// 						drTypes[bodyParts[i] + subParts[n]] = "";
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return drTypes
	// }

	partHP(){
		if (this.data.data.bodyType.body){
			let bodyParts = Object.keys(this.data.data.bodyType.body);

			for (let i = 0; i < bodyParts.length; i++){
				let currentPart = getProperty(this.data.data.bodyType.body, bodyParts[i]);

				if (currentPart.hp){//Part has hp info
					let hp = currentPart.hp.value;
					let state = "Fine";

					if(hp <= (currentPart.hp.max * -1)){ // If part HP is at or below a full negative multiple
						state = "Destroyed";
					}
					else if(hp <= 0){ // If part HP is at or below a 0
						state = "Crippled";
					}
					else if (hp < currentPart.hp.max){ // If part HP is below max
						state = "Injured";
					}
					else { // Part is not damaged
						state = "Fine";
					}

					setProperty(this.data.data.bodyType.body, bodyParts[i] + ".hp.state",state);
				}

				if (getProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation")){//Part has sub parts
					let subParts = Object.keys(getProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation"));

					for (let n = 0; n < subParts.length; n++){
						let currentSubPart = getProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n]);
						if (currentSubPart.hp){//Part has hp info
							let hp = currentSubPart.hp.value;
							let state = "Fine";

							if(hp <= (currentSubPart.hp.max * -1)){ // If part HP is at or below a full negative multiple
								state = "Destroyed";
							}
							else if(hp <= 0){ // If part HP is at or below a 0
								state = "Crippled";
							}
							else if (hp < currentSubPart.hp.max){ // If part HP is below max
								state = "Injured";
							}
							else { // Part is not damaged
								state = "Fine";
							}

							setProperty(this.data.data.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n] + ".hp.state",state);
						}
					}
				}
			}
		}
	}

	//==========================
	//This section is for macro methods
	//==========================


	test(){
		console.log("Test Worked")
	}

	facingTest(selfToken, targetToken){
		console.log(selfToken)
		console.log(targetToken)

		console.log(selfToken._validPosition)
		console.log(selfToken.data.rotation)
		console.log(selfToken.data.sightAngle)

		console.log(targetToken._validPosition)
		console.log(targetToken.data.rotation)
		console.log(targetToken.data.sightAngle)

		console.log(Math.atan2(targetToken._validPosition.y - selfToken._validPosition.y, targetToken._validPosition.x - selfToken._validPosition.x) * 180 / Math.PI);
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
		console.log(canvas.grid)

		let distance = distanceHelpers.convertToYards(canvas.grid.measureDistance(selfToken, targetToken), canvas.scene.data.gridUnits);
		let distancePenalty = distanceHelpers.distancePenalty(distance);

		console.log(distance);
		console.log(distancePenalty);

		let attacks = this.listAttacks(selfToken.actor);

		let htmlContent = "<div>";
		htmlContent += "<table>";

		htmlContent += "<tr><td colspan='8' class='trait-category-header' style='text-align: center;'>Melee Attacks</td></tr>";
		htmlContent += "<tr><td></td><td>Weapon</td><td>Attack</td><td>Level</td><td>Damage</td><td>Reach</td><td>Parry</td><td>ST</td></tr>";

		for (let x = 0; x < attacks.melee.length; x++){
			console.log(attacks.melee[x]);
			htmlContent += "<tr>";
			htmlContent += "<td><input type='radio' id='melee" + x + "' name='melee' value='" + x + "'></td>";
			htmlContent += "<td>" + attacks.melee[x].weapon + "</td>";
			htmlContent += "<td>" + attacks.melee[x].name + "</td>";
			htmlContent += "<td>" + attacks.melee[x].level + "</td>";

			if(attacks.melee[x].armorDivisor == 1){//Only show armour divisor if it's something other than 1
				htmlContent += "<td>" + attacks.melee[x].damage + " " + attacks.melee[x].damageType + "</td>";
			}
			else {
				htmlContent += "<td>" + attacks.melee[x].damage + " " + attacks.melee[x].damageType + " " + "(" + attacks.melee[x].armorDivisor + ")</td>";
			}

			htmlContent += "<td>" + attacks.melee[x].reach + "</td>";
			htmlContent += "<td>" + attacks.melee[x].parry + attacks.melee[x].parryType + "</td>";
			htmlContent += "<td>" + attacks.melee[x].st + "</td>";
			htmlContent += "</tr>";
		}

		htmlContent += "</table>";

		htmlContent += "<table>";

		htmlContent += "<tr><td colspan='12' class='trait-category-header' style='text-align: center;'>Ranged Attacks</td></tr>";
		htmlContent += "<tr><td></td><td>Weapon</td><td>Attack</td><td>Level</td><td>Damage</td><td>Acc</td><td>Range</td><td>RoF</td><td>Shots</td><td>ST</td><td>Bulk</td><td>Rcl</td></tr>";

		for (let q = 0; q < attacks.ranged.length; q++){
			console.log(attacks.ranged[q]);
			htmlContent += "<tr>";
			htmlContent += "<td><input type='radio' id='range" + q + "' name='range' value='" + q + "'></td>";
			htmlContent += "<td>" + attacks.ranged[q].weapon + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].name + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].level + "</td>";
			if(attacks.ranged[q].armorDivisor == 1){//Only show armour divisor if it's something other than 1
				htmlContent += "<td>" + attacks.ranged[q].damage + " " + attacks.ranged[q].damageType + "</td>";
			}
			else {
				htmlContent += "<td>" + attacks.ranged[q].damage + " " + attacks.ranged[q].damageType + " " + "(" + attacks.ranged[q].armorDivisor + ")</td>";
			}
			htmlContent += "<td>" + attacks.ranged[q].acc + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].range + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].rof + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].shots + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].st + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].bulk + "</td>";
			htmlContent += "<td>" + attacks.ranged[q].rcl + "</td>";
			htmlContent += "</tr>";
		}

		htmlContent += "</table>";
		htmlContent += "</div>";


		let singleTargetModal = new Dialog({
			title: "SHOW ME YOUR MOVES",
			content: htmlContent,
			buttons: {
				melee: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bow-arrow" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M110.11 227.59c-6.25-6.25-16.38-6.25-22.63 0l-18.79 18.8a16.005 16.005 0 0 0-2 20.19l53.39 80.09-53.43 53.43-29.26-14.63a13.902 13.902 0 0 0-16.04 2.6L4.07 405.36c-5.42 5.43-5.42 14.22 0 19.64L87 507.93c5.42 5.42 14.22 5.42 19.64 0l17.29-17.29a13.873 13.873 0 0 0 2.6-16.03l-14.63-29.26 53.43-53.43 80.09 53.39c6.35 4.23 14.8 3.39 20.19-2l18.8-18.79c6.25-6.25 6.25-16.38 0-22.63l-174.3-174.3zM493.73.16L400 16 171.89 244.11l96 96L496 112l15.83-93.73c1.51-10.56-7.54-19.61-18.1-18.11z" class=""></path></svg>',
					label: "Select Melee",
					callback: (html) => {
						let elements = document.getElementsByName('melee');
						let attack;

						for (let e = 0; e < elements.length; e++){
							if(elements[e].checked){
								attack = e;
							}
						}
						if (typeof attack !== "undefined") {
							this.meleeAttackOnTarget(selfToken, attacks.melee[attack], targetToken)
						}
						// console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId))
						// game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value = 9;//Set the value to the new one so we can work with it within the macro
						// game.actors.get(targetArray[html.find('#target').val()].data.actorId).update({ ['data.reserves.hp.value']: 9 });//Use .update so it can be referenced by the rest of Foundry
						// console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value)
						// console.log(selfCoords)
						// game.actors.get(targetArray[html.find('#target').val()].data.actorId).test();
						// selfActor.test()
					}
				},
				ranged: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bow-arrow" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M145.78 287.03l45.26-45.25-90.58-90.58C128.24 136.08 159.49 128 192 128c32.03 0 62.86 7.79 90.33 22.47l46.61-46.61C288.35 78.03 241.3 64 192 64c-49.78 0-97.29 14.27-138.16 40.59l-3.9-3.9c-6.25-6.25-16.38-6.25-22.63 0L4.69 123.31c-6.25 6.25-6.25 16.38 0 22.63l141.09 141.09zm262.36-104.64L361.53 229c14.68 27.47 22.47 58.3 22.47 90.33 0 32.51-8.08 63.77-23.2 91.55l-90.58-90.58-45.26 45.26 141.76 141.76c6.25 6.25 16.38 6.25 22.63 0l22.63-22.63c6.25-6.25 6.25-16.38 0-22.63l-4.57-4.57C433.74 416.63 448 369.11 448 319.33c0-49.29-14.03-96.35-39.86-136.94zM493.22.31L364.63 26.03c-12.29 2.46-16.88 17.62-8.02 26.49l34.47 34.47-250.64 250.63-49.7-16.57a20.578 20.578 0 0 0-21.04 4.96L6.03 389.69c-10.8 10.8-6.46 29.2 8.04 34.04l55.66 18.55 18.55 55.65c4.83 14.5 23.23 18.84 34.04 8.04l63.67-63.67a20.56 20.56 0 0 0 4.97-21.04l-16.57-49.7 250.64-250.64 34.47 34.47c8.86 8.86 24.03 4.27 26.49-8.02l25.72-128.59C513.88 7.8 504.2-1.88 493.22.31z" class=""></path></svg>',
					label: "Select Ranged",
					callback: (html) => {
						let elements = document.getElementsByName('range');
						let attack;

						for (let e = 0; e < elements.length; e++){
							if(elements[e].checked){
								attack = e;
							}
						}
						if (typeof attack !== "undefined") {
							this.rangedAttackOnTarget(selfToken, attacks.ranged[attack], targetToken)
						}
						// console.log(html.find('#target').val())
						// console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId))
						// game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value = 9;//Set the value to the new one so we can work with it within the macro
						// game.actors.get(targetArray[html.find('#target').val()].data.actorId).update({ ['data.reserves.hp.value']: 9 });//Use .update so it can be referenced by the rest of Foundry
						// console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value)
						// console.log(selfCoords)
						// game.actors.get(targetArray[html.find('#target').val()].data.actorId).test();
						// selfActor.test()
					}
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: () => {

					}
				}
			},
			default: "cancel",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		},{
			resizable: true,
			width: "500"
		})

		console.log(singleTargetModal)

		return singleTargetModal;
	}

	listAttacks(actor){
		let q = 0;
		let p = 0;
		let meleeAttacks = [];
		let rangedAttacks = [];
		let melee;
		let ranged;

		for (let y = 0; y < actor.data.items.length; y++){
			if (actor.data.items[y].type == "Trait" || actor.data.items[y].type == "Equipment"){
				while (actor.data.items[y].data.melee[q]) {
					melee = actor.data.items[y].data.melee[q];
					melee.weapon = actor.data.items[y].name

					meleeAttacks.push(melee);
					q++;
				}

				while (actor.data.items[y].data.ranged[p]) {
					ranged = actor.data.items[y].data.ranged[p];
					ranged.weapon = actor.data.items[y].name

					rangedAttacks.push(ranged);
					p++;
				}
			}
		}

		return { "melee": meleeAttacks, "ranged": rangedAttacks}
	}

	meleeAttackOnTarget(attacker, attack, target) {
		console.log(attacker.nameplate._text);
		console.log(attack);
		console.log(target.nameplate._text);
		let label = attacker.nameplate._text + " attacks " + target.nameplate._text + " with a " + attack.weapon + " " + attack.name + "."

		rollHelpers.skillRoll(attack.level, 0, label)
	}

	rangedAttackOnTarget(attacker, attack, target) {
		console.log(attack);
	}
}
