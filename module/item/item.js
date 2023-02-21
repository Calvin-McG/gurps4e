import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { skillHelpers } from '../../helpers/skillHelpers.js';
import { materialHelpers } from "../../helpers/materialHelpers.js";
import { distanceHelpers } from "../../helpers/distanceHelpers.js";
import { economicHelpers } from "../../helpers/economicHelpers.js";
import { actorHelpers } from "../../helpers/actorHelpers.js";
import { generalHelpers } from "../../helpers/generalHelpers.js";
import { vehicleHelpers } from "../../helpers/vehicleHelpers.js";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class gurpsItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic system.
   * 
   * Note: This does not appear to do anything that is not already accomplished
   * by template.json but may be part of the functionality required for dynamic 
   * updating of items inline. TBC
   * 
   * Note: This method is called on every item belonging to the actor, not just
   * the one being edited. So, if all the prepareItem methods are pointless we
   * should eliminate them.
   *
   * itemData includes:
   *  _id:""
   *  name:""
   *  type:""
   *  img:""
   *  data:{} - which is specific to a type as defined in template.json
   *    notes:"" - all types have one
   */
  prepareData() {
    super.prepareData();

    switch (this.type) {
      case "Equipment":
        this._prepareEquipmentData();
        break;
      case "Rollable":
        this._prepareRollableData();
        break;
      case "Spell":
        this._prepareSpellData();
        break;
      case "Trait":
        this._prepareTraitData();
        break;
      case "Custom Weapon":
        this._prepareCustomWeaponData();
        break;
      case "Custom Armour":
        this._prepareCustomArmourData();
        break;
      case "Travel Fare":
        this._prepareTravelFare();
        break;
      case "Custom Jewelry":
        this._prepareCustomJewelryData();
        break;
      case "Ritual":
        this._prepareRitualData();
        break;
      default: // not a supported type
       console.error("This type of item is not supported in the system!");
    }
    this.prepareAttackData();
  }

  validateEquipmentBasics() {
    // Check for undefined on cost, weight, and quantity
    if (typeof this.system.cost === undefined || typeof this.system.cost == null) { // Undefined set to 0
      this.system.cost = 0;
    }
    if (typeof this.system.weight === undefined || typeof this.system.weight == null) { // Undefined set to 0
      this.system.weight = 0;
    }
    if (typeof this.system.quantity === undefined || typeof this.system.quantity == null) { // Undefined set to 0
      this.system.quantity = 0;
    }

    // Constrain TL to valid values
    if (typeof this.system.tl === undefined || this.system.tl == null || this.system.tl === "") { // If it's undefined, blank, or null, set to default.
      this.system.tl = game.settings.get("gurps4e", "campaignTL");
    }

    //Constrain LC to valid values
    if (typeof this.system.lc === undefined || typeof this.system.lc == null) { // Undefined set to 4 (Open)
      this.system.lc = 4;
    }
  }

  finalEquipmentCalculation() {
    // Check for undefined on cost, weight, and quantity
    if (typeof this.system.cost === undefined || typeof this.system.cost == null) { // Undefined set to 0
      this.system.cost = 0;
    }
    if (typeof this.system.weight === undefined || typeof this.system.weight == null) { // Undefined set to 0
      this.system.weight = 0;
    }
    if (typeof this.system.quantity === undefined || typeof this.system.quantity == null) { // Undefined set to 0
      this.system.quantity = 0;
    }

    this.system.cost = Math.round(+this.system.cost * 100) / 100;
    this.system.weight = Math.round(+this.system.weight * 100000) / 100000;
    this.system.quantity = Math.round(+this.system.quantity);

    // Calculated total weight and cost
    this.system.ttlCost = Math.round((+this.system.cost * +this.system.quantity) * 100) / 100;
    this.system.ttlWeight = Math.round((+this.system.weight * +this.system.quantity) * 100) / 100;

    // Constrain TL to valid values
    if (typeof this.system.tl === undefined || this.system.tl == null || this.system.tl === "") { // If it's undefined, blank, or null, set to default.
      this.system.tl = game.settings.get("gurps4e", "campaignTL");
    }
    if (this.system.tl < 0){ // Too low
      this.system.tl = 0;
    }
    else if (this.system.tl > 12){ // Too high
      this.system.tl = 12;
    }

    //Constrain LC to valid values
    if (typeof this.system.lc === undefined || typeof this.system.lc == null) { // Undefined set to 4 (Open)
      this.system.lc = 4;
    }
    if (this.system.lc < 0){ // Too low
      this.system.lc = 0;
    }
    else if (this.system.lc > 4){ // Too high
      this.system.lc = 4;
    }
  }

  _prepareEquipmentData() {
    this.validateEquipmentBasics();
    this.finalEquipmentCalculation();
  }

  _prepareTravelFare() {
    this.validateEquipmentBasics();

    if (typeof this.system.travelFare == "undefined") {
      this.system.travelFare = {
        "method": "ground",
        "tlRange": 0,
        "unit": "mile",
        "units": [],
        "vehicleCode": "",
        "vehicle": {},
        "vehicles": [],
        "distance": 1,
        "initComplete": false,
        "travelTime": "",
        "travelCost": "",
        "travellingHours": 8,
      }
    }

    this.system.travelFare.units = distanceHelpers.listUnits();
    this.system.travelFare.vehicles = vehicleHelpers.fetchVehicles();
    this.system.travelFare.vehicleCatalogue = vehicleHelpers.fetchVehicleCatalogue(this.system.travelFare.method, this.system.tl, this.system.travelFare.tlRange);

    if (typeof this.system.travelFare.tlRange == "undefined" || this.system.travelFare.tlRange < 0) {
      this.system.travelFare.tlRange = 0;
    }
    else if (this.system.travelFare.tlRange > this.system.tl){
      this.system.travelFare.tlRange = this.system.tl;
    }

    let distanceInYards = distanceHelpers.convertToYards(this.system.travelFare.distance, this.system.travelFare.unit);
    let distanceInMiles = distanceInYards / 1760;

    this.system.travelFare.vehicle = vehicleHelpers.getVehicleByCode(this.system.travelFare.vehicleCode);

    if (typeof this.system.travelFare.vehicle !== "undefined") {

      // Validation for travelling hours
      if (typeof this.system.travelFare.travellingHours == "undefined" || this.system.travelFare.travellingHours <= 0) { // Traveling hours is undefined or negative/zero. Set it to the default.
        if (this.system.travelFare.vehicle.naval) { // Vehicle is naval or air, default is 24
          this.system.travelFare.travellingHours = 24;
        }
        else { // Vehicle is ground, default is 8
          this.system.travelFare.travellingHours = 8;
        }
      }
      else if (this.system.travelFare.travellingHours > 24){ // Travelling hours is more than 24, set it to 24
        this.system.travelFare.travellingHours = 24;
      }
      else if (typeof this.system.travelFare.vehicle.animal !== "undefined"){ // The vehicle requires animals to draw it
        if (this.system.travelFare.travellingHours > 8 && this.system.travelFare.travellingHours <= 9.3) { // The vehicle is in it's rest period, push the selected hours out of that period.
          if (this.system.travelFare.travellingHours > 8.65) { // The travel time is in the bottom half of the rest period
            this.system.travelFare.travellingHours = 8; // Move it to before the rest period
          }
          else { // The travel time is in the upper half of the rest period.
            this.system.travelFare.travellingHours = 9.4; // Move it to after the rest period
          }
        }
      }

      let travellingHoursMinusRest = this.system.travelFare.travellingHours;

      if (this.system.travelFare.vehicle.animals > 0 && this.system.travelFare.travellingHours >= 9.3) { // There are animals involved and the trip is long enough to require a rest.
        travellingHoursMinusRest -= 1.3; // Remove the rest hours from the effective travelling hours.
      }

      // Travel Time Calculation
      let cargoSpacePounds = this.system.travelFare.vehicle.load * 2000;

      if (this.system.travelFare.vehicle.naval) {
        let downwindTime = "";

        let downwindHoursDecimal = 0;
        let downwindDays = 0;
        let downwindHours = 0;
        let downwindMinutes = 0;

        downwindHoursDecimal = (distanceInMiles / (this.system.travelFare.vehicle.moveDownwind * 2));
        downwindDays = Math.floor(downwindHoursDecimal / travellingHoursMinusRest);
        downwindHours = Math.floor(downwindHoursDecimal - (downwindDays * travellingHoursMinusRest));
        downwindMinutes = Math.floor((downwindHoursDecimal - Math.floor(downwindHoursDecimal)) * 60);
        downwindTime = downwindDays + " days, " + downwindHours + " hours, " + downwindMinutes + " minutes.";

        // TODO - Use the new vehicleRunningCosts method
        let downwindVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system.travelFare.vehicle.cost, this.system.travelFare.vehicle.crew, downwindHoursDecimal, travellingHoursMinusRest);

        if (this.system.travelFare.vehicle.sail) {
          let upwindTime = "";
          let upwindHoursDecimal = 0;
          let upwindDays = 0;
          let upwindHours = 0;
          let upwindMinutes = 0;

          upwindHoursDecimal = (distanceInMiles / (this.system.travelFare.vehicle.moveUpwind * 2));
          upwindDays = Math.floor(upwindHoursDecimal / travellingHoursMinusRest);
          upwindHours = Math.floor(upwindHoursDecimal - (upwindDays * travellingHoursMinusRest));
          upwindMinutes = Math.floor((upwindHoursDecimal - Math.floor(upwindHoursDecimal)) * 60);
          upwindTime = upwindDays + " days, " + upwindHours + " hours, " + upwindMinutes + " minutes.";

          this.system.travelFare.travelTime = "Travelling with the wind: " + downwindTime;
          this.system.travelFare.travelTime += "<br/>Travelling against the wind: " + upwindTime;

          let upwindVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system.travelFare.vehicle.cost, this.system.travelFare.vehicle.crew, upwindHoursDecimal, travellingHoursMinusRest);

          this.system.travelFare.travelCost = "<table>" +
              "<tr><th colspan='2'>Travelling with the wind</th></tr>" +
              "<tr><td>Maintenance Costs</td><td>"  + Math.floor(downwindVehicleRunningCosts.maintenance * 100) / 100 + " $</td></tr>" +
              "<tr><td>Crew Salaries</td><td>"      + Math.floor(downwindVehicleRunningCosts.crewPay * 100) / 100 + " $</td></tr>" +
              "<tr><td>Provisions Cost</td><td>"    + Math.floor(downwindVehicleRunningCosts.provisionsCost * 100) / 100 + " $</td></tr>" +
              "<tr><td style='font-weight: bold'>Total Running Costs</td><td style='font-weight: bold'>" + Math.floor((downwindVehicleRunningCosts.maintenance + downwindVehicleRunningCosts.crewPay + downwindVehicleRunningCosts.provisionsCost) * 100) / 100 + " $</td></tr>" +
              "<tr><td>Provisions Weight</td><td>"  + Math.floor(downwindVehicleRunningCosts.provisionsWeight * 100) / 100 + " lbs</td></tr>" +
              "<tr><td>Free Cargo Space</td><td>"   + Math.floor((cargoSpacePounds - downwindVehicleRunningCosts.provisionsWeight) * 100) / 100 + " lbs</td></tr>" +
              "</table>";

          this.system.travelFare.travelCost += "<table>" +
              "<tr><th colspan='2'>Travelling against the wind</th></tr>" +
              "<tr><td>Maintenance Costs</td><td>"  + Math.floor(upwindVehicleRunningCosts.maintenance * 100) / 100 + " $</td></tr>" +
              "<tr><td>Crew Salaries</td><td>"      + Math.floor(upwindVehicleRunningCosts.crewPay * 100) / 100 + " $</td></tr>" +
              "<tr><td>Provisions Cost</td><td>"    + Math.floor(upwindVehicleRunningCosts.provisionsCost * 100) / 100 + " $</td></tr>" +
              "<tr><td style='font-weight: bold'>Total Running Costs</td><td style='font-weight: bold'>" + Math.floor((upwindVehicleRunningCosts.maintenance + upwindVehicleRunningCosts.crewPay + upwindVehicleRunningCosts.provisionsCost) * 100) / 100 + " $</td></tr>" +
              "<tr><td>Provisions Weight</td><td>"  + Math.floor(upwindVehicleRunningCosts.provisionsWeight * 100) / 100 + " lbs</td></tr>" +
              "<tr><td>Free Cargo Space</td><td>"   + Math.floor((cargoSpacePounds - upwindVehicleRunningCosts.provisionsWeight) * 100) / 100 + " lbs</td></tr>" +
              "<tr><td></td><td></td></tr>" +
              "</table>";

        }
        else {
          this.system.travelFare.travelTime = downwindTime;

          this.system.travelFare.travelCost = "<table>" +
              "<tr><td>Maintenance Costs</td><td>"  + Math.floor(downwindVehicleRunningCosts.maintenance * 100) / 100 + " $</td></tr>" +
              "<tr><td>Crew Salaries</td><td>"      + Math.floor(downwindVehicleRunningCosts.crewPay * 100) / 100 + " $</td></tr>" +
              "<tr><td>Provisions Cost</td><td>"    + Math.floor(downwindVehicleRunningCosts.provisionsCost * 100) / 100 + " $</td></tr>" +
              "<tr><td style='font-weight: bold'>Total Running Costs</td><td style='font-weight: bold'>" + Math.floor((downwindVehicleRunningCosts.maintenance + downwindVehicleRunningCosts.crewPay + downwindVehicleRunningCosts.provisionsCost) * 100) / 100 + " $</td></tr>" +
              "<tr><td>Provisions Weight</td><td>"  + Math.floor(downwindVehicleRunningCosts.provisionsWeight * 100) / 100 + " lbs</td></tr>" +
              "<tr><td>Free Cargo Space</td><td>"   + Math.floor((cargoSpacePounds - downwindVehicleRunningCosts.provisionsWeight) * 100) / 100 + " lbs</td></tr>" +
              "</table>";
        }
      }
      else if (this.system.travelFare.vehicle.ground) {
        let roadTime = "";

        let roadHoursDecimal = 0;
        let roadDays = 0;
        let roadHours = 0;
        let roadMinutes = 0;
        this.system.travelFare.travelCost = "";

        roadHoursDecimal = (distanceInMiles / (this.system.travelFare.vehicle.moveRoad * 2));
        roadDays = Math.floor(roadHoursDecimal / travellingHoursMinusRest);
        roadHours = Math.floor(roadHoursDecimal - (roadDays * travellingHoursMinusRest));
        roadMinutes = Math.floor((roadHoursDecimal - Math.floor(roadHoursDecimal)) * 60);
        roadTime = "Travelling by road: " + roadDays + " days, " + roadHours + " hours, " + roadMinutes + " minutes.";

        let roadVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system.travelFare.vehicle.cost, this.system.travelFare.vehicle.crew, roadHoursDecimal, travellingHoursMinusRest);

        this.system.travelFare.travelCost += "<table>" +
            "<tr><th colspan='2'>Travelling by road</th></tr>" +
            "<tr><td>Maintenance Costs</td><td>"  + Math.floor(roadVehicleRunningCosts.maintenance * 100) / 100 + " $</td></tr>" +
            "<tr><td>Crew Salaries</td><td>"      + Math.floor(roadVehicleRunningCosts.crewPay * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Cost</td><td>"    + Math.floor(roadVehicleRunningCosts.provisionsCost * 100) / 100 + " $</td></tr>" +
            "<tr><td style='font-weight: bold'>Total Running Costs</td><td style='font-weight: bold'>" + Math.floor((roadVehicleRunningCosts.maintenance + roadVehicleRunningCosts.crewPay + roadVehicleRunningCosts.provisionsCost) * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Weight</td><td>"  + Math.floor(roadVehicleRunningCosts.provisionsWeight * 100) / 100 + " lbs</td></tr>" +
            "<tr><td>Free Cargo Space</td><td>"   + Math.floor((cargoSpacePounds - roadVehicleRunningCosts.provisionsWeight) * 100) / 100 + " lbs</td></tr>" +
            "<tr><td></td><td></td></tr>" +
            "</table>";

        let goodTime = "";

        let goodHoursDecimal = 0;
        let goodDays = 0;
        let goodHours = 0;
        let goodMinutes = 0;

        goodHoursDecimal = (distanceInMiles / (this.system.travelFare.vehicle.moveGood * 2));
        goodDays = Math.floor(goodHoursDecimal / travellingHoursMinusRest);
        goodHours = Math.floor(goodHoursDecimal - (goodDays * travellingHoursMinusRest));
        goodMinutes = Math.floor((goodHoursDecimal - Math.floor(goodHoursDecimal)) * 60);
        goodTime = "Travelling on good terrain: " + goodDays + " days, " + goodHours + " hours, " + goodMinutes + " minutes.";

        let goodVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system.travelFare.vehicle.cost, this.system.travelFare.vehicle.crew, goodHoursDecimal, travellingHoursMinusRest);

        this.system.travelFare.travelCost += "<table>" +
            "<tr><th colspan='2'>Travelling on good terrain</th></tr>" +
            "<tr><td>Maintenance Costs</td><td>"  + Math.floor(goodVehicleRunningCosts.maintenance * 100) / 100 + " $</td></tr>" +
            "<tr><td>Crew Salaries</td><td>"      + Math.floor(goodVehicleRunningCosts.crewPay * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Cost</td><td>"    + Math.floor(goodVehicleRunningCosts.provisionsCost * 100) / 100 + " $</td></tr>" +
            "<tr><td style='font-weight: bold'>Total Running Costs</td><td style='font-weight: bold'>" + Math.floor((goodVehicleRunningCosts.maintenance + goodVehicleRunningCosts.crewPay + goodVehicleRunningCosts.provisionsCost) * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Weight</td><td>"  + Math.floor(goodVehicleRunningCosts.provisionsWeight * 100) / 100 + " lbs</td></tr>" +
            "<tr><td>Free Cargo Space</td><td>"   + Math.floor((cargoSpacePounds - goodVehicleRunningCosts.provisionsWeight) * 100) / 100 + " lbs</td></tr>" +
            "<tr><td></td><td></td></tr>" +
            "</table>";

        let averageTime = "";

        let averageHoursDecimal = 0;
        let averageDays = 0;
        let averageHours = 0;
        let averageMinutes = 0;

        averageHoursDecimal = (distanceInMiles / (this.system.travelFare.vehicle.moveAverage * 2));
        averageDays = Math.floor(averageHoursDecimal / travellingHoursMinusRest);
        averageHours = Math.floor(averageHoursDecimal - (averageDays * travellingHoursMinusRest));
        averageMinutes = Math.floor((averageHoursDecimal - Math.floor(averageHoursDecimal)) * 60);
        averageTime = "Travelling on average terrain: " + averageDays + " days, " + averageHours + " hours, " + averageMinutes + " minutes.";

        let averageVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system.travelFare.vehicle.cost, this.system.travelFare.vehicle.crew, averageHoursDecimal, travellingHoursMinusRest);

        this.system.travelFare.travelCost += "<table>" +
            "<tr><th colspan='2'>Travelling on good terrain</th></tr>" +
            "<tr><td>Maintenance Costs</td><td>"  + Math.floor(averageVehicleRunningCosts.maintenance * 100) / 100 + " $</td></tr>" +
            "<tr><td>Crew Salaries</td><td>"      + Math.floor(averageVehicleRunningCosts.crewPay * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Cost</td><td>"    + Math.floor(averageVehicleRunningCosts.provisionsCost * 100) / 100 + " $</td></tr>" +
            "<tr><td style='font-weight: bold'>Total Running Costs</td><td style='font-weight: bold'>" + Math.floor((averageVehicleRunningCosts.maintenance + averageVehicleRunningCosts.crewPay + averageVehicleRunningCosts.provisionsCost) * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Weight</td><td>"  + Math.floor(averageVehicleRunningCosts.provisionsWeight * 100) / 100 + " lbs</td></tr>" +
            "<tr><td>Free Cargo Space</td><td>"   + Math.floor((cargoSpacePounds - averageVehicleRunningCosts.provisionsWeight) * 100) / 100 + " lbs</td></tr>" +
            "<tr><td></td><td></td></tr>" +
            "</table>";

        this.system.travelFare.travelTime = roadTime + "<br/>" + goodTime + "<br/>" + averageTime;

      }
      else if (this.system.travelFare.vehicle.air) {
        let airTime = "";

        let airHoursDecimal = 0;
        let airDays = 0;
        let airHours = 0;
        let airMinutes = 0;

        airHoursDecimal = (distanceInMiles / (this.system.travelFare.vehicle.moveGood * 2));
        airDays = Math.floor(airHoursDecimal / travellingHoursMinusRest);
        airHours = Math.floor(airHoursDecimal - (airDays * travellingHoursMinusRest));
        airMinutes = Math.floor((airHoursDecimal - Math.floor(airHoursDecimal)) * 60);
        airTime = airDays + " days, " + airHours + " hours, " + airMinutes + " minutes.";

        let airVehicleRunningCosts = vehicleHelpers.getVehicleRunningCosts(this.system.travelFare.vehicle.cost, this.system.travelFare.vehicle.crew, airHoursDecimal, travellingHoursMinusRest);

        this.system.travelFare.travelCost += "<table>" +
            "<tr><th colspan='2'>Travelling by road</th></tr>" +
            "<tr><td>Maintenance Costs</td><td>"  + Math.floor(airVehicleRunningCosts.maintenance * 100) / 100 + " $</td></tr>" +
            "<tr><td>Crew Salaries</td><td>"      + Math.floor(airVehicleRunningCosts.crewPay * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Cost</td><td>"    + Math.floor(airVehicleRunningCosts.provisionsCost * 100) / 100 + " $</td></tr>" +
            "<tr><td style='font-weight: bold'>Total Running Costs</td><td style='font-weight: bold'>" + Math.floor((airVehicleRunningCosts.maintenance + airVehicleRunningCosts.crewPay + airVehicleRunningCosts.provisionsCost) * 100) / 100 + " $</td></tr>" +
            "<tr><td>Provisions Weight</td><td>"  + Math.floor(airVehicleRunningCosts.provisionsWeight * 100) / 100 + " lbs</td></tr>" +
            "<tr><td>Free Cargo Space</td><td>"   + Math.floor((cargoSpacePounds - airVehicleRunningCosts.provisionsWeight) * 100) / 100 + " lbs</td></tr>" +
            "<tr><td></td><td></td></tr>" +
            "</table>";

        this.system.travelFare.travelTime = airTime;
      }
    }
    else {
      this.system.travelFare.travelTime = "";
    }

    this.finalEquipmentCalculation();

    this.system.travelFare.initComplete = true;
  }

  _prepareCustomArmourData() {
    this.validateEquipmentBasics();

    if (this.system.armour.bodyType.body) {
      if (typeof this.system.armourDesign == "undefined"){
        this.system.armourDesign = {
          "materials": [],
          "constructionTypes": [],
          "allowMagicalMaterialsForCustom": false,
          "scalingMethodForCustomArmour": "weight",
          "adjustedHoldoutPenaltyForCustomArmour": "thickness",
          "statusEq": "0 - Freeman",
          "armourPercent": 0,
          "canPassFor": "",
          "getSizeFromActor": false,
          "scalingMultiplier": 1,
          "inputWeight": 150,
          "inputSM": 0,
          "inputHeight": 60,
          "tailoring": "",
          "style": "0",
          "holdoutReduction": 0,
          "concealed": false,
          "clothingStatus": 0,
          "steelHardening": "",
          "fluting": false,
          "leatherQuality": "",
          "donTime": 0,
          "sealed": false,
          "silk": false,
          "mountain": false,
          "banded": false,
          "butted": false,
          "hasPlate": false,
          "hasScale": false,
          "hasMail": false,
          "hasCloth": false,
          "hasLeather": false,
          "hasSteel": false,
          "hasSole": false,
          "soles": 0,
          "hobnails": false,
          "hasPunch": false,
          "punch": false,
          "punchSkill": "DX",
          "punchSkillMod": 0,
          "hasKick": false,
          "kick": false,
          "kickSkill": "DX",
          "kickSkillMod": -2,
          "clothingCost": 0,
          "clothingWeight": 0,
          "unitCost": 0,
          "unitWeight": 0,
          "unitDonTime": 0
        }
      }

      // Get materials and construction methods
      this.system.armourDesign.materials = game.materialAPI.fetchArmourMaterials();
      this.system.armourDesign.constructionTypes = game.materialAPI.fetchArmourConstructionMethods();

      // Get game settings relevant to the design of the laser
      this.system.armourDesign.allowMagicalMaterialsForCustom = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");
      this.system.armourDesign.scalingMethodForCustomArmour = game.settings.get("gurps4e", "scalingMethodForCustomArmour");
      this.system.armourDesign.adjustedHoldoutPenaltyForCustomArmour = game.settings.get("gurps4e", "adjustedHoldoutPenaltyForCustomArmour");

      // Validations
      if(this.system.armourDesign.holdoutReduction < 0) { // If it's less than zero
        this.system.armourDesign.holdoutReduction = 0; // Set it to zero
      }
      else { // If it's zero or above
        this.system.armourDesign.holdoutReduction = Math.floor(this.system.armourDesign.holdoutReduction); // Round down, decimals are not allowed
      }

      if (this.system.tl < 6) { // TL Less than 6, remove sealed.
        this.system.armourDesign.sealed = false;
      }

      if (this.system.tl < 6) { // TL is too low for sealed
        this.system.armourDesign.sealed = false;
      }

      // Check if there is an actor to fetch stats from
      this.system.armourDesign.getSizeFromActor = false;
      if (this.actor) { // If there's an actor
        if (this.actor.system) {
          this.system.armourDesign.getSizeFromActor = true;
          if (this.system.armourDesign.scalingMethodForCustomArmour == "weight") { // Scaling using the rules from Pyramid 3-52:16
            this.system.armourDesign.scalingMultiplier = (this.actor.system.bio.weight.value / 150) ** (2/3);
          }
          else if (this.system.armourDesign.scalingMethodForCustomArmour == "sm") { // Scaling using the rules from LTC2:21
            this.system.armourDesign.scalingMultiplier = ((distanceHelpers.sizeToDistance(this.actor.system.bio.sm.value) / 10) ** 2);
          }
          else if (this.system.armourDesign.scalingMethodForCustomArmour == "height") { // Scaling based off the rules from LTC2:21, but gradually scaled based on height.
            this.system.armourDesign.scalingMultiplier = (((5 / 36 * this.actor.system.bio.height.value) / 10)  ** 2);
          }
          else {
            this.system.armourDesign.scalingMultiplier = 1;
          }
        }
      }
      else { // There is no actor
        if (this.system.armourDesign.scalingMethodForCustomArmour == "weight") { // Scaling using the rules from Pyramid 3-52:16
          this.system.armourDesign.scalingMultiplier = (this.system.armourDesign.inputWeight / 150) ** (2/3);
        }
        else if (this.system.armourDesign.scalingMethodForCustomArmour == "sm") { // Scaling using the rules from LTC2:21
          this.system.armourDesign.scalingMultiplier = ((distanceHelpers.sizeToDistance(this.system.armourDesign.inputSM) / 10) ** 2);
        }
        else if (this.system.armourDesign.scalingMethodForCustomArmour == "height") { // Scaling based off the rules from LTC2:21, but gradually scaled based on height.
          this.system.armourDesign.scalingMultiplier = (((5 / 36 * this.system.armourDesign.inputHeight) / 10)  ** 2);
        }
        else {
          this.system.armourDesign.scalingMultiplier = 1;
        }
      }

      let bodyParts = Object.keys(this.system.armour.bodyType.body);
      this.system.armourDesign.hasPlate    = false;
      this.system.armourDesign.hasScale    = false;
      this.system.armourDesign.hasMail     = false;
      this.system.armourDesign.hasCloth    = false;
      this.system.armourDesign.hasLeather  = false;
      this.system.armourDesign.hasSteel    = false;
      this.system.armourDesign.hasSole     = false;
      this.system.armourDesign.soles       = 0;
      this.system.armourDesign.hasKick     = false;
      this.system.armourDesign.hasPunch    = false;

      this.system.armourDesign.unitCost = 0;
      this.system.armourDesign.unitWeight = 0;
      this.system.armourDesign.unitDonTime = 0;
      this.system.armourDesign.donTime = 0;

      this.system.armourDesign.holdout = 0;
      for (let i = 0; i < bodyParts.length; i++) { // Loop through body parts
        if (getProperty(this.system.armour.bodyType.body, bodyParts[i] + ".subLocation")) { // Part has sub parts
          let subParts = getProperty(this.system.armour.bodyType.body, bodyParts[i] + ".subLocation");
          let subPartKeys = Object.keys(subParts);

          for (let n = 0; n < subPartKeys.length; n++) { // Loop through sub parts
            let currentSubPart = getProperty(this.system.armour.bodyType.body, bodyParts[i] + ".subLocation." + subPartKeys[n]);

            if (subParts.thigh) { // There is a thigh
              if (subParts.thigh.construction && subParts.thigh.material) { // It has been correctly armoured
                if (currentSubPart.label.toLowerCase() == "thigh artery") { // Current part is a thigh artery
                  currentSubPart.construction = subParts.thigh.construction;
                  currentSubPart.material = subParts.thigh.material;
                  currentSubPart.selectedDR = subParts.thigh.selectedDR;
                  currentSubPart.surfaceArea = 0;
                }
              }
            }

            this.prepareLocationalCustomArmour(currentSubPart);
          }
        }
        else { // Part has no sub parts
          let currentPart = getProperty(this.system.armour.bodyType.body, bodyParts[i]);

          this.prepareLocationalCustomArmour(currentPart);
        }
      }

      if (!this.system.armourDesign.hasSole || this.system.tl < 2) { // Either no sole or less than TL 2
        this.system.armourDesign.hobnails = false;
      }

      if (!this.system.armourDesign.hasSteel) { // There is no steel, so the steel can't be hardened
        this.system.armourDesign.steelHardening = "";
      }

      if (this.system.armourDesign.hasSteel && !this.system.armourDesign.hasPlate) { // There is steel, but not in the form of plate
        this.system.armourDesign.steelHardening = "hardened";
      }

      if (!this.system.armourDesign.hasPlate && !this.system.armourDesign.hasScale) { // There is neither plate nor scale, so there can be no fluting
        this.system.armourDesign.fluting = false;
      }

      if (!this.system.armourDesign.hasMail) { // There is no mail, so there can't be mail variants
        this.system.armourDesign.banded = false;
        this.system.armourDesign.butted = false;
      }

      if (!this.system.armourDesign.hasCloth) { // There is no cloth, so there can't be cloth variants
        this.system.armourDesign.silk = false;
        this.system.armourDesign.paper = false;
      }

      if (!this.system.armourDesign.hasLeather && !this.system.armourDesign.hasCloth) { // There is neither cloth nor leather, so there can be no reinforcement
        this.system.armourDesign.reinforced = false;
      }

      if (!this.system.armourDesign.hasScale) { // There is no scale, so there can't be scale variants
        this.system.armourDesign.mountain = false;
      }

      if (!this.system.armourDesign.hasLeather) { // There is no leather, so there can't be leather variants
        this.system.armourDesign.leatherQuality = "";
      }

      if (!this.system.armourDesign.concealed) { // The armour is not concealed, unset concealment settings.
        this.system.armourDesign.holdoutReduction = 0;
        this.system.armourDesign.concealedClothing = "";
        this.system.armourDesign.clothingStatus = 0;
        this.system.armourDesign.undercoverClothing = "";
      }

      // Hobnail cost and weight handling
      if (this.system.armourDesign.hasSole && this.system.armourDesign.soles >= 1 && this.system.armourDesign.hobnails) {
        this.system.armourDesign.unitCost += this.system.armourDesign.soles * 12.5;
        this.system.armourDesign.unitWeight += this.system.armourDesign.soles * 0.5;
      }

      // Calculate Status Equivalent
      if (this.system.armourDesign.unitCost >= 0) {
        if (this.system.armourDesign.unitCost <= 240) {
          this.system.armourDesign.statusEq = "0 - Freeman, apprentice, ordinary citizen";
        }
        else if (this.system.armourDesign.unitCost <= 480) {
          this.system.armourDesign.statusEq = "1 - Squire, merchant, priest, doctor, councilor";
        }
        else if (this.system.armourDesign.unitCost <= 1200) {
          this.system.armourDesign.statusEq = "2 - Landless knight, mayor, business leader";
        }
        else if (this.system.armourDesign.unitCost <= 4800) {
          this.system.armourDesign.statusEq = "3 - Landed knight, guild master, big city mayor";
        }
        else if (this.system.armourDesign.unitCost <= 24000) {
          this.system.armourDesign.statusEq = "4 - Lesser noble, congressional representative, Who’s Who";
        }
        else if (this.system.armourDesign.unitCost <= 240000) {
          this.system.armourDesign.statusEq = "5 - Great noble, multinational corporate boss";
        }
        else if (this.system.armourDesign.unitCost <= 2400000) {
          this.system.armourDesign.statusEq = "6 - Royal family, governor";
        }
        else if (this.system.armourDesign.unitCost <= 24000000) {
          this.system.armourDesign.statusEq = "7 - King, pope, president";
        }
        else if (this.system.armourDesign.unitCost <= 240000000) {
          this.system.armourDesign.statusEq = "8 - Emperor, god-king, overlord";
        }
      }

      // Can pass for
      if (this.system.armourDesign.armourPercent <= (1/6)) {
        this.system.armourDesign.canPassFor = "Swimwear, underwear, or other diaphanous clothing";
        this.system.lc = 4;
      }
      else if (this.system.armourDesign.armourPercent <= (1/4)) {
        this.system.armourDesign.canPassFor = "Light clothing such as T-shirts, evening wear, skintight suits, etc. and be worn beneath clothes";
        this.system.lc = 4;
      }
      else if (this.system.armourDesign.armourPercent <= (1/2)) {
        this.system.armourDesign.canPassFor = "Concealed under clothing or pass as ordinary civilian outerwear";
        this.system.lc = 3;
      }
      else {
        this.system.armourDesign.canPassFor = "Not concealable. It can only pass as heavy clothing such as a trench coat, biker leathers, etc";
        this.system.lc = 2;
      }

      let clothingCF = 1;
      let clothingWM = 1;
      this.system.armourDesign.clothingCost = 0;
      this.system.armourDesign.clothingWeight = 0;
      // Handle cost and weight for armour concealed within clothing
      if (this.system.armourDesign.concealed) { // If it's concealed, run concealment related code
        // Tailoring applies to the clothing as well
        if (this.system.armourDesign.tailoring.toLowerCase() == "expert") {
          clothingCF = clothingCF + 5;
          clothingWM = clothingWM - 0.15;
        }
        else if (this.system.armourDesign.tailoring.toLowerCase() == "master") {
          clothingCF = clothingCF +29
          clothingWM = clothingWM - 0.3;
        }

        if (this.system.armourDesign.concealedClothing.toLowerCase() == "swimwear") {
          this.system.armourDesign.clothingCost = economicHelpers.getColByStatus(this.system.armourDesign.clothingStatus) * 0.05;
          this.system.armourDesign.clothingWeight = 0.5;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "summer") {
          this.system.armourDesign.clothingCost = economicHelpers.getColByStatus(this.system.armourDesign.clothingStatus) * 0.10;
          this.system.armourDesign.clothingWeight = 1;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "standard") {
          this.system.armourDesign.clothingCost = economicHelpers.getColByStatus(this.system.armourDesign.clothingStatus) * 0.20;
          this.system.armourDesign.clothingWeight = 2;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "winter") {
          this.system.armourDesign.clothingCost = economicHelpers.getColByStatus(this.system.armourDesign.clothingStatus) * 0.30;
          this.system.armourDesign.clothingWeight = 5;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "longcoat") {
          this.system.armourDesign.clothingCost = 50;
          this.system.armourDesign.clothingWeight = 5;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "leatherLongCoat") {
          this.system.armourDesign.clothingCost = 100;
          this.system.armourDesign.clothingWeight = 10;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "lightQualityLeatherLongCoat") {
          this.system.armourDesign.clothingCost = 250;
          this.system.armourDesign.clothingWeight = 5;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "qualityLeatherLongCoat") {
          this.system.armourDesign.clothingCost = 500;
          this.system.armourDesign.clothingWeight = 10;
        }
        else if (this.system.armourDesign.concealedClothing.toLowerCase() == "habit") {
          this.system.armourDesign.clothingCost = economicHelpers.getColByStatus(this.system.armourDesign.clothingStatus) * 0.35;
          this.system.armourDesign.clothingWeight = 6;
        }
        else {
          this.system.armourDesign.clothingCost = 0;
          this.system.armourDesign.clothingWeight = 0;
        }

        if (this.system.armourDesign.undercoverClothing == "1") {
          clothingCF += 4;
        }
        else if (this.system.armourDesign.undercoverClothing == "2") {
          clothingCF += 19;
        }

        this.system.armourDesign.clothingCost = this.system.armourDesign.clothingCost * clothingCF;
        this.system.armourDesign.clothingWeight = this.system.armourDesign.clothingWeight * clothingWM;
      }

      if (this.system.armourDesign.clothingCost > this.system.armourDesign.unitCost) {
        this.system.cost = (this.system.armourDesign.unitCost * 0.8) + this.system.armourDesign.clothingCost;
      }
      else {
        this.system.cost = this.system.armourDesign.unitCost + (this.system.armourDesign.clothingCost * 0.8);
      }

      if (this.system.armourDesign.clothingWeight > this.system.armourDesign.unitWeight) {
        this.system.weight = (this.system.armourDesign.unitWeight * 0.8) + this.system.armourDesign.clothingWeight;
      }
      else {
        this.system.weight = this.system.armourDesign.unitWeight + (this.system.armourDesign.clothingWeight * 0.8);
      }

      if (this.system.armourDesign.punch || this.system.armourDesign.kick) {
        this.addUnarmedProfiles(this.system.armourDesign.punch, this.system.armourDesign.kick);
      }
    }

    this.finalEquipmentCalculation();
  }

  addUnarmedProfiles(punch, kick) {
    let unarmedST = 10;
    if (this.actor) { // If there's an actor
      if (this.actor.system) {
        unarmedST = actorHelpers.fetchStat(this.actor, "st");
      }
    }

    let punchRow = {};
    let kickRow = {};

    if (punch) {
      punchRow = { // Init the new melee row using the values from the custom weapon
        "name": "Punch",
        "skill": this.system.armourDesign.punchSkill,
        "skillMod": this.system.armourDesign.punchSkillMod,
        "parryMod": 0,
        "parryType": "F",
        "blockMod": "No",
        "damageInput": "thr",
        "damageType": "cr",
        "armourDivisor": 1,
        "reach": "C",
        "st": unarmedST,
      };
    }
    if (kick) {
      kickRow = { // Init the new melee row using the values from the custom weapon
        "name": "Kick",
        "skill": this.system.armourDesign.kickSkill,
        "skillMod": this.system.armourDesign.kickSkillMod,
        "parryMod": 0,
        "parryType": "F",
        "blockMod": "No",
        "damageInput": "thr+1",
        "damageType": "cr",
        "armourDivisor": 1,
        "reach": "C, 1",
        "st": unarmedST,
      };
    }

    if (kick && punch) {
      this.system.melee = [punchRow, kickRow];
    }
    else if (kick) {
      this.system.melee = [kickRow];
    }
    else if (punch) {
      this.system.melee = [punchRow];
    }
  }

  prepareLocationalCustomArmour(currentSubPart) {
    if (typeof currentSubPart.material != "undefined") {
      if (currentSubPart.material.name) {
        if (this.system.armourDesign.allowMagicalMaterialsForCustom) {
          currentSubPart.material = game.materialAPI.getAndCalculateArmourMaterialByName(currentSubPart.material.name, currentSubPart.material.essential);
        }
        else {
          currentSubPart.material = game.materialAPI.getAndCalculateArmourMaterialByName(currentSubPart.material.name, false);
        }
        if (currentSubPart.material.name.toLowerCase().includes("steel")){
          this.system.armourDesign.hasSteel = true;
        }
        else if (currentSubPart.material.name.toLowerCase().includes("leather")){
          this.system.armourDesign.hasLeather = true;
        }
        else if (currentSubPart.material.name.toLowerCase().includes("cloth")){
          this.system.armourDesign.hasCloth = true;
        }
      }
    }

    if (typeof currentSubPart.construction != "undefined") {
      if (currentSubPart.construction.name) {
        currentSubPart.construction = game.materialAPI.getArmourConstructionMethodByName(currentSubPart.construction.name);
        if (typeof currentSubPart.construction.name != "undefined") {
          if (currentSubPart.construction.name.toLowerCase().includes("plate")) {
            this.system.armourDesign.hasPlate = true;
          }
          else if (currentSubPart.construction.name.toLowerCase().includes("scale")) {
            this.system.armourDesign.hasScale = true;
          }
          else if (currentSubPart.construction.name.toLowerCase().includes("mail")) {
            this.system.armourDesign.hasMail = true;
          }
        }
      }
    }

    currentSubPart.flexible     = false;
    currentSubPart.drHardening  = 1;
    currentSubPart.drBurn       = 0;
    currentSubPart.drCor        = 0;
    currentSubPart.drCr         = 0;
    currentSubPart.drCut        = 0;
    currentSubPart.drFat        = 0;
    currentSubPart.drImp        = 0;
    currentSubPart.drPi         = 0;
    currentSubPart.drTox        = 0;

    let weightModifier = 1; // Init the weight modifier that is used to account for fine/fluting/etc
    let cf = 1; // Init the Cost Factor that is used to account for quality modifiers
    let drModifier = 0; // Init the modifier that is used to account for bonus dr from hardened steel, etc.

    currentSubPart.weight = 0;
    currentSubPart.cost = 0;

    currentSubPart.pf = 0;

    currentSubPart.in = 0;
    currentSubPart.mm = 0;

    if (typeof currentSubPart.selectedDR == "undefined" || currentSubPart.selectedDR == null) {
      currentSubPart.selectedDR = 0;
    }

    if (currentSubPart.material && currentSubPart.construction) {
      if (currentSubPart.material.name && currentSubPart.construction.name) { // There is both a material and a construction type
        if (currentSubPart.label.toLowerCase().includes("sole") && currentSubPart.selectedDR > 0 && !currentSubPart.material.name.includes("no armour") && !currentSubPart.construction.name.includes("no armour")) { // There is a sole, it has DR, it has a material, and it has a construction type
          this.system.armourDesign.hasSole = true; // Set the flag true
          this.system.armourDesign.soles += 1; // Add to the sole count to account for quadrupeds, etc.
        }
        if (currentSubPart.label.toLowerCase().includes("foot") && !currentSubPart.material.name.includes("no armour") && ((currentSubPart.selectedDR >= 1 && !currentSubPart.construction.flexible) || (currentSubPart.selectedDR >= 2))) { // There is a foot, it has a material, and it has 1 DR and it's not flexible, or it has 2 DR and is flexible
          this.system.armourDesign.hasKick = true; // Set the flag true
        }
        if (currentSubPart.label.toLowerCase().includes("hand") && !currentSubPart.material.name.includes("no armour") && ((currentSubPart.selectedDR >= 1 && !currentSubPart.construction.flexible) || (currentSubPart.selectedDR >= 2))) { // There is a hand, it has a material, and it has 1 DR and it's not flexible, or it has 2 DR and is flexible
          this.system.armourDesign.hasPunch = true; // Set the flag true
        }

        if (currentSubPart.selectedDR >= currentSubPart.construction.minDR && currentSubPart.selectedDR <= currentSubPart.material.maxDR) { // DR is between max and min

          if (this.system.armourDesign.tailoring.toLowerCase() == "cheap") {
            cf = cf -0.6
            drModifier = drModifier - 1;
          }
          else if (this.system.armourDesign.tailoring.toLowerCase() == "expert") {
            cf = cf + 5;
            weightModifier = weightModifier - 0.15;
          }
          else if (this.system.armourDesign.tailoring.toLowerCase() == "master") {
            cf = cf +29
            weightModifier = weightModifier - 0.3;
          }

          if (this.system.armourDesign.style.toLowerCase() == "1") {
            cf += 1;
          }
          else if (this.system.armourDesign.style.toLowerCase() == "2") {
            cf += 4;
          }
          else if (this.system.armourDesign.style.toLowerCase() == "3") {
            cf += 9;
          }

          // This piece is made of steel, and the user has selected either hardened or duplex
          if (currentSubPart.material.name.toLowerCase().includes("steel") && (this.system.armourDesign.steelHardening.toLowerCase().includes("hardened") || this.system.armourDesign.steelHardening.toLowerCase().includes("duplex"))) {
            if (this.system.armourDesign.steelHardening.toLowerCase().includes("hardened")) {
              cf += 4;
              drModifier += 1;
            }
            else if (this.system.armourDesign.steelHardening.toLowerCase().includes("duplex")) {
              cf += 8;
              weightModifier = weightModifier - 0.1;
              drModifier += 1;
            }
          }

          // This piece is made of leather, and the user has selected a leather customization
          if ((currentSubPart.material.name.toLowerCase().includes("leather")) && (this.system.armourDesign.leatherQuality.toLowerCase() == "rawhide" || this.system.armourDesign.leatherQuality.toLowerCase() == "quality")) {
            if (this.system.armourDesign.leatherQuality.toLowerCase() == "rawhide") {
              cf = cf -0.6;
              // TODO - x0.5 HP
            }
            else if (this.system.armourDesign.leatherQuality.toLowerCase() == "quality") {
              cf = cf + 4;
              drModifier += 1;
            }
          }

          // Handle bonus DR from leather coat options
          if (this.system.armourDesign.concealedClothing) {
            if (this.system.armourDesign.concealedClothing.toLowerCase() == "leatherlongcoat" || this.system.armourDesign.concealedClothing.toLowerCase() == "lightqualityleatherlongcoat" || this.system.armourDesign.concealedClothing.toLowerCase() == "qualityleatherlongcoat") {
              let leatherCoatBonus = 1; // Most of the coats give +1 DR
              if (this.system.armourDesign.concealedClothing.toLowerCase() == "qualityleatherlongcoat") { // Quality heavy leather coats give +2
                leatherCoatBonus = 2;
              }

              if (currentSubPart.label.toLowerCase() == "thigh"                || currentSubPart.label.toLowerCase() == "inside thigh" ||
                  currentSubPart.label.toLowerCase() == "knee"                 || currentSubPart.label.toLowerCase() == "back of knee" ||
                  currentSubPart.label.toLowerCase() == "thigh artery"         || currentSubPart.label.toLowerCase() == "shoulder" ||
                  currentSubPart.label.toLowerCase() == "forearm"              || currentSubPart.label.toLowerCase() == "upper arm" ||
                  currentSubPart.label.toLowerCase() == "elbow"                || currentSubPart.label.toLowerCase() == "inside elbow" ||
                  currentSubPart.label.toLowerCase() == "armpit"               || currentSubPart.label.toLowerCase() == "vitals" ||
                  currentSubPart.label.toLowerCase() == "spine"                || currentSubPart.label.toLowerCase() == "upper chest" ||
                  currentSubPart.label.toLowerCase() == "lower chest"          || currentSubPart.label.toLowerCase() == "humanoid upper chest" ||
                  currentSubPart.label.toLowerCase() == "humanoid lower chest" || currentSubPart.label.toLowerCase() == "animal chest" ||
                  currentSubPart.label.toLowerCase() == "upper thorax"         || currentSubPart.label.toLowerCase() == "mid thorax" ||
                  currentSubPart.label.toLowerCase() == "digestive tract"      || currentSubPart.label.toLowerCase() == "pelvis" ||
                  currentSubPart.label.toLowerCase() == "groin"                || currentSubPart.label.toLowerCase() == "abdomen" ||
                  currentSubPart.label.toLowerCase() == "animal abdomen"       || currentSubPart.label.toLowerCase() == "lower thorax" ||
                  currentSubPart.label.toLowerCase() == "neck"                 || currentSubPart.label.toLowerCase() == "vein") {
                drModifier += leatherCoatBonus;
              }
            }
          }

          // Calculate basic DR by material and construction
          if (currentSubPart.construction.name.toLowerCase() == "fabric") {
            if (currentSubPart.selectedDR <= (currentSubPart.material.drPerIn / 4)) { // Flexible construction types become inflexible if the armour is more than a quarter inch thick.
              currentSubPart.flexible = true;
            }
            else {
              currentSubPart.flexible = false;
            }

            currentSubPart.drBurn = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCor  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCr   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCut  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drFat  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drImp  = Math.max(currentSubPart.selectedDR - 1 + drModifier, 0); // Non-layered fabric is -1 DR vs impaling
            currentSubPart.drPi   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drTox  = currentSubPart.selectedDR + drModifier;
          }
          else if (currentSubPart.construction.name.toLowerCase() == "layered fabric" || currentSubPart.construction.name.toLowerCase() == "optimized fabric") {
            if (currentSubPart.selectedDR <= (currentSubPart.material.drPerIn / 4)) { // Flexible construction types become inflexible if the armour is more than a quarter inch thick.
              currentSubPart.flexible = true;
            }
            else {
              currentSubPart.flexible = false;
            }

            currentSubPart.drBurn = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCor  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCr   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCut  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drFat  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drImp  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drPi   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drTox  = currentSubPart.selectedDR + drModifier;
          }
          else if (currentSubPart.construction.name.toLowerCase() == "scales") {
            if (currentSubPart.selectedDR <= (currentSubPart.material.drPerIn / 4)) { // Flexible construction types become inflexible if the armour is more than a quarter inch thick.
              currentSubPart.flexible = true;
            }
            else {
              currentSubPart.flexible = false;
            }

            currentSubPart.drBurn = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCor  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCr   = currentSubPart.selectedDR + drModifier >= 5 ? currentSubPart.selectedDR + drModifier : Math.max(currentSubPart.selectedDR + drModifier - 1, 0); // Scale with DR 5+ has no penalty vs crushing. Scale with less does have a penalty.
            currentSubPart.drCut  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drFat  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drImp  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drPi   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drTox  = currentSubPart.selectedDR + drModifier;
          }
          else if (currentSubPart.construction.name.toLowerCase() == "mail") {
            if (currentSubPart.selectedDR <= (currentSubPart.material.drPerIn / 4)) { // Flexible construction types become inflexible if the armour is more than a quarter inch thick.
              currentSubPart.flexible = true;
            }
            else {
              currentSubPart.flexible = false;
            }

            currentSubPart.drBurn = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCor  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCr   = currentSubPart.selectedDR >= 10 ? Math.floor((currentSubPart.selectedDR + drModifier) * 0.8) : Math.max(currentSubPart.selectedDR + drModifier - 2, 0); // Mail is -2 DR vs crushing, or -20% DR if it's base DR is 10+
            currentSubPart.drCut  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drFat  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drImp  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drPi   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drTox  = currentSubPart.selectedDR + drModifier;
          }
          else if (currentSubPart.construction.name.toLowerCase() == "early plate" || currentSubPart.construction.name.toLowerCase() == "segmented plate" || currentSubPart.construction.name.toLowerCase() == "plate" || currentSubPart.construction.name.toLowerCase() == "solid") {
            currentSubPart.drBurn = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCor  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCr   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCut  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drFat  = (currentSubPart.selectedDR + drModifier);
            currentSubPart.drImp  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drPi   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drTox  = currentSubPart.selectedDR + drModifier;
          }
          else if (currentSubPart.construction.name.toLowerCase() == "impact absorbing") {
            currentSubPart.drBurn = Math.floor((currentSubPart.selectedDR + drModifier) / 2);
            currentSubPart.drCor  = Math.floor((currentSubPart.selectedDR + drModifier) / 2);
            currentSubPart.drCr   = (currentSubPart.selectedDR + drModifier);
            currentSubPart.drCut  = Math.floor((currentSubPart.selectedDR + drModifier) / 2);
            currentSubPart.drFat  = Math.floor((currentSubPart.selectedDR + drModifier) / 2);
            currentSubPart.drImp  = Math.floor((currentSubPart.selectedDR + drModifier) / 2);
            currentSubPart.drPi   = Math.floor((currentSubPart.selectedDR + drModifier) / 2);
            currentSubPart.drTox  = Math.floor((currentSubPart.selectedDR + drModifier) / 2);
          }
          else {
            currentSubPart.drBurn = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCor  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCr   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drCut  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drFat  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drImp  = currentSubPart.selectedDR + drModifier;
            currentSubPart.drPi   = currentSubPart.selectedDR + drModifier;
            currentSubPart.drTox  = currentSubPart.selectedDR + drModifier;
          }

          // Calculate PF
          currentSubPart.pf = materialHelpers.adToPF((currentSubPart.selectedDR + drModifier) * currentSubPart.material.wm);

          // Calculate Don time
          if (currentSubPart.selectedDR == 0) {
            currentSubPart.donTime = 0;
          }
          else if (currentSubPart.flexible) {
            currentSubPart.donTime = Math.round(currentSubPart.construction.don * 2/3);
          }
          else {
            currentSubPart.donTime = currentSubPart.construction.don;
          }
          this.system.armourDesign.donTime += currentSubPart.donTime

          // This piece is made of either plate or scale, and the user has selected fluting
          if ((currentSubPart.construction.name.toLowerCase().includes("scale") || currentSubPart.construction.name.toLowerCase().includes("plate")) && this.system.armourDesign.fluting) {
            cf += 4;
            weightModifier = weightModifier - 0.1;
          }

          // This piece is made of mail, and the user has selected a mail customization
          if ((currentSubPart.construction.name.toLowerCase().includes("mail")) && (this.system.armourDesign.banded || this.system.armourDesign.butted)) {
            if (this.system.armourDesign.banded) {
              cf += 0.5;
              weightModifier = weightModifier + 0.5;
              currentSubPart.drCr += 2;
            }
            else if (this.system.armourDesign.butted) {
              cf = cf - 0.6;
              currentSubPart.drImp = Math.max(currentSubPart.drImp - 3, 0) // DR is at least zero
            }
          }

          // This piece is made of cloth, and the user has selected a cloth customization
          if ((currentSubPart.material.name.toLowerCase().includes("cloth")) && (this.system.armourDesign.silk || this.system.armourDesign.paper)) {
            if (this.system.armourDesign.paper) {
              cf -= 0.25;
            }
            else if (this.system.armourDesign.silk) {
              cf += 19;
              currentSubPart.drImp += 1;
              currentSubPart.drCut += 1;
            }
          }

          // This piece is made of cloth or leather, and the user has selected a reinforcement
          if ((currentSubPart.material.name.toLowerCase().includes("cloth") || currentSubPart.material.name.toLowerCase().includes("leather")) && this.system.armourDesign.reinforced) {
            cf += 0.25;
            weightModifier += 0.25;
            currentSubPart.drCut += 1;
          }

          // This piece is made of scale, and the user has selected mountain scale
          if (currentSubPart.construction.name.toLowerCase().includes("scale") && this.system.armourDesign.mountain) {
            cf += 1;
            currentSubPart.drCr += 1;
          }

          if (currentSubPart.material.ballistic2) {
            currentSubPart.drBurn = Math.floor((currentSubPart.drBurn) / 2);
            currentSubPart.drCor  = Math.floor((currentSubPart.drCor ) / 2);
            currentSubPart.drCr   = Math.floor((currentSubPart.drCr  ) / 2);
            currentSubPart.drFat  = Math.floor((currentSubPart.drFat ) / 2);
            currentSubPart.drImp  = Math.floor((currentSubPart.drImp ) / 2);
            currentSubPart.drTox  = Math.floor((currentSubPart.drTox ) / 2);
          }
          else if (currentSubPart.material.ballistic25) {
            currentSubPart.drBurn = Math.floor((currentSubPart.drBurn) / 2.5);
            currentSubPart.drCor  = Math.floor((currentSubPart.drCor ) / 2.5);
            currentSubPart.drCr   = Math.floor((currentSubPart.drCr  ) / 2.5);
            currentSubPart.drFat  = Math.floor((currentSubPart.drFat ) / 2.5);
            currentSubPart.drImp  = Math.floor((currentSubPart.drImp ) / 2.5);
            currentSubPart.drTox  = Math.floor((currentSubPart.drTox ) / 2.5);
          }
          else if (currentSubPart.material.ballistic3) {
            currentSubPart.drBurn = Math.floor((currentSubPart.drBurn) / 3);
            currentSubPart.drCor  = Math.floor((currentSubPart.drCor ) / 3);
            currentSubPart.drCr   = Math.floor((currentSubPart.drCr  ) / 3);
            currentSubPart.drFat  = Math.floor((currentSubPart.drFat ) / 3);
            currentSubPart.drImp  = Math.floor((currentSubPart.drImp ) / 3);
            currentSubPart.drTox  = Math.floor((currentSubPart.drTox ) / 3);
          }
          else if (currentSubPart.material.ballistic3Bio) {
            currentSubPart.drCor  = Math.floor((currentSubPart.drCor ) / 3);
            currentSubPart.drCr   = Math.floor((currentSubPart.drCr  ) / 3);
            currentSubPart.drCut  = Math.floor((currentSubPart.drCut ) / 3);
            currentSubPart.drFat  = Math.floor((currentSubPart.drFat ) / 3);
            currentSubPart.drImp  = Math.floor((currentSubPart.drImp ) / 3);
            currentSubPart.drTox  = Math.floor((currentSubPart.drTox ) / 3);
          }
          else if (currentSubPart.material.ballistic4) {
            currentSubPart.drBurn = Math.floor((currentSubPart.drBurn) / 4);
            currentSubPart.drCor  = Math.floor((currentSubPart.drCor ) / 4);
            currentSubPart.drCr   = Math.floor((currentSubPart.drCr  ) / 4);
            currentSubPart.drFat  = Math.floor((currentSubPart.drFat ) / 4);
            currentSubPart.drImp  = Math.floor((currentSubPart.drImp ) / 4);
            currentSubPart.drTox  = Math.floor((currentSubPart.drTox ) / 4);
          }

          if (currentSubPart.material.laser0) {
            currentSubPart.drCor  = 0;
            currentSubPart.drCr   = 0;
            currentSubPart.drCut  = 0;
            currentSubPart.drFat  = 0;
            currentSubPart.drImp  = 0;
            currentSubPart.drPi   = 0;
            currentSubPart.drTox  = 0;
          }
          else if (currentSubPart.material.laser4) {
            currentSubPart.drCor  = Math.floor((currentSubPart.drCor ) / 4);
            currentSubPart.drCr   = Math.floor((currentSubPart.drCr  ) / 4);
            currentSubPart.drCut  = Math.floor((currentSubPart.drCut ) / 4);
            currentSubPart.drFat  = Math.floor((currentSubPart.drFat ) / 4);
            currentSubPart.drImp  = Math.floor((currentSubPart.drImp ) / 4);
            currentSubPart.drPi   = Math.floor((currentSubPart.drPi  ) / 4);
            currentSubPart.drTox  = Math.floor((currentSubPart.drTox ) / 4);
          }
          else if (currentSubPart.material.laser6) {
            currentSubPart.drCor  = Math.floor((currentSubPart.drCor ) / 6);
            currentSubPart.drCr   = Math.floor((currentSubPart.drCr  ) / 6);
            currentSubPart.drCut  = Math.floor((currentSubPart.drCut ) / 6);
            currentSubPart.drFat  = Math.floor((currentSubPart.drFat ) / 6);
            currentSubPart.drImp  = Math.floor((currentSubPart.drImp ) / 6);
            currentSubPart.drPi   = Math.floor((currentSubPart.drPi  ) / 6);
            currentSubPart.drTox  = Math.floor((currentSubPart.drTox ) / 6);
          }

          // Can pass for
          currentSubPart.armourPercent = (currentSubPart.selectedDR / currentSubPart.material.maxDR);

          // Thickness
          if (currentSubPart.selectedDR <= 0) {
            currentSubPart.in = 0;
          }
          else {
            currentSubPart.in = currentSubPart.selectedDR / currentSubPart.material.drPerIn;
          }
          currentSubPart.mm = 25.4 * currentSubPart.in;

          cf += this.system.armourDesign.holdoutReduction; // Add the cost factor for the holdout reduction.

          cf = Math.max(cf, 0.2) // Cost factor can't go less than 80%
          weightModifier = Math.max(weightModifier, 0.2) // Weight mod can't go less than 80%

          currentSubPart.weight = currentSubPart.surfaceArea * currentSubPart.material.wm * currentSubPart.construction.wm * currentSubPart.selectedDR * weightModifier;
          if (currentSubPart.material.costLTTL <= this.system.tl) { // The current TL is at or under the tl breakpoint
            currentSubPart.cost = currentSubPart.weight * currentSubPart.construction.cm * currentSubPart.material.costLT * cf;
          }
          else {
            currentSubPart.cost = currentSubPart.weight * currentSubPart.construction.cm * currentSubPart.material.costHT * cf;
          }
        }
        else {
          currentSubPart.weight = 0;
          currentSubPart.cost = 0;
        }

        if (this.system.armourDesign.sealed && this.system.tl >= 6) { // Armour is sealed and the TL is high enough for it to actually be sealed.
          if (this.system.tl >= 8) { // At TL 8+, sealed is 5$ per square foot
            currentSubPart.cost = currentSubPart.cost + (currentSubPart.surfaceArea * 5);
          }
          else { // At TL 7-, sealed is 10$ per square foot
            currentSubPart.cost = currentSubPart.cost + (currentSubPart.surfaceArea * 10);
          }
        }

        this.system.armourDesign.armourPercent = Math.max(currentSubPart.armourPercent, this.system.armourDesign.armourPercent) // Always use the worst (highest) value

        this.system.armourDesign.donTime = Math.round(this.system.armourDesign.donTime);
        this.system.armourDesign.unitWeight += currentSubPart.weight;
        this.system.armourDesign.unitCost += currentSubPart.cost;

        // Holdout
        if (this.system.armourDesign.adjustedHoldoutPenaltyForCustomArmour.toLowerCase() == "") {
          if (currentSubPart.flexible) {
            currentSubPart.holdout = currentSubPart.selectedDR / 3;
          }
          else {
            currentSubPart.holdout = currentSubPart.selectedDR;
          }
        }
        else if (this.system.armourDesign.adjustedHoldoutPenaltyForCustomArmour.toLowerCase() == "weight") {
          if (currentSubPart.flexible) {
            currentSubPart.holdout = currentSubPart.selectedDR / 3 * (currentSubPart.material.wm / 0.9);
          }
          else {
            currentSubPart.holdout = currentSubPart.selectedDR * (currentSubPart.material.wm / 0.6);
          }
        }
        else if (this.system.armourDesign.adjustedHoldoutPenaltyForCustomArmour.toLowerCase() == "thickness") {
          if (currentSubPart.flexible) {
            currentSubPart.holdout = currentSubPart.selectedDR / 3 * (currentSubPart.material.drPerIn / 8);
          }
        else {
            currentSubPart.holdout = currentSubPart.selectedDR * (currentSubPart.material.drPerIn / 68);
          }
        }

        if (this.system.armourDesign.concealed) { // If it's concealed, run concealment related code
          currentSubPart.holdout = Math.max(currentSubPart.holdout - this.system.armourDesign.holdoutReduction, 0); // Apply any holdout penalty reduction, but only remove penalties, don't grant any bonus.
        }

        currentSubPart.holdout *= -1; // Flip the holdout penalty to negative

        if (this.system.armourDesign.concealed) { // If it's concealed, run concealment related code
          if (this.system.armourDesign.concealedClothing.toLowerCase() == "swimwear") {
            currentSubPart.holdout = currentSubPart.holdout - 5;
          }
          else if (this.system.armourDesign.concealedClothing.toLowerCase() == "summer") {
            currentSubPart.holdout = currentSubPart.holdout - 3;
          }
          else if (this.system.armourDesign.concealedClothing.toLowerCase() == "winter") {
            currentSubPart.holdout = currentSubPart.holdout + 3;
          }
          else if (this.system.armourDesign.concealedClothing.toLowerCase().includes("longcoat")) {
            currentSubPart.holdout = currentSubPart.holdout + 4;
          }
          else if (this.system.armourDesign.concealedClothing.toLowerCase() == "habit") {
            currentSubPart.holdout = currentSubPart.holdout + 5;
          }

          if (this.system.armourDesign.undercoverClothing == "1") {
            currentSubPart.holdout += 1;
          }
          else if (this.system.armourDesign.undercoverClothing == "2") {
            currentSubPart.holdout += 2;
          }
        }

        this.system.armourDesign.holdout = Math.min(this.system.armourDesign.holdout, currentSubPart.holdout);
      }
    }
  }

  _prepareCustomJewelryData() {
    this.validateEquipmentBasics();

    if (typeof this.system.jewelryDesign == "undefined" || (typeof this.system.jewelryDesign != "undefined" && !this.system.jewelryDesign.initComplete)) { // If the firearmDesign block hasn't yet been created
      this.system.jewelryDesign = { // Create it
        "initComplete": true,
        "showMana": false,
        "mana": 0,
        "style": "beads",
        "styles": [],
        "material": "beads",
        "materials": [],
        "beading": "none",
        "dye": "none",
        "embroidery": "none",
        "figurativePainting": "none",
        "fringe": "none",
        "relief": "none",
        "inlay": "none",
        "tapestryWeave": "none",
        "tapestryDye": "none",
        "gilding": "none",
        "enamel": "none",
        "etching": "none",
        "manaTreasure": false,
        "rollingDescription": "",
        "size": 0.3,
        "value": 100,
        "cf": 1,
        "allowMagicalMaterialsForCustom": false,
        "essential": false,
        "hideDecorations": false,
        "selectedStyle": {
          "name": "Beads",
          "code": "beads",
          "valueMult": 1.5,
          "weight": 0.3,
          "notes": "A string set with decorative beads or small plaques."
        },
        "selectedMaterial": {
          "name": "Generic Soft Metals",
          "tl": "1",
          "cost": "9.3",
          "hard": true,
          "metal": true,
      },
        "finalCost": 0,
      }
    }
    // Input validation
    if (typeof this.system.jewelryDesign.style == "undefined" || this.system.jewelryDesign.style == "") {
      this.system.jewelryDesign.style = "beads";
    }
    if (typeof this.system.jewelryDesign.size == "undefined" || this.system.jewelryDesign.size <= 0 || this.system.jewelryDesign.size == "") {
      this.system.jewelryDesign.size = 0.3;
    }
    if (typeof this.system.jewelryDesign.value == "undefined" || this.system.jewelryDesign.value <= 0 || this.system.jewelryDesign.value == "") {
      this.system.jewelryDesign.value = 100;
    }
    if (typeof this.system.jewelryDesign.selectedMaterial === "undefined") {
      this.system.jewelryDesign.selectedMaterial = {
        "name": "Generic Soft Metals",
        "tl": "1",
        "cost": "9.3",
        "hard": true,
        "metal": true,
      }
    }

    this.system.jewelryDesign.hideDecorations = false;
    this.system.jewelryDesign.manaTreasure = game.settings.get("gurps4e", "manaTreasure");
    this.system.jewelryDesign.showMana = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");
    this.system.jewelryDesign.styles = game.materialAPI.fetchJewelryDesigns();
    this.system.jewelryDesign.materials = game.materialAPI.fetchTreasureMaterials();
    this.system.jewelryDesign.allowMagicalMaterialsForCustom = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");
    this.system.lc = 4;
    this.system.jewelryDesign.selectedStyle = game.materialAPI.getJewelryDesignByCode(this.system.jewelryDesign.style);
    this.system.jewelryDesign.selectedMaterial = game.materialAPI.getTreasureMaterialByName(this.system.jewelryDesign.material);

    let cf = 1;
    let rollingDescription = "";

    if (this.system.jewelryDesign.style === "gem") { // It's a gem
      this.system.jewelryDesign.finalCost = ((this.system.jewelryDesign.size ** 2) + (4 * this.system.jewelryDesign.size)) * this.system.jewelryDesign.value;
      this.system.jewelryDesign.finalWeight = this.system.jewelryDesign.size / 2267.96;
      this.system.jewelryDesign.hideDecorations = true;
    }
    else { // It's not a gem

      if (this.system.jewelryDesign.selectedStyle.code !== "mana") { // Mana sources cannot be decorated
        if (typeof this.system.jewelryDesign.selectedMaterial !== "undefined") {
          if (this.system.jewelryDesign.selectedMaterial.hard) {
            if (this.system.jewelryDesign.relief !== "none") {
              if (this.system.jewelryDesign.relief === "simple") {
                cf += 1.5;
                rollingDescription += "<li>This object has a simple design carved or pressed into it.</li>";
              }
              else if (this.system.jewelryDesign.relief === "extensive") {
                cf += 4;
                rollingDescription += "<li>This object has a complex design carved or pressed into it.</li>";
              }
            }

            if (this.system.jewelryDesign.inlay !== "none") {
              if (this.system.jewelryDesign.inlay === "simpleCommon") {
                cf += 3;
                rollingDescription += "<li>This object has a simple design carved or pressed into it, and then the carvings have been filled with common materials of contrasting colours.</li>";
              }
              else if (this.system.jewelryDesign.inlay === "simplePrecious") {
                cf += 7.5;
                rollingDescription += "<li>This object has a simple design carved or pressed into it, and then the carvings have been filled with precious materials of contrasting colours.</li>";
              }
              else if (this.system.jewelryDesign.inlay === "extensiveCommon") {
                cf += 8;
                rollingDescription += "<li>This object has a complex design carved or pressed into it, and then the carvings have been filled with common materials of contrasting colours.</li>";
              }
              else if (this.system.jewelryDesign.inlay === "extensivePrecious") {
                cf += 20;
                rollingDescription += "<li>This object has a complex design carved or pressed into it, and then the carvings have been filled with precious materials of contrasting colours.</li>";
              }
            }

            if (this.system.jewelryDesign.gilding !== "none"){
              if (this.system.jewelryDesign.gilding === "copperAccent"){
                cf += 1.5;
                rollingDescription += "<li>This object has copper leaf applied as accents.</li>";
              }
              else if (this.system.jewelryDesign.gilding === "silverAccent"){
                cf += 2;
                rollingDescription += "<li>This object has silver leaf applied as accents.</li>";
              }
              else if (this.system.jewelryDesign.gilding === "goldAccent"){
                cf += 20;
                rollingDescription += "<li>This object has gold leaf applied as accents.</li>";
              }
              else if (this.system.jewelryDesign.gilding === "copper"){
                cf += 4.5;
                rollingDescription += "<li>This object has been covered in copper leaf.</li>";
              }
              else if (this.system.jewelryDesign.gilding === "silver"){
                cf += 6;
                rollingDescription += "<li>This object has been covered in silver leaf.</li>";
              }
              else if (this.system.jewelryDesign.gilding === "gold"){
                cf += 60;
                rollingDescription += "<li>This object has been covered in gold leaf.</li>";
              }
            }
          }
          else {
            if (this.system.jewelryDesign.beading !== "none"){
              if (this.system.jewelryDesign.beading === "light"){
                cf += 2;
                rollingDescription += "<li>This object has been lightly beaded along the edges or corners.</li>";
              }
              else if (this.system.jewelryDesign.beading === "extensive"){
                cf += 8;
                rollingDescription += "<li>This object has extensive beading across the entire surface.</li>";
              }
            }

            if (this.system.jewelryDesign.dye !== "none"){
              if (this.system.jewelryDesign.dye === "simple"){
                cf += 1.5;
                rollingDescription += "<li>This item has been dyed black, white, or a shade of grey.</li>";
              }
              else if (this.system.jewelryDesign.dye === "common"){
                cf += 6;
                rollingDescription += "<li>A more vivid, but common dye has been applied to this item. Examples are dull red from madder or blue-grey from indigo.</li>";
              }
              else if (this.system.jewelryDesign.dye === "expensive"){
                cf += 30;
                rollingDescription += "<li>An expensive dye, such as red from murex or cochnieal, yellow from saffron, or any other natural but extant dye has been applied to this item.</li>";
              }
            }

            if (this.system.jewelryDesign.embroidery !== "none"){
              if (this.system.jewelryDesign.embroidery === "minimal"){
                cf += 2;
                rollingDescription += "<li>Minimal trim or simple designs have been stitched into the surface of this item.</li>";
              }
              else if (this.system.jewelryDesign.embroidery === "elaborate"){
                cf += 6;
                rollingDescription += "<li>An elaborate design has been stitched into this item and it covers most of it's surface.</li>";
              }
              else if (this.system.jewelryDesign.embroidery === "minimalSilver"){
                cf += 6;
                rollingDescription += "<li>Minimal trim or simple designs have been stitched into the surface of this item with cloth of silver.</li>";
              }
              else if (this.system.jewelryDesign.embroidery === "elaborateSilver"){
                cf += 18;
                rollingDescription += "<li>An elaborate design has been stitched into this item and it covers most of it's surface with cloth of silver.</li>";
              }
              else if (this.system.jewelryDesign.embroidery === "minimalGold"){
                cf += 60;
                rollingDescription += "<li>Minimal trim or simple designs have been stitched into the surface of this item with cloth of gold.</li>";
              }
              else if (this.system.jewelryDesign.embroidery === "elaborateGold"){
                cf += 180;
                rollingDescription += "<li>An elaborate design has been stitched into this item and it covers most of it's surface with cloth of gold.</li>";
              }
            }

            if (this.system.jewelryDesign.fringe !== "none"){
              if (this.system.jewelryDesign.fringe === "common"){
                cf += 1.5;
                rollingDescription += "<li>This object has common feathers, furs, or a dyed string fringe.</li>";
              }
              else if (this.system.jewelryDesign.fringe === "rare"){
                cf += 4;
                rollingDescription += "<li>This object has a particularly rare or colourful trim, like peacock feathers, rare dyes, or sable.</li>";
              }
              else if (this.system.jewelryDesign.fringe === "commonSilver"){
                cf += 4.5;
                rollingDescription += "<li>This object has common feathers, furs, or a dyed string fringe that has been worked into cloth of silver.</li>";
              }
              else if (this.system.jewelryDesign.fringe === "rareSilver"){
                cf += 12;
                rollingDescription += "<li>This object has a particularly rare or colourful trim, like peacock feathers, rare dyes, or sable that has been worked into cloth of silver.</li>";
              }
              else if (this.system.jewelryDesign.fringe === "commonGold"){
                cf += 45;
                rollingDescription += "<li>This object has common feathers, furs, or a dyed string fringe that has been worked into cloth of gold.</li>";
              }
              else if (this.system.jewelryDesign.fringe === "rareGold"){
                cf += 120;
                rollingDescription += "<li>This object has a particularly rare or colourful trim, like peacock feathers, rare dyes, or sable that has been worked into cloth of gold.</li>";
              }
            }

            if (this.system.jewelryDesign.tapestryWeave !== "none") {
              if (this.system.jewelryDesign.tapestryWeave === "simple") {
                cf += 2;
                rollingDescription += "<li>A simple pattern has been woven into this item.</li>";
              }
              else if (this.system.jewelryDesign.tapestryWeave === "complex") {
                cf += 5;
                rollingDescription += "<li>A complex pattern has been woven into this item.</li>";
              }
              else if (this.system.jewelryDesign.tapestryWeave === "figurative") {
                cf += 10;
                rollingDescription += "<li>A figurative design has been woven into this item.</li>";
              }
            }

            if (this.system.jewelryDesign.tapestryWeave !== "none"){
              if (this.system.jewelryDesign.tapestryDye === "simple"){
                cf += 0;
                rollingDescription += "<li>This tapestry uses black, white, or grey dye.</li>";
              }
              else if (this.system.jewelryDesign.tapestryDye === "common"){
                cf += 1;
                rollingDescription += "<li>This tapestry uses a more vivid, but common dye. Examples are dull red from madder or blue-grey from indigo.</li>";
              }
              else if (this.system.jewelryDesign.tapestryDye === "expensive"){
                cf += 5;
                rollingDescription += "<li>This tapestry uses an expensive dye, such as red from murex or cochnieal, yellow from saffron, or any other natural but extant dye.</li>";
              }
            }
          }
        }
        if (typeof this.system.jewelryDesign.selectedMaterial !== "undefined") {
          if (this.system.jewelryDesign.selectedMaterial.metal) {
            if (this.system.jewelryDesign.enamel !== "none"){
              if (this.system.jewelryDesign.enamel === "limitedSimple"){
                cf += 2;
                rollingDescription += "<li>Simple decoration on a limited portion of the object, like geometric patterns on only a portion of the item.</li>";
              }
              else if (this.system.jewelryDesign.enamel === "limitedComplex"){
                cf += 5;
                rollingDescription += "<li>Complex decoration on a limited portion of the object, like individually painted figures on only a portion of the item.</li>";
              }
              else if (this.system.jewelryDesign.enamel === "extensiveSimple"){
                cf += 5;
                rollingDescription += "<li>Simple decoration on the entire object, like geometric patterns across the surface of the item.</li>";
              }
              else if (this.system.jewelryDesign.enamel === "extensiveComplex"){
                cf += 10;
                rollingDescription += "<li>Complex decoration on the entire object, like a painted or printed scene covering the object.</li>";
              }
            }

            if (this.system.jewelryDesign.etching !== "none") {
              if (this.system.jewelryDesign.etching === "simple") {
                cf += 1.5;
                rollingDescription += "<li>This object has a simple design chemically etched into it.</li>";
              }
              else if (this.system.jewelryDesign.etching === "extensive") {
                cf += 4;
                rollingDescription += "<li>This object has a complex design chemically etched into it.</li>";
              }
            }
          }
        }

        if (this.system.jewelryDesign.figurativePainting !== "none"){
          if (this.system.jewelryDesign.figurativePainting === "limitedSimple"){
            cf += 2;
            rollingDescription += "<li>Simple decoration on a limited portion of the object, like geometric patterns applied via block-print on only a portion of the item.</li>";
          }
          else if (this.system.jewelryDesign.figurativePainting === "limitedComplex"){
            cf += 5;
            rollingDescription += "<li>Complex decoration on a limited portion of the object, like individually painted figures on only a portion of the item.</li>";
          }
          else if (this.system.jewelryDesign.figurativePainting === "extensiveSimple"){
            cf += 5;
            rollingDescription += "<li>Simple decoration on the entire object, like geometric patterns applied via block-print across the surface of the item.</li>";
          }
          else if (this.system.jewelryDesign.figurativePainting === "extensiveComplex"){
            cf += 10;
            rollingDescription += "<li>Complex decoration on the entire object, like a painted or printed scene covering the object.</li>";
          }
        }
      }

      this.system.jewelryDesign.rollingDescription = rollingDescription;
      this.system.jewelryDesign.finalWeight = this.system.jewelryDesign.size;

      if (typeof this.system.jewelryDesign.selectedMaterial !== "undefined") {
        this.system.jewelryDesign.finalCost = +this.system.jewelryDesign.size * +this.system.jewelryDesign.selectedStyle.valueMult * parseInt(this.system.jewelryDesign.selectedMaterial.cost);
      }
      else {
        this.system.jewelryDesign.finalCost = +this.system.jewelryDesign.size * +this.system.jewelryDesign.selectedStyle.valueMult;
      }

      if (this.system.jewelryDesign.essential) {
        this.system.jewelryDesign.finalCost *= 30;
      }
    }

    // Final rounding
    let campaignTL = game.settings.get("gurps4e", "campaignTL");
    let campaignStartingWealth = economicHelpers.getStartingCashByTL(campaignTL);
    let sacrificialValue = Math.round(campaignStartingWealth / 250);

    this.system.jewelryDesign.finalCost = Math.round((this.system.jewelryDesign.finalCost * cf) * 100) / 100;
    this.system.jewelryDesign.finalWeight = Math.round(this.system.jewelryDesign.finalWeight * 100000) / 100000;
    this.system.jewelryDesign.mana = Math.floor(this.system.jewelryDesign.finalCost / sacrificialValue);

    // Output
    this.system.cost = this.system.jewelryDesign.finalCost;
    this.system.weight = this.system.jewelryDesign.finalWeight;

    this.finalEquipmentCalculation();
  }

  _prepareRitualData() {
    this.validateEquipmentBasics();

    let greaterEffectsMultiplier = 1;
    let costFromPaths = 0;
    let costFromModifiers = 0;
    let lowestOfPaths = 0;

    // Undefined checks

    if (typeof this.system.quantity !== "number" || isNaN(this.system.quantity)) { // Make sure it is a number and that number is not not a number
      this.system.quantity = 0; // If it is, default zero
    }
    else if (this.system.quantity < 0) { // If it's less than zero, also default zero
      this.system.quantity = 0
    }
    else { // Otherwise remove any decimals.
      this.system.quantity = Math.floor(this.system.quantity);
    }

    if (typeof this.system.timeUnitsPerAttempt !== "number") { // If timeUnits isn't a number, default to 5
      this.system.timeUnitsPerAttempt = 5;
    }
    else if (this.system.timeUnitsPerAttempt > 5) { // Cap it at 5
      this.system.timeUnitsPerAttempt = 5;
    }
    else if (this.system.timeUnitsPerAttempt < 0) { // Cap it at 0
      this.system.timeUnitsPerAttempt = 0;
    }
    else { // Remove decimals
      this.system.timeUnitsPerAttempt = Math.floor(this.system.timeUnitsPerAttempt);
    }

    if (typeof this.system.gatherMod !== "number") { // If gatherMod isn't a number, default to 0
      this.system.gatherMod = 0;
    }
    else { // Remove decimals
      this.system.gatherMod = Math.floor(this.system.gatherMod);
    }

    if (typeof this.system.extraMana !== "number") { // If extraMana isn't a number, default to 0
      this.system.extraMana = 0;
    }
    else { // Remove decimals
      this.system.extraMana = Math.floor(this.system.extraMana);
    }

    // Actual calculations
    if (typeof this.actor !== 'undefined') { // If there is an actor for this item. (As in, the item is on an actor)
      if (this.actor !== null) { // If there is an actor for this item. (As in, the item is on an actor)
        if (typeof this.actor.system.rpm !== 'undefined') { // If that actor also has the rpm related info

          // Store the adeptedness on the item for easier reference later
          if (typeof this.actor.system.rpm.ritualAdeptTime !== "undefined" && this.actor.system.rpm.ritualAdeptTime.length > 0) { // ritualAdeptTime isn't undefined and it does have a non-zero length
            this.system.ritualAdeptTime = parseInt(this.actor.system.rpm.ritualAdeptTime); // Parse the int out of the string.
          }
          else {
            this.system.ritualAdeptTime = 0; // Default zero
          }

          if (typeof this.actor.system.rpm.ritualAdeptConnection !== "undefined") { // ritualAdeptConnection isn't undefined
            this.system.ritualAdeptConnection = this.actor.system.rpm.ritualAdeptConnection;
          }
          else {
            this.system.ritualAdeptConnection = false; // Default false
          }

          if (typeof this.actor.system.rpm.ritualAdeptSpace !== "undefined") { // ritualAdeptSpace connection isn't undefined
            this.system.ritualAdeptSpace = this.actor.system.rpm.ritualAdeptSpace;
          }
          else {
            this.system.ritualAdeptSpace = false; // Default false
          }

          // Store higher purposes on the item for easier reference later

          // For each higher purpose, check that it's not undefined, blank, and that it has a non-zero modifier.
          if (typeof this.actor.system.rpm.higherPurpose1Name !== "undefined" && this.actor.system.rpm.higherPurpose1Name.length > 0 && typeof this.actor.system.rpm.higherPurpose1Level !== "undefined" && this.actor.system.rpm.higherPurpose1Level > 0) {
            this.system.higherPurpose1Present = true;
          }
          else {
            this.system.higherPurpose1Present = false;
          }

          if (typeof this.actor.system.rpm.higherPurpose2Name !== "undefined" && this.actor.system.rpm.higherPurpose2Name.length > 0 && typeof this.actor.system.rpm.higherPurpose2Level !== "undefined" && this.actor.system.rpm.higherPurpose2Level > 0) {
            this.system.higherPurpose2Present = true;
          }
          else {
            this.system.higherPurpose2Present = false;
          }

          if (typeof this.actor.system.rpm.higherPurpose3Name !== "undefined" && this.actor.system.rpm.higherPurpose3Name.length > 0 && typeof this.actor.system.rpm.higherPurpose3Level !== "undefined" && this.actor.system.rpm.higherPurpose3Level > 0) {
            this.system.higherPurpose3Present = true;
          }
          else {
            this.system.higherPurpose3Present = false;
          }

          // Store the names
          this.system.higherPurpose1Name = this.actor.system.rpm.higherPurpose1Name;
          this.system.higherPurpose2Name = this.actor.system.rpm.higherPurpose2Name;
          this.system.higherPurpose3Name = this.actor.system.rpm.higherPurpose3Name;

          // Store the levels
          this.system.higherPurpose1Level = this.actor.system.rpm.higherPurpose1Level;
          this.system.higherPurpose2Level = this.actor.system.rpm.higherPurpose2Level;
          this.system.higherPurpose3Level = this.actor.system.rpm.higherPurpose3Level;
        }
      }
    }

    let paths = [];
    let keys = Object.keys(this.system.path);
    if (keys.length > 0) {
      for (let k = 0; k < keys.length; k++) {
        let path = getProperty(this.system.path, keys[k]);
        path.cost = this._setCostByEffectName(path.effect); // Get the base cost of the spell
        costFromPaths += path.cost;

        if (!paths.includes(path.path)) { // The current paths array does not yet include the name of the path we are currently looking at.
          paths.push(path.path);
        }

        if (typeof this.actor !== 'undefined') { // If there is an actor for this item. (As in, the item is on an actor)
          if (this.actor !== null) { // If there is an actor for this item. (As in, the item is on an actor)
            if (typeof this.actor.system.rpm !== 'undefined') { // If that actor also has the rpm related info
              if (typeof this.actor.system.rpm.path !== 'undefined') { // If that actor also has the paths for rpm
                path.skill = skillHelpers.computeSkillLevel(this.actor, getProperty(this.actor.system.rpm.path, path.path)); // Grab the level from the path on the actor sheet so we can reference it later
              }
            }
          }
        }
        else { // There is no actor for this item
          path.skill = 0 // Set the path skill to zero so nothing breaks if we try to do math later.
        }

        if (lowestOfPaths === 0) { // If it's zero, it's been freshly initialized, so set it to the path skill we're currently itterating.
          lowestOfPaths = path.skill;
        }
        else {
          lowestOfPaths = Math.min(lowestOfPaths, path.skill); // Compare the skill to the currently stored value and keep the lowest.
        }

        if (path.level === "greater") { // If the effect is greater
          greaterEffectsMultiplier += 2; // Start applying the stacking multiplier.
        }
      }
    }

    let ritualModifierKeys = Object.keys(this.system.ritualModifier);
    let trappingsDiscount = 0;
    let totalCraftingModifier = 0;
    if (keys.length > 0) {
      for (let k = 0; k < ritualModifierKeys.length; k++) {
        let ritualModifier = getProperty(this.system.ritualModifier, ritualModifierKeys[k]);

        ritualModifier.effect.craftingPenalty = 0;

        // Check modifier type and calculate cost accordingly.
        if (ritualModifier.modifier === "affliction") {
          ritualModifier.cost = Math.floor(ritualModifier.effect.percentage / 5);
        }
        else if (ritualModifier.modifier === "trait") {
          if (ritualModifier.effect.level > 0) {
            ritualModifier.cost = Math.floor(ritualModifier.effect.level); // Cost is equal to level
          }
          else if (ritualModifier.effect.level < 0) {
            ritualModifier.cost = Math.abs(Math.floor(ritualModifier.effect.level / 5));
          }
          else {
            ritualModifier.cost = 0; // Cost is equal to level, which is zero
          }
        }
        else if (ritualModifier.modifier === "aoe") {
          ritualModifier.cost = Math.max(Math.abs(distanceHelpers.distancePenalty(ritualModifier.effect.area)) * 2, 2); // Add twice the distance penalty, but at least 2.
          ritualModifier.cost += Math.ceil(ritualModifier.effect.excludes / 2); // It's +1 mana per 2 exclusions, rounded up.
        }
        else if (ritualModifier.modifier === "modifier" || ritualModifier.modifier === "bonus" || ritualModifier.modifier === "penalty") {
          ritualModifier.cost = this.getRPMModifierCost(ritualModifier.effect.scope, ritualModifier.effect.modifier);
        }
        else if (ritualModifier.modifier === "damage") {
          let averageDamage = (ritualModifier.effect.dice * 3.5) + ritualModifier.effect.adds; // First, get the total average damage selected
          if (ritualModifier.effect.external && ritualModifier.effect.explosive) { // Damage is both external and explosive
            averageDamage /= 2; // Explosive external spells cost half as much mana for the same amount of damage.
          }
          else if (ritualModifier.effect.external) { // Damage is just external
            averageDamage /= 3; // External spells cost a third as much mana for the same amount of damage.
          }
          let additionalDamage = averageDamage - 3.5; // Get any additional points of average damage beyond the first 1d.
          additionalDamage = Math.max(additionalDamage, 0); // If for some reason they've entered a damage value less than 1d, this catches it.
          let energyCost = additionalDamage; // This is sometimes incorrect by 0.5 energy, but it vastly simplifies the math. We will do Math.ceil later to attempt to catch this issue.

          // Apply damage modifier

          if (ritualModifier.effect.woundMod === "pi-") {
            energyCost /= 0.5;
          }
          else if (ritualModifier.effect.woundMod === "cut" ||  ritualModifier.effect.woundMod === "pi+") {
            energyCost *= 1.5;
          }
          else if (ritualModifier.effect.woundMod === "pi++" ||  ritualModifier.effect.woundMod === "imp" ||  ritualModifier.effect.woundMod === "cor" ||  ritualModifier.effect.woundMod === "fat") {
            energyCost *= 2;
          }

          energyCost = Math.ceil(energyCost); // Correct for any fractional mana.

          // Sort out the cost of enhancements
          if (ritualModifier.effect.enhancementsOn) { // They are using enhancements on the damage
            let enhancementPercentage = Math.abs(ritualModifier.effect.enhancements); // Math.abs to input sanitize whether the user enters a positive or negative number
            if (ritualModifier.effect.limitationsOn) { // They are using limitations on the damage
              enhancementPercentage = enhancementPercentage - Math.abs(ritualModifier.effect.limitations); // Math.abs to input sanitize whether the user enters a positive or negative number
            }

            if (enhancementPercentage <= 0) { // If they've included enough limitations to keep the net value of all enhancements and limitations at or below zero
              energyCost += 1; // Then still add a 1 point surcharge.
            }
            else { // The enhancement percentage is above zero, proceed normally.
              if (energyCost < 20) { // Energy cost is less than 20
                energyCost = energyCost + Math.ceil(enhancementPercentage / 5); // Every +5% is worth 1 energy, rounded up.
              }
              else { // Energy cost is equal to or greater than 20
                energyCost = energyCost * (1 + (enhancementPercentage / 100)); // Just apply the modifier to the base energy cost of this damage section.
              }
            }
          }

          ritualModifier.cost = energyCost;
        }
        else if (ritualModifier.modifier === "duration") {
          let seconds = this.rpmDurationToSeconds(ritualModifier.effect.durationQty, ritualModifier.effect.durationUnits);
          ritualModifier.cost = this.getRPMDurationModifierCost(seconds);
        }
        else if (ritualModifier.modifier === "energy" || ritualModifier.modifier === "meta") {
          ritualModifier.cost = ritualModifier.effect.extraEnergy;
        }
        else if (ritualModifier.modifier === "healing") {
          let averageDamage = (ritualModifier.effect.dice * 3.5) + ritualModifier.effect.adds; // First, get the total average damage selected
          let additionalDamage = averageDamage - 3.5; // Get any additional points of average damage beyond the first 1d.
          additionalDamage = Math.max(additionalDamage, 0); // If for some reason they've entered a damage value less than 1d, this catches it.
          ritualModifier.cost = Math.ceil(additionalDamage); // Correct for any fractional mana.
        }
        else if (ritualModifier.modifier === "range") {
          if (ritualModifier.effect.rangeType === "normal") {
            ritualModifier.cost = Math.max(Math.abs(distanceHelpers.distancePenalty(ritualModifier.effect.range)), 0); // Get the distance penalty, at least zero.
          }
          else if (ritualModifier.effect.rangeType === "info") {
            ritualModifier.cost = Math.max(Math.abs(distanceHelpers.longDistancePenalty(ritualModifier.effect.range)), 0); // Get the long distance penalty, at least zero.
          }
          else if (ritualModifier.effect.rangeType === "time") {
            ritualModifier.cost = Math.max(Math.abs(distanceHelpers.longDistancePenalty(ritualModifier.effect.range * 1760)), 0); // Get the long distance penalty, treating miles as days.
          }
          else if (ritualModifier.effect.rangeType === "dim") {
            ritualModifier.cost = Math.max((ritualModifier.effect.range) * 10, 10); // Each dim crossed adds 10 energy. Math.max to catch edge cases.
          }
        }
        else if (ritualModifier.modifier === "speed") {
          ritualModifier.cost = Math.max(Math.abs(distanceHelpers.distancePenalty(ritualModifier.effect.speed)), 0); // Get the distance penalty, at least zero
        }
        else if (ritualModifier.modifier === "weight") {
          ritualModifier.cost = this.getRPMWeightModifierCost(ritualModifier.effect.weight);
        }
        else if (ritualModifier.modifier === "trappings") {
          ritualModifier.cost = 0;
          trappingsDiscount += Math.abs(ritualModifier.effect.trappings);
        }
        else if (ritualModifier.modifier === "crafting") {
          ritualModifier.cost = 0;
          ritualModifier.effect.craftingPenalty = this.rpmCraftingCostToPenalty(ritualModifier.effect.crafting);
        }
        else if (ritualModifier.modifier === "gmCrafting") {
          ritualModifier.cost = 0;
        }

        costFromModifiers += ritualModifier.cost;
        totalCraftingModifier += ritualModifier.effect.craftingPenalty;
      }
    }

    // Ritual Type cost thingy

    if (this.system.ritualType === "conditional" || this.system.ritualType === "charm") {
      costFromModifiers += 5; // Add +5 mana for the Lesser Control Magic necessary to make this ritual conditional or a charm.
    }
    else if (this.system.ritualType === "conditionalCharm") {
      costFromModifiers += 5; // Add +5 mana for the Lesser Control Magic necessary to make this ritual conditional.
      costFromModifiers += 8; // Add +5 mana for the Lesser Transform Magic necessary to make this ritual into a conditional charm.
    }
    else if (this.system.ritualType === "elixir") {
      costFromModifiers += 6; // Add +5 mana for the Lesser Create Magic necessary to make this into an elixir
    }

    this.system.energyCost = Math.ceil((greaterEffectsMultiplier * (costFromPaths + costFromModifiers)) * ((100 - trappingsDiscount) / 100));

    // Final skill calculation

    // lowestOfPaths was calculated above and has the lowest value of all the path skills included in this ritual

    let runningSkillLevel = lowestOfPaths

    // Apply the -1 penalty per path beyond the first two
    if (paths.length > 2) { // There are more than two paths
      runningSkillLevel -= (paths.length - 2); // Apply the penalty to the running total.
    }

    // If it's an alchemical mixture, apply the Alchemy skill cap here
    if (this.actor) {
      if (this.system.ritualType === "elixir") {
        if (typeof this.actor.system.rpm.alchemySkillLevel === 'number') {
          runningSkillLevel = Math.max(runningSkillLevel, this.actor.system.rpm.alchemySkillLevel); // Alchemical mixtures are crafted with the higher of their lowest path and their alchemy skill.
        }
      }
    }

    // Apply the crafting skill modifier, if any
    runningSkillLevel += totalCraftingModifier;

    // Grimoire bonus
    runningSkillLevel += this.system.grimBonus;

    // Ritual Mastery
    if (this.system.ritualMastery) {
      runningSkillLevel += 2;
    }

    // Higher Purposes
    if (this.system.higherPurpose1Applies) {
      runningSkillLevel += this.system.higherPurpose1Level;
    }
    if (this.system.higherPurpose2Applies) {
      runningSkillLevel += this.system.higherPurpose2Level;
    }
    if (this.system.higherPurpose3Applies) {
      runningSkillLevel += this.system.higherPurpose3Level;
    }

    // If it's a charm, conditional charm, or elixir, apply the workspace modifier
    if ((this.system.ritualType === "charm" || this.system.ritualType === "conditionalCharm" || this.system.ritualType === "elixir") && typeof this.system.workspaceMod === 'number') {
      runningSkillLevel += this.system.workspaceMod;
    }

    if (isNaN(runningSkillLevel)) {
      this.system.level = 0;
    }
    else {
      this.system.level = runningSkillLevel;
    }

    // Charms and Conditional rituals
    if (this.system.ritualType === "charm" || this.system.ritualType === "conditional" || this.system.ritualType === "conditionalCharm") {
      // Charm sale and purchase
      if (this.system.ritualType === "charm" || this.system.ritualType === "conditionalCharm") { // Only charms can be bought and sold
        let charmBaseCost = this.charmSkillToBaseCost(this.system.level) // Get the base cost from skill and monthly pay by TL
        let charmAvailabilityCostMultiplier = parseFloat(this.system.charm.availability); // Get the multiplier for charm availability from the select
        let charmEnergyCostMultiplier = Math.max((this.system.energyCost / 5) - 1, 1); // Get the multiplier based on the energy cost of the charm. Make sure it's always at least 1.

        this.system.charm.saleCost = (Math.round((charmBaseCost * charmAvailabilityCostMultiplier * charmEnergyCostMultiplier) * 100) / 100); // Do the final calculation and round to two decimals.
      }

      // Charm safe threshold calculator
      this.system.charm.safeThreshold = this.charmSafeThreshold(this.system.level);
      this.system.charm.actorContribution = 0; // Set actor contribution to 0 in case there is no actor

      if (this.actor) { // If there's an actor
        if (this.actor.system) {
          if (this.actor.system.rpm) {
            this.system.charm.actorContribution = ((this.actor.system.rpm.magery * 3) + this.actor.system.rpm.er) // Store their mana reserve
          }
        }
      }

      let nonAmbientMana = this.system.charm.actorContribution + this.system.charm.additionalSourcesOfMana // Total up any sources of non ambient mana for later.
      this.system.charm.totalSafeThreshold = this.system.charm.safeThreshold + nonAmbientMana // Add the actor's personal mana reserve and any external mana

      // Charm crafting modifiers

      // Set default values in case of unexpected behaviour.
      this.system.charm.craftingRollMod = 0;
      this.system.charm.quirkRollMod = 0;

      if (nonAmbientMana >= this.system.energyCost) { // The charm can be crafted without any ambient mana
        this.system.charm.craftingRollMod = -2;
        this.system.charm.quirkRollMod = +2;
      }
      else if ((this.system.energyCost - nonAmbientMana) <= (this.system.charm.safeThreshold / 2)) { // After subtracting the actor's mana reserve, check to see if the remainder is half or less the safe threshold.
        this.system.charm.craftingRollMod = -1;
        this.system.charm.quirkRollMod = +1;
      }
      else if ((this.system.energyCost - nonAmbientMana) <= (this.system.charm.safeThreshold)) { // After subtracting the actor's mana reserve, check to see if the remainder is equal to or less the safe threshold.
        this.system.charm.craftingRollMod = 0;
        this.system.charm.quirkRollMod = 0;
      }
      else if ((this.system.energyCost - nonAmbientMana) < (this.system.charm.safeThreshold * 2)) { // After subtracting the actor's mana reserve, check to see if the remainder is more than the safe threshold but not double.
        this.system.charm.craftingRollMod = +1;
        this.system.charm.quirkRollMod = -1;
      }
      else { // After subtracting the actor's mana reserve, check to see if the remainder is double or more the safe threshold.
        let remainder = (this.system.energyCost - nonAmbientMana); // Get the mana cost after subtracting the actor's reserve
        let multiple = Math.floor(remainder / this.system.charm.safeThreshold); // Get the multiple of the safe threshold that the remainder represents. Round down.

        // Store the multiple above as the modifier, with the sign set accordingly.
        this.system.charm.craftingRollMod = +multiple;
        this.system.charm.quirkRollMod = -multiple;
      }
    }
    else if (this.system.ritualType === "elixir") {
      // Alchemy crafting modifiers
      let monthlyPay = economicHelpers.getMonthlyPayByTL(game.settings.get("gurps4e", "campaignTL"));

      // First, go through all the ingredients and calculate cost and weight
      this.system.elixir.ingredientQtys.improvised$  = Math.round(this.system.elixir.ingredientQtys.improvised * monthlyPay * 0.01 * 100) / 100;
      this.system.elixir.ingredientQtys.improvisedLb = Math.round(this.system.elixir.ingredientQtys.improvised * 0.1 * 100) / 100;

      this.system.elixir.ingredientQtys.basic$  = Math.round(this.system.elixir.ingredientQtys.basic * monthlyPay * 0.03 * 100) / 100;
      this.system.elixir.ingredientQtys.basicLb = Math.round(this.system.elixir.ingredientQtys.basic * 0.3 * 100) / 100;

      this.system.elixir.ingredientQtys.good$  = Math.round(this.system.elixir.ingredientQtys.good * monthlyPay * 0.10 * 100) / 100;
      this.system.elixir.ingredientQtys.goodLb = Math.round(this.system.elixir.ingredientQtys.good * 1 * 100) / 100;

      this.system.elixir.ingredientQtys.fine$  = Math.round(this.system.elixir.ingredientQtys.fine * monthlyPay * 0.30 * 100) / 100;
      this.system.elixir.ingredientQtys.fineLb = Math.round(this.system.elixir.ingredientQtys.fine * 3 * 100) / 100;

      // Then get the total of above
      this.system.elixir.ingredientQtys.total   = Math.round(this.system.elixir.ingredientQtys.improvised + this.system.elixir.ingredientQtys.basic + this.system.elixir.ingredientQtys.good + this.system.elixir.ingredientQtys.fine + this.system.elixir.ingredientQtys.legendary * 100) / 100;
      this.system.elixir.ingredientQtys.total$  = Math.round(this.system.elixir.ingredientQtys.improvised$ + this.system.elixir.ingredientQtys.basic$ + this.system.elixir.ingredientQtys.good$ + this.system.elixir.ingredientQtys.fine$ + (this.system.elixir.ingredientQtys.legendary$ * this.system.elixir.ingredientQtys.legendary) * 100) / 100;
      this.system.elixir.ingredientQtys.totalLb = Math.round(this.system.elixir.ingredientQtys.improvisedLb + this.system.elixir.ingredientQtys.basicLb + this.system.elixir.ingredientQtys.goodLb + this.system.elixir.ingredientQtys.fineLb + (this.system.elixir.ingredientQtys.legendaryLb * this.system.elixir.ingredientQtys.legendary) * 100) / 100;

      // Then figure out what the actual discount works out to.

      let baseDiscount = 0; // Set the basic discount before multiple ingredient discounts start to apply
      let nextHighest = 5; // Set the default value of the next highest discount
      let relevantQty = 0; // Init a variable to contain the quantity of relevant ingredients.

      // Check to see what the highest quality level is.
      if (this.system.elixir.ingredientQtys.legendary >= 1) {
        baseDiscount = 25;
        nextHighest = 70;
        relevantQty = this.system.elixir.ingredientQtys.legendary + this.system.elixir.ingredientQtys.fine;
      }
      else if (this.system.elixir.ingredientQtys.fine >= 1) {
        baseDiscount = 20;
        nextHighest = 25;
        relevantQty = this.system.elixir.ingredientQtys.fine + this.system.elixir.ingredientQtys.good;
      }
      else if (this.system.elixir.ingredientQtys.good >= 1) {
        baseDiscount = 15;
        nextHighest = 20;
        relevantQty = this.system.elixir.ingredientQtys.good + this.system.elixir.ingredientQtys.basic;
      }
      else if (this.system.elixir.ingredientQtys.basic >= 1) {
        baseDiscount = 10;
        nextHighest = 15;
        relevantQty = this.system.elixir.ingredientQtys.basic + this.system.elixir.ingredientQtys.improvised;
      }
      else if (this.system.elixir.ingredientQtys.improvised >= 1) {
        baseDiscount = 5;
        nextHighest = 10;
        relevantQty = this.system.elixir.ingredientQtys.improvised;
      }

      let qtyDiscount = 0;

      if (game.settings.get("gurps4e", "rpmSmoothIngredientDiscounts")) {
        if (relevantQty >= 30) { // 30+, discount is 15%
          qtyDiscount = 15;
        }
        else if (relevantQty >= 8) { // 8+, discount is 15%
          qtyDiscount = 5;
        }
        else { // Anything else, discount is 0%
          qtyDiscount = 0;
        }
      }
      else {
        if (relevantQty <= 8) { // At 8 or less, use the formula FLOOR((0.714286 * J12) - 0.714286,0.01)
          qtyDiscount = Math.floor(((0.714286 * J12) - 0.714286) * +100) / +100;
        }
        else { // At 9 or more, use the formula FLOOR((0.454545 * J20) + 1.36365,0.01)
          qtyDiscount = Math.floor(((0.454545 * J20) + 1.36365) * +100) / +100;
        }
      }

      qtyDiscount = Math.min(qtyDiscount, (nextHighest / 2)); // Cap the qty discount to half of the next highest discount tier.

      this.system.elixir.discount = baseDiscount + qtyDiscount;
      this.system.elixir.discountManaValue = Math.floor(this.system.energyCost * (this.system.elixir.discount / 100)); // Find the mana value of the ingredient discount. This simplifies calculation and allows us to display it to the user.

      this.system.energyCost = this.system.energyCost - this.system.elixir.discountManaValue; // Apply the alchemy discount.
    }

    this.finalEquipmentCalculation();
  }

  charmSafeThreshold(skill) {
    let safeThreshold = 0;

    if (skill === 7) {
      safeThreshold = 1
    }
    else if (skill === 8) {
      safeThreshold = 2
    }
    else if (skill === 9) {
      safeThreshold = 3
    }
    else if (skill === 10) {
      safeThreshold = 4
    }
    else if (skill === 11) {
      safeThreshold = 5
    }
    else if (skill === 12) {
      safeThreshold = 6
    }
    else if (skill === 13) {
      safeThreshold = 7
    }
    else if (skill === 14) {
      safeThreshold = 9
    }
    else if (skill === 15) {
      safeThreshold = 11
    }
    else if (skill === 16) {
      safeThreshold = 15
    }
    else if (skill === 17) {
      safeThreshold = 29
    }
    else if (skill === 18) {
      safeThreshold = 42
    }
    else if (skill >= 19) {
      safeThreshold = 55 + ((skill - 19) * 10);
    }

    return safeThreshold;
  }

  charmSkillToBaseCost(skill) {
    let monthlyMultiplier = 0;

    if (skill <= 12) {
      monthlyMultiplier = 0.1;
    }
    else if (skill === 13) {
      monthlyMultiplier = 0.2;
    }
    else if (skill === 14) {
      monthlyMultiplier = 0.3;
    }
    else if (skill === 15) {
      monthlyMultiplier = 0.5;
    }
    else if (skill === 16) {
      monthlyMultiplier = 0.7;
    }
    else if (skill === 17) {
      monthlyMultiplier = 1;
    }
    else if (skill === 18) {
      monthlyMultiplier = 1.5;
    }
    else if (skill === 19) {
      monthlyMultiplier = 2;
    }
    else if (skill === 20) {
      monthlyMultiplier = 3;
    }
    else if (skill > 20) {
      monthlyMultiplier = distanceHelpers.sizeToDistance((skill - 19)); // At skill levels above 20, look up the skill - 19 on the SSRT
    }

    let monthlyPay = economicHelpers.getMonthlyPayByTL(game.settings.get("gurps4e", "campaignTL"));

    return monthlyPay * monthlyMultiplier;
  }

  getRPMModifierCost(scope, modifier) {
    if (typeof scope !== 'undefined') {
      let cost = 2 ** (Math.abs(modifier) - 1);
      if (scope.toLowerCase() === "broad") {
        cost *= 5;
      }
      else if (scope.toLowerCase() === "moderate") {
        cost *= 2;
      }

      return cost;
    }
    else {
      return 0;
    }
  }

  rpmDurationToSeconds(qty, units) { // Give the quantity and type of unit, convert to seconds.
    switch (units) {
      case "minutes":
        return qty * 60;
      case "hours":
        return qty * 60 * 60;
      case "days":
        return qty * 60 * 60 * 24;
      case "weeks":
        return qty * 60 * 60 * 24 * 7;
      case "fortnights":
        return qty * 60 * 60 * 24 * 7 * 2;
      case "months":
        return qty * 60 * 60 * 24 * 365 / 12;
      case "years":
        return qty * 60 * 60 * 24 * 365;
    }
  }

  rpmCraftingCostToPenalty(cost) {
    let startingCash = economicHelpers.getStartingCashByTL(game.settings.get("gurps4e", "campaignTL")); // Get the starting cash for the campaign TL
    let ratio = (cost / startingCash) * 100;

    if (ratio <= 0.5) { // 0.5%
      return 0;
    }
    else if (ratio <= 1) { // 1%
      return -1;
    }
    else if (ratio <= 2) { // 2%
      return -2;
    }
    else if (ratio <= 5) { // 5%
      return -3;
    }
    else if (ratio <= 10) { // 10%
      return -4;
    }
    else if (ratio <= 20) { // 20%
      return -5;
    }
    else if (ratio <= 50) { // 50%
      return -6;
    }
    else if (ratio <= 100) { // 100%
      return -7;
    }
    else if (ratio <= 200) { // 200%
      return -8;
    }
    else if (ratio <= 500) { // 500%
      return -9;
    }
    else if (ratio <= 1000) { // 1000%
      return -10;
    }
    else if (ratio <= 2000) { // 2000%
      return -11;
    }
    else if (ratio <= 5000) { // 5000%
      return -12;
    }
    else if (ratio <= 10000) { // 10000%
      return -13;
    }
    else if (ratio <= 20000) { // 20000%
      return -14;
    }
    else if (ratio <= 50000) { // 50000%
      return -15;
    }
    else if (ratio <= 100000) { // 100000%
      return -16;
    }
    else if (ratio <= 200000) { // 200000%
      return -17;
    }
    else if (ratio <= 500000) { // 500000%
      return -18;
    }
    else if (ratio <= 1000000) { // 100000%
      return -19;
    }
    else if (ratio <= 2000000) { // 200000%
      return -20;
    }
    else if (ratio <= 5000000) { // 500000%
      return -21;
    }
    else {
      return -22;
    }
  }

  // Given a duration in seconds, how much mana does that cost?
  getRPMDurationModifierCost(duration) {
    if (duration <= 0) {
      return 0;
    }
    else if (duration <= (10 * 60)) { // 10 minutes
      return 1;
    }
    else if (duration <= (30 * 60)) { // 30 minutes
      return 2;
    }
    else if (duration <= (3600)) { // 1 hour
      return 3;
    }
    else if (duration <= (3600 * 3)) { // 3 hours
      return 4;
    }
    else if (duration <= (3600 * 6)) { // 6 hours
      return 5;
    }
    else if (duration <= (3600 * 12)) { // 12 hours
      return 6;
    }
    else if (duration <= (86400)) { // 1 day
      return 7;
    }
    else if (duration <= (86400 * 3)) { // 3 days
      return 8;
    }
    else if (duration <= (86400 * 7)) { // 1 week
      return 9;
    }
    else if (duration <= (86400 * 7 * 2)) { // 2 weeks
      return 10;
    }
    else if (duration <= (86400 * (365 / 12) * 1)) { // 1 month
      return 11;
    }
    else if (duration <= (86400 * (365 / 12) * 2)) { // 2 months
      return 12;
    }
    else if (duration <= (86400 * (365 / 12) * 3)) { // 3 months
      return 13;
    }
    else if (duration <= (86400 * (365 / 12) * 4)) { // 4 months
      return 14;
    }
    else if (duration <= (86400 * (365 / 12) * 5)) { // 5 months
      return 15;
    }
    else if (duration <= (86400 * (365 / 12) * 6)) { // 6 months
      return 16;
    }
    else if (duration <= (86400 * (365 / 12) * 7)) { // 7 months
      return 17;
    }
    else if (duration <= (86400 * (365 / 12) * 8)) { // 8 months
      return 18;
    }
    else if (duration <= (86400 * (365 / 12) * 9)) { // 9 months
      return 19;
    }
    else if (duration <= (86400 * (365 / 12) * 10)) { // 10 months
      return 20;
    }
    else if (duration <= (86400 * (365 / 12) * 11)) { // 11 months
      return 21;
    }
    else { // More than 11 months.
      return 21 + (duration / (86400 * 365)); // Add the number of years to 21 to get the mana cost, rounded up.
    }
  }

  // Given a weight in pounds, how much mana does that cost?
  getRPMWeightModifierCost(weight) {
    if (weight <= 10) {
      return 0;
    }
    else if (weight <= 30) {
      return 1;
    }
    else if (weight <= 100) {
      return 2;
    }
    else if (weight <= 300) {
      return 3;
    }
    else if (weight <= 1000) {
      return 4;
    }
    else if (weight <= 3000) {
      return 5;
    }
    else if (weight <= 10000) { // 5 tons
      return 6;
    }
    else if (weight <= 30000) { // 15 tons
      return 7;
    }
    else if (weight <= 100000) { // 50 tons
      return 8;
    }
    else if (weight <= 300000) { // 150 tons
      return 9;
    }
    else if (weight <= 900000) { // 450 tons
      return 10;
    }
    else if (weight <= 2700000) { // 1350 tons
      return 11;
    }
    else { // More than 1350 tons.
      return 11 + Math.ceil(weight / 1350 / 2000 / 3); // This probably works?
    }
  }

  _setCostByEffectName(effect) {
    switch (effect) {
      case "sense":
        return 2;
      case "strengthen":
        return 3;
      case "restore":
        return 4;
      case "control":
        return 5;
      case "destroy":
        return 5;
      case "create":
        return 6;
      case "transform":
        return 8;
      default: // not a supported type
        return -1;
    }
  }

  _prepareCustomWeaponData() {
    this.validateEquipmentBasics();

    if (typeof this.system.customType == "undefined" || this.system.customType == null || this.system.customType == "") {
      this.system.customType = "bow"
    }

    switch (this.system.customType) {
      case "firearm":
      case "muzzleLoader": // Included for backwards compatibility.
      case "cartridgeLoader": // Included for backwards compatibility.
        this.prepareCustomFirearm();
        break;
      case "laser":
        this.prepareCustomLaser();
        break;
      case "bow":
        this.prepareCustomBow("bow");
        break;
      case "footbow":
        this.prepareCustomBow("footbow");
        break;
      case "xbow":
        this.prepareCustomBow("xbow");
        break;
      default: // not a supported type of custom weapon
        return ui.notifications.error("This type of custom weapon is not supported in the system!");
    }

    this.finalEquipmentCalculation();
  }

  prepareCustomFirearm() {
    if (this.system.tl >= 3) { // TL must be at least 3 to design a custom gun
      if (typeof this.system.firearmDesign == "undefined" || (typeof this.system.firearmDesign != "undefined" && !this.system.firearmDesign.initComplete)) { // If the firearmDesign block hasn't yet been created
        this.system.firearmDesign = { // Create it
          "barrelLength": 100, // Measured in mm
          "barrels": 1, // At least one, whole numbers
          "configuration": "pistol", // cannon/pistol/bullpup/longarm/semiportable
          "rifling": this.system.tl >= 5, // At or above TL5 barrels default rifled.
          "bolt": "closed", // closed/open
          "action": "semi", // muzzle/breech/break/bolt/straightPull/lever/pump/revolverSA/revolverDA/semi/auto/burst/highCyclicBurst
          "lock": "centre", // cannon/match/wheel/flint/cap/pin/rim/centre
          "allowTL4BreechLoaders": game.settings.get("gurps4e", "allowTL4BreechLoaders"),

          "magicalMaterials": false,

          "initComplete": true,

          "projectileCalibre": 10, // Measured in mm
          "projectileMass": 10, // Measured in grains
          "projectileAspectRatio": 1, // This is a ratio
          "projectileDensity": 10, // g/cm^2
          "projectileMaterials": "", // A comma delimited list of material names.
          "chamberBore": 10, // Measured in mm
          "caseLength": 10, // Measured in mm
          "cartridgeType": "pistol", // rifle/pistol/custom
          "burnRatio": 0.35, // This is a ratio of the case length
          "burnLength": 3.5, // This is the above in mm
          "powder": "smokeless", // smokeless/black
          "chamberPressure": 35000, // Measured in PSI

          "weight": 10,
          "ammoWeight": 1,
          "weightKgs": 10,
          "loadedWeight": 11,
          "baseWeightPerShot": 1,
          "baseCost": 1,
          "cf": 1,
          "finalCost": 1,
          "cps": 1,
          "cpsCf": 1,
          "finalCps": 1,

          "magazineStyle": "standard", // none/internal/standard/highDensity/extended/drum
          "magazineMaterial": "steel", // steel/alloy/plastic
          "capacity": 1, // Whole positive numbers only

          "essentialMaterials": false,
          "fitToOwner": false,
          "weightTweak": 1, // 0.85 to 999
          "meleeProfile": false,
          "cavalierWeapon": false,
          "rangedSkill": "",
          "meleeSkill": "",
          "rangedSkillMod": "",
          "meleeSkillMod": "",

          "baseAcc": 3,
          "baseDamage": 3.5,
          "baseDamageObject": {
            "dice": 1,
            "adds": 0,
          },
          "baseDamageDice": "1d6+0",
          "shots": "30+1", // Include closed bolt mod, etc.
          "reload": 3, // Time in seconds.
          "reloadFast": 2,
          "reloadQuickFast": 1,
          "finalReload": 3, // Time in seconds.
          "finalReloadFast": 2,
          "finalReloadQuickFast": 1,
          "individualLoading": "",
          "powderFlasks": false,
          "paperCartridges": false,
          "carefulLoading": false,
          "baseWoundMod": 2, // 1 is pi-, 2 is pi, 3 is pi+, 4 is pi++
          "maxSPi": 1,
          "maxPi": 1,
          "maxLPi": 1,
          "maxHPi": 1,

          "rof": 1,
          "maxRof": 3,
          "halfRange": 10,
          "maxRange": 100,

          "rclRaw": 2,
          "rcl": 2,
          "st": 10,
          "stOutput": 10,
          "stCode": "",
          "bulk": -3,
          "highEnergy": false,

          "explosivePercent": 0,

          "accuracy": 0, // -2 for cheap, 0 for good, 1 for fine, 2 for very fine. This is a direct mod to ACC
          "reliability": 0, // -1 for cheap, 0 for good, 1 for fine, 2 for very fine. This is a direct mod to Malf

          "yardsPerSecond": 10,

          "ammunition": [],
          "explosives": [],
        }
      }

      this.system.lc = 3;

      // Get game settings
      this.system.firearmDesign.magicalMaterials = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");

      // Input Validation
      if (typeof this.system.firearmDesign.barrelLength == "undefined" || this.system.firearmDesign.barrelLength <= 0 || this.system.firearmDesign.barrelLength == "") {
        this.system.firearmDesign.barrelLength = 100;
      }
      if (typeof this.system.firearmDesign.barrels == "undefined" || this.system.firearmDesign.barrels <= 0 || this.system.firearmDesign.barrels == "") {
        this.system.firearmDesign.barrels = 1;
      }
      if (typeof this.system.firearmDesign.projectileCalibre == "undefined" || this.system.firearmDesign.projectileCalibre <= 0 || this.system.firearmDesign.projectileCalibre == "") {
        this.system.firearmDesign.projectileCalibre = 10;
      }
      if (typeof this.system.firearmDesign.projectileMass == "undefined" || this.system.firearmDesign.projectileMass <= 0 || this.system.firearmDesign.projectileMass == "") {
        this.system.firearmDesign.projectileMass = 100;
      }
      if (typeof this.system.firearmDesign.projectileAspectRatio == "undefined" || this.system.firearmDesign.projectileAspectRatio <= 0 || this.system.firearmDesign.projectileAspectRatio == "") {
        this.system.firearmDesign.projectileAspectRatio = 1;
      }
      if (typeof this.system.firearmDesign.chamberBore == "undefined" || this.system.firearmDesign.chamberBore <= 0 || this.system.firearmDesign.chamberBore == "") {
        this.system.firearmDesign.chamberBore = 10;
      }
      if (typeof this.system.firearmDesign.caseLength == "undefined" || this.system.firearmDesign.caseLength <= 0 || this.system.firearmDesign.caseLength == "") {
        this.system.firearmDesign.caseLength = 100;
      }
      if (typeof this.system.firearmDesign.burnRatio == "undefined" || this.system.firearmDesign.burnRatio <= 0 || this.system.firearmDesign.burnRatio > 1 || this.system.firearmDesign.burnRatio == "") {
        this.system.firearmDesign.burnRatio = 0.35;
      }
      if (typeof this.system.firearmDesign.chamberPressure == "undefined" || this.system.firearmDesign.chamberPressure <= 0 || this.system.firearmDesign.chamberPressure == "") {
        this.system.firearmDesign.chamberPressure = 15000;
      }
      if (typeof this.system.firearmDesign.capacity == "undefined" || this.system.firearmDesign.capacity <= 0 || this.system.firearmDesign.capacity == "") {
        this.system.firearmDesign.capacity = 1;
      }
      if (typeof this.system.firearmDesign.weightTweak == "undefined" || this.system.firearmDesign.weightTweak <= 0 || this.system.firearmDesign.weightTweak == "") {
        this.system.firearmDesign.weightTweak = 1;
      }
      if (typeof this.system.firearmDesign.cf == "undefined" || this.system.firearmDesign.cf <= 0 || this.system.firearmDesign.cf == "") {
        this.system.firearmDesign.cf = 1;
      }

      this.system.firearmDesign.explosives = game.materialAPI.fetchExplosives();

      // The weapon is a muzzle loader, breach loader, or break action and magazine related info will be hidden
      if (this.system.firearmDesign.action === "break" || this.system.firearmDesign.action === "breech" || this.system.firearmDesign.action === "muzzle") {
        this.system.firearmDesign.magazineStyle = "none";
        this.system.firearmDesign.magazineMaterial = "steel";
        this.system.firearmDesign.capacity = 0;
        this.system.firearmDesign.rof = 1;
      }

      // The weapon is not some version of semi or automatic, and open/closed bolt info will be hidden
      if (this.system.firearmDesign.action === "break" ||
          this.system.firearmDesign.action === "breech" ||
          this.system.firearmDesign.action === "muzzle" ||
          this.system.firearmDesign.action === "bolt" ||
          this.system.firearmDesign.action === "straightPull" ||
          this.system.firearmDesign.action === "lever" ||
          this.system.firearmDesign.action === "pump" ||
          this.system.firearmDesign.action === "revolverSA" ||
          this.system.firearmDesign.action === "revolverDA") {
        this.system.firearmDesign.bolt = "closed";
      }

      // Rifling does not become available until TL4
      if (this.system.tl < 4) {
        this.system.firearmDesign.rifling = false;
      }

      this.system.firearmDesign.allowTL4BreechLoaders = game.settings.get("gurps4e", "allowTL4BreechLoaders");

      // Begin calculations proper

      // Burn length calculations
      if (this.system.firearmDesign.cartridgeType == "pistol") {
        this.system.firearmDesign.burnRatio = 7 / 24;
      }
      else if (this.system.firearmDesign.cartridgeType == "rifle") {
        this.system.firearmDesign.burnRatio = 7 / 16
      }

      this.system.firearmDesign.burnLength = this.system.firearmDesign.burnRatio * this.system.firearmDesign.caseLength;

      // Prerequisite Calculations
      let barrelBoreMetres        = this.system.firearmDesign.projectileCalibre / 1000 // F21 / F14
      let chamberBoreMetres       = this.system.firearmDesign.chamberBore / 1000
      let chamberPressurePascals  = this.system.firearmDesign.chamberPressure * 6896;
      let burnLengthMeters        = this.system.firearmDesign.burnLength / 1000;
      let boreCrossSection        = Math.PI * ( barrelBoreMetres / 2) ** 2; // I13
      let bulletCrossSection      = Math.PI * ( barrelBoreMetres / 2) ** 2; // I17
      let barrelLengthMetres      = this.system.firearmDesign.barrelLength / 1000; // F17
      let caseLengthMetres        = this.system.firearmDesign.caseLength / 1000;
      let chamberCrossSection     = Math.PI * ( chamberBoreMetres / 2 ) ** 2
      let chamberVolume           = chamberCrossSection * ( caseLengthMetres * 7/8 - barrelBoreMetres);
      let fallOffVolume           = chamberVolume + boreCrossSection * burnLengthMeters;
      let acclerationDistance     = barrelLengthMetres - caseLengthMetres - burnLengthMeters + barrelBoreMetres;
      let totalAcceleratedKgs     = this.system.firearmDesign.projectileMass / 15430; // F22 or F18

      // Actually useful calculations

      // Kinetic Energy
      let kineticEnergy = Math.abs( chamberPressurePascals * ( boreCrossSection * burnLengthMeters + fallOffVolume * Math.log( boreCrossSection * acclerationDistance / fallOffVolume + 1) ) ); // D27 or K12 - Measured in joules

      // Velocity
      let metresPerSecond = Math.sqrt((2* Math.abs(kineticEnergy) / totalAcceleratedKgs )); // D25
      let feetPerSecond = metresPerSecond * 1000 / (12 * 25.4); // D26
      this.system.firearmDesign.yardsPerSecond = Math.floor(feetPerSecond / 3);

      // Decide whether or not this gun counts 4 to 8mm projectiles as pi or pi- (High/Low energy)
      if (kineticEnergy > 1250 || metresPerSecond > 700) { // The KE is the NATO standard for intermediate cartridges.
        this.system.firearmDesign.highEnergy = true;
      }
      else {
        this.system.firearmDesign.highEnergy = false;
      }

      // Damage
      this.system.firearmDesign.baseDamage = Math.round(Math.sqrt(( kineticEnergy ** 1.04)/( bulletCrossSection ** 0.314))/13.3926)
      this.system.firearmDesign.baseDamageObject = generalHelpers.pointsToDiceAndAdds(this.system.firearmDesign.baseDamage);

      // Projectile Density
      let projectileVolume = (Math.PI*(barrelBoreMetres/2) ** 3+Math.PI/12*barrelBoreMetres ** 2*(2 * barrelBoreMetres * this.system.firearmDesign.projectileAspectRatio - barrelBoreMetres)); // I21
      this.system.firearmDesign.projectileDensity = totalAcceleratedKgs / projectileVolume / 1000 // I22 - Measured in g/cm^2

      let projectileMaterialArray = materialHelpers.densityToMaterials(this.system.firearmDesign.projectileDensity);

      this.system.firearmDesign.projectileMaterials = "";

      for (let d = 0; d < projectileMaterialArray.length; d++) {
        if (d > 0) {
          this.system.firearmDesign.projectileMaterials += ", ";
        }

        this.system.firearmDesign.projectileMaterials += projectileMaterialArray[d];
      }

      // Wound modifier calculation

      if (this.system.firearmDesign.projectileCalibre < 4) {
        this.system.firearmDesign.baseWoundMod = 1;
      }
      else if (this.system.firearmDesign.projectileCalibre < 8) {
        if (this.system.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
          this.system.firearmDesign.baseWoundMod = 2;
        }
        else {
          this.system.firearmDesign.baseWoundMod = 1;
        }
      }
      else if (this.system.firearmDesign.projectileCalibre < 10) {
        this.system.firearmDesign.baseWoundMod = 2;
      }
      else if (this.system.firearmDesign.projectileCalibre < 15) {
        this.system.firearmDesign.baseWoundMod = 3;
      }
      else {
        this.system.firearmDesign.baseWoundMod = 4;
      }

      // ACC calculation
      this.system.firearmDesign.baseAcc = 0;

      // Base ACC from configuration
      if (this.system.firearmDesign.configuration === "cannon") {
        this.system.firearmDesign.baseAcc = 1;
      }
      else if (this.system.firearmDesign.configuration === "pistol") {
        this.system.firearmDesign.baseAcc = 2;
      }
      else if (this.system.firearmDesign.configuration === "bullpup" || this.system.firearmDesign.configuration === "longarm") {
        this.system.firearmDesign.baseAcc = 4;
      }
      else if (this.system.firearmDesign.configuration === "semiportable") {
        this.system.firearmDesign.baseAcc = 5;
      }

      // Open/Closed bolt guns
      if (this.system.firearmDesign.bolt === "open") {
        this.system.firearmDesign.baseAcc -= 1; // Open bolt is -1 ACC
      }

      // Action ACC
      if (this.system.firearmDesign.action === "break" || this.system.firearmDesign.action === "bolt" || this.system.firearmDesign.action === "straightPull") {
        this.system.firearmDesign.baseAcc += 1;
      }

      // Rifling ACC
      if (!this.system.firearmDesign.rifling) {
        this.system.firearmDesign.baseAcc -= 1; // Unrifled weapons are -1 Acc
      }

      // ACC is at least 0
      if (this.system.firearmDesign.baseAcc < 0) {
        this.system.firearmDesign.baseAcc = 0;
      }

      this.system.firearmDesign.baseAcc += parseInt(this.system.firearmDesign.accuracy); // Apply acc modifier for quality level.

      // Max Rof calculation
      if (this.system.firearmDesign.action === "muzzle" || this.system.firearmDesign.action === "breech" || this.system.firearmDesign.action === "break" || this.system.firearmDesign.action === "bolt"  || this.system.firearmDesign.action === "revolverSA") {
        this.system.firearmDesign.maxRof = 1;
      }
      else if (this.system.firearmDesign.action === "straightPull" || this.system.firearmDesign.action === "lever" || this.system.firearmDesign.action === "pump") {
        this.system.firearmDesign.maxRof = 2;
      }
      else if (this.system.firearmDesign.action === "revolverDA" || this.system.firearmDesign.action === "semi") {
        this.system.firearmDesign.maxRof = 3;
      }
      else if (this.system.firearmDesign.action === "auto" || this.system.firearmDesign.action === "burst" || this.system.firearmDesign.action === "highCyclicBurst") {
        if (this.system.firearmDesign.bolt === "open") {
          this.system.firearmDesign.maxRof = 25;
        }
        else {
          this.system.firearmDesign.maxRof = 20;
        }
      }

      // Weight
      let configWeightModifier = 45;

      if (this.system.firearmDesign.action === "semi") {
        configWeightModifier = 1.5 / 0.9 * configWeightModifier;
      }
      else if (this.system.firearmDesign.action === "revolverSA" || this.system.firearmDesign.action === "revolverDA") {
        configWeightModifier = 5 * configWeightModifier;
      }
      else { // Else, use the modifier for bolt action weapons.
        configWeightModifier = 1.5 / 0.75 * configWeightModifier;
      }

      // Calculate the base receiver weight
      let receiverWeight = ((kineticEnergy ** 0.66) / configWeightModifier / 1.4 ** (this.system.tl - 7))

      if (this.system.firearmDesign.essentialMaterials) { // The gun is made of essential materials, modify receiverWeight weight accordingly.
        receiverWeight = receiverWeight / 3;
      }

      // Add weight for revolver cylinder
      if (this.system.firearmDesign.action === "revolverSA" || this.system.firearmDesign.action === "revolverDA") {
        receiverWeight = (receiverWeight) + ((receiverWeight * (this.system.firearmDesign.capacity-1)) * 0.132)
      }

      let wallThickness = this.system.firearmDesign.chamberPressure * this.system.firearmDesign.projectileCalibre / 2 / 44000000 * (1.4) ** (this.system.tl - 7); // H27
      let barrelDiameter = 2 * (wallThickness) + barrelBoreMetres;

      let barrelWeight = (Math.PI * (barrelBoreMetres / 2 + barrelDiameter) ** 2 - Math.PI * (barrelBoreMetres / 2) ** 2) * barrelLengthMetres * 7860

      if (this.system.firearmDesign.essentialMaterials) { // The gun is made of essential materials, modify barrelWeight accordingly.
        barrelWeight = barrelWeight / 3;
      }

      this.system.firearmDesign.weightKgs = ((receiverWeight + barrelWeight) + (((receiverWeight + barrelWeight) * 0.8) * (this.system.firearmDesign.barrels - 1))) * this.system.firearmDesign.weightTweak;
      this.system.firearmDesign.weight = this.system.firearmDesign.weightKgs * 2.205;

      // Add weight for ammo
      let projectileWeight = this.system.firearmDesign.projectileMass * 0.000142857;

      let propellantREF = 1;
      let propellantCost = 1; // We'll use this later to determine cost per shot
      let materialCost = 1; // We'll use this later to determine the weapon's material cost
      switch (this.system.tl) {
        case 1:
        case 2:
        case 3:
          propellantREF = 0.3;
          propellantCost = 5;
          materialCost = 50;
          break;
        case 4:
          propellantREF = 0.4;
          propellantCost = 5;
          materialCost = 50;
          break;
        case 5:
          propellantREF = 0.5;
          propellantCost = 5;
          materialCost = 50;
          break;
        case 6:
          propellantREF = 0.8;
          propellantCost = 7.5;
          materialCost = 3.50;
          break;
        case 7:
          propellantREF = 0.85;
          propellantCost = 7.5;
          break;
        case 8:
          propellantREF = 0.9;
          propellantCost = 7.5;
          break;
        case 9:
          propellantREF = 0.9 * 1.5;
          propellantCost = 7.5 * 1.5;
          break;
        case 10:
          propellantREF = 0.9 * 2;
          propellantCost = 7.5 * 2;
          break;
        case 11:
          propellantREF = 0.9 * 2.5;
          propellantCost = 7.5 * 2.5;
          break;
        case 12:
          propellantREF = 0.9 * 3;
          propellantCost = 7.5 * 3;
          break;
        default:
          propellantREF = 0.8;
          propellantCost = 7.5;
          break;
      }

      let powderWeight = kineticEnergy / 4.184; // This is the required mass of TNT in grams
      powderWeight = powderWeight * 0.00220462; // This is the required mass of TNT in pounds
      powderWeight = powderWeight / propellantREF; // This is the required mass of propellant, corrected for the REF of the propellant

      this.system.firearmDesign.baseWeightPerShot = projectileWeight + powderWeight;

      // Add weight for magazine body
      let magazineWeightMultiplier = 1;
      if (this.system.firearmDesign.magazineStyle === "none" || this.system.firearmDesign.magazineStyle === "internal"){
        magazineWeightMultiplier = 1;
      }
      else if (this.system.firearmDesign.magazineMaterial === "steel"){
        if (this.system.firearmDesign.magazineStyle === "standard") {
          magazineWeightMultiplier = 1.2;
        }
        else if (this.system.firearmDesign.magazineStyle === "highDensity") {
          magazineWeightMultiplier = 1.3;
        }
        else if (this.system.firearmDesign.magazineStyle === "extended") {
          magazineWeightMultiplier = 1.5;
        }
        else if (this.system.firearmDesign.magazineStyle === "drum") {
          magazineWeightMultiplier = 1.6;
        }
      }
      else if (this.system.firearmDesign.magazineMaterial === "alloy" || this.system.firearmDesign.magazineMaterial === "plastic"){
        if (this.system.firearmDesign.magazineStyle === "standard") {
          magazineWeightMultiplier = 1.1;
        }
        else if (this.system.firearmDesign.magazineStyle === "highDensity") {
          magazineWeightMultiplier = 1.1;
        }
        else if (this.system.firearmDesign.magazineStyle === "extended") {
          magazineWeightMultiplier = 1.2;
        }
        else if (this.system.firearmDesign.magazineStyle === "drum") {
          magazineWeightMultiplier = 1.3;
        }
      }

      if (this.system.firearmDesign.essentialMaterials) { // The gun is made of essential materials, modify magazine weight accordingly.
        magazineWeightMultiplier = 1 + ((magazineWeightMultiplier - 1)/3);
      }

      let loadedRounds = this.system.firearmDesign.capacity;
      if (this.system.firearmDesign.capacity === 0) {
        loadedRounds = 1
      }
      else if (this.system.firearmDesign.bolt = "closed") {
        loadedRounds += 1;
      }

      loadedRounds = loadedRounds * this.system.firearmDesign.barrels;

      this.system.firearmDesign.ammoWeight = loadedRounds * this.system.firearmDesign.baseWeightPerShot * magazineWeightMultiplier;

      this.system.firearmDesign.loadedWeight = Math.floor((this.system.firearmDesign.weight + this.system.firearmDesign.ammoWeight) * 100) / 100;
      this.system.weight = this.system.firearmDesign.loadedWeight;

      // Shots
      if (this.system.firearmDesign.action === "break" || this.system.firearmDesign.action === "breech" || this.system.firearmDesign.action === "muzzle") { // The weapon is some version of a single shot weapon, so the number of shots is the same as the number of barrels
        if (this.system.firearmDesign.barrels > 1){
          this.system.firearmDesign.shots = "1x" + this.system.firearmDesign.barrels;
        }
        else {
          this.system.firearmDesign.shots = "1";
        }
      }
      else { // The weapon has a magazine of some sort.
        this.system.firearmDesign.shots = this.system.firearmDesign.capacity // Base shots is the magazine capacity

        if (this.system.firearmDesign.bolt === "closed") { // If it's closed bolt, add +1
          this.system.firearmDesign.shot += "+" + 1
        }

        if (this.system.firearmDesign.barrels > 1) { // If it has multiple barrels, multiply accordingly
          this.system.firearmDesign.shots += "x" + this.system.firearmDesign.barrels;
        }
      }

      // Bulk and ST
      let bulkConfigLengthModifier = 304;
      if (this.system.firearmDesign.configuration === "pistol" || this.system.firearmDesign.configuration === "bullpup") {
        bulkConfigLengthModifier = 76;
      }

      let bulkLength = (this.system.firearmDesign.barrelLength+(this.system.firearmDesign.caseLength*2)+bulkConfigLengthModifier)/1000*1.09361*3*12

      let bulkConfigMod = 1;
      if (this.system.firearmDesign.configuration === "cannon") {
        bulkConfigMod = 6;
        this.system.firearmDesign.st = (Math.sqrt(this.system.weight) * 2.4);
        this.system.firearmDesign.stOutput = Math.round(this.system.firearmDesign.st);
        this.system.firearmDesign.stCode = "†";
      }
      else if (this.system.firearmDesign.configuration === "pistol") {
        bulkConfigMod = 2;
        this.system.firearmDesign.st =Math.sqrt(this.system.weight) * 3.3;
        this.system.firearmDesign.stOutput = Math.round(this.system.firearmDesign.st);
      }
      else if (this.system.firearmDesign.configuration === "bullpup") {
        bulkConfigMod = 3;
        this.system.firearmDesign.st = (Math.sqrt(this.system.weight) * 2.2);
        this.system.firearmDesign.stOutput = Math.round(this.system.firearmDesign.st);
        this.system.firearmDesign.stCode = "†";
      }
      else if (this.system.firearmDesign.configuration === "longarm") {
        bulkConfigMod = 4;
        this.system.firearmDesign.st = (Math.sqrt(this.system.weight) * 2.2);
        this.system.firearmDesign.stOutput = Math.round(this.system.firearmDesign.st);
        this.system.firearmDesign.stCode = "†";
      }
      else if (this.system.firearmDesign.configuration === "semiportable") {
        bulkConfigMod = 5;
        this.system.firearmDesign.st = (Math.sqrt(this.system.weight) * 2.2);
        this.system.firearmDesign.stOutput = Math.round(this.system.firearmDesign.st);
        this.system.firearmDesign.stCode = "†";
      }

      this.system.firearmDesign.bulk = 0.1-Math.log10(bulkConfigMod) -Math.log10(this.system.weight) - (2*Math.log10(bulkLength))

      // Rcl
      let mv = totalAcceleratedKgs * metresPerSecond;
      this.system.firearmDesign.rclRaw = mv / (this.system.firearmDesign.loadedWeight * 0.453592);

      if (this.system.firearmDesign.rclRaw < 2) {
        this.system.firearmDesign.rcl = 2;
      }
      else {
        this.system.firearmDesign.rcl = Math.round(this.system.firearmDesign.rclRaw);
      }

      // Range
      let sectionalDensity = (this.system.firearmDesign.projectileMass/15.43)/(Math.PI*(this.system.firearmDesign.projectileCalibre/2) ** 2); // D37
      let lossCoefficient = 0.000178 * sectionalDensity ** - 1.1213 / Math.pow(this.system.firearmDesign.projectileAspectRatio,1/4)*1.65; // D38

      let someWeirdConstant = 0.5 * Math.round(Math.sqrt(kineticEnergy ** 1.04/bulletCrossSection ** 0.314)/13.3926);

      this.system.firearmDesign.halfRange = Math.round((Math.log(13.3926)+Math.log(someWeirdConstant)-0.52*Math.log(totalAcceleratedKgs/2)+0.157*Math.log(bulletCrossSection))/(-1.04*lossCoefficient) + Math.log(metresPerSecond)/lossCoefficient);
      this.system.firearmDesign.maxRange = Math.round((Math.log(13.3926)+Math.log(0.017)-0.52*Math.log(totalAcceleratedKgs/2)+0.157*Math.log(bulletCrossSection))/(-1.04*lossCoefficient) + Math.log(metresPerSecond)/lossCoefficient);

      // Malf
      this.system.firearmDesign.malf = 17;

      switch (this.system.tl) {
        case 1:
        case 2:
        case 3:
          this.system.firearmDesign.malf = 12;
          break;
        case 4:
          this.system.firearmDesign.malf = 14;
          break;
        case 5:
          this.system.firearmDesign.malf = 16;
          break;
        default:
          this.system.firearmDesign.malf = 17;
          break;
      }

      if (this.system.firearmDesign.action === "straightPull" && this.system.tl === 6) { // Straight pull weapons are -1 malf at TL6
        this.system.firearmDesign.malf -= 1;
      }

      if (this.system.tl >= 6 && (this.system.firearmDesign.action === "revolverSA" || this.system.firearmDesign.action === "revolverDA")) { // Revolvers are +1 malf at higher TLs
        this.system.firearmDesign.malf += 1;
      }

      this.system.firearmDesign.malf += parseInt(this.system.firearmDesign.reliability); // Apply malf modifier for quality level.

      if (this.system.firearmDesign.malf > 17) { // Above a malf of 17, it's set to 17+. Which represents the fact two crit fails are required for the gun to malfunction.
        this.system.firearmDesign.malf = "17+";
      }

      // Reload
      this.system.firearmDesign.individualLoading = "";
      if (this.system.firearmDesign.action === "muzzle") {
        if (this.system.firearmDesign.lock === "cannon") {
          this.system.firearmDesign.reload = 30;
          this.system.firearmDesign.reloadFast = 30;
        }
        else if (this.system.firearmDesign.lock === "match") {
          if (this.system.firearmDesign.configuration === "pistol") {
            if (this.system.firearmDesign.rifling) {
              this.system.firearmDesign.reload = 67;
              this.system.firearmDesign.reloadFast = 54;
            }
            else {
              this.system.firearmDesign.reload = 45;
              this.system.firearmDesign.reloadFast = 36;
            }
          }
          else {
            if (this.system.firearmDesign.rifling) {
              this.system.firearmDesign.reload = 90;
              this.system.firearmDesign.reloadFast = 80;
            }
            else {
              this.system.firearmDesign.reload = 60;
              this.system.firearmDesign.reloadFast = 50;
            }
          }
        }
        else if (this.system.firearmDesign.lock === "wheel" || this.system.firearmDesign.lock === "flint") {
          if (this.system.firearmDesign.configuration === "pistol") {
            if (this.system.firearmDesign.rifling) {
              this.system.firearmDesign.reload = 30;
              this.system.firearmDesign.reloadFast = 24;
            }
            else {
              this.system.firearmDesign.reload = 20;
              this.system.firearmDesign.reloadFast = 16;
            }
          }
          else {
            if (this.system.firearmDesign.rifling) {
              this.system.firearmDesign.reload = 60;
              this.system.firearmDesign.reloadFast = 50;
            }
            else {
              this.system.firearmDesign.reload = 40;
              this.system.firearmDesign.reloadFast = 30;
            }
          }
        }

        if (this.system.firearmDesign.barrels > 1) {
          this.system.firearmDesign.individualLoading = "i";
        }
      }
      else if (this.system.firearmDesign.action === "breech") {
        if (this.system.firearmDesign.lock === "pin" || this.system.firearmDesign.lock === "rim" || this.system.firearmDesign.lock === "centre") {
          this.system.firearmDesign.reload = 3;
          this.system.firearmDesign.reloadFast = 2;
        }
        else {
          this.system.firearmDesign.reload = 10;
          this.system.firearmDesign.reloadFast = 8;
        }

        if (this.system.firearmDesign.barrels > 1) {
          this.system.firearmDesign.individualLoading = "i";
        }
      }
      else if (this.system.firearmDesign.action === "break") {
        this.system.firearmDesign.reload = 2;
        this.system.firearmDesign.reloadFast = 1;

        if (this.system.firearmDesign.barrels > 1) {
          this.system.firearmDesign.individualLoading = "i";
        }
      }
      else if (this.system.firearmDesign.magazineStyle === "internal") {
        this.system.firearmDesign.reload = 2;
        this.system.firearmDesign.reloadFast = 1;

        this.system.firearmDesign.individualLoading = "i";
      }
      else {
        this.system.firearmDesign.reload = 3;
        this.system.firearmDesign.reloadFast = 2;
      }

      this.system.firearmDesign.reloadQuickFast = (this.system.firearmDesign.reloadFast - Math.min(Math.floor(this.system.firearmDesign.reloadFast * 0.25), 1)); // Quick reload reduces time by 25%, rounded down, but always at least 1 second.

      if (this.system.firearmDesign.action === "muzzle" || this.system.firearmDesign.action === "breech") {
        if (this.system.firearmDesign.powderFlasks) {
          this.system.firearmDesign.reload -= 5;
          this.system.firearmDesign.reloadFast -= 5;
          this.system.firearmDesign.reloadQuickFast -= 5;
        }

        else if (this.system.firearmDesign.paperCartridges) {
          this.system.firearmDesign.reload           = this.system.firearmDesign.reload          / 2;
          this.system.firearmDesign.reloadFast       = this.system.firearmDesign.reloadFast      / 2;
          this.system.firearmDesign.reloadQuickFast  = this.system.firearmDesign.reloadQuickFast / 2;
        }

        if (this.system.firearmDesign.carefulLoading) {
          this.system.firearmDesign.reload           = this.system.firearmDesign.reload          * 2;
          this.system.firearmDesign.reloadFast       = this.system.firearmDesign.reloadFast      * 2;
          this.system.firearmDesign.reloadQuickFast  = this.system.firearmDesign.reloadQuickFast * 2;
        }
      }

      // Cost
      let costOfLead = this.system.tl >= 5 ? 1 : 2;
      this.system.firearmDesign.cps = (projectileWeight * costOfLead) + (propellantCost * powderWeight);
      this.system.firearmDesign.finalCps = this.system.firearmDesign.cf * this.system.firearmDesign.cps;

      let cost = 350;

      switch (this.system.firearmDesign.configuration) {
        case "cannon":
          cost = 350 * 0.75;
          break;
        case "pistol":
          cost = 350;
          break;
        case "bullpup":
          cost = 350 * 2.5;
          break;
        case "longarm":
          cost = 350 * 2;
          break;
        case "semiportable":
          cost = 350 * 6;
          break;
        default:
          cost = 350;
          break;
      }

      switch (this.system.tl) { // This modifier assumes the weapons are rifled.
        case 1:
        case 2:
        case 3:
          cost *= 0.4;
          break;
        case 4:
          cost *= 0.5;
          break;
        case 5:
          cost *= 0.6;
          break;
        case 6:
          cost *= 0.8;
          break;
        case 7:
          cost *= 1;
          break;
        case 8:
          cost *= 2;
          break;
        case 9:
          cost *= 2;
          break;
        case 10:
          cost *= 2;
          break;
        case 11:
          cost *= 2;
          break;
        case 12:
          cost *= 2;
          break;
        default:
          cost *= 1;
          break;
      }

      if (!this.system.firearmDesign.rifling) { // Rifling is available, but it's early TL.
        cost *= 0.75;
      }

      cost = cost + ((cost * 0.8) * (this.system.firearmDesign.barrels - 1)); // Apply cost for extra barrels

      this.system.firearmDesign.cf = 1;

      if (this.system.firearmDesign.fitToOwner) {
        this.system.firearmDesign.cf += 1;
      }

      if (this.system.firearmDesign.essentialMaterials) { // The gun is made of essential materials, modify cost factor accordingly.
        this.system.firearmDesign.cf += 9; // Essential materials are 30x the cost for the same weight. But we're using essential materials to reduce the weight, which means it only costs 10x as much in this case.
      }

      switch (this.system.firearmDesign.accuracy) {
        case "-2":
        case "-1":
          this.system.firearmDesign.cf -= 0.4;
          break;
        case "0":
          break;
        case "1":
          this.system.firearmDesign.cf += 0.75;
          break;
        case "2":
          this.system.firearmDesign.cf += 3.75;
          break;
        default:
          break;
      }

      switch (this.system.firearmDesign.reliability) {
        case "-2":
        case "-1":
          this.system.firearmDesign.cf -= 0.4;
          break;
        case "0":
          break;
        case "1":
          this.system.firearmDesign.cf += 0.25;
          break;
        case "2":
          this.system.firearmDesign.cf += 1.25;
          break;
        default:
          break;
      }

      this.system.firearmDesign.cf = Math.max(this.system.firearmDesign.cf, 0.2);

      this.system.firearmDesign.baseCost = cost;
      this.system.firearmDesign.finalCost = this.system.firearmDesign.cf * this.system.firearmDesign.baseCost;

      // Pre-calculate helpers for ammo related stuff
      // Shot
      this.system.firearmDesign.maxSPi = Math.floor((this.system.firearmDesign.projectileCalibre/4) ** 3); // Gives max number of 4mm balls (pi- or pi depending on velocity) Less than this is always pi-
      this.system.firearmDesign.maxPi = Math.floor((this.system.firearmDesign.projectileCalibre/8) ** 3); // Gives max number of 8mm balls  (pi)
      this.system.firearmDesign.maxLPi = Math.floor((this.system.firearmDesign.projectileCalibre/10) ** 3); // Gives max number of 10mm balls (pi+)
      this.system.firearmDesign.maxHPi = Math.floor((this.system.firearmDesign.projectileCalibre/15) ** 3); // Gives max number of 15mm balls (pi++)

      // Flechettes
      this.system.firearmDesign.maxSPiF = Math.floor(((this.system.firearmDesign.projectileCalibre/4) ** 3) / 40);
      this.system.firearmDesign.maxPiF = Math.floor(((this.system.firearmDesign.projectileCalibre/8) ** 3) / 40);
      this.system.firearmDesign.maxLPiF = Math.floor(((this.system.firearmDesign.projectileCalibre/10) ** 3) / 40);
      this.system.firearmDesign.maxHPiF = Math.floor(((this.system.firearmDesign.projectileCalibre/15) ** 3) / 40);

      switch (this.system.firearmDesign.baseWoundMod) {
        case 1:
          this.system.firearmDesign.woundMod = "pi-";
          break;
        case 2:
          this.system.firearmDesign.woundMod = "pi";
          break;
        case 3:
          this.system.firearmDesign.woundMod = "pi+";
          break;
        case 4:
          this.system.firearmDesign.woundMod = "pi++";
          break;
        default:
          this.system.firearmDesign.woundMod = "pi";
          break;
      }

      this.system.cost = this.system.firearmDesign.finalCost;

      // Calculate Ammo Stuff
      if (typeof this.system.firearmDesign.ammunition != "undefined") {
        let ammoKeys = Object.keys(this.system.firearmDesign.ammunition); // Get the ammo keys
        if (ammoKeys.length > 0) { // If there are actually keys
          for (let i = 0; i < ammoKeys.length; i++) { // Loop through the ammo the user has created and run whatever numbers need to be run.

            // Input validation for projectile count
            if (typeof this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles == "undefined" || this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles <= 0 || this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles == "") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles = 1;
            }
            this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles = Math.floor(Math.abs(this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles));

            // Init some things
            this.system.firearmDesign.ammunition[ammoKeys[i]].wps = this.system.firearmDesign.baseWeightPerShot;
            this.system.firearmDesign.ammunition[ammoKeys[i]].cps = this.system.firearmDesign.cps;
            this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF = 1;
            this.system.firearmDesign.ammunition[ammoKeys[i]].malf = this.system.firearmDesign.malf;
            this.system.firearmDesign.ammunition[ammoKeys[i]].acc = this.system.firearmDesign.baseAcc;
            this.system.firearmDesign.ammunition[ammoKeys[i]].damage = this.system.firearmDesign.baseDamage;
            this.system.firearmDesign.ammunition[ammoKeys[i]].st = this.system.firearmDesign.st;
            this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange = this.system.firearmDesign.halfRange;
            this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange = this.system.firearmDesign.maxRange;
            this.system.firearmDesign.ammunition[ammoKeys[i]].range = this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange + "/" + this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange;
            this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = this.system.firearmDesign.baseWoundMod;
            this.system.firearmDesign.ammunition[ammoKeys[i]].lc = 3;

            // Light cased
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].case === "lightCased") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].wps *= 0.7;
            }

            // +P ammo
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].plusp) {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].st *= 1.1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1.1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1.1;
              if (this.system.tl <= 6 || this.system.firearmDesign.reliability < 0) { // Weapon is low TL or cheap
                this.system.firearmDesign.ammunition[ammoKeys[i]].malf -= 1;
              }
            }

            // Match ammo
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].match !== "1") {
              if (this.system.firearmDesign.ammunition[ammoKeys[i]].match === "1.25") {
                this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
                if (this.system.firearmDesign.baseAcc >= 4) {
                  this.system.firearmDesign.ammunition[ammoKeys[i]].acc = Math.floor(this.system.firearmDesign.ammunition[ammoKeys[i]].acc * 1.25);
                }
              }
              else if (this.system.firearmDesign.ammunition[ammoKeys[i]].match === "1.5") {
                this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
                if (this.system.firearmDesign.baseAcc >= 2) {
                  this.system.firearmDesign.ammunition[ammoKeys[i]].acc = Math.floor(this.system.firearmDesign.ammunition[ammoKeys[i]].acc * 1.5);
                }
              }
            }

            // Subsonic ammo
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].subsonic) {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.3;
              if (this.system.firearmDesign.yardsPerSecond >= 375.109) {
                if (this.system.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as a rifle round, otherwise a pistol round
                  this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.6;
                  this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.6;
                  this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.6;
                }
                else {
                  this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.8;
                  this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.8;
                }
              }
            }

            // Silent ammo
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].silent) {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 9;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }

            // Poison ammo
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].poison) {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }

            // Incendiary and tracer ammo
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].inc || this.system.firearmDesign.ammunition[ammoKeys[i]].tracer) {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage += 1;
            }

            this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 1;
            this.system.firearmDesign.ammunition[ammoKeys[i]].frag = false;
            this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 0;
            this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "";
            this.system.firearmDesign.ammunition[ammoKeys[i]].rcl = this.system.firearmDesign.rcl;

            // Projectile Type
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "le" ||
                this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "he") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 15;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "lec" ||
                this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "hec") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 15;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "thermobaric") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 7;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }

            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "saplec") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 10;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "saple" ||
                this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "saphe") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 10;
              this.system.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "saphec") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 20;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "apex") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.7;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.system.firearmDesign.projectileCalibre < 20) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "aphex") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.system.firearmDesign.projectileCalibre < 20) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "heat") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 10;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "msheat") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 10;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 7;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "hedp") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 10;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "hesh") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 95;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "efp") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 50;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 7;
              this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "hp") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "frangible") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.9;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.9;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "ap") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.7;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
              if (this.system.firearmDesign.projectileCalibre < 20) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "aphc") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
              if (this.system.firearmDesign.projectileCalibre < 20) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "apdu") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.system.firearmDesign.projectileCalibre < 20) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "apds") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.system.firearmDesign.projectileCalibre < 30) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "apdsdu") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.system.firearmDesign.projectileCalibre < 30) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "apfsds") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.system.firearmDesign.projectileCalibre < 40) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "apfsdsdu") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 4;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.7;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
              if (this.system.firearmDesign.projectileCalibre < 40) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "sapfsds") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "baton") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].acc -= 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
              if (this.system.firearmDesign.projectileCalibre >= 35) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr dbk";
              }
              else {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr";
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "bean") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].ad = 0.2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1/8;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1/8;
              this.system.firearmDesign.ammunition[ammoKeys[i]].acc = 0;
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
              if (this.system.firearmDesign.projectileCalibre >= 15) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr dbk";
              }
              else {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr";
              }
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "underwater") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "imp";
              this.system.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.system.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "shotshell" || this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "canister") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= (1 / Math.sqrt(this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles));
              let projectileDiameter = ((this.system.firearmDesign.projectileCalibre ** 3) / this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles) ** (1/3);

              // Wound modifier calculation
              if (projectileDiameter < 4) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
              }
              else if (projectileDiameter < 8) {
                if (this.system.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
                }
                else {
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
                }
              }
              else if (projectileDiameter < 10) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
              }
              else if (projectileDiameter < 15) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 3;
              }
              else {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              }

              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange = projectileDiameter * 5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange = projectileDiameter * 100;
              this.system.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "mf") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= (1 / Math.sqrt(this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles));
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              let projectileDiameter = ((this.system.firearmDesign.projectileCalibre ** 3) / this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles) ** (1/3)

              // Wound modifier calculation
              if (projectileDiameter < 4) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
              }
              else if (projectileDiameter < 8) {
                if (this.system.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
                }
                else {
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
                }
              }
              else if (projectileDiameter < 10) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
              }
              else if (projectileDiameter < 15) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 3;
              }
              else {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              }

              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange = projectileDiameter * 50;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange = projectileDiameter * 600;
              this.system.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "rs") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= (1 / Math.sqrt(this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles));
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              let projectileDiameter = ((this.system.firearmDesign.projectileCalibre ** 3) / this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles) ** (1/3)

              // Wound modifier calculation
              if (projectileDiameter < 4) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
              }
              else if (projectileDiameter < 8) {
                if (this.system.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
                }
                else {
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
                }
              }
              else if (projectileDiameter < 10) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
              }
              else if (projectileDiameter < 15) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 3;
              }
              else {
                this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              }

              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange = projectileDiameter * 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange = projectileDiameter * 10;
              this.system.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "duplex") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.85;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles = 2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1/2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1/2;
              this.system.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.system.firearmDesign.ammunition[ammoKeys[i]].projectile === "triplex") {
              this.system.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.7;
              this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles = 3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1/3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1/3;
              this.system.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }

            if (this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut === "") {
              switch (this.system.firearmDesign.ammunition[ammoKeys[i]].woundMod) {
                case 1:
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi-";
                  break;
                case 2:
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi";
                  break;
                case 3:
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi+";
                  break;
                case 4:
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi++";
                  break;
                default:
                  this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi";
                  break;
              }
            }

            this.system.firearmDesign.ammunition[ammoKeys[i]].cps = Math.round((this.system.firearmDesign.ammunition[ammoKeys[i]].cps * this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF) * 100) / 100

            if (this.system.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent == 0) {
              this.system.firearmDesign.ammunition[ammoKeys[i]].explosivePercent = 0;
            }

            // Handle explosive calculation
            if (this.system.firearmDesign.ammunition[ammoKeys[i]].explosivePercent > 0) {

              let explosive = materialHelpers.getExplosiveByCode(this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveFiller);

              let baseExplosiveDamage = 21 * (Math.sqrt((this.system.firearmDesign.ammunition[ammoKeys[i]].wps * (this.system.firearmDesign.ammunition[ammoKeys[i]].explosivePercent / 100)) * 4 * explosive.ref));

              if (this.system.firearmDesign.ammunition[ammoKeys[i]].frag) {
                this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage = Math.round(baseExplosiveDamage * 0.7);
                this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamage = Math.round(baseExplosiveDamage * 0.3);
              }
              else {
                this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage = Math.round(baseExplosiveDamage);
                this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamage = 0;
              }

              this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageObject = generalHelpers.pointsToDiceAndAdds(this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage);
              this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageDice = generalHelpers.diceAndAddsToGURPSOutput(this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageObject.dice, this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageObject.adds);

              this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamageObject = generalHelpers.pointsToDiceAndAdds(this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamage);
              this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamageDice = generalHelpers.diceAndAddsToGURPSOutput(this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamageObject.dice, this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamageObject.adds);

              // Add the cost of the explosives to the cost of the shot
              let explosiveCost = explosive.costPerLb * (this.system.firearmDesign.ammunition[ammoKeys[i]].wps * (this.system.firearmDesign.ammunition[ammoKeys[i]].explosivePercent / 100));
              this.system.firearmDesign.ammunition[ammoKeys[i]].cps += explosiveCost;
            }
            else {
              this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage = 0;
              this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamage = 0;
            }

            this.system.firearmDesign.ammunition[ammoKeys[i]].st = Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].st);
            this.system.firearmDesign.ammunition[ammoKeys[i]].range = Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange);
            this.system.firearmDesign.ammunition[ammoKeys[i]].rofBonus = generalHelpers.rofToBonus(this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles);
            this.system.firearmDesign.ammunition[ammoKeys[i]].damageObject = generalHelpers.pointsToDiceAndAdds(this.system.firearmDesign.ammunition[ammoKeys[i]].damage);
            this.system.firearmDesign.ammunition[ammoKeys[i]].damageDice = generalHelpers.diceAndAddsToGURPSOutput(this.system.firearmDesign.ammunition[ammoKeys[i]].damageObject.dice, this.system.firearmDesign.ammunition[ammoKeys[i]].damageObject.adds);
          }
        }
      }

      // Loop through ammo designs and add ranged profiles
      if (typeof this.system.firearmDesign.ammunition != "undefined") {
        this.addCustomFirearmProfiles();
      }

      // Adding melee profiles
      if (this.system.firearmDesign.meleeProfile) { // If the user wants to include a melee profile
        this.addMeleeProfile(this.system.firearmDesign.bulk, this.system.firearmDesign.cavalierWeapon, this.system.firearmDesign.configuration, this.system.firearmDesign.meleeSkill, this.system.firearmDesign.meleeSkillMod, this.system.firearmDesign.st) // Include one
      }

      this.system.firearmDesign.baseDamageDice = generalHelpers.diceAndAddsToGURPSOutput(this.system.firearmDesign.baseDamageObject.dice, this.system.firearmDesign.baseDamageObject.adds);
    }
  }

  prepareCustomLaser() {
    if (this.system.tl >= 8) { // TL must be at least 9 to be able to design a custom laser
      if (typeof this.system.laserDesign == "undefined") { // If the laserDesign block hasn't yet been created
        this.system.laserDesign = { // Create it
          "configuration": "", // Beamer/Pistol/Rifle/Cannon
          "beamType": "laser", // Laser/Force Beam/Etc
          "laserColour": "ir", // See UT 114, options are ir/bg/uv
          "focalArray": 1, // Numbers map to Tiny, Very Small, etc, through to Extremely Large. Valid entires are 0.1 to 4
          "focalArraySize": "Medium", // Numbers map to Tiny, Very Small, etc, through to Extremely Large. Valid entires are 0.1 to 4
          "generator": "semi", // single/semi/light/heavy/lightGat/heavyGat.
          "hotshotsAndOverheating": game.settings.get("gurps4e", "hotshotsAndOverheating"),
          "allowSuperScienceCustomLasers": game.settings.get("gurps4e", "allowSuperScienceCustomLasers"),
          "superScience": false, // Makes use of allowSuperScienceCustomLasers to turn regular science lasers into super science lasers
          "damageDice": 2.0,
          "hotshotDamageDice": 2.0,
          "damageDiceInput": 2.0,
          "emptyWeight": 0.0,
          "weightTweak": 1,
          "loadedWeight": 0.0,
          "outputDamage": "",
          "outputDamageHotshot": "",
          "outputAcc": 3,
          "outputAccWater": 3,
          "outputAccSpace": 3,
          "outputRange": "",
          "outputWeight": "",
          "outputRoF": 0,
          "outputShots": "",
          "outputST": 0,
          "outputBulk": 0,
          "outputRcl": 0,
          "armourDivisor": 1,
          "armourDivisorWater": 1,
          "armourDivisorSpace": 1,
          "damageType": "tbb",
          "halfRange": 0,
          "maxRange": 0,
          "halfRangeSpace": 0,
          "maxRangeSpace": 0,
          "halfRangeWater": 0,
          "maxRangeWater": 0,
          "superScienceCells": false,
          "nonRechargeableCells": false,
          "powerCellQty": 1,
          "powerCell": "C",
          "powerCellWeight": 0,
          "shots": 0,
          "omniBlaster": false,
          "fieldJacketed": false,
          "graviticFocus": 0,
          "ftl": false,
          "info": "",
          "pulseLaser": false,
          "pulseBeamLaser": false,
          "meleeProfile": false,
          "cavalierWeapon": false,
          "rangedSkill": "",
          "meleeSkill": "",
          "rangedSkillMod": "",
          "meleeSkillMod": "",
          "showAir": false,
          "showSpace": false,
          "showWater": false,
          "showAirHotshot": false,
          "showSpaceHotshot": false,
          "showWaterHotshot": false,
          "chemicalShots": 1,
          "chemicalCost": 1,
        }
      }

      // Input Validation
      if (typeof this.system.laserDesign.powerCellQty == "undefined" || this.system.laserDesign.powerCellQty <= 0 || this.system.laserDesign.powerCellQty === "") { // If the cell quantity is blank or negative
        this.system.laserDesign.powerCellQty = 1; // Set to 1
      }
      if (typeof this.system.laserDesign.damageDice == "undefined" || this.system.laserDesign.damageDice <= 0 || this.system.laserDesign.damageDice === "") { // If the damage dice is blank or negative
        this.system.laserDesign.damageDice = 1; // Set to 1
      }
      if (typeof this.system.laserDesign.graviticFocus == "undefined" || this.system.laserDesign.graviticFocus === "") { // If the damage dice is blank or negative
        this.system.laserDesign.graviticFocus = "0"; // Set to zero
      }
      if (this.system.laserDesign.ftl) {
        this.system.laserDesign.fieldJacketed = this.system.laserDesign.ftl;
      }
      if (!this.system.laserDesign.pulseLaser) {
        this.system.laserDesign.pulseBeamLaser = false;
      }
      if (typeof this.system.laserDesign.chemicalShots == "undefined" || this.system.laserDesign.chemicalShots <= 0 || this.system.laserDesign.chemicalShots === "") { // If the cell quantity is blank or negative
        this.system.laserDesign.chemicalShots = 1; // Set to 1
      }

      this.system.laserDesign.damageDice = this.system.laserDesign.damageDiceInput / 2**(parseInt(this.system.laserDesign.graviticFocus));

      // Get game settings relevant to the design of the laser
      this.system.laserDesign.hotshotsAndOverheating = game.settings.get("gurps4e", "hotshotsAndOverheating");
      this.system.laserDesign.allowSuperScienceCustomLasers = game.settings.get("gurps4e", "allowSuperScienceCustomLasers");

      // This block categorizes the user's focal array selection into the categories given in the article
      if (this.system.laserDesign.focalArray < 0.175) { // Default tiny is 0.1, average of it and the next size is 0.175
        this.system.laserDesign.focalArraySize = "Tiny";
      }
      else if (this.system.laserDesign.focalArray < 0.375) { // Default very small is 0.25, average of it and the next size is 0.375
        this.system.laserDesign.focalArraySize = "Very Small";
      }
      else if (this.system.laserDesign.focalArray < 0.75) { // Default small is 0.5, average of it and the next size is 0.75
        this.system.laserDesign.focalArraySize = "Small";
      }
      else if (this.system.laserDesign.focalArray < 1.25) { // Default medium is 1, average of it and the next size is 1.25
        this.system.laserDesign.focalArraySize = "Medium";
      }
      else if (this.system.laserDesign.focalArray < 1.75) { // Default large is 1.5, average of it and the next size is 1.75
        this.system.laserDesign.focalArraySize = "Large";
      }
      else if (this.system.laserDesign.focalArray < 3) { // Default very large is 2, average of it and the next size is 3
        this.system.laserDesign.focalArraySize = "Very Large";
      }
      else { // Anything 3 or over is Extremely Large. Default XL is 4
        this.system.laserDesign.focalArraySize = "Extremely Large";
      }

      // Weight modifier for superscience beams
      let s = 1;
      if (this.system.laserDesign.superScience) {
        s = 0.5;
      }

      // Set weight modifier for beam type, along with other beam specific settings
      let e = 3;
      let rb = 8
      let bc = 0;
      let baseShots = 0;
      let lc = 4;
      if (this.system.laserDesign.beamType == "chemicalLaser") {
        lc = 3;
        bc = 500;

        if (this.system.laserDesign.pulseLaser) {
          this.system.laserDesign.damageType = "cr ex";
          this.system.laserDesign.armourDivisor = 0.5;
        }
        else {
          this.system.laserDesign.damageType = "burn";
          this.system.laserDesign.armourDivisor = 1;
        }

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 6;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 12;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 18;
        }

        rb = 120;
        e = 1/3.7;
      }
      else if (this.system.laserDesign.beamType == "laser") {
        lc = 3;
        bc = 500;

        if (this.system.laserDesign.pulseLaser){
          this.system.laserDesign.damageType = "cr ex";
          this.system.laserDesign.armourDivisor = 1;
        }
        else {
          this.system.laserDesign.damageType = "tbb";
          this.system.laserDesign.armourDivisor = 2;
        }

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 6;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 12;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 18;
        }

        if (this.system.tl <= 9) {
          baseShots = 225;
        }
        else if (this.system.tl == 10) {
          baseShots = 1800;
        }
        else if (this.system.tl == 11) {
          baseShots = 7200;
        }
        else if (this.system.tl == 12) {
          baseShots = 28800;
        }

        rb = 40;
        e = 3;
      }
      else if (this.system.laserDesign.beamType == "forceBeam") {
        lc = 4;
        bc = 500;
        this.system.laserDesign.armourDivisor = 1;
        this.system.laserDesign.damageType = "cr dbk";

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 6;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 12;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 18;
        }

        if (this.system.tl <= 9) {
          baseShots = 270;
        }
        else if (this.system.tl == 10) {
          baseShots = 1080;
        }
        else if (this.system.tl == 11) {
          baseShots = 8640;
        }
        else if (this.system.tl == 12) {
          baseShots = 34560;
        }

        rb = 11
        e = 4
      }
      else if (this.system.laserDesign.beamType == "blaster") {
        lc = 3;
        bc = 2000;
        this.system.laserDesign.armourDivisor = 5;
        this.system.laserDesign.damageType = "tbb sur";

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 5;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 10;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 15;
        }

        if (this.system.tl <= 9) {
          baseShots = 34;
        }
        else if (this.system.tl == 10) {
          baseShots = 135;
        }
        else if (this.system.tl == 11) {
          baseShots = 1080;
        }
        else if (this.system.tl == 12) {
          baseShots = 4320;
        }

        rb = 32
        e = 3
      }
      else if (this.system.laserDesign.beamType == "neutralParticleBeam") {
        lc = 3;
        bc = 3000;
        this.system.laserDesign.armourDivisor = 1;
        this.system.laserDesign.damageType = "tbb rad sur";

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 5;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 10;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 15;
        }

        if (this.system.tl <= 9) {
          baseShots = 17;
        }
        else if (this.system.tl == 10) {
          baseShots = 68;
        }
        else if (this.system.tl == 11) {
          baseShots = 1080;
        }
        else if (this.system.tl == 12) {
          baseShots = 4320;
        }

        rb = 32
        e = 3
      }
      else if (this.system.laserDesign.beamType == "rainbowLaser") {
        lc = 3;
        bc = 500;
        this.system.laserDesign.armourDivisor = 3;
        this.system.laserDesign.damageType = "tbb";

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 6;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 12;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 18;
        }

        if (this.system.tl <= 9) {
          baseShots = 112;
        }
        else if (this.system.tl == 10) {
          baseShots = 450;
        }
        else if (this.system.tl == 11) {
          baseShots = 3600;
        }
        else if (this.system.tl == 12) {
          baseShots = 14400;
        }

        rb = 56
        e = 3
      }
      else if (this.system.laserDesign.beamType == "xRayLaser") {
        lc = 3;
        bc = 1000;

        if (this.system.laserDesign.pulseLaser){
          this.system.laserDesign.damageType = "cr ex";
          this.system.laserDesign.armourDivisor = 3;
        }
        else {
          this.system.laserDesign.damageType = "tbb";
          this.system.laserDesign.armourDivisor = 5;
        }

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 6;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 12;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 18;
        }

        if (this.system.tl <= 9) {
          baseShots = 112;
        }
        else if (this.system.tl == 10) {
          baseShots = 450;
        }
        else if (this.system.tl == 11) {
          baseShots = 3600;
        }
        else if (this.system.tl == 12) {
          baseShots = 14400;
        }

        rb = 2000
        e = 3
      }
      else if (this.system.laserDesign.beamType == "gravitonBeam") {
        lc = 3;
        bc = 2000;
        this.system.laserDesign.armourDivisor = "I";
        this.system.laserDesign.damageType = "cr";

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 6;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 12;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 18;
        }

        if (this.system.tl <= 9) {
          baseShots = 14;
        }
        else if (this.system.tl == 10) {
          baseShots = 56;
        }
        else if (this.system.tl == 11) {
          baseShots = 450;
        }
        else if (this.system.tl == 12) {
          baseShots = 1800;
        }

        rb = 100
        e = 1.5
      }
      else if (this.system.laserDesign.beamType == "pulsar") {
        lc = 2;
        bc = 3000;
        this.system.laserDesign.armourDivisor = 3;
        this.system.laserDesign.damageType = "cr ex rad sur";

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 5;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 10;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 15;
        }

        if (this.system.tl <= 9) {
          baseShots = 135;
        }
        else if (this.system.tl == 10) {
          baseShots = 540;
        }
        else if (this.system.tl == 11) {
          baseShots = 4320;
        }
        else if (this.system.tl == 12) {
          baseShots = 17280;
        }

        rb = 8
        e = 6
      }
      else if (this.system.laserDesign.beamType == "graser") {
        lc = 3;
        bc = 1500;

        if (this.system.laserDesign.pulseLaser){
          this.system.laserDesign.damageType = "cr ex";
          this.system.laserDesign.armourDivisor = 5;
        }
        else {
          this.system.laserDesign.damageType = "cr";
          this.system.laserDesign.armourDivisor = 10;
        }

        if (this.system.laserDesign.configuration == "pistol") {
          this.system.laserDesign.outputAcc = 6;
        }
        else if (this.system.laserDesign.configuration == "rifle") {
          this.system.laserDesign.outputAcc = 12;
        }
        else if (this.system.laserDesign.configuration == "beamer") {
          this.system.laserDesign.outputAcc = 3;
        }
        else if (this.system.laserDesign.configuration == "cannon") {
          this.system.laserDesign.outputAcc = 18;
        }

        if (this.system.tl <= 9) {
          baseShots = 28;
        }
        else if (this.system.tl == 10) {
          baseShots = 112;
        }
        else if (this.system.tl == 11) {
          baseShots = 450;
        }
        else if (this.system.tl == 12) {
          baseShots = 1880;
        }

        rb = 6000
        e = 3
      }

      this.system.laserDesign.outputAccWater = this.system.laserDesign.outputAcc;
      this.system.laserDesign.outputAccSpace = this.system.laserDesign.outputAcc;

      this.system.laserDesign.armourDivisorWater = this.system.laserDesign.armourDivisor;
      this.system.laserDesign.armourDivisorSpace = this.system.laserDesign.armourDivisor;

      if (this.system.laserDesign.beamType == "rainbowLaser") {
        this.system.laserDesign.armourDivisorSpace = 1;
      }

      // Weight modifier for focal array
      let f = 1;
      let focalArray = +this.system.laserDesign.focalArray;
      if (this.system.laserDesign.focalArray < 1.6) { // Below 1.6 the equation is a really annoying fourth order polynomial
        f = (-0.1422*(focalArray**4))+(1.0155*(focalArray**3))-(2.2582*(focalArray**2))+(2.377*focalArray)+0.0366;
      }
      else { // At and above 1.6 the giant polynomial breaks down and we use a linear equation
        f = (0.2 * focalArray) + 1.2;
      }
      f = Math.round(f * 100) / 100; // Round to the nearest two decimals

      // Weight modifier and rate of fire for generator
      let g = 1;
      let gc = 1;
      if (this.system.laserDesign.beamType == "chemicalLaser") { // Chemical lasers use light as the baseline for "g" and "gc"
        if (this.system.laserDesign.generator == "single") {
          gc = 0.5;
          g = 0.8;
          this.system.laserDesign.outputRoF = 1;
        }
        if (this.system.laserDesign.generator == "semi") {
          gc = 0.5;
          g = 1;
          this.system.laserDesign.outputRoF = 3;
        }
        if (this.system.laserDesign.generator == "light") {
          gc = 1;
          g = 1;
          this.system.laserDesign.outputRoF = 10;
        }
        else if (this.system.laserDesign.generator == "heavy") {
          gc = 1;
          g = 1.6;
          this.system.laserDesign.outputRoF = 20;
        }
        else if (this.system.laserDesign.generator == "lightGat") {
          gc = 1.25;
          g = 1.6;
          this.system.laserDesign.outputRoF = 10;
        }
        else if (this.system.laserDesign.generator == "heavyGat") {
          gc = 1.25;
          g = 1.6;
          this.system.laserDesign.outputRoF = 20;
        }
      }
      else {
        if (this.system.laserDesign.generator == "single") {
          gc = 1;
          g = 1;
          this.system.laserDesign.outputRoF = 1;
        }
        if (this.system.laserDesign.generator == "semi") {
          gc = 1;
          g = 1.25;
          this.system.laserDesign.outputRoF = 3;
        }
        if (this.system.laserDesign.generator == "light") {
          gc = 2;
          g = 1.25;
          this.system.laserDesign.outputRoF = 10;
        }
        else if (this.system.laserDesign.generator == "heavy") {
          gc = 2;
          g = 2;
          this.system.laserDesign.outputRoF = 20;
        }
        else if (this.system.laserDesign.generator == "lightGat") {
          gc = 2.5;
          g = 2;
          this.system.laserDesign.outputRoF = 10;
        }
        else if (this.system.laserDesign.generator == "heavyGat") {
          gc = 2.5;
          g = 2;
          this.system.laserDesign.outputRoF = 20;
        }
      }


      if (this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "bg") {
        this.system.laserDesign.outputRoF = Math.max(this.system.laserDesign.outputRoF / 2, 1);
      }

      // Rounding damage dice to dice and adds, per page 13 of Pyramid 37
      let dice = 0;
      let adds = 0;
      if (this.system.laserDesign.damageDice < 1) { // Dice is less than 1, use different rules than normal rounding.
        if (this.system.laserDesign.damageDice == 0) {
          dice = 0;
          adds = 0;
        }
        else if (this.system.laserDesign.damageDice <= 0.32) {
          dice = 1;
          adds = -5;
        }
        else if (this.system.laserDesign.damageDice <= 0.42) {
          dice = 1;
          adds = -4;
        }
        else if (this.system.laserDesign.damageDice <= 0.56) {
          dice = 1;
          adds = -3;
        }
        else if (this.system.laserDesign.damageDice <= 0.75) {
          dice = 1;
          adds = -2;
        }
        else if (this.system.laserDesign.damageDice <= 0.95) {
          dice = 1;
          adds = -1;
        }
        else {
          dice = 1;
          adds = 0;
        }
      }
      else {
        dice = parseInt(this.system.laserDesign.damageDice); // Get the number of dice without modifiers or decimals
        let remainder = +this.system.laserDesign.damageDice - +dice; // Get the remainder after above.

        // Use the remainder to figure out the adds
        if (remainder <= 0.14) {
          adds = 0;
        }
        else if (remainder <= 0.42) {
          adds = 1;
        }
        else if (remainder <= 0.64) {
          adds = 2;
        }
        else if (remainder <= 0.85) {
          dice += 1; // Add 1d-1
          adds = -1;
        }
        else {
          dice += 1; // Add a full die if it's greater than 0.85
          adds = 0;
        }
      }

      // Hotshots are allowed and this isn't a gatling weapon
      let hotshotDice = 0;
      let hotshotAdds = 0;
      if (this.system.laserDesign.hotshotsAndOverheating && !(this.system.laserDesign.generator == "lightGat" || this.system.laserDesign.generator == "heavyGat")) {
        this.system.laserDesign.hotshotDamageDice = this.system.laserDesign.damageDice * 1.3;
        if (this.system.laserDesign.hotshotDamageDice < 1) { // Dice is less than 1, use different rules than normal rounding.
          if (this.system.laserDesign.hotshotDamageDice == 0) {
            hotshotDice = 0;
            hotshotAdds = 0;
          }
          else if (this.system.laserDesign.hotshotDamageDice <= 0.32) {
            hotshotDice = 1;
            hotshotAdds = -5;
          }
          else if (this.system.laserDesign.hotshotDamageDice <= 0.42) {
            hotshotDice = 1;
            hotshotAdds = -4;
          }
          else if (this.system.laserDesign.hotshotDamageDice <= 0.56) {
            hotshotDice = 1;
            hotshotAdds = -3;
          }
          else if (this.system.laserDesign.hotshotDamageDice <= 0.75) {
            hotshotDice = 1;
            hotshotAdds = -2;
          }
          else if (this.system.laserDesign.hotshotDamageDice <= 0.95) {
            hotshotDice = 1;
            hotshotAdds = -1;
          }
          else {
            hotshotDice = 1;
            hotshotAdds = 0;
          }
        }
        else {
          hotshotDice = parseInt(this.system.laserDesign.hotshotDamageDice); // Get the number of dice without modifiers or decimals
          let remainder = +this.system.laserDesign.hotshotDamageDice - +hotshotDice; // Get the remainder after above.

          // Use the remainder to figure out the adds
          if (remainder <= 0.14) {
            hotshotAdds = 0;
          }
          else if (remainder <= 0.42) {
            hotshotAdds = 1;
          }
          else if (remainder <= 0.64) {
            hotshotAdds = 2;
          }
          else if (remainder <= 0.85) {
            hotshotDice += 1; // Add 1d-1
            hotshotAdds = -1;
          }
          else {
            hotshotDice += 1; // Add a full die if it's greater than 0.85
            hotshotAdds = 0;
          }
        }
      }

      // Calculate the damage
      let displayAdds = "";
      if (adds > 0) { // Adds is more than zero
        displayAdds = "+" + adds;
      }
      else if (adds < 0) { // Adds is less than zero
        displayAdds = "-" + Math.abs(adds);
      }
      let displayHotshotAdds = "";
      if (hotshotAdds > 0) { // Adds is more than zero
        displayHotshotAdds = "+" + hotshotAdds;
      }
      else if (adds < 0) { // Adds is less than zero
        displayHotshotAdds = "-" + Math.abs(hotshotAdds);
      }
      this.system.laserDesign.outputDamage = dice + "d6" + displayAdds;
      this.system.laserDesign.outputDamageHotshots = hotshotDice + "d6" + displayHotshotAdds;

      // Determine RF for the purposes of range calculation
      let rf = this.system.laserDesign.focalArray;
      if (rf > 1 && rf <= 1.75) {
        rf = rf * 1.33;
      }
      else if (rf >= 1.75) {
        rf = rf * 2;
      }

      // Calculate the ranges
      // 1/2D Range
      this.system.laserDesign.halfRange = this.system.laserDesign.damageDiceInput * this.system.laserDesign.damageDiceInput * rb * rf;

      if (this.system.laserDesign.pulseLaser) {
        this.system.laserDesign.halfRange = this.system.laserDesign.halfRange * 2;
      }

      if (parseInt(this.system.laserDesign.graviticFocus) > 0 && this.system.laserDesign.allowSuperScienceCustomLasers) {
        if (parseInt(this.system.laserDesign.graviticFocus) == 1) {
          this.system.laserDesign.halfRange = this.system.laserDesign.halfRange * 10;
        }
        else if (parseInt(this.system.laserDesign.graviticFocus) == 2) {
          this.system.laserDesign.halfRange = this.system.laserDesign.halfRange * 10 * 10;
        }
        else if (parseInt(this.system.laserDesign.graviticFocus) == 3) {
          this.system.laserDesign.halfRange = this.system.laserDesign.halfRange * 10 * 10 * 10;
        }
      }

      if ((this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "ir") || this.system.laserDesign.beamType == "chemicalLaser") {
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          if (this.system.laserDesign.halfRange >= 100) {
            this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          }
          else {
            this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange);
          }
        }
        else {
          this.system.laserDesign.halfRangeWater = 0;
        }

        if (this.system.laserDesign.halfRange >= 100) {
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange);
          this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange);
        }
      }
      else if (this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "bg") {
        this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange * 2 / 10) * 10;
        this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange * 2 / 10) * 10;
        this.system.laserDesign.halfRangeWater = Math.round(Math.min(this.system.laserDesign.halfRange * 2, 150/3) / 10) * 10;
      }
      else if (this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "uv") {
        this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange * 3 / 10) * 10;
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange * 3 / 10) * 10;
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange * 3 / 10) * 10;
        }
        else {
          this.system.laserDesign.halfRangeWater = 0;
          this.system.laserDesign.halfRange = Math.round(Math.min(this.system.laserDesign.halfRange * 3, 500/3) / 10) * 10;
        }
      }
      else if (this.system.laserDesign.beamType == "rainbowLaser") {
        this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10 / 10) * 10;
          this.system.laserDesign.halfRangeWater = 1;
        }
      }
      else if (this.system.laserDesign.beamType == "xRayLaser") {
        this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.system.laserDesign.halfRange = 7;
          this.system.laserDesign.halfRangeWater = 0;
        }
      }
      else if (this.system.laserDesign.beamType == "graser") {
        this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.system.laserDesign.halfRange = 70;
          this.system.laserDesign.halfRangeWater = 0;
        }
      }
      else if (this.system.laserDesign.beamType == "blaster") {
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.system.laserDesign.outputAccSpace = Math.ceil(this.system.laserDesign.outputAccSpace / 2);
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
          this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 5 / 10) * 10;
          this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        }
      }
      else if (this.system.laserDesign.beamType == "pulsar") {
        this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.system.laserDesign.halfRange = Math.min(Math.round(this.system.laserDesign.halfRange / 10) * 10, 333);
        }
      }
      else {
        this.system.laserDesign.halfRange = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        this.system.laserDesign.halfRangeSpace = Math.round(this.system.laserDesign.halfRange / 10) * 10;
        this.system.laserDesign.halfRangeWater = Math.round(this.system.laserDesign.halfRange / 10) * 10;
      }

      // Max Range
      if (this.system.laserDesign.beamType == "chemicalLaser") {
        this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRange * 3;
        }
        else {
          this.system.laserDesign.maxRangeWater = 1;
        }
      }
      else if (this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "ir") {
        this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRange * 3;
        }
        else {
          this.system.laserDesign.maxRangeWater = 1;
        }
      }
      else if (this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "bg") {
        this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
        this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRangeWater * 3;
      }
      else if (this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "uv") {
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        }
        else {
          this.system.laserDesign.maxRange = Math.min(this.system.laserDesign.halfRange * 3, 500);
        }
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
        this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRangeWater * 3;
      }
      else if (this.system.laserDesign.beamType == "rainbowLaser") {
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRange * 3;
        }
        else {
          this.system.laserDesign.maxRangeWater = 2;
        }
        this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
      }
      else if (this.system.laserDesign.beamType == "xRayLaser") {
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRangeWater * 3;
          this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        }
        else {
          this.system.laserDesign.maxRangeWater = 0;
          this.system.laserDesign.maxRange = 20;
        }
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
      }
      else if (this.system.laserDesign.beamType == "graser") {
        if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
          this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRangeWater * 3;
          this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        }
        else {
          this.system.laserDesign.maxRangeWater = 0;
          this.system.laserDesign.maxRange = 200;
        }
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
      }
      else if (this.system.laserDesign.beamType == "blaster") {
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
        this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRangeWater * 3;
        this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
      }
      else if (this.system.laserDesign.beamType == "pulsar") {
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
        this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRangeWater * 3;
        this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
        if (this.system.laserDesign.maxRange == 999) {
          this.system.laserDesign.maxRange = 1000;
        }
      }
      else {
        this.system.laserDesign.maxRangeSpace = this.system.laserDesign.halfRangeSpace * 3;
        this.system.laserDesign.maxRangeWater = this.system.laserDesign.halfRangeWater * 3;
        this.system.laserDesign.maxRange = this.system.laserDesign.halfRange * 3;
      }

      if (this.system.laserDesign.ftl && this.system.laserDesign.allowSuperScienceCustomLasers) {
        this.system.laserDesign.halfRange = this.system.laserDesign.maxRangeSpace;
        this.system.laserDesign.halfRangeSpace = this.system.laserDesign.maxRangeWater;
        this.system.laserDesign.halfRangeWater = this.system.laserDesign.maxRange;
      }

      this.system.laserDesign.outputRange = this.system.laserDesign.halfRange + " / " + this.system.laserDesign.maxRange;
      this.system.laserDesign.outputRangeWater = this.system.laserDesign.halfRangeWater + " / " + this.system.laserDesign.maxRangeWater;
      this.system.laserDesign.outputRangeSpace = this.system.laserDesign.halfRangeSpace + " / " + this.system.laserDesign.maxRangeSpace;

      // Shots
      let reloadTime = 3;
      if (this.system.laserDesign.beamType == "chemicalLaser") {
        let kw = ((this.system.laserDesign.damageDice * 1.84) ** 3); // The wattage of the laser
        this.system.laserDesign.powerCellWeight = (this.system.laserDesign.chemicalShots * kw ) / 160;
        this.system.laserDesign.powerCellQty = 1;
        this.system.laserDesign.chemicalCost = this.system.laserDesign.powerCellWeight * 20;
        this.system.laserDesign.powerCellWeight = Math.floor(this.system.laserDesign.powerCellWeight * 100) / 100;
      }
      else if (this.system.laserDesign.powerCell == "A") {
        baseShots = +baseShots * 0.01;
        this.system.laserDesign.powerCellWeight = 0.005;
      }
      else if (this.system.laserDesign.powerCell == "B") {
        baseShots = +baseShots * 0.1;
        this.system.laserDesign.powerCellWeight = 0.05;
      }
      else if (this.system.laserDesign.powerCell == "C") {
        baseShots = +baseShots * 1;
        this.system.laserDesign.powerCellWeight = 0.5;
      }
      else if (this.system.laserDesign.powerCell == "D") {
        baseShots = +baseShots * 10;
        reloadTime = 5;
        this.system.laserDesign.powerCellWeight = 5;
      }
      else if (this.system.laserDesign.powerCell == "E") {
        baseShots = +baseShots * 100;
        reloadTime = 5;
        this.system.laserDesign.powerCellWeight = 20;
      }
      else if (this.system.laserDesign.powerCell == "F") {
        baseShots = +baseShots * 1000;
        reloadTime = 5;
        this.system.laserDesign.powerCellWeight = 200;
      }

      if (this.system.laserDesign.superScienceCells) {
        baseShots = +baseShots * 5;
      }
      if (this.system.laserDesign.nonRechargeableCells) {
        baseShots = +baseShots * 2;
      }

      if (this.system.laserDesign.beamType == "chemicalLaser") {
        reloadTime = 3;
        this.system.laserDesign.shots = Math.floor(this.system.laserDesign.chemicalShots)
      }
      else {
        reloadTime = reloadTime * this.system.laserDesign.powerCellQty;
        baseShots = +baseShots * this.system.laserDesign.powerCellQty;
        this.system.laserDesign.shots = Math.floor(+baseShots / this.system.laserDesign.damageDiceInput ** 3);
      }

      if (this.system.laserDesign.beamType == "laser" && this.system.laserDesign.laserColour == "bg") {
        this.system.laserDesign.shots = this.system.laserDesign.shots / 2;
      }

      this.system.laserDesign.outputShots = this.system.laserDesign.shots + " (" + reloadTime + ")";
      this.system.laserDesign.outputShotsHotshots = (this.system.laserDesign.shots/2) + " (" + reloadTime + ")";

      // Calculate empty weight
      this.system.laserDesign.emptyWeight = ((+this.system.laserDesign.damageDiceInput * s / e)**3 * f * g) * +this.system.laserDesign.weightTweak;

      // Calculate the loaded weight
      this.system.laserDesign.loadedWeight = (Math.round(((Math.round(this.system.laserDesign.emptyWeight * 100) / 100) + (this.system.laserDesign.powerCellQty * this.system.laserDesign.powerCellWeight)) * 100) / 100);

      this.system.weight = this.system.laserDesign.loadedWeight
      this.system.ttlWeight = this.system.weight * this.system.quantity;

      // Calculate the output weight
      if (this.system.laserDesign.beamType == "chemicalLaser") {
        this.system.laserDesign.outputWeight = this.system.laserDesign.loadedWeight + "/" + this.system.laserDesign.powerCellWeight;
      }
      else {
        this.system.laserDesign.outputWeight = this.system.laserDesign.loadedWeight + "/" + this.system.laserDesign.powerCellQty + this.system.laserDesign.powerCell;
      }

      // Calculate ST and Bulk
      if (this.system.laserDesign.configuration == "pistol") {
        this.system.laserDesign.outputST = Math.round(Math.sqrt(this.system.laserDesign.loadedWeight) * 3.3);
        this.system.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.system.laserDesign.loadedWeight) * 1.25, 1),10) * -1;
      }
      else if (this.system.laserDesign.configuration == "beamer") {
        this.system.laserDesign.outputST = Math.round(Math.sqrt(this.system.laserDesign.loadedWeight) * 3.3);
        this.system.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.system.laserDesign.loadedWeight), 0),10) * -1;
      }
      else if (this.system.laserDesign.configuration == "cannon") {
        this.system.laserDesign.outputST = Math.round(Math.sqrt(this.system.laserDesign.loadedWeight) * 2.4) + "M";
        this.system.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.system.laserDesign.loadedWeight) * 1.5, 6),10) * -1;
      }
      else if (this.system.laserDesign.configuration == "rifle") {
        this.system.laserDesign.outputST = Math.round(Math.sqrt(this.system.laserDesign.loadedWeight) * 2.2) + "†";
        this.system.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.system.laserDesign.loadedWeight) * 1.5, 3),10) * -1;
      }
      this.system.laserDesign.outputBulk = Math.round(this.system.laserDesign.outputBulk)

      this.system.laserDesign.outputRcl = 1;

      this.system.cost = (Math.round(this.system.laserDesign.emptyWeight * bc * gc * 100) / 100);

      let cf = 1
      if (this.system.laserDesign.beamType == "blaster" && this.system.laserDesign.omniBlaster) {
        cf += 1;
      }
      if (this.system.laserDesign.fieldJacketed && this.system.laserDesign.allowSuperScienceCustomLasers) {
        cf += 1;
      }
      if (parseInt(this.system.laserDesign.graviticFocus) > 0){
        if (parseInt(this.system.laserDesign.graviticFocus) == 1) {
          cf += 1
        }
        else if (parseInt(this.system.laserDesign.graviticFocus) == 2) {
          cf += 3
        }
        else if (parseInt(this.system.laserDesign.graviticFocus) == 3) {
          cf += 7
        }
      }
      if (this.system.laserDesign.pulseBeamLaser && this.system.laserDesign.pulseLaser) {
        cf += 1
      }

      this.system.cost = this.system.cost * cf;

      this.system.ttlCost = this.system.cost * this.system.quantity;

      // Calculate LC
      if (this.system.laserDesign.loadedWeight >= 15) {
        lc -= 2;
      }
      else if (this.system.laserDesign.loadedWeight >= 5) {
        lc -= 1;
      }

      this.system.lc = lc;

      // Done building the custom laser

      this.addCustomLaserProfiles() // Call the method that takes the profiles the user has selected and add them to the profiles for the weapon
    }
  }

  addCustomLaserProfiles() {
    if (this.system.laserDesign.meleeProfile) { // If the user wants to include a melee profile
      this.addMeleeProfile(this.system.laserDesign.outputBulk, this.system.laserDesign.cavalierWeapon, this.system.laserDesign.configuration, this.system.laserDesign.meleeSkill, this.system.laserDesign.meleeSkillMod, this.system.laserDesign.outputST) // Include one
    }

    let rangedProfiles = [];
    // For each ranged profile, check if the box is checked and add the ranged profile accordingly.
    if (this.system.laserDesign.showAir) {
      let showAir = {
        "name": "Air",
        "skill": this.system.laserDesign.rangedSkill,
        "skillMod": this.system.laserDesign.rangedSkillMod,
        "acc": this.system.laserDesign.outputAcc,
        "damageInput": this.system.laserDesign.outputDamage,
        "damageType": this.system.laserDesign.damageType,
        "armourDivisor": this.system.laserDesign.armourDivisor,
        "range": this.system.laserDesign.halfRange + " " + this.system.laserDesign.maxRange,
        "rof": this.system.laserDesign.outputRoF,
        "shots": this.system.laserDesign.shots,
        "bulk": this.system.laserDesign.bulk,
        "rcl": this.system.laserDesign.rcl,
        "st": this.system.laserDesign.st,
        "malf": 17
      }

      rangedProfiles.push(showAir);
    }
    if (this.system.laserDesign.showSpace) {
      let showSpace = {
        "name": "Space",
        "skill": this.system.laserDesign.rangedSkill,
        "skillMod": this.system.laserDesign.rangedSkillMod,
        "acc": this.system.laserDesign.outputAccSpace,
        "damageInput": this.system.laserDesign.outputDamage,
        "damageType": this.system.laserDesign.damageType,
        "armourDivisor": this.system.laserDesign.armourDivisorSpace,
        "range": this.system.laserDesign.halfRangeSpace + " " + this.system.laserDesign.maxRangeSpace,
        "rof": this.system.laserDesign.outputRoF,
        "shots": this.system.laserDesign.shots,
        "bulk": this.system.laserDesign.bulk,
        "rcl": this.system.laserDesign.rcl,
        "st": this.system.laserDesign.st,
        "malf": 17
      }

      rangedProfiles.push(showSpace);
    }
    if (this.system.laserDesign.showWater) {
      let showWater = {
        "name": "Water",
        "skill": this.system.laserDesign.rangedSkill,
        "skillMod": this.system.laserDesign.rangedSkillMod,
        "acc": this.system.laserDesign.outputAccWater,
        "damageInput": this.system.laserDesign.outputDamage,
        "damageType": this.system.laserDesign.damageType,
        "armourDivisor": this.system.laserDesign.armourDivisorWater,
        "range": this.system.laserDesign.halfRangeWater + " " + this.system.laserDesign.maxRangeWater,
        "rof": this.system.laserDesign.outputRoF,
        "shots": this.system.laserDesign.shots / 2,
        "bulk": this.system.laserDesign.bulk,
        "rcl": this.system.laserDesign.rcl,
        "st": this.system.laserDesign.st,
        "malf": 17
      }

      rangedProfiles.push(showWater);
    }
    if (this.system.laserDesign.showAirHotshot && this.system.hotshotsAndOverheating && !(this.system.configuration.toLowerCase().includes("gat"))) { // The user wants to show hotshots, hotshots are allowed, and this isn't a gatling weapon
      let showAirHotshot = {
        "name": "Hotshot Air",
        "skill": this.system.laserDesign.rangedSkill,
        "skillMod": this.system.laserDesign.rangedSkillMod,
        "acc": this.system.laserDesign.outputAcc,
        "damageInput": this.system.laserDesign.outputDamageHotshots,
        "damageType": this.system.laserDesign.damageType,
        "armourDivisor": this.system.laserDesign.armourDivisor,
        "range": this.system.laserDesign.halfRange + " " + this.system.laserDesign.maxRange,
        "rof": this.system.laserDesign.outputRoF,
        "shots": this.system.laserDesign.shots / 2,
        "bulk": this.system.laserDesign.bulk,
        "rcl": this.system.laserDesign.rcl,
        "st": this.system.laserDesign.st,
        "malf": 14
      }

      rangedProfiles.push(showAirHotshot);
    }
    if (this.system.laserDesign.showSpaceHotshot && this.system.hotshotsAndOverheating && !(this.system.configuration.toLowerCase().includes("gat"))) { // The user wants to show hotshots, hotshots are allowed, and this isn't a gatling weapon
      let showSpaceHotshot = {
        "name": "Space Hotshot",
        "skill": this.system.laserDesign.rangedSkill,
        "skillMod": this.system.laserDesign.rangedSkillMod,
        "acc": this.system.laserDesign.outputAccSpace,
        "damageInput": this.system.laserDesign.outputDamageHotshots,
        "damageType": this.system.laserDesign.damageType,
        "armourDivisor": this.system.laserDesign.armourDivisorSpace,
        "range": this.system.laserDesign.halfRangeSpace + " " + this.system.laserDesign.maxRangeSpace,
        "rof": this.system.laserDesign.outputRoF,
        "shots": this.system.laserDesign.shots / 2,
        "bulk": this.system.laserDesign.bulk,
        "rcl": this.system.laserDesign.rcl,
        "st": this.system.laserDesign.st,
        "malf": 14
      }

      rangedProfiles.push(showSpaceHotshot);
    }
    if (this.system.laserDesign.showWaterHotshot && this.system.hotshotsAndOverheating && !(this.system.configuration.toLowerCase().includes("gat"))) { // The user wants to show hotshots, hotshots are allowed, and this isn't a gatling weapon
      let showWaterHotshot = {
        "name": "Water Hotshot",
        "skill": this.system.laserDesign.rangedSkill,
        "skillMod": this.system.laserDesign.rangedSkillMod,
        "acc": this.system.laserDesign.outputAccWater,
        "damageInput": this.system.laserDesign.outputDamageHotshots,
        "damageType": this.system.laserDesign.damageType,
        "armourDivisor": this.system.laserDesign.armourDivisorWater,
        "range": this.system.laserDesign.halfRangeWater + " " + this.system.laserDesign.maxRangeWater,
        "rof": this.system.laserDesign.outputRoF,
        "shots": this.system.laserDesign.shots / 2,
        "bulk": this.system.laserDesign.bulk,
        "rcl": this.system.laserDesign.rcl,
        "st": this.system.laserDesign.st,
        "malf": 14
      }

      rangedProfiles.push(showWaterHotshot);
    }
    this.system.ranged = rangedProfiles;
  }

  addMeleeProfile(bulk, cavalier, config, meleeSkill, meleeSkillMod, ST) {
    let damageMod = Math.abs(Math.round(bulk))-1;
    let damage = "";

    if (cavalier) {
      damage = "sw+1";
    }
    else {
      if (damageMod > 0) { // damageMod is positive
        damage = "thr+" + Math.abs(damageMod)
      }
      else if (damageMod < 0) { // damageMod is negative
        damage = "thr-" + Math.abs(damageMod)
      }
      else { // damageMod is zero
        damage = "thr"
      }
    }

    let newRow = { // Init the new melee row using the values from the custom weapon
      "name": (config == "pistol" || config == "beamer") ? "Pistol Whip" : "Butt Stroke",
      "skill": meleeSkill,
      "skillMod": meleeSkillMod,
      "parryMod": 0,
      "parryType": "",
      "blockMod": "No",
      "damageInput": damage,
      "damageType": "cr",
      "armourDivisor": 1,
      "reach": "C",
      "st": Math.round(ST),
    };

    this.system.melee = [newRow];
  }

  prepareCustomBow(type) {
    if (typeof this.system.bowDesign == "undefined") { // If the bowDesign block hasn't yet been created
      this.system.bowDesign = { // Create it
        "type": type, // bow/footbow/xbow
        "magicalMaterials": false,
        "superScienceMaterials": false,
        "compoundBowStrictTL": false,
        "cinematic": false,
        "riser": false, // Some inputs are only available for crossbows and bows with risers. This lets those options show up for bows and footbows.
        "compound": false,
        "compoundLoops": 1,
        "drawWeight": 40, // This is BL for an ST character
        "userST": 10,
        "userSTFromActor": false,
        "userBL": 0,
        "totalBowLength": 30, // In inches
        "workingPercentage": 100,
        "targetDrawLength": 22,
        "maxDrawLength": 0,
        "drawLength": 0,
        "workingMaterialOne": {"name": "Horn"},
        "workingMaterialTwo": {"name": "Sinew"},
        "workingMaterialOneEssential": false,
        "workingMaterialTwoEssential": false,
        "bowConstruction": "straight", // Straight/Recurve/Reflex/Compound
        "quality": "good", // cheap/good/fine
        "riserMaterialOne": {"name": "Wood - White Pine"},
        "riserMaterialTwo": {"name": "Wood - White Pine"},
        "riserMaterialOneEssential": false,
        "riserMaterialTwoEssential": false,
        "riserThickness": 1,
        "allowedRiserDeflection": 0.07,
        "stockMaterialOne": {"name": "Wood - Red Pine"},
        "stockMaterialTwo": {"name": "Wood - Red Pine"},
        "stockMaterialOneEssential": false,
        "stockMaterialTwoEssential": false,
        "stockThickness": 1,
        "allowedStockDeflection": 0.07,
        "riserWidth": 1,
        "stockWidth": 1,
        "xbowSupportLength": 0,
        "fixedBonusStrongbow": true,
        "strongBowCrossbowFinesse": false,
        "strongBowCrossbowFinesseEffect": 0,
        "strongBowCrossbowFinesseFromActor": true,
        "shape": "d", // Round/Rectangular or D-Section
        "crossSection": 1.6,
        "limbThickness": 0.5,
        "limbMinThickness": 0,
        "deflection": 0,
        "stockLength": 0,
        "skill": "",
        "skillMod": 0,
        "realisticBowScale": false,
        "loops": 1,
        "arrows": [],
        "showProfile": false,
      }
    }

    if (typeof this.system.bowDesign.workingMaterialOne == "undefined") { // If the material block hasn't yet been created
      this.system.bowDesign.workingMaterialOne = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "Horn",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.system.bowDesign.workingMaterialTwo == "undefined") { // If the material block hasn't yet been created
      this.system.bowDesign.workingMaterialTwo = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "Sinew",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.system.bowDesign.workingMaterialAvg == "undefined") { // If the material block hasn't yet been created
      this.system.bowDesign.workingMaterialAvg = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.system.bowDesign.riserMaterialOne == "undefined") { // If the material block hasn't yet been created
      this.system.bowDesign.riserMaterialOne = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "Wood - White Pine",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.system.bowDesign.riserMaterialTwo == "undefined") { // If the material block hasn't yet been created
      this.system.bowDesign.riserMaterialTwo = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "Wood - White Pine",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.system.bowDesign.stockMaterialOne == "undefined") { // If the material block hasn't yet been created
      this.system.bowDesign.stockMaterialOne = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "Wood - Red Pine",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.system.bowDesign.stockMaterialTwo == "undefined") { // If the material block hasn't yet been created
      this.system.bowDesign.stockMaterialTwo = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "Wood - Red Pine",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    // Validations
    // Working percentage must be between 0 and 100
    if (this.system.bowDesign.workingPercentage > 100) {
      this.system.bowDesign.workingPercentage = 100;
    }
    else if (this.system.bowDesign.workingPercentage < 0){
      this.system.bowDesign.workingPercentage = 0;
    }

    // Stock length must be zero or more
    if(typeof this.system.bowDesign.stockLength === "undefined" || this.system.bowDesign.stockLength < 0) {
      this.system.bowDesign.stockLength = 0;
    }

    // Cross section must not be zero or negative
    if (!(this.system.bowDesign.crossSection > 0)) {
      this.system.bowDesign.crossSection = 1;
    }

    if (this.system.bowDesign.workingPercentage < 100) { // If working percent is not 100 then there must be a riser.
      this.system.bowDesign.riser = true;
    }

    if (this.system.bowDesign.bowConstruction == "compound") { // It's a compound bow
      this.system.bowDesign.loops = Math.max(this.system.bowDesign.loops, 1); // There must be at least 1 loop
    }
    else { // It's not a compound bow
      this.system.bowDesign.loops = 1; // Bows that are not compound bows have a single loop
    }

    if (this.system.bowDesign.totalBowLength <= 0) { // Total bow length must be greater than zero, otherwise it doesn't exist.
      this.system.bowDesign.totalBowLength = 1;
    }

    // Get game settings
    this.system.bowDesign.magicalMaterials         = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");
    this.system.bowDesign.compoundBowStrictTL      = game.settings.get("gurps4e", "compoundBowStrictTL");
    this.system.bowDesign.fixedBonusStrongbow      = game.settings.get("gurps4e", "fixedBonusStrongbow");
    this.system.bowDesign.realisticBowScale        = game.settings.get("gurps4e", "realisticBowScale");

    // Get materials
    this.system.bowDesign.materials = game.materialAPI.fetchBowMaterials();

    // Do actual code stuff
    this.system.bowDesign.type = type;

    this.system.bowDesign.userSTFromActor = false; // Reset whether we're getting the ST from the actor.
    this.system.bowDesign.strongBowCrossbowFinesseFromActor = false; // Reset whether we're getting the perk from the user.
    if (this.actor) { // If there's an actor
      if (this.actor.system) {
        let smDiscount = attributeHelpers.calcSMDiscount(this.actor.system.bio.sm);
        let st = attributeHelpers.calcStOrHt(this.actor.system.primaryAttributes.strength, smDiscount);
        let lifting = attributeHelpers.calcLiftingSt(st, this.actor.system.primaryAttributes.lifting, smDiscount)

        this.system.bowDesign.userST = lifting; // Get lifting ST from the user
        this.system.bowDesign.userSTFromActor = true; // Flag that we're getting the ST from the user

        for (let i = 0; i < this.actor.items._source.length; i++) { // Loop through the list of the actor's items
          if (this.actor.items._source[i].type === "Trait") { // Make sure it's a trait
            if ((this.actor.items._source[i].name.toLowerCase() == "strongbow" || // Check if they have strongbow
                this.actor.items._source[i].name.toLowerCase() == "strong bow") &&
                (this.system.bowDesign.type == "bow" || this.system.bowDesign.type == "footbow")) { // And make sure this is a bow
              this.system.bowDesign.strongBowCrossbowFinesseFromActor = true; // Flag that the perk is coming from the actor.
              this.system.bowDesign.strongBowCrossbowFinesse = true; // Set the status of the perk
            }
            else if ((this.actor.items._source[i].name.toLowerCase() == "crossbow finesse") && (this.system.bowDesign.type == "xbow")) {
              this.system.bowDesign.strongBowCrossbowFinesseFromActor = true; // Flag that the perk is coming from the actor.
              this.system.bowDesign.strongBowCrossbowFinesse = true; // Set the status of the perk
            }
          }
        }
      }
    }

    if (this.system.bowDesign.strongBowCrossbowFinesse) { // If the perk is set
      if (this.actor) { // If there's an actor we will need to fetch the finesse effect from the sheet
        if (this.actor.system) {
          let skillLevel = 0;
          let attrLevel = 0;
          let relativeBonus = 0;
          for (let i = 0; i < this.actor.items._source.length; i++) { // Loop through the list of the actor's items
            if (this.actor.items._source[i].type === "Rollable") { // Make sure it's a skill
              if (this.actor.items._source[i].name.toLowerCase() == this.system.bowDesign.skill.toLowerCase()) { // And make sure it matches the skill name they've given
                skillLevel = skillHelpers.computeSkillLevel(this.actor, this.actor.items._source[i].system); // Get the skill level.
                attrLevel = skillHelpers.getBaseAttrValue(this.actor.items._source[i].system.baseAttr, this.actor); // Get the attribute level
                relativeBonus = skillLevel - attrLevel;
                relativeBonus = Math.max(relativeBonus, 0); // Make the bonus at least zero.
                relativeBonus = Math.min(relativeBonus, 2); // Make the bonus no more than two
                this.system.bowDesign.strongBowCrossbowFinesseEffect = relativeBonus;
              }
            }
          }
        }
      }

      if (this.system.bowDesign.fixedBonusStrongbow) { // If we're using the fixed bonus
        this.system.bowDesign.userBL = (this.system.bowDesign.userST * this.system.bowDesign.userST)/5; // Basic Lift
        this.system.bowDesign.userBL = this.system.bowDesign.userBL * (1 + (0.15 * this.system.bowDesign.strongBowCrossbowFinesseEffect)) // Basic lift plus the perk's bonus
      }
      else { // If it's not
        this.system.bowDesign.userBL = ((this.system.bowDesign.userST+this.system.bowDesign.strongBowCrossbowFinesseEffect) * (this.system.bowDesign.userST+this.system.bowDesign.strongBowCrossbowFinesseEffect))/5
      }
    }
    else { // If the perk is not set at all
      this.system.bowDesign.userBL = ((this.system.bowDesign.userST) * (this.system.bowDesign.userST))/5
    }

    // Fetch the materials
    this.system.bowDesign.workingMaterialOne = game.materialAPI.getBowMaterialByName(this.system.bowDesign.workingMaterialOne.name);
    this.system.bowDesign.workingMaterialTwo = game.materialAPI.getBowMaterialByName(this.system.bowDesign.workingMaterialTwo.name);
    this.system.bowDesign.riserMaterialOne   = game.materialAPI.getBowMaterialByName(this.system.bowDesign.riserMaterialOne.name);
    this.system.bowDesign.riserMaterialTwo   = game.materialAPI.getBowMaterialByName(this.system.bowDesign.riserMaterialTwo.name);
    this.system.bowDesign.stockMaterialOne   = game.materialAPI.getBowMaterialByName(this.system.bowDesign.stockMaterialOne.name);
    this.system.bowDesign.stockMaterialTwo   = game.materialAPI.getBowMaterialByName(this.system.bowDesign.stockMaterialTwo.name);

    if (this.system.bowDesign.workingMaterialOneEssential) {
      this.system.bowDesign.workingMaterialOne = game.materialAPI.essentializeBowMaterial(this.system.bowDesign.workingMaterialOne);
    }

    if (this.system.bowDesign.workingMaterialTwoEssential) {
      this.system.bowDesign.workingMaterialTwo = game.materialAPI.essentializeBowMaterial(this.system.bowDesign.workingMaterialTwo);
    }

    if (this.system.bowDesign.riserMaterialOneEssential) {
      this.system.bowDesign.riserMaterialOne = game.materialAPI.essentializeBowMaterial(this.system.bowDesign.riserMaterialOne);
    }

    if (this.system.bowDesign.riserMaterialTwoEssential) {
      this.system.bowDesign.riserMaterialTwo = game.materialAPI.essentializeBowMaterial(this.system.bowDesign.riserMaterialTwo);
    }

    if (this.system.bowDesign.stockMaterialOneEssential) {
      this.system.bowDesign.stockMaterialOne = game.materialAPI.essentializeBowMaterial(this.system.bowDesign.stockMaterialOne);
    }

    if (this.system.bowDesign.stockMaterialTwoEssential) {
      this.system.bowDesign.stockMaterialTwo = game.materialAPI.essentializeBowMaterial(this.system.bowDesign.stockMaterialTwo);
    }

    // Calculate the inferred values
    if (typeof this.system.bowDesign.workingMaterialOne != "undefined") {
      this.system.bowDesign.workingMaterialOne.maxStrain      = this.system.bowDesign.workingMaterialOne.tensileStPsi  / this.system.bowDesign.workingMaterialOne.elasticModulusPsi;
      this.system.bowDesign.workingMaterialOne.bowCostPerLb   = Math.round(this.system.bowDesign.workingMaterialOne.tensileStPsi ** 2 / 100 / this.system.bowDesign.workingMaterialOne.elasticModulusPsi / this.system.bowDesign.workingMaterialOne.densityLbsCuIn*100)/100;
      this.system.bowDesign.workingMaterialOne.arrowCostPerLb = Math.round(this.system.bowDesign.workingMaterialOne.elasticModulusPsi / this.system.bowDesign.workingMaterialOne.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.system.bowDesign.workingMaterialTwo != "undefined") {
      this.system.bowDesign.workingMaterialTwo.maxStrain      = this.system.bowDesign.workingMaterialTwo.tensileStPsi  / this.system.bowDesign.workingMaterialTwo.elasticModulusPsi;
      this.system.bowDesign.workingMaterialTwo.bowCostPerLb   = Math.round(this.system.bowDesign.workingMaterialTwo.tensileStPsi ** 2 / 100 / this.system.bowDesign.workingMaterialTwo.elasticModulusPsi / this.system.bowDesign.workingMaterialTwo.densityLbsCuIn*100)/100;
      this.system.bowDesign.workingMaterialTwo.arrowCostPerLb = Math.round(this.system.bowDesign.workingMaterialTwo.elasticModulusPsi / this.system.bowDesign.workingMaterialTwo.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.system.bowDesign.riserMaterialOne != "undefined") {
      this.system.bowDesign.riserMaterialOne.maxStrain      = this.system.bowDesign.riserMaterialOne.tensileStPsi    / this.system.bowDesign.riserMaterialOne.elasticModulusPsi;
      this.system.bowDesign.riserMaterialOne.bowCostPerLb   = Math.round(this.system.bowDesign.riserMaterialOne.tensileStPsi   ** 2 / 100 / this.system.bowDesign.riserMaterialOne.elasticModulusPsi   / this.system.bowDesign.riserMaterialOne.densityLbsCuIn*100)/100;
      this.system.bowDesign.riserMaterialOne.arrowCostPerLb = Math.round(this.system.bowDesign.riserMaterialOne.elasticModulusPsi / this.system.bowDesign.riserMaterialOne.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.system.bowDesign.riserMaterialTwo != "undefined") {
      this.system.bowDesign.riserMaterialTwo.maxStrain      = this.system.bowDesign.riserMaterialTwo.tensileStPsi    / this.system.bowDesign.riserMaterialTwo.elasticModulusPsi;
      this.system.bowDesign.riserMaterialTwo.bowCostPerLb   = Math.round(this.system.bowDesign.riserMaterialTwo.tensileStPsi   ** 2 / 100 / this.system.bowDesign.riserMaterialTwo.elasticModulusPsi   / this.system.bowDesign.riserMaterialTwo.densityLbsCuIn*100)/100;
      this.system.bowDesign.riserMaterialTwo.arrowCostPerLb = Math.round(this.system.bowDesign.riserMaterialTwo.elasticModulusPsi / this.system.bowDesign.riserMaterialTwo.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.system.bowDesign.stockMaterialOne != "undefined") {
      this.system.bowDesign.stockMaterialOne.maxStrain      = this.system.bowDesign.stockMaterialOne.tensileStPsi    / this.system.bowDesign.stockMaterialOne.elasticModulusPsi;
      this.system.bowDesign.stockMaterialOne.bowCostPerLb   = Math.round(this.system.bowDesign.stockMaterialOne.tensileStPsi   ** 2 / 100 / this.system.bowDesign.stockMaterialOne.elasticModulusPsi   / this.system.bowDesign.stockMaterialOne.densityLbsCuIn*100)/100;
      this.system.bowDesign.stockMaterialOne.arrowCostPerLb = Math.round(this.system.bowDesign.stockMaterialOne.elasticModulusPsi / this.system.bowDesign.stockMaterialOne.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.system.bowDesign.stockMaterialTwo != "undefined") {
      this.system.bowDesign.stockMaterialTwo.maxStrain      = this.system.bowDesign.stockMaterialTwo.tensileStPsi    / this.system.bowDesign.stockMaterialTwo.elasticModulusPsi;
      this.system.bowDesign.stockMaterialTwo.bowCostPerLb   = Math.round(this.system.bowDesign.stockMaterialTwo.tensileStPsi   ** 2 / 100 / this.system.bowDesign.stockMaterialTwo.elasticModulusPsi   / this.system.bowDesign.stockMaterialTwo.densityLbsCuIn*100)/100;
      this.system.bowDesign.stockMaterialTwo.arrowCostPerLb = Math.round(this.system.bowDesign.stockMaterialTwo.elasticModulusPsi / this.system.bowDesign.stockMaterialTwo.densityLbsCuIn*1.25/9000000*100)/100;
    }

    // Put together the average values
    if (typeof this.system.bowDesign.workingMaterialOne != "undefined" && typeof this.system.bowDesign.workingMaterialTwo != "undefined") {
      this.system.bowDesign.workingMaterialAvg = { // Create it
        "a"                 : (this.system.bowDesign.workingMaterialOne.a + this.system.bowDesign.workingMaterialTwo.a)/2,
        "densityLbsCuIn"    : (this.system.bowDesign.workingMaterialOne.densityLbsCuIn + this.system.bowDesign.workingMaterialTwo.densityLbsCuIn)/2,
        "elasticModulusPsi" : (this.system.bowDesign.workingMaterialOne.elasticModulusPsi + this.system.bowDesign.workingMaterialTwo.elasticModulusPsi)/2,
        "tensileStPsi"      : (this.system.bowDesign.workingMaterialOne.tensileStPsi + this.system.bowDesign.workingMaterialTwo.tensileStPsi)/2,
        "tl"                : Math.max(this.system.bowDesign.workingMaterialOne.tl + this.system.bowDesign.workingMaterialTwo.tl),
        "maxStrain"         : (this.system.bowDesign.workingMaterialOne.maxStrain + this.system.bowDesign.workingMaterialTwo.maxStrain)/2,
        "bowCostPerLb"      : (this.system.bowDesign.workingMaterialOne.bowCostPerLb + this.system.bowDesign.workingMaterialTwo.bowCostPerLb)/2,
        "arrowCostPerLb"    : (this.system.bowDesign.workingMaterialOne.arrowCostPerLb + this.system.bowDesign.workingMaterialTwo.arrowCostPerLb)/2,
      }
    }
    if (typeof this.system.bowDesign.riserMaterialOne != "undefined" && typeof this.system.bowDesign.riserMaterialTwo != "undefined") {
      this.system.bowDesign.riserMaterialAvg = { // Create it
        "a": (this.system.bowDesign.riserMaterialOne.a + this.system.bowDesign.riserMaterialTwo.a) / 2,
        "densityLbsCuIn": (this.system.bowDesign.riserMaterialOne.densityLbsCuIn + this.system.bowDesign.riserMaterialTwo.densityLbsCuIn) / 2,
        "elasticModulusPsi": (this.system.bowDesign.riserMaterialOne.elasticModulusPsi + this.system.bowDesign.riserMaterialTwo.elasticModulusPsi) / 2,
        "tensileStPsi": (this.system.bowDesign.riserMaterialOne.tensileStPsi + this.system.bowDesign.riserMaterialTwo.tensileStPsi) / 2,
        "tl": Math.max(this.system.bowDesign.riserMaterialOne.tl + this.system.bowDesign.riserMaterialTwo.tl),
        "maxStrain": (this.system.bowDesign.riserMaterialOne.maxStrain + this.system.bowDesign.riserMaterialTwo.maxStrain) / 2,
        "bowCostPerLb": ((this.system.bowDesign.riserMaterialOne.bowCostPerLb + this.system.bowDesign.riserMaterialTwo.bowCostPerLb) / 2) / 5,
        "arrowCostPerLb": (this.system.bowDesign.riserMaterialOne.arrowCostPerLb + this.system.bowDesign.riserMaterialTwo.arrowCostPerLb) / 2,
      }
    }
    if (typeof this.system.bowDesign.stockMaterialOne !== "undefined" && typeof this.system.bowDesign.stockMaterialTwo !== "undefined") {
      this.system.bowDesign.stockMaterialAvg = { // Create it
        "a": (this.system.bowDesign.stockMaterialOne.a + this.system.bowDesign.stockMaterialTwo.a) / 2,
        "densityLbsCuIn": (this.system.bowDesign.stockMaterialOne.densityLbsCuIn + this.system.bowDesign.stockMaterialTwo.densityLbsCuIn) / 2,
        "elasticModulusPsi": (this.system.bowDesign.stockMaterialOne.elasticModulusPsi + this.system.bowDesign.stockMaterialTwo.elasticModulusPsi) / 2,
        "tensileStPsi": (this.system.bowDesign.stockMaterialOne.tensileStPsi + this.system.bowDesign.stockMaterialTwo.tensileStPsi) / 2,
        "tl": Math.max(this.system.bowDesign.stockMaterialOne.tl + this.system.bowDesign.stockMaterialTwo.tl),
        "maxStrain": (this.system.bowDesign.stockMaterialOne.maxStrain + this.system.bowDesign.stockMaterialTwo.maxStrain) / 2,
        "bowCostPerLb": ((this.system.bowDesign.stockMaterialOne.bowCostPerLb + this.system.bowDesign.stockMaterialTwo.bowCostPerLb) / 2) / 10,
        "arrowCostPerLb": (this.system.bowDesign.stockMaterialOne.arrowCostPerLb + this.system.bowDesign.stockMaterialTwo.arrowCostPerLb) / 2,
      }
    }

    // Do all the math shit

    // Calc k factor
    let k = 0;
    if (this.system.bowDesign.shape == "round") { // Bow is round
      k = 64/Math.PI;
    }
    else { // Bow is D-section
      k = 12 / this.system.bowDesign.crossSection;
    }

    // Get constructionFactor based on bowConstruction
    let constructionFactor = 0;
    if (this.system.bowDesign.bowConstruction == "straight") {
      constructionFactor = 1;
    }
    else if (this.system.bowDesign.bowConstruction == "recurve") {
      constructionFactor = 1.3;
    }
    else if (this.system.bowDesign.bowConstruction == "reflex") {
      constructionFactor = 1.6;
    }
    else if (this.system.bowDesign.bowConstruction == "compound") {
      constructionFactor = 1;
    }

    // Begin minimum thickness calc
    this.system.bowDesign.limbMinThickness = ((k * this.system.bowDesign.drawWeight * (this.system.bowDesign.totalBowLength * (this.system.bowDesign.workingPercentage / 100)) * constructionFactor)/(8 * this.system.bowDesign.workingMaterialAvg.tensileStPsi)) ** (1/3);
    this.system.bowDesign.limbMinThickness = Math.round(this.system.bowDesign.limbMinThickness * 10000) / 10000;

    // Begin Deflection calc
    let delta = ((k * this.system.bowDesign.drawWeight * (this.system.bowDesign.totalBowLength * (this.system.bowDesign.workingPercentage / 100)) ** 3) / (32 * this.system.bowDesign.workingMaterialAvg.elasticModulusPsi * this.system.bowDesign.limbThickness ** 4));

    this.system.bowDesign.deflection = delta / (this.system.bowDesign.totalBowLength * (this.system.bowDesign.workingPercentage / 100))

    // Begin max draw length calc
    let r = this.system.bowDesign.totalBowLength * (1 - (this.system.bowDesign.workingPercentage/100));
    let l = this.system.bowDesign.totalBowLength * (this.system.bowDesign.workingPercentage/100);

    // theta calculation is a bitch.
    let theta = (141.99 * this.system.bowDesign.deflection ** 4) - (51.892 * this.system.bowDesign.deflection ** 3) + (9.4364 * this.system.bowDesign.deflection ** 2) + (7.5125 * this.system.bowDesign.deflection) + 0.0047;

    // Calc working string length
    let s = this.system.bowDesign.loops * this.system.bowDesign.totalBowLength - ((this.system.bowDesign.loops - 1) * (r + (2 * l * Math.sin(theta/2)) / theta));

    let rDiv2 = (r == 0) ? 0 : r / 2; // r divided by 2, but if r is 0, result is 0

    // Calculate max draw
    this.system.bowDesign.maxDrawLength = delta + Math.sqrt((s ** 2)/4 - (rDiv2 + (l * Math.sin(theta/2))/theta) ** 2);

    // Cap draw at max draw
    this.system.bowDesign.drawLength = Math.min(this.system.bowDesign.maxDrawLength, this.system.bowDesign.targetDrawLength);

    // Calculate the thickness of the stock and riser
    this.system.bowDesign.riserThickness = 0;
    this.system.bowDesign.stockThickness = 0;
    let riserWeight = 0;
    let stockWeight = 0;
    if (this.system.bowDesign.riser && typeof this.system.bowDesign.riserMaterialAvg != "undefined") { // It has a riser and the material is defined
      this.system.bowDesign.riserThickness = ((this.system.bowDesign.drawWeight * r ** 2) / (4 * this.system.bowDesign.riserMaterialAvg.elasticModulusPsi * this.system.bowDesign.riserWidth * this.system.bowDesign.allowedRiserDeflection * 100)) ** (1/3);
      riserWeight = this.system.bowDesign.riserMaterialAvg.densityLbsCuIn * this.system.bowDesign.riserWidth * this.system.bowDesign.riserThickness * r;
    }
    if (this.system.bowDesign.type == "xbow" && typeof this.system.bowDesign.stockMaterialAvg != "undefined"){ // It has a stock and the material is defined
      this.system.bowDesign.stockThickness = (this.system.bowDesign.drawWeight * this.system.bowDesign.drawLength ** 2 / 4 / this.system.bowDesign.stockMaterialAvg.elasticModulusPsi / this.system.bowDesign.stockWidth / this.system.bowDesign.allowedStockDeflection * 100) ** (1/3);
      stockWeight = this.system.bowDesign.stockMaterialAvg.densityLbsCuIn * this.system.bowDesign.stockWidth * this.system.bowDesign.stockThickness * this.system.bowDesign.stockLength;
    }

    // Calculate bow weight
    let c = 0.785
    if (this.system.bowDesign.shape == "d") {
      c = this.system.bowDesign.crossSection;
    }

    let limbsWeight = (this.system.bowDesign.workingMaterialAvg.densityLbsCuIn * l * this.system.bowDesign.limbMinThickness ** 2 * c)
    this.system.weight = limbsWeight + riserWeight + stockWeight;

    // Calculate Stored Energy
    let z = 0.057;
    if (this.system.bowDesign.bowConstruction == "straight") {
      z = 0.057;
    }
    else if (this.system.bowDesign.bowConstruction == "recurve") {
      z = 0.065;
    }
    else if (this.system.bowDesign.bowConstruction == "reflex") {
      z = 0.073;
    }
    else if (this.system.bowDesign.bowConstruction == "compound") {
      z = 0.090;
    }

    // Calculate Bow Energy
    let potentialEnergy = this.system.bowDesign.drawWeight * this.system.bowDesign.drawLength * z; // Potential energy in joules.
    let workingMass = 37 * this.system.bowDesign.workingMaterialAvg.densityLbsCuIn * this.system.bowDesign.limbMinThickness ** 2 * Math.sqrt(this.system.bowDesign.crossSection / l);

    // Bow Bulk
    this.system.bowDesign.bulk = Math.round(9 - 9 * Math.log10(l + r + this.system.bowDesign.stockLength));

    if (this.system.bowDesign.type == "bow") {
      this.system.bowDesign.st = Math.ceil(Math.sqrt(this.system.bowDesign.drawWeight*2));
    }
    else {
      this.system.bowDesign.st = Math.ceil(Math.sqrt(5/8 * this.system.bowDesign.drawWeight));
    }

    // Calculate Arrow Stuff
    if (typeof this.system.bowDesign.arrows != "undefined") {
      let arrowKeys = Object.keys(this.system.bowDesign.arrows); // Get the arrow keys
      if (arrowKeys.length > 0) { // If there are actually keys
        for (let i = 0; i < arrowKeys.length; i++){
          let accFactor = 0
          if (this.system.bowDesign.type === "footbow") {
            accFactor = -1
          }
          else if (this.system.bowDesign.type === "xbow") {
            accFactor = 1
          }

          if (typeof this.system.bowDesign.arrows[arrowKeys[i]].material.name != "undefined") {
            this.system.bowDesign.arrows[arrowKeys[i]].material = game.materialAPI.getBowMaterialByName(this.system.bowDesign.arrows[arrowKeys[i]].material.name);

            if (this.system.bowDesign.arrows[arrowKeys[i]].materialEssential) {
              this.system.bowDesign.arrows[arrowKeys[i]].material = game.materialAPI.essentializeBowMaterial(this.system.bowDesign.arrows[arrowKeys[i]].material);
            }
          }

          if (this.system.bowDesign.arrows[arrowKeys[i]].length >= this.system.bowDesign.drawLength) {
            this.system.bowDesign.arrows[arrowKeys[i]].validShaft = false;
          }
          else {
            this.system.bowDesign.arrows[arrowKeys[i]].validShaft = true;
          }

          if (typeof this.system.bowDesign.arrows[arrowKeys[i]].material != "undefined") {
            this.system.bowDesign.arrows[arrowKeys[i]].material.maxStrain         = this.system.bowDesign.arrows[arrowKeys[i]].material.tensileStPsi    / this.system.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi;
            this.system.bowDesign.arrows[arrowKeys[i]].material.bowCostPerLb      = Math.round(this.system.bowDesign.arrows[arrowKeys[i]].material.tensileStPsi   ** 2 / 100 / this.system.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi   / this.system.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn*100)/100;
            this.system.bowDesign.arrows[arrowKeys[i]].material.arrowCostPerLb    = Math.round(this.system.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi / this.system.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn*1.25/9000000*100)/100;

            let a = 1.25 * Math.exp(-0.0000000054 * this.system.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi / this.system.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn);
            this.system.bowDesign.arrows[arrowKeys[i]].minOuterDiameter = 2 * (this.system.bowDesign.drawWeight * this.system.bowDesign.arrows[arrowKeys[i]].length / this.system.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi / a) ** (1/4)
            let shaftWeight = Math.PI/4 * ( this.system.bowDesign.arrows[arrowKeys[i]].outerDiameter ** 2 - this.system.bowDesign.arrows[arrowKeys[i]].innerDiameter ** 2 ) * this.system.bowDesign.arrows[arrowKeys[i]].length * this.system.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn;
            this.system.bowDesign.arrows[arrowKeys[i]].weight = shaftWeight + this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.weight;

            let arrowCF = 1;
            if (this.system.bowDesign.arrows[arrowKeys[i]].quality == "fine") {
              accFactor += 1
              arrowCF = 3;
            }
            else if (this.system.bowDesign.arrows[arrowKeys[i]].quality == "cheap") {
              accFactor -= 1
              arrowCF = 0.7;
            }
            else {
              arrowCF = 1;
            }

            if (game.settings.get("gurps4e", "simpleEssentialMaterials")) { // If the game is using simple essential materials
              if (this.system.bowDesign.arrows[arrowKeys[i]].materialEssential) { // And the arrow is essential
                // Simple essential arrows are no better so they don't automatically cost more as an arrow.
                arrowCF += 29; // So apply the appropriate cost modifier
              }
            }

            let shaftCost = (this.system.bowDesign.arrows[arrowKeys[i]].material.arrowCostPerLb * shaftWeight)

            if (this.system.bowDesign.arrows[arrowKeys[i]].material.tl > 4 && this.system.bowDesign.arrows[arrowKeys[i]].innerDiameter > 0) { // Material is synthetic and the arrow is hollow.
              shaftCost = shaftCost * (arrowCF + 4);
            }

            // Calculate arrowhead cost
            let arrowHeadCost = 50 * this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.weight;
            // Apply AD CF
            if (this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.ad == "0.5") {
              arrowHeadCost = arrowHeadCost * 0.8;
            }
            else if (this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.ad == "2") {
              arrowHeadCost = arrowHeadCost * 4;
            }

            // Apply Damage type CF
            if (this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType == "cut") {
              arrowHeadCost = arrowHeadCost * 0.9;
            }
            else if (this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType == "pi") {
              arrowHeadCost = arrowHeadCost * 0.8;
            }
            else if (this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType == "cr") {
              arrowHeadCost = arrowHeadCost * 0.7;
            }

            this.system.bowDesign.arrows[arrowKeys[i]].cost = (arrowHeadCost * arrowCF) + shaftCost;

            let efficiency = 1 / (1 + workingMass/this.system.bowDesign.arrows[arrowKeys[i]].weight);
            let kineticEnergy = efficiency * potentialEnergy;

            if (this.system.bowDesign.realisticBowScale) {
              this.system.bowDesign.arrows[arrowKeys[i]].damagePoints = Math.sqrt(kineticEnergy) / 2.5;
            }
            else {
              this.system.bowDesign.arrows[arrowKeys[i]].damagePoints = Math.sqrt(kineticEnergy) / 1.75;
            }

            let dice = Math.floor(this.system.bowDesign.arrows[arrowKeys[i]].damagePoints / 3.5);
            let adds = Math.floor(this.system.bowDesign.arrows[arrowKeys[i]].damagePoints - (dice * 3.5));

            this.system.bowDesign.arrows[arrowKeys[i]].dice = dice + "d6 + " + adds;

            this.system.bowDesign.arrows[arrowKeys[i]].damagePoints = Math.round(this.system.bowDesign.arrows[arrowKeys[i]].damagePoints * 100) / 100;
            this.system.bowDesign.arrows[arrowKeys[i]].minOuterDiameter = Math.round(this.system.bowDesign.arrows[arrowKeys[i]].minOuterDiameter * 1000) / 1000;
            this.system.bowDesign.arrows[arrowKeys[i]].weight = Math.round(this.system.bowDesign.arrows[arrowKeys[i]].weight * 1000) / 1000;
            this.system.bowDesign.arrows[arrowKeys[i]].cost = Math.round(this.system.bowDesign.arrows[arrowKeys[i]].cost * 100) / 100;

            this.system.bowDesign.arrows[arrowKeys[i]].range = Math.floor(0.34 * kineticEnergy / this.system.bowDesign.arrows[arrowKeys[i]].weight);
            this.system.bowDesign.arrows[arrowKeys[i]].halfRange = Math.min(this.system.bowDesign.arrows[arrowKeys[i]].range, Math.floor(750 * this.system.bowDesign.arrows[arrowKeys[i]].weight/this.system.bowDesign.arrows[arrowKeys[i]].outerDiameter ** 2));

            let v = Math.sqrt(5.28 * kineticEnergy / this.system.bowDesign.arrows[arrowKeys[i]].weight)

            this.system.bowDesign.arrows[arrowKeys[i]].acc = Math.max(0, Math.min(4,  Math.round(3 * Math.log10(v) - this.system.bowDesign.bulk/2 - 7.5 + accFactor)));
          }
        }
      }
    }

    if (typeof this.system.bowDesign.workingMaterialAvg != "undefined" && typeof this.system.bowDesign.riserMaterialAvg != "undefined" && typeof this.system.bowDesign.stockMaterialAvg != "undefined") {
      this.system.cost = limbsWeight * this.system.bowDesign.workingMaterialAvg.bowCostPerLb + riserWeight * this.system.bowDesign.riserMaterialAvg.bowCostPerLb + stockWeight * this.system.bowDesign.stockMaterialAvg.bowCostPerLb

      if (this.system.bowDesign.quality == "fine") {
        this.system.cost = this.system.cost * 4;
      }
      else if (this.system.bowDesign.quality == "cheap") {
        this.system.cost = this.system.cost * 0.7;
      }

      if (this.system.bowDesign.bowConstruction == "recurve") {
        this.system.cost = this.system.cost * 1.25;
      }
      else if (this.system.bowDesign.bowConstruction == "reflex") {
        this.system.cost = this.system.cost * 1.5;
      }
      else if (this.system.bowDesign.bowConstruction == "compound") {
        this.system.cost = this.system.cost * 2;
      }
    }
    else {
      this.system.cost = 0;
    }

    if (typeof this.system.bowDesign.arrows != "undefined") {
      this.addCustomBowProfiles()
    }

    // Only round things prior to display after all the actual math is done.
    this.system.bowDesign.maxDrawLength = Math.round(this.system.bowDesign.maxDrawLength * 100) / 100;
    this.system.bowDesign.deflection = Math.round(this.system.bowDesign.deflection * 1000) / 1000 * 100;
    this.system.bowDesign.stockThickness = Math.round(this.system.bowDesign.stockThickness * 100) / 100;
    this.system.bowDesign.riserThickness = Math.round(this.system.bowDesign.riserThickness * 100) / 100;
    this.system.weight = Math.round(this.system.weight * 100000) / 100000;
    this.system.ttlWeight = this.system.weight * this.system.quantity;
    this.system.cost = Math.round(this.system.cost * 100) / 100;
    this.system.ttlCost = this.system.cost * this.system.quantity;
  }

  addCustomBowProfiles() {
    // Calculate Arrow Stuff
    let arrowKeys = Object.keys(this.system.bowDesign.arrows); // Get the arrow keys
    if (arrowKeys.length > 0) { // If there are actually keys
      let rangedProfiles = [];
      for (let i = 0; i < arrowKeys.length; i++) {
        if (this.system.bowDesign.arrows[arrowKeys[i]].showProfile) {
          let profile = {
            "name": this.system.bowDesign.arrows[arrowKeys[i]].name,
            "skill": this.system.bowDesign.skill,
            "skillMod": this.system.bowDesign.skillMod,
            "acc": this.system.bowDesign.arrows[arrowKeys[i]].acc,
            "damageInput": this.system.bowDesign.arrows[arrowKeys[i]].dice,
            "damageType": this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType,
            "armourDivisor": this.system.bowDesign.arrows[arrowKeys[i]].arrowhead.ad,
            "range": this.system.bowDesign.arrows[arrowKeys[i]].halfRange + "/" + this.system.bowDesign.arrows[arrowKeys[i]].range,
            "rof": "1",
            "shots": "1",
            "bulk": this.system.bowDesign.bulk,
            "rcl": "2",
            "st": this.system.bowDesign.st,
            "malf": 17
          }
          rangedProfiles.push(profile);
        }
      }

      this.system.ranged = rangedProfiles;
    }
  }

  addCustomFirearmProfiles() {
    // Calculate Ammo Stuff
    let ammoKeys = Object.keys(this.system.firearmDesign.ammunition); // Get the ammo keys
    if (ammoKeys.length > 0) { // If there are actually keys
      let rangedProfiles = [];
      for (let i = 0; i < ammoKeys.length; i++) {
        if (this.system.firearmDesign.ammunition[ammoKeys[i]].showProfile) {

          let rof = ""
          let shots = parseInt((this.system.firearmDesign.rof * this.system.firearmDesign.barrels));
          let pellets = parseInt(this.system.firearmDesign.ammunition[ammoKeys[i]].projectiles);

          if (pellets > 1) {
            rof = shots + "x" + pellets;
          }
          else {
            rof = shots;
          }

          let skillMod = this.system.firearmDesign.rangedSkillMod
          if (this.system.firearmDesign.fitToOwner) {
            skillMod += 1;
          }

          let profile = {
            "name": this.system.firearmDesign.ammunition[ammoKeys[i]].name,
            "skill": this.system.firearmDesign.rangedSkill,
            "skillMod": skillMod,
            "acc": this.system.firearmDesign.ammunition[ammoKeys[i]].acc,
            "damageInput": this.system.firearmDesign.ammunition[ammoKeys[i]].damageDice,
            "damageType": this.system.firearmDesign.ammunition[ammoKeys[i]].woundModOut,
            "armourDivisor": this.system.firearmDesign.ammunition[ammoKeys[i]].ad,
            "range": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange),
            "rof": rof,
            "shots": this.system.firearmDesign.shots,
            "bulk": Math.round(this.system.firearmDesign.bulk),
            "rcl": this.system.firearmDesign.ammunition[ammoKeys[i]].rcl,
            "lc": this.system.firearmDesign.ammunition[ammoKeys[i]].lc,
            "st": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].st),
            "malf": this.system.firearmDesign.ammunition[ammoKeys[i]].malf,
            "cps": this.system.firearmDesign.ammunition[ammoKeys[i]].cps,
            "wps": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].wps * 100) / 100
          }
          rangedProfiles.push(profile);

          if (this.system.firearmDesign.ammunition[ammoKeys[i]].explosivePercent > 0) {
            let followUpExplosion = {
              "name": this.system.firearmDesign.ammunition[ammoKeys[i]].name + " - Explosion",
              "skill": this.system.firearmDesign.rangedSkill,
              "skillMod": skillMod,
              "acc": this.system.firearmDesign.ammunition[ammoKeys[i]].acc,
              "damageInput": this.system.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageDice,
              "damageType": "cr ex",
              "armourDivisor": 1,
              "range": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange),
              "rof": rof,
              "shots": this.system.firearmDesign.shots,
              "bulk": Math.round(this.system.firearmDesign.bulk),
              "rcl": this.system.firearmDesign.ammunition[ammoKeys[i]].rcl,
              "lc": this.system.firearmDesign.ammunition[ammoKeys[i]].lc,
              "st": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].st),
              "malf": this.system.firearmDesign.ammunition[ammoKeys[i]].malf,
              "cps": Math.round((this.system.firearmDesign.ammunition[ammoKeys[i]].cps * this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF) * 100) / 100,
              "wps": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].wps * 100) / 100
            }
            rangedProfiles.push(followUpExplosion);
          }

          if (this.system.firearmDesign.ammunition[ammoKeys[i]].frag) {
            let followUpFrag = {
              "name": this.system.firearmDesign.ammunition[ammoKeys[i]].name + " - Fragments",
              "skill": this.system.firearmDesign.rangedSkill,
              "skillMod": skillMod,
              "acc": this.system.firearmDesign.ammunition[ammoKeys[i]].acc,
              "damageInput": this.system.firearmDesign.ammunition[ammoKeys[i]].fragDamageDice,
              "damageType": "cut",
              "armourDivisor": 1,
              "range": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].maxRange),
              "rof": rof,
              "shots": this.system.firearmDesign.shots,
              "bulk": Math.round(this.system.firearmDesign.bulk),
              "rcl": this.system.firearmDesign.ammunition[ammoKeys[i]].rcl,
              "lc": this.system.firearmDesign.ammunition[ammoKeys[i]].lc,
              "st": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].st),
              "malf": this.system.firearmDesign.ammunition[ammoKeys[i]].malf,
              "cps": Math.round((this.system.firearmDesign.ammunition[ammoKeys[i]].cps * this.system.firearmDesign.ammunition[ammoKeys[i]].cpsCF) * 100) / 100,
              "wps": Math.round(this.system.firearmDesign.ammunition[ammoKeys[i]].wps * 100) / 100
            }
            rangedProfiles.push(followUpFrag);
          }
        }
      }

      this.system.ranged = rangedProfiles;
    }
  }

  prepareAttackData() {
    //Check to see if there is an actor yet
    if (this.actor){
      if (this.actor.system) {
        let damage;
        //Do logic stuff for melee profiles
        if (this.system.melee) {
          let meleeKeys = Object.keys(this.system.melee);
          if (meleeKeys.length) {//Check to see if there are any melee profiles
            for (let k = 0; k < meleeKeys.length; k++) {
              if (this.system.melee[meleeKeys[k]].name) {//Check to see if name is filled in. Otherwise don't bother.
                let level = 0;
                let mod = +this.system.melee[meleeKeys[k]].skillMod;
                let parry = 0;
                let block = 0;

                if (this.system.melee[meleeKeys[k]].skill.toLowerCase() == "dx") {
                  level = attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.dexterity);
                }
                else if (this.system.melee[meleeKeys[k]].skill.toLowerCase() == "iq") {
                  level = attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.intelligence);
                }
                else {
                  //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.items.contents.length; i++) {
                    if (this.actor.items.contents[i].type === "Rollable") {
                      if (this.system.melee[meleeKeys[k]].skill === this.actor.items.contents[i].name) {
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.items.contents[i].system);
                      }
                    }
                    else if (this.actor.items.contents[i].type === "Ritual") {
                      if (this.system.melee[meleeKeys[k]].skill === this.actor.items.contents[i].name) {
                        level = this.actor.items.contents[i].system.level + +this.system.melee[meleeKeys[k]].skillMod;
                      }
                    }
                  }
                }

                level = level + mod; // Update the skill level with the skill modifier
                this.system.melee[meleeKeys[k]].level = level // Update skill level

                if (Number.isInteger(+this.system.melee[meleeKeys[k]].parryMod)) {//If parry mod is a number, compute normally
                  parry = Math.floor(+(level / 2 + 3) + +this.system.melee[meleeKeys[k]].parryMod);//Calculate the parry value
                  if (this.actor.system.enhanced.parry) {
                    parry += this.actor.system.enhanced.parry;
                  }
                  if (this.actor.system.flag.combatReflexes) {
                    parry += 1;
                  }
                } else {//If it's not a number, display the entry
                  parry = this.system.melee[meleeKeys[k]].parryMod;
                }
                this.system.melee[meleeKeys[k]].parry = parry //Update parry value

                if (Number.isInteger(+this.system.melee[meleeKeys[k]].blockMod)) {//If block mod is a number, compute normally
                  block = Math.floor(+(level / 2 + 3) + +this.system.melee[meleeKeys[k]].blockMod);//Calculate the block value
                  if (this.actor.system.enhanced.block) {
                    block += this.actor.system.enhanced.block;
                  }
                  if (this.actor.system.flag.combatReflexes) {
                    block += 1;
                  }
                } else {
                  block = this.system.melee[meleeKeys[k]].blockMod;
                }
                damage = this.damageParseSwThr(this.system.melee[meleeKeys[k]].damageInput);//Update damage value
                this.system.melee[meleeKeys[k]].block = block; // Update block value
                this.system.melee[meleeKeys[k]].type = "melee"; // Update attack type
                this.system.melee[meleeKeys[k]].damage = damage;

                // Validation for Armour Divisor
                if (!(this.system.melee[meleeKeys[k]].armourDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.system.melee[meleeKeys[k]].armourDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.system.melee[meleeKeys[k]].armourDivisor.toString().toLowerCase().includes("i") ||
                    this.system.melee[meleeKeys[k]].armourDivisor >= 0)
                ) {
                  this.system.melee[meleeKeys[k]].armourDivisor = 1;
                }
              }
            }
          }
        }

        // Do logic stuff for ranged profiles
        if (this.system.ranged) {
          let rangedKeys = Object.keys(this.system.ranged);
          if (rangedKeys.length) {//Check to see if there are any ranged profiles
            for (let k = 0; k < rangedKeys.length; k++) {
              if (this.system.ranged[rangedKeys[k]].name) {//Check to see if name is filled in
                let level = 0;
                let mod = +this.system.ranged[rangedKeys[k]].skillMod;

                if (this.system.ranged[rangedKeys[k]].skill.toLowerCase() == "dx") {
                  level = attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.dexterity);
                }
                else {
                  //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.items.contents.length; i++) {
                    if (this.actor.items.contents[i].type === "Rollable") {
                      if (this.system.ranged[rangedKeys[k]].skill === this.actor.items.contents[i].name) {
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.items.contents[i].system);
                      }
                    }
                    else if (this.actor.items.contents[i].type === "Ritual") {
                      if (this.system.ranged[rangedKeys[k]].skill === this.actor.items.contents[i].name) {
                        level = this.actor.items.contents[i].system.level + +this.system.ranged[rangedKeys[k]].skillMod;
                      }
                    }
                  }
                }
                level = level + mod;//Update the skill level with the skill modifier
                this.system.ranged[rangedKeys[k]].level = level;
                this.system.ranged[rangedKeys[k]].type = "ranged"; // Update attack type
                damage = this.damageParseSwThr(this.system.ranged[rangedKeys[k]].damageInput);
                this.system.ranged[rangedKeys[k]].damage = damage;

                if (typeof this.system.ranged[rangedKeys[k]].rcl == "undefined" || this.system.ranged[rangedKeys[k]].rcl <= 0) { // Catch invalid values for rcl. Value must exist and be at least one.
                  this.system.ranged[rangedKeys[k]].rcl = 1;
                }
                if (typeof this.system.ranged[rangedKeys[k]].rof == "undefined" || this.system.ranged[rangedKeys[k]].rof <= 0) { // Catch invalid values for rof. Value must exist and be at least one.
                  this.system.ranged[rangedKeys[k]].rof = 1;
                }
                if (typeof this.system.ranged[rangedKeys[k]].acc == "undefined" || this.system.ranged[rangedKeys[k]].acc < 0) { // Catch invalid values for Acc. Value must exist and be at least zero.
                  this.system.ranged[rangedKeys[k]].acc = 0;
                }

                // Validation for bulk
                if (typeof this.system.ranged[rangedKeys[k]].bulk == "undefined" || this.system.ranged[rangedKeys[k]].bulk == "") { // Must exist.
                  this.system.ranged[rangedKeys[k]].bulk = -2;
                } else if (this.system.ranged[rangedKeys[k]].bulk > 0) { // Must be less than zero. Set positive values to negative equivilent
                  this.system.ranged[rangedKeys[k]].bulk = -this.system.ranged[rangedKeys[k]].bulk;
                }

                // Validation for Armour Divisor
                if (!(this.system.ranged[rangedKeys[k]].armourDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.system.ranged[rangedKeys[k]].armourDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.system.ranged[rangedKeys[k]].armourDivisor.toString().toLowerCase().includes("i") ||
                    this.system.ranged[rangedKeys[k]].armourDivisor >= 0)
                ) {
                  this.system.ranged[rangedKeys[k]].armourDivisor = 1;
                }
              }
            }
          }
        }

        if (this.system.affliction) {
          let afflictionKeys = Object.keys(this.system.affliction);
          if (afflictionKeys.length) { // Check to see if there are any affliction profiles
            for (let k = 0; k < afflictionKeys.length; k++) {
              if (this.system.affliction[afflictionKeys[k]].name) { // Check to see if name is filled in. Otherwise don't bother.
                damage = this.damageParseSwThr(this.system.affliction[afflictionKeys[k]].damageInput); // Update damage value

                this.system.affliction[afflictionKeys[k]].level = 0; // Default to zero just in case we don't come up with a value
                if (this.system.type == "Spell") {
                  this.system.affliction[afflictionKeys[k]].level = this.system.level;
                }
                else if (this.system.affliction[afflictionKeys[k]].skill.toLowerCase() == "dx") {
                  this.system.affliction[afflictionKeys[k]].level = +attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.dexterity) + +this.system.affliction[afflictionKeys[k]].skillMod;
                }
                else if (this.system.affliction[afflictionKeys[k]].skill.toLowerCase() == "iq") {
                  this.system.affliction[afflictionKeys[k]].level = +attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.intelligence) + +this.system.affliction[afflictionKeys[k]].skillMod;
                }
                else {
                  // Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.items.contents.length; i++) {
                    if (this.actor.items.contents[i].type === "Rollable") {
                      if (this.system.affliction[afflictionKeys[k]].skill === this.actor.items.contents[i].name) {
                        this.system.affliction[afflictionKeys[k]].level = +skillHelpers.computeSkillLevel(this.actor, this.actor.items.contents[i].system) + +this.system.affliction[afflictionKeys[k]].skillMod;
                      }
                    }
                    else if (this.actor.items.contents[i].type === "Ritual") {
                      if (this.system.affliction[afflictionKeys[k]].skill === this.actor.items.contents[i].name) {
                        this.system.affliction[afflictionKeys[k]].level = this.actor.items.contents[i].system.level + +this.system.affliction[afflictionKeys[k]].skillMod;
                      }
                    }
                  }
                }

                this.system.affliction[afflictionKeys[k]].type = "affliction"; // Update attack type
                this.system.affliction[afflictionKeys[k]].damage = damage;

                // Validation for Armour Divisor
                if (!(this.system.affliction[afflictionKeys[k]].armourDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.system.affliction[afflictionKeys[k]].armourDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.system.affliction[afflictionKeys[k]].armourDivisor.toString().toLowerCase().includes("i") ||
                    this.system.affliction[afflictionKeys[k]].armourDivisor >= 0)
                ) {
                  this.system.affliction[afflictionKeys[k]].armourDivisor = 1;
                }
              }
            }
          }
        }
      }
    }
  }

  damageParseSwThr(damage){
    let smDiscount = attributeHelpers.calcSMDiscount(this.actor.system.bio.sm)
    let st = attributeHelpers.calcStOrHt(this.actor.system.primaryAttributes.strength, smDiscount)
    let sst = attributeHelpers.calcStrikingSt(st, this.actor.system.primaryAttributes.striking, smDiscount);
    let thr = attributeHelpers.strikingStrengthToThrust(sst);//Get thrust damage
    let sw = attributeHelpers.strikingStrengthToSwing(sst);//Get swing damage

    if (typeof damage == "undefined" || damage == null){
      damage = "0";
    }
    damage = damage.toLowerCase();//Fix any case specific issues
    damage = damage.replace("thr", thr);//Replace thrust
    damage = damage.replace("sw", sw)//Replace swing

    return damage;
  }

  getBaseAttrValue(baseAttr) {
    let base = 0;
    if (baseAttr.toUpperCase() == 'ST' || baseAttr.toUpperCase() == 'STRENGTH'){
      let smDiscount = attributeHelpers.calcSMDiscount(this.actor.system.bio.sm)
      base = attributeHelpers.calcStOrHt(this.actor.system.primaryAttributes.strength, smDiscount);
    }
    else if (baseAttr.toUpperCase() == 'DX' || baseAttr.toUpperCase() == 'DEXTERITY') {
      base = attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.dexterity);
    }
    else if (baseAttr.toUpperCase() == 'IQ' || baseAttr.toUpperCase() == 'INTELLIGENCE') {
      base = attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.intelligence);
    }
    else if (baseAttr.toUpperCase() == 'HT' || baseAttr.toUpperCase() == 'HEALTH') {
      base = attributeHelpers.calcStOrHt(this.actor.system.primaryAttributes.health, 1);
    }
    else if (baseAttr.toUpperCase() == 'PER' || baseAttr.toUpperCase() == 'PERCEPTION') {
      base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.intelligence), this.actor.system.primaryAttributes.perception);
    }
    else if (baseAttr.toUpperCase() == 'WILL') {
      base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(this.actor.system.primaryAttributes.intelligence), this.actor.system.primaryAttributes.will);
    }
    return base;
  }

  _prepareSpellData() {
    if (this.actor) {
      if (this.actor.system) {
        if (this.actor.system.magic) {

          // Calculate the total magical attribute
          let totalMagicAttribute = 0;
          let points = this.system.points;
          let mod = this.system.mod;
          let attributeMod = this.actor.system.magic.attributeMod;
          let difficulty = this.system.difficulty;
          let magery = this.actor.system.magic.magery;
          let attribute = this.actor.system.magic.attribute;

          let level = skillHelpers.computeSpellLevel(this.actor, points, mod, attributeMod, difficulty, magery, attribute)

          if (attribute != "") { // Attribute is not blank
            totalMagicAttribute += this.getBaseAttrValue(attribute)
          }

          totalMagicAttribute += attributeMod ? attributeMod : 0;
          totalMagicAttribute += magery ? magery : 0;
          this.system.magicalAbility = totalMagicAttribute;

          this.system.level = level;
        }
      }
    }
  }

  _prepareRollableData() {
    if (this.system.category == ""){//The category will be blank upon initialization. Set it to skill so that the form's dynamic elements display correctly the first time it's opened.
      this.system.category = "skill";
    }

    if(this.system && this.actor){
      let level = skillHelpers.computeSkillLevel(this.actor, this.system);

      this.system.level = level;
    }
  }

  _prepareTraitData() {}

  showInfo(id) {
    let info = "";
    if (id === "laser-configuration") {
      info = "<table>" +
          "<tr>" +
          "<td style='width: 50px; padding-right: 10px;'>Pistol</td>" +
          "<td><p>It's a pistol. Acc is lower, Bulk is lower, and ST is higher compared to a rifle of equal weight.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td style='width: 50px; padding-right: 10px;'>Beamer</td>" +
          "<td><p>Like a TNG phaser. It's the bare minimum laser weapon. Acc is as low as it gets for a laser, but so is Bulk. ST is the same for an equivalent pistol.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td style='width: 50px; padding-right: 10px;'>Rifle</td>" +
          "<td><p>It's a rifle. Acc is higher, but so is Bulk. ST is lower compared to a pistol or beamer of equivalent weight but the weapon requires two hands.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td style='width: 50px; padding-right: 10px;'>Cannon</td>" +
          "<td><p>Like a beamer, this is a weapon with the bare minimum, but built to fit into a turret or weapon mount. Acc is as high as it gets. Bulk isn't any worse than a rifle, but the weapon must be in a mount to use effectively.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "beam-type") {
      info = "<table>" +
          "<tr>" +
          "<td style='width: 160px;'>Laser (TL9)</td>" +
          "<td><p>Shooty burny light at people. Works in all environments and has an armour divisor of (2)</p></td>" +
          "</tr>";

      if (this.system.tl >= 10){
        if (this.system.laserDesign.allowSuperScienceCustomLasers) {
          info += "<tr>" +
              "<td style='width: 160px;'>Force Beam (TL 10^)</td>" +
              "<td><p>Fus Roh Dah except in a gun. Includes a stun setting.</p></td>" +
              "</tr>";
        }

        info += "<tr>" +
            "<td style='width: 160px;'>Blaster (TL 10)</td>" +
            "<td><p>Charged particles instead of burny light. Armour divisor of (5), but it doesn't work so well in a vacuum. Slightly lower Acc compared to proper lasers.</p></td>" +
            "</tr>";

        info += "<tr>" +
            "<td style='width: 160px;'>Neutral Particle Beam (TL 10)</td>" +
            "<td><p>Like a Blaster but set up to work in vacuum only, can switch back into Blaster mode to work in air. Slightly lower Acc compared to proper lasers.</p></td>" +
            "</tr>";
      }

      if (this.system.tl >= 11) {
        info += "<tr>" +
            "<td style='width: 160px;'>Rainbow Laser (TL 11)</td>" +
            "<td><p>Colourfull burny light. Works well in the air and under water, range is severly reduced in a vacum. Armour divisor of (3)</p></td>" +
            "</tr>";

        info += "<tr>" +
            "<td style='width: 160px;'>X-Ray Laser (TL 11)</td>" +
            "<td><p>A fuckin sick laser weapon, if not for the fact it's range in air is terrible. You can probably throw the gun farther than the beam will reach. But it's got AD (5) and its range is ludicrous in space.</p></td>" +
            "</tr>";

        if (this.system.laserDesign.allowSuperScienceCustomLasers) {
          info += "<tr>" +
              "<td style='width: 160px;'>Graviton Beam (TL 11^)</td>" +
              "<td><p>Shoot gravity at people. Low damage but it ignores armour.</p></td>" +
              "</tr>";
        }

        info += "<tr>" +
            "<td style='width: 160px;'>Pulsar (TL 11)</td>" +
            "<td><p>Make people explode. AD (3) crushing explosions.</p></td>" +
            "</tr>";
      }
      if (this.system.tl >= 12) {
        info += "<tr>" +
            "<td style='width: 160px;'>Graser (TL 12)</td>" +
            "<td><p>Like the X-Ray laser, this is fuckin sick. AD (10) and in space the range is measured in tens of miles, even for pistols. But in air the range is extremely limited, though better than the X-Ray laser.</p></td>" +
            "</tr>";
      }
      info += "</table>"
    }
    else if (id === "laser-colour") {
      info = "<table>" +
          "<tr>" +
          "<td style='width: 100px;'>Infrared</td>" +
          "<td>" +
          "<p>Infrared light is not visible to the naked eye, but the laser might still illuminate dust, smoke, etc, in the path of the beam.</p>" +
          "<p>While they work in both air and vacuum, their range in water is 0/1.</p>" +
          "</td>" +
          "</tr>";
      info += "<tr>" +
          "<td style='width: 100px;'>Blue-Green</td>" +
          "<td><p>These lasers are visible to the naked eye. Range doubles and RoF is halved. Blue-Green lasers use more energy so you get half as many shots per power cell.</p></td>" +
          "</tr>";
      info += "<tr>" +
          "<td style='width: 100px;'>Ultraviolet</td>" +
          "<td><p>Infrared light is not visible to the naked eye, but the laser might still illuminate dust, smoke, etc, in the path of the beam.</p>" +
          "<p>UV lasers have triple the range of IR lasers, but damage is halved. Furthermore, range is capped at 500m in atmosphere so these are used primarily in space or to get more range out of more compact designs.</p></td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "omni-blaster") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Omni-Blasters cost more but include a built-in electrolaser stun setting.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "focal-array") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>The size of the focal array determines the maximum range of the weapon, though it obviously makes the weapon heavier.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "laser-generator") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>These options determine how quickly the weapon can draw from its power source, allowing for higher or lower rates of fire. Higher rate of fire options cost and weigh more.</p>" +
          "</td>" +
          "</tr>";
      if (this.system.laserDesign.hotshotsAndOverheating) {
        info += "<tr>" +
            "<td><p>Gatling versions of the Light and Heavy generators prevent the laser from overheating due to continuous fire, but are incapable of firing hotshots.</p></td>" +
            "</tr>";
      }
      info += "</table>"
    }
    else if (id === "super-science-laser") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>This is not a general switch to turn on the super science options</p>" +
          "<p>Instead it is a specific option that increases the effectiveness of non-superscience weapons to keep up in a world where superscience is available</p>" +
          "<p>This halves the weight of the weapon, which you could then use to further increase the maximum damage, focal array, etc.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "field-jacket") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Many laser weapons have penalties for operating in environments they're not designed for. This option removes all such penalties, causing the laser to act as if it were in the ideal environment, whatever that might be.</p>" +
          "<p>This makes X-Ray Lasers and Grasers very powerful and makes them serious contenders against superscience weapons.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "gravitic-focusing") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Generally meant for space combat, each level halves damage and multiplies range by 10.</p>" +
          "<p>Note: This does not bypass range limits. X-Ray lasers are still capped at 20 yards in atmosphere, for example.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "ftl-laser") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>For when light simply isn't fast enough. 1/2D range increases to equal Max range, and all range penalties are halved.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "laser-damage-dice") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Select the output damage of the laser. This can be any number you like, entered as any positive real number.</p>" +
          "<p>The number of shots per power cell decreases exponentially as damage increases so the primary limit here is how much ammo you want to carry around.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "laser-power-system") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Select the number and type of power cells used in the weapon. Power cells need to be loaded individually (Unless you have the Double-Loading technique), so using a fistfull of A-cells to load your gatling laser is a pretty self-limiting choice.</p>" +
          "<p>The number of shots per power cell decreases exponentially as damage increases so the primary limit here is how much ammo you want to carry around.</p>" +
          "</td>" +
          "</tr>";

      info += "</table><table>"

      info += "<tr>" +
          "<td style='width: 45px;'>Type</td>" +
          "<td>Description</td>" +
          "<td>Weight</td>" +
          "<td>Cost</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>A cells</td>" +
          "<td>The size of a watch battery.</td>" +
          "<td>0.005 lbs</td>" +
          "<td>2$</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>B cells</td>" +
          "<td>The size of a modern AA battery or pistol cartridge.</td>" +
          "<td>0.05 lbs</td>" +
          "<td>3$</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>C cells</td>" +
          "<td>About the size of a pistol magazine, these are the standard for most energy based weapons, as well as power tools and high-energy electronics.</td>" +
          "<td>0.5 lbs</td>" +
          "<td>10$</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>D cells</td>" +
          "<td>The size of a thick book. Often worn as part of a separate backpack, these are used to power semi-portable weapons.</td>" +
          "<td>5 lbs</td>" +
          "<td>100$</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>E cells</td>" +
          "<td>About the size of a backpack, these power small vehicles, battlesuits, and emplaced weapons.</td>" +
          "<td>20 lbs</td>" +
          "<td>2,000$</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>F cells</td>" +
          "<td>About the size of a modern compact car engine, these power large vehicles, cannons, and small outposts</td>" +
          "<td>200 lbs</td>" +
          "<td>$20,000</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "super-science-power-cells") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Super science lasers don't actually require super science cells. And super science cells can fit in non-super science lasers. But they double the number of shots per cell so they're a good idea.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "non-rechargeable-power-cells") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Power cells are usually rechargeable, this option prevents recharging but doubles the number of shots per cell.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "laser-weight-tweak") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Used to tune the weight of the weapon. Lighter weapons are easier to fit into an encumbrance budget but tend to be more flimsy. HT does not change with weight, but HP does. Heavier weapons also tend to have higher Bulk, which can be desirable if you want to hit people with it.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "pulse-laser") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>When you absolutely, positively, must make someone explode, but they're just out of range to throw a grenade: Get a pulse laser</p>" +
          "<p>Armour Divisor drops 1 step, but damage changes from tight beam burning to a crushing explosion and range doubles. (Though any hard range limits still apply)</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "pulse-beam-laser") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>This option allows you to switch between pulse and beam modes allowing you to take advantage of the beam mode's higher armour divisor</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "melee-profile") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>This option adds a melee attack profile to the weapon that allows you to strike people with the weapon.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "cavalier-weapon") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>In the style of muzzle loading cavalry pistols, this weapon is designed specifically for striking and it does swing+1 crushing. Though you need a Ready maneuver to change into the correct grip (Or have Grip Mastery)</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "laser-ranged-skill") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Enter the skill used for this weapon's ranged attack profiles.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "laser-melee-skill") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Enter the skill used for this weapon's melee attack profiles.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "user-st") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>If this weapon is on an actor it will automatically fetch the lifting ST level of that actor. Otherwise you can input a value here for testing, design, etc.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "strong-bow-crossbow-finesse") {
      info = "<table>";
      if (this.system.bowDesign.fixedBonusStrongbow) {
        info += "<tr>" +
            "<td>This perk increases your draw weight by 15% your skill is at DX+1, or by 30% if your skill is at DX+2. This is then used to figure out what kind of draw weight you can handle.</td>" +
            "</tr>";
      }
      else {
        info += "<tr>" +
            "<td>This perk increases your ST by 1 if your skill is at DX+1, or by 2 if your skill is at DX+2. This is then used to figure out what kind of draw weight you can handle.</td>" +
            "</tr>";
      }
      info += "<tr>" +
          "<td>" +
          "<p>If this weapon is on an actor it will search the traits in an attempt to find a perk with a name exactly matching the one given here. " +
          "It will then attempt to fetch your relative bonus from the selected skill and apply the appropriate strongbow bonus." +
          "</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "strong-bow-crossbow-finesse-effect") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>For bows not currently attached to an actor, this allows you to spoof the effect that the perk would have on the wielder." +
          "</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "draw-weight") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Increasing draw weight gives the bow more energy to work with. If your design is at least sorta okay then this will increase both damage and range." +
          "</p>" +
          "</td><td>" +
          "<p>Increasing draw weight also makes it harder to draw, increasing the amount of time it takes to draw and fire the bow. Below are some helpful figures you should pay attention to." +
          "</p>" +
          "</td>" +
          "</tr>" +
          "</table>"

      info += "<table class='bow-draw-table'>"
      info += "<tr>" +
          "<td></td>" +
          "<td colspan='3' style='text-align: center'>Time to...</td>" +
          "<td></td>" +
          "</tr>"

      info += "<tr>" +
          "<td>Note</td>" +
          "<td>Draw</td>" +
          "<td>Fire</td>" +
          "<td>Fire (Fast-Draw)</td>" +
          "<td>Draw Weight</td>" +
          "</tr>"

      info += "<tr class='bow-hand'>" +
          "<td>This is the highest weight you are capable of drawing by hand in a single round.</td>" +
          "<td>1 sec</td>" +
          "<td>3 secs</td>" +
          "<td>2 secs</td>" +
          "<td>" + Math.floor(this.system.bowDesign.userBL*2*100)/100 + "lbs</td>" +
          "</tr>"

      if (this.system.bowDesign.type == "bow") {
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing.</td>" +
            "<td>2 secs</td>" +
            "<td>4 secs</td>" +
            "<td>3 secs</td>" +
            "<td>" + Math.floor(this.system.bowDesign.userBL*2.5*100)/100 + "lbs</td>" +
            "</tr>"
      }
      else if (this.system.bowDesign.type == "footbow" || this.system.bowDesign.type == "xbow") {
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing by hand in two rounds.</td>" +
            "<td>2 secs</td>" +
            "<td>4 secs</td>" +
            "<td>3 secs</td>" +
            "<td>" + Math.floor(this.system.bowDesign.userBL*4*100)/100 + "lbs</td>" +
            "</tr>"
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing by hand in three rounds.</td>" +
            "<td>3 secs</td>" +
            "<td>5 secs</td>" +
            "<td>4 secs</td>" +
            "<td>" + Math.floor(this.system.bowDesign.userBL*6*100)/100 + "lbs</td>" +
            "</tr>"
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing by hand.</td>" +
            "<td>4 secs</td>" +
            "<td>6 secs</td>" +
            "<td>5 secs</td>" +
            "<td>" + Math.floor(this.system.bowDesign.userBL*8*100)/100 + "lbs</td>" +
            "</tr>"

        if (this.system.bowDesign.type == "xbow") {
          info += "<tr class='bow-hook'>" +
              "<td>This is the highest weight you are capable of drawing with a belt hook in a single round (Or by hand in two rounds)</td>" +
              "<td>1 secs</td>" +
              "<td>3 secs</td>" +
              "<td>2 secs</td>" +
              "<td>" + Math.floor(this.system.bowDesign.userBL*4*100)/100 + "lbs</td>" +
              "</tr>"
          info += "<tr class='bow-hook'>" +
              "<td>This is the highest weight you are capable of drawing with a belt hook in two rounds (Or by hand in four rounds)</td>" +
              "<td>2 secs</td>" +
              "<td>4 secs</td>" +
              "<td>3 secs</td>" +
              "<td>" + Math.floor(this.system.bowDesign.userBL*8*100)/100 + "lbs</td>" +
              "</tr>"

          if (this.system.tl >= 3) {
            info += "<tr class='bow-mech'>" +
                "<td rowspan='3'>Using a goat's foot lets you go over the normal draw limit, but using the device takes extra time, so it's really only useful if it lets you exceede what you could do by hand.</td>" +
                "<td>7 secs</td>" +
                "<td>9 secs</td>" +
                "<td>8 secs</td>" +
                "<td>" + Math.floor(this.system.bowDesign.userBL*5*2*100)/100 + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-mech'>" +
                "<td>8 secs</td>" +
                "<td>10 secs</td>" +
                "<td>9 secs</td>" +
                "<td>" + Math.floor(this.system.bowDesign.userBL*6*2*100)/100 + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-mech'>" +
                "<td>9 secs</td>" +
                "<td>11 secs</td>" +
                "<td>10 secs</td>" +
                "<td>" + Math.floor(this.system.bowDesign.userBL*7*2*100)/100 + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-mech'>" +
                "<td>This is the draw limit with a goat's foot.</td>" +
                "<td>10 secs</td>" +
                "<td>12 secs</td>" +
                "<td>11 secs</td>" +
                "<td>" + Math.floor(this.system.bowDesign.userBL*8*2*100)/100 + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-wind'>" +
                "<td>With a windlass you can draw a bow of pretty much any weight. It just takes a long fucking time. This is as fast as it gets, and it only gets slower.</td>" +
                "<td>8 secs</td>" +
                "<td>10 secs</td>" +
                "<td>9 secs</td>" +
                "<td>" + Math.floor(this.system.bowDesign.userBL*8*2*100)/100 + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-wind'>" +
                "<td>Windlasses also get heavier the higher the draw weight multiplier gets.</td>" +
                "<td>12 secs</td>" +
                "<td>14 secs</td>" +
                "<td>13 secs</td>" +
                "<td>" + Math.floor(this.system.bowDesign.userBL*8*3*100)/100 + "lbs</td>" +
                "</tr>"

            if (this.system.tl >= 4) {
              info += "<tr class='bow-cranq'>" +
                  "<td>Cranequins are half the weight, but are twice as slow.</td>" +
                  "<td>24 secs</td>" +
                  "<td>26 secs</td>" +
                  "<td>25 secs</td>" +
                  "<td>" + Math.floor(this.system.bowDesign.userBL * 8 * 3*100)/100 + "lbs</td>" +
                  "</tr>"
            }
          }
        }
      }

      info += "<tr>" +
          "<td colspan='5'>Time to fire does not include the round you're actually firing on. So it takes that many rounds to make the weapon ready to fire on the following turn.</td>" +
          "</tr>"
      info += "</table>"
    }
    else if (id === "target-draw-length") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is how far back you can pull the string, compared to the absolute maximum draw length allowed by the current design." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>High draw weight is good because it means there's more energy in the bow. " +
          "High draw length is good because it means that energy is being applied for longer. " +
          "For that reason, you want this number to be as high as you can possibly get away with." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Beyond the limit on draw length given by your design, you're also limited by the bio-mechanics of actually drawing the thing." +
          "</p>" +
          "</td>" +
          "</tr>";

      if (this.system.bowDesign.type == "bow") {
        info += "<tr>" +
            "<td>" +
            "<p>The basic formula for draw length is your height in inches, minus 15, and then divided by two.</p>" +
            "</p>" +
            "</td>" +
            "</tr>";

        info += "<tr>" +
            "<td>" +
            "<p>" +
            "Some short bows can have draw lengths as high as 60% of the user's height, but this is extreme, and you can't really go higher than that." +
            "</p>" +
            "</td>" +
            "</tr>";
      }
      else if (this.system.bowDesign.type == "footbow") {
        info += "<tr>" +
            "<td>" +
            "<p>A footbow's draw length is usually around 60% of the person's height, but it can go as high as 75%. Flying characters in particular are much more likely to use the full 75%." +
            "</p>" +
            "</td>" +
            "</tr>";

        info += "<tr>" +
            "<td>" +
            "<p>" +
            "Draw lengths over 75% aren't really possible, and there's not much reason for picking a draw length lower than 60% unless it's mass produced by or for a group with an average height lower than your own." +
            "</p>" +
            "</td>" +
            "</tr>";
      }
      else if (this.system.bowDesign.type == "xbow") {
        info += "<tr>" +
            "<td>" +
            "<p>With crossbows such as they are, you can make the draw length of a crossbow as high as you like, with the following two limits." +
            "</p>" +
            "</td>" +
            "</tr>";
        info += "<tr>" +
            "<td>" +
            "<p>Bulk/Weight: Bigger crossbows are heavier and have worse bulk scores, but maybe you're fine with that. This is a soft limit." +
            "</p>" +
            "</td>" +
            "</tr>";
        info += "<tr>" +
            "<td>" +
            "<p>Materials: This is the hard limit. Some materials will be too flimsy and snap under the strain if you set this too high. Some materials are too stiff and just won't bend enough." +
            "</p>" +
            "</td>" +
            "</tr>";
        info += "<tr>" +
            "<td>" +
            "<p>My suggestion it to set this as high as you think makes sense. Just keep in mind you might need to come back and reduce it later." +
            "</p>" +
            "</td>" +
            "</tr>";
      }

      info += "</table>"
    }
    else if (id === "total-bow-length") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is the distance from one end of the bow stave to the other." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Increasing this doesn't directly increase damage, but bows with long draw lengths and high draw weights generally need to have long limbs for the design to actually work." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Longer bows also increase the weight and Bulk of the bow, but sometimes the bow just needs to be that big to work properly." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Granted, going for a bow larger than you necessarily need can also increase the 1/2D and Max range." +
          "</p>" +
          "</td>" +
          "</tr>";

      if (this.system.bowDesign.type == "bow") {
        info += "<tr>" +
            "<td>" +
            "<p>A longbow is generally 100 to 105% of the user's height, but higher values are possible. Some Japanese Yumi are as much as 140% of the user's height." +
            "</p>" +
            "</td>" +
            "</tr>";
      }
      else {
        info += "<tr>" +
            "<td>" +
            "<p>There is no hard limit for the bow length, just keep in mind that the bigger it gets the harder it will be to use. Bulk is one thing, but if it's too large you may not be able to use it in confined spaces, indoors, etc." +
            "</p>" +
            "</td>" +
            "</tr>";
      }

      info += "</table>"
    }
    else if (id === "working-bow-length") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is how much of the bow's length that actually works as a spring to drive the arrow. You generally want this to be 100%" +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>If this number is something other than 100%, then your bow has a non-working riser that exists only to make the bow taller without actually storing energy. This can be helpful to increase max draw length in certain cases." +
          "</p>" +
          "</td>" +
          "</tr>";


      info += "</table>"
    }
    else if (id === "working-material") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Your choice of materials determines how good your bow is at turning your draw weight into damage. " +
          "All the other options matter, but its the materials that decide the relationship between energy in and energy out." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Material 1 and 2 don't occupy any special position, the two are interchangeable." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>You can even set both dropdowns to the same material if you like, and this was often the case historically. " +
          "English Longbows were made entirely of European Yew, for example." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Silk and sinew are a special case. Since you can't make a bow out of cloth, they must be combined with another material." +
          "</p>" +
          "</td>" +
          "</tr>";


      info += "</table>"

      info += "<h2>Okay, but which do I choose?</h2>";

      info += "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Good choices are: Osage Orange, Elm, Bamboo, Hickory, Horn, Sinew, and European Yew" +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Horn and Sinew bows were very effective historically, and they remain good in GURPS." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>The biggest problem you're likely to have here is the materials most efficient at turning your draw weight into damage also don't have the capacity to store as much energy. " +
          "Steel is a very poor material for bows, but saw use in historical crossbows because it could store a ton of energy. " +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "working-material-essential") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Rather than use a specific essential material, this checkbox makes whatever material you've selected essential, making it three times as strong." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"

    }
    else if (id === "bow-density") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Denser materials generally lead to heavier bows." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-tensile-st") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Materials with higher tensile strength can (usually) store more energy. Which is to say, they can handle high draw weights." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-elastic-modulus") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Materials with higher elastic modulus take more force to bend." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-max-strain") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>TLDR: High numbers good." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Materials with higher max strain are better at turning stored energy (That's your draw weight) into kinetic energy (That's your damage)" +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-buckling-constant") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>TLDR: Low numbers good." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>This is only used for arrows, crossbow stocks, and bow risers.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Arrows: There's all sorts of physicsy stuff going on behind the scenes, but all you really need to know is this: " +
          "Your arrows have a minimum weight based on how powerful the bow is and what material it is made out of. Otherwise the arrow is too weak and snaps when you fire it. " +
          "Lower numbers here mean that the material is strong enough to make a lighter arrow. This increases range, how many arrows you can carry, and usually means cheaper arrows." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Risers and Stocks: You obviously want these to be strong and light. The buckling constant is a good indicator of whether something is strong enough to make a good stock/riser. Beyond that, just check the cost and weight." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Ideal materials, are: Carbon Fibre, Aluminum, Steel, E-glass fibreglass, Aspen, Poplar, and Pine. Wrought Iron is also surprisingly decent and a bit cheaper than steel." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-cost-per-lb" || id === "bow-arrow-cost-per-lb") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Good materials are expensive. There's not much you can do to avoid that. However, none of these materials are really a bad deal. You're getting what you pay for." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>This also means the price can be used as a shorthand for quality, though it's not quite perfect." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-shape") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>D-Section bows are shaped like a D or like a rectangle. Round bows are round." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>D-Section bows are nearly always better, but you might only be able to make round bows with certain materials." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "cross-section") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Width vs Thickness ratio." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>If it's less than 1, it's thicker than it is wide. If it's more than 1, it's thinner than it is wide." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Sensible values range between 0.5 and 10, but technically anything is allowed." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Higher numbers allow for higher draw length, but are less efficient at turning draw weight into damage." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-type") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>TLDR: Pick the lowest entry on the list that you are allowed." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>The further you go down this list, the better bows get at storing more energy in smaller packages." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Smaller bows have lower Bulk scores and are generally easier to use in confied spaces." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Smaller bows are also generally more efficient at turning stored energy (your draw weight) into kinetic energy (damage)." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>But aside from these designs making the bow more expensive to produce, they might not be available to you if the designs are unfamiliar to your culture." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"

      info += "<h2>But what do these options actually mean?</h2>";

      info += "<table>";

      info += "<tr>" +
          "<td>Straight</td>" +
          "<td>Like an english longbow, most historical steel crossbows, and so on. The bow stave, the bit that actually bends, is straight when unstrung.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Recurve</td>" +
          "<td>The end of the limbs bend away from the user when the bow is unstrung. This puts more strain on the materials, but also lets you get more power out of the bow.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Reflex</td>" +
          "<td>The entire limb bends way from the user when the bow is unstrung. This puts even more strain on the materials, allowing you to get even more power.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Compound</td>" +
          "<td>It's got pulleys and shit.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-loops") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The number of loops or pulleys on the bow. Most compound bows have 3, but 2 or 4 is also acceptable. " +
          "In theory, any number is acceptable, but more than 4 starts to get very complicated.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "limb-thickness") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>You (generally) want this to be as low as possible to keep the design efficient, with two caveats:" +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>The thickness needs to be at least as high as the minimum thickness given here. If it's any lower the bow will break rather than bend." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>The deflection cannot be too high. 35% is reasonable, and the absolute limit is 50%. " +
          "And keep in mind that some historical bows did go all the way to 50% deflection, particularly reflex and recurve bows." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "riser-material") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>You want a material that is strong and light. If it's too weak it'll bend and that's no good. And if it's heavy then it's a pain in the ass to fit in your encumbrance." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"

      info += "<h2>Okay, but which do I choose?</h2>";

      info += "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Good choices are: Carbon Fibre, Aluminum, Steel, E-glass fibreglass, Aspen, Poplar, and Pine. Wrought Iron is also surprisingly decent and a bit cheaper than steel." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "riser-material-essential") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Rather than use a specific essential material, this checkbox makes whatever material you've selected essential, making it three times as strong. " +
          "In effect, this makes the riser three times as light." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "riser-width") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is how wide the riser or stock is. It must be at least as wide as the bow is, but otherwise you can set whatever value you like.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>When combined with the 'Allowed Deflection' setting, this determines how heavy the stock/riser is.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "allowed-deflection") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is how much the stock or riser is allowed to bend when you draw the bow. Bending is bad, it makes the bow less efficient. " +
          "But preventing bending entirely is really fuckin' hard, and makes the bow heavier. So decide how much you will allow.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>What's really going on is that this slider increases the thickness of the stock to match the level of deflection and width you've selected.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "riser-width") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is how wide the stock is. Narrower stocks are generally a good idea as it leads to the calculation generating a thicker stock, which for complicated physics reasons, is better at resisting deflection and so is lighter.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>What's really going on is this setting modifies the thickness of the stock to match the level of deflection and width you've selected.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "riser-thickness") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is the resulting thickness based on the width and allowed deflection</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "stock-length") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is how long the stock is. It must be at least as long as the draw length. Beyond that, any value is allowed.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-skill") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The skill used to fire the weapon.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-quality") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Cheap bows are less expensive and less accurate, Fine bows are more expensive and more accurate.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "shaft-length") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Longer arrows are heavier, heavier arrows generally do more damage but have a shorter range.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Arrows must be as long as the draw length, otherwise you can do pretty much whatever you like.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "shaft-material") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>You want a material with a low buckling constant that helps meet the weight you're trying to aim for.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrow-quality") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Fine arrows are required to get the accuracy bonus from a Fine bow.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrow-outer-diameter") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The second number is the minimum arrow thickness based on the force put on the arrow. Beyond that you can make the arrow as thick as you like.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrow-inner-diameter") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>If this is zero, the arrow is solid. If it's not zero, the arrow is not solid.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>You can use this to tune the weight of the arrow, but in general I suggest leaving it at zero.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrowhead") {
      info = "<table>";

      info += "<tr>" +
          "<td>Style</td>" +
          "<td>Wound Mod</td>" +
          "<td>AD</td>" +
          "<td>Weight</td>" +
          "<td>Cost</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Field or Target</td>" +
          "<td>pi</td>" +
          "<td>(0.5)</td>" +
          "<td>0.015</td>" +
          "<td>$0.50</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Hunting Broadhead</td>" +
          "<td>imp</td>" +
          "<td>(1)</td>" +
          "<td>0.045</td>" +
          "<td>$2.25</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Hunting Broadhead, Heavy</td>" +
          "<td>imp</td>" +
          "<td>(1)</td>" +
          "<td>0.09</td>" +
          "<td>$4.50</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>War, Light</td>" +
          "<td>imp</td>" +
          "<td>(1)</td>" +
          "<td>0.02</td>" +
          "<td>$1</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>War, Light, Barbed</td>" +
          "<td>imp</td>" +
          "<td>(1)</td>" +
          "<td>0.05</td>" +
          "<td>$2.50</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>War, Heavy</td>" +
          "<td>imp</td>" +
          "<td>(1)</td>" +
          "<td>0.05</td>" +
          "<td>$2.50</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>War, Heavy, Barbed</td>" +
          "<td>imp</td>" +
          "<td>(1)</td>" +
          "<td>0.075</td>" +
          "<td>$3.75</td>" +
          "</tr>";

      if (this.system.tl >= 4) {
        info += "<tr>" +
            "<td>War, Light, AP</td>" +
            "<td>imp</td>" +
            "<td>(2)</td>" +
            "<td>0.025</td>" +
            "<td>$5</td>" +
            "</tr>";

        info += "<tr>" +
            "<td>War, Light, Barbed, AP</td>" +
            "<td>imp</td>" +
            "<td>(2)</td>" +
            "<td>0.05</td>" +
            "<td>$10</td>" +
            "</tr>";

        info += "<tr>" +
            "<td>War, Heavy, AP</td>" +
            "<td>imp</td>" +
            "<td>(2)</td>" +
            "<td>0.055</td>" +
            "<td>$11</td>" +
            "</tr>";

        info += "<tr>" +
            "<td>War, Heavy, Barbed, AP</td>" +
            "<td>imp</td>" +
            "<td>(2)</td>" +
            "<td>0.075</td>" +
            "<td>$15</td>" +
            "</tr>";
      }

      if (this.system.tl >= 7) {
        info += "<tr>" +
            "<td>Hunting Broadhead, Modern</td>" +
            "<td>imp</td>" +
            "<td>(1)</td>" +
            "<td>0.015</td>" +
            "<td>$7.50</td>" +
            "</tr>";
      }

      info += "</table>"
    }
    else if (id === "shaft-material-essential") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Rather than use a specific essential material, this checkbox makes whatever material you've selected essential, making it three times as strong.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>This is not terribly useful for arrows. Once you reach a certain point, the arrow is plenty strong enough as is. " +
          "Unless you're trying to design ultra-light arrows this is really not worth the trouble or expense.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrowhead-damage-type") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Other wound modifiers beyond impaling are an option, and give a slight discount in projectile cost.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"

      info += "<table>";

      info += "<tr>" +
          "<td>Damage Type</td><td>Price Multiplier</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Impaling</td><td>x1.0</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Piercing</td><td>x0.9</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Cutting</td><td>x0.8</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Crushing</td><td>x0.7</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrowhead-ad") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Arrows with AD (0.5) are x0.8 cost, and AD (2) is x4</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrowhead-barbed") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Barbed arrows must be removed with a First Aid or Surgery roll or they do half damage coming out.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrowhead-weight") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Heavier arrowheads tend to do more damage at the expense of range.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrow-stats") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is the final cost and weight per individual arrow.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "damage-points") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Number of damage points is on the left. That number converted to dice is on the right.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "acc-range") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Acc ranges between 0 and 4. Projectile velocity and weapon bulk positively impact Acc.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>1/2D and Max range are given here, and due to the way arrows and bolts fly through the air, they can in fact be the same.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "bow-show-profile") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Check this box to show this as a profile on the combat tab and combat macro.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "arrow-name") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This name will be used in the display of the projectile on the combat tab and combat macro.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-location") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The primary location this armour applies to</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-sub-location") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The sub location this armour applies to.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>An important note: Rules against armour layering don't apply if the second layer of armour only covers half the hit location in question. " +
          "You can use this to add a second layer of armour to your vitals, shins, forearms, etc. All without taking any DX penalties.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-coverage") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The square footage of the hit location. Larger locations require more material to armour.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-voider") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This marks a location as not being an actual hit location. Instead it's a (potential) armour gap. " +
          "You might not be able to fit plate steel here, but it gives you the opportunity to cover it with leather, mail, etc. " +
          "Voiders only show up if their parent hit location is constructed with rigid armour. Flexible armour does not leave a voider.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-material") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>A dropdown allowing you to select from the materials available at your TL.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-material-essential") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>A checkbox allowing you to make the material on this location Essential.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Essential materials cost 30x as much per pound, max DR is 3x as high, and each point of DR weighs 1/3rd what it normally does.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-construction") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>A dropdown alloying you to select from the construction methods available for your selected hit location and material at your given TL</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Some hit locations can't use certain construction types, the abdomen, for example, can't be covered with normal plate.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>Some materials can't use certain construction types, leather, for example, can't be crafted into mail. (At least not in a way that would be helpful.)</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-selectedDR") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>A slider allowing you to select the amount of DR on this hit location.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>The upper bound is limited by the material you select.</p>" +
          "</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>" +
          "<p>The lower bound is limited by the construction method you select.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-body-type") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The body type this armour is meant for. Though armour meant for a different body type might still fit. (Winged Humanoids and Humanoids can wear each other's helmets, for example)</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-layer") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Higher layer numbers are placed above lower layer numbers. " +
          "-∞ is closest to the body. " +
          "+∞ is furthest from the body. " +
          "You can enter any real number. " +
          "Ties won't cause errors but should be avoided.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-input-scaling") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is really only for testing. Once this armour is placed onto an actor it will fetch the value directly from the actor.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-tailor") {
      info = "<table>";

      info += "<tr>" +
          "<td colspan='2'>This is not the same as styling. However, if you're going for high-status armour, this does contribute to the armour's final Status rating.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Cheap</td>" +
          "<td>-0.6 CF and -1 to DR. However, cheap armour does not need to be tailored to it's wearer so there is no DX penalty for it not being correctly adjusted.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Regularly Tailored</td>" +
          "<td>This is the default for armour. It doesn't cost any extra and gives no bonuses or penalties. " +
          "But even without selecting a higher level of tailoring, it is assumed that Regularly Tailored armour is still tailored to the wearer. " +
          "Looted, borrowed, and second-hand armour needs to be adjusted by an armourer or else the wearer is at -1DX and -1DR until the issue is corrected.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Expertly Tailored</td>" +
          "<td>+5 CF, but the Holdout penalty is reduced by 1, and opponents are at an extra -1 to target your armour chinks. This includes voiders such as the inside of the elbow, knee, or armpit. Weight is reduced by 15%</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Masterfully Tailored</td>" +
          "<td>+29 CF, but the Holdout penalty is reduced by 2, and opponents are at an extra -2 to target your armour chinks. This includes voiders such as the inside of the elbow, knee, or armpit. Weight is reduced by 30%</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-style") {
      info = "<table>";

      info += "<tr>" +
          "<td colspan='2'>Styling alone does not set the Status level of the armour. But it does contribute to the armour's final Status rating.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>No Styling</td>" +
          "<td>This is the default for armour. It doesn't cost any extra and gives no bonuses or penalties.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Status +1</td>" +
          "<td>+1 CF, it gives a +1 to reaction rolls where appropriate, including Merchant rolls to sell the gear.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Status +2</td>" +
          "<td>+4 CF, it gives a +2 to reaction rolls where appropriate, including Merchant rolls to sell the gear. At this point the armour is considered 'Presentation Quality', and is appropriate for parades, display, etc.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Status +3</td>" +
          "<td>+9 CF, it gives a +3 to reaction rolls where appropriate, including Merchant rolls to sell the gear.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-holdout-reduction") {
      info = "<table>";

      info += "<tr>" +
          "<td colspan='2'>This does not grant a bonus to Holdout, it only removes any penalty inherent in the type and amount of armour. " +
          "For this reason it's less expensive than getting an actual bonus. Each one point reduction in the penalty raises the cost factor by 1.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-concealed") {
      info = "<table>";

      info += "<tr>" +
          "<td>This option is for armour concealed within a specific matching garment. Often this means the armour is built directly into the garment, but that's not necessarily required.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>It does however require that there be <i>something</i> to hide the armour in. You'll pick what that is along the way.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-clothing") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is the specific type of clothing you're attempting to hide the armour within.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>The armour designer does not account for you armouring locations that might not be covered by whatever type of clothing you select. " +
          " It's assumed that you have an appropriate garment covering whichever location you're armouring, of whichever type you selected. (Winter gloves, driving gloves, winter boots, hiking boots, whatever)</td>" +
          "</tr>";

      info += "</table><table>"

      info += "<tr>" +
          "<td>Note</td><td>Cost</td><td>Weight</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Swimwear</td>" +
          "<td>5% Cost of Living</td><td>0.5 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Summer Clothing</td>" +
          "<td>10% Cost of Living</td><td>1 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Normal Clothing</td>" +
          "<td>20% Cost of Living</td><td>2 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Winter Clothing</td>" +
          "<td>30% Cost of Living</td><td>5 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Long Coat covers the neck, torso, arms, knees, and thighs.</td>" +
          "<td>50$</td><td>5 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>The Leather Long Coat grants +1 DR to the neck, torso, arms, knees, and thighs. It need not actually be leather.</td>" +
          "<td>100$</td><td>10 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>The Light Quality Leather Long Coat grants +1 DR to the neck, torso, arms, knees, and thighs. It does need to be leather.</td>" +
          "<td>250$</td><td>5 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>The Quality Leather Long Coat grants +2 DR to the neck, torso, arms, knees, and thighs. It does need to be leather.</td>" +
          "<td>500$</td><td>10 lbs</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Nun's Habit</td>" +
          "<td>35% Cost of Living</td><td>6 lbs</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-clothing-status") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is the status level of the clothing you've selected. It determines how fancy your clothing is, and how expensive it is.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-undercover-clothing") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is the additional holdout bonus granted to the clothing you're hiding the armour within.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Not only does it make your armour easier to hide, maybe even granting a bonus, it also applies to anything else you might want to hide within the clothing, such as weapons, etc.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-steel-hardening") {
      info = "<table>";

      info += "<tr>" +
          "<td>Type</td><td>Effect</td><td>CF</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Hardened Steel</td><td>+1 DR</td><td>+4 CF</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Duplex Plate</td><td>+1 DR and -10% weight</td><td>+8 CF</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-fluting") {
      info = "<table>";

      info += "<tr>" +
          "<td>By adding flutes, ribs, and bosses in key areas you can reduce weight with no loss of strength.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>+4 CF and -10% to weight.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-silk") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth armour may optionally be made of silk.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +19, +1 DR vs cutting and impaling.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-paper") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth armour may optionally be made of paper. It's cheaper but more flamable.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF -0.25, Combustible.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-textile-reinforced") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth and Leather armour may be reinforced to better protect against cutting damage.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +0.25, +1 DR vs cutting, +25% weight.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-textile-reinforced") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth armour may be reinforced to better protect against cutting damage.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +0.25, +1 DR vs cutting, +25% weight.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-mountain-scale") {
      info = "<table>";

      info += "<tr>" +
          "<td>Scale armour can be designed in such a way that the scales lock together under pressure. This increases DR vs crushing.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +1, +1 DR vs crushing.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-butted") {
      info = "<table>";

      info += "<tr>" +
          "<td>Mail links are usually held together with a rivet. Butted mail has no such rivets. " +
          "It's no worse when defending against cuts or blunt trauma, but impaling attacks can force the links apart. " +
          "It's like your mom. Cheap, and easily penetrated.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF -0.6, -3 DR vs impaling.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-banded") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is mail with reinforcing bands to help protect against crushing damage.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +0.5, +2 DR vs crushing. +50% weight</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-sealed") {
      info = "<table>";

      info += "<tr>" +
          "<td>Sealed Armour grants the Sealed Advantage (So long as it covers your whole body). </td>" +
          "</tr>";

      info += "<tr>" +
          "<td>This costs 10$ per square foot at TL7 or below, and 5$ per square foot at TL8 or above.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>For an average character, that's going to work out to 213.50$ at TL7 or below, and 106.75$ at TL8 or above.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-hobnailed") {
      info = "<table>";

      info += "<tr>" +
          "<td>Hobnails improve the wearer's footing on bad terrain. " +
          "Removing the -2 to attacks and -1 to defences. " +
          "However on hard surfaces you're at -1 to Stealth.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>This costs 12.50$ and 0.5lbs per foot.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-punch") {
      info = "<table>";

      info += "<tr>" +
          "<td>Rigid hand armour with DR 1+ or flexible hand armour with DR 2+ increases kick damage from thr-1 to thr+0. Checking this option adds the increased damage as an attack profile to your sheet.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-punch-skill") {
      info = "<table>";

      info += "<tr>" +
          "<td>Enter the skill and skill mod here so the combat macro knows what to roll against when you punch someone.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-kick") {
      info = "<table>";

      info += "<tr>" +
          "<td>Rigid foot armour with DR 1+ or flexible foot armour with DR 2+ increases kick damage from thr to thr+1. Checking this option adds the increased damage as an attack profile to your sheet.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-kick-skill") {
      info = "<table>";

      info += "<tr>" +
          "<td>Enter the skill and skill mod here so the combat macro knows what to roll against when you kick someone.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-don-time") {
      info = "<table>";

      info += "<tr>" +
          "<td>The time in seconds to put on the armour.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-status-eq") {
      info = "<table>";

      info += "<tr>" +
          "<td>Even without decoration, expensive armour is often a sign of status. That's what this is displaying.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-can-pass-for") {
      info = "<table>";

      info += "<tr>" +
          "<td>The type of clothing this armour might be able to pass for. This is usually not going to work for rigid armour, however, no matter how thin.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "armour-holdout") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is the worst holdout penalty among all the pieces in this set of armour.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id === "firearm-configuration") {
        info = "<table>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Cannon</td>" +
            "<td><p>Either an actual cannon, or the sort of really early cannon-style firearm that was held underarm on the end of a pole. Acc is lower (frequently 0), Bulk is higher, and ST is higher compared to a rifle of equal weight.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Pistol</td>" +
            "<td><p>It's a pistol. Acc is lower, Bulk is lower, and ST is higher compared to a rifle of equal weight.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Rifle</td>" +
            "<td><p>It's a rifle. Acc is higher, but so is Bulk. ST is lower compared to a pistol or of equivalent weight but the weapon requires two hands.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Semi-Portable Longarm</td>" +
            "<td><p>It's a thicc rifle. Acc, Bulk, Weight, and ST are all higher. Think Anti-materiel rifle.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Bullpup Longarm</td>" +
            "<td><p>Like a rifle, but with the magazine or equivilent behind the grip. Lower bulk, but higher weight.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "barrel-length") {
        info = "<table>";

        info += "<tr>" +
            "<td>Barrel length increases damage and weight, but doesn't actually have much impact on accuracy.</td>" +
            "</tr>";

        info += "</table>"
    }
    else if (id === "essential-gun-material") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Essential materials are three times as strong for the same weight, but cost 30x as much for the same weight. For guns this means the weapons weighs 1/3rd as normal but costs 10x as much.</p>" +
          "</td>" +
          "</tr>" +
          "<tr>" +
          "<td>" +
          "<p>This is questionably useful. Lighter guns obviously impact your encumbrance less and a lower ST stat, but they also have more recoil.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id === "firearm-weight-tweak") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Used to tune the weight of the weapon. Lighter weapons are easier to fit into an encumbrance budget but tend to be more flimsy and have more Rcl. HT does not change with weight, but HP does. Heavier weapons also tend to have higher Bulk, which can be desirable if you want to hit people with it. They also have less Rcl. Can sometimes also impact Bulk.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "rifling") {
        info = "<table>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Muzzle Loaders</td>" +
            "<td><p>Increases base reloading time by a fair amount and Acc by 1. This does cost more.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Historical Firearms</td>" +
            "<td><p>Increases Acc by 1. This does cost more.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Modern Firearms</td>" +
            "<td><p>This is treated as the baseline for modern firearms, other than shotguns. Rifled barrels have negative effects on sub-calibre multi-projectile weapons, and fin stabalized weapons.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "firearm-action") {
        info = "<table>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Muzzle Loaders</td>" +
            "<td><p>Muskets, etc. They generally take a long time to reload, though various aids exist to speed this up. Reloading time is between 20 and 60 seconds. Rate of fire is 1 per barrel. Loading these in wet conditions all but guarantee they will not fire.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Breech Loaders</td>" +
            "<td><p>A marginal improvement on the musket. Ammo is loaded from the back, which is quicker, and doesn't penalize you if your barrel is rifled. Reloading time is 10 seconds with loose powder, but as few as 3 with cartridges. Rate of fire is 1 per barrel. With loose powder, loading these in wet conditions are an extremely bad idea, but not as bad as the muzzle loader.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Break Action</td>" +
            "<td><p>A marginal improvement on the breach loader. Double barrel 12 gauges are break action weapons. Reloading time is generally 3 seconds, loading shells individually. Rate of fire is 1 per barrel.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Lever Action</td>" +
            "<td><p>The first kinda-fast gun. Reloading time is generally 2 seconds per round. Rate of fire is 2.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Single Action Revolver</td>" +
            "<td><p>A revolver where you need to cock the hammer with each shot. Reloading time ranges between 10 seconds and 3 seconds per round depending on the lock type. Rate of fire is 1.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Pump Action</td>" +
            "<td><p>It's what it sounds like. Can be used on any type of weapon, not just shotguns. Reloading time is 2 seconds per round. Rate of fire is 2.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Bolt Action</td>" +
            "<td><p>It's what it sounds like. Reloading time is 3 seconds, or 2 seconds if loading individual rounds. Rate of fire is 1.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Double Action Revolver</td>" +
            "<td><p>A revolver where pulling the trigger cocks the hammer. Reloading time ranges between 10 seconds and 3 seconds per round depending on the lock type. Rate of fire is 3.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Straight Pull Bolt Action</td>" +
            "<td><p>It's a bolt action where the bolt doesn't need to be turned as part of working the action. Slightly speeds things up. Reloading time is 3 seconds, or 2 seconds if loading individual rounds. Rate of fire is 2.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Semi Automatic</td>" +
            "<td><p>Goes bang every time you pull the trigger. Reloading time is 3 seconds, or 2 seconds if loading individual rounds. Rate of fire is 3.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Automatic</td>" +
            "<td><p>Goes bang as long as you pull the trigger. Reloading time is 3 seconds, or 2 seconds if loading individual rounds. Rate of fire usually ranges between 9 and 20. Typically pistols will be 15 to 20, intermediate rifles will be 12-15, and full sized rifles will be 9 to 12. But in theory you can set this to whatever you like.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Automatic with Burst</td>" +
            "<td><p>Automatic, but you can set the number of shots fired each time you pull the trigger. Without this, it can be hard to control how many shots you fire, particularly at high fire rates.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Automatic with High-Cyclic Burst</td>" +
            "<td><p>Seems similar to the other burst option, but it serves a completely different purpose. Weapons firing in high-cyclic burst mode have a Rcl of 1.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "firearm-lock") {
        info = "<table>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Cannonlock</td>" +
            "<td><p>Loaded with loose powder or paper cartridges. Requires you to hold a piece of burning match (really a sort of long-burning rope) to a touch hole. It's janky as fuck if you actually need to carry the weapon around, and is really innaccurate. Reloading time is between 20 and 60 seconds. See LT90 for details, but water and wind will really screw with this gun.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Matchlock</td>" +
            "<td><p>Loaded with loose powder or paper cartridges. Slightly more advanced than the cannonlock. Now the piece of burning match is attached to the gun and pulling the trigger touches the match to the touch hole. Reloading time is between 20 and 60 seconds. If damp, the weapon will only fire on a crit. See LT90 for details, but water and wind will really screw with this gun.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Wheellock</td>" +
            "<td><p>Loaded with loose powder or paper cartridges. Uses some clockwork bullshit to spin a wheel like you might see on a modern lighter. Does not need to be cocked light a flint lock. In theory this does protect against <i>very</i> specific types of misfires as you can just pull the trigger again to try firing again without needing to cock anything. Reloading time is between 20 and 60 seconds. See LT90 for details, but water and wind will screw with this gun, though not as bad as the cannon or matchlock.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Flintlock</td>" +
            "<td><p>Loaded with loose powder or paper cartridges. Very simple, pull a trigger, drop the hammer. Reloading time is between 20 and 60 seconds. See LT90 for details, but water and wind will screw with this gun, though not as bad as the cannon or matchlock.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Caplock</td>" +
            "<td><p>Loaded with loose powder or paper cartridges and using separate percussion caps. Place a fresh cap on the percussion nipple as part of the loading process, and pulling the trigger drops the hammer detonating the cap. Reloading time is between 10 and 30 seconds. See LT90 for details, but water and wind will screw with this gun, though only if you load it wet. If you load it dry and take it somewhere wet you're probably fine.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Pinfire</td>" +
            "<td><p>The first self-contained cartridge. Old fashioned, but not actually any slower to load than modern ammo. There are also no issues due to water.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Rimfire</td>" +
            "<td><p>Another self-contained cartridge. Old fashioned, but still in use today in the 22LR. There are also no issues due to water.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Centrefire</td>" +
            "<td><p>Modern ammo.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "firearm-barrels") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Multiple barrels multiply your max RoF, ammo capacity, and increase weight and cost. Each extra barrel costs and weighs 80% as much as the base gun. This increase in weight can also reduce Rcl and increase Bulk.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "firearm-bolt") {
        info = "<table>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Closed</td>" +
            "<td><p>Unless it's a machinegun, choose this. And if it is a machine gun, maybe still choose this.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Open</td>" +
            "<td><p>Cheaper, less accurate, but allows for a higher rate of fire and better cooling. Only really used in SMGs, or machine guns meant for continuous fire.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "projectile-calibre") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>The width of your bullets. Larger bullets are more massive and tend to carry more energy. Additionally, the calibre sets the wounding modifier.</p>" +
            "<p>Between 0 and 4 mm, the projectile does pi-</p>" +
            "<p>Between 4 and 8 mm, the projectile does pi-, unless it's higher velocity, in which case it does pi</p>" +
            "<p>Between 8 and 10 mm, the projectile does pi</p>" +
            "<p>Between 10 and 15 mm, the projectile does pi+</p>" +
            "<p>At 15 mm or more, the projectile does pi++</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "projectile-aspect") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>A ratio of 1 is a perfectly round ball. Values less than one are shorter than they are wide. Values greater than one are longer than they are wide. If you're not sure what to set here, a value of 1.25 to 2 is probably fine.</p>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>" +
            "<p>Generally higher aspect ratios will result in higher ranges.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "projectile-mass") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Heavier rounds tend to do more damage and carry that damage better at longer ranges.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "projectile-density") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>This is the resulting density of the projectile, based on the values you've given. Along with a material that most closely matches the given density. This is mostly here so you know what your bullets are made of.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
      }
    else if (id === "chamber-bore") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>The chamber bore sets the width of the space your powder fits into. The case length sets the length. More powder means more damage and range. It also means more weight, as there needs to be more material to contain the explosion.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "case-length") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>The case length sets the length of the space your powder fits into. The chamber bore sets the width. More powder means more damage and range. It also means more weight, as there needs to be more material to contain the explosion.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "cartridge-type") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Burn length is some genuinely complicated shit, so this is an easy way to handle it. If you're making a pistol, pick pistol. If you're making a rifle, pick rifle. High velocity pistols like the FN57 might choose rifle instead. Custom should only be used if you <i>know</i> a different value for burn length is appropriate.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "burn-length") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Burn length is some genuinely complicated shit, so you should usually just use the cartridge type dropdown to set this. The number here is just a ratio on the case length.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "powder-type") {
        info = "<table>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Black Powder</td>" +
            "<td><p>The OG way to shoot a mofo. Semi automatic and automatic weapons are theoretically possible with black powder, but they become fouled <i>very</i> quickly.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Smokeless Powder</td>" +
            "<td><p>Allows higher pressures and won't foul semiautomatic and automatic weapons.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Electrothermal Chemical</td>" +
            "<td><p>Increases damage and range by 50% over smokeless powder. Double cost. However your weapon also requires electrical power provided by a UT cell. You need to change cells every 10 magazines. A cell for pistols. B cell for SMGs, PDWs, Shotguns, rifles. C cell for heavier weapons. This weight is included in your weapon's final weight.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Electrothermal Kinetic</td>" +
            "<td><p>Increases damage and range by 100% over smokeless powder. +1 Acc for longarms. Double cost. However your weapon also requires electrical power provided by a UT cell. You need to change cells every 10 magazines. B cell for pistols. C cell for SMGs, PDWs, Shotguns, rifles. D cell for heavier weapons. This weight is included in your weapon's final weight.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "chamber-pressure") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>More pressure means faster bullets that do more damage at a longer range. It also increases the weapon's weight as it needs to contain the pressure, and the weight of the ammo as more propellant is needed to achive the requested pressure.</p>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>" +
            "<p>Set this as high as you like within the limits of the powder you've selected, just keep encumbrance in mind.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id === "magazine-style") {
        info = "<table>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Notes</td>" +
            "<td><p>The magazine style mostly exists to limit the weight and Bulk penalties for larger magainzes.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>None</td>" +
            "<td><p>There is no magazine. Use this for single shot weapons, breech loaders, and break actions.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Internal</td>" +
            "<td><p>All ammo is contained within the gun. Think tube magazines on shotguns, revolvers, or clip-fed rifles and pistols. Has the advantage of being lighter and can often be topped up without needing to dump the remaining ammo.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Standard</td>" +
            "<td><p>A standard detachable box magazine.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Extended</td>" +
            "<td><p>A standard detachable box magazine. Except longer.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>Drum</td>" +
            "<td><p>Like an extended magazine, but more compact.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td style='width: 50px; padding-right: 10px;'>High-Density</td>" +
            "<td><p>Like the coffin mags available for the AR-15. Even more compact than the drum.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "magazine-material") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Lighter materials are... lighter!</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "magazine-capacity") {
      info = "<table>" +
          "<tr>" +
          "<td><p>You can set this number as high as you like. But higher values mean more weight and worse Bulk.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "damage-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>The base damage of the weapon as designed, while using single solid shot.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "fit-to-owner") {
        info = "<table>" +
            "<tr>" +
            "<td><p>For +1 CF, your weapon was designed specifically for you. You get +1 to all skills while using it, exactly as with a Weapon Bond. Does not stack with Weapon Bond.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id === "acc-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>The base ACC before further modifiers. For shotshells, expect this to go down by 1.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "bulk-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Bulk is obviously a whole number. This is mostly showing the decimals so you've got an idea of how close or far you are to the next value.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "weight-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Output of various weight breakdowns.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "rate-of-fire") {
        info = "<table>" +
            "<tr>" +
            "<td><p>This is the per-barrel RoF. The multiplier for the barrels is applied afterwards.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "st-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>ST is obviously a whole number. This is mostly showing the decimals so you've got an idea of how close or far you are to the next value.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "rcl-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Rcl is obviously a whole number. This is mostly showing the decimals so you've got an idea of how close or far you are to the next value. The minimum Rcl is 2, unless the weapon is a laser or shotgun.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "range-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Half damage and max range, along with velocity. Velocity is only really relevant for specific option rules at extreme range.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "firearm-accuracy") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Some higher quality options are only available if the weapon's base ACC is sufficient. See HT79, but improving the weapon from Good to Fine or Very Fine can be done after the fact.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "firearm-reliability") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Improving Malf beyond 17 results in a Malf of 17+, which requires two successive crit fails to malfunction. See HT79, but improving the weapon from Good to Fine or Very Fine can be done after the fact.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "shots-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Shots and time to reload.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "malf-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Rolling this number or higher means the weapon malfunctions. (It might still fire, which might still count as a hit). 17+ means that two successive malfunctions must be rolled for the gun to malfunction.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "cps-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Base cost per shot, before any modifiers for ammo</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "cost-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Base cost, Cost Factor from any modifications, and final cost</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "case-type") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Base cost, Cost Factor from any modifications, and final cost</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "plusp") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Multiply damage, range, and ST by 1.1, multiply CPS by 1.5</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>Cheap guns, or guns from TL 6 or less, have -1 Malf when firing +P ammo.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "match-grade") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Match Grade ammo needs a gun with base Acc 4 to be effective, and it grants a +1 bonus to Acc. Double cost per shot.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>Handloaded Match Grade ammo needs a gun with base Acc 2 to be effective, and it grants a +1 bonus to Acc. At Acc 4 and up it grants a +2 bonus. Triple cost per shot.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "subsonic") {
        info = "<table>" +
            "<tr>" +
            "<td><p>For pistols this gives -1 Hearing and range is multiplied by 0.8</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>For other weapons this gives -2 Hearing, range and damage are multiplied by 0.6</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>Multiply CPS by 1.3</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "silent") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Makes the weapon silent. Use the 16 yard line on the hearing distance table on HT158.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>Multiply CPS by 10</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "poison") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Makes the weapon silent. Use the 16 yard line on the hearing distance table on HT158.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td><p>Multiply CPS by 10</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "inc") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Adds the incendiary damage modifier, which just adds +1 burning damage.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td><p>Multiply CPS by 1.5</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "tracer") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Adds the incendiary damage modifier, which just adds +1 burning damage. Also gives +1 to skill on subsequent turns following automatic fire.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td><p>Multiply CPS by 1.5</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "firearm-projectile-type") {
        info = "<table>" +
            "<tr>" +
            "<td><p>See high tech 165.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "number-of-shots") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Rather than add a shitload more dropdowns, the projectiles will automatically be as large as they can be, based on the quantity you select.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>You don't need to pick the specific numbers listed for Max Number of Shots, but they are generally the breakpoints you want to aim for. If any of the numbers are zero, then that just means there's not enough space for projectiles of that size.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>In theory, you can set this value even higher than the figure I give as the max for small piercing. Values as high as 3000 or 5000 are even technically allowed. However at that point you're shooting grains of sand at people and it's not going to do much damage. If any.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>My suggestion is to either pick the max value for the wounding type you want, or pick the number that best fits your desired Rof bonus.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "explosive-filler") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Select the type and quantity of explosive filler you want.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>REF is the Relative Explosive Force, with higher numbers being more explody.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>The slider sets the percentage of the projectile that is made up of explosive filler. You will almost always want to set this to it's maximum value.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "wps") {
        info = "<table>" +
            "<tr>" +
            "<td><p>The weight of one round. A single full load is factored into the weight of the weapon, additional rounds will need to be added separately.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "cps") {
        info = "<table>" +
            "<tr>" +
            "<td><p>The cost of one round. This is not added to the cost of the weapon.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "jewelry-style") {
      info = "<table>" +
          "<tr>" +
          "<td><p>This is the base style of jewelry.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "jewelry-material") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Not all of these materials make sense. But the math will work at least.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id === "jewelry-size") {
        info = "<table>" +
            "<tr>" +
            "<td><p>You may select any weight you like. The base weight listed here is for a small example of the item.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "gem-value") {
        info = "<table>" +
            "<tr>" +
            "<td><p>The baseline value is 100, but values between 10 and 1000 are reasonable for gemstones.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "jewelry-material-essential") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Essential materials are worth thirty times as much.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "travel-method") {
        info = "<table>" +
            "<tr>" +
            "<td><p>This setting is mostly to filter down the list of vehicles so it's easier to make a choice.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "fare-tl-range") {
        info = "<table>" +
            "<tr>" +
            "<td><p>This setting controls how low of a TL you're willing to choose from when selecting a vehicle. Setting this to zero only shows vehicles of the item's TL. Setting this to it's maximum value shows you all vehicles from your TL to TL 0.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "travel-distance") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Select the type and number of units. Units are arranged in order of size.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "travel-vehicle") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Select the type of vehicle you'd like to travel on. For more detailed stats, check the vehicle catalogue.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "travel-time") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>This is the travel time, broken down by terrain type or wind direction if applicable.</p>" +
            "<p>It also accounts for the fact that only air and naval vessels travel 24 hours a day.</p>" +
            "</td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "travel-hours") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>The number of hours per day you're underway. For naval or air vessels this should be 24 hours a day.</p>" +
            "<p>For ground vehicles this should be 8 hours a day, but you can push it as high as 16 hours a day</p>" +
            "<p>Vehicles drawn by draft animals need to stop for 1.3 hours after each 8 hour leg to rest. This is factored into the calculation, and is why you might not be able to enter values between 8 and 9.3</p>" +
            "</td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "travel-costs") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>An itemized lists of costs, including the impact of your provisions on the remaining cargo space in the ship.</p>" +
            "</td>" +
            "</tr>" +
            "</table>"
      }
    else if (id === "chemcial-laser-shots") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>The number of shots in one tank of chemicals. Increases the cost and weight.</p>" +
            "</td>" +
            "</tr>" +
            "</table>"
      }
    this.system.info = info;

    this.update({ 'system.info': this.system.info });
  }
}
