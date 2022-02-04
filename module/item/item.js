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

    console.log(this.data.data);
    console.log(this.data.data.customType);

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
        this.prepareCustomBox();
        break;
      case "xbow":
        this.prepareCustomXBow();
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
    console.log("Preparing Laser");
    console.log(this.data.data.laserDesign)

    if (this.data.data.tl >= 9) { // TL must be at least 9 to be able to design a custom laser
      if (typeof this.data.data.laserDesign == "undefined") { // If the laserDesign block hasn't yet been created
        this.data.data.laserDesign = { // Create it
          "configuration": "", // Beamer/Pistol/Rifle/Cannon
          "beamType": "laser", // Laser/Force Beam/Etc
          "focalArray": 1, // Numbers map to Tiny, Very Small, etc, through to Extremely Large. Valid entires are 0.1 to 4
          "focalArraySize": "Medium", // Numbers map to Tiny, Very Small, etc, through to Extremely Large. Valid entires are 0.1 to 4
          "generator": "semi", // single/semi/light/heavy/lightGat/heavyGat.
          "hotshotsAndOverheating": game.settings.get("gurps4e", "hotshotsAndOverheating"),
          "allowSuperScienceCustomLasers": game.settings.get("gurps4e", "allowSuperScienceCustomLasers"),
          "superScience": false, // Makes use of allowSuperScienceCustomLasers to turn regular science lasers into super science lasers
          "damageDice": 2.0, //
          "emptyWeight": 0.0,
          "outputDamage": "",
          "outputAcc": 3,
          "outputRange": "",
          "outputWeight": "",
          "outputRoF": 0,
          "outputShots": "",
          "outputST": 0,
          "outputBulk": 0,
          "outputRcl": 0,
          "armourDivisor": 1,
          "damageType": "burn",
          "halfRange": 0,
          "maxRange": 0,
          "superScienceCells": false,
          "nonRechargeableCells": false,
          "powerCellQty": 1,
          "powerCell": "C",
          "powerCellWeight": 0,
          "shots": 0,
        }
      }

      // Input Validation
      if (typeof this.data.data.laserDesign.powerCellQty == "undefined" || this.data.data.laserDesign.powerCellQty <= 0 || this.data.data.laserDesign.powerCellQty == "") { // If the cell quantity is blank or negative
        this.data.data.laserDesign.powerCellQty = 1; // Set to 1
      }
      if (typeof this.data.data.laserDesign.damageDice == "undefined" || this.data.data.laserDesign.damageDice <= 0 || this.data.data.laserDesign.damageDice == "") { // If the damage dice is blank or negative
        this.data.data.laserDesign.damageDice = 1; // Set to 1
      }


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
      let baseShots = 0;
      if (this.data.data.laserDesign.beamType == "laser") {
        this.data.data.laserDesign.armourDivisor = 2;
        this.data.data.laserDesign.damageType = "burn";

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

        rb = 40
        e = 3
      }
      else if (this.data.data.laserDesign.beamType == "forceBeam") {
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
        this.data.data.laserDesign.armourDivisor = 5;
        this.data.data.laserDesign.damageType = "burn sur";

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
        this.data.data.laserDesign.armourDivisor = 1;
        this.data.data.laserDesign.damageType = "burn rad sur";

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
        this.data.data.laserDesign.armourDivisor = 3;
        this.data.data.laserDesign.damageType = "burn";

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
        this.data.data.laserDesign.armourDivisor = 5;
        this.data.data.laserDesign.damageType = "burn";

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
        this.data.data.laserDesign.armourDivisor = 10;
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
      if (this.data.data.laserDesign.generator == "single") {
        g = 1;
        this.data.data.laserDesign.outputRoF = 1;
      }
      if (this.data.data.laserDesign.generator == "semi") {
        g = 1.25;
        this.data.data.laserDesign.outputRoF = 3;
      }
      if (this.data.data.laserDesign.generator == "light") {
        g = 1.25;
        this.data.data.laserDesign.outputRoF = 10;
      }
      else if (this.data.data.laserDesign.generator == "heavy") {
        g = 2;
        this.data.data.laserDesign.outputRoF = 20;
      }
      else if (this.data.data.laserDesign.generator == "lightGat") {
        g = 2;
        this.data.data.laserDesign.outputRoF = 10;
      }
      else if (this.data.data.laserDesign.generator == "heavyGat") {
        g = 2;
        this.data.data.laserDesign.outputRoF = 20;
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

      // Calculate the damage
      let displayAdds = "";
      if (adds > 0) { // Adds is more than zero
        displayAdds = "+" + adds;
      }
      else if (adds < 0) { // Adds is less than zero
        displayAdds = "-" + Math.abs(adds);
      }
      this.data.data.laserDesign.outputDamage = dice + "d6" + displayAdds + " (" + this.data.data.laserDesign.armourDivisor + ") " + this.data.data.laserDesign.damageType;

      // Determine RF for the purposes of range calculation
      let rf = this.data.data.laserDesign.focalArray;
      if (rf > 1 && rf <= 1.75) {
        rf = rf * 1.33;
      }
      else if (rf >= 1.75) {
        rf = rf * 2;
      }

      // Calculate the ranges
      this.data.data.laserDesign.halfRange = this.data.data.laserDesign.damageDice * this.data.data.laserDesign.damageDice * rb * rf;
      this.data.data.laserDesign.halfRange = Math.round(this.data.data.laserDesign.halfRange / 10) * 10; // Round range to the nearest 10;
      this.data.data.laserDesign.maxRange = this.data.data.laserDesign.halfRange * 3;
      this.data.data.laserDesign.outputRange = this.data.data.laserDesign.halfRange + " / " + this.data.data.laserDesign.maxRange;

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

      this.data.data.laserDesign.shots = Math.floor(+baseShots / this.data.data.laserDesign.damageDice ** 3);

      this.data.data.laserDesign.outputShots = this.data.data.laserDesign.shots + " (" + reloadTime + ")";

      // Calculate empty weight
      this.data.data.laserDesign.emptyWeight = (+this.data.data.laserDesign.damageDice * s / e)**3 * f * g;

      // Calculate the output weight
      this.data.data.laserDesign.outputWeight = ((Math.round(this.data.data.laserDesign.emptyWeight * 100) / 100) + (this.data.data.laserDesign.powerCellQty * this.data.data.laserDesign.powerCellWeight)) + "/" + this.data.data.laserDesign.powerCellQty + this.data.data.laserDesign.powerCell; // Round empty weight on display
    }
    console.log(this.data.data.laserDesign)
  }

  prepareCustomBox() {
    console.log("Preparing Bow");
  }

  prepareCustomXBow() {
    console.log("Preparing X Bow");
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
}
