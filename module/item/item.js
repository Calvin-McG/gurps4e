import { attributeHelpers } from '../../helpers/attributeHelpers.js';
import { skillHelpers } from '../../helpers/skillHelpers.js';

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
    if (typeof this.data.data.tl === undefined || typeof this.data.data.tl == null) { // Undefined set to 0
      this.data.data.tl = 0;
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
    console.log("Preparing " + type);

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
        "drawWeight": 0, // In lbs
        "totalBowLength": 0, // In inches
        "workingPercentage": 0,
        "targetDrawLength": 0,
        "workingMaterialOne": "",
        "workingMaterialTwo": "",
        "bowConstruction": "", // Straight/Recurve/Reflex/Compound/Reflex Recurve
        "bowShape": "", // Round/Rectangular or D-Section
        "n": 0, // Width:Thickness ratio
        "quality": "", // Cheap/Good/Fine(Accurate)
        "thickness": 0,
        "riserMaterialOne": "", // Also used for crossbow stocks
        "riserMaterialTwo": "", // Also used for crossbow stocks
        "allowedRiserDeflection": 0,
        "selectedRiserWidth": 0,
        "xbowSupportLength": 0,
      }
    }

    if (typeof this.data.data.bowDesign.arrows == "undefined") { // If the arrows block hasn't yet been created
      this.data.data.bowDesign.arrows = []
    }

    this.data.data.bowDesign.magicalMaterials = game.settings.get("gurps4e", "allowMagicalMaterialsForCustom");
    this.data.data.bowDesign.compoundBowStrictTL = game.settings.get("gurps4e", "compoundBowStrictTL");

    this.data.data.bowDesign.type = type;

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
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data.category,
                            this.actor.data.items._source[i].data.defaults, this.actor.data.items._source[i].data.difficulty,
                            this.actor.data.items._source[i].data.baseAttr, this.actor.data.items._source[i].data.baseSkill,
                            this.actor.data.items._source[i].data.minLevel, this.actor.data.items._source[i].data.maxLevel,
                            this.actor.data.items._source[i].data.dabblerPoints, this.actor.data.items._source[i].data.points,
                            this.actor.data.items._source[i].data.mod);
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
                        level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data.category,
                            this.actor.data.items._source[i].data.defaults, this.actor.data.items._source[i].data.difficulty,
                            this.actor.data.items._source[i].data.baseAttr, this.actor.data.items._source[i].data.baseSkill,
                            this.actor.data.items._source[i].data.minLevel, this.actor.data.items._source[i].data.maxLevel,
                            this.actor.data.items._source[i].data.dabblerPoints, this.actor.data.items._source[i].data.points,
                            this.actor.data.items._source[i].data.mod);
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
                        this.data.data.affliction[afflictionKeys[k]].level = +skillHelpers.computeSkillLevel(this.actor, this.actor.data.items._source[i].data.category,
                            this.actor.data.items._source[i].data.defaults, this.actor.data.items._source[i].data.difficulty,
                            this.actor.data.items._source[i].data.baseAttr, this.actor.data.items._source[i].data.baseSkill,
                            this.actor.data.items._source[i].data.minLevel, this.actor.data.items._source[i].data.maxLevel,
                            this.actor.data.items._source[i].data.dabblerPoints, this.actor.data.items._source[i].data.points,
                            this.actor.data.items._source[i].data.mod) + +this.data.data.affliction[afflictionKeys[k]].skillMod;;
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

    console.log(damage);
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
      let level = skillHelpers.computeSkillLevel(this.actor, this.data.data.category, this.data.data.defaults, this.data.data.difficulty,
          this.data.data.baseAttr, this.data.data.baseSkill, this.data.data.minLevel, this.data.data.maxLevel,
          this.data.data.dabblerPoints, this.data.data.points, this.data.data.mod)

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

    this.data.data.laserDesign.info = info;

    this.update({ 'data.laserDesign.info': this.data.data.laserDesign.info });
  }
}
