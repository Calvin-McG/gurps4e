/**
 * Init function loads tables, registers settings, and loads templates
 */
import { macroHelpers } from "../../helpers/macroHelpers.js";
import { materialHelpers } from "../../helpers/materialHelpers.js";
import { economicHelpers } from "../../helpers/economicHelpers.js";
import { vehicleHelpers } from "../../helpers/vehicleHelpers.js";

Hooks.once("init", () => {

  _setGurps4eInitiative();
  hookAPI();

  function _setGurps4eInitiative() {
    let formula = "@primaryAttributes.speed.value + @primaryAttributes.dexterity.value / 10000 + (1d100 - 1) / 1000000"; // First three digits are (speed), then [DX], then {d100-1}. Example: (5.00)[10]{38} -> 5001038
    let decimals = 6;
    CONFIG.Combat.initiative = {
      formula: formula,
      decimals: decimals
    }
  }

  function hookAPI() {
    game.gurpsAPI = macroHelpers;
    game.materialAPI = materialHelpers;
    game.economicAPI = economicHelpers;
    game.vehicleAPI = vehicleHelpers;
  }

  game.settings.register("gurps4e", "campaignTL", {
    name: "Set the default campaign TL",
    hint: "TLs can always be changed on the relevant item/actor/etc after the fact, but this sets the default value for new items/actors/etc. This is particularly helpful for new Custom Weapons and Armour where the TL controls which options are available.",
    scope: "world",
    config: true,
    default: 8,
    type: Number
  });

  // Register option for whether the vanilla magic tab shows up
  game.settings.register("gurps4e", "showVanillaMagic", {
    name: "Show vanilla magic tab.",
    hint: "Enable this setting to show a tab on the character sheet for tracking info related to vanilla GURPS Magic.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register option for whether the RPM magic tab shows up
  game.settings.register("gurps4e", "showRPM", {
    name: "Show RPM magic tab.",
    hint: "Enable this setting to show a tab on the character sheet for tracking info related to Ritual Path Magic.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register option for whether the RPM magic tab shows up
  game.settings.register("gurps4e", "allowRPMTalent", {
    name: "Allow Natural Caster.",
    hint: "Enable this setting to allow characters to take the Natural Caster Talent from page 12 of Thaumatology - Ritual Path Magic.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "rpmElixirLimit", {
    name: "Select limit type on RPM Elixir quantity.",
    hint: "",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "withConditional": "Elixirs count against the normal Conditional Spells limit.",
      "byAlchemySkill": "Elixirs have their own Conditional Spells limit, based on Alchemy instead of Thaumatology skill.",
      "expiration": "Elixirs have no limit, but do expire."
    },
    default: "byAlchemySkill",
  });

  game.settings.register("gurps4e", "rpmLimitAlchemySkill", {
    name: "Cap Alchemy skill for RPM elixirs?",
    hint: "When using the option that the quantity of ready elixirs is limited by the caster's Alchemy skill, is the Alchemy skill limited to (12 + Magery) like Thaumatology is? By default the answer to this question is no, but the book includes this as an option.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register option for what counts as 'rear' when it comes to hit locations where that matters
  game.settings.register("gurps4e", "literalRear", {
    name: "Literal rear hit locations",
    hint: "Certain hit location penalties vary depending on whether you're standing in front of or behind someone. When set to true, in front is the front 180 and behind is the rear 180. When set to false front is the front 240 and rear is the back 120",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "rigidBluntTrauma", {
    name: "Extended Blunt Trauma",
    hint: "Allows rigid armour to take blunt trauma.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "meleeRelativeSM", {
    name: "Melee attacks follow relative SM",
    hint: "While this is true the difference between the attacker and target's SM applies as a modifier on the attack. While this is false the modifier is simply the target's SM.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "rangedRelativeSM", {
    name: "Ranged attacks follow relative SM",
    hint: "While this is true the difference between the attacker and target's SM applies as a modifier on the attack. While this is false the modifier is simply the target's SM.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "scalingMethodForCustomArmour", {
    name: "Scaling Method For Custom Armour",
    hint: "The default method for armour scaling is SM-Based, where all actors in the same SM range have the same weight and cost multiplier. This is easy if playing on pen and paper but can lead to odd results." +
        "The alternative presented in the Custom Armour article is Weight-Based scaling. Rather than assume every character in the same SM range has armour that weighs exactly the same, this option scales the armour weight to that exact character. " +
        "This advantages characters at the bottom of an SM range and disadvantages those at the top, but only because it removes abuseable break-points. " +
        "Finally, there is also Height-Based scaling. This is basically just the SM-Based scaling, but based on their specific height instead of the SM bracket they fall into.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "weight": "Weight-Based",
      "sm": "SM-Based",
      "height": "Height-Based"
    },
    default: "weight",
  });

  game.settings.register("gurps4e", "adjustedHoldoutPenaltyForCustomArmour", {
    name: "Adjusted Holdout Penalty For Custom Armour",
    hint: "By default, the holdout penalty is equal to the DR of the armour if it is rigid, or DR/3 if the armour is flexible. " +
        "This is fine at low tech levels with mundane materials, but if your campaign is at TL6+ or allows magical materials then this can cause issues. " +
        "After all, by these rules, a DR 4 piece of leather has the same holdout penalty as a DR 4 piece of Kevlar, despite the fact that the leather is half an inch thick and the kevlar is less than an eighth of an inch. " +
        "There are three options to address this: First is to make no correction, though this means that a lot of UT armour meant to be worn as clothing has Holdout penalties in the area of -8. (Which is a lot) " +
        "Second is to correct for this by the weight of the material. Rigid materials use High Quality Iron as the baseline and flexible materials use Leather. " +
        "Third is to correct for this by the thickness of the material. Again, High Quality Iron and Leather are used as the baseline. This is the method suggested by the pyramid articles which give rules for Custom Armour.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "": "No Correction",
      "weight": "Weight-Based Correction",
      "thickness": "Thickness-Based Correction"
    },
    default: "thickness",
  });

  game.settings.register("gurps4e", "hotshotsAndOverheating", {
    name: "Hotshots and Overheating",
    hint: "UT 133, at the moment, enabling this mostly just allows the construction of gatling lasers.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "allowSuperScienceCustomLasers", {
    name: "Allow Super Science Custom Lasers",
    hint: "Allows super science laser options like Graviton Beams. Also allows super science versions of non-super science weapons and super science power cells.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "allowSuperScienceVehicles", {
    name: "Allow Super Science Vehicles",
    hint: "Allows super science vehicles to appear in the travel options.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });


  game.settings.register("gurps4e", "allowTLPlusVehicles", {
    name: "Allow Divergent TL vehicles",
    hint: "Allows divergent TL vehicles to appear in the travel options (Such as TL3+1).",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "fixedBonusStrongbow", {
    name: "Fixed bonus for Strongbow and Crossbow Finesse",
    hint: "By default Strongbow and Crossbow Finesse directly increase the user's effective ST. " +
        "This works fine for quick gameplay but can lead to inconsistent behaviour when using custom bows. " +
        "Turning this option on instead changes the bonus from +1/+2 ST to +15%/+30% draw weight. " +
        "Fixed in this case means that the bonus to draw weight doesn't change based on the ST of the user, not that the alternative is somehow broken. " +
        "This option has a negative impact on characters below ST 14, and a positive impact on characters above ST 14. ST 14 characters are not impacted.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "compoundBowStrictTL", {
    name: "Strict TL limits for Compound Bows",
    hint: "Compound bows make clever use of pulleys, cams, and mechanical advantage to get more power out of a bow or crossbow. " +
        "The first compound bow ever actually made was created in 1966 by Holless Wilbur Allen. " +
        "Strictly speaking, this places compound bows in the middle of TL7. " +
        "However, the principles behind the construction of a compound bow are only TL2. " +
        "Setting this option to 'true' strictly interprets this to mean compound bows only become available at TL7+ " +
        "Leaving this option false uses the TL2 as the limit. " +
        "(As The Deadly Spring article seems to do, as it gives an example of a dwarven compound bow made at TL5.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "realisticBowScale", {
    name: "Realistic Scale Bows",
    hint: "The default is Cinematic scale, which is designed to match the bows seen in Basic and Low Tech. " +
        "Realistic scale instead reduces the damage to better reflect the difference between bows and firearms. ",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "realisticFootTravel", {
    name: "Realistic Foot Travel (LTC 2)",
    hint: "Enable this setting to use the 'Realistic Foot Travel' rules from Low Tech Companion 2 instead of those from the Basic Set. " +
        "The existing hiking section of the info pane already includes options to vary the Basic Set rules for realism, but this switch moves things over entirely. ",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "allowSuperScienceMaterialsForCustom", {
    name: "Allow Super Science Materials For Custom Weapons and Armour",
    hint: "Allows stuff like Retro-Reflective Armour.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "allowMagicalMaterialsForCustom", {
    name: "Allow Magical Materials For Custom Weapons, Armour, and Jewelry",
    hint: "Allows Essential Metal, Giant Spider Silk, etc, when creating custom weapons, armour, and jewelry.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "simpleEssentialMaterials", {
    name: "Simple Essential Materials for Bows, Crossbows, and Footbows",
    hint: "Essential materials are supposed to be three times as strong. This option makes that the case. Tensile strength is 3x it's base value and that's it. " +
        "With this option off, tensile strength is 9x it's base value and elastic modulus is 3x it's base value. This results in a max strain that is three times the value of the base material. " +
        "Simple means that bows made with essential materials are better without actually needing to be designed specifically to take advantage of the new material. Arrows are also no different than normal when made of essential materials. " +
        "Complex means that bows made with essential materials are better and have even greater potential, but must be specifically designed to take advantage of the new material. Essential arrows also have different stats when set to Complex.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "manaTreasure", {
    name: "Include mana on Custom Jewelry",
    hint: "For custom jewelry, include a display showing how much mana the item would be worth when using inanimate sacrifice from Thaumatology 55. These rules are really only helpful for magic systems that use FP and it's equivalents as energy.",
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

  game.settings.register("gurps4e", "allowTL4BreechLoaders", {
    name: "Allow Breech Loaders at TL4",
    hint: "Breech loaders are technically TL4, rather than TL5. Though the players should generally need to invent it as a same-TL invention for it to be available unless you are in late TL4.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "edgeProtection", {
    name: "Edge Protection",
    hint: "Cutting attacks must exceed double the target DR or do crushing damage instead",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // game.settings.register("gurps4e", "armourAsDice", {
  //   name: "Armour As Dice - WIP",
  //   hint: "Pyramid 3/34. DR converts to dice at 1d per 3.5. These dice are subtracted from the the attack, then the remainder is rolled. Makes guns behave better in HT and UT, is less appropriate for fantasy games with melee weapons and muscle powered ranged weapons.",
  //   scope: "world",
  //   config: true,
  //   default: false,
  //   type: Boolean
  // });

  // game.settings.register("gurps4e", "bleeding", {
  //   name: "Use Bleeding Rules - WIP",
  //   hint: "",
  //   scope: "world",
  //   config: true,
  //   default: false,
  //   type: Boolean
  // });

  // Pre-load templates
  loadTemplates([
    "systems/gurps4e/templates/actor/actor-sheet.html",
  ]);
 
});
