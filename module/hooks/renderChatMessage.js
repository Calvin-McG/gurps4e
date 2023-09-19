/**
 * Searches each message and adds drag and drop functionality and hides certain things from players
 */

Hooks.on("renderChatMessage", async (app, html, msg) => {
  html.find('.attemptActiveDefences').click(attemptActiveDefences.bind(this));
  html.find('.noActiveDefences').click(noActiveDefences.bind(this));
  html.find('.quickContest').click(quickContest.bind(this));
  html.find('.attemptResistanceRoll').click(attemptResistanceRoll.bind(this));
  html.find('.noResistanceRoll').click(noResistanceRoll.bind(this));
  html.find('.knockbackFall').click(knockbackFallRoll.bind(this));
})

function attemptActiveDefences(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
  game.scenes.get(flags.scene).tokens.get(flags.target).actor.attemptActiveDefences(event);
}

function noActiveDefences(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
  game.scenes.get(flags.scene).tokens.get(flags.target).actor.noActiveDefences(event);
}

function quickContest(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
  game.scenes.get(flags.scene).tokens.get(flags.target).actor.quickContest(event);
}

function attemptResistanceRoll(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
  game.scenes.get(flags.scene).tokens.get(flags.target).actor.attemptResistanceRoll(event);
}

function noResistanceRoll(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
  game.scenes.get(flags.scene).tokens.get(flags.target).actor.noResistanceRoll(event);
}
function knockbackFallRoll(event) {
  event.preventDefault();
  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).flags;
  game.scenes.get(flags.scene).tokens.get(flags.target).actor.knockbackFallRoll(event);
}
