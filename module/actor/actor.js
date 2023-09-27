import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { distanceHelpers } from '../../helpers/distanceHelpers.js';
import { generalHelpers } from '../../helpers/generalHelpers.js';
import { rollHelpers } from '../../helpers/rollHelpers.js';
import { actorHelpers } from "../../helpers/actorHelpers.js";
import { skillHelpers } from "../../helpers/skillHelpers.js";
import { postureHelpers } from "../../helpers/postureHelpers.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class gurpsActor extends Actor {
	//
	// /**
	//  * Override the create() function to provide additional GURPS4e functionality.
	//  *
	//  * This overridden create() function adds flags to an actor upon creation.
	//  *
	//  * @param {Object} data				Barebones actor data which this function adds onto.
	//  * @param {Object} options		 (Unused) Additional options which customize the creation workflow.
	//  *
	//  */
	// static async create(data, options) {
	// 	super.create(data, options); // Follow through the the rest of the Actor creation process upstream
	// }

	/**
	 * Augment the basic actor data with additional dynamic system.
	 */
	prepareData() {
		super.prepareData();

		this.checkUndefined();

		//Total up spent and remaining points
		this.recalcAtrPoints();
		this.recalcTraitPoints();
		this.recalcSkillPoints();
		this.recalcSpellPoints()
		this.recalcPathPoints();
		this.recalcPointTotals();

		//Convert spent points into their effective values
		this.recalcAtrValues();

		// Update Body Type
		this.bodyTypeUpdate();

		// Update magic related stuff
		this.updateMagic();

		// Sort out the player's senses.
		this.recalcSenses();

		// Set up categories for each type
		this.setupCategories();

		// Store the character's armour values for convenient use later.
		this.storeArmour()

		this.saveLocationalTotalDR()

		// Set status, etc, for reserves
		this.bodyReserves()

		// Update part specific HP
		this.partHP();

		// Recalculate encumbrance values, along with effective dodge and move. Do this before info but after everything else so move and dodge is correct.
		this.recalcEncValues();

		// Store stuff for the info tab. Do this after Enc so we can reference it for swimming, running, etc.
		this.storeInfo();
	}

	checkUndefined(){
		if (typeof this.system.senses == 'undefined'){ // If senses do not yet exist, create a basic object for them
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

			this.system.senses = senses;
		}

		if (typeof this.system.encumbrance === 'undefined') {
			this.system.encumbrance = {
				none : {
					title: "None"
				},
				light : {
					title: "Light"
				},
				medium : {
					title: "Medium"
				},
				heavy : {
					title: "Heavy"
				},
				xheavy : {
					title: "X-Heavy"
				},
				current: {
					ref: "none",
					title: "None",
					mult: 1,
					fpCost: 1
				}
			}
		}
		else if (typeof this.system.encumbrance.current === 'undefined') {
			this.system.encumbrance.current = {
				ref: "none",
				title: "None",
				mult: 1,
				fpCost: 1
			}
		}

		if (typeof this.system.info === 'undefined') { // If info does not yet exist, create a basic object for them
			this.system.info = {
				jump: {
					show: false
				},
				breath: {
					show: false
				},
				runSprint: {
					show: false
				},
				swim: {
					show: false
				},
				throw: {
					show: false
				},
				hiking: {
					show: false,
					terrain: "1",
					weather: "none",
					ice: false,
					hours: 16,
					fpRecovery: 10,
				}
			}
		}
		else {
			if (typeof this.system.info.fall === 'undefined') {
				this.system.info.fall = {
					show: false
				}
			}
			if (typeof this.system.info.jump === 'undefined') {
				this.system.info.jump = {
					show: false
				}
			}
			if (typeof this.system.info.breath === 'undefined') {
				this.system.info.breath = {
					show: false
				}
			}
			if (typeof this.system.info.runSprint === 'undefined') {
				this.system.info.runSprint = {
					show: false
				}
			}
			if (typeof this.system.info.throw === 'undefined') {
				this.system.info.throw = {
					show: false,
					specificWeight: 0
				}
			}
			if (typeof this.system.info.swim === 'undefined') {
				this.system.info.swim = {
					show: false
				}
			}
			if (typeof this.system.info.hiking === 'undefined') {
				this.system.info.hiking = {
					show: false,
					terrain: "1",
					weather: "none",
					ice: false,
					hours: 16,
					fpRecovery: 10,
				}
			}
		}

		if (this.system.bio.sm) {
			this.system.bio.sm.value = Math.floor(this.system.bio.sm.value); // Remove decimal places from SM.
		}

		if (this.system.bio.height.value) {
			if (this.system.bio.height.value <= 0) {
				this.system.bio.height.value = 1;
			}
		}

		if (this.system.bio.weight.value) {
			if (this.system.bio.weight.value <= 0) {
				this.system.bio.weight.value = 1;
			}
		}

		if (typeof this.system.bio.money !== 'number') { // If money is not a number, set to zero. Covers undefined, null, strings, etc.
			this.system.bio.money = 0
		}

		if (this.system.senses.vis) {
			this.system.senses.vis = {
				id: "vis",
				abbr: "Vision",
				value: 	this.system.senses.vis.value,
				mod: 	this.system.senses.vis.mod
			}
		}
		if (this.system.senses.hear) {
			this.system.senses.hear = {
				id: "hear",
				abbr: "Hearing",
				value: 	this.system.senses.hear.value,
				mod: 	this.system.senses.hear.mod
			}
		}
		if (this.system.senses.smell) {
			this.system.senses.smell = {
				id: "smell",
				abbr: "Smell & Taste",
				value: 	this.system.senses.smell.value,
				mod: 	this.system.senses.smell.mod
			}
		}
		if (this.system.senses.touch) {
			this.system.senses.touch = {
				id: "touch",
				abbr: "Touch",
				value: 	this.system.senses.touch.value,
				mod: 	this.system.senses.touch.mod
			}
		}
		if (this.system.senses.extra1) {
			this.system.senses.extra1 = {
				id: "extra1",
				abbr: 	this.system.senses.extra1.abbr ?	this.system.senses.extra1.abbr : "",
				value: 	this.system.senses.extra1.value ?	this.system.senses.extra1.value : 0,
				mod: 	this.system.senses.extra1.mod ?		this.system.senses.extra1.mod : 0
			}
		}
		if (this.system.senses.extra2) {
			this.system.senses.extra2 = {
				id: "extra2",
				abbr:	this.system.senses.extra2.abbr ? 	this.system.senses.extra2.abbr : "",
				value:	this.system.senses.extra2.value ? 	this.system.senses.extra2.value : 0,
				mod:	this.system.senses.extra2.mod ? 		this.system.senses.extra2.mod : 0
			}
		}

		// Check for enhanced defences
		if (typeof this.system.enhanced == 'undefined'){ // If enhanced defences do not yet exist, create a basic object for them
			let enhanced = {
				parry: 0,
				block: 0,
				dodge: 0
			}

			this.system.enhanced = enhanced;
		}
		else { // Check each individual value and set it to 0 if it's blank or undefined.
			if (typeof this.system.enhanced.parry == 'undefined' || this.system.enhanced.parry === "") {
				this.system.enhanced.parry = 0;
			}
			if (typeof this.system.enhanced.block == 'undefined' || this.system.enhanced.block === "") {
				this.system.enhanced.block = 0;
			}
			if (typeof this.system.enhanced.dodge == 'undefined' || this.system.enhanced.dodge === "") {
				this.system.enhanced.dodge = 0;
			}
		}

		// Check for vision cones
		if (typeof this.system.vision == 'undefined') {
			let vision = {
				front: 180,
				side: 240
			}
			this.system.vision = vision;
		}
		else {
			if (typeof this.system.vision.front == 'undefined' || this.system.vision.front === "") {
				this.system.vision.front = 180;
			}
			if (typeof this.system.vision.side == 'undefined' || this.system.vision.side === "") {
				this.system.vision.side = 240;
			}
		}

		// Check for flags
		if (typeof this.system.flag == 'undefined') {
			let flag = {
				combatReflexes: false,
				showSenses: false
			}
			this.system.flag = flag;
		}
		else {
			if (typeof this.system.flag.combatReflexes == 'undefined' || this.system.flag.combatReflexes === "") {
				this.system.flag.combatReflexes = false;
			}
			if (typeof this.system.flag.showSenses == 'undefined' || this.system.flag.showSenses === "") {
				this.system.flag.showSenses = false;
			}
		}

		// Check for injury tolerance block
		if (typeof this.system.injuryTolerances == 'undefined') { // If there is not an injury tolerance block, add one.
			this.system.injuryTolerances = {
				damageReduction: 1,
				diffuse: false,
				highPainThreshold: false,
				homogenous: false,
				lowPainThreshold: false,
				noBlood: false,
				supernaturalDurability: false,
				unbreakableBones: false,
				unliving: false
			}
		}
		else { // If there is an injury tolerance block, make sure damage reduction exists.
			if (typeof this.system.injuryTolerances.damageReduction == 'undefined' ||
				this.system.injuryTolerances.damageReduction == "" ||
				this.system.injuryTolerances.damageReduction == null) {
				this.system.injuryTolerances.damageReduction = 1;
			}
		}

		// Check for body mods block
		if (typeof this.system.bodyModifiers == 'undefined') { // If there is not a body modifier block, add one.
			this.system.bodyModifiers = {
				bornBiter: 0,
				noBrain: false,
				noEyes: false,
				noHead: false,
				noNeck: false,
				noVitals: false,
				myrmidonHead: false
			}
		}
		else { // If there is an injury tolerance block, make sure bornBiter exists.
			if (typeof this.system.bodyModifiers.bornBiter == 'undefined' || this.system.bodyModifiers.bornBiter == "" || this.system.bodyModifiers.bornBiter == null) { // bornBiter is blank, null, or undefined
				this.system.bodyModifiers.bornBiter = 0; // Set to default value
			}
			else { // bornBiter is not blank, null, or undefined
				if (this.system.bodyModifiers.bornBiter < 0) { // bornBiter is less than zero (an invalid value)
					this.system.bodyModifiers.bornBiter = 0; // Set it to zero
				}
			}
		}

		if (this.system.bio.sm.value == "" || this.system.bio.sm.value == null || typeof this.system.bio.sm.value == "undefined") {
			this.system.bio.sm.value = 0;
		}

		if (this.system.bio.tl.value === "" || this.system.bio.tl.value == null || typeof this.system.bio.tl.value == "undefined" || this.system.bio.tl.value > 12 || this.system.bio.tl.value < 0) {
			this.system.bio.tl.value = game.settings.get("gurps4e", "campaignTL");
		}
		else {
			this.system.bio.tl.value = Math.floor(this.system.bio.tl.value);
		}

		if (typeof this.system.rpm === 'undefined') {
			this.system.rpm = {
				"magery": 0,
				"naturalCaster": 0,
				"er": 0,
				"ritualAdeptConnection": false,
				"ritualAdeptSpace": false,
				"ritualAdeptTime": 0,
				"coreSkill": "Thaumatology",
				"higherPurpose1Name": "",
				"higherPurpose2Name": "",
				"higherPurpose3Name": "",
				"higherPurpose1Level": 0,
				"higherPurpose2Level": 0,
				"higherPurpose3Level": 0,
				"showThematic": "0", // -1 is no thematic, just name. 0 is both. 1 is thematic only
				"showStats": true,
				"showPaths": true,
				"showGrimoire": true,
				"path": {
					"body": {
						"name": "Body",
						"theme": "Yesod",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"chance": {
						"name": "Chance",
						"theme": "Hod",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"crossroads": {
						"name": "Crossroads",
						"theme": "Tiphareth",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"energy": {
						"name": "Energy",
						"theme": "Greburah",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"magic": {
						"name": "Magic",
						"theme": "Chesed",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"matter": {
						"name": "Matter",
						"theme": "Netzach",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"mind": {
						"name": "Mind",
						"theme": "Chokmah",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"spirit": {
						"name": "Spirit",
						"theme": "Binah",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					},
					"undead": {
						"name": "Undead",
						"theme": "Malkuth",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
							{
								"skill": "Thaumatology",
								"mod": -6
							}
						],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
					}
				}
			}
		}
		else if (typeof this.system.rpm.path === 'undefined') { // If they've got an rpm object, but no paths.
			this.system.rpm.path = {
				"body": {
					"name": "Body",
						"theme": "Yesod",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"chance": {
					"name": "Chance",
						"theme": "Hod",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"crossroads": {
					"name": "Crossroads",
						"theme": "Tiphareth",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"energy": {
					"name": "Energy",
						"theme": "Greburah",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"magic": {
					"name": "Magic",
						"theme": "Chesed",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"matter": {
					"name": "Matter",
						"theme": "Netzach",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"mind": {
					"name": "Mind",
						"theme": "Chokmah",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"spirit": {
					"name": "Spirit",
						"theme": "Binah",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				},
				"undead": {
					"name": "Undead",
						"theme": "Malkuth",
						"baseAttr": "IQ",
						"category": "skill",
						"defaults": [
						{
							"skill": "Thaumatology",
							"mod": -6
						}
					],
						"difficulty": "VH",
						"level": 0,
						"mod": 0,
						"points": 0
				}
			}
		}
	}

	bodyTypeUpdate(){
		if (this.system){
			if (this.system.bodyType){
				let bodyType = this.system.bodyType.name;
				let actorData = this.system;
				let bodyObj = {};

				if(bodyType == ""){ // If the body is blank, default to humanoid
					bodyType = "humanoid";
				}

				// Spoders and squids have a brain instead of a skull. Everyone else has a skull
				if (bodyType == "arachnoid" || bodyType == "octopod"){
					if (!(this.system.bodyModifiers.noHead || this.system.bodyModifiers.noBrain)) { // The user has set neither noHead nor noBrain
						bodyObj.brain = actorHelpers.addBrain(actorData,"brain");
					}
				}
				else {
					if (!this.system.bodyModifiers.noHead) { // User has not set noHead
						bodyObj.skull = actorHelpers.addSkull(actorData,"skull", !this.system.bodyModifiers.noBrain);
					}
				}

				let eyeL = true;
				let eyeR = true;
				if (this.system.bodyModifiers.noEyeL) { // The user has set noLeft eye
					eyeL = false;
				}
				if (this.system.bodyModifiers.noEyeR) { // The user has set noEyes
					eyeR = false;
				}
				if (this.system.bodyModifiers.noEyes) { // The user has set noEyes
					eyeL = false;
					eyeR = false;
				}

				if (!this.system.bodyModifiers.noHead) { // The user has not set noHead
					if (this.system.bodyModifiers.myrmidonHead) { // The user has set the myrmidon flag, which removes the ears and enlarges the eyes
						bodyObj.face = actorHelpers.addFace(actorData, "face", false, eyeL, eyeR, this.system.bodyModifiers.bornBiter, true);
					}
					else { // The user is using a standard head
						bodyObj.face = actorHelpers.addFace(actorData, "face", true, eyeL, eyeR, this.system.bodyModifiers.bornBiter, false);
					}
				}

				if (!this.system.bodyModifiers.noNeck) { // The user has not set noNeck
					bodyObj.neck = actorHelpers.addNeck(actorData,"neck");
				}

				let vitals = true;
				if (this.system.bodyModifiers.noVitals) { // The user has no vitals
					vitals = false;
				}

				//The following body parts are specific to said body types
				if (bodyType == "humanoid"){
					bodyObj.legLeft 	= actorHelpers.addLeg(		actorData, 	"Left Leg"		,"legLeft");
					bodyObj.legRight 	= actorHelpers.addLeg(		actorData, 	"Right Leg"	,"legRight");
					bodyObj.armLeft 	= actorHelpers.addArm(		actorData, 	"Left Arm"		,"armLeft");
					bodyObj.armRight 	= actorHelpers.addArm(		actorData, 	"Right Arm"	,"armRight");
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,	"Upper Chest"	,"upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,	"Lower Chest"	,"lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,	"Abdomen"		,"abdomen", vitals);
					bodyObj.handLeft 	= actorHelpers.addExtremity(actorData,	"Left Hand"	,"handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 	= actorHelpers.addExtremity(actorData,	"Right Hand"	,"handRight", "Hand", "Wrist", "Palm");
					bodyObj.footLeft 	= actorHelpers.addExtremity(actorData,	"Left Foot"	,"footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 	= actorHelpers.addExtremity(actorData,	"Right Foot"	,"footRight", "Foot", "Ankle", "Sole");
				}
				if (bodyType == "wingedHumanoid"){
					bodyObj.legLeft 	= actorHelpers.addLeg(		actorData, 		"Left Leg"		,"legLeft");
					bodyObj.legRight 	= actorHelpers.addLeg(		actorData, 		"Right Leg"	,"legRight");
					bodyObj.armLeft 	= actorHelpers.addArm(		actorData, 		"Left Arm"		,"armLeft");
					bodyObj.armRight 	= actorHelpers.addArm(		actorData, 		"Right Arm"	,"armRight");
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,		"Upper Chest"	,"upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,		"Lower Chest"	,"lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,	"Abdomen"		,"abdomen", vitals);
					bodyObj.handLeft 	= actorHelpers.addExtremity(actorData,	"Left Hand"	,"handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 	= actorHelpers.addExtremity(actorData,	"Right Hand"	,"handRight", "Hand", "Wrist", "Palm");
					bodyObj.footLeft 	= actorHelpers.addExtremity(actorData,	"Left Foot"	,"footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 	= actorHelpers.addExtremity(actorData,	"Right Foot"	,"footRight", "Foot", "Ankle", "Sole");
					bodyObj.wingLeft 	= actorHelpers.addArm(		actorData, "Left Wing", "wingLeft");
					bodyObj.wingRight 	= actorHelpers.addArm(		actorData, "Right Wing", "wingRight");
				}
				else if (bodyType == "quadruped"){
					bodyObj.hindlegLeft 	= actorHelpers.addLeg(		actorData, "Left Hind Leg", "hindlegLeft");
					bodyObj.hindlegRight 	= actorHelpers.addLeg(		actorData, "Right Hind Leg", "hindlegRight");
					bodyObj.legLeft 		= actorHelpers.addLeg(		actorData, "Left Foreleg", "legLeft");
					bodyObj.legRight 		= actorHelpers.addLeg(		actorData, "Right Foreleg", "legRight");
					bodyObj.upperChest 		= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 		= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 		= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.footLeft 		= actorHelpers.addExtremity(actorData,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 		= actorHelpers.addExtremity(actorData,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
					bodyObj.hindFootLeft 	= actorHelpers.addExtremity(actorData,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
					bodyObj.hindFootRight 	= actorHelpers.addExtremity(actorData,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
				}
				else if (bodyType == "wingedQuadruped"){
					bodyObj.hindlegLeft 	= actorHelpers.addLeg(		actorData, "Left Hind Leg", "hindlegLeft");
					bodyObj.hindlegRight 	= actorHelpers.addLeg(		actorData, "Right Hind Leg", "hindlegRight");
					bodyObj.legLeft 		= actorHelpers.addLeg(		actorData, "Left Foreleg", "legLeft");
					bodyObj.legRight 		= actorHelpers.addLeg(		actorData, "Right Foreleg", "legRight");
					bodyObj.upperChest 		= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 		= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 		= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.footLeft 		= actorHelpers.addExtremity(actorData,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 		= actorHelpers.addExtremity(actorData,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
					bodyObj.hindFootLeft 	= actorHelpers.addExtremity(actorData,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
					bodyObj.hindFootRight 	= actorHelpers.addExtremity(actorData,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
					bodyObj.wingLeft 		= actorHelpers.addArm(		actorData, "Left Wing", "wingLeft");
					bodyObj.wingRight 		= actorHelpers.addArm(		actorData, "Right Wing", "wingRight");
				}
				else if (bodyType == "hexapod"){
					bodyObj.legLeft 		= actorHelpers.addLeg(		actorData, 		"Left Leg"		,"legLeft");
					bodyObj.legRight 		= actorHelpers.addLeg(		actorData, 		"Right Leg"	,"legRight");
					bodyObj.armLeft 		= actorHelpers.addArm(		actorData, "Left Upper Thorax Arm", "armLeft");
					bodyObj.armRight 		= actorHelpers.addArm(		actorData, "Right Upper Thorax Arm", "armRight");
					bodyObj.lowerArmLeft 	= actorHelpers.addArm(		actorData, "Left Lower Thorax Arm", "lowerArmLeft");
					bodyObj.lowerArmRight 	= actorHelpers.addArm(		actorData, "Right Lower Thorax Arm", "lowerArmRight");
					bodyObj.upperChest 		= actorHelpers.addChest(	actorData,"Upper Thorax", "upperChest", vitals);
					bodyObj.lowerChest 		= actorHelpers.addChest(	actorData,"Mid Thorax", "lowerChest", vitals);
					bodyObj.abdomen 		= actorHelpers.addAbdomen(	actorData,"Lower Thorax", "abdomen", vitals);
					bodyObj.handLeft 		= actorHelpers.addExtremity(actorData,"Left Upper Thorax Hand", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 		= actorHelpers.addExtremity(actorData,"Right Upper Thorax Hand", "handRight", "Hand", "Wrist", "Palm");
					bodyObj.lowerHandLeft 	= actorHelpers.addExtremity(actorData,"Left Lower Thorax Hand", "lowerHandLeft", "Hand", "Wrist", "Palm");
					bodyObj.lowerHandRight 	= actorHelpers.addExtremity(actorData,"Right Lower Thorax Hand", "lowerHandRight", "Hand", "Wrist", "Palm");
					bodyObj.footLeft 		= actorHelpers.addExtremity(actorData,"Left Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 		= actorHelpers.addExtremity(actorData,"Right Foot", "footRight", "Foot", "Ankle", "Sole");
				}
				else if (bodyType == "wingedHexapod"){
					bodyObj.legLeft 		= actorHelpers.addLeg(		actorData, 		"Left Leg"		,"legLeft");
					bodyObj.legRight 		= actorHelpers.addLeg(		actorData, 		"Right Leg"	,"legRight");
					bodyObj.armLeft 		= actorHelpers.addArm(		actorData, "Left Upper Thorax Arm", "armLeft");
					bodyObj.armRight 		= actorHelpers.addArm(		actorData, "Right Upper Thorax Arm", "armRight");
					bodyObj.lowerArmLeft 	= actorHelpers.addArm(		actorData, "Left Lower Thorax Arm", "lowerArmLeft");
					bodyObj.lowerArmRight 	= actorHelpers.addArm(		actorData, "Right Lower Thorax Arm", "lowerArmRight");
					bodyObj.upperChest 		= actorHelpers.addChest(	actorData,"Upper Thorax", "upperChest", vitals);
					bodyObj.lowerChest 		= actorHelpers.addChest(	actorData,"Mid Thorax", "lowerChest", vitals);
					bodyObj.abdomen 		= actorHelpers.addAbdomen(	actorData,"Lower Thorax", "abdomen", vitals);
					bodyObj.handLeft 		= actorHelpers.addExtremity(actorData,"Left Upper Thorax Hand", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 		= actorHelpers.addExtremity(actorData,"Right Upper Thorax Hand", "handRight", "Hand", "Wrist", "Palm");
					bodyObj.lowerHandLeft 	= actorHelpers.addExtremity(actorData,"Left Lower Thorax Hand", "lowerHandLeft", "Hand", "Wrist", "Palm");
					bodyObj.lowerHandRight 	= actorHelpers.addExtremity(actorData,"Right Lower Thorax Hand", "lowerHandRight", "Hand", "Wrist", "Palm");
					bodyObj.footLeft 		= actorHelpers.addExtremity(actorData,"Left Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 		= actorHelpers.addExtremity(actorData,"Right Foot", "footRight", "Foot", "Ankle", "Sole");
					bodyObj.wingLeft 		= actorHelpers.addArm(		actorData, "Left Wing", "wingLeft");
					bodyObj.wingRight 		= actorHelpers.addArm(		actorData, "Right Wing", "wingRight");
				}
				else if (bodyType == "centaur"){
					bodyObj.hindlegLeft 	= actorHelpers.addLeg(				actorData, "Left Hind Leg", "hindlegLeft");
					bodyObj.hindlegRight 	= actorHelpers.addLeg(				actorData, "Right Hind Leg", "hindlegRight");
					bodyObj.legLeft 		= actorHelpers.addLeg(				actorData, "Left Foreleg", "legLeft");
					bodyObj.legRight 		= actorHelpers.addLeg(				actorData, "Right Foreleg", "legRight");
					bodyObj.armLeft 		= actorHelpers.addArm(				actorData, "Left Arm", "armLeft");
					bodyObj.armRight 		= actorHelpers.addArm(				actorData, "Right Arm", "armRight");
					bodyObj.upperChest 		= actorHelpers.addChest(			actorData,"Humanoid Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 		= actorHelpers.addChest(			actorData,"Humanoid Lower Chest", "lowerChest", vitals);
					bodyObj.chestAnimal 	= actorHelpers.addChest(			actorData,"Animal Chest", "chestAnimal", vitals);
					bodyObj.abdomen 		= actorHelpers.addCentaurAbdomen(	actorData,"Humanoid Abdomen", "abdomen", vitals);
					bodyObj.animalAbdomen 	= actorHelpers.addAbdomen(			actorData,"Animal Abdomen", "animalAbdomen", vitals);
					bodyObj.footLeft 		= actorHelpers.addExtremity(		actorData,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 		= actorHelpers.addExtremity(		actorData,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
					bodyObj.handLeft 		= actorHelpers.addExtremity(		actorData,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 		= actorHelpers.addExtremity(		actorData,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
					bodyObj.hindFootLeft 	= actorHelpers.addExtremity(		actorData,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
					bodyObj.hindFootRight 	= actorHelpers.addExtremity(		actorData,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
				}
				else if (bodyType == "avian"){
					bodyObj.legLeft 	= actorHelpers.addLeg(		actorData, "Left Leg", "legLeft");
					bodyObj.legRight 	= actorHelpers.addLeg(		actorData, "Right Leg", "legRight");
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,"Lower Chest","lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,"Abdomen","abdomen", vitals);
					bodyObj.handLeft 	= actorHelpers.addExtremity(actorData,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 	= actorHelpers.addExtremity(actorData,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
					bodyObj.footLeft 	= actorHelpers.addExtremity(actorData,"Left Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 	= actorHelpers.addExtremity(actorData,"Right Foot", "footRight", "Foot", "Ankle", "Sole");
					bodyObj.tail 		= actorHelpers.addTail(		actorData, "tail");
					bodyObj.wingLeft 	= actorHelpers.addArm(		actorData, "Left Wing", "wingLeft");
					bodyObj.wingRight 	= actorHelpers.addArm(		actorData, "Right Wing", "wingRight");
				}
				else if (bodyType == "vermiform"){
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData, "upperChest","Upper Chest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData, "lowerChest","Lower Chest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData, "Abdomen","abdomen", vitals);
				}
				else if (bodyType == "lamia"){
					bodyObj.armLeft 	= actorHelpers.addArm(		actorData, "Left Arm", "armLeft");
					bodyObj.armRight 	= actorHelpers.addArm(		actorData, "Right Arm", "armRight");
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.tail 		= actorHelpers.addTail(		actorData, "tail");
					bodyObj.handLeft 	= actorHelpers.addExtremity(actorData,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 	= actorHelpers.addExtremity(actorData,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
				}
				else if (bodyType == "wingedLamia"){
					bodyObj.armLeft 	= actorHelpers.addArm(		actorData, "Left Arm", "armLeft");
					bodyObj.armRight 	= actorHelpers.addArm(		actorData, "Right Arm", "armRight");
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.tail 		= actorHelpers.addTail(		actorData, "tail");
					bodyObj.handLeft 	= actorHelpers.addExtremity(actorData,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 	= actorHelpers.addExtremity(actorData,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
					bodyObj.wingLeft 	= actorHelpers.addArm(		actorData, "Left Wing", "wingLeft");
					bodyObj.wingRight 	= actorHelpers.addArm(		actorData, "Right Wing", "wingRight");
				}
				else if (bodyType == "octopod"){
					bodyObj.upperChest 		= actorHelpers.addInvertebrateChest(actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 		= actorHelpers.addInvertebrateChest(actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 		= actorHelpers.addAbdomen(			actorData,"Abdomen", "abdomen", vitals);
					bodyObj.tentacleLeft1 	= actorHelpers.addArm(				actorData, "Left Tentacle 1", "tentacleLeft1");
					bodyObj.tentacleLeft2 	= actorHelpers.addArm(				actorData, "Left Tentacle 2", "tentacleLeft2");
					bodyObj.tentacleLeft3 	= actorHelpers.addArm(				actorData, "Left Tentacle 3", "tentacleLeft3");
					bodyObj.tentacleLeft4 	= actorHelpers.addArm(				actorData, "Left Tentacle 4", "tentacleLeft4");
					bodyObj.tentacleRight1 	= actorHelpers.addArm(				actorData, "Right Tentacle 1", "tentacleRight1");
					bodyObj.tentacleRight2 	= actorHelpers.addArm(				actorData, "Right Tentacle 2", "tentacleRight2");
					bodyObj.tentacleRight3 	= actorHelpers.addArm(				actorData, "Right Tentacle 3", "tentacleRight3");
					bodyObj.tentacleRight4 	= actorHelpers.addArm(				actorData, "Right Tentacle 4", "tentacleRight4");
				}
				else if (bodyType == "cancroid"){
					bodyObj.hindlegLeft 	= actorHelpers.addLeg(		actorData, "Left Hind Leg", "hindlegLeft");
					bodyObj.hindlegRight 	= actorHelpers.addLeg(		actorData, "Right Hind Leg", "hindlegRight");
					bodyObj.legLeft 		= actorHelpers.addLeg(		actorData, "Left Foreleg", "legLeft");
					bodyObj.legRight 		= actorHelpers.addLeg(		actorData, "Right Foreleg", "legRight");
					bodyObj.armLeft 		= actorHelpers.addArm(		actorData, "Left Arm", "armLeft");
					bodyObj.armRight 		= actorHelpers.addArm(		actorData, "Right Arm", "armRight");
					bodyObj.upperChest 		= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 		= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 		= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.footLeft 		= actorHelpers.addExtremity(actorData,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 		= actorHelpers.addExtremity(actorData,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
					bodyObj.handLeft 		= actorHelpers.addExtremity(actorData,"Left Claw", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 		= actorHelpers.addExtremity(actorData,"Right Claw", "handRight", "Hand", "Wrist", "Palm");
					bodyObj.hindFootLeft 	= actorHelpers.addExtremity(actorData,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
					bodyObj.hindFootRight 	= actorHelpers.addExtremity(actorData,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
				}
				else if (bodyType == "ichthyoid"){
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.tail 		= actorHelpers.addTail(		actorData, "tail");
					bodyObj.fin1 		= actorHelpers.addExtremity(actorData,"Dorsal Fin", "fin1", "Fin", "Joint");
					bodyObj.fin2 		= actorHelpers.addExtremity(actorData,"Left Fin", "fin2", "Fin", "Joint");
					bodyObj.fin3 		= actorHelpers.addExtremity(actorData,"Right Fin", "fin3", "Fin", "Joint");
				}
				else if (bodyType == "arachnoid"){
					bodyObj.hindlegLeft 		= actorHelpers.addLeg(		actorData, "Left Hind Leg", "hindlegLeft");
					bodyObj.hindlegRight 		= actorHelpers.addLeg(		actorData, "Right Hind Leg", "hindlegRight");
					bodyObj.hindmidlegLeft 		= actorHelpers.addLeg(		actorData, "Left Mid Hind Leg", "hindmidlegLeft");
					bodyObj.hindmidlegRight 	= actorHelpers.addLeg(		actorData, "Right Mid Hind Leg", "hindmidlegRight");
					bodyObj.foremidlegLeft 		= actorHelpers.addLeg(		actorData, "Left Mid Foreleg", "foremidlegLeft");
					bodyObj.foremidlegRight 	= actorHelpers.addLeg(		actorData, "Right Mid Foreleg", "foremidlegRight");
					bodyObj.legLeft 			= actorHelpers.addLeg(		actorData, "Left Foreleg", "legLeft");
					bodyObj.legRight 			= actorHelpers.addLeg(		actorData, "Right Foreleg", "legRight");
					bodyObj.upperChest 			= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 			= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 			= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.footLeft 			= actorHelpers.addExtremity(actorData,"Left Fore Foot", "footLeft", "Foot", "Ankle", "Sole");
					bodyObj.footRight 			= actorHelpers.addExtremity(actorData,"Right Fore Foot", "footRight", "Foot", "Ankle", "Sole");
					bodyObj.foremidFootLeft 	= actorHelpers.addExtremity(actorData,"Left Mid Fore Foot", "foremidFootLeft", "Foot", "Ankle", "Sole");
					bodyObj.foremidFootRight 	= actorHelpers.addExtremity(actorData,"Right Mid Fore Foot", "foremidFootRight", "Foot", "Ankle", "Sole");
					bodyObj.hindmidFootLeft 	= actorHelpers.addExtremity(actorData,"Left Mid Hind Foot", "hindmidFootLeft", "Foot", "Ankle", "Sole");
					bodyObj.hindmidFootRight 	= actorHelpers.addExtremity(actorData,"Right Mid Hind Foot", "hindmidFootRight", "Foot", "Ankle", "Sole");
					bodyObj.hindFootLeft 		= actorHelpers.addExtremity(actorData,"Left Hind Foot", "hindFootLeft", "Foot", "Ankle", "Sole");
					bodyObj.hindFootRight 		= actorHelpers.addExtremity(actorData,"Right Hind Foot", "hindFootRight", "Foot", "Ankle", "Sole");
				}

				let bodyParts = Object.keys(bodyObj);
				let totalWeightFront = 0;
				let totalWeightBack = 0;

				for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
					let part = getProperty(bodyObj, bodyParts[i]) // Get the current part
					if (typeof part.weightFront != "undefined"){ // Check to see if weightFront is defined
						totalWeightFront += +part.weightFront; // Add the front and rear weights
						totalWeightBack += +part.weightBack;
					}
					else { // If the actor's weighting is not defined with the new front/back setup
						if (typeof part.weight != "undefined"){ // Check to see if the old part.weight is still defined
							totalWeightFront += +part.weight; // Use that to set the front and back weights instead
							totalWeightBack += +part.weight;
						}
						console.error(this.name + " needs to refresh their body type"); // Print an error to console
					}
				}
				this.system.bodyType.body = bodyObj; // Set the body to the new body type that was just assembled.
				this.system.bodyType.totalWeightFront = totalWeightFront // Set the weight to the weight of all the assembled parts
				this.system.bodyType.totalWeightBack = totalWeightBack // Set the weight to the weight of all the assembled parts
			}
		}
	}

	recalcAtrValues(){
		let smDiscount = attributeHelpers.calcSMDiscount(this.system.bio.sm);

		//ST
		let st = attributeHelpers.calcStOrHt(this.system.primaryAttributes.strength, smDiscount);
		this.system.primaryAttributes.strength.value = st;

		//DX
		let dx = attributeHelpers.calcDxOrIq(this.system.primaryAttributes.dexterity);
		this.system.primaryAttributes.dexterity.value = dx;

		//IQ
		let iq = attributeHelpers.calcDxOrIq(this.system.primaryAttributes.intelligence);
		this.system.primaryAttributes.intelligence.value = iq;

		//HT
		let ht = attributeHelpers.calcStOrHt(this.system.primaryAttributes.health, 1);
		this.system.primaryAttributes.health.value = ht;

		//Per
		let per = attributeHelpers.calcPerOrWill(iq, this.system.primaryAttributes.perception);
		this.system.primaryAttributes.perception.value = per;

		//Will
		let will = attributeHelpers.calcPerOrWill(iq, this.system.primaryAttributes.will);
		this.system.primaryAttributes.will.value = will;

		//Fright
		let fr = attributeHelpers.calcFright(will, this.system.primaryAttributes.fright);
		this.system.primaryAttributes.fright.value = fr;

		//Speed
		let speed = attributeHelpers.calcSpeed(dx, ht, this.system.primaryAttributes.speed);
		this.system.primaryAttributes.speed.value = speed;

		//Move
		let move = attributeHelpers.calcMove(speed, this.system.primaryAttributes.move);
		this.system.primaryAttributes.move.value = move;

		//Dodge
		let dodge = attributeHelpers.calcDodge(speed, this.system.primaryAttributes.dodge);
		this.system.primaryAttributes.dodge.value = dodge;

		//Lifting ST
		let lst = attributeHelpers.calcLiftingSt(st, this.system.primaryAttributes.lifting, smDiscount)
		this.system.primaryAttributes.lifting.value = lst;

		//Striking ST
		let sst = attributeHelpers.calcStrikingSt(st, this.system.primaryAttributes.striking, smDiscount);
		this.system.primaryAttributes.striking.value = sst;

		//Knockback
		let kb = {
			id: "kb",
			abbr: "Knockback",
			value: st + ((typeof this.system.primaryAttributes.knockback === 'undefined') ? 0 : this.system.primaryAttributes.knockback.mod) - 2,
			mod: (typeof this.system.primaryAttributes.knockback === 'undefined') ? 0 : this.system.primaryAttributes.knockback.mod
		}
		this.system.primaryAttributes.knockback = kb;

		//Swing and Thrust
		this.system.baseDamage.thrust = attributeHelpers.strikingStrengthToThrust(sst);
		this.system.baseDamage.swing = attributeHelpers.strikingStrengthToSwing(sst);

		//HT Subdue
		let hts = attributeHelpers.calcHealthSubdue(ht, this.system.primaryAttributes.subdue);
		this.system.primaryAttributes.subdue.value = hts;

		//HT Kill
		var htk = attributeHelpers.calcHealthKill(ht, this.system.primaryAttributes.death);
		this.system.primaryAttributes.death.value = htk;

		//HP
		var hp = attributeHelpers.calcHP(st, this.system.reserves.hp, smDiscount);
		this.system.reserves.hp.max = hp;

		//FP
		var fp = attributeHelpers.calcFP(ht, this.system.reserves.fp);
		this.system.reserves.fp.max = fp;

		//ER
		var er = attributeHelpers.calcER(this.system.reserves.er);
		this.system.reserves.er.max = er;
	}

	recalcSenses() {
		let per = this.system.primaryAttributes.perception.value;

		this.system.senses.vis.value    = per + this.system.senses.vis.mod;
		this.system.senses.hear.value   = per + this.system.senses.hear.mod;
		this.system.senses.smell.value  = per + this.system.senses.smell.mod;
		this.system.senses.touch.value  = per + this.system.senses.touch.mod;
		this.system.senses.extra1.value = per + this.system.senses.extra1.mod;
		this.system.senses.extra2.value = per + this.system.senses.extra2.mod;
	}

	recalcTraitPoints() {
        let traitPoints = +0;
        let advantagePoints = +0;
		let disadvantagePoints = +0;
		let quirkPoints = +0;
		let perkPoints = +0;

		// Iterate through the list of traits. Advantages and Disadvantages
        for (let i = 0; i < this.items.contents.length; i++){
            if (this.items.contents[i].type === "Trait"){
                traitPoints = traitPoints += this.items.contents[i].system.points;
				advantagePoints = this.items.contents[i].system.category.toLowerCase() === "advantage" ? advantagePoints += this.items.contents[i].system.points : advantagePoints;
                disadvantagePoints = this.items.contents[i].system.category.toLowerCase() === "disadv" ? disadvantagePoints += this.items.contents[i].system.points : disadvantagePoints;
				quirkPoints = this.items.contents[i].system.category.toLowerCase() === "quirk" ? quirkPoints += this.items.contents[i].system.points : quirkPoints;
				perkPoints = this.items.contents[i].system.category.toLowerCase() === "perk" ? perkPoints += this.items.contents[i].system.points : perkPoints;
            }
        }
		this.system.points.traits = traitPoints;
		this.system.points.advantages = advantagePoints;
		this.system.points.disadvantages = disadvantagePoints;
		this.system.points.quirks = quirkPoints;
		this.system.points.perks = perkPoints;
	}

    recalcSkillPoints() {
        let skillPoints = +0;
        // Iterate through the list of skills.
        for (let i = 0; i < this.items.contents.length; i++){
            if (this.items.contents[i].type === "Rollable"){
                skillPoints = skillPoints + this.items.contents[i].system.points
            }
        }
		this.system.points.skills = skillPoints;
    }

    recalcPathPoints() {
		if (game.settings.get("gurps4e", "showRPM")) { // If the RPM tab is enabled, total up the points.
			let pathPoints = 0;
			// Iterate through the list of paths.
			let keys = Object.keys(this.system.rpm.path);
			if (keys.length > 0) {
				for (let k = 0; k < keys.length; k++) {
					pathPoints = pathPoints + getProperty(this.system.rpm.path, keys[k]).points;
				}
			}
			this.system.points.path = pathPoints;
		}
		else { // If the path tab is disabled, set to zero.
			this.system.points.path = 0;
		}
	}

	recalcSpellPoints() {
		var spellPoints = +0;
		// Iterate through the list of spells.
		for (let i = 0; i < this.items.length; i++){
			if (this.items.contents[i].type === "Spell"){
				spellPoints = spellPoints += this.items.contents[i].system.points
			}
		}
		this.system.points.spells = spellPoints;
	}

	storeInfo() {
		this.calcFallInfo();
		this.calcJumpInfo();
		this.calcBreathHoldingInfo();
		this.calcRunSprintInfo();
		this.calcSwimmingInfo();
		this.calcHikingInfo();
		this.calcThrowingInfo();
	}

	calcThrowingInfo() {
		let st = this.system.primaryAttributes.lifting.value; // Store the lifting ST for later

		let throwingSkill = (skillHelpers.getSkillLevelByName("Throwing", this))

		let relativeToDx = 0

		if (typeof throwingSkill !== "undefined") {
			relativeToDx = throwingSkill - this.system.primaryAttributes.dexterity.value; // Get the skill's level relative to DX
		}

		let trainingBonus = 0; // Init the training bonus
		let expandedTrainingBonus = game.settings.get("gurps4e", "expandedTrainingBonuses") // Get the game setting that controls training bonuses.

		// Calculate the training bonus for Throwing
		if (relativeToDx < 1) {
			trainingBonus = 0;
		}
		else if (relativeToDx === 1) {
			trainingBonus = 1;
		}
		else if (relativeToDx === 2) {
			trainingBonus = 2;
		}
		else if (expandedTrainingBonus) { // If using expanded training bonuses, carry on. If not, don't.
			if (relativeToDx < 4) {
				trainingBonus = 2;
			}
			else if (relativeToDx === 4) {
				trainingBonus = 3;
			}
			else {
				trainingBonus = 3 + ((relativeToDx - 4) / 3);
			}
		}

		this.system.info.throw.throwingDistanceST = st + trainingBonus; // The training bonus applies only to distance, not damage
		this.system.info.throw.effectiveBasicLift = Math.round(((st * st)/5)); // Get basic lift.

		let diceAdds = attributeHelpers.strikingStrengthToThrustDiceAndAdds(this.system.primaryAttributes.striking.value);
		let dice = diceAdds[0];
		let adds = diceAdds[1];

		// Calc throwing range and damage
		this.system.info.throw.distanceBlock = [
			{ "distance": Math.round((3.50 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.050 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (2 * dice)) >= 0 ? "+" : "") + (adds - (2 * dice))},
			{ "distance": Math.round((2.50 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.100 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (2 * dice)) >= 0 ? "+" : "") + (adds - (2 * dice))},
			{ "distance": Math.round((2.00 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.125 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (2 * dice)) >= 0 ? "+" : "") + (adds - (2 * dice))}, // 1/8th
			{ "distance": Math.round((2.00 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.150 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (dice)) >= 0 ? "+" : "") + (adds - (dice))},
			{ "distance": Math.round((1.50 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.200 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (dice)) >= 0 ? "+" : "") + (adds - (dice))},
			{ "distance": Math.round((1.20 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.250 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (dice)) >= 0 ? "+" : "") + (adds - (dice))}, // 1/4th
			{ "distance": Math.round((1.10 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.300 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + (adds >= 0 ? "+" : "") + adds},
			{ "distance": Math.round((1.00 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.400 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + (adds >= 0 ? "+" : "") + adds},
			{ "distance": Math.round((0.80 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.500 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + (adds >= 0 ? "+" : "") + adds}, // 1/2nd
			{ "distance": Math.round((0.70 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(0.750 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + (adds >= 0 ? "+" : "") + adds},
			{ "distance": Math.round((0.60 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(1.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + (adds >= 0 ? "+" : "") + adds}, // 1x
			{ "distance": Math.round((0.40 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(1.500 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + (adds >= 0 ? "+" : "") + adds},
			{ "distance": Math.round((0.30 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(2.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + (adds >= 0 ? "+" : "") + adds}, // 2x
			{ "distance": Math.round((0.25 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(2.500 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - Math.floor((dice/2))) >= 0 ? "+" : "") + (adds - Math.floor((dice/2)))},
			{ "distance": Math.round((0.20 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(3.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - Math.floor((dice/2))) >= 0 ? "+" : "") + (adds - Math.floor((dice/2)))},
			{ "distance": Math.round((0.15 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(4.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - Math.floor((dice/2))) >= 0 ? "+" : "") + (adds - Math.floor((dice/2)))}, // 4x
			{ "distance": Math.round((0.12 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(5.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (dice)) >= 0 ? "+" : "") + (adds - (dice))},
			{ "distance": Math.round((0.10 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(6.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (dice)) >= 0 ? "+" : "") + (adds - (dice))},
			{ "distance": Math.round((0.09 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(7.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (dice)) >= 0 ? "+" : "") + (adds - (dice))},
			{ "distance": Math.round((0.08 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(8.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : dice + "d6" + ((adds - (dice)) >= 0 ? "+" : "") + (adds - (dice))}, // 8x
			{ "distance": Math.round((0.07 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(9.000 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : "0d6+0"},
			{ "distance": Math.round((0.06 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(10.00 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : "0d6+0"},
			{ "distance": Math.round((0.05 * this.system.info.throw.throwingDistanceST) * 100) / 100, "lbs": Math.round(12.00 * this.system.info.throw.effectiveBasicLift * 100) / 100, "damage" : "0d6+0"},
		]

		for (let l = 0; l < this.system.info.throw.distanceBlock.length; l++) {
			if (this.system.info.throw.distanceBlock[l].lbs >= this.system.info.throw.specificWeight) {
				this.system.info.throw.specificWeightBlock = this.system.info.throw.distanceBlock[l];
				l = this.system.info.throw.distanceBlock.length;
			}
		}
	}

	// Calculates fall based information based on the rules in B430
	calcFallInfo() {
		// Height validation
		if (typeof this.system.info.fall.height !== 'number') { // If superJump is something other than a number
			this.system.info.fall.height = 0;
		}
		else if (this.system.info.fall.height < 0){ // If it's less than zero
			this.system.info.fall.height = 0; // Set it to zero
		}

		// Get the campaign gravity
		let gravity = game.settings.get("gurps4e", "gravity");

		if (gravity !== 'number') {
			gravity = 1;
		}
		else if (this.system.info.fall.height < 0){ // If it's less than zero
			gravity = 1;
		}

		this.system.info.fall.velocity = Math.sqrt(21.4 * gravity * this.system.info.fall.height);
		this.system.info.fall.velocityMPH = this.system.info.fall.velocity * 2.04545;

		this.system.info.fall.soft = (this.system.reserves.hp.max * this.system.info.fall.velocity) / 100;
		this.system.info.fall.hard = this.system.info.fall.soft * 2;

		this.system.info.fall.softDiceAndAdds = generalHelpers.pointsToDiceAndAdds(this.system.info.fall.soft * 3.5);
		this.system.info.fall.hardDiceAndAdds = generalHelpers.pointsToDiceAndAdds(this.system.info.fall.hard * 3.5);
	}

	// Calculates jump based information based on the rules in B352
	calcJumpInfo() {
		this.system.info.jump.liftingSTBasedJump = Math.floor(this.system.primaryAttributes.lifting.value / 4); // 1/4 lifting strength can also be used to figure jump distance. Really only matters for really fuckin strong characters
		this.system.info.jump.moveBasedJump = this.system.primaryAttributes.move.value; // Basic Move is what most people use to figure jump distance.
		this.system.info.jump.jumpingSkill = skillHelpers.getSkillLevelByName("Jumping", this) // Get jumping skill for use later.
		let encMult = this.system.encumbrance.current.mult;
		if (typeof this.system.info.jump.jumpingSkill !== 'number') { // If it didn't return a number
			this.system.info.jump.jumpingSkill = 0 // Set it to zero, as the skill has no default.
			this.system.info.jump.skillBasedJump = 0; // They have no skill based jump
		}
		else { // It did return a number
			this.system.info.jump.skillBasedJump = Math.floor(this.system.info.jump.jumpingSkill / 2); // Half jump skill can also be used to figure jump distance.
		}
		this.system.info.jump.effectiveJump = Math.max(this.system.info.jump.liftingSTBasedJump, this.system.info.jump.moveBasedJump, this.system.info.jump.skillBasedJump);


		if (typeof this.system.info.jump.superJump !== 'number') { // If superJump is something other than a number
			this.system.info.jump.superJump = 0;
		}
		else if (this.system.info.jump.superJump < 0){ // If it's less than zero
			this.system.info.jump.superJump = 0; // Set it to zero
		}

		if (typeof this.system.info.jump.enhancedMove !== 'number') { // If enhancedMove is something other than a number
			this.system.info.jump.enhancedMove = 0;
		}
		else if (this.system.info.jump.enhancedMove < 0){ // If it's less than zero
			this.system.info.jump.enhancedMove = 0; // Set it to zero
		}

		if (typeof this.system.info.jump.runningStart !== 'number') { // If runningStart is something other than a number
			this.system.info.jump.runningStart = 0;
		}
		else if (this.system.info.jump.runningStart < 0){ // If it's less than zero
			this.system.info.jump.runningStart = 0; // Set it to zero
		}

		// Use the better of their enhanced move boosted Jump, or their running start boosted jump.
		this.system.info.jump.effectiveJump = Math.max(this.system.info.jump.effectiveJump * (1 + this.system.info.jump.enhancedMove), (this.system.info.jump.effectiveJump + this.system.info.jump.runningStart));

		let superJumpMult = 2 ** this.system.info.jump.superJump;

		this.system.info.jump.preparedHighJump = ((6 * this.system.info.jump.effectiveJump) - 10) * superJumpMult * encMult; // This figure is given in inches. (For some fucking reason)
		this.system.info.jump.unpreparedHighJump = this.system.info.jump.preparedHighJump / 2;

		this.system.info.jump.preparedBroadJump = ((2 * this.system.info.jump.effectiveJump) - 3) * superJumpMult * encMult; // This figure is given in feet.
		this.system.info.jump.unpreparedBroadJump = this.system.info.jump.preparedBroadJump / 2;

		this.system.info.jump.velocity = Math.max(this.system.info.jump.preparedBroadJump/5 , this.system.info.jump.moveBasedJump) // Jump velocity is the higher of Basic Move and one fifth highest broad jump.
	}

	// Calculates breath holding stats based on the rules from B351
	calcBreathHoldingInfo() {
		if (typeof this.system.info.breath.breathHolding !== 'number') { // If breathHolding is something other than a number
			this.system.info.breath.breathHolding = 0;
		}
		if (typeof this.system.info.breath.breathControl === 'undefined') { // If breathControl is undefined
			this.system.info.breath.breathControl = false;
		}
		if (typeof this.system.info.breath.oxygenStorage !== 'number') { // If oxygenStorage is something other than a number
			this.system.info.breath.oxygenStorage = 1;
		}
		else if (this.system.info.breath.oxygenStorage < 1) { // If oxygenStorage is less than 1, set it to 1.
			this.system.info.breath.oxygenStorage = 1;
		}

		this.system.info.breath.noExertion = 	((this.system.primaryAttributes.health.value * 10)	* 2 ** this.system.info.breath.breathHolding) * this.system.info.breath.oxygenStorage;
		this.system.info.breath.mildExertion = 	((this.system.primaryAttributes.health.value * 4)	* 2 ** this.system.info.breath.breathHolding) * this.system.info.breath.oxygenStorage;
		this.system.info.breath.heavyExertion = ((this.system.primaryAttributes.health.value)		* 2 ** this.system.info.breath.breathHolding) * this.system.info.breath.oxygenStorage;

		if (this.system.info.breath.breathControl) {
			this.system.info.breath.noExertion =	this.system.info.breath.noExertion *= 1.5;
			this.system.info.breath.mildExertion =	this.system.info.breath.mildExertion *= 1.5;
			this.system.info.breath.heavyExertion =	this.system.info.breath.heavyExertion *= 1.5;
		}
	}

	// Calculate info related to running, hiking, and swimming from B354
	calcRunSprintInfo() {
		let fpBeforeVeryTired = this.system.reserves.fp.max - Math.floor(this.system.reserves.fp.max / 3); // Figure out the number of FP they have before they hit Very Tired and store it for later.

		this.system.info.runSprint.runningSkill = skillHelpers.getSkillLevelByName("Running", this) // Get running skill for use later.

		if (typeof this.system.info.runSprint.runningSkill !== 'number') { // If it didn't return a number
			this.system.info.runSprint.runningSkill = this.system.primaryAttributes.health.value - 5; // Set it to HT - 5, as that's the default.
		}

		this.system.info.runSprint.runningSkill = Math.max(this.system.info.runSprint.runningSkill, this.system.primaryAttributes.health.value) // Running skill is based off the higher of their running skill and base HT

		let effectiveMove = this.system.primaryAttributes.move.value * this.system.encumbrance.current.mult;

		this.system.info.runSprint.sprintMove = +effectiveMove * 1.2; // Sprint move is base move * 1.2
		this.system.info.runSprint.combatSprintMove = Math.floor(Math.max(+effectiveMove * 1.2, +effectiveMove + 1)); // Combat sprint is always at least 1 point higher than base move.
		this.system.info.runSprint.sprintMph = this.system.info.runSprint.sprintMove * 2; // yps to mph is not exactly double, but it's the figure GURPS uses and keeps extra decimals from creeping in.

		this.system.info.runSprint.pacedRunningMove = this.system.info.runSprint.sprintMove / 2; // Paced running move is half sprint speed.
		this.system.info.runSprint.pacedRunningMph = this.system.info.runSprint.pacedRunningMove * 2; // yps to mph is not exactly double, but it's the figure GURPS uses and keeps extra decimals from creeping in.

		this.system.info.runSprint.sprint100 = this.system.info.runSprint.sprintMove * 15 * fpBeforeVeryTired; // Every 15 seconds, the person rolls vs running skill. This entry assumes all rolls are failed.
		this.system.info.runSprint.run100    = this.system.info.runSprint.pacedRunningMove * 60 * fpBeforeVeryTired; // Every 60 seconds, the person rolls vs running skill. This entry assumes all rolls are failed.

		let skillProbability = skillHelpers.skillLevelToProbability(this.system.info.runSprint.runningSkill); // Get the probability of success with the effective running skill.

		let mult75 = 1;
		let mult50 = 1;
		let mult = 1;
		let hit75 = false;
		let hit50 = false;
		for (let a = 1; a > 0.25; a = a * skillProbability){ // With each step the loop simulates the stacking probability of repeated skill rolls. As the index passes certain thresholds the value is saved as the multiplier for the sprint/run distance.
			if (a < 0.75 && hit75 === false) {
				hit75 = true;
				mult75 = mult;
			}
			if (a < 0.50 && hit50 === false) {
				hit50 = true;
				mult50 = mult;
			}
			mult += 1;
		}
		let mult25 = mult;


		this.system.info.runSprint.sprint75  = this.system.info.runSprint.sprint100 * mult75;
		this.system.info.runSprint.run75     = this.system.info.runSprint.run100    * mult75;
		this.system.info.runSprint.sprint50  = this.system.info.runSprint.sprint100 * mult50;
		this.system.info.runSprint.run50     = this.system.info.runSprint.run100    * mult50;
		this.system.info.runSprint.sprint25  = this.system.info.runSprint.sprint100 * mult25;
		this.system.info.runSprint.run25     = this.system.info.runSprint.run100    * mult25;

		this.system.info.runSprint.sprint100Mi = this.system.info.runSprint.sprint100 / 1760;
		this.system.info.runSprint.run100Mi	 = this.system.info.runSprint.run100 / 1760;

		this.system.info.runSprint.sprint75Mi  = this.system.info.runSprint.sprint75 / 1760;
		this.system.info.runSprint.run75Mi	 = this.system.info.runSprint.run75 / 1760;

		this.system.info.runSprint.sprint50Mi  = this.system.info.runSprint.sprint50 / 1760;
		this.system.info.runSprint.run50Mi	 = this.system.info.runSprint.run50 / 1760;

		this.system.info.runSprint.sprint25Mi  = this.system.info.runSprint.sprint25 / 1760;
		this.system.info.runSprint.run25Mi	 = this.system.info.runSprint.run25 / 1760;
	}

	calcSwimmingInfo() {
		let fpBeforeVeryTired = this.system.reserves.fp.max - Math.floor(this.system.reserves.fp.max / 3); // Figure out the number of FP they have before they hit Very Tired and store it for later.

		this.system.info.swim.skill = skillHelpers.getSkillLevelByName("Swimming", this) // Base swimming might still be rolled against to make sure your character doesn't drown. - TODO Add not drowning rules. (Or don't)

		if (typeof this.system.info.swim.skill !== 'number') { // If it didn't return a number
			this.system.info.swim.skill = this.system.primaryAttributes.health.value - 4; // Set it to HT - 4, as that's the default.
		}

		this.system.info.swim.effectiveSkill = Math.max(this.system.info.swim.skill, this.system.primaryAttributes.health.value) // This is the skill used when determining how far you can get.

		let effectiveMove = this.system.primaryAttributes.move.value * this.system.encumbrance.current.mult;

		if (!this.system.info.swim.waterBoi) { // Character is not aquatic or amphibious
			this.system.info.swim.swimMove = +effectiveMove * 0.2; // Swimming move is one fifth base move.
			this.system.info.swim.combatSwimMove = Math.floor(Math.max(+effectiveMove * 0.2, 1)); // Combat swimming move is one fifth base move, but always at least 1.
		}
		else {
			this.system.info.swim.swimMove = effectiveMove;
			this.system.info.swim.combatSwimMove = effectiveMove;
		}

		this.system.info.swim.swimMph = this.system.info.swim.swimMove * 2; // yps to mph is not exactly double, but it's the figure GURPS uses and keeps extra decimals from creeping in.

		this.system.info.swim.pacedSwimMove = this.system.info.swim.swimMove / 2; // Assuming paced swimming is half regular swim move
		this.system.info.swim.pacedSwimMph = this.system.info.swim.pacedSwimMove * 2; // yps to mph is not exactly double, but it's the figure GURPS uses and keeps extra decimals from creeping in.

		this.system.info.swim.swim100		= this.system.info.swim.swimMove * 60 * fpBeforeVeryTired; // Every minute, the person rolls vs pacedSwimning skill. This entry assumes all rolls are failed.
		this.system.info.swim.pacedSwim100	= this.system.info.swim.pacedSwimMove * 60 * 30 * fpBeforeVeryTired; // Every 60 seconds, the person rolls vs pacedSwimning skill. This entry assumes all rolls are failed.

		let skillProbability = skillHelpers.skillLevelToProbability(this.system.info.swim.skill); // Get the probability of success with the effective pacedSwimning skill.

		let mult75 = 1;
		let mult50 = 1;
		let mult = 1;
		let hit75 = false;
		let hit50 = false;
		for (let a = 1; a > 0.25; a = a * skillProbability){ // With each step the loop simulates the stacking probability of repeated skill rolls. As the index passes certain thresholds the value is saved as the multiplier for the swim/pacedSwim distance.
			if (a < 0.75 && hit75 === false) {
				hit75 = true;
				mult75 = mult;
			}
			if (a < 0.50 && hit50 === false) {
				hit50 = true;
				mult50 = mult;
			}
			mult += 1;
		}
		let mult25 = mult;

		this.system.info.swim.swim75		= this.system.info.swim.swim100			* mult75;
		this.system.info.swim.pacedSwim75	= this.system.info.swim.pacedSwim100    * mult75;
		this.system.info.swim.swim50		= this.system.info.swim.swim100			* mult50;
		this.system.info.swim.pacedSwim50	= this.system.info.swim.pacedSwim100    * mult50;
		this.system.info.swim.swim25		= this.system.info.swim.swim100			* mult25;
		this.system.info.swim.pacedSwim25	= this.system.info.swim.pacedSwim100	* mult25;

		this.system.info.swim.swim100Mi			= this.system.info.swim.swim100 / 1760;
		this.system.info.swim.pacedSwim100Mi	= this.system.info.swim.pacedSwim100 / 1760;

		this.system.info.swim.swim75Mi			= this.system.info.swim.swim75 / 1760;
		this.system.info.swim.pacedSwim75Mi		= this.system.info.swim.pacedSwim75 / 1760;

		this.system.info.swim.swim50Mi			= this.system.info.swim.swim50 / 1760;
		this.system.info.swim.pacedSwim50Mi		= this.system.info.swim.pacedSwim50 / 1760;

		this.system.info.swim.swim25Mi			= this.system.info.swim.swim25 / 1760;
		this.system.info.swim.pacedSwim25Mi		= this.system.info.swim.pacedSwim25 / 1760;
	}


	calcHikingInfo() {
		this.system.info.hiking.realisticRules = game.settings.get("gurps4e", "realisticFootTravel");

		this.system.info.hiking.skill = skillHelpers.getSkillLevelByName("Hiking", this) // Get running skill for use later.

		if (typeof this.system.info.hiking.skill !== 'number') { // If it didn't return a number
			this.system.info.hiking.skill = this.system.primaryAttributes.health.value - 5; // Set it to HT - 5, as that's the default.
		}

		let terrainMult = parseFloat(this.system.info.hiking.terrain)
		let weatherMult = parseFloat(this.system.info.hiking.weather)

		let iceMult = 1;

		if (this.system.info.hiking.ice) { // If there's ice
			iceMult = 0.5; // Ice halves movement speed.
		}

		this.system.info.hiking.fpCost = this.system.encumbrance.current.fpCost;

		if (this.system.info.hiking.hot) { // If it's hot
			if (this.system.info.hiking.hotClothing) { // They might also be wearing heavy clothing
				this.system.info.hiking.fpCost += 2; // Add 2 FP to the cost
			}
			else { // Or they might not
				this.system.info.hiking.fpCost += 1; // Add only 1 FP to the cost
			}
		}

		let effectiveMove = this.system.primaryAttributes.move.value * this.system.encumbrance.current.mult * (this.system.info.hiking.enhancedMove + 1) * terrainMult * weatherMult * iceMult; // Start with the basic move, and apply multipliers for enc, enhanced move, terrain, and weather

		// Final calculation depends on whether they are using realistic or basic set hiking rules.
		if (this.system.info.hiking.realisticRules) { // Calculate info related to hiking from LTC2
			let fpBeforeVeryTired = this.system.reserves.fp.max - Math.floor(this.system.reserves.fp.max / 3); // Figure out the number of FP they have before they hit Very Tired and store it for later.
			this.system.info.hiking.moveMph = effectiveMove / 2;
			this.system.info.hiking.moveYps = this.system.info.hiking.moveMph / 2;

			let hoursBeforeVeryTired = fpBeforeVeryTired / this.system.info.hiking.fpCost; // Hours before the character must rest.
			let lostFP = hoursBeforeVeryTired * this.system.info.hiking.fpCost // The specific number of fp lost as part of the above.
			let restTime = lostFP * this.system.info.hiking.fpRecovery / 60; // The number of hours it takes for each rest period.
			let stretchTime = hoursBeforeVeryTired + restTime; // The time to cover your max distance and then recover all the FP lost.
			let distancePerStretch = hoursBeforeVeryTired * effectiveMove; // The distance covered each time you do above
			let stretchesPerDay = this.system.info.hiking.hours / stretchTime;
			this.system.info.hiking.baseSpeed = stretchesPerDay * distancePerStretch; // This value is given in miles per day and assumes a failed hiking roll.
		}
		else { // Calculate info related to hiking from B351
			let timeMult = this.system.info.hiking.hours / 16;
			effectiveMove *= timeMult;
			this.system.info.hiking.baseSpeed = effectiveMove * 10; // This value is given in miles per day and assumes a failed hiking roll.
		}
		this.system.info.hiking.successSpeed = this.system.info.hiking.baseSpeed * 1.2; // This value is given in miles per day and assumes a successful hiking roll.
		let skillProbability = skillHelpers.skillLevelToProbability(this.system.info.hiking.skill); // Get the probability of success with the hiking skill.
		this.system.info.hiking.probableSpeed = this.system.info.hiking.baseSpeed * (1 + (0.2 * skillProbability)) // This value takes the 20% bonus and multiplies it by the chance of actually getting it before applying the result as a modifier.
		this.system.info.hiking.averageMoveMph = this.system.info.hiking.baseSpeed / this.system.info.hiking.hours; // This is the average speed in mph, rests included.
		this.system.info.hiking.averageMoveYps = this.system.info.hiking.averageMoveMph / 2;
	}

	recalcEncValues() {
		var st = this.system.primaryAttributes.lifting.value;

		let dodgeMultiplier = 1;

		// Basic 328 - With less than 1/3rd FP remaining your ST is halved, but not for the purposes of HP or damage
		if (this.system.reserves.fp.state.toLowerCase() !== "fresh" && this.system.reserves.fp.state.toLowerCase() !=="tired") {
			st = st / 2
			dodgeMultiplier *= 0.5;
		}

		if (this.system.reserves.hp.state.toLowerCase() !== "healthy" && this.system.reserves.hp.state.toLowerCase() !== "injured"){
			st = st / 2
			dodgeMultiplier *= 0.5;
		}

		var bl = Math.round(((st * st)/5));
		var move = this.system.primaryAttributes.move.value;
		var dodge = this.system.primaryAttributes.dodge.value;
		let dodgeMod = 0;
		var carriedWeight = 0;
		var carriedCost = 0;
		let finalDodge = 0;

		if (this.system.enhanced.dodge){
			dodgeMod = this.system.enhanced.dodge;
		}

		if (this.system.flag.combatReflexes){
			dodgeMod = dodgeMod + 1;
		}

		this.system.encumbrance.none.lbs = bl;
		this.system.encumbrance.light.lbs = bl * 2;
		this.system.encumbrance.medium.lbs = bl * 3;
		this.system.encumbrance.heavy.lbs = bl * 6;
		this.system.encumbrance.xheavy.lbs = bl * 10;

		this.system.encumbrance.none.move	= Math.ceil((move) * dodgeMultiplier);
		this.system.encumbrance.light.move	= Math.ceil((Math.max((Math.floor(move * 0.8)), 1)) * dodgeMultiplier);
		this.system.encumbrance.medium.move	= Math.ceil((Math.max((Math.floor(move * 0.6)), 1)) * dodgeMultiplier);
		this.system.encumbrance.heavy.move	= Math.ceil((Math.max((Math.floor(move * 0.4)), 1)) * dodgeMultiplier);
		this.system.encumbrance.xheavy.move	= Math.ceil((Math.max((Math.floor(move * 0.2)), 1)) * dodgeMultiplier);

		this.system.encumbrance.none.dodge	= Math.ceil((dodge + dodgeMod) * dodgeMultiplier);
		this.system.encumbrance.light.dodge	= Math.ceil((Math.max(dodge + dodgeMod - 1, 1)) * dodgeMultiplier);
		this.system.encumbrance.medium.dodge = Math.ceil((Math.max(dodge + dodgeMod - 2, 1)) * dodgeMultiplier);
		this.system.encumbrance.heavy.dodge	= Math.ceil((Math.max(dodge + dodgeMod - 3, 1)) * dodgeMultiplier);
		this.system.encumbrance.xheavy.dodge	= Math.ceil((Math.max(dodge + dodgeMod - 4, 1)) * dodgeMultiplier);

		// Running loop to total up weight and value for the sheet, and to gather the total number of RPM stuff prepared
		this.system.rpm.totalConditional = 0;
		this.system.rpm.totalElixir = 0;
		for (let l = 0; l < this.items.contents.length; l++){
			if (this.items.contents[l].system.equipStatus !== "notCarried" &&
				(this.items.contents[l].type === "Equipment" ||
				this.items.contents[l].type === "Custom Weapon" ||
				this.items.contents[l].type === "Custom Armour" ||
				this.items.contents[l].type === "Custom Jewelry" ||
				this.items.contents[l].type === "Travel Fare")){
				carriedWeight = (+this.items.contents[l].system.weight * +this.items.contents[l].system.quantity) + +carriedWeight;
				carriedCost = (+this.items.contents[l].system.cost * +this.items.contents[l].system.quantity) + +carriedCost;
			}

			if (game.settings.get("gurps4e", "showRPM")) { // If the RPM tab is enabled, total up the number of ritual types for each cap.
				if (this.items.contents[l].type === "Ritual") {
					if (this.items.contents[l].system.ritualType === "conditional" || this.items.contents[l].system.ritualType === "charm" || this.items.contents[l].system.ritualType === "conditionalCharm") {
						this.system.rpm.totalConditional += this.items.contents[l].system.quantity;
					}
					else if (this.items.contents[l].system.ritualType === "elixir") {
						let rpmElixirLimit = game.settings.get("gurps4e", "rpmElixirLimit"); // Get the rule that defines how elixirs are limited
						if (rpmElixirLimit === "withConditional") {
							this.system.rpm.totalConditional += this.items.contents[l].system.quantity;
						}
						else if (rpmElixirLimit === "byAlchemySkill") {
							this.system.rpm.totalElixir += this.items.contents[l].system.quantity;
						}
					}
				}
			}
		}

		carriedCost += +this.system.bio.money;

		carriedWeight = Math.round(carriedWeight * 100) / 100;
		carriedCost = Math.round(carriedCost * 100) / 100;

		// Assign total weight and cost
		this.system.bio.carriedWeight = carriedWeight;
		this.system.bio.carriedValue = carriedCost

		if (carriedWeight <= this.system.encumbrance.none.lbs) {
			finalDodge = this.system.encumbrance.none.dodge;
			this.system.encumbrance.current = {
				ref: "none",
				title: "None",
				mult: 1,
				fpCost: 1,
				penalty: 0
			};
		}
		else if (carriedWeight <= this.system.encumbrance.light.lbs){
			finalDodge = this.system.encumbrance.light.dodge;
			this.system.encumbrance.current = {
				ref: "light",
				title: "Light",
				mult: 0.8,
				fpCost: 2,
				penalty: -1
			};
		}
		else if (carriedWeight <= this.system.encumbrance.medium.lbs){
			finalDodge = this.system.encumbrance.medium.dodge;
			this.system.encumbrance.current = {
				ref: "medium",
				title: "Medium",
				mult: 0.6,
				fpCost: 3,
				penalty: -2
			};
		}
		else if (carriedWeight <= this.system.encumbrance.heavy.lbs){
			finalDodge = this.system.encumbrance.heavy.dodge;
			this.system.encumbrance.current = {
				ref: "heavy",
				title: "Heavy",
				mult: 0.4,
				fpCost: 4,
				penalty: -3
			};
		}
		else if (carriedWeight <= this.system.encumbrance.xheavy.lbs){
			finalDodge = this.system.encumbrance.xheavy.dodge;
			this.system.encumbrance.current = {
				ref: "xheavy",
				title: "X-Heavy",
				mult: 0.2,
				fpCost: 5,
				penalty: -4
			};
		}
		else {
			finalDodge = 0;
		}

		this.system.primaryAttributes.dodge.value = finalDodge;
	}

	setTotalPoints(unspent) {
		let total = +this.system.points.attributes + +this.system.points.traits + +this.system.points.skills + +this.system.points.path + +unspent;
		this.update({ ['system.points.total']: total });
	}

	setRPMCoreSkill(skillName) {
		this.system.rpm.coreSkill = skillName;

		this.system.rpm.coreSkillLevel = skillHelpers.getSkillLevelByName(skillName, this) // Get the level of the core skill for this RPM caster

		let keys = Object.keys(this.system.rpm.path);

		for (let k = 0; k < keys.length; k++) {
			let path = getProperty(this.system.rpm.path, keys[k]);
			path.defaults = [
				{
					"skill": skillName,
					"mod": -6
				}
			]
			path.level = skillHelpers.computeSkillLevel(this, path); // Get the base skill level based on the points spent and any buying up from defaults
			path.level += path.mod; // Add path mod.
			path.level = Math.min(path.level, this.system.rpm.maxSkill, this.system.rpm.coreSkillLevel); // Apply the skill cap
		}

		this.update({ ['system.rpm']: this.system.rpm });
	}

	recalcAtrPoints(){
		//Update point totals
		let attributePoints = +this.system.primaryAttributes.strength.points +
			+this.system.primaryAttributes.dexterity.points +
			+this.system.primaryAttributes.intelligence.points +
			+this.system.primaryAttributes.health.points +
			+this.system.primaryAttributes.perception.points +
			+this.system.primaryAttributes.will.points +
			+this.system.primaryAttributes.fright.points +
			+this.system.primaryAttributes.speed.points +
			+this.system.primaryAttributes.move.points +
			+this.system.primaryAttributes.dodge.points +
			+this.system.reserves.hp.points +
			+this.system.reserves.fp.points +
			+this.system.reserves.er.points +
			+this.system.bio.tl.points;
		this.system.points.attributes = attributePoints;
	}

	recalcPointTotals() {
		let unspent;
		let spent;
		spent = +this.system.points.attributes + +this.system.points.traits + +this.system.points.skills + +this.system.points.spells + +this.system.points.path;

		unspent = +this.system.points.total - +spent;

		this.system.points.unspent = unspent;
	}

	setupCategories() {
		this.system.traitCategories = [];
		this.system.equipmentCategories = [];
		this.system.rollableCategories = [];
		this.system.spellCategories = [];

		this.system.traitCategories.push("");
		this.system.equipmentCategories.push("");
		this.system.rollableCategories.push("");
		this.system.spellCategories.push("");

		for (let w = 0; w < this.items.contents.length; w++) {
			if(this.items.contents[w].system.subCategory){
				if(this.items.contents[w].system.subCategory.trim() != ""){//If subcategory is not blank
					if(this.items.contents[w].type == "Trait"){
						if(!this.system.traitCategories.includes(this.items.contents[w].system.subCategory.trim())){//Make sure the trait array doesn't already contain the category.
							this.system.traitCategories.push(this.items.contents[w].system.subCategory.trim())
						}
					}
					else if (this.items.contents[w].type == "Rollable"){
						if (!this.system.rollableCategories.includes(this.items.contents[w].system.subCategory.trim())) {//Make sure the rollable array doesn't already contain the category.
							this.system.rollableCategories.push(this.items.contents[w].system.subCategory.trim())
						}
					}
					else if (this.items.contents[w].type == "Spell"){
						if (!this.system.spellCategories.includes(this.items.contents[w].system.subCategory.trim())) {//Make sure the spell array doesn't already contain the category.
							this.system.spellCategories.push(this.items.contents[w].system.subCategory.trim())
						}
					}
					else if (this.items.contents[w].type == "Equipment" || this.items.contents[w].type == "Custom Weapon" || this.items.contents[w].type == "Custom Armour" || this.items.contents[w].type == "Custom Jewelry" || this.items.contents[w].type == "Travel Fare"){
						if (!this.system.equipmentCategories.includes(this.items.contents[w].system.subCategory.trim())) {//Make sure the item array doesn't already contain the category.
							this.system.equipmentCategories.push(this.items.contents[w].system.subCategory.trim())
						}
					}
				}
			}
		}
	}

	saveLocationalTotalDR(){
		if (this.system) {
			if (this.system.bodyType) {
				if (this.system.bodyType.name.length > 0){
					let object = this.system.bodyType.body;
					let bodyParts = Object.keys(object); // Collect all the bodypart names
					for (let i = 0; i < bodyParts.length; i++){ // Loop through all the body parts
						if (bodyParts[i] == "skull" || bodyParts[i] == "brain"){ // Part has no sub-parts
							let currentBodyPart = getProperty(object, bodyParts[i]);

							// Clear existing DR for the body part
							currentBodyPart.drBurn = 0;
							currentBodyPart.drCor  = 0;
							currentBodyPart.drCr   = 0;
							currentBodyPart.drCut  = 0;
							currentBodyPart.drFat  = 0;
							currentBodyPart.drImp  = 0;
							currentBodyPart.drPi   = 0;
							currentBodyPart.drTox  = 0;

							// Loop through DR layers
							for (let q = 0; q < Object.keys(getProperty(object, bodyParts[i] + ".dr")).length; q++) {
								let currentDRLayer = getProperty(object, bodyParts[i] + ".dr")[q]
								currentBodyPart.drBurn       += currentDRLayer.burn;
								currentBodyPart.drCor        += currentDRLayer.cor ;
								currentBodyPart.drCr         += currentDRLayer.cr  ;
								currentBodyPart.drCut        += currentDRLayer.cut ;
								currentBodyPart.drFat        += currentDRLayer.fat ;
								currentBodyPart.drImp        += currentDRLayer.imp ;
								currentBodyPart.drPi         += currentDRLayer.pi  ;
								currentBodyPart.drTox        += currentDRLayer.tox ;
							}
						}
						else {
							let subParts = Object.keys(getProperty(object, bodyParts[i] + ".subLocation")); // Collect all the subpart names
							for (let n = 0; n < subParts.length; n++){ // Loop through all the subparts
								let currentBodyPart = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n]);

								// Clear existing DR for the body part
								currentBodyPart.drBurn = 0;
								currentBodyPart.drCor  = 0;
								currentBodyPart.drCr   = 0;
								currentBodyPart.drCut  = 0;
								currentBodyPart.drFat  = 0;
								currentBodyPart.drImp  = 0;
								currentBodyPart.drPi   = 0;
								currentBodyPart.drTox  = 0;

								// Loop through DR layers
								for (let q = 0; q < Object.keys(getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".dr")).length; q++) {
									let currentDRLayer = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".dr")[q]
									currentBodyPart.drBurn       += currentDRLayer.burn;
									currentBodyPart.drCor        += currentDRLayer.cor ;
									currentBodyPart.drCr         += currentDRLayer.cr  ;
									currentBodyPart.drCut        += currentDRLayer.cut ;
									currentBodyPart.drFat        += currentDRLayer.fat ;
									currentBodyPart.drImp        += currentDRLayer.imp ;
									currentBodyPart.drPi         += currentDRLayer.pi  ;
									currentBodyPart.drTox        += currentDRLayer.tox ;
								}
							}
						}
					}
				}
			}
		}
	}

	// TODO - Refactor this code to make use of the results from saveLocationalTotalDR to get these values
	storeArmour(){
		if (this.system) {
			if (this.system.bodyType) {
				if (this.system.bodyType.name.length > 0){
					// Create a function for filtering out armour
					function filterArmour(item){
						if (((item.type == "Equipment" || item.type == "Custom Armour") && item.system.equipStatus == "equipped") || item.type == "Trait"){ // Check to see if it is a piece of equipment, custom armour, or a trait
							if (item.system.armour){ // Check to see if data has the armour child object - This should really only be an issue when updating from a version that did not include this data structure.
								if (item.system.armour.bodyType){ // Check to see if the item has armour
									if (item.system.armour.bodyType.name){
										if (item.system.armour.bodyType.name.length > 0){ // Check to see if a body type has been set
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
						if (a.system.armour.layer < b.system.armour.layer){
							return -1
						}
						if (a.system.armour.layer > b.system.armour.layer){
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

					armour[0] = this.getArmour(this.system.bodyType.body, this.system.bodyType.body, 0); // Get the armour inherent in the body
					this.system.bodyType.drTypesOne = getProperty(armour[0], this.system.bodyType.damageTypeOne.toLowerCase());
					this.system.bodyType.drTypesTwo = getProperty(armour[0], this.system.bodyType.damageTypeTwo.toLowerCase());

					let items = this.items.contents.filter(filterArmour); // Get the character's items and filter out anything that isn't armour
					items = items.sort(sortArmourByLayer); // Take the above list and sort by layer. Index 0 is lowest, index infinity is highest.

					for (let l = 0; l < items.length; l++){ // Loop through the characters items and apply any relevant DR.
						armour[l+1] = this.getArmour(items[l].system.armour.bodyType.body, this.system.bodyType.body, l+1);
						let damageTypeOneObject;
						let damageTypeTwoObject;

						if (this.system.bodyType.damageTypeOne.length > 0) { // If they've selected a type for display
							damageTypeOneObject = getProperty(armour[l+1], this.system.bodyType.damageTypeOne.toLowerCase()); // Set the DR
						}
						if (this.system.bodyType.damageTypeTwo.length > 0) { // If they've selected a second type for display
							damageTypeTwoObject = getProperty(armour[l+1], this.system.bodyType.damageTypeTwo.toLowerCase()); // Set the DR
						}

						if (this.system.bodyType.damageTypeOne.length > 0) {
							let bodyParts = Object.keys(damageTypeOneObject);
							for (let q = 0; q < bodyParts.length; q++) {
								if (this.system.bodyType.damageTypeOne.length > 0) { // If they've selected a type for display
									this.system.bodyType.drTypesOne[bodyParts[q]] += damageTypeOneObject[bodyParts[q]]
								}
								if (this.system.bodyType.damageTypeTwo.length > 0 && this.system.bodyType.damageTypeOne !== this.system.bodyType.damageTypeTwo ) { // If they've selected a second type for display
									this.system.bodyType.drTypesTwo[bodyParts[q]] += damageTypeTwoObject[bodyParts[q]]
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
		if (object) { // Make sure they have a body
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
		if (this.system) {
			if (this.system.reserves) { // Make sure reserves exist

				// Handle the calculations for HP
				this.system.reserves.hp.state = actorHelpers.fetchHpState(this);

				// Handle the calculations for FP
				this.system.reserves.fp.state = actorHelpers.fetchFpState(this);
			}
		}
	}

	partHP() {
		if (this.system) {
			if (this.system.bodyType) {
				if (this.system.bodyType.body) {
					let bodyParts = Object.keys(this.system.bodyType.body);

					for (let i = 0; i < bodyParts.length; i++){
						let currentPart = getProperty(this.system.bodyType.body, bodyParts[i]);

						if (currentPart.hp){//Part has hp info
							let hp = currentPart.hp.value;
							let state = "Fine";

							if(hp <= (currentPart.hp.max * -1)){ // If part HP is at or below a full negative multiple
								if (this.system.injuryTolerances.unbreakableBones) {
									state = "Crippled";
								}
								else {
									state = "Destroyed";
								}
							}
							else if(hp <= 0){ // If part HP is at or below a 0
								if (this.system.injuryTolerances.unbreakableBones) {
									state = "Injured";
								}
								else {
									state = "Crippled";
								}
							}
							else if (hp < currentPart.hp.max){ // If part HP is below max
								state = "Injured";
							}
							else { // Part is not damaged
								state = "Fine";
							}

							setProperty(this.system.bodyType.body, bodyParts[i] + ".hp.state",state);
						}

						if (getProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation")){//Part has sub parts
							let subParts = Object.keys(getProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation"));

							for (let n = 0; n < subParts.length; n++){
								let currentSubPart = getProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n]);
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

									setProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n] + ".hp.state",state);
								}
							}
						}
					}
				}
			}
		}
	}

	updateMagic() {
		this.system.showVanillaMagic = game.settings.get("gurps4e", "showVanillaMagic");
		this.system.showRPM = game.settings.get("gurps4e", "showRPM");

		if (this.system) {
			if (this.system.showVanillaMagic) { // The campaign is using the vanilla magic tab.
				this.updateVanillaMagic();
			}
			if (this.system.showRPM) { // The campaign is using the RPM tab.
				this.updateRPM();
			}
		}
	}

	updateVanillaMagic() {
		if (this.system.magic) { // Character has the magic block
			// Calculate the total magical attribute
			let totalMagicAttribute = 0;
			if (this.system.magic.attribute != "") { // Attribute is not blank
				totalMagicAttribute += skillHelpers.getBaseAttrValue(this.system.magic.attribute, this)
			}
			totalMagicAttribute += this.system.magic.attributeMod ? this.system.magic.attributeMod : 0;
			totalMagicAttribute += this.system.magic.magery ? this.system.magic.magery : 0;
			this.system.magic.totalMagicAttribute = totalMagicAttribute;
		}
	}

	updateRPM() {
		if (this.system.rpm) { // Character has the rpm block
			if (typeof this.system.rpm.coreSkill === "undefined") { // If the core skill is undefined
				this.system.rpm.coreSkill = "Thaumatology"; // Default to Thaumatology
			}
			else if (this.system.rpm.coreSkill === "") { // If the core skill is blank
				this.system.rpm.coreSkill = "Thaumatology"; // Default to Thaumatology
			}

			this.system.rpm.coreSkillLevel = skillHelpers.getSkillLevelByName(this.system.rpm.coreSkill, this) // Get the level of the core skill for this RPM caster

			if (typeof this.system.rpm.coreSkillLevel === 'undefined') {
				this.system.rpm.coreSkillLevel = 0;
			}

			this.system.rpm.totalEnergy = (this.system.rpm.magery * 3) + this.system.rpm.er;
			this.system.rpm.maxSkill = 12 + this.system.rpm.magery;
			this.system.rpm.maxConditional = this.system.rpm.magery + this.system.rpm.coreSkillLevel;

			let keys = Object.keys(this.system.rpm.path);

			this.system.rpm.coreSkillLevel = skillHelpers.getSkillLevelByName(this.system.rpm.coreSkill, this) // Get the level of the core skill for this RPM caster

			if (keys.length > 0) {
				for (let k = 0; k < keys.length; k++) {
					let path = getProperty(this.system.rpm.path, keys[k]);
					path.defaults = [
						{
							"skill": this.system.rpm.coreSkill,
							"mod": -6
						}
					]
					path.level = skillHelpers.computeSkillLevel(this, path); // Get the base skill level based on the points spent and any buying up from defaults
					path.level += path.mod; // Add path mod.
					path.level = Math.min(path.level, this.system.rpm.maxSkill, this.system.rpm.coreSkillLevel); // Apply the skill cap
				}
			}

			// Alchemy stuff
			// Set default values for max elixirs and expiry duration
			this.system.rpm.maxElixirs = 0;
			this.system.rpm.expiryDuration = 0;

			let rpmLimitAlchemySkillForElixirCap = game.settings.get("gurps4e", "rpmLimitAlchemySkill"); // Get the rule that defines how elixirs are limited

			if (typeof this.system.rpm.alchemySkill === "undefined") { // If the core skill is undefined
				this.system.rpm.alchemySkill = "Alchemy"; // Default to Alchemy
			}
			else if (this.system.rpm.alchemySkill === "") { // If the core skill is blank
				this.system.rpm.alchemySkill = "Alchemy"; // Default to Alchemy
			}

			this.system.rpm.uncappedAlchemySkillLevel = skillHelpers.getSkillLevelByName(this.system.rpm.alchemySkill, this) // Get the level of the core skill for this RPM caster

			if (typeof this.system.rpm.uncappedAlchemySkillLevel === 'undefined') { // For some reason the level came back undefined
				this.system.rpm.uncappedAlchemySkillLevel = 0; // Default to zero
			}

			if (rpmLimitAlchemySkillForElixirCap) {
				this.system.rpm.alchemySkillLevel = Math.min(this.system.rpm.uncappedAlchemySkillLevel, this.system.rpm.maxSkill); // Cap the alchemy skill
				this.system.rpm.alchemySkillLevelForElixirCap = this.system.rpm.alchemySkillLevel; // Then assign the elixir cap skill to be the same as the capped alchemy skill
			}
			else {
				this.system.rpm.alchemySkillLevelForElixirCap = this.system.rpm.uncappedAlchemySkillLevel // Assign the uncapped alchemy skill level to be the same as elixir cap skill.
				this.system.rpm.alchemySkillLevel = Math.min(this.system.rpm.uncappedAlchemySkillLevel, this.system.rpm.maxSkill); // Only then separately cap the alchemy skill
			}

			let rpmElixirLimit = game.settings.get("gurps4e", "rpmElixirLimit"); // Get the rule that defines how elixirs are limited
			if (rpmElixirLimit === "withConditional") {
				this.system.rpm.withConditional = true;
				this.system.rpm.byAlchemySkill = false;
				this.system.rpm.expiration = false;
			}
			else if (rpmElixirLimit === "byAlchemySkill") {
				this.system.rpm.byAlchemySkill = true;
				this.system.rpm.withConditional = false;
				this.system.rpm.expiration = false;

				this.system.rpm.maxElixirs = this.system.rpm.magery + this.system.rpm.alchemySkillLevelForElixirCap; // We're limiting elixirs by alchemy skill, so calculate the limit here.
			}
			else if (rpmElixirLimit === "expiration") {
				this.system.rpm.expiration = true;
				this.system.rpm.withConditional = false;
				this.system.rpm.byAlchemySkill = false;

				this.system.rpm.expiryDuration = (this.system.rpm.magery + this.system.rpm.uncappedAlchemySkillLevel) * 2; // We're limiting elixirs by expiration date, so calculate it here. Result is number of days
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
		console.log(selfToken.system.rotation)

		console.log(targetToken._validPosition)
		console.log(targetToken.system.rotation)

		let relativePosition = (Math.atan2(-(targetToken._validPosition.x - selfToken._validPosition.x), (targetToken._validPosition.y - selfToken._validPosition.y)) * 180 / Math.PI); // Takes the atan of the two sets of points after they have been rotated clockwise 90 degrees. This puts the 0 point towards the direction of facing with 180/-180 directly behind
		console.log(relativePosition);

		let targetFacing;
		if (targetToken.system.rotation > 180){ // Correct for facing angles of greater than 180 degrees. Valid range for this macro is -180 to 0 to 180. Not 0 to 360
			targetFacing = targetToken.system.rotation - 360;
		}
		else {
			targetFacing = targetToken.system.rotation
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

		let leftFrontBound = (0 - (selfToken.actor.system.vision.front / 2)); // Get all the bounds for front and side arcs
		let rightFrontBound = (0 + (selfToken.actor.system.vision.front / 2));
		let leftSideBound = (0 - (selfToken.actor.system.vision.side / 2));
		let rightSideBound = (0 + (selfToken.actor.system.vision.side / 2));

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
	// As in, the attacker is in front, in side, in rear of the target (For active defence purposes, depends on target's vision (Peripheral, 360, tunnel, etc)
	// As in, the attacker is ahead or behind the target (In physical space, has nothing to do with anyone's traits.
	getFacing(attackerToken, targetToken){ // !IMPORTANT. This method works. But tokens look out their bottom most of the time. Don't fuck with this, check token rotation and vision settings.
		let relativePosition = (Math.atan2(-(targetToken.x - attackerToken.x), (targetToken.y - attackerToken.y)) * 180 / Math.PI) + 180; // Takes the atan of the two sets of points after they have been rotated clockwise 90 degrees. This puts the 0 point towards the direction of facing with 180/-180 directly behind

		let targetFacing;
		if (targetToken.rotation > 180){ // Correct for facing angles of greater than 180 degrees. Valid range for this macro is -180 to 0 to 180. Not 0 to 360
			targetFacing = targetToken.rotation - 360;
		}
		else {
			targetFacing = targetToken.rotation
		}

		let relativeAngle = relativePosition - targetFacing; // Get the relative angle between the two tokens, corrected for the target's facing

		if (relativeAngle < -180){ // Correct for angles less than -180
			relativeAngle += 360;
		}
		else if (relativeAngle > 180){ // Correct for angles more than 180
			relativeAngle -= 360;
		}
		relativeAngle = Math.round(relativeAngle); // Round the angle so we don't get cases like 120.172 degrees.


		let attackerTokenActor = attackerToken.actor;
		if (!attackerTokenActor){
			attackerTokenActor = attackerToken.document.actor;
		}

		let targetTokenActor = targetToken.actor;
		if (!targetTokenActor){
			targetTokenActor = targetToken.document.actor;
		}

		let leftFrontBound	= (0 - (targetTokenActor.system.vision.front / 2)); // Get all the bounds for front and side arcs
		let rightFrontBound = (0 + (targetTokenActor.system.vision.front / 2));
		let leftSideBound	= (0 - (targetTokenActor.system.vision.side / 2));
		let rightSideBound	= (0 + (targetTokenActor.system.vision.side / 2));

		let facing;
		let position;

		// Determine which arc the attacker is standing in
		if (relativeAngle >= leftFrontBound && relativeAngle <= rightFrontBound){
			facing = 1; // Attacker is in the target's "front" vision arc
		}
		else if (relativeAngle >= leftSideBound && relativeAngle <= rightSideBound){
			facing = 0; // Attacker is in the target's "side" vision arc
		}
		else {
			facing = -1; // Attacker is in the target's "back" vision arc
		}

		let literalRear = game.settings.get("gurps4e", "literalRear");

		// Determine if the attacker is standing in front of or behind the target (In space, not relative to vision cones)
		if (((relativeAngle >= -90 && relativeAngle <= 90) && literalRear) || ((relativeAngle >= -120 && relativeAngle <= 120) && !literalRear)){
			position = 1; // Attacker is ahead of target in physical space
		}
		else {
			position = -1; // Attacker is behind target in physical space
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

	//Return a dialog that tells the user to pick only one target
	tooManyTargetsDialog(){
		let tooManyTargetsDialogContent = "<div>You have too many targets selected, make sure there is only one</div>";

		let tooManyTargetsDialog = new Dialog({
			title: "Select a target",
			content: tooManyTargetsDialogContent,
			buttons: {
				ok: {
					icon: '<i class="fas fa-check"></i>',
					label: "Ok"
				}
			},
			default: "ok"
		})

		return tooManyTargetsDialog;
	}

	singleTargetDialog(selfToken, targetToken){
		let attacks = this.listAttacks(selfToken.actor);

		let htmlContent = "<div>";

		let buttons = {};

		if (attacks.melee.length > 0) {
			buttons.melee = {
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
			}
			htmlContent += "<table>";

			htmlContent += "<tr><td colspan='8' class='trait-category-header' style='text-align: center;'>Melee Attacks</td></tr>";
			htmlContent += "<tr><td></td><td>Weapon</td><td>Attack</td><td>Level</td><td>Damage</td><td>Reach</td><td>Parry</td><td>ST</td></tr>";

			for (let x = 0; x < attacks.melee.length; x++){
				htmlContent += "<tr>";
				if (x == 0) {
					htmlContent += "<td><input checked type='radio' id='melee" + x + "' name='melee' value='" + x + "'></td>";
				}
				else {
					htmlContent += "<td><input type='radio' id='melee" + x + "' name='melee' value='" + x + "'></td>";
				}
				htmlContent += "<td>" + attacks.melee[x].weapon + "</td>";
				htmlContent += "<td>" + attacks.melee[x].name + "</td>";
				htmlContent += "<td>" + attacks.melee[x].level + "</td>";

				if(attacks.melee[x].armourDivisor == 1){//Only show armour divisor if it's something other than 1
					htmlContent += "<td>" + attacks.melee[x].damage + " " + attacks.melee[x].damageType + "</td>";
				}
				else {
					htmlContent += "<td>" + attacks.melee[x].damage + " " + attacks.melee[x].damageType + " " + "(" + attacks.melee[x].armourDivisor + ")</td>";
				}

				htmlContent += "<td>" + attacks.melee[x].reach + "</td>";
				htmlContent += "<td>" + attacks.melee[x].parry + attacks.melee[x].parryType + "</td>";
				htmlContent += "<td>" + attacks.melee[x].st + "</td>";
				htmlContent += "</tr>";
			}

			htmlContent += "</table>";
		}

		if (attacks.ranged.length > 0){
			buttons.ranged = {
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
				}
			htmlContent += "<table>";

			htmlContent += "<tr><td colspan='12' class='trait-category-header' style='text-align: center;'>Ranged Attacks</td></tr>";
			htmlContent += "<tr><td></td><td>Weapon</td><td>Attack</td><td>Level</td><td>Damage</td><td>Acc</td><td>Range</td><td>RoF</td><td>Shots</td><td>ST</td><td>Bulk</td><td>Rcl</td></tr>";

			for (let q = 0; q < attacks.ranged.length; q++){
				htmlContent += "<tr>";
				if (q == 0) {
					htmlContent += "<td><input checked type='radio' id='range" + q + "' name='range' value='" + q + "'></td>";
				}
				else {
					htmlContent += "<td><input type='radio' id='range" + q + "' name='range' value='" + q + "'></td>";
				}
				htmlContent += "<td>" + attacks.ranged[q].weapon + "</td>";
				htmlContent += "<td>" + attacks.ranged[q].name + "</td>";
				htmlContent += "<td>" + attacks.ranged[q].level + "</td>";
				if(attacks.ranged[q].armourDivisor == 1){//Only show armour divisor if it's something other than 1
					htmlContent += "<td>" + attacks.ranged[q].damage + " " + attacks.ranged[q].damageType + "</td>";
				}
				else {
					htmlContent += "<td>" + attacks.ranged[q].damage + " " + attacks.ranged[q].damageType + " " + "(" + attacks.ranged[q].armourDivisor + ")</td>";
				}
				htmlContent += "<td>" + (attacks.ranged[q].acc ? attacks.ranged[q].acc : 0) + "</td>";
				htmlContent += "<td>" + attacks.ranged[q].range + "</td>";
				htmlContent += "<td>" + attacks.ranged[q].rof + "</td>";
				htmlContent += "<td>" + attacks.ranged[q].shots + "</td>";
				htmlContent += "<td>" + attacks.ranged[q].st + "</td>";
				htmlContent += "<td>" + attacks.ranged[q].bulk + "</td>";
				htmlContent += "<td>" + (attacks.ranged[q].rcl ? attacks.ranged[q].rcl : 1) + "</td>";
				htmlContent += "</tr>";
			}

			htmlContent += "</table>";
		}

		if (attacks.affliction.length > 0){
			buttons.affliction = {
					icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z" class=""></path></svg>',
						label: "Select Affliction",
						callback: () => {
						let elements = document.getElementsByName('affliction');
						let attack;
						for (let e = 0; e < elements.length; e++){
							if(elements[e].checked){
								attack = e;
							}
						}
						if (typeof attack !== "undefined") {
							this.afflictionOnTarget(selfToken, attacks.affliction[attack], targetToken)
						}
					}
				}
			htmlContent += "<table>";

			htmlContent += "<tr><td colspan='12' class='trait-category-header' style='text-align: center;'>Afflictions</td></tr>";
			htmlContent += "<tr><td></td><td>Affliction</td><td>Name</td><td>Level</td><td>Damage</td><td>Resistance Roll</td><td>Rule Of</td></tr>";

			for (let q = 0; q < attacks.affliction.length; q++){
				htmlContent += "<tr>";
				if (q == 0) {
					htmlContent += "<td><input checked type='radio' id='affliction" + q + "' name='affliction' value='" + q + "'></td>";
				}
				else {
					htmlContent += "<td><input type='radio' id='affliction" + q + "' name='affliction' value='" + q + "'></td>";
				}
				htmlContent += "<td>" + attacks.affliction[q].weapon + "</td>";
				htmlContent += "<td>" + attacks.affliction[q].name + "</td>";
				htmlContent += "<td>" + attacks.affliction[q].level + "</td>";
				if(attacks.affliction[q].armourDivisor == 1){//Only show armour divisor if it's something other than 1
					htmlContent += "<td>" + attacks.affliction[q].damage + " " + attacks.affliction[q].damageType + "</td>";
				}
				else {
					htmlContent += "<td>" + attacks.affliction[q].damage + " " + attacks.affliction[q].damageType + " " + "(" + attacks.affliction[q].armourDivisor + ")</td>";
				}
				htmlContent += "<td>" + attacks.affliction[q].resistanceRoll + " " + attacks.affliction[q].resistanceRollPenalty + "</td>";
				htmlContent += "<td>" + attacks.affliction[q].ruleOf + "</td>";
				htmlContent += "</tr>";
			}

			htmlContent += "</table>";
		}

		buttons.cancel = {
			icon: '<i class="fas fa-times"></i>',
				label: "Cancel",
				callback: () => {}
		}

		htmlContent += "</div>";

		let singleTargetModal = new Dialog({
			title: "SHOW ME YOUR MOVES",
			content: htmlContent,
			buttons: buttons,
			default: "cancel",
			render: html => console.info("Register interactivity in the rendered dialog"),
			close: html => console.info("This always is logged no matter which option is chosen")
		},{
			resizable: true,
			width: "500"
		})

		return singleTargetModal;
	}

	listAttacks(actor){
		let meleeAttacks = [];
		let rangedAttacks = [];
		let afflictionAttacks = [];
		let melee;
		let ranged;
		let affliction;

		actor.items.forEach((item) => {
			if (item.type == "Trait" || item.type == "Equipment" || item.type == "Spell" || item.type == "Custom Weapon" || item.type == "Custom Armour" || item.type == "Travel Fare" || (item.type == "Ritual" && item.system.quantity > 0)){
				if (item.system.melee) {
					let meleeKeys = Object.keys(item.system.melee); // Collect all the melee keys
					for (let m = 0; m < meleeKeys.length; m++){
						melee = getProperty(item.system.melee, meleeKeys[m]);
						melee.weapon = item.name
						meleeAttacks.push(melee);
					}
				}

				if (item.system.ranged) {
					let rangedKeys = Object.keys(item.system.ranged); // Collect all the ranged keys
					for (let r = 0; r < rangedKeys.length; r++){
						ranged = getProperty(item.system.ranged, rangedKeys[r]);
						ranged.weapon = item.name

						rangedAttacks.push(ranged);
					}
				}

				if (item.system.affliction) {
					let afflictionKeys = Object.keys(item.system.affliction); // Collect all the affliction keys
					for (let a = 0; a < afflictionKeys.length; a++){
						affliction = getProperty(item.system.affliction, afflictionKeys[a]);
						affliction.weapon = item.name;
						affliction.type = "affliction";

						afflictionAttacks.push(affliction);
					}
				}
			}
		})

		return { "melee": meleeAttacks, "ranged": rangedAttacks, "affliction": afflictionAttacks}
	}

	attackOnTarget(attacker, attack, target) {
		let bodyParts = Object.keys(target.actor.system.bodyType.body); // Collect all the bodypart names
		let relativePosition = this.getFacing(attacker, target); // Method returns [facing,position]

		let locationSelector = "<table>" +
			"<tr><td>Location</td><td><select name='hitLocation' id='hitLocation'>"
		for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
			let part = getProperty(target.actor.system.bodyType.body, bodyParts[i])
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
				rof.shots = Math.max(split[0], 1);
				rof.pellets = Math.max(split[1], 1);
			}
			else if (attack.rof.toString().toLowerCase().includes("*")){
				split = attack.rof.toString().toLowerCase().split("*")
				rof.shots = Math.max(split[0], 1);
				rof.pellets = Math.max(split[1], 1);
			}
			else if (typeof attack.rof === "number"){
				rof.shots = Math.max(attack.rof, 1);
				rof.pellets = 1;
			}
			else {
				rof.shots = Math.max(attack.rof.trim(), 1);
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
			render: html => console.info("Register interactivity in the rendered dialog"),
			close: html => console.info("This always is logged no matter which option is chosen")
		},{
			resizable: true,
			width: "500"
		})

		hitLocationModal.render(true);
	}

	afflictionOnTarget(attacker, attack, target) {
		let staffLength = game.scenes.get(target.scene.id).tokens.get(attacker.id).actor.system.magic.staff; // Get the length of the player's staff

		// If it's not a number, or it is a NaN
		if (typeof staffLength !== "number" || staffLength.isNaN) {
			staffLength = 0;
		}

		let distanceRaw = Math.round(canvas.grid.measureDistance(attacker, target)); // Get the raw distance between target and attacker
		let distanceYards = distanceHelpers.convertToYards(distanceRaw, canvas.scene.grid.units); // Convert the raw distance to the distance in yards

		let modifiedDistanceYards = Math.max(distanceYards - staffLength, 0); // Reduce the distance in yards by the length of the staff
		let distancePenalty = 0;

		if (attack.rangePenalties == "regular") {
			distancePenalty = -modifiedDistanceYards; // Regular range penalty is just the distance in yards
		}
		else if (attack.rangePenalties == "ssrt") {
			distancePenalty = distanceHelpers.distancePenalty(modifiedDistanceYards); // Call the distance helper to get the ssrt range penalty
		}
		else if (attack.rangePenalties == "long") {
			distancePenalty = distanceHelpers.longDistancePenalty(modifiedDistanceYards); // Call the distance helper to get the long range penalty
		}
		else if (attack.rangePenalties == "none") {
			distancePenalty = 0;
		}
		else {
			distancePenalty = -modifiedDistanceYards; // If they don't make a selection, assume regular spell penalties
		}

		let totalModifier = distancePenalty;

		let modModalContent =  "<table>";
		modModalContent += "<tr><td>Distance (" + distanceRaw + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td></tr>"; // Display the distance penalty

		let odds = rollHelpers.levelToOdds(+attack.level + +totalModifier)

		modModalContent += "<tr><td>Total Modifier</td><td>" + totalModifier + "</td></tr>" +
			"<tr><td>Effective Skill</td><td>" + (+attack.level + +totalModifier) + "</td></tr>" +
			"<tr><td>Odds</td><td><span style='font-weight: bold; color: rgb(208, 127, 127)'>" + odds.critFail + "%</span>/<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + odds.success + "%</span>/<span style='font-weight: bold; color: rgb(106, 162, 106)'>" + odds.critSuccess + "%</span></td></tr>" +
			"<tr><td>Additional Modifier</td><td><input type='number' id='mod' name='mod' value='0' style='width: 50%'/></td></tr>" +
			"</table>";

		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: modModalContent,
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val();
						this.reportAfflictionResult(target, attacker, attack, (+totalModifier + +mod))
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: () => {
						this.reportAfflictionResult(target, attacker, attack, totalModifier)
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
			render: html => console.info("Register interactivity in the rendered dialog"),
			close: html => console.info("This always is logged no matter which option is chosen")
		})
		modModal.render(true)
	}

	// This runs to calculate and display the result of an attacker attempting to cast an affliction.
	// On success it provides buttons for the defender to choose from
	// On a failure it simply reports failure
	reportAfflictionResult(target, attacker, attack, totalModifiers) {
		let label = attacker.name + " casts " + attack.weapon + " " + attack.name + " on " + target.name + "."; // Label for the roll

		rollHelpers.skillRoll(attack.level, totalModifiers, label, false).then( rollInfo => { // Make the roll
			let messageContent = rollInfo.content; // Begin message content with the result from the skill roll
			let flags = {} // Init flags which will be used to pass data between chat messages

			if (rollInfo.success == false) { // If they failed, report failure and stop
				messageContent += attacker.name + "'s spell fails</br>";
			}
			else { // If they succeed
				messageContent += attacker.name + "'s spell succeeds</br>"; // Inform the players

				// Build the response options based on the resistance type of the attack
				if (attack.resistanceType == "contest") { // If they've selected quick contest, only show the quick contest and no defence buttons
					messageContent += "</br><input type='button' class='quickContest' value='Quick Contest'/><input type='button' class='noResistanceRoll' value='No Defence'/>"
				}
				else if (attack.resistanceType == "resistance") { // If they've selected resistance, only show the resistance and no defence buttons
					messageContent += "</br><input type='button' class='attemptResistanceRoll' value='Resistance Roll'/><input type='button' class='noResistanceRoll' value='No Defence'/>"
				}
				else if (attack.resistanceType == "irresistible") { // If they've selected irrisistable, only show the no defence button
					messageContent += "</br><input type='button' class='noResistanceRoll' value='No Defence'/>"
				}
				else { // If they've not set a type, or if there's an issue, show all the buttons and let them pick.
					messageContent += "</br><input type='button' class='quickContest' value='Quick Contest'/><input type='button' class='attemptResistanceRoll' value='Resistance Roll'/><input type='button' class='noResistanceRoll' value='No Defence'/>"
				}

				if (rollInfo.crit == true) { // If they crit, pass a note about the effect of crit success
					messageContent += "<br><br><span style='font-style: italic;'>Important note, criticals have no impact on success/failure of quick contests beyond resulting in a very good or very bad margin of success.<br>" +
						"They also don't generally impact whether or not someone gets a resistance roll.</span>";
				}

				flags = { // Compile flags that will be passed along through the chat messages
					target: target.id,
					attacker: attacker.id,
					scene: target.scene.id,
					attack: attack,
					margin: rollInfo.margin,
					effectiveSkill: (+attack.level + +totalModifiers)
				}
			}
			// Everything is assembled, send the message
			ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type, flags: flags});
		})
	}

	noResistanceRoll(event) {
		event.preventDefault();
		let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
		this.applyAffliction(flags);
	}

	knockbackFallRoll(event) {
		event.preventDefault();
		let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
		let target = game.scenes.get(flags.scene).tokens.get(flags.target).actor; // Fetch the target using the appropriate methods

		let judo = skillHelpers.getSkillLevelByName("Judo", target);
		let acro = skillHelpers.getSkillLevelByName("Acrobatics", target);
		let dx = skillHelpers.getBaseAttrValue("dx", target);

		judo = typeof judo !== 'undefined' ? judo : 0
		acro = typeof acro !== 'undefined' ? acro : 0
		dx = typeof dx !== 'undefined' ? dx : 0

		let skill = 10;
		let message = "";

		if (judo > acro && judo > dx) { // Judo is highest
			skill = judo;
			message = "Judo";
		} else if (acro > dx) { // Acro is highest
			skill = acro;
			message = "Acrobatics";
		} else { // DX is highest
			skill = dx;
			message = "Dexterity";
		}



		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: "<input type='text' id='mod' name='mod' value='0'/>",
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val()
						this.makeKnockbackRoll(skill, mod, message, target)
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: () => this.makeKnockbackRoll(skill, 0, message, target)
				}
			},
			default: "mod",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		})
		modModal.render(true)
	}

	async makeKnockbackRoll(skill, mod, message, target) {
		let currentRoll = await rollHelpers.skillRoll(skill, mod, "Rolls against " + message + " to not fall down.", false);

		let html = currentRoll.content;

		if (currentRoll.success) {
			html += "<br/>" + target.name + " doesn't fall down."
		}
		else {
			html += "<br/>" + target.name + " falls down."
		}

		ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });

		postureHelpers.setPostureTokenDoc(target.token, "lyingback");
	}

	// This is run when a defender clicks the "Quick Contest" button after being the target of an affliction
	quickContest(event) {
		let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags; // Get the flags which hold all the actual data
		let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor; // Fetch the target using the appropriate methods
		let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;// Fetch the attacker using the appropriate methods
		let attack 			= flags.attack; // Fetch the attack from the flags

		// Build the message displayed on the dialog asking the user for any modifiers
		let modModalContent = "<div>" + attacker.name + " is casting " + attack.weapon + " " + attack.name + " on you.</div>";

		if (attack.resistanceRollPenalty > 0) {
			modModalContent += "<div>" + "It is a quick contest of " + attack.resistanceRoll + " + " + attack.resistanceRollPenalty + " </div>";
		}
		else if (attack.resistanceRollPenalty < 0) {
			modModalContent += "<div>" + "It is a quick contest of " + attack.resistanceRoll + " - " + attack.resistanceRollPenalty + " </div>";
		}
		else {
			modModalContent += "<div>" + "It is a quick contest of " + attack.resistanceRoll + " </div>";
		}
		modModalContent += "<div>Modifier: <input type='number' placeholder='Modifier' id='mod' name='mod' value='0' style='width: 50%'/></div>";

		// Build the dialog itself
		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: modModalContent,
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val(); // Get the modifier from the input field
						this.reportQuickContestResult(target, attacker, attack, flags, +mod)
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: () => {
						this.reportQuickContestResult(target, attacker, attack, flags, 0)
					}
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: () => {} // Do nothing
				}
			},
			default: "mod",
			render: html => console.info("Register interactivity in the rendered dialog"),
			close: html => console.info("This always is logged no matter which option is chosen")
		})
		modModal.render(true);
	}

	// This method takes the modifier from the defender and uses it to determine the results of the quick contest
	reportQuickContestResult(target, attacker, attack, flags, mod) {
		let label = target.name + " attempts to resist the " + attack.weapon + " " + attack.name + " cast by " + attacker.name + "."; // Setup the label that heads the chat message
		let resistanceLevel = +actorHelpers.fetchStat(target, attack.resistanceRoll); // Fetch the resistance level based on the attack's target attribute
		let effectiveResistanceLevel = resistanceLevel + +mod + +attack.resistanceRollPenalty; // Figure out the effective level based on the above, the modifier from the attack, and the modifier provided by the user
		let margin = flags.margin; // Get the margin from the flags
		let effectiveSkill = flags.effectiveSkill;

		let ruleOfLimiter = Math.max(+attack.ruleOf, +effectiveResistanceLevel) // Limiter is the higher of Rule of 16/13/X and the target's resistance roll.

		if (margin >= 0) { // If it was a success, check for Rule of 16/13/X
			if (effectiveSkill > ruleOfLimiter) { // The attacker's skill was higher than Rule of 16/13/X, correct for that.
				margin = margin - (effectiveSkill - ruleOfLimiter); // Subtract the difference between the skill level and Rule Of from the margin of success to determine the effective margin
				margin = Math.max(margin, 0); // Even if rule of 16/13/X drops it down, the effective margin will always be at least zero
			}
		}

		rollHelpers.skillRoll(resistanceLevel, (+mod + +attack.resistanceRollPenalty), label, false).then( rollInfo => { // Make the defender's roll
			let messageContent = rollInfo.content; // Start the message with the string returned by the skillRoll helper
			messageContent += "<br>"
			messageContent += attacker.name + " has an effective margin of success of <span style='font-weight: bold'>" + margin + "</span> after modifiers and the Rule of <span style='font-weight: bold'>" + attack.ruleOf + "</span><br><br>"; // Inform the user of the attacker's effective margin of success and mention the Rule of X

			if (rollInfo.success == false) { // Target failed the roll entirely
				messageContent += "<span style='font-weight: bold; color: rgb(199, 137, 83);'>" + target.name + " fails to resist</span></br>"; // Tell everyone
				this.applyAffliction(flags); // Call the method that applies the affliction effects
			}
			else if (rollInfo.margin < margin) { // Target succeeded, but by less than the attacker did
				messageContent += "<span style='font-weight: bold; color: rgb(199, 137, 83)'>" + target.name + " succeeds by <span style='font-weight: bold'>" + rollInfo.margin + "</span> but fails to resist</span></br>"; // Tell everyone
				this.applyAffliction(flags); // Call the method that applies the affliction effects
			}
			else if (rollInfo.margin >= margin) { // Target succeeded, tieing or beating the attacker
				messageContent +=  "<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + target.name + " succeeds by <span style='font-weight: bold'>" + rollInfo.margin + "</span> and resists successfully</span></br>"; // Tell everyone
			}
			else { // None of the above caught the result
				messageContent += "Some weird shit has happened.</br>" + // Let the users know that some weird shit has happened but nothing has changed on the target of the affliction
					"No effects or damage will apply.</br>" +
					"The data has been printed to the log.</br>"
				console.error(target, attacker, attack, flags, mod, resistanceLevel, effectiveResistanceLevel, margin, ruleOfLimiter) // Print the error to console
			}

			if (rollInfo.crit == true) { // The result was a crit, which doesn't actually do anything in quick contests
				messageContent += "<span style='font-style: italic;'>Important note, criticals have no impact on success/failure of quick contests beyond resulting in a very good or very bad margin of success.</span>"; // Inform the players of this fact
			}

			ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type}); // Send the actual message
		});
	}

	// This is run when a defender clicks the "Quick Contest" button after being the target of an affliction
	attemptResistanceRoll(event) {
		let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags; // Get the flags which hold all the actual data
		let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor; // Fetch the target using the appropriate methods
		let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;// Fetch the attacker using the appropriate methods
		let attack 			= flags.attack; // Fetch the attack from the flags

		// Build the message displayed on the dialog asking the user for any modifiers
		let modModalContent = "<div>" + attacker.name + " is casting " + attack.weapon + " " + attack.name + " on you.</div>";

		if (attack.resistanceRollPenalty > 0) {
			modModalContent += "<div>" + "You are resisting with " + attack.resistanceRoll + " + " + attack.resistanceRollPenalty + " </div>";
		}
		else if (attack.resistanceRollPenalty < 0) {
			modModalContent += "<div>" + "You are resisting with " + attack.resistanceRoll + " - " + attack.resistanceRollPenalty + " </div>";
		}
		else {
			modModalContent += "<div>" + "You are resisting with " + attack.resistanceRoll + " </div>";
		}

		modModalContent += "<div>Modifier: <input type='number' placeholder='Modifier' id='mod' name='mod' value='0' style='width: 50%'/></div>";

		// Build the dialog itself
		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: modModalContent,
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val(); // Get the modifier from the input field
						this.reportResistanceRollResult(target, attacker, attack, flags, +mod)
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: () => {
						this.reportResistanceRollResult(target, attacker, attack, flags, 0)
					}
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: () => {} // Do nothing
				}
			},
			default: "mod",
			render: html => console.info("Register interactivity in the rendered dialog"),
			close: html => console.info("This always is logged no matter which option is chosen")
		})
		modModal.render(true);
	}

	// This method takes the modifier from the defender and uses it to determine the results of the resistance roll
	reportResistanceRollResult(target, attacker, attack, flags, mod) {
		let label = target.name + " attempts to resist the " + attack.weapon + " " + attack.name + " cast by " + attacker.name + "."; // Setup the label that heads the chat message
		let resistanceLevel = +actorHelpers.fetchStat(target, attack.resistanceRoll); // Fetch the resistance level based on the attack's target attribute
		let effectiveResistanceLevel = resistanceLevel + +mod + +attack.resistanceRollPenalty; // Figure out the effective level based on the above, the modifier from the attack, and the modifier provided by the user

		rollHelpers.skillRoll(resistanceLevel, (+mod + +attack.resistanceRollPenalty), label, false).then( rollInfo => { // Make the defender's resistance roll
			let messageContent = rollInfo.content; // Start the message with the string returned by the skillRoll helper
			messageContent += "<br>"

			if (rollInfo.success == false) { // Target failed the roll
				messageContent += "<span style='font-weight: bold; color: rgb(199, 137, 83);'>" + target.name + " fails to resist</span></br>"; // Tell everyone
				this.applyAffliction(flags); // Call the method that applies the affliction effects
			}
			else if (rollInfo.success == true) { // Target succeeded
				messageContent += "<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + target.name + " resists</span></br>"; // Tell everyone
				this.applyAffliction(flags); // Call the method that applies the affliction effects
			}
			else { // None of the above caught the result
				messageContent += "Some weird shit has happened.</br>" + // Let the users know that some weird shit has happened but nothing has changed on the target of the affliction
					"No effects or damage will apply.</br>" +
					"The data has been printed to the log.</br>"
				console.error(target, attacker, attack, flags, mod, resistanceLevel, effectiveResistanceLevel, margin, ruleOfLimiter) // Print the error to console
			}

			ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type}); // Send the actual message
		});
	}

	async applyAffliction(flags) {
		let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor;
		let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;
		let attack 			= flags.attack;

		if (attack.damage == 0 || attack.damage == "") {
			let html = "<div>Damage for " + attacker.name + "'s " + attack.weapon + " " + attack.name + " against " + target.name + "</div>";
			html += "<hr>" + attack.desc + "<br>"
			html += "<hr>";
			ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
		}
		else {
			let locationsHit = ['upperChest.subLocation.chest'];
			await this.applyDamage(flags, locationsHit, attack.desc);
		}
	}

	selectedRandom(target, attacker, attack, relativePosition, rof) { // Select random hit location
		let locations = [];
		for (let i = 0; i < rof.rof; i++){ // Find a different hit location for each shot
			let generalLocation = this.randomHitLocation(target, relativePosition) // Select a random location
			if (generalLocation.subLocation){ // Check to see if there are sub locations
				let specificLocation = this.randomComplexHitLocation(generalLocation, relativePosition); // Get the sub location
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
				let specificLocation = this.randomComplexHitLocation(generalLocation, relativePosition); // Get the sub location
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
			let generalLocation = getProperty(target.actor.system.bodyType.body, locationHit); // Get specific hit location

			if (generalLocation.subLocation){ // Check to see if there are sub locations
				let specificLocation = this.randomComplexHitLocation(generalLocation, relativePosition); // Get the sub location
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
		let location = getProperty(target.actor.system.bodyType.body, locationHit)

		if (location.subLocation){ // Make sure there are even complex hit locations to choose
			let bodyParts = Object.keys(getProperty(target.actor.system.bodyType.body, locationHit + ".subLocation")); // Collect all the bodypart names

			let complexLocationSelector = ""
			complexLocationSelector += "<select name='complexHitLocation' id='complexHitLocation'>"
			for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
				let part = getProperty(target.actor.system.bodyType.body, locationHit + ".subLocation." + bodyParts[i])

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
								let location = getProperty(target.actor.system.bodyType.body, elements[0].value)
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
				render: html => console.info("Register interactivity in the rendered dialog"),
				close: html => console.info("This always is logged no matter which option is chosen")
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

	randomHitLocation(target, relativePosition){
		let targetBody = target.actor.system.bodyType;
		let bodyParts = Object.keys(targetBody.body);

		let roll;
		if (relativePosition[1] == 1) { // If the target is facing the attacker
			roll = Math.random() * (targetBody.totalWeightFront - 0) + 0; // Roll a number between 0 and the target's total front weight.
		}
		else { // If the target is facing away from the attacker
			roll = Math.random() * (targetBody.totalWeightBack - 0) + 0; // Roll a number between 0 and the target's total back weight.
		}

		let part;

		let i = -1;
		do {
			i += 1; // Itterate the index
			part = getProperty(targetBody.body, bodyParts[i]); // Get the part for the current index
			if (relativePosition[1] == 1) { // If the target is facing the attacker
				if (typeof part.weightFront !== "undefined") { // Make sure this entry is not undefined. If it is undefined we don't need to do anything.
					roll -= part.weightFront; // Subtract its weight from the rolled weight
				}

			}
			else {
				if (typeof part.weightBack !== "undefined") { // Make sure this entry is not undefined. If it is undefined we don't need to do anything.
					roll -= part.weightBack; // Subtract its weight from the rolled weight
				}
			}
		} while (roll > 0) // If the roll drops below zero, stop looping

		let location = part; // Whatever the last part we accessed is the 'rolled' part.

		return location;
	}

	randomTorsoLocation(target){
		let targetBody = target.actor.system.bodyType;
		let bodyParts = Object.keys(targetBody.body);
		let torsoParts = [];

		for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
			if (bodyParts[i].toLowerCase().includes("chest") || bodyParts[i].toLowerCase().includes("abdomen")){ // If it's part of the torso, add it to the array to be searched
				if (!(bodyParts[i] === "upperchest")) { // Hotfix for issue where upperchest would sometimes incorrectly get added as a body part
					torsoParts.push(bodyParts[i])
				}
			}
		}

		let torsoPartsIndex = Math.floor(Math.random() * (torsoParts.length)); // Generate a random number between 0 and the max index

		return getProperty(targetBody.body, torsoParts[torsoPartsIndex]);
	}

	randomComplexHitLocation(generalLocation, relativePosition){
		let subLocations = Object.keys(generalLocation.subLocation);

		let roll;
		if (relativePosition[1] == 1) { // If the target is facing the attacker
			roll = Math.random() * (generalLocation.totalSubWeightFront - 0) + 0; // Roll a number between 0 and the target's total front weight.
		}
		else { // If the target is facing away from the attacker
			roll = Math.random() * (generalLocation.totalSubWeightBack - 0) + 0; // Roll a number between 0 and the target's total back weight.
		}

		let part;

		let i = -1;
		do {
			i += 1; // Itterate the index
			part = getProperty(generalLocation.subLocation, subLocations[i]); // Get the part for the current index
			if (relativePosition[1] == 1) { // If the target is facing the attacker
				roll -= part.weightFront; // Subtract it's weight from the rolled weight
			}
			else {
				roll -= part.weightBack; // Subtract it's weight from the rolled weight
			}
		} while (roll > 0) // If the roll drops below zero, stop looping

		let subLocation = part; // Whatever the last part we accessed is the 'rolled' part.

		return subLocation;
	}

	getSM(actor) {
		let sm = 0;
		if (actor) { // Make sure all the data is present
			if (actor.token){ // If this is a token
				if (actor.token.actor){ // Make sure the data structure exists
					if (actor.token.actor.system){
						if (actor.token.actor.system.bio){
							if (actor.token.actor.system.bio.sm){
								if (actor.token.actor.system.bio.sm.value){
									if (actor.token.actor.system.bio.sm.value == "" || actor.token.actor.system.bio.sm.value == null || typeof actor.token.actor.system.bio.sm.value == "undefined") { // SM is blank, null, or undefined
										sm = 0; // Default zero
									}
									else { // SM is not blank, null, or undefined
										sm = actor.token.actor.system.bio.sm.value; // Set SM equal to the actor's SM value
									}
								}
							}
						}
					}
				}
			}
			else if (actor.data) { // If this is not a token
				if (actor.system) { // Make sure the data structure exists
					if (actor.system.bio) {
						if (actor.system.bio.sm) {
							if (actor.system.bio.sm.value) {
								if (actor.system.bio.sm.value == "" || actor.system.bio.sm.value == null || typeof actor.system.bio.sm.value == "undefined") { // SM is blank, null, or undefined
									sm = 0; // Default zero
								}
								else { // SM is not blank, null, or undefined
									sm = actor.system.bio.sm.value; // Set SM equal to the actor's SM value
								}
							}
						}
					}
				}
			}
		}
		return sm; // Return 0 if the above does not retrieve a value
	}

	// This method handles all attack modifiers for both ranged and melee attacks
	attackModifiers(target, attacker, attack, relativePosition, rof, location, locationPenalty) {
		let distanceRaw = Math.round(canvas.grid.measureDistance(attacker, target));
		let distanceYards = distanceHelpers.convertToYards(distanceRaw, canvas.scene.grid.units);
		let distancePenalty = distanceHelpers.distancePenalty(distanceYards);

		let damageType = this.extractDamageType(attack);

		let rofBonus = generalHelpers.rofToBonus(rof.rof);
		if (typeof rofBonus == "undefined") { // RoF is sometimes coming through undefined. Catch that.
			rofBonus = 0;
		}
		let totalModifier;
		let sizeModModifier = 0;

		let modModalContent =  "<table>" +
			"<tr><td>Hit Location</td><td>" + locationPenalty + "</td><td>The penalty for the selected hit location.</td></tr>"

		let smMessage = "";

		if (attack.type === "ranged") {
			// Sort out the effective SM modifier based on the game's settings and the attacker/target SM
			if (game.settings.get("gurps4e", "rangedRelativeSM")) { // Game is using relative SM rules for ranged attacks
				sizeModModifier = this.getSM(target.actor) - this.getSM(attacker.actor);
				smMessage = "The modifier for the relative size difference between target and attacker";
			}
			else {
				sizeModModifier = this.getSM(target.actor);
				smMessage = "The modifier for the target's size";
			}

			totalModifier = (distancePenalty + locationPenalty + rofBonus + sizeModModifier); // Total up the modifiers
			modModalContent += "<tr><td>Distance (" + distanceRaw + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>The penalty for the given distance</td></tr>" + // Display the ranged specific modifiers
								"<tr><td>RoF Bonus:</td><td>" + rofBonus + "</td><td>The bonus for the selected rate of fire</td></tr>";
		}
		else if (attack.type === "melee") {
			// Sort out the effective SM modifier based on the game's settings and the attacker/target SM
			if (game.settings.get("gurps4e", "meleeRelativeSM")) { // Game is using relative SM rules for melee attacks
				sizeModModifier = this.getSM(target.actor) - this.getSM(attacker.actor);
				smMessage = "The modifier for the relative size difference between target and attacker";
			}
			else {
				sizeModModifier = this.getSM(target.actor);
				smMessage = "The modifier for the target's size";
			}

			totalModifier = locationPenalty + sizeModModifier; // Total up the modifiers
		}

		modModalContent += "<tr><td>SM Modifier:</td><td>" + sizeModModifier + "</td><td>" + smMessage + "</td></tr>";

		let odds = rollHelpers.levelToOdds(+attack.level + +totalModifier)

		modModalContent += "<tr><td>Total Modifier</td><td>" + totalModifier + "</td><td>This total only includes modifiers listed above</td></tr>" +
			"<tr><td>Effective Skill</td><td>" + (+attack.level + +totalModifier) + "</td><td>Effective skill before any of the below modifiers</td></tr>" +
			"<tr><td>Odds</td><td><span style='font-weight: bold; color: rgb(208, 127, 127)'>" + odds.critFail + "%</span>/<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + odds.success + "%</span>/<span style='font-weight: bold; color: rgb(106, 162, 106)'>" + odds.critSuccess + "%</span></td><td>These odds do not factor in any of the below modifiers</td></tr>" +
			"<tr><td>Move and Attack</td><td><input type='checkbox' class='checkbox' id='moveAndAttack' value='moveAndAttack' name='moveAndAttack' /></td><td>This handles both melee and ranged move and attacks with their respective rules</td></tr>"

		// If the damage type is explosive, allow the user to decide between area targeted and contact targeted attacks
		if (damageType.explosive) {
			modModalContent += "<tr><td>Target The Hex</td><td><input type='checkbox' class='checkbox' id='targetHex' value='targetHex' name='contactEx' /></td><td>The macro assumes you're targeting the actual actor. Check this box to claim the +4 bonus for targeting the ground at their feet.</td></tr>"
		}

		modModalContent += "<tr><td>Additional Modifier</td><td><input type='number' id='mod' name='mod' value='0' style='width: 50%'/></td><td>This is a catchall for anything not included above</td></tr>" +
			"</table>"

		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: modModalContent,
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val();
						let moveAndAttack = html.find('#moveAndAttack')[0].checked;
						let targetHex = (typeof html.find('#targetHex')[0] !== "undefined") ? html.find('#targetHex')[0].checked : false;
						this.reportHitResult(target, attacker, attack, relativePosition, rof, location, (+totalModifier + +mod), moveAndAttack, targetHex)
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: (html) => {
						let moveAndAttack = html.find('#moveAndAttack')[0].checked;
						let targetHex = (typeof html.find('#targetHex')[0] !== "undefined") ? html.find('#targetHex')[0].checked : false;
						this.reportHitResult(target, attacker, attack, relativePosition, rof, location, totalModifier, moveAndAttack, targetHex)
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
			render: html => console.info("Register interactivity in the rendered dialog"),
			close: html => console.info("This always is logged no matter which option is chosen")
		})
		modModal.render(true)
	}

	reportHitResult(target, attacker, attack, relativePosition, rof, locationArray, totalModifiers, moveAndAttack, targetHex) {
		let label = "";

		if (targetHex) {
			label = attacker.name + " attacks the ground at " + target.name + "'s feet with a " + attack.weapon + " " + attack.name;
		}
		else { // The attack is not an explosive firing at the target's hex (It might still be an explosive aimed directly at the target)
			label = attacker.name + " attacks " + target.name + " with a " + attack.weapon + " " + attack.name;
		}

		let level = attack.level;
		let mod = totalModifiers;

		if (attack.type == "ranged"){
			if (rof.shots == rof.rof){ // It is not a multiple projectile weapon
				label += " and fires " + rof.shots + " times.";
			}
			else { // It is a multiple projectile weapon
				label += " and fires " + rof.shots + " times for " + rof.rof + " shots.";
			}

			// Handle move and attack for ranged
			if (moveAndAttack) {
				mod = +mod + +attack.bulk; // Add the bulk penalty to the total modifiers
			}

			// The actor is targeting the hex at the feet of the person they are attacking. Give a +4
			if (targetHex) {
				mod = +mod + 4;
			}
		}
		else if (attack.type === "melee") {
			label += ".";

			// The actor is targeting the hex at the feet of the person they are attacking. Give a +4
			if (targetHex) {
				mod = +mod + 4;
			}

			// Handle move and attack for melee
			if (moveAndAttack) {
				level = level + mod - 4; // Add the modifier and the move and attack penalty to the level so we can cap it
				mod = 0; // Blank the modifier so it doesn't mess with the macro
				level = Math.min(level, 9); // Melee move and attacks are at -4, with a skill cap of 9
			}
		}

		rollHelpers.rangedAttackRoll(level, mod, label, false, attack.malf).then( rollInfo => {
			let messageContent = rollInfo.content;
			let flags = {}
			let malfunctionType = "";

			if (rollInfo.malfunction) {
				malfunctionType = rollHelpers.getMalfunctionType();
			}

			if (rollInfo.success == false) {
				messageContent += attacker.name + " misses " + target.name + "</br>";
				if (rollInfo.malfunction == true) {
					switch (malfunctionType) {
						case "mech":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it still goes off, but 1d6 seconds late)</div></br>";
							break;
						case "misfire":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a misfire. It fails to fire, and it will take three Ready maneuvers and an Armoury+2 or IQ based weapons skill to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
							break;
						case "stoppage":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a stoppage. It fires once and then stops working. It will take three Ready maneuvers and an Armoury+0 or IQ based weapons roll at -4 to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
							break;
						case "mechEx":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Additionally, if the weapon is a firearm or grenade from TL3 or TL4, it explodes! The weapon does 1d6+2 cr ex [2d], or if the weapon has a warhead, use that damage instead.</div></br>";
							break;
						default:
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has malfunction.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
							break;
					}
				}
			}
			else {
				let hits;
				if (attack.type == "ranged") {
					let rcl = attack.rcl ? attack.rcl : 1;
					if (rollInfo.malfunction == true && malfunctionType === "stoppage") {
						hits = 1; // Stoppages still fire once.
					}
					else if (rollInfo.malfunction == true) {
						hits = 0; // All other malfunction types mean the weapon never fires.
					}
					else { // Otherwise it's a normal success
						hits = Math.min( ((Math.floor(rollInfo.margin / Math.abs(rcl))) + 1) , rof.rof ); // Get the number of hits based on how many times rcl fits into margin, plus one. Then cap with the number of shots actually fired
					}
				}
				else {
					hits = 1
				}

				if (rollInfo.malfunction == true) {
					switch (malfunctionType) {
						case "mech":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it still goes off, but 1d6 seconds late)</div></br>";
							break;
						case "misfire":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a misfire. It fails to fire, and it will take three Ready maneuvers and an Armoury+2 or IQ based weapons skill to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
							break;
						case "stoppage":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a stoppage. It fires once and then stops working. It will take three Ready maneuvers and an Armoury+0 or IQ based weapons roll at -4 to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
							break;
						case "mechEx":
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Additionally, if the weapon is a firearm or grenade from TL3 or TL4, it explodes! The weapon does 1d6+2 cr ex [2d], or if the weapon has a warhead, use that damage instead.</div></br>";
							break;
						default:
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has malfunction.</div></br>";
							messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
							break;
					}
				}

				messageContent += attacker.name + " hits " + target.name + " " + this.numToWords(hits) + "</br></br>"; // Display the number of hits

				let locations = locationArray.slice(0, hits); // Shorten the list of locations to the number of hits.

				messageContent += target.name + " is struck in the...</br>";
				for (let m = 0; m < locations.length; m++){
					let firstLocation = getProperty(target.actor.system.bodyType.body, (locations[m].id).split(".")[0]);
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

				messageContent += "</br><input type='button' class='attemptActiveDefences' value='Attempt Active Defences'/><input type='button' class='noActiveDefences' value='No Active Defences'/>"

				let locationIDs = [];

				for (let l = 0; l < locations.length; l++){
					locationIDs[l] = locations[l].id;
				}

				flags = {
					target: target.document.id,
					attacker: attacker.document.id,
					scene: target.scene.id,
					attack: attack,
					relativePosition: relativePosition,
					rof: rof,
					locationIDs: locationIDs,
					totalModifiers: totalModifiers,
					targetHex: targetHex
				}
			}

			// Everything is assembled, send the message
			ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type, flags: flags});
		})
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
	// This method is run when the user clicks the "Attempt Active Defences" button
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

		let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;

		let targetToken = game.scenes.get(flags.scene).tokens.get(flags.target);
		let attackerToken = game.scenes.get(flags.scene).tokens.get(flags.attacker);

		let targetHex = flags.targetHex;

		let facing = this.getFacing(attackerToken, targetToken);
		let target = targetToken.actor;

		let dodges = [];
		let parries = [];
		let blocks = [];
		let magical = [];

		let dodge = {
			name: "Dodge",
			level: target.system.primaryAttributes.dodge.value
		}

		dodges.push(dodge);

		if (target.items) {
			target.items.forEach((item) => {
				if (item.system.melee) {
					let keys = Object.keys(item.system.melee)
					for (let b = 0; b < keys.length; b++){ // Loop through the melee profiles
						let profile = getProperty(item.system.melee, keys[b])
						if (Number.isInteger(profile.parry)){
							let parry = {
								name: item.name,
								level: profile.parry
							}
							parries.push(parry)
						}

						if (Number.isInteger(profile.block)){
							let block = {
								name: item.name,
								level: profile.block
							}
							blocks.push(block)
						}
					}
				}
				if (item.system.type == "Spell"){
					if (item.system.spellClass == "Blocking"){
						if (item.system.defenceType == "Dodge") {
							let dodge = {
								name:  item.name,
								level: item.level
							}
							dodges.push(dodge);
						}
						else if (item.system.defenceType == "Parry") {
							let parry = {
								name:  item.name,
								level: item.level
							}
							parries.push(parry)
						}
						else if (item.system.defenceType == "Block") {
							let block = {
								name:  item.name,
								level: item.level
							}
							blocks.push(block)
						}
						else if (item.system.defenceType == "Magic") {
							let magic = {
								name:  item.name,
								level: item.level
							}
							magical.push(magic)
						}
					}
				}
			})
		}

		let activeDefenceModalContent = "<div>"

		// Warnings
		let currentEnc = actorHelpers.fetchCurrentEnc(targetToken.actor);
		let hpState = actorHelpers.fetchHpState(targetToken.actor);
		let fpState = actorHelpers.fetchFpState(targetToken.actor);

		let posture = postureHelpers.getPosture(targetToken.effects);

		// If any facing, target hex, enc warning, hpState, fpState, or posture warning applies
		if (facing[0] === 0 || facing[0] === -1 || targetHex || currentEnc.penalty < 0 || (hpState.toLowerCase() !== "healthy" && hpState.toLowerCase() !== "injured") || posture.defenceMod < 0) {

			activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large; color: rgb(200, 0, 0)'>Warnings</div>";

			// Attacker is in the target's side hexes, warn them
			if (facing[0] === 0) {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>The attacker is in one of your side hexes. You have a -2 penalty to defend.</div>";
			}
			// Attacker is in the target's rear hexes, warn them
			else if (facing[0] === -1) {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>The attacker is in one of your rear hexes. If you can defend, you have a -2 penalty to do so.</div>";
			}

			// Defender is facing a rear/side attack, remind them about "Timed Defence"
			if (facing[0] === 0 || facing[0] === -1) {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(127, 127, 208)'>If you have the Timed Defence technique for the defence you intend to use, you may use it to offset this penalty. Though Timed Defence (Dodge) may only be used once per turn.</div>";
			}

			// The attack is an explosion targeting your hex
			if (targetHex) {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>The attacker is firing an explosive attack at the hex you are standing in. For your defence to be successful you either need to exit the hex you are currently standing in, or otherwise prevent the attacker from striking your hex.</div>";
			}

			// If the encumbrance penalty is above zero, warn the user
			if (currentEnc.penalty < 0) {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>Your current encumbrance penalty is " + currentEnc.penalty + " which is hampering your dodge and any fencing parries.</div>";
			}

			// Warn the user that they are both reeling and exhausted
			if ((hpState.toLowerCase() !== "healthy" && hpState.toLowerCase() !== "injured") && (fpState.toLowerCase() !== "fresh" && fpState.toLowerCase() !=="tired")) {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 65, 65)'>You are below 1/3rd HP and 1/3rd FP, meaning you are both reeling and exhausted. Aside from quartering your dodge, it also reduces your strength, which means your fencing parries are likely taking encumbrance penalties. You're probably fucked.</div>";
			}

			// Warn the user about the reeling penalty
			else if (hpState.toLowerCase() !== "healthy" && hpState.toLowerCase() !== "injured") {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>You are below 1/3rd HP, meaning you are reeling or worse. Aside from halving your dodge, it also reduces your strength, which means your fencing parries are likely taking encumbrance penalties.</div>";
			}

			// Warn the user about the exhausted penalty
			else if (fpState.toLowerCase() !== "fresh" && fpState.toLowerCase() !=="tired") {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>You are below 1/3rd FP, meaning you are exhausted or worse. Aside from halving your dodge, it also reduces your strength, which means your fencing parries are likely taking encumbrance penalties.</div>";
			}

			if (posture.defenceMod < 0) {
				activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>You are currently " + posture.desc + " which gives you " + posture.defenceMod + " to all non-magical active defences.</div>";
			}

			activeDefenceModalContent += "<hr>";
		}

		// End Warnings

		// General Modifiers
		activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>General Modifiers</div>";
		activeDefenceModalContent += "<div style='display: flex; justify-content: space-between;'>";

		// General active defence modifier
		activeDefenceModalContent += "<div class='def-option'><input type='number' id='mod' name='mod' placeholder='Active Defence Modifier'/></div>";

		if (facing[0] === 0 || facing[0] === -1) { // Attacker is in the target's side or rear hexes, give them the option to use Timed Defence.
			activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='timedDefence' id='timedDefence' value='timedDefence' /><label for='timedDefence' style='line-height: 26px;'>Timed Defence</label></div>"
		}
		activeDefenceModalContent += "</div>";
		activeDefenceModalContent += "<hr>";

		// End General Modifiers

		// Feverish Defence Modifiers
		if (game.settings.get("gurps4e", "feverishDefenceAllowed")) {
			activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Feverish Defence</div>";
			activeDefenceModalContent += "<div style='display: flex; justify-content: space-between; flex: auto;'>" +
				"<div class='def-option'><input type='checkbox' name='feverishDefence' id='feverishDefence' value='feverishDefence' /><label for='feverishDefence' style='line-height: 26px;'>Attempt Will Roll</label></div>" +
				"<div class='def-option'><input type='number' name='feverishDefenceMod' id='feverishDefenceMod' placeholder='Will Roll Modifier'/></div>"

			activeDefenceModalContent += "</div>"
			activeDefenceModalContent += "<hr>";
		}
		// End Feverish Defence Modifiers

		// Retreat options
		activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Retreat Options</div>";
		activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>" +
			"<div class='def-option'><input type='checkbox' name='slip' id='slip' value='slip' /><label for='slip' style='line-height: 26px;'>Slip</label></div>" +
			"<div class='def-option'><input type='checkbox' name='sideslip' id='sideslip' value='sideslip' /><label for='sideslip' style='line-height: 26px;'>Side Slip</label></div>" +
			"<div class='def-option'><input type='checkbox' name='retreat' id='retreat' value='retreat' /><label for='retreat' style='line-height: 26px;'>Retreat</label></div>";

		activeDefenceModalContent += "</div>";
		// End Retreat options

		// All Out Defence Options


		activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>All Out Defences</div>";
		activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>" +
			"<div class='def-option'></div>" +
			"<div class='def-option' style='flex: 2; justify-content: center;'><input type='checkbox' name='aodIncreased' id='aodIncreased' value='aodIncreased' /><label for='slip' style='line-height: 26px;'>Increased Defence (+2)</label></div>" +
			"<div class='def-option'></div>";

		activeDefenceModalContent += "</div>"

		// activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>";
		//
		// // Only show double defence options for those defences that have at least one entry
		// if (dodges.length > 0) {
		// 	activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aodDoubleDodge' id='aodDoubleDodge' value='aodDoubleDodge' /><label for='aodDoubleDodge' style='line-height: 26px;'>Double Defence (Dodge)</label></div>";
		// }
		//
		// if (blocks.length > 0) {
		// 	activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aodDoubleBlock' id='aodDoubleBlock' value='aodDoubleBlock' /><label for='aodDoubleBlock' style='line-height: 26px;'>Double Defence (Block)</label></div>";
		// }
		//
		// if (parries.length > 0) {
		// 	activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aodDoubleParry' id='aodDoubleParry' value='aodDoubleParry' /><label for='aodDoubleParry' style='line-height: 26px;'>Double Defence (Parry)</label></div>";
		// }
		//
		// activeDefenceModalContent += "</div>"
		activeDefenceModalContent += "<hr>";

		// End All Out Defence Options

		// Acrobatic Defence Options
		// Make sure they have at least one acrobatic skill
		if (skillHelpers.getSkillLevelByName("acrobatics", targetToken.actor) || skillHelpers.getSkillLevelByName("aerobatics", targetToken.actor) || skillHelpers.getSkillLevelByName("aquabatics", targetToken.actor)) {
			activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Acrobatic Defences</div>";

			activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>";
			if (skillHelpers.getSkillLevelByName("acrobatics", targetToken.actor)) {
				activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='acrobatic' id='acrobatic' value='acrobatic' /><label for='acrobatic' style='line-height: 26px;'>Acrobatic Defence</label></div>";
			}
			if (skillHelpers.getSkillLevelByName("aerobatics", targetToken.actor)) {
				activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aerobatic' id='aerobatic' value='aerobatic' /><label for='aerobatic' style='line-height: 26px;'>Aerobatic Defence</label></div>";
			}
			if (skillHelpers.getSkillLevelByName("aquabatics", targetToken.actor)) {
				activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aquabatic' id='aquabatic' value='aquabatic' /><label for='aquabatic' style='line-height: 26px;'>Aquabatic Defence</label></div>";
			}
			activeDefenceModalContent += "</div>";

			activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>" +
				"<div class='def-option'></div>" +
				"<div class='def-option' style='flex: 3'><div class='def-option'><input type='number' name='acroMod' id='acroMod' placeholder='Acrobatic Defence Modifier'/></div></div>" +
				"<div class='def-option'></div>" +
				"</div>"

			activeDefenceModalContent += "<hr>";
		}
		// End Acrobatic Defence Options

		activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Specific Modifiers</div>";

		activeDefenceModalContent += "<div style='display: flex'>";

		// If the actor has dodges, add the column with dodge options and modifiers
		if (dodges.length > 0) {
			activeDefenceModalContent += "<div class='def-column'>" +
				"<div><span style='text-align: center; font-weight: bold;'>Dodge</span></div>" +
				"<div class='def-option'><input type='checkbox' name='drop' id='drop' value='drop' /><label for='drop' style='line-height: 26px;'>Dodge & Drop</label></div>" +
				"<select style='width: 100%' name='dodgeSelector' id='dodgeSelector'>";
			for (let d = 0; d < dodges.length; d++){
				activeDefenceModalContent += "<option value='" + dodges[d].level + "'>" + dodges[d].level + ": " + dodges[d].name + "</option>"
			}
			activeDefenceModalContent += "</select>" +
				"</div>";
		}

		// If the actor has blocks, add the column with block options and modifiers
		if (blocks.length > 0){
			activeDefenceModalContent += "<div class='def-column'>" +
				"<div><span style='text-align: center; font-weight: bold;'>Block</span></div>" +
				"<select style='width: 100%' name='blockSelector' id='blockSelector'>";
			for (let b = 0; b < blocks.length; b++){
				activeDefenceModalContent += "<option value='" + blocks[b].level + "'>" + blocks[b].level + ": " + blocks[b].name + "</option>"
			}
			activeDefenceModalContent += "</select>" +
				"</div>";
		}

		// If the actor has parries, add the column with parry options and modifiers
		if (parries.length > 0){
			activeDefenceModalContent += "<div class='def-column'>" +
				"<div><span style='text-align: center; font-weight: bold;'>Parry</span></div>" +
				"<div class='def-option'><input type='checkbox' name='crossParry' id='crossParry' value='crossParry' /><label for='crossParry' style='line-height: 26px;'>Cross Parry</label></div>" +
				"<select style='width: 100%' name='parrySelector' id='parrySelector'>";
			for (let p = 0; p < parries.length; p++){
				activeDefenceModalContent += "<option value='" + parries[p].level + "'>" + parries[p].level + ": " + parries[p].name + "</option>"
			}
			activeDefenceModalContent += "</select>" +
				"</div>";
		}

		// If the actor has magical defences, add the column with magical options and modifiers
		if (magical.length > 0){
			activeDefenceModalContent += "<div class='def-column'>" +
				"<div><span style='text-align: center; font-weight: bold;'>Magical</span></div>" +
				"<select style='width: 100%' name='magicalSelector' id='magicalSelector'>";
			for (let m = 0; m < magical.length; m++){
				activeDefenceModalContent += "<option value='" + magical[m].level + "'>" + magical[m].level + ": " + magical[m].name + "</option>"
			}
			activeDefenceModalContent += "</select>" +
				"</div>";
		}

		activeDefenceModalContent += "</div>" +
			"</div>" +
			"</div>";

		let buttons = {};
		let width = 0; // Variable for dialog width
		if (dodges.length > 0) {
			buttons.dodge = {
				icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 17px;"><path fill="currentColor" d="M272 96c26.51 0 48-21.49 48-48S298.51 0 272 0s-48 21.49-48 48 21.49 48 48 48zM113.69 317.47l-14.8 34.52H32c-17.67 0-32 14.33-32 32s14.33 32 32 32h77.45c19.25 0 36.58-11.44 44.11-29.09l8.79-20.52-10.67-6.3c-17.32-10.23-30.06-25.37-37.99-42.61zM384 223.99h-44.03l-26.06-53.25c-12.5-25.55-35.45-44.23-61.78-50.94l-71.08-21.14c-28.3-6.8-57.77-.55-80.84 17.14l-39.67 30.41c-14.03 10.75-16.69 30.83-5.92 44.86s30.84 16.66 44.86 5.92l39.69-30.41c7.67-5.89 17.44-8 25.27-6.14l14.7 4.37-37.46 87.39c-12.62 29.48-1.31 64.01 26.3 80.31l84.98 50.17-27.47 87.73c-5.28 16.86 4.11 34.81 20.97 40.09 3.19 1 6.41 1.48 9.58 1.48 13.61 0 26.23-8.77 30.52-22.45l31.64-101.06c5.91-20.77-2.89-43.08-21.64-54.39l-61.24-36.14 31.31-78.28 20.27 41.43c8 16.34 24.92 26.89 43.11 26.89H384c17.67 0 32-14.33 32-32s-14.33-31.99-32-31.99z" class=""></path></svg>',
				label: "Dodge",
				callback: (html) => {
					this.gatherActiveDefenceAndOptions(html, "dodge", flags, locationIDs, facing[0])
				}
			}
			width += 200; // Add width for this column of defences
		}
		if (blocks.length > 0) {
			buttons.block = {
				icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z" class=""></path></svg>',
				label: "Block",
				callback: (html) => {
					this.gatherActiveDefenceAndOptions(html, "block", flags, locationIDs, facing[0])
				}
			}
			width += 200; // Add width for this column of defences
		}
		if (parries.length > 0) {
			buttons.parry = {
				icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M507.31 462.06L448 402.75l31.64-59.03c3.33-6.22 2.2-13.88-2.79-18.87l-17.54-17.53c-6.25-6.25-16.38-6.25-22.63 0L420 324 112 16 18.27.16C8.27-1.27-1.42 7.17.17 18.26l15.84 93.73 308 308-16.69 16.69c-6.25 6.25-6.25 16.38 0 22.62l17.53 17.54a16 16 0 0 0 18.87 2.79L402.75 448l59.31 59.31c6.25 6.25 16.38 6.25 22.63 0l22.62-22.62c6.25-6.25 6.25-16.38 0-22.63zm-149.36-76.01L60.78 88.89l-5.72-33.83 33.84 5.72 297.17 297.16-28.12 28.11zm65.17-325.27l33.83-5.72-5.72 33.84L340.7 199.43l33.94 33.94L496.01 112l15.84-93.73c1.43-10-7.01-19.69-18.1-18.1l-93.73 15.84-121.38 121.36 33.94 33.94L423.12 60.78zM199.45 340.69l-45.38 45.38-28.12-28.12 45.38-45.38-33.94-33.94-45.38 45.38-16.69-16.69c-6.25-6.25-16.38-6.25-22.62 0l-17.54 17.53a16 16 0 0 0-2.79 18.87L64 402.75 4.69 462.06c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L109.25 448l59.03 31.64c6.22 3.33 13.88 2.2 18.87-2.79l17.53-17.54c6.25-6.25 6.25-16.38 0-22.63L188 420l45.38-45.38-33.93-33.93z" class=""></path></svg>',
				label: "Parry",
				callback: (html) => {
					this.gatherActiveDefenceAndOptions(html, "parry", flags, locationIDs, facing[0])
				}
			}
			width += 200; // Add width for this column of defences
		}
		if (magical.length > 0) {
			buttons.magical = {
				icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z" class=""></path></svg>',
				label: "Magical",
				callback: (html) => {
					this.gatherActiveDefenceAndOptions(html, "magical", flags, locationIDs, facing[0])
				}
			}
			width += 200; // Add width for this column of defences
		}

		let options = {
			width: width,
		};

		let activeDefenceModal = new Dialog({
			title: "Active Defences",
			content: activeDefenceModalContent,
			buttons: buttons,
			default: "dodge",
			render: html => console.info("Register interactivity in the rendered dialog"),
			close: html => console.info("This always is logged no matter which option is chosen")
		}, options)
		activeDefenceModal.render(true)
	}

	noActiveDefences(event) {
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

		let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;

		this.applyDamage(flags, locationIDs);
	}

	// This method gathers the selections the user has made when selecting their active defence and any relevant modifiers
	gatherActiveDefenceAndOptions(html, type, flags, locationIDs, facing){
		let selection;
		let name;
		let mod = parseInt(html.find('#mod').val());

		let options = {
			feverishDefence: 	html.find('#feverishDefence')[0] ? html.find('#feverishDefence')[0].checked : "",
			feverishDefenceMod: html.find('#feverishDefenceMod').val(),
			timedDefence: 		html.find('#timedDefence')[0] ? html.find('#timedDefence')[0].checked : "",
			retreat: 			html.find('#retreat')[0] ? html.find('#retreat')[0].checked : "",
			sideslip: 			html.find('#sideslip')[0] ? html.find('#sideslip')[0].checked : "",
			slip: 				html.find('#slip')[0] ? html.find('#slip')[0].checked : "",
			drop: 				html.find('#drop')[0] ? html.find('#drop')[0].checked : "",
			crossParry: 		html.find('#crossParry')[0] ? html.find('#crossParry')[0].checked : "",
			aodIncreased:		html.find('#aodIncreased')[0] ? html.find('#aodIncreased')[0].checked : "",
			aodDoubleDodge:		html.find('#aodDoubleDodge')[0] ? html.find('#aodDoubleDodge')[0].checked : "",
			aodDoubleBlock:		html.find('#aodDoubleBlock')[0] ? html.find('#aodDoubleBlock')[0].checked : "",
			aodDoubleParry:		html.find('#aodDoubleParry')[0] ? html.find('#aodDoubleParry')[0].checked : "",
			acrobatic:			html.find('#acrobatic')[0] ? html.find('#acrobatic')[0].checked : "",
			aerobatic:			html.find('#aerobatic')[0] ? html.find('#aerobatic')[0].checked : "",
			aquabatic:			html.find('#aquabatic')[0] ? html.find('#aquabatic')[0].checked : "",
			acroMod:			html.find('#acroMod').val()
		}

		if (type.toLowerCase() === 'parry'){
			selection = html.find('#parrySelector').val()
			name = html.find('#parrySelector')[0].innerText.split(":")[1]
		}
		else if (type.toLowerCase() === 'block'){
			selection = html.find('#blockSelector').val()
			name = html.find('#blockSelector')[0].innerText.split(":")[1]
		}
		else if (type.toLowerCase() === 'dodge'){
			selection = html.find('#dodgeSelector').val()
			name = html.find('#dodgeSelector')[0].innerText.split(":")[1]
		}
		else if (type.toLowerCase() === 'magical'){
			selection = html.find('#magicalSelector').val()
			name = html.find('#magicalSelector')[0].innerText.split(":")[1]
		}

		// Undefined & NaN check for the modifier
		if (typeof mod !== "number" || !mod.isNaN) {
			mod = 0;
		}

		if (facing <= 0 && !options.timedDefence) { // Attacker is in side or rear hexes and the target is not using a timed defence
			mod -= 2 // Subtract 2 from the defence modifier
		}

		this.rollActiveDefence(mod, selection, name, options, flags, locationIDs, type, facing);
	}

	async rollActiveDefence(mod, selection, name, options, flags, locationIDs, type, facing) {
		let targetToken = game.scenes.get(flags.scene).tokens.get(flags.target)
		let target = targetToken.actor;

		let posture = postureHelpers.getPosture(targetToken.effects);

		let totalModifier;
		let additionalMessageContent = "";
		let label = "";

		if (mod === "" || mod === undefined){
			totalModifier = +0;
		}
		else {
			totalModifier = parseInt(mod);
		}

		totalModifier += posture.defenceMod;

		let feverishDefenceMod = options.feverishDefenceMod;

		if (typeof feverishDefenceMod === "string") {
			if (feverishDefenceMod.length > 0) {
				feverishDefenceMod = parseInt(feverishDefenceMod);
			}
		}

		// Undefined / NaN check for feverishDefenceMod
		if (typeof feverishDefenceMod !== "number" || feverishDefenceMod.isNaN) {
			feverishDefenceMod = 0;
		}

		// This block handles the logic and display for Feverish Defences
		let feverishWillRoll = game.settings.get("gurps4e", "feverishDefenceRequiresWill");
		let feverishFP = game.settings.get("gurps4e", "feverishDefenceCostsFP");
		let willRollHtml = "";
		let acroRollHtml = "";
		let feverishWillRollFailed = false;

		// If Will rolls are required for Feverish Defences and they've elected to make such a roll
		if (feverishWillRoll && options.feverishDefence) {
			let willRoll = await rollHelpers.skillRoll(target.system.primaryAttributes.will.value, feverishDefenceMod, "Rolls against Will for a Feverish Defence.", false);

			willRollHtml = willRoll.content;

			if (willRoll.success) {
				willRollHtml += "<br/>+2 to this defence";

				// It's a crit, and we care about FP for Feverish Defences
				if (willRoll.crit && feverishFP) {
					willRollHtml += " and no FP is lost";
					// Give back the FP that is about to be spent, max checking will be done below
					target.system.reserves.fp.value = target.system.reserves.fp.value + 1;
				}
			}
			else {
				willRollHtml += "<br/>No bonus";
				feverishWillRollFailed = true;
				if (willRoll.crit) {
					willRollHtml += " and one HP is lost";
					target.system.reserves.hp.value = target.system.reserves.hp.value - 1;
				}
			}

			if (feverishFP) {
				target.system.reserves.fp.value = target.system.reserves.fp.value - 1;
				// If FP is above max, correct it
				if (target.system.reserves.fp.value > target.system.reserves.fp.max) {
					target.system.reserves.fp.value = target.system.reserves.fp.max;
				}
				// If FP is below zero, apply HP damage
				else if (target.system.reserves.fp.value > 0) {
					target.system.reserves.hp.value = target.system.reserves.hp.value - 1;
				}
			}

			label += willRollHtml + "<hr>";
		}
		// End Feverish Defences

		// If the user has decided to make an acrobatic defence
		let acroNotice = "";
		if (options.acrobatic || options.aerobatic || options.aquabatic) {
			let acroSkill = "Acrobatics";
			let acroLabel = "Rolls against Acrobatics";
			if (options.acrobatic) {
				acroSkill = "Acrobatics";
				acroLabel = "Rolls against Acrobatics";
			}
			else if (options.aerobatic) {
				acroSkill = "Aerobatics";
				acroLabel = "Rolls against Aerobatics";
			}
			else if (options.aquabatic) {
				acroSkill = "Aquabatics";
				acroLabel = "Rolls against Aquabatics";
			}

			let acroSkillValue = skillHelpers.getSkillLevelByName(acroSkill, target);

			let acroMod = options.acroMod;

			if (typeof acroMod === "string") {
				if (acroMod.length > 0) {
					acroMod = parseInt(acroMod);
				}
			}

			// Undefined / NaN check for acroMod
			if (typeof acroMod !== "number" || acroMod.isNaN) {
				acroMod = 0;
			}

			// For whatever reason, an acrobatic defence in this case is not allowed (Not the same as trying but failing)
			if (acroSkillValue === undefined || typeof acroSkillValue !== "number" || (type === "parry" && !game.settings.get("gurps4e", "acrobaticParry")) || (type === "block" && !game.settings.get("gurps4e", "acrobaticBlock"))) {
				// TODO - Warn about failed attempt at making an acrobatic defence
				if (acroSkillValue === undefined || typeof acroSkillValue !== "number") {
					acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " defence but lacks the skill. There is no resulting modifier";
				}
				else if (type === "parry" && !game.settings.get("gurps4e", "acrobaticParry")) {
					acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " parry, but the campaign settings do not permit it. There is no resulting modifier";
				}
				else if (type === "block" && !game.settings.get("gurps4e", "acrobaticBlock")) {
					acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " block, but the campaign settings do not permit it. There is no resulting modifier";
				}
				else {
					acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " defence but some error prevents it from working right now. Bother Calvin about this.";
				}
			}
			// An acrobatic defence is permitted, continue
			else {
				let acroRoll = await rollHelpers.skillRoll(acroSkillValue, acroMod, acroLabel, false);

				acroRollHtml = acroRoll.content;

				if (acroRoll.success) {
					acroRollHtml += "<br/>+2 to this defence";
					totalModifier += 2;
					if (options.acrobatic) {
						acroNotice = "acrobatic ";
					}
					else if (options.aerobatic) {
						acroNotice = "aerobatic ";
					}
					else if (options.aquabatic) {
						acroNotice = "aquabatic ";
					}
				}
				else {
					acroRollHtml += "<br/>-2 to this defence";
					totalModifier -= 2;
					if (options.acrobatic) {
						acroNotice = "failed acrobatic ";
					}
					else if (options.aerobatic) {
						acroNotice = "failed aerobatic ";
					}
					else if (options.aquabatic) {
						acroNotice = "failed aquabatic ";
					}
				}
			}

			label += acroRollHtml + "<hr>";
		}
		// End Acrobatic Defences

		label += target.name + " attempts a ";

		// They picked Feverish Defence, and did not fail the roll (Either it wasn't required or the roll passed)
		if (options.feverishDefence && !feverishWillRollFailed ) {
			label += "feverish ";
			totalModifier += 2;
		}

		// They picked AoD Increased
		if (options.aodIncreased) {
			label += "all out ";
			totalModifier += 2;
		}

		if (options.acrobatic || options.aerobatic || options.aquabatic) {
			label += acroNotice;
		}

		if (options.crossParry && type === "parry") {
			label += "cross ";
			totalModifier += 2;
		}

		label += type + " ";

		// Block for retreat options
		if (options.drop && type === "dodge") {
			label += "and drop ";
			totalModifier += 3;
			postureHelpers.setPostureTokenDoc(target.token,"lyingprone")
		}
		else if (options.retreat) {
			label += "and retreat ";
			if ((type === "parry" && flags.attack.parryType.toUpperCase() === "F") || type === "dodge"){ // If it's a parry and is fencing OR it's a dodge
				totalModifier += 3; // Grant the fencing bonus
			}
			else {
				totalModifier += 1; // Otherwise grant the default.
			}
		}
		else if (options.sideslip) {
			label += "and side slip ";
			if ((type === "parry" && flags.attack.parryType.toUpperCase() === "F") || type === "dodge"){ // If it's a parry and is fencing OR it's a dodge
				totalModifier += 2; // Grant the fencing bonus
			}
			else {
				totalModifier += 0; // Otherwise grant the default.
			}
		}
		else if (options.slip) {
			label += "and slip ";
			if ((type === "parry" && flags.attack.parryType.toUpperCase() === "F") || type === "dodge"){ // If it's a parry and is fencing OR it's a dodge
				totalModifier += 1; // Grant the fencing bonus
			}
			else {
				totalModifier += -1; // Otherwise grant the default.
			}
		}

		// If they're not standing, include it in the output string
		if (posture.name !== "standing") {
			label += " while " + posture.desc;
		}

		if (type.toLowerCase() !== "dodge"){
			label += " with their " + name;
		}

		if (facing == 0) { // Attacker is in side hexes
			label += " against an attack from the side"
		}
		else if (facing == -1) { // Attacker is in rear hexes
			label += " against an attack from the rear"
		}

		label = generalHelpers.correctAtoAn(label);

		rollHelpers.skillRoll(selection, totalModifier, label, false).then( rollInfo => {
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
				additionalMessageContent += target.name + " stopped all of the attacks.";
				let messageContent = rollInfo.content + additionalMessageContent;

				// Send the message, no further rolls necessary.
				ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});
			}
			else if (attacksStopped <= 0){ // Stopped zero or fewer attacks
				additionalMessageContent += target.name + " does not stop any attacks.</br></br>";
				additionalMessageContent += locationIDs.length + " attack" + (locationIDs.length > 1 ? "s " : " ") + "get" + (locationIDs.length === 1 ? "s" : "") + " through.";
				let messageContent = rollInfo.content + additionalMessageContent;

				// Send the message then prepare for damage rolls
				ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});

				locationsHit = locationIDs; // All attacks get through
				this.applyDamage(flags, locationsHit).then();
			}
			else if (attacksStopped === 1){ // Stopped one attack, but not all
				attacksThrough = locationIDs.length - 1;
				additionalMessageContent += target.name + " stopped one attack.</br></br>";
				additionalMessageContent += attacksThrough + " attack" + (attacksThrough > 1 ? "s " : " ") + "get" + (attacksThrough === 1 ? "s" : "") + " through.";
				let messageContent = rollInfo.content + additionalMessageContent;

				// Send the message then prepare for damage rolls
				ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});

				locationsHit = locationIDs.slice(0, locationIDs.length - 1); // Remove the last hit in the array
				this.applyDamage(flags, locationsHit).then();
			}
			else if (attacksStopped > 1){ // Stopped more than one attack, but not all
				attacksThrough = locationIDs.length - attacksStopped;
				additionalMessageContent += target.name + " stopped " + attacksStopped + " attacks.</br></br>";
				additionalMessageContent += attacksThrough + " attack" + (attacksThrough > 1 ? "s " : " ") + "get" + (attacksThrough === 1 ? "s" : "") + " through.";
				let messageContent = rollInfo.content + additionalMessageContent;

				// Send the message then prepare for damage rolls
				ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});

				locationsHit = locationIDs.slice(0, locationIDs.length - attacksStopped); // Remove the last hits in the array
				this.applyDamage(flags, locationsHit).then();
			}
		})
	}

	async applyDamage(flags, locationsHit, additionalMessage) {
		let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor;
		let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;
		let attack 			= flags.attack;
		let targetST 		= target.system.primaryAttributes.knockback.value;
		let targetHex		= flags.targetHex;
		let totalKnockback 	= 0;
		let totalInjury 	= 0;
		let totalFatInj 	= 0;
		let damageReduction = 1;
		let largeArea		= false;
		let largeAreaDR; // Only needed for largeArea attacks, but init here
		let armourDivisor;

		if (typeof attack.armourDivisor == "undefined" || attack.armourDivisor == ""){ // Armour divisor is undefined or blank
			armourDivisor = 1; // Set it to the default of 1
		}
		else if (attack.armourDivisor.toString().toLowerCase().includes("ignore") || attack.armourDivisor.toString().toLowerCase().includes("cosmic") || attack.armourDivisor.toString().toLowerCase().includes("i")){
			armourDivisor = "Ignores Armour"; // Set to a negative number, which we'll later use to ignore armour entirely.
		}
		else {
			armourDivisor = attack.armourDivisor; // Set it to whatever they entered.
		}

		// The attack is an area attack or an explosion, making it a Large Area Attack (Rules for which are on B400)
		if (attack.damageType.toString().toLowerCase().includes("area") || attack.damageType.toString().toLowerCase().includes("la") || attack.damageType.toString().toLowerCase().includes("ex") ) {
			largeArea = true; // Set the area flag

			if (!(attack.damageType.toString().toLowerCase().includes("ex") && !targetHex)) { // It's not a contact targeted explosion
				for (let i = 0; i < locationsHit.length; i++){ // Loop through all the locations
					locationsHit[i] = 'upperChest.subLocation.chest'; // Set them to the upper chest
				}
			}

			largeAreaDR = this.getLargeAreaDR(target.system.bodyType.body); // Get the target's Large Area DR
		}

		if (target.system.injuryTolerances){
			if (target.system.injuryTolerances.damageReduction){
				damageReduction = target.system.injuryTolerances.damageReduction; // Set the target's damage reduction
			}
		}

		let damageType = this.extractDamageType(attack);

		let html = "<div>Damage for " + attacker.name + "'s " + attack.weapon + " " + attack.name + " against " + target.name + "</div>";

		if (additionalMessage) {
			html += "<hr>" + additionalMessage + "<br>"
		}

		for (let i = 0; i < locationsHit.length; i++){
			let bluntTrauma = 0;
			let location = getProperty(target.system.bodyType.body, locationsHit[i]);

			// Roll damage for the attack
			let roll = new Roll(attack.damage);
			let damageRoll = await roll.roll({async: true});
			let adds = 0;

			// Build the location label
			let firstLocation = getProperty(target.system.bodyType.body, locationsHit[i].split(".")[0]);
			let secondLocation = getProperty(target.system.bodyType.body, locationsHit[i]);
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
				if(damageRoll.terms[0].results.length){ // Take the results of each roll and turn it into a die icon.
					for (let k = 0; k < damageRoll.terms[0].results.length; k++){
						if (damageType.explosive && !targetHex){ // If it's an explosive attack that is not striking the hex, it's a contact explosion
							html += "<label class='fa fa-dice-six fa-2x' style='color: #d24502'></label>" // Explosives do max damage on contact, colour the dice all special to draw attention to this
						}
						else {
							html += rollHelpers.dieToSmallIcon(damageRoll.terms[0].results[k].result)
						}
					}
				}
				adds = (+damageRoll._total - +damageRoll.dice[0].total);
			}
			else {
				adds = +damageRoll._total;
			}

			if (adds > 0){ // Adds are positive
				html += "<label class='damage-dice-small-adds'>+</label><label class='damage-dice-small-adds'>" + adds + "</label>"
			}
			else if (adds < 0) { // Adds are negative
				html += "<label class='damage-dice-small-adds'>-</label><label class='damage-dice-small-adds'>" + Math.abs(adds) + "</label>"
			}

			let totalDamage;

			if (damageType.explosive && !targetHex) { // The attack is explosive and not targeting the hex, therefore it's a contact explosion
				if (typeof damageRoll.terms[0].results !== "undefined") {
					totalDamage = (6 * (damageRoll.terms[0].results.length)) + adds;
				}
				else {
					totalDamage = damageRoll.total;
				}
			}
			else {
				totalDamage = damageRoll.total;
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

			if (armourDivisor != 1 && largeArea){
				html += "<label class='damage-dice-small-adds'> (" + armourDivisor + ") Large Area Injury</label>";
			}
			else if (armourDivisor != 1){
				html += "<label class='damage-dice-small-adds'> (" + armourDivisor + ")</label>";
			}
			else if (largeArea) {
				html += "<label class='damage-dice-small-adds'> Large Area Injury</label>";
			}

			html += "</div>";

			// Store actualDamage so we can reference totalDamage later for knockback, etc.
			let actualDamage = totalDamage;

			let drLayers = Object.keys(location.dr)


			let drDamageType = damageType.type;
			if (drDamageType === "tbb") { // For the purposes of DR only, set tbb attacks equivalent to burn since tbb still uses burning DR
				drDamageType = "burn";
			}
			else if (drDamageType === "pi-" || drDamageType === "pi+" || drDamageType === "pi++") {
				drDamageType = "pi";
			}

			let totalLocationDR = 0;

			// Large area attacks handle DR differently. We've already calculated the total above, make use of it now.
			if (largeArea) {
				// Set the applicable DR to the largeAreaDR
				let dr = getProperty(largeAreaDR, drDamageType);
				let effectiveDR = 0;
				if (armourDivisor.toString().toLowerCase() == "ignores armour") { // If the armour divisor is set to ignore armour then effective DR is zero.
					effectiveDR = 0
				}
				else {
					effectiveDR = Math.floor(dr / armourDivisor); // Get the effective DR after armour divisor. Armour divisors round DR down.
				}

				let drStops = Math.min(actualDamage, effectiveDR); // Get the actual amount of damage stopped by the armour

				// Subtract the dr from the running damage total.
				actualDamage -= effectiveDR;

				// Assume any Large Area attack does blunt trauma
				bluntTrauma += (drStops / damageType.bluntReq);

				totalLocationDR += +effectiveDR;
			}
			// It's not a large area attack, use the default DR application method
			else {
				// Loop through the armour and take DR away from the damage dealt
				for (let d = 0; d < drLayers.length; d++){
					let dr = getProperty(location.dr[d], drDamageType);
					let effectiveDR = 0;
					if (armourDivisor.toString().toLowerCase() == "ignores armour") { // If the armour divisor is set to ignore armour then effective DR is zero.
						effectiveDR = 0
					}
					else {
						effectiveDR = Math.floor(dr / armourDivisor); // Get the effective DR after armour divisor. Armour divisors round DR down.
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

					totalLocationDR += +effectiveDR;
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

				if (damageType.noWounding) {
					actualDamage = 0;
				}

				// If the attack is capable of knockback, do knockback
				if (damageType.type === "cr") { // Only cr attacks do knockback while penetrating DR
					let knockback = totalDamage / targetST
					if (damageType.doubleKnockback){
						knockback = knockback * 2;
					}
					totalKnockback += knockback;
				}

				let woundCap; // Init injury cap

				let strictInjuryCap = game.settings.get("gurps4e", "strictInjuryCap"); // Get the game setting

				// Set the injury cap style based on the game setting above
				if (strictInjuryCap) {
					woundCap = location.injuryCapStrict;
				}
				else {
					woundCap = location.injuryCap;
				}

				let actualWounding;
				if (location.id.toLowerCase().includes("sublocation")){ // This is a sub location, check the parent for an HP value
					let subLocation = location.id.split(".")[0]
					let parentLocation = getProperty(target.system.bodyType.body, subLocation);
					if (damageType.woundModId.toString().toLowerCase().includes("dam")) { // Check for untyped damage
						actualWounding = Math.floor( (actualDamage / damageReduction) );
					}
					else {
						if (game.settings.get("gurps4e", "edgeProtection") && (damageType.type === "cut") && (!((totalDamage > (totalLocationDR * 2))))) { // If edge protection is enabled, damage type is crushing, and it's not more than twice the DR
							actualWounding = Math.floor( ( (actualDamage * getProperty(location, "personalWoundMultCr")) / damageReduction) );
						}
						else {
							actualWounding = Math.floor( ( (actualDamage * getProperty(location, damageType.woundModId)) / damageReduction) );
						}
					}

					if (target.system.injuryTolerances.diffuse) { // Target is diffuse
						if (damageType.woundModId.toString().toLowerCase().includes("imp") || damageType.woundModId.toString().toLowerCase().includes("pi")) { // Attack is imp or pi
							actualWounding = Math.min(actualWounding, 1); // Imp/pi attacks vs diffuse targets are capped at 1 wounding
						}
						else { // Attack is not imp or pi
							actualWounding = Math.min(actualWounding, 2); // All other attacks vs diffuse targets are capped at 2 wounding
						}
					}

					if (parentLocation.hp){// Apply damage to the parent location if it tracks HP
						if (woundCap !== Infinity) { // If the wound cap is not infinity
							woundCap = parentLocation.hp.value; // Bring the wound cap down to the HP left in the location.
						}

						parentLocation.hp.value -= actualWounding;
						parentLocation.hp.value = Math.max(parentLocation.hp.value, -parentLocation.hp.max) // Value should be the higher of it's actual value and full negative HP.
						target.system.bodyType.body[subLocation].hp.value = parentLocation.hp.value;
						//await target.update({ ['system.bodyType.body.' + subLocation + ".hp.value"]: parentLocation.hp.value });
					}
					if (location.hp){ // Apply damage to the child location if it tracks HP
						location.hp.value -= actualWounding;
						location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
						const splitLocation = location.id.split(".");
						target.system.bodyType.body[splitLocation[0]][splitLocation[1]][splitLocation[2]].hp.value = location.hp.value;
						//await target.update({ ['system.bodyType.body.' + location.id + ".hp.value"]: location.hp.value });
					}
				}
				else {
					if (damageType.woundModId.toString().toLowerCase().includes("dam")) { // Check for untyped damage
						actualWounding = Math.floor( ((actualDamage * 1) / damageReduction) );
					}
					else {
						actualWounding = Math.floor(((actualDamage * getProperty(location, damageType.woundModId)) / damageReduction) );
					}

					if (target.system.injuryTolerances.diffuse) { // Target is diffuse
						if (damageType.woundModId.toString().toLowerCase().includes("imp") || damageType.woundModId.toString().toLowerCase().includes("pi")) { // Attack is imp or pi
							actualWounding = Math.min(actualWounding, 1); // Imp/pi attacks vs diffuse targets are capped at 1 wounding
						}
						else { // Attack is not imp or pi
							actualWounding = Math.min(actualWounding, 2); // All other attacks vs diffuse targets are capped at 2 wounding
						}
					}

					if (location.hp){ // Apply damage to the location if it tracks HP

						if (woundCap !== Infinity) { // If the wound cap is not infinity
							woundCap = location.hp.value; // Bring the wound cap down to the HP left in the location.
						}

						location.hp.value -= actualWounding
						location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
					}
				}

				// If there's a wound cap, apply it
				if (typeof woundCap !== "undefined"){
					// If the wound cap is less than zero for some reason, fix it
					if (woundCap < 0){
						woundCap = 0;
					}
					actualWounding = Math.min(woundCap, actualWounding);
				}

				// Multiply final damage by the locational wound modifier and add it to the running total
				if (damageType.type == "fat"){
					totalFatInj += Math.floor(actualDamage * location.personalWoundMultFat);
					html += "<div>The location loses " + totalFatInj + " fatigue</div>";
				}
				else {
					totalInjury += actualWounding;
					html += "<div>The location takes " + actualWounding + " injury</div>";
				}

				if (game.settings.get("gurps4e", "allowBluntTraumaWithWounding")) {
					bluntTrauma = Math.floor(bluntTrauma); // Round down blunt trama in preparation for actually applying the damage.
					if (bluntTrauma > 0) {
						let bluntInjury = bluntTrauma;

						if (location.id.toLowerCase().includes("sublocation")){ // This is a sub location, check the parent for an HP value
							let subLocation = location.id.split(".")[0]
							let parentLocation = getProperty(target.system.bodyType.body, subLocation);
							if (parentLocation.hp) { // Apply damage to the parent location if it tracks HP
								if (woundCap !== Infinity) { // If the wound cap is not infinity
									woundCap = parentLocation.hp.value; // Damage is capped to however much HP is left in the limb
								}
								parentLocation.hp.value -= bluntInjury;
								parentLocation.hp.value = Math.max(parentLocation.hp.value, -parentLocation.hp.max) // Value should be the higher of it's actual value and full negative HP.
								target.system.bodyType.body[subLocation].hp.value = parentLocation.hp.value;
								// await target.update({ ['system.bodyType.body.' + subLocation + ".hp.value"]: parentLocation.hp.value });
							}
							if (location.hp){ // Apply damage to the child location if it tracks HP
								location.hp.value -= bluntInjury;
								location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
								const splitLocation = location.id.split(".");
								target.system.bodyType.body[splitLocation[0]][splitLocation[1]][splitLocation[2]].hp.value = location.hp.value;
								// await target.update({ ['system.bodyType.body.' + location.id + ".hp.value"]: location.hp.value });
							}
						}
						else {
							if (location.hp){ // Apply damage to the location if it tracks HP
								if (woundCap !== Infinity) { // If the wound cap is not infinity
									woundCap = location.hp.value; // Damage is capped to however much HP is left in the limb
								}
								location.hp.value -= bluntInjury;
								location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
							}
						}

						// If there's a wound cap, apply it
						if (typeof woundCap !== "undefined"){
							// If the wound cap is less than zero for some reason, fix it
							if (woundCap < 0){
								woundCap = 0;
							}
							bluntInjury = Math.min(woundCap, bluntInjury);
						}

						html += "<label>The location also takes " + bluntInjury + " blunt trauma.</label>";

						totalInjury += bluntInjury;
					}
				}
			}
			else if (actualDamage <= 0) { // No damage has penetrated DR
				bluntTrauma = Math.floor(bluntTrauma); // Round down blunt trauma in preparation for actually applying the damage.
				if (bluntTrauma > 0) {
					let bluntInjury = bluntTrauma;
					html += "<label>The armour stops all damage but the attack does " + bluntTrauma + " blunt trauma.</label>";


					let woundCap;
					if (location.id.toLowerCase().includes("sublocation")){ // This is a sub location, check the parent for an HP value
						let subLocation = location.id.split(".")[0]
						let parentLocation = getProperty(target.system.bodyType.body, subLocation);
						if (parentLocation.hp){ // Apply damage to the parent location if it tracks HP
							woundCap = parentLocation.hp.value; // Damage is capped to however much HP is left in the limb
							parentLocation.hp.value -= bluntInjury;
							parentLocation.hp.value = Math.max(parentLocation.hp.value, -parentLocation.hp.max) // Value should be the higher of it's actual value and full negative HP.
							target.system.bodyType.body[subLocation].hp.value = parentLocation.hp.value;
							//await target.update({ ['system.bodyType.body.' + subLocation + ".hp.value"]: parentLocation.hp.value });
						}
						if (location.hp){ // Apply damage to the child location if it tracks HP
							location.hp.value -= bluntInjury;
							location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
							const splitLocation = location.id.split(".");
							target.system.bodyType.body[splitLocation[0]][splitLocation[1]][splitLocation[2]].hp.value = location.hp.value;
							//await target.update({ ['system.bodyType.body.' + location.id + ".hp.value"]: location.hp.value });
						}
					}
					else {
						if (location.hp){ // Apply damage to the location if it tracks HP
							woundCap = location.hp.value; // Damage is capped to however much HP is left in the limb
							location.hp.value -= bluntInjury;
							location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
						}
					}

					// If there's a wound cap, apply it
					if (typeof woundCap !== "undefined"){
						// If the wound cap is less than zero for some reason, fix it
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
			html += "<hr>" + target.name + " is knocked back " + totalKnockback + " yards and must roll at -" + (totalKnockback - 1) + " to avoid falling down.";
			html += "<br><input type='button' class='knockbackFall' value='Roll to avoid falling down'/>";
			let damageFromVelocity = generalHelpers.velocityToDamage(target.system.reserves.hp.max, totalKnockback)
			html += "<hr>If there is a collision, it causes " + damageFromVelocity.hard + " damage. Striking a soft object instead does " + damageFromVelocity.soft + " damage."

			// flags = { // Compile flags that will be passed along through the chat messages
			// 	target: target.id,
			// 	attacker: attacker.id,
			// 	scene: target.scene.id,
			// 	attack: attack,
			// 	margin: rollInfo.margin,
			// 	effectiveSkill: (+attack.level + +totalModifiers)
			// }
		}

		if (totalInjury > 0){
			let newHP = target.system.reserves.hp.value - Math.floor(totalInjury);
			target.system.reserves.hp.value = newHP;
			//await target.update({ 'system.reserves.hp.value': newHP });
		}

		if (totalFatInj > 0){
			let newFP = target.system.reserves.fp.value - Math.floor(totalFatInj);
			target.system.reserves.fp.value = newFP;
			//await target.update({ 'system.reserves.fp.value': newFP });
		}

		target.update({ 'data': target.system });
		// console.log(target.token.effects);
		// console.log(typeof target.token.effects);
		ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_TYPES.OTHER, flags: flags });
	}

	// This method goes through each hit location on the body to find the lowest for each separate damage type. It then stores that for the final step where it is averaged with the Torso DR
	getLargeAreaDR(object) {
		let armour = { // Init the final largeAreaDR object which we will return at the end of the method
			burn: 	0,
			cor: 	0,
			cr: 	0,
			cut: 	0,
			fat: 	0,
			imp: 	0,
			pi: 	0,
			tox: 	0,
		};

		let lowest = { // Init the object to hold the lowest armour for each type
			burn: 	[0],
			cor: 	[0],
			cr: 	[0],
			cut: 	[0],
			fat: 	[0],
			imp: 	[0],
			pi: 	[0],
			tox: 	[0],
		};

		let torso = { // Init the object to hold the torso armour for each type
			burn: 	[0],
			cor: 	[0],
			cr: 	[0],
			cut: 	[0],
			fat: 	[0],
			imp: 	[0],
			pi: 	[0],
			tox: 	[0],
		};

		if (object) { // Make sure they have a body
			let bodyParts = Object.keys(object); // Collect all the bodypart names
			for (let i = 0; i < bodyParts.length; i++){ // Loop through all the body parts
				if (bodyParts[i] == "skull" || bodyParts[i] == "brain"){ // Part has no sub-parts
					// Check it exists and add it to the lowest array
					lowest.burn[i] = getProperty(object, bodyParts[i] + ".drBurn") ? +getProperty(object, bodyParts[i] + ".drBurn") : 0;
					lowest.cor[i] = getProperty(object, bodyParts[i] + ".drCor")  ? +getProperty(object, bodyParts[i] + ".drCor") : 0;
					lowest.cr[i]  = getProperty(object, bodyParts[i] + ".drCr")   ? +getProperty(object, bodyParts[i] + ".drCr")  : 0;
					lowest.cut[i]  = getProperty(object, bodyParts[i] + ".drCut")  ? +getProperty(object, bodyParts[i] + ".drCut") : 0;
					lowest.fat[i]  = getProperty(object, bodyParts[i] + ".drFat")  ? +getProperty(object, bodyParts[i] + ".drFat") : 0;
					lowest.imp[i]  = getProperty(object, bodyParts[i] + ".drImp")  ? +getProperty(object, bodyParts[i] + ".drImp") : 0;
					lowest.pi[i]   = getProperty(object, bodyParts[i] + ".drPi")   ? +getProperty(object, bodyParts[i] + ".drPi")  : 0;
					lowest.tox[i]  = getProperty(object, bodyParts[i] + ".drTox")  ? +getProperty(object, bodyParts[i] + ".drTox") : 0;
				}
				else {
					let subParts = Object.keys(getProperty(object, bodyParts[i] + ".subLocation")); // Collect all the subpart names
					for (let n = 0; n < subParts.length; n++){ // Loop through all the subparts
						// Check it exists and add it to the lowest array
						lowest.burn[i + n] = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0;
						lowest.cor[i + n]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0;
						lowest.cr[i + n]   = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0;
						lowest.cut[i + n]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0;
						lowest.fat[i + n]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0;
						lowest.imp[i + n]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0;
						lowest.pi[i + n]   = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0;
						lowest.tox[i + n]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0;

						if (subParts[n] === "chest" || (subParts[n] === "abdomen" && game.settings.get("gurps4e", "abdomenForLargeAreaInjury"))) { // Check to see if this part matches subLocation.chest to establish if a body part is a chest section, regardless of animal/humanoid/thorax. Do the same for abdomen after checking the game setting.
							// Check it exists and add it to the torso array
							torso.burn[torso.burn.length] = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0;
							torso.cor[torso.cor.length]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0;
							torso.cr[torso.cr.length]   = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0;
							torso.cut[torso.cut.length]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0;
							torso.fat[torso.fat.length]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0;
							torso.imp[torso.imp.length]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0;
							torso.pi[torso.pi.length]   = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0;
							torso.tox[torso.tox.length]  = getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0;
						}
					}
				}
			}
		}

		// Get actual torso DR from the array based on the campaign setting

		let torsoDRForLargeAreaInjury = game.settings.get("gurps4e", "torsoDRForLargeAreaInjury");

		// Init the object to hold the torso armour for each type
		let selectedTorsoDR;

		if (torsoDRForLargeAreaInjury === "avg") {
			// For each damage type, add all the entries together and divide by length to get the average
			selectedTorsoDR = {
				burn: 	torso.burn.reduce((a, b) => a + b, 0) / torso.burn.length,
				cor: 	torso.cor.reduce((a, b) => a + b, 0) / torso.cor.length,
				cr: 	torso.cr.reduce((a, b) => a + b, 0) / torso.cr.length,
				cut: 	torso.cut.reduce((a, b) => a + b, 0) / torso.cut.length,
				fat: 	torso.fat.reduce((a, b) => a + b, 0) / torso.fat.length,
				imp: 	torso.imp.reduce((a, b) => a + b, 0) / torso.imp.length,
				pi: 	torso.pi.reduce((a, b) => a + b, 0) / torso.pi.length,
				tox: 	torso.tox.reduce((a, b) => a + b, 0) / torso.tox.length,
			};
		}
		else if (torsoDRForLargeAreaInjury === "lowest") {
			// Chose the lowest entry from each for the torso DR
			selectedTorsoDR = {
				burn: 	Math.min(...torso.burn),
				cor: 	Math.min(...torso.cor),
				cr: 	Math.min(...torso.cr),
				cut: 	Math.min(...torso.cut),
				fat: 	Math.min(...torso.fat),
				imp: 	Math.min(...torso.imp),
				pi: 	Math.min(...torso.pi),
				tox: 	Math.min(...torso.tox),
			};
		}
		// Else covers "highest" and catches errors.
		else {
			// Chose the highest entry from each for the torso DR
			selectedTorsoDR = {
				burn: 	Math.max(...torso.burn),
				cor: 	Math.max(...torso.cor),
				cr: 	Math.max(...torso.cr),
				cut: 	Math.max(...torso.cut),
				fat: 	Math.max(...torso.fat),
				imp: 	Math.max(...torso.imp),
				pi: 	Math.max(...torso.pi),
				tox: 	Math.max(...torso.tox),
			};
		}

		armour = { // Init the final largeAreaDR object which we will return at the end of the method
			burn: 	(Math.min(...lowest.burn)	+ selectedTorsoDR.burn) / 2,
			cor: 	(Math.min(...lowest.cor)	+ selectedTorsoDR.cor) / 2,
			cr: 	(Math.min(...lowest.cr)		+ selectedTorsoDR.cr) / 2,
			cut: 	(Math.min(...lowest.cut)	+ selectedTorsoDR.cut) / 2,
			fat: 	(Math.min(...lowest.fat)	+ selectedTorsoDR.fat) / 2,
			imp: 	(Math.min(...lowest.imp)	+ selectedTorsoDR.imp) / 2,
			pi: 	(Math.min(...lowest.pi)		+ selectedTorsoDR.pi) / 2,
			tox: 	(Math.min(...lowest.tox)	+ selectedTorsoDR.tox) / 2,
		};

		return armour;
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
		else if (attack.damageType.toLowerCase().includes("tbb")) {
			damageType.type = "tbb"
			damageType.woundModId = "personalWoundMultTbb";
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

	async resetDamage() {
		let reserves = {
			er: {
				value: this.system.reserves.er.max
			},
			hp: {
				value: this.system.reserves.hp.max
			},
			fp: {
				value: this.system.reserves.fp.max
			}
		}

		this.system.reserves = reserves

		let keys = Object.keys(this.system.bodyType.body);

		for (let k = 0; k < keys.length; k++) {
			let location = getProperty(this.system.bodyType.body, keys[k]);

			if (location.hp){ // Check to see if the location tracks HP
				location.hp.value = location.hp.max; // Reset HP
			}
			if (location.subLocation) { // Check to see if the location has sublocations
				let subLocationKeys = Object.keys(location.subLocation); // Gather the subLocation keys for the loop
				for (let l = 0; l < subLocationKeys.length; l++) { // Loop through the subLocations
					let subLocation = getProperty(location.subLocation, subLocationKeys[l]);
					if (subLocation.hp) { // Check to see if the subLocation tracks HP
						subLocation.hp.value = subLocation.hp.max; // Reset HP
					}
				}
			}
		}

		this.update({ 'data': this.system });
	}
}
