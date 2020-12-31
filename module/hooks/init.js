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
  _setGurps4eInitiative();

  function _setGurps4eInitiative() {
    let formula = "@primaryAttributes.speed.value + @primaryAttributes.dexterity.value / 10000 + (1d100 - 1) / 1000000";// First three digits are (speed), then [DX], then {d100-1} (5.00)[10]{38}
    console.log(formula)

    let decimals = 6;
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
  ]);
 
});