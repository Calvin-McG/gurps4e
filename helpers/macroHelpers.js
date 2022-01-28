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
}
