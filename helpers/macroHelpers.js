import { actorHelpers } from "./actorHelpers.js";

export class macroHelpers {

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
}
