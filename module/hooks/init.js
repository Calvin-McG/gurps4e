/**
 * Init function loads tables, registers settings, and loads templates
 */
Hooks.once("init", () => {

  _setGurps4eInitiative();

  function _setGurps4eInitiative() {
    let formula = "@primaryAttributes.speed.value + @primaryAttributes.dexterity.value / 10000 + (1d100 - 1) / 1000000";// First three digits are (speed), then [DX], then {d100-1}. Example: (5.00)[10]{38} -> 5001038
    let decimals = 6;
    CONFIG.Combat.initiative = {
      formula: formula,
      decimals: decimals
    }
  }

  // Register Armour as Dice option
  game.settings.register("gurps4e", "armourAsDice", {
    name: "Armour As Dice - WIP",
    hint: "Pyramid 3/34. DR converts to dice at 1d per 3.5. These dice are subtracted from the the attack, then the remainder is rolled. Makes guns behave better in HT and UT, is less appropriate for fantasy games with melee weapons and muscle powered ranged weapons.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register Bleeding Rules option
  game.settings.register("gurps4e", "bleeding", {
    name: "Use Bleeding Rules - WIP",
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

  // Register relative SM option for melee attacks
  game.settings.register("gurps4e", "meleeRelativeSM", {
    name: "Melee attacks follow relative SM",
    hint: "While this is true the difference between the attacker and target's SM applies as a modifier on the attack. While this is false the modifier is simply the target's SM.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Register relative SM option for ranged attacks
  game.settings.register("gurps4e", "rangedRelativeSM", {
    name: "Ranged attacks follow relative SM",
    hint: "While this is true the difference between the attacker and target's SM applies as a modifier on the attack. While this is false the modifier is simply the target's SM.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register Edge Protection option
  game.settings.register("gurps4e", "edgeProtection", {
    name: "Edge Protection - WIP",
    hint: "Cutting attacks must double the target DR or do crushing damage instead",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // How to get the user who owns the actor: game.users.get((Object.keys(game.actors.getName("character name goes here").data.permission)[1])).data.name
  // game.settings.register("gurps4e", "bretMode", {
  //   name: "Bret Mode",
  //   hint: "Bret Mode",
  //   scope: "world",
  //   config: true,
  //   default: true,
  //   type: Boolean
  // });

  // Register option for what counts as 'rear' when it comes to hit locations where that matters
  game.settings.register("gurps4e", "literalRear", {
    name: "Literal rear hit locations",
    hint: "Certain hit location penalties vary depending on whether you're standing in front of or behind someone. When set to true, in front is the front 180 and behind is the rear 180. When set to false front is the front 240 and rear is the back 120",
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
