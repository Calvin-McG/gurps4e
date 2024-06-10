import {attributeHelpers} from '../../helpers/attributeHelpers.js';
import {generalHelpers} from '../../helpers/generalHelpers.js';
import {actorHelpers} from "../../helpers/actorHelpers.js";
import {skillHelpers} from "../../helpers/skillHelpers.js";
import {vehicleHelpers} from "../../helpers/vehicleHelpers.js";
import {attackHelpers} from "../../helpers/attackHelpers.js";
import {infoHelpers} from "../../helpers/infoHelpers.js";
import {distanceHelpers} from "../../helpers/distanceHelpers.js";
import {economicHelpers} from "../../helpers/economicHelpers.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class gurpsActor extends Actor {

	// Prior to creation, set the name and image by actor type.
	// for some reason, onCreate was not working for actors.
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);

		switch (this.type) {
			case "fullchar":
				if (this.name.match("^Character.*")) {
					this.name = "New Character " + Math.floor(Math.random() * 101);
				}
				this.img = "icons/svg/mystery-man.svg"; // This icon comes from the foundry default set
				break;
			case "Simple Vehicle":
				if (this.name.match("^Vehicle.*")) {
					this.name = "New Vehicle " + Math.floor(Math.random() * 101);
				}
				this.img = "systems/gurps4e/icons/svg/car.svg"; // This icon comes from the GURPS set
				break;
		}

		// update the document's source
		// this is a synchronous operation
		// because it's executed locally BEFORE the item data is sent to the database
		return this.updateSource({ name: this.name, img: this.img });
	}

	/**
	 * Augment the basic actor data with additional dynamic system.
	 */
	prepareData() {
		super.prepareData();
		switch (this.type) {
			case "fullchar":
				this.prepareActorData();
				break;
			case "Simple Vehicle":
				this.checkUndefinedChase();
				this.prepareSimpleVehicleData();
				break;
		}
		this.setupEquipmentCategories();
	}

	checkUndefinedChase() {
		if (typeof this.system.chase === "undefined") {
			this.system.chase = {
				"hndModifier": 0,
				"topSpeedBonus": 0,
				"totalModifier": 0,
				"acceleration": 0,
				"move": 0,
				"topSpeed": 0,
				"windCondition": "with"
			}
		}
	}

	prepareSimpleVehicleData() {
		this.checkUndefinedVehicles();
		this.system.cost.costFactor = 1;
		this.system.cost.finalCostMod = 0;
		// This section splits up the logic between Pick and Custom
		if (this.system.vehicle.method === "pick") {
			this.loadBaseVehicles();
			this.system.vehicle.baseVehicle = vehicleHelpers.getVehicleByCode(this.system.vehicle.baseVehicle.code);

			this.applyBaseVehicle();
		}
		else {
			this.system.vehicle.baseVehicle = undefined;
		}
		this.system.reserves.hp.max = parseInt(this.system.vehicle.sthp);

		// Total up the weight and value in the vehicle
		this.sumWeightAndValue()

		// Convert the ht code string to the set of bools on the ht object.
		this.system.vehicle.ht.combustible = this.system.vehicle.ht.code.toString().toLowerCase().includes("c");
		this.system.vehicle.ht.flammable = this.system.vehicle.ht.code.toString().toLowerCase().includes("f");
		this.system.vehicle.ht.explosive = this.system.vehicle.ht.code.toString().toLowerCase().includes("x");

		// This section is for logic that applies to both methods
		this.vehicleWeightHandling();

		this.clearLocationCounts(); // Set all location counts to zero in preparation for them being reset.
		this.assessLocations(); // Go through the location string and use the values to update the block of actual locations stored on the vehicle.
		this.vehicleCost();

		// Calculate special movement info based on the given inputs.
		if (this.system.vehicle.craftType === "land") {
			this.calcGroundVehicleMove();
		}
		else if (this.system.vehicle.craftType === "water") {
			this.calcWaterVehicleMove();
		}
		else if (this.system.vehicle.craftType === "air") {
			this.calcAirVehicleMove();
		}

		this.vehicleChaseDetails();
		this.vehicleAttacks();
		this.travelDetails();
	}

	vehicleAttacks() {
		this.system.vehicle.thr = attributeHelpers.strikingStrengthToThrust(this.system.vehicle.sthp)
	}

	clearLocationCounts() {
		this.system.vehicle.loc.B.count = 1;
		this.system.vehicle.loc.A.count = 0;
		this.system.vehicle.loc.C.count = 0;
		this.system.vehicle.loc.D.count = 0;
		this.system.vehicle.loc.E.count = 0;
		this.system.vehicle.loc.G.count = 0;
		this.system.vehicle.loc.g.count = 0;
		this.system.vehicle.loc.H.count = 0;
		this.system.vehicle.loc.L.count = 0;
		this.system.vehicle.loc.M.count = 0;
		this.system.vehicle.loc.O.count = 0;
		this.system.vehicle.loc.R.count = 0;
		this.system.vehicle.loc.S.count = 0;
		this.system.vehicle.loc.s.count = 0;
		this.system.vehicle.loc.T.count = 0;
		this.system.vehicle.loc.t.count = 0;
		this.system.vehicle.loc.W.count = 0;
		this.system.vehicle.loc.Wi.count = 0;
		this.system.vehicle.loc.X.count = 0;

		// Either it's unpowered but the injury tolerance is not what is expected, OR, it's powered and the injury tolerance is what is expected.
		if ((this.system.vehicle.sthpCode.includes("†") && !this.system.vehicle.injuryToleranceExpected) || (!this.system.vehicle.sthpCode.includes("†") && this.system.vehicle.injuryToleranceExpected)) {
			this.system.vehicle.loc.V.count = 1;
		}
		else {
			this.system.vehicle.loc.V.count = 0;
		}
	}

	vehicleChaseDetails() {
		this.system.chase.hndModifier = parseInt(this.system.vehicle.hnd);

		if (this.system.vehicle.craftType === "land") {
			if (this.system.chase.terrainQuality === "rail") {
				this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(this.system.vehicle.move.rail));
				this.system.chase.move = this.system.vehicle.move.rail;
			}
			else if (this.system.chase.terrainQuality === "road") {
				this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(this.system.vehicle.move.road));
				this.system.chase.move = this.system.vehicle.move.road;
			}
			else if (this.system.chase.terrainQuality === "good") {
				this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(this.system.vehicle.move.good));
				this.system.chase.move = this.system.vehicle.move.good;
			}
			else if (this.system.chase.terrainQuality === "average") {
				this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(this.system.vehicle.move.average));
				this.system.chase.move = this.system.vehicle.move.average;
			}
			else if (this.system.chase.terrainQuality === "bad") {
				this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(this.system.vehicle.move.bad));
				this.system.chase.move = this.system.vehicle.move.bad;
			}
			else if (this.system.chase.terrainQuality === "veryBad") {
				this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(this.system.vehicle.move.veryBad));
				this.system.chase.move = this.system.vehicle.move.veryBad;
			}

			this.system.chase.acceleration = this.system.vehicle.acceleration.ground;
		}
		else if (this.system.vehicle.craftType === "water") {
			// First, store the base naval movement and acceleration as the defaults
			let effectiveMove = this.system.vehicle.move.naval;
			let effectiveAcceleration = this.system.vehicle.acceleration.naval;

			// Then, if the results from the sailing stats would be higher, override with them
			if (this.system.vehicle.sailing && this.system.chase.windCondition === "with") { // Sailing vessel with the wind
				effectiveMove = Math.max(effectiveMove, this.system.vehicle.move.navalWind);
				effectiveAcceleration = Math.max(effectiveAcceleration, this.system.vehicle.acceleration.navalWind)
			}
			else if (this.system.vehicle.sailing && this.system.chase.windCondition === "against") { // Sailing vessel against the wind
				effectiveMove = Math.max(effectiveMove, this.system.vehicle.move.navalAgainstWind);
				effectiveAcceleration = Math.max(effectiveAcceleration, this.system.vehicle.acceleration.navalAgainstWind)
			}

			// By this point we have the naval vessel's best options for acceleration and move, whether that be with or against the wind, or without sails at all.
			this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(effectiveMove));
			this.system.chase.move = effectiveMove;
			this.system.chase.acceleration = effectiveAcceleration;
		}
		else if (this.system.vehicle.craftType === "air") {
			this.system.chase.topSpeedBonus = -1 * parseInt(distanceHelpers.distancePenalty(this.system.vehicle.move.air));
			this.system.chase.move = this.system.vehicle.move.air;
			this.system.chase.acceleration = this.system.vehicle.acceleration.air;
		}

		this.system.chase.totalModifier = this.system.chase.hndModifier + this.system.chase.topSpeedBonus;
	}

	travelDetails() {
		this.system.travel.wealthLevels = economicHelpers.getWealthLevels();
		this.system.travel.units = distanceHelpers.listUnits(); // Get the list of units for players to select among

		let distanceInYards = distanceHelpers.convertToYards(this.system.travel.distance, this.system.travel.unit);
		let distanceInMiles = distanceInYards / 1760; // Convert to miles, our unit of measure

		if (typeof this.system.vehicle !== "undefined") {

			// Validation for travelling hours
			if (typeof this.system.travel.travellingHours == "undefined" || this.system.travel.travellingHours <= 0) { // Traveling hours is undefined or negative/zero. Set it to the default.
				if (this.system.vehicle.craftType === "water" || this.system.vehicle.craftType === "air") { // Vehicle is naval or air, default is 24
					this.system.travel.travellingHours = 24;
				}
				else { // Vehicle is ground, default is 8
					this.system.travel.travellingHours = 8;
				}
			}
			else if (this.system.travel.travellingHours > 24){ // Travelling hours is more than 24, set it to 24
				this.system.travel.travellingHours = 24;
			}
			else if (this.system.vehicle.propulsion === "animals"){ // The vehicle requires animals to draw it
				if (this.system.travel.travellingHours > 8 && this.system.travel.travellingHours <= 9.3) { // The vehicle is in it's rest period, push the selected hours out of that period.
					if (this.system.travel.travellingHours > 8.65) { // The travel time is in the bottom half of the rest period
						this.system.travel.travellingHours = 8; // Move it to before the rest period
					}
					else { // The travel time is in the upper half of the rest period.
						this.system.travel.travellingHours = 9.4; // Move it to after the rest period
					}
				}
			}

			let travellingHoursMinusRest = this.system.travel.travellingHours;

			if (this.system.vehicle.propulsion === "animals" && this.system.travel.travellingHours >= 9.3) { // There are animals involved and the trip is long enough to require a rest.
				travellingHoursMinusRest -= 1.3; // Remove the rest hours from the effective travelling hours.
			}

			// Travel Time Calculation
			let cargoSpacePounds = this.system.vehicle.weight.load * 2000;
			if (this.system.vehicle.craftType === "water") {
				let poweredTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.naval, travellingHoursMinusRest)
				let poweredVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, poweredTime[1], travellingHoursMinusRest);

				this.system.travel.travelTime = "Travelling under power: " + poweredTime[0] + "<br/>";;
				this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(poweredVehicleRunningCosts, "Travelling under power", cargoSpacePounds)

				if (this.system.vehicle.sailing) {
					let downwindTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.navalWind, travellingHoursMinusRest)
					let downwindVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, downwindTime[1], travellingHoursMinusRest);

					let upwindTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.navalAgainstWind, travellingHoursMinusRest)
					let upwindVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, upwindTime[1], travellingHoursMinusRest);

					this.system.travel.travelTime += "Travelling with the wind: " + downwindTime[0] + "<br/>";
					this.system.travel.travelTime += "Travelling against the wind: " + upwindTime[0];

					this.system.travel.travelCost += vehicleHelpers.getVehicleTravelCostOutput(downwindVehicleRunningCosts, "Travelling with the wind", cargoSpacePounds)
					this.system.travel.travelCost += vehicleHelpers.getVehicleTravelCostOutput(upwindVehicleRunningCosts, "Travelling against the wind", cargoSpacePounds)
				}
			}
			else if (this.system.vehicle.craftType === "land") {
				if (this.system.travel.terrainQuality === "rail" || this.system.vehicle.land.railBound) {
					this.system.travel.cruise = this.system.vehicle.move.rail / 1.6;
					let railTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.rail, travellingHoursMinusRest)
					this.system.travel.travelTime = railTime[0] + "<br/>";
					let railVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, railTime[1], travellingHoursMinusRest);
					this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(railVehicleRunningCosts, "Travelling by rail", cargoSpacePounds);
				}
				else if (this.system.travel.terrainQuality === "road") {
					this.system.travel.cruise = this.system.vehicle.move.road / 1.6;
					let roadTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.road, travellingHoursMinusRest)
					this.system.travel.travelTime = roadTime[0] + "<br/>";
					let roadVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, roadTime[1], travellingHoursMinusRest);
					this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(roadVehicleRunningCosts, "Travelling by road", cargoSpacePounds);
				}
				else if (this.system.travel.terrainQuality === "good") {
					this.system.travel.cruise = this.system.vehicle.move.good / 1.6;
					let goodTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.good, travellingHoursMinusRest)
					this.system.travel.travelTime = goodTime[0] + "<br/>";
					let goodVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, goodTime[1], travellingHoursMinusRest);
					this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(goodVehicleRunningCosts, "Travelling on good terrain", cargoSpacePounds);
				}
				else if (this.system.travel.terrainQuality === "average") {
					this.system.travel.cruise = this.system.vehicle.move.average / 1.6;
					let averageTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.average, travellingHoursMinusRest)
					this.system.travel.travelTime = averageTime[0] + "<br/>";
					let averageVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, averageTime[1], travellingHoursMinusRest);
					this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(averageVehicleRunningCosts, "Travelling on average terrain", cargoSpacePounds);
				}
				else if (this.system.travel.terrainQuality === "bad") {
					this.system.travel.cruise = this.system.vehicle.move.bad / 1.6;
					let badTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.bad, travellingHoursMinusRest)
					this.system.travel.travelTime = badTime[0] + "<br/>";
					let badVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, badTime[1], travellingHoursMinusRest);
					this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(badVehicleRunningCosts, "Travelling on bad terrain", cargoSpacePounds);
				}
				else if (this.system.travel.terrainQuality === "veryBad") {
					this.system.travel.cruise = this.system.vehicle.move.veryBad / 1.6;
					let veryBadTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.veryBad, travellingHoursMinusRest)
					this.system.travel.travelTime = veryBadTime[0] + "<br/>";
					let veryBadVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, veryBadTime[1], travellingHoursMinusRest);
					this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(veryBadVehicleRunningCosts, "Travelling on very bad terrain", cargoSpacePounds);
				}
			}
			else if (this.system.vehicle.craftType === "air") {
				let airTime = vehicleHelpers.getVehicleRunningTime(distanceInMiles, this.system.vehicle.move.air, travellingHoursMinusRest)
				let airVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system, airTime[1], travellingHoursMinusRest);
				this.system.travel.travelCost = vehicleHelpers.getVehicleTravelCostOutput(airVehicleRunningCosts, undefined, cargoSpacePounds);
				this.system.travel.travelTime = airTime[0]
			}
		}
		else {
			this.system.travel.travelTime = "";
		}
	}

	applyBaseVehicle() {
		this.system.vehicle.className = this.system.vehicle.baseVehicle.name ?? this.name;
		this.system.bio.tl.value = this.system.vehicle.baseVehicle.tl ?? game.settings.get("gurps4e", "campaignTL") ?? 0;
		this.system.bio.sm.value = parseInt(this.system.vehicle.baseVehicle.sm);
		this.system.vehicle.ht.code = this.system.vehicle.baseVehicle.htCodes ?? "";
		this.system.vehicle.sthp = this.system.vehicle.baseVehicle.sthp ?? generalHelpers.calculateHPFromWeight(this.system.vehicle.baseVehicle.loadedWeight);
		this.system.vehicle.sthpCode = this.system.vehicle.baseVehicle.sthpCode === "T" ? "†" : this.system.vehicle.baseVehicle.sthpCode ?? "";
		this.system.vehicle.hnd = this.system.vehicle.baseVehicle.hnd;
		this.system.vehicle.sr = this.system.vehicle.baseVehicle.sr;
		this.system.vehicle.ht.value = this.system.vehicle.baseVehicle.ht ?? 11;
		this.system.vehicle.ht.code = this.system.vehicle.baseVehicle.htCodes ?? "";
		this.system.vehicle.acceleration.ground = this.system.vehicle.baseVehicle.acceleration;
		this.system.vehicle.locations = this.system.vehicle.baseVehicle.locations;
		this.system.vehicle.crew = this.system.vehicle.baseVehicle.crew;
		this.system.vehicle.passengers = this.system.vehicle.baseVehicle.passengers;
		this.system.vehicle.range = this.system.vehicle.baseVehicle.range;
		this.system.cost.baseCost = this.system.vehicle.baseVehicle.cost;
		this.system.vehicle.skill.operatorSkillName = this.system.vehicle.baseVehicle.skill;
		this.system.vehicle.upwindMultiplier = this.system.vehicle.baseVehicle.upwindMultiplier;

		// Assume Motive Type
		if (this.system.vehicle.baseVehicle.locations.includes("C") && this.system.vehicle.baseVehicle.locations.includes("R")) {
			this.system.vehicle.motiveType = "rTrack";
		}
		else if (this.system.vehicle.baseVehicle.locations.includes("W") && this.system.vehicle.baseVehicle.locations.includes("R")) {
			this.system.vehicle.motiveType = "skidsW";
		}
		else if (this.system.vehicle.baseVehicle.locations.includes("W") && this.system.vehicle.baseVehicle.locations.includes("C")) {
			this.system.vehicle.motiveType = "wTrack";
		}
		else if (this.system.vehicle.baseVehicle.locations.includes("R")) {
			this.system.vehicle.motiveType = "skids";
		}
		else if (this.system.vehicle.baseVehicle.locations.includes("C")) {
			this.system.vehicle.motiveType = "track";
		}
		else if (typeof this.system.vehicle.baseVehicle.moveCode !== "undefined" && this.system.vehicle.baseVehicle.moveCode.includes("‡")) {
			this.system.vehicle.motiveType = "rail";
		}
		else if (this.system.vehicle.baseVehicle.locations.includes("W")) {
			this.system.vehicle.motiveType = "wheel";
		}
		else if (this.system.vehicle.baseVehicle.locations.includes("L")) {
			this.system.vehicle.motiveType = "leg";
		}
		else {
			this.system.vehicle.motiveType = "immune";
		}

		// Movement related information
		this.system.vehicle.move.code = this.system.vehicle.baseVehicle.moveCode ?? ""; // Save the moveCode so we can reference it later
		if (this.system.vehicle.baseVehicle.ground) {
			this.system.vehicle.craftType = "land";

			this.system.vehicle.move.ground = parseFloat(this.system.vehicle.baseVehicle.moveGround); // Save the base vehicle's ground move to the input
		}
		else if (this.system.vehicle.baseVehicle.naval) {
			this.system.vehicle.craftType = "water";
			if (this.system.vehicle.baseVehicle.sail) {
				// Naval Move
				this.system.vehicle.move.naval = this.system.vehicle.baseVehicle.moveNaval ?? this.system.vehicle.baseVehicle.move ?? 0;
				this.system.vehicle.move.navalWind = this.system.vehicle.baseVehicle.moveNavalWind ?? this.system.vehicle.baseVehicle.move ?? 0;

				// Naval Acceleration
				this.system.vehicle.acceleration.naval = this.system.vehicle.baseVehicle.accelerationNaval ?? this.system.vehicle.baseVehicle.acceleration ?? 0;
				this.system.vehicle.acceleration.navalWind = this.system.vehicle.baseVehicle.accelerationWind ?? this.system.vehicle.baseVehicle.acceleration ?? 0;

				this.system.vehicle.sailing = true;
			}
			else {
				// Naval Move
				this.system.vehicle.move.naval = this.system.vehicle.baseVehicle.moveNaval ?? this.system.vehicle.baseVehicle.move ?? 0;

				// Naval Acceleration
				this.system.vehicle.acceleration.naval = this.system.vehicle.baseVehicle.accelerationNaval ?? this.system.vehicle.baseVehicle.acceleration ?? 0;

				this.system.vehicle.sailing = false;
			}
		}
		else if (this.system.vehicle.baseVehicle.air) {
			this.system.vehicle.craftType = "air";
			this.system.vehicle.move.air = parseFloat(this.system.vehicle.baseVehicle.moveAir); // Save the base vehicle's air move to the input
			this.system.vehicle.acceleration.air = this.system.vehicle.baseVehicle.accelerationAir ?? this.system.vehicle.baseVehicle.acceleration ?? 0;
		}

		// Weight Related Info
		this.system.vehicle.weight.lwt = parseFloat(this.system.vehicle.baseVehicle.loadedWeight);
		this.system.vehicle.weight.load = parseFloat(this.system.vehicle.baseVehicle.load);

		this.applyBaseVehicleDR()
	}

	/**
	 * DR is loaded from the base vehicle based on the following rules:
	 *
	 * Locational DR is used first if present
	 * Facing DR is used next if present
	 * Base DR is used next, which fallbacks to 0 DR
	 *
	 */
	applyBaseVehicleDR() {
		// Base DR
		if (typeof this.system.vehicle.baseVehicle.dr !== "undefined") { // Do we have a value for base DR?
			this.system.vehicle.dr = parseInt(this.system.vehicle.baseVehicle.dr) ?? 0 ; // Try to set it, falling back to zero
		}
		else {
			this.system.vehicle.dr = 0;
		}
		// End Base DR

		// Facing DR
		if (typeof this.system.vehicle.baseVehicle.drFacing !== "undefined") { // Do we have a value for facing DR?
			this.system.vehicle.drFacing = { // For each facing, first try the facing value from the base vehicle, then default to null if it's not present
				"drFront":  this.system.vehicle.baseVehicle.drFacing.drFront  ?? null,
				"drRear":   this.system.vehicle.baseVehicle.drFacing.drRear   ?? null,
				"drSide":   this.system.vehicle.baseVehicle.drFacing.drSide   ?? null,
				"drTop":    this.system.vehicle.baseVehicle.drFacing.drTop 	  ?? null,
				"drBottom": this.system.vehicle.baseVehicle.drFacing.drBottom ?? null,
			}
		}
		// End Facing DR

		// Locational DR
		if (typeof this.system.vehicle.baseVehicle.loc !== "undefined") { // There are locations to check
			this.system.vehicle.baseVehicle.loc.forEach( vehicleLocation => { // Loop through the locations on the base vehicle
					if (typeof vehicleLocation.dr !== "undefined") { // If the location has a base DR
						this.system.vehicle.loc[vehicleLocation.code].locationalDR = true;
						this.system.vehicle.loc[vehicleLocation.code].dr = vehicleLocation.dr ?? undefined; // Save it
					}
					else {
						this.system.vehicle.loc[vehicleLocation.code].locationalDR = false;
					}
					if (typeof vehicleLocation.drFacing !== "undefined") {
						this.system.vehicle.loc[vehicleLocation.code].facingDR = true;
						this.system.vehicle.loc[vehicleLocation.code].drFacing = {  // For each facing, first try the facing value from the location, then default to null if it's not present
							"drFront":  vehicleLocation.drFront  ?? null,
							"drRear":   vehicleLocation.drRear 	 ?? null,
							"drSide":   vehicleLocation.drSide 	 ?? null,
							"drTop":    vehicleLocation.drTop 	 ?? null,
							"drBottom": vehicleLocation.drBottom ?? null,
						}
					}
					else {
						this.system.vehicle.loc[vehicleLocation.code].facingDR = false;
					}
				}
			) // End Loop
		}
		// End Locational DR
	}

	calcWaterVehicleMove() {
		if (this.system.vehicle.sailing) {
			this.system.vehicle.move.navalAgainstWind = this.system.vehicle.move.navalWind * (this.system.vehicle.upwindMultiplier ?? 0.5) // Default upwind move to half downwind move
			this.system.vehicle.acceleration.navalAgainstWind = this.system.vehicle.acceleration.navalWind * (this.system.vehicle.upwindMultiplier ?? 0.5) // Default upwind acceleration to half downwind acceleration
		}
		else {
			this.system.vehicle.move.navalAgainstWind = this.system.vehicle.move.naval;
			this.system.vehicle.acceleration.navalAgainstWind = this.system.vehicle.acceleration.naval;
		}

		this.system.vehicle.acceleration.output = Math.max(this.system.vehicle.acceleration.naval, this.system.vehicle.acceleration.navalWind);
		this.system.vehicle.move.output = Math.max(this.system.vehicle.move.naval, this.system.vehicle.move.navalWind);

		this.system.vehicle.deceleration.safe = Math.max((5 + parseInt(this.system.vehicle.hnd)), 1); // Water vehicle safe decel is 5 + Hnd, minimum 1
		this.system.vehicle.deceleration.maximum = Math.max(this.system.vehicle.acceleration.output * 2, this.system.vehicle.deceleration.safe); // All vehicles have a max deceleration of double their base move.
	}

	calcGroundVehicleMove() {
		let effectiveMoveInput = this.system.vehicle.move.ground; // Store moveInput in a separate value because we're going to modify it later

		if (this.system.vehicle.move.code.includes("‡")) { // Vehicle is rail bound
			this.system.vehicle.move.rail = this.system.vehicle.move.ground; // Rail bound vehicles can only move on rails.
			this.system.vehicle.move.road = 0;
			this.system.vehicle.move.good = 0;
			this.system.vehicle.move.average = 0;
			this.system.vehicle.move.bad = 0;
			this.system.vehicle.move.veryBad = 0;
			this.system.vehicle.land.railBound = true;

			this.system.vehicle.move.output = this.system.vehicle.move.rail;
		}
		else { // Vehicle is not rail bound, proceed as normal
			this.system.vehicle.land.railBound = false;
			this.system.vehicle.move.road = this.system.vehicle.move.ground; // Road move is always the same as top speed

			if (this.system.vehicle.move.code.includes("*")) { // Vehicle is road bound
				this.system.vehicle.land.roadBound = true;
				effectiveMoveInput = Math.min(parseFloat(this.system.vehicle.move.ground), parseFloat(this.system.vehicle.acceleration.ground * 4)) // Road bound vehicles use the lower of Top Speed and 4xAcceleration when working out offroad speed.
				this.system.vehicle.move.good = effectiveMoveInput; // For road vehicles, top speed on good but non-road terrain is capped at the lower of the actual top speed and 4xAcceleration
			}
			else { // Vehicle is not road bound
				this.system.vehicle.land.roadBound = false;
				this.system.vehicle.move.good = this.system.vehicle.move.ground; // Meaning the good terrain speed is also the same as top speed
			}

			if (this.system.vehicle.motiveType === "wheel") {
				this.system.vehicle.move.average = effectiveMoveInput * 0.8;
			}
			else {
				this.system.vehicle.move.average = effectiveMoveInput * 1.6;
			}

			if (this.system.vehicle.motiveType === "wheel") {
				this.system.vehicle.move.bad = effectiveMoveInput * 0.4;
			}
			else {
				this.system.vehicle.move.bad = effectiveMoveInput * 0.8;
			}

			if (this.system.vehicle.motiveType === "wheel" || this.system.vehicle.motiveType === "skids") {
				this.system.vehicle.move.veryBad = effectiveMoveInput * 0.16;
			}
			else if (this.system.vehicle.motiveType.toLowerCase().includes("track")) {
				this.system.vehicle.move.veryBad = effectiveMoveInput * 0.24;
			}
			else {
				this.system.vehicle.move.veryBad = effectiveMoveInput * 0.32;
			}

			this.system.vehicle.move.rail = this.system.vehicle.move.good; // Non-railbound vehicles treat rails as good terrain.
			this.system.vehicle.move.output = this.system.vehicle.move.road;
		}

		this.system.vehicle.acceleration.output = this.system.vehicle.acceleration.ground;

		if (this.system.vehicle.motiveType === "wheel") { // Wheel safe deceleration is 5 yards per second.
			this.system.vehicle.deceleration.safe = 5;
		}
		else { // All other ground vehicles can safely decelerate at 10 yards per second.
			this.system.vehicle.deceleration.safe = 10;
		}
		this.system.vehicle.deceleration.maximum = this.system.vehicle.acceleration.ground * 2; // All vehicles have a max deceleration of double their base move.
	}

	calcAirVehicleMove() {
		this.system.vehicle.move.output = this.system.vehicle.move.air
		this.system.vehicle.acceleration.output = this.system.vehicle.acceleration.air;

		this.system.vehicle.deceleration.safe = Math.max((5 + parseInt(this.system.vehicle.hnd)), 1); // Air vehicle safe decel is 5 + Hnd, minimum 1
		this.system.vehicle.deceleration.maximum = Math.max(this.system.vehicle.acceleration.output * 2, this.system.vehicle.deceleration.safe); // All vehicles have a max deceleration of double their base move.
	}

	vehicleCost() {
		this.system.cost.finalCost = (this.system.cost.baseCost * this.system.cost.costFactor) + this.system.cost.finalCostMod
	}

	// This method parses the location string and use the values to update the block of actual locations stored on the vehicle.
	assessLocations() {
		let locationStrings = this.system.vehicle.locations.match(/r*\d*r*((Wi{1})|[ACDEGgHLMORrSsTtXW])/g); // Regex fetches only characters that match a GURPS Vehicle location, including the numerical prefix, if present.

		locationStrings.forEach( locationString => { // Loop through the strings we just collected.
			let retractable = false;
			if (locationString.includes("r")) { // The location included an 'r', which denotes a retractable locaiton.
				retractable = true; // Set retractable true
				locationString = locationString.replace("r", ""); // Remove any "r"s in the location string as it might disrupt the count parser below.
			}
			let count = isNaN(parseInt(locationString)) ? 1 : parseInt(locationString); // parseInt will take only the number at the start of the string and discard the rest. If it comes through NaN, then there was no number, so treat it as one.
			let locationCode = locationString.replace(count.toString(), ""); // Replace the number we just fetched with nothing. If it doesn't match, like if we retrieved a 1, that's fine because nothing happens.
			let locationObject = foundry.utils.getProperty(this.system.vehicle.loc,locationCode) // Get the object matching the location we're currently iterating over.
			locationObject.count = count; // It might be that a location string is entered twice. If so, make sure to include both counts in our total.
			locationObject.retractable = retractable ? retractable : locationObject.retractable; // If retractable is true, set the locationObject to also have it true. If it's false, don't change it. This covers cases where there are two sets of the same location, one of which is retractable and one which is not.
		});
	}

	loadBaseVehicles() {
		this.system.vehicle.baseVehicles = vehicleHelpers.fetchVehiclesByTypeAndTLRange(this.system.vehicle.craftType, this.system.vehicle.tlFilter.lo, this.system.vehicle.tlFilter.hi);
	}

	vehicleWeightHandling() {
		this.system.vehicle.weight.lwt = Math.round(this.system.vehicle.weight.lwt * 100) / 100; // Correct lwt to two decimals
		this.system.vehicle.weight.load = Math.round(this.system.vehicle.weight.load * 100) / 100; // Correct load to two decimals
		this.system.vehicle.weight.emptyWeight = Math.round((this.system.vehicle.weight.lwt - this.system.vehicle.weight.load) * 100) / 100; // Figure the empty weight of the vehicle and round to two decimal places.
	}

	checkUndefinedVehicles(){
		if (typeof this.system.vehicle === "undefined") {
			this.system.vehicle =
				{
					"craftType": "land",
					"propulsion": "powered",
					"draft": 12,
					"stall": 10,
					"injuryToleranceExpected": true,
					"animal": {
						"location": "draft",
						"type": "equine"
					},
					"land": {
						"roadBound": false,
						"railBound": false
					},
					"water": {
						"draft": 0
					},
					"air": {
						"roadBound": false,
						"railBound": false
					},
					"motiveType": "",
					"method": "pick",
					"tlFilter": {
						"lo": 0,
						"hi": 12
					},
					"baseVehicle": {
						"code": "subcompactCar"
					},
					"baseVehicles": [],
					"sthp": 10,
					"sthpCode": "",
					"hnd": 1,
					"sr": 3,
					"ht": {
						"value": 11,
						"flammable": false,
						"combustible": false,
						"explosive": false,
						"code": ""
					},
					"skill": {
						"operatorSkillPossible": [],
						"operatorSkillName": "",
						"operatorSkillLevel": 0,
						"crewed": false,
						"crewSkillPossible": [],
						"crewSkillName": "",
						"crewSkillLevel": 0
					},
					"acceleration": {
						"ground": 3,
						"output": 3,
						"navalWind": 0,
						"navalAgainstWind": 0,
						"naval": 0,
						"air": 0
					},
					"deceleration": {
						"safe": 5,
						"maximum": 10
					},
					"move": {
						"ground": 30,
						"output": 30,
						"code": "",
						"rail": 0,
						"road": 30,
						"good": 30,
						"average": 12,
						"bad": 6,
						"veryBad": 3,
						"naval": 0,
						"navalWind": 0,
						"navalAgainstWind": 0,
						"air": 0
					},
					"weight": {
						"lwt": 1,
						"load": 1,
						"emptyWeight": 0
					},
					"crew": 1,
					"passengers": 3,
					"occCode": "",
					"sm": 2,
					"range": 300,
					"baseCost": 10000,
					"finalCost": 10000,
					"locations": "G4W",
					"drMethod": "single",
					"dr": 0,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"loc": {
						"A": {
							"code": "A",
							"name": "arm",
							"Name": "Arm",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"C": {
							"code": "C",
							"name": "caterpillar tracks",
							"Name": "Caterpillar Tracks",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"D": {
							"code": "D",
							"name": "draft animals",
							"Name": "Draft Animals",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"E": {
							"code": "E",
							"name": "exposed rider",
							"Name": "Exposed Rider",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"G": {
							"code": "G",
							"name": "large glass windows",
							"Name": "Large Glass Windows",
							"dr": 2,
							"drFacing": {
								"drFront":  2,
								"drRear":   2,
								"drSide":   2,
								"drTop":    2,
								"drBottom": 2
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"g": {
							"code": "g",
							"name": "small glass windows",
							"Name": "Small Glass Windows",
							"dr": 2,
							"drFacing": {
								"drFront":  2,
								"drRear":   2,
								"drSide":   2,
								"drTop":    2,
								"drBottom": 2
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"H": {
							"code": "H",
							"name": "helicopter rotors",
							"Name": "Helicopter Rotors",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"L": {
							"code": "L",
							"name": "legs",
							"Name": "Legs",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"M": {
							"code": "M",
							"name": "mast and rigging",
							"Name": "Mast and Rigging",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"O": {
							"code": "O",
							"name": "open cabin",
							"Name": "Open Cabin",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"R": {
							"code": "R",
							"name": "runners and skids",
							"Name": "Runners and Skids",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"S": {
							"code": "S",
							"name": "large superstructure or gondola",
							"Name": "Large Superstructure or Gondola",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"s": {
							"code": "s",
							"name": "small superstructure",
							"Name": "Small Superstructure",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"T": {
							"code": "T",
							"name": "main turret",
							"Name": "Main Turret",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"t": {
							"code": "t",
							"name": "independent turret",
							"Name": "Independent Turret",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"W": {
							"code": "W",
							"name": "wheel",
							"Name": "Wheel",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"pneumatic": false,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"Wi": {
							"code": "Wi",
							"name": "wings",
							"Name": "Wings",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						},
						"X": {
							"code": "X",
							"name": "exposed weapon mount",
							"Name": "Exposed Weapon Mount",
							"dr": 0,
							"drFacing": {
								"drFront":  0,
								"drRear":   0,
								"drSide":   0,
								"drTop":    0,
								"drBottom": 0
							},
							"count": 0,
							"locationalDR": false,
							"facingDR": false,
							"retractable": false
						}
					}
				}
		}
		if (typeof this.system.vehicle.craftType === "undefined") {
			this.system.vehicle.craftType = "land";
		}
		if (typeof this.system.vehicle.method === "undefined") {
			this.system.vehicle.method = "pick";
		}
		if (typeof this.system.vehicle.tlFilter === "undefined") {
			this.system.vehicle.tlFilter = {
				"lo": 0,
				"hi": 12
			}
		}
		if (typeof this.system.vehicle.baseVehicle === "undefined") {
			this.system.vehicle.baseVehicle = {
				"code": "subcompactCar"
			}
		}
		if (typeof this.system.vehicle.baseVehicles === "undefined") {
			this.system.vehicle.baseVehicles = []
		}
		if (typeof this.system.vehicle.sthp === "undefined") {
			this.system.vehicle.sthp = 10
		}
		if (typeof this.system.vehicle.sthpCode === "undefined") {
			this.system.vehicle.sthpCode = ""
		}
		if (typeof this.system.vehicle.hnd === "undefined" || typeof this.system.vehicle.hnd === "object" || this.system.vehicle.hnd === null) {
			this.system.vehicle.hnd = 1
		}
		if (typeof this.system.vehicle.sr === "undefined" || this.system.vehicle.sr === null) {
			this.system.vehicle.sr = 3
		}
		if (typeof this.system.vehicle.ht === "undefined" || this.system.vehicle.ht === null) {
			this.system.vehicle.ht = {
				"value": 11,
				"flammable": false,
				"combustible": false,
				"explosive": false,
				"code": ""
			}
		}
		if (typeof this.system.vehicle.acceleration === "undefined") {
			this.system.vehicle.acceleration = {
				"ground": 3,
				"output": 3,
				"navalWind": 0,
				"navalAgainstWind": 0,
				"naval": 0,
				"air": 0
			}
		}
		if (typeof this.system.vehicle.move === "undefined") {
			this.system.vehicle.move = {
				"ground": 30,
				"output": 30,
				"code": "",
				"rail": 0,
				"road": 30,
				"good": 30,
				"average": 12,
				"bad": 6,
				"veryBad": 3,
				"naval": 0,
				"navalWind": 0,
				"navalAgainstWind": 0,
				"air": 0
			}
		}

		if (typeof this.system.cost === "undefined") {
			this.system.cost = {
				"baseCost": 0,
				"costFactor": 1,
				"finalCost": 0,
				"finalCostMod": 0
			}
		}

		if (typeof this.system.vehicle.deceleration === "undefined") {
			this.system.vehicle.deceleration = {
				"safe": 5,
				"maximum": 10
			}
		}

		// Undefined checks for weight
		if (typeof this.system.vehicle.weight === "undefined") {
			this.system.vehicle.weight = {
				"lwt": 1,
				"load": 1,
				"emptyWeight": 0
			}
		}
		else {
			if (typeof this.system.vehicle.weight.lwt === "undefined") {
				this.system.vehicle.weight.lwt = 1
			}
			if (typeof this.system.vehicle.weight.load === "undefined") {
				this.system.vehicle.weight.load = 1
			}
			if (typeof this.system.vehicle.weight.emptyWeight === "undefined") {
				this.system.vehicle.weight.emptyWeight = 0
			}
		}

		if (typeof this.system.vehicle.crew === "undefined" || this.system.vehicle.crew === null) {
			this.system.vehicle.crew = 1
		}
		if (typeof this.system.vehicle.passengers === "undefined" || this.system.vehicle.passengers === null) {
			this.system.vehicle.passengers = 3
		}
		if (typeof this.system.vehicle.occCode === "undefined") {
			this.system.vehicle.occCode = ""
		}
		if (typeof this.system.vehicle.sm === "undefined") {
			this.system.vehicle.sm = 2
		}
		if (typeof this.system.vehicle.range === "undefined") {
			this.system.vehicle.range = 300
		}
		if (typeof this.system.vehicle.baseCost === "undefined") {
			this.system.vehicle.baseCost = 10000
		}
		if (typeof this.system.vehicle.locations === "undefined") {
			this.system.vehicle.locations = "G4W"
		}
		if (typeof this.system.vehicle.dr === "undefined") {
			this.system.vehicle.dr = 2
		}
		if (typeof this.system.vehicle.loc === "undefined") {
			this.system.vehicle.loc = {
				"A": {
					"code": "A",
					"name": "arm",
					"Name": "Arm",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"C": {
					"code": "C",
					"name": "caterpillar tracks",
					"Name": "Caterpillar Tracks",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"D": {
					"code": "D",
					"name": "draft animals",
					"Name": "Draft Animals",
					"dr": 0,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"E": {
					"code": "E",
					"name": "exposed rider",
					"Name": "Exposed Rider",
					"dr": 0,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"G": {
					"code": "G",
					"name": "large glass windows",
					"Name": "Large Glass Windows",
					"dr": 2,
					"drFacing": {
						"drFront":  2,
						"drRear":   2,
						"drSide":   2,
						"drTop":    2,
						"drBottom": 2
					},
					"count": 0,
					"retractable": false
				},
				"g": {
					"code": "g",
					"name": "small glass windows",
					"Name": "Small Glass Windows",
					"dr": 2,
					"drFacing": {
						"drFront":  2,
						"drRear":   2,
						"drSide":   2,
						"drTop":    2,
						"drBottom": 2
					},
					"count": 0,
					"retractable": false
				},
				"H": {
					"code": "H",
					"name": "helicopter rotors",
					"Name": "Helicopter Rotors",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"L": {
					"code": "L",
					"name": "legs",
					"Name": "Legs",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"M": {
					"code": "M",
					"name": "mast and rigging",
					"Name": "Mast and Rigging",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"O": {
					"code": "O",
					"name": "open cabin",
					"Name": "Open Cabin",
					"dr": 0,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"R": {
					"code": "R",
					"name": "runners and skids",
					"Name": "Runners and Skids",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"S": {
					"code": "S",
					"name": "large superstructure or gondola",
					"Name": "Large Superstructure or Gondola",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"s": {
					"code": "s",
					"name": "small superstructure",
					"Name": "Small Superstructure",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"T": {
					"code": "T",
					"name": "main turret",
					"Name": "Main Turret",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"t": {
					"code": "t",
					"name": "independent turret",
					"Name": "Independent Turret",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"W": {
					"code": "W",
					"name": "wheel",
					"Name": "Wheel",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"Wi": {
					"code": "Wi",
					"name": "wings",
					"Name": "Wings",
					"dr": -1,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				},
				"X": {
					"code": "X",
					"name": "exposed weapon mount",
					"Name": "Exposed Weapon Mount",
					"dr": 0,
					"drFacing": {
						"drFront":  0,
						"drRear":   0,
						"drSide":   0,
						"drTop":    0,
						"drBottom": 0
					},
					"count": 0,
					"retractable": false
				}
			}
		}

		if (typeof this.system.travel == "undefined") {
			this.system.travel = {
				"unit": "mile",
				"units": [],
				"distance": 1,
				"travelTime": "",
				"travelCost": "",
				"travellingHours": 8,
				"terrainQuality": "road",
				"crewWealthMult": 1,
				"crewTL": 6
			}
		}
	}

	prepareActorData() {
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

		// Update TK related stuff
		this.updateTK();

		// Sort out the player's senses.
		this.recalcSenses();

		// Set up categories for each type
		this.setupOtherCategories();

		// Store the character's armour values for convenient use later.
		this.storeArmour()

		this.saveLocationalTotalDR()

		// Set status, etc, for reserves
		this.bodyReserves()

		// Update part specific HP
		this.partHP();

		// Update the total weight and value of everything on the sheet
		this.sumWeightAndValue();

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
					enhancedMove: 0,
					fpRecovery: 10,
				}
			}

			if (typeof this.system.info.learning === 'undefined') {
				this.system.info.learning = {
					show: false,
					will: 10,
					style: "1",
					lang: "0",
					missedDays: 0,
					studyWeekday: 0,
					studyWeekend: 0,
					mod: 0,
					gmBonus: game.settings.get("gurps4e", "gmLearningBonus"),
					finalEffective: 14,
					extraHours: 0
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
				this.system.injuryTolerances.damageReduction === "" ||
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
			if (typeof this.system.bodyModifiers.bornBiter == 'undefined' || this.system.bodyModifiers.bornBiter === "" || this.system.bodyModifiers.bornBiter == null) { // bornBiter is blank, null, or undefined
				this.system.bodyModifiers.bornBiter = 0; // Set to default value
			}
			else { // bornBiter is not blank, null, or undefined
				if (this.system.bodyModifiers.bornBiter < 0) { // bornBiter is less than zero (an invalid value)
					this.system.bodyModifiers.bornBiter = 0; // Set it to zero
				}
			}
		}

		if (this.system.bio.sm.value === "" || this.system.bio.sm.value == null || typeof this.system.bio.sm.value == "undefined") {
			this.system.bio.sm.value = 0;
		}

		if (this.system.bio.tl.value === "" || this.system.bio.tl.value == null || typeof this.system.bio.tl.value == "undefined" || this.system.bio.tl.value > 12 || this.system.bio.tl.value < 0) {
			this.system.bio.tl.value = game.settings.get("gurps4e", "campaignTL");
		}
		else {
			this.system.bio.tl.value = Math.floor(this.system.bio.tl.value);
		}

		if (typeof this.system.points.trained !== "number") {
			this.system.points.trained = 0;
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

				if(bodyType === ""){ // If the body is blank, default to humanoid
					bodyType = "humanoid";
				}

				// Spoders and squids have a brain instead of a skull. Everyone else has a skull
				if (bodyType === "arachnoid" || bodyType === "octopod"){
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
				if (bodyType === "humanoid"){
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
				if (bodyType === "wingedHumanoid"){
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
				else if (bodyType === "quadruped"){
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
				else if (bodyType === "wingedQuadruped"){
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
				else if (bodyType === "hexapod"){
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
				else if (bodyType === "wingedHexapod"){
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
				else if (bodyType === "centaur"){
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
				else if (bodyType === "avian"){
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
				else if (bodyType === "vermiform"){
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData, "upperChest","Upper Chest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData, "lowerChest","Lower Chest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData, "Abdomen","abdomen", vitals);
				}
				else if (bodyType === "lamia"){
					bodyObj.armLeft 	= actorHelpers.addArm(		actorData, "Left Arm", "armLeft");
					bodyObj.armRight 	= actorHelpers.addArm(		actorData, "Right Arm", "armRight");
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.tail 		= actorHelpers.addTail(		actorData, "tail");
					bodyObj.handLeft 	= actorHelpers.addExtremity(actorData,"Left Hand", "handLeft", "Hand", "Wrist", "Palm");
					bodyObj.handRight 	= actorHelpers.addExtremity(actorData,"Right Hand", "handRight", "Hand", "Wrist", "Palm");
				}
				else if (bodyType === "wingedLamia"){
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
				else if (bodyType === "octopod"){
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
				else if (bodyType === "cancroid"){
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
				else if (bodyType === "ichthyoid"){
					bodyObj.upperChest 	= actorHelpers.addChest(	actorData,"Upper Chest", "upperChest", vitals);
					bodyObj.lowerChest 	= actorHelpers.addChest(	actorData,"Lower Chest", "lowerChest", vitals);
					bodyObj.abdomen 	= actorHelpers.addAbdomen(	actorData,"Abdomen", "abdomen", vitals);
					bodyObj.tail 		= actorHelpers.addTail(		actorData, "tail");
					bodyObj.fin1 		= actorHelpers.addExtremity(actorData,"Dorsal Fin", "fin1", "Fin", "Joint");
					bodyObj.fin2 		= actorHelpers.addExtremity(actorData,"Left Fin", "fin2", "Fin", "Joint");
					bodyObj.fin3 		= actorHelpers.addExtremity(actorData,"Right Fin", "fin3", "Fin", "Joint");
				}
				else if (bodyType === "arachnoid"){
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
					let part = foundry.utils.getProperty(bodyObj, bodyParts[i]) // Get the current part

					// Assign front weight
					if (typeof part.weightFront !== "undefined"){ // Check to see if weightFront is defined
						totalWeightFront += +part.weightFront; // Add the front weight
					}
					else { // If the actor's weighting is not defined with the new front/back setup
						if (typeof part.weight !== "undefined"){ // Check to see if the old part.weight is still defined
							totalWeightFront += +part.weight; // Use that to set the front weight instead
						}
						console.error(this.name + " needs to refresh their body type"); // Print an error to console
					}

					// Assign back weight
					if (typeof part.weightBack !== "undefined"){ // Check to see if we have a back weight
						totalWeightBack += +part.weightBack; // Add it
					}
					else { // Fall back on the vanilla weight
						if (typeof part.weight !== "undefined"){ // Check to see if the old part.weight is still defined
							totalWeightBack += +part.weight; // Use that to set the back weight instead
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
				let points = 0;
				if (typeof this.items.contents[i].system.levelledPoints !== "undefined") { // If there's a levelledPoints object
					points = this.items.contents[i].system.levelledPoints.totalPoints
				}
				else {
					points = this.items.contents[i].system.points
				}

				if (isNaN(points) || typeof points === "undefined") { // Catch errors calculating point cost so it breaks only the one trait and not the whole sheet.
					points = 0; // Set back to 1.
				}

                traitPoints = traitPoints += points;
				advantagePoints = this.items.contents[i].system.category.toLowerCase() === "advantage" ? advantagePoints += points : advantagePoints;
                disadvantagePoints = this.items.contents[i].system.category.toLowerCase() === "disadv" ? disadvantagePoints += points : disadvantagePoints;
				quirkPoints = this.items.contents[i].system.category.toLowerCase() === "quirk" ? quirkPoints += points : quirkPoints;
				perkPoints = this.items.contents[i].system.category.toLowerCase() === "perk" ? perkPoints += points : perkPoints;
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
				if (typeof this.items.contents[i].system.basePointsPlusTraining === "number" && this.items.contents[i].system.basePointsPlusTraining > 0) {
					skillPoints = skillPoints + this.items.contents[i].system.basePointsPlusTraining; // Add the trained point value
					this.system.points.trained += this.items.contents[i].system.trainingTime.totalPoints; // Add the points earned from training to the value on the actor
				}
				else {
					skillPoints = skillPoints + this.items.contents[i].system.points; // Add the regular point value
				}
            }
        }
		this.system.points.skills = skillPoints;
    }

    recalcPathPoints() {
		if (this.system.showRPM) { // If the RPM tab is enabled for the parent actor, total up the points.
			let pathPoints = 0;
			// Iterate through the list of paths.
			let keys = Object.keys(this.system.rpm.path);
			if (keys.length > 0) {
				for (let k = 0; k < keys.length; k++) {
					pathPoints = pathPoints + foundry.utils.getProperty(this.system.rpm.path, keys[k]).points;
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
		for (let i = 0; i < this.items.contents.length; i++){
			if (this.items.contents[i].type === "Spell"){
				if (typeof this.items.contents[i].system.basePointsPlusTraining === "number" && this.items.contents[i].system.basePointsPlusTraining > 0) {
					spellPoints = spellPoints + this.items.contents[i].system.basePointsPlusTraining; // Add the trained point value
					this.system.points.trained += this.items.contents[i].system.trainingTime.totalPoints; // Add the points earned from training to the value on the actor
				}
				else {
					spellPoints = spellPoints += this.items.contents[i].system.points; // Add the regular point value
				}
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
		this.calcLearningInfo();
	}

	calcLearningInfo() {
		this.system.info.learning.will = this.system.primaryAttributes.will.value;
		this.system.info.learning.gmBonus = game.settings.get("gurps4e", "gmLearningBonus"); // Set the bonus from the GM

		let runningHourCount = 25 * 6; // This is the base number of hours, converted to hours of proper guided study, which we will later convert into a final numerical modifier on the Learning roll

		runningHourCount -= parseInt(this.system.info.learning.missedDays) * 6; // A missed day of instruction works out to 6 hours.

		runningHourCount += parseInt(this.system.info.learning.studyWeekday) * 6 / 2; // A weekday has 6 hours of free time, but counts at half value.

		runningHourCount += parseInt(this.system.info.learning.studyWeekend) * 15 / 2; // A weekend has 15 hours of free time, but counts at half value.

		runningHourCount += parseInt(this.system.info.learning.mod) * 15 ; // +1 is worth 15 hours.

		runningHourCount -= parseInt(this.system.info.learning.lang) * 15 ; // +1 is worth 15 hours, and the lang dropdown spits out a number from 0 to 2

		runningHourCount += game.settings.get("gurps4e", "gmLearningBonus") * 15 ; // +1 is worth 15 hours

		let finalMod = (runningHourCount - 150) / 15; // Subtract 150 hours, which is the baseline. Divide the remainder by 15 to get the modifier.

		this.system.info.learning.extraHours = (finalMod - Math.floor(finalMod)) * 15; // Get any remainder when converting the hours back into a modifier. This is used to give back a decimal bonus as a small number of hours (Less than 15).

		this.system.info.learning.finalEffective = Math.floor(finalMod) + this.system.info.learning.will; // Get an actual numerical modifier. (Learning is Will+4)

	}

	calcThrowingInfo() {
		let st = this.system.primaryAttributes.lifting.value; // Store the lifting ST for later

		let throwingSkill = (skillHelpers.getSkillLevelByName("Throwing", this))
		let trainingBonus = 0;

		trainingBonus = attackHelpers.getTrainingSTBonus(this.system.primaryAttributes.dexterity.value, throwingSkill, "Throwing", st)

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

	sumWeightAndValue() {
		let carriedWeight = 0;
		let carriedCost = 0;

		// Running loop to total up weight and value for the sheet, and to gather the total number of RPM stuff prepared
		for (let l = 0; l < this.items.contents.length; l++){
			if (this.items.contents[l].system.equipStatus !== "notCarried" && // It's either carried or equipped
				(this.items.contents[l].type === "Equipment" || // It's one of these item types.
					this.items.contents[l].type === "Custom Weapon" ||
					this.items.contents[l].type === "Custom Armour" ||
					this.items.contents[l].type === "Custom Jewelry")){
				carriedWeight = (+this.items.contents[l].system.weight * +this.items.contents[l].system.quantity) + +carriedWeight;
				carriedCost = (+this.items.contents[l].system.cost * +this.items.contents[l].system.quantity) + +carriedCost;
			}
		}

		carriedCost += +this.system.bio.money;

		carriedWeight = Math.round(carriedWeight * 100) / 100;
		carriedCost = Math.round(carriedCost * 100) / 100;

		if (isNaN(carriedWeight)) {
			carriedWeight = 0;
		}
		if (isNaN(carriedCost)) {
			carriedCost = 0;
		}

		// Assign total weight and cost
		this.system.bio.carriedWeight = carriedWeight;
		this.system.bio.carriedValue = carriedCost
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

		if (this.system.bio.carriedWeight <= this.system.encumbrance.none.lbs) {
			finalDodge = this.system.encumbrance.none.dodge;
			this.system.encumbrance.current = {
				ref: "none",
				title: "None",
				mult: 1,
				fpCost: 1,
				penalty: 0
			};
		}
		else if (this.system.bio.carriedWeight <= this.system.encumbrance.light.lbs){
			finalDodge = this.system.encumbrance.light.dodge;
			this.system.encumbrance.current = {
				ref: "light",
				title: "Light",
				mult: 0.8,
				fpCost: 2,
				penalty: -1
			};
		}
		else if (this.system.bio.carriedWeight <= this.system.encumbrance.medium.lbs){
			finalDodge = this.system.encumbrance.medium.dodge;
			this.system.encumbrance.current = {
				ref: "medium",
				title: "Medium",
				mult: 0.6,
				fpCost: 3,
				penalty: -2
			};
		}
		else if (this.system.bio.carriedWeight <= this.system.encumbrance.heavy.lbs){
			finalDodge = this.system.encumbrance.heavy.dodge;
			this.system.encumbrance.current = {
				ref: "heavy",
				title: "Heavy",
				mult: 0.4,
				fpCost: 4,
				penalty: -3
			};
		}
		else if (this.system.bio.carriedWeight <= this.system.encumbrance.xheavy.lbs){
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
		let total = +this.system.points.attributes + +this.system.points.traits + +this.system.points.skills + +this.system.points.spells + +this.system.points.path + +unspent - +this.system.points.trained;
		this.update({ ['system.points.total']: total });
	}

	/**
	 * This method is called by _onBaseVehicleSelectChange when the user modifies the Base Vehicle dropdown.
	 * It gets the new base vehicle code from the event target's value and does initialization logic for that base vehicle.
	 *
	 * @param event An event object sent by the <select> field
	 */
	updateBaseVehicle(event) {
		if (this.system.vehicle.method.toLowerCase() === "pick") {
			this.system.vehicle.baseVehicle = vehicleHelpers.getVehicleByCode(event.target.value);
		}

		// Set the body to contain all crew, if any
		if (parseInt(this.system.vehicle.baseVehicle.crew) > 0) { // There are crew
			this.system.vehicle.loc.B.hasCrew = true; // Set the flag
			this.system.vehicle.loc.B.crewCount = parseInt(this.system.vehicle.baseVehicle.crew); // Set the count
		}
		else {
			this.system.vehicle.loc.B.hasCrew = false; // Set the flag
			this.system.vehicle.loc.B.crewCount = 0; // Zero the count
 		}

		// Set the body to contain all passengers, if any
		if (parseInt(this.system.vehicle.baseVehicle.passengers) > 0) { // There are passengers
			this.system.vehicle.loc.B.hasPassengers = true; // Set the flag
			this.system.vehicle.loc.B.passengerCount = parseInt(this.system.vehicle.baseVehicle.passengers); // Set the count
		}
		else {
			this.system.vehicle.loc.B.hasPassengers = false; // Set the flag
			this.system.vehicle.loc.B.passengerCount = 0; // Zero the count
		}

		this.system.reserves.hp.value = parseInt(this.system.vehicle.baseVehicle.sthp) // Set current hp to the base vehicle's STHP

		this.update({ ['system']: this.system });
	}

	setRPMCoreSkill(skillName) {
		this.system.rpm.coreSkill = skillName;

		this.system.rpm.coreSkillLevel = skillHelpers.getSkillLevelByName(skillName, this) // Get the level of the core skill for this RPM caster

		if (typeof this.system.rpm.coreSkillLevel === "undefined") { // If the previous came back undefined, it may be because an attribute was entered
			this.system.rpm.coreSkillLevel = skillHelpers.getBaseAttrValue(skillName, this); // Check it.
		}

		let keys = Object.keys(this.system.rpm.path);

		if (keys.length > 0) {
			for (let k = 0; k < keys.length; k++) {
				let path = foundry.utils.getProperty(this.system.rpm.path, keys[k]);
				path.defaults = [
					{
						"skill": skillName,
						"mod": -6
					}
				]
				path.level = skillHelpers.computeSkillLevel(this, path); // Get the base skill level based on the points spent and any buying up from defaults
				path.level += path.mod; // Add path mod.
				path.level = Math.min(path.level, this.system.rpm.maxSkill, this.system.rpm.coreSkillLevel); // Apply the skill cap

				if (typeof path.level === "undefined") {
					path.level = 0;
				}
			}
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
		spent = +this.system.points.attributes + +this.system.points.traits + +this.system.points.skills + +this.system.points.spells + +this.system.points.path - +this.system.points.trained;

		unspent = +this.system.points.total - +spent;

		this.system.points.unspent = unspent;

		this.system.points.displayTotal = unspent + +this.system.points.attributes + +this.system.points.traits + +this.system.points.skills + +this.system.points.spells + +this.system.points.path;
	}

	setupEquipmentCategories() {
		this.system.equipmentCategories = [];
		this.system.equipmentCategories.push("");

		for (let w = 0; w < this.items.contents.length; w++) {
			if(this.items.contents[w].system.subCategory){
				if(this.items.contents[w].system.subCategory.trim() != ""){ // If subcategory is not blank
					if (this.items.contents[w].type == "Equipment" || this.items.contents[w].type == "Custom Weapon" || this.items.contents[w].type == "Custom Armour" || this.items.contents[w].type == "Custom Jewelry"){
						if (!this.system.equipmentCategories.includes(this.items.contents[w].system.subCategory.trim())) {//Make sure the item array doesn't already contain the category.
							this.system.equipmentCategories.push(this.items.contents[w].system.subCategory.trim())
						}
					}
				}
			}
		}
	}

	setupOtherCategories() {
		this.system.traitCategories = [];
		this.system.rollableCategories = [];
		this.system.spellCategories = [];

		this.system.traitCategories.push("");
		this.system.rollableCategories.push("");
		this.system.spellCategories.push("");

		for (let w = 0; w < this.items.contents.length; w++) {
			if(this.items.contents[w].system.subCategory){
				if(this.items.contents[w].system.subCategory.trim() != ""){ // If subcategory is not blank
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
				}
			}
		}
	}

	saveLocationalTotalDR(){
		if (this.system) { // Make sure the actor exists
			if (this.system.bodyType) { // Make sure the actor has a bodyType object
				if (this.system.bodyType.name.length > 0){ // Make sure the name of the body type is not blank
					let object = this.system.bodyType.body;
					let bodyParts = Object.keys(object); // Collect all the bodypart names
					for (let i = 0; i < bodyParts.length; i++){ // Loop through all the body parts
						if (bodyParts[i] === "skull" || bodyParts[i] === "brain"){ // Part has no sub-parts
							let currentBodyPart = foundry.utils.getProperty(object, bodyParts[i]);

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
							for (let q = 0; q < Object.keys(foundry.utils.getProperty(object, bodyParts[i] + ".dr")).length; q++) {
								let currentDRLayer = foundry.utils.getProperty(object, bodyParts[i] + ".dr")[q]
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
							let subParts = Object.keys(foundry.utils.getProperty(object, bodyParts[i] + ".subLocation")); // Collect all the subpart names
							for (let n = 0; n < subParts.length; n++){ // Loop through all the subparts
								let currentBodyPart = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n]);

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
								for (let q = 0; q < Object.keys(foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".dr")).length; q++) {
									let currentDRLayer = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".dr")[q]
									if (typeof currentDRLayer !== "undefined") {
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
					this.system.bodyType.drTypesOne = foundry.utils.getProperty(armour[0], this.system.bodyType.damageTypeOne.toLowerCase());
					this.system.bodyType.drTypesTwo = foundry.utils.getProperty(armour[0], this.system.bodyType.damageTypeTwo.toLowerCase());

					let items = this.items.contents.filter(filterArmour); // Get the character's items and filter out anything that isn't armour
					items = items.sort(sortArmourByLayer); // Take the above list and sort by layer. Index 0 is lowest, index infinity is highest.

					for (let l = 0; l < items.length; l++){ // Loop through the characters items and apply any relevant DR.
						armour[l+1] = this.getArmour(items[l].system.armour.bodyType.body, this.system.bodyType.body, l+1);
						let damageTypeOneObject;
						let damageTypeTwoObject;

						if (this.system.bodyType.damageTypeOne.length > 0) { // If they've selected a type for display
							damageTypeOneObject = foundry.utils.getProperty(armour[l+1], this.system.bodyType.damageTypeOne.toLowerCase()); // Set the DR
						}
						if (this.system.bodyType.damageTypeTwo.length > 0) { // If they've selected a second type for display
							damageTypeTwoObject = foundry.utils.getProperty(armour[l+1], this.system.bodyType.damageTypeTwo.toLowerCase()); // Set the DR
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
				if (bodyParts[i] === "skull" || bodyParts[i] === "brain"){ // Part has no sub-parts
					// For each dr type, add it to the object
					armour.burn[bodyParts[i]] = foundry.utils.getProperty(object, bodyParts[i] + ".drBurn") ? +foundry.utils.getProperty(object, bodyParts[i] + ".drBurn") : 0;
					armour.cor[bodyParts[i]]  = foundry.utils.getProperty(object, bodyParts[i] + ".drCor")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCor") : 0;
					armour.cr[bodyParts[i]]   = foundry.utils.getProperty(object, bodyParts[i] + ".drCr")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCr")  : 0;
					armour.cut[bodyParts[i]]  = foundry.utils.getProperty(object, bodyParts[i] + ".drCut")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCut") : 0;
					armour.fat[bodyParts[i]]  = foundry.utils.getProperty(object, bodyParts[i] + ".drFat")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drFat") : 0;
					armour.imp[bodyParts[i]]  = foundry.utils.getProperty(object, bodyParts[i] + ".drImp")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drImp") : 0;
					armour.pi[bodyParts[i]]   = foundry.utils.getProperty(object, bodyParts[i] + ".drPi")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".drPi")  : 0;
					armour.tox[bodyParts[i]]  = foundry.utils.getProperty(object, bodyParts[i] + ".drTox")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drTox") : 0;

					// For each DR type, add it to the underlying bodypart
					let dr = {
						burn: 	foundry.utils.getProperty(object, bodyParts[i] + ".drBurn") ? +foundry.utils.getProperty(object, bodyParts[i] + ".drBurn") : 0,
						cor: 	foundry.utils.getProperty(object, bodyParts[i] + ".drCor")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCor") : 0,
						cr: 	foundry.utils.getProperty(object, bodyParts[i] + ".drCr")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCr")  : 0,
						cut: 	foundry.utils.getProperty(object, bodyParts[i] + ".drCut")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCut") : 0,
						fat: 	foundry.utils.getProperty(object, bodyParts[i] + ".drFat")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drFat") : 0,
						imp: 	foundry.utils.getProperty(object, bodyParts[i] + ".drImp")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drImp") : 0,
						pi: 	foundry.utils.getProperty(object, bodyParts[i] + ".drPi")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".drPi")  : 0,
						tox: 	foundry.utils.getProperty(object, bodyParts[i] + ".drTox")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drTox") : 0,
						hardness: 1,
						flexible: false
					}

					if (foundry.utils.getProperty(object, bodyParts[i] + ".flexible")){ // Check to see if flexible exists and is true
						armour.flexible[bodyParts[i]] = true;
						dr.flexible = true;
					}
					else {
						armour.flexible[bodyParts[i]] = false;
						dr.flexible = false;
					}

					if (foundry.utils.getProperty(object, bodyParts[i] + ".drHardening")){ // Check to see if the hardening value exists
						armour.hardness[bodyParts[i]] = foundry.utils.getProperty(object, bodyParts[i] + ".drHardening"); // Set hardening
						dr.hardness = +foundry.utils.getProperty(object, bodyParts[i] + ".drHardening");
					}

					foundry.utils.setProperty(body, bodyParts[i] + ".dr." + index, dr);
				}
				else {
					let subParts = Object.keys(foundry.utils.getProperty(object, bodyParts[i] + ".subLocation")); // Collect all the subpart names
					for (let n = 0; n < subParts.length; n++){ // Loop through all the subparts
						// For each dr type, add it to the object
						armour.burn[bodyParts[i] + subParts[n]] = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0;
						armour.cor[bodyParts[i] + subParts[n]]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0;
						armour.cr[bodyParts[i] + subParts[n]]   = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0;
						armour.cut[bodyParts[i] + subParts[n]]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0;
						armour.fat[bodyParts[i] + subParts[n]]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0;
						armour.imp[bodyParts[i] + subParts[n]]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0;
						armour.pi[bodyParts[i] + subParts[n]]   = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0;
						armour.tox[bodyParts[i] + subParts[n]]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0;

						// For each DR type, add it to the underlying bodypart
						let dr = {
							burn: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0,
							cor: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0,
							cr: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0,
							cut: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0,
							fat: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0,
							imp: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0,
							pi: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0,
							tox: 	foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0,
							hardness: 1,
							flexible: false
						}

						if (foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".flexible")){ // Check to see if flexible exists and is true
							armour.flexible[bodyParts[i] + subParts[n]] = true;
							dr.flexible = true;
						}
						else {
							armour.flexible[bodyParts[i] + subParts[n]] = false;
							dr.flexible = false;
						}

						if (foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening")){ // Check to see if the hardening value exists
							armour.hardness[bodyParts[i] + subParts[n]] = +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening"); // Set hardening
							dr.hardness = +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drHardening");
						}

						foundry.utils.setProperty(body, bodyParts[i] + ".subLocation." + subParts[n] + ".dr." + index, dr);
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
						let currentPart = foundry.utils.getProperty(this.system.bodyType.body, bodyParts[i]);

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

							foundry.utils.setProperty(this.system.bodyType.body, bodyParts[i] + ".hp.state",state);
						}

						if (foundry.utils.getProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation")){//Part has sub parts
							let subParts = Object.keys(foundry.utils.getProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation"));

							for (let n = 0; n < subParts.length; n++){
								let currentSubPart = foundry.utils.getProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n]);
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

									foundry.utils.setProperty(this.system.bodyType.body, bodyParts[i] + ".subLocation." + subParts[n] + ".hp.state",state);
								}
							}
						}
					}
				}
			}
		}
	}

	updateMagic() {
		if (this.system) {
			if (this.system.showVanillaMagic) { // The character is using the vanilla magic tab.
				this.updateVanillaMagic();
			}
			if (this.system.showRPM) { // The character is using the RPM tab.
				this.updateRPM();
			}
		}
	}

	updateTK(){
		if (this.system) {
			if (this.system.showTK) { // The character has TK enabled

				if (typeof this.system.tk === "undefined") { // Undefined check for characters enabling TK for the first time
					this.system.tk = {
						"magnitude": 0,
						"move": 0,
						"moveAdj": 0,
						"lifting": 0,
						"liftingAdj": 0,
						"striking": 0,
						"strikingAdj": 0,
						"range": 10,
						"sw": "0d6",
						"thr": "0d6"
					}
				}

				this.system.tk.lifting 	= this.system.tk.magnitude + this.system.tk.liftingAdj;
				this.system.tk.striking = this.system.tk.magnitude + this.system.tk.strikingAdj;
				this.system.tk.move 	= this.system.tk.magnitude + this.system.tk.moveAdj;

				this.system.tk.thr 	= attributeHelpers.strikingStrengthToThrust(this.system.tk.striking);
				this.system.tk.sw 	= attributeHelpers.strikingStrengthToSwing(this.system.tk.striking);
			}
		}
	}

	updateVanillaMagic() {
		if (typeof this.system.senses.magic === "undefined") { // Undefined check for the new magic sense
			this.system.senses.magic = {
				"id": "magic",
				"abbr": "Magic",
				"value": 0,
				"mod": 0
			}
		}

		if (this.system.magic) { // Character has the magic block
			this.system.magic.totalMagicAttribute = attributeHelpers.calcMST(this); // Calculate the total magical attribute

			let per = this.system.primaryAttributes.perception.value;

			this.system.senses.magic.value = per + this.system.senses.magic.mod + (this.system.magic.magery ? this.system.magic.magery : 0);

			// Begin section for magical ST, used by Grognard spells, and the really cool Crushing Fist
			this.system.magic.thr = attributeHelpers.strikingStrengthToThrust(this.system.magic.totalMagicAttribute);
			this.system.magic.sw  = attributeHelpers.strikingStrengthToSwing(this.system.magic.totalMagicAttribute);
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

			if (typeof this.system.rpm.coreSkillLevel === "undefined") { // If the previous came back undefined, it may be because an attribute was entered
				this.system.rpm.coreSkillLevel = skillHelpers.getBaseAttrValue(this.system.rpm.coreSkill, this); // Check it.
			}

			if (typeof this.system.rpm.coreSkillLevel === 'undefined') { // If it's still undefined, set it to 0
				this.system.rpm.coreSkillLevel = 0;
			}

			this.system.rpm.totalEnergy = (this.system.rpm.magery * 3) + this.system.rpm.er;
			this.system.rpm.maxSkill = 12 + this.system.rpm.magery;
			this.system.rpm.maxConditional = this.system.rpm.magery + this.system.rpm.coreSkillLevel;

			let keys = Object.keys(this.system.rpm.path);

			if (keys.length > 0) {
				for (let k = 0; k < keys.length; k++) {
					let path = foundry.utils.getProperty(this.system.rpm.path, keys[k]);
					path.defaults = [
						{
							"skill": this.system.rpm.coreSkill,
							"mod": -6
						}
					]
					path.level = skillHelpers.computeSkillLevel(this, path); // Get the base skill level based on the points spent and any buying up from defaults
					path.level += path.mod; // Add path mod.
					path.level = Math.min(path.level, this.system.rpm.maxSkill, this.system.rpm.coreSkillLevel); // Apply the skill cap

					if (typeof path.level === "undefined") {
						path.level = 0;
					}
				}
			}

			// Alchemy stuff
			// Set default values for max elixirs and expiry duration
			this.system.rpm.maxElixirs = 0;
			this.system.rpm.expiryDuration = 0;

			// Undefined and blank checks for Alchemy skill name.
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

			// When crafting elixirs, your Alchemy skill is capped at 12+M. The following block handles the logic that decides whether the same cap applies when determining the maximum number of elixirs.
			// By default, the answer is no, meaning that low-magery but high skilled alchemists might not have very powerful elixirs, but they can have lots of them.
			if (game.settings.get("gurps4e", "rpmLimitAlchemySkill")) { // We are also capping skill for the purposes of determining elixir quantity
				this.system.rpm.alchemySkillLevel = Math.min(this.system.rpm.uncappedAlchemySkillLevel, this.system.rpm.maxSkill); // First, cap the alchemy skill
				this.system.rpm.alchemySkillLevelForElixirCap = this.system.rpm.alchemySkillLevel; // Then assign the elixir quantity cap
			}
			else {
				this.system.rpm.alchemySkillLevelForElixirCap = this.system.rpm.uncappedAlchemySkillLevel // First, assign the elixir quantity cap to the uncapped skill
				this.system.rpm.alchemySkillLevel = Math.min(this.system.rpm.uncappedAlchemySkillLevel, this.system.rpm.maxSkill); // Only then separately cap the alchemy skill
			}

			// This block sets the flags for each type of elixir limit
			let rpmElixirLimit = game.settings.get("gurps4e", "rpmElixirLimit"); // Get the rule that defines how elixirs are limited
			if (rpmElixirLimit === "withConditional") { // Elixirs are being counted among conditional skills
				this.system.rpm.withConditional = true;
				this.system.rpm.byAlchemySkill = false;
				this.system.rpm.expiration = false;
			}
			else if (rpmElixirLimit === "byAlchemySkill") { // Elixirs are being counted separately from conditional skills
				this.system.rpm.byAlchemySkill = true;
				this.system.rpm.withConditional = false;
				this.system.rpm.expiration = false;

				this.system.rpm.maxElixirs = this.system.rpm.magery + this.system.rpm.alchemySkillLevelForElixirCap; // We're limiting elixirs by alchemy skill, so calculate the limit here.
			}
			else if (rpmElixirLimit === "expiration") { // Elixirs are not being limited, but have an expiry date
				this.system.rpm.expiration = true;
				this.system.rpm.withConditional = false;
				this.system.rpm.byAlchemySkill = false;

				this.system.rpm.expiryDuration = (this.system.rpm.magery + this.system.rpm.uncappedAlchemySkillLevel) * 2; // We're limiting elixirs by expiration date, so calculate it here. Result is number of days
			}

			// Running loop to gather the total number of RPM stuff prepared
			this.system.rpm.totalConditional = 0;
			this.system.rpm.totalElixir = 0;
			for (let l = 0; l < this.items.contents.length; l++){
				if (this.system.showRPM) { // If the RPM tab is enabled for the parent actor, total up the number of ritual types for each cap.
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
		}
	}

	//==========================
	// This section is for macro methods
	//==========================

	resetDamage() {
		this.system.reserves.er.value = this.system.reserves.er.max;
		this.system.reserves.hp.value = this.system.reserves.hp.max;
		this.system.reserves.fp.value = this.system.reserves.fp.max;

		let keys = Object.keys(this.system.bodyType.body);

		for (let k = 0; k < keys.length; k++) {
			let location = foundry.utils.getProperty(this.system.bodyType.body, keys[k]);

			if (location.hp){ // Check to see if the location tracks HP
				location.hp.value = location.hp.max; // Reset HP
			}
			if (location.subLocation) { // Check to see if the location has sublocations
				let subLocationKeys = Object.keys(location.subLocation); // Gather the subLocation keys for the loop
				for (let l = 0; l < subLocationKeys.length; l++) { // Loop through the subLocations
					let subLocation = foundry.utils.getProperty(location.subLocation, subLocationKeys[l]);
					if (subLocation.hp) { // Check to see if the subLocation tracks HP
						subLocation.hp.value = subLocation.hp.max; // Reset HP
					}
				}
			}
		}

		this.update({ 'data': this.system });
	}

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

	showInfo(id) {
		this.system.info = infoHelpers.returnActorInfo(id);

		this.update({ 'system.info': this.system.info });
	}
}
