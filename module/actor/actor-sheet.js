import { rollHelpers } from '../../helpers/rollHelpers.js';
import { actorHelpers } from "../../helpers/actorHelpers.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class gurpsActorSheet extends ActorSheet {

	getData(){
		const context = super.getData();
		context.damageTypeOptions = CONFIG.DAMAGETYPES.dropdownChoices;
		context.bodyTypes = CONFIG.BODYTYPES.dropdownChoices;
		context.rpmDisplayThemes = this.getRPMDisplayThemes();
		context.ritualAdeptTimeOptions = this.getRitualAdeptTimeOptions();
		context.hikingTerrainMultipliers = this.getHikingTerrainMultipliers();
		context.hikingWeatherMultipliers = this.getHikingWeatherMultipliers();
		context.learningStyles = this.getLearningStyles();
		context.learningLanguageMultipliers = this.getLearningLanguageMultipliers();
		if (this.actor.type.toLowerCase() === "fullchar") {

		}
		else if (this.actor.type.toLowerCase() === "simple vehicle") {
			context.vehicleCraftTypes = CONFIG.VEHICLECRAFTTYPES.dropdownChoices;
			context.vehicleMethod = this.getVehicleDesignMethods();
			context.vehicleSTTypes = this.getVehicleSTTypes();
			context.vehicleMoveTypes = this.getVehicleMoveTypes();
			context.vehicleOccupancyCodes = this.getVehicleOccupancyCodes();
			context.vehicleDRMethods = this.getVehicleDRMethods();
			context.vehiclePropulsionMethods = this.getVehiclePropulsionMethods();
			context.vehicleAnimalLocations = this.getVehicleAnimalLocations();
			context.vehicleAnimalTypes = this.getVehicleAnimalTypes();
			context.vehicleMotiveTypes = this.getVehicleMotiveTypes();
			context.terrainQualities = this.getTerrainQualities();
		}
		return context;
	}

	getTerrainQualities() {
		let terrainQualities = {
			"rail": "Rail"
		}

		// Only non-railbound vehicles can select non-rail terrain types.
		if (this.actor.system.vehicle && this.actor.system.vehicle.land && !this.actor.system.vehicle.land.railBound) {
			terrainQualities.road = "Road";
			terrainQualities.good = "Good";
			terrainQualities.average = "Average";
			terrainQualities.bad = "Bad";
			terrainQualities.veryBad = "Very Bad";
		}

		return terrainQualities;
	}

	getVehicleMotiveTypes() {
		let types = {}

		if (this.actor.system.vehicle.craftType === "land") {
			types.wheel  = "Wheeled";
			types.rail   = "Railway";
			types.track  = "Tracked";
			types.skids  = "Skids or Runners";
			types.wTrack = "Wheels and Tracks";
			types.rTrack = "Skids and Tracks";
			types.skidsW = "Wheels and Skids";
			types.leg    = "Legs";
			types.immune = "Immune";
		}
		else if (this.actor.system.vehicle.craftType === "water") {
			types.wheel = "Paddlewheels";
			types.immune = "Immune";
		}
		else if (this.actor.system.vehicle.craftType === "air") {
			types.wing = "Wings";
			types.heli = "Helicopter Blades";
		}

		return types;
	}

	getVehicleAnimalTypes() {
		return {
			"equine"		:	"Equine - Horses, Donkeys, Mules.",
			"canine"		:	"Canine - Dogs",
			"feline"		:	"Feline - Cats",
			"ursine"		:	"Ursine - Bears",
			"rhinocerotidae":	"Rhinocerotidae - Rhinos",
			"elephantidae"	:	"Elephantidae - Elephants",
			"cetacean"		:	"Cetacean - Dolphins, Porpises, Whales",
			"selachimorphan":	"Selachimorphan - Sharks",
			"strigiformes"	:	"Strigiformes - Owls",
			"accipitridae"	:	"Accipitridae - Eagles",
		}
	}

	getVehicleAnimalLocations() {
		return {
			"draft"		: "Exterior, pulling the vehicle",
			"internal"	: "Interior, operating a conveyor or other mechanism."
		}
	}

	getVehiclePropulsionMethods() {
		return {
			"powered"	: "Powered",
			"unpowered"	: "Unpowered",
			"wind"		: "Sailing",
			"animals"	: "Animals",
		}
	}

	getVehicleDRMethods() {
		return {
			"single"	: "Single Value",
			"facing"	: "Facing",
			"singlePlus": "Single Plus Locations",
			"facingPlus": "Facing Plus Locations",
		}
	}

	getVehicleOccupancyCodes() {
		return {
			"" : "",
			"S": "S - Sealed",
			"P": "P - Pressure Support",
			"V": "V - Vacuum Support"
		}
	}

	getVehicleMoveTypes() {
		return {
			"": "",
			"*": "* - Road-bound",
			"‡": "‡ - Rail-bound",
		}
	}

	getVehicleSTTypes() {
		return {
			"": "",
			"†": "† - Unpowered"
		}
	}

	getVehicleDesignMethods() {
		return {
			"pick": "Pick & Modify",
			"custom": "Full Custom",
		}
	}

	getLearningLanguageMultipliers() {
		return {
			"0": "Fluent",
			"1": "Accented",
			"2": "Broken",
		}
	}

	getLearningStyles() {
		return {
			"1": "Normal Training (x1)",
			"0.5": "Self Study (x0.5)",
			"0.25": "On the job (x0.25)",
		}
	}

	getHikingWeatherMultipliers() {
		return {
			"1": "Fine",
			"0.5": "Rain",
			"0.50": "Ankle Deep Snow",
			"0.25": "Deeper Snow",
		}
	}

	getHikingTerrainMultipliers() {
		return {
			"1.25": "Good",
			"1": "Average",
			"0.5": "Bad",
			"0.2": "Very Bad",
		}
	}

	getRitualAdeptTimeOptions() {
		return {
			"0": "None",
			"1": "Level 1",
			"2": "Level 2",
		}
	}

	getRPMDisplayThemes() {
		return {
			"-1": "Show common name",
			"0": "Show common and sephirotic names",
			"1": "Show sephirotic name",
		}
	}

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["gurps4e", "sheet", "actor"],
			width: 850,
			height: 780,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
			dragDrop: [
				{
					dragSelector: '.items-list .item',
					dropSelector: null,
				},
				{
					dragSelector: '.rollable',
					dropSelector: null,
				}
				],
		});
	}

	_canDragStart(selector){
		if (selector === '.rollable') return true; // This item can always be dragged
		if (selector === '.items-list .item') return true; // This item can always be dragged
		return super._canDragStart(selector); // Any other item requires ownership to drag
	}

	_canDragDrop(selector){
		if (selector === '.rollable') return true; // This item can always be dragged
		if (selector === '.items-list .item') return true; // This item can always be dragged
		return super._canDragDrop(selector); // Any other item requires ownership to drag
	}

	_onDragStart(event) {
		super._onDragStart(event);
		if (event.dataTransfer.getData("text/plain") === "") { // It comes through blank if it's a .rollable
			let dragData = event.target.dataset // Get the data from the dataset
			event.dataTransfer.setData("text/plain", JSON.stringify(dragData)); // Set the data
		}
	}

	/** @override */
	get template() {
		const path = "systems/gurps4e/templates/actor";
		// Return a single sheet for all actor types.
		// return `${path}/actor-sheet.html`;
		// Alternatively, you could use the following return statement to do a
		// unique actor sheet by type, like `actor-sheet.html`.

		if (this.actor.type.toLowerCase() === "fullchar") {
			return `${path}/actor-sheet.html`;
		}
		else if (this.actor.type.toLowerCase() === "simple vehicle") {
			return `${path}/Simple Vehicle-sheet.html`;
		}
		else {
			return `${path}/${this.actor.type}-sheet.html`;
		}
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Update Inventory Item
		html.find('.item-edit').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		// Delete Inventory Item
		html.find('.item-delete').click(this._onDelete.bind(this));

		// Rollable checks.
		html.find('.rollable').click(this._onRoll.bind(this));

		// Accordion handlers
		//html.find('.accordion').click(this._onAccordionToggle.bind(this));
		html.find('.accordion').click(this._onAccordionToggle.bind(this));

		// Track changes to unspent points
		html.find('.unspentEntry').change(this._onUnspentPointsChange.bind(this));

		// Track changes to the RPM core skill
		html.find('.rpmCoreSkill').change(this._onRpmCoreSkillChange.bind(this));

		html.find('.makeLearningRoll').click(this._makeLearningRoll.bind(this));

		html.find('.question-container').click(this._showHint.bind(this));

		// For Simple Vehicles
		html.find('.baseVehicleSelect').change(this._onBaseVehicleSelectChange.bind(this));
	}

	/* -------------------------------------------- */

	_onBaseVehicleSelectChange(event) {
		this.actor.updateBaseVehicle(event)
	}

	_onDelete(event) {
		if (event.ctrlKey && event.shiftKey) { // If both control and shift were held when clicking the button
			this.deleteItem(event); // Go straight to the method to delete the item
		}
		else { // Otherwise, bring up the confirmation modal
			let confirmationModal = new Dialog({
				title: "Are you sure?",
				content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
				buttons: {
					delete: {
						icon: '<i class="fas fa-trash"></i>',
						label: "Delete",
						callback: () => {
							this.deleteItem(event);
						}
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: "Cancel",
						callback: () => {}
					},
				},
				default: "cancel"
			},{
				resizable: true,
				width: "250"
			})

			confirmationModal.render(true);
		}
	}

	deleteItem(event) {
		const li = $(event.currentTarget).parents(".item"); // Get the list item for the thing we just clicked
		const item = this.actor.items.get(li.data("itemId")); // Get the item by looking at the list item's id
		item.delete(); // Delete that item
		li.slideUp(200, () => this.render(false)); // Do an animation to make it smoothly remove the item from the UI
	}

	_showHint(event) {
		this.actor.showInfo(event.currentTarget.id);
	}
	async _makeLearningRoll() {
		rollHelpers.skillRoll(this.actor.system.info.learning.finalEffective, 0, this.actor.name + " makes a learning roll.", false).then( rollInfo => { // Make the roll

			let html = rollInfo.content;

			let hours = 150 + (rollInfo.margin * 15);

			if (rollInfo.crit) { // User got a crit
				if (rollInfo.success) { // It was a crit success
					html += "Breakthrough!";
					// By default, a crit on a learning roll sets your learning to 400 hours, but you get no benefit if you're already at or past that.
					// Instead, this logic adds 50 hours if you're at 350 or more. So 350 becomes 400 as usual, but everyone else gets a +50 hour bonus for critting.
					if (hours >= 350) {
						hours += 50;
					}
					else { // If the user wasn't anywhere close to 400 hours, still set it to 400.
						hours = 400;
					}
				}
				else { // It was a crit fail.
					html += "Overwork and collapse! Take 3d FP damage.";
				}
			}
			html += "</br>";

			hours += +this.actor.system.info.learning.extraHours; // Add back in the bonus hours.
			hours *= +this.actor.system.info.learning.style; // Apply the multiplier for learning style

			html += "You gain " + hours + " hours of training time to distribute among your skills.";

			ChatMessage.create({ content: html, user: game.user.id, type: rollInfo.type });
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

	_onUnspentPointsChange(event) {
		let unspent = event.target.value;
		this.actor.setTotalPoints(unspent);
	}

	_onRpmCoreSkillChange(event) {
		let skillName = event.target.value;
		this.actor.setRPMCoreSkill(skillName);
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();

		if (event.altKey || event.ctrlKey || event.shiftKey) { // If any modifier key were pressed.
			actorHelpers.computeRollFromEvent(event, 0); // Make the roll directly without bringing up the modal.
		}
		else { // Otherwise
			let modModal = new Dialog({ // Bring up a modal to allow them to input a modifier on the roll.
				title: "Modifier Dialog",
				content: "<input type='text' id='mod' name='mod' value='0'/>",
				buttons: {
					mod: {
						icon: '<i class="fas fa-check"></i>',
						label: "Apply Modifier",
						callback: (html) => {
							let mod = html.find('#mod').val()
							actorHelpers.computeRollFromEvent(event, mod)
						}
					},
					noMod: {
						icon: '<i class="fas fa-times"></i>',
						label: "No Modifier",
						callback: () => actorHelpers.computeRollFromEvent(event, 0)
					}
				},
				default: "mod"
			})
			modModal.render(true)
		}
	}
}
