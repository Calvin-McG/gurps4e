let selfToken = token;//Get owned token
let targetSet = game.user.targets//Get set of targets
let targetArray = Array.from(targetSet);//Convert to an actually useable data type
let selfActor = selfToken.actor.data.data//Get owned actor from token

console.log(selfToken);
console.log(selfActor);
console.log(targetArray);


//This is the bit where we figure out where every one is, along with distances and range penalties.
let selfCoords = selfToken._validPosition

let targetCoords = "";



//Assemble modal content
let htmlContent = "";
htmlContent += "<select id='target' name='target'>"

for (let a = 0; a < targetArray.length; a++){
    htmlContent += "<option value='" + a + "'>" + targetArray[a].nameplate._text + "</option>"
}

htmlContent += "</select>"
//

let selectionModal = new Dialog({
    title: "SHOW ME YOUR MOVES",
    content: htmlContent,
    buttons: {
        mod: {
            icon: '<i class="fas fa-check"></i>',
            label: "Attack",
            callback: (html) => {
                console.log(html.find('#target').val())
                console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId))
                game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value = 9;//Set the value to the new one so we can work with it within the macro
                game.actors.get(targetArray[html.find('#target').val()].data.actorId).update({ ['data.reserves.hp.value']: 9 });//Use .update so it can be referenced by the rest of Foundry
                console.log(game.actors.get(targetArray[html.find('#target').val()].data.actorId).data.data.reserves.hp.value)
            }
        },
        noMod: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => {

            }
        }
    },
    default: "noMod",
    render: html => console.log("Register interactivity in the rendered dialog"),
    close: html => console.log("This always is logged no matter which option is chosen")
})
selectionModal.render(true)


console.log(selfCoords)