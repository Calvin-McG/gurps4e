/**
 * Searches each message and adds drag and drop functionality and hides certain things from players
 */

Hooks.on("renderChatMessage", async (app, html, msg) => {

  // Hide chat card edit buttons from non-gms
  if (!game.user.isGM) {
    html.find(".chat-button-gm").remove();
    html.find(".unopposed-button").remove();
    //hide tooltip contextuamneu if not their roll
    if(msg.message.speaker.actor && game.actors.get(msg.message.speaker.actor).permission != 3)
      html.find(".chat-button-player").remove();
  }
  else {
    html.find(".chat-button-player").remove();
  }

  // Do not display "Blind" chat cards to non-gm
  if (html.hasClass("blind") && !game.user.isGM) {
    html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
    html.html("").css("display", "none");
  }

  html.find('.test').click(_test.bind(this));
})

function _test(event) {
  event.preventDefault();
  console.log(event);
  console.log("Test Successful");

  let checkboxes = event.target.parentElement.getElementsByClassName("checkbox");

  console.log($(event.target.parentElement.parentElement)[0].dataset.messageId);

  console.log(checkboxes);

  let checkedBoxes = Object.values(checkboxes).filter(filterChecked);

  console.log(checkedBoxes);

  console.log(game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId));

  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).data.flags;

  console.log(flags);

  console.log(game.actors.get(flags.target))

  console.log(game.actors.get(flags.attacker))
}
