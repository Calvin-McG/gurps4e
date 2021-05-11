import { rollHelpers } from '../../helpers/rollHelpers.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class gurpsActorSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["gurps4e", "sheet", "actor"],
			template: "systems/gurps4e/templates/actor/actor-sheet.html",
			width: 780,
			height: 780,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		const data = super.getData();
		data.dtypes = ["String", "Number", "Boolean"];

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

		// Accordion handlers
		//html.find('.accordion').click(this._onAccordionToggle.bind(this));
		html.find('.accordion').click(this._onAccordionToggle.bind(this));

		// Track changes to unspent points
		html.find('.unspentEntry').change(this._onUnspentPointsChange.bind(this));

		// Update body type
		html.find('.bodyType').change(this._onBodyTypeChange.bind(this))
	}

	/* -------------------------------------------- */
	_onBodyTypeChange(event) {
		event.preventDefault();
		let bodyType = event.target.value;

		if(bodyType == ""){
			this.actor.update({ "data.bodyType.-=body" : null}).then( actor => {// Remove the old body
			});
			return
		}

		let actorData = this.object.data.data

		let bodyObj = {};

		//Spoders and squids have a brain instead of a skull. Everyone else has a skull
		if (bodyType == "arachnoid" || bodyType == "octopod"){
			bodyObj.brain = this.addBrain(actorData.reserves.hp.max);
		}
		else {
			bodyObj.skull = this.addSkull(actorData.reserves.hp.max);
		}

		//Body parts that apply to all body types
		bodyObj.face = this.addFace(actorData.reserves.hp.max);

		//The following body parts are specific to said body types
		if (bodyType == "humanoid"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		if (bodyType == "wingedHumanoid"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "quadruped"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "wingedQuadruped"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "hexapod"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Upper Thorax Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Upper Thorax Arm");
			bodyObj.lowerArmLeft = this.addArm(actorData.reserves.hp.max, "Left Lower Thorax Arm");
			bodyObj.lowerArmRight = this.addArm(actorData.reserves.hp.max, "Right Lower Thorax Arm");
			bodyObj.upperchest = this.addChest(actorData.reserves.hp.max,"Upper Thorax");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Mid Thorax");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Lower Thorax");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Upper Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Upper Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandLeft = this.addExtremity(actorData.reserves.hp.max,"Left Lower Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandRight = this.addExtremity(actorData.reserves.hp.max,"Right Lower Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "wingedHexapod"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Upper Thorax Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Upper Thorax Arm");
			bodyObj.lowerArmLeft = this.addArm(actorData.reserves.hp.max, "Left Lower Thorax Arm");
			bodyObj.lowerArmRight = this.addArm(actorData.reserves.hp.max, "Right Lower Thorax Arm");
			bodyObj.upperchest = this.addChest(actorData.reserves.hp.max,"Upper Thorax");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Mid Thorax");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Lower Thorax");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Upper Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Upper Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandLeft = this.addExtremity(actorData.reserves.hp.max,"Left Lower Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandRight = this.addExtremity(actorData.reserves.hp.max,"Right Lower Thorax Hand", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "centaur"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Humanoid Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Humanoid Lower Chest");
			bodyObj.chestAnimal = this.addChest(actorData.reserves.hp.max,"Animal Chest");
			bodyObj.abdomen = this.addCentaurAbdomen(actorData.reserves.hp.max,"Humanoid Abdomen");
			bodyObj.animalAbdomen = this.addAbdomen(actorData.reserves.hp.max,"Animal Abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist", "Palm");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "avian"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.tail = this.addTail(actorData.reserves.hp.max, "Tail");
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "vermiform"){
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "lamia"){
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist", "Palm");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "wingedLamia"){
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist", "Palm");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "octopod"){
			bodyObj.upperChest = this.addInvertebrateChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addInvertebrateChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.tentacleLeft1 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 1");
			bodyObj.tentacleLeft2 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 2");
			bodyObj.tentacleLeft3 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 3");
			bodyObj.tentacleLeft4 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 4");
			bodyObj.tentacleRight1 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 1");
			bodyObj.tentacleRight2 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 2");
			bodyObj.tentacleRight3 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 3");
			bodyObj.tentacleRight4 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 4");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "cancroid"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Claw", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Claw", "Hand", "Wrist", "Palm");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "ichthyoid"){
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.tail = this.addTail(actorData.reserves.hp.max, "Tail");
			bodyObj.fin1 = this.addExtremity(actorData.reserves.hp.max,"Dorsal Fin", "Fin", "Joint");
			bodyObj.fin2 = this.addExtremity(actorData.reserves.hp.max,"Left Fin", "Fin", "Joint");
			bodyObj.fin3 = this.addExtremity(actorData.reserves.hp.max,"Right Fin", "Fin", "Joint");
		}
		else if (bodyType == "arachnoid"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.hindmidlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Mid Hind Leg");
			bodyObj.hindmidlegRight = this.addLeg(actorData.reserves.hp.max, "Right Mid Hind Leg");
			bodyObj.foremidlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Mid Foreleg");
			bodyObj.foremidlegRight = this.addLeg(actorData.reserves.hp.max, "Right Mid Foreleg");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.foremidFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Mid Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.foremidFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Mid Fore Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindmidFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Mid Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindmidFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Mid Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle", "Sole");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}

		this.actor.update({ "data.bodyType.-=body" : null}).then( actor => {// Remove the old body
			actor.update({ "data.bodyType.body" : bodyObj }) // Add the new body
		});
	}

	_onAccordionToggle(event) {
		event.preventDefault();
		let rows = document.getElementsByClassName("accordion-div-" + event.target.id.substr(22))
		for (let y = 0; y < rows.length; y++){
			if(rows[y].classList.contains("accordion-open")){//It's open, close it
				rows[y].classList.remove("accordion-open")
				rows[y].classList.add("accordion-closed")
			}
			else {//It's closed, open it
				rows[y].classList.add("accordion-open")
				rows[y].classList.remove("accordion-closed")
			}
		}
	}

	/**
	 * Handle changes to secondary attribute number fields.
	 * @param {Event} event	 The originating change event
	 * @private
	 */
	_onSecondaryAttributeChange(event) {
		event.preventDefault();
		let value = event.target.value;
		let name = event.target.name;
		this.actor.setConditions(value, name);
	}
	_onUnspentPointsChange(event) {
		let unspent = event.target.value;
		this.actor.setTotalPoints(unspent);
	}


	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event	 The originating click event
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
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();

		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: "<input type='text' id='mod' name='mod' value='0'/>",
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val()
						this.computeRoll(event, mod)
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: () => this.computeRoll(event, 0)
				}
			},
			default: "noMod",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		})
		modModal.render(true)
	}

	computeRoll(event, modifier){
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type === 'skill' || dataset.type === 'defense') {
			rollHelpers.skillRoll(dataset.level, modifier, dataset.label);
		}

		else if (dataset.type === 'damage') {
			let damageRoll = new Roll(dataset.level);
			damageRoll.roll();
			let html = "<div>" + dataset.label + "</div>";

			html += "<div>";

			if(damageRoll.terms[0].results.length){//Take the results of each roll and turn it into a die icon.
				for (let k = 0; k < damageRoll.terms[0].results.length; k++){
					html += rollHelpers.dieToIcon(damageRoll.terms[0].results[k].result)
				}
			}

			let adds = (+damageRoll._total - +damageRoll.results[0]);

			if (adds >= 0){//Adds are positive
				html += "<label class='damage-dice-adds'>+</label><label class='damage-dice-adds'>" + adds + "</label>"
			}
			else {//Adds are negative
				html += "<label class='damage-dice-adds'>-</label><label class='damage-dice-adds'>" + Math.abs(adds) + "</label>"
			}

			html += "</div>";

			html += "<div>Total Damage: " + damageRoll.total + "</div>";

			ChatMessage.create({ content: html, user: game.user._id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
		}

		else {
			console.log("Rollable element triggered with an unsupported data-type (supported types are 'skill', 'damage' and 'defense'");
		}
	}

	addSkull() {
		let part = {
			label: "Skull",
			personalDRBurn: 2,
			personalDRCor: 2,
			personalDRCr: 2,
			personalDRCut: 2,
			personalDRFat: 2,
			personalDRImp: 2,
			personalDRPi: 2,
			personalDRTox: 0,
			personalWoundMultBurn: 4,
			personalWoundMultCor: 4,
			personalWoundMultCr: 4,
			personalWoundMultCut: 4,
			personalWoundMultFat: 1,
			personalWoundMultImp: 4,
			personalWoundMultPim: 4,
			personalWoundMultPi: 4,
			personalWoundMultPip: 4,
			personalWoundMultPipp: 4,
			personalWoundMultTox: 1,
			personalDRHardening: 1,
			penalty: "-7/-5",
			flexible: false
		};
		return part;
	}

	addBrain() {
		let part = {
			label: "Brain",
			personalDRBurn: 0,
			personalDRCor: 0,
			personalDRCr: 0,
			personalDRCut: 0,
			personalDRFat: 0,
			personalDRImp: 0,
			personalDRPi: 0,
			personalDRTox: 0,
			personalWoundMultBurn: 4,
			personalWoundMultCor: 4,
			personalWoundMultCr: 4,
			personalWoundMultCut: 4,
			personalWoundMultFat: 1,
			personalWoundMultImp: 4,
			personalWoundMultPim: 4,
			personalWoundMultPi: 4,
			personalWoundMultPip: 4,
			personalWoundMultPipp: 4,
			personalWoundMultTox: 1,
			personalDRHardening: 1,
			penalty: "-7/-5",
			flexible: false
		};
		return part;
	}

	addFace(hp) {
		let partHp = Math.ceil(hp/4);
		if (partHp <= hp/4){//Make sure that part hp is greater than one quarter HP
			partHp += 1;
		}

		let eyeHp = Math.ceil(hp/10);
		if (eyeHp <= hp/10){//Make sure that part hp is greater than one tenth HP
			eyeHp += 1;
		}

		let part = {
			label: "Face",
			penalty: "-5/-7",
			subLocation: {
				jaw: {
					label: "Jaw",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1.5,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1.5,
					personalWoundMultPipp: 2,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-6",
					flexible: false
				},
				nose: {
					label: "Nose",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1.5,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 4,
					personalWoundMultPim: 4,
					personalWoundMultPi: 4,
					personalWoundMultPip: 4,
					personalWoundMultPipp: 4,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-7",
					hp: {
						max: partHp,
						state: "Fine",
						value: partHp
					},
					flexible: false
				},
				ears: {
					label: "Ears",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1.5,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1.5,
					personalWoundMultPipp: 2,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-7",
					hp: {
						max: partHp,
						state: "Fine",
						value: partHp
					},
					flexible: false
				},
				cheek: {
					label: "Cheek",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1.5,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1.5,
					personalWoundMultPipp: 2,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-6",
					flexible: false
				},
				eyes: {//Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
					label: "Eyes",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 4,
					personalWoundMultCor: 4,
					personalWoundMultCr: 4,
					personalWoundMultCut: 4,
					personalWoundMultFat: 4,
					personalWoundMultImp: 4,
					personalWoundMultPim: 4,
					personalWoundMultPi: 4,
					personalWoundMultPip: 4,
					personalWoundMultPipp: 4,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-9/-10",
					hp: {
						max: eyeHp,
						state: "Fine",
						value: eyeHp
					},
					flexible: false
				}
			}
		}
		return part;
	}

	addLeg(hp, label){
		let partHp = Math.ceil(hp/2);
		if (partHp <= hp/2){//Make sure that part hp is greater than one half HP
			partHp += 1;
		}

		let jointHp = Math.ceil(hp/3);
		if (jointHp <= hp/2){//Make sure that part hp is greater than one third HP
			jointHp += 1;
		}

		let part = {
			label: label,
			penalty: "-2",
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				shin: {
					label: "Shin",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-2",
					flexible: false
				},
				thigh: {
					label: "Thigh",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-2",
					flexible: false
				},
				insideThigh: {
					label: "Inside Thigh",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-8/-3",
					flexible: false
				},
				knee: {
					label: "Knee",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-5",
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
					flexible: false
				},
				backOfKnee: {
					label: "Back of Knee",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-8",
					flexible: false
				},
				artery: {
					label: "Thigh Artery",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 2,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2.5,
					personalWoundMultPim: 1,
					personalWoundMultPi: 1.5,
					personalWoundMultPip: 2,
					personalWoundMultPipp: 2.5,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-5",
					flexible: false
				}
			}
		}

		return part;
	}

	addTail(hp){
		let partHp = Math.ceil(hp/2);
		if (partHp <= hp/2){//Make sure that part hp is greater than one half HP
			partHp += 1;
		}

		let part = {
			label: "Tail",
			penalty: "-2",
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				forearm: {
					label: "Tail",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-3",
					flexible: false
				},
				shoulder: {
					label: "Shoulder",
					penalty: "-5",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 2,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2.5,
					personalWoundMultPim: 1,
					personalWoundMultPi: 1.5,
					personalWoundMultPip: 2,
					personalWoundMultPipp: 2.5,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				}
			}
		}

		return part;
	}

	addArm(hp, label){
		let partHp = Math.ceil(hp/2);
		if (partHp <= hp/2){//Make sure that part hp is greater than one half HP
			partHp += 1;
		}

		let jointHp = Math.ceil(hp/3);
		if (jointHp <= hp/2){//Make sure that part hp is greater than one third HP
			jointHp += 1;
		}

		let part = {
			label: label,
			penalty: "-2",
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				forearm: {
					label: "Forearm",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-2",
					flexible: false
				},
				upperArm: {
					label: "Upper Arm",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-2",
					flexible: false
				},
				elbow: {
					label: "Elbow",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-5",
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
					flexible: false
				},
				insideElbow: {
					label: "Inside Elbow",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "-8",
					flexible: false
				},
				shoulder: {
					label: "Shoulder",
					penalty: "-5",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 2,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2.5,
					personalWoundMultPim: 1,
					personalWoundMultPi: 1.5,
					personalWoundMultPip: 2,
					personalWoundMultPipp: 2.5,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				armpit: {
					label: "Armpit",
					penalty: "-8",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 2,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2.5,
					personalWoundMultPim: 1,
					personalWoundMultPi: 1.5,
					personalWoundMultPip: 2,
					personalWoundMultPipp: 2.5,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				}
			}
		}

		return part;
	}

	addChest(hp, label){
		let spineHp = hp + 1;

		let part = {
			label: label,
			penalty: "0",
			flexible: false,
			subLocation: {
				chest: {
					label: label,
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "0",
					flexible: false
				},
				vitals: {
					label: "Vitals",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 3,
					personalWoundMultPim: 3,
					personalWoundMultPi: 3,
					personalWoundMultPip: 3,
					personalWoundMultPipp: 3,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				spine: {
					label: "Spine",
					penalty: "-8",
					personalDRBurn: 3,
					personalDRCor: 3,
					personalDRCr: 3,
					personalDRCut: 3,
					personalDRFat: 3,
					personalDRImp: 3,
					personalDRPi: 3,
					personalDRTox: 3,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					hp: {
						max: spineHp,
						state: "Fine",
						value: spineHp
					},
					flexible: false
				}
			}
		}

		return part;
	}

	addInvertebrateChest(hp, label){
		let part = {
			label: label,
			penalty: "0",
			flexible: false,
			subLocation: {
				chest: {
					label: label,
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					penalty: "0",
					flexible: false
				},
				vitals: {
					label: "Vitals",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 3,
					personalWoundMultPim: 3,
					personalWoundMultPi: 3,
					personalWoundMultPip: 3,
					personalWoundMultPipp: 3,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				}
			}
		}

		return part;
	}

	addCentaurAbdomen(hp, label){ // This is the abdomen for the humanoid chest
		let pelvisHp = Math.ceil(hp/2);
		if (pelvisHp <= hp/2){ // Make sure that part hp is greater than one half HP
			pelvisHp += 1;
		}

		let part = {
			label: label,
			penalty: "-1",
			flexible: false,
			subLocation: {
				digestiveTract: {
					label: "Digestive Tract",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				vitals: {
					label: "Vitals",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 3,
					personalWoundMultPim: 3,
					personalWoundMultPi: 3,
					personalWoundMultPip: 3,
					personalWoundMultPipp: 3,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				pelvis: {
					label: "Pelvis",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					hp: {
						max: pelvisHp,
						state: "Fine",
						value: pelvisHp
					},
					flexible: false
				}
			}
		}

		return part;
	}

	addAbdomen(hp, label){
		let pelvisHp = Math.ceil(hp/2);
		if (pelvisHp <= hp/2){//Make sure that part hp is greater than one half HP
			pelvisHp += 1;
		}

		let part = {
			label: label,
			penalty: "-1",
			flexible: false,
			subLocation: {
				digestiveTract: {
					label: "Digestive Tract",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				vitals: {
					label: "Vitals",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 3,
					personalWoundMultPim: 3,
					personalWoundMultPi: 3,
					personalWoundMultPip: 3,
					personalWoundMultPipp: 3,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				pelvis: {
					label: "Pelvis",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					hp: {
						max: pelvisHp,
						state: "Fine",
						value: pelvisHp
					},
					flexible: false
				},
				groin: {
					label: "Groin",
					penalty: "-3",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				}
			}
		}

		return part;
	}

	addExtremity(hp, label, type, jointName, insideName){
		let partHp = Math.ceil(hp/3);
		if (partHp <= hp/3){//Make sure that part hp is greater than one third HP
			partHp += 1;
		}

		let jointHp = Math.ceil(hp/4);
		if (jointHp <= hp/4){//Make sure that part hp is greater than one quarter HP
			jointHp += 1;
		}

		let part = {
			label: label,
			penalty: "-4",
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				extremity: {
					label: type,
					penalty: "-4",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				extremityInterior: {
					label: insideName,
					penalty: "-8/-6",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				joint: {
					label: jointName,
					penalty: "-7",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 1.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 1,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1,
					personalWoundMultPipp: 1,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
					flexible: false
				}
			}
		}

		return part;
	}

	addNeck(){
		let part = {
			label: "Neck",
			penalty: "-5",
			flexible: false,
			subLocation: {
				neck: {
					label: "Neck",
					penalty: "-5",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 2,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2,
					personalWoundMultPim: 0.5,
					personalWoundMultPi: 1,
					personalWoundMultPip: 1.5,
					personalWoundMultPipp: 2,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				},
				vein: {
					label: "Vein",
					penalty: "-8",
					personalDRBurn: 0,
					personalDRCor: 0,
					personalDRCr: 0,
					personalDRCut: 0,
					personalDRFat: 0,
					personalDRImp: 0,
					personalDRPi: 0,
					personalDRTox: 0,
					personalWoundMultBurn: 1,
					personalWoundMultCor: 1,
					personalWoundMultCr: 1,
					personalWoundMultCut: 2.5,
					personalWoundMultFat: 1,
					personalWoundMultImp: 2.5,
					personalWoundMultPim: 1,
					personalWoundMultPi: 1.5,
					personalWoundMultPip: 2,
					personalWoundMultPipp: 2.5,
					personalWoundMultTox: 1,
					personalDRHardening: 1,
					flexible: false
				}
			}
		}

		return part;
	}
}
