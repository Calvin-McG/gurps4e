/**
 * Init function loads tables, registers settings, and loads templates
 */
Hooks.once("init", () => {

  _setGurps4eInitiative();

  function _setGurps4eInitiative() {
    let formula = "@primaryAttributes.speed.value + @primaryAttributes.dexterity.value / 10000 + (1d100 - 1) / 1000000";// First three digits are (speed), then [DX], then {d100-1} (5.00)[10]{38}
    let decimals = 6;
    CONFIG.Combat.initiative = {
      formula: formula,
      decimals: decimals
    }
  }

  // Register Hiding Test Data option
  game.settings.register("gurps4e", "hideTestData", {
    name: "Hide Test Data",
    hint: "GM test chat cards don't show sensitive NPC data to players.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Register Armour as Dice option
  game.settings.register("gurps4e", "armourAsDice", {
    name: "Armour As Dice",
    hint: "Pyramid 3/34. DR converts to dice at 1d per 3.5. These dice are subtracted from the the attack, then the remainder is rolled. Makes guns behave better in HT and UT.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register Armour as Dice option
  game.settings.register("gurps4e", "bleeding", {
    name: "Use Bleeding Rules",
    hint: "",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register Rigid armour can take blunt trauma option
  game.settings.register("gurps4e", "rigidBluntTrauma", {
    name: "Extended Blunt Trauma",
    hint: "Allows rigid armour to take blunt trauma",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register Edge Protection option
  game.settings.register("gurps4e", "edgeProtection", {
    name: "Edge Protection",
    hint: "Cutting attacks must double the target DR or do crushing damage instead",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register Edge Protection option
  game.settings.register("gurps4e", "harshThighGap", {
    name: "Thigh gap over artery",
    hint: "The 'Inside Thigh' gap lets cut, imp, pi, and tbb hit the artery instead of the thigh.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  // Pre-load templates
  loadTemplates([
    "systems/gurps4e/templates/actor/actor-sheet.html",
  ]);
 
});
