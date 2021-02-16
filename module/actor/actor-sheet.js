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
			width: 565,
			height: 615,
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

		// Plus - Minus check
		html.find('.plus').click(this._onPlusMinus.bind(this));
		html.find('.minus').click(this._onPlusMinus.bind(this));

		// track and handle changes to HP and FP
		html.find('.sec-attr').change(this._onSecondaryAttributeChange.bind(this));

		// Accordion handlers
		//html.find('.accordion').click(this._onAccordionToggle.bind(this));
		html.find('.accordion').click(this._onAccordionToggle.bind(this));

		// Track changes to unspent points
		html.find('.unspentEntry').change(this._onUnspentPointsChange.bind(this));

		html.find('.bodyType').change(this._onBodyTypeChange.bind(this))
	}

	/* -------------------------------------------- */
	_onBodyTypeChange(event) {
		event.preventDefault();
		console.log(event.target.value);
		let bodyType = event.target.value;
		let actorData = this.object.data.data
		console.log(actorData)

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
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		if (bodyType == "wingedHumanoid"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "quadruped"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.forelegLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.forelegRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.foreFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle");
			bodyObj.foreFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "wingedQuadruped"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.forelegLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.forelegRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.foreFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle");
			bodyObj.foreFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "hexapod"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.forelegLeft = this.addArm(actorData.reserves.hp.max, "Left Upper Thorax Arm");
			bodyObj.forelegRight = this.addArm(actorData.reserves.hp.max, "Right Upper Thorax Arm");
			bodyObj.midlegLeft = this.addArm(actorData.reserves.hp.max, "Left Lower Thorax Arm");
			bodyObj.midlegRight = this.addArm(actorData.reserves.hp.max, "Right Lower Thorax Arm");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Upper Thorax");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Lower Thorax");
			bodyObj.forelegExtremityLeft = this.addExtremity(actorData.reserves.hp.max,"Left Upper Thorax Hand", "Hand", "Wrist");
			bodyObj.forelegExtremityRight = this.addExtremity(actorData.reserves.hp.max,"Right Upper Thorax Hand", "Hand", "Wrist");
			bodyObj.midlegExtremityLeft = this.addExtremity(actorData.reserves.hp.max,"Left Lower Thorax Hand", "Hand", "Wrist");
			bodyObj.midlegExtremityRight = this.addExtremity(actorData.reserves.hp.max,"Right Lower Thorax Hand", "Hand", "Wrist");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "wingedHexapod"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.forelegLeft = this.addArm(actorData.reserves.hp.max, "Left Upper Thorax Arm");
			bodyObj.forelegRight = this.addArm(actorData.reserves.hp.max, "Right Upper Thorax Arm");
			bodyObj.midlegLeft = this.addArm(actorData.reserves.hp.max, "Left Lower Thorax Arm");
			bodyObj.midlegRight = this.addArm(actorData.reserves.hp.max, "Right Lower Thorax Arm");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Upper Thorax");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Lower Thorax");
			bodyObj.forelegExtremityLeft = this.addExtremity(actorData.reserves.hp.max,"Left Upper Thorax Hand", "Hand", "Wrist");
			bodyObj.forelegExtremityRight = this.addExtremity(actorData.reserves.hp.max,"Right Upper Thorax Hand", "Hand", "Wrist");
			bodyObj.midlegExtremityLeft = this.addExtremity(actorData.reserves.hp.max,"Left Lower Thorax Hand", "Hand", "Wrist");
			bodyObj.midlegExtremityRight = this.addExtremity(actorData.reserves.hp.max,"Right Lower Thorax Hand", "Hand", "Wrist");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "centaur"){
			bodyObj.hindlegLeft = this.addLeg(actorData.reserves.hp.max, "Left Hind Leg");
			bodyObj.hindlegRight = this.addLeg(actorData.reserves.hp.max, "Right Hind Leg");
			bodyObj.forelegLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.forelegRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Humanoid Chest");
			bodyObj.chestAnimal = this.addChest(actorData.reserves.hp.max,"Animal Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Humanoid Abdomen");
			bodyObj.foreFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle");
			bodyObj.foreFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "avian"){
			bodyObj.legLeft = this.addLeg(actorData.reserves.hp.max, "Left Leg");
			bodyObj.legRight = this.addLeg(actorData.reserves.hp.max, "Right Leg");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist");
			bodyObj.footLeft = this.addExtremity(actorData.reserves.hp.max,"Left Foot", "Foot", "Ankle");
			bodyObj.footRight = this.addExtremity(actorData.reserves.hp.max,"Right Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.tail = this.addArm(actorData.reserves.hp.max, "Tail");
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "vermiform"){
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "lamia"){
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "wingedLamia"){
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hand", "Hand", "Wrist");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Hand", "Hand", "Wrist");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.wingLeft = this.addArm(actorData.reserves.hp.max, "Left Wing");
			bodyObj.wingRight = this.addArm(actorData.reserves.hp.max, "Right Wing");
		}
		else if (bodyType == "octopod"){
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
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
			bodyObj.forelegLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.forelegRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.armLeft = this.addArm(actorData.reserves.hp.max, "Left Arm");
			bodyObj.armRight = this.addArm(actorData.reserves.hp.max, "Right Arm");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.foreFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle");
			bodyObj.foreFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle");
			bodyObj.handLeft = this.addExtremity(actorData.reserves.hp.max,"Left Claw", "Hand", "Wrist");
			bodyObj.handRight = this.addExtremity(actorData.reserves.hp.max,"Right Claw", "Hand", "Wrist");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}
		else if (bodyType == "ichthyoid"){
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
			bodyObj.tail = this.addArm(actorData.reserves.hp.max, "Tail");
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
			bodyObj.forelegLeft = this.addLeg(actorData.reserves.hp.max, "Left Foreleg");
			bodyObj.forelegRight = this.addLeg(actorData.reserves.hp.max, "Right Foreleg");
			bodyObj.chest = this.addChest(actorData.reserves.hp.max,"Chest");
			bodyObj.abdomen = this.addAbdomen(actorData.reserves.hp.max,"Abdomen");
			bodyObj.foreFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Fore Foot", "Foot", "Ankle");
			bodyObj.foreFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Fore Foot", "Foot", "Ankle");
			bodyObj.foremidFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Mid Fore Foot", "Foot", "Ankle");
			bodyObj.foremidFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Mid Fore Foot", "Foot", "Ankle");
			bodyObj.hindmidFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Mid Hind Foot", "Foot", "Ankle");
			bodyObj.hindmidFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Mid Hind Foot", "Foot", "Ankle");
			bodyObj.hindFootLeft = this.addExtremity(actorData.reserves.hp.max,"Left Hind Foot", "Foot", "Ankle");
			bodyObj.hindFootRight = this.addExtremity(actorData.reserves.hp.max,"Right Hind Foot", "Foot", "Ankle");
			bodyObj.neck = this.addNeck(actorData.reserves.hp.max);
		}

		this.actor.update({ "data.bodyType.body" : bodyObj });
		console.log("Updating body")
		console.log(bodyObj)
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
	 * Handle the behaviour of the plus and minus 'buttons' related to a label.
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	_onPlusMinus(event) {
		event.preventDefault();
		let field = event.currentTarget.firstElementChild;
		let fieldName = field.name;
		let change = parseInt(field.value);
		var value;
		var fieldValue;

		switch (fieldName) {
			case "gmod":
				fieldValue = "data.gmod.value";
				value = change + this.actor.data.data.gmod.value;
				break;
			case "dmod":
				fieldValue = "data.dmod.value";
				value = change + this.actor.data.data.dmod.value;
				break;
			case "fp":
				fieldValue = "data.reserves.fp.value";
				value = change + this.actor.data.data.reserves.fp.value;
				this.actor.setConditions(value, fieldValue);
				break;
			case "hp":
				fieldValue = "data.reserves.hp.value";
				value = change + this.actor.data.data.reserves.hp.value;
				this.actor.setConditions(value, fieldValue);
				break;
			default:
				fieldValue = "data.attacks." + fieldName + ".seed";
				let damages = this.actor.data.data.attacks;

				for (let [id, damage] of Object.entries(damages)) {
					if (fieldName == id) {
						value = ((value = damage.seed + change) == 0) ? 1 : value;
						break;
					}
				}
		}
		this.actor.update({ [fieldValue]: value });
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
			personalDRHardeningBurn: 0,
			personalDRHardeningCor: 0,
			personalDRHardeningCr: 0,
			personalDRHardeningCut: 0,
			personalDRHardeningFat: 0,
			personalDRHardeningImp: 0,
			personalDRHardeningPi: 0,
			personalDRHardeningTox: 0
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
			personalDRHardeningBurn: 0,
			personalDRHardeningCor: 0,
			personalDRHardeningCr: 0,
			personalDRHardeningCut: 0,
			personalDRHardeningFat: 0,
			personalDRHardeningImp: 0,
			personalDRHardeningPi: 0,
			personalDRHardeningTox: 0
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: partHp,
						state: "Fine",
						value: partHp
					}
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: partHp,
						state: "Fine",
						value: partHp
					}
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: eyeHp,
						state: "Fine",
						value: eyeHp
					}
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
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
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
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
				},
				shoulder: {
					label: "Shoulder",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				}
			}
		}

		return part;
	}

	addChest(hp, label){
		let spineHp = hp + 1;

		let part = {
			label: label,
			subLocation: {
				chest: {
					label: "Chest",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				},
				vitals: {
					label: "Vitals",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				},
				spine: {
					label: "Spine",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: spineHp,
						state: "Fine",
						value: spineHp
					},
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
			subLocation: {
				digestiveTract: {
					label: "Digestive Tract",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				},
				vitals: {
					label: "Vitals",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				},
				pelvis: {
					label: "Pelvis",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: pelvisHp,
						state: "Fine",
						value: pelvisHp
					},
				},
				groin: {
					label: "Groin",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				}
			}
		}

		return part;
	}

	addExtremity(hp, label, type, jointName){
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
			hp: {
				max: partHp,
				state: "Fine",
				value: partHp
			},
			subLocation: {
				extremity: {
					label: type,
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				},
				joint: {
					label: jointName,
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0,
					hp: {
						max: jointHp,
						state: "Fine",
						value: jointHp
					},
				}
			}
		}

		return part;
	}

	addNeck(){
		let part = {
			label: "Neck",
			subLocation: {
				neck: {
					label: "Neck",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				},
				vein: {
					label: "Vein",
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
					personalDRHardeningBurn: 0,
					personalDRHardeningCor: 0,
					personalDRHardeningCr: 0,
					personalDRHardeningCut: 0,
					personalDRHardeningFat: 0,
					personalDRHardeningImp: 0,
					personalDRHardeningPi: 0,
					personalDRHardeningTox: 0
				}
			}
		}

		return part;
	}
}
