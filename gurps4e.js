// Import Modules
import { gurpsActor } from "./module/actor/actor.js";
import { gurpsActorSheet } from "./module/actor/actor-sheet.js";
import { gurpsItem } from "./module/item/item.js";
import { gurpsItemSheet } from "./module/item/item-sheet-orig.js";
import { attackHelpers } from "./helpers/attackHelpers.js";
import {
  DAMAGETYPES,
  TRAITTYPES,
  ROLLABLETYPES,
  ROLLABLEDIFFICULTY,
  BASEATTR,
  DEFENCETYPE,
  TECHNIQUEDIFFICULTY,
  DABBLEROPTIONS,
  EQUIPSTATUS,
  RELIEFTYPE,
  INLAYTYPE,
  GILDINGTYPE,
  BEADINGTYPE,
  DYETYPE,
  EMBROIDERYTYPE,
  FRINGETYPE,
  TAPESTRYWEAVETYPE,
  TAPESTRYDYETYPE,
  FIGUREATIVEPAINTINGTYPE,
  ENAMELTYPE,
  ETCHINGTYPE,
  SPELLCLASS,
  DEFENCEQTY,
  RANGETYPES,
  RESISTANCETYPES,
  RESISTANCEATTR,
  BODYTYPES,
  VEHICLECRAFTTYPES,
  BASEQUALITYTYPES,
  BOWSHAPES,
  ARROWDAMAGETYPES,
  ARROWARMOURDIVISOR, POWERCELLS
} from "./module/helpers/config.mjs";

