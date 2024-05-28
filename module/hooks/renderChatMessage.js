/**
 * Searches each message and adds drag and drop functionality and hides certain things from players
 */

import {macroHelpers} from "../../helpers/macroHelpers.js";

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
  macroHelpers.attemptActiveDefences(event);
}

function noActiveDefences(event) {
  event.preventDefault();
  macroHelpers.noActiveDefences(event);
}

function quickContest(event) {
  event.preventDefault();
  macroHelpers.quickContest(event);
}

function attemptResistanceRoll(event) {
  event.preventDefault();
  macroHelpers.attemptResistanceRoll(event);
}

function noResistanceRoll(event) {
  event.preventDefault();
  macroHelpers.noResistanceRoll(event);
}
function knockbackFallRoll(event) {
  event.preventDefault();
  let penalty = parseInt(event.currentTarget.alt);
  macroHelpers.knockbackFallRoll(event, penalty);
}
