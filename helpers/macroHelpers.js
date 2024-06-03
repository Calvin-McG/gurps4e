import { actorHelpers } from "./actorHelpers.js";
import { distanceHelpers } from "./distanceHelpers.js";
import { attackHelpers } from "./attackHelpers.js";
import { rollHelpers } from "./rollHelpers.js";
import { skillHelpers } from "./skillHelpers.js";
import { postureHelpers } from "./postureHelpers.js";
import { generalHelpers } from "./generalHelpers.js";

export class macroHelpers {


    static randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static capitalizeFirst(str) {
        if (typeof str === "string") {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        else {
            return ""
        }
    }

    // This is the method called when a user clicks the "Make An Attack" macro
    // By this point we only know the user's selected token, target token, and possibly some or all of the attack's name.
    static makeAnAttackMacro(token, attackType, itemName, attackName) {
        // This macro allows the user to select an attack from their sheet to use against their target(s)

        let selfToken = token; // Get owned token

        if (typeof selfToken === "undefined" || selfToken === null) {
            this.noSelectionsDialog(1);
        }

        else {
            let targetSet = game.user.targets // Get set of targets
            let targetArray = Array.from(targetSet); // Convert to an actually useable data type
            let selfActor = selfToken.actor // Get owned actor from token

            if(targetArray.length > 1){ // There is more than one target.
                this.tooManyTargetsDialog();
            }

            else { // There are zero to one targets.
                this.singleTargetDialog(selfToken, targetArray[0], attackType, itemName, attackName);
            }
        }
    }

    // Return a dialog that tells the user to pick a target or place a token
    static noTargetsDialog(){
        let noTargetsDialogContent = "<div>You need to select a target, or place a template with a colour matching your own.</div>";

        let noTargetsDialog = new Dialog({
            title: "Select a target",
            content: noTargetsDialogContent,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Ok"
                }
            },
            default: "ok"
        })

