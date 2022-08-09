import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { skillHelpers } from '../../helpers/skillHelpers.js';
import { materialHelpers } from "../../helpers/materialHelpers.js";
import { distanceHelpers } from "../../helpers/distanceHelpers.js";
import { economicHelpers } from "../../helpers/economicHelpers.js";
import { actorHelpers } from "../../helpers/actorHelpers.js";
import { generalHelpers } from "../../helpers/generalHelpers.js";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class gurpsItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
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

    switch (this.data.type) {
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
      default: // not a supported type
        return ui.notifications.error("This type of item is not supported in the system!");
    }
    this.prepareAttackData();
  }

  validateEquipmentBasics() {
    // Check for undefined on cost, weight, and quantity
    if (typeof this.data.data.cost === undefined || typeof this.data.data.cost == null) { // Undefined set to 0
      this.data.data.cost = 0;
    }
    if (typeof this.data.data.weight === undefined || typeof this.data.data.weight == null) { // Undefined set to 0
      this.data.data.weight = 0;
    }
    if (typeof this.data.data.quantity === undefined || typeof this.data.data.quantity == null) { // Undefined set to 0
      this.data.data.quantity = 0;
    }

    this.data.data.cost = Math.round(+this.data.data.cost * 100) / 100;
    this.data.data.weight = Math.round(+this.data.data.weight * 100000) / 100000;
    this.data.data.quantity = Math.round(+this.data.data.quantity);

    // Calculated total weight and cost
    this.data.data.ttlCost = Math.round((+this.data.data.cost * +this.data.data.quantity) * 100) / 100;
    this.data.data.ttlWeight = Math.round((+this.data.data.weight * +this.data.data.quantity) * 100) / 100;

    // Constrain TL to valid values
    if (typeof this.data.data.tl === undefined || this.data.data.tl == null || this.data.data.tl === "") { // If it's undefined, blank, or null, set to default.
      this.data.data.tl = game.settings.get("gurps4e", "campaignTL");
    }
    if (this.data.data.tl < 0){ // Too low
      this.data.data.tl = 0;
    }
    else if (this.data.data.tl > 12){ // Too high
      this.data.data.tl = 12;
    }

    //Constrain LC to valid values
    if (typeof this.data.data.lc === undefined || typeof this.data.data.lc == null) { // Undefined set to 4 (Open)
      this.data.data.lc = 4;
    }
    if (this.data.data.lc < 0){ // Too low
      this.data.data.lc = 0;
    }
    else if (this.data.data.lc > 4){ // Too high
      this.data.data.lc = 4;
    }
  }

  _prepareEquipmentData() {
    this.validateEquipmentBasics();
  }

  _prepareCustomArmourData() {
    this.validateEquipmentBasics();

    if (this.data.data.armour.bodyType.body) {
      if (typeof this.data.data.armourDesign == "undefined"){
        this.data.data.armourDesign = {
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
      this.data.data.armourDesign.materials = game.materialAPI.fetchArmourMaterials();
      this.data.data.armourDesign.constructionTypes = game.materialAPI.fetchArmourConstructionMethods();

      // Get game settings relevant to the design of the laser
      this.data.data.armourDesign.allowMagicalMaterialsForCustom = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");
      this.data.data.armourDesign.scalingMethodForCustomArmour = game.settings.get("gurps4e", "scalingMethodForCustomArmour");
      this.data.data.armourDesign.adjustedHoldoutPenaltyForCustomArmour = game.settings.get("gurps4e", "adjustedHoldoutPenaltyForCustomArmour");

      // Validations
      if(this.data.data.armourDesign.holdoutReduction < 0) { // If it's less than zero
        this.data.data.armourDesign.holdoutReduction = 0; // Set it to zero
      }
      else { // If it's zero or above
        this.data.data.armourDesign.holdoutReduction = Math.floor(this.data.data.armourDesign.holdoutReduction); // Round down, decimals are not allowed
      }

      if (this.data.data.tl < 6) { // TL Less than 6, remove sealed.
        this.data.data.armourDesign.sealed = false;
      }

      if (this.data.data.tl < 6) { // TL is too low for sealed
        this.data.data.armourDesign.sealed = false;
      }

      // Check if there is an actor to fetch stats from
      this.data.data.armourDesign.getSizeFromActor = false;
      if (this.actor) { // If there's an actor
        if (this.actor.data) {
          if (this.actor.data.data) {
            this.data.data.armourDesign.getSizeFromActor = true;
            if (this.data.data.armourDesign.scalingMethodForCustomArmour == "weight") { // Scaling using the rules from Pyramid 3-52:16
              this.data.data.armourDesign.scalingMultiplier = (this.actor.data.data.bio.weight.value / 150) ** (2/3);
            }
            else if (this.data.data.armourDesign.scalingMethodForCustomArmour == "sm") { // Scaling using the rules from LTC2:21
              this.data.data.armourDesign.scalingMultiplier = ((distanceHelpers.sizeToDistance(this.actor.data.data.bio.sm.value) / 10) ** 2);
            }
            else if (this.data.data.armourDesign.scalingMethodForCustomArmour == "height") { // Scaling based off the rules from LTC2:21, but gradually scaled based on height.
              this.data.data.armourDesign.scalingMultiplier = (((5 / 36 * this.actor.data.data.bio.height.value) / 10)  ** 2);
            }
            else {
              this.data.data.armourDesign.scalingMultiplier = 1;
            }
          }
        }
      }
      else { // There is no actor
        if (this.data.data.armourDesign.scalingMethodForCustomArmour == "weight") { // Scaling using the rules from Pyramid 3-52:16
          this.data.data.armourDesign.scalingMultiplier = (this.data.data.armourDesign.inputWeight / 150) ** (2/3);
        }
        else if (this.data.data.armourDesign.scalingMethodForCustomArmour == "sm") { // Scaling using the rules from LTC2:21
          this.data.data.armourDesign.scalingMultiplier = ((distanceHelpers.sizeToDistance(this.data.data.armourDesign.inputSM) / 10) ** 2);
        }
        else if (this.data.data.armourDesign.scalingMethodForCustomArmour == "height") { // Scaling based off the rules from LTC2:21, but gradually scaled based on height.
          this.data.data.armourDesign.scalingMultiplier = (((5 / 36 * this.data.data.armourDesign.inputHeight) / 10)  ** 2);
        }
        else {
          this.data.data.armourDesign.scalingMultiplier = 1;
        }
      }

      let bodyParts = Object.keys(this.data.data.armour.bodyType.body);
      this.data.data.armourDesign.hasPlate    = false;
      this.data.data.armourDesign.hasScale    = false;
      this.data.data.armourDesign.hasMail     = false;
      this.data.data.armourDesign.hasCloth    = false;
      this.data.data.armourDesign.hasLeather  = false;
      this.data.data.armourDesign.hasSteel    = false;
      this.data.data.armourDesign.hasSole     = false;
      this.data.data.armourDesign.soles       = 0;
      this.data.data.armourDesign.hasKick     = false;
      this.data.data.armourDesign.hasPunch    = false;

      this.data.data.armourDesign.unitCost = 0;
      this.data.data.armourDesign.unitWeight = 0;
      this.data.data.armourDesign.unitDonTime = 0;
      this.data.data.armourDesign.donTime = 0;

      this.data.data.armourDesign.holdout = 0;
      for (let i = 0; i < bodyParts.length; i++) { // Loop through body parts
        if (getProperty(this.data.data.armour.bodyType.body, bodyParts[i] + ".subLocation")) { // Part has sub parts
          let subParts = getProperty(this.data.data.armour.bodyType.body, bodyParts[i] + ".subLocation");
          let subPartKeys = Object.keys(subParts);

          for (let n = 0; n < subPartKeys.length; n++) { // Loop through sub parts
            let currentSubPart = getProperty(this.data.data.armour.bodyType.body, bodyParts[i] + ".subLocation." + subPartKeys[n]);

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
          let currentPart = getProperty(this.data.data.armour.bodyType.body, bodyParts[i]);

          this.prepareLocationalCustomArmour(currentPart);
        }
      }

      if (!this.data.data.armourDesign.hasSole || this.data.data.tl < 2) { // Either no sole or less than TL 2
        this.data.data.armourDesign.hobnails = false;
      }

      if (!this.data.data.armourDesign.hasSteel) { // There is no steel, so the steel can't be hardened
        this.data.data.armourDesign.steelHardening = "";
      }

      if (this.data.data.armourDesign.hasSteel && !this.data.data.armourDesign.hasPlate) { // There is steel, but not in the form of plate
        this.data.data.armourDesign.steelHardening = "hardened";
      }

      if (!this.data.data.armourDesign.hasPlate && !this.data.data.armourDesign.hasScale) { // There is neither plate nor scale, so there can be no fluting
        this.data.data.armourDesign.fluting = false;
      }

      if (!this.data.data.armourDesign.hasMail) { // There is no mail, so there can't be mail variants
        this.data.data.armourDesign.banded = false;
        this.data.data.armourDesign.butted = false;
      }

      if (!this.data.data.armourDesign.hasCloth) { // There is no cloth, so there can't be cloth variants
        this.data.data.armourDesign.silk = false;
        this.data.data.armourDesign.paper = false;
      }

      if (!this.data.data.armourDesign.hasLeather && !this.data.data.armourDesign.hasCloth) { // There is neither cloth nor leather, so there can be no reinforcement
        this.data.data.armourDesign.reinforced = false;
      }

      if (!this.data.data.armourDesign.hasScale) { // There is no scale, so there can't be scale variants
        this.data.data.armourDesign.mountain = false;
      }

      if (!this.data.data.armourDesign.hasLeather) { // There is no leather, so there can't be leather variants
        this.data.data.armourDesign.leatherQuality = "";
      }

      if (!this.data.data.armourDesign.concealed) { // The armour is not concealed, unset concealment settings.
        this.data.data.armourDesign.holdoutReduction = 0;
        this.data.data.armourDesign.concealedClothing = "";
        this.data.data.armourDesign.clothingStatus = 0;
        this.data.data.armourDesign.undercoverClothing = "";
      }

      // Hobnail cost and weight handling
      if (this.data.data.armourDesign.hasSole && this.data.data.armourDesign.soles >= 1 && this.data.data.armourDesign.hobnails) {
        this.data.data.armourDesign.unitCost += this.data.data.armourDesign.soles * 12.5;
        this.data.data.armourDesign.unitWeight += this.data.data.armourDesign.soles * 0.5;
      }

      // Calculate Status Equivalent
      if (this.data.data.armourDesign.unitCost >= 0) {
        if (this.data.data.armourDesign.unitCost <= 240) {
          this.data.data.armourDesign.statusEq = "0 - Freeman, apprentice, ordinary citizen";
        }
        else if (this.data.data.armourDesign.unitCost <= 480) {
          this.data.data.armourDesign.statusEq = "1 - Squire, merchant, priest, doctor, councilor";
        }
        else if (this.data.data.armourDesign.unitCost <= 1200) {
          this.data.data.armourDesign.statusEq = "2 - Landless knight, mayor, business leader";
        }
        else if (this.data.data.armourDesign.unitCost <= 4800) {
          this.data.data.armourDesign.statusEq = "3 - Landed knight, guild master, big city mayor";
        }
        else if (this.data.data.armourDesign.unitCost <= 24000) {
          this.data.data.armourDesign.statusEq = "4 - Lesser noble, congressional representative, Who’s Who";
        }
        else if (this.data.data.armourDesign.unitCost <= 240000) {
          this.data.data.armourDesign.statusEq = "5 - Great noble, multinational corporate boss";
        }
        else if (this.data.data.armourDesign.unitCost <= 2400000) {
          this.data.data.armourDesign.statusEq = "6 - Royal family, governor";
        }
        else if (this.data.data.armourDesign.unitCost <= 24000000) {
          this.data.data.armourDesign.statusEq = "7 - King, pope, president";
        }
        else if (this.data.data.armourDesign.unitCost <= 240000000) {
          this.data.data.armourDesign.statusEq = "8 - Emperor, god-king, overlord";
        }
      }

      // Can pass for
      if (this.data.data.armourDesign.armourPercent <= (1/6)) {
        this.data.data.armourDesign.canPassFor = "Swimwear, underwear, or other diaphanous clothing";
        this.data.data.lc = 4;
      }
      else if (this.data.data.armourDesign.armourPercent <= (1/4)) {
        this.data.data.armourDesign.canPassFor = "Light clothing such as T-shirts, evening wear, skintight suits, etc. and be worn beneath clothes";
        this.data.data.lc = 4;
      }
      else if (this.data.data.armourDesign.armourPercent <= (1/2)) {
        this.data.data.armourDesign.canPassFor = "Concealed under clothing or pass as ordinary civilian outerwear";
        this.data.data.lc = 3;
      }
      else {
        this.data.data.armourDesign.canPassFor = "Not concealable. It can only pass as heavy clothing such as a trench coat, biker leathers, etc";
        this.data.data.lc = 2;
      }

      let clothingCF = 1;
      let clothingWM = 1;
      this.data.data.armourDesign.clothingCost = 0;
      this.data.data.armourDesign.clothingWeight = 0;
      // Handle cost and weight for armour concealed within clothing
      if (this.data.data.armourDesign.concealed) { // If it's concealed, run concealment related code
        // Tailoring applies to the clothing as well
        if (this.data.data.armourDesign.tailoring.toLowerCase() == "expert") {
          clothingCF = clothingCF + 5;
          clothingWM = clothingWM - 0.15;
        }
        else if (this.data.data.armourDesign.tailoring.toLowerCase() == "master") {
          clothingCF = clothingCF +29
          clothingWM = clothingWM - 0.3;
        }

        if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "swimwear") {
          this.data.data.armourDesign.clothingCost = economicHelpers.getColByStatus(this.data.data.armourDesign.clothingStatus) * 0.05;
          this.data.data.armourDesign.clothingWeight = 0.5;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "summer") {
          this.data.data.armourDesign.clothingCost = economicHelpers.getColByStatus(this.data.data.armourDesign.clothingStatus) * 0.10;
          this.data.data.armourDesign.clothingWeight = 1;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "standard") {
          this.data.data.armourDesign.clothingCost = economicHelpers.getColByStatus(this.data.data.armourDesign.clothingStatus) * 0.20;
          this.data.data.armourDesign.clothingWeight = 2;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "winter") {
          this.data.data.armourDesign.clothingCost = economicHelpers.getColByStatus(this.data.data.armourDesign.clothingStatus) * 0.30;
          this.data.data.armourDesign.clothingWeight = 5;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "longcoat") {
          this.data.data.armourDesign.clothingCost = 50;
          this.data.data.armourDesign.clothingWeight = 5;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "leatherLongCoat") {
          this.data.data.armourDesign.clothingCost = 100;
          this.data.data.armourDesign.clothingWeight = 10;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "lightQualityLeatherLongCoat") {
          this.data.data.armourDesign.clothingCost = 250;
          this.data.data.armourDesign.clothingWeight = 5;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "qualityLeatherLongCoat") {
          this.data.data.armourDesign.clothingCost = 500;
          this.data.data.armourDesign.clothingWeight = 10;
        }
        else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "habit") {
          this.data.data.armourDesign.clothingCost = economicHelpers.getColByStatus(this.data.data.armourDesign.clothingStatus) * 0.35;
          this.data.data.armourDesign.clothingWeight = 6;
        }
        else {
          this.data.data.armourDesign.clothingCost = 0;
          this.data.data.armourDesign.clothingWeight = 0;
        }

        if (this.data.data.armourDesign.undercoverClothing == "1") {
          clothingCF += 4;
        }
        else if (this.data.data.armourDesign.undercoverClothing == "2") {
          clothingCF += 19;
        }

        this.data.data.armourDesign.clothingCost = this.data.data.armourDesign.clothingCost * clothingCF;
        this.data.data.armourDesign.clothingWeight = this.data.data.armourDesign.clothingWeight * clothingWM;
      }

      if (this.data.data.armourDesign.clothingCost > this.data.data.armourDesign.unitCost) {
        this.data.data.cost = (this.data.data.armourDesign.unitCost * 0.8) + this.data.data.armourDesign.clothingCost;
      }
      else {
        this.data.data.cost = this.data.data.armourDesign.unitCost + (this.data.data.armourDesign.clothingCost * 0.8);
      }

      if (this.data.data.armourDesign.clothingWeight > this.data.data.armourDesign.unitWeight) {
        this.data.data.weight = (this.data.data.armourDesign.unitWeight * 0.8) + this.data.data.armourDesign.clothingWeight;
      }
      else {
        this.data.data.weight = this.data.data.armourDesign.unitWeight + (this.data.data.armourDesign.clothingWeight * 0.8);
      }

      if (this.data.data.armourDesign.punch || this.data.data.armourDesign.kick) {
        this.addUnarmedProfiles(this.data.data.armourDesign.punch, this.data.data.armourDesign.kick);
      }

      this.data.data.ttlWeight = this.data.data.weight * this.data.data.quantity;
      this.data.data.ttlCost = this.data.data.cost * this.data.data.quantity;
    }
  }

  addUnarmedProfiles(punch, kick) {
    let unarmedST = 10;
    if (this.actor) { // If there's an actor
      if (this.actor.data) {
        if (this.actor.data.data) {
          unarmedST = actorHelpers.fetchStat(this.actor, "st");
        }
      }
    }

    let punchRow = {};
    let kickRow = {};

    if (punch) {
      punchRow = { // Init the new melee row using the values from the custom weapon
        "name": "Punch",
        "skill": this.data.data.armourDesign.punchSkill,
        "skillMod": this.data.data.armourDesign.punchSkillMod,
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
        "skill": this.data.data.armourDesign.kickSkill,
        "skillMod": this.data.data.armourDesign.kickSkillMod,
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
      this.data.data.melee = [punchRow, kickRow];
    }
    else if (kick) {
      this.data.data.melee = [kickRow];
    }
    else if (punch) {
      this.data.data.melee = [punchRow];
    }
  }

  prepareLocationalCustomArmour(currentSubPart) {
    if (typeof currentSubPart.material != "undefined") {
      if (currentSubPart.material.name) {
        if (this.data.data.armourDesign.allowMagicalMaterialsForCustom) {
          currentSubPart.material = game.materialAPI.getAndCalculateArmourMaterialByName(currentSubPart.material.name, currentSubPart.material.essential);
        }
        else {
          currentSubPart.material = game.materialAPI.getAndCalculateArmourMaterialByName(currentSubPart.material.name, false);
        }
        if (currentSubPart.material.name.toLowerCase().includes("steel")){
          this.data.data.armourDesign.hasSteel = true;
        }
        else if (currentSubPart.material.name.toLowerCase().includes("leather")){
          this.data.data.armourDesign.hasLeather = true;
        }
        else if (currentSubPart.material.name.toLowerCase().includes("cloth")){
          this.data.data.armourDesign.hasCloth = true;
        }
      }
    }

    if (typeof currentSubPart.construction != "undefined") {
      if (currentSubPart.construction.name) {
        currentSubPart.construction = game.materialAPI.getArmourConstructionMethodByName(currentSubPart.construction.name);
        if (typeof currentSubPart.construction.name != "undefined") {
          if (currentSubPart.construction.name.toLowerCase().includes("plate")) {
            this.data.data.armourDesign.hasPlate = true;
          }
          else if (currentSubPart.construction.name.toLowerCase().includes("scale")) {
            this.data.data.armourDesign.hasScale = true;
          }
          else if (currentSubPart.construction.name.toLowerCase().includes("mail")) {
            this.data.data.armourDesign.hasMail = true;
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
          this.data.data.armourDesign.hasSole = true; // Set the flag true
          this.data.data.armourDesign.soles += 1; // Add to the sole count to account for quadrupeds, etc.
        }
        if (currentSubPart.label.toLowerCase().includes("foot") && !currentSubPart.material.name.includes("no armour") && ((currentSubPart.selectedDR >= 1 && !currentSubPart.construction.flexible) || (currentSubPart.selectedDR >= 2))) { // There is a foot, it has a material, and it has 1 DR and it's not flexible, or it has 2 DR and is flexible
          this.data.data.armourDesign.hasKick = true; // Set the flag true
        }
        if (currentSubPart.label.toLowerCase().includes("hand") && !currentSubPart.material.name.includes("no armour") && ((currentSubPart.selectedDR >= 1 && !currentSubPart.construction.flexible) || (currentSubPart.selectedDR >= 2))) { // There is a hand, it has a material, and it has 1 DR and it's not flexible, or it has 2 DR and is flexible
          this.data.data.armourDesign.hasPunch = true; // Set the flag true
        }

        if (currentSubPart.selectedDR >= currentSubPart.construction.minDR && currentSubPart.selectedDR <= currentSubPart.material.maxDR) { // DR is between max and min

          if (this.data.data.armourDesign.tailoring.toLowerCase() == "cheap") {
            cf = cf -0.6
            drModifier = drModifier - 1;
          }
          else if (this.data.data.armourDesign.tailoring.toLowerCase() == "expert") {
            cf = cf + 5;
            weightModifier = weightModifier - 0.15;
          }
          else if (this.data.data.armourDesign.tailoring.toLowerCase() == "master") {
            cf = cf +29
            weightModifier = weightModifier - 0.3;
          }

          if (this.data.data.armourDesign.style.toLowerCase() == "1") {
            cf += 1;
          }
          else if (this.data.data.armourDesign.style.toLowerCase() == "2") {
            cf += 4;
          }
          else if (this.data.data.armourDesign.style.toLowerCase() == "3") {
            cf += 9;
          }

          // This piece is made of steel, and the user has selected either hardened or duplex
          if (currentSubPart.material.name.toLowerCase().includes("steel") && (this.data.data.armourDesign.steelHardening.toLowerCase().includes("hardened") || this.data.data.armourDesign.steelHardening.toLowerCase().includes("duplex"))) {
            if (this.data.data.armourDesign.steelHardening.toLowerCase().includes("hardened")) {
              cf += 4;
              drModifier += 1;
            }
            else if (this.data.data.armourDesign.steelHardening.toLowerCase().includes("duplex")) {
              cf += 8;
              weightModifier = weightModifier - 0.1;
              drModifier += 1;
            }
          }

          // This piece is made of leather, and the user has selected a leather customization
          if ((currentSubPart.material.name.toLowerCase().includes("leather")) && (this.data.data.armourDesign.leatherQuality.toLowerCase() == "rawhide" || this.data.data.armourDesign.leatherQuality.toLowerCase() == "quality")) {
            if (this.data.data.armourDesign.leatherQuality.toLowerCase() == "rawhide") {
              cf = cf -0.6;
              // TODO - x0.5 HP
            }
            else if (this.data.data.armourDesign.leatherQuality.toLowerCase() == "quality") {
              cf = cf + 4;
              drModifier += 1;
            }
          }

          // Handle bonus DR from leather coat options
          if (this.data.data.armourDesign.concealedClothing) {
            if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "leatherlongcoat" || this.data.data.armourDesign.concealedClothing.toLowerCase() == "lightqualityleatherlongcoat" || this.data.data.armourDesign.concealedClothing.toLowerCase() == "qualityleatherlongcoat") {
              let leatherCoatBonus = 1; // Most of the coats give +1 DR
              if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "qualityleatherlongcoat") { // Quality heavy leather coats give +2
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
          this.data.data.armourDesign.donTime += currentSubPart.donTime

          // This piece is made of either plate or scale, and the user has selected fluting
          if ((currentSubPart.construction.name.toLowerCase().includes("scale") || currentSubPart.construction.name.toLowerCase().includes("plate")) && this.data.data.armourDesign.fluting) {
            cf += 4;
            weightModifier = weightModifier - 0.1;
          }

          // This piece is made of mail, and the user has selected a mail customization
          if ((currentSubPart.construction.name.toLowerCase().includes("mail")) && (this.data.data.armourDesign.banded || this.data.data.armourDesign.butted)) {
            if (this.data.data.armourDesign.banded) {
              cf += 0.5;
              weightModifier = weightModifier + 0.5;
              currentSubPart.drCr += 2;
            }
            else if (this.data.data.armourDesign.butted) {
              cf = cf - 0.6;
              currentSubPart.drImp = Math.max(currentSubPart.drImp - 3, 0) // DR is at least zero
            }
          }

          // This piece is made of cloth, and the user has selected a cloth customization
          if ((currentSubPart.material.name.toLowerCase().includes("cloth")) && (this.data.data.armourDesign.silk || this.data.data.armourDesign.paper)) {
            if (this.data.data.armourDesign.paper) {
              cf -= 0.25;
            }
            else if (this.data.data.armourDesign.silk) {
              cf += 19;
              currentSubPart.drImp += 1;
              currentSubPart.drCut += 1;
            }
          }

          // This piece is made of cloth or leather, and the user has selected a reinforcement
          if ((currentSubPart.material.name.toLowerCase().includes("cloth") || currentSubPart.material.name.toLowerCase().includes("leather")) && this.data.data.armourDesign.reinforced) {
            cf += 0.25;
            weightModifier += 0.25;
            currentSubPart.drCut += 1;
          }

          // This piece is made of scale, and the user has selected mountain scale
          if (currentSubPart.construction.name.toLowerCase().includes("scale") && this.data.data.armourDesign.mountain) {
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

          cf += this.data.data.armourDesign.holdoutReduction; // Add the cost factor for the holdout reduction.

          cf = Math.max(cf, 0.2) // Cost factor can't go less than 80%
          weightModifier = Math.max(weightModifier, 0.2) // Weight mod can't go less than 80%

          currentSubPart.weight = currentSubPart.surfaceArea * currentSubPart.material.wm * currentSubPart.construction.wm * currentSubPart.selectedDR * weightModifier;
          if (currentSubPart.material.costLTTL <= this.data.data.tl) { // The current TL is at or under the tl breakpoint
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

        if (this.data.data.armourDesign.sealed && this.data.data.tl >= 6) { // Armour is sealed and the TL is high enough for it to actually be sealed.
          if (this.data.data.tl >= 8) { // At TL 8+, sealed is 5$ per square foot
            currentSubPart.cost = currentSubPart.cost + (currentSubPart.surfaceArea * 5);
          }
          else { // At TL 7-, sealed is 10$ per square foot
            currentSubPart.cost = currentSubPart.cost + (currentSubPart.surfaceArea * 10);
          }
        }

        this.data.data.armourDesign.armourPercent = Math.max(currentSubPart.armourPercent, this.data.data.armourDesign.armourPercent) // Always use the worst (highest) value

        this.data.data.armourDesign.donTime = Math.round(this.data.data.armourDesign.donTime);
        this.data.data.armourDesign.unitWeight += currentSubPart.weight;
        this.data.data.armourDesign.unitCost += currentSubPart.cost;

        // Holdout
        if (this.data.data.armourDesign.adjustedHoldoutPenaltyForCustomArmour.toLowerCase() == "") {
          if (currentSubPart.flexible) {
            currentSubPart.holdout = currentSubPart.selectedDR / 3;
          }
          else {
            currentSubPart.holdout = currentSubPart.selectedDR;
          }
        }
        else if (this.data.data.armourDesign.adjustedHoldoutPenaltyForCustomArmour.toLowerCase() == "weight") {
          if (currentSubPart.flexible) {
            currentSubPart.holdout = currentSubPart.selectedDR / 3 * (currentSubPart.material.wm / 0.9);
          }
          else {
            currentSubPart.holdout = currentSubPart.selectedDR * (currentSubPart.material.wm / 0.6);
          }
        }
        else if (this.data.data.armourDesign.adjustedHoldoutPenaltyForCustomArmour.toLowerCase() == "thickness") {
          if (currentSubPart.flexible) {
            currentSubPart.holdout = currentSubPart.selectedDR / 3 * (currentSubPart.material.drPerIn / 8);
          }
        else {
            currentSubPart.holdout = currentSubPart.selectedDR * (currentSubPart.material.drPerIn / 68);
          }
        }

        if (this.data.data.armourDesign.concealed) { // If it's concealed, run concealment related code
          currentSubPart.holdout = Math.max(currentSubPart.holdout - this.data.data.armourDesign.holdoutReduction, 0); // Apply any holdout penalty reduction, but only remove penalties, don't grant any bonus.
        }

        currentSubPart.holdout *= -1; // Flip the holdout penalty to negative

        if (this.data.data.armourDesign.concealed) { // If it's concealed, run concealment related code
          if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "swimwear") {
            currentSubPart.holdout = currentSubPart.holdout - 5;
          }
          else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "summer") {
            currentSubPart.holdout = currentSubPart.holdout - 3;
          }
          else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "winter") {
            currentSubPart.holdout = currentSubPart.holdout + 3;
          }
          else if (this.data.data.armourDesign.concealedClothing.toLowerCase().includes("longcoat")) {
            currentSubPart.holdout = currentSubPart.holdout + 4;
          }
          else if (this.data.data.armourDesign.concealedClothing.toLowerCase() == "habit") {
            currentSubPart.holdout = currentSubPart.holdout + 5;
          }

          if (this.data.data.armourDesign.undercoverClothing == "1") {
            currentSubPart.holdout += 1;
          }
          else if (this.data.data.armourDesign.undercoverClothing == "2") {
            currentSubPart.holdout += 2;
          }
        }

        this.data.data.armourDesign.holdout = Math.min(this.data.data.armourDesign.holdout, currentSubPart.holdout);
      }
    }
  }

  _prepareCustomWeaponData() {
    this.validateEquipmentBasics();

    if (typeof this.data.data.customType == "undefined" || this.data.data.customType == null || this.data.data.customType == "") {
      this.data.data.customType = "bow"
    }

    switch (this.data.data.customType) {
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
  }

  prepareCustomFirearm() {
    if (this.data.data.tl >= 3) { // TL must be at least 3 to design a custom gun
      if (typeof this.data.data.firearmDesign == "undefined" || (typeof this.data.data.firearmDesign != "undefined" && !this.data.data.firearmDesign.initComplete)) { // If the firearmDesign block hasn't yet been created
        this.data.data.firearmDesign = { // Create it
          "barrelLength": 100, // Measured in mm
          "barrels": 1, // At least one, whole numbers
          "configuration": "pistol", // cannon/pistol/bullpup/longarm/semiportable
          "rifling": this.data.data.tl >= 5, // At or above TL5 barrels default rifled.
          "bolt": "closed", // closed/open
          "action": "semi", // muzzle/breech/break/bolt/straightPull/lever/pump/revolverSA/revolverDA/semi/auto/burst/highCyclicBurst
          "lock": "centre", // cannon/match/wheel/flint/cap/pin/rim/centre
          "allowTL4BreechLoaders": game.settings.get("gurps4e", "allowTL4BreechLoaders"),

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

      this.data.data.lc = 3;

      // Input Validation
      if (typeof this.data.data.firearmDesign.barrelLength == "undefined" || this.data.data.firearmDesign.barrelLength <= 0 || this.data.data.firearmDesign.barrelLength == "") {
        this.data.data.firearmDesign.barrelLength = 100;
      }
      if (typeof this.data.data.firearmDesign.barrels == "undefined" || this.data.data.firearmDesign.barrels <= 0 || this.data.data.firearmDesign.barrels == "") {
        this.data.data.firearmDesign.barrels = 1;
      }
      if (typeof this.data.data.firearmDesign.projectileCalibre == "undefined" || this.data.data.firearmDesign.projectileCalibre <= 0 || this.data.data.firearmDesign.projectileCalibre == "") {
        this.data.data.firearmDesign.projectileCalibre = 10;
      }
      if (typeof this.data.data.firearmDesign.projectileMass == "undefined" || this.data.data.firearmDesign.projectileMass <= 0 || this.data.data.firearmDesign.projectileMass == "") {
        this.data.data.firearmDesign.projectileMass = 100;
      }
      if (typeof this.data.data.firearmDesign.projectileAspectRatio == "undefined" || this.data.data.firearmDesign.projectileAspectRatio <= 0 || this.data.data.firearmDesign.projectileAspectRatio == "") {
        this.data.data.firearmDesign.projectileAspectRatio = 1;
      }
      if (typeof this.data.data.firearmDesign.chamberBore == "undefined" || this.data.data.firearmDesign.chamberBore <= 0 || this.data.data.firearmDesign.chamberBore == "") {
        this.data.data.firearmDesign.chamberBore = 10;
      }
      if (typeof this.data.data.firearmDesign.caseLength == "undefined" || this.data.data.firearmDesign.caseLength <= 0 || this.data.data.firearmDesign.caseLength == "") {
        this.data.data.firearmDesign.caseLength = 100;
      }
      if (typeof this.data.data.firearmDesign.burnRatio == "undefined" || this.data.data.firearmDesign.burnRatio <= 0 || this.data.data.firearmDesign.burnRatio > 1 || this.data.data.firearmDesign.burnRatio == "") {
        this.data.data.firearmDesign.burnRatio = 0.35;
      }
      if (typeof this.data.data.firearmDesign.chamberPressure == "undefined" || this.data.data.firearmDesign.chamberPressure <= 0 || this.data.data.firearmDesign.chamberPressure == "") {
        this.data.data.firearmDesign.chamberPressure = 15000;
      }
      if (typeof this.data.data.firearmDesign.capacity == "undefined" || this.data.data.firearmDesign.capacity <= 0 || this.data.data.firearmDesign.capacity == "") {
        this.data.data.firearmDesign.capacity = 1;
      }
      if (typeof this.data.data.firearmDesign.weightTweak == "undefined" || this.data.data.firearmDesign.weightTweak <= 0 || this.data.data.firearmDesign.weightTweak == "") {
        this.data.data.firearmDesign.weightTweak = 1;
      }
      if (typeof this.data.data.firearmDesign.cf == "undefined" || this.data.data.firearmDesign.cf <= 0 || this.data.data.firearmDesign.cf == "") {
        this.data.data.firearmDesign.cf = 1;
      }

      this.data.data.firearmDesign.explosives = game.materialAPI.fetchExplosives();

      // The weapon is a muzzle loader, breach loader, or break action and magazine related info will be hidden
      if (this.data.data.firearmDesign.action === "break" || this.data.data.firearmDesign.action === "breech" || this.data.data.firearmDesign.action === "muzzle") {
        this.data.data.firearmDesign.magazineStyle = "none";
        this.data.data.firearmDesign.magazineMaterial = "steel";
        this.data.data.firearmDesign.capacity = 0;
        this.data.data.firearmDesign.rof = 1;
      }

      // The weapon is not some version of semi or automatic, and open/closed bolt info will be hidden
      if (this.data.data.firearmDesign.action === "break" ||
          this.data.data.firearmDesign.action === "breech" ||
          this.data.data.firearmDesign.action === "muzzle" ||
          this.data.data.firearmDesign.action === "bolt" ||
          this.data.data.firearmDesign.action === "straightPull" ||
          this.data.data.firearmDesign.action === "lever" ||
          this.data.data.firearmDesign.action === "pump" ||
          this.data.data.firearmDesign.action === "revolverSA" ||
          this.data.data.firearmDesign.action === "revolverDA") {
        this.data.data.firearmDesign.bolt = "closed";
      }

      // Rifling does not become available until TL4
      if (this.data.data.tl < 4) {
        this.data.data.firearmDesign.rifling = false;
      }

      this.data.data.firearmDesign.allowTL4BreechLoaders = game.settings.get("gurps4e", "allowTL4BreechLoaders");

      // Begin calculations proper

      // Burn length calculations
      if (this.data.data.firearmDesign.cartridgeType == "pistol") {
        this.data.data.firearmDesign.burnRatio = 7 / 24;
      }
      else if (this.data.data.firearmDesign.cartridgeType == "rifle") {
        this.data.data.firearmDesign.burnRatio = 7 / 16
      }

      this.data.data.firearmDesign.burnLength = this.data.data.firearmDesign.burnRatio * this.data.data.firearmDesign.caseLength;

      // Prerequisite Calculations
      let barrelBoreMetres        = this.data.data.firearmDesign.projectileCalibre / 1000 // F21 / F14
      let chamberBoreMetres       = this.data.data.firearmDesign.chamberBore / 1000
      let chamberPressurePascals  = this.data.data.firearmDesign.chamberPressure * 6896;
      let burnLengthMeters        = this.data.data.firearmDesign.burnLength / 1000;
      let boreCrossSection        = Math.PI * ( barrelBoreMetres / 2) ** 2; // I13
      let bulletCrossSection      = Math.PI * ( barrelBoreMetres / 2) ** 2; // I17
      let barrelLengthMetres      = this.data.data.firearmDesign.barrelLength / 1000; // F17
      let caseLengthMetres        = this.data.data.firearmDesign.caseLength / 1000;
      let chamberCrossSection     = Math.PI * ( chamberBoreMetres / 2 ) ** 2
      let chamberVolume           = chamberCrossSection * ( caseLengthMetres * 7/8 - barrelBoreMetres);
      let fallOffVolume           = chamberVolume + boreCrossSection * burnLengthMeters;
      let acclerationDistance     = barrelLengthMetres - caseLengthMetres - burnLengthMeters + barrelBoreMetres;
      let totalAcceleratedKgs     = this.data.data.firearmDesign.projectileMass / 15430; // F22 or F18

      // Actually useful calculations

      // Kinetic Energy
      let kineticEnergy = Math.abs( chamberPressurePascals * ( boreCrossSection * burnLengthMeters + fallOffVolume * Math.log( boreCrossSection * acclerationDistance / fallOffVolume + 1) ) ); // D27 or K12 - Measured in joules

      // Velocity
      let metresPerSecond = Math.sqrt((2* Math.abs(kineticEnergy) / totalAcceleratedKgs )); // D25
      let feetPerSecond = metresPerSecond * 1000 / (12 * 25.4); // D26
      this.data.data.firearmDesign.yardsPerSecond = Math.floor(feetPerSecond / 3);

      // Decide whether or not this gun counts 4 to 8mm projectiles as pi or pi- (High/Low energy)
      if (kineticEnergy > 1250 || metresPerSecond > 700) { // The KE is the NATO standard for intermediate cartridges.
        this.data.data.firearmDesign.highEnergy = true;
      }
      else {
        this.data.data.firearmDesign.highEnergy = false;
      }

      // Damage
      this.data.data.firearmDesign.baseDamage = Math.round(Math.sqrt(( kineticEnergy ** 1.04)/( bulletCrossSection ** 0.314))/13.3926)
      this.data.data.firearmDesign.baseDamageObject = generalHelpers.pointsToDiceAndAdds(this.data.data.firearmDesign.baseDamage);

      // Projectile Density
      let projectileVolume = (Math.PI*(barrelBoreMetres/2) ** 3+Math.PI/12*barrelBoreMetres ** 2*(2 * barrelBoreMetres * this.data.data.firearmDesign.projectileAspectRatio - barrelBoreMetres)); // I21
      this.data.data.firearmDesign.projectileDensity = totalAcceleratedKgs / projectileVolume / 1000 // I22 - Measured in g/cm^2

      let projectileMaterialArray = materialHelpers.densityToMaterials(this.data.data.firearmDesign.projectileDensity);

      this.data.data.firearmDesign.projectileMaterials = "";

      for (let d = 0; d < projectileMaterialArray.length; d++) {
        if (d > 0) {
          this.data.data.firearmDesign.projectileMaterials += ", ";
        }

        this.data.data.firearmDesign.projectileMaterials += projectileMaterialArray[d];
      }

      // Wound modifier calculation

      if (this.data.data.firearmDesign.projectileCalibre < 4) {
        this.data.data.firearmDesign.baseWoundMod = 1;
      }
      else if (this.data.data.firearmDesign.projectileCalibre < 8) {
        if (this.data.data.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
          this.data.data.firearmDesign.baseWoundMod = 2;
        }
        else {
          this.data.data.firearmDesign.baseWoundMod = 1;
        }
      }
      else if (this.data.data.firearmDesign.projectileCalibre < 10) {
        this.data.data.firearmDesign.baseWoundMod = 2;
      }
      else if (this.data.data.firearmDesign.projectileCalibre < 15) {
        this.data.data.firearmDesign.baseWoundMod = 3;
      }
      else {
        this.data.data.firearmDesign.baseWoundMod = 4;
      }

      // ACC calculation
      this.data.data.firearmDesign.baseAcc = 0;

      // Base ACC from configuration
      if (this.data.data.firearmDesign.configuration === "cannon") {
        this.data.data.firearmDesign.baseAcc = 1;
      }
      else if (this.data.data.firearmDesign.configuration === "pistol") {
        this.data.data.firearmDesign.baseAcc = 2;
      }
      else if (this.data.data.firearmDesign.configuration === "bullpup" || this.data.data.firearmDesign.configuration === "longarm") {
        this.data.data.firearmDesign.baseAcc = 4;
      }
      else if (this.data.data.firearmDesign.configuration === "semiportable") {
        this.data.data.firearmDesign.baseAcc = 5;
      }

      // Open/Closed bolt guns
      if (this.data.data.firearmDesign.bolt === "open") {
        this.data.data.firearmDesign.baseAcc -= 1; // Open bolt is -1 ACC
      }

      // Action ACC
      if (this.data.data.firearmDesign.action === "break" || this.data.data.firearmDesign.action === "bolt" || this.data.data.firearmDesign.action === "straightPull") {
        this.data.data.firearmDesign.baseAcc += 1;
      }

      // Rifling ACC
      if (!this.data.data.firearmDesign.rifling) {
        this.data.data.firearmDesign.baseAcc -= 1; // Unrifled weapons are -1 Acc
      }

      // ACC is at least 0
      if (this.data.data.firearmDesign.baseAcc < 0) {
        this.data.data.firearmDesign.baseAcc = 0;
      }

      this.data.data.firearmDesign.baseAcc += parseInt(this.data.data.firearmDesign.accuracy); // Apply acc modifier for quality level.

      // Max Rof calculation
      if (this.data.data.firearmDesign.action === "muzzle" || this.data.data.firearmDesign.action === "breech" || this.data.data.firearmDesign.action === "break" || this.data.data.firearmDesign.action === "bolt"  || this.data.data.firearmDesign.action === "revolverSA") {
        this.data.data.firearmDesign.maxRof = 1;
      }
      else if (this.data.data.firearmDesign.action === "straightPull" || this.data.data.firearmDesign.action === "lever" || this.data.data.firearmDesign.action === "pump") {
        this.data.data.firearmDesign.maxRof = 2;
      }
      else if (this.data.data.firearmDesign.action === "revolverDA" || this.data.data.firearmDesign.action === "semi") {
        this.data.data.firearmDesign.maxRof = 3;
      }
      else if (this.data.data.firearmDesign.action === "auto" || this.data.data.firearmDesign.action === "burst" || this.data.data.firearmDesign.action === "highCyclicBurst") {
        if (this.data.data.firearmDesign.bolt === "open") {
          this.data.data.firearmDesign.maxRof = 25;
        }
        else {
          this.data.data.firearmDesign.maxRof = 20;
        }
      }

      // Weight
      let configWeightModifier = 45;

      if (this.data.data.firearmDesign.action === "semi") {
        configWeightModifier = 1.5 / 0.9 * configWeightModifier;
      }
      else if (this.data.data.firearmDesign.action === "revolverSA" || this.data.data.firearmDesign.action === "revolverDA") {
        configWeightModifier = 5 * configWeightModifier;
      }
      else { // Else, use the modifier for bolt action weapons.
        configWeightModifier = 1.5 / 0.75 * configWeightModifier;
      }

      // Calculate the base receiver weight
      let receiverWeight = ((kineticEnergy ** 0.66) / configWeightModifier / 1.4 ** (this.data.data.tl - 7))

      // Add weight for revolver cylinder
      if (this.data.data.firearmDesign.action === "revolverSA" || this.data.data.firearmDesign.action === "revolverDA") {
        receiverWeight = (receiverWeight) + ((receiverWeight * (this.data.data.firearmDesign.capacity-1)) * 0.132)
      }

      let wallThickness = this.data.data.firearmDesign.chamberPressure * this.data.data.firearmDesign.projectileCalibre / 2 / 44000000 * (1.4) ** (this.data.data.tl - 7); // H27
      let barrelDiameter = 2 * (wallThickness) + barrelBoreMetres;

      let barrelWeight = (Math.PI * (barrelBoreMetres / 2 + barrelDiameter) ** 2 - Math.PI * (barrelBoreMetres / 2) ** 2) * barrelLengthMetres * 7860

      this.data.data.firearmDesign.weightKgs = ((receiverWeight + barrelWeight) + (((receiverWeight + barrelWeight) * 0.8) * (this.data.data.firearmDesign.barrels - 1))) * this.data.data.firearmDesign.weightTweak;
      this.data.data.firearmDesign.weight = this.data.data.firearmDesign.weightKgs * 2.205;

      // Add weight for ammo
      let projectileWeight = this.data.data.firearmDesign.projectileMass * 0.000142857;

      let propellantREF = 1;
      let propellantCost = 1; // We'll use this later to determine cost per shot
      let materialCost = 1; // We'll use this later to determine the weapon's material cost
      switch (this.data.data.tl) {
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

      this.data.data.firearmDesign.baseWeightPerShot = projectileWeight + powderWeight;

      // Add weight for magazine body
      let magazineWeightMultiplier = 1;
      if (this.data.data.firearmDesign.magazineStyle === "none" || this.data.data.firearmDesign.magazineStyle === "internal"){
        magazineWeightMultiplier = 1;
      }
      else if (this.data.data.firearmDesign.magazineMaterial === "steel"){
        if (this.data.data.firearmDesign.magazineStyle === "standard") {
          magazineWeightMultiplier = 1.2;
        }
        else if (this.data.data.firearmDesign.magazineStyle === "highDensity") {
          magazineWeightMultiplier = 1.3;
        }
        else if (this.data.data.firearmDesign.magazineStyle === "extended") {
          magazineWeightMultiplier = 1.5;
        }
        else if (this.data.data.firearmDesign.magazineStyle === "drum") {
          magazineWeightMultiplier = 1.6;
        }
      }
      else if (this.data.data.firearmDesign.magazineMaterial === "alloy" || this.data.data.firearmDesign.magazineMaterial === "plastic"){
        if (this.data.data.firearmDesign.magazineStyle === "standard") {
          magazineWeightMultiplier = 1.1;
        }
        else if (this.data.data.firearmDesign.magazineStyle === "highDensity") {
          magazineWeightMultiplier = 1.1;
        }
        else if (this.data.data.firearmDesign.magazineStyle === "extended") {
          magazineWeightMultiplier = 1.2;
        }
        else if (this.data.data.firearmDesign.magazineStyle === "drum") {
          magazineWeightMultiplier = 1.3;
        }
      }

      let loadedRounds = this.data.data.firearmDesign.capacity;
      if (this.data.data.firearmDesign.capacity === 0) {
        loadedRounds = 1
      }
      else if (this.data.data.firearmDesign.bolt = "closed") {
        loadedRounds += 1;
      }

      loadedRounds = loadedRounds * this.data.data.firearmDesign.barrels;

      this.data.data.firearmDesign.ammoWeight = loadedRounds * this.data.data.firearmDesign.baseWeightPerShot * magazineWeightMultiplier;

      this.data.data.firearmDesign.loadedWeight = Math.floor((this.data.data.firearmDesign.weight + this.data.data.firearmDesign.ammoWeight) * 100) / 100;
      this.data.data.weight = this.data.data.firearmDesign.loadedWeight;

      // Shots
      if (this.data.data.firearmDesign.action === "break" || this.data.data.firearmDesign.action === "breech" || this.data.data.firearmDesign.action === "muzzle") { // The weapon is some version of a single shot weapon, so the number of shots is the same as the number of barrels
        if (this.data.data.firearmDesign.barrels > 1){
          this.data.data.firearmDesign.shots = "1x" + this.data.data.firearmDesign.barrels;
        }
        else {
          this.data.data.firearmDesign.shots = "1";
        }
      }
      else { // The weapon has a magazine of some sort.
        this.data.data.firearmDesign.shots = this.data.data.firearmDesign.capacity // Base shots is the magazine capacity

        if (this.data.data.firearmDesign.bolt === "closed") { // If it's closed bolt, add +1
          this.data.data.firearmDesign.shot += "+" + 1
        }

        if (this.data.data.firearmDesign.barrels > 1) { // If it has multiple barrels, multiply accordingly
          this.data.data.firearmDesign.shots += "x" + this.data.data.firearmDesign.barrels;
        }
      }

      // Bulk and ST
      let bulkConfigLengthModifier = 304;
      if (this.data.data.firearmDesign.configuration === "pistol" || this.data.data.firearmDesign.configuration === "bullpup") {
        bulkConfigLengthModifier = 76;
      }

      let bulkLength = (this.data.data.firearmDesign.barrelLength+(this.data.data.firearmDesign.caseLength*2)+bulkConfigLengthModifier)/1000*1.09361*3*12

      let bulkConfigMod = 1;
      if (this.data.data.firearmDesign.configuration === "cannon") {
        bulkConfigMod = 6;
        this.data.data.firearmDesign.st = (Math.sqrt(this.data.data.weight) * 2.4);
        this.data.data.firearmDesign.stOutput = Math.round(this.data.data.firearmDesign.st);
        this.data.data.firearmDesign.stCode = "†";
      }
      else if (this.data.data.firearmDesign.configuration === "pistol") {
        bulkConfigMod = 2;
        this.data.data.firearmDesign.st =Math.sqrt(this.data.data.weight) * 3.3;
        this.data.data.firearmDesign.stOutput = Math.round(this.data.data.firearmDesign.st);
      }
      else if (this.data.data.firearmDesign.configuration === "bullpup") {
        bulkConfigMod = 3;
        this.data.data.firearmDesign.st = (Math.sqrt(this.data.data.weight) * 2.2);
        this.data.data.firearmDesign.stOutput = Math.round(this.data.data.firearmDesign.st);
        this.data.data.firearmDesign.stCode = "†";
      }
      else if (this.data.data.firearmDesign.configuration === "longarm") {
        bulkConfigMod = 4;
        this.data.data.firearmDesign.st = (Math.sqrt(this.data.data.weight) * 2.2);
        this.data.data.firearmDesign.stOutput = Math.round(this.data.data.firearmDesign.st);
        this.data.data.firearmDesign.stCode = "†";
      }
      else if (this.data.data.firearmDesign.configuration === "semiportable") {
        bulkConfigMod = 5;
        this.data.data.firearmDesign.st = (Math.sqrt(this.data.data.weight) * 2.2);
        this.data.data.firearmDesign.stOutput = Math.round(this.data.data.firearmDesign.st);
        this.data.data.firearmDesign.stCode = "†";
      }

      this.data.data.firearmDesign.bulk = 0.1-Math.log10(bulkConfigMod) -Math.log10(this.data.data.weight) - (2*Math.log10(bulkLength))

      // Rcl
      let mv = totalAcceleratedKgs * metresPerSecond;
      this.data.data.firearmDesign.rclRaw = mv / (this.data.data.firearmDesign.loadedWeight * 0.453592);

      if (this.data.data.firearmDesign.rclRaw < 2) {
        this.data.data.firearmDesign.rcl = 2;
      }
      else {
        this.data.data.firearmDesign.rcl = Math.round(this.data.data.firearmDesign.rclRaw);
      }

      // Range
      let sectionalDensity = (this.data.data.firearmDesign.projectileMass/15.43)/(Math.PI*(this.data.data.firearmDesign.projectileCalibre/2) ** 2); // D37
      let lossCoefficient = 0.000178 * sectionalDensity ** - 1.1213 / Math.pow(this.data.data.firearmDesign.projectileAspectRatio,1/4)*1.65; // D38

      let someWeirdConstant = 0.5 * Math.round(Math.sqrt(kineticEnergy ** 1.04/bulletCrossSection ** 0.314)/13.3926);

      this.data.data.firearmDesign.halfRange = Math.round((Math.log(13.3926)+Math.log(someWeirdConstant)-0.52*Math.log(totalAcceleratedKgs/2)+0.157*Math.log(bulletCrossSection))/(-1.04*lossCoefficient) + Math.log(metresPerSecond)/lossCoefficient);
      this.data.data.firearmDesign.maxRange = Math.round((Math.log(13.3926)+Math.log(0.017)-0.52*Math.log(totalAcceleratedKgs/2)+0.157*Math.log(bulletCrossSection))/(-1.04*lossCoefficient) + Math.log(metresPerSecond)/lossCoefficient);

      // Malf
      this.data.data.firearmDesign.malf = 17;

      switch (this.data.data.tl) {
        case 1:
        case 2:
        case 3:
          this.data.data.firearmDesign.malf = 12;
          break;
        case 4:
          this.data.data.firearmDesign.malf = 14;
          break;
        case 5:
          this.data.data.firearmDesign.malf = 16;
          break;
        default:
          this.data.data.firearmDesign.malf = 17;
          break;
      }

      if (this.data.data.firearmDesign.action === "straightPull" && this.data.data.tl === 6) { // Straight pull weapons are -1 malf at TL6
        this.data.data.firearmDesign.malf -= 1;
      }

      if (this.data.data.tl >= 6 && (this.data.data.firearmDesign.action === "revolverSA" || this.data.data.firearmDesign.action === "revolverDA")) { // Revolvers are +1 malf at higher TLs
        this.data.data.firearmDesign.malf += 1;
      }

      this.data.data.firearmDesign.malf += parseInt(this.data.data.firearmDesign.reliability); // Apply malf modifier for quality level.

      if (this.data.data.firearmDesign.malf > 17) { // Above a malf of 17, it's set to 17+. Which represents the fact two crit fails are required for the gun to malfunction.
        this.data.data.firearmDesign.malf = "17+";
      }

      // Reload
      this.data.data.firearmDesign.individualLoading = "";
      if (this.data.data.firearmDesign.action === "muzzle") {
        if (this.data.data.firearmDesign.lock === "cannon") {
          this.data.data.firearmDesign.reload = 30;
          this.data.data.firearmDesign.reloadFast = 30;
        }
        else if (this.data.data.firearmDesign.lock === "match") {
          if (this.data.data.firearmDesign.configuration === "pistol") {
            if (this.data.data.firearmDesign.rifling) {
              this.data.data.firearmDesign.reload = 67;
              this.data.data.firearmDesign.reloadFast = 54;
            }
            else {
              this.data.data.firearmDesign.reload = 45;
              this.data.data.firearmDesign.reloadFast = 36;
            }
          }
          else {
            if (this.data.data.firearmDesign.rifling) {
              this.data.data.firearmDesign.reload = 90;
              this.data.data.firearmDesign.reloadFast = 80;
            }
            else {
              this.data.data.firearmDesign.reload = 60;
              this.data.data.firearmDesign.reloadFast = 50;
            }
          }
        }
        else if (this.data.data.firearmDesign.lock === "wheel" || this.data.data.firearmDesign.lock === "flint") {
          if (this.data.data.firearmDesign.configuration === "pistol") {
            if (this.data.data.firearmDesign.rifling) {
              this.data.data.firearmDesign.reload = 30;
              this.data.data.firearmDesign.reloadFast = 24;
            }
            else {
              this.data.data.firearmDesign.reload = 20;
              this.data.data.firearmDesign.reloadFast = 16;
            }
          }
          else {
            if (this.data.data.firearmDesign.rifling) {
              this.data.data.firearmDesign.reload = 60;
              this.data.data.firearmDesign.reloadFast = 50;
            }
            else {
              this.data.data.firearmDesign.reload = 40;
              this.data.data.firearmDesign.reloadFast = 30;
            }
          }
        }

        if (this.data.data.firearmDesign.barrels > 1) {
          this.data.data.firearmDesign.individualLoading = "i";
        }
      }
      else if (this.data.data.firearmDesign.action === "breech") {
        if (this.data.data.firearmDesign.lock === "pin" || this.data.data.firearmDesign.lock === "rim" || this.data.data.firearmDesign.lock === "centre") {
          this.data.data.firearmDesign.reload = 3;
          this.data.data.firearmDesign.reloadFast = 2;
        }
        else {
          this.data.data.firearmDesign.reload = 10;
          this.data.data.firearmDesign.reloadFast = 8;
        }

        if (this.data.data.firearmDesign.barrels > 1) {
          this.data.data.firearmDesign.individualLoading = "i";
        }
      }
      else if (this.data.data.firearmDesign.action === "break") {
        this.data.data.firearmDesign.reload = 2;
        this.data.data.firearmDesign.reloadFast = 1;

        if (this.data.data.firearmDesign.barrels > 1) {
          this.data.data.firearmDesign.individualLoading = "i";
        }
      }
      else if (this.data.data.firearmDesign.magazineStyle === "internal") {
        this.data.data.firearmDesign.reload = 2;
        this.data.data.firearmDesign.reloadFast = 1;

        this.data.data.firearmDesign.individualLoading = "i";
      }
      else {
        this.data.data.firearmDesign.reload = 3;
        this.data.data.firearmDesign.reloadFast = 2;
      }

      this.data.data.firearmDesign.reloadQuickFast = (this.data.data.firearmDesign.reloadFast - Math.min(Math.floor(this.data.data.firearmDesign.reloadFast * 0.25), 1)); // Quick reload reduces time by 25%, rounded down, but always at least 1 second.

      if (this.data.data.firearmDesign.action === "muzzle" || this.data.data.firearmDesign.action === "breech") {
        if (this.data.data.firearmDesign.powderFlasks) {
          this.data.data.firearmDesign.reload -= 5;
          this.data.data.firearmDesign.reloadFast -= 5;
          this.data.data.firearmDesign.reloadQuickFast -= 5;
        }

        else if (this.data.data.firearmDesign.paperCartridges) {
          this.data.data.firearmDesign.reload           = this.data.data.firearmDesign.reload          / 2;
          this.data.data.firearmDesign.reloadFast       = this.data.data.firearmDesign.reloadFast      / 2;
          this.data.data.firearmDesign.reloadQuickFast  = this.data.data.firearmDesign.reloadQuickFast / 2;
        }

        if (this.data.data.firearmDesign.carefulLoading) {
          this.data.data.firearmDesign.reload           = this.data.data.firearmDesign.reload          * 2;
          this.data.data.firearmDesign.reloadFast       = this.data.data.firearmDesign.reloadFast      * 2;
          this.data.data.firearmDesign.reloadQuickFast  = this.data.data.firearmDesign.reloadQuickFast * 2;
        }
      }

      // Cost
      let costOfLead = this.data.data.tl >= 5 ? 1 : 2;
      this.data.data.firearmDesign.cps = (projectileWeight * costOfLead) + (propellantCost * powderWeight);
      this.data.data.firearmDesign.finalCps = this.data.data.firearmDesign.cf * this.data.data.firearmDesign.cps;

      let cost = 350;

      switch (this.data.data.firearmDesign.configuration) {
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

      switch (this.data.data.tl) { // This modifier assumes the weapons are rifled.
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

      if (!this.data.data.firearmDesign.rifling) { // Rifling is available, but it's early TL.
        cost *= 0.75;
      }

      cost = cost + ((cost * 0.8) * (this.data.data.firearmDesign.barrels - 1)); // Apply cost for extra barrels

      this.data.data.firearmDesign.cf = 1;

      if (this.data.data.firearmDesign.fitToOwner) {
        this.data.data.firearmDesign.cf += 1;
      }

      switch (this.data.data.firearmDesign.accuracy) {
        case "-2":
        case "-1":
          this.data.data.firearmDesign.cf -= 0.4;
          break;
        case "0":
          break;
        case "1":
          this.data.data.firearmDesign.cf += 0.75;
          break;
        case "2":
          this.data.data.firearmDesign.cf += 3.75;
          break;
        default:
          break;
      }

      switch (this.data.data.firearmDesign.reliability) {
        case "-2":
        case "-1":
          this.data.data.firearmDesign.cf -= 0.4;
          break;
        case "0":
          break;
        case "1":
          this.data.data.firearmDesign.cf += 0.25;
          break;
        case "2":
          this.data.data.firearmDesign.cf += 1.25;
          break;
        default:
          break;
      }

      this.data.data.firearmDesign.cf = Math.max(this.data.data.firearmDesign.cf, 0.2);

      this.data.data.firearmDesign.baseCost = cost;
      this.data.data.firearmDesign.finalCost = this.data.data.firearmDesign.cf * this.data.data.firearmDesign.baseCost;

      // Pre-calculate helpers for ammo related stuff
      // Shot
      this.data.data.firearmDesign.maxSPi = Math.floor((this.data.data.firearmDesign.projectileCalibre/4) ** 3); // Gives max number of 4mm balls (pi- or pi depending on velocity) Less than this is always pi-
      this.data.data.firearmDesign.maxPi = Math.floor((this.data.data.firearmDesign.projectileCalibre/8) ** 3); // Gives max number of 8mm balls  (pi)
      this.data.data.firearmDesign.maxLPi = Math.floor((this.data.data.firearmDesign.projectileCalibre/10) ** 3); // Gives max number of 10mm balls (pi+)
      this.data.data.firearmDesign.maxHPi = Math.floor((this.data.data.firearmDesign.projectileCalibre/15) ** 3); // Gives max number of 15mm balls (pi++)

      // Flechettes
      this.data.data.firearmDesign.maxSPiF = Math.floor(((this.data.data.firearmDesign.projectileCalibre/4) ** 3) / 40);
      this.data.data.firearmDesign.maxPiF = Math.floor(((this.data.data.firearmDesign.projectileCalibre/8) ** 3) / 40);
      this.data.data.firearmDesign.maxLPiF = Math.floor(((this.data.data.firearmDesign.projectileCalibre/10) ** 3) / 40);
      this.data.data.firearmDesign.maxHPiF = Math.floor(((this.data.data.firearmDesign.projectileCalibre/15) ** 3) / 40);

      switch (this.data.data.firearmDesign.baseWoundMod) {
        case 1:
          this.data.data.firearmDesign.woundMod = "pi-";
          break;
        case 2:
          this.data.data.firearmDesign.woundMod = "pi";
          break;
        case 3:
          this.data.data.firearmDesign.woundMod = "pi+";
          break;
        case 4:
          this.data.data.firearmDesign.woundMod = "pi++";
          break;
        default:
          this.data.data.firearmDesign.woundMod = "pi";
          break;
      }

      this.data.data.cost = this.data.data.firearmDesign.finalCost;

      // Calculate Ammo Stuff
      if (typeof this.data.data.firearmDesign.ammunition != "undefined") {
        let ammoKeys = Object.keys(this.data.data.firearmDesign.ammunition); // Get the ammo keys
        if (ammoKeys.length > 0) { // If there are actually keys
          for (let i = 0; i < ammoKeys.length; i++) { // Loop through the ammo the user has created and run whatever numbers need to be run.

            // Input validation for projectile count
            if (typeof this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles == "undefined" || this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles <= 0 || this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles == "") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles = 1;
            }
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles = Math.floor(Math.abs(this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles));

            // Init some things
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].wps = this.data.data.firearmDesign.baseWeightPerShot;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].cps = this.data.data.firearmDesign.cps;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF = 1;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].malf = this.data.data.firearmDesign.malf;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc = this.data.data.firearmDesign.baseAcc;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage = this.data.data.firearmDesign.baseDamage;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].st = this.data.data.firearmDesign.st;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange = this.data.data.firearmDesign.halfRange;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange = this.data.data.firearmDesign.maxRange;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].range = this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange + "/" + this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = this.data.data.firearmDesign.baseWoundMod;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = 3;

            // Light cased
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].case === "lightCased") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].wps *= 0.7;
            }

            // +P ammo
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].plusp) {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].st *= 1.1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1.1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1.1;
              if (this.data.data.tl <= 6 || this.data.data.firearmDesign.reliability < 0) { // Weapon is low TL or cheap
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].malf -= 1;
              }
            }

            // Match ammo
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].match !== "1") {
              if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].match === "1.25") {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
                if (this.data.data.firearmDesign.baseAcc >= 4) {
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc = Math.floor(this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc * 1.25);
                }
              }
              else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].match === "1.5") {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
                if (this.data.data.firearmDesign.baseAcc >= 2) {
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc = Math.floor(this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc * 1.5);
                }
              }
            }

            // Subsonic ammo
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].subsonic) {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.3;
              if (this.data.data.firearmDesign.yardsPerSecond >= 375.109) {
                if (this.data.data.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as a rifle round, otherwise a pistol round
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.6;
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.6;
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.6;
                }
                else {
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.8;
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.8;
                }
              }
            }

            // Silent ammo
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].silent) {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 9;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }

            // Poison ammo
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].poison) {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }

            // Incendiary and tracer ammo
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].inc || this.data.data.firearmDesign.ammunition[ammoKeys[i]].tracer) {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage += 1;
            }

            this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 1;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag = false;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 0;
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "";
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl = this.data.data.firearmDesign.rcl;

            // Projectile Type
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "le" ||
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "he") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 15;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "lec" ||
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "hec") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 15;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "thermobaric") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 7;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }

            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "saplec") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 10;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "saple" ||
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "saphe") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 10;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "saphec") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 20;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "apex") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.7;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.data.data.firearmDesign.projectileCalibre < 20) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "aphex") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.data.data.firearmDesign.projectileCalibre < 20) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "heat") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 10;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "msheat") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 10;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 7;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "hedp") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 25;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 10;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "hesh") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 95;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "efp") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent = 50;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag = true;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 7;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "hp") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "frangible") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.9;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.9;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "ap") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.7;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
              if (this.data.data.firearmDesign.projectileCalibre < 20) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "aphc") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
              if (this.data.data.firearmDesign.projectileCalibre < 20) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "apdu") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.data.data.firearmDesign.projectileCalibre < 20) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "apds") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.data.data.firearmDesign.projectileCalibre < 30) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "apdsdu") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.data.data.firearmDesign.projectileCalibre < 30) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "apfsds") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 1);
              if (this.data.data.firearmDesign.projectileCalibre < 40) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "apfsdsdu") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 4;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 1.7;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
              if (this.data.data.firearmDesign.projectileCalibre < 40) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "sapfsds") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod -= 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "baton") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 0.2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 0.2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc -= 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
              if (this.data.data.firearmDesign.projectileCalibre >= 35) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr dbk";
              }
              else {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr";
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "bean") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad = 0.2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1/8;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1/8;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc = 0;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 3);
              if (this.data.data.firearmDesign.projectileCalibre >= 15) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr dbk";
              }
              else {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "cr";
              }
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "underwater") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "imp";
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc = Math.min(this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc, 2);
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "shotshell" || this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "canister") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= (1 / Math.sqrt(this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles));
              let projectileDiameter = ((this.data.data.firearmDesign.projectileCalibre ** 3) / this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles) ** (1/3);

              // Wound modifier calculation
              if (projectileDiameter < 4) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
              }
              else if (projectileDiameter < 8) {
                if (this.data.data.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
                }
                else {
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
                }
              }
              else if (projectileDiameter < 10) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
              }
              else if (projectileDiameter < 15) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 3;
              }
              else {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              }

              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange = projectileDiameter * 5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange = projectileDiameter * 100;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "mf") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= (1 / Math.sqrt(this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles));
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 3;
              let projectileDiameter = ((this.data.data.firearmDesign.projectileCalibre ** 3) / this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles) ** (1/3)

              // Wound modifier calculation
              if (projectileDiameter < 4) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
              }
              else if (projectileDiameter < 8) {
                if (this.data.data.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
                }
                else {
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
                }
              }
              else if (projectileDiameter < 10) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
              }
              else if (projectileDiameter < 15) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 3;
              }
              else {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              }

              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange = projectileDiameter * 50;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange = projectileDiameter * 600;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "rs") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= (1 / Math.sqrt(this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles));
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 1;
              let projectileDiameter = ((this.data.data.firearmDesign.projectileCalibre ** 3) / this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles) ** (1/3)

              // Wound modifier calculation
              if (projectileDiameter < 4) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
              }
              else if (projectileDiameter < 8) {
                if (this.data.data.firearmDesign.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
                }
                else {
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 1;
                }
              }
              else if (projectileDiameter < 10) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 2;
              }
              else if (projectileDiameter < 15) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 3;
              }
              else {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod = 4;
              }

              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange = projectileDiameter * 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange = projectileDiameter * 10;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "duplex") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.85;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles = 2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1/2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1/2;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }
            else if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectile === "triplex") {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage *= 0.7;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF += 0.5;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles = 3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange *= 1/3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange *= 1/3;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl = 1;
            }

            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut === "") {
              switch (this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundMod) {
                case 1:
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi-";
                  break;
                case 2:
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi";
                  break;
                case 3:
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi+";
                  break;
                case 4:
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi++";
                  break;
                default:
                  this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut = "pi";
                  break;
              }
            }

            this.data.data.firearmDesign.ammunition[ammoKeys[i]].cps = Math.round((this.data.data.firearmDesign.ammunition[ammoKeys[i]].cps * this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF) * 100) / 100

            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxExplosivePercent == 0) {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosivePercent = 0;
            }

            // Handle explosive calculation
            if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosivePercent > 0) {

              let explosive = materialHelpers.getExplosiveByCode(this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveFiller);

              let baseExplosiveDamage = 21 * (Math.sqrt((this.data.data.firearmDesign.ammunition[ammoKeys[i]].wps * (this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosivePercent / 100)) * 4 * explosive.ref));

              if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag) {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage = Math.round(baseExplosiveDamage * 0.7);
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamage = Math.round(baseExplosiveDamage * 0.3);
              }
              else {
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage = Math.round(baseExplosiveDamage);
                this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamage = 0;
              }

              this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageObject = generalHelpers.pointsToDiceAndAdds(this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage);
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageDice = generalHelpers.diceAndAddsToGURPSOutput(this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageObject.dice, this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageObject.adds);

              this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamageObject = generalHelpers.pointsToDiceAndAdds(this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamage);
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamageDice = generalHelpers.diceAndAddsToGURPSOutput(this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamageObject.dice, this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamageObject.adds);

              // Add the cost of the explosives to the cost of the shot
              let explosiveCost = explosive.costPerLb * (this.data.data.firearmDesign.ammunition[ammoKeys[i]].wps * (this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosivePercent / 100));
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].cps += explosiveCost;
            }
            else {
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamage = 0;
              this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamage = 0;
            }

            this.data.data.firearmDesign.ammunition[ammoKeys[i]].st = Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].st);
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].range = Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange);
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].rofBonus = generalHelpers.rofToBonus(this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles);
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].damageObject = generalHelpers.pointsToDiceAndAdds(this.data.data.firearmDesign.ammunition[ammoKeys[i]].damage);
            this.data.data.firearmDesign.ammunition[ammoKeys[i]].damageDice = generalHelpers.diceAndAddsToGURPSOutput(this.data.data.firearmDesign.ammunition[ammoKeys[i]].damageObject.dice, this.data.data.firearmDesign.ammunition[ammoKeys[i]].damageObject.adds);
          }
        }
      }

      // Loop through ammo designs and add ranged profiles
      if (typeof this.data.data.firearmDesign.ammunition != "undefined") {
        this.addCustomFirearmProfiles();
      }

      // Adding melee profiles
      if (this.data.data.firearmDesign.meleeProfile) { // If the user wants to include a melee profile
        this.addMeleeProfile(this.data.data.firearmDesign.bulk, this.data.data.firearmDesign.cavalierWeapon, this.data.data.firearmDesign.configuration, this.data.data.firearmDesign.meleeSkill, this.data.data.firearmDesign.meleeSkillMod, this.data.data.firearmDesign.st) // Include one
      }

      this.data.data.firearmDesign.baseDamageDice = generalHelpers.diceAndAddsToGURPSOutput(this.data.data.firearmDesign.baseDamageObject.dice, this.data.data.firearmDesign.baseDamageObject.adds);
    }
  }

  prepareCustomLaser() {
    if (this.data.data.tl >= 9) { // TL must be at least 9 to be able to design a custom laser
      if (typeof this.data.data.laserDesign == "undefined") { // If the laserDesign block hasn't yet been created
        this.data.data.laserDesign = { // Create it
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
        }
      }

      // Input Validation
      if (typeof this.data.data.laserDesign.powerCellQty == "undefined" || this.data.data.laserDesign.powerCellQty <= 0 || this.data.data.laserDesign.powerCellQty == "") { // If the cell quantity is blank or negative
        this.data.data.laserDesign.powerCellQty = 1; // Set to 1
      }
      if (typeof this.data.data.laserDesign.damageDice == "undefined" || this.data.data.laserDesign.damageDice <= 0 || this.data.data.laserDesign.damageDice == "") { // If the damage dice is blank or negative
        this.data.data.laserDesign.damageDice = 1; // Set to 1
      }
      if (this.data.data.laserDesign.graviticFocus == "undefined" || this.data.data.laserDesign.graviticFocus == "") { // If the damage dice is blank or negative
        this.data.data.laserDesign.graviticFocus = "0"; // Set to zero
      }
      if (this.data.data.laserDesign.ftl) {
        this.data.data.laserDesign.fieldJacketed = this.data.data.laserDesign.ftl;
      }
      if (!this.data.data.laserDesign.pulseLaser) {
        this.data.data.laserDesign.pulseBeamLaser = false;
      }

      this.data.data.laserDesign.damageDice = this.data.data.laserDesign.damageDiceInput / 2**(parseInt(this.data.data.laserDesign.graviticFocus));

      // Get game settings relevant to the design of the laser
      this.data.data.laserDesign.hotshotsAndOverheating = game.settings.get("gurps4e", "hotshotsAndOverheating");
      this.data.data.laserDesign.allowSuperScienceCustomLasers = game.settings.get("gurps4e", "allowSuperScienceCustomLasers");

      // This block categorizes the user's focal array selection into the categories given in the article
      if (this.data.data.laserDesign.focalArray < 0.175) { // Default tiny is 0.1, average of it and the next size is 0.175
        this.data.data.laserDesign.focalArraySize = "Tiny";
      }
      else if (this.data.data.laserDesign.focalArray < 0.375) { // Default very small is 0.25, average of it and the next size is 0.375
        this.data.data.laserDesign.focalArraySize = "Very Small";
      }
      else if (this.data.data.laserDesign.focalArray < 0.75) { // Default small is 0.5, average of it and the next size is 0.75
        this.data.data.laserDesign.focalArraySize = "Small";
      }
      else if (this.data.data.laserDesign.focalArray < 1.25) { // Default medium is 1, average of it and the next size is 1.25
        this.data.data.laserDesign.focalArraySize = "Medium";
      }
      else if (this.data.data.laserDesign.focalArray < 1.75) { // Default large is 1.5, average of it and the next size is 1.75
        this.data.data.laserDesign.focalArraySize = "Large";
      }
      else if (this.data.data.laserDesign.focalArray < 3) { // Default very large is 2, average of it and the next size is 3
        this.data.data.laserDesign.focalArraySize = "Very Large";
      }
      else { // Anything 3 or over is Extremely Large. Default XL is 4
        this.data.data.laserDesign.focalArraySize = "Extremely Large";
      }

      // Weight modifier for superscience beams
      let s = 1;
      if (this.data.data.laserDesign.superScience) {
        s = 0.5;
      }

      // Set weight modifier for beam type, along with other beam specific settings
      let e = 3;
      let rb = 8
      let bc = 0;
      let baseShots = 0;
      let lc = 4;
      if (this.data.data.laserDesign.beamType == "laser") {
        lc = 3;
        bc = 500;

        if (this.data.data.laserDesign.pulseLaser){
          this.data.data.laserDesign.damageType = "cr ex";
          this.data.data.laserDesign.armourDivisor = 1;
        }
        else {
          this.data.data.laserDesign.damageType = "tbb";
          this.data.data.laserDesign.armourDivisor = 2;
        }

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 6;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 12;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 18;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 225;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 1800;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 7200;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 28800;
        }

        rb = 40;
        e = 3;
      }
      else if (this.data.data.laserDesign.beamType == "forceBeam") {
        lc = 4;
        bc = 500;
        this.data.data.laserDesign.armourDivisor = 1;
        this.data.data.laserDesign.damageType = "cr dbk";

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 6;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 12;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 18;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 270;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 1080;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 8640;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 34560;
        }

        rb = 11
        e = 4
      }
      else if (this.data.data.laserDesign.beamType == "blaster") {
        lc = 3;
        bc = 2000;
        this.data.data.laserDesign.armourDivisor = 5;
        this.data.data.laserDesign.damageType = "tbb sur";

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 5;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 10;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 15;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 34;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 135;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 1080;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 4320;
        }

        rb = 32
        e = 3
      }
      else if (this.data.data.laserDesign.beamType == "neutralParticleBeam") {
        lc = 3;
        bc = 3000;
        this.data.data.laserDesign.armourDivisor = 1;
        this.data.data.laserDesign.damageType = "tbb rad sur";

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 5;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 10;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 15;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 17;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 68;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 1080;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 4320;
        }

        rb = 32
        e = 3
      }
      else if (this.data.data.laserDesign.beamType == "rainbowLaser") {
        lc = 3;
        bc = 500;
        this.data.data.laserDesign.armourDivisor = 3;
        this.data.data.laserDesign.damageType = "tbb";

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 6;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 12;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 18;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 112;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 450;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 3600;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 14400;
        }

        rb = 56
        e = 3
      }
      else if (this.data.data.laserDesign.beamType == "xRayLaser") {
        lc = 3;
        bc = 1000;

        if (this.data.data.laserDesign.pulseLaser){
          this.data.data.laserDesign.damageType = "cr ex";
          this.data.data.laserDesign.armourDivisor = 3;
        }
        else {
          this.data.data.laserDesign.damageType = "tbb";
          this.data.data.laserDesign.armourDivisor = 5;
        }

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 6;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 12;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 18;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 112;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 450;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 3600;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 14400;
        }

        rb = 2000
        e = 3
      }
      else if (this.data.data.laserDesign.beamType == "gravitonBeam") {
        lc = 3;
        bc = 2000;
        this.data.data.laserDesign.armourDivisor = "I";
        this.data.data.laserDesign.damageType = "cr";

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 6;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 12;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 18;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 14;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 56;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 450;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 1800;
        }

        rb = 100
        e = 1.5
      }
      else if (this.data.data.laserDesign.beamType == "pulsar") {
        lc = 2;
        bc = 3000;
        this.data.data.laserDesign.armourDivisor = 3;
        this.data.data.laserDesign.damageType = "cr ex rad sur";

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 5;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 10;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 15;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 135;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 540;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 4320;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 17280;
        }

        rb = 8
        e = 6
      }
      else if (this.data.data.laserDesign.beamType == "graser") {
        lc = 3;
        bc = 1500;

        if (this.data.data.laserDesign.pulseLaser){
          this.data.data.laserDesign.damageType = "cr ex";
          this.data.data.laserDesign.armourDivisor = 5;
        }
        else {
          this.data.data.laserDesign.damageType = "cr";
          this.data.data.laserDesign.armourDivisor = 10;
        }

        if (this.data.data.laserDesign.configuration == "pistol") {
          this.data.data.laserDesign.outputAcc = 3;
        }
        else if (this.data.data.laserDesign.configuration == "rifle") {
          this.data.data.laserDesign.outputAcc = 6;
        }
        else if (this.data.data.laserDesign.configuration == "beamer") {
          this.data.data.laserDesign.outputAcc = 12;
        }
        else if (this.data.data.laserDesign.configuration == "cannon") {
          this.data.data.laserDesign.outputAcc = 18;
        }

        if (this.data.data.tl <= 9) {
          baseShots = 28;
        }
        else if (this.data.data.tl == 10) {
          baseShots = 112;
        }
        else if (this.data.data.tl == 11) {
          baseShots = 450;
        }
        else if (this.data.data.tl == 12) {
          baseShots = 1880;
        }

        rb = 6000
        e = 3
      }

      this.data.data.laserDesign.outputAccWater = this.data.data.laserDesign.outputAcc;
      this.data.data.laserDesign.outputAccSpace = this.data.data.laserDesign.outputAcc;

      this.data.data.laserDesign.armourDivisorWater = this.data.data.laserDesign.armourDivisor;
      this.data.data.laserDesign.armourDivisorSpace = this.data.data.laserDesign.armourDivisor;

      if (this.data.data.laserDesign.beamType == "rainbowLaser") {
        this.data.data.laserDesign.armourDivisorSpace = 1;
      }

      // Weight modifier for focal array
      let f = 1;
      let focalArray = +this.data.data.laserDesign.focalArray;
      if (this.data.data.laserDesign.focalArray < 1.6) { // Below 1.6 the equation is a really annoying fourth order polynomial
        f = (-0.1422*(focalArray**4))+(1.0155*(focalArray**3))-(2.2582*(focalArray**2))+(2.377*focalArray)+0.0366;
      }
      else { // At and above 1.6 the giant polynomial breaks down and we use a linear equation
        f = (0.2 * focalArray) + 1.2;
      }
      f = Math.round(f * 100) / 100; // Round to the nearest two decimals

      // Weight modifier and rate of fire for generator
      let g = 1;
      let gc = 1;
      if (this.data.data.laserDesign.generator == "single") {
        gc = 1;
        g = 1;
        this.data.data.laserDesign.outputRoF = 1;
      }
      if (this.data.data.laserDesign.generator == "semi") {
        gc = 1;
        g = 1.25;
        this.data.data.laserDesign.outputRoF = 3;
      }
      if (this.data.data.laserDesign.generator == "light") {
        gc = 2;
        g = 1.25;
        this.data.data.laserDesign.outputRoF = 10;
      }
      else if (this.data.data.laserDesign.generator == "heavy") {
        gc = 2;
        g = 2;
        this.data.data.laserDesign.outputRoF = 20;
      }
      else if (this.data.data.laserDesign.generator == "lightGat") {
        gc = 2.5;
        g = 2;
        this.data.data.laserDesign.outputRoF = 10;
      }
      else if (this.data.data.laserDesign.generator == "heavyGat") {
        gc = 2.5;
        g = 2;
        this.data.data.laserDesign.outputRoF = 20;
      }

      if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "bg") {
        this.data.data.laserDesign.outputRoF = Math.max(this.data.data.laserDesign.outputRoF / 2, 1);
      }

      // Rounding damage dice to dice and adds, per page 13 of Pyramid 37
      let dice = 0;
      let adds = 0;
      if (this.data.data.laserDesign.damageDice < 1) { // Dice is less than 1, use different rules than normal rounding.
        if (this.data.data.laserDesign.damageDice == 0) {
          dice = 0;
          adds = 0;
        }
        else if (this.data.data.laserDesign.damageDice <= 0.32) {
          dice = 1;
          adds = -5;
        }
        else if (this.data.data.laserDesign.damageDice <= 0.42) {
          dice = 1;
          adds = -4;
        }
        else if (this.data.data.laserDesign.damageDice <= 0.56) {
          dice = 1;
          adds = -3;
        }
        else if (this.data.data.laserDesign.damageDice <= 0.75) {
          dice = 1;
          adds = -2;
        }
        else if (this.data.data.laserDesign.damageDice <= 0.95) {
          dice = 1;
          adds = -1;
        }
        else {
          dice = 1;
          adds = 0;
        }
      }
      else {
        dice = parseInt(this.data.data.laserDesign.damageDice); // Get the number of dice without modifiers or decimals
        let remainder = +this.data.data.laserDesign.damageDice - +dice; // Get the remainder after above.

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
      if (this.data.data.laserDesign.hotshotsAndOverheating && !(this.data.data.laserDesign.generator == "lightGat" || this.data.data.laserDesign.generator == "heavyGat")) {
        this.data.data.laserDesign.hotshotDamageDice = this.data.data.laserDesign.damageDice * 1.3;
        if (this.data.data.laserDesign.hotshotDamageDice < 1) { // Dice is less than 1, use different rules than normal rounding.
          if (this.data.data.laserDesign.hotshotDamageDice == 0) {
            hotshotDice = 0;
            hotshotAdds = 0;
          }
          else if (this.data.data.laserDesign.hotshotDamageDice <= 0.32) {
            hotshotDice = 1;
            hotshotAdds = -5;
          }
          else if (this.data.data.laserDesign.hotshotDamageDice <= 0.42) {
            hotshotDice = 1;
            hotshotAdds = -4;
          }
          else if (this.data.data.laserDesign.hotshotDamageDice <= 0.56) {
            hotshotDice = 1;
            hotshotAdds = -3;
          }
          else if (this.data.data.laserDesign.hotshotDamageDice <= 0.75) {
            hotshotDice = 1;
            hotshotAdds = -2;
          }
          else if (this.data.data.laserDesign.hotshotDamageDice <= 0.95) {
            hotshotDice = 1;
            hotshotAdds = -1;
          }
          else {
            hotshotDice = 1;
            hotshotAdds = 0;
          }
        }
        else {
          hotshotDice = parseInt(this.data.data.laserDesign.hotshotDamageDice); // Get the number of dice without modifiers or decimals
          let remainder = +this.data.data.laserDesign.hotshotDamageDice - +hotshotDice; // Get the remainder after above.

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
      this.data.data.laserDesign.outputDamage = dice + "d6" + displayAdds;
      this.data.data.laserDesign.outputDamageHotshots = hotshotDice + "d6" + displayHotshotAdds;

      // Determine RF for the purposes of range calculation
      let rf = this.data.data.laserDesign.focalArray;
      if (rf > 1 && rf <= 1.75) {
        rf = rf * 1.33;
      }
      else if (rf >= 1.75) {
        rf = rf * 2;
      }

      // Calculate the ranges
      // 1/2D Range
      this.data.data.laserDesign.halfRange = this.data.data.laserDesign.damageDiceInput * this.data.data.laserDesign.damageDiceInput * rb * rf;

      if (this.data.data.laserDesign.pulseLaser) {
        this.data.data.laserDesign.halfRange = this.data.data.laserDesign.halfRange * 2;
      }

      if (parseInt(this.data.data.laserDesign.graviticFocus) > 0 && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
        if (parseInt(this.data.data.laserDesign.graviticFocus) == 1) {
          this.data.data.laserDesign.halfRange = this.data.data.laserDesign.halfRange * 10;
        }
        else if (parseInt(this.data.data.laserDesign.graviticFocus) == 2) {
          this.data.data.laserDesign.halfRange = this.data.data.laserDesign.halfRange * 10 * 10;
        }
        else if (parseInt(this.data.data.laserDesign.graviticFocus) == 3) {
          this.data.data.laserDesign.halfRange = this.data.data.laserDesign.halfRange * 10 * 10 * 10;
        }
      }

      if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "ir") {
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.data.data.laserDesign.halfRangeWater = 0;
        }
        this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
      }
      else if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "bg") {
        this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange * 2 / 10) * 10;
        this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange * 2 / 10) * 10;
        this.data.data.laserDesign.halfRangeWater = Math.round(Math.min(this.data.data.laserDesign.halfRange * 2, 150/3) / 10) * 10;
      }
      else if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "uv") {
        this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange * 3 / 10) * 10;
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange * 3 / 10) * 10;
          this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange * 3 / 10) * 10;
        }
        else {
          this.data.data.laserDesign.halfRangeWater = 0;
          this.data.data.laserDesign.halfRange = Math.round(Math.min(this.data.data.laserDesign.halfRange * 3, 500/3) / 10) * 10;
        }
      }
      else if (this.data.data.laserDesign.beamType == "rainbowLaser") {
        this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
          this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10 / 10) * 10;
          this.data.data.laserDesign.halfRangeWater = 1;
        }
      }
      else if (this.data.data.laserDesign.beamType == "xRayLaser") {
        this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
          this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.data.data.laserDesign.halfRange = 7;
          this.data.data.laserDesign.halfRangeWater = 0;
        }
      }
      else if (this.data.data.laserDesign.beamType == "graser") {
        this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
          this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.data.data.laserDesign.halfRange = 70;
          this.data.data.laserDesign.halfRangeWater = 0;
        }
      }
      else if (this.data.data.laserDesign.beamType == "blaster") {
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
          this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
          this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.data.data.laserDesign.outputAccSpace = Math.ceil(this.data.data.laserDesign.outputAccSpace / 2);
          this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
          this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 5 / 10) * 10;
          this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        }
      }
      else if (this.data.data.laserDesign.beamType == "pulsar") {
        this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        }
        else {
          this.data.data.laserDesign.halfRange = Math.min(Math.round(this.data.data.laserDesign.halfRange / 10) * 10, 333);
        }
      }
      else {
        this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        this.data.data.laserDesign.halfRangeSpace = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
        this.data.data.laserDesign.halfRangeWater = Math.round(this.data.data.laserDesign.halfRange / 10) * 10;
      }

      // Max Range
      if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "ir") {
        this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRange * 3;
        }
        else {
          this.data.data.laserDesign.maxRangeWater = 1;
        }
      }
      else if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "bg") {
        this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
        this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRangeWater * 3;
      }
      else if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "uv") {
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
        }
        else {
          this.data.data.laserDesign.maxRange = Math.min(this.data.data.laserDesign.halfRange * 3, 500);
        }
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
        this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRangeWater * 3;
      }
      else if (this.data.data.laserDesign.beamType == "rainbowLaser") {
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRange * 3;
        }
        else {
          this.data.data.laserDesign.maxRangeWater = 2;
        }
        this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
      }
      else if (this.data.data.laserDesign.beamType == "xRayLaser") {
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRangeWater * 3;
          this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
        }
        else {
          this.data.data.laserDesign.maxRangeWater = 0;
          this.data.data.laserDesign.maxRange = 20;
        }
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
      }
      else if (this.data.data.laserDesign.beamType == "graser") {
        if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
          this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRangeWater * 3;
          this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
        }
        else {
          this.data.data.laserDesign.maxRangeWater = 0;
          this.data.data.laserDesign.maxRange = 200;
        }
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
      }
      else if (this.data.data.laserDesign.beamType == "blaster") {
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
        this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRangeWater * 3;
        this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
      }
      else if (this.data.data.laserDesign.beamType == "pulsar") {
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
        this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRangeWater * 3;
        this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
        if (this.data.data.laserDesign.maxRange == 999) {
          this.data.data.laserDesign.maxRange = 1000;
        }
      }
      else {
        this.data.data.laserDesign.maxRangeSpace = this.data.data.laserDesign.halfRangeSpace * 3;
        this.data.data.laserDesign.maxRangeWater = this.data.data.laserDesign.halfRangeWater * 3;
        this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
      }

      if (this.data.data.laserDesign.ftl && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
        this.data.data.laserDesign.halfRange = this.data.data.laserDesign.maxRangeSpace;
        this.data.data.laserDesign.halfRangeSpace = this.data.data.laserDesign.maxRangeWater;
        this.data.data.laserDesign.halfRangeWater = this.data.data.laserDesign.maxRange;
      }

      this.data.data.laserDesign.outputRange = this.data.data.laserDesign.halfRange + " / " + this.data.data.laserDesign.maxRange;
      this.data.data.laserDesign.outputRangeWater = this.data.data.laserDesign.halfRangeWater + " / " + this.data.data.laserDesign.maxRangeWater;
      this.data.data.laserDesign.outputRangeSpace = this.data.data.laserDesign.halfRangeSpace + " / " + this.data.data.laserDesign.maxRangeSpace;

      // Shots
      let reloadTime = 3;
      if (this.data.data.laserDesign.powerCell == "A") {
        baseShots = +baseShots * 0.01;
        this.data.data.laserDesign.powerCellWeight = 0.005;
      }
      else if (this.data.data.laserDesign.powerCell == "B") {
        baseShots = +baseShots * 0.1;
        this.data.data.laserDesign.powerCellWeight = 0.05;
      }
      else if (this.data.data.laserDesign.powerCell == "C") {
        baseShots = +baseShots * 1;
        this.data.data.laserDesign.powerCellWeight = 0.5;
      }
      else if (this.data.data.laserDesign.powerCell == "D") {
        baseShots = +baseShots * 10;
        reloadTime = 5;
        this.data.data.laserDesign.powerCellWeight = 5;
      }
      else if (this.data.data.laserDesign.powerCell == "E") {
        baseShots = +baseShots * 100;
        reloadTime = 5;
        this.data.data.laserDesign.powerCellWeight = 20;
      }
      else if (this.data.data.laserDesign.powerCell == "F") {
        baseShots = +baseShots * 1000;
        reloadTime = 5;
        this.data.data.laserDesign.powerCellWeight = 200;
      }

      reloadTime = reloadTime * this.data.data.laserDesign.powerCellQty;

      if (this.data.data.laserDesign.superScienceCells) {
        baseShots = +baseShots * 5;
      }
      if (this.data.data.laserDesign.nonRechargeableCells) {
        baseShots = +baseShots * 2;
      }

      baseShots = +baseShots * this.data.data.laserDesign.powerCellQty;

      this.data.data.laserDesign.shots = Math.floor(+baseShots / this.data.data.laserDesign.damageDiceInput ** 3);

      if (this.data.data.laserDesign.beamType == "laser" && this.data.data.laserDesign.laserColour == "bg") {
        this.data.data.laserDesign.shots = this.data.data.laserDesign.shots / 2;
      }

      this.data.data.laserDesign.outputShots = this.data.data.laserDesign.shots + " (" + reloadTime + ")";
      this.data.data.laserDesign.outputShotsHotshots = (this.data.data.laserDesign.shots/2) + " (" + reloadTime + ")";

      // Calculate empty weight
      this.data.data.laserDesign.emptyWeight = ((+this.data.data.laserDesign.damageDiceInput * s / e)**3 * f * g) * +this.data.data.laserDesign.weightTweak;

      // Calculate the loaded weight
      this.data.data.laserDesign.loadedWeight = (Math.round(((Math.round(this.data.data.laserDesign.emptyWeight * 100) / 100) + (this.data.data.laserDesign.powerCellQty * this.data.data.laserDesign.powerCellWeight)) * 100) / 100);

      this.data.data.weight = this.data.data.laserDesign.loadedWeight
      this.data.data.ttlWeight = this.data.data.weight * this.data.data.quantity;

      // Calculate the output weight
      this.data.data.laserDesign.outputWeight = this.data.data.laserDesign.loadedWeight + "/" + this.data.data.laserDesign.powerCellQty + this.data.data.laserDesign.powerCell;

      // Calculate ST and Bulk
      if (this.data.data.laserDesign.configuration == "pistol") {
        this.data.data.laserDesign.outputST = Math.round(Math.sqrt(this.data.data.laserDesign.loadedWeight) * 3.3);
        this.data.data.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.data.data.laserDesign.loadedWeight) * 1.25, 1),10) * -1;
      }
      else if (this.data.data.laserDesign.configuration == "beamer") {
        this.data.data.laserDesign.outputST = Math.round(Math.sqrt(this.data.data.laserDesign.loadedWeight) * 3.3);
        this.data.data.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.data.data.laserDesign.loadedWeight), 0),10) * -1;
      }
      else if (this.data.data.laserDesign.configuration == "cannon") {
        this.data.data.laserDesign.outputST = Math.round(Math.sqrt(this.data.data.laserDesign.loadedWeight) * 2.4) + "M";
        this.data.data.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.data.data.laserDesign.loadedWeight) * 1.5, 6),10) * -1;
      }
      else if (this.data.data.laserDesign.configuration == "rifle") {
        this.data.data.laserDesign.outputST = Math.round(Math.sqrt(this.data.data.laserDesign.loadedWeight) * 2.2) + "†";
        this.data.data.laserDesign.outputBulk = Math.min(Math.max(Math.sqrt(this.data.data.laserDesign.loadedWeight) * 1.5, 3),10) * -1;
      }
      this.data.data.laserDesign.outputBulk = Math.round(this.data.data.laserDesign.outputBulk)

      this.data.data.laserDesign.outputRcl = 1;

      this.data.data.cost = (Math.round(this.data.data.laserDesign.emptyWeight * bc * gc * 100) / 100);

      let cf = 1
      if (this.data.data.laserDesign.beamType == "blaster" && this.data.data.laserDesign.omniBlaster) {
        cf += 1;
      }
      if (this.data.data.laserDesign.fieldJacketed && this.data.data.laserDesign.allowSuperScienceCustomLasers) {
        cf += 1;
      }
      if (parseInt(this.data.data.laserDesign.graviticFocus) > 0){
        if (parseInt(this.data.data.laserDesign.graviticFocus) == 1) {
          cf += 1
        }
        else if (parseInt(this.data.data.laserDesign.graviticFocus) == 2) {
          cf += 3
        }
        else if (parseInt(this.data.data.laserDesign.graviticFocus) == 3) {
          cf += 7
        }
      }
      if (this.data.data.laserDesign.pulseBeamLaser && this.data.data.laserDesign.pulseLaser) {
        cf += 1
      }

      this.data.data.cost = this.data.data.cost * cf;

      this.data.data.ttlCost = this.data.data.cost * this.data.data.quantity;

      // Calculate LC
      if (this.data.data.laserDesign.loadedWeight >= 15) {
        lc -= 2;
      }
      else if (this.data.data.laserDesign.loadedWeight >= 5) {
        lc -= 1;
      }

      this.data.data.lc = lc;

      // Done building the custom laser

      this.addCustomLaserProfiles() // Call the method that takes the profiles the user has selected and add them to the profiles for the weapon
    }
  }

  addCustomLaserProfiles() {
    if (this.data.data.laserDesign.meleeProfile) { // If the user wants to include a melee profile
      this.addMeleeProfile(this.data.data.laserDesign.outputBulk, this.data.data.laserDesign.cavalierWeapon, this.data.data.laserDesign.configuration, this.data.data.laserDesign.meleeSkill, this.data.data.laserDesign.meleeSkillMod, this.data.data.laserDesign.outputST) // Include one
    }

    let rangedProfiles = [];
    // For each ranged profile, check if the box is checked and add the ranged profile accordingly.
    if (this.data.data.laserDesign.showAir) {
      let showAir = {
        "name": "Air",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAcc,
        "damageInput": this.data.data.laserDesign.outputDamage,
        "damageType": this.data.data.laserDesign.damageType,
        "armourDivisor": this.data.data.laserDesign.armourDivisor,
        "range": this.data.data.laserDesign.halfRange + " " + this.data.data.laserDesign.maxRange,
        "rof": this.data.data.laserDesign.outputRoF,
        "shots": this.data.data.laserDesign.shots,
        "bulk": this.data.data.laserDesign.bulk,
        "rcl": this.data.data.laserDesign.rcl,
        "st": this.data.data.laserDesign.st,
        "malf": 17
      }

      rangedProfiles.push(showAir);
    }
    if (this.data.data.laserDesign.showSpace) {
      let showSpace = {
        "name": "Space",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccSpace,
        "damageInput": this.data.data.laserDesign.outputDamage,
        "damageType": this.data.data.laserDesign.damageType,
        "armourDivisor": this.data.data.laserDesign.armourDivisorSpace,
        "range": this.data.data.laserDesign.halfRangeSpace + " " + this.data.data.laserDesign.maxRangeSpace,
        "rof": this.data.data.laserDesign.outputRoF,
        "shots": this.data.data.laserDesign.shots,
        "bulk": this.data.data.laserDesign.bulk,
        "rcl": this.data.data.laserDesign.rcl,
        "st": this.data.data.laserDesign.st,
        "malf": 17
      }

      rangedProfiles.push(showSpace);
    }
    if (this.data.data.laserDesign.showWater) {
      let showWater = {
        "name": "Water",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccWater,
        "damageInput": this.data.data.laserDesign.outputDamage,
        "damageType": this.data.data.laserDesign.damageType,
        "armourDivisor": this.data.data.laserDesign.armourDivisorWater,
        "range": this.data.data.laserDesign.halfRangeWater + " " + this.data.data.laserDesign.maxRangeWater,
        "rof": this.data.data.laserDesign.outputRoF,
        "shots": this.data.data.laserDesign.shots / 2,
        "bulk": this.data.data.laserDesign.bulk,
        "rcl": this.data.data.laserDesign.rcl,
        "st": this.data.data.laserDesign.st,
        "malf": 17
      }

      rangedProfiles.push(showWater);
    }
    if (this.data.data.laserDesign.showAirHotshot && this.data.data.hotshotsAndOverheating && !(this.data.data.configuration.toLowerCase().includes("gat"))) { // The user wants to show hotshots, hotshots are allowed, and this isn't a gatling weapon
      let showAirHotshot = {
        "name": "Hotshot Air",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAcc,
        "damageInput": this.data.data.laserDesign.outputDamageHotshots,
        "damageType": this.data.data.laserDesign.damageType,
        "armourDivisor": this.data.data.laserDesign.armourDivisor,
        "range": this.data.data.laserDesign.halfRange + " " + this.data.data.laserDesign.maxRange,
        "rof": this.data.data.laserDesign.outputRoF,
        "shots": this.data.data.laserDesign.shots / 2,
        "bulk": this.data.data.laserDesign.bulk,
        "rcl": this.data.data.laserDesign.rcl,
        "st": this.data.data.laserDesign.st,
        "malf": 14
      }

      rangedProfiles.push(showAirHotshot);
    }
    if (this.data.data.laserDesign.showSpaceHotshot && this.data.data.hotshotsAndOverheating && !(this.data.data.configuration.toLowerCase().includes("gat"))) { // The user wants to show hotshots, hotshots are allowed, and this isn't a gatling weapon
      let showSpaceHotshot = {
        "name": "Space Hotshot",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccSpace,
        "damageInput": this.data.data.laserDesign.outputDamageHotshots,
        "damageType": this.data.data.laserDesign.damageType,
        "armourDivisor": this.data.data.laserDesign.armourDivisorSpace,
        "range": this.data.data.laserDesign.halfRangeSpace + " " + this.data.data.laserDesign.maxRangeSpace,
        "rof": this.data.data.laserDesign.outputRoF,
        "shots": this.data.data.laserDesign.shots / 2,
        "bulk": this.data.data.laserDesign.bulk,
        "rcl": this.data.data.laserDesign.rcl,
        "st": this.data.data.laserDesign.st,
        "malf": 14
      }

      rangedProfiles.push(showSpaceHotshot);
    }
    if (this.data.data.laserDesign.showWaterHotshot && this.data.data.hotshotsAndOverheating && !(this.data.data.configuration.toLowerCase().includes("gat"))) { // The user wants to show hotshots, hotshots are allowed, and this isn't a gatling weapon
      let showWaterHotshot = {
        "name": "Water Hotshot",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccWater,
        "damageInput": this.data.data.laserDesign.outputDamageHotshots,
        "damageType": this.data.data.laserDesign.damageType,
        "armourDivisor": this.data.data.laserDesign.armourDivisorWater,
        "range": this.data.data.laserDesign.halfRangeWater + " " + this.data.data.laserDesign.maxRangeWater,
        "rof": this.data.data.laserDesign.outputRoF,
        "shots": this.data.data.laserDesign.shots / 2,
        "bulk": this.data.data.laserDesign.bulk,
        "rcl": this.data.data.laserDesign.rcl,
        "st": this.data.data.laserDesign.st,
        "malf": 14
      }

      rangedProfiles.push(showWaterHotshot);
    }
    this.data.data.ranged = rangedProfiles;
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

    this.data.data.melee = [newRow];
  }

  prepareCustomBow(type) {
    if (typeof this.data.data.bowDesign == "undefined") { // If the bowDesign block hasn't yet been created
      this.data.data.bowDesign = { // Create it
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

    if (typeof this.data.data.bowDesign.workingMaterialOne == "undefined") { // If the material block hasn't yet been created
      this.data.data.bowDesign.workingMaterialOne = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.data.data.bowDesign.workingMaterialTwo == "undefined") { // If the material block hasn't yet been created
      this.data.data.bowDesign.workingMaterialTwo = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.data.data.bowDesign.workingMaterialAvg == "undefined") { // If the material block hasn't yet been created
      this.data.data.bowDesign.workingMaterialAvg = { // Create it
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

    if (typeof this.data.data.bowDesign.riserMaterialOne == "undefined") { // If the material block hasn't yet been created
      this.data.data.bowDesign.riserMaterialOne = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.data.data.bowDesign.riserMaterialTwo == "undefined") { // If the material block hasn't yet been created
      this.data.data.bowDesign.riserMaterialTwo = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.data.data.bowDesign.stockMaterialOne == "undefined") { // If the material block hasn't yet been created
      this.data.data.bowDesign.stockMaterialOne = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    if (typeof this.data.data.bowDesign.stockMaterialTwo == "undefined") { // If the material block hasn't yet been created
      this.data.data.bowDesign.stockMaterialTwo = { // Create it
        "a": 0,
        "densityLbsCuIn": 0,
        "elasticModulusPsi": 0,
        "name": "",
        "tensileStPsi": 0,
        "tl": 0,
        "maxStrain": 0,
        "bowCostPerLb": 0,
        "arrowCostPerLb": 0,
      }
    }

    // Validations
    // Working percentage must be between 0 and 100
    if (this.data.data.bowDesign.workingPercentage > 100) {
      this.data.data.bowDesign.workingPercentage = 100;
    }
    else if (this.data.data.bowDesign.workingPercentage < 0){
      this.data.data.bowDesign.workingPercentage = 0;
    }

    // Cross section must not be zero or negative
    if (!(this.data.data.bowDesign.crossSection > 0)) {
      this.data.data.bowDesign.crossSection = 1;
    }

    if (this.data.data.bowDesign.workingPercentage < 100) { // If working percent is not 100 then there must be a riser.
      this.data.data.bowDesign.riser = true;
    }

    if (this.data.data.bowDesign.bowConstruction == "compound") { // It's a compound bow
      this.data.data.bowDesign.loops = Math.max(this.data.data.bowDesign.loops, 1); // There must be at least 1 loop
    }
    else { // It's not a compound bow
      this.data.data.bowDesign.loops = 1; // Bows that are not compound bows have a single loop
    }

    if (this.data.data.bowDesign.totalBowLength <= 0) { // Total bow length must be greater than zero, otherwise it doesn't exist.
      this.data.data.bowDesign.totalBowLength = 1;
    }

    // Get game settings
    this.data.data.bowDesign.magicalMaterials         = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");
    this.data.data.bowDesign.compoundBowStrictTL      = game.settings.get("gurps4e", "compoundBowStrictTL");
    this.data.data.bowDesign.fixedBonusStrongbow      = game.settings.get("gurps4e", "fixedBonusStrongbow");
    this.data.data.bowDesign.realisticBowScale        = game.settings.get("gurps4e", "realisticBowScale");

    // Get materials
    this.data.data.bowDesign.materials = game.materialAPI.fetchBowMaterials();

    // Do actual code stuff
    this.data.data.bowDesign.type = type;

    this.data.data.bowDesign.userSTFromActor = false; // Reset whether we're getting the ST from the actor.
    this.data.data.bowDesign.strongBowCrossbowFinesseFromActor = false; // Reset whether we're getting the perk from the user.
    if (this.actor) { // If there's an actor
      if (this.actor.data) {
        if (this.actor.data.data) {
          let smDiscount = attributeHelpers.calcSMDiscount(this.actor.data.data.bio.sm);
          let st = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.strength, smDiscount);
          let lifting = attributeHelpers.calcLiftingSt(st, this.actor.data.data.primaryAttributes.lifting, smDiscount)

          this.data.data.bowDesign.userST = lifting; // Get lifting ST from the user
          this.data.data.bowDesign.userSTFromActor = true; // Flag that we're getting the ST from the user

          for (let i = 0; i < this.actor.data.items._source.length; i++) { // Loop through the list of the actor's items
            if (this.actor.data.items._source[i].type === "Trait") { // Make sure it's a trait
              if ((this.actor.data.items._source[i].name.toLowerCase() == "strongbow" || // Check if they have strongbow
                  this.actor.data.items._source[i].name.toLowerCase() == "strong bow") &&
                  (this.data.data.bowDesign.type == "bow" || this.data.data.bowDesign.type == "footbow")) { // And make sure this is a bow
                this.data.data.bowDesign.strongBowCrossbowFinesseFromActor = true; // Flag that the perk is coming from the actor.
                this.data.data.bowDesign.strongBowCrossbowFinesse = true; // Set the status of the perk
              }
              else if ((this.actor.data.items._source[i].name.toLowerCase() == "crossbow finesse") && (this.data.data.bowDesign.type == "xbow")) {
                this.data.data.bowDesign.strongBowCrossbowFinesseFromActor = true; // Flag that the perk is coming from the actor.
                this.data.data.bowDesign.strongBowCrossbowFinesse = true; // Set the status of the perk
              }
            }
          }
        }
      }
    }

    if (this.data.data.bowDesign.strongBowCrossbowFinesse) { // If the perk is set
      if (this.actor) { // If there's an actor we will need to fetch the finesse effect from the sheet
        let skillLevel = 0;
        let attrLevel = 0;
        let relativeBonus = 0;
        for (let i = 0; i < this.actor.data.items._source.length; i++) { // Loop through the list of the actor's items
          if (this.actor.data.items._source[i].type === "Rollable") { // Make sure it's a skill
            if (this.actor.data.items._source[i].name.toLowerCase() == this.data.data.bowDesign.skill.toLowerCase()) { // And make sure it matches the skill name they've given
              skillLevel = skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data); // Get the skill level.
              attrLevel = skillHelpers.getBaseAttrValue(this.actor.data.items._source[i].data.baseAttr, this.actor); // Get the attribute level
              relativeBonus = skillLevel - attrLevel;
              relativeBonus = Math.max(relativeBonus, 0); // Make the bonus at least zero.
              relativeBonus = Math.min(relativeBonus, 2); // Make the bonus no more than two
              this.data.data.bowDesign.strongBowCrossbowFinesseEffect = relativeBonus;
            }
          }
        }
      }

      if (this.data.data.bowDesign.fixedBonusStrongbow) { // If we're using the fixed bonus
        this.data.data.bowDesign.userBL = (this.data.data.bowDesign.userST * this.data.data.bowDesign.userST)/5; // Basic Lift
        this.data.data.bowDesign.userBL = this.data.data.bowDesign.userBL * (1 + (0.15 * this.data.data.bowDesign.strongBowCrossbowFinesseEffect)) // Basic lift plus the perk's bonus
      }
      else { // If it's not
        this.data.data.bowDesign.userBL = ((this.data.data.bowDesign.userST+this.data.data.bowDesign.strongBowCrossbowFinesseEffect) * (this.data.data.bowDesign.userST+this.data.data.bowDesign.strongBowCrossbowFinesseEffect))/5
      }
    }
    else { // If the perk is not set at all
      this.data.data.bowDesign.userBL = ((this.data.data.bowDesign.userST) * (this.data.data.bowDesign.userST))/5
    }

    // Fetch the materials
    this.data.data.bowDesign.workingMaterialOne = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.workingMaterialOne.name);
    this.data.data.bowDesign.workingMaterialTwo = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.workingMaterialTwo.name);
    this.data.data.bowDesign.riserMaterialOne   = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.riserMaterialOne.name);
    this.data.data.bowDesign.riserMaterialTwo   = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.riserMaterialTwo.name);
    this.data.data.bowDesign.stockMaterialOne   = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.stockMaterialOne.name);
    this.data.data.bowDesign.stockMaterialTwo   = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.stockMaterialTwo.name);

    if (this.data.data.bowDesign.workingMaterialOneEssential) {
      this.data.data.bowDesign.workingMaterialOne = game.materialAPI.essentializeBowMaterial(this.data.data.bowDesign.workingMaterialOne);
    }

    if (this.data.data.bowDesign.workingMaterialTwoEssential) {
      this.data.data.bowDesign.workingMaterialTwo = game.materialAPI.essentializeBowMaterial(this.data.data.bowDesign.workingMaterialTwo);
    }

    if (this.data.data.bowDesign.riserMaterialOneEssential) {
      this.data.data.bowDesign.riserMaterialOne = game.materialAPI.essentializeBowMaterial(this.data.data.bowDesign.riserMaterialOne);
    }

    if (this.data.data.bowDesign.riserMaterialTwoEssential) {
      this.data.data.bowDesign.riserMaterialTwo = game.materialAPI.essentializeBowMaterial(this.data.data.bowDesign.riserMaterialTwo);
    }

    if (this.data.data.bowDesign.stockMaterialOneEssential) {
      this.data.data.bowDesign.stockMaterialOne = game.materialAPI.essentializeBowMaterial(this.data.data.bowDesign.stockMaterialOne);
    }

    if (this.data.data.bowDesign.stockMaterialTwoEssential) {
      this.data.data.bowDesign.stockMaterialTwo = game.materialAPI.essentializeBowMaterial(this.data.data.bowDesign.stockMaterialTwo);
    }

    // Calculate the inferred values
    if (typeof this.data.data.bowDesign.workingMaterialOne != "undefined") {
      this.data.data.bowDesign.workingMaterialOne.maxStrain      = this.data.data.bowDesign.workingMaterialOne.tensileStPsi  / this.data.data.bowDesign.workingMaterialOne.elasticModulusPsi;
      this.data.data.bowDesign.workingMaterialOne.bowCostPerLb   = Math.round(this.data.data.bowDesign.workingMaterialOne.tensileStPsi ** 2 / 100 / this.data.data.bowDesign.workingMaterialOne.elasticModulusPsi / this.data.data.bowDesign.workingMaterialOne.densityLbsCuIn*100)/100;
      this.data.data.bowDesign.workingMaterialOne.arrowCostPerLb = Math.round(this.data.data.bowDesign.workingMaterialOne.elasticModulusPsi / this.data.data.bowDesign.workingMaterialOne.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.data.data.bowDesign.workingMaterialTwo != "undefined") {
      this.data.data.bowDesign.workingMaterialTwo.maxStrain      = this.data.data.bowDesign.workingMaterialTwo.tensileStPsi  / this.data.data.bowDesign.workingMaterialTwo.elasticModulusPsi;
      this.data.data.bowDesign.workingMaterialTwo.bowCostPerLb   = Math.round(this.data.data.bowDesign.workingMaterialTwo.tensileStPsi ** 2 / 100 / this.data.data.bowDesign.workingMaterialTwo.elasticModulusPsi / this.data.data.bowDesign.workingMaterialTwo.densityLbsCuIn*100)/100;
      this.data.data.bowDesign.workingMaterialTwo.arrowCostPerLb = Math.round(this.data.data.bowDesign.workingMaterialTwo.elasticModulusPsi / this.data.data.bowDesign.workingMaterialTwo.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.data.data.bowDesign.riserMaterialOne != "undefined") {
      this.data.data.bowDesign.riserMaterialOne.maxStrain      = this.data.data.bowDesign.riserMaterialOne.tensileStPsi    / this.data.data.bowDesign.riserMaterialOne.elasticModulusPsi;
      this.data.data.bowDesign.riserMaterialOne.bowCostPerLb   = Math.round(this.data.data.bowDesign.riserMaterialOne.tensileStPsi   ** 2 / 100 / this.data.data.bowDesign.riserMaterialOne.elasticModulusPsi   / this.data.data.bowDesign.riserMaterialOne.densityLbsCuIn*100)/100;
      this.data.data.bowDesign.riserMaterialOne.arrowCostPerLb = Math.round(this.data.data.bowDesign.riserMaterialOne.elasticModulusPsi / this.data.data.bowDesign.riserMaterialOne.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.data.data.bowDesign.riserMaterialTwo != "undefined") {
      this.data.data.bowDesign.riserMaterialTwo.maxStrain      = this.data.data.bowDesign.riserMaterialTwo.tensileStPsi    / this.data.data.bowDesign.riserMaterialTwo.elasticModulusPsi;
      this.data.data.bowDesign.riserMaterialTwo.bowCostPerLb   = Math.round(this.data.data.bowDesign.riserMaterialTwo.tensileStPsi   ** 2 / 100 / this.data.data.bowDesign.riserMaterialTwo.elasticModulusPsi   / this.data.data.bowDesign.riserMaterialTwo.densityLbsCuIn*100)/100;
      this.data.data.bowDesign.riserMaterialTwo.arrowCostPerLb = Math.round(this.data.data.bowDesign.riserMaterialTwo.elasticModulusPsi / this.data.data.bowDesign.riserMaterialTwo.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.data.data.bowDesign.stockMaterialOne != "undefined") {
      this.data.data.bowDesign.stockMaterialOne.maxStrain      = this.data.data.bowDesign.stockMaterialOne.tensileStPsi    / this.data.data.bowDesign.stockMaterialOne.elasticModulusPsi;
      this.data.data.bowDesign.stockMaterialOne.bowCostPerLb   = Math.round(this.data.data.bowDesign.stockMaterialOne.tensileStPsi   ** 2 / 100 / this.data.data.bowDesign.stockMaterialOne.elasticModulusPsi   / this.data.data.bowDesign.stockMaterialOne.densityLbsCuIn*100)/100;
      this.data.data.bowDesign.stockMaterialOne.arrowCostPerLb = Math.round(this.data.data.bowDesign.stockMaterialOne.elasticModulusPsi / this.data.data.bowDesign.stockMaterialOne.densityLbsCuIn*1.25/9000000*100)/100;
    }
    if (typeof this.data.data.bowDesign.stockMaterialTwo != "undefined") {
      this.data.data.bowDesign.stockMaterialTwo.maxStrain      = this.data.data.bowDesign.stockMaterialTwo.tensileStPsi    / this.data.data.bowDesign.stockMaterialTwo.elasticModulusPsi;
      this.data.data.bowDesign.stockMaterialTwo.bowCostPerLb   = Math.round(this.data.data.bowDesign.stockMaterialTwo.tensileStPsi   ** 2 / 100 / this.data.data.bowDesign.stockMaterialTwo.elasticModulusPsi   / this.data.data.bowDesign.stockMaterialTwo.densityLbsCuIn*100)/100;
      this.data.data.bowDesign.stockMaterialTwo.arrowCostPerLb = Math.round(this.data.data.bowDesign.stockMaterialTwo.elasticModulusPsi / this.data.data.bowDesign.stockMaterialTwo.densityLbsCuIn*1.25/9000000*100)/100;
    }

    // Put together the average values
    if (typeof this.data.data.bowDesign.workingMaterialOne != "undefined" && typeof this.data.data.bowDesign.workingMaterialTwo != "undefined") {
      this.data.data.bowDesign.workingMaterialAvg = { // Create it
        "a"                 : (this.data.data.bowDesign.workingMaterialOne.a + this.data.data.bowDesign.workingMaterialTwo.a)/2,
        "densityLbsCuIn"    : (this.data.data.bowDesign.workingMaterialOne.densityLbsCuIn + this.data.data.bowDesign.workingMaterialTwo.densityLbsCuIn)/2,
        "elasticModulusPsi" : (this.data.data.bowDesign.workingMaterialOne.elasticModulusPsi + this.data.data.bowDesign.workingMaterialTwo.elasticModulusPsi)/2,
        "tensileStPsi"      : (this.data.data.bowDesign.workingMaterialOne.tensileStPsi + this.data.data.bowDesign.workingMaterialTwo.tensileStPsi)/2,
        "tl"                : Math.max(this.data.data.bowDesign.workingMaterialOne.tl + this.data.data.bowDesign.workingMaterialTwo.tl),
        "maxStrain"         : (this.data.data.bowDesign.workingMaterialOne.maxStrain + this.data.data.bowDesign.workingMaterialTwo.maxStrain)/2,
        "bowCostPerLb"      : (this.data.data.bowDesign.workingMaterialOne.bowCostPerLb + this.data.data.bowDesign.workingMaterialTwo.bowCostPerLb)/2,
        "arrowCostPerLb"    : (this.data.data.bowDesign.workingMaterialOne.arrowCostPerLb + this.data.data.bowDesign.workingMaterialTwo.arrowCostPerLb)/2,
      }
    }
    if (typeof this.data.data.bowDesign.riserMaterialOne != "undefined" && typeof this.data.data.bowDesign.riserMaterialTwo != "undefined") {
      this.data.data.bowDesign.riserMaterialAvg = { // Create it
        "a": (this.data.data.bowDesign.riserMaterialOne.a + this.data.data.bowDesign.riserMaterialTwo.a) / 2,
        "densityLbsCuIn": (this.data.data.bowDesign.riserMaterialOne.densityLbsCuIn + this.data.data.bowDesign.riserMaterialTwo.densityLbsCuIn) / 2,
        "elasticModulusPsi": (this.data.data.bowDesign.riserMaterialOne.elasticModulusPsi + this.data.data.bowDesign.riserMaterialTwo.elasticModulusPsi) / 2,
        "tensileStPsi": (this.data.data.bowDesign.riserMaterialOne.tensileStPsi + this.data.data.bowDesign.riserMaterialTwo.tensileStPsi) / 2,
        "tl": Math.max(this.data.data.bowDesign.riserMaterialOne.tl + this.data.data.bowDesign.riserMaterialTwo.tl),
        "maxStrain": (this.data.data.bowDesign.riserMaterialOne.maxStrain + this.data.data.bowDesign.riserMaterialTwo.maxStrain) / 2,
        "bowCostPerLb": ((this.data.data.bowDesign.riserMaterialOne.bowCostPerLb + this.data.data.bowDesign.riserMaterialTwo.bowCostPerLb) / 2) / 5,
        "arrowCostPerLb": (this.data.data.bowDesign.riserMaterialOne.arrowCostPerLb + this.data.data.bowDesign.riserMaterialTwo.arrowCostPerLb) / 2,
      }
    }
    if (typeof this.data.data.bowDesign.stockMaterialOne != "undefined" && typeof this.data.data.bowDesign.stockMaterialTwo != "undefined") {
      this.data.data.bowDesign.stockMaterialAvg = { // Create it
        "a": (this.data.data.bowDesign.stockMaterialOne.a + this.data.data.bowDesign.stockMaterialTwo.a) / 2,
        "densityLbsCuIn": (this.data.data.bowDesign.stockMaterialOne.densityLbsCuIn + this.data.data.bowDesign.stockMaterialTwo.densityLbsCuIn) / 2,
        "elasticModulusPsi": (this.data.data.bowDesign.stockMaterialOne.elasticModulusPsi + this.data.data.bowDesign.stockMaterialTwo.elasticModulusPsi) / 2,
        "tensileStPsi": (this.data.data.bowDesign.stockMaterialOne.tensileStPsi + this.data.data.bowDesign.stockMaterialTwo.tensileStPsi) / 2,
        "tl": Math.max(this.data.data.bowDesign.stockMaterialOne.tl + this.data.data.bowDesign.stockMaterialTwo.tl),
        "maxStrain": (this.data.data.bowDesign.stockMaterialOne.maxStrain + this.data.data.bowDesign.stockMaterialTwo.maxStrain) / 2,
        "bowCostPerLb": ((this.data.data.bowDesign.stockMaterialOne.bowCostPerLb + this.data.data.bowDesign.stockMaterialTwo.bowCostPerLb) / 2) / 10,
        "arrowCostPerLb": (this.data.data.bowDesign.stockMaterialOne.arrowCostPerLb + this.data.data.bowDesign.stockMaterialTwo.arrowCostPerLb) / 2,
      }
    }

    // Do all the math shit

    // Calc k factor
    let k = 0;
    if (this.data.data.bowDesign.shape == "round") { // Bow is round
      k = 64/Math.PI;
    }
    else { // Bow is D-section
      k = 12 / this.data.data.bowDesign.crossSection;
    }

    // Get constructionFactor based on bowConstruction
    let constructionFactor = 0;
    if (this.data.data.bowDesign.bowConstruction == "straight") {
      constructionFactor = 1;
    }
    else if (this.data.data.bowDesign.bowConstruction == "recurve") {
      constructionFactor = 1.3;
    }
    else if (this.data.data.bowDesign.bowConstruction == "reflex") {
      constructionFactor = 1.6;
    }
    else if (this.data.data.bowDesign.bowConstruction == "compound") {
      constructionFactor = 1;
    }

    // Begin minimum thickness calc
    this.data.data.bowDesign.limbMinThickness = ((k * this.data.data.bowDesign.drawWeight * (this.data.data.bowDesign.totalBowLength * (this.data.data.bowDesign.workingPercentage / 100)) * constructionFactor)/(8 * this.data.data.bowDesign.workingMaterialAvg.tensileStPsi)) ** (1/3);
    this.data.data.bowDesign.limbMinThickness = Math.round(this.data.data.bowDesign.limbMinThickness * 10000) / 10000;

    // Begin Deflection calc
    let delta = ((k * this.data.data.bowDesign.drawWeight * (this.data.data.bowDesign.totalBowLength * (this.data.data.bowDesign.workingPercentage / 100)) ** 3) / (32 * this.data.data.bowDesign.workingMaterialAvg.elasticModulusPsi * this.data.data.bowDesign.limbThickness ** 4));

    this.data.data.bowDesign.deflection = delta / (this.data.data.bowDesign.totalBowLength * (this.data.data.bowDesign.workingPercentage / 100))

    // Begin max draw length calc
    let r = this.data.data.bowDesign.totalBowLength * (1 - (this.data.data.bowDesign.workingPercentage/100));
    let l = this.data.data.bowDesign.totalBowLength * (this.data.data.bowDesign.workingPercentage/100);

    // theta calculation is a bitch.
    let theta = (141.99 * this.data.data.bowDesign.deflection ** 4) - (51.892 * this.data.data.bowDesign.deflection ** 3) + (9.4364 * this.data.data.bowDesign.deflection ** 2) + (7.5125 * this.data.data.bowDesign.deflection) + 0.0047;

    // Calc working string length
    let s = this.data.data.bowDesign.loops * this.data.data.bowDesign.totalBowLength - ((this.data.data.bowDesign.loops - 1) * (r + (2 * l * Math.sin(theta/2)) / theta));

    let rDiv2 = (r == 0) ? 0 : r / 2; // r divided by 2, but if r is 0, result is 0

    // Calculate max draw
    this.data.data.bowDesign.maxDrawLength = delta + Math.sqrt((s ** 2)/4 - (rDiv2 + (l * Math.sin(theta/2))/theta) ** 2);

    // Cap draw at max draw
    this.data.data.bowDesign.drawLength = Math.min(this.data.data.bowDesign.maxDrawLength, this.data.data.bowDesign.targetDrawLength);

    // Calculate the thickness of the stock and riser
    this.data.data.bowDesign.riserThickness = 0;
    this.data.data.bowDesign.stockThickness = 0;
    let riserWeight = 0;
    let stockWeight = 0;
    if (this.data.data.bowDesign.riser && typeof this.data.data.bowDesign.riserMaterialAvg != "undefined") { // It has a riser and the material is defined
      this.data.data.bowDesign.riserThickness = ((this.data.data.bowDesign.drawWeight * r ** 2) / (4 * this.data.data.bowDesign.riserMaterialAvg.elasticModulusPsi * this.data.data.bowDesign.riserWidth * this.data.data.bowDesign.allowedRiserDeflection * 100)) ** (1/3);
      riserWeight = this.data.data.bowDesign.riserMaterialAvg.densityLbsCuIn * this.data.data.bowDesign.riserWidth * this.data.data.bowDesign.riserThickness * r;
    }
    if (this.data.data.bowDesign.type == "xbow" && typeof this.data.data.bowDesign.stockMaterialAvg != "undefined"){ // It has a stock and the material is defined
      this.data.data.bowDesign.stockThickness = (this.data.data.bowDesign.drawWeight * this.data.data.bowDesign.drawLength ** 2 / 4 / this.data.data.bowDesign.stockMaterialAvg.elasticModulusPsi / this.data.data.bowDesign.stockWidth / this.data.data.bowDesign.allowedStockDeflection * 100) ** (1/3);
      stockWeight = this.data.data.bowDesign.stockMaterialAvg.densityLbsCuIn * this.data.data.bowDesign.stockWidth * this.data.data.bowDesign.stockThickness * this.data.data.bowDesign.stockLength;
    }

    // Calculate bow weight
    let c = 0.785
    if (this.data.data.bowDesign.shape == "d") {
      c = this.data.data.bowDesign.crossSection;
    }

    let limbsWeight = (this.data.data.bowDesign.workingMaterialAvg.densityLbsCuIn * l * this.data.data.bowDesign.limbMinThickness ** 2 * c)
    this.data.data.weight = limbsWeight + riserWeight + stockWeight;

    // Calculate Stored Energy
    let z = 0.057;
    if (this.data.data.bowDesign.bowConstruction == "straight") {
      z = 0.057;
    }
    else if (this.data.data.bowDesign.bowConstruction == "recurve") {
      z = 0.065;
    }
    else if (this.data.data.bowDesign.bowConstruction == "reflex") {
      z = 0.073;
    }
    else if (this.data.data.bowDesign.bowConstruction == "compound") {
      z = 0.090;
    }

    // Calculate Bow Energy
    let potentialEnergy = this.data.data.bowDesign.drawWeight * this.data.data.bowDesign.drawLength * z; // Potential energy in joules.
    let workingMass = 37 * this.data.data.bowDesign.workingMaterialAvg.densityLbsCuIn * this.data.data.bowDesign.limbMinThickness ** 2 * Math.sqrt(this.data.data.bowDesign.crossSection / l);

    // Bow Bulk
    this.data.data.bowDesign.bulk = Math.round(9 - 9 * Math.log10(l + r + this.data.data.bowDesign.stockLength));

    let accFactor = 0
    if (this.data.data.bowDesign.type == "footbow") {
      accFactor = -1
    }
    else if (this.data.data.bowDesign.type == "xbow") {
      accFactor = 1
    }

    if (this.data.data.bowDesign.type == "bow") {
      this.data.data.bowDesign.st = Math.ceil(Math.sqrt(this.data.data.bowDesign.drawWeight*2));
    }
    else {
      this.data.data.bowDesign.st = Math.ceil(Math.sqrt(5/8 * this.data.data.bowDesign.drawWeight));
    }

    // Calculate Arrow Stuff
    if (typeof this.data.data.bowDesign.arrows != "undefined") {
      let arrowKeys = Object.keys(this.data.data.bowDesign.arrows); // Get the arrow keys
      if (arrowKeys.length > 0) { // If there are actually keys
        for (let i = 0; i < arrowKeys.length; i++){
          if (typeof this.data.data.bowDesign.arrows[arrowKeys[i]].material.name != "undefined") {
            this.data.data.bowDesign.arrows[arrowKeys[i]].material = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.arrows[arrowKeys[i]].material.name);

            if (this.data.data.bowDesign.arrows[arrowKeys[i]].materialEssential) {
              this.data.data.bowDesign.arrows[arrowKeys[i]].material = game.materialAPI.essentializeBowMaterial(this.data.data.bowDesign.arrows[arrowKeys[i]].material);
            }
          }

          if (this.data.data.bowDesign.arrows[arrowKeys[i]].length >= this.data.data.bowDesign.drawLength) {
            this.data.data.bowDesign.arrows[arrowKeys[i]].validShaft = false;
          }
          else {
            this.data.data.bowDesign.arrows[arrowKeys[i]].validShaft = true;
          }

          if (typeof this.data.data.bowDesign.arrows[arrowKeys[i]].material != "undefined") {
            this.data.data.bowDesign.arrows[arrowKeys[i]].material.maxStrain         = this.data.data.bowDesign.arrows[arrowKeys[i]].material.tensileStPsi    / this.data.data.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi;
            this.data.data.bowDesign.arrows[arrowKeys[i]].material.bowCostPerLb      = Math.round(this.data.data.bowDesign.arrows[arrowKeys[i]].material.tensileStPsi   ** 2 / 100 / this.data.data.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi   / this.data.data.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn*100)/100;
            this.data.data.bowDesign.arrows[arrowKeys[i]].material.arrowCostPerLb    = Math.round(this.data.data.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi / this.data.data.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn*1.25/9000000*100)/100;

            let a = 1.25 * Math.exp(-0.0000000054 * this.data.data.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi / this.data.data.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn);
            this.data.data.bowDesign.arrows[arrowKeys[i]].minOuterDiameter = 2 * (this.data.data.bowDesign.drawWeight * this.data.data.bowDesign.arrows[arrowKeys[i]].length / this.data.data.bowDesign.arrows[arrowKeys[i]].material.elasticModulusPsi / a) ** (1/4)
            let shaftWeight = Math.PI/4 * ( this.data.data.bowDesign.arrows[arrowKeys[i]].outerDiameter ** 2 - this.data.data.bowDesign.arrows[arrowKeys[i]].innerDiameter ** 2 ) * this.data.data.bowDesign.arrows[arrowKeys[i]].length * this.data.data.bowDesign.arrows[arrowKeys[i]].material.densityLbsCuIn;
            this.data.data.bowDesign.arrows[arrowKeys[i]].weight = shaftWeight + this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.weight;

            let arrowCF = 1;
            if (this.data.data.bowDesign.arrows[arrowKeys[i]].quality == "fine") {
              accFactor += 1
              arrowCF = 3;
            }
            else if (this.data.data.bowDesign.arrows[arrowKeys[i]].quality == "cheap") {
              accFactor -= 1
              arrowCF = 0.7;
            }
            else {
              arrowCF = 1;
            }

            let shaftCost = (this.data.data.bowDesign.arrows[arrowKeys[i]].material.arrowCostPerLb * shaftWeight)

            if (this.data.data.bowDesign.arrows[arrowKeys[i]].material.tl > 4 && this.data.data.bowDesign.arrows[arrowKeys[i]].innerDiameter > 0) { // Material is synthetic and the arrow is hollow.
              shaftCost = shaftCost * (arrowCF + 4);
            }

            // Calculate arrohead cost
            let arrowHeadCost = 50 * this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.weight;
            // Apply AD CF
            if (this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.ad == "0.5") {
              arrowHeadCost = arrowHeadCost * 0.8;
            }
            else if (this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.ad == "2") {
              arrowHeadCost = arrowHeadCost * 4;
            }

            // Apply Damage type CF
            if (this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType == "cut") {
              arrowHeadCost = arrowHeadCost * 0.9;
            }
            else if (this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType == "pi") {
              arrowHeadCost = arrowHeadCost * 0.8;
            }
            else if (this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType == "cr") {
              arrowHeadCost = arrowHeadCost * 0.7;
            }

            this.data.data.bowDesign.arrows[arrowKeys[i]].cost = (arrowHeadCost * arrowCF) + shaftCost;

            let efficiency = 1 / (1 + workingMass/this.data.data.bowDesign.arrows[arrowKeys[i]].weight);
            let kineticEnergy = efficiency * potentialEnergy;

            if (this.data.data.bowDesign.realisticBowScale) {
              this.data.data.bowDesign.arrows[arrowKeys[i]].damagePoints = Math.sqrt(kineticEnergy) / 2.5;
            }
            else {
              this.data.data.bowDesign.arrows[arrowKeys[i]].damagePoints = Math.sqrt(kineticEnergy) / 1.75;
            }

            let dice = Math.floor(this.data.data.bowDesign.arrows[arrowKeys[i]].damagePoints / 3.5);
            let adds = Math.floor(this.data.data.bowDesign.arrows[arrowKeys[i]].damagePoints - (dice * 3.5));

            this.data.data.bowDesign.arrows[arrowKeys[i]].dice = dice + "d6 + " + adds;

            this.data.data.bowDesign.arrows[arrowKeys[i]].damagePoints = Math.round(this.data.data.bowDesign.arrows[arrowKeys[i]].damagePoints * 100) / 100;
            this.data.data.bowDesign.arrows[arrowKeys[i]].minOuterDiameter = Math.round(this.data.data.bowDesign.arrows[arrowKeys[i]].minOuterDiameter * 1000) / 1000;
            this.data.data.bowDesign.arrows[arrowKeys[i]].weight = Math.round(this.data.data.bowDesign.arrows[arrowKeys[i]].weight * 1000) / 1000;
            this.data.data.bowDesign.arrows[arrowKeys[i]].cost = Math.round(this.data.data.bowDesign.arrows[arrowKeys[i]].cost * 100) / 100;

            this.data.data.bowDesign.arrows[arrowKeys[i]].range = Math.floor(0.34 * kineticEnergy / this.data.data.bowDesign.arrows[arrowKeys[i]].weight);
            this.data.data.bowDesign.arrows[arrowKeys[i]].halfRange = Math.min(this.data.data.bowDesign.arrows[arrowKeys[i]].range, Math.floor(750 * this.data.data.bowDesign.arrows[arrowKeys[i]].weight/this.data.data.bowDesign.arrows[arrowKeys[i]].outerDiameter ** 2));

            let v = Math.sqrt(5.28 * kineticEnergy / this.data.data.bowDesign.arrows[arrowKeys[i]].weight)

            this.data.data.bowDesign.arrows[arrowKeys[i]].acc = Math.max(0, Math.min(4,  Math.round(3 * Math.log10(v) - this.data.data.bowDesign.bulk/2 - 7.5 + accFactor)));
          }
        }
      }
    }

    if (typeof this.data.data.bowDesign.workingMaterialAvg != "undefined" && typeof this.data.data.bowDesign.riserMaterialAvg != "undefined" && typeof this.data.data.bowDesign.stockMaterialAvg.bowCostPerLb != "undefined") {
      this.data.data.cost = limbsWeight * this.data.data.bowDesign.workingMaterialAvg.bowCostPerLb + riserWeight * this.data.data.bowDesign.riserMaterialAvg.bowCostPerLb + stockWeight * this.data.data.bowDesign.stockMaterialAvg.bowCostPerLb

      if (this.data.data.bowDesign.quality == "fine") {
        this.data.data.cost = this.data.data.cost * 4;
      }
      else if (this.data.data.bowDesign.quality == "cheap") {
        this.data.data.cost = this.data.data.cost * 0.7;
      }

      if (this.data.data.bowDesign.bowConstruction == "recurve") {
        this.data.data.cost = this.data.data.cost * 1.25;
      }
      else if (this.data.data.bowDesign.bowConstruction == "reflex") {
        this.data.data.cost = this.data.data.cost * 1.5;
      }
      else if (this.data.data.bowDesign.bowConstruction == "compound") {
        this.data.data.cost = this.data.data.cost * 2;
      }
    }
    else {
      this.data.data.cost = 0;
    }

    if (typeof this.data.data.bowDesign.arrows != "undefined") {
      this.addCustomBowProfiles()
    }

    // Only round things prior to display after all the actual math is done.
    this.data.data.bowDesign.maxDrawLength = Math.round(this.data.data.bowDesign.maxDrawLength * 100) / 100;
    this.data.data.bowDesign.deflection = Math.round(this.data.data.bowDesign.deflection * 1000) / 1000 * 100;
    this.data.data.bowDesign.stockThickness = Math.round(this.data.data.bowDesign.stockThickness * 100) / 100;
    this.data.data.bowDesign.riserThickness = Math.round(this.data.data.bowDesign.riserThickness * 100) / 100;
    this.data.data.weight = Math.round(this.data.data.weight * 100000) / 100000;
    this.data.data.ttlWeight = this.data.data.weight * this.data.data.quantity;
    this.data.data.cost = Math.round(this.data.data.cost * 100) / 100;
    this.data.data.ttlCost = this.data.data.cost * this.data.data.quantity;
  }

  addCustomBowProfiles() {
    // Calculate Arrow Stuff
    let arrowKeys = Object.keys(this.data.data.bowDesign.arrows); // Get the arrow keys
    if (arrowKeys.length > 0) { // If there are actually keys
      let rangedProfiles = [];
      for (let i = 0; i < arrowKeys.length; i++) {
        if (this.data.data.bowDesign.arrows[arrowKeys[i]].showProfile) {
          let profile = {
            "name": this.data.data.bowDesign.arrows[arrowKeys[i]].name,
            "skill": this.data.data.bowDesign.skill,
            "skillMod": this.data.data.bowDesign.skillMod,
            "acc": this.data.data.bowDesign.arrows[arrowKeys[i]].acc,
            "damageInput": this.data.data.bowDesign.arrows[arrowKeys[i]].dice,
            "damageType": this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType,
            "armourDivisor": this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.ad,
            "range": this.data.data.bowDesign.arrows[arrowKeys[i]].halfRange + "/" + this.data.data.bowDesign.arrows[arrowKeys[i]].range,
            "rof": "1",
            "shots": "1",
            "bulk": this.data.data.bowDesign.bulk,
            "rcl": "2",
            "st": this.data.data.bowDesign.st,
            "malf": 17
          }
          rangedProfiles.push(profile);
        }
      }

      this.data.data.ranged = rangedProfiles;
    }
  }

  addCustomFirearmProfiles() {
    // Calculate Ammo Stuff
    let ammoKeys = Object.keys(this.data.data.firearmDesign.ammunition); // Get the ammo keys
    if (ammoKeys.length > 0) { // If there are actually keys
      let rangedProfiles = [];
      for (let i = 0; i < ammoKeys.length; i++) {
        if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].showProfile) {

          let rof = ""
          if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles > 1 || this.data.data.firearmDesign.barrels > 1) {
            rof = this.data.data.firearmDesign.rof + "x" + (this.data.data.firearmDesign.ammunition[ammoKeys[i]].projectiles * this.data.data.firearmDesign.barrels);
          }
          else {
            rof = this.data.data.firearmDesign.rof;
          }

          let skillMod = this.data.data.firearmDesign.rangedSkillMod
          if (this.data.data.firearmDesign.fitToOwner) {
            skillMod += 1;
          }

          let profile = {
            "name": this.data.data.firearmDesign.ammunition[ammoKeys[i]].name,
            "skill": this.data.data.firearmDesign.rangedSkill,
            "skillMod": skillMod,
            "acc": this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc,
            "damageInput": this.data.data.firearmDesign.ammunition[ammoKeys[i]].damageDice,
            "damageType": this.data.data.firearmDesign.ammunition[ammoKeys[i]].woundModOut,
            "armourDivisor": this.data.data.firearmDesign.ammunition[ammoKeys[i]].ad,
            "range": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange),
            "rof": rof,
            "shots": this.data.data.firearmDesign.shots,
            "bulk": Math.round(this.data.data.firearmDesign.bulk),
            "rcl": this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl,
            "lc": this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc,
            "st": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].st),
            "malf": this.data.data.firearmDesign.ammunition[ammoKeys[i]].malf,
            "cps": this.data.data.firearmDesign.ammunition[ammoKeys[i]].cps,
            "wps": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].wps * 100) / 100
          }
          rangedProfiles.push(profile);

          if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosivePercent > 0) {
            let followUpExplosion = {
              "name": this.data.data.firearmDesign.ammunition[ammoKeys[i]].name + " - Explosion",
              "skill": this.data.data.firearmDesign.rangedSkill,
              "skillMod": skillMod,
              "acc": this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc,
              "damageInput": this.data.data.firearmDesign.ammunition[ammoKeys[i]].explosiveDamageDice,
              "damageType": "cr ex",
              "armourDivisor": 1,
              "range": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange),
              "rof": rof,
              "shots": this.data.data.firearmDesign.shots,
              "bulk": Math.round(this.data.data.firearmDesign.bulk),
              "rcl": this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl,
              "lc": this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc,
              "st": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].st),
              "malf": this.data.data.firearmDesign.ammunition[ammoKeys[i]].malf,
              "cps": Math.round((this.data.data.firearmDesign.ammunition[ammoKeys[i]].cps * this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF) * 100) / 100,
              "wps": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].wps * 100) / 100
            }
            rangedProfiles.push(followUpExplosion);
          }

          if (this.data.data.firearmDesign.ammunition[ammoKeys[i]].frag) {
            let followUpFrag = {
              "name": this.data.data.firearmDesign.ammunition[ammoKeys[i]].name + " - Fragments",
              "skill": this.data.data.firearmDesign.rangedSkill,
              "skillMod": skillMod,
              "acc": this.data.data.firearmDesign.ammunition[ammoKeys[i]].acc,
              "damageInput": this.data.data.firearmDesign.ammunition[ammoKeys[i]].fragDamageDice,
              "damageType": "cut",
              "armourDivisor": 1,
              "range": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].halfRange) + "/" + Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].maxRange),
              "rof": rof,
              "shots": this.data.data.firearmDesign.shots,
              "bulk": Math.round(this.data.data.firearmDesign.bulk),
              "rcl": this.data.data.firearmDesign.ammunition[ammoKeys[i]].rcl,
              "lc": this.data.data.firearmDesign.ammunition[ammoKeys[i]].lc,
              "st": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].st),
              "malf": this.data.data.firearmDesign.ammunition[ammoKeys[i]].malf,
              "cps": Math.round((this.data.data.firearmDesign.ammunition[ammoKeys[i]].cps * this.data.data.firearmDesign.ammunition[ammoKeys[i]].cpsCF) * 100) / 100,
              "wps": Math.round(this.data.data.firearmDesign.ammunition[ammoKeys[i]].wps * 100) / 100
            }
            rangedProfiles.push(followUpFrag);
          }
        }
      }

      this.data.data.ranged = rangedProfiles;
    }
  }

  prepareAttackData() {
    //Check to see if there is an actor yet
    if (this.actor){
      if (this.actor.data) {
        let damage;
        //Do logic stuff for melee profiles
        if (this.data.data.melee) {
          let meleeKeys = Object.keys(this.data.data.melee);
          if (meleeKeys.length) {//Check to see if there are any melee profiles
            for (let k = 0; k < meleeKeys.length; k++) {
              if (this.data.data.melee[meleeKeys[k]].name) {//Check to see if name is filled in. Otherwise don't bother.
                let level = 0;
                let mod = +this.data.data.melee[meleeKeys[k]].skillMod;
                let parry = 0;
                let block = 0;

                if (this.data.data.melee[meleeKeys[k]].skill.toLowerCase() == "dx") {
                  level = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
                } else {
                  //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.data.items._source.length; i++) {
                    if (this.actor.data.items._source[i].type === "Rollable") {
                      if (this.data.data.melee[meleeKeys[k]].skill === this.actor.data.items._source[i].name) {
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data);
                      }
                    }
                  }
                }

                level = level + mod;//Update the skill level with the skill modifier
                this.data.data.melee[meleeKeys[k]].level = level//Update skill level

                if (Number.isInteger(+this.data.data.melee[meleeKeys[k]].parryMod)) {//If parry mod is a number, compute normally
                  parry = Math.floor(+(level / 2 + 3) + +this.data.data.melee[meleeKeys[k]].parryMod);//Calculate the parry value
                  if (this.actor.data.data.enhanced.parry) {
                    parry += this.actor.data.data.enhanced.parry;
                  }
                  if (this.actor.data.data.flag.combatReflexes) {
                    parry += 1;
                  }
                } else {//If it's not a number, display the entry
                  parry = this.data.data.melee[meleeKeys[k]].parryMod;
                }
                this.data.data.melee[meleeKeys[k]].parry = parry//Update parry value

                if (Number.isInteger(+this.data.data.melee[meleeKeys[k]].blockMod)) {//If block mod is a number, compute normally
                  block = Math.floor(+(level / 2 + 3) + +this.data.data.melee[meleeKeys[k]].blockMod);//Calculate the block value
                  if (this.actor.data.data.enhanced.block) {
                    block += this.actor.data.data.enhanced.block;
                  }
                  if (this.actor.data.data.flag.combatReflexes) {
                    block += 1;
                  }
                } else {
                  block = this.data.data.melee[meleeKeys[k]].blockMod;
                }
                damage = this.damageParseSwThr(this.data.data.melee[meleeKeys[k]].damageInput);//Update damage value
                this.data.data.melee[meleeKeys[k]].block = block; // Update block value
                this.data.data.melee[meleeKeys[k]].type = "melee"; // Update attack type
                this.data.data.melee[meleeKeys[k]].damage = damage;

                // Validation for Armour Divisor
                if (!(this.data.data.melee[meleeKeys[k]].armourDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.melee[meleeKeys[k]].armourDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.melee[meleeKeys[k]].armourDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.melee[meleeKeys[k]].armourDivisor >= 0)
                ) {
                  this.data.data.melee[meleeKeys[k]].armourDivisor = 1;
                }
              }
            }
          }
        }

        //Do logic stuff for ranged profiles
        if (this.data.data.ranged) {
          let rangedKeys = Object.keys(this.data.data.ranged);
          if (rangedKeys.length) {//Check to see if there are any ranged profiles
            for (let k = 0; k < rangedKeys.length; k++) {
              if (this.data.data.ranged[rangedKeys[k]].name) {//Check to see if name is filled in
                let level = 0;
                let mod = +this.data.data.ranged[rangedKeys[k]].skillMod;

                if (this.data.data.ranged[rangedKeys[k]].skill.toLowerCase() == "dx") {
                  level = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
                } else {
                  //Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.data.items._source.length; i++) {
                    if (this.actor.data.items._source[i].type === "Rollable") {
                      if (this.data.data.ranged[rangedKeys[k]].skill === this.actor.data.items._source[i].name) {
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data);
                      }
                    }
                  }
                }
                level = level + mod;//Update the skill level with the skill modifier
                this.data.data.ranged[rangedKeys[k]].level = level;
                this.data.data.ranged[rangedKeys[k]].type = "ranged"; // Update attack type
                damage = this.damageParseSwThr(this.data.data.ranged[rangedKeys[k]].damageInput);
                this.data.data.ranged[rangedKeys[k]].damage = damage;

                if (typeof this.data.data.ranged[rangedKeys[k]].rcl == "undefined" || this.data.data.ranged[rangedKeys[k]].rcl <= 0) { // Catch invalid values for rcl. Value must exist and be at least one.
                  this.data.data.ranged[rangedKeys[k]].rcl = 1;
                }
                if (typeof this.data.data.ranged[rangedKeys[k]].rof == "undefined" || this.data.data.ranged[rangedKeys[k]].rof <= 0) { // Catch invalid values for rof. Value must exist and be at least one.
                  this.data.data.ranged[rangedKeys[k]].rof = 1;
                }
                if (typeof this.data.data.ranged[rangedKeys[k]].acc == "undefined" || this.data.data.ranged[rangedKeys[k]].acc < 0) { // Catch invalid values for Acc. Value must exist and be at least zero.
                  this.data.data.ranged[rangedKeys[k]].acc = 0;
                }

                // Validation for bulk
                if (typeof this.data.data.ranged[rangedKeys[k]].bulk == "undefined" || this.data.data.ranged[rangedKeys[k]].bulk == "") { // Must exist.
                  this.data.data.ranged[rangedKeys[k]].bulk = -2;
                } else if (this.data.data.ranged[rangedKeys[k]].bulk > 0) { // Must be less than zero. Set positive values to negative equivilent
                  this.data.data.ranged[rangedKeys[k]].bulk = -this.data.data.ranged[rangedKeys[k]].bulk;
                }

                // Validation for Armour Divisor
                if (!(this.data.data.ranged[rangedKeys[k]].armourDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.ranged[rangedKeys[k]].armourDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.ranged[rangedKeys[k]].armourDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.ranged[rangedKeys[k]].armourDivisor >= 0)
                ) {
                  this.data.data.ranged[rangedKeys[k]].armourDivisor = 1;
                }
              }
            }
          }
        }

        if (this.data.data.affliction) {
          let afflictionKeys = Object.keys(this.data.data.affliction);
          if (afflictionKeys.length) { // Check to see if there are any affliction profiles
            for (let k = 0; k < afflictionKeys.length; k++) {
              if (this.data.data.affliction[afflictionKeys[k]].name) { // Check to see if name is filled in. Otherwise don't bother.

                damage = this.damageParseSwThr(this.data.data.affliction[afflictionKeys[k]].damageInput); // Update damage value


                if (this.data.type == "Spell") {
                  this.data.data.affliction[afflictionKeys[k]].level = this.data.data.level;
                }
                else {
                  // Loop through all the skills on the sheet, find the one they picked and set that skill as the baseline for the equipment
                  for (let i = 0; i < this.actor.data.items._source.length; i++) {
                    if (this.actor.data.items._source[i].type === "Rollable") {
                      if (this.data.data.affliction[afflictionKeys[k]].skill === this.actor.data.items._source[i].name) {
                        this.data.data.affliction[afflictionKeys[k]].level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data) + +this.data.data.affliction[afflictionKeys[k]].skillMod;;
                      }
                    }
                  }
                }

                this.data.data.affliction[afflictionKeys[k]].type = "affliction"; // Update attack type
                this.data.data.affliction[afflictionKeys[k]].damage = damage;

                // Validation for Armour Divisor
                if (!(this.data.data.affliction[afflictionKeys[k]].armourDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.affliction[afflictionKeys[k]].armourDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.affliction[afflictionKeys[k]].armourDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.affliction[afflictionKeys[k]].armourDivisor >= 0)
                ) {
                  this.data.data.affliction[afflictionKeys[k]].armourDivisor = 1;
                }
              }
            }
          }
        }
      }
    }
  }

  damageParseSwThr(damage){
    let smDiscount = attributeHelpers.calcSMDiscount(this.actor.data.data.bio.sm)
    let st = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.strength, smDiscount)
    let sst = attributeHelpers.calcStrikingSt(st, this.actor.data.data.primaryAttributes.striking, smDiscount);
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
      let smDiscount = attributeHelpers.calcSMDiscount(this.actor.data.data.bio.sm)
      base = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.strength, smDiscount);
    }
    else if (baseAttr.toUpperCase() == 'DX' || baseAttr.toUpperCase() == 'DEXTERITY') {
      base = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.dexterity);
    }
    else if (baseAttr.toUpperCase() == 'IQ' || baseAttr.toUpperCase() == 'INTELLIGENCE') {
      base = attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence);
    }
    else if (baseAttr.toUpperCase() == 'HT' || baseAttr.toUpperCase() == 'HEALTH') {
      base = attributeHelpers.calcStOrHt(this.actor.data.data.primaryAttributes.health, 1);
    }
    else if (baseAttr.toUpperCase() == 'PER' || baseAttr.toUpperCase() == 'PERCEPTION') {
      base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence), this.actor.data.data.primaryAttributes.perception);
    }
    else if (baseAttr.toUpperCase() == 'WILL') {
      base = attributeHelpers.calcPerOrWill(attributeHelpers.calcDxOrIq(this.actor.data.data.primaryAttributes.intelligence), this.actor.data.data.primaryAttributes.will);
    }
    return base;
  }

  _prepareSpellData() {
    if (this.actor) {
      if (this.actor.data) {
        if (this.actor.data.data) {
          if (this.actor.data.data.magic) {

            // Calculate the total magical attribute
            let totalMagicAttribute = 0;
            let points = this.data.data.points;
            let mod = this.data.data.mod;
            let attributeMod = this.actor.data.data.magic.attributeMod;
            let difficulty = this.data.data.difficulty;
            let magery = this.actor.data.data.magic.magery;
            let attribute = this.actor.data.data.magic.attribute;

            let level = skillHelpers.computeSpellLevel(this.actor, points, mod, attributeMod, difficulty, magery, attribute)

            if (attribute != "") { // Attribute is not blank
              totalMagicAttribute += this.getBaseAttrValue(attribute)
            }

            totalMagicAttribute += attributeMod ? attributeMod : 0;
            totalMagicAttribute += magery ? magery : 0;
            this.data.data.magicalAbility = totalMagicAttribute;

            this.data.data.level = level;
          }
        }
      }
    }
  }

  _prepareRollableData() {
    if (this.data.data.category == ""){//The category will be blank upon initialization. Set it to skill so that the form's dynamic elements display correctly the first time it's opened.
      this.data.data.category = "skill";
    }

    if(this.data.data && this.actor){
      let level = skillHelpers.computeSkillLevel(this.actor, this.data.data);

      this.data.data.level = level;
    }
  }

  _prepareTraitData() {}

  showInfo(id) {
    let info = "";
    if (id == "laser-configuration") {
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
    else if (id == "beam-type") {
      info = "<table>" +
          "<tr>" +
          "<td style='width: 160px;'>Laser (TL9)</td>" +
          "<td><p>Shooty burny light at people. Works in all environments and has an armour divisor of (2)</p></td>" +
          "</tr>";

      if (this.data.data.tl >= 10){
        if (this.data.data.laserDesign.allowSuperScienceCustomLasers) {
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

      if (this.data.data.tl >= 11) {
        info += "<tr>" +
            "<td style='width: 160px;'>Rainbow Laser (TL 11)</td>" +
            "<td><p>Colourfull burny light. Works well in the air and under water, range is severly reduced in a vacum. Armour divisor of (3)</p></td>" +
            "</tr>";

        info += "<tr>" +
            "<td style='width: 160px;'>X-Ray Laser (TL 11)</td>" +
            "<td><p>A fuckin sick laser weapon, if not for the fact it's range in air is terrible. You can probably throw the gun farther than the beam will reach. But it's got AD (5) and its range is ludicrous in space.</p></td>" +
            "</tr>";

        if (this.data.data.laserDesign.allowSuperScienceCustomLasers) {
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
      if (this.data.data.tl >= 12) {
        info += "<tr>" +
            "<td style='width: 160px;'>Graser (TL 12)</td>" +
            "<td><p>Like the X-Ray laser, this is fuckin sick. AD (10) and in space the range is measured in tens of miles, even for pistols. But in air the range is extremely limited, though better than the X-Ray laser.</p></td>" +
            "</tr>";
      }
      info += "</table>"
    }
    else if (id == "laser-colour") {
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
    else if (id == "omni-blaster") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Omni-Blasters cost more but include a built-in electrolaser stun setting.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "focal-array") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>The size of the focal array determines the maximum range of the weapon, though it obviously makes the weapon heavier.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "laser-generator") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>These options determine how quickly the weapon can draw from its power source, allowing for higher or lower rates of fire. Higher rate of fire options cost and weigh more.</p>" +
          "</td>" +
          "</tr>";
      if (this.data.data.laserDesign.hotshotsAndOverheating) {
        info += "<tr>" +
            "<td><p>Gatling versions of the Light and Heavy generators prevent the laser from overheating due to continuous fire, but are incapable of firing hotshots.</p></td>" +
            "</tr>";
      }
      info += "</table>"
    }
    else if (id == "super-science-laser") {
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
    else if (id == "field-jacket") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Many laser weapons have penalties for operating in environments they're not designed for. This option removes all such penalties, causing the laser to act as if it were in the ideal environment, whatever that might be.</p>" +
          "<p>This makes X-Ray Lasers and Grasers very powerful and makes them serious contenders against superscience weapons.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "gravitic-focusing") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Generally meant for space combat, each level halves damage and multiplies range by 10.</p>" +
          "<p>Note: This does not bypass range limits. X-Ray lasers are still capped at 20 yards in atmosphere, for example.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "ftl-laser") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>For when light simply isn't fast enough. 1/2D range increases to equal Max range, and all range penalties are halved.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "laser-damage-dice") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Select the output damage of the laser. This can be any number you like, entered as any positive real number.</p>" +
          "<p>The number of shots per power cell decreases exponentially as damage increases so the primary limit here is how much ammo you want to carry around.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "laser-power-system") {
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
    else if (id == "super-science-power-cells") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Super science lasers don't actually require super science cells. And super science cells can fit in non-super science lasers. But they double the number of shots per cell so they're a good idea.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "non-rechargeable-power-cells") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Power cells are usually rechargeable, this option prevents recharging but doubles the number of shots per cell.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "laser-weight-tweak") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Used to tune the weight of the weapon. Lighter weapons are easier to fit into an encumbrance budget but tend to be more flimsy. HT does not change with weight, but HP does. Heavier weapons also tend to have higher Bulk, which can be desirable if you want to hit people with it.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "pulse-laser") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>When you absolutely, positively, must make someone explode, but they're just out of range to throw a grenade: Get a pulse laser</p>" +
          "<p>Armour Divisor drops 1 step, but damage changes from tight beam burning to a crushing explosion and range doubles. (Though any hard range limits still apply)</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "pulse-beam-laser") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>This option allows you to switch between pulse and beam modes allowing you to take advantage of the beam mode's higher armour divisor</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "melee-profile") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>This option adds a melee attack profile to the weapon that allows you to strike people with the weapon.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "cavalier-weapon") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>In the style of muzzle loading cavalry pistols, this weapon is designed specifically for striking and it does swing+1 crushing. Though you need a Ready maneuver to change into the correct grip (Or have Grip Mastery)</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "laser-ranged-skill") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Enter the skill used for this weapon's ranged attack profiles.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "laser-melee-skill") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>Enter the skill used for this weapon's melee attack profiles.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "user-st") {
      info = "<table>" +
          "<tr>" +
          "<td>" +
          "<p>If this weapon is on an actor it will automatically fetch the lifting ST level of that actor. Otherwise you can input a value here for testing, design, etc.</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "strong-bow-crossbow-finesse") {
      info = "<table>";
      if (this.data.data.bowDesign.fixedBonusStrongbow) {
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
          "<p>If this weapon is on an actor it will search the traits in an attempt to find one with a name exactly matching the one given here. " +
          "Once I add leveled perks and traits it'll check the level directly." +
          "But for now, if it finds one it will automatically set the value based on the number of points (one or two). " +
          "If it doesn't find anything you can always set the value yourself." +
          "</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "strong-bow-crossbow-finesse-effect") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>For bows not currently attached to an actor, this allows you to spoof the effect that the perk would have on the wielder." +
          "</p>" +
          "</td>" +
          "</tr>";
      info += "</table>"
    }
    else if (id == "draw-weight") {
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
          "<td>" + (this.data.data.bowDesign.userBL*2) + "lbs</td>" +
          "</tr>"

      if (this.data.data.bowDesign.type == "bow") {
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing.</td>" +
            "<td>2 secs</td>" +
            "<td>4 secs</td>" +
            "<td>3 secs</td>" +
            "<td>" + (this.data.data.bowDesign.userBL*2.5) + "lbs</td>" +
            "</tr>"
      }
      else if (this.data.data.bowDesign.type == "footbow" || this.data.data.bowDesign.type == "xbow") {
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing by hand in two rounds.</td>" +
            "<td>2 secs</td>" +
            "<td>4 secs</td>" +
            "<td>3 secs</td>" +
            "<td>" + (this.data.data.bowDesign.userBL*4) + "lbs</td>" +
            "</tr>"
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing by hand in three rounds.</td>" +
            "<td>3 secs</td>" +
            "<td>5 secs</td>" +
            "<td>4 secs</td>" +
            "<td>" + (this.data.data.bowDesign.userBL*6) + "lbs</td>" +
            "</tr>"
        info += "<tr class='bow-hand'>" +
            "<td>This is the highest weight you are capable of drawing by hand.</td>" +
            "<td>4 secs</td>" +
            "<td>6 secs</td>" +
            "<td>5 secs</td>" +
            "<td>" + (this.data.data.bowDesign.userBL*8) + "lbs</td>" +
            "</tr>"

        if (this.data.data.bowDesign.type == "xbow") {
          info += "<tr class='bow-hook'>" +
              "<td>This is the highest weight you are capable of drawing with a belt hook in a single round (Or by hand in two rounds)</td>" +
              "<td>1 secs</td>" +
              "<td>3 secs</td>" +
              "<td>2 secs</td>" +
              "<td>" + (this.data.data.bowDesign.userBL*4) + "lbs</td>" +
              "</tr>"
          info += "<tr class='bow-hook'>" +
              "<td>This is the highest weight you are capable of drawing with a belt hook in two rounds (Or by hand in four rounds)</td>" +
              "<td>2 secs</td>" +
              "<td>4 secs</td>" +
              "<td>3 secs</td>" +
              "<td>" + (this.data.data.bowDesign.userBL*8) + "lbs</td>" +
              "</tr>"

          if (this.data.data.tl >= 3) {
            info += "<tr class='bow-mech'>" +
                "<td rowspan='3'>Using a goat's foot lets you go over the normal draw limit, but using the device takes extra time, so it's really only useful if it lets you exceede what you could do by hand.</td>" +
                "<td>7 secs</td>" +
                "<td>9 secs</td>" +
                "<td>8 secs</td>" +
                "<td>" + (this.data.data.bowDesign.userBL*5*2) + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-mech'>" +
                "<td>8 secs</td>" +
                "<td>10 secs</td>" +
                "<td>9 secs</td>" +
                "<td>" + (this.data.data.bowDesign.userBL*6*2) + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-mech'>" +
                "<td>9 secs</td>" +
                "<td>11 secs</td>" +
                "<td>10 secs</td>" +
                "<td>" + (this.data.data.bowDesign.userBL*7*2) + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-mech'>" +
                "<td>This is the draw limit with a goat's foot.</td>" +
                "<td>10 secs</td>" +
                "<td>12 secs</td>" +
                "<td>11 secs</td>" +
                "<td>" + (this.data.data.bowDesign.userBL*8*2) + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-wind'>" +
                "<td>With a windlass you can draw a bow of pretty much any weight. It just takes a long fucking time. This is as fast as it gets, and it only gets slower.</td>" +
                "<td>8 secs</td>" +
                "<td>10 secs</td>" +
                "<td>9 secs</td>" +
                "<td>" + (this.data.data.bowDesign.userBL*8*2) + "lbs</td>" +
                "</tr>"
            info += "<tr class='bow-wind'>" +
                "<td>Windlasses also get heavier the higher the draw weight multiplier gets.</td>" +
                "<td>12 secs</td>" +
                "<td>14 secs</td>" +
                "<td>13 secs</td>" +
                "<td>" + (this.data.data.bowDesign.userBL*8*3) + "lbs</td>" +
                "</tr>"

            if (this.data.data.tl >= 4) {
              info += "<tr class='bow-cranq'>" +
                  "<td>Cranequins are half the weight, but are twice as slow.</td>" +
                  "<td>24 secs</td>" +
                  "<td>26 secs</td>" +
                  "<td>25 secs</td>" +
                  "<td>" + (this.data.data.bowDesign.userBL * 8 * 3) + "lbs</td>" +
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
    else if (id == "target-draw-length") {
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

      if (this.data.data.bowDesign.type == "bow") {
        info += "<tr>" +
            "<td>" +
            "<p>The basic formula for draw length is your height in inches, minus 15, and then divided by two.</p>. " +
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
      else if (this.data.data.bowDesign.type == "footbow") {
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
      else if (this.data.data.bowDesign.type == "xbow") {
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
    else if (id == "total-bow-length") {
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

      if (this.data.data.bowDesign.type == "bow") {
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
    else if (id == "working-bow-length") {
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
    else if (id == "working-material") {
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
    else if (id == "working-material-essential") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Rather than use a specific essential material, this checkbox makes whatever material you've selected essential, making it three times as strong." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"

    }
    else if (id == "bow-density") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Denser materials generally lead to heavier bows." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "bow-tensile-st") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Materials with higher tensile strength can (usually) store more energy. Which is to say, they can handle high draw weights." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "bow-elastic-modulus") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Materials with higher elastic modulus take more force to bend." +
          "</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "bow-max-strain") {
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
    else if (id == "bow-buckling-constant") {
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
    else if (id == "bow-cost-per-lb" || id == "bow-arrow-cost-per-lb") {
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
    else if (id == "bow-shape") {
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
    else if (id == "cross-section") {
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
    else if (id == "bow-type") {
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
    else if (id == "bow-loops") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The number of loops or pulleys on the bow. Most compound bows have 3, but 2 or 4 is also acceptable. " +
          "In theory, any number is acceptable, but more than 4 starts to get very complicated.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "limb-thickness") {
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
    else if (id == "riser-material") {
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
    else if (id == "riser-material-essential") {
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
    else if (id == "riser-width") {
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
    else if (id == "allowed-deflection") {
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
    else if (id == "riser-width") {
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
    else if (id == "riser-thickness") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is the resulting thickness based on the width and allowed deflection</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "stock-length") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is how long the stock is. It must be at least as long as the draw length. Beyond that, any value is allowed.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "bow-skill") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The skill used to fire the weapon.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "bow-quality") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Cheap bows are less expensive and less accurate, Fine bows are more expensive and more accurate.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "shaft-length") {
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
    else if (id == "shaft-material") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>You want a material with a low buckling constant that helps meet the weight you're trying to aim for.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "arrow-quality") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Fine arrows are required to get the accuracy bonus from a Fine bow.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "arrow-outer-diameter") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The second number is the minimum arrow thickness based on the force put on the arrow. Beyond that you can make the arrow as thick as you like.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "arrow-inner-diameter") {
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
    else if (id == "arrowhead") {
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

      if (this.data.data.tl >= 4) {
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

      if (this.data.data.tl >= 7) {
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
    else if (id == "shaft-material-essential") {
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
    else if (id == "arrowhead-damage-type") {
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
    else if (id == "arrowhead-ad") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Arrows with AD (0.5) are x0.8 cost, and AD (2) is x4</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "arrowhead-barbed") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Barbed arrows must be removed with a First Aid or Surgery roll or they do half damage coming out.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "arrowhead-weight") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Heavier arrowheads tend to do more damage at the expense of range.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "arrow-stats") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is the final cost and weight per individual arrow.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "damage-points") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Number of damage points is on the left. That number converted to dice is on the right.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "acc-range") {
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
    else if (id == "bow-show-profile") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>Check this box to show this as a profile on the combat tab and combat macro.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "arrow-name") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This name will be used in the display of the projectile on the combat tab and combat macro.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-location") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The primary location this armour applies to</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-sub-location") {
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
    else if (id == "armour-coverage") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The square footage of the hit location. Larger locations require more material to armour.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-voider") {
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
    else if (id == "armour-material") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>A dropdown allowing you to select from the materials available at your TL.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-material-essential") {
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
    else if (id == "armour-construction") {
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
    else if (id == "armour-selectedDR") {
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
    else if (id == "armour-body-type") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>The body type this armour is meant for. Though armour meant for a different body type might still fit. (Winged Humanoids and Humanoids can wear each other's helmets, for example)</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-layer") {
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
    else if (id == "armour-input-scaling") {
      info = "<table>";

      info += "<tr>" +
          "<td>" +
          "<p>This is really only for testing. Once this armour is placed onto an actor it will fetch the value directly from the actor.</p>" +
          "</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-tailor") {
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
    else if (id == "armour-style") {
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
    else if (id == "armour-holdout-reduction") {
      info = "<table>";

      info += "<tr>" +
          "<td colspan='2'>This does not grant a bonus to Holdout, it only removes any penalty inherent in the type and amount of armour. " +
          "For this reason it's less expensive than getting an actual bonus. Each one point reduction in the penalty raises the cost factor by 1.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-concealed") {
      info = "<table>";

      info += "<tr>" +
          "<td>This option is for armour concealed within a specific matching garment. Often this means the armour is built directly into the garment, but that's not necessarily required.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>It does however require that there be <i>something</i> to hide the armour in. You'll pick what that is along the way.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-clothing") {
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
    else if (id == "armour-clothing-status") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is the status level of the clothing you've selected. It determines how fancy your clothing is, and how expensive it is.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-undercover-clothing") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is the additional holdout bonus granted to the clothing you're hiding the armour within.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>Not only does it make your armour easier to hide, maybe even granting a bonus, it also applies to anything else you might want to hide within the clothing, such as weapons, etc.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-steel-hardening") {
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
    else if (id == "armour-fluting") {
      info = "<table>";

      info += "<tr>" +
          "<td>By adding flutes, ribs, and bosses in key areas you can reduce weight with no loss of strength.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>+4 CF and -10% to weight.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-silk") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth armour may optionally be made of silk.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +19, +1 DR vs cutting and impaling.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-paper") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth armour may optionally be made of paper. It's cheaper but more flamable.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF -0.25, Combustible.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-textile-reinforced") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth and Leather armour may be reinforced to better protect against cutting damage.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +0.25, +1 DR vs cutting, +25% weight.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-textile-reinforced") {
      info = "<table>";

      info += "<tr>" +
          "<td>Cloth armour may be reinforced to better protect against cutting damage.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +0.25, +1 DR vs cutting, +25% weight.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-mountain-scale") {
      info = "<table>";

      info += "<tr>" +
          "<td>Scale armour can be designed in such a way that the scales lock together under pressure. This increases DR vs crushing.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +1, +1 DR vs crushing.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-butted") {
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
    else if (id == "armour-banded") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is mail with reinforcing bands to help protect against crushing damage.</td>" +
          "</tr>";

      info += "<tr>" +
          "<td>CF +0.5, +2 DR vs crushing. +50% weight</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-sealed") {
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
    else if (id == "armour-hobnailed") {
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
    else if (id == "armour-punch") {
      info = "<table>";

      info += "<tr>" +
          "<td>Rigid hand armour with DR 1+ or flexible hand armour with DR 2+ increases kick damage from thr-1 to thr+0. Checking this option adds the increased damage as an attack profile to your sheet.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-punch-skill") {
      info = "<table>";

      info += "<tr>" +
          "<td>Enter the skill and skill mod here so the combat macro knows what to roll against when you punch someone.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-kick") {
      info = "<table>";

      info += "<tr>" +
          "<td>Rigid foot armour with DR 1+ or flexible foot armour with DR 2+ increases kick damage from thr to thr+1. Checking this option adds the increased damage as an attack profile to your sheet.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-kick-skill") {
      info = "<table>";

      info += "<tr>" +
          "<td>Enter the skill and skill mod here so the combat macro knows what to roll against when you kick someone.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-don-time") {
      info = "<table>";

      info += "<tr>" +
          "<td>The time in seconds to put on the armour.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-status-eq") {
      info = "<table>";

      info += "<tr>" +
          "<td>Even without decoration, expensive armour is often a sign of status. That's what this is displaying.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-can-pass-for") {
      info = "<table>";

      info += "<tr>" +
          "<td>The type of clothing this armour might be able to pass for. This is usually not going to work for rigid armour, however, no matter how thin.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "armour-holdout") {
      info = "<table>";

      info += "<tr>" +
          "<td>This is the worst holdout penalty among all the pieces in this set of armour.</td>" +
          "</tr>";

      info += "</table>"
    }
    else if (id == "firearm-configuration") {
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
    else if (id == "barrel-length") {
        info = "<table>";

        info += "<tr>" +
            "<td>Barrel length increases damage and weight, but doesn't actually have much impact on accuracy.</td>" +
            "</tr>";

        info += "</table>"
    }
    else if (id == "firearm-weight-tweak") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Used to tune the weight of the weapon. Lighter weapons are easier to fit into an encumbrance budget but tend to be more flimsy and have more Rcl. HT does not change with weight, but HP does. Heavier weapons also tend to have higher Bulk, which can be desirable if you want to hit people with it. They also have less Rcl. Can sometimes also impact Bulk.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id == "rifling") {
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
    else if (id == "firearm-action") {
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
    else if (id == "firearm-lock") {
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
    else if (id == "firearm-barrels") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Multiple barrels multiply your max RoF, ammo capacity, and increase weight and cost. Each extra barrel costs and weighs 80% as much as the base gun. This increase in weight can also reduce Rcl and increase Bulk.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id == "firearm-bolt") {
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
    else if (id == "projectile-calibre") {
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
    else if (id == "projectile-aspect") {
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
    else if (id == "projectile-mass") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Heavier rounds tend to do more damage and carry that damage better at longer ranges.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id == "projectile-density") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>This is the resulting density of the projectile, based on the values you've given. Along with a material that most closely matches the given density. This is mostly here so you know what your bullets are made of.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
      }
    else if (id == "chamber-bore") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>The chamber bore sets the width of the space your powder fits into. The case length sets the length. More powder means more damage and range. It also means more weight, as there needs to be more material to contain the explosion.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id == "case-length") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>The case length sets the length of the space your powder fits into. The chamber bore sets the width. More powder means more damage and range. It also means more weight, as there needs to be more material to contain the explosion.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id == "cartridge-type") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Burn length is some genuinely complicated shit, so this is an easy way to handle it. If you're making a pistol, pick pistol. If you're making a rifle, pick rifle. High velocity pistols like the FN57 might choose rifle instead. Custom should only be used if you <i>know</i> a different value for burn length is appropriate.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id == "burn-length") {
        info = "<table>" +
            "<tr>" +
            "<td>" +
            "<p>Burn length is some genuinely complicated shit, so you should usually just use the cartridge type dropdown to set this. The number here is just a ratio on the case length.</p>" +
            "</td>" +
            "</tr>";
        info += "</table>"
    }
    else if (id == "powder-type") {
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
    else if (id == "chamber-pressure") {
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
    else if (id == "magazine-style") {
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
    else if (id == "magazine-material") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Lighter materials are... lighter!</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id == "magazine-capacity") {
      info = "<table>" +
          "<tr>" +
          "<td><p>You can set this number as high as you like. But higher values mean more weight and worse Bulk.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "damage-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>The base damage of the weapon as designed, while using single solid shot.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "fit-to-owner") {
        info = "<table>" +
            "<tr>" +
            "<td><p>For +1 CF, your weapon was designed specifically for you. You get +1 to all skills while using it, exactly as with a Weapon Bond. Does not stack with Weapon Bond.</p></td>" +
            "</tr>" +
            "</table>"
    }
    else if (id == "acc-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>The base ACC before further modifiers. For shotshells, expect this to go down by 1.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "bulk-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Bulk is obviously a whole number. This is mostly showing the decimals so you've got an idea of how close or far you are to the next value.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "weight-output") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Output of various weight breakdowns.</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "rate-of-fire") {
        info = "<table>" +
            "<tr>" +
            "<td><p>This is the per-barrel RoF. The multiplier for the barrels is applied afterwards.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "st-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>ST is obviously a whole number. This is mostly showing the decimals so you've got an idea of how close or far you are to the next value.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "rcl-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Rcl is obviously a whole number. This is mostly showing the decimals so you've got an idea of how close or far you are to the next value. The minimum Rcl is 2, unless the weapon is a laser or shotgun.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "range-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Half damage and max range, along with velocity. Velocity is only really relevant for specific option rules at extreme range.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "firearm-accuracy") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Some higher quality options are only available if the weapon's base ACC is sufficient. See HT79, but improving the weapon from Good to Fine or Very Fine can be done after the fact.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "firearm-reliability") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Improving Malf beyond 17 results in a Malf of 17+, which requires two successive crit fails to malfunction. See HT79, but improving the weapon from Good to Fine or Very Fine can be done after the fact.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "shots-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Shots and time to reload.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "malf-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Rolling this number or higher means the weapon malfunctions. (It might still fire, which might still count as a hit). 17+ means that two successive malfunctions must be rolled for the gun to malfunction.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "cps-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Base cost per shot, before any modifiers for ammo</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "cost-output") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Base cost, Cost Factor from any modifications, and final cost</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "case-type") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Base cost, Cost Factor from any modifications, and final cost</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "plusp") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Multiply damage, range, and ST by 1.1, multiply CPS by 1.5</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>Cheap guns, or guns from TL 6 or less, have -1 Malf when firing +P ammo.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "match-grade") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Match Grade ammo needs a gun with base Acc 4 to be effective, and it grants a +1 bonus to Acc. Double cost per shot.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>Handloaded Match Grade ammo needs a gun with base Acc 2 to be effective, and it grants a +1 bonus to Acc. At Acc 4 and up it grants a +2 bonus. Triple cost per shot.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "subsonic") {
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
    else if (id == "silent") {
        info = "<table>" +
            "<tr>" +
            "<td><p>Makes the weapon silent. Use the 16 yard line on the hearing distance table on HT158.</p></td>" +
            "</tr>" +
            "<tr>" +
            "<td><p>Multiply CPS by 10</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "poison") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Makes the weapon silent. Use the 16 yard line on the hearing distance table on HT158.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td><p>Multiply CPS by 10</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "inc") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Adds the incendiary damage modifier, which just adds +1 burning damage.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td><p>Multiply CPS by 1.5</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "tracer") {
      info = "<table>" +
          "<tr>" +
          "<td><p>Adds the incendiary damage modifier, which just adds +1 burning damage. Also gives +1 to skill on subsequent turns following automatic fire.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td><p>Multiply CPS by 1.5</p></td>" +
          "</tr>" +
          "</table>"
    }
    else if (id == "firearm-projectile-type") {
        info = "<table>" +
            "<tr>" +
            "<td><p>See high tech 165.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "number-of-shots") {
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
    else if (id == "explosive-filler") {
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
    else if (id == "wps") {
        info = "<table>" +
            "<tr>" +
            "<td><p>The weight of one round. A single full load is factored into the weight of the weapon, additional rounds will need to be added separately.</p></td>" +
            "</tr>" +
            "</table>"
      }
    else if (id == "cps") {
        info = "<table>" +
            "<tr>" +
            "<td><p>The cost of one round. This is not added to the cost of the weapon.</p></td>" +
            "</tr>" +
            "</table>"
      }
    this.data.data.info = info;

    this.update({ 'data.info': this.data.data.info });
  }
}
