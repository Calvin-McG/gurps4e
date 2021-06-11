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

  html.find('.attemptActiveDefences').click(attemptActiveDefences.bind(this));
  html.find('.noActiveDefences').click(noActiveDefences.bind(this));
})

function attemptActiveDefences(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).data.flags;
  game.actors.get(flags.target).attemptActiveDefences(event);
}

function noActiveDefences(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).data.flags;
  game.actors.get(flags.target).noActiveDefences(event);
}
