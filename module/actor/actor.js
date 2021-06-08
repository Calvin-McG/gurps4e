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

		this.checkUndefined();

		//Total up spent and remaining points
		this.recalcAtrPoints();
		this.recalcTraitPoints();
		this.recalcSkillPoints();
		this.recalcPointTotals();

		//Convert spent points into their effective values
		this.recalcAtrValues();

		// Sort out the player's senses.
		this.recalcSenses();

		//Set up categories for each type
		this.setupCategories();

		// Store the character's armour values for convenient use later.
		this.storeArmour()

		// Set status, etc, for reserves
		this.bodyReserves()

		//Update part specific HP
		this.partHP();

		//Recalculate encumberance values, along with effective dodge and move. Do this last so move and dodge is correct.
		this.recalcEncValues();
		console.log(this)
	}

	checkUndefined(){
		if (typeof this.data.data.senses == 'undefined'){ // If senses do not yet exist, create a basic object for them
			let senses = {
				vis: {
					id: "vis",
					abbr: "Vision",
					value: 10,
					mod: 0
				},
				hear: {
					id: "hear",
					abbr: "Hearing",
					value: 10,
					mod: 0
				},
				smell: {
					id: "smell",
					abbr: "Smell & Taste",
					value: 10,
					mod: 0
				},
				touch: {
					id: "touch",
					abbr: "Touch",
					value: 10,
					mod: 0
				},
				extra1: {
					id: "extra1",
					abbr: "",
					value: 10,
					mod: 0
				},
				extra2: {
					id: "extra2",
					abbr: "",
					value: 10,
					mod: 0
				}
			}

			this.data.data.senses = senses;
		}

		if (this.data.data.senses.vis) {
			this.data.data.senses.vis = {
				id: "vis",
				abbr: "Vision",
				value: this.data.data.senses.vis.value,
				mod: this.data.data.senses.vis.mod
			}
		}
		if (this.data.data.senses.hear) {
			this.data.data.senses.hear = {
				id: "hear",
				abbr: "Hearing",
				value: this.data.data.senses.hear.value,
				mod: this.data.data.senses.hear.mod
			}
		}
		if (this.data.data.senses.smell) {
			this.data.data.senses.smell = {
				id: "smell",
				abbr: "Smell & Taste",
				value: this.data.data.senses.smell.value,
				mod: this.data.data.senses.smell.mod
			}
		}
		if (this.data.data.senses.touch) {
			this.data.data.senses.touch = {
				id: "touch",
				abbr: "Touch",
				value: this.data.data.senses.touch.value,
				mod: this.data.data.senses.touch.mod
			}
		}
		if (this.data.data.senses.extra1) {
			this.data.data.senses.extra1 = {
				id: "extra1",
				abbr: this.data.data.senses.extra1.abbr ? this.data.data.senses.extra1.abbr : "",
				value: this.data.data.senses.extra1.value ? this.data.data.senses.extra1.value : 0,
				mod: this.data.data.senses.extra1.mod ? this.data.data.senses.extra1.mod : 0
			}
		}
		if (this.data.data.senses.extra2) {
			this.data.data.senses.extra2 = {
				id: "extra2",
				abbr: this.data.data.senses.extra2.abbr ? this.data.data.senses.extra2.abbr : "",
				value: this.data.data.senses.extra2.value ? this.data.data.senses.extra2.value : 0,
				mod: this.data.data.senses.extra2.mod ? this.data.data.senses.extra2.mod : 0
			}
		}

		// Check for enhanced defences
		if (typeof this.data.data.enhanced == 'undefined'){ // If enhanced defences do not yet exist, create a basic object for them
			let enhanced = {
				parry: 0,
				block: 0,
				dodge: 0
			}

			this.data.data.enhanced = enhanced;
		}
		else { // Check each individual value and set it to 0 if it's blank or undefined.
			if (typeof this.data.data.enhanced.parry == 'undefined' || this.data.data.enhanced.parry === "") {
				this.data.data.enhanced.parry = 0;
			}
			if (typeof this.data.data.enhanced.block == 'undefined' || this.data.data.enhanced.block === "") {
				this.data.data.enhanced.block = 0;
			}
			if (typeof this.data.data.enhanced.dodge == 'undefined' || this.data.data.enhanced.dodge === "") {
				this.data.data.enhanced.dodge = 0;
			}
		}

		// Check for vision cones
		if (typeof this.data.data.vision == 'undefined') {
			let vision = {
				front: 180,
				side: 240
			}
			this.data.data.vision = vision;
		}
		else {
			if (typeof this.data.data.vision.front == 'undefined' || this.data.data.vision.front === "") {
				this.data.data.enhanced.parry = 180;
			}
			if (typeof this.data.data.vision.side == 'undefined' || this.data.data.vision.side === "") {
				this.data.data.enhanced.block = 240;
			}
		}

		// Check for flags
		if (typeof this.data.data.flag == 'undefined') {
			let flag = {
				combatReflexes: false,
				showSenses: false
			}
			this.data.data.flag = flag;
		}
		else {
			if (typeof this.data.data.flag.combatReflexes == 'undefined' || this.data.data.flag.combatReflexes === "") {
				this.data.data.flag.combatReflexes = false;
			}
			if (typeof this.data.data.flag.showSenses == 'undefined' || this.data.data.flag.showSenses === "") {
				this.data.data.flag.showSenses = false;
			}
		}
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

		//Knockback
		let kb = {
			id: "kb",
			abbr: "Knockback",
			value: st + ((typeof this.data.data.primaryAttributes.knockback === 'undefined') ? 0 : this.data.data.primaryAttributes.knockback.mod) - 2,
			mod: (typeof this.data.data.primaryAttributes.knockback === 'undefined') ? 0 : this.data.data.primaryAttributes.knockback.mod
		}
		this.data.data.primaryAttributes.knockback = kb;

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

	recalcSenses() {
		let per = this.data.data.primaryAttributes.perception.value;

		this.data.data.senses.vis.value    = per + this.data.data.senses.vis.mod;
		this.data.data.senses.hear.value   = per + this.data.data.senses.hear.mod;
		this.data.data.senses.smell.value  = per + this.data.data.senses.smell.mod;
		this.data.data.senses.touch.value  = per + this.data.data.senses.touch.mod;
		this.data.data.senses.extra1.value = per + this.data.data.senses.extra1.mod;
		this.data.data.senses.extra2.value = per + this.data.data.senses.extra2.mod;
	}

	recalcTraitPoints() {
        let traitPoints = +0;
        let advantagePoints = +0;
		let disadvantagePoints = +0;
		let quirkPoints = +0;
		let perkPoints = +0;

		// Iterate through the list of traits. Advantages and Disadvantages
        for (let i = 0; i < this.data.items.length; i++){
            if (this.data.items[i].type === "Trait"){
                traitPoints = traitPoints += this.data.items[i].data.points;
				advantagePoints = this.data.items[i].data.category.toLowerCase() === "advantage" ? advantagePoints += this.data.items[i].data.points : advantagePoints;
                disadvantagePoints = this.data.items[i].data.category.toLowerCase() === "disadvantage" ? disadvantagePoints += this.data.items[i].data.points : disadvantagePoints;
				quirkPoints = this.data.items[i].data.category.toLowerCase() === "quirk" ? quirkPoints += this.data.items[i].data.points : quirkPoints;
				perkPoints = this.data.items[i].data.category.toLowerCase() === "perk" ? perkPoints += this.data.items[i].data.points : perkPoints;
            }
        }
		this.data.data.points.traits = traitPoints;
		this.data.data.points.advantages = advantagePoints;
		this.data.data.points.disadvantages = disadvantagePoints;
		this.data.data.points.quirks = quirkPoints;
		this.data.data.points.perks = perkPoints;
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

		let dodgeMultiplier = 1;

		// Basic 328 - With less than 1/3rd FP remaining your ST is halved, but not for the purposes of HP or damage
		if (this.data.data.reserves.fp.state.toLowerCase() != "fresh") {
			st = st / 2
			dodgeMultiplier = 0.5;
		}

		var bl = Math.round(((st * st)/5));
		var move = this.data.data.primaryAttributes.move.value;
		var dodge = this.data.data.primaryAttributes.dodge.value;
		let dodgeMod = 0;
		var carriedWeight = 0;
		var carriedCost = 0;
		let finalDodge = 0;

		if (this.data.data.enhanced.dodge){
			dodgeMod = this.data.data.enhanced.dodge;
		}

		if (this.data.data.flag.combatReflexes){
			dodgeMod = dodgeMod + 1;
		}

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

		this.data.data.encumbrance.none.dodge = dodge + dodgeMod;
		this.data.data.encumbrance.light.dodge = Math.max(dodge + dodgeMod - 1, 1);
		this.data.data.encumbrance.medium.dodge = Math.max(dodge + dodgeMod - 2, 1);
		this.data.data.encumbrance.heavy.dodge = Math.max(dodge + dodgeMod - 3, 1);
		this.data.data.encumbrance.xheavy.dodge = Math.max(dodge + dodgeMod - 4, 1);

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

		carriedWeight = Math.round(carriedWeight);
		carriedCost = Math.round(carriedCost);

		//Assign total weight and cost
		this.data.data.bio.carriedWeight = carriedWeight;
		this.data.data.bio.carriedValue = carriedCost

		if (carriedWeight <= this.data.data.encumbrance.none.lbs) {
			finalDodge = this.data.data.encumbrance.none.dodge;
		}
		else if (carriedWeight <= this.data.data.encumbrance.light.lbs){
			finalDodge = this.data.data.encumbrance.light.dodge;
		}
		else if (carriedWeight <= this.data.data.encumbrance.medium.lbs){
			finalDodge = this.data.data.encumbrance.medium.dodge;
		}
		else if (carriedWeight <= this.data.data.encumbrance.heavy.lbs){
			finalDodge = this.data.data.encumbrance.heavy.dodge;
		}
		else if (carriedWeight <= this.data.data.encumbrance.xheavy.lbs){
			finalDodge = this.data.data.encumbrance.xheavy.dodge;
		}
		else {
			finalDodge = 0;
		}

		if (this.data.data.reserves.hp.state != "Healthy"){
			dodgeMultiplier = dodgeMultiplier / 2;
		}

		finalDodge = Math.ceil(finalDodge * dodgeMultiplier);

		this.data.data.primaryAttributes.dodge.value = finalDodge;
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

	storeArmour(){
		if (this.data) {
			if (this.data.data) {
				if (this.data.data.bodyType) {
					if (this.data.data.bodyType.name.length > 0){
						// Create a function for filtering out armour
						function filterArmour(item){
							if ((item.type == "Equipment" && item.data.equipStatus == "equipped") || item.type == "Trait"){ // Check to see if it is a piece of equipment
								if (item.data.armour){ // Check to see if data has the armour child object - This should really only be an issue when updating from a version that did not include this data structure.
									if (item.data.armour.bodyType){ // Check to see if the item has armour
										if (item.data.armour.bodyType.name){
											if (item.data.armour.bodyType.name.length > 0){ // Check to see if a body type has been set
												return true;
											}
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

						armour[0] = this.getArmour(this.data.data.bodyType.body, this.data.data.bodyType.body, 0); // Get the armour inherent in the body
						this.data.data.bodyType.drTypesOne = getProperty(armour[0], this.data.data.bodyType.damageTypeOne.toLowerCase());
						this.data.data.bodyType.drTypesTwo = getProperty(armour[0], this.data.data.bodyType.damageTypeTwo.toLowerCase());

						let items = this.data.items.filter(filterArmour); // Get the character's items and filter out anything that isn't armour
						items = items.sort(sortArmourByLayer); // Take the above list and sort by layer. Index 0 is lowest, index infinity is highest.

						for (let l = 0; l < items.length; l++){ // Loop through the characters items and apply any relevant DR.
							armour[l+1] = this.getArmour(items[l].data.armour.bodyType.body, this.data.data.bodyType.body, l+1);
							let damageTypeOneObject;
							let damageTypeTwoObject;

							if (this.data.data.bodyType.damageTypeOne.length > 0){ // If they've selected a type for display
								damageTypeOneObject = getProperty(armour[l+1], this.data.data.bodyType.damageTypeOne.toLowerCase()); // Set the DR
							}
							if (this.data.data.bodyType.damageTypeTwo.length > 0){ // If they've selected a second type for display
								damageTypeTwoObject = getProperty(armour[l+1], this.data.data.bodyType.damageTypeTwo.toLowerCase()); // Set the DR
							}

							if (this.data.data.bodyType.damageTypeOne.length > 0) {
								let bodyParts = Object.keys(damageTypeOneObject);

								for (let q = 0; q < bodyParts.length; q++) {
									if (this.data.data.bodyType.damageTypeOne.length > 0) { // If they've selected a type for display
										this.data.data.bodyType.drTypesOne[bodyParts[q]] += damageTypeOneObject[bodyParts[q]]
									}
									if (this.data.data.bodyType.damageTypeTwo.length > 0) { // If they've selected a second type for display
										this.data.data.bodyType.drTypesTwo[bodyParts[q]] += damageTypeTwoObject[bodyParts[q]]
									}
								}
							}
						}
					}
				}
			}
		}
	}

	getArmour(object, body, index){
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

					// For each DR type, add it to the underlying bodypart
					let dr = {
						burn: 	getProperty(object, bodyParts[i] + ".drBurn") ? +getProperty(object, bodyParts[i] + ".drBurn") : 0,
						cor: 	getProperty(object, bodyParts[i] + ".drCor")  ? +getProperty(object, bodyParts[i] + ".drCor") : 0,
						cr: 	getProperty(object, bodyParts[i] + ".drCr")   ? +getProperty(object, bodyParts[i] + ".drCr")  : 0,
						cut: 	getProperty(object, bodyParts[i] + ".drCut")  ? +getProperty(object, bodyParts[i] + ".drCut") : 0,
						fat: 	getProperty(object, bodyParts[i] + ".drFat")  ? +getProperty(object, bodyParts[i] + ".drFat") : 0,
						imp: 	getProperty(object, bodyParts[i] + ".drImp")  ? +getProperty(object, bodyParts[i] + ".drImp") : 0,
						pi: 	getProperty(object, bodyParts[i] + ".drPi")   ? +getProperty(object, bodyParts[i] + ".drPi")  : 0,
						tox: 	getProperty(object, bodyParts[i] + ".drTox")  ? +getProperty(object, bodyParts[i] + ".drTox") : 0,
						hardness: 1,
						flexible: false
					}

					if (getProperty(object, bodyParts[i] + ".flexible")){ // Check to see if flexible exists and is true
						armour.flexible[bodyParts[i]] = true;
						dr.flexible = true;
					}
					else {
						armour.flexible[bodyParts[i]] = false;
						dr.flexible = false;
					}

					if (getProperty(object, bodyParts[i] + ".drHardening")){ // Check to see if the hardening value exists
						armour.hardness[bodyParts[i]] = getProperty(object, bodyParts[i] + ".drHardening"); // Set hardening
						dr.hardness = +getProperty(object, bodyParts[i] + ".drHardening");
					}

					setProperty(body, bodyParts[i] + ".dr." + index, dr);
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

						// For each DR type, add it to the underlying bodypart
						let dr = {
							burn: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0,
							cor: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0,
							cr: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0,
							cut: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0,
							fat: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0,
							imp: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0,
							pi: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0,
							tox: 	getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0,
							hardness: 1,
							flexible: false
						}

						if (getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".flexible")){ // Check to see if flexible exists and is true
							armour.flexible[bodyParts[i] + subParts[n]] = true;
							dr.flexible = true;
						}
						else {
							armour.flexible[bodyParts[i] + subParts[n]] = false;
							dr.flexible = false;
						}

						if (getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening")){ // Check to see if the hardening value exists
							armour.hardness[bodyParts[i] + subParts[n]] = +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening"); // Set hardening
							dr.hardness = +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening");
						}

						setProperty(body, bodyParts[i] + ".subLocation." + subParts[n] + ".dr." + index, dr);
					}
				}
			}
		}
		return armour
	}

	bodyReserves() {
		if (this.data) {
			if (this.data.data) {
				if (this.data.data.reserves) { // Make sure reserves exist

					// Handle the calculations for HP
					let hpMax = this.data.data.reserves.hp.max;
					let hpValue = this.data.data.reserves.hp.value;
					let hpState;

					let hpRatio = hpValue / hpMax;
					// set the limits
					switch (Math.trunc(hpRatio)) {
						case 0: {
							if (hpRatio <= 0) { // collapse
								hpState = 'Collapse';
								break;
							} else if (hpValue < (hpMax / 3)) { // reeling
								hpState = 'Reeling';
								break;
							}
							// healthy, no break
						}
						case 1: { // healthy
							hpState = 'Healthy';
							break;
						}
						case -1: { // death check at -1
							hpState = 'Death 1';
							break;
						}
						case -2: { // death check at -2
							hpState = 'Death 2';
							break;
						}
						case -3: { // death check at -3
							hpState = 'Death 3';
							break;
						}
						case -4: { // death check at -4
							hpState = 'Death 4';
							break;
						}
						default: { // dead
							hpState = 'Dead';
							break;
						}
					}
					this.data.data.reserves.hp.state = hpState;

					// Handle the calculations for FP
					let fpMax = this.data.data.reserves.fp.max;
					let fpValue = this.data.data.reserves.fp.value;
					let fpState;

					let fpRatio = fpValue / fpMax;
					// set the limits
					switch (Math.trunc(fpRatio)) {
						case 0: {
							if (fpRatio <= 0) { // collapse
								fpState = 'Collapse';
								break;
							} else if (fpValue < (fpMax / 3)) { // tired
								fpState = 'Tired';
								break;
							}
							// fresh, no break
						}
						case 1: { // fresh
							fpState = 'Fresh';
							break;
						}
						default: { // unconscious
							fpState = 'Unconscious';
							break;
						}
					}
					// update the actor
					this.data.data.reserves.fp.state = fpState;
				}
			}
		}
	}

	partHP() {
		if (this.data) {
			if (this.data.data) {
				if (this.data.data.bodyType) {
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

		console.log(targetToken._validPosition)
		console.log(targetToken.data.rotation)

		let relativePosition = (Math.atan2(-(targetToken._validPosition.x - selfToken._validPosition.x), (targetToken._validPosition.y - selfToken._validPosition.y)) * 180 / Math.PI); // Takes the atan of the two sets of points after they have been rotated clockwise 90 degrees. This puts the 0 point towards the direction of facing with 180/-180 directly behind
		console.log(relativePosition);

		let targetFacing;
		if (targetToken.data.rotation > 180){ // Correct for facing angles of greater than 180 degrees. Valid range for this macro is -180 to 0 to 180. Not 0 to 360
			targetFacing = targetToken.data.rotation - 360;
		}
		else {
			targetFacing = targetToken.data.rotation
		}

		let relativeAngle = relativePosition - targetFacing; // Get the relative angle between the two tokens, corrected for the target's facing

		if (relativeAngle < -180){ // Correct for angles less than -180
			relativeAngle += 360;
		}
		else if (relativeAngle > 180){ // Correct for angles more than 180
			relativeAngle -= 360;
		}
		relativeAngle = Math.round(relativeAngle); // Round the angle so we don't get cases like 120.172 degrees.

		console.log(relativeAngle)

		let leftFrontBound = (0 - (selfToken.actor.data.data.vision.front / 2)); // Get all the bounds for front and side arcs
		let rightFrontBound = (0 + (selfToken.actor.data.data.vision.front / 2));
		let leftSideBound = (0 - (selfToken.actor.data.data.vision.side / 2));
		let rightSideBound = (0 + (selfToken.actor.data.data.vision.side / 2));

		console.log(leftFrontBound + " - " + rightFrontBound)
		console.log(leftSideBound + " - " + rightSideBound)

		// Determine which arc the attacker is standing in
		if (relativeAngle >= leftFrontBound && relativeAngle <= rightFrontBound){
			console.log("It's in the front hexes")
		}
		else if (relativeAngle >= leftSideBound && relativeAngle <= rightSideBound){
			console.log("It's in the side hexes")
		}
		else {
			console.log("It's in the rear hexes")
		}

		let literalRear = game.settings.get("gurps4e", "literalRear");

		// Determine if the attacker is standing in front of or behind the target (In space, not relative to vision cones)
		if (((relativeAngle >= -90 && relativeAngle <= 90) && literalRear) || ((relativeAngle >= -120 && relativeAngle <= 120) && !literalRear)){
			console.log("It's infront of the target")
		}
		else {
			console.log("It's behind the target")
		}
	}

	// Facing is returned as 1/0/-1 (Front/Side/Rear) and position as 1/-1 (Ahead/Behind)
	getFacing(selfToken, targetToken){
		let relativePosition = (Math.atan2(-(targetToken._validPosition.x - selfToken._validPosition.x), (targetToken._validPosition.y - selfToken._validPosition.y)) * 180 / Math.PI); // Takes the atan of the two sets of points after they have been rotated clockwise 90 degrees. This puts the 0 point towards the direction of facing with 180/-180 directly behind

		let targetFacing;
		if (targetToken.data.rotation > 180){ // Correct for facing angles of greater than 180 degrees. Valid range for this macro is -180 to 0 to 180. Not 0 to 360
			targetFacing = targetToken.data.rotation - 360;
		}
		else {
			targetFacing = targetToken.data.rotation
		}

		let relativeAngle = relativePosition - targetFacing; // Get the relative angle between the two tokens, corrected for the target's facing

		if (relativeAngle < -180){ // Correct for angles less than -180
			relativeAngle += 360;
		}
		else if (relativeAngle > 180){ // Correct for angles more than 180
			relativeAngle -= 360;
		}
		relativeAngle = Math.round(relativeAngle); // Round the angle so we don't get cases like 120.172 degrees.

		let leftFrontBound = (0 - (selfToken.actor.data.data.vision.front / 2)); // Get all the bounds for front and side arcs
		let rightFrontBound = (0 + (selfToken.actor.data.data.vision.front / 2));
		let leftSideBound = (0 - (selfToken.actor.data.data.vision.side / 2));
		let rightSideBound = (0 + (selfToken.actor.data.data.vision.side / 2));

		let facing;
		let position;

		// Determine which arc the attacker is standing in
		if (relativeAngle >= leftFrontBound && relativeAngle <= rightFrontBound){
			facing = "front";
		}
		else if (relativeAngle >= leftSideBound && relativeAngle <= rightSideBound){
			facing = "side";
		}
		else {
			facing = "back";
		}

		let literalRear = game.settings.get("gurps4e", "literalRear");

		// Determine if the attacker is standing in front of or behind the target (In space, not relative to vision cones)
		if (((relativeAngle >= -90 && relativeAngle <= 90) && literalRear) || ((relativeAngle >= -120 && relativeAngle <= 120) && !literalRear)){
			position = "ahead";
		}
		else {
			position = "behind";
		}

		return [facing,position]
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
		let attacks = this.listAttacks(selfToken.actor);
		console.log(attacks)

		let htmlContent = "<div>";
		htmlContent += "<table>";

		htmlContent += "<tr><td colspan='8' class='trait-category-header' style='text-align: center;'>Melee Attacks</td></tr>";
		htmlContent += "<tr><td></td><td>Weapon</td><td>Attack</td><td>Level</td><td>Damage</td><td>Reach</td><td>Parry</td><td>ST</td></tr>";

		for (let x = 0; x < attacks.melee.length; x++){
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
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M110.11 227.59c-6.25-6.25-16.38-6.25-22.63 0l-18.79 18.8a16.005 16.005 0 0 0-2 20.19l53.39 80.09-53.43 53.43-29.26-14.63a13.902 13.902 0 0 0-16.04 2.6L4.07 405.36c-5.42 5.43-5.42 14.22 0 19.64L87 507.93c5.42 5.42 14.22 5.42 19.64 0l17.29-17.29a13.873 13.873 0 0 0 2.6-16.03l-14.63-29.26 53.43-53.43 80.09 53.39c6.35 4.23 14.8 3.39 20.19-2l18.8-18.79c6.25-6.25 6.25-16.38 0-22.63l-174.3-174.3zM493.73.16L400 16 171.89 244.11l96 96L496 112l15.83-93.73c1.51-10.56-7.54-19.61-18.1-18.11z" class=""></path></svg>',
					label: "Select Melee",
					callback: () => {
						let elements = document.getElementsByName('melee');
						let attack;

						for (let e = 0; e < elements.length; e++){
							if(elements[e].checked){
								attack = e;
							}
						}
						if (typeof attack !== "undefined") {
							this.attackOnTarget(selfToken, attacks.melee[attack], targetToken)
						}
					}
				},
				ranged: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M145.78 287.03l45.26-45.25-90.58-90.58C128.24 136.08 159.49 128 192 128c32.03 0 62.86 7.79 90.33 22.47l46.61-46.61C288.35 78.03 241.3 64 192 64c-49.78 0-97.29 14.27-138.16 40.59l-3.9-3.9c-6.25-6.25-16.38-6.25-22.63 0L4.69 123.31c-6.25 6.25-6.25 16.38 0 22.63l141.09 141.09zm262.36-104.64L361.53 229c14.68 27.47 22.47 58.3 22.47 90.33 0 32.51-8.08 63.77-23.2 91.55l-90.58-90.58-45.26 45.26 141.76 141.76c6.25 6.25 16.38 6.25 22.63 0l22.63-22.63c6.25-6.25 6.25-16.38 0-22.63l-4.57-4.57C433.74 416.63 448 369.11 448 319.33c0-49.29-14.03-96.35-39.86-136.94zM493.22.31L364.63 26.03c-12.29 2.46-16.88 17.62-8.02 26.49l34.47 34.47-250.64 250.63-49.7-16.57a20.578 20.578 0 0 0-21.04 4.96L6.03 389.69c-10.8 10.8-6.46 29.2 8.04 34.04l55.66 18.55 18.55 55.65c4.83 14.5 23.23 18.84 34.04 8.04l63.67-63.67a20.56 20.56 0 0 0 4.97-21.04l-16.57-49.7 250.64-250.64 34.47 34.47c8.86 8.86 24.03 4.27 26.49-8.02l25.72-128.59C513.88 7.8 504.2-1.88 493.22.31z" class=""></path></svg>',
					label: "Select Ranged",
					callback: () => {
						let elements = document.getElementsByName('range');
						let attack;

						for (let e = 0; e < elements.length; e++){
							if(elements[e].checked){
								attack = e;
							}
						}
						if (typeof attack !== "undefined") {
							this.attackOnTarget(selfToken, attacks.ranged[attack], targetToken)
						}
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

		return singleTargetModal;
	}

	listAttacks(actor){
		console.log(actor)
		let meleeAttacks = [];
		let rangedAttacks = [];
		let melee;
		let ranged;

		for (let y = 0; y < actor.data.items.length; y++){
			if (actor.data.items[y].type == "Trait" || actor.data.items[y].type == "Equipment"){
				let meleeKeys = Object.keys(actor.data.items[y].data.melee); // Collect all the melee keys
				let rangedKeys = Object.keys(actor.data.items[y].data.ranged); // Collect all the ranged keys

				for (let m = 0; m < meleeKeys.length; m++){
					melee = getProperty(actor.data.items[y].data.melee, meleeKeys[m]);
					melee.weapon = actor.data.items[y].name

					meleeAttacks.push(melee);
				}

				for (let r = 0; r < rangedKeys.length; r++){
					ranged = getProperty(actor.data.items[y].data.ranged, rangedKeys[r]);
					ranged.weapon = actor.data.items[y].name

					rangedAttacks.push(ranged);
				}
			}
		}

		return { "melee": meleeAttacks, "ranged": rangedAttacks}
	}

	attackOnTarget(attacker, attack, target) {
		let bodyParts = Object.keys(target.actor.data.data.bodyType.body); // Collect all the bodypart names
		let relativePosition = this.getFacing(attacker, target); // Method returns [facing,position]

		let locationSelector = "<table>" +
			"<tr><td>Location</td><td><select name='hitLocation' id='hitLocation'>"
		for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
			let part = getProperty(target.actor.data.data.bodyType.body, bodyParts[i])
			let penalty;
			if (relativePosition[1] > 0){ // If the attacker is in front of the target
				penalty = part.penaltyFront;
			}
			else {
				penalty = part.penaltyBack;
			}
			locationSelector += "<option value='" + bodyParts[i] + "'>" + part.label + ": " + penalty + "</option>"
		}

		locationSelector += "</select></td></tr>"

		let split;
		let rof = {
			shots: 1,
			pellets: 1,
			rof: 1
		}
		if (attack.type === "ranged") { // For ranged attacks, handle RoF related stuff
			if (attack.rof.toString().toLowerCase().includes("x")){
				split = attack.rof.toString().toLowerCase().split("x")
				rof.shots = split[0];
				rof.pellets = split[1];
			}
			else if (attack.rof.toString().toLowerCase().includes("*")){
				split = attack.rof.toString().toLowerCase().split("*")
				rof.shots = split[0];
				rof.pellets = split[1];
			}
			else {
				rof.shots = attack.rof.trim()
				rof.pellets = 1;
			}

			locationSelector += "<tr><td>Shots:</td><td><input style='width: 45%' type='number' id='rof' name='rof' value='" + rof.shots + "'/></td></tr>" +
				"<tr><td>Pellets per shot</td><td>" + rof.pellets + "</td></tr>" +
				"</table>";
		}

		// Open dialog to choose hit location, random swing, or random torso
		let hitLocationModal = new Dialog({
			title: "Select Location",
			content: locationSelector,
			buttons: {
				randLocation: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"></path></svg>',
					label: "Random Hit Location",
					callback: () => {
						// The user has not chosen to target a specific location. Find the result randomly.
						let rofInput = document.getElementsByName('rof');
						if(rofInput[0]){
							rof.shots = Math.min(rofInput[0].value, rof.shots)
							rof.rof = rof.shots * rof.pellets;
							this.selectedRandom(target, attacker, attack, relativePosition, rof)
						}
						else {
							this.selectedRandom(target, attacker, attack, relativePosition, rof)
						}
					}
				},
				randTorso: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
					label: "Select Torso",
					callback: () => {
						// The user has selected the torso without specifying upper/lower. Find the result randomly.
						let rofInput = document.getElementsByName('rof');
						if(rofInput[0]){
							rof.shots = Math.min(rofInput[0].value, rof.shots)
							rof.rof = rof.shots * rof.pellets;
							this.selectedTorso(target, attacker, attack, relativePosition, rof)
						}
						else {
							this.selectedTorso(target, attacker, attack, relativePosition,  rof)
						}
					}
				},
				hitLocation: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
					label: "Select Hit Location",
					callback: () => {
						// The user has selected a hit location without specifying sub location. Choose the sub location randomly.
						let elements = document.getElementsByName('hitLocation');
						if(elements[0].value){
							let rofInput = document.getElementsByName('rof');
							if(rofInput[0]){
								rof.shots = Math.min(rofInput[0].value, rof.shots)
								rof.rof = rof.shots * rof.pellets;
								this.selectedHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
							}
							else {
								this.selectedHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
							}

						}
					}
				},
				hitSubLocation: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
					label: "Select Complex Hit Location",
					callback: () => {
						// The user has selected a hit location and specified they wish to target a sub location. Open another dialog to find what specific location.
						let elements = document.getElementsByName('hitLocation');
						if(elements[0].value){
							let rofInput = document.getElementsByName('rof');
							if(rofInput[0]){
								rof.shots = Math.min(rofInput[0].value, rof.shots)
								rof.rof = rof.shots * rof.pellets;
								this.selectedComplexHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
							}
							else {
								this.selectedComplexHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
							}

						}
					}
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: () => {

					}
				}
			},
			default: "randTorso",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		},{
			resizable: true,
			width: "500"
		})

		hitLocationModal.render(true);

		// let label = attacker.nameplate._text + " attacks " + target.nameplate._text + " with a " + attack.weapon + " " + attack.name + "."
		//
		// rollHelpers.skillRoll(attack.level, 0, label)
	}

	selectedRandom(target, attacker, attack, relativePosition, rof) { // Select random hit location
		let locations = [];
		for (let i = 0; i < rof.rof; i++){ // Find a different hit location for each shot
			let generalLocation = this.randomHitLocation(target) // Select a random location
			if (generalLocation.subLocation){ // Check to see if there are sub locations
				let specificLocation = this.randomComplexHitLocation(generalLocation); // Get the sub location
				locations[i] = specificLocation;
			}
			else {
				locations[i] = generalLocation;
			}
		}

		this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, 0) // There is no hit location penalty since they're going with a random location
	}

	selectedTorso(target, attacker, attack, relativePosition, rof) { // Select random location on torso (Chest/Abdomen)
		let locations = [];
		for (let i = 0; i < rof.rof; i++){ // Find a different hit location for each shot
			let generalLocation = this.randomTorsoLocation(target); // Generate a random location from the list of torso locations
			if (generalLocation.subLocation){ // Check to see if there are sub locations
				let specificLocation = this.randomComplexHitLocation(generalLocation); // Get the sub location
				locations[i] = specificLocation;
			}
			else {
				locations[i] = generalLocation;
			}
		}

		this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, 0) // There is no hit location penalty since they're going for the torso
	}

	selectedHitLocation(target, attacker, attack, locationHit, relativePosition, rof) { // Select specific hit location and then generate a random complex hit location
		let locations = [];
		let penalty;
		for (let i = 0; i < rof.rof; i++) { // Find a different hit location for each shot
			let generalLocation = getProperty(target.actor.data.data.bodyType.body, locationHit); // Get specific hit location

			if (generalLocation.subLocation){ // Check to see if there are sub locations
				let specificLocation = this.randomComplexHitLocation(generalLocation); // Get the sub location
				locations[i] = specificLocation;
			}
			else {
				locations[i] = generalLocation;
			}

			if (relativePosition[1] > 0){ // If the attacker is in front of the target
				penalty = generalLocation.penaltyFront; // The penalty comes from the general location since that's what they selected
			}
			else {
				penalty = generalLocation.penaltyBack;
			}
		}

		this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, penalty)
	}

	selectedComplexHitLocation(target, attacker, attack, locationHit, relativePosition, rof) { // Select specific hit location and then the complex hit location
		// Open a new dialog to specify sub location
		let location = getProperty(target.actor.data.data.bodyType.body, locationHit)

		if (location.subLocation){ // Make sure there are even complex hit locations to choose
			let bodyParts = Object.keys(getProperty(target.actor.data.data.bodyType.body, locationHit + ".subLocation")); // Collect all the bodypart names

			let complexLocationSelector = ""
			complexLocationSelector += "<select name='complexHitLocation' id='complexHitLocation'>"
			for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
				let part = getProperty(target.actor.data.data.bodyType.body, locationHit + ".subLocation." + bodyParts[i])

				let penalty;
				if (relativePosition[1] > 0){ // If the attacker is in front of the target
					penalty = part.penaltyFront;
				}
				else {
					penalty = part.penaltyBack;
				}

				complexLocationSelector += "<option value='" + locationHit + ".subLocation." + bodyParts[i] + "'>" + part.label + ": " + penalty + "</option>"
			}

			complexLocationSelector += "</select>"

			// Open dialog to choose specific complex hit location
			let complexHitLocationModal = new Dialog({
				title: "Select Specific Location",
				content: complexLocationSelector,
				buttons: {
					hitLocation: {
						icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
						label: "Select Complex Hit Location",
						callback: () => {
							// The user has selected a hit location without specifying sub location. Choose the sub location randomly.
							let elements = document.getElementsByName('complexHitLocation');
							if(elements[0].value){
								let location = getProperty(target.actor.data.data.bodyType.body, elements[0].value)
								let locations = [];
								for (let i = 0; i < rof.rof; i++) {
									locations[i] = location;
								}
								let penalty;
								if (relativePosition[1] > 0){ // If the attacker is in front of the target
									penalty = location.penaltyFront;
								}
								else {
									penalty = location.penaltyBack;
								}
								this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, penalty)
							}
						}
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: "Cancel",
						callback: () => {

						}
					}
				},
				default: "randTorso",
				render: html => console.log("Register interactivity in the rendered dialog"),
				close: html => console.log("This always is logged no matter which option is chosen")
			},{
				resizable: true,
				width: "500"
			})

			complexHitLocationModal.render(true);
		}
		else { // If there are no sub locations proceed as normal
			let penalty;
			if (relativePosition[1] > 0){ // If the attacker is in front of the target
				penalty = location.penaltyFront;
			}
			else {
				penalty = location.penaltyBack;
			}
			let locations = [];
			for (let i = 0; i < rof.rof; i++) {
				locations[i] = location;
			}
			this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, penalty)
		}
	}

	randomHitLocation(target){
		let targetBody = target.actor.data.data.bodyType;
		let bodyParts = Object.keys(targetBody.body);
		let roll = Math.random() * (targetBody.totalWeight - 0) + 0; // Roll a number between 0 and the target's total weight.
		let part;

		let i = -1;
		do {
			i += 1; // Itterate the index
			part = getProperty(targetBody.body, bodyParts[i]); // Get the part for the current index
			roll -= part.weight; // Subtract it's weight from the rolled weight
		} while (roll > 0) // If the roll drops below zero, stop looping

		let location = part; // Whatever the last part we accessed is the 'rolled' part.

		return location;
	}

	randomTorsoLocation(target){
		let targetBody = target.actor.data.data.bodyType;
		let bodyParts = Object.keys(targetBody.body);
		let torsoParts = [];

		for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
			if (bodyParts[i].toLowerCase().includes("chest") || bodyParts[i].toLowerCase().includes("abdomen")){ // If it's part of the torso, add it to the array to be searched
				torsoParts.push(bodyParts[i])
			}
		}

		let torsoPartsIndex = Math.floor(Math.random() * (torsoParts.length)); // Generate a random number between 0 and the max index

		return getProperty(targetBody.body, torsoParts[torsoPartsIndex]);
	}

	randomComplexHitLocation(generalLocation){
		let subLocations = Object.keys(generalLocation.subLocation);
		let roll = Math.random() * (generalLocation.totalSubWeight - 0) + 0; // Roll a number between 0 and the target's total weight.
		let part;

		let i = -1;
		do {
			i += 1; // Itterate the index
			part = getProperty(generalLocation.subLocation, subLocations[i]); // Get the part for the current index
			roll -= part.weight; // Subtract it's weight from the rolled weight
		} while (roll > 0) // If the roll drops below zero, stop looping

		let subLocation = part; // Whatever the last part we accessed is the 'rolled' part.

		return subLocation;
	}

	getSM(actor) {
		console.log(actor)
		let sm = 0;
		if (actor) { // Make sure all the data is present
			if (actor.token){
				if (actor.token.data){
					if (actor.token.data.data){
						if (actor.token.data.data.bio){
							if (actor.token.data.data.bio.sm){
								if (actor.token.data.data.bio.sm.value){
									if (typeof actor.token.data.data.bio.sm.value == "number") { // SM Exists and is a number
										sm = actor.token.data.data.bio.sm.value;
									}
								}
							}
						}
					}
				}
			}
			else if (actor.data) {
				if (actor.data.data) {
					if (actor.data.data.bio) {
						if (actor.data.data.bio.sm) {
							if (actor.data.data.bio.sm.value) {
								sm = actor.data.data.bio.sm.value;
							}
						}
					}
				}
			}
		}
		return sm; // Return 0 if the above does not retrieve a value
	}

	attackModifiers(target, attacker, attack, relativePosition, rof, location, locationPenalty) {
		let distanceRaw = Math.round(canvas.grid.measureDistance(attacker, target));
		let distanceYards = distanceHelpers.convertToYards(distanceRaw, canvas.scene.data.gridUnits);
		let distancePenalty = distanceHelpers.distancePenalty(distanceYards);

		let rofBonus = generalHelpers.rofToBonus(rof.rof); // TODO - Something is making this return undefined in some cases. Maybe fixed?
		if (typeof rofBonus == "undefined") { // RoF is sometimes coming through undefined. Catch that.
			rofBonus = 0;
		}
		let totalModifier;
		let sizeModModifier = 0;

		let modModalContent =  "<table>" +
			"<tr><td>Hit Location</td><td>" + locationPenalty + "</td></tr>"

		if (attack.type === "ranged") {
			console.log("ranged")
			// Sort out the effective SM modifier based on the game's settings and the attacker/target SM
			if (game.settings.get("gurps4e", "rangedRelativeSM")) { // Game is using relative SM rules for ranged attacks
				sizeModModifier = this.getSM(target.actor) - this.getSM(attacker.actor);
			}
			else {
				sizeModModifier = this.getSM(target.actor);
			}

			totalModifier = (distancePenalty + locationPenalty + rofBonus + sizeModModifier); // Total up the modifiers
			modModalContent += "<tr><td>Distance (" + distanceRaw + " " + canvas.scene.data.gridUnits + ")</td><td>" + distancePenalty + "</td></tr>" + // Display the ranged specific modifiers
								"<tr><td>RoF Bonus:</td><td>" + rofBonus + "</td></tr>";
		}
		else {
			console.log("melee")
			// Sort out the effective SM modifier based on the game's settings and the attacker/target SM
			if (game.settings.get("gurps4e", "meleeRelativeSM")) { // Game is using relative SM rules for melee attacks
				sizeModModifier = this.getSM(target.actor) - this.getSM(attacker.actor);
			}
			else {
				sizeModModifier = this.getSM(target.actor);
			}

			totalModifier = locationPenalty + sizeModModifier; // Total up the modifiers
		}

		modModalContent += "<tr><td>SM Modifier:</td><td>" + sizeModModifier + "</td></tr>";

		let odds = rollHelpers.levelToOdds((+attack.level + +totalModifier))

		modModalContent += "<tr><td>Total Modifier</td><td>" + totalModifier + "</td></tr>" +
			"<tr><td>Effective Skill</td><td>" + (+attack.level + +totalModifier) + "</td></tr>" +
			"<tr><td>Odds</td><td><span style='font-weight: bold; color: rgb(208, 127, 127)'>" + odds.critFail + "%</span>/<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + odds.success + "%</span>/<span style='font-weight: bold; color: rgb(106, 162, 106)'>" + odds.critSuccess + "%</span></td></tr>" +
			"<tr><td>Additional Modifier</td><td><input type='number' id='mod' name='mod' value='0' style='width: 50%'/></td></tr>" +
			"</table>"

		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: modModalContent,
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val()
						this.reportHitResult(target, attacker, attack, relativePosition, rof, location, (+totalModifier + +mod))
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: () => {
						this.reportHitResult(target, attacker, attack, relativePosition, rof, location, totalModifier)
					}
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: () => {

					}
				}
			},
			default: "mod",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		})
		modModal.render(true)
	}

	reportHitResult(target, attacker, attack, relativePosition, rof, locationArray, totalModifiers) {
		let label = attacker.nameplate._text + " attacks " + target.nameplate._text + " with a " + attack.weapon + " " + attack.name;


		if (attack.type == "ranged"){
			if (rof.shots == rof.rof){ // It is not a multiple projectile weapon
				label += " and fires " + rof.shots + " times.";
			}
			else { // It is a multiple projectile weapon
				label += " and fires " + rof.shots + " times for " + rof.rof + " shots.";
			}
		}
		else {
			label += ".";
		}

		let rollInfo = rollHelpers.skillRoll(attack.level, totalModifiers, label, false)
		let messageContent = rollInfo.content;

		let flags = {}

		if (rollInfo.success == false) {
			messageContent += attacker.nameplate._text + " misses " + target.nameplate._text + "</br>";
		}
		else {
			let hits;
			if (attack.type == "ranged") {
				hits = Math.min( ((Math.floor(rollInfo.margin / Math.abs(attack.rcl))) + 1) , rof.rof ); // Get the number of hits based on how many times rcl fits into margin, plus one. Then cap with the number of shots actually fired
			}
			else {
				hits = 1
			}
			messageContent += attacker.nameplate._text + " hits " + target.nameplate._text + " " + this.numToWords(hits) + "</br></br>"; // Display the number of hits

			let locations = locationArray.slice(0, hits); // Shorten the list of locations to the number of hits.

			messageContent += target.nameplate._text + " is struck in the...</br>";
			for (let m = 0; m < locations.length; m++){
				let firstLocation = getProperty(target.actor.data.data.bodyType.body, (locations[m].id).split(".")[0]);
				let firstLabel = firstLocation ? firstLocation.label : "";
				let secondLabel = locations[m].label
				let locationLabel;
				if (firstLabel === secondLabel){
					locationLabel = firstLabel;
				}
				else if (firstLabel === ''){
					locationLabel = secondLabel;
				}
				else {
					locationLabel = firstLabel + " - " + secondLabel;
				}
				messageContent += "<div style='display: grid; grid-template-columns: 0.1fr auto;'><input type='checkbox' checked class='checkbox' id='" + locations[m].id + "' value='" + locations[m].id + "' name='" + locations[m].id + "' /><span style='line-height: 26px;'>" + locationLabel + "</span></div>";
			}

			messageContent += "</br><input type='button' class='attemptActiveDefences' value='Attempt Active Defences'/>"

			let locationIDs = [];

			for (let l = 0; l < locations.length; l++){
				locationIDs[l] = locations[l].id;
			}

			flags = {
				target: target.actor.data._id,
				attacker: attacker.actor.data._id,
				attack: attack,
				relativePosition: relativePosition,
				rof: rof,
				locationIDs: locationIDs,
				totalModifiers: totalModifiers
			}
		}

		// Everything is assembled, send the message
		ChatMessage.create({ content: messageContent, user: game.user._id, type: rollInfo.type, flags: flags});
	}

	numToWords(hits){ // Returns a number as a string with no leading or trailing whitespace
		let words;
		switch (hits) {
			case 1:
				words = "once";
				break;
			case 2:
				words = "twice";
				break;
			default: // not a supported type
				words = hits + " times";
				break;
		}
		return words;
	}

	// The following section relates to the active defence portion of the combat macro.

	attemptActiveDefences(event) {
		event.preventDefault();

		function filterChecked(item){
			return item.checked; // Return whatever the status of the checkbox is.
		}

		let checkboxes = event.target.parentElement.getElementsByClassName("checkbox");
		let checkedBoxes = Object.values(checkboxes).filter(filterChecked);
		let locationIDs = [];

		for (let c = 0; c < checkedBoxes.length; c++){
			locationIDs[c] = checkedBoxes[c].id;
		}

		let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).data.flags;

		let target = game.actors.get(flags.target);

		let dodges = [];
		let parries = [];
		let blocks = [];

		let dodge = {
			name: "Dodge",
			level: target.data.data.primaryAttributes.dodge.value
		}

		dodges.push(dodge);

		if (target.data.items) {
			for (let a = 0; a < target.data.items.length; a++){ // Loop through the items
				if (target.data.items[a].data.melee) {
					let item = target.data.items[a].data;
					let keys = Object.keys(item.melee)
					if (true){ // Look for items with melee profiles
						for (let b = 0; b < keys.length; b++){ // Loop through the melee profiles
							let profile = getProperty(item.melee, keys[b])
							if (Number.isInteger(profile.parry)){
								let parry = {
									name: target.data.items[a].name,
									level: profile.parry
								}
								parries.push(parry)
							}

							if (Number.isInteger(profile.block)){
								let block = {
									name: target.data.items[a].name,
									level: profile.block
								}
								blocks.push(block)
							}
						}
					}
				}
			}
		}

		let activeDefenceModalContent =
			"<div style='text-align: center; font-weight: bold'>General Modifiers</div>" +
			"<div style='display: grid; grid-template-columns: 1fr 1fr'><span style='text-align: right;'><label for='feverishDefence' style='line-height: 26px;'>Feverish Defence</label></span><span><input type='checkbox' name='feverishDefence' id='feverishDefence' value='feverishDefence' /></span></div>" +
			"<div style='display: grid; grid-template-columns: 1.5fr 0.5fr 1.5fr 0.5fr 1.5fr 0.5fr'>" +
			"   <span><label for='retreat' style='line-height: 26px;'>Retreat</label></span><span><input type='checkbox' name='retreat' id='retreat' value='retreat' /></span>" +
			"   <span><label for='sideslip' style='line-height: 26px;'>Side Slip</label></span><span><input type='checkbox' name='sideslip' id='sideslip' value='sideslip' /></span>" +
			"   <span><label for='slip' style='line-height: 26px;'>Slip</label></span><span><input type='checkbox' name='slip' id='slip' value='slip' /></span>" +
			"</div>" +
			"<div><input type='number' id='mod' name='mod' placeholder='Modifier'/></div>" +
			"<div style='text-align: center; font-weight: bold; padding-top: 10px;'>Specific Modifiers</div>" +
			"<div style='display: grid; font-weight: bold; grid-template-columns: 1fr 1fr 1fr'><span style='text-align: center;'>Dodge</span><span style='text-align: center;'>Block</span><span style='text-align: center;'>Parry</span></div>" +
			"<div style='display: grid; grid-template-columns: 1.5fr 0.5fr 2fr 1.5fr 0.5fr'>" +
			"   <span><label for='drop' style='line-height: 26px;'>Dodge & Drop</label></span><span><input type='checkbox' name='drop' id='drop' value='drop' /></span>" +
			"   <span></span>" +
			"   <span><label for='crossParry' style='line-height: 26px;'>Cross Parry</label></span><span><input type='checkbox' name='crossParry' id='crossParry' value='crossParry' /></span>" +
			"</div>" +
			"<div style='display: grid; grid-template-columns: 1fr 1fr 1fr'>" +
			"<select name='dodgeSelector' id='dodgeSelector'>";

		if (dodges){
			for (let d = 0; d < dodges.length; d++){
				activeDefenceModalContent += "<option value='" + dodges[d].level + "'>" + dodges[d].name + ": " + dodges[d].level + "</option>"
			}
		}

		activeDefenceModalContent += "</select>" +
			"<select name='blockSelector' id='blockSelector'>";

		if (blocks){
			for (let b = 0; b < blocks.length; b++){
				activeDefenceModalContent += "<option value='" + blocks[b].level + "'>" + blocks[b].name + ": " + blocks[b].level + "</option>"
			}
		}

		activeDefenceModalContent += "</select>" +
			"<select name='parrySelector' id='parrySelector'>";

		if (parries){
			for (let p = 0; p < parries.length; p++){
				activeDefenceModalContent += "<option value='" + parries[p].level + "'>" + parries[p].name + ": " + parries[p].level + "</option>"
			}
		}

		activeDefenceModalContent += "</select>" +
			"</div>";


		let activeDefenceModal = new Dialog({
			title: "Active Defences",
			content: activeDefenceModalContent,
			buttons: {
				dodge: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 17px;"><path fill="currentColor" d="M272 96c26.51 0 48-21.49 48-48S298.51 0 272 0s-48 21.49-48 48 21.49 48 48 48zM113.69 317.47l-14.8 34.52H32c-17.67 0-32 14.33-32 32s14.33 32 32 32h77.45c19.25 0 36.58-11.44 44.11-29.09l8.79-20.52-10.67-6.3c-17.32-10.23-30.06-25.37-37.99-42.61zM384 223.99h-44.03l-26.06-53.25c-12.5-25.55-35.45-44.23-61.78-50.94l-71.08-21.14c-28.3-6.8-57.77-.55-80.84 17.14l-39.67 30.41c-14.03 10.75-16.69 30.83-5.92 44.86s30.84 16.66 44.86 5.92l39.69-30.41c7.67-5.89 17.44-8 25.27-6.14l14.7 4.37-37.46 87.39c-12.62 29.48-1.31 64.01 26.3 80.31l84.98 50.17-27.47 87.73c-5.28 16.86 4.11 34.81 20.97 40.09 3.19 1 6.41 1.48 9.58 1.48 13.61 0 26.23-8.77 30.52-22.45l31.64-101.06c5.91-20.77-2.89-43.08-21.64-54.39l-61.24-36.14 31.31-78.28 20.27 41.43c8 16.34 24.92 26.89 43.11 26.89H384c17.67 0 32-14.33 32-32s-14.33-31.99-32-31.99z" class=""></path></svg>',
					label: "Dodge",
					callback: (html) => {
						this.gatherOptions(html, "dodge", flags, locationIDs)
					}
				},
				block: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z" class=""></path></svg>',
					label: "Block",
					callback: (html) => {
						this.gatherOptions(html, "block", flags, locationIDs)
					}
				},
				parry: {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M507.31 462.06L448 402.75l31.64-59.03c3.33-6.22 2.2-13.88-2.79-18.87l-17.54-17.53c-6.25-6.25-16.38-6.25-22.63 0L420 324 112 16 18.27.16C8.27-1.27-1.42 7.17.17 18.26l15.84 93.73 308 308-16.69 16.69c-6.25 6.25-6.25 16.38 0 22.62l17.53 17.54a16 16 0 0 0 18.87 2.79L402.75 448l59.31 59.31c6.25 6.25 16.38 6.25 22.63 0l22.62-22.62c6.25-6.25 6.25-16.38 0-22.63zm-149.36-76.01L60.78 88.89l-5.72-33.83 33.84 5.72 297.17 297.16-28.12 28.11zm65.17-325.27l33.83-5.72-5.72 33.84L340.7 199.43l33.94 33.94L496.01 112l15.84-93.73c1.43-10-7.01-19.69-18.1-18.1l-93.73 15.84-121.38 121.36 33.94 33.94L423.12 60.78zM199.45 340.69l-45.38 45.38-28.12-28.12 45.38-45.38-33.94-33.94-45.38 45.38-16.69-16.69c-6.25-6.25-16.38-6.25-22.62 0l-17.54 17.53a16 16 0 0 0-2.79 18.87L64 402.75 4.69 462.06c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L109.25 448l59.03 31.64c6.22 3.33 13.88 2.2 18.87-2.79l17.53-17.54c6.25-6.25 6.25-16.38 0-22.63L188 420l45.38-45.38-33.93-33.93z" class=""></path></svg>',
					label: "Parry",
					callback: (html) => {
						this.gatherOptions(html, "parry", flags, locationIDs)
					}
				}
			},
			default: "dodge",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		})
		activeDefenceModal.render(true)
	}

	gatherOptions(html, type, flags, locationIDs){
		let selection;
		let name;
		let mod = html.find('#mod').val()
		let options = {
			feverishDefence: html.find('#feverishDefence')[0].checked,
			retreat: html.find('#retreat')[0].checked,
			sideslip: html.find('#sideslip')[0].checked,
			slip: html.find('#slip')[0].checked,
			drop: html.find('#drop')[0].checked,
			crossParry: html.find('#crossParry')[0].checked
		}

		if (type.toLowerCase() === 'parry'){
			selection = html.find('#parrySelector').val()
			name = html.find('#parrySelector')[0].innerText.split(":")[0]
		}
		else if (type.toLowerCase() === 'block'){
			selection = html.find('#blockSelector').val()
			name = html.find('#blockSelector')[0].innerText.split(":")[0]
		}
		else if (type.toLowerCase() === 'dodge'){
			selection = html.find('#dodgeSelector').val()
			name = html.find('#dodgeSelector')[0].innerText.split(":")[0]
		}


		this.rollActiveDefence(mod, selection, name, options, flags, locationIDs, type);
	}

	rollActiveDefence(mod, selection, name, options, flags, locationIDs, type) {

		let target = game.actors.get(flags.target);

		// TODO - Get modifiers for posture, encumbrance
		let totalModifier;
		let additionalMessageContent = "";
		let label = "";

		if (mod === "" || mod === undefined){
			totalModifier = 0;
		}
		else {
			totalModifier = mod;
		}

		label += target.data.name + " attempts a ";

		if (options.feverishDefence) {
			// TODO - Subtract 1 FP from the actor
			label += "feverish ";
			totalModifier += 2;
		}
		if (options.crossParry && type === "parry") {
			label += "cross ";
			totalModifier += 2;
		}

		label += type + " ";

		// Block for retreat options
		if (options.drop && type === "dodge") {
			// TODO - Add thing that sets the unit prone
			label += "and drop ";
			totalModifier += 3;
		}
		else if (options.retreat) {
			label += "and retreat ";
			if (type === "parry" && flags.attack.parryType.toUpperCase() !== "F"){ // If it's a parry and is fencing
				totalModifier += 3; // Grant the fencing bonus
			}
			else {
				totalModifier += 1; // Otherwise grant the default.
			}
		}
		else if (options.sideslip) {
			label += "and side slip ";
			if (type === "parry" && flags.attack.parryType.toUpperCase() !== "F"){ // If it's a parry and is fencing
				totalModifier += 2; // Grant the fencing bonus
			}
			else {
				totalModifier += 0; // Otherwise grant the default.
			}
		}
		else if (options.slip) {
			label += "and slip ";
			if (type === "parry" && flags.attack.parryType.toUpperCase() !== "F"){ // If it's a parry and is fencing
				totalModifier += 1; // Grant the fencing bonus
			}
			else {
				totalModifier += -1; // Otherwise grant the default.
			}
		}

		if (type.toLowerCase() !== "dodge"){
			label += " with their " + name;
		}

		let rollInfo = rollHelpers.skillRoll(selection, totalModifier, label, false);

		let attacksStopped;

		if (rollInfo.margin >= 0) {
			attacksStopped = Math.min(rollInfo.margin + 1, locationIDs.length);
		}
		else {
			attacksStopped = 0;
		}

		let locationsHit;
		let attacksThrough;

		if (attacksStopped >= locationIDs.length){ // Stopped as many or more attacks as there actually are
			additionalMessageContent += target.data.name + " stopped all of the attacks.";
			let messageContent = rollInfo.content + additionalMessageContent;

			// Send the message, no further rolls necessary.
			ChatMessage.create({ content: messageContent, user: game.user._id, type: rollInfo.type});
		}
		else if (attacksStopped <= 0){ // Stopped zero or fewer attacks
			additionalMessageContent += target.data.name + " does not stop any attacks.</br></br>";
			additionalMessageContent += locationIDs.length + " attack" + (locationIDs.length > 1 ? "s " : " ") + "get" + (locationIDs.length === 1 ? "s" : "") + " through.";
			let messageContent = rollInfo.content + additionalMessageContent;

			// Send the message then prepare for damage rolls
			ChatMessage.create({ content: messageContent, user: game.user._id, type: rollInfo.type});

			locationsHit = locationIDs; // All attacks get through
			this.applyDamage(flags, locationsHit);
		}
		else if (attacksStopped === 1){ // Stopped one attack, but not all
			attacksThrough = locationIDs.length - 1;
			additionalMessageContent += target.data.name + " stopped one attack.</br></br>";
			additionalMessageContent += attacksThrough + " attack" + (attacksThrough > 1 ? "s " : " ") + "get" + (attacksThrough === 1 ? "s" : "") + " through.";
			let messageContent = rollInfo.content + additionalMessageContent;

			// Send the message then prepare for damage rolls
			ChatMessage.create({ content: messageContent, user: game.user._id, type: rollInfo.type});

			locationsHit = locationIDs.slice(0, locationIDs.length - 1); // Remove the last hit in the array
			this.applyDamage(flags, locationsHit);
		}
		else if (attacksStopped > 1){ // Stopped more than one attack, but not all
			attacksThrough = locationIDs.length - attacksStopped;
			additionalMessageContent += target.data.name + " stopped " + attacksStopped + " attacks.</br></br>";
			additionalMessageContent += attacksThrough + " attack" + (attacksThrough > 1 ? "s " : " ") + "get" + (attacksThrough === 1 ? "s" : "") + " through.";
			let messageContent = rollInfo.content + additionalMessageContent;

			// Send the message then prepare for damage rolls
			ChatMessage.create({ content: messageContent, user: game.user._id, type: rollInfo.type});

			locationsHit = locationIDs.slice(0, locationIDs.length - attacksStopped); // Remove the last hits in the array
			this.applyDamage(flags, locationsHit);
		}
	}

	applyDamage(flags, locationsHit) {
		let target = game.actors.get(flags.target);
		let attacker = game.actors.get(flags.attacker);
		let attack = flags.attack;
		let targetST = target.data.data.primaryAttributes.knockback.value;
		let totalKnockback = 0;
		let totalInjury = 0;
		let totalFatInj = 0;
		let damageReduction = 1;

		let armourDivisor;

		if (typeof attack.armorDivisor == "undefined" || attack.armorDivisor == ""){ // Armour divisor is undefined or blank
			armourDivisor = 1; // Set it to the default of 1
		}
		else if (attack.armorDivisor.toString().toLowerCase().includes("ignore") || attack.armorDivisor.toString().toLowerCase().includes("cosmic") || attack.armorDivisor.toString().toLowerCase().includes("i")){
			armourDivisor = "Ignores Armour"; // Set to a negative number, which we'll later use to ignore armour entirely.
		}
		else {
			armourDivisor = attack.armorDivisor; // Set it to whatever they entered.
		}

		let damageType = this.extractDamageType(attack);

		let html = "<div>Damage for " + attacker.data.name + "'s " + attack.weapon + " " + attack.name + " against " + target.data.name + "</div>";
		for (let i = 0; i < locationsHit.length; i++){
			let bluntTrauma = 0;
			let location = getProperty(target.data.data.bodyType.body, locationsHit[i])

			// If the attack is not explosive, roll damage for the attack
			let damageRoll = new Roll(attack.damage);
			damageRoll.roll();

			let adds = 0;

			// Build the location label
			let firstLocation = getProperty(target.data.data.bodyType.body, locationsHit[i].split(".")[0]);
			let secondLocation = getProperty(target.data.data.bodyType.body, locationsHit[i]);
			let firstLabel = firstLocation ? firstLocation.label : "";
			let secondLabel = secondLocation? secondLocation.label: "";
			let locationLabel;
			if (firstLabel === secondLabel){
				locationLabel = firstLabel;
			}
			else if (firstLabel === ''){
				locationLabel = secondLabel;
			}
			else {
				locationLabel = firstLabel + " - " + secondLabel;
			}

			// Display dice and damage total for this location.
			html += "<hr>";
			html += "<div>" + locationLabel + "</div>";
			html += "<div>";
			if(damageRoll.terms[0].results){
				if(damageRoll.terms[0].results.length){//Take the results of each roll and turn it into a die icon.
					for (let k = 0; k < damageRoll.terms[0].results.length; k++){
						if (damageType.explosive){ // Explosives do max damage on contact
							html += "<label class='fa fa-dice-six fa-2x' style='color: #d24502'></label>"
						}
						else {
							html += rollHelpers.dieToSmallIcon(damageRoll.terms[0].results[k].result)
						}
					}
				}
				adds = (+damageRoll._total - +damageRoll.results[0]);
			}
			else {
				adds = +damageRoll._total;
			}

			if (adds > 0){//Adds are positive
				html += "<label class='damage-dice-small-adds'>+</label><label class='damage-dice-small-adds'>" + adds + "</label>"
			}
			else if (adds < 0) {//Adds are negative
				html += "<label class='damage-dice-small-adds'>-</label><label class='damage-dice-small-adds'>" + Math.abs(adds) + "</label>"
			}

			let totalDamage;

			if (damageType.explosive) {
				totalDamage = (6 * (damageRoll.terms[0].results.length)) + adds;
			}
			else {
				totalDamage = damageRoll.total
			}

			if (totalDamage <= 0) { // If damage is 0 or less, account for minimum damage for each type
				if (damageType.type === "cr") { // Minimum crushing damage is 0
					totalDamage = 0;
				}
				else{ // Minimum damage for any other type is 1
					totalDamage = 1;
				}
			}

			html += "<label class='damage-dice-small-adds'> = " + totalDamage + "</label>";

			if (armourDivisor != 1){
				html += "<label class='damage-dice-small-adds'> (" + armourDivisor + ")</label>";
			}

			html += "</div>";

			// Store actualDamage so we can reference totalDamage later for knockback, etc.
			let actualDamage = totalDamage;

			let drLayers = Object.keys(location.dr)

			// Loop through the armour and take DR away from the damage dealt
			for (let d = 0; d < drLayers.length; d++){
				let dr = getProperty(location.dr[d], damageType.type)
				let effectiveDR = 0
				if (armourDivisor.toString().toLowerCase() == "ignores armour") { // If the armour divisor is set to ignore armour then effective DR is zero.
					effectiveDR = 0
				}
				else {
					effectiveDR = Math.floor(dr / armourDivisor); // Get the effective DR after armour divisor
				}

				let drStops = Math.min(actualDamage, effectiveDR); // Get the actual amount of damage stopped by the armour

				// Subtract the dr from the running damage total.
				actualDamage -= effectiveDR;

				// Check for blunt trauma
				if (damageType.bluntTraumaCapable && (location.dr.flexible || game.settings.get("gurps4e", "rigidBluntTrauma"))){ // The attack needs to be capable of blunt trauma and either the armour needs to be flexible or the setting to allow blunt trauma to rigid armour needs to be on.
					bluntTrauma += (drStops / damageType.bluntReq);
				}
				else if (!(location.dr.flexible || game.settings.get("gurps4e", "rigidBluntTrauma"))){ // The armour is not flexible, and the setting for rigid blunt trauma is off.
					bluntTrauma = 0; // The accumulating blunt trauma has hit a rigid layer and is reduced to zero.
				}
			}

			// Add a check for targets with no DR being hit with an attack that has an armour multiplier
			if (armourDivisor != "Ignores Armour") {
				if (actualDamage == totalDamage && armourDivisor < 1){
					actualDamage -= (1/armourDivisor);

					if (bluntTrauma == 0){ // Kinda hacky, but works for now. TODO - Make less suck
						bluntTrauma = (totalDamage / damageType.bluntReq) / damageReduction;
					}
				}
			}

			if (actualDamage > 0) { // Damage has penetrated DR.
				actualDamage = Math.floor(actualDamage);
				html += "<label>" + actualDamage + " damage gets through</label>";

				// If the attack is capable of knockback, do knockback
				if (damageType.type === "cr") { // Only cr attacks do knockback while penetrating DR
					let knockback = totalDamage / targetST
					if (damageType.doubleKnockback){
						knockback = knockback * 2;
					}
					totalKnockback += knockback;
				}

				let woundCap;
				let actualWounding;
				if (location.id.toLowerCase().includes("sublocation")){ // This is a sub location, check the parent for an HP value
					let subLocation = location.id.split(".")[0]
					let parentLocation = getProperty(target.data.data.bodyType.body, subLocation);
					if (damageType.woundModId.toString().toLowerCase().includes("dam")) { // Check for untyped damage
						actualWounding = Math.floor( (actualDamage * 1) / damageReduction );
					}
					else {
						actualWounding = Math.floor( (actualDamage * getProperty(location, damageType.woundModId)) / damageReduction );
					}
					if (parentLocation.hp){// Apply damage to the parent location if it tracks HP
						woundCap = parentLocation.hp.value; // Damage is capped to however much HP is left in the limb
						parentLocation.hp.value -= actualWounding;

						parentLocation.hp.value = Math.max(parentLocation.hp.value, -parentLocation.hp.max) // Value should be the higher of it's actual value and full negative HP.
						game.actors.get(flags.target).update({ ['data.bodyType.body.' + subLocation + ".hp.value"]: parentLocation.hp.value });
					}
					if (location.hp){ // Apply damage to the child location if it tracks HP
						location.hp.value -= actualWounding;

						location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
						game.actors.get(flags.target).update({ ['data.bodyType.body.' + location.id + ".hp.value"]: location.hp.value });
					}
				}
				else {
					if (damageType.woundModId.toString().toLowerCase().includes("dam")) { // Check for untyped damage
						actualWounding = Math.floor( (actualDamage * 1) / damageReduction );
					}
					else {
						actualWounding = Math.floor((actualDamage * getProperty(location, damageType.woundModId)) / damageReduction );
					}
					if (location.hp){ // Apply damage to the location if it tracks HP
						woundCap = location.hp.value; // Damage is capped to however much HP is left in the limb
						location.hp.value -= actualWounding
						location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
					}
				}

				if (typeof woundCap !== "undefined" && !( location.id.toLowerCase().includes("nose") || // Apply the wound cap, but only for locations that actually have one
					location.id.toLowerCase().includes("eye") ||
					location.id.toLowerCase().includes("spine") ||
					location.id.toLowerCase().includes("pelvis") ) ){

					if (woundCap < 0){
						woundCap = 0;
					}

					actualDamage = Math.min(woundCap, actualDamage);
				}

				// Multiply final damage by the locational wound modifier and add it to the running total
				if (damageType.type == "fat"){
					totalFatInj += Math.floor(actualDamage * location.personalWoundMultFat);
				}
				else {
					totalInjury += actualWounding;
				}
				html += "<div>The location takes " + actualWounding + " injury</div>";
			}
			else if (actualDamage <= 0) { // No damage has penetrated DR
				bluntTrauma = Math.floor(bluntTrauma); // Round down blunt trama in preparation for actually applying the damage.
				if (bluntTrauma > 0) {
					let bluntInjury = bluntTrauma;
					html += "<label>The armour stops all damage but the attack does " + bluntTrauma + " blunt trauma.</label>";


					let woundCap;
					if (location.id.toLowerCase().includes("sublocation")){ // This is a sub location, check the parent for an HP value
						let subLocation = location.id.split(".")[0]
						let parentLocation = getProperty(target.data.data.bodyType.body, subLocation);
						if (parentLocation.hp){ // Apply damage to the parent location if it tracks HP
							woundCap = parentLocation.hp.value; // Damage is capped to however much HP is left in the limb
							parentLocation.hp.value -= bluntInjury;
							parentLocation.hp.value = Math.max(parentLocation.hp.value, -parentLocation.hp.max) // Value should be the higher of it's actual value and full negative HP.
							game.actors.get(flags.target).update({ ['data.bodyType.body.' + subLocation + ".hp.value"]: parentLocation.hp.value });
						}
						if (location.hp){ // Apply damage to the child location if it tracks HP
							location.hp.value -= bluntInjury;
							location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
							game.actors.get(flags.target).update({ ['data.bodyType.body.' + location.id + ".hp.value"]: location.hp.value });
						}
					}
					else {
						if (location.hp){ // Apply damage to the location if it tracks HP
							woundCap = location.hp.value; // Damage is capped to however much HP is left in the limb
							location.hp.value -= bluntInjury;
							location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
						}
					}

					if (typeof woundCap !== "undefined" && !( location.id.toLowerCase().includes("nose") || // Apply the wound cap, but only for locations that actually have one
						location.id.toLowerCase().includes("eye") ||
						location.id.toLowerCase().includes("spine") ||
						location.id.toLowerCase().includes("pelvis") ) ){

						if (woundCap < 0){
							woundCap = 0;
						}

						bluntInjury = Math.min(woundCap, bluntInjury);
					}

					totalInjury += bluntInjury;


					html += "<div>The location takes " + bluntInjury + " injury</div>";
				}
				else {
					html += "<label>The armour stops all damage and the attack does no blunt trauma.</label>";
				}

				// If the attack is capable of knockback, do knockback
				if (damageType.type === "cut" || damageType.type === "cr") { // Cutting can also do knockback if it fails to penetrate
					let knockback = totalDamage / targetST
					if (damageType.doubleKnockback){
						knockback = knockback * 2;
					}
					totalKnockback += knockback;
				}
			}
		}

		totalKnockback = Math.floor(totalKnockback);
		if (totalKnockback > 0) { // Display total knockback
			html += "<hr><div>" + target.data.name + " is knocked back " + totalKnockback + " yards and must roll at -" + (totalKnockback - 1) + " to avoid falling down.</div>";
		}

		// TODO - Apply the actual damage as an actor update

		if (totalInjury > 0){
			let newHP = target.data.data.reserves.hp.value - Math.floor(totalInjury);
			game.actors.get(flags.target).update({ ['data.reserves.hp.value']: newHP });
		}
		if (totalFatInj > 0){
			let newFP = target.data.data.reserves.hp.value - Math.floor(totalFatInj);
			game.actors.get(flags.target).update({ ['data.reserves.fp.value']: newFP });
		}

		ChatMessage.create({ content: html, user: game.user._id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
	}

	extractDamageType(attack) {
		let damageType = {
			type: "",
			explosive: false,
			doubleKnockback: false,
			noWounding: false,
			doubleBluntTrauma: false,
			bluntTraumaCapable: false,
			bluntReq: 20,
			woundModId: "",
		}

		// Find the damage type. Start by doing pi in an order that will not cause it to find pi when really it's pi++
		if (attack.damageType.toLowerCase().includes("pi-")) {
			damageType.type = "pi-"
			damageType.bluntTraumaCapable = true;
			damageType.bluntReq = 10;
			damageType.woundModId = "personalWoundMultPim";
		}
		else if (attack.damageType.toLowerCase().includes("pi++")) {
			damageType.type = "pi++"
			damageType.bluntTraumaCapable = true;
			damageType.bluntReq = 10;
			damageType.woundModId = "personalWoundMultPipp";
		}
		else if (attack.damageType.toLowerCase().includes("pi+")) {
			damageType.type = "pi+"
			damageType.bluntTraumaCapable = true;
			damageType.bluntReq = 10;
			damageType.woundModId = "personalWoundMultPip";
		}
		else if (attack.damageType.toLowerCase().includes("pi")) {
			damageType.type = "pi"
			damageType.bluntTraumaCapable = true;
			damageType.bluntReq = 10;
			damageType.woundModId = "personalWoundMultPi";
		}
		else if (attack.damageType.toLowerCase().includes("imp")) {
			damageType.type = "imp"
			damageType.bluntTraumaCapable = true;
			damageType.bluntReq = 10;
			damageType.woundModId = "personalWoundMultImp";
		}
		else if (attack.damageType.toLowerCase().includes("burn")) {
			damageType.type = "burn"
			damageType.woundModId = "personalWoundMultBurn";
		}
		else if (attack.damageType.toLowerCase().includes("cor")) {
			damageType.type = "cor"
			damageType.woundModId = "personalWoundMultCor";
		}
		else if (attack.damageType.toLowerCase().includes("cr")) {
			damageType.type = "cr"
			damageType.bluntTraumaCapable = true;
			damageType.bluntReq = 5;
			damageType.woundModId = "personalWoundMultCr";
		}
		else if (attack.damageType.toLowerCase().includes("cut")) {
			damageType.type = "cut"
			damageType.bluntTraumaCapable = true;
			damageType.bluntReq = 10;
			damageType.woundModId = "personalWoundMultCut";
		}
		else if (attack.damageType.toLowerCase().includes("fat")) {
			damageType.type = "fat"
			damageType.woundModId = "personalWoundMultFat";
		}
		else if (attack.damageType.toLowerCase().includes("tox")) {
			damageType.type = "tox"
			damageType.woundModId = "personalWoundMultTox";
		}
		else if (attack.damageType.toLowerCase().includes("dam")) {
			damageType.type = "dam"
			damageType.woundModId = "personalWoundMultDam";
		}
		else { // Default to crushing
			damageType.type = "cr"
			damageType.bluntTraumaCapable = true;
			damageType.woundModId = "personalWoundMultCr";
		}

		// Special flags
		if (attack.damageType.toLowerCase().includes("ex")) {
			damageType.explosive = true;
		}
		if (attack.damageType.toLowerCase().includes("dbk")) {
			damageType.doubleKnockback = true;
		}
		if (attack.damageType.toLowerCase().includes("dbt")) {
			damageType.doubleBluntTrauma = true;
			damageType.bluntTraumaCapable = true;
		}
		if (attack.damageType.toLowerCase().includes("nw")) {
			damageType.noWounding = true;
		}

		if (damageType.doubleBluntTrauma){
			damageType.bluntReq = damageType.bluntReq / 2;
		}

		return damageType;
	}
}