Hooks.once('init', async function() {

  // Begin section for dropdown definitions
  CONFIG.DAMAGETYPES = DAMAGETYPES;
  CONFIG.TRAITTYPES = TRAITTYPES;
  CONFIG.ROLLABLETYPES = ROLLABLETYPES;
  CONFIG.ROLLABLEDIFFICULTY = ROLLABLEDIFFICULTY;
  CONFIG.TECHNIQUEDIFFICULTY = TECHNIQUEDIFFICULTY;
  CONFIG.BASEATTR = BASEATTR;
  CONFIG.DEFENCETYPE = DEFENCETYPE;
  CONFIG.DABBLEROPTIONS = DABBLEROPTIONS;
  CONFIG.EQUIPSTATUS = EQUIPSTATUS;
  CONFIG.RELIEFTYPE = RELIEFTYPE;
  CONFIG.INLAYTYPE = INLAYTYPE;
  CONFIG.GILDINGTYPE = GILDINGTYPE;
  CONFIG.BEADINGTYPE = BEADINGTYPE;
  CONFIG.DYETYPE = DYETYPE;
  CONFIG.EMBROIDERYTYPE = EMBROIDERYTYPE;
  CONFIG.FRINGETYPE = FRINGETYPE;
  CONFIG.TAPESTRYWEAVETYPE = TAPESTRYWEAVETYPE;
  CONFIG.TAPESTRYDYETYPE = TAPESTRYDYETYPE;
  CONFIG.FIGUREATIVEPAINTINGTYPE = FIGUREATIVEPAINTINGTYPE;
  CONFIG.ENAMELTYPE = ENAMELTYPE;
  CONFIG.ETCHINGTYPE = ETCHINGTYPE;
  CONFIG.SPELLCLASS = SPELLCLASS;
  CONFIG.DEFENCEQTY = DEFENCEQTY;
  CONFIG.RANGETYPES = RANGETYPES;
  CONFIG.RESISTANCETYPES = RESISTANCETYPES;
  CONFIG.RESISTANCEATTR = RESISTANCEATTR;
  CONFIG.BODYTYPES = BODYTYPES;
  CONFIG.VEHICLECRAFTTYPES = VEHICLECRAFTTYPES;
  CONFIG.BASEQUALITYTYPES = BASEQUALITYTYPES;
  CONFIG.BOWSHAPES = BOWSHAPES;
  CONFIG.ARROWDAMAGETYPES = ARROWDAMAGETYPES;
  CONFIG.ARROWARMOURDIVISOR = ARROWARMOURDIVISOR;
  CONFIG.POWERCELLS = POWERCELLS;

  // Begin section of stuff I don't totally remember the reasons for
  game.gurps4e = {
    gurpsActor,
    gurpsItem
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = gurpsActor;
  CONFIG.Item.documentClass = gurpsItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("gurps4e", gurpsActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("gurps4e", gurpsItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('capitalizeFirst', function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  });

  Handlebars.registerHelper('isInt', function (value) {
    return Number.isInteger(value);
  });

  // This helper takes in the 1/2D and max range of an attack and formats them sensibly.
  Handlebars.registerHelper('formatRange', function (halfRange, maxRange) {
    return attackHelpers.formatRange(halfRange, maxRange);
  });

  // This helper takes in the base acc and scope acc of a weapon and displays them in the standard GURPS format.
  Handlebars.registerHelper('showFullAcc', function (acc, scopeAcc) {
    let returnString = acc;

    if (typeof scopeAcc !== "undefined") { // Scope Acc exists
      if (scopeAcc > 0) { // Scope Acc is greater than zero
        returnString += "+" + scopeAcc;
      }
    }

    return returnString;
  });

  // This helper handles the logic to display or not display a given attack profile in the combat tab
  Handlebars.registerHelper('showAttackInCombatTab', function (item, options) {
    let show = true;
    if (item.type.toLowerCase() === "ritual" && item.system.quantity === 0) { // If it's a ritual, but quantity is zero, don't show.
      show = false;
    }
    else if (typeof item.system.equipStatus !== "undefined" && item.system.equipStatus !== "equipped") { // If it's something that can be equipped, but it's not, don't show
      show = false;
    }
    return (show) ? options.fn(this) : options.inverse(this);
  });

  // This helper introduces conditional operators. It is used like this:
  // {{#ifCond  system.tl '>=' 9 }}
  //  <div class="header">
  //   <a class="item" system-tab="melee">Design Laser</a>
  //  </div>
  // {{/ifCond}}
  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
        return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  Handlebars.registerHelper('validVehicle', function (tlItem, tlRange, selectedMethod, vehicle, options) {
    let tlPlus = game.settings.get("gurps4e", "allowTLPlusVehicles");
    let superScience = game.settings.get("gurps4e", "allowSuperScienceVehicles");
      if (((selectedMethod === "ground" && vehicle.ground) || (selectedMethod === "naval" && vehicle.naval) || (selectedMethod === "air" && vehicle.air)) && vehicle.tl <= tlItem && vehicle.tl >= (tlItem - tlRange)) {
        if (typeof vehicle.tlMod === "string" && vehicle.tlMod.length > 0) { // There is a tlMod string and it's not empty.
          if (vehicle.tlMod.includes("+") && tlPlus) { // It's a TL+ vehicle and that setting is on
            return options.fn(this);
          }
          else if (vehicle.tlMod.includes("^") && superScience) { // It's a superscience vehicle and that setting is on
            return options.fn(this);
          }
          else {
            return options.inverse(this);
          }
        }
        else { // It's a vehicle with a normal TL
          return options.fn(this);
        }
      }
      else {
        return options.inverse(this);
      }
  });

  Handlebars.registerHelper('showVoider', function (bodyPart, subLocation, options) {
    if (bodyPart.subLocation) { // There are sublocations
      if (bodyPart.subLocation.thigh) {  // There is a thigh
        if (bodyPart.subLocation.thigh.construction) {
          if (!bodyPart.subLocation.thigh.construction.flexible) { // The thigh armour is not flexible
            return options.fn(this); // Option is allowed
          }
          else { // The thigh armour is flexible, so hide the inside thigh location
            if (subLocation.label.toLowerCase().includes("inside")) {
              return options.inverse(this); // Option is not allowed
            }
          }
        }
      }

      if (bodyPart.subLocation.knee) { // There is a knee
        if (bodyPart.subLocation.knee.construction) {
          if (!bodyPart.subLocation.knee.construction.flexible) { // The knee armour is not flexible
            return options.fn(this); // Option is allowed
          }
          else { // The knee armour is flexible, so hide the inside knee location
            if (subLocation.label.toLowerCase().includes("back")) {
              return options.inverse(this); // Option is not allowed
            }
          }
        }
      }

      if (bodyPart.subLocation.elbow) { // There is an elbow
        if (bodyPart.subLocation.elbow.construction) {
          if (!bodyPart.subLocation.elbow.construction.flexible) { // The elbow armour is not flexible
            return options.fn(this); // Option is allowed
          } else { // The elbow armour is flexible, so hide the inside elbow location
            if (subLocation.label.toLowerCase().includes("inside")) {
              return options.inverse(this); // Option is not allowed
            }
          }
        }
      }

      if (bodyPart.subLocation.shoulder) { // There is a shoulder
        if (bodyPart.subLocation.shoulder.construction) {
          if (!bodyPart.subLocation.shoulder.construction.flexible) { // The shoulder armour is not flexible
            return options.fn(this); // Option is allowed
          }
          else { // The shoulder armour is flexible, so hide the armpit location
            if (subLocation.label.toLowerCase().includes("armpit")) {
              return options.inverse(this); // Option is not allowed
            }
          }
        }
      }
    }

    return options.fn(this); // Option is allowed
  });

  // A Handlebar helper to decide whether to show certain construction methods based on TL, the material-TL relationship, and location.
  Handlebars.registerHelper('armourConstructionLimit', function (campaignTL, construction, subLocation, bodyPart, options) {
    if (typeof campaignTL != "undefined" && typeof construction != "undefined" && typeof subLocation != "undefined" && typeof bodyPart != "undefined") {
      if (typeof subLocation.material != "undefined") {
        let materialName = subLocation.material.name;
        let material = subLocation.material;
        let locationLabel = subLocation.label;
        let constructionTL = construction.tl;
        let constructionName = construction.name;

        if ((materialName.toLowerCase().includes("iron") || materialName.toLowerCase().includes("steel")) && campaignTL < 3 && (constructionName.toLowerCase() == "early plate" || constructionName.toLowerCase() == "solid")) { // It's a ferrous material, the TL is less than 3, and it's plate/solid construction
          return options.inverse(this); // Option is not allowed
        }
        else if (campaignTL >= constructionTL) { // The TL is within the range
          // Start checking construction flags against the current name.
          if (material.fabric && constructionName.toLowerCase() == "fabric") { // Fabric is allowed in any hit location
            return options.fn(this); // Option is allowed
          }
          else if (material.plate && constructionName.toLowerCase() == "impact absorbing") { // Fabric is allowed in any hit location
            return options.fn(this); // Option is allowed
          }
          else if (material.layeredFabric && constructionName.toLowerCase() == "layered fabric" && (!materialName.toLowerCase().includes("leather") || campaignTL >= 1 )) { // Must not be leather, or must be at least TL 1
            return options.fn(this); // Option is allowed
          }
          else if (material.optimizedFabric && constructionName.toLowerCase() == "optimized fabric") { // Fabric is allowed in any hit location
            return options.fn(this); // Option is allowed
          }
          else if (material.scales && constructionName.toLowerCase() == "scales") { // Scale is allowed in any hit location
            return options.fn(this); // Option is allowed
          }
          else if (material.mail && constructionName.toLowerCase() == "mail") { // Mail is allowed in any hit location
            return options.fn(this); // Option is allowed
          }
          else if (material.plate && constructionName.toLowerCase() == "segmented plate" && !(subLocation.voider)) { // Segmented plate is allowed in any hit location that is not an armour chink
            return options.fn(this); // Option is allowed
          }
          else if (material.plate && constructionName.toLowerCase() == "early plate" && !(subLocation.voider) && !(bodyPart.label.toLowerCase().includes("abdomen"))) { // Segmented plate is allowed in any hit location that is not an armour chink or the abdomen
            return options.fn(this); // Option is allowed
          }
          else if (material.plate && constructionName.toLowerCase() == "plate" && !(subLocation.voider) && !(bodyPart.label.toLowerCase().includes("abdomen"))) { // Segmented plate is allowed in any hit location that is not an armour chink or the abdomen
            return options.fn(this); // Option is allowed
          }
          else if (material.solid && constructionName.toLowerCase() == "solid" && ((bodyPart.label.toLowerCase().includes("skull")) || locationLabel.toLowerCase().includes("vitals") || locationLabel.toLowerCase().includes("eye"))) { // Solid is only allowed in certain locations
            return options.fn(this); // Option is allowed
          }
          else if (constructionName.toLowerCase() == "no armour") { // No Armour is always allowed
            return options.fn(this); // Option is allowed
          }
          else { // None of the flags match
            return options.inverse(this); // Option is not allowed
          }
        }
        else {
          return options.inverse(this); // Option is not allowed
        }
      }
    }
  });

  Handlebars.registerHelper("mmToIn", function(mm, decimals) { // Decimals is entered as a whole numbered power of 10 (1, 10, 100, etc)
    return Math.round(+mm / 25.4 * +decimals) / +decimals;
  });

  Handlebars.registerHelper("inTomm", function(inches, decimals) { // Decimals is entered as a whole numbered power of 10 (1, 10, 100, etc)
    return Math.round(+inches / 25.4 * +decimals) / +decimals;
  });

  Handlebars.registerHelper("lbsToTons", function(lbs, decimals) { // Decimals is entered as a whole numbered power of 10 (1, 10, 100, etc)
    return Math.round(+lbs / 2000 * +decimals) / +decimals;
  });

  Handlebars.registerHelper("grainsToGrams", function(grains, decimals) { // Decimals is entered as a whole numbered power of 10 (1, 10, 100, etc)
    return Math.round(+grains / 15.4324 * +decimals) / +decimals;
  });

  Handlebars.registerHelper("gramsToGrains", function(grams, decimals) { // Decimals is entered as a whole numbered power of 10 (1, 10, 100, etc)
    return Math.round(+grams * 15.4324 * +decimals) / +decimals;
  });

  Handlebars.registerHelper("chamberPressureExample", function(psi, powder) { // Decimals is entered as a whole numbered power of 10 (1, 10, 100, etc)
    if (powder === "black") {
      if (psi <= 0) {
        return "Invalid, too low."
      }
      else if (psi <= 8000) {
        return "Black powder shotgun."
      }
      else if (psi <= 12000) {
        return "Large bore gun."
      }
      else if (psi <= 14000) {
        return "Low Pressure Longarm"
      }
      else if (psi <= 16000) {
        return "Longarm"
      }
      else if (psi <= 18000) {
        return "High Pressure Longarm"
      }
      else if (psi < 25000) {
        return "Very High Pressure."
      }
      else if (psi === 25000) {
        return "Black Powder realistic limit."
      }
      else if (psi > 25000) {
        return "Invalid, max psi is 25,000."
      }
      else {
        return "Invalid."
      }
    }
    else {
      if (psi <= 0) {
        return "Invalid, too low."
      }
      else if (psi <= 12400) {
        return "Shotgun Shell."
      }
      else if (psi <= 14500) {
        return "High-Brass or Magnum Shotgun Shell."
      }
      else if (psi <= 25000) {
        return "Low Pressure Pistol"
      }
      else if (psi <= 42500) {
        return "Pistol"
      }
      else if (psi <= 47500) {
        return "High Pressure Pistol"
      }
      else if (psi <= 50000) {
        return "Low Pressure Rifle"
      }
      else if (psi <= 57500) {
        return "Rifle"
      }
      else if (psi <= 65000) {
        return "High Pressure Rifle"
      }
      else if (psi < 300000) {
        return "Very High Pressure."
      }
      else if (psi === 300000) {
        return "Smokeless Powder realistic limit."
      }
      else if (psi > 300000) {
        return "Invalid, max psi is 300,000."
      }
      else {
        return "Invalid."
      }
    }


    return Math.round(+grams * 15.4324 * +decimals) / +decimals;
  });

  Handlebars.registerHelper("equipStatusToString", function(equipStatus) {
    let equipStatusString = "Equipped";
    if (equipStatus === "notCarried") {
      equipStatusString = "Not Carried";
    }
    else if (equipStatus === "carried") {
      equipStatusString = "Carried";
    }

    return equipStatusString;
  });

  Handlebars.registerHelper("calcMaxStrain", function(tensileStPsi, elasticModulusPsi) {
    let maxStrain = (tensileStPsi / elasticModulusPsi) * 100 ;
    maxStrain = Math.round(maxStrain * 100) / 100;
    maxStrain = maxStrain + "%"

    return maxStrain;
  });

  Handlebars.registerHelper("boolToYN", function(bool) {
    if (bool || bool == "true" || bool == "TRUE" || bool == "True") {
      return "Yes";
    }
    else {
      return "No"
    }
  });

  Handlebars.registerHelper("inchesToFtIn", function(height) {
    let feet = Math.floor(height/12);
    let inches = Math.round((height - (feet * 12)) * 10) / 10;

    return feet + "' " + inches + '"';
  });

  Handlebars.registerHelper("calcMaxStrainStyle", function(tensileStPsi, elasticModulusPsi) {
    let maxStrain = (tensileStPsi / elasticModulusPsi) * 100 ;
    maxStrain = Math.round(maxStrain * 100) / 100;

    let r = maxStrain * 9;
    let g = maxStrain * 31;
    let b = maxStrain * 9;

    let style = "font-weight: bold; color: rgb(" + r + " " + g + " " + b + " / 100%) !important;"

    return style;
  });

  Handlebars.registerHelper("hitLocationStyle", function(name) {
    let char1 = 1;
    let char2 = Math.floor(name.length/2);
    let char3 = 0;
    let b = 0;

    if (!isNaN(name.charAt(name.length - 1))) { // Last character is a number
      char3 = parseInt(name.charAt(name.length - 1));
      b = Math.min( Math.max( Math.round( (char3) * 63 ), 0), 255);
    }
    else {
      char3 = name.length - 1;
      b = Math.min( Math.max( Math.round( (name.toLowerCase().charCodeAt(char3) - 97) * 10.2 ), 0), 255);
    }

    let r = Math.min( Math.max( Math.round( (name.toLowerCase().charCodeAt(char1) - 97) * 10.2 ), 0), 255);
    let g = Math.min( Math.max( Math.round( (name.toLowerCase().charCodeAt(char2) - 97) * 10.2 ), 0), 255);

    return "background: rgb(" + r + " " + g + " " + b + " / 40%) !important;";
  });

  Handlebars.registerHelper("bucklingConstantStyle", function(a) {
    let ia = 1.2 - a;

    let r = ia * 100;
    let g = ia * 300;
    let b = ia * 100;

    return "font-weight: bold; color: rgb(" + r + " " + g + " " + b + " / 100%) !important;";
  });

  Handlebars.registerHelper("calcBowCost", function(tensileStPsi, elasticModulusPsi, densityLbsCuIn) {
    return (Math.round(tensileStPsi ** 2 / 100 / elasticModulusPsi / densityLbsCuIn*100)/100) + " $";
  });

  Handlebars.registerHelper("calcArrowCost", function(elasticModulusPsi, densityLbsCuIn) {
    return (Math.round(elasticModulusPsi / densityLbsCuIn*1.25/9000000*100)/100) + " $";
  });

  Handlebars.registerHelper("drawLengthStyle", function(targetDraw, maxDraw) {
    if (targetDraw > maxDraw) {
      return "background-color: rgb( 255 0 0 / 50%) !important;";
    }
    else {
      return "";
    }
  });

  Handlebars.registerHelper("deflectionStyle", function(deflection) {
    if (deflection > 50) {
      return "background-color: rgb( 255 0 0 / 50%) !important;";
    }
    else {
      return "";
    }
  });

  Handlebars.registerHelper("shaftLengthStyle", function(validShaft) {
    if (validShaft) {
      return "background-color: rgb( 255 0 0 / 50%) !important;";
    }
    else {
      return "";
    }
  });

  Handlebars.registerHelper("round", function(num, decimals) {
    if (typeof num != "number") {
      return num;
    }
    else {
      return (Math.round(num * decimals) / decimals);
    }
  });

  Handlebars.registerHelper("divide", function(num, decimals, divisor) {
    if (typeof num != "number" || typeof divisor != "number") {
      return num;
    }
    else {
      return (Math.floor((num / divisor) * decimals) / decimals);
    }
  });

  Handlebars.registerHelper("displayCurrency", function(num) {
    let returnString = num;
    if (typeof num === "number") {
      returnString = (Math.round(num * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return returnString
  });

  Handlebars.registerHelper("checkPlural", function(num) {
    if (typeof num != "number") { // If it's not a number
      return ""; // Return blank
    }
    else {
      if (num !== 1) { // It's not exactly 1.
        return "s"; // Return pluralization
      }
      else { // It's 1
        return ""; // Return blank
      }
    }
  });

  // Convert GURPS RoF to rounds per minute
  Handlebars.registerHelper("rpm", function(rof) {
    return rof * 60;
  });

  Handlebars.registerHelper("valueInRangeStyle", function(min, num, max) {
    if (num < min || num > max) {
      return "background-color: rgb( 255 0 0 / 50%) !important;";
    }
    else {
      return "";
    }
  });
});
