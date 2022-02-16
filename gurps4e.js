// Import Modules
import { gurpsActor } from "./module/actor/actor.js";
import { gurpsActorSheet } from "./module/actor/actor-sheet.js";
import { gurpsItem } from "./module/item/item.js";
import { gurpsItemSheet } from "./module/item/item-sheet-orig.js";

Hooks.once('init', async function() {

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

  Handlebars.registerHelper('isInt', function (value) {
    return Number.isInteger(value);
  });

  // This helper introduces conditional operators. It is used like this:
  // {{#ifCond  data.data.tl '>=' 9 }}
  //  <div class="header">
  //   <a class="item" data-tab="melee">Design Laser</a>
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

  //
  Handlebars.registerHelper('showVoider', function (bodyPart, subLocation, options) {
    if (bodyPart.subLocation) { // There are sublocations
      if (bodyPart.subLocation.thigh) {  // There is a thigh
        if (!bodyPart.subLocation.thigh.construction.flexible) { // The thigh armour is not flexible
          return options.fn(this); // Option is allowed
        }
        else { // The thigh armour is flexible, so hide the inside thigh location
          if (subLocation.label.toLowerCase().includes("inside")) {
            return options.inverse(this); // Option is not allowed
          }
        }
      }

      if (bodyPart.subLocation.knee) { // There is a knee
        if (!bodyPart.subLocation.knee.construction.flexible) { // The knee armour is not flexible
          return options.fn(this); // Option is allowed
        }
        else { // The knee armour is flexible, so hide the inside knee location
          if (subLocation.label.toLowerCase().includes("back")) {
            return options.inverse(this); // Option is not allowed
          }
        }
      }

      if (bodyPart.subLocation.elbow) { // There is an elbow
        if (!bodyPart.subLocation.elbow.construction.flexible) { // The elbow armour is not flexible
          return options.fn(this); // Option is allowed
        }
        else { // The elbow armour is flexible, so hide the inside elbow location
          if (subLocation.label.toLowerCase().includes("inside")) {
            return options.inverse(this); // Option is not allowed
          }
        }
      }

      if (bodyPart.subLocation.shoulder) { // There is a shoulder
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
          else if (material.fabric && constructionName.toLowerCase() == "impact absorbing") { // Fabric is allowed in any hit location
            return options.fn(this); // Option is allowed
          }
          else if (material.layeredFabric && constructionName.toLowerCase() == "layered fabric") { // Fabric is allowed in any hit location
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
          else if (material.solid && constructionName.toLowerCase() == "solid" && ((bodyPart.label.toLowerCase().includes("skull")) || locationLabel.toLowerCase().includes("vitals"))) { // Solid is only allowed on the vitals and skull
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

  Handlebars.registerHelper("valueInRangeStyle", function(min, num, max) {
    if (num < min || num > max) {
      return "background-color: rgb( 255 0 0 / 50%) !important;";
    }
    else {
      return "";
    }
  });
});
