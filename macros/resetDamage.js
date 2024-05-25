// This macro allows the user to refresh the damage for their selections

let tokenList = canvas.tokens._controlled; // Get owned token
let keys = Object.keys(tokenList);

if (keys.length > 0) {
    for (let k = 0; k < keys.length; k++) {
        let actor = foundry.utils.getProperty(tokenList, keys[k]).actor;
        actor.resetDamage();
    }
}

else {
    game.gurpsAPI.noSelectionsDialog(2);
}