        noTargetsDialog.render(true);
    }

    // Return a dialog that tells the user to pick only one target
    static tooManyTargetsDialog(){
        let tooManyTargetsDialogContent = "<div>You have too many targets selected, make sure there is only one</div>";

        let tooManyTargetsDialog = new Dialog({
            title: "Select a target",
            content: tooManyTargetsDialogContent,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Ok"
                }
            },
            default: "ok"
        })

        tooManyTargetsDialog.render(true);
    }

    // Return a dialog that tells the user to select some number of actors
    static noSelectionsDialog(amount){
        let noSelectionsDialogContent = "";
        let title = "";
        if (amount == 1) {
            noSelectionsDialogContent = "<div>You need to select a token.</div>";
            title = "Select a token"
        }
        if (amount > 1) {
            noSelectionsDialogContent = "<div>You need to select at least one token.</div>";
            title = "Select at least one token"
        }

        let noSelectionsDialog = new Dialog({
            title: title,
            content: noSelectionsDialogContent,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Ok"
                }
            },
            default: "ok"
        })

        noSelectionsDialog.render(true);
    }

    static onRollableMacroRaw(label, level, type) {
        let dataSet = {
        	label: label,
        	level: level,
        	type: type
        }
        this.onRollableMacro(dataSet);
    }

    // Handle when a user clicks a .rollable that has been moved to the hotbar.
    static onRollableMacro(dataSet) {
        let modModal = new Dialog({ // Bring up a modal to allow them to input a modifier on the roll.
            title: "Modifier Dialog",
            content: "<input type='text' id='mod' name='mod' value='0'/>",
            buttons: {
                mod: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Apply Modifier",
                    callback: (html) => {
                        let mod = html.find('#mod').val()
                        actorHelpers.computeRollFromDataset(dataSet, mod)
                    }
                },
                noMod: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No Modifier",
                    callback: () => actorHelpers.computeRollFromDataset(dataSet, 0)
                }
            },
            default: "mod",
            render: html => console.log("Register interactivity in the rendered dialog"),
            close: html => console.log("This always is logged no matter which option is chosen")
        })
        modModal.render(true)
    }

    // Facing is returned as 1/0/-1 (Front/Side/Rear) and position as 1/-1 (Ahead/Behind)
    // As in, the attacker is in front, in side, in rear of the target (For active defence purposes, depends on target's vision (Peripheral, 360, tunnel, etc)
    // As in, the attacker is ahead or behind the target (In physical space, has nothing to do with anyone's traits.
    static getFacing(attackerToken, targetToken){ // !IMPORTANT. This method works. But tokens look out their bottom most of the time. Don't fuck with this, check token rotation and vision settings.
        let relativePosition = (Math.atan2(-(targetToken.x - attackerToken.x), (targetToken.y - attackerToken.y)) * 180 / Math.PI) + 180; // Takes the atan of the two sets of points after they have been rotated clockwise 90 degrees. This puts the 0 point towards the direction of facing with 180/-180 directly behind

        let targetFacing;
        if (targetToken.rotation > 180){ // Correct for facing angles of greater than 180 degrees. Valid range for this macro is -180 to 0 to 180. Not 0 to 360
            targetFacing = targetToken.rotation - 360;
        }
        else {
            targetFacing = targetToken.rotation
        }

        let relativeAngle = relativePosition - targetFacing; // Get the relative angle between the two tokens, corrected for the target's facing

        if (relativeAngle < -180){ // Correct for angles less than -180
            relativeAngle += 360;
        }
        else if (relativeAngle > 180){ // Correct for angles more than 180
            relativeAngle -= 360;
        }
        relativeAngle = Math.round(relativeAngle); // Round the angle so we don't get cases like 120.172 degrees.


        let attackerTokenActor = attackerToken.actor;
        if (!attackerTokenActor){
            attackerTokenActor = attackerToken.document.actor;
        }

        let targetTokenActor = targetToken.actor;
        if (!targetTokenActor){
            targetTokenActor = targetToken.document.actor;
        }

        let leftFrontBound	= (0 - (targetTokenActor.system.vision.front / 2)); // Get all the bounds for front and side arcs
        let rightFrontBound = (0 + (targetTokenActor.system.vision.front / 2));
        let leftSideBound	= (0 - (targetTokenActor.system.vision.side / 2));
        let rightSideBound	= (0 + (targetTokenActor.system.vision.side / 2));

        let facing;
        let position;

        // Determine which arc the attacker is standing in
        if (relativeAngle >= leftFrontBound && relativeAngle <= rightFrontBound){
            facing = 1; // Attacker is in the target's "front" vision arc
        }
        else if (relativeAngle >= leftSideBound && relativeAngle <= rightSideBound){
            facing = 0; // Attacker is in the target's "side" vision arc
        }
        else {
            facing = -1; // Attacker is in the target's "back" vision arc
        }

        let literalRear = game.settings.get("gurps4e", "literalRear");

        // Determine if the attacker is standing in front of or behind the target (In space, not relative to vision cones)
        if (((relativeAngle >= -90 && relativeAngle <= 90) && literalRear) || ((relativeAngle >= -120 && relativeAngle <= 120) && !literalRear)){
            position = 1; // Attacker is ahead of target in physical space
        }
        else {
            position = -1; // Attacker is behind target in physical space
        }

        return [facing,position]
    }

    // By this point we still only know the user's selected token, target token, and possibly some or all of the attack's name.
    // Using that we call the method to list all the attacks, at which point we either show a modal, or skip right to the specific attack they selected if the name was complete
    static singleTargetDialog(selfToken, targetToken, attackType, itemName, attackName){
        let attacks;
        // Check area logic first
        let targetTemplate;
        let areaTemplateType = "";
        if (typeof targetToken === "undefined" || targetToken === null) { // targetToken is undefined or null. Check to see if there's a valid target template
            let templates = selfToken.scene.templates; // All of the templates in the scene.
            let selection = canvas.tokens.controlled; // This is the currently selected actors.
            templates.forEach( template => { // Loop through the templates
                if (template.author.isSelf) { // If we created this template
                    if (template.fillColor.css === template.author.color.css && !template.hidden) { // If it's colour matches our colour, and the template is not hidden.
                        if (template.t === "circle" || template.t === "ray") { // We're only supporting rays and circles at the moment.
                            targetTemplate = template; // Store the target template
                        }
                    }
                }
            })
            if (typeof targetTemplate !== "undefined" && targetTemplate !== null) { // If we ended up with a target template
                targetTemplate.update({ borderColor: "#FF0000"}); // Update the colour of the template to communicate to the user that it's the one getting attacked
                areaTemplateType = targetTemplate.t; // Circle templates return 'circle' and beam templates return 'ray'
            }
            else { // We did not end up with a target template, and we already know we don't have a token.
                return this.noTargetsDialog(); // Load the noTarget dialog and return early.
            }
        }

        // Narrow displayed attacks by attack type, and if present, the areaTemplateType.
        if (attackType === "melee") {
            attacks = this.listAttacks(selfToken.actor, "melee", itemName, attackName, areaTemplateType);
        }
        else if (attackType === "range" || attackType === "ranged") {
            attacks = this.listAttacks(selfToken.actor, "ranged", itemName, attackName, areaTemplateType);
        }
        else if (attackType === "affliction") {
            attacks = this.listAttacks(selfToken.actor, "affliction", itemName, attackName, areaTemplateType);
        }
        else {
            attacks = this.listAttacks(selfToken.actor, "all", itemName, attackName, areaTemplateType);
        }

        // This block decides whether to skip the attack selection modal and go right to stabbin'
        let getToStabbin = false;
        if ((attacks.melee.length === 1 || attacks.ranged.length === 1 || attacks.affliction.length === 1) && typeof itemName !== "undefined" && typeof attackName !== "undefined") { // There is only one attack
            if (itemName.length > 0 && attackName.length > 0) { // And we're filtering on both the item name and the attack name
                getToStabbin = true;
            }
        }

        if (getToStabbin === true) { // If we're skipping the modal, go right to attackOnTarget
            if (attacks.melee.length === 1){
                this.determineAttackFormat(selfToken, attacks.melee[0], targetToken, targetTemplate)
            }
            else if (attacks.ranged.length === 1){
                this.determineAttackFormat(selfToken, attacks.ranged[0], targetToken, targetTemplate)
            }
            else if (attacks.affliction.length === 1){
                this.determineAttackFormat(selfToken, attacks.affliction[0], targetToken, targetTemplate)
            }
        }
        else { // If we're not skipping the modal, show it
            let htmlContent = "<div>";

            let buttons = {};

            if (attacks.melee.length > 0) {
                buttons.melee = {
                    icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M110.11 227.59c-6.25-6.25-16.38-6.25-22.63 0l-18.79 18.8a16.005 16.005 0 0 0-2 20.19l53.39 80.09-53.43 53.43-29.26-14.63a13.902 13.902 0 0 0-16.04 2.6L4.07 405.36c-5.42 5.43-5.42 14.22 0 19.64L87 507.93c5.42 5.42 14.22 5.42 19.64 0l17.29-17.29a13.873 13.873 0 0 0 2.6-16.03l-14.63-29.26 53.43-53.43 80.09 53.39c6.35 4.23 14.8 3.39 20.19-2l18.8-18.79c6.25-6.25 6.25-16.38 0-22.63l-174.3-174.3zM493.73.16L400 16 171.89 244.11l96 96L496 112l15.83-93.73c1.51-10.56-7.54-19.61-18.1-18.11z" class=""></path></svg>',
                    label: "Select Melee",
                    callback: () => {
                        let elements = document.getElementsByName('melee');
                        let attack;

                        for (let e = 0; e < elements.length; e++){
                            if(elements[e].checked){
                                attack = e;
                            }
                        }
                        if (typeof attack !== "undefined") {
                            this.determineAttackFormat(selfToken, attacks.melee[attack], targetToken, targetTemplate)
                        }
                    }
                }
                htmlContent += "<table>";

                htmlContent += "<tr><td colspan='9' class='trait-category-header' style='text-align: center;'>Melee Attacks</td></tr>";
                htmlContent += "<tr><td></td><td>Weapon</td><td>Attack</td><td>Level</td><td>Damage</td><td>Reach</td><td>Area</td><td>Parry</td><td>ST</td></tr>";

                for (let x = 0; x < attacks.melee.length; x++){
                    htmlContent += "<tr>";
                    if (x == 0) {
                        htmlContent += "<td><input checked type='radio' id='melee" + x + "' name='melee' value='" + x + "'></td>";
                    }
                    else {
                        htmlContent += "<td><input type='radio' id='melee" + x + "' name='melee' value='" + x + "'></td>";
                    }
                    htmlContent += "<td>" + attacks.melee[x].weapon + "</td>";
                    htmlContent += "<td>" + attacks.melee[x].name + "</td>";
                    htmlContent += "<td>" + attacks.melee[x].level + "</td>";

                    if(attacks.melee[x].armourDivisor === 1){ // Only show armour divisor if it's something other than 1
                        htmlContent += "<td>" + attacks.melee[x].damage + " " + attacks.melee[x].damageType + "</td>";
                    }
                    else {
                        htmlContent += "<td>" + attacks.melee[x].damage + " " + attacks.melee[x].damageType + " " + "(" + attacks.melee[x].armourDivisor + ")</td>";
                    }

                    htmlContent += "<td>" + attacks.melee[x].reach + "</td>";
                    htmlContent += "<td>" + macroHelpers.capitalizeFirst(attacks.melee[x].area) + (attacks.melee[x].area === "area" ? (" " + attacks.melee[x].areaRadius) : "") + (attacks.melee[x].area === "ex" ? (" " + attacks.melee[x].exDivisor) : "") + "</td>";
                    htmlContent += "<td>" + attacks.melee[x].parry + attacks.melee[x].parryType + "</td>";
                    htmlContent += "<td>" + attacks.melee[x].st + "</td>";
                    htmlContent += "</tr>";
                }

                htmlContent += "</table>";
            }

            if (attacks.ranged.length > 0){
                buttons.ranged = {
                    icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M145.78 287.03l45.26-45.25-90.58-90.58C128.24 136.08 159.49 128 192 128c32.03 0 62.86 7.79 90.33 22.47l46.61-46.61C288.35 78.03 241.3 64 192 64c-49.78 0-97.29 14.27-138.16 40.59l-3.9-3.9c-6.25-6.25-16.38-6.25-22.63 0L4.69 123.31c-6.25 6.25-6.25 16.38 0 22.63l141.09 141.09zm262.36-104.64L361.53 229c14.68 27.47 22.47 58.3 22.47 90.33 0 32.51-8.08 63.77-23.2 91.55l-90.58-90.58-45.26 45.26 141.76 141.76c6.25 6.25 16.38 6.25 22.63 0l22.63-22.63c6.25-6.25 6.25-16.38 0-22.63l-4.57-4.57C433.74 416.63 448 369.11 448 319.33c0-49.29-14.03-96.35-39.86-136.94zM493.22.31L364.63 26.03c-12.29 2.46-16.88 17.62-8.02 26.49l34.47 34.47-250.64 250.63-49.7-16.57a20.578 20.578 0 0 0-21.04 4.96L6.03 389.69c-10.8 10.8-6.46 29.2 8.04 34.04l55.66 18.55 18.55 55.65c4.83 14.5 23.23 18.84 34.04 8.04l63.67-63.67a20.56 20.56 0 0 0 4.97-21.04l-16.57-49.7 250.64-250.64 34.47 34.47c8.86 8.86 24.03 4.27 26.49-8.02l25.72-128.59C513.88 7.8 504.2-1.88 493.22.31z" class=""></path></svg>',
                    label: "Select Ranged",
                    callback: () => {
                        let elements = document.getElementsByName('range');
                        let attack;

                        for (let e = 0; e < elements.length; e++){
                            if(elements[e].checked){
                                attack = e;
                            }
                        }
                        if (typeof attack !== "undefined") {
                            this.determineAttackFormat(selfToken, attacks.ranged[attack], targetToken, targetTemplate)
                        }
                    }
                }
                htmlContent += "<table>";

                htmlContent += "<tr><td colspan='13' class='trait-category-header' style='text-align: center;'>Ranged Attacks</td></tr>";
                htmlContent += "<tr><td></td><td>Weapon</td><td>Attack</td><td>Level</td><td>Damage</td><td>Acc</td><td>Range</td><td>Area</td><td>RoF</td><td>Shots</td><td>ST</td><td>Bulk</td><td>Rcl</td></tr>";

                let distanceRaw;
                if (typeof targetToken === "undefined" || targetToken === null) {
                    distanceRaw = distanceHelpers.measureDistance(selfToken.center, targetTemplate, canvas.scene.grid.size / canvas.scene.grid.distance);
                }
                else {
                    distanceRaw = distanceHelpers.measureDistance(selfToken.center, targetToken.center, canvas.scene.grid.size / canvas.scene.grid.distance);
                }
                let distanceYards = distanceHelpers.convertToYards(distanceRaw, canvas.scene.grid.units);

                for (let q = 0; q < attacks.ranged.length; q++){
                    htmlContent += "<tr>";
                    if (q == 0) {
                        htmlContent += "<td><input checked type='radio' id='range" + q + "' name='range' value='" + q + "'></td>";
                    }
                    else {
                        htmlContent += "<td><input type='radio' id='range" + q + "' name='range' value='" + q + "'></td>";
                    }
                    htmlContent += "<td>" + attacks.ranged[q].weapon + "</td>";
                    htmlContent += "<td>" + attacks.ranged[q].name + "</td>";
                    htmlContent += "<td>" + attacks.ranged[q].level + "</td>";
                    if(attacks.ranged[q].armourDivisor === 1){ // Only show armour divisor if it's something other than 1
                        htmlContent += "<td>" + attacks.ranged[q].damage + " " + attacks.ranged[q].damageType + "</td>";
                    }
                    else {
                        htmlContent += "<td>" + attacks.ranged[q].damage + " " + attacks.ranged[q].damageType + " " + "(" + attacks.ranged[q].armourDivisor + ")</td>";
                    }
                    htmlContent += "<td>" + (attacks.ranged[q].acc ? attacks.ranged[q].acc : 0) + (attacks.ranged[q].scopeAcc ? "+" + attacks.ranged[q].scopeAcc : "") + "</td>";

                    if (distanceYards > attacks.ranged[q].maxRange && areaTemplateType !== "ray" && typeof targetToken !== "undefined") { // Target is beyond max range, and we're not firing at an existing beam template
                        htmlContent += "<td style='font-weight: bold; background-color: rgb(208, 127, 127)'>" + attackHelpers.formatRange(attacks.ranged[q].halfRange, attacks.ranged[q].maxRange) + "</td>";
                    }
                    else if (distanceYards > attacks.ranged[q].halfRange && areaTemplateType !== "ray" && typeof targetToken !== "undefined") { // Target is beyond half range, and we're not firing at an existing beam template
                        htmlContent += "<td style='font-weight: bold; background-color: rgb(213, 153, 102)'>" + attackHelpers.formatRange(attacks.ranged[q].halfRange, attacks.ranged[q].maxRange) + "</td>";
                    }
                    else { // Target is within half range
                        htmlContent += "<td>" + attackHelpers.formatRange(attacks.ranged[q].halfRange, attacks.ranged[q].maxRange) + "</td>";
                    }
                    htmlContent += "<td>" + macroHelpers.capitalizeFirst(attacks.ranged[q].area) + (attacks.ranged[q].area === "area" ? (" " + attacks.ranged[q].areaRadius) : "") + (attacks.ranged[q].area === "ex" ? (" " + attacks.ranged[q].exDivisor) : "") + "</td>";
                    htmlContent += "<td>" + attacks.ranged[q].rof + "</td>";
                    htmlContent += "<td>" + attacks.ranged[q].shots + "</td>";
                    htmlContent += "<td>" + attacks.ranged[q].st + "</td>";
                    htmlContent += "<td>" + attacks.ranged[q].bulk + "</td>";
                    htmlContent += "<td>" + (attacks.ranged[q].rcl ? attacks.ranged[q].rcl : 1) + "</td>";
                    htmlContent += "</tr>";
                }

                htmlContent += "</table>";
            }

            if (attacks.affliction.length > 0){
                buttons.affliction = {
                    icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z" class=""></path></svg>',
                    label: "Select Affliction",
                    callback: () => {
                        let elements = document.getElementsByName('affliction');
                        let attack;
                        for (let e = 0; e < elements.length; e++){
                            if(elements[e].checked){
                                attack = e;
                            }
                        }
                        if (typeof attack !== "undefined") {
                            this.determineAttackFormat(selfToken, attacks.affliction[attack], targetToken, targetTemplate)
                        }
                    }
                }
                htmlContent += "<table>";

                htmlContent += "<tr><td colspan='12' class='trait-category-header' style='text-align: center;'>Afflictions</td></tr>";
                htmlContent += "<tr><td></td><td>Affliction</td><td>Name</td><td>Level</td><td>Damage</td><td>Area</td><td>Resistance Roll</td><td>Rule Of</td></tr>";

                for (let q = 0; q < attacks.affliction.length; q++){
                    htmlContent += "<tr>";
                    if (q === 0) {
                        htmlContent += "<td><input checked type='radio' id='affliction" + q + "' name='affliction' value='" + q + "'></td>";
                    }
                    else {
                        htmlContent += "<td><input type='radio' id='affliction" + q + "' name='affliction' value='" + q + "'></td>";
                    }
                    htmlContent += "<td>" + attacks.affliction[q].weapon + "</td>";
                    htmlContent += "<td>" + attacks.affliction[q].name + "</td>";
                    htmlContent += "<td>" + attacks.affliction[q].level + "</td>";
                    if(attacks.affliction[q].armourDivisor === 1){ // Only show armour divisor if it's something other than 1
                        htmlContent += "<td>" + attacks.affliction[q].damage + " " + attacks.affliction[q].damageType + "</td>";
                    }
                    else {
                        htmlContent += "<td>" + attacks.affliction[q].damage + " " + attacks.affliction[q].damageType + " " + "(" + attacks.affliction[q].armourDivisor + ")</td>";
                    }
                    htmlContent += "<td>" + macroHelpers.capitalizeFirst(attacks.affliction[q].area) + (attacks.affliction[q].area === "area" ? (" " + attacks.affliction[q].areaRadius) : "") + (attacks.affliction[q].area === "ex" ? (" " + attacks.affliction[q].exDivisor) : "") + "</td>";
                    htmlContent += "<td>" + attacks.affliction[q].resistanceRoll + " " + attacks.affliction[q].resistanceRollPenalty + "</td>";
                    htmlContent += "<td>" + attacks.affliction[q].ruleOf + "</td>";
                    htmlContent += "</tr>";
                }

                htmlContent += "</table>";
            }

            buttons.cancel = {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
                callback: () => {}
            }

            htmlContent += "</div>";

            let singleTargetModal = new Dialog({
                title: "SHOW ME YOUR MOVES",
                content: htmlContent,
                buttons: buttons,
                default: "cancel",
                render: html => console.info("Register interactivity in the rendered dialog"),
                close: html => console.info("This always is logged no matter which option is chosen")
            },{
                resizable: true,
                width: "500"
            })

            singleTargetModal.render(true);
        }
    }

    static listAttacks(actor, attackType, itemName, attackName, areaTemplateType){
        // Narrow displayed attacks by attack type.
        let showMelee 		= true;
        let showRange 		= true;
        let showAffliction 	= true;

        if (attackType === "melee") {
            showRange 		= false;
            showAffliction 	= false;
        }
        else if (attackType === "range" || attackType === "ranged") {
            showMelee 		= false;
            showAffliction 	= false;
        }
        else if (attackType === "affliction") {
            showMelee 		= false;
            showRange 		= false;
        }

        // Decide if we are to filter by the name of the item
        let filterByName = false;
        if (typeof itemName !== "undefined"){
            if (itemName !== ""){
                filterByName = true;
            }
        }

        // Decide if we are to filter by the name of the attack
        let filterByAttackName = false;
        if (typeof attackName !== "undefined"){
            if (attackName !== ""){
                filterByAttackName = true;
            }
        }

        if (typeof areaTemplateType === "undefined" || areaTemplateType === null) { // Undefined check for the area template type
            areaTemplateType = ""; // Default to an empty string, which we do not filter on.
        }

        let meleeAttacks = [];
        let rangedAttacks = [];
        let afflictionAttacks = [];
        let melee;
        let ranged;
        let affliction;

        actor.items.forEach((item) => {
            // This if statement keeps out any attack entries we are not interested
            if (!((item.type === "Ritual" && item.system.quantity > 0) || // It's a ritual with a zero quantity, don't show it.
                (typeof item.system.equipStatus !== "undefined" && item.system.equipStatus !== "equipped"))){ // If it's part of an item that has an equipped status, but it's not equipped, don't show it.
                if (item.system.melee && showMelee) {
                    let meleeKeys = Object.keys(item.system.melee); // Collect all the melee keys
                    for (let m = 0; m < meleeKeys.length; m++){ // Loop through the melee keys
                        if (filterByName && typeof itemName !== "undefined") { // If we're filtering by item name, and there is a name to filter by
                            if (item.name.replace(/\s/g,'') === itemName.replace(/\s/g,'')) { // If the name matches
                                melee = foundry.utils.getProperty(item.system.melee, meleeKeys[m]);
                                if (filterByAttackName && typeof attackName !== "undefined") { // If we're also filtering by attack name, and there is a name to filter by
                                    if (melee.name.replace(/\s/g,'') === attackName.replace(/\s/g,'')) { // If the name matches
                                        melee.weapon = item.name;

                                        if (typeof melee.name === "string" && melee.name !== "") { // The name of the attack is a string, and that string is not empty.
                                            if ((areaTemplateType === "circle" && (melee.area === "area" || melee.area === "ex" || melee.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                                (areaTemplateType === "ray" && (melee.area === "beam")) || // The template type is ray and the area type is beam
                                            areaTemplateType === "") { // The template type is blank
                                                meleeAttacks.push(melee); // Add the attack
                                            }
                                        }
                                    }
                                }
                                else { // Otherwise just add the profile
                                    melee.weapon = item.name

                                    if (typeof melee.name === "string" && melee.name !== "") { // The name of the attack is a string, and that string is not empty.
                                        if ((areaTemplateType === "circle" && (melee.area === "area" || melee.area === "ex" || melee.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                            (areaTemplateType === "ray" && (melee.area === "beam")) || // The template type is ray and the area type is beam
                                            areaTemplateType === "") { // The template type is blank
                                            meleeAttacks.push(melee); // Add the attack
                                        }
                                    }
                                }
                            }
                        }
                        else { // Otherwise just add the profile
                            melee = foundry.utils.getProperty(item.system.melee, meleeKeys[m]);
                            melee.weapon = item.name

                            if (typeof melee.name === "string" && melee.name !== "") { // The name of the attack is a string, and that string is not empty.
                                if ((areaTemplateType === "circle" && (melee.area === "area" || melee.area === "ex" || melee.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                    (areaTemplateType === "ray" && (melee.area === "beam")) || // The template type is ray and the area type is beam
                                    areaTemplateType === "") { // The template type is blank
                                    meleeAttacks.push(melee); // Add the attack
                                }
                            }
                        }
                    }
                }

                if (item.system.ranged && showRange) {
                    let rangedKeys = Object.keys(item.system.ranged); // Collect all the ranged keys
                    for (let r = 0; r < rangedKeys.length; r++){
                        if (filterByName && typeof itemName !== "undefined") { // If we're filtering by name, and there is a name to filter by
                            if (item.name.replace(/\s/g,'') === itemName.replace(/\s/g,'')) { // If the name matches
                                ranged = foundry.utils.getProperty(item.system.ranged, rangedKeys[r]);
                                if (filterByAttackName && typeof attackName !== "undefined") { // If we're filtering by attack name, and there is a name to filter by
                                    if (ranged.name.replace(/\s/g,'') === attackName.replace(/\s/g,'')) { // If the name matches
                                        ranged.weapon = item.name

                                        if (typeof ranged.name === "string" && ranged.name !== "") { // The name of the attack is a string, and that string is not empty.
                                            if ((areaTemplateType === "circle" && (ranged.area === "area" || ranged.area === "ex" || ranged.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                                (areaTemplateType === "ray" && (ranged.area === "beam")) || // The template type is ray and the area type is beam
                                                areaTemplateType === "") { // The template type is blank
                                                rangedAttacks.push(ranged); // Add the attack
                                            }
                                        }
                                    }
                                }
                                else { // Otherwise just add the profile
                                    ranged.weapon = item.name

                                    if (typeof ranged.name === "string" && ranged.name !== "") { // The name of the attack is a string, and that string is not empty.
                                        if ((areaTemplateType === "circle" && (ranged.area === "area" || ranged.area === "ex" || ranged.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                            (areaTemplateType === "ray" && (ranged.area === "beam")) || // The template type is ray and the area type is beam
                                            areaTemplateType === "") { // The template type is blank
                                            rangedAttacks.push(ranged); // Add the attack
                                        }
                                    }
                                }
                            }
                        }
                        else { // Otherwise just add the profile
                            ranged = foundry.utils.getProperty(item.system.ranged, rangedKeys[r]);
                            ranged.weapon = item.name

                            if (typeof ranged.name === "string" && ranged.name !== "") { // The name of the attack is a string, and that string is not empty.
                                if ((areaTemplateType === "circle" && (ranged.area === "area" || ranged.area === "ex" || ranged.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                    (areaTemplateType === "ray" && (ranged.area === "beam")) || // The template type is ray and the area type is beam
                                    areaTemplateType === "") { // The template type is blank
                                    rangedAttacks.push(ranged); // Add the attack
                                }
                            }
                        }
                    }
                }

                if (item.system.affliction && showAffliction) {
                    let afflictionKeys = Object.keys(item.system.affliction); // Collect all the affliction keys
                    for (let a = 0; a < afflictionKeys.length; a++){
                        if (filterByName && typeof itemName !== "undefined") { // If we're filtering by name, and there is a name to filter by
                            if (item.name.replace(/\s/g,'') === itemName.replace(/\s/g,'')) { // If the name matches
                                affliction = foundry.utils.getProperty(item.system.affliction, afflictionKeys[a]);
                                if (filterByAttackName && typeof attackName !== "undefined") { // If we're filtering by attack name, and there is a name to filter by
                                    if (affliction.name.replace(/\s/g,'') === attackName.replace(/\s/g,'')) { // If the name matches
                                        affliction.weapon = item.name
                                        affliction.type = "affliction";

                                        if (typeof affliction.name === "string" && affliction.name !== "") { // The name of the attack is a string, and that string is not empty.
                                            if ((areaTemplateType === "circle" && (affliction.area === "area" || affliction.area === "ex" || affliction.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                                (areaTemplateType === "ray" && (affliction.area === "beam")) || // The template type is ray and the area type is beam
                                                areaTemplateType === "") { // The template type is blank
                                                afflictionAttacks.push(affliction); // Add the attack
                                            }
                                        }
                                    }
                                }
                                else { // Otherwise just add the profile
                                    affliction.weapon = item.name
                                    affliction.type = "affliction";

                                    if (typeof affliction.name === "string" && affliction.name !== "") { // The name of the attack is a string, and that string is not empty.
                                        if ((areaTemplateType === "circle" && (affliction.area === "area" || affliction.area === "ex" || affliction.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                            (areaTemplateType === "ray" && (affliction.area === "beam")) || // The template type is ray and the area type is beam
                                            areaTemplateType === "") { // The template type is blank
                                            afflictionAttacks.push(affliction); // Add the attack
                                        }
                                    }
                                }
                            }
                        }
                        else { // Otherwise just add the profile
                            affliction = foundry.utils.getProperty(item.system.affliction, afflictionKeys[a]);
                            affliction.weapon = item.name
                            affliction.type = "affliction";

                            if (typeof affliction.name === "string" && affliction.name !== "") { // The name of the attack is a string, and that string is not empty.
                                if ((areaTemplateType === "circle" && (affliction.area === "area" || affliction.area === "ex" || affliction.area === "frag")) || // The template type is circle, and the area type is area/ex/frag
                                    (areaTemplateType === "ray" && (affliction.area === "beam")) || // The template type is ray and the area type is beam
                                    areaTemplateType === "") { // The template type is blank
                                    afflictionAttacks.push(affliction); // Add the attack
                                }
                            }
                        }
                    }
                }
            }
        })

        return { "melee": meleeAttacks, "ranged": rangedAttacks, "affliction": afflictionAttacks}
    }

    // This method takes in an attacker, attack, target, and template (target and template are both optional)
    // If it's got a template, it runs the logic to attack a template.
    // If there is not a template, it checks whether that attack has the area property, it decides whether to call attackOnTarget or templateOnActor
    // Or afflictionOnTarget
    static determineAttackFormat(attacker, attack, target, template) {
        if (typeof template !== "undefined" && template !== null) { // We ended up with a target template
            this.correctTemplate(attacker, attack, template); // Attack an area
        }
        else if (typeof target !== "undefined" && target !== null) { // We ended up with a valid target and might be making an area attack against them
            if (typeof attack.area === "string" && attack.area !== "") { // Area is a string and not blank
                this.templateOnActor(attacker, attack, target); // Create a template on an actor
            }
            else { // It's not an area attack, attack normally.
                if (attack.type === "affliction") { // Afflictions have their own method
                    this.afflictionOnTarget(attacker, attack, target); // Run the normal affliction method
                }
                else { // Ranged and melee use the normal method
                    this.attackOnTarget(attacker, attack, target); // Run the normal attack method
                }
            }
        }
        else { // We ended up with neither a template nor token to attack
            return this.noTargetsDialog(); // Load the noTarget dialog and return early.
        }
    }

    static setTemplateDistance(attack) {
        let distance;
        if (attack.area === "area") {
            distance = attack.areaRadius;  // TODO - Convert from range in yards to raw distance on the given grid.
        }
        else if (attack.area === "ex") {
            if (attack.exDivisor === 1) {
                distance = attack.dice * 6; // TODO - Convert from range in yards to raw distance on the given grid.
            }
            else if (attack.exDivisor === 2) {
                distance = attack.dice * 3; // TODO - Convert from range in yards to raw distance on the given grid.
            }
            else if (attack.exDivisor === 3) {
                distance = attack.dice * 2; // TODO - Convert from range in yards to raw distance on the given grid.
            }
        }
        else if (attack.area === "frag") {
            distance = attack.dice * 5; // TODO - Convert from range in yards to raw distance on the given grid.
        }
        else if (attack.area === "beam") { // If it's a template we render as a ray
            if (typeof attack.maxRange !== "undefined") { // We have a max range that is not infinity
                distance = attack.maxRange; // Use it for the template length
            }
        }
        return distance;
    }

    /**
     * This method takes an existing template, and adjusts it to match the attack profile being used against it.
     * @param attacker The token making the attack
     * @param attack
     * @param template
     */
    static async correctTemplate(attacker, attack, template) {
        let correctedDistance = distanceHelpers.numYardsToNumGridUnitOfMeasure(this.setTemplateDistance(attack), canvas.scene.grid.units);
        let correctedWidth;
        let rayPointOfAim;
        if (typeof correctedDistance !== "undefined" && correctedDistance !== null) {
            if (attack.area === "beam") { // We have a proper distance and it is a beam
                correctedWidth = distanceHelpers.numYardsToNumGridUnitOfMeasure(1, canvas.scene.grid.units);
                rayPointOfAim = this.getRayEndPoint({ x: template.x, y: template.y}, template.distance, template.direction);
                await template.update({ distance: correctedDistance, width: correctedWidth});
            }
            else { // We have a proper distance and it is not a beam
                await template.update({ distance: correctedDistance});
            }
        }
        else if (attack.area === "beam") { // We don't have a proper distance, but it is a beam
            correctedWidth = distanceHelpers.numYardsToNumGridUnitOfMeasure(1, canvas.scene.grid.units);
            await template.update({ width: correctedWidth});
        }

        this.attackOnArea(attacker, attack, undefined, template, rayPointOfAim); // Pass undefined for the target token so we know our point of aim is a template, not an actor.
    }

    // This method is used when someone is making an area attack targetted at a specific actor
    // It takes in an attacker, attack, and target.
    // It creates a template of the appropriate size and location
    // It then calls attackOnArea
    static async templateOnActor(attacker, attack, target) {
        let rayPointOfAim = {
            x: 0,
            y: 0
        }
        const templateData = { // Init the template with the colours we are planning to use.
            fillColor: "#FF0102", // Don't use a perfect shade of red to try to avoid collisions with players who've selected red for their own colour.
            borderColor: "#FFFFFF"
        }

        if (attack.area === "area" || attack.area === "ex" || attack.area === "frag") { // If it's a template we render as a circle
            templateData.t = "circle";
            templateData.x = target.center.x;
            templateData.y = target.center.y;
            templateData.distance = this.setTemplateDistance(attack)
        }
        else if (attack.area === "beam") { // If it's a template we render as a ray
            templateData.t = "ray";
            templateData.direction = distanceHelpers.getAngleFromAtoB(attacker.center, target.center) // Get the angle to the target and point the beam that way.
            // Rays give an origin, angle, and destination so we use the attacker as the origin, but move it a half grid unit in the direction of the target.
            templateData.x = attacker.center.x + ((canvas.scene.grid.size * 0.5) * Math.cos(templateData.direction * Math.PI / 180));
            templateData.y = attacker.center.y + ((canvas.scene.grid.size * 0.5) * Math.sin(templateData.direction * Math.PI / 180));
            templateData.width = distanceHelpers.numYardsToNumGridUnitOfMeasure(1, canvas.scene.grid.units);
            templateData.distance = this.setTemplateDistance(attack)

            let distanceRaw = distanceHelpers.measureDistance(attacker.center, target.center, canvas.scene.grid.size / canvas.scene.grid.distance);
            let distanceYards = distanceHelpers.convertToYards(distanceRaw, canvas.scene.grid.units);

            rayPointOfAim = {
                x: target.center.x,
                y: target.center.y
            }
        }
        else { // Shit's fucked up
            return this.noTargetsDialog(); // Load the noTarget dialog and return early.
        }

        // TODO Modify templateData.distance for the scene's grid unit and size.
        if (typeof templateData.distance === "undefined" || templateData.distance === null) { // The templateData.distance doesn't yet exist. Infer that it's a beam that wasn't given a max range.
            templateData.distance = distanceHelpers.measureDistance(attacker, target, canvas.scene.grid.size / canvas.scene.grid.distance); // If we don't have maxRange, just use the distance to the target.
        }
        else { // We have a templateData.distance, denominated in yards.
            templateData.distance = distanceHelpers.numYardsToNumGridUnitOfMeasure(templateData.distance, canvas.scene.grid.units); // Convert the figure in yards into a raw distance for the sheet
        }

        let template = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
        this.attackOnArea(attacker, attack, target, template[0], rayPointOfAim);
    }

    // This method is used when someone is making an attack targeted at a template
    // It takes in an attacker, attack, and token
    // It scatters the template and then creates a chat message allowing the GM or player to proceed with the generating of attacks and active defence macros for all the targets.
    // Also allows time to pass if the attack has some sort of fuze.
    static attackOnArea(attacker, attack, target, template, rayPointOfAim) {
        this.attackModifiers(target, attacker, attack, undefined, undefined, undefined, 0, rayPointOfAim, template)
    }

    static isTokenInCircleTemplate(token, circleTemplate) {
        return this.isTokenInCircle(token, circleTemplate.x, circleTemplate.y, circleTemplate.distance);
    }

    // This method takes in a token, the centre of a hypothetical circle, and the radius of that hypothetical circle
    // These circle values can be directly provided by a MeasuredTokenTemplate with the 'circle' type, as it denominates circles by their radius, not diameter.
    // All units should be numerical grid units (As in one square or hex, no matter how many units it represents, counts as 1).
    // It returns a bool
    static isTokenInCircle(token, circleCentreX, circleCentreY, circleRadius) {
        let rawDistance = distanceHelpers.measureDistance(token.center,{ x: circleCentreX, y: circleCentreY}, canvas.scene.grid.size / canvas.scene.grid.distance);
        return circleRadius >= rawDistance;
    }

    static isTokenInRayTemplate(token, rayTemplate) {
        return this.isTokenInRay(token, rayTemplate.x, rayTemplate.y, rayTemplate.width/2, rayTemplate.distance, rayTemplate.direction); // Pass half the width, as we are measuring to the centre line of the ray.
    }

    // This method takes in a token, and the details of a hypothetical ray
    // These circle values can be directly provided by a MeasuredTokenTemplate with the 'ray' type
    // All units should be raw grid units.
    // It returns a bool
    static isTokenInRay(token, rayOriginX, rayOriginY, rayWidth, rayLength, rayAngle) {
        let rayEnd = distanceHelpers.getRayEnd(rayOriginX, rayOriginY, rayLength, rayAngle, canvas.scene.grid.size)
        let rayDistanceObject = distanceHelpers.distanceFromBeamToPoint(token.center, rayOriginX, rayOriginY, rayEnd.x, rayEnd.y, canvas.scene.grid.size)
        let distanceFromRay = rayDistanceObject.distance;
        let targetAdjacent = rayDistanceObject.adjacent;

        return targetAdjacent && rayWidth >= distanceFromRay; // Target is adjacent to the array (Not ahead or behind) and within the width of the beam.
    }

    /**
     *
     * @param origin A Point { x: number, y: number} defining the origin of the ray
     * @param distance A number defining the distance to the end of the ray
     * @param direction The angle of the line
     *
     * @return destination A Point { x: number, y: number} defining the end of the ray
     */
    static getRayEndPoint(origin, distance, direction) {
        let destination = {
            x: 0,
            y: 0
        }

        destination.x = Math.cos(direction * Math.PI/180) * distance + origin.x
        destination.y = Math.sin(direction * Math.PI/180) * distance + origin.y

        return destination
    }


    static getScatteredPoint(origin, distance, direction) {
        let scatterDistance = distanceHelpers.yardsToGridSpaces(Math.abs(distance));
        let scatterResult = canvas.grid.getTranslatedPoint(origin, direction, scatterDistance)
        return scatterResult;
    }

    // Part of the attack macro flow
    // This is the first step in the process where we know the attacker's token, the target token, and the full details of the attack being made.
    static attackOnTarget(attacker, attack, target) {
        if (typeof attack.area === "string" && attack.area !== "") { // Attack.area is a string and not blank
            console.log("This is an area attack of type " + attack.area); // This is an area attack of some kind
        }

        let bodyParts = Object.keys(target.actor.system.bodyType.body); // Collect all the bodypart names
        let relativePosition = this.getFacing(attacker, target); // Method returns [facing,position]

        let locationSelector = "<table>" +
            "<tr><td>Location</td><td><select name='hitLocation' id='hitLocation'>"
        for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
            let part = foundry.utils.getProperty(target.actor.system.bodyType.body, bodyParts[i])
            let penalty;
            if (relativePosition[1] > 0){ // If the attacker is in front of the target
                penalty = part.penaltyFront;
            }
            else {
                penalty = part.penaltyBack;
            }
            locationSelector += "<option value='" + bodyParts[i] + "'>" + part.label + ": " + penalty + "</option>"
        }

        locationSelector += "</select></td></tr>"

        let split;
        let rof = {
            shots: 1,
            pellets: 1,
            rof: 1
        }
        if (attack.type === "ranged") { // For ranged attacks, handle RoF related stuff
            if (attack.rof.toString().toLowerCase().includes("x")){
                split = attack.rof.toString().toLowerCase().split("x")
                rof.shots = Math.max(split[0], 1);
                rof.pellets = Math.max(split[1], 1);
            }
            else if (attack.rof.toString().toLowerCase().includes("*")){
                split = attack.rof.toString().toLowerCase().split("*")
                rof.shots = Math.max(split[0], 1);
                rof.pellets = Math.max(split[1], 1);
            }
            else if (typeof attack.rof === "number"){
                rof.shots = Math.max(attack.rof, 1);
                rof.pellets = 1;
            }
            else {
                rof.shots = Math.max(attack.rof.trim(), 1);
                rof.pellets = 1;
            }

            locationSelector += "<tr><td>Shots:</td><td><input style='width: 45%' type='number' id='rof' name='rof' value='" + rof.shots + "'/></td></tr>" +
                "<tr><td>Pellets per shot</td><td>" + rof.pellets + "</td></tr>" +
                "</table>";
        }

        // Open dialog to choose hit location, random swing, or random torso
        let hitLocationModal = new Dialog({
            title: "Select Location",
            content: locationSelector,
            buttons: {
                randLocation: {
                    icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"></path></svg>',
                    label: "Random Hit Location",
                    callback: () => {
                        // The user has not chosen to target a specific location. Find the result randomly.
                        let rofInput = document.getElementsByName('rof');
                        if(rofInput[0]){
                            rof.shots = Math.min(rofInput[0].value, rof.shots)
                            rof.rof = rof.shots * rof.pellets;
                            this.selectedRandom(target, attacker, attack, relativePosition, rof)
                        }
                        else {
                            this.selectedRandom(target, attacker, attack, relativePosition, rof)
                        }
                    }
                },
                randTorso: {
                    icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
                    label: "Select Torso",
                    callback: () => {
                        // The user has selected the torso without specifying upper/lower. Find the result randomly.
                        let rofInput = document.getElementsByName('rof');
                        if(rofInput[0]){
                            rof.shots = Math.min(rofInput[0].value, rof.shots)
                            rof.rof = rof.shots * rof.pellets;
                            this.selectedTorso(target, attacker, attack, relativePosition, rof)
                        }
                        else {
                            this.selectedTorso(target, attacker, attack, relativePosition,  rof)
                        }
                    }
                },
                hitLocation: {
                    icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
                    label: "Select Hit Location",
                    callback: () => {
                        // The user has selected a hit location without specifying sub location. Choose the sub location randomly.
                        let elements = document.getElementsByName('hitLocation');
                        if(elements[0].value){
                            let rofInput = document.getElementsByName('rof');
                            if(rofInput[0]){
                                rof.shots = Math.min(rofInput[0].value, rof.shots)
                                rof.rof = rof.shots * rof.pellets;
                                this.selectedHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
                            }
                            else {
                                this.selectedHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
                            }

                        }
                    }
                },
                hitSubLocation: {
                    icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
                    label: "Select Complex Hit Location",
                    callback: () => {
                        // The user has selected a hit location and specified they wish to target a sub location. Open another dialog to find what specific location.
                        let elements = document.getElementsByName('hitLocation');
                        if(elements[0].value){
                            let rofInput = document.getElementsByName('rof');
                            if(rofInput[0]){
                                rof.shots = Math.min(rofInput[0].value, rof.shots)
                                rof.rof = rof.shots * rof.pellets;
                                this.selectedComplexHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
                            }
                            else {
                                this.selectedComplexHitLocation(target, attacker, attack, elements[0].value, relativePosition, rof)
                            }

                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                }
            },
            default: "randTorso",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        },{
            resizable: true,
            width: "500"
        })

        hitLocationModal.render(true);
    }

    static afflictionOnTarget(attacker, attack, target) {
        let staffLength = game.scenes.get(target.scene.id).tokens.get(attacker.id).actor.system.magic.staff; // Get the length of the player's staff

        // If it's not a number, or it is a NaN
        if (typeof staffLength !== "number" || staffLength.isNaN) {
            staffLength = 0;
        }

        let distanceRaw = Math.round(canvas.grid.measurePath([attacker, target]).distance); // Get the raw distance between target and attacker
        let distanceYards = distanceHelpers.convertToYards(distanceRaw, canvas.scene.grid.units); // Convert the raw distance to the distance in yards

        let modifiedDistanceYards = Math.max(distanceYards - staffLength, 0); // Reduce the distance in yards by the length of the staff
        let distancePenalty = 0;

        if (attack.rangePenalties == "regular") {
            distancePenalty = -modifiedDistanceYards; // Regular range penalty is just the distance in yards
        }
        else if (attack.rangePenalties == "ssrt") {
            distancePenalty = distanceHelpers.distancePenalty(modifiedDistanceYards); // Call the distance helper to get the ssrt range penalty
        }
        else if (attack.rangePenalties == "long") {
            distancePenalty = distanceHelpers.longDistancePenalty(modifiedDistanceYards); // Call the distance helper to get the long range penalty
        }
        else if (attack.rangePenalties == "none") {
            distancePenalty = 0;
        }
        else {
            distancePenalty = -modifiedDistanceYards; // If they don't make a selection, assume regular spell penalties
        }

        let totalModifier = distancePenalty;

        let modModalContent =  "<table>";
        modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td></tr>"; // Display the distance penalty

        let odds = rollHelpers.levelToOdds(+attack.level + +totalModifier)

        modModalContent += "<tr><td>Total Modifier</td><td>" + totalModifier + "</td></tr>" +
            "<tr><td>Effective Skill</td><td>" + (+attack.level + +totalModifier) + "</td></tr>" +
            "<tr><td>Odds</td><td><span style='font-weight: bold; color: rgb(208, 127, 127)'>" + odds.critFail + "%</span>/<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + odds.success + "%</span>/<span style='font-weight: bold; color: rgb(106, 162, 106)'>" + odds.critSuccess + "%</span></td></tr>" +
            "<tr><td>Additional Modifier</td><td><input type='number' id='mod' name='mod' value='0' style='width: 50%'/></td></tr>" +
            "</table>";

        let modModal = new Dialog({
            title: "Modifier Dialog",
            content: modModalContent,
            buttons: {
                mod: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Apply Modifier",
                    callback: (html) => {
                        let mod = html.find('#mod').val();
                        this.reportAfflictionResult(target, attacker, attack, (+totalModifier + +mod))
                    }
                },
                noMod: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No Modifier",
                    callback: () => {
                        this.reportAfflictionResult(target, attacker, attack, totalModifier)
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {

                    }
                }
            },
            default: "mod",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        })
        modModal.render(true)
    }

    // This runs to calculate and display the result of an attacker attempting to cast an affliction.
    // On success it provides buttons for the defender to choose from
    // On a failure it simply reports failure
    static reportAfflictionResult(target, attacker, attack, totalModifiers) {
        let label = attacker.name + " casts " + attack.weapon + " " + attack.name + " on " + target.name + "."; // Label for the roll

        rollHelpers.skillRoll(attack.level, totalModifiers, label, false).then( rollInfo => { // Make the roll
            let messageContent = rollInfo.content; // Begin message content with the result from the skill roll
            let flags = {} // Init flags which will be used to pass data between chat messages

            if (rollInfo.success == false) { // If they failed, report failure and stop
                messageContent += attacker.name + "'s spell fails</br>";
            }
            else { // If they succeed
                messageContent += attacker.name + "'s spell succeeds</br>"; // Inform the players

                // Build the response options based on the resistance type of the attack
                if (attack.resistanceType == "contest") { // If they've selected quick contest, only show the quick contest and no defence buttons
                    messageContent += "</br><input type='button' class='quickContest' value='Quick Contest'/><input type='button' class='noResistanceRoll' value='No Defence'/>"
                }
                else if (attack.resistanceType == "resistance") { // If they've selected resistance, only show the resistance and no defence buttons
                    messageContent += "</br><input type='button' class='attemptResistanceRoll' value='Resistance Roll'/><input type='button' class='noResistanceRoll' value='No Defence'/>"
                }
                else if (attack.resistanceType == "irresistible") { // If they've selected irrisistable, only show the no defence button
                    messageContent += "</br><input type='button' class='noResistanceRoll' value='No Defence'/>"
                }
                else { // If they've not set a type, or if there's an issue, show all the buttons and let them pick.
                    messageContent += "</br><input type='button' class='quickContest' value='Quick Contest'/><input type='button' class='attemptResistanceRoll' value='Resistance Roll'/><input type='button' class='noResistanceRoll' value='No Defence'/>"
                }

                if (rollInfo.crit == true) { // If they crit, pass a note about the effect of crit success
                    messageContent += "<br><br><span style='font-style: italic;'>Important note, criticals have no impact on success/failure of quick contests beyond resulting in a very good or very bad margin of success.<br>" +
                        "They also don't generally impact whether or not someone gets a resistance roll.</span>";
                }

                flags = { // Compile flags that will be passed along through the chat messages
                    target: target.id,
                    attacker: attacker.id,
                    scene: target.scene.id,
                    attack: attack,
                    margin: rollInfo.margin,
                    effectiveSkill: (+attack.level + +totalModifiers)
                }
            }
            // Everything is assembled, send the message
            ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type, flags: flags});
        })
    }

    static noResistanceRoll(event) {
        event.preventDefault();
        let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
        this.applyAffliction(flags);
    }

    static knockbackFallRoll(event, penalty) {
        event.preventDefault();
        let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
        let target = game.scenes.get(flags.scene).tokens.get(flags.target).actor; // Fetch the target using the appropriate methods

        let judo = skillHelpers.getSkillLevelByName("Judo", target);
        let acro = skillHelpers.getSkillLevelByName("Acrobatics", target);
        let dx = skillHelpers.getBaseAttrValue("dx", target);

        judo = typeof judo !== 'undefined' ? judo : 0
        acro = typeof acro !== 'undefined' ? acro : 0
        dx = typeof dx !== 'undefined' ? dx : 0

        let skill = 10;
        let message = "";

        if (judo > acro && judo > dx) { // Judo is highest
            skill = judo;
            message = "Judo";
        } else if (acro > dx) { // Acro is highest
            skill = acro;
            message = "Acrobatics";
        } else { // DX is highest
            skill = dx;
            message = "Dexterity";
        }



        let modModal = new Dialog({
            title: "Modifier Dialog",
            content: "<input type='text' id='mod' name='mod' value='0'/>",
            buttons: {
                mod: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Apply Modifier",
                    callback: (html) => {
                        let mod = html.find('#mod').val()
                        this.makeKnockbackRoll(skill, mod - penalty, message, target, flags.target)
                    }
                },
                noMod: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No Modifier",
                    callback: () => this.makeKnockbackRoll(skill, 0 - penalty, message, target, flags.target)
                }
            },
            default: "mod",
            render: html => console.log("Register interactivity in the rendered dialog"),
            close: html => console.log("This always is logged no matter which option is chosen")
        })
        modModal.render(true)
    }

    static async makeKnockbackRoll(skill, mod, message, target, tokenId) {
        let currentRoll = await rollHelpers.skillRoll(skill, mod, "Rolls against " + message + " to not fall down.", false);

        let html = currentRoll.content;

        if (currentRoll.success) {
            html += "<br/>" + target.name + " doesn't fall down."
        }
        else {
            html += "<br/>" + target.name + " falls down."
        }

        ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_STYLES.OTHER });

        if (typeof target.token !== "undefined" && target.token !== null) { // A token is present if the token and actor are not directly linked. (As in, the token is a separate copy of the actor)
            postureHelpers.setPostureTokenDoc(target.token, "lyingback");
        }
        else { // The token is directly linked to the actor, meaning the token on the scene is a direct representation of that specific actor
            postureHelpers.setPostureActor(target, "lyingback", tokenId);
        }
    }

    // This is run when a defender clicks the "Quick Contest" button after being the target of an affliction
    static quickContest(event) {
        let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags; // Get the flags which hold all the actual data
        let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor; // Fetch the target using the appropriate methods
        let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;// Fetch the attacker using the appropriate methods
        let attack 			= flags.attack; // Fetch the attack from the flags

        // Build the message displayed on the dialog asking the user for any modifiers
        let modModalContent = "<div>" + attacker.name + " is casting " + attack.weapon + " " + attack.name + " on you.</div>";

        if (attack.resistanceRollPenalty > 0) {
            modModalContent += "<div>" + "It is a quick contest of " + attack.resistanceRoll + " + " + attack.resistanceRollPenalty + " </div>";
        }
        else if (attack.resistanceRollPenalty < 0) {
            modModalContent += "<div>" + "It is a quick contest of " + attack.resistanceRoll + " - " + attack.resistanceRollPenalty + " </div>";
        }
        else {
            modModalContent += "<div>" + "It is a quick contest of " + attack.resistanceRoll + " </div>";
        }
        modModalContent += "<div>Modifier: <input type='number' placeholder='Modifier' id='mod' name='mod' value='0' style='width: 50%'/></div>";

        // Build the dialog itself
        let modModal = new Dialog({
            title: "Modifier Dialog",
            content: modModalContent,
            buttons: {
                mod: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Apply Modifier",
                    callback: (html) => {
                        let mod = html.find('#mod').val(); // Get the modifier from the input field
                        this.reportQuickContestResult(target, attacker, attack, flags, +mod)
                    }
                },
                noMod: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No Modifier",
                    callback: () => {
                        this.reportQuickContestResult(target, attacker, attack, flags, 0)
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {} // Do nothing
                }
            },
            default: "mod",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        })
        modModal.render(true);
    }

    // This method takes the modifier from the defender and uses it to determine the results of the quick contest
    static reportQuickContestResult(target, attacker, attack, flags, mod) {
        let label = target.name + " attempts to resist the " + attack.weapon + " " + attack.name + " cast by " + attacker.name + "."; // Setup the label that heads the chat message
        let resistanceLevel = +actorHelpers.fetchStat(target, attack.resistanceRoll); // Fetch the resistance level based on the attack's target attribute
        let effectiveResistanceLevel = resistanceLevel + +mod + +attack.resistanceRollPenalty; // Figure out the effective level based on the above, the modifier from the attack, and the modifier provided by the user
        let margin = flags.margin; // Get the margin from the flags
        let effectiveSkill = flags.effectiveSkill;

        let ruleOfLimiter = Math.max(+attack.ruleOf, +effectiveResistanceLevel) // Limiter is the higher of Rule of 16/13/X and the target's resistance roll.

        if (margin >= 0) { // If it was a success, check for Rule of 16/13/X
            if (effectiveSkill > ruleOfLimiter) { // The attacker's skill was higher than Rule of 16/13/X, correct for that.
                margin = margin - (effectiveSkill - ruleOfLimiter); // Subtract the difference between the skill level and Rule Of from the margin of success to determine the effective margin
                margin = Math.max(margin, 0); // Even if rule of 16/13/X drops it down, the effective margin will always be at least zero
            }
        }

        rollHelpers.skillRoll(resistanceLevel, (+mod + +attack.resistanceRollPenalty), label, false).then( rollInfo => { // Make the defender's roll
            let messageContent = rollInfo.content; // Start the message with the string returned by the skillRoll helper
            messageContent += "<br>"
            messageContent += attacker.name + " has an effective margin of success of <span style='font-weight: bold'>" + margin + "</span> after modifiers and the Rule of <span style='font-weight: bold'>" + attack.ruleOf + "</span><br><br>"; // Inform the user of the attacker's effective margin of success and mention the Rule of X

            if (rollInfo.success == false) { // Target failed the roll entirely
                messageContent += "<span style='font-weight: bold; color: rgb(199, 137, 83);'>" + target.name + " fails to resist</span></br>"; // Tell everyone
                this.applyAffliction(flags); // Call the method that applies the affliction effects
            }
            else if (rollInfo.margin < margin) { // Target succeeded, but by less than the attacker did
                messageContent += "<span style='font-weight: bold; color: rgb(199, 137, 83)'>" + target.name + " succeeds by <span style='font-weight: bold'>" + rollInfo.margin + "</span> but fails to resist</span></br>"; // Tell everyone
                this.applyAffliction(flags); // Call the method that applies the affliction effects
            }
            else if (rollInfo.margin >= margin) { // Target succeeded, tieing or beating the attacker
                messageContent +=  "<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + target.name + " succeeds by <span style='font-weight: bold'>" + rollInfo.margin + "</span> and resists successfully</span></br>"; // Tell everyone
            }
            else { // None of the above caught the result
                messageContent += "Some weird shit has happened.</br>" + // Let the users know that some weird shit has happened but nothing has changed on the target of the affliction
                    "No effects or damage will apply.</br>" +
                    "The data has been printed to the log.</br>"
                console.error(target, attacker, attack, flags, mod, resistanceLevel, effectiveResistanceLevel, margin, ruleOfLimiter) // Print the error to console
            }

            if (rollInfo.crit == true) { // The result was a crit, which doesn't actually do anything in quick contests
                messageContent += "<span style='font-style: italic;'>Important note, criticals have no impact on success/failure of quick contests beyond resulting in a very good or very bad margin of success.</span>"; // Inform the players of this fact
            }

            ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type}); // Send the actual message
        });
    }

    // This is run when a defender clicks the "Quick Contest" button after being the target of an affliction
    static attemptResistanceRoll(event) {
        let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags; // Get the flags which hold all the actual data
        let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor; // Fetch the target using the appropriate methods
        let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;// Fetch the attacker using the appropriate methods
        let attack 			= flags.attack; // Fetch the attack from the flags

        // Build the message displayed on the dialog asking the user for any modifiers
        let modModalContent = "<div>" + attacker.name + " is casting " + attack.weapon + " " + attack.name + " on you.</div>";

        if (attack.resistanceRollPenalty > 0) {
            modModalContent += "<div>" + "You are resisting with " + attack.resistanceRoll + " + " + attack.resistanceRollPenalty + " </div>";
        }
        else if (attack.resistanceRollPenalty < 0) {
            modModalContent += "<div>" + "You are resisting with " + attack.resistanceRoll + " - " + attack.resistanceRollPenalty + " </div>";
        }
        else {
            modModalContent += "<div>" + "You are resisting with " + attack.resistanceRoll + " </div>";
        }

        modModalContent += "<div>Modifier: <input type='number' placeholder='Modifier' id='mod' name='mod' value='0' style='width: 50%'/></div>";

        // Build the dialog itself
        let modModal = new Dialog({
            title: "Modifier Dialog",
            content: modModalContent,
            buttons: {
                mod: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Apply Modifier",
                    callback: (html) => {
                        let mod = html.find('#mod').val(); // Get the modifier from the input field
                        this.reportResistanceRollResult(target, attacker, attack, flags, +mod)
                    }
                },
                noMod: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No Modifier",
                    callback: () => {
                        this.reportResistanceRollResult(target, attacker, attack, flags, 0)
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {} // Do nothing
                }
            },
            default: "mod",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        })
        modModal.render(true);
    }

    // This method takes the modifier from the defender and uses it to determine the results of the resistance roll
    static reportResistanceRollResult(target, attacker, attack, flags, mod) {
        let label = target.name + " attempts to resist the " + attack.weapon + " " + attack.name + " cast by " + attacker.name + "."; // Setup the label that heads the chat message
        let resistanceLevel = +actorHelpers.fetchStat(target, attack.resistanceRoll); // Fetch the resistance level based on the attack's target attribute
        let effectiveResistanceLevel = resistanceLevel + +mod + +attack.resistanceRollPenalty; // Figure out the effective level based on the above, the modifier from the attack, and the modifier provided by the user

        rollHelpers.skillRoll(resistanceLevel, (+mod + +attack.resistanceRollPenalty), label, false).then( rollInfo => { // Make the defender's resistance roll
            let messageContent = rollInfo.content; // Start the message with the string returned by the skillRoll helper
            messageContent += "<br>"

            if (rollInfo.success == false) { // Target failed the roll
                messageContent += "<span style='font-weight: bold; color: rgb(199, 137, 83);'>" + target.name + " fails to resist</span></br>"; // Tell everyone
                this.applyAffliction(flags); // Call the method that applies the affliction effects
            }
            else if (rollInfo.success == true) { // Target succeeded
                messageContent += "<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + target.name + " resists</span></br>"; // Tell everyone
                this.applyAffliction(flags); // Call the method that applies the affliction effects
            }
            else { // None of the above caught the result
                messageContent += "Some weird shit has happened.</br>" + // Let the users know that some weird shit has happened but nothing has changed on the target of the affliction
                    "No effects or damage will apply.</br>" +
                    "The data has been printed to the log.</br>"
                console.error(target, attacker, attack, flags, mod, resistanceLevel, effectiveResistanceLevel, margin, ruleOfLimiter) // Print the error to console
            }

            ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type}); // Send the actual message
        });
    }

    static async applyAffliction(flags) {
        let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor;
        let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;
        let attack 			= flags.attack;

        if (attack.damage == 0 || attack.damage == "") {
            let html = "<div>Damage for " + attacker.name + "'s " + attack.weapon + " " + attack.name + " against " + target.name + "</div>";
            html += "<hr>" + attack.desc + "<br>"
            html += "<hr>";
            ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_STYLES.OTHER });
        }
        else {
            let locationsHit = ['upperChest.subLocation.chest'];
            await this.applyDamage(flags, locationsHit, attack.desc);
        }
    }

    static selectedRandom(target, attacker, attack, relativePosition, rof) { // Select random hit location
        let locations = [];
        for (let i = 0; i < rof.rof; i++){ // Find a different hit location for each shot
            let generalLocation = this.randomHitLocation(target, relativePosition) // Select a random location
            if (generalLocation.subLocation){ // Check to see if there are sub locations
                let specificLocation = this.randomComplexHitLocation(generalLocation, relativePosition); // Get the sub location
                locations[i] = specificLocation;
            }
            else {
                locations[i] = generalLocation;
            }
        }

        this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, 0) // There is no hit location penalty since they're going with a random location
    }

    static selectedTorso(target, attacker, attack, relativePosition, rof) { // Select random location on torso (Chest/Abdomen)
        let locations = [];
        for (let i = 0; i < rof.rof; i++){ // Find a different hit location for each shot
            let generalLocation = this.randomTorsoLocation(target); // Generate a random location from the list of torso locations
            if (generalLocation.subLocation){ // Check to see if there are sub locations
                let specificLocation = this.randomComplexHitLocation(generalLocation, relativePosition); // Get the sub location
                locations[i] = specificLocation;
            }
            else {
                locations[i] = generalLocation;
            }
        }

        this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, 0) // There is no hit location penalty since they're going for the torso
    }

    static selectedHitLocation(target, attacker, attack, locationHit, relativePosition, rof) { // Select specific hit location and then generate a random complex hit location
        let locations = [];
        let penalty;
        for (let i = 0; i < rof.rof; i++) { // Find a different hit location for each shot
            let generalLocation = foundry.utils.getProperty(target.actor.system.bodyType.body, locationHit); // Get specific hit location

            if (generalLocation.subLocation){ // Check to see if there are sub locations
                let specificLocation = this.randomComplexHitLocation(generalLocation, relativePosition); // Get the sub location
                locations[i] = specificLocation;
            }
            else {
                locations[i] = generalLocation;
            }

            if (relativePosition[1] > 0){ // If the attacker is in front of the target
                penalty = generalLocation.penaltyFront; // The penalty comes from the general location since that's what they selected
            }
            else {
                penalty = generalLocation.penaltyBack;
            }
        }

        this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, penalty)
    }

    static selectedComplexHitLocation(target, attacker, attack, locationHit, relativePosition, rof) { // Select specific hit location and then the complex hit location by openning a new dialog to specify sub location
        let location = foundry.utils.getProperty(target.actor.system.bodyType.body, locationHit)

        if (location.subLocation){ // Make sure there are even complex hit locations to choose
            let bodyParts = Object.keys(foundry.utils.getProperty(target.actor.system.bodyType.body, locationHit + ".subLocation")); // Collect all the bodypart names

            let complexLocationSelector = ""
            complexLocationSelector += "<select name='complexHitLocation' id='complexHitLocation'>"
            for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
                let part = foundry.utils.getProperty(target.actor.system.bodyType.body, locationHit + ".subLocation." + bodyParts[i])

                let penalty;
                if (relativePosition[1] > 0){ // If the attacker is in front of the target
                    penalty = part.penaltyFront;
                }
                else {
                    penalty = part.penaltyBack;
                }

                complexLocationSelector += "<option value='" + locationHit + ".subLocation." + bodyParts[i] + "'>" + part.label + ": " + penalty + "</option>"
            }

            complexLocationSelector += "</select>"

            // Open dialog to choose specific complex hit location
            let complexHitLocationModal = new Dialog({
                title: "Select Specific Location",
                content: complexLocationSelector,
                buttons: {
                    hitLocation: {
                        icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>',
                        label: "Select Complex Hit Location",
                        callback: () => {
                            // The user has selected a hit location without specifying sub location. Choose the sub location randomly.
                            let elements = document.getElementsByName('complexHitLocation');
                            if(elements[0].value){
                                let location = foundry.utils.getProperty(target.actor.system.bodyType.body, elements[0].value)
                                let locations = [];
                                for (let i = 0; i < rof.rof; i++) {
                                    locations[i] = location;
                                }
                                let penalty;
                                if (relativePosition[1] > 0){ // If the attacker is in front of the target
                                    penalty = location.penaltyFront;
                                }
                                else {
                                    penalty = location.penaltyBack;
                                }
                                this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, penalty)
                            }
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => {

                        }
                    }
                },
                default: "randTorso",
                render: html => console.info("Register interactivity in the rendered dialog"),
                close: html => console.info("This always is logged no matter which option is chosen")
            },{
                resizable: true,
                width: "500"
            })

            complexHitLocationModal.render(true);
        }
        else { // If there are no sub locations proceed as normal
            let penalty;
            if (relativePosition[1] > 0){ // If the attacker is in front of the target
                penalty = location.penaltyFront;
            }
            else {
                penalty = location.penaltyBack;
            }
            let locations = [];
            for (let i = 0; i < rof.rof; i++) {
                locations[i] = location;
            }
            this.attackModifiers(target, attacker, attack, relativePosition, rof, locations, penalty)
        }
    }

    static randomHitLocation(target, relativePosition){
        let targetBody = target.actor.system.bodyType;
        let bodyParts = Object.keys(targetBody.body);

        let roll;
        if (relativePosition[1] == 1) { // If the target is facing the attacker
            roll = Math.random() * (targetBody.totalWeightFront - 0) + 0; // Roll a number between 0 and the target's total front weight.
        }
        else { // If the target is facing away from the attacker
            roll = Math.random() * (targetBody.totalWeightBack - 0) + 0; // Roll a number between 0 and the target's total back weight.
        }

        let part;

        let i = -1;
        do {
            i += 1; // Itterate the index
            part = foundry.utils.getProperty(targetBody.body, bodyParts[i]); // Get the part for the current index
            if (relativePosition[1] == 1) { // If the target is facing the attacker
                if (typeof part.weightFront !== "undefined") { // Make sure this entry is not undefined. If it is undefined we don't need to do anything.
                    roll -= part.weightFront; // Subtract its weight from the rolled weight
                }

            }
            else {
                if (typeof part.weightBack !== "undefined") { // Make sure this entry is not undefined. If it is undefined we don't need to do anything.
                    roll -= part.weightBack; // Subtract its weight from the rolled weight
                }
            }
        } while (roll > 0) // If the roll drops below zero, stop looping

        let location = part; // Whatever the last part we accessed is the 'rolled' part.

        return location;
    }

    static randomTorsoLocation(target){
        let targetBody = target.actor.system.bodyType;
        let bodyParts = Object.keys(targetBody.body);
        let torsoParts = [];

        for (let i = 0; i < bodyParts.length; i++){ // Loop through all the parts
            if (bodyParts[i].toLowerCase().includes("chest") || bodyParts[i].toLowerCase().includes("abdomen")){ // If it's part of the torso, add it to the array to be searched
                if (!(bodyParts[i] === "upperchest")) { // Hotfix for issue where upperchest would sometimes incorrectly get added as a body part
                    torsoParts.push(bodyParts[i])
                }
            }
        }

        let torsoPartsIndex = Math.floor(Math.random() * (torsoParts.length)); // Generate a random number between 0 and the max index

        return foundry.utils.getProperty(targetBody.body, torsoParts[torsoPartsIndex]);
    }

    static randomComplexHitLocation(generalLocation, relativePosition){
        let subLocations = Object.keys(generalLocation.subLocation);

        let roll;
        if (relativePosition[1] == 1) { // If the target is facing the attacker
            roll = Math.random() * (generalLocation.totalSubWeightFront - 0) + 0; // Roll a number between 0 and the target's total front weight.
        }
        else { // If the target is facing away from the attacker
            roll = Math.random() * (generalLocation.totalSubWeightBack - 0) + 0; // Roll a number between 0 and the target's total back weight.
        }

        let part;

        let i = -1;
        do {
            i += 1; // Itterate the index
            part = foundry.utils.getProperty(generalLocation.subLocation, subLocations[i]); // Get the part for the current index
            if (relativePosition[1] == 1) { // If the target is facing the attacker
                roll -= part.weightFront; // Subtract it's weight from the rolled weight
            }
            else {
                roll -= part.weightBack; // Subtract it's weight from the rolled weight
            }
        } while (roll > 0) // If the roll drops below zero, stop looping

        let subLocation = part; // Whatever the last part we accessed is the 'rolled' part.

        return subLocation;
    }

    static getSM(actor) {
        let sm = 0;
        if (actor) { // Make sure all the data is present
            if (actor.token){ // If this is a token
                if (actor.token.actor){ // Make sure the data structure exists
                    if (actor.token.actor.system){
                        if (actor.token.actor.system.bio){
                            if (actor.token.actor.system.bio.sm){
                                if (actor.token.actor.system.bio.sm.value){
                                    if (actor.token.actor.system.bio.sm.value == "" || actor.token.actor.system.bio.sm.value == null || typeof actor.token.actor.system.bio.sm.value == "undefined") { // SM is blank, null, or undefined
                                        sm = 0; // Default zero
                                    }
                                    else { // SM is not blank, null, or undefined
                                        sm = actor.token.actor.system.bio.sm.value; // Set SM equal to the actor's SM value
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else { // If this is not a token
                if (actor.system) { // Make sure the data structure exists
                    if (actor.system.bio) {
                        if (actor.system.bio.sm) {
                            if (actor.system.bio.sm.value) {
                                if (actor.system.bio.sm.value == "" || actor.system.bio.sm.value == null || typeof actor.system.bio.sm.value == "undefined") { // SM is blank, null, or undefined
                                    sm = 0; // Default zero
                                }
                                else { // SM is not blank, null, or undefined
                                    sm = actor.system.bio.sm.value; // Set SM equal to the actor's SM value
                                }
                            }
                        }
                    }
                }
            }
        }
        return sm; // Return 0 if the above does not retrieve a value
    }

    // This method handles all attack modifiers for both ranged and melee attacks
    static attackModifiers(target, attacker, attack, relativePosition, rof, location, locationPenalty, rayPointOfAim, template) {
        let distanceRaw;
        let areaAttack = false;

        if (typeof template === "undefined") { // We were not passed a template, this is a normal attack
            distanceRaw = distanceHelpers.measureDistance(attacker.center, target.center, canvas.scene.grid.size / canvas.scene.grid.distance);
        }
        else { // We were passed a template and are making an area attack
            areaAttack = true;
            if (template.t === "ray") { // It's a beam
                distanceRaw = distanceHelpers.measureDistance(attacker.center, rayPointOfAim, canvas.scene.grid.size / canvas.scene.grid.distance);
            }
            else { // It's a circle
                distanceRaw = distanceHelpers.measureDistance(attacker.center, template, canvas.scene.grid.size / canvas.scene.grid.distance);
            }
            // relativePosition, rof, location, and locationPenalty are all probably undefined at this point
        }

        let distanceYards = distanceHelpers.convertToYards(distanceRaw, canvas.scene.grid.units);
        let distancePenalty = distanceHelpers.distancePenalty(distanceYards);
        let rangeDamageMult = 1; // This is the multiplier used to assign effects from 1/2D and Max ranges, where applicable.

        let damageType = this.extractDamageType(attack);

        let rofBonus = generalHelpers.rofToBonus(rof ? rof.rof : 0);
        if (typeof rofBonus == "undefined" || areaAttack) { // RoF is sometimes coming through undefined. Catch that, and remove the RoF bonus, if any, from area attacks
            rofBonus = 0;
        }
        let totalModifier = 0;
        let sizeModModifier = 0;
        let smMessage = "";

        let modModalContent = "<table>";

        // Range specific logic (1/2D and Max)
        // We're doing it early so we can put it at the top of the modal
        let maxRange = Infinity;
        let halfRange = Infinity;
        if (attack.type === "ranged" && attack.area !== "beam") { // It's ranged, but not a beam type attack.

            // Check if max range is present
            if (typeof attack.maxRange !== "undefined") { // Max range is present
                maxRange = parseInt(attack.maxRange); // Convert max range to an int
                if (typeof maxRange !== "number" || Number.isNaN(maxRange)) { // If max range has the wrong type or it came through as NaN.
                    maxRange = Infinity; // Set it back to Infinity.
                }
            }

            // Check if half range is present
            if (typeof attack.halfRange !== "undefined") { // Half range is present
                halfRange = parseInt(attack.halfRange); // Convert half range to an int
                if (typeof halfRange !== "number" || Number.isNaN(halfRange) || halfRange > maxRange) { // If half range has the wrong type, it came through as NaN, or it's greater than max range.
                    halfRange = maxRange; // Set it to match maxRange
                }
            }

            if (maxRange < distanceYards) { // They are firing at a target beyond their attack's max range.
                rangeDamageMult = 0;
                modModalContent += "<tr><td colspan='3' style='background-color: rgba(255, 0, 0, 100); font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: white;'>WARNING: YOU ARE ATTEMPTING TO ATTACK A TARGET BEYOND YOUR ATTACK'S MAXIMUM RANGE OF " + maxRange + " YARDS.</td></tr>"; // Default string
            } else if (halfRange < distanceYards) { // They are firing at a target beyond their attack's half range.
                rangeDamageMult = 0.5;
                modModalContent += "<tr><td colspan='3' style='background-color: rgba(255, 255, 0, 100); font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: white;'>WARNING: Your target is beyond your attack's 1/2D range of " + halfRange + " yards. Damage will be halved, rounded down.</td></tr>"; // Default string
            }
        }

        // Homing specific logic
        if (typeof attack.flags !== "undefined") {
            if (attack.flags.toLowerCase().includes("hom") && attack.type === "ranged") { // If it's a homing weapon and ranged
                let homSkill = 10 + attack.acc + attack.scopeAcc;
                modModalContent += "<tr><td>Skill</td><td>" + homSkill + "</td><td>Homing weapons have a skill of 10 + Acc</td></tr>"; // Applies homing skill correctly
            }
            else { // If it's anything else
                modModalContent += "<tr><td>Skill</td><td>" + attack.skill + ": " + attack.level + "</td><td>Your base skill</td></tr>"; // Default string
            }
        }

        if (!areaAttack) {
            modModalContent += "<tr><td>Hit Location</td><td>" + locationPenalty + "</td><td>The penalty for the selected hit location.</td></tr>";
        }

        if (attack.type === "ranged") {
            // Sort out the effective SM modifier based on the game's settings and the attacker/target SM
            if (typeof target !== "undefined") {
                if (game.settings.get("gurps4e", "rangedRelativeSM")) { // Game is using relative SM rules for ranged attacks
                    sizeModModifier = this.getSM(target.actor) - this.getSM(attacker.actor);
                    smMessage = "The modifier for the relative size difference between target and attacker";
                }
                else {
                    sizeModModifier = this.getSM(target.actor);
                    smMessage = "The modifier for the target's size";
                }
            }

            // Display the ranged specific modifiers
            if (typeof attack.flags !== "undefined") {

                let staffLength = 0;

                if ((attack.flags.toLowerCase().includes("staff"))) { // If the flags include 'staff', apply the effect of the staff on the range penalty.
                    staffLength = game.scenes.get(attacker.scene.id).tokens.get(attacker.id).actor.system.magic.staff; // Get the length of the player's staff

                    if (typeof staffLength !== "number" || staffLength.isNaN) {// If it's not a number, or it is a NaN
                        staffLength = 0; // Set back to zero
                    }
                }

                if ((attack.flags.toLowerCase().includes("short"))) {
                    if (staffLength > 0) {
                        distancePenalty = distanceHelpers.shortDistancePenalty(Math.max(distanceYards - staffLength, 0)); // Subtract staff length from the distance penalty, but don't go into positive numbers
                        modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>The penalty for the given distance with Short Range Modifiers, while weilding a staff length " + staffLength + "</td></tr>";
                    }
                    else {
                        distancePenalty = distanceHelpers.shortDistancePenalty(distanceYards);
                        modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>The penalty for the given distance with Short Range Modifiers</td></tr>";
                    }
                }
                else if ((attack.flags.toLowerCase().includes("long"))) {
                    if (staffLength > 0) {
                        distancePenalty = distanceHelpers.longDistancePenalty(Math.max(distanceYards - staffLength, 0));
                        modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>The penalty for the given distance with Long Range Modifiers, while weilding a staff length " + staffLength + "</td></tr>";
                    }
                    else {
                        distancePenalty = distanceHelpers.longDistancePenalty(distanceYards);
                        modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>The penalty for the given distance with Long Range Modifiers</td></tr>";
                    }
                }
                else if (attack.flags.toLowerCase().includes("gui") || attack.flags.toLowerCase().includes("hom")) {
                    distancePenalty = 0;
                    modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>There is no distance penalty for guided and homing attacks</td></tr>";
                }
                else {
                    if (staffLength > 0) {
                        distancePenalty = distanceHelpers.distancePenalty(Math.max(distanceYards - staffLength, 0));
                        modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>The penalty for the given distance, while weilding a staff length " + staffLength + "</td></tr>";
                    }
                    else {
                        modModalContent += "<tr><td>Distance (" + (Math.round(distanceRaw * 10) / 10) + " " + canvas.scene.grid.units + ")</td><td>" + distancePenalty + "</td><td>The penalty for the given distance</td></tr>";
                    }
                }
            }

            totalModifier += distancePenalty; // Apply the distance penalty
            if (!areaAttack) { // Only non-area attacks get to rof modifiers
                totalModifier += rofBonus; // Total up the modifiers
                modModalContent += "<tr><td>RoF Bonus:</td><td>" + rofBonus + "</td><td>The bonus for the selected rate of fire</td></tr>";
            }

        }
        else if (attack.type === "melee") {
            // Sort out the effective SM modifier based on the game's settings and the attacker/target SM
            if (typeof target !== "undefined") {
                if (game.settings.get("gurps4e", "meleeRelativeSM")) { // Game is using relative SM rules for melee attacks
                    sizeModModifier = this.getSM(target.actor) - this.getSM(attacker.actor);
                    smMessage = "The modifier for the relative size difference between target and attacker";
                }
                else {
                    sizeModModifier = this.getSM(target.actor);
                    smMessage = "The modifier for the target's size";
                }
            }
        }

        let canTargetHex = (attack.type === "affliction" ? false : areaAttack); // Afflictions never get the +4 for targeting a hex. Otherwise just check to see if it's an area attack.
        // Correct for flags on the attack changing whether it can target the hex
        if ((typeof attack.flags !== "undefined" && attack.flags.toLowerCase().includes("ytargethex"))) { // It's been explicitly set to get the +4.
            canTargetHex = true;
        }
        else if ((typeof attack.flags !== "undefined" && attack.flags.toLowerCase().includes("ntargethex"))) { // It's been explicitly set to not get the +4.
            canTargetHex = false;
        }

        if (areaAttack && canTargetHex && typeof target !== "undefined") { // It's an area attack, but we still have a specific target. Let the player optionally target either the person or the hex.
            modModalContent += "<tr>" +
                "<td>Target The Hex (+4)</td><td><input type='checkbox' class='checkbox' id='targetHex' value='targetHex' name='contactEx' checked /></td><td>Decide if you are targeting the hex to claim a +4, or the actor to claim the " + (sizeModModifier > 0 ? ("+" + sizeModModifier) : sizeModModifier) + " for their SM.</td>" +
                "</tr>"
        }
        else if (areaAttack && canTargetHex) { // It's an area attack, but we have no single actor target.
            modModalContent += "<tr><td>Target The Hex (+4)</td><td><input type='checkbox' class='checkbox' id='targetHex' value='targetHex' name='contactEx' checked /></td><td>An area attack gets +4 for targeting a hex.</td></tr>";
        }
        else if (attack.type === "affliction") { // It's an affliction, there is no modifier for size.
            sizeModModifier = 0;
        }
        else { // It's not an area attack, provide the value for the target's SM.
            modModalContent += "<tr><td>SM Modifier:</td><td>" + sizeModModifier + "</td><td>" + smMessage + "</td></tr>";
        }

        // This block totals up modifiers which impact both melee and ranged attacks.

        if (areaAttack && canTargetHex) { // Area attacks don't get locations, rof, or size mods.
            totalModifier += 4; // Assume they are claiming the +4. We will remove it later if they uncheck the box.
        }
        else { // Only non-area attacks get to have location, rof, and size modifiers
            totalModifier += (locationPenalty + sizeModModifier); // Total up the modifiers
        }

        let oddsEffectiveSkill = +attack.level + +totalModifier

        if (typeof attack.flags !== "undefined") {
            if (attack.flags.toLowerCase().includes("hom") && attack.type === "ranged") { // If it's a homing weapon and ranged
                oddsEffectiveSkill = 10 + +attack.acc + +attack.scopeAcc + +totalModifier
            }
        }

        let odds = rollHelpers.levelToOdds(oddsEffectiveSkill)

        modModalContent += "<tr><td>Total Modifier</td><td>" + totalModifier + "</td><td>This total only includes modifiers listed above</td></tr>";
        modModalContent += "<tr><td>Effective Skill</td><td>" + oddsEffectiveSkill + "</td><td>Effective skill before any of the below modifiers</td></tr>";
        modModalContent += "<tr><td>Odds</td><td><span style='font-weight: bold; color: rgb(208, 127, 127)'>" + odds.critFail + "%</span>/<span style='font-weight: bold; color: rgb(141, 142, 222)'>" + odds.success + "%</span>/<span style='font-weight: bold; color: rgb(106, 162, 106)'>" + odds.critSuccess + "%</span></td><td>These odds do not factor in any of the below modifiers</td></tr>";

        if (attack.type === "ranged") {
            modModalContent += "<tr><td>Aiming seconds</td><td><input type='number' id='aimTime' name='aimTime' value='0' step='1' min='0' style='width: 50%'/></td><td>The amount of time spent aiming.</td></tr>";
            modModalContent += "<tr><td>Know exact range</td><td><input type='checkbox' class='checkbox' id='exactRange' value='exactRange' name='exactRange' /></td><td>You are using a range finder, have it targeted with a targeting sense, or the target is standing on a hex you have pre-ranged.</td></tr>";
            modModalContent += "<tr><td>Know very close range</td><td><input type='checkbox' class='checkbox' id='closeRange' value='closeRange' name='closeRange' /></td><td>The target is standing next to a landmark you have pre-ranged.</td></tr>";
        }
        else if (attack.type === "melee") {
            modModalContent += "<tr><td>Evaluate</td><td><input type='checkbox' class='checkbox' id='evaluate' value='evaluate' name='evaluate' /></td><td>You took an Evaluate maneuver immediately previous to this action.</td></tr>";
        }

        modModalContent += "<tr><td>Move and Attack</td><td><input type='checkbox' class='checkbox' id='moveAndAttack' value='moveAndAttack' name='moveAndAttack' /></td><td>This handles both melee and ranged move and attacks with their respective rules</td></tr>";

        modModalContent += "<tr><td>Additional Modifier</td><td><input type='number' id='mod' name='mod' value='0' style='width: 50%'/></td><td>This is a catchall for anything not included above</td></tr>" +
            "</table>"

        let buttons = {} // Init the buttons object

        if (rangeDamageMult !== 0) { // If we're not prevented from attacking due to being beyond max range
            buttons.mod = { // Add the button for an attack with a modifier
                icon: '<i class="fas fa-check"></i>',
                label: "Make Attack",
                callback: (html) => {
                    let mod = html.find('#mod').val();
                    let moveAndAttack = html.find('#moveAndAttack')[0].checked;
                    let aimTime = html.find('#aimTime') ? html.find('#aimTime').val() : undefined;
                    let evaluate = html.find('#evaluate')[0] ? html.find('#evaluate')[0].checked : undefined;
                    let exactRange = html.find('#exactRange')[0] ? html.find('#exactRange')[0].checked : undefined;
                    let closeRange = html.find('#closeRange')[0] ? html.find('#closeRange')[0].checked : undefined;
                    let targetHex = typeof html.find('#targetHex')[0] !== "undefined" ? html.find('#targetHex')[0].checked : ((typeof target === "undefined" && attack.type !== "affliction") ? true : false); // If the targetHex checkbox is present, use it to control the bool. If the checkbox isn't there, instead check to see if there was a target token in the first place and that it's not an affliction
                    this.reportHitResult(target, attacker, attack, relativePosition, rof, location, (+totalModifier + +mod), moveAndAttack, targetHex, aimTime, evaluate, exactRange, closeRange, rangeDamageMult, areaAttack, sizeModModifier, rayPointOfAim, template)
                }
            }
        }

        buttons.cancel = { // Always add the cancel button
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => {}
        }

        let modModal = new Dialog({
            title: "Attack Modifier Dialog",
            content: modModalContent,
            buttons: buttons,
            default: "mod",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        })
        modModal.render(true)
    }

    /**
     * @param target This is a token, or in the case of an area attack not directly involving a token, undefined.
     * @param attacker This is a token
     * @param attack This is an attack object
     * @param relativePosition This is a facing object
     * @param rof This is a rof object
     * @param locationArray is an array of all the locations hit
     * @param totalModifiers is a number
     * @param moveAndAttack is a bool, true when making a move and attack.
     * @param targetHex is a bool describing whether they are targetting the hex (true) or not (false)
     * @param aimTime is a number of seconds for which they are aiming.
     * @param evaluate is a bool tracking whether or not the attacker evaluated preceeding the attack
     * @param exactRange this is a bool tracking whether the attacker knows the exact range. This is what happens when an attacker is using a range finder, has it targeted with a targeting sense, or the target is standing on a hex they have pre-ranged.
     * @param closeRange this is a bool tracking whether the attacker knows the almost exact range. The target is standing next to a landmark you have pre-ranged.
     * @param rangeDamageMult this is a number which applies the half damage range multiplier
     * @param areaAttack this is a bool which is true when a template is involved.
     * @param sizeModModifier this is a number, only used to take back the +4 for targetting a hex in cases where we assumed they were but they opted not to.
     * @param rayPointOfAim this is a Point {x: number, y: number} only used when making beam/ray attacks and represents the actual point of aim, not the origin or end of the beam.
     * @param template This is a temple or undefined, depending on whether the attack is an area attack
     */
    static reportHitResult(target, attacker, attack, relativePosition, rof, locationArray, totalModifiers, moveAndAttack, targetHex, aimTime, evaluate, exactRange, closeRange, rangeDamageMult, areaAttack, sizeModModifier, rayPointOfAim, template) {
        // Begin label logic describing the attack
        let label = "";
        let templateLabel = "";

        if (typeof template !== "undefined") { // We were passed a template, it's an area attack
            templateLabel = "<span style='font-weight: bolder; color: " + template.fillColor.css + ";text-shadow: -1px -1px 0 " + template.borderColor.css + ", 1px -1px 0 " + template.borderColor.css + ", -1px 1px 0 " + template.borderColor.css + ", 1px 1px 0 " + template.borderColor.css + ";'>" + template.t + " template</span>"
            if (typeof target !== "undefined" && target.name) { // We have a target with a name
                if (targetHex) { // It's firing at the hex
                    label = attacker.name + " attacks the ground at " + target.name + "'s feet with a " + attack.weapon + " " + attack.name + " creating a " + templateLabel;
                }
                else { // It's directly targeting at the person
                    label = attacker.name + " attacks " + target.name + " with a " + attack.weapon + " " + attack.name + " creating a " + templateLabel;
                }
            }
            else { // We do not have a target with a name. The player is probably manually placing a template
                if (targetHex) { // It's firing at the hex
                    label = attacker.name + " uses their " + attack.weapon + " " + attack.name + " to strike the ground, manually targeting their " + templateLabel;
                }
                else { // It's not firing at the hex
                    label = attacker.name + " uses their " + attack.weapon + " " + attack.name + " to manually target their " + templateLabel;
                }
            }
        }
        else {
            label = attacker.name + " attacks " + target.name + " with a " + attack.weapon + " " + attack.name;
        }

        if (rangeDamageMult === 0.5 && attack.area !== "beam") { // If we're firing at 1/2D range, and it's not a beam (Which is handled separately)
            label += " at beyond 1/2D range" // Append a note to the label so it's clear to everyone that's what's happening.
        }
        // End label logic decribing the attack

        // Begin effective skill level logic
        let level = attack.level;

        // Homing specific logic
        if (typeof attack.flags !== "undefined") { // If there are flags
            if (attack.flags.toLowerCase().includes("hom") && attack.type === "ranged") { // If it's a homing weapon and ranged
                level = 10 + +attack.acc + +attack.scopeAcc; // Apply skill the way homing does it.
            }
        }

        let mod = totalModifiers;

        if (areaAttack && attack.type !== "affliction" && !targetHex) { // The actor is making an area attack, but not targeting the hex. Remove the -4 we granted earlier and replace it with the target's size modifier
            mod -= 4; // Remove +4
            mod += sizeModModifier; // Apply the size mod
        }

        if (attack.type === "ranged"){
            if (typeof rof === "undefined" || rof === null){ // Its rof object is undefined, it's probably an area attack.
                label += " and fires once";
                rof = { // Create a dummy rof object so undefined errors don't get thrown below.
                    shots: 1,
                    pellets: 1,
                    rof: 1
                }
            }
            else if (rof.shots === rof.rof){ // It is not a multiple projectile weapon
                label += " and fires " + this.numToWords(rof.shots);
            }
            else { // It is a multiple projectile weapon
                label += " and fires " + rof.shots + " times for " + rof.rof + " shots.";
            }

            // Handle move and attack for ranged
            if (moveAndAttack) {
                mod += +attack.bulk; // Add the bulk penalty to the total modifiers
            }

            mod += this.getAimingBonus(attack, aimTime, exactRange, closeRange) // Add the bonus from aiming, if any.
        }
        else if (attack.type === "melee") {
            label += ".";

            if (evaluate) {
                mod = +mod + 1; // Add the modifier for evaluating
            }

            // Handle move and attack for melee
            if (moveAndAttack) {
                level = level + mod - 4; // Add the modifier and the move and attack penalty to the level so we can cap it
                mod = 0; // Blank the modifier so it doesn't mess with the macro
                level = Math.min(level, 9); // Melee move and attacks are at -4, with a skill cap of 9
            }
        }
        // End effective skill level logic

        // Make the roll
        rollHelpers.rangedAttackRoll(level, mod, label, false, attack.malf).then( rollInfo => {
            let messageContent = rollInfo.content;
            let flags = {}
            let malfunctionType = "";

            if (rollInfo.malfunction) {
                malfunctionType = rollHelpers.getMalfunctionType();
            }

            if (rollInfo.success === false) {
                if ((!areaAttack || !targetHex) && (typeof target !== "undefined" && target.name)) { // Either it's not an area attack, or it is an area attack but they've opted not to strike the hex, and we have a name to reference.
                    messageContent += attacker.name + " misses " + target.name + "</br>";
                }
                else { // It is an area attack and it is targeting the hex
                    messageContent += attacker.name + " misses.</br>";
                }

                if (rollInfo.malfunction === true) {
                    switch (malfunctionType) {
                        case "mech":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it still goes off, but 1d6 seconds late)</div></br>";
                            break;
                        case "misfire":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a misfire. It fails to fire, and it will take three Ready maneuvers and an Armoury+2 or IQ based weapons skill to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
                            break;
                        case "stoppage":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a stoppage. It fires once and then stops working. It will take three Ready maneuvers and an Armoury+0 or IQ based weapons roll at -4 to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
                            break;
                        case "mechEx":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Additionally, if the weapon is a firearm or grenade from TL3 or TL4, it explodes! The weapon does 1d6+2 cr ex [2d], or if the weapon has a warhead, use that damage instead.</div></br>";
                            break;
                        default:
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has malfunction.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
                            break;
                    }
                }

                if (areaAttack) { // Scatter logic for area attacks.
                    if (rollInfo.malfunction === false || (rollInfo.malfunction === true && malfunctionType === "stoppage")) { // Either the weapon didn't malfunction, or it did malfunction but it was a stoppage which still fires a single shot.
                        this.finalizeAreaAttack(messageContent, rollInfo.margin < 0 ? Math.abs(rollInfo.margin) : 0, target, attacker, attack, rangeDamageMult, rayPointOfAim, template);
                    }
                }
            }
            else {
                let hits;
                if (attack.type === "ranged") {
                    let rcl = attack.rcl ? attack.rcl : 1;
                    if (rollInfo.malfunction === true && malfunctionType === "stoppage") {
                        hits = 1; // Stoppages still fire once.
                    }
                    else if (rollInfo.malfunction === true) {
                        hits = 0; // All other malfunction types mean the weapon never fires.
                    }
                    else { // Otherwise it's a normal success
                        hits = Math.min( ((Math.floor(rollInfo.margin / Math.abs(rcl))) + 1) , rof.rof ); // Get the number of hits based on how many times rcl fits into margin, plus one. Then cap with the number of shots actually fired
                    }
                }
                else {
                    hits = 1
                }

                if (rollInfo.malfunction === true) {
                    switch (malfunctionType) {
                        case "mech":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it still goes off, but 1d6 seconds late)</div></br>";
                            break;
                        case "misfire":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a misfire. It fails to fire, and it will take three Ready maneuvers and an Armoury+2 or IQ based weapons skill to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
                            break;
                        case "stoppage":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a stoppage. It fires once and then stops working. It will take three Ready maneuvers and an Armoury+0 or IQ based weapons roll at -4 to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
                            break;
                        case "mechEx":
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has a mechanical or electrical issue. It fails to fire, and it will take at least an hour to fix.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Additionally, if the weapon is a firearm or grenade from TL3 or TL4, it explodes! The weapon does 1d6+2 cr ex [2d], or if the weapon has a warhead, use that damage instead.</div></br>";
                            break;
                        default:
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>" + attacker.name + "'s weapon has malfunction.</div></br>";
                            messageContent += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>(If it's a grenade it's a dude and will never explode.)</div></br>";
                            break;
                    }
                }

                if (!areaAttack || !targetHex) { // Either it's not an area attack, or it is an area attack but they've opted not to strike the hex.
                    messageContent += attacker.name + " hits " + target.name + " " + this.numToWords(hits) + "</br></br>"; // Display the number of hits
                }
                else { // It is an area attack and it is targeting the hex
                    messageContent += attacker.name + " hits their target.</br>";
                }

                if (areaAttack) { // If it's an area attack.
                    this.finalizeAreaAttack(messageContent, 0, target, attacker, attack, rangeDamageMult, rayPointOfAim, template); // Switch over to the finalize area logic
                    return; // Return early
                }
                else { // It's not an area attack, carry on as usual.
                    let locations = locationArray.slice(0, hits); // Shorten the list of locations to the number of hits.

                    messageContent += target.name + " is struck in the...</br>";
                    for (let m = 0; m < locations.length; m++){
                        let firstLocation = foundry.utils.getProperty(target.actor.system.bodyType.body, (locations[m].id).split(".")[0]);
                        let firstLabel = firstLocation ? firstLocation.label : "";
                        let secondLabel = locations[m].label
                        let locationLabel;
                        if (firstLabel === secondLabel){
                            locationLabel = firstLabel;
                        }
                        else if (firstLabel === ''){
                            locationLabel = secondLabel;
                        }
                        else {
                            locationLabel = firstLabel + " - " + secondLabel;
                        }
                        messageContent += "<div style='display: grid; grid-template-columns: 0.1fr auto;'><input type='checkbox' checked class='checkbox' id='" + locations[m].id + "' value='" + locations[m].id + "' name='" + locations[m].id + "' /><span style='line-height: 26px;'>" + locationLabel + "</span></div>";
                    }

                    messageContent += "</br><input type='button' class='attemptActiveDefences' value='Attempt Active Defences'/><input type='button' class='noActiveDefences' value='No Active Defences'/>"

                    let locationIDs = [];

                    for (let l = 0; l < locations.length; l++){
                        locationIDs[l] = locations[l].id;
                    }

                    flags = {
                        target: target.document.id,
                        attacker: attacker.document.id,
                        scene: target.scene.id,
                        attack: attack,
                        relativePosition: relativePosition,
                        rof: rof,
                        locationIDs: locationIDs,
                        totalModifiers: totalModifiers,
                        targetHex: targetHex,
                        rangeDamageMult: rangeDamageMult
                    }
                }
            }

            if (!areaAttack) { // If it's not an area attack, send the normal chat message.
                ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type, flags: flags}); // Everything is assembled, send the message
            }
        })
    }

    /**
     *
     * @param messageContent The content of the chat message created up to this point.
     * @param scatterDistance The distance in yards by which this attack scatters
     * @param target If a target was involved, this is a token. Otherwise it's undefined
     * @param attacker The token that made this attack
     * @param attack The attack object being applied to this template
     * @param rangeDamageMult A multipler to handle 1/2 and Max range. Does not apply to beams.
     * @param rayPointOfAim this is a Point {x: number, y: number} only used when making beam/ray attacks and represents the actual point of aim, not the origin or end of the beam.
     * @param template The template being used for this attack
     */
    static async finalizeAreaAttack(messageContent, scatterDistance, target, attacker, attack, rangeDamageMult, rayPointOfAim, template) {
        let flags = {};

        // Begin scatter logic
        let scatter = true;
        let direction = this.randomInteger(0, 360) // Used for scatter logic, the direction it's scattering

        // Get default scatter status
        if (attack.type === "ranged") { // It's a ranged weapon which scatters by default
            scatter = true;
        }
        else { // It's a melee or affliction which does not scatter by default.
            scatter = false;
        }

        // Correct for flags on the attack changing scatter status.
        if ((typeof attack.flags !== "undefined" && attack.flags.toLowerCase().includes("yscatter"))) { // It's been explicitly told to scatter.
            scatter = true;
        }
        else if ((typeof attack.flags !== "undefined" && attack.flags.toLowerCase().includes("nscatter"))) { // It's been explicitly told not to scatter.
            scatter = false;
        }

        if (scatter || Math.abs(scatterDistance) === 0) { // This attack can scatter and is scattering, or don't need to scatter in the first place.
            if (template.t === "ray") {
                let scatterResult = this.getScatteredPoint(rayPointOfAim, scatterDistance, direction); // Get the new point of aim
                let scatterAngle = distanceHelpers.getAngleFromAtoB(attacker.center, scatterResult); // Get the angle from our attacker's centre to the new point of aim.
                let x = attacker.center.x + ((canvas.scene.grid.size * 0.5) * Math.cos(scatterAngle * Math.PI / 180));
                let y = attacker.center.y + ((canvas.scene.grid.size * 0.5) * Math.sin(scatterAngle * Math.PI / 180));
                await template.update({ direction: scatterAngle, x: x, y: y }); // Point the beam in that direction
            }
            else if (template.t === "circle") {
                let scatterResult = this.getScatteredPoint(template, scatterDistance, direction);
                await template.update({ x: scatterResult.x, y: scatterResult.y }); // Point the beam in that direction
            }
            else { // Some other template got passed through, throw an error exit early.
                console.error("Attempted to finalizeAreaAttack for unsupported template type.")
                return;
            }
            if (Math.abs(scatterDistance) > 0) { // If we scattered
                messageContent += "The attack scatters " + scatterDistance + " yards " + "<span style='display: inline-block; rotate: " + direction + "deg'>&#129034;</span>" + "</br>"; // Tell the user about it.
            }
            // End scatter logic

            // Begin target selection
            // Once the attack has scattered, get the list of targets still in the area
            messageContent += "<hr>";
            let targetList = [];
            let targetNames = "";
            if (attack.area === "area" || attack.area === "ex" || attack.area === "frag") {
                canvas.tokens.objects.children.forEach( token => {
                    if (this.isTokenInCircleTemplate(token, template)) {
                        targetList.push(token.id);
                        targetNames += token.name + "<br/>";
                    }
                })
            }
            else if (attack.area === "beam") {
                canvas.tokens.objects.children.forEach( token => {
                    if (this.isTokenInRayTemplate(token, template)) {
                        targetList.push(token.id);
                        targetNames += token.name + "<br/>";
                    }
                })
            }

            if (targetList.length > 0) { // There was a non-zero number of targets
                messageContent += "The following target's were caught in the area<br/>";
                messageContent += targetNames;
            }
            else {
                messageContent += "No one was caught in the area<br/>";
            }

            console.log(targetList);
            // End target selection

            flags = {
                template: template,
                attacker: attacker.document.id,
                scene: attacker.scene.id,
                attack: attack,
                targetList: targetList,
                //relativePosition: relativePosition,
                //rof: rof,
                //locationIDs: locationIDs,
                //totalModifiers: totalModifiers,
                //targetHex: targetHex,
                rangeDamageMult: rangeDamageMult
            }

            console.log(game.scenes.get(flags.scene));
            console.log(game.scenes.get(flags.scene).templates);
            console.log(game.scenes.get(flags.scene).templates.get(flags.template.id));

            messageContent += "<hr>";
            messageContent += "You can now make final adjustments to token and template locations before moving onto the next step:<br/>";
            messageContent += "<input type='button' class='generateAreaAttacks' value='Generate Area Attacks'/>"
        }
        else if (!scatter && Math.abs(scatterDistance) !== 0) { // This attack cannot scatter, but it was meant to.
            messageContent += "The attack fails</br>"; // Tell the user about it.
            await template.delete();
        }

        ChatMessage.create({ content: messageContent, user: game.user.id, type: CONST.CHAT_MESSAGE_STYLES.OTHER, flags: flags}); // Everything is assembled, send the message
    }

    static getAimingBonus(attack, aimTime, exactRange){
        let aimingBonus = 0;
        if (typeof aimTime !== "undefined" && aimTime > 0) { // They are aiming for any amount of time
            let accLevels = this.getScopeAccLevels(attack);
            let deadEyeLevel = this.getDeadEyeLevel();
            let additionalAimBonus = this.getAdditionalAimBonus(aimTime, deadEyeLevel);
            let rangingBonus = exactRange ? 3 : closeRange ? 1 : 0; // The bonus for knowing the exact range to a target is +3, and the bonus for knowing it very closely is +1.

            // TS26: The additional aiming bonus past Acc+2 is capped by the lower of the scope's acc, and the gun's acc.
            let highestScopeAccLevel = accLevels[accLevels.length - 1] + rangingBonus; // First, get the highest scope Acc available on the attack, and include the ranging bonus.
            additionalAimBonus = Math.min(additionalAimBonus, highestScopeAccLevel+2, attack.acc+2) // Then get the lowest of all three options

            let scopeBonus = 0;

            // Get the maximum scope bonus we can claim
            for (let a = 0; a < accLevels.length; a++) { // Loop through the list of acc levels for our scope.
                if (accLevels[a] > scopeBonus && aimTime >= accLevels[a]) { // Current itterant is higher than the scope bonus AND our aim time is higher or equal to that bonus
                    scopeBonus = accLevels[a] // Set the bonus to the current itterant.
                }
            }

            aimingBonus = +attack.acc + +scopeBonus + +additionalAimBonus +rangingBonus; // Total aiming bonus is the attack's base Acc, the scope's currently claimed Acc, any additional bonus for extra time, and any bonus for knowing the range.
        }
        return aimingBonus;
    }

    // This method scans an attack for all possible Acc levels
    static getScopeAccLevels(attack) {
        let accLevels = [];
        if (typeof attack.scopeAcc !== "undefined") { // Scope Acc is present
            accLevels.push(attack.scopeAcc); // Add the base scope accuracy
        }
        if (attack.flags.includes("va")){ // There are variable acc levels defined in the flags.
            for (let x = 0; x < attack.flags.length;) { // Loop through the flags
                if (attack.flags.indexOf("va", x) !== -1){ // Find any instance of va
                    x = attack.flags.indexOf("va", x)+2; // Move the cursor to the number following va
                    accLevels.push(+attack.flags.charAt(x)); // Get that number
                }
                else { // There are no further instances of va
                    x = attack.flags.length + 99; // Exit the loop
                }
            }
        }
        return accLevels.sort(function(a, b){return a - b}); // Returns the list of accuracy levels, sorted smallest to largest.
    }

    // This method searches the players traits for DeadEye and returns its level.
    static getDeadEyeLevel() {
        let deadEyeLevel = 0;

        // Loop through the list of traits and find any examples of deadeye
        for (let i = 0; i < this.items.contents.length; i++){
            if (this.items.contents[i].type === "Trait"){
                if (this.items.contents[i].name.toLowerCase().replace(/\s/g,'').includes("deadeye") ) { // Does it include the text deadeye after stripping capitals and whitespace?
                    if (this.items.contents[i].name.includes("1")) {
                        deadEyeLevel = 1;
                    }
                    else if (this.items.contents[i].name.includes("2")) {
                        deadEyeLevel = 2;
                    }
                    else if (this.items.contents[i].name.includes("3")) {
                        deadEyeLevel = 3;
                    }
                }
            }
        }

        return deadEyeLevel;
    }

    static getAdditionalAimBonus(aimTime, deadEyeLevel) {
        let additionalAimBonus = 0;

        if  (aimTime >= 90 ||
            (aimTime >= 81 && deadEyeLevel === 1) ||
            (aimTime >= 72 && deadEyeLevel === 2) ||
            (aimTime >= 63 && deadEyeLevel === 3)) {
            additionalAimBonus = 7;
        }
        else if (aimTime >= 45 ||
            (aimTime >= 41 && deadEyeLevel === 1) ||
            (aimTime >= 36 && deadEyeLevel === 2) ||
            (aimTime >= 32 && deadEyeLevel === 3)) {
            additionalAimBonus = 6;
        }
        else if (aimTime >= 24 ||
            (aimTime >= 22 && deadEyeLevel === 1) ||
            (aimTime >= 20 && deadEyeLevel === 2) ||
            (aimTime >= 17 && deadEyeLevel === 3)) {
            additionalAimBonus = 5;
        }
        else if (aimTime >= 12 ||
            (aimTime >= 11 && deadEyeLevel === 1) ||
            (aimTime >= 10 && deadEyeLevel === 2) ||
            (aimTime >= 9 && deadEyeLevel === 3)) {
            additionalAimBonus = 4;
        }
        else if (aimTime >= 6 ||
            (aimTime >= 6 && deadEyeLevel === 1) ||
            (aimTime >= 5 && deadEyeLevel === 2) ||
            (aimTime >= 5 && deadEyeLevel === 3)) {
            additionalAimBonus = 3;
        }
        else if (aimTime === 3) {
            additionalAimBonus = 2;
        }
        else if (aimTime === 2) {
            additionalAimBonus = 1;
        }
        else { // They are only aiming for a single second, or other catchall.
            additionalAimBonus = 0;
        }
        return additionalAimBonus;
    }

    static numToWords(hits){ // Returns a number as a string with no leading or trailing whitespace
        let words;
        switch (hits) {
            case 1:
                words = "once";
                break;
            case 2:
                words = "twice";
                break;
            default: // not a supported type
                words = hits + " times";
                break;
        }
        return words;
    }

    // The following section relates to the active defence portion of the combat macro.
    // This method is run when the user clicks the "Attempt Active Defences" button
    static attemptActiveDefences(event) {
        event.preventDefault();

        function filterChecked(item){
            return item.checked; // Return whatever the status of the checkbox is.
        }

        let checkboxes = event.target.parentElement.getElementsByClassName("checkbox");
        let checkedBoxes = Object.values(checkboxes).filter(filterChecked);
        let locationIDs = [];

        for (let c = 0; c < checkedBoxes.length; c++){
            locationIDs[c] = checkedBoxes[c].id;
        }

        let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;

        let targetToken = game.scenes.get(flags.scene).tokens.get(flags.target);
        let attackerToken = game.scenes.get(flags.scene).tokens.get(flags.attacker);

        let targetHex = flags.targetHex;

        let facing = this.getFacing(attackerToken, targetToken);
        let target = targetToken.actor;

        let dodges = [];
        let parries = [];
        let blocks = [];
        let magical = [];

        let dodge = {
            name: "Dodge",
            level: target.system.primaryAttributes.dodge.value,
            defenceQty: "Regular",
        }

        dodges.push(dodge);

        let unarmedParryVsArmedSwingWarn = false; // The flag for unarmed parries against armed swings is true/false as it's either -3 or nothing
        let boxingOrSumoParryVsKickWarn = 0; // The flag for boxing and sumo parrying kicks is the numerical penalty, as low line defence can get rid of the penalty.

        if (target.items) {
            target.items.forEach((item) => {
                if (item.system.melee) {
                    let keys = Object.keys(item.system.melee)
                    for (let b = 0; b < keys.length; b++){ // Loop through the melee profiles
                        let profile = foundry.utils.getProperty(item.system.melee, keys[b])
                        if (Number.isInteger(profile.parry)){
                            let effectiveParry = profile.parry

                            if (typeof profile.flags !== "undefined" && profile.flags.toLowerCase().includes("una")) { // If the defence is unarmed
                                if (!(profile.skill.toLowerCase().includes("karate") || profile.skill.toLowerCase().includes("judo"))) { // And it's not karate or judo
                                    if (((flags.attack.damageInput.toLowerCase().includes("sw") || flags.attack.flags.toLowerCase().includes("sw")) && !flags.attack.flags.toLowerCase().includes("una"))) { // And the attacker is armed, and using a swing attack
                                        effectiveParry -= 3; // Apply the appropriate penalty
                                        unarmedParryVsArmedSwingWarn = true; // Set the flag so we warn the user
                                    }
                                    if (profile.skill.toLowerCase().includes("sumo") || profile.skill.toLowerCase().includes("boxing")) { // And it is sumo or boxing
                                        if (flags.attack.flags.toLowerCase().includes("kik")) { // And the attacker is kicking
                                            effectiveParry -= 2; // Apply the appropriate penalty
                                            boxingOrSumoParryVsKickWarn = 2; // Set the flag so we warn the user

                                            // This block checks for Low-Line Defence and updates the parry penalty accordingly.
                                            for (let i = 0; i < this.items.contents.length; i++){ // Loop through the list of items
                                                if (this.items.contents[i].type === "Rollable"){ // Finding only Rollables
                                                    if (this.items.contents[i].system.category.toLowerCase() === "technique"){ // And among them only Techniques
                                                        if (this.items.contents[i].system.baseSkill.toLowerCase() === profile.skill.toLowerCase()) { // And the technique has the same base skill as the parry profile we are currently looking at
                                                            if (this.items.contents[i].name.toLowerCase().replace(/[^0-9a-z]/gi, '').includes("lowlinedefen")) { // And the technique's name matches low-line defence
                                                                effectiveParry -= Math.abs(this.items.contents[i].system.baseSkillLevel - this.items.contents[i].system.level); // Apply the appropriate penalty
                                                                boxingOrSumoParryVsKickWarn = Math.abs(this.items.contents[i].system.baseSkillLevel - this.items.contents[i].system.level); // Set the flag so we warn the user
                                                            }
                                                        }
                                                    }
                                                }
                                            }


                                        }
                                    }
                                }
                            }

                            let parry = {
                                name: item.name,
                                level: effectiveParry,
                                defenceQty: typeof item.system.defenceQty !== "undefined" ? item.system.defenceQty : "Regular",
                            }
                            parries.push(parry)
                        }

                        if (Number.isInteger(profile.block)){
                            let block = {
                                name: item.name,
                                level: profile.block,
                                defenceQty: typeof item.system.defenceQty !== "undefined" ? item.system.defenceQty : "Regular",
                            }
                            blocks.push(block)
                        }
                    }
                }
                if (item.type === "Spell"){
                    if (item.system.spellClass == "Blocking"){
                        if (item.system.defenceType.toLowerCase() === "dodge") {
                            let dodge = {
                                name:  item.name,
                                level: item.system.level,
                                defenceQty: typeof item.system.defenceQty !== "undefined" ? item.system.defenceQty : "Regular",
                            }
                            dodges.push(dodge);
                        }
                        else if (item.system.defenceType.toLowerCase() === "parry") {
                            let parry = {
                                name:  item.name,
                                level: item.system.level,
                                defenceQty: typeof item.system.defenceQty !== "undefined" ? item.system.defenceQty : "Regular",
                            }
                            parries.push(parry)
                        }
                        else if (item.system.defenceType.toLowerCase() === "block") {
                            let block = {
                                name:  item.name,
                                level: item.system.level,
                                defenceQty: typeof item.system.defenceQty !== "undefined" ? item.system.defenceQty : "Regular",
                            }
                            blocks.push(block)
                        }
                        else if (item.system.defenceType.toLowerCase() === "magic") {
                            let magic = {
                                name:  item.name,
                                level: item.system.level,
                                defenceQty: typeof item.system.defenceQty !== "undefined" ? item.system.defenceQty : "Regular",
                            }
                            magical.push(magic)
                        }
                    }
                }
            })
        }

        let activeDefenceModalContent = "<div>"

        // Warnings
        let currentEnc = actorHelpers.fetchCurrentEnc(targetToken.actor);
        let hpState = actorHelpers.fetchHpState(targetToken.actor);
        let fpState = actorHelpers.fetchFpState(targetToken.actor);

        let posture = postureHelpers.getPosture(targetToken.effects);

        // If any facing, target hex, enc warning, hpState, fpState, or posture warning applies
        if (facing[0] === 0 || facing[0] === -1 || targetHex || currentEnc.penalty < 0 || (hpState.toLowerCase() !== "healthy" && hpState.toLowerCase() !== "injured") || posture.defenceMod < 0 || unarmedParryVsArmedSwingWarn) {

            activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large; color: rgb(200, 0, 0)'>Warnings</div>";

            // Attacker is in the target's side hexes, warn them
            if (facing[0] === 0) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>The attacker is in one of your side hexes. You have a -2 penalty to defend.</div>";
            }
            // Attacker is in the target's rear hexes, warn them
            else if (facing[0] === -1) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>The attacker is in one of your rear hexes. If you can defend, you have a -2 penalty to do so.</div>";
            }

            // Defender is facing a rear/side attack, remind them about "Timed Defence"
            if (facing[0] === 0 || facing[0] === -1) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(127, 127, 208)'>If you have the Timed Defence technique for the defence you intend to use, you may use it to offset this penalty. Though Timed Defence (Dodge) may only be used once per turn.</div>";
            }

            // The attack is an explosion targeting your hex
            if (targetHex) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>The attacker is firing an explosive attack at the hex you are standing in. For your defence to be successful you either need to exit the hex you are currently standing in, or otherwise prevent the attacker from striking your hex.</div>";
            }

            // If the encumbrance penalty is above zero, warn the user
            if (currentEnc.penalty < 0) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>Your current encumbrance penalty is " + currentEnc.penalty + " which is hampering your dodge and any fencing parries.</div>";
            }

            // Warn the user that they are both reeling and exhausted
            if ((hpState.toLowerCase() !== "healthy" && hpState.toLowerCase() !== "injured") && (fpState.toLowerCase() !== "fresh" && fpState.toLowerCase() !=="tired")) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 65, 65)'>You are below 1/3rd HP and 1/3rd FP, meaning you are both reeling and exhausted. Aside from quartering your dodge, it also reduces your strength, which means your fencing parries are likely taking encumbrance penalties. You're probably fucked.</div>";
            }

            // Warn the user about the reeling penalty
            else if (hpState.toLowerCase() !== "healthy" && hpState.toLowerCase() !== "injured") {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>You are below 1/3rd HP, meaning you are reeling or worse. Aside from halving your dodge, it also reduces your strength, which means your fencing parries are likely taking encumbrance penalties.</div>";
            }

            // Warn the user about the exhausted penalty
            else if (fpState.toLowerCase() !== "fresh" && fpState.toLowerCase() !=="tired") {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>You are below 1/3rd FP, meaning you are exhausted or worse. Aside from halving your dodge, it also reduces your strength, which means your fencing parries are likely taking encumbrance penalties.</div>";
            }

            if (posture.defenceMod < 0) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>You are currently " + posture.desc + " which gives you " + posture.defenceMod + " to all non-magical active defences.</div>";
            }

            if (unarmedParryVsArmedSwingWarn) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>Your attacker is making an armed swing against you. Unarmed parries that don't use Karate or Judo are at -3.</div>";
            }

            if (boxingOrSumoParryVsKickWarn > 0) {
                activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; color: rgb(208, 127, 127)'>Your attacker is kicking you. Boxing and Sumo parries are at -" + boxingOrSumoParryVsKickWarn + ".</div>";
            }

            activeDefenceModalContent += "<hr>";
        }

        // End Warnings

        // General Modifiers
        activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>General Modifiers</div>";
        activeDefenceModalContent += "<div style='display: flex; justify-content: space-between;'>";

        // General active defence modifier
        activeDefenceModalContent += "<div class='def-option'><input type='number' id='mod' name='mod' placeholder='Active Defence Modifier'/></div>";

        if (facing[0] === 0 || facing[0] === -1) { // Attacker is in the target's side or rear hexes, give them the option to use Timed Defence.
            activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='timedDefence' id='timedDefence' value='timedDefence' /><label for='timedDefence' style='line-height: 26px;'>Timed Defence</label></div>"
        }
        activeDefenceModalContent += "</div>";
        activeDefenceModalContent += "<hr>";

        // End General Modifiers

        // Feverish Defence Modifiers
        if (game.settings.get("gurps4e", "feverishDefenceAllowed")) {
            activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Feverish Defence</div>";
            activeDefenceModalContent += "<div style='display: flex; justify-content: space-between; flex: auto;'>" +
                "<div class='def-option'><input type='checkbox' name='feverishDefence' id='feverishDefence' value='feverishDefence' /><label for='feverishDefence' style='line-height: 26px;'>Attempt Will Roll</label></div>" +
                "<div class='def-option'><input type='number' name='feverishDefenceMod' id='feverishDefenceMod' placeholder='Will Roll Modifier'/></div>"

            activeDefenceModalContent += "</div>"
            activeDefenceModalContent += "<hr>";
        }
        // End Feverish Defence Modifiers

        // Retreat options
        activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Retreat Options</div>";
        activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>" +
            "<div class='def-option'><input type='checkbox' name='slip' id='slip' value='slip' /><label for='slip' style='line-height: 26px;'>Slip</label></div>" +
            "<div class='def-option'><input type='checkbox' name='sideslip' id='sideslip' value='sideslip' /><label for='sideslip' style='line-height: 26px;'>Side Slip</label></div>" +
            "<div class='def-option'><input type='checkbox' name='retreat' id='retreat' value='retreat' /><label for='retreat' style='line-height: 26px;'>Retreat</label></div>";

        activeDefenceModalContent += "</div>";
        // End Retreat options

        // All Out Defence Options


        activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>All Out Defences</div>";
        activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>" +
            "<div class='def-option'></div>" +
            "<div class='def-option' style='flex: 2; justify-content: center;'><input type='checkbox' name='aodIncreased' id='aodIncreased' value='aodIncreased' /><label for='slip' style='line-height: 26px;'>Increased Defence (+2)</label></div>" +
            "<div class='def-option'></div>";

        activeDefenceModalContent += "</div>"

        // activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>";
        //
        // // Only show double defence options for those defences that have at least one entry
        // if (dodges.length > 0) {
        // 	activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aodDoubleDodge' id='aodDoubleDodge' value='aodDoubleDodge' /><label for='aodDoubleDodge' style='line-height: 26px;'>Double Defence (Dodge)</label></div>";
        // }
        //
        // if (blocks.length > 0) {
        // 	activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aodDoubleBlock' id='aodDoubleBlock' value='aodDoubleBlock' /><label for='aodDoubleBlock' style='line-height: 26px;'>Double Defence (Block)</label></div>";
        // }
        //
        // if (parries.length > 0) {
        // 	activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aodDoubleParry' id='aodDoubleParry' value='aodDoubleParry' /><label for='aodDoubleParry' style='line-height: 26px;'>Double Defence (Parry)</label></div>";
        // }
        //
        // activeDefenceModalContent += "</div>"
        activeDefenceModalContent += "<hr>";

        // End All Out Defence Options

        // Acrobatic Defence Options
        // Make sure they have at least one acrobatic skill
        if (skillHelpers.getSkillLevelByName("acrobatics", targetToken.actor) || skillHelpers.getSkillLevelByName("aerobatics", targetToken.actor) || skillHelpers.getSkillLevelByName("aquabatics", targetToken.actor)) {
            activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Acrobatic Defences</div>";

            activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>";
            if (skillHelpers.getSkillLevelByName("acrobatics", targetToken.actor)) {
                activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='acrobatic' id='acrobatic' value='acrobatic' /><label for='acrobatic' style='line-height: 26px;'>Acrobatic Defence</label></div>";
            }
            if (skillHelpers.getSkillLevelByName("aerobatics", targetToken.actor)) {
                activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aerobatic' id='aerobatic' value='aerobatic' /><label for='aerobatic' style='line-height: 26px;'>Aerobatic Defence</label></div>";
            }
            if (skillHelpers.getSkillLevelByName("aquabatics", targetToken.actor)) {
                activeDefenceModalContent += "<div class='def-option'><input type='checkbox' name='aquabatic' id='aquabatic' value='aquabatic' /><label for='aquabatic' style='line-height: 26px;'>Aquabatic Defence</label></div>";
            }
            activeDefenceModalContent += "</div>";

            activeDefenceModalContent += "<div style='display: flex; min-width: 50px; flex: auto;'>" +
                "<div class='def-option'></div>" +
                "<div class='def-option' style='flex: 3'><div class='def-option'><input type='number' name='acroMod' id='acroMod' placeholder='Acrobatic Defence Modifier'/></div></div>" +
                "<div class='def-option'></div>" +
                "</div>"

            activeDefenceModalContent += "<hr>";
        }
        // End Acrobatic Defence Options

        activeDefenceModalContent += "<div style='text-align: center; font-weight: bold; text-decoration: underline; font-size: x-large;'>Specific Modifiers</div>";

        activeDefenceModalContent += "<div style='display: flex'>";

        // If the actor has dodges, add the column with dodge options and modifiers
        if (dodges.length > 0) {
            activeDefenceModalContent += "<div class='def-column'>" +
                "<div><span style='text-align: center; font-weight: bold;'>Dodge</span></div>" +
                "<div class='def-option'><input type='checkbox' name='drop' id='drop' value='drop' /><label for='drop' style='line-height: 26px;'>Dodge & Drop</label></div>" +
                "<select style='width: 100%' name='dodgeSelector' id='dodgeSelector'>";
            for (let d = 0; d < dodges.length; d++){
                activeDefenceModalContent += "<option value='" + dodges[d].level + "'>" + dodges[d].level + ": " + dodges[d].name + "</option>"
            }
            activeDefenceModalContent += "</select>" +
                "</div>";
        }

        // If the actor has blocks, add the column with block options and modifiers
        if (blocks.length > 0){
            activeDefenceModalContent += "<div class='def-column'>" +
                "<div><span style='text-align: center; font-weight: bold;'>Block</span></div>" +
                "<select style='width: 100%' name='blockSelector' id='blockSelector'>";
            for (let b = 0; b < blocks.length; b++){
                activeDefenceModalContent += "<option value='" + blocks[b].level + "'>" + blocks[b].level + ": " + blocks[b].name + "</option>"
            }
            activeDefenceModalContent += "</select>" +
                "</div>";
        }

        // If the actor has parries, add the column with parry options and modifiers
        if (parries.length > 0){
            activeDefenceModalContent += "<div class='def-column'>" +
                "<div><span style='text-align: center; font-weight: bold;'>Parry</span></div>" +
                "<div class='def-option'><input type='checkbox' name='crossParry' id='crossParry' value='crossParry' /><label for='crossParry' style='line-height: 26px;'>Cross Parry</label></div>" +
                "<select style='width: 100%' name='parrySelector' id='parrySelector'>";
            for (let p = 0; p < parries.length; p++){
                activeDefenceModalContent += "<option value='" + parries[p].level + "'>" + parries[p].level + ": " + parries[p].name + "</option>"
            }
            activeDefenceModalContent += "</select>" +
                "</div>";
        }

        // If the actor has magical defences, add the column with magical options and modifiers
        if (magical.length > 0){
            activeDefenceModalContent += "<div class='def-column'>" +
                "<div><span style='text-align: center; font-weight: bold;'>Magical</span></div>" +
                "<select style='width: 100%' name='magicalSelector' id='magicalSelector'>";
            for (let m = 0; m < magical.length; m++){
                activeDefenceModalContent += "<option data-defenceqty='" + magical[m].defenceQty + "' value='" + magical[m].level + "'>" + magical[m].level + ": " + magical[m].name + "</option>"
            }
            activeDefenceModalContent += "</select>" +
                "</div>";
        }

        activeDefenceModalContent += "</div>" +
            "</div>" +
            "</div>";

        let buttons = {};
        let width = 0; // Variable for dialog width
        if (dodges.length > 0) {
            buttons.dodge = {
                icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 17px;"><path fill="currentColor" d="M272 96c26.51 0 48-21.49 48-48S298.51 0 272 0s-48 21.49-48 48 21.49 48 48 48zM113.69 317.47l-14.8 34.52H32c-17.67 0-32 14.33-32 32s14.33 32 32 32h77.45c19.25 0 36.58-11.44 44.11-29.09l8.79-20.52-10.67-6.3c-17.32-10.23-30.06-25.37-37.99-42.61zM384 223.99h-44.03l-26.06-53.25c-12.5-25.55-35.45-44.23-61.78-50.94l-71.08-21.14c-28.3-6.8-57.77-.55-80.84 17.14l-39.67 30.41c-14.03 10.75-16.69 30.83-5.92 44.86s30.84 16.66 44.86 5.92l39.69-30.41c7.67-5.89 17.44-8 25.27-6.14l14.7 4.37-37.46 87.39c-12.62 29.48-1.31 64.01 26.3 80.31l84.98 50.17-27.47 87.73c-5.28 16.86 4.11 34.81 20.97 40.09 3.19 1 6.41 1.48 9.58 1.48 13.61 0 26.23-8.77 30.52-22.45l31.64-101.06c5.91-20.77-2.89-43.08-21.64-54.39l-61.24-36.14 31.31-78.28 20.27 41.43c8 16.34 24.92 26.89 43.11 26.89H384c17.67 0 32-14.33 32-32s-14.33-31.99-32-31.99z" class=""></path></svg>',
                label: "Dodge",
                callback: (html) => {
                    this.gatherActiveDefenceAndOptions(html, "dodge", flags, locationIDs, facing[0])
                }
            }
            width += 200; // Add width for this column of defences
        }
        if (blocks.length > 0) {
            buttons.block = {
                icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z" class=""></path></svg>',
                label: "Block",
                callback: (html) => {
                    this.gatherActiveDefenceAndOptions(html, "block", flags, locationIDs, facing[0])
                }
            }
            width += 200; // Add width for this column of defences
        }
        if (parries.length > 0) {
            buttons.parry = {
                icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M507.31 462.06L448 402.75l31.64-59.03c3.33-6.22 2.2-13.88-2.79-18.87l-17.54-17.53c-6.25-6.25-16.38-6.25-22.63 0L420 324 112 16 18.27.16C8.27-1.27-1.42 7.17.17 18.26l15.84 93.73 308 308-16.69 16.69c-6.25 6.25-6.25 16.38 0 22.62l17.53 17.54a16 16 0 0 0 18.87 2.79L402.75 448l59.31 59.31c6.25 6.25 16.38 6.25 22.63 0l22.62-22.62c6.25-6.25 6.25-16.38 0-22.63zm-149.36-76.01L60.78 88.89l-5.72-33.83 33.84 5.72 297.17 297.16-28.12 28.11zm65.17-325.27l33.83-5.72-5.72 33.84L340.7 199.43l33.94 33.94L496.01 112l15.84-93.73c1.43-10-7.01-19.69-18.1-18.1l-93.73 15.84-121.38 121.36 33.94 33.94L423.12 60.78zM199.45 340.69l-45.38 45.38-28.12-28.12 45.38-45.38-33.94-33.94-45.38 45.38-16.69-16.69c-6.25-6.25-16.38-6.25-22.62 0l-17.54 17.53a16 16 0 0 0-2.79 18.87L64 402.75 4.69 462.06c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L109.25 448l59.03 31.64c6.22 3.33 13.88 2.2 18.87-2.79l17.53-17.54c6.25-6.25 6.25-16.38 0-22.63L188 420l45.38-45.38-33.93-33.93z" class=""></path></svg>',
                label: "Parry",
                callback: (html) => {
                    this.gatherActiveDefenceAndOptions(html, "parry", flags, locationIDs, facing[0])
                }
            }
            width += 200; // Add width for this column of defences
        }
        if (magical.length > 0) {
            buttons.magical = {
                icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z" class=""></path></svg>',
                label: "Magical",
                callback: (html) => {
                    this.gatherActiveDefenceAndOptions(html, "magical", flags, locationIDs, facing[0])
                }
            }
            width += 200; // Add width for this column of defences
        }

        let options = {
            width: width,
        };

        let activeDefenceModal = new Dialog({
            title: "Active Defences",
            content: activeDefenceModalContent,
            buttons: buttons,
            default: "dodge",
            render: html => console.info("Register interactivity in the rendered dialog"),
            close: html => console.info("This always is logged no matter which option is chosen")
        }, options)
        activeDefenceModal.render(true)
    }

    static noActiveDefences(event) {
        event.preventDefault();

        function filterChecked(item){
            return item.checked; // Return whatever the status of the checkbox is.
        }

        let checkboxes = event.target.parentElement.getElementsByClassName("checkbox");
        let checkedBoxes = Object.values(checkboxes).filter(filterChecked);
        let locationIDs = [];

        for (let c = 0; c < checkedBoxes.length; c++){
            locationIDs[c] = checkedBoxes[c].id;
        }

        let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;

        this.applyDamage(flags, locationIDs);
    }

    // This method gathers the selections the user has made when selecting their active defence and any relevant modifiers
    static gatherActiveDefenceAndOptions(html, type, flags, locationIDs, facing){
        let selection;
        let name;
        let defenceQty;
        let mod = parseInt(html.find('#mod').val());

        let options = {
            feverishDefence: 	html.find('#feverishDefence')[0] ? html.find('#feverishDefence')[0].checked : "",
            feverishDefenceMod: html.find('#feverishDefenceMod').val(),
            timedDefence: 		html.find('#timedDefence')[0] ? html.find('#timedDefence')[0].checked : "",
            retreat: 			html.find('#retreat')[0] ? html.find('#retreat')[0].checked : "",
            sideslip: 			html.find('#sideslip')[0] ? html.find('#sideslip')[0].checked : "",
            slip: 				html.find('#slip')[0] ? html.find('#slip')[0].checked : "",
            drop: 				html.find('#drop')[0] ? html.find('#drop')[0].checked : "",
            crossParry: 		html.find('#crossParry')[0] ? html.find('#crossParry')[0].checked : "",
            aodIncreased:		html.find('#aodIncreased')[0] ? html.find('#aodIncreased')[0].checked : "",
            aodDoubleDodge:		html.find('#aodDoubleDodge')[0] ? html.find('#aodDoubleDodge')[0].checked : "",
            aodDoubleBlock:		html.find('#aodDoubleBlock')[0] ? html.find('#aodDoubleBlock')[0].checked : "",
            aodDoubleParry:		html.find('#aodDoubleParry')[0] ? html.find('#aodDoubleParry')[0].checked : "",
            acrobatic:			html.find('#acrobatic')[0] ? html.find('#acrobatic')[0].checked : "",
            aerobatic:			html.find('#aerobatic')[0] ? html.find('#aerobatic')[0].checked : "",
            aquabatic:			html.find('#aquabatic')[0] ? html.find('#aquabatic')[0].checked : "",
            acroMod:			html.find('#acroMod').val()
        }

        if (type.toLowerCase() === 'parry'){
            selection = html.find('#parrySelector').val()
            defenceQty = html.find('#parrySelector')[0].selectedOptions[0].dataset.defenceqty;
            name = html.find('#parrySelector')[0].innerText.split(":")[1]
        }
        else if (type.toLowerCase() === 'block'){
            selection = html.find('#blockSelector').val()
            defenceQty = html.find('#blockSelector')[0].selectedOptions[0].dataset.defenceqty;
            name = html.find('#blockSelector')[0].innerText.split(":")[1]
        }
        else if (type.toLowerCase() === 'dodge'){
            selection = html.find('#dodgeSelector').val()
            defenceQty = html.find('#dodgeSelector')[0].selectedOptions[0].dataset.defenceqty;
            name = html.find('#dodgeSelector')[0].innerText.split(":")[1]
        }
        else if (type.toLowerCase() === 'magical'){
            selection = html.find('#magicalSelector').val()
            defenceQty = html.find('#magicalSelector')[0].selectedOptions[0].dataset.defenceqty;
            name = html.find('#magicalSelector')[0].innerText.split(":")[1]
        }

        // Undefined & NaN check for the modifier
        if (typeof mod !== "number" || !mod.isNaN) {
            mod = 0;
        }

        if (facing <= 0 && !options.timedDefence) { // Attacker is in side or rear hexes and the target is not using a timed defence
            mod -= 2 // Subtract 2 from the defence modifier
        }

        this.rollActiveDefence(mod, selection, name, options, flags, locationIDs, type, facing, defenceQty);
    }

    static async rollActiveDefence(mod, selection, name, options, flags, locationIDs, type, facing, defenceQty) {
        let targetToken = game.scenes.get(flags.scene).tokens.get(flags.target)
        let target = targetToken.actor;

        let posture = postureHelpers.getPosture(targetToken.effects);

        let totalModifier;
        let additionalMessageContent = "";
        let label = "";

        if (typeof defenceQty === "undefined") {
            defenceQty = "Regular";
        }

        if (mod === "" || mod === undefined){
            totalModifier = +0;
        }
        else {
            totalModifier = parseInt(mod);
        }

        totalModifier += posture.defenceMod;

        let feverishDefenceMod = options.feverishDefenceMod;

        if (typeof feverishDefenceMod === "string") {
            if (feverishDefenceMod.length > 0) {
                feverishDefenceMod = parseInt(feverishDefenceMod);
            }
        }

        // Undefined / NaN check for feverishDefenceMod
        if (typeof feverishDefenceMod !== "number" || feverishDefenceMod.isNaN) {
            feverishDefenceMod = 0;
        }

        // This block handles the logic and display for Feverish Defences
        let feverishWillRoll = game.settings.get("gurps4e", "feverishDefenceRequiresWill");
        let feverishFP = game.settings.get("gurps4e", "feverishDefenceCostsFP");
        let willRollHtml = "";
        let acroRollHtml = "";
        let feverishWillRollFailed = false;

        // If Will rolls are required for Feverish Defences and they've elected to make such a roll
        if (feverishWillRoll && options.feverishDefence) {
            let willRoll = await rollHelpers.skillRoll(target.system.primaryAttributes.will.value, feverishDefenceMod, "Rolls against Will for a Feverish Defence.", false);

            willRollHtml = willRoll.content;

            if (willRoll.success) {
                willRollHtml += "<br/>+2 to this defence";

                // It's a crit, and we care about FP for Feverish Defences
                if (willRoll.crit && feverishFP) {
                    willRollHtml += " and no FP is lost";
                    // Give back the FP that is about to be spent, max checking will be done below
                    target.system.reserves.fp.value = target.system.reserves.fp.value + 1;
                }
            }
            else {
                willRollHtml += "<br/>No bonus";
                feverishWillRollFailed = true;
                if (willRoll.crit) {
                    willRollHtml += " and one HP is lost";
                    target.system.reserves.hp.value = target.system.reserves.hp.value - 1;
                }
            }

            if (feverishFP) {
                target.system.reserves.fp.value = target.system.reserves.fp.value - 1;
                // If FP is above max, correct it
                if (target.system.reserves.fp.value > target.system.reserves.fp.max) {
                    target.system.reserves.fp.value = target.system.reserves.fp.max;
                }
                // If FP is below zero, apply HP damage
                else if (target.system.reserves.fp.value > 0) {
                    target.system.reserves.hp.value = target.system.reserves.hp.value - 1;
                }
            }

            label += willRollHtml + "<hr>";
        }
        // End Feverish Defences

        // If the user has decided to make an acrobatic defence
        let acroNotice = "";
        if (options.acrobatic || options.aerobatic || options.aquabatic) {
            let acroSkill = "Acrobatics";
            let acroLabel = "Rolls against Acrobatics";
            if (options.acrobatic) {
                acroSkill = "Acrobatics";
                acroLabel = "Rolls against Acrobatics";
            }
            else if (options.aerobatic) {
                acroSkill = "Aerobatics";
                acroLabel = "Rolls against Aerobatics";
            }
            else if (options.aquabatic) {
                acroSkill = "Aquabatics";
                acroLabel = "Rolls against Aquabatics";
            }

            let acroSkillValue = skillHelpers.getSkillLevelByName(acroSkill, target);

            let acroMod = options.acroMod;

            if (typeof acroMod === "string") {
                if (acroMod.length > 0) {
                    acroMod = parseInt(acroMod);
                }
            }

            // Undefined / NaN check for acroMod
            if (typeof acroMod !== "number" || acroMod.isNaN) {
                acroMod = 0;
            }

            // For whatever reason, an acrobatic defence in this case is not allowed (Not the same as trying but failing)
            if (acroSkillValue === undefined || typeof acroSkillValue !== "number" || (type === "parry" && !game.settings.get("gurps4e", "acrobaticParry")) || (type === "block" && !game.settings.get("gurps4e", "acrobaticBlock"))) {
                // TODO - Warn about failed attempt at making an acrobatic defence
                if (acroSkillValue === undefined || typeof acroSkillValue !== "number") {
                    acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " defence but lacks the skill. There is no resulting modifier";
                }
                else if (type === "parry" && !game.settings.get("gurps4e", "acrobaticParry")) {
                    acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " parry, but the campaign settings do not permit it. There is no resulting modifier";
                }
                else if (type === "block" && !game.settings.get("gurps4e", "acrobaticBlock")) {
                    acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " block, but the campaign settings do not permit it. There is no resulting modifier";
                }
                else {
                    acroRollHtml += "Attempted an " + acroSkill.slice(0, -1) + " defence but some error prevents it from working right now. Bother Calvin about this.";
                }
            }
            // An acrobatic defence is permitted, continue
            else {
                let acroRoll = await rollHelpers.skillRoll(acroSkillValue, acroMod, acroLabel, false);

                acroRollHtml = acroRoll.content;

                if (acroRoll.success) {
                    acroRollHtml += "<br/>+2 to this defence";
                    totalModifier += 2;
                    if (options.acrobatic) {
                        acroNotice = "acrobatic ";
                    }
                    else if (options.aerobatic) {
                        acroNotice = "aerobatic ";
                    }
                    else if (options.aquabatic) {
                        acroNotice = "aquabatic ";
                    }
                }
                else {
                    acroRollHtml += "<br/>-2 to this defence";
                    totalModifier -= 2;
                    if (options.acrobatic) {
                        acroNotice = "failed acrobatic ";
                    }
                    else if (options.aerobatic) {
                        acroNotice = "failed aerobatic ";
                    }
                    else if (options.aquabatic) {
                        acroNotice = "failed aquabatic ";
                    }
                }
            }

            label += acroRollHtml + "<hr>";
        }
        // End Acrobatic Defences

        label += target.name + " attempts a ";

        // They picked Feverish Defence, and did not fail the roll (Either it wasn't required or the roll passed)
        if (options.feverishDefence && !feverishWillRollFailed ) {
            label += "feverish ";
            totalModifier += 2;
        }

        // They picked AoD Increased
        if (options.aodIncreased) {
            label += "all out ";
            totalModifier += 2;
        }

        if (options.acrobatic || options.aerobatic || options.aquabatic) {
            label += acroNotice;
        }

        if (options.crossParry && type === "parry") {
            label += "cross ";
            totalModifier += 2;
        }

        if (type.toLowerCase() === "magical") {
            label += type + " defence ";
        }
        else {
            label += type + " ";
        }

        // Block for retreat options
        if (options.drop && type === "dodge") {
            label += "and drop ";
            totalModifier += 3;
            postureHelpers.setPostureTokenDoc(target.token,"lyingprone")
        }
        else if (options.retreat) {
            label += "and retreat ";
            if ((type === "parry" && flags.attack.parryType.toUpperCase() === "F") || type === "dodge"){ // If it's a parry and is fencing OR it's a dodge
                totalModifier += 3; // Grant the fencing bonus
            }
            else {
                totalModifier += 1; // Otherwise grant the default.
            }
        }
        else if (options.sideslip) {
            label += "and side slip ";
            if ((type === "parry" && flags.attack.parryType.toUpperCase() === "F") || type === "dodge"){ // If it's a parry and is fencing OR it's a dodge
                totalModifier += 2; // Grant the fencing bonus
            }
            else {
                totalModifier += 0; // Otherwise grant the default.
            }
        }
        else if (options.slip) {
            label += "and slip ";
            if ((type === "parry" && flags.attack.parryType.toUpperCase() === "F") || type === "dodge"){ // If it's a parry and is fencing OR it's a dodge
                totalModifier += 1; // Grant the fencing bonus
            }
            else {
                totalModifier += -1; // Otherwise grant the default.
            }
        }

        // If they're not standing, include it in the output string
        if (posture.name !== "standing") {
            label += " while " + posture.desc;
        }

        if (type.toLowerCase() !== "dodge"){
            label += " with their " + name;
        }

        if (facing == 0) { // Attacker is in side hexes
            label += " against an attack from the side"
        }
        else if (facing == -1) { // Attacker is in rear hexes
            label += " against an attack from the rear"
        }

        label = generalHelpers.correctAtoAn(label);

        // Include enc level in the dodge or parry label if it is relevant.
        if (((typeof flags.attack.parryType !== "undefined" && flags.attack.parryType.toUpperCase() === "F") || type === "dodge") && typeof target.system.encumbrance.current.title !== 'undefined') {
            label += " at an encumbrance level of " + target.system.encumbrance.current.title
        }

        rollHelpers.skillRoll(selection, totalModifier, label, false).then( rollInfo => {
            let attacksStopped;

            if (defenceQty.toLowerCase() === "all") {
                if (rollInfo.margin >= 0) {
                    attacksStopped = locationIDs.length + 1;
                }
                else {
                    attacksStopped = 0;
                }
            }
            else if (defenceQty.toLowerCase() === "single") {
                if (rollInfo.margin >= 0) {
                    attacksStopped = 1;
                }
                else {
                    attacksStopped = 0;
                }
            }
            else { // This else captures Regular defences and any other weirdness
                if (rollInfo.margin >= 0) {
                    attacksStopped = Math.min(rollInfo.margin + 1, locationIDs.length);
                }
                else {
                    attacksStopped = 0;
                }
            }


            let locationsHit;
            let attacksThrough;

            if (attacksStopped >= locationIDs.length){ // Stopped as many or more attacks as there actually are
                additionalMessageContent += target.name + " stopped all of the attacks.";
                let messageContent = rollInfo.content + additionalMessageContent;

                // Send the message, no further rolls necessary.
                ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});
            }
            else if (attacksStopped <= 0){ // Stopped zero or fewer attacks
                additionalMessageContent += target.name + " does not stop any attacks.</br></br>";
                additionalMessageContent += locationIDs.length + " attack" + (locationIDs.length > 1 ? "s " : " ") + "get" + (locationIDs.length === 1 ? "s" : "") + " through.";
                let messageContent = rollInfo.content + additionalMessageContent;

                // Send the message then prepare for damage rolls
                ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});

                locationsHit = locationIDs; // All attacks get through
                this.applyDamage(flags, locationsHit).then();
            }
            else if (attacksStopped === 1){ // Stopped one attack, but not all
                attacksThrough = locationIDs.length - 1;
                additionalMessageContent += target.name + " stopped one attack.</br></br>";
                additionalMessageContent += attacksThrough + " attack" + (attacksThrough > 1 ? "s " : " ") + "get" + (attacksThrough === 1 ? "s" : "") + " through.";
                let messageContent = rollInfo.content + additionalMessageContent;

                // Send the message then prepare for damage rolls
                ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});

                locationsHit = locationIDs.slice(0, locationIDs.length - 1); // Remove the last hit in the array
                this.applyDamage(flags, locationsHit).then();
            }
            else if (attacksStopped > 1){ // Stopped more than one attack, but not all
                attacksThrough = locationIDs.length - attacksStopped;
                additionalMessageContent += target.name + " stopped " + attacksStopped + " attacks.</br></br>";
                additionalMessageContent += attacksThrough + " attack" + (attacksThrough > 1 ? "s " : " ") + "get" + (attacksThrough === 1 ? "s" : "") + " through.";
                let messageContent = rollInfo.content + additionalMessageContent;

                // Send the message then prepare for damage rolls
                ChatMessage.create({ content: messageContent, user: game.user.id, type: rollInfo.type});

                locationsHit = locationIDs.slice(0, locationIDs.length - attacksStopped); // Remove the last hits in the array
                this.applyDamage(flags, locationsHit).then();
            }
        })
    }

    // This method goes through each hit location on the body to find the lowest for each separate damage type. It then stores that for the final step where it is averaged with the Torso DR
    static getLargeAreaDR(object) {
        let armour = { // Init the final largeAreaDR object which we will return at the end of the method
            burn: 	0,
            cor: 	0,
            cr: 	0,
            cut: 	0,
            fat: 	0,
            imp: 	0,
            pi: 	0,
            tox: 	0,
        };

        let lowest = { // Init the object to hold the lowest armour for each type
            burn: 	[0],
            cor: 	[0],
            cr: 	[0],
            cut: 	[0],
            fat: 	[0],
            imp: 	[0],
            pi: 	[0],
            tox: 	[0],
        };

        let torso = { // Init the object to hold the torso armour for each type
            burn: 	[0],
            cor: 	[0],
            cr: 	[0],
            cut: 	[0],
            fat: 	[0],
            imp: 	[0],
            pi: 	[0],
            tox: 	[0],
        };

        if (object) { // Make sure they have a body
            let bodyParts = Object.keys(object); // Collect all the bodypart names
            for (let i = 0; i < bodyParts.length; i++){ // Loop through all the body parts
                if (bodyParts[i] == "skull" || bodyParts[i] == "brain"){ // Part has no sub-parts
                    // Check it exists and add it to the lowest array
                    lowest.burn[i] = foundry.utils.getProperty(object, bodyParts[i] + ".drBurn") ? +foundry.utils.getProperty(object, bodyParts[i] + ".drBurn") : 0;
                    lowest.cor[i] = foundry.utils.getProperty(object, bodyParts[i] + ".drCor")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCor") : 0;
                    lowest.cr[i]  = foundry.utils.getProperty(object, bodyParts[i] + ".drCr")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCr")  : 0;
                    lowest.cut[i]  = foundry.utils.getProperty(object, bodyParts[i] + ".drCut")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drCut") : 0;
                    lowest.fat[i]  = foundry.utils.getProperty(object, bodyParts[i] + ".drFat")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drFat") : 0;
                    lowest.imp[i]  = foundry.utils.getProperty(object, bodyParts[i] + ".drImp")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drImp") : 0;
                    lowest.pi[i]   = foundry.utils.getProperty(object, bodyParts[i] + ".drPi")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".drPi")  : 0;
                    lowest.tox[i]  = foundry.utils.getProperty(object, bodyParts[i] + ".drTox")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".drTox") : 0;
                }
                else {
                    let subParts = Object.keys(foundry.utils.getProperty(object, bodyParts[i] + ".subLocation")); // Collect all the subpart names
                    for (let n = 0; n < subParts.length; n++){ // Loop through all the subparts
                        // Check it exists and add it to the lowest array
                        lowest.burn[i + n] = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0;
                        lowest.cor[i + n]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0;
                        lowest.cr[i + n]   = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0;
                        lowest.cut[i + n]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0;
                        lowest.fat[i + n]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0;
                        lowest.imp[i + n]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0;
                        lowest.pi[i + n]   = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0;
                        lowest.tox[i + n]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0;

                        if (subParts[n] === "chest" || (subParts[n] === "abdomen" && game.settings.get("gurps4e", "abdomenForLargeAreaInjury"))) { // Check to see if this part matches subLocation.chest to establish if a body part is a chest section, regardless of animal/humanoid/thorax. Do the same for abdomen after checking the game setting.
                            // Check it exists and add it to the torso array
                            torso.burn[torso.burn.length] = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drBurn") : 0;
                            torso.cor[torso.cor.length]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCor")  : 0;
                            torso.cr[torso.cr.length]   = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCr")   : 0;
                            torso.cut[torso.cut.length]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drCut")  : 0;
                            torso.fat[torso.fat.length]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drFat")  : 0;
                            torso.imp[torso.imp.length]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drImp")  : 0;
                            torso.pi[torso.pi.length]   = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drPi")   : 0;
                            torso.tox[torso.tox.length]  = foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  ? +foundry.utils.getProperty(object, bodyParts[i] + ".subLocation." + subParts[n] + ".drTox")  : 0;
                        }
                    }
                }
            }
        }

        // Get actual torso DR from the array based on the campaign setting

        let torsoDRForLargeAreaInjury = game.settings.get("gurps4e", "torsoDRForLargeAreaInjury");

        // Init the object to hold the torso armour for each type
        let selectedTorsoDR;

        if (torsoDRForLargeAreaInjury === "avg") {
            // For each damage type, add all the entries together and divide by length to get the average
            selectedTorsoDR = {
                burn: 	torso.burn.reduce((a, b) => a + b, 0) / torso.burn.length,
                cor: 	torso.cor.reduce((a, b) => a + b, 0) / torso.cor.length,
                cr: 	torso.cr.reduce((a, b) => a + b, 0) / torso.cr.length,
                cut: 	torso.cut.reduce((a, b) => a + b, 0) / torso.cut.length,
                fat: 	torso.fat.reduce((a, b) => a + b, 0) / torso.fat.length,
                imp: 	torso.imp.reduce((a, b) => a + b, 0) / torso.imp.length,
                pi: 	torso.pi.reduce((a, b) => a + b, 0) / torso.pi.length,
                tox: 	torso.tox.reduce((a, b) => a + b, 0) / torso.tox.length,
            };
        }
        else if (torsoDRForLargeAreaInjury === "lowest") {
            // Chose the lowest entry from each for the torso DR
            selectedTorsoDR = {
                burn: 	Math.min(...torso.burn),
                cor: 	Math.min(...torso.cor),
                cr: 	Math.min(...torso.cr),
                cut: 	Math.min(...torso.cut),
                fat: 	Math.min(...torso.fat),
                imp: 	Math.min(...torso.imp),
                pi: 	Math.min(...torso.pi),
                tox: 	Math.min(...torso.tox),
            };
        }
        // Else covers "highest" and catches errors.
        else {
            // Chose the highest entry from each for the torso DR
            selectedTorsoDR = {
                burn: 	Math.max(...torso.burn),
                cor: 	Math.max(...torso.cor),
                cr: 	Math.max(...torso.cr),
                cut: 	Math.max(...torso.cut),
                fat: 	Math.max(...torso.fat),
                imp: 	Math.max(...torso.imp),
                pi: 	Math.max(...torso.pi),
                tox: 	Math.max(...torso.tox),
            };
        }

        armour = { // Init the final largeAreaDR object which we will return at the end of the method
            burn: 	(Math.min(...lowest.burn)	+ selectedTorsoDR.burn) / 2,
            cor: 	(Math.min(...lowest.cor)	+ selectedTorsoDR.cor) / 2,
            cr: 	(Math.min(...lowest.cr)		+ selectedTorsoDR.cr) / 2,
            cut: 	(Math.min(...lowest.cut)	+ selectedTorsoDR.cut) / 2,
            fat: 	(Math.min(...lowest.fat)	+ selectedTorsoDR.fat) / 2,
            imp: 	(Math.min(...lowest.imp)	+ selectedTorsoDR.imp) / 2,
            pi: 	(Math.min(...lowest.pi)		+ selectedTorsoDR.pi) / 2,
            tox: 	(Math.min(...lowest.tox)	+ selectedTorsoDR.tox) / 2,
        };

        return armour;
    }

    static async applyDamage(flags, locationsHit, additionalMessage) {
        // Init required variables
        let target 			= game.scenes.get(flags.scene).tokens.get(flags.target).actor;
        let attacker 		= game.scenes.get(flags.scene).tokens.get(flags.attacker).actor;
        let attack 			= flags.attack;
        let targetST 		= target.system.primaryAttributes.knockback.value;
        let targetHex		= flags.targetHex;
        let effectiveTotalKnockbackDamage = 0; // This variable stores the accumulating effect of knockback from all hits
        let totalInjury 	= 0;
        let totalFatInj 	= 0;
        let damageReduction = 1;
        let largeArea		= false;
        let rangeDamageMult = flags.rangeDamageMult;
        let damageType = this.extractDamageType(attack);
        let largeAreaDR; // Only needed for largeArea attacks, but init here
        let strictInjuryCap = game.settings.get("gurps4e", "strictInjuryCap"); // Get the game setting which determines which version of the injury cap we're using.
        let armourDivisor;


        // Work out the correct value for the armour divisor
        if (typeof attack.armourDivisor == "undefined" || attack.armourDivisor === ""){ // Armour divisor is undefined or blank
            armourDivisor = 1; // Set it to the default of 1
        }
        else if (attack.armourDivisor.toString().toLowerCase().includes("cosmic") || attack.armourDivisor.toString().toLowerCase().includes("c")){
            armourDivisor = "Cosmic Ignores Armour"; // Set to a display string we will reference later to ignore armour
        }
        else if (attack.armourDivisor.toString().toLowerCase().includes("ignore") || attack.armourDivisor.toString().toLowerCase().includes("i")){
            armourDivisor = "Ignores Armour"; // Set to a display string we will reference later to ignore armour
        }
        else {
            armourDivisor = attack.armourDivisor; // Set it to whatever they entered.
        }

        // Work out if this is a Large Area Attack
        // The attack is an area attack or an explosion, making it a Large Area Attack (Rules for which are on B400)
        if (attack.damageType.toString().toLowerCase().includes("area") || attack.damageType.toString().toLowerCase().includes("la") || attack.damageType.toString().toLowerCase().includes("ex") ) {
            largeArea = true; // Set the area flag
            largeAreaDR = this.getLargeAreaDR(target.system.bodyType.body); // Store the largeAreaDR for later.
        }

        // Check to see if the target has damage reduction and store the value
        if (target.system.injuryTolerances){
            if (target.system.injuryTolerances.damageReduction){
                damageReduction = target.system.injuryTolerances.damageReduction; // Set the target's damage reduction
            }
        }

        // Start the html which will be displayed as a chat message
        let html = "<div>Damage for " + attacker.name + "'s " + attack.weapon + " " + attack.name + " against " + target.name + "</div>"; // Tell players what attack is being used and against which target

        if (additionalMessage) {
            html += "<hr>" + additionalMessage + "<br>" // If there's an additionalMessage, include it.
        }

        // Loop through the list of locations we've hit.
        for (let i = 0; i < locationsHit.length; i++){
            // Store the DR Damage type for later, including handling for special types like pi- or tbb
            let drDamageType = damageType.type;
            if (drDamageType === "tbb") { // For the purposes of DR only, set tbb attacks equivalent to burn since tbb still uses burning DR
                drDamageType = "burn";
            }
            else if (drDamageType.toLowerCase().includes("pi")) { // Any damage type including the letters pi faces pi dr.
                drDamageType = "pi";
            }

            // Begin DR totalling
            let drTotalEffectivePoints = 0; // This holds the running total for DR, accounting for any difference from armour divisors and multipliers.
            if (largeArea) { // If this is a largeArea attack
                locationsHit[i] = 'upperChest.subLocation.chest'; // Switch the location to the chest
                if (armourDivisor < 1) { // It's actually an armour multiplier
                    drTotalEffectivePoints = Math.floor(Math.max(foundry.utils.getProperty(largeAreaDR, drDamageType), 1) / armourDivisor); // Save the DR (Which we set to be at least 1), divided by the armour multiplier, rounded down.
                }
                else { // It's a regular armour divisor, handle normally.
                    drTotalEffectivePoints = Math.floor(foundry.utils.getProperty(largeAreaDR, drDamageType) / armourDivisor); // Save the DR, divided by the armour divisor, rounded down.
                }
            }

            let location = foundry.utils.getProperty(target.system.bodyType.body, locationsHit[i]); // Get the specific location we hit.

            let drGroupFlexible = true; // This variable is only true if all layers of armour are flexible.
            let layerDR = 0; // Init the variable used to store the total DR for this location.
            if (typeof location.dr !== "undefined" && location.dr !== null) {
                let drLayers = Object.keys(location.dr) // Get the keys for the dr objects on this location.



                for (let d = 0; d < drLayers.length; d++){ // Loop through the layers of DR on this location
                    let dr = foundry.utils.getProperty(location.dr[d], drDamageType); // Get the DR of this specific layer for the specific damage type we're looking at right now.
                    if (dr > 0 && !location.dr[d].flexible) { // If the dr of this location is not zero, and the location is not flexible, then there is rigid armour here
                        drGroupFlexible = false; // Set the flag false
                    }

                    let adAfterHardening = armourDivisor;
                    if (location.dr[d].hardness > 1){
                        adAfterHardening = attackHelpers.applyDRHardening(armourDivisor, location.dr[d].hardness - 1);
                    }

                    if (!adAfterHardening.toString().toLowerCase().includes("ignores")) { // If this attack is not ignoring armour
                        if (adAfterHardening < 1) { // It's actually an armour multiplier
                            drTotalEffectivePoints = drTotalEffectivePoints + (Math.max(dr, 1) / adAfterHardening); // Add the dr from this layer (minimum 1), adjusted by ad, to the running total.
                        }
                        else { // It's a regular armour divisor, handle normally.
                            drTotalEffectivePoints = drTotalEffectivePoints + (dr / adAfterHardening); // Add the dr from this layer, adjusted by ad, to the running total.
                        }
                    }
                    else { // If the attack is ignoring armour.
                        drTotalEffectivePoints = 0;
                    }
                }
            }

            if (drTotalEffectivePoints)

                drTotalEffectivePoints = Math.floor(drTotalEffectivePoints);

            // == End DR totalling

            // == Begin Damage roll section
            let damageStoppedByDice = 0; // This is any damage dealt, stopped by DR.
            let damageString = attack.damage
            let armourAsDice = false;

            if ( ( ((attack.type === "ranged") && game.settings.get("gurps4e", "armourAsDiceRanged")) || // It's a ranged attack and we've set them to use armour as dice, OR, it's a melee attack and they're set to use armour as dice.
                    ((attack.type === "melee") && game.settings.get("gurps4e", "armourAsDiceMelee")) ) && // OR, it's a melee attack and they're set to use armour as dice.
                drTotalEffectivePoints >= 7) { // And there is 7 or more DR.
                armourAsDice = true; // Store this flag so it's easier to reference later.

                let points = generalHelpers.diceAndAddsToPoints(attack.damage)

                if (rangeDamageMult === 0.5) { // If the attack was made beyond half range
                    points = points * rangeDamageMult; // Halve the points before accounting for armour as dice.
                    html += "<div>Damage was halved due to attacking at beyond 1/2D Range</div>"
                }

                let pointsAfterDR = Math.max(Math.floor(points - drTotalEffectivePoints), 0); // Subtract DR from average damage. Armour as dice rounds damage down in the case of fractions. Minimum zero.
                damageStoppedByDice = points - pointsAfterDR; // This is any damage that wasn't rolled because it was stopped by armour as dice.

                html += "<div>Armour as dice blocked " + generalHelpers.pointsToDiceAndAddsString(damageStoppedByDice) + " damage</div>"

                if (pointsAfterDR > 0) { // If armour didn't stop everything
                    damageString = generalHelpers.pointsToDiceAndAddsString(pointsAfterDR);
                }
                else { // Armour stopped everything
                    damageString = "0";
                }

                html += "<div>" + damageString + " damage remains</div>"

                drTotalEffectivePoints = 0; // Set this back to zero so that when we run the code below to deduct DR from roll damage, we don't need special handling for armour as dice.
            }

            // == Carry on to roll damage. By this point, the damage string has been reduced by armour as dice, if it applies for this attack.

            // Roll damage for the attack
            let roll = new Roll(damageString); // Roll the damage string we built above
            let damageRoll = await roll.roll({evaluateSync: true}); // Await the result
            let adds = 0; // Init adds as 0

            // Display dice and damage total for this location.
            html += "<hr><div>" + attackHelpers.buildLocationLabel(target, locationsHit[i]) + "</div>";
            html += "<div>";
            if(damageRoll.terms[0].results){
                if(damageRoll.terms[0].results.length){ // Take the results of each roll and turn it into a die icon.
                    for (let k = 0; k < damageRoll.terms[0].results.length; k++){
                        if (damageType.explosive && !targetHex && game.settings.get("gurps4e", "contactExplosionsFromAttacks")){ // If it's an explosive attack that is not striking the hex, it's a contact explosion
                            html += "<label class='fa fa-dice-six fa-2x' style='color: #d24502'></label>" // Explosives do max damage on contact, colour the dice all special to draw attention to this
                        }
                        else {
                            html += rollHelpers.dieToSmallIcon(damageRoll.terms[0].results[k].result)
                        }
                    }
                }
                adds = (+damageRoll._total - +damageRoll.dice[0].total);
            }
            else {
                adds = +damageRoll._total;
            }

            if (adds > 0){ // Adds are positive
                html += "<label class='damage-dice-small-adds'>+</label><label class='damage-dice-small-adds'>" + adds + "</label>"
            }
            else if (adds < 0) { // Adds are negative
                html += "<label class='damage-dice-small-adds'>-</label><label class='damage-dice-small-adds'>" + Math.abs(adds) + "</label>"
            }

            // Begin the part where we total up the damage.
            let totalDamage = 0;

            if (damageType.explosive && !targetHex && game.settings.get("gurps4e", "contactExplosionsFromAttacks")) { // The attack is explosive and not targeting the hex, therefore it's a contact explosion
                if (typeof damageRoll.terms[0].results !== "undefined") {
                    totalDamage = (6 * (damageRoll.terms[0].results.length)) + adds;
                }
                else {
                    totalDamage = damageRoll.total;
                }
            }
            else {
                totalDamage = damageRoll.total;
            }

            if (rangeDamageMult === 0.5 && !armourAsDice) { // If the attack was made beyond half range and we haven't already halved damage due to using armour as dice.
                totalDamage = Math.floor(totalDamage * rangeDamageMult); // Halve damage and round down.
            }

            if (totalDamage <= 0) { // If damage is 0 or less, account for minimum damage for each type
                if (damageType.type === "cr") { // Minimum crushing damage is 0
                    totalDamage = 0;
                }
                else{ // Minimum damage for any other type is 1
                    totalDamage = 1;
                }
            }

            if (rangeDamageMult === 0.5 && !armourAsDice) { // If the attack was made beyond half range and we haven't already halved damage due to using armour as dice.
                html += "<label class='damage-dice-small-adds'>/2 = " + totalDamage + "</label>"; // Include "/2" in the string so it's clear the result was halved.
            }
            else {
                html += "<label class='damage-dice-small-adds'> = " + totalDamage + "</label>";
            }

            if (parseInt(armourDivisor.toString()) !== 1 && largeArea){
                html += "<label class='damage-dice-small-adds'> (" + armourDivisor + ") Large Area Injury</label>";
            }
            else if (parseInt(armourDivisor.toString()) !== 1){
                html += "<label class='damage-dice-small-adds'> (" + armourDivisor + ")</label>";
            }
            else if (largeArea) {
                html += "<label class='damage-dice-small-adds'> Large Area Injury</label>";
            }

            html += "</div>";



            // Deduct armour from damage and check blunt trauma and knockback. If we used armour as dice above then drTotalEffectivePoints has already been set back to 0 so it's fine.
            let effectiveLocationKnockbackDamage = totalDamage + damageStoppedByDice; // Knockback is calculated based on total damage, including any damage stopped by armour as dice.
            let effectiveBluntTraumaDamage = damageStoppedByDice; // Blunt trauma is calculated based on only the damage stopped by dr. Start with any damage stopped by armour as dice. More will be added later if necessary
            let bluntTraumaWounding = 0; // This variable stores the actual wounding as a result of blunt trauma. It will remain zero if something blocked blunt trauma from happening.
            let damageThroughArmour = Math.max(totalDamage - drTotalEffectivePoints, 0); // This is what actually makes it past the armour. Minimum zero.

            // Apply the effects of edgeProtection, if it's in use
            if (game.settings.get("gurps4e", "edgeProtection") && (damageType.type === "cut") && (!((totalDamage > (drTotalEffectivePoints * 2))))) { // If edge protection is enabled, damage type is cutting, and damage is not more than double DR.
                damageType.type = "cr"; // Switch damage type to crushing. This accounts for the reduced wound multiplier, but also knockback and blunt trauma.
                damageType.bluntTraumaCapable = true;
                damageType.bluntReq = 5;
                damageType.woundModId = "personalWoundMultCr";
                html += "<div>Edge protection applies, causing the cutting attack to be treated as crushing.</div>";
            }

            effectiveBluntTraumaDamage = effectiveBluntTraumaDamage + Math.min(totalDamage, drTotalEffectivePoints); // The amount stopped by armour is the lower of the damage dealt or DR present.

            // Check for blunt trauma
            if (damageType.bluntTraumaCapable && // The attack needs to be capable of blunt trauma
                (drGroupFlexible || game.settings.get("gurps4e", "rigidBluntTrauma") || largeArea) && // AND either the armour needs to be flexible OR the setting to allow blunt trauma to rigid armour needs to be on, OR this is a large area injury.
                (game.settings.get("gurps4e", "allowBluntTraumaWithWounding") || damageThroughArmour <= 0)){ // AND either we need to be allowing blunt trauma with wounding OR there must not be any wounding.

                bluntTraumaWounding = Math.floor(effectiveBluntTraumaDamage / damageType.bluntReq); // Work out bluntTraumaWounding, rounded down
            }

            // Check to make sure the damage type is capable of knockback
            if (!(damageType.type === "cr" || damageType.type === "cut")) { // Only cr and cutting attacks can do knockback.
                effectiveLocationKnockbackDamage = 0; // If it's neither, set effectiveKnockbackDamage to zero.
            }

            if (damageThroughArmour > 0) { // Damage has penetrated DR
                damageThroughArmour = Math.floor(damageThroughArmour); // Round down to a whole number
                html += "<div>" + damageThroughArmour + " damage gets through</div>";

                // Knockback does not happen upon penetrating DR unless it was crushing.
                if (!(damageType.type === "cr")) { // Only cr attacks can do knockback while penetrating armour.
                    effectiveLocationKnockbackDamage = 0; // If it's not, set effectiveLocationKnockbackDamage to zero.
                }
            }

            // Apply doubleKnockback if relevant.
            if (effectiveLocationKnockbackDamage && damageType.doubleKnockback) { // If the attack has accumulated some knockback, and the attack has the doubleKnockback flag
                effectiveLocationKnockbackDamage *= 2; // Double the value.
            }

            // Run all woundCap logic
            let woundCap; // Init the variable we are about to set.
            if (game.settings.get("gurps4e", "largeAreaBypassesInjuryCap") && largeArea) { // This is a large area attack and the game setting which allows LAA to bypass injury caps is on.
                woundCap = Infinity; // Wound cap is infinite
            }
            else { // In all other cases, set the wound cap normally.
                woundCap = strictInjuryCap ? location.injuryCapStrict : location.injuryCap; // Set the injury cap style based on the game setting above
            }

            // Run logic for actual calculation and application of wounding
            let injury = 0; // Init the value we'll use to store wounding as a result of injury before we assign it to the target's hp
            let actualWounding = 0; // Init the value we'll use to store total wounding, which includes both injury and blunt trauma

            // Account for the effect of a wound modifier, including untyped damage, on the injury
            if (damageType.woundModId.toString().toLowerCase().includes("dam")) { // Check for untyped damage
                injury = Math.floor( (damageThroughArmour / damageReduction) ); // Damage divided by damageReduction, rounded down.
            }
            else if (damageType.type === "fat") { // Attack is doing fatigue damage
                totalFatInj += Math.floor(actualDamage * location.personalWoundMultFat);
            }
            else {
                injury = Math.floor(((damageThroughArmour * foundry.utils.getProperty(location, damageType.woundModId)) / damageReduction) ); // Damage, times the relevant wound modifier, divided by damageReduction, rounded down.
            }

            // Account for the impact of diffuse injury tolerance (Other injury tolerances are already built in to the location's wound mod)
            if (target.system.injuryTolerances.diffuse) { // Target is diffuse
                if (damageType.woundModId.toString().toLowerCase().includes("imp") || damageType.woundModId.toString().toLowerCase().includes("pi")) { // Attack is imp or pi
                    injury = Math.min(injury, 1); // Imp/pi attacks vs diffuse targets are capped at 1 wounding
                    if (damageType.woundModId.toString().toLowerCase().includes("imp")) { // It was impaling
                        html += "<div>Injury is capped at 1 due to the target being diffuse and the attack being impaling</div>";
                    }
                    else { // Otherwise it was piercing
                        html += "<div>Injury is capped at 1 due to the target being diffuse and the attack being piercing</div>";
                    }
                }
                else { // Attack is not imp or pi
                    injury = Math.min(injury, 2); // All other attacks vs diffuse targets are capped at 2 wounding
                    html += "<div>Injury is capped at 2 due to the target being diffuse</div>";
                }
            }

            // Run the logic to apply damage, if any.
            actualWounding = (injury + bluntTraumaWounding)
            if (actualWounding > 0) {// Check to see if there is any injury or bluntTraumaWounding, as fatigue attacks will actually have this set to 0;
                // Apply damage to the location if it tracks HP, including a check to see if there's a sublocation involved
                if (location.id.toLowerCase().includes("sublocation")) { // This is a sub location, we will be checking the parent for an HP value
                    let subLocation = location.id.split(".")[0]
                    let parentLocation = foundry.utils.getProperty(target.system.bodyType.body, subLocation);
                    if (parentLocation.hp){ // If the parent location tracks HP (Such as when we've struck a thigh but want to apply damage to the leg as a whole)
                        // Cap injury + bluntTraumaWounding with the woundCap
                        if (typeof woundCap !== "undefined"){
                            if (woundCap < 0){ // If the wound cap is less than zero for some reason, fix it
                                woundCap = 0;
                            }

                            if (woundCap !== Infinity) { // If the wound cap is not infinity
                                woundCap = parentLocation.hp.value; // Bring the wound cap down to the HP left in the location.
                                // Example of above: An ST/HP 10 actor has legs with 6 HP each, and the legs also have an injury cap of 6 HP.
                                // If the legs are at full HP, the cap is 6, as it should be.
                                // If the legs are injured, the cap is whatever's left in the leg. Again, as it should be.
                                if (actualWounding > woundCap) { // Only print wound cap related messages if it would become relevant.
                                    if (woundCap === parentLocation.hp.max) { // Wound cap matches an undamaged example of this location
                                        html += "<div>Injury is capped at " + woundCap + " due to striking an undamaged limb.</div>";
                                    }
                                    else if (woundCap === 0) { // Wound cap is 0, probably because this location is crippled
                                        html += "<div>No injury is possible due to striking an already crippled limb.</div>";
                                    }
                                    else if (woundCap < parentLocation.hp.max) { // Wound cap is not zero, but also less than the max for this location. The location has probably already been damaged.
                                        html += "<div>Injury is capped at " + woundCap + " due to striking a damaged limb.</div>";
                                    }
                                }
                            }
                            actualWounding = Math.min(woundCap, actualWounding); // Actual wounding is injury plus blunt trauma, capped by any wound cap.
                        }
                        parentLocation.hp.value -= actualWounding; // Apply the actualWounding we calculated above.
                        parentLocation.hp.value = Math.max(parentLocation.hp.value, -parentLocation.hp.max) // The hp in a location should not go lower than full negative, as at full negative the location is already cut off or otherwise destroyed.
                        target.system.bodyType.body[subLocation].hp.value = parentLocation.hp.value;
                    }

                    if (location.hp){ // Apply damage to the child location if it tracks HP
                        location.hp.value -= actualWounding;
                        location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
                        const splitLocation = location.id.split(".");
                        target.system.bodyType.body[splitLocation[0]][splitLocation[1]][splitLocation[2]].hp.value = location.hp.value;
                    }
                }
                else { // This is not a sublocation
                    if (location.hp){ // Apply damage to the location if it tracks HP
                        // Cap actualWounding with the woundCap
                        if (typeof woundCap !== "undefined"){
                            if (woundCap < 0){ // If the wound cap is less than zero for some reason, fix it
                                woundCap = 0;
                            }

                            if (woundCap !== Infinity) { // If the wound cap is not infinity
                                woundCap = location.hp.value; // Bring the wound cap down to the HP left in the location.
                                // Example of above: An ST/HP 10 actor has legs with 6 HP each, and the legs also have an injury cap of 6 HP.
                                // If the legs are at full HP, the cap is 6, as it should be.
                                // If the legs are injured, the cap is whatever's left in the leg. Again, as it should be.
                                if (actualWounding > woundCap) { // Only print wound cap related messages if it would become relevant.
                                    if (woundCap === location.hp.max) { // Wound cap matches an undamaged example of this location
                                        html += "<div>Injury is capped at " + woundCap + " due to striking an undamaged limb.</div>";
                                    }
                                    else if (woundCap === 0) { // Wound cap is 0, probably because this location is crippled
                                        html += "<div>No injury is possible due to striking an already crippled limb.</div>";
                                    }
                                    else if (woundCap < location.hp.max) { // Wound cap is not zero, but also less than the max for this location. The location has probably already been damaged.
                                        html += "<div>Injury is capped at " + woundCap + " due to striking a damaged limb.</div>";
                                    }
                                }
                            }

                            actualWounding = Math.min(woundCap, actualWounding); // Actual wounding is injury plus blunt trauma, capped by any wound cap.
                        }

                        location.hp.value -= actualWounding
                        location.hp.value = Math.max(location.hp.value, -location.hp.max) // Value should be the higher of it's actual value and full negative HP.
                    }
                }
            }

            // Inform the user of injury and or blunt trauma
            if (actualWounding <= 0) { // There was no wounding at all
                html += "<div>The armour stops all damage and the attack does no blunt trauma</div>";
            }
            else if (injury <= 0 && bluntTraumaWounding > 0) { // All wounding was a result of blunt trauma
                html += "<div>The armour stops all damage but the attack does " + actualWounding + " blunt trauma</div>";
            }
            else if (injury > 0 && bluntTraumaWounding <= 0) { // All wounding was a result of injury
                html += "<div>The location takes " + actualWounding + " injury</div>";
            }
            else if (injury > 0 && bluntTraumaWounding > 0) {  // Wounding was a result of both injury and blunt trauma
                html += "<div>The location takes " + actualWounding + " injury, " + bluntTraumaWounding + " of which was blunt trauma</div>";
            }

            // Final logic for this location hit.
            totalInjury += actualWounding; // Add the actualWounding for this location to the running total injury.
            effectiveTotalKnockbackDamage += effectiveLocationKnockbackDamage; // Add any knockback accumulated from this location hit to the total knockback for the whole attack.
            // Any fatigue damage was already added to the running total above.
        } // End of loop for the specific location hit

        // Start of logic that applies more generally to the target, and not specific locations.

        // Inform the user of any lost fatigue
        if (totalFatInj > 0) {
            html += "<div>The target loses " + totalFatInj + " fatigue</div>";
        }

        // Apply the effects of lost FP and HP
        if (totalInjury > 0){ // If they took damage
            let newHP = target.system.reserves.hp.value - Math.floor(totalInjury); // Create a new object that has the correctly updated hp value
            target.system.reserves.hp.value = newHP; // Assign the new object to the existing hp value
        }

        if (totalFatInj > 0){
            let newFP = target.system.reserves.fp.value - Math.floor(totalFatInj); // Create a new object that has the correctly updated fp value
            target.system.reserves.fp.value = newFP; // Assign the new object to the existing fp value
        }

        // Apply all the knockback damage we've accrued, if any
        effectiveTotalKnockbackDamage = Math.floor(effectiveTotalKnockbackDamage); // Round down, just in case we ended up with a decimal.
        if (effectiveTotalKnockbackDamage > 0) { // If we have any knockback accumulated
            let yardsOfKnockback = Math.floor(effectiveTotalKnockbackDamage / target.system.primaryAttributes.knockback.value); // Divide accumulated knockback damage by the target's knockback specific ST value to get the number of yards the target is knocked back. Rounded down.

            if (yardsOfKnockback > 0) { // The target is actually getting pushed back
                html += "<hr>" + target.name + " is knocked back " + yardsOfKnockback + " yards and must roll at -" + (yardsOfKnockback - 1) + " to avoid falling down."; // Tell the user how far the target was moved, and the penalty for the roll.
                html += "<br><input type='button' class='knockbackFall' value='Roll to avoid falling down' alt='" + (yardsOfKnockback - 1) + "'/>"; // Create a button to handle the roll to not fall down.
                let damageFromVelocity = generalHelpers.velocityToDamage(target.system.reserves.hp.max, yardsOfKnockback) // Work out the damage from a possible collision.

                if (damageFromVelocity.hard === "0d6+0" && damageFromVelocity.soft === "0d6+0") { // Neither type of collision would cause damage.
                    html += "<hr>Even if there was a collision, it would cause no damage.";
                }
                else if (damageFromVelocity.hard === "0d6+0" && damageFromVelocity.soft === "0d6+0") { // Only a hard collision would case damage.
                    html += "<hr>If there is a collision, it causes " + damageFromVelocity.hard + " damage. Striking a soft object would instead do no damage.";
                }
                else { // Either type of collision would cause damage, OR, something went wrong with the above logic.
                    html += "<hr>If there is a collision, it causes " + damageFromVelocity.hard + " damage. Striking a soft object instead does " + damageFromVelocity.soft + " damage.";
                }

                // flags = { // Compile flags that will be passed along through the chat messages
                // 	target: target.id,
                // 	attacker: attacker.id,
                // 	scene: target.scene.id,
                // 	attack: attack,
                // 	margin: rollInfo.margin,
                // 	effectiveSkill: (+attack.level + +totalModifiers)
                // }
            }
        }

        target.update({ 'data': target.system }); // Update the target object to properly save the new values for hp, fp, and any location specific effects.
        // console.log(target.token.effects);
        // console.log(typeof target.token.effects);
        ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_STYLES.OTHER, flags: flags }); // Create a chat message telling the user all about what happened above.
    }

    static extractDamageType(attack) {
        let damageType = {
            type: "",
            explosive: false,
            doubleKnockback: false,
            noWounding: false,
            doubleBluntTrauma: false,
            bluntTraumaCapable: false,
            bluntReq: 20,
            woundModId: "",
        }

        // Find the damage type. Start by doing pi in an order that will not cause it to find pi when really it's pi++
        if (attack.damageType.toLowerCase().includes("pi-")) {
            damageType.type = "pi-"
            damageType.bluntTraumaCapable = true;
            damageType.bluntReq = 10;
            damageType.woundModId = "personalWoundMultPim";
        }
        else if (attack.damageType.toLowerCase().includes("pi++")) {
            damageType.type = "pi++"
            damageType.bluntTraumaCapable = true;
            damageType.bluntReq = 10;
            damageType.woundModId = "personalWoundMultPipp";
        }
        else if (attack.damageType.toLowerCase().includes("pi+")) {
            damageType.type = "pi+"
            damageType.bluntTraumaCapable = true;
            damageType.bluntReq = 10;
            damageType.woundModId = "personalWoundMultPip";
        }
        else if (attack.damageType.toLowerCase().includes("pi")) {
            damageType.type = "pi"
            damageType.bluntTraumaCapable = true;
            damageType.bluntReq = 10;
            damageType.woundModId = "personalWoundMultPi";
        }
        else if (attack.damageType.toLowerCase().includes("imp")) {
            damageType.type = "imp"
            damageType.bluntTraumaCapable = true;
            damageType.bluntReq = 10;
            damageType.woundModId = "personalWoundMultImp";
        }
        else if (attack.damageType.toLowerCase().includes("burn")) {
            damageType.type = "burn"
            damageType.woundModId = "personalWoundMultBurn";
        }
        else if (attack.damageType.toLowerCase().includes("cor")) {
            damageType.type = "cor"
            damageType.woundModId = "personalWoundMultCor";
        }
        else if (attack.damageType.toLowerCase().includes("cr")) {
            damageType.type = "cr"
            damageType.bluntTraumaCapable = true;
            damageType.bluntReq = 5;
            damageType.woundModId = "personalWoundMultCr";
        }
        else if (attack.damageType.toLowerCase().includes("cut")) {
            damageType.type = "cut"
            damageType.bluntTraumaCapable = true;
            damageType.bluntReq = 10;
            damageType.woundModId = "personalWoundMultCut";
        }
        else if (attack.damageType.toLowerCase().includes("fat")) {
            damageType.type = "fat"
            damageType.woundModId = "personalWoundMultFat";
        }
        else if (attack.damageType.toLowerCase().includes("tox")) {
            damageType.type = "tox"
            damageType.woundModId = "personalWoundMultTox";
        }
        else if (attack.damageType.toLowerCase().includes("tbb")) {
            damageType.type = "tbb"
            damageType.woundModId = "personalWoundMultTbb";
        }
        else if (attack.damageType.toLowerCase().includes("dam")) {
            damageType.type = "dam"
            damageType.woundModId = "personalWoundMultDam";
        }
        else { // Default to crushing
            damageType.type = "cr"
            damageType.bluntTraumaCapable = true;
            damageType.woundModId = "personalWoundMultCr";
        }

        // Special flags
        if (attack.damageType.toLowerCase().includes("ex")) {
            damageType.explosive = true;
        }
        if (attack.damageType.toLowerCase().includes("dbk")) {
            damageType.doubleKnockback = true;
        }
        if (attack.damageType.toLowerCase().includes("dbt")) {
            damageType.doubleBluntTrauma = true;
            damageType.bluntTraumaCapable = true;
        }
        if (attack.damageType.toLowerCase().includes("nw")) {
            damageType.noWounding = true;
        }

        if (damageType.doubleBluntTrauma){
            damageType.bluntReq = damageType.bluntReq / 2;
        }

        return damageType;
    }

    static async resetDamage() {
        let reserves = {
            er: {
                value: this.system.reserves.er.max
            },
            hp: {
                value: this.system.reserves.hp.max
            },
            fp: {
                value: this.system.reserves.fp.max
            }
        }

        this.system.reserves = reserves

        let keys = Object.keys(this.system.bodyType.body);

        for (let k = 0; k < keys.length; k++) {
            let location = foundry.utils.getProperty(this.system.bodyType.body, keys[k]);

            if (location.hp){ // Check to see if the location tracks HP
                location.hp.value = location.hp.max; // Reset HP
            }
            if (location.subLocation) { // Check to see if the location has sublocations
                let subLocationKeys = Object.keys(location.subLocation); // Gather the subLocation keys for the loop
                for (let l = 0; l < subLocationKeys.length; l++) { // Loop through the subLocations
                    let subLocation = foundry.utils.getProperty(location.subLocation, subLocationKeys[l]);
                    if (subLocation.hp) { // Check to see if the subLocation tracks HP
                        subLocation.hp.value = subLocation.hp.max; // Reset HP
                    }
                }
            }
        }

        this.update({ 'data': this.system });
    }
}
