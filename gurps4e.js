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
});
