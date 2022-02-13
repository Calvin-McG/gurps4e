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

  Handlebars.registerHelper("calcMaxStrain", function(tensileStPsi, elasticModulusPsi) {
    let maxStrain = (tensileStPsi / elasticModulusPsi) * 100 ;
    maxStrain = Math.round(maxStrain * 100) / 100;
    maxStrain = maxStrain + "%"

    return maxStrain;
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
});
