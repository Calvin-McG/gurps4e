import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { skillHelpers } from '../../helpers/skillHelpers.js';
import {materialHelpers} from "../../helpers/materialHelpers.js";

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
    // Get the Item's data
    let itemData = this.data;
    let data = itemData.data; // this.data.data

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
      default: // not a supported type
        return ui.notifications.error("This type of item is not supported in the system!");
    }
    this.prepareAttackData()
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
    this.data.data.weight = Math.round(+this.data.data.weight * 100) / 100;
    this.data.data.quantity = Math.round(+this.data.data.quantity);

    // Calculated total weight and cost
    this.data.data.ttlCost = Math.round((+this.data.data.cost * +this.data.data.quantity) * 100) / 100;
    this.data.data.ttlWeight = Math.round((+this.data.data.weight * +this.data.data.quantity) * 100) / 100;

    // Constrain TL to valid values
    if (typeof this.data.data.tl === undefined || this.data.data.tl == null || this.data.data.tl == "") { // If it's undefined, blank, or null, set to default.
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

  _prepareCustomWeaponData() {
    this.validateEquipmentBasics();

    if (typeof this.data.data.customType == "undefined" || this.data.data.customType == null || this.data.data.customType == "") {
      this.data.data.customType = "bow"
    }

    switch (this.data.data.customType) {
      case "muzzleLoader":
        this.prepareCustomMuzzleLoader();
        break;
      case "cartridgeLoader":
        this.prepareCustomCartridgeLoader();
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

  prepareCustomMuzzleLoader() {
    console.log("Preparing Muzzle Loader");
  }

  prepareCustomCartridgeLoader() {
    console.log("Preparing Cartridge Loader");
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
      this.addLaserMeleeProfile() // Include one
    }

    let rangedProfiles = [];
    // For each ranged profile, check if the box is checked and add the ranged profile accordingly.
    if (this.data.data.laserDesign.showAir) {
      let showAir = {
        "name": this.data.name + " - Air",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAcc,
        "damageInput": this.data.data.laserDesign.outputDamage,
        "damageType": this.data.data.laserDesign.damageType,
        "armorDivisor": this.data.data.laserDesign.armourDivisor,
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
        "name": this.data.name + " - Space",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccSpace,
        "damageInput": this.data.data.laserDesign.outputDamage,
        "damageType": this.data.data.laserDesign.damageType,
        "armorDivisor": this.data.data.laserDesign.armourDivisorSpace,
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
        "name": this.data.name + " - Water",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccWater,
        "damageInput": this.data.data.laserDesign.outputDamage,
        "damageType": this.data.data.laserDesign.damageType,
        "armorDivisor": this.data.data.laserDesign.armourDivisorWater,
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
        "name": this.data.name + " - Hotshot Air",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAcc,
        "damageInput": this.data.data.laserDesign.outputDamageHotshots,
        "damageType": this.data.data.laserDesign.damageType,
        "armorDivisor": this.data.data.laserDesign.armourDivisor,
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
        "name": this.data.name + " - Space Hotshot",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccSpace,
        "damageInput": this.data.data.laserDesign.outputDamageHotshots,
        "damageType": this.data.data.laserDesign.damageType,
        "armorDivisor": this.data.data.laserDesign.armourDivisorSpace,
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
        "name": this.data.name + " - Water Hotshot",
        "skill": this.data.data.laserDesign.rangedSkill,
        "skillMod": this.data.data.laserDesign.rangedSkillMod,
        "acc": this.data.data.laserDesign.outputAccWater,
        "damageInput": this.data.data.laserDesign.outputDamageHotshots,
        "damageType": this.data.data.laserDesign.damageType,
        "armorDivisor": this.data.data.laserDesign.armourDivisorWater,
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

  addLaserMeleeProfile() {
    let damageMod = Math.abs(this.data.data.laserDesign.outputBulk)-1;
    let damage = "";

    if (this.data.data.laserDesign.cavalierWeapon) {
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
      "name": (this.data.data.laserDesign.configuration == "pistol" || this.data.data.laserDesign.configuration == "beamer") ? "Pistol Whip" : "Butt Stroke",
      "skill": this.data.data.laserDesign.meleeSkill,
      "skillMod": this.data.data.laserDesign.meleeSkillMod,
      "parry": 0,
      "parryMod": "",
      "blockMod": "No",
      "damageInput": damage,
      "damageType": "cr",
      "armorDivisor": 1,
      "reach": "C",
      "st": this.data.data.laserDesign.outputST,
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
      this.data.data.bowDesign.workingMaterialOne = game.materialAPI.essentializeMaterial(this.data.data.bowDesign.workingMaterialOne);
    }

    if (this.data.data.bowDesign.workingMaterialTwoEssential) {
      this.data.data.bowDesign.workingMaterialTwo = game.materialAPI.essentializeMaterial(this.data.data.bowDesign.workingMaterialTwo);
    }

    if (this.data.data.bowDesign.riserMaterialOneEssential) {
      this.data.data.bowDesign.riserMaterialOne = game.materialAPI.essentializeMaterial(this.data.data.bowDesign.riserMaterialOne);
    }

    if (this.data.data.bowDesign.riserMaterialTwoEssential) {
      this.data.data.bowDesign.riserMaterialTwo = game.materialAPI.essentializeMaterial(this.data.data.bowDesign.riserMaterialTwo);
    }

    if (this.data.data.bowDesign.stockMaterialOneEssential) {
      this.data.data.bowDesign.stockMaterialOne = game.materialAPI.essentializeMaterial(this.data.data.bowDesign.stockMaterialOne);
    }

    if (this.data.data.bowDesign.stockMaterialTwoEssential) {
      this.data.data.bowDesign.stockMaterialTwo = game.materialAPI.essentializeMaterial(this.data.data.bowDesign.stockMaterialTwo);
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
    let arrowKeys = Object.keys(this.data.data.bowDesign.arrows); // Get the arrow keys
    if (arrowKeys.length > 0) { // If there are actually keys
      for (let i = 0; i < arrowKeys.length; i++){
        if (typeof this.data.data.bowDesign.arrows[arrowKeys[i]].material.name != "undefined") {
          this.data.data.bowDesign.arrows[arrowKeys[i]].material = game.materialAPI.getBowMaterialByName(this.data.data.bowDesign.arrows[arrowKeys[i]].material.name);

          if (this.data.data.bowDesign.arrows[arrowKeys[i]].materialEssential) {
            this.data.data.bowDesign.arrows[arrowKeys[i]].material = game.materialAPI.essentializeMaterial(this.data.data.bowDesign.arrows[arrowKeys[i]].material);
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

    this.addCustomBowProfiles()

    // Only round things prior to display after all the actual math is done.
    this.data.data.bowDesign.maxDrawLength = Math.round(this.data.data.bowDesign.maxDrawLength * 100) / 100;
    this.data.data.bowDesign.deflection = Math.round(this.data.data.bowDesign.deflection * 1000) / 1000 * 100;
    this.data.data.bowDesign.stockThickness = Math.round(this.data.data.bowDesign.stockThickness * 100) / 100;
    this.data.data.bowDesign.riserThickness = Math.round(this.data.data.bowDesign.riserThickness * 100) / 100;
    this.data.data.weight = Math.round(this.data.data.weight * 100) / 100;
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
            "name": this.data.name + " " + this.data.data.bowDesign.arrows[arrowKeys[i]].name,
            "skill": this.data.data.bowDesign.skill,
            "skillMod": this.data.data.bowDesign.skillMod,
            "acc": this.data.data.bowDesign.arrows[arrowKeys[i]].acc,
            "damageInput": this.data.data.bowDesign.arrows[arrowKeys[i]].dice,
            "damageType": this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.damageType,
            "armorDivisor": this.data.data.bowDesign.arrows[arrowKeys[i]].arrowhead.ad,
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
                if (!(this.data.data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.melee[meleeKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.melee[meleeKeys[k]].armorDivisor >= 0)
                ) {
                  this.data.data.melee[meleeKeys[k]].armorDivisor = 1;
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
                if (!(this.data.data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.ranged[rangedKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.ranged[rangedKeys[k]].armorDivisor >= 0)
                ) {
                  this.data.data.ranged[rangedKeys[k]].armorDivisor = 1;
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
                if (!(this.data.data.affliction[afflictionKeys[k]].armorDivisor.toString().toLowerCase().includes("ignore") || // Must either ignore armour or be a positive number
                    this.data.data.affliction[afflictionKeys[k]].armorDivisor.toString().toLowerCase().includes("cosmic") ||
                    this.data.data.affliction[afflictionKeys[k]].armorDivisor.toString().toLowerCase().includes("i") ||
                    this.data.data.affliction[afflictionKeys[k]].armorDivisor >= 0)
                ) {
                  this.data.data.affliction[afflictionKeys[k]].armorDivisor = 1;
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
          "<td style='width: 50px;'>Pistol</td>" +
          "<td><p>It's a pistol. Acc is lower, Bulk is lower, and ST is higher compared to a rifle of equal weight.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td style='width: 50px;'>Beamer</td>" +
          "<td><p>Like a TNG phaser. It's the bare minimum laser weapon. Acc is as low as it gets for a laser, but so is Bulk. ST is the same for an equivalent pistol.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td style='width: 50px;'>Rifle</td>" +
          "<td><p>It's a rifle. Acc is higher, but so is Bulk. ST is lower compared to a pistol or beamer of equivalent weight but the weapon requires two hands.</p></td>" +
          "</tr>" +
          "<tr>" +
          "<td style='width: 50px;'>Cannon</td>" +
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
          "<p>Used to tune the weight of the weapon. Lighter weapons are easier to fit into an encumberence budget but tend to be more flimsy. HT does not change with weight, but HP does. Heavier weapons also tend to have higher Bulk, which can be desireable if you want to hit people with it.</p>" +
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
          "<p>In the style of muzzle loading cavalry pistols, this weapon is designed specifically for striking and it does swing+1 crushing.</p>" +
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
          "<p>Check this box to show this projectile as a profile on the combat tab and combat macro.</p>" +
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
    this.data.data.info = info;

    this.update({ 'data.info': this.data.data.info });
  }
}
