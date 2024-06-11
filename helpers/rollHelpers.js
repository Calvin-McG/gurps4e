export class rollHelpers {

    /**
     *
     * @param level The base skill level
     * @param modifier The modifier on the roll
     * @param label A label to include as part of the chat message
     * @param chat Boolean, whether to display the chat message as part of this call, or return the results for a more detailed chat message elsewhere.
     * @param combatExempt Boolean, if true, BAD does not apply.
     * @returns {Promise<{result: *, margin: number, crit: boolean, success: boolean, type: *, content: string}>}
     */
    static async skillRoll(level, modifier, label, chat, combatExempt){
        let bad = canvas.scene?.flags?.gurps4e?.bad ?? 0; // Get BAD from the scene flags, falling back to zero
        bad = parseInt(bad); // Parse to an int, just in case.
        modifier = parseInt(modifier); // Parse to int for better equality handling and addition below
        level = parseInt(level); // Parse to int for better equality handling and addition below
        let isPlayer = !game.user.isGM; // game.user.isGM returns true for GMs, and false for players, so take the opposite.

        if (!isPlayer || combatExempt || isNaN(bad)) { // If not a player OR this is a combat related roll and therefore exempt OR BAD ended up NaN and we need to discard it.
            bad = 0; // Default back to zero.
        }
        console.log(bad)

        let effectiveSkill = +level + +modifier + +bad;
        let roll = new Roll("3d6");
        let crit = false;
        let success = false;

        let result = await roll.roll({evaluateSync: true})

        let skillRoll = result.result;
        let margin = +effectiveSkill - +skillRoll;
        let html = "<div>" + label + "</div>";

        html += "</br>";
        html += "<span class='tooltip'>Rolls a " + skillRoll + " vs " + (+level + +modifier + +bad);

        // Begin assembling tooltip text
        html += "<span class='tooltiptext' style='margin-left: -40px !important;'>" + level;

        // Modifier display
        if(modifier !== 0) {
            if(modifier > 0) { // Modifier is positive
                html += " + ";
            }
            else if (modifier < 0) { // Modifier is negative, use Math.abs to allow repositioning the negative symbol.
                html += " - ";
            }
            html += Math.abs(modifier)
        }

        // BAD display
        if (bad !== 0) {
            if(bad > 0) { // BAD is positive
                html += " + ";
            }
            else if (bad < 0) { // BAD is negative, use Math.abs to allow repositioning the negative symbol.
                html += " - ";
            }
            html += Math.abs(bad) + "<span style='font-size: 0.5em; position: relative; top: -0.5em'>(BAD)</span>";
        }

        html += " = " + (+level + +modifier + +bad);

        html += "</span></span>";
        // End assembling tooltip text

        //Code block for display of dice
        html += "<div>";
        html += this.dieToIcon(roll.terms[0].results[0].result);
        html += this.dieToIcon(roll.terms[0].results[1].result);
        html += this.dieToIcon(roll.terms[0].results[2].result);

        html += "<label class='damage-dice-adds'>"

        if (modifier !== 0) {
            if (modifier > 0) { // Modifier is positive
                html += "+"
            }
            else if (modifier < 0) { // Modifier is negative
                html += "-"
            }
            html += "</label>"
            html += "<label class='damage-dice-adds'>" + Math.abs(modifier) + "</label>"
        }

        if (bad !== 0) {
            html += "<label class='damage-dice-adds'>"
            if(bad > 0) { // BAD is positive
                html += "+";
            }
            else if (bad < 0) { // BAD is negative, use Math.abs to allow repositioning the negative symbol.
                html += "-";
            }
            html += Math.abs(bad) + "<span style='font-size: x-small; position: relative; top: -2.5em'>(BAD)</span>";
            html += "</label>"
        }


        html += "</div>"

        if (skillRoll == 18) { //18 is always a crit fail
            html += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Automatic Crit Fail by " + margin + "</div>"
            crit = true;
            success = false;
        }
        else if (skillRoll == 17) { //17 is a crit fail if effective skill is less than 16, autofail otherwise
            if (effectiveSkill < 16) { //Less than 16, autocrit
                html += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Automatic Crit Fail by " + margin + "</div>"
                crit = true;
                success = false;
            }
            else {//Autofail
                html += "<div style='font-weight: bold; color: rgb(199, 137, 83);'>Automatic Fail by " + margin + "</div>"
                crit = false;
                success = false;
            }
        }
        else if (margin <= -10) { //Fail by 10 is a crit fail
            html += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Crit Fail by " + margin + "</div>"
            crit = true;
            success = false;
        }
        else if (margin < 0) { //Fail is a fail
            html += "<div style='font-weight: bold; color: rgb(199, 137, 83);'>Fail by " + margin + "</div>"
            crit = false;
            success = false;
        }
        else if (skillRoll === 3 || skillRoll === 4) { //3 and 4 are always a crit success
            html += "<div style='font-weight: bold; color: rgb(106, 162, 106)'>Automatic Critical Success by " + margin + "</div>"
            crit = true;
            success = true;
        }
        else if (skillRoll === 5 && effectiveSkill >= 15) { //5 is a crit if effective skill is 15
            html += "<div style='font-weight: bold; color: rgb(106, 162, 106)'>Critical Success by " + margin + "</div>"
            crit = true;
            success = true;
        }
        else if (skillRoll === 6 && effectiveSkill >= 16) { //6 is a crit if effective skill is 16
            html += "<div style='font-weight: bold; color: rgb(106, 162, 106)'>Critical Success by " + margin + "</div>"
            crit = true;
            success = true;
        }
        else if (margin === 0) { // Regular success
            html += "<div style='font-weight: bold; color: rgb(141, 142, 222)'>Exact Success</div>"
            crit = false;
            success = true;
        }
        else if (margin > 0) { // Regular success
            html += "<div style='font-weight: bold; color: rgb(141, 142, 222)'>Success by " + margin + "</div>"
            crit = false;
            success = true;
        }
        else {//Wtf?
            html += "<div style='font-weight: bold;'>Unknown result by " + margin + "</div>"
            crit = false;
            success = false;
        }

        if (chat){
            ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_STYLES.OTHER });
        }
        else {
            return {
                content: html,
                crit: crit,
                success: success,
                margin: margin,
                result: result.result,
                type: CONST.CHAT_MESSAGE_STYLES.OTHER
            }
        }
    }

    static async charmCraftingRoll(modifier, label, chat){
        let roll;

        if (typeof modifier !== 'number') {
            roll = new Roll("3d6"); // Define the roll
        }
        else {
            if(modifier >= 0) { // Modifier is zero or positive
                roll = new Roll("3d6 + " + modifier.toString()); // Define the roll
            }
            else {
                roll = new Roll("3d6 " + modifier.toString()); // Define the roll
            }
        }

        let rollResult = await roll.roll({evaluateSync: true}) // Make the roll

        let result = rollResult.total; // Get the result

        let html = "<div>" + label + "</div>"; // Init the HTML we will output as part of the chat message.

        html += "</br>";

        html += "<span class='tooltip'>Rolls a " + rollResult.result + "</span>";


        // Code block for display of dice
        html += "<div>";
        html += this.dieToIcon(roll.terms[0].results[0].result);
        html += this.dieToIcon(roll.terms[0].results[1].result);
        html += this.dieToIcon(roll.terms[0].results[2].result);

        if (modifier >= 0){ // Modifier is positive
            html += "<label class='damage-dice-adds'>+</label><label class='damage-dice-adds'>" + modifier + "</label>"
        }
        else { // Modifier is negative
            html += "<label class='damage-dice-adds'>-</label><label class='damage-dice-adds'>" + Math.abs(modifier) + "</label>"
        }
        html += "</div>"

        if (result >= 17) { // A result of 17 or more is a crit fail based on the spell's full energy
            html += "<div style='font-weight: bold; color: rgb(208, 127, 127)'>Critical Failure based on the spell's full energy.</div>"
        }
        else if (result === 16) { // A result of 16 is a crit fail based on half the spell's energy
            html += "<div style='font-weight: bold; color: rgb(199, 137, 83);'>Critical Failure based on half the spell's energy.</div>"
        }
        else { // Anything less than 15 is a success
            html += "<div style='font-weight: bold; color: rgb(141, 142, 222)'>Success, now roll for Quirks.</div>"
        }

        if (chat){
            ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_STYLES.OTHER });
        }
        else {
            return {
                content: html,
                crit: crit,
                success: success,
                margin: margin,
                type: CONST.CHAT_MESSAGE_STYLES.OTHER
            }
        }
    }

    static async rangedAttackRoll(level, modifier, label, chat, malfInput){
        let effectiveSkill = +level + +modifier;
        let roll = new Roll("3d6");
        let crit = false;
        let success = false;
        let malfunction = false;
        let malf = parseInt(malfInput);
        if (typeof malf == "undefined" || malf < 0) {
            malf = 17;
        }
        let malfPlus = false;
        if (typeof malfInput == "string") {
            malfPlus = malfInput.includes("+");
        }
        let result = await roll.roll({evaluateSync: true})

        let skillRoll = result.result;
        let margin = +effectiveSkill - +skillRoll;
        let html = "<div>" + label + "</div>";

        html += "</br>";

        if(modifier >= 0) { //modifier is zero or positive
            html += "<span class='tooltip'>Rolls a " + skillRoll + " vs " + (+level + +modifier) +
                "<span class='tooltiptext'>" + level + " + " + modifier + "</span>" +
                "</span>";
        }
        else {
            html += "<span class='tooltip'>Rolls a " + skillRoll + " vs " + (+level + +modifier) +
                "<span class='tooltiptext'>" + level + " - " + Math.abs(modifier) + "</span>" +
                "</span>"; // Run Math.abs to allow repositioning the negative symbol.
        }

        // Code block for display of dice
        html += "<div>";
        html += this.dieToIcon(roll.terms[0].results[0].result);
        html += this.dieToIcon(roll.terms[0].results[1].result);
        html += this.dieToIcon(roll.terms[0].results[2].result);
        if (modifier >= 0){ // Modifier is positive
            html += "<label class='damage-dice-adds'>+</label><label class='damage-dice-adds'>" + modifier + "</label>"
        }
        else { // Modifier is negative
            html += "<label class='damage-dice-adds'>-</label><label class='damage-dice-adds'>" + Math.abs(modifier) + "</label>"
        }
        html += "</div>"

        if (skillRoll >= 17) { // 17+ is an autofail, but the gun may or may not malfunction depending on the malf value of the gun
            if (malfPlus){ // Malfunction is "17+"
                // Make the second roll to check to see if the weapon really malfunctions
                if ((Math.floor(Math.random() * 10000) + 1)  <= 185) { // The gun did malfunction
                    malfunction = true;
                    html += "<div style='font-weight: bold; color: rgb(199, 137, 83);'>Automatic Failure by " + margin + " and the weapon malfunctions.</div>"
                    crit = false;
                    success = false;
                }
                else { // The gun did not malfunction
                    malfunction = false;
                    html += "<div style='font-weight: bold; color: rgb(199, 137, 83);'>Automatic Failure by " + margin + "</div>"
                    crit = false;
                    success = false;
                }
            }
        }
        else if (margin < 0) { // Fail is a fail
            if (skillRoll >= malf) { // The roll is equal or greater than the malf number
                html += "<div style='font-weight: bold; color: rgb(199, 137, 83);'>Fail by " + margin + " and the weapon malfunctions.</div>"
                crit = false;
                success = false;
                malfunction = true;
            }
            else {
                html += "<div style='font-weight: bold; color: rgb(199, 137, 83);'>Fail by " + margin + "</div>"
                crit = false;
                success = false;
                malfunction = false;
            }
        }
        else if (skillRoll == 3 || skillRoll == 4) { // 3 and 4 are always a crit success
            html += "<div style='font-weight: bold; color: rgb(106, 162, 106)'>Automatic Critical Success by " + margin + "</div>"
            crit = true;
            success = true;
        }
        else if ((skillRoll == 5 && effectiveSkill == 15) || (skillRoll == 6 && effectiveSkill == 16)) { // 5 is a crit if effective skill is 15, and 6 is a crit if effective skill is 16
            html += "<div style='font-weight: bold; color: rgb(106, 162, 106)'>Critical Success by " + margin + "</div>"
            crit = true;
            success = true;
        }
        else if (margin >= 0) { // Regular success
            if (skillRoll >= malf) { // The roll is equal or greater than the malf number
                html += "<div style='font-weight: bold; color: rgb(141, 142, 222)'>Success by " + margin + " but the weapon malfunctions.</div>"
                crit = false;
                success = true;
                malfunction = true;
            }
            else {
                html += "<div style='font-weight: bold; color: rgb(141, 142, 222)'>Success by " + margin + "</div>"
                crit = false;
                success = true;
                malfunction = false;
            }
        }
        else { // Wtf?
            html += "<div style='font-weight: bold;'>Unknown result by " + margin + "</div>"
            crit = false;
            success = false;
        }

        if (chat){
            ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_STYLES.OTHER });
        }
        else {
            return {
                content: html,
                crit: crit,
                success: success,
                malfunction: malfunction,
                margin: margin,
                type: CONST.CHAT_MESSAGE_STYLES.OTHER
            }
        }
    }

    static getMalfunctionType() {
        let roll = Math.random(); // Decimal between 0 (inclusive) and 1 (exclusive)

        if (roll <= 0.185) { // Mechanical or electrical problem
            return "mech";
        }
        else if (roll <= 0.5415) { // Misfire (Weapon does not fire, and breaks)
            return "misfire";
        }
        else if (roll <= 0.9072) { // Stoppage (Weapon fires once, then breaks)
            return "stoppage";
        }
        else { // Mechanical or electrical problem with explosion
            return "mechEx";
        }
    }

    static dieToIcon(die){
        let response = "";
        switch (die) {
            case 1:
                response = "<label class=\"fa fa-dice-one fa-4x\"></label>";
                break;
            case 2:
                response = "<label class=\"fa fa-dice-two fa-4x\"></label>";
                break;
            case 3:
                response = "<label class=\"fa fa-dice-three fa-4x\"></label>";
                break;
            case 4:
                response = "<label class=\"fa fa-dice-four fa-4x\"></label>";
                break;
            case 5:
                response = "<label class=\"fa fa-dice-five fa-4x\"></label>";
                break;
            case 6:
                response = "<label class=\"fa fa-dice-six fa-4x\"></label>";
                break;
            default:
                break;
        }

        return response;
    }

    static dieToSmallIcon(die){
        let response = "";
        switch (die) {
            case 1:
                response = "<label class='fa fa-dice-one   fa-2x'></label>";
                break;
            case 2:
                response = "<label class='fa fa-dice-two   fa-2x'></label>";
                break;
            case 3:
                response = "<label class='fa fa-dice-three fa-2x'></label>";
                break;
            case 4:
                response = "<label class='fa fa-dice-four  fa-2x'></label>";
                break;
            case 5:
                response = "<label class='fa fa-dice-five  fa-2x'></label>";
                break;
            case 6:
                response = "<label class='fa fa-dice-six   fa-2x'></label>";
                break;
            default:
                break;
        }

        return response;
    }

    static levelToOdds(level){ // Provide odds for success, crit fail, crit success
        let success;
        let critSuccess;
        let critFail;
        if (level <= -5){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 98.15;
        }
        else if (level === -4){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 95.37;
        }
        else if (level === -3){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 90.74;
        }
        else if (level === -2){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 83.8;
        }
        else if (level === -1){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 74.07;
        }
        else if (level === 0){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 62.50;
        }
        else if (level === 1){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 50;
        }
        else if (level === 2){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 37.50;
        }
        else if (level === 3){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 25.93;
        }
        else if (level === 4){
            success = 1.85;
            critSuccess = 1.85;
            critFail = 16.20;
        }
        else if (level === 5){
            success = 4.63;
            critSuccess = 1.85;
            critFail = 9.26;
        }
        else if (level === 6){
            success = 9.26;
            critSuccess = 1.85;
            critFail = 4.63;
        }
        else if (level === 7){
            success = 16.2;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 8){
            success = 25.93;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 9){
            success = 37.5;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 10){
            success = 50;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 11){
            success = 62.5;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 12){
            success = 74.07;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 13){
            success = 83.8;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 14){
            success = 90.74;
            critSuccess = 1.85;
            critFail = 1.85;
        }
        else if (level === 15){
            success = 95.37;
            critSuccess = 4.63;
            critFail = 1.85;
        }
        else if (level >= 16){
            success = 98.15;
            critSuccess = 9.26;
            critFail = 0.46;
        }

        return {
            success: success,
            critSuccess: critSuccess,
            critFail: critFail
        };
    }
}
