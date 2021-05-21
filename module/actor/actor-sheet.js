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
			bodyObj.brain = this.addBrain(actorData.reserves.hp.max, "brain");
		}
		else {
			bodyObj.skull = this.addSkull(actorData.reserves.hp.max, "skull");
		}

		//Body parts that apply to all body types
		bodyObj.face = this.addFace(actorData.reserves.hp.max, "face");
		bodyObj.neck = this.addNeck(actorData.reserves.hp.max, "neck");

		//The following body parts are specific to said body types
		if (bodyType == "humanoid"){
			bodyObj.legLeft 	= this.addLeg(actorData.reserves.hp.max, 		"Left Leg"		,"legLeft");
			bodyObj.legRight 	= this.addLeg(actorData.reserves.hp.max, 		"Right Leg"	,"legRight");
			bodyObj.armLeft 	= this.addArm(actorData.reserves.hp.max, 		"Left Arm"		,"armLeft");
			bodyObj.armRight 	= this.addArm(actorData.reserves.hp.max, 		"Right Arm"	,"armRight");
			bodyObj.upperChest 	= this.addChest(actorData.reserves.hp.max,		"Upper Chest"	,"upperChest");
			bodyObj.lowerChest 	= this.addChest(actorData.reserves.hp.max,		"Lower Chest"	,"lowerChest");
			bodyObj.abdomen 	= this.addAbdomen(actorData.reserves.hp.max,	"Abdomen"		,"abdomen");
			bodyObj.handLeft 	= this.addExtremity(actorData.reserves.hp.max,	"Left Hand"	,"handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight 	= this.addExtremity(actorData.reserves.hp.max,	"Right Hand"	,"handRight", "Hand", "Wrist", "Palm");
			bodyObj.footLeft 	= this.addExtremity(actorData.reserves.hp.max,	"Left Foot"	,"footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight 	= this.addExtremity(actorData.reserves.hp.max,	"Right Foot"	,"footRight", "Foot", "Ankle", "Sole");

		}
		if (bodyType == "wingedHumanoid"){
			bodyObj.legLeft 	= this.addLeg(actorData.reserves.hp.max, 		"Left Leg"		,"legLeft");
			bodyObj.legRight 	= this.addLeg(actorData.reserves.hp.max, 		"Right Leg"	,"legRight");
			bodyObj.armLeft 	= this.addArm(actorData.reserves.hp.max, 		"Left Arm"		,"armLeft");
			bodyObj.armRight 	= this.addArm(actorData.reserves.hp.max, 		"Right Arm"	,"armRight");
			bodyObj.upperChest 	= this.addChest(actorData.reserves.hp.max,		"Upper Chest"	,"upperChest");
			bodyObj.lowerChest 	= this.addChest(actorData.reserves.hp.max,		"Lower Chest"	,"lowerChest");
			bodyObj.abdomen 	= this.addAbdomen(actorData.reserves.hp.max,	"Abdomen"		,"abdomen");
			bodyObj.handLeft 	= this.addExtremity(actorData.reserves.hp.max,	"Left Hand"	,"handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight 	= this.addExtremity(actorData.reserves.hp.max,	"Right Hand"	,"handRight", "Hand", "Wrist", "Palm");
			bodyObj.footLeft 	= this.addExtremity(actorData.reserves.hp.max,	"Left Foot"	,"footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight 	= this.addExtremity(actorData.reserves.hp.max,	"Right Foot"	,"footRight", "Foot", "Ankle", "Sole");
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing", "wingLeft");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing", "wingRight");
		}
		else if (bodyType == "quadruped"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg", "hindlegLeft");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg", "hindlegRight");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg", "legLeft");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg", "legRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
		}
		else if (bodyType == "wingedQuadruped"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg", "hindlegLeft");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg", "hindlegRight");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg", "legLeft");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg", "legRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing", "wingLeft");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing", "wingRight");
		}
		else if (bodyType == "hexapod"){
			bodyObj.legLeft 	= this.addLeg(actorData.reserves.hp.max, 		"Left Leg"		,"legLeft");
			bodyObj.legRight 	= this.addLeg(actorData.reserves.hp.max, 		"Right Leg"	,"legRight");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Upper Thorax Arm", "armLeft");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Upper Thorax Arm", "armRight");
			bodyObj.lowerArmLeft = this.addArm(actorData.reserves.hp.max, "Left Lower Thorax Arm", "lowerArmLeft");
			bodyObj.lowerArmRight = this.addArm(actorData.reserves.hp.max, "Right Lower Thorax Arm", "lowerArmRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Thorax", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Mid Thorax", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Lower Thorax", "abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Upper Thorax Hand", "handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Upper Thorax Hand", "handRight", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandLeft = this.addExtremity(actorData.reserves.hp.max,"Left Lower Thorax Hand", "lowerHandLeft", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandRight = this.addExtremity(actorData.reserves.hp.max,"Right Lower Thorax Hand", "lowerHandRight", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "footRight", "Foot", "Ankle", "Sole");
		}
		else if (bodyType == "wingedHexapod"){
			bodyObj.legLeft 	= this.addLeg(actorData.reserves.hp.max, 		"Left Leg"		,"legLeft");
			bodyObj.legRight 	= this.addLeg(actorData.reserves.hp.max, 		"Right Leg"	,"legRight");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Upper Thorax Arm", "armLeft");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Upper Thorax Arm", "armRight");
			bodyObj.lowerArmLeft = this.addArm(actorData.reserves.hp.max, "Left Lower Thorax Arm", "lowerArmLeft");
			bodyObj.lowerArmRight = this.addArm(actorData.reserves.hp.max, "Right Lower Thorax Arm", "lowerArmRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Thorax", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Mid Thorax", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Lower Thorax", "abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Upper Thorax Hand", "handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Upper Thorax Hand", "handRight", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandLeft = this.addExtremity(actorData.reserves.hp.max,"Left Lower Thorax Hand", "lowerHandLeft", "Hand", "Wrist", "Palm");
			bodyObj.lowerHandRight = this.addExtremity(actorData.reserves.hp.max,"Right Lower Thorax Hand", "lowerHandRight", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "footRight", "Foot", "Ankle", "Sole");
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing", "wingLeft");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing", "wingRight");
		}
		else if (bodyType == "centaur"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg", "hindlegLeft");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg", "hindlegRight");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg", "legLeft");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg", "legRight");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm", "armLeft");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm", "armRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Humanoid Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Humanoid Lower Chest", "lowerChest");
			bodyObj.chestAnimal = this.addChest(actorData.reserves.hp.max,"Animal Chest", "chestAnimal");
			bodyObj.abdomen = this.addCentaurAbdomen(actorData.reserves.hp.max,"Humanoid Abdomen", "abdomen");
			bodyObj.animalAbdomen = this.addAbdomen(actorData.reserves.hp.max,"Animal Abdomen", "animalAbdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
		}
		else if (bodyType == "avian"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg", "legLeft");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg", "legRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest","lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen","abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "footRight", "Foot", "Ankle", "Sole");
			bodyObj.tail = this.addTail(actorData.reserves.hp.max, "tail");
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing", "wingLeft");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing", "wingRight");
		}
		else if (bodyType == "vermiform"){
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max, "upperChest","Upper Chest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max, "lowerChest","Lower Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max, "abdomen","Abdomen");
		}
		else if (bodyType == "lamia"){
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm", "armLeft");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm", "armRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.tail = this.addTail(actorData.reserves.hp.max, "tail");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
		}
		else if (bodyType == "wingedLamia"){
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm", "armLeft");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm", "armRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.tail = this.addTail(actorData.reserves.hp.max, "tail");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing", "wingLeft");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing", "wingRight");
		}
		else if (bodyType == "octopod"){
			bodyObj.upperChest = this.addInvertebrateChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addInvertebrateChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.tentacleLeft1 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 1", "tentacleLeft1");
			bodyObj.tentacleLeft2 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 2", "tentacleLeft2");
			bodyObj.tentacleLeft3 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 3", "tentacleLeft3");
			bodyObj.tentacleLeft4 = this.addArm(actorData.reserves.hp.max, "Left Tentacle 4", "tentacleLeft4");
			bodyObj.tentacleRight1 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 1", "tentacleRight1");
			bodyObj.tentacleRight2 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 2", "tentacleRight2");
			bodyObj.tentacleRight3 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 3", "tentacleRight3");
			bodyObj.tentacleRight4 = this.addArm(actorData.reserves.hp.max, "Right Tentacle 4", "tentacleRight4");
		}
		else if (bodyType == "cancroid"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg", "hindlegLeft");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg", "hindlegRight");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg", "legLeft");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg", "legRight");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm", "armLeft");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm", "armRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Claw", "handLeft", "Hand", "Wrist", "Palm");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Claw", "handRight", "Hand", "Wrist", "Palm");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
		}
		else if (bodyType == "ichthyoid"){
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.tail = this.addTail(actorData.reserves.hp.max, "tail");
			bodyObj.fin1 = this.addExtremity(actorData.reserves.hp.max,"Dorsal Fin", "fin1", "Fin", "Joint");
			bodyObj.fin2 = this.addExtremity(actorData.reserves.hp.max,"Left Fin", "fin2", "Fin", "Joint");
			bodyObj.fin3 = this.addExtremity(actorData.reserves.hp.max,"Right Fin", "fin3", "Fin", "Joint");
		}
		else if (bodyType == "arachnoid"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg", "hindlegLeft");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg", "hindlegRight");
			bodyObj.hindmidlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Mid Hind Leg", "hindmidlegLeft");
			bodyObj.hindmidlegRight = this.addLeg(actorData.reserves.hp.max, "Right Mid Hind Leg", "hindmidlegRight");
			bodyObj.foremidlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Mid Foreleg", "foremidlegLeft");
			bodyObj.foremidlegRight = this.addLeg(actorData.reserves.hp.max, "Right Mid Foreleg", "foremidlegRight");
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg", "legLeft");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg", "legRight");
			bodyObj.upperChest = this.addChest(actorData.reserves.hp.max,"Upper Chest", "upperChest");
			bodyObj.lowerChest = this.addChest(actorData.reserves.hp.max,"Lower Chest", "lowerChest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen", "abdomen");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
			bodyObj.foremidFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Mid Fore Foot", "foremidFootLeft", "Foot", "Ankle", "Sole");
			bodyObj.foremidFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Mid Fore Foot", "foremidFootRight", "Foot", "Ankle", "Sole");
			bodyObj.hindmidFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Mid Hind Foot", "hindmidFootLeft", "Foot", "Ankle", "Sole");
			bodyObj.hindmidFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Mid Hind Foot", "hindmidFootRight", "Foot", "Ankle", "Sole");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
		}

		let bodyParts = Object.keys(bodyObj);
		let totalWeight = 0;

		for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
			let part = getProperty(bodyObj, bodyParts[i])
			if (typeof part.weight != "undefined"){
				totalWeight += part.weight;
			}
			else {
				console.error(this.actor.data.name + " needs to refresh their body type");
			}
		}

		this.actor.update({ "data.bodyType.totalWeight" : totalWeight});

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
			let adds = 0;

			html += "<div>";
			if(damageRoll.terms[0].results){
				if(damageRoll.terms[0].results.length){//Take the results of each roll and turn it into a die icon.
					for (let k = 0; k < damageRoll.terms[0].results.length; k++){
						html += rollHelpers.dieToIcon(damageRoll.terms[0].results[k].result)
					}
				}
				adds = (+damageRoll._total - +damageRoll.results[0]);
			}
			else {
				adds = +damageRoll._total;
			}

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

	addSkull(id) {
		let part = {
			label: "Skull",
			id: id,
			drBurn: 2,
			drCor: 2,
			drCr: 2,
			drCut: 2,
			drFat: 2,
			drImp: 2,
			drPi: 2,
			drTox: "",
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
			drHardening: 1,
			penaltyFront: -7,
			penaltyBack: -5,
			weight: 0.01851851852,
			flexible: false
		};
		return part;
	}

	addBrain(id) {
		let part = {
			label: "Brain",
			id: id,
			drBurn: "",
			drCor: "",
			drCr: "",
			drCut: "",
			drFat: "",
			drImp: "",
			drPi: "",
			drTox: "",
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
			drHardening: 1,
			penaltyFront: -7,
			penaltyBack: -5,
			weight: 0.01851851852,
			flexible: false
		};
		return part;
	}

	addFace(hp, id) {
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
			id: id,
			penaltyFront: -5,
			penaltyBack: -7,
			weight: 0.02777777778,
			totalSubWeight: 1,
			subLocation: {
				jaw: {
					label: "Jaw",
					id: id + ".subLocation.jaw",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -6,
					penaltyBack: -6,
					weight: 1/6,
					flexible: false
				},
				nose: {
					label: "Nose",
					id: id + ".subLocation.nose",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -7,
					penaltyBack: -7,
					weight: 1/6,
					hp: {
						max: partHp,
						state: "Fine",
						value: partHp
					},
					flexible: false
				},
				ears: {
					label: "Ears",
					id: id + ".subLocation.ears",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -7,
					penaltyBack: -7,
					weight: 1/6,
					hp: {
						max: partHp,
						state: "Fine",
						value: partHp
					},
					flexible: false
				},
				cheek: {
					label: "Cheek",
					id: id + ".subLocation.cheek",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -6,
					penaltyBack: -6,
					weight: 2/6,
					flexible: false
				},
				eyes: {//Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
					label: "Eyes",
					id: id + ".subLocation.eyes",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -9,
					penaltyBack: -9,
					weight: 1/6,
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

	addLeg(hp, label, id){
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
			id: id,
			penaltyFront: -2,
			penaltyBack: -2,
			weight: 0.1412037037,
			totalSubWeight: 1,
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				shin: {
					label: "Shin",
					id: id + ".subLocation.shin",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -4,
					penaltyBack: -4,
					weight: 3/6,
					flexible: false
				},
				thigh: {
					label: "Thigh",
					id: id + ".subLocation.thigh",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -5,
					penaltyBack: -5,
					weight: 1/6,
					flexible: false
				},
				insideThigh: {
					label: "Inside Thigh",
					id: id + ".subLocation.insideThigh",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -8,
					penaltyBack: -3,
					weight: 0,
					flexible: false
				},
				knee: {
					label: "Knee",
					id: id + ".subLocation.knee",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -5,
					penaltyBack: -5,
					weight: 1/6,
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
					flexible: false
				},
				backOfKnee: {
					label: "Back of Knee",
					id: id + ".subLocation.backOfKnee",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -8,
					penaltyBack: -8,
					weight: 0,
					flexible: false
				},
				artery: {
					label: "Thigh Artery",
					id: id + ".subLocation.artery",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -5,
					penaltyBack: -5,
					weight: 1/6,
					flexible: false
				}
			}
		}

		return part;
	}

	addTail(hp, id){
		let partHp = Math.ceil(hp/2);
		if (partHp <= hp/2){//Make sure that part hp is greater than one half HP
			partHp += 1;
		}

		let part = {
			label: "Tail",
			id: id,
			penaltyFront: -2,
			penaltyBack: -2,
			weight: 0.106481481,
			totalSubWeight: 1,
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				forearm: {
					label: "Tail",
					id: id + ".subLocation.forearm",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -3,
					penaltyBack: -3,
					weight: 5/6,
					flexible: false
				},
				shoulder: {
					label: "Shoulder",
					id: id + ".subLocation.shoulder",
					penaltyFront: -5,
					penaltyBack: -5,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
					flexible: false
				}
			}
		}

		return part;
	}

	addArm(hp, label, id){
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
			id: id,
			penaltyFront: -2,
			penaltyBack: -2,
			weight: 0.106481481,
			totalSubWeight: 1,
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				forearm: {
					label: "Forearm",
					id: id + ".subLocation.forearm",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -4,
					penaltyBack: -4,
					weight: 3/6,
					flexible: false
				},
				upperArm: {
					label: "Upper Arm",
					id: id + ".subLocation.upperArm",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -5,
					penaltyBack: -5,
					weight: 1/6,
					flexible: false
				},
				elbow: {
					label: "Elbow",
					id: id + ".subLocation.elbow",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -5,
					penaltyBack: -5,
					weight: 1/6,
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
					flexible: false
				},
				insideElbow: {
					label: "Inside Elbow",
					id: id + ".subLocation.insideElbow",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -8,
					penaltyBack: -8,
					weight: 0,
					flexible: false
				},
				shoulder: {
					label: "Shoulder",
					id: id + ".subLocation.shoulder",
					penaltyFront: -5,
					penaltyBack: -5,
					weight: 1/6,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					flexible: false
				},
				armpit: {
					label: "Armpit",
					id: id + ".subLocation.armpit",
					penaltyFront: -8,
					penaltyBack: -8,
					weight: 0,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					flexible: false
				}
			}
		}

		return part;
	}

	addChest(hp, label, id){
		let spineHp = hp + 1;

		let part = {
			label: label,
			id: id,
			penaltyFront: -1,
			penaltyBack: -1,
			weight: 0.12037037,
			totalSubWeight: 1,
			flexible: false,
			subLocation: {
				chest: {
					label: label,
					id: id + ".subLocation.chest",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -1,
					penaltyBack: -1,
					weight: 5/6,
					flexible: false
				},
				vitals: {
					label: "Vitals",
					id: id + ".subLocation.vitals",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
					flexible: false
				},
				spine: {
					label: "Spine",
					id: id + ".subLocation.spine",
					penaltyFront: -8,
					penaltyBack: -8,
					drBurn: 3,
					drCor: 3,
					drCr: 3,
					drCut: 3,
					drFat: 3,
					drImp: 3,
					drPi: 3,
					drTox: 3,
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
					drHardening: 1,
					weight: 0,
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

	addInvertebrateChest(hp, label, id){
		let part = {
			label: label,
			id: id,
			penaltyFront: -1,
			penaltyBack: -1,
			weight: 0.12037037,
			totalSubWeight: 1,
			flexible: false,
			subLocation: {
				chest: {
					label: label,
					id: id + ".subLocation.chest",
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					penaltyFront: -1,
					penaltyBack: -1,
					weight: 5/6,
					flexible: false
				},
				vitals: {
					label: "Vitals",
					id: id + ".subLocation.vitals",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
					flexible: false
				}
			}
		}

		return part;
	}

	addCentaurAbdomen(hp, label, id){ // This is the abdomen for the humanoid chest
		let pelvisHp = Math.ceil(hp/2);
		if (pelvisHp <= hp/2){ // Make sure that part hp is greater than one half HP
			pelvisHp += 1;
		}

		let part = {
			label: label,
			id: id,
			penaltyFront: -1,
			penaltyBack: -1,
			weight: 0.125,
			totalSubWeight: 5/6,
			flexible: false,
			subLocation: {
				digestiveTract: {
					label: "Digestive Tract",
					id: id + ".subLocation.digestiveTract",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 3/6,
					flexible: false
				},
				vitals: {
					label: "Vitals",
					id: id + ".subLocation.vitals",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
					flexible: false
				},
				pelvis: {
					label: "Pelvis",
					id: id + ".subLocation.pelvis",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
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

	addAbdomen(hp, label, id){
		let pelvisHp = Math.ceil(hp/2);
		if (pelvisHp <= hp/2){//Make sure that part hp is greater than one half HP
			pelvisHp += 1;
		}

		let part = {
			label: label,
			id: id,
			penaltyFront: -1,
			penaltyBack: -1,
			weight: 0.125,
			totalSubWeight: 1,
			flexible: false,
			subLocation: {
				digestiveTract: {
					label: "Digestive Tract",
					id: id + ".subLocation.digestiveTract",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 3/6,
					flexible: false
				},
				vitals: {
					label: "Vitals",
					id: id + ".subLocation.vitals",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
					flexible: false
				},
				pelvis: {
					label: "Pelvis",
					id: id + ".subLocation.pelvis",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					hp: {
						max: pelvisHp,
						state: "Fine",
						value: pelvisHp
					},
					weight: 1/6,
					flexible: false
				},
				groin: {
					label: "Groin",
					id: id + ".subLocation.groin",
					penaltyFront: -3,
					penaltyBack: -3,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
					flexible: false
				}
			}
		}

		return part;
	}

	addExtremity(hp, label, id, type, jointName, insideName){
		let partHp = Math.ceil(hp/3);
		let weight;
		if (partHp <= hp/3){ // Make sure that part hp is greater than one third HP
			partHp += 1;
		}

		let jointHp = Math.ceil(hp/4);
		if (jointHp <= hp/4){ // Make sure that part hp is greater than one quarter HP
			jointHp += 1;
		}

		// Hands and feet have different hit percentages
		if (label.toLowerCase().includes("hand")){
			weight = 0.023148148;
		}
		else if (label.toLowerCase().includes("foot")){
			weight = 0.013888889;
		}
		else {
			weight = 0.018518519; // The average of foot and hand weights
		}

		let part = {
			label: label,
			id: id,
			penaltyFront: -4,
			penaltyBack: -4,
			weight: weight,
			totalSubWeight: 1,
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			flexible: false,
			subLocation: {
				extremity: {
					label: type,
					id: id + ".subLocation.extremity",
					penaltyFront: -4,
					penaltyBack: -4,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 5/6,
					flexible: false
				},
				extremityInterior: {
					label: insideName,
					id: id + ".subLocation.extremityInterior",
					penaltyFront: -8,
					penaltyBack: -8,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 0,
					flexible: false
				},
				joint: {
					label: jointName,
					id: id + ".subLocation.joint",
					penaltyFront: -7,
					penaltyBack: -7,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
					weight: 1/6,
					flexible: false
				}
			}
		}

		return part;
	}

	addNeck(id){
		let part = {
			label: "Neck",
			id: id,
			penaltyFront: -5,
			penaltyBack: -5,
			weight: 0.018518519,
			totalSubWeight: 1,
			flexible: false,
			subLocation: {
				neck: {
					label: "Neck",
					id: id + ".subLocation.neck",
					penaltyFront: -5,
					penaltyBack: -5,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 5/6,
					flexible: false
				},
				vein: {
					label: "Vein",
					id: id + ".subLocation.vein",
					penaltyFront: -8,
					penaltyBack: -8,
					drBurn: "",
					drCor: "",
					drCr: "",
					drCut: "",
					drFat: "",
					drImp: "",
					drPi: "",
					drTox: "",
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
					drHardening: 1,
					weight: 1/6,
					flexible: false
				}
			}
		}

		return part;
	}
}
