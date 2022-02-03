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

  // This helper introdouces conditional operators. It is used like this:
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
});
