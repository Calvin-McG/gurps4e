export class rollHelpers {

    static skillRoll(level, modifier, label, chat){
        let effectiveSkill = +level + +modifier;
        let die1 = new Roll("1d6");
        let die2 = new Roll("1d6");
        let die3 = new Roll("1d6");

        die1.roll();
        die2.roll();
        die3.roll();
        let skillRoll = +die1.total + +die2.total + +die3.total;
        let margin = +effectiveSkill - +skillRoll;
        let html = "<div>" + label + "</div>";

        if(modifier >= 0){//modifier is zero or positive
            html += "Rolls a " + skillRoll + " vs " + level + " + " + modifier;
        }
        else {
            html += "Rolls a " + skillRoll + " vs " + level + " - " + modifier;
        }

        //Code block for display of dice
        html += "<div>";
        html += this.dieToIcon(die1.total);
        html += this.dieToIcon(die2.total);
        html += this.dieToIcon(die3.total);
        html += "</div>"

        if (skillRoll.total == 18){//18 is always a crit fail
            html += "<div>Automatic Crit Fail by " + margin + "</div>"
        }
        else if (skillRoll.total == 17){//17 is a crit fail if effective skill is less than 16, autofail otherwise
            if (effectiveSkill < 16){//Less than 16, autocrit
                html += "<div>Automatic Crit Fail by " + margin + "</div>"
            }
            else {//Autofail
                html += "<div>Automatic Fail by " + margin + "</div>"
            }
        }
        else if (margin <= -10){//Fail by 10 is a crit fail
            html += "<div>Crit Fail by " + margin + "</div>"
        }
        else if (margin < 0){//Fail is a fail
            html += "<div>Fail by " + margin + "</div>"
        }
        else if (skillRoll.total == 3 || skillRoll.total == 4){//3 and 4 are always a crit success
            html += "<div>Automatic Critical Success by " + margin + "</div>"
        }
        else if (skillRoll.total == 5 && effectiveSkill == 15){//5 is a crit if effective skill is 15
            html += "<div>Critical Success by " + margin + "</div>"
        }
        else if (skillRoll.total == 6 && effectiveSkill == 16){//6 is a crit if effective skill is 16
            html += "<div>Critical Success by " + margin + "</div>"
        }
        else if (margin >= 0){//Regular success
            html += "<div>Success by " + margin + "</div>"
        }
        else {//Wtf?
            html += "<div>Unknown result by " + margin + "</div>"
        }

        if (chat){
            ChatMessage.create({ content: html, user: game.user._id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
        }
        else {
            return {
                content: html,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER
            }
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
}
