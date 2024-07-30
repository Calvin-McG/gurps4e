/**
 * Init function loads tables, registers settings, and loads templates
 */
import { macroHelpers } from "../../helpers/macroHelpers.js";
import { materialHelpers } from "../../helpers/materialHelpers.js";
import { economicHelpers } from "../../helpers/economicHelpers.js";
import { vehicleHelpers } from "../../helpers/vehicleHelpers.js";
import { weatherHelpers } from "../../helpers/weatherHelpers.js";
import { lightingHelpers } from "../../helpers/lightingHelpers.js";

Hooks.once("init", () => {

  _setGurps4eInitiative();
  hookAPI();

  Hooks.on('renderSceneConfig', (app, html, options) => {
    // Add the tab button to the header
    // First an array containing all tab buttons is found, then we pick the last, then we append our new tab button
    html.find('a.item').slice(3,4).after('<a class="item" data-tab="calvin"><i class="fas fa-cloud-sun"></i> Environmental</a>')

    let campaignTL = game.settings.get("gurps4e", "campaignTL");

    // Create the tab content
    let tabContent = "<div class=\"tab active\" data-tab=\"calvin\">";

    // Start BAD
    tabContent +=
        "<div class='form-group-scene form-group'>" +
        "      <div class='scene-option-input input-row'>" +
        "        <h2 class='scene-option' style='width: 100%;'>BAD</h2>" +
        "        <div class='scene-option form-fields'>" +
        `          <input type="number" value="${app.document.flags?.gurps4e?.bad ?? 0}" step="1" name="flags.gurps4e.bad" placeholder="0">` +
        "        </div>" +
        "      </div>" +
        "      <div class='scene-option-subtitle'>The BAD for the scene</div>" +
        "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;BAD should apply to non-combat and non-chase rolls made by players on this scene. If you are a GM and roll on behalf of a player, BAD will not apply automatically.</p>";
    "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;The system will not apply </p>";
    "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Unlike with combat, I don't have a clear way to know when something does or does not involve a chase. So my suggestion is just not to turn BAD on for Chase Scenes.</p>";
    tabContent += "</div><hr>";
    // End BAD

    // Start Gravity
    tabContent +=
        "<div class='form-group-scene form-group'>" +
        "      <div class='scene-option-input input-row'>" +
        "        <h2 class='scene-option' style='width: 100%;'>Gravity <span class=\"units\">(Gs)</span></h2>" +
        "        <div class='scene-option form-fields'>" +
        `          <input type="number" value="${app.document.flags?.gurps4e?.gravity ?? 1}" step="0.01" name="flags.gurps4e.gravity" placeholder="Gravity" min="0">` +
        "        </div>" +
        "      </div>" +
        "      <div class='scene-option-subtitle'>The gravity of the scene, in multiples of Earth gravity.</div>" +
        "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Rules for gravity can be found on Basic 350.</p>" +
        "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Currently only fall damage is handled.</p>";

    // tabContent += "<p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Any value is possible and will correcly impact token encumberence, jump distance, falls, and whatever else I remembered to code in.</p>" +
    //     "<p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;However, if you're concerned with attribute penalties, they apply on multiples of 0.2G for actors without modified G-Tolerance. Once there are actors with modified G-Tolerance, multiples of 0.05G become relevant.</p>";

    tabContent += "</div><hr>";
    // End Gravity
    //
    // tabContent += "<h1 style='text-align: center; background-color: fuchsia; font-weight: bold'>Nothing below this line works</h1>";
    //
    // // Start Scene TL
    // tabContent +=
    //     "<div class='form-group-scene form-group'>" +
    //     "      <div class='scene-option-input input-row'>" +
    //     "        <h2 class='scene-option' style='width: 100%;'>Tech Level</h2>" +
    //     "        <div class='scene-option form-fields'>" +
    //     `          <input type="number" value="${app.document.flags?.gurps4e?.tl ?? campaignTL}" step="1" name="flags.gurps4e.tl" placeholder="Tech Level" min="0">` +
    //     "        </div>" +
    //     "      </div>" +
    //     "      <div class='scene-option-subtitle'>The tech level of the scene.</div>";
    //
    // // tabContent += "<p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Any value is possible and will correcly impact token encumberence, jump distance, falls, and whatever else I remembered to code in.</p>" +
    // //     "<p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;However, if you're concerned with attribute penalties, they apply on multiples of 0.2G for actors without modified G-Tolerance. Once there are actors with modified G-Tolerance, multiples of 0.05G become relevant.</p>";
    //
    // tabContent += "</div><hr>";
    // // End Scene TL
    //
    // // Start Beaufort
    // tabContent +=
    //     "<div class=\"form-group-scene form-group\">" +
    //     "      <div class='scene-option-input input-row'>" +
    //     "    <h2 class='scene-option' style='width: 100%;'>Beaufort Wind Scale</h2>" +
    //     "    <div class=\"scene-option form-fields\">" +
    //     `      <select value="${app.document.flags?.gurps4e?.beaufort ?? 1}" name="flags.gurps4e.beaufort" id="flags.gurps4e.beaufort">`;
    //
    // let beaufortScale = weatherHelpers.returnBeaufortScale();
    // let forecast = "";
    // for (let y = 0; y < beaufortScale.length; y++){
    //   // If the beaufort degree for the scene matches the one we've reached on the loop, mark it selected
    //   if (beaufortScale[y].degree === parseInt(app.document.flags.gurps4e.beaufort)) {
    //     tabContent += "<option value='" + beaufortScale[y].degree + "' selected>" + beaufortScale[y].degree + " - " + beaufortScale[y].description +"</option>"
    //
    //     forecast = "<div class='scene-option-forecast'>" +
    //         "<h2>Current Forecast (Save and reopen to update)</h2>" +
    //         "<p>Wind speeds range from " + beaufortScale[y].windMphL + " to " + beaufortScale[y].windMphH + " mph</p>" +
    //         "<p>Wave height ranges from " + beaufortScale[y].windMphL + " to " + beaufortScale[y].windMphH + " feet</p>" +
    //         "<p><span style='font-weight: 500; text-decoration: underline'>Sea effect:</span> " + beaufortScale[y].sea + "</p>" +
    //         "<p><span style='font-weight: 500; text-decoration: underline'>Land effect:</span> " + beaufortScale[y].land + "</p>" +
    //         "</div>";
    //   }
    //   // Otherwise not
    //   else {
    //     tabContent += "<option value='" + beaufortScale[y].degree + "'>" + beaufortScale[y].degree + " - " + beaufortScale[y].description +"</option>"
    //   }
    // }
    //
    // tabContent += "</select>" +
    //     "      </div>" +
    //     "    </div>";
    //
    // tabContent += "<div class='scene-option-subtitle'>A single number used to categorize the effect of wind speed.</div>";
    // tabContent += "<p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Beaufort scale appears on Magic 194, though the version in use here is slightly tweaked.</p>" +
    //     "    <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;In real life, Beaufort values above 12 are only in use by the PRC and ROC for very powerful typhoons, though they are roughly analagous to hurricane categorizations in use by the rest of the world. For that reason, the scale here follows the Beaufort scale up to 12, at which point it transitions to the hurricaine categorization system.</p>" +
    //     "    <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Theoretical categories 6 and 7 are included, using wind speed values provided by NOAA research scientist Jim Kossin.</p>" +
    //     "    <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Tornado scale is also included for reference, though if an actual tornado is present then the damage is likely to be a worse than listed since the wind is picking stuff up instead of just blowing it around.</p>" +
    //     "    <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;The UI is already pretty cluttered so if you want detailed info, look up the Fujita Scale on Wikipedia.</p>" +
    //     "    <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Some names of beaufort degrees have also been changed to match current NOAA names, though the actual wind and wave values are identical.</p>" +
    //     "</div>" +
    //     "<hr>";
    // // End Beaufort
    //
    // // Start Forecast
    // tabContent += forecast;
    // tabContent += "<hr>";
    // // End Forecast
    //
    // // Start Atmospheric Pressure
    // tabContent +=
    //     "<div class='form-group-scene form-group'>" +
    //     "      <div class='scene-option-input input-row'>" +
    //     "        <h2 class='scene-option' style='width: 100%;'>Atmospheric Pressure <span class=\"units\">(atm)</span></h2>" +
    //     "        <div class='scene-option form-fields'>" +
    //     `          <input type="number" value="${app.document.flags?.gurps4e?.atm ?? 1}" step="0.01" name="flags.gurps4e.atm" placeholder="Atmospheric Pressure" min="0">` +
    //     "        </div>" +
    //     "      </div>";
    //     tabContent +="<div class='scene-option-subtitle'>The atmospheric pressure of the scene, in multiples of Earth's sea-level atmospheric pressure.</div>";
    //     tabContent +="<p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Full rules for atmospheric pressure can be found on Basic 429, but a basic summary is listed below:</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Any value is possible and will correcly impact those cases that can take decimal values (Like laser range and damage) But the below ranges will be most relevant.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-weight: bold'>Trace Atmosphere: Less than 0.01 atm -</span> Essentially a vaccum. Without pressure support you can operate for half the time you can hold your breath. (Likely 4 to 7 seconds in combat, or 15 to 30 if walking)</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-weight: bold'>Very Thin Atmosphere: 0.01 to 0.5 atm -</span> Without some breathing aparatus or appropriate advantage you can operate for however long you can hold your breath.  (Likely 8 to 14 seconds in combat, or 24 to 60 if walking)</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-weight: bold'>Thin Atmosphere: 0.51 to 0.8 atm -</span> It's gonna suck, but with decent HT rolls, goggles, and frequent resting you can operate here as long as you don't crit fail your HT roll. (Mean time to crit fail is 37 days for HTs less than 12, 149 days for HT 12+)</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-weight: bold'>Standard Atmosphere: 0.81 to 1.2 atm -</span> Values in this range give no modifiers. On Earth, 5700ft is the point where the atmosphere shifts from Standard to Thin</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-weight: bold'>Dense Atmosphere: 1.21 to 1.5 atm -</span> -1 HT, otherwise it's not a big deal unless you're on some freaky planet with more than double Earth's O2.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-weight: bold'>Very Dense Atmosphere: 1.51 to 10 atm -</span> You need equipment or advantages to deal with the pressure or you can't breathe.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-weight: bold'>Superdense Atmosphere: More than 10 atm -</span> You will be crushed without protection.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Characters with a different native pressure are also correctly accounted for because I am very clever. Though their baseline is different, the same multiples apply and have the same sorts of penalties.</p>" +
    //     "</div>" +
    //     "<hr>";
    // // End Atmospheric Pressure
    //
    // // Start Altitude
    // tabContent +=
    //     "<div class='form-group-scene form-group'>" +
    //     "      <div class='scene-option-input input-row'>" +
    //     "        <h2 class='scene-option' style='width: 100%;'>Altitude <span class=\"units\">(ft)</span></h2>" +
    //     "        <div class='scene-option form-fields'>" +
    //     `          <input type="number" value="${app.document.flags?.gurps4e?.alt ?? 0}" step="1" name="flags.gurps4e.alt" placeholder="Altitude Above Sealevel" min="0">` +
    //     "        </div>" +
    //     "      </div>" +
    //     "      <div class='scene-option-subtitle'>An alternative way of setting atmospheric pressure, by instead specifying altitude above sea-level</div>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;If the value is anything other than zero it overrides any value set above in the Atmospheric Pressure input.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Any value is possible and will correcly impact those cases that can take decimal values (Like laser range and damage) But the below ranges will be most relevant.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Trace Atmosphere: More than 84500 ft - Essentially a vaccum. Without pressure support you can operate for half the time you can hold your breath. (Likely 4 to 7 seconds in combat, or 15 to 30 if walking)</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Very Thin Atmosphere: 17470 to 84500 ft - Without some breathing aparatus or appropriate advantage you can operate for however long you can hold your breath.  (Likely 8 to 14 seconds in combat, or 24 to 60 if walking)</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Thin Atmosphere: 5700 to 17470 ft - It's gonna suck, but with decent HT rolls, goggles, and frequent resting you can operate here as long as you don't crit fail your HT roll. (Mean time to crit fail is 37 days for HTs less than 12, 149 days for HT 12+)</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Standard Atmosphere: 0 to 5700 ft - Values in this range give no modifiers. On Earth, 5700ft is the point where the atmosphere shifts from Standard to Thin</p>" +
    //     "</div>" +
    //     "<hr>";
    //
    // console.log((1-2.25577*(10**-5)* ((app.document.flags?.gurps4e?.alt ?? 0) / 3.28084) )**5.25588);
    //
    // // End Altitude
    //
    // // Start Lighting
    // tabContent +=
    //     "<div class='form-group-scene form-group'>" +
    //     "      <div class='scene-option-input input-row'>" +
    //     "        <h2 class='scene-option' style='width: 100%;'>Lighting</h2>" +
    //     "        <div class='scene-option form-fields'>" +
    //     `          <input type="number" value="${app.document.flags?.gurps4e?.light ?? 0}" step="1" name="flags.gurps4e.light" placeholder="Lighting Penalty" max='0' min="-10">` +
    //     "        </div>" +
    //     "      </div>" +
    //     "      <div class='scene-option-subtitle'>The base penalty of unlit areas of the scene</div>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;The actual lighting penalty will be the better of this base penalty, and the penalty of any applicable lightsource. Examples of what each lighting penalty mean are below.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Light sources do not add together, so if the base lighting gives a -2 penalty, and they are carrying a light source that grants a -2 penalty, it does not add up to a -1 penalty.</p>";
    //
    // // Fetch the lighting table and then print it out
    // let lightingTableContent = lightingHelpers.returnLightingTable();
    // for (let z = 0; z < lightingTableContent.length; z++){
    //   tabContent += "<p style='width: 100%'><span style='font-weight: 500; font-style: italic'>Penalty:</span> " + lightingTableContent[z].penalty + ", <span style='font-weight: 500; font-style: italic'>Natural Light:</span> " + lightingTableContent[z].natural + ", <span style='font-weight: 500; font-style: italic'>Artificial Light:</span> " + lightingTableContent[z].artificial + "</p>";
    // }
    //
    // tabContent += "</div><hr>";
    // // End Lighting
    //
    // // Start Temperature
    // tabContent +=
    //     "<div class='form-group-scene form-group'>" +
    //     "      <div class='scene-option-input input-row'>" +
    //     "        <h2 class='scene-option' style='width: 100%;'>Temperature <span class=\"units\">(°F)</span></h2>" +
    //     "        <div class='scene-option form-fields'>" +
    //     `          <input type="number" value="${app.document.flags?.gurps4e?.f ?? 72}" step="1" name="flags.gurps4e.f" placeholder="Temperature °F" max='100000000000000000000000000000000' min="-460">` +
    //     "        </div>" +
    //     "      </div>" +
    //     "      <div class='scene-option-subtitle'>The temperature of the scene</div>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;At the moment, there's no distinction between interior and exterior spaces in the same scene. But you don't need to make rolls for everyone if you don't want to, and you can always apply a modifier if it would be appropriate.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Where appropriate, this setting will apply relevant modifiers for characters who are cold blooded. This starts at 65° or 50° depending on the severity of the disadvantage, and every further 10° will increase the penalty.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Normal humans have a temperature tolerance that ranges from 35° to 90°. In that range, no rolls are required. Outside that range, rolls are required to avoid FP loss. Every multiple of 10° outside that range adds an extra -1 to the HT roll. Crit fails on these HT rolls typically carry further negative modifiers.</p>";
    //
    // tabContent += "</div><hr>";
    // // End Temperature
    //
    // // Start Precipitation
    // tabContent +=
    //     "<div class='form-group-scene form-group'>" +
    //     "      <div class='scene-option-input input-row'>" +
    //     "        <h2 class='scene-option' style='width: 100%;'>Precipitation <span class=\"units\">(yrds visibility)</span></h2>" +
    //     "        <div class='scene-option form-fields'>" +
    //     `          <input type="number" value="${app.document.flags?.gurps4e?.precipitationYrds ?? 2000}" step="1" name="flags.gurps4e.precipitationYrds" placeholder="Yards visibility" min="0">` +
    //     `          <select value="${app.document.flags?.gurps4e?.precipitationType ?? "snow"}" name="flags.gurps4e.precipitationType" id="flags.gurps4e.precipitationType">` +
    //     "            <option value='rain'>Rain</option>" +
    //     "            <option value='snow'>Snow</option>" +
    //     "            <option value='sleet'>Sleet</option>" +
    //     "            <option value='hail'>Hail</option>" +
    //     "          </select>" +
    //     "        </div>" +
    //     "      </div>" +
    //     "      <div class='scene-option-subtitle'>The temperature of the scene</div>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;At the moment, there's no distinction between interior and exterior spaces in the same scene. But you don't need to make rolls for everyone if you don't want to, and you can always apply a modifier if it would be appropriate.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Where appropriate, this setting will apply relevant modifiers for characters who are cold blooded. This starts at 65° or 50° depending on the severity of the disadvantage, and every further 10° will increase the penalty.</p>" +
    //     "      <p class='scene-option-notes notes'>&nbsp;&nbsp;&nbsp;&nbsp;Normal humans have a temperature tolerance that ranges from 35° to 90°. In that range, no rolls are required. Outside that range, rolls are required to avoid FP loss. Every multiple of 10° outside that range adds an extra -1 to the HT roll. Crit fails on these HT rolls typically carry further negative modifiers.</p>";
    //
    // tabContent += "</div><hr>";
    // // End Precipitation

    // Closing div
    tabContent += "</div>"

    // Add the tab content
    // First an array containing all tab divs are found, then we pick the last, then we append our new tab with the tabContent created above.
    html.find('div.tab').slice(3,4).after(tabContent);
  })

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

  // Hooks.on('hotbarDrop', (bar, droppedData, slot) => createMacro(droppedData, slot));
  // async function createMacro(droppedData, slot) {
  //   if (droppedData.type !== "item") { // It's not an item being dragged down to the hotbar
  //     let macro = await _createMacroForRollable(droppedData);
  //     return game.user.assignHotbarMacro(macro, slot);
  //   }
  // }

  async function _createMacroForRollable(droppedData) {
    const command = `game.gurpsAPI.onRollableMacroRaw("${droppedData.label}", "${droppedData.level}", "${droppedData.type}");`;
    return Macro.implementation.create({
      name: `${droppedData.label}`,
      type: "script",
      img: "icons/svg/dice-target.svg",
      command
    });
  }

  game.settings.register("gurps4e", "campaignTL", {
    name: "Set the default campaign TL",
    hint: "TLs can always be changed on the relevant item/actor/etc after the fact, but this sets the default value for new items/actors/etc. This is particularly helpful for new Custom Weapons and Armour where the TL controls which options are available.",
    scope: "world",
    config: true,
    default: 8,
    type: Number
  });

  game.settings.register("gurps4e", "hoursToDabblerPoints", {
    name: "Partial Training Time to Dabbler Points",
    hint: "The perk 'Dabbler' effectively lets you split up a single character point across up to eight different skills to give you a skill level higher than default, but less than if you'd actually spent points. " +
        "This setting makes the same logic apply to Training Time, meaning the change from 199 hours to 200 hours is a little less abrupt. Only has an impact on skills with a default, however. On skills with no default this does nothing.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "addsToDice", {
    name: "Adds to Dice",
    hint: "This setting converts extra adds to dice, following the normal rules. So +4 is instead +1d6, and +7 is instead +2d6.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "gravity", {
    name: "Set the default gravity",
    hint: "Ideally this would be set per scene, but until that's possible, it is set at the campaign level." +
        "This value is gravity in Gs, as in, multiples of earth gravity. So Earth is 1. This is currently only used to determine fall speed.",
    scope: "world",
    config: true,
    default: 1,
    type: Number
  });

  game.settings.register("gurps4e", "strictInjuryCap", {
    name: "Strict Injury Cap",
    hint: "Enable this setting to include injury caps on both the Torso and Abdomen. This is an optional rule and caps torso injury at HPx2, and abdomen injury at HPx1",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "largeAreaBypassesInjuryCap", {
    name: "Large Area Attacks Bypass Injury Cap",
    hint: "With this setting on, attacks that qualify as Large Area Attacks, such as explosions, area attacks, and cones, bypass any locational injury cap. " +
        "I believe this is RAW, as LAA generally shouldn't target specific locations in the first place, but I leave it here as an option since it is somewhat debateable.",
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
    name: "Cap RPM Alchemy skill when determining max elixir count?",
    hint: "Thaumatology: Ritual Path Magic page 30: This option is only relevant when using the option that the quantity of ready elixirs is limited by the caster's Alchemy skill. " +
        "When crafting elixirs, your Alchemy skill is capped at 12 + Magery, but by default, that same cap does not apply when determining how many of those elixirs you can have." +
        "Setting this to true means that the 12 + Magery cap applies to max count as well.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "rpmSmoothIngredientDiscounts", {
    name: "Apply smooth ingredient quantity discounts?",
    hint: "By default, when making alchemical mixtures you get a discount based on the quantity of ingredients used. Using 30+ ingredients gives -15%, and using 8+ ingredients gives -5%." +
        "This means there's no reason to use a quantity of ingredients other than 1, 8, or 30, as in every other case you're just wasting weight and money." +
        "It also interacts strangely with the way that the quantity discount is capped by the quality of the ingredients you are adding." +
        "Turning this option on interpolates between those fixed values to apply a sliding discount in cost, based on the quantity of ingredients." +
        "It also corrects for the weirdness caused by how the discount is capped by ingredient quality.",
    scope: "world",
    config: true,
    default: true,
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
    name: "Realistic Scale Bow Damage",
    hint: "The default is Cinematic scale damage, which is designed to match the bows seen in Basic and Low Tech. " +
        "Realistic scale damage instead reduces the damage to better reflect the difference between bows and firearms.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "realisticBowReloadScale", {
    name: "Realistic Scale Bow Reloading",
    hint: "The default is Cinematic scale reloading, which is designed to match the reload speed for bows seen in Basic and Low Tech. " +
        "Realistic scale increases the reload time for most bows by 1 second, and means even relatively small bows have a reload of (3) instead of (2). ",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "repeatingCrossbows", {
    name: "Allow Repeating Crossbows",
    hint: "Crossbows are in Fantasy 141, but are not marked Superscience and did exist historically. " +
        "They remove the time required to fetch a bolt, in effect, this means an automatic success at fast draw. " +
        "This is in line with their historical use, which was to hand them out to low-skilled conscripts. " +
        "They also make Bulk worse by at least one step, and the time to replace a magazine is tremendous." +
        "Most reloading tools are also blocked by the magazine, effectively limiting the max damage possible out of a repeating crossbow. Again, this is inline with real life examples.",
    scope: "world",
    config: true,
    default: true,
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

  // Register option for whether the RPM magic tab shows up
  game.settings.register("gurps4e", "expandedTrainingBonuses", {
    name: "Expanded Training Bonuses.",
    hint: "Enabling this setting uses the expanded training bonuses table from MA:TG48 which grants further bonuses at DX+4, +7, +10, and so on. Currently applies to the following skills: Throwing, Thrown Weapon, and Throwing Art.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Register option for whether the RPM magic tab shows up
  game.settings.register("gurps4e", "percentageBasedTrainingBonuses", {
    name: "Percentage Based Training Bonuses.",
    hint: "Enabling this setting makes training bonuses percentage based, rather than strict breakpoints at 20, 30, etc. Currently applies to the following skills: Throwing, Thrown Weapon, and Throwing Art.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Register option for whether the RPM magic tab shows up
  game.settings.register("gurps4e", "cinematicTrainingBonusAccrual", {
    name: "Cinematic Training Bonus Accrual.",
    hint: "Enabling this setting makes training bonuses accrue at twice the rate. As in, where you'd normally get +1, you'd instead get +2, or +20% when using the percentage based bonuses. Currently applies to the following skills: Throwing, Thrown Weapon, and Throwing Art.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Register option for whether the RPM magic tab shows up
  game.settings.register("gurps4e", "cinematicTrainingBonusCap", {
    name: "Cinematic Training Bonus Cap.",
    hint: "Enabling this setting makes the maximum training bonus +10, or +100% when using the percentage based bonuses. Currently applies to the following skills: Throwing, Thrown Weapon, and Throwing Art.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "contactExplosionsFromAttacks", {
    name: "Is it possible for attacks to result in contact explosions?",
    hint: "With this set true, explosive attacks can cause contact explosions. " +
        "The book gives only one example of a contact explosion, and it's when someone throws themselves on a grenade. " +
        "This sometimes gets interpreted to mean that only such an extreme example would count as a contact explosion. " +
        "So someone throwing themselves on a grenade, or tripping and landing on a mine would count. " +
        "But someone getting hit directly with an explosive projectile would not. " +
        "There is some debate as to whether such a strict interpretation should be used, " +
        "and checking this box allows you to use the less strict interpretation, which is that any explosion that goes off in contact " +
        "counts as a contact explosion. Like you might get from a contact-fused explosive going off after striking someone.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "abdomenForLargeAreaInjury", {
    name: "Is the abdomen part of the torso for the purposes of determining Large Area Injury?",
    hint: "In the classic hit location table, slot 11 is the groin, and not part of the torso." +
        "In the more detailed hit location table, location 11 is the abdomen, and the abdomen is part of the torso." +
        "That said, the abdomen, particularly at lower TLs, cannot always receive the same sorts of armour as the torso." +
        "A prime example is the use of segmented plate instead of regular plate since the abdomen needs to flex more." +
        "The actual effect of this is likely to make Large Area Injury even more effective at bypassing DR, though by percentages, not multiples.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "torsoDRForLargeAreaInjury", {
    name: "Method for determining torso dr for the purposes of Large Area Injury",
    hint: "The rules for Large Area Injury can be found on B400." +
        "In short, it averages Torso DR and the lowest DR of the target." +
        "This field decides how that 'Torso' DR is selected." +
        "This option is only likely to be relevant if players have varying DR across their torso hit locations." +
        "Highest is likely best in line with the balance established in the Basic Set." +
        "Average makes Large Area Injury better at penetrating DR for people with mixed DR across the torso, which is a slight disruption to balance, but it is also more realistic in regards to what Large Area Injury is meant to represent.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "high": "Highest - Take the highest DR among all locations",
      "avg": "Average - Take the average DR among all locations",
      "lowest": "Lowest - Take the lowest DR among all locations"
    },
    default: "high",
  });

  game.settings.register("gurps4e", "allowBluntTraumaWithWounding", {
    name: "Allow blunt trauma to apply even when some injury is dealt",
    hint: "By default, blunt trauma only applies if no damage gets through the DR. " +
        "This is simple for bookkeeping, but causes oddities when an attack just barely gets through flexible DR." +
        "For example, if your target has 75 DR and you do 75 damage, they take 15 blunt trauma." +
        "But if you do 76 damage then they only take a single point of injury." +
        "Setting this true makes blunt trauma apply regardless of wounding. If enough blunt trauma stacks up against flexible DR, it gets applied regardless of damage.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "feverishDefenceAllowed", {
    name: "Allow Feverish Defences",
    hint: "Allow feverish defences, this is a semi-realistic optional rule",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "feverishDefenceRequiresWill", {
    name: "Feverish Defence requires a Will roll",
    hint: "By default Feverish Defence requires a Will roll or the bonus is not applied." +
        "With this setting true, the following applies: Success on this roll gives +2 to defence, failure gives nothing, and a crit fail does 1 HP of damage." +
        "With this setting false, there is no roll and the +2 bonus is always granted." +
        "The FP cost is part of a separate game setting, see below.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "feverishDefenceCostsFP", {
    name: "Feverish Defence costs FP",
    hint: "With this set true, selecting Feverish Defence will cost 1 FP, and if no FP remains, do 1 HP of damage. " +
        "With this set false, FP is not removed upon making a Feverish Defence roll.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "bretMode", {
    name: "Bret Mode",
    hint: "",
    scope: "world",
    config: true,
    default: "",
    type: String
  });

  game.settings.register("gurps4e", "bretModeCoefficientSuccess", {
    name: "Bret Mode",
    hint: "",
    scope: "world",
    config: true,
    default: 0.1,
    type: Number
  });

  game.settings.register("gurps4e", "bretModeCoefficientCritSuccess", {
    name: "Bret Mode",
    hint: "",
    scope: "world",
    config: true,
    default: 1,
    type: Number
  });

  game.settings.register("gurps4e", "bretModeCoefficientFail", {
    name: "Bret Mode",
    hint: "",
    scope: "world",
    config: true,
    default: 0.1,
    type: Number
  });

  game.settings.register("gurps4e", "bretModeCoefficientCritFail", {
    name: "Bret Mode",
    hint: "",
    scope: "world",
    config: true,
    default: 1,
    type: Number
  });

  game.settings.register("gurps4e", "acrobaticParry", {
    name: "Allow Acrobatic Parries",
    hint: "With this set true, characters can make acrobatic parries. This is a cinematic rule from MA129",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "acrobaticBlock", {
    name: "Allow Acrobatic Blocks",
    hint: "With this set true, characters can make acrobatic blocks. This is a cinematic rule from MA129",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("gurps4e", "jumpVelocityMethod", {
    name: "Jump Velocity Method",
    hint: "Basic 89 says that \"Your Move while jumping is the greater of your normal ground Move and 1/5 your maximum long jump distance.\" " +
        "This game option is specifically concerned with the meaning of the word \"maximum\" in that sentence. The \"Theoretical\" setting interprets maximum to mean the longest jump your character could ever achieve. In most cases that means basing your Jump Velocity off of whatever your broad jump distance would be if you ran and then sprinted on the two previous turns. " +
        "The \"Current\" setting bases your Jump Velocity off of whatever your broad jump distance would be for your current velocity, which at least some of the time will be zero. " +
        "The \"Super Jump Only\" setting bases uses the theoretical maximum for characters with Super Jump, and uses the current value for anyone without Super Jump. ",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "current": "Current",
      "theoretical": "Theoretical",
      "superJumpTheoretical": "Super Jump Only",
    },
    default: "superJumpTheoretical",
  });

  game.settings.register("gurps4e", "lightingTableType", {
    name: "Lighting Table Type",
    hint: "Powers: Enhanced Senses contains a table of lighting levels. Almost everyone except the writer agrees that it's bad and wrong. " +
        "Not least because it gives you a -3 to shoot someone standing in your living room. " +
        "It is technically RAW, however, so I include it here as an option. " +
        "But we default to using the much more sensible optional errata which lines up much more with literally every other book GURPS has ever put out.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "errata": "Powers: Enhanced Senses Illumination Levels Errata",
      "pes": "Powers: Enhanced Senses"
    },
    default: "errata",
  });

  game.settings.register("gurps4e", "gmLearningBonus", {
    name: "Set the default bonus for Learning rolls",
    hint: "It's sometimes wise to offer a bonus to Learning rolls made on the info tab. For example, the base rules assume an exact success gives 150 hours of training in a skill." +
        "But if you'd really prefer a month of study give 200 hours on average then set this to a +4.",
    scope: "world",
    config: true,
    default: 0,
    type: Number
  });

  game.settings.register("gurps4e", "armourAsDiceRanged", {
    name: "Armour As Dice - Ranged",
    hint: "Pyramid 3/34 & https://gamingballistic.com/2014/01/23/armor-as-dice-what-and-why/. DR converts to dice at 1d per 3.5. These dice are subtracted from the the attack, then the remainder is rolled. The goal is to make HT armour actually act as players would expect. This setting enables it specifically for ranged attacks only.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register("gurps4e", "armourAsDiceMelee", {
    name: "Armour As Dice - Melee",
    hint: "Pyramid 3/34 & https://gamingballistic.com/2014/01/23/armor-as-dice-what-and-why/. DR converts to dice at 1d per 3.5. These dice are subtracted from the the attack, then the remainder is rolled. This feature is not really intended to apply to melee attacks. However, it can be helpful if melee attacks in your campaign are regularly reaching 3d6 or higher.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

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
