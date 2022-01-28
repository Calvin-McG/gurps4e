// This macro allows the user to select an attack from their sheet to use against their target(s)

let selfToken = token; // Get owned token

if (typeof selfToken == "undefined") {
    game.gurpsAPI.noSelectionsDialog(1);
}
else {
    let targetSet = game.user.targets // Get set of targets
    let targetArray = Array.from(targetSet); // Convert to an actually useable data type
    let selfActor = selfToken.actor // Get owned actor from token

    if(targetArray.length == 0){//There were no targets, show an error.
        let noTargetsDialogContent = selfActor.noTargetsDialog();

        noTargetsDialogContent.render(true);
    }

    else if(targetArray.length == 1){//There is one target.
        let singleTargetDialogContent = selfActor.singleTargetDialog(selfToken, targetArray[0]);

        singleTargetDialogContent.render(true);
    }

    else if(targetArray.length > 1){//There is more than one target.

    }
}
