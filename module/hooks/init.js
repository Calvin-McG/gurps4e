/**
 * Init function loads tables, registers settings, and loads templates
 */
Hooks.once("init", () => {

  game.settings.register("gurps4e", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: Number,
    default: 1
  });

  _setGurps4eInitiative(game.settings.get("gurps4e", "initiativeRule"));

  function _setGurps4eInitiative(initMethod) {
    let formula = "@primaryAttributes.speed.value + @primaryAttributes.dexterity.value / 10000 + (1d100 - 1) / 1000000";

    let decimals = (initMethod == "default") ? 6 : 3;
    CONFIG.Combat.initiative = {
      formula: formula,
      decimals: decimals
    }
  }


  // Register Hiding Test Data
  game.settings.register("gurps4e", "hideTestData", {
    name: "SETTINGS.HideTestData",
    hint: "SETTINGS.HideTestDataHint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Pre-load templates
  loadTemplates([
    "systems/gurps4e/templates/actor/actor-sheet.html",
    "systems/gurps4e/templates/chat/chat-message.html",
    "systems/gurps4e/templates/chat/dialog-constant.html",
    "systems/gurps4e/templates/chat/test-card.html",
    "systems/gurps4e/templates/chat/chat-command-display-info.html",
    "systems/gurps4e/templates/item/item-sheet.html"
  ]);
 
});