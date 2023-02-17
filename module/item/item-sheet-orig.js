import {rollHelpers} from "../../helpers/rollHelpers.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class gurpsItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["gurps4e", "sheet", "item"],
      width: 926,
      height: 770,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "notes" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/gurps4e/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    return `${path}/${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 300;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Roll handlers, click handlers, etc. would go here.
        // User clicked addRow
        html.find('.addRow').click(this._onAddRow.bind(this));
        html.find('.addRangedRow').click(this._onAddRangedRow.bind(this));
        html.find('.addAfflictionRow').click(this._onAddAfflictionRow.bind(this));
        html.find('.addDefaultRow').click(this._onAddDefaultRow.bind(this));
        html.find('.addArrowRow').click(this._onAddArrowRow.bind(this));
        html.find('.addAmmoRow').click(this._onAddAmmoRow.bind(this));
        html.find('.addPathRow').click(this._onAddPathRow.bind(this));
        html.find('.addRitualModifierRow').click(this._onAddRitualModifierRow.bind(this));

        // User clicked delete thingy on the row
        html.find('.attack-delete').click(this._onDeleteRow.bind(this));
        html.find('.ranged-delete').click(this._onDeleteRangedRow.bind(this));
        html.find('.affliction-delete').click(this._onDeleteAfflictionRow.bind(this));
        html.find('.default-delete').click(this._onDeleteDefaultRow.bind(this));
        html.find('.deleteArrowRow').click(this._onDeleteArrowRow.bind(this));
        html.find('.deleteAmmoRow').click(this._onDeleteAmmoRow.bind(this));
        html.find('.path-delete').click(this._onDeletePathRow.bind(this));
        html.find('.ritualModifier-delete').click(this._onDeleteRitualModifierRow.bind(this));

        // Update body type
        html.find('.bodyType').change(this._onBodyTypeChange.bind(this));

        html.find('.subLocationDRUp').click(this._subLocationDRUp.bind(this));
        html.find('.subLocationDRDown').click(this._subLocationDRDown.bind(this));

        html.find('.locationDRUp').click(this._locationDRUp.bind(this));
        html.find('.locationDRDown').click(this._locationDRDown.bind(this));

        html.find('.burnDRUp').click(   this._burnDRUp.bind(this));
        html.find('.burnDRDown').click( this._burnDRDown.bind(this));
        html.find('.corDRUp').click(   this._corDRUp.bind(this));
        html.find('.corDRDown').click( this._corDRDown.bind(this));
        html.find('.crDRUp').click(   this._crDRUp.bind(this));
        html.find('.crDRDown').click( this._crDRDown.bind(this));
        html.find('.cutDRUp').click(   this._cutDRUp.bind(this));
        html.find('.cutDRDown').click( this._cutDRDown.bind(this));
        html.find('.fatDRUp').click(   this._fatDRUp.bind(this));
        html.find('.fatDRDown').click( this._fatDRDown.bind(this));
        html.find('.impDRUp').click(   this._impDRUp.bind(this));
        html.find('.impDRDown').click( this._impDRDown.bind(this));
        html.find('.piDRUp').click(   this._piDRUp.bind(this));
        html.find('.piDRDown').click( this._piDRDown.bind(this));
        html.find('.toxDRUp').click(   this._toxDRUp.bind(this));
        html.find('.toxDRDown').click( this._toxDRDown.bind(this));

        // Ritual handlers
        html.find('.gatherEnergy').click( this._gatherEnergy.bind(this));

        // Click event handlers
        html.find('.question-container').click(this._showHint.bind(this));
        html.find('.saveItem').click(this._saveItem.bind(this));
        html.find('.makeCraftingRoll').click(this._makeCraftingRoll.bind(this));
        html.find('.makeQuirkRoll').click(this._makeQuirkRoll.bind(this));
    }

    async _gatherEnergy(event) {
        let runningTimeTotalSeconds = 0; // Init the variable that will hold the number of seconds
        let runningTimeTotalMinutes = 0; // Init the variable that will hold the number of minutes
        let energyGathered = 0; // Init the variable to store the amount of energy gathered so far
        let quirkCount = 0;
        let energyNeeded = 0;
        let actorContribution = 0;
        let critFail = false;
        let previousCrit = false; // This var tracks if the last cycle was a crit
        let effectiveSkill = this.item.system.level + this.item.system.gatherMod; // For simplicity, just include the gatherMod in the effective skill instead of separating it out
        let cycleCount = 1;

        // Apply the penalty for taking less than 5 time units to gather energy.
        if (this.item.system.timeUnitsPerAttempt < 5 && this.item.system.timeUnitsPerAttempt > 0) { // They are taking less than 5 but not 0 time units
            effectiveSkill = effectiveSkill - (5 - this.item.system.timeUnitsPerAttempt); // Subtract the number of time units skipped from the effective skill
        }
        else if (this.item.system.timeUnitsPerAttempt === 0) { // They are attempting to gather instantly.
            effectiveSkill -= 10; // Apply the -10 penalty
        }

        if (this.item.actor) { // If there's an actor
            if (this.item.actor.system) {
                if (this.item.actor.system.rpm) {
                    actorContribution = ((this.item.actor.system.rpm.magery * 3) + this.item.actor.system.rpm.er) // Store their mana reserve
                }
            }
        }

        if (this.item.system.usePersonalMana) { // If they've checked the box to use their own mana for the spell
            energyNeeded = this.item.system.energyCost - (actorContribution + this.item.system.extraMana);
        } else {
            energyNeeded = this.item.system.energyCost - (this.item.system.extraMana);
        }

        let label = "Is gathering energy for " + event.currentTarget.id;
        let currentRoll;
        let html = "Gathering energy for " + event.currentTarget.id; // Init the html we're going to display as part of the output for this chat message

        html += "<table>";
        html += "<tr><th>#</th><th>Skill</th><th>Result</th><th>Mana</th><th>MM:SS</th></tr>";

        // Keep looping until one of the following happens:
        // They have all the energy they need
        // Their effective skill hits two
        // They crit fail
        while (energyGathered < energyNeeded && effectiveSkill > 2 && !critFail) {
            currentRoll = await rollHelpers.skillRoll(effectiveSkill, 0, "", false);

            // Add to the time taken (Do this before roll stuff so previousCrit doesn't get triggered early)
            if (previousCrit) { // If they got a crit on the last cycle, it always takes only a single second, regardless of the level of their time adeptedness
                runningTimeTotalSeconds += 1;
                previousCrit = false; // Reset previousCrit to false so it doesn't stick
            }
            else if (this.item.system.ritualAdeptTime === 0) { // They are not a ritual adept with respect to time
                runningTimeTotalMinutes += this.item.system.timeUnitsPerAttempt; // Add the number of time units they have selected to the number of minutes spent casting
            }
            else if (this.item.system.ritualAdeptTime === 1) { // They are sorta a ritual adept with respect to time
                if (cycleCount === 1) { // It's the first cycle, and Time 1 adepts take seconds instead of minutes for the first cycle.
                    runningTimeTotalSeconds += this.item.system.timeUnitsPerAttempt; // Add the number of time units they have selected to the number of seconds spent casting
                }
                else {
                    runningTimeTotalMinutes += this.item.system.timeUnitsPerAttempt; // Add the number of time units they have selected to the number of minutes spent casting
                }
            }
            else if (this.item.system.ritualAdeptTime === 2) { // They are a full ritual adept with respect to time
                runningTimeTotalSeconds += this.item.system.timeUnitsPerAttempt; // Add the number of time units they have selected to the number of seconds spent casting
            }

            // Add roll based results

            if (!currentRoll.success && currentRoll.crit) { // If they failed, and it's a crit
                critFail = true;
                html += "<tr><td>" + cycleCount + "</td><td style='text-align: center'>" + effectiveSkill + "</td><td style='background-color: rgb(208, 127, 127)'>Crit Fail by " + currentRoll.margin + "</td><td>" + energyGathered + "</td>"; // Add column details for everything but time
            }
            else if (!currentRoll.success && !currentRoll.crit) { // If they failed, and it's not a crit
                quirkCount += 1; // Failures add a quirk
                energyGathered += 1; // But still add 1 energy.

                html += "<tr><td>" + cycleCount + "</td><td style='text-align: center'>" + effectiveSkill + "</td><td style='color: rgb(199, 137, 83)'>Failure by " + currentRoll.margin + "</td><td>" + energyGathered + "</td>"; // Add column details for everything but time
            }
            else if (currentRoll.success && !currentRoll.crit) { // If they succeeded, and it's not a crit
                energyGathered += Math.max(1, currentRoll.margin); // Add the margin of success to the energy gathered, but at least 1;

                html += "<tr><td>" + cycleCount + "</td><td style='text-align: center'>" + effectiveSkill + "</td><td style='color: rgb(141, 142, 222)'>Success by " + currentRoll.margin + "</td><td>" + energyGathered + "</td>"; // Add column details for everything but time
            }
            else if (currentRoll.success && currentRoll.crit) { // If they succeeded, and it's a crit
                energyGathered += Math.max(1, currentRoll.margin); // Add the margin of success to the energy gathered, but at least 1;
                previousCrit = true;

                html += "<tr><td>" + cycleCount + "</td><td style='text-align: center'>" + effectiveSkill + "</td><td style='background-color: rgb(106, 162, 106)'>Critical Success by " + currentRoll.margin + "</td><td>" + energyGathered + "</td>"; // Add column details for everything but time
            }
            else {
                html += "<tr><td>" + cycleCount + "</td><td style='text-align: center'>" + effectiveSkill + "</td><td>Unknown Result by " + currentRoll.margin + "</td><td>" + energyGathered + "</td>"; // Add column details for everything but time
            }

            html += "<td  style='text-align: right'>" + runningTimeTotalMinutes + ":" + runningTimeTotalSeconds + "</td></tr>"; // Add column details for time

            if ((cycleCount % 3 === 0) && (cycleCount !== 1)) { // If the current cycle is divisible by 3, apply the stacking skill penalty
                effectiveSkill -= 1;
            }

            cycleCount += 1; // Add one to the cycle count to track how long we've been doing this;
        }

        // Convert the time as calculated so far into a more readable HH:MM:SS
        let totalSeconds = runningTimeTotalSeconds + (runningTimeTotalMinutes * 60); // Convert total to seconds
        let timeOutput = "HH:MM:SS";
        if (totalSeconds < 3600) { // It's less than an hour, display as MM:SS
            timeOutput = new Date(totalSeconds * 1000).toISOString().substring(14, 19)
        }
        else { // It's an hour or more, display as HH:MM:SS
            timeOutput = new Date(totalSeconds * 1000).toISOString().substring(11, 19)
        }

        html += "</table>"

        html += "<div>" + energyGathered + " energy was gathered over the course of " + timeOutput + ", out of a required " + energyNeeded + "</div>"

        if (critFail) {
            html += "<div>The energy gathering process ended with a Critical Failure, leading to a " + (energyGathered * 2) + " point botch.</div>"
        }
        else if (quirkCount > 0) { // If there are quirks, tell the user about it
            if (quirkCount === 1) { // Handle plurals correctly
                html += "<div style='background: rgb(199,199,83,0.68)'>The energy gathering process generated <span style='font-weight: bold'>one</span> quirk</div>"
            }
            else {
                html += "<div style='background: rgb(199,199,83,0.68)'>The energy gathering process generated <span style='font-weight: bold'>" + quirkCount + "</span> quirks</div>"
            }
        }

        if (game.user.isGM) {
            ChatMessage.create({ content: html, user: game.user.id, whisper: ChatMessage.getWhisperRecipients('GM') });
        }
        else {
            ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
        }
    }

    _makeCraftingRoll(event) {
        rollHelpers.charmCraftingRoll(this.item.system.charm.craftingRollMod, "Attempts to craft a " + event.currentTarget.id + " charm.", true);
    }

    _makeQuirkRoll(event) {
        rollHelpers.skillRoll(this.item.system.level, this.item.system.charm.quirkRollMod, "Crafts a " + event.currentTarget.id + " charm.", false).then( rollInfo => { // Make the roll

            let html = rollInfo.content;

            if (rollInfo.success) { // Success on the roll, no quirks.
                html += "The charm has no quirks.";
            }
            else { // Failure on the roll, one or more quirks.
                let extraQuirks = Math.floor(Math.abs(rollInfo.margin) / 2); // One quirk per two points in the margin of failure.
                if (extraQuirks > 0) {
                    html += "The charm has " + (extraQuirks + 1) + " quirks.";
                }
                else {
                    html += "The charm has one quirk.";
                }
            }

            ChatMessage.create({ content: html, user: game.user.id, type: rollInfo.type });
        });
    }

    _saveItem() {
        this.item.update({ ["system"]: this.item.system });
    }

    _onAddArrowRow() {
        // If there's no arrow container, add one
        if(typeof this.item.system.bowDesign.arrows == "undefined") {
            this.item.system.bowDesign.arrows = [];
        }
        let keys = Object.keys(this.item.system.bowDesign.arrows); // Get the existing set of arrow keys
        let newKey = 0; // Init the new key
        if (keys.length){ // The list of keys is not empty
            newKey = (+keys[keys.length-1] + +1); // Add the new one in at the end
        }
        else { // The list of keys is empty
            newKey = 0; // Add the new one at the start of the empty list
        }

        let newRow = {
            "length": 22,
            "material": {
                "a": 0,
                "densityLbsCuIn": 0,
                "elasticModulusPsi": 0,
                "name": "Wood - White Pine",
                "tensileStPsi": 0,
                "tl": 0,
                "maxStrain": 0,
                "bowCostPerLb": 0,
                "arrowCostPerLb": 0,
            },
            "materialEssential": false,
            "quality": "good",
            "outerDiameter": 0.5,
            "minOuterDiameter": 0.5,
            "innerDiameter": 0,
            "arrowhead": {
                "ad": "1",
                "barbed": "no",
                "damageType": "imp",
                "weight": 0.04
            },
        }; // Init the new arrow row

        this.item.system.bowDesign.arrows[newKey] = newRow;

        this.item.update({ ["system"]: this.item.system }); // Add the new arrow to the list of melee keys
    }

    _onDeleteArrowRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(6);
                        this.item.update({ ["system.bowDesign.arrows.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _onAddAmmoRow(event) {
        // If there's no arrow container, add one
        if(typeof this.item.system.firearmDesign.ammunition == "undefined") {
            this.item.system.firearmDesign.ammunition = [];
        }
        let keys = Object.keys(this.item.system.firearmDesign.ammunition); // Get the existing set of ammo
        let newKey = 0; // Init the new key
        if (keys.length){ // The list of keys is not empty
            newKey = (+keys[keys.length-1] + +1); // Add the new one in at the end
        }
        else { // The list of keys is empty
            newKey = 0; // Add the new one at the start of the empty list
        }

        let newRow = {
            "plusp": false,
            "match": "0",
            "subsonic": false,
            "silent": false,
            "case": "cased",
            "projectile": "solid",
            "projectiles": 1,
            "poison": false,
            "inc": false,
            "tracer": false,
            "maxExplosivePercent": 0,
            "rofBonus": 0,
        }; // Init the new arrow row

        this.item.system.firearmDesign.ammunition[newKey] = newRow;

        this.item.update({ ["system"]: this.item.system }); // Add the new arrow to the list of melee keys
    }

    _onDeleteAmmoRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(4);
                        this.item.update({ ["system.firearmDesign.ammunition.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _showHint(event) {
        this.item.showInfo(event.currentTarget.id);
    }

    _locationDRUp(event) {
        this.alterLocationDR(event, 1);
    }
    _locationDRDown(event) {
        this.alterLocationDR(event, -1);
    }

    _subLocationDRUp(event) {
        this.alterLocationDR(event, 1);
    }
    _subLocationDRDown(event) {
        this.alterLocationDR(event, -1);
    }

    _burnDRUp(event) {
        this.alterLocationDR(event, 1, "burn");
    }
    _burnDRDown(event) {
        this.alterLocationDR(event, -1, "burn");
    }
    _corDRUp(event) {
        this.alterLocationDR(event, 1, "cor");
    }
    _corDRDown(event) {
        this.alterLocationDR(event, -1, "cor");
    }
    _crDRUp(event) {
        this.alterLocationDR(event, 1, "cr");
    }
    _crDRDown(event) {
        this.alterLocationDR(event, -1, "cr");
    }
    _cutDRUp(event) {
        this.alterLocationDR(event, 1, "cut");
    }
    _cutDRDown(event) {
        this.alterLocationDR(event, -1, "cut");
    }
    _fatDRUp(event) {
        this.alterLocationDR(event, 1, "fat");
    }
    _fatDRDown(event) {
        this.alterLocationDR(event, -1, "fat");
    }
    _impDRUp(event) {
        this.alterLocationDR(event, 1, "imp");
    }
    _impDRDown(event) {
        this.alterLocationDR(event, -1, "imp");
    }
    _piDRUp(event) {
        this.alterLocationDR(event, 1, "pi");
    }
    _piDRDown(event) {
        this.alterLocationDR(event, -1, "pi");
    }
    _toxDRUp(event) {
        this.alterLocationDR(event, 1, "tox");
    }
    _toxDRDown(event) {
        this.alterLocationDR(event, -1, "tox");
    }

    alterLocationDR(event, mult, type){ // Event passes the event from the original method, and the mult is the positive or negative change desired.
        let modifier = +mult; // This multiplier is applied to the final change to DR.

        // Each modifier key applies it's own stacking multiplier
        if (event.altKey) {
            modifier = +modifier * +2;
        }
        if (event.shiftKey) {
            modifier = +modifier * +10;
        }
        if (event.ctrlKey) {
            modifier = +modifier * +5;
        }

        let locationDRBlock = getProperty(this,event.currentTarget.id);

        if (locationDRBlock.subLocation) { // The location has sub locations
            let locationKeys = Object.keys(locationDRBlock.subLocation);
            for (let d = 0; d < locationKeys.length; d++) {
                // First, check if the type matches, or has not been set at all. If so, get the dr that matches type and location. If that value is NaN, treat it as zero. Then add the modifier to that value, and set the new sum as the new dr value for that type and location.
                ((type === "burn"   || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drBurn   = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drBurn)) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drBurn)) + parseInt(modifier) : 0);
                ((type === "cor"    || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drCor    = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drCor )) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drCor )) + parseInt(modifier) : 0);
                ((type === "cr"     || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drCr     = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drCr  )) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drCr  )) + parseInt(modifier) : 0);
                ((type === "cut"    || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drCut    = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drCut )) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drCut )) + parseInt(modifier) : 0);
                ((type === "fat"    || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drFat    = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drFat )) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drFat )) + parseInt(modifier) : 0);
                ((type === "imp"    || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drImp    = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drImp )) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drImp )) + parseInt(modifier) : 0);
                ((type === "pi"     || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drPi     = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drPi  )) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drPi  )) + parseInt(modifier) : 0);
                ((type === "tox"    || typeof type == 'undefined') ? getProperty(locationDRBlock.subLocation, locationKeys[d]).drTox    = (isNaN(parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drTox )) ? 0 : parseInt(getProperty(locationDRBlock.subLocation, locationKeys[d]).drTox )) + parseInt(modifier) : 0);
            }
        }

        else { // The location has no sub locations
            // First, check if the type matches, or has not been set at all. If so, get the dr that matches type and location. If that value is NaN, treat it as zero. Then add the modifier to that value, and set the new sum as the new dr value for that type and location.
            ((type === "burn"   || typeof type == 'undefined') ? locationDRBlock.drBurn = (isNaN(parseInt(locationDRBlock.drBurn)) ? 0 : parseInt(locationDRBlock.drBurn)) + parseInt(modifier) : 0);
            ((type === "cor"    || typeof type == 'undefined') ? locationDRBlock.drCor  = (isNaN(parseInt(locationDRBlock.drCor )) ? 0 : parseInt(locationDRBlock.drCor )) + parseInt(modifier) : 0);
            ((type === "cr"     || typeof type == 'undefined') ? locationDRBlock.drCr   = (isNaN(parseInt(locationDRBlock.drCr  )) ? 0 : parseInt(locationDRBlock.drCr  )) + parseInt(modifier) : 0);
            ((type === "cut"    || typeof type == 'undefined') ? locationDRBlock.drCut  = (isNaN(parseInt(locationDRBlock.drCut )) ? 0 : parseInt(locationDRBlock.drCut )) + parseInt(modifier) : 0);
            ((type === "fat"    || typeof type == 'undefined') ? locationDRBlock.drFat  = (isNaN(parseInt(locationDRBlock.drFat )) ? 0 : parseInt(locationDRBlock.drFat )) + parseInt(modifier) : 0);
            ((type === "imp"    || typeof type == 'undefined') ? locationDRBlock.drImp  = (isNaN(parseInt(locationDRBlock.drImp )) ? 0 : parseInt(locationDRBlock.drImp )) + parseInt(modifier) : 0);
            ((type === "pi"     || typeof type == 'undefined') ? locationDRBlock.drPi   = (isNaN(parseInt(locationDRBlock.drPi  )) ? 0 : parseInt(locationDRBlock.drPi  )) + parseInt(modifier) : 0);
            ((type === "tox"    || typeof type == 'undefined') ? locationDRBlock.drTox  = (isNaN(parseInt(locationDRBlock.drTox )) ? 0 : parseInt(locationDRBlock.drTox )) + parseInt(modifier) : 0);
        }

        this.item.update({ [event.currentTarget.id.substring(5)]: locationDRBlock });
    }

    _onAddRow(event) {
        // If there's no melee container, add one
        if(typeof this.item.system.melee == "undefined") {
            this.item.system.melee = {
                "melee": []
            }
        }
        let keys = Object.keys(this.item.system.melee); // Get the existing set of melee keys
        let newKey = 0; // Init the new key
        if (keys.length){ // The list of keys is not empty
            newKey = (+keys[keys.length-1] + +1); // Add the new one in at the end
        }
        else { // The list of keys is empty
            newKey = 0; // Add the new one at the start of the empty list
        }

        let newRow = { "name": "" }; // Init the new melee row

        this.item.update({ ["system.melee." + newKey]: newRow }); // Add the new row to the list of melee keys
    }
    _onAddRangedRow(event) {
        if (typeof this.item.system.ranged == "undefined") {
            this.item.system.ranged = {
                "ranged": []
            }
        }
        let keys = Object.keys(this.item.system.ranged);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }
        else {
            newKey = 0;
        }

        let newRow = { "name": "" };
        this.item.update({ ["system.ranged." + newKey]: newRow });
    }
    _onAddAfflictionRow(event) {
        if (typeof this.item.system.affliction == "undefined") {
            this.item.system.affliction = {
                "0" : []
            }
        }
        let keys = Object.keys(this.item.system.affliction);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }
        else {
            newKey = 0;
        }
        let newRow = {
            "name": "",
            "resistanceRoll": "",
            "armourDivisor": "I",
            "resistanceRollPenalty": 0,
            "ruleOf": 16
        };
        this.item.update({ ["system.affliction." + newKey]: newRow });
    }
    _onAddDefaultRow(event) {
        let keys = Object.keys(this.item.system.defaults);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }

        let newRow = { "skill": "" };
        this.item.update({ ["system.defaults." + newKey]: newRow });
    }


    _onAddPathRow(event) {
        // If there's no path container, add one
        if(typeof this.item.system.path == "undefined") {
            this.item.system.path = {
                "path": []
            }
        }
        let keys = Object.keys(this.item.system.path); // Get the existing set of melee keys
        let newKey = 0; // Init the new key
        if (keys.length){ // The list of keys is not empty
            newKey = (+keys[keys.length-1] + +1); // Add the new one in at the end
        }
        else { // The list of keys is empty
            newKey = 0; // Add the new one at the start of the empty list
        }

        let newRow = {  // Init the new path row
            "level": "lesser",
            "effect": "sense",
            "path": "body",
            "cost": 2,
            "notes": ""
        };

        this.item.update({ ["system.path." + newKey]: newRow }); // Add the new row to the list of path keys
    }

    _onAddRitualModifierRow(event) {
        // If there's no ritual modifier container, add one
        if(typeof this.item.system.ritualModifier == "undefined") {
            this.item.system.ritualModifier = {
                "ritualModifier": []
            }
        }
        let keys = Object.keys(this.item.system.ritualModifier); // Get the existing set of melee keys
        let newKey = 0; // Init the new key
        if (keys.length){ // The list of keys is not empty
            newKey = (+keys[keys.length-1] + +1); // Add the new one in at the end
        }
        else { // The list of keys is empty
            newKey = 0; // Add the new one at the start of the empty list
        }

        let newRow = {  // Init the new modifier row
            "modifier": "affliction",
            "effect": {
                "percentage": 0, // For Affliction
                "level": 0, // For Altered Trait or Meta-Magic
                "area": 0, // For AoE
                "excludes": 0, // For AoE
                "scope": "broad", // Broad, Moderate, Single, for both bonuses and penalties
                "modifier": 0, // For Bonuses and Penalties
                "dice": 1, // For damage and healing
                "adds": 1, // For damage and healing
                "woundMod": "cr", // For damage
                "external": false, // For damage
                "explosive": false, // For damage
                "enhancementsOn": false, // For damage
                "enhancements": 0, // For damage
                "enhancementNotes": "", // For damage
                "limitationsOn": false, // For damage
                "limitations": 0, // For damage
                "limitationNotes": "", // For damage
                "durationQty": 0, // For duration
                "durationUnits": 0, // For duration
                "extraEnergy": 0, // For Extra Energy
                "resource": "hp", // For healing
                "range": 0, // For range
                "rangeType": "normal", // For range
                "speed": 0, // For speed
                "weight": 10, // For Subject Weight
                "trappings": 0, // For Traditional Trappings.
                "crafting": 0, // For the crafting penalty thingy
                "craftingPenalty": 0, // For the crafting penalty thingy
            },
            "cost": 0,
            "notes": ""
        };

        this.item.update({ ["system.ritualModifier." + newKey]: newRow }); // Add the new row to the list of path keys
    }

    _onDeleteRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(6);
                        this.item.update({ ["system.melee.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _onDeleteRangedRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash" style=\'width: 100%; text-align: center\'></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(6);
                        this.item.update({ ["system.ranged.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _onDeleteAfflictionRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(10);
                        this.item.update({ ["system.affliction.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _onDeleteDefaultRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(7);
                        this.item.update({ ["system.defaults.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _onDeletePathRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(6);
                        this.item.update({ ["system.path.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _onDeleteRitualModifierRow(event) {
        let confirmationModal = new Dialog({
            title: "Are you sure?",
            content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Delete",
                    callback: () => {
                        let id = event.currentTarget.id.substring(6);
                        this.item.update({ ["system.ritualModifier.-=" + id] : null});
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                },
            },
            default: "cancel",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "250"
        })

        confirmationModal.render(true);
    }

    _onBodyTypeChange(event) {
        event.preventDefault();
        let bodyType = event.target.value;

        if(bodyType == ""){
            this.item.update({ "system.armour.bodyType.-=body" : null}).then( item => {// Remove the old body
            });
            return
        }

        let bodyObj = {};

        // Spoders and squids have a brain instead of a skull. Everyone else has a skull
        if (bodyType == "arachnoid" || bodyType == "octopod"){
            bodyObj.brain = this.addBrain();
        }
        else {
            bodyObj.skull = this.addSkull();
        }

        // Body parts that apply to all body types
        bodyObj.face = this.addFace();

        // The following body parts are specific to said body types
        if (bodyType == "humanoid"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        if (bodyType == "wingedHumanoid"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "quadruped"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "wingedQuadruped"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "hexapod"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Upper Thorax Arm");
            bodyObj.armRight = this.addArm("Right Upper Thorax Arm");
            bodyObj.lowerArmLeft = this.addArm("Left Lower Thorax Arm");
            bodyObj.lowerArmRight = this.addArm("Right Lower Thorax Arm");
            bodyObj.upperChest = this.addChest("Upper Thorax");
            bodyObj.lowerChest = this.addChest("Mid Thorax");
            bodyObj.abdomen = this.addAbdomen("Lower Thorax");
            bodyObj.handLeft = this.addExtremity("Left Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandLeft = this.addExtremity("Left Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandRight = this.addExtremity("Right Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "wingedHexapod"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Upper Thorax Arm");
            bodyObj.armRight = this.addArm("Right Upper Thorax Arm");
            bodyObj.lowerArmLeft = this.addArm("Left Lower Thorax Arm");
            bodyObj.lowerArmRight = this.addArm("Right Lower Thorax Arm");
            bodyObj.upperChest = this.addChest("Upper Thorax");
            bodyObj.lowerChest = this.addChest("Mid Thorax");
            bodyObj.abdomen = this.addAbdomen("Lower Thorax");
            bodyObj.handLeft = this.addExtremity("Left Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandLeft = this.addExtremity("Left Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandRight = this.addExtremity("Right Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "centaur"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Humanoid Upper Chest");
            bodyObj.lowerChest = this.addChest("Humanoid Lower Chest");
            bodyObj.chestAnimal = this.addChest("Animal Chest");
            bodyObj.abdomen = this.addCentaurAbdomen("Humanoid Abdomen");
            bodyObj.animalAbdomen = this.addAbdomen("Animal Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "avian"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.tail = this.addTail("Tail");
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "vermiform"){
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "lamia"){
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "wingedLamia"){
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "octopod"){
            bodyObj.upperChest = this.addInvertebrateChest("Upper Chest");
            bodyObj.lowerChest = this.addInvertebrateChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.tentacleLeft1 = this.addArm("Left Tentacle 1");
            bodyObj.tentacleLeft2 = this.addArm("Left Tentacle 2");
            bodyObj.tentacleLeft3 = this.addArm("Left Tentacle 3");
            bodyObj.tentacleLeft4 = this.addArm("Left Tentacle 4");
            bodyObj.tentacleRight1 = this.addArm("Right Tentacle 1");
            bodyObj.tentacleRight2 = this.addArm("Right Tentacle 2");
            bodyObj.tentacleRight3 = this.addArm("Right Tentacle 3");
            bodyObj.tentacleRight4 = this.addArm("Right Tentacle 4");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "cancroid"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.handLeft = this.addExtremity("Left Claw", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Claw", "Hand", "Wrist", "Palm");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "ichthyoid"){
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.neck = this.addNeck();
            bodyObj.tail = this.addTail("Tail");
            bodyObj.fin1 = this.addExtremity("Dorsal Fin", "Fin", "Joint");
            bodyObj.fin2 = this.addExtremity("Left Fin", "Fin", "Joint");
            bodyObj.fin3 = this.addExtremity("Right Fin", "Fin", "Joint");
        }
        else if (bodyType == "arachnoid"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.hindmidlegLeft = this.addLeg("Left Mid Hind Leg");
            bodyObj.hindmidlegRight = this.addLeg("Right Mid Hind Leg");
            bodyObj.foremidlegLeft = this.addLeg("Left Mid Foreleg");
            bodyObj.foremidlegRight = this.addLeg("Right Mid Foreleg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.foremidFootLeft = this.addExtremity("Left Mid Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.foremidFootRight = this.addExtremity("Right Mid Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindmidFootLeft = this.addExtremity("Left Mid Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindmidFootRight = this.addExtremity("Right Mid Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }

        this.item.update({ "system.armour.bodyType.body" : bodyObj }) // Add the new body
    }

    addSkull() {
        let part = {
            label: "Skull",
            drBurn: "",
            drCor: "",
            drCr: "",
            drCut: "",
            drFat: "",
            drImp: "",
            drPi: "",
            drTox: "",
            drHardening: 1,
            flexible: false,
            surfaceArea: 1.4 // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
        };
        return part;
    }

    addBrain() {
        let part = {
            label: "Brain",
            drBurn: "",
            drCor: "",
            drCr: "",
            drCut: "",
            drFat: "",
            drImp: "",
            drPi: "",
            drTox: "",
            drHardening: 1,
            flexible: false,
            surfaceArea: 1.4, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
        };
        return part;
    }

    addFace() {
        let part = {
            label: "Face",
            subLocation: {
                jaw: {
                    label: "Jaw",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                nose: {
                    label: "Nose",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                ears: {
                    label: "Ears",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                cheek: {
                    label: "Cheek",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/3, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                eyeLeft: {//Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
                    label: "Left Eye",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/12, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                eyeRight: {//Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
                    label: "Right Eye",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/12, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }
        return part;
    }

    addLeg(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                shin: {
                    label: "Shin",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 3.5/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                thigh: {
                    label: "Thigh",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 3.15/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                insideThigh: {
                    label: "Inside Thigh",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    voider: true,
                    surfaceArea: 3.15/2/4, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                knee: {
                    label: "Knee",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.35/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                backOfKnee: {
                    label: "Back of Knee",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    voider: true,
                    surfaceArea: 0.35/2/4, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                artery: {
                    label: "Thigh Artery",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0,
                }
            }
        }

        return part;
    }

    addTail(){
        let part = {
            label: "Tail",
            flexible: false,
            subLocation: {
                forearm: {
                    label: "Tail",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 2.8/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                shoulder: {
                    label: "Shoulder",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }

    addArm(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                forearm: {
                    label: "Forearm",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                upperArm: {
                    label: "Upper Arm",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                elbow: {
                    label: "Elbow",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.35/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                insideElbow: {
                    label: "Inside Elbow",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    voider: true,
                    surfaceArea: 0.35/2/4, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                shoulder: {
                    label: "Shoulder",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                armpit: {
                    label: "Armpit",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    voider: true,
                    surfaceArea: 0.7/2/4, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }

    addChest(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                chest: {
                    label: label,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: (5.25 - 5.25/6) / 2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                vitals: {
                    label: "Vitals",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: (5.25/6/2) / 2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                spine: {
                    label: "Spine",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: (5.25/6/2) / 2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }

    addInvertebrateChest(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                chest: {
                    label: label,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: (5.25 - 5.25/6) / 2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                vitals: {
                    label: "Vitals",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 5.25/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }

    addCentaurAbdomen(label){ // This is the abdomen for the humanoid chest
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                digestiveTract: {
                    label: "Digestive Tract",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                vitals: {
                    label: "Vitals",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                pelvis: {
                    label: "Pelvis",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }

    addAbdomen(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                digestiveTract: {
                    label: "Digestive Tract",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/2, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                vitals: {
                    label: "Vitals",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                pelvis: {
                    label: "Pelvis",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                groin: {
                    label: "Groin",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 1.75/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }

    addExtremity(label, type, jointName, insideName){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                extremity: {
                    label: type,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/2*(4/6), // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                extremityInterior: {
                    label: insideName,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/2/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                joint: {
                    label: jointName,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.7/2/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }

    addNeck(){
        let part = {
            label: "Neck",
            flexible: false,
            subLocation: {
                neck: {
                    label: "Neck",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.35*(5/6), // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                },
                vein: {
                    label: "Vein",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    drHardening: 1,
                    flexible: false,
                    surfaceArea: 0.35/6, // The surface area of this part for a 150lb SM0 humanoid in square feet. It is corrected after for weight/SM
                }
            }
        }

        return part;
    }
}
