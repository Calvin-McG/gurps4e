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

  html.find('.attemptActiveDefences').click(attemptActiveDefences.bind(this));
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

function attemptActiveDefences(event) {
  event.preventDefault();

  let checkboxes = event.target.parentElement.getElementsByClassName("checkbox");
  let checkedBoxes = Object.values(checkboxes).filter(filterChecked);
  let locationIDs = [];

  for (let c = 0; c < checkedBoxes.length; c++){
    locationIDs[c] = checkedBoxes[c].id;
  }

  let flags = game.messages.get($(event.target.parentElement.parentElement)[0].dataset.messageId).data.flags;

  let target = game.actors.get(flags.target);

  let dodges = [];
  let parries = [];
  let blocks = [];

  let dodge = {
    name: "Dodge",
    level: target.data.data.primaryAttributes.dodge.value
  }

  dodges.push(dodge);

  if (target.data.items) {
    for (let a = 0; a < target.data.items.length; a++){ // Loop through the items
      if (target.data.items[a].data.melee) {
        let item = target.data.items[a].data;
        let keys = Object.keys(item.melee)
        if (true){ // Look for items with melee profiles
          for (let b = 0; b < keys.length; b++){ // Loop through the melee profiles
            let profile = getProperty(item.melee, keys[b])
            if (Number.isInteger(profile.parry)){
              let parry = {
                name: target.data.items[a].name,
                level: profile.parry
              }
              parries.push(parry)
            }

            if (Number.isInteger(profile.block)){
              let block = {
                name: target.data.items[a].name,
                level: profile.block
              }
              blocks.push(block)
            }
          }
        }
      }
    }
  }

  let activeDefenceModalContent =
      "<div style='text-align: center; font-weight: bold'>General Modifiers</div>" +
      "<div style='display: grid; grid-template-columns: 1fr 1fr'><span style='text-align: right;'><label for='feverishDefence' style='line-height: 26px;'>Feverish Defence</label></span><span><input type='checkbox' name='feverishDefence' id='feverishDefence' value='feverishDefence' /></span></div>" +
      "<div style='display: grid; grid-template-columns: 1.5fr 0.5fr 1.5fr 0.5fr 1.5fr 0.5fr'>" +
      "   <span><label for='retreat' style='line-height: 26px;'>Retreat</label></span><span><input type='checkbox' name='retreat' id='retreat' value='retreat' /></span>" +
      "   <span><label for='sideslip' style='line-height: 26px;'>Side Slip</label></span><span><input type='checkbox' name='sideslip' id='sideslip' value='sideslip' /></span>" +
      "   <span><label for='slip' style='line-height: 26px;'>Slip</label></span><span><input type='checkbox' name='slip' id='slip' value='slip' /></span>" +
      "</div>" +
      "<div><input type='number' id='mod' name='mod' placeholder='Modifier'/></div>" +
      "<div style='text-align: center; font-weight: bold; padding-top: 10px;'>Specific Modifiers</div>" +
      "<div style='display: grid; font-weight: bold; grid-template-columns: 1fr 1fr 1fr'><span style='text-align: center;'>Dodge</span><span style='text-align: center;'>Block</span><span style='text-align: center;'>Parry</span></div>" +
      "<div style='display: grid; grid-template-columns: 1.5fr 0.5fr 2fr 1.5fr 0.5fr'>" +
      "   <span><label for='drop' style='line-height: 26px;'>Dodge & Drop</label></span><span><input type='checkbox' name='drop' id='drop' value='drop' /></span>" +
      "   <span></span>" +
      "   <span><label for='crossParry' style='line-height: 26px;'>Cross Parry</label></span><span><input type='checkbox' name='crossParry' id='crossParry' value='crossParry' /></span>" +
      "</div>" +
      "<div style='display: grid; grid-template-columns: 1fr 1fr 1fr'>" +
      "<select name='dodgeSelector' id='dodgeSelector'>";

  if (dodges){
    for (let d = 0; d < dodges.length; d++){
      activeDefenceModalContent += "<option value='" + dodges[d].level + "'>" + dodges[d].name + ": " + dodges[d].level + "</option>"
    }
  }

  activeDefenceModalContent += "</select>" +
  "<select name='blockSelector' id='blockSelector'>";

  if (blocks){
    for (let b = 0; b < blocks.length; b++){
      activeDefenceModalContent += "<option value='" + blocks[b].level + "'>" + blocks[b].name + ": " + blocks[b].level + "</option>"
    }
  }

  activeDefenceModalContent += "</select>" +
  "<select name='parrySelector' id='parrySelector'>";

  if (parries){
    for (let p = 0; p < parries.length; p++){
      activeDefenceModalContent += "<option value='" + parries[p].level + "'>" + parries[p].name + ": " + parries[p].level + "</option>"
    }
  }

  activeDefenceModalContent += "</select>" +
  "</div>";


  let activeDefenceModal = new Dialog({
    title: "Active Defences",
    content: activeDefenceModalContent,
    buttons: {
      dodge: {
        icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 17px;"><path fill="currentColor" d="M272 96c26.51 0 48-21.49 48-48S298.51 0 272 0s-48 21.49-48 48 21.49 48 48 48zM113.69 317.47l-14.8 34.52H32c-17.67 0-32 14.33-32 32s14.33 32 32 32h77.45c19.25 0 36.58-11.44 44.11-29.09l8.79-20.52-10.67-6.3c-17.32-10.23-30.06-25.37-37.99-42.61zM384 223.99h-44.03l-26.06-53.25c-12.5-25.55-35.45-44.23-61.78-50.94l-71.08-21.14c-28.3-6.8-57.77-.55-80.84 17.14l-39.67 30.41c-14.03 10.75-16.69 30.83-5.92 44.86s30.84 16.66 44.86 5.92l39.69-30.41c7.67-5.89 17.44-8 25.27-6.14l14.7 4.37-37.46 87.39c-12.62 29.48-1.31 64.01 26.3 80.31l84.98 50.17-27.47 87.73c-5.28 16.86 4.11 34.81 20.97 40.09 3.19 1 6.41 1.48 9.58 1.48 13.61 0 26.23-8.77 30.52-22.45l31.64-101.06c5.91-20.77-2.89-43.08-21.64-54.39l-61.24-36.14 31.31-78.28 20.27 41.43c8 16.34 24.92 26.89 43.11 26.89H384c17.67 0 32-14.33 32-32s-14.33-31.99-32-31.99z" class=""></path></svg>',
        label: "Dodge",
        callback: (html) => {
          let mod = html.find('#mod').val()
          let options = {
            feverishDefence: html.find('#feverishDefence')[0].checked,
            retreat: html.find('#retreat')[0].checked,
            sideslip: html.find('#sideslip')[0].checked,
            slip: html.find('#slip')[0].checked,
            drop: html.find('#drop')[0].checked,
            crossParry: html.find('#crossParry')[0].checked
          }

          let selection = html.find('#dodgeSelector').val()
          let name = html.find('#dodgeSelector')[0].innerText.split(":")[0]
          rollActiveDefence(mod, selection, name, options, flags, locationIDs);
        }
      },
      block: {
        icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z" class=""></path></svg>',
        label: "Block",
        callback: (html) => {
          let mod = html.find('#mod').val()
          let options = {
            feverishDefence: html.find('#feverishDefence')[0].checked,
            retreat: html.find('#retreat')[0].checked,
            sideslip: html.find('#sideslip')[0].checked,
            slip: html.find('#slip')[0].checked,
            drop: html.find('#drop')[0].checked,
            crossParry: html.find('#crossParry')[0].checked
          }

          let selection = html.find('#blockSelector').val()
          let name = html.find('#blockSelector')[0].innerText.split(":")[0]
          rollActiveDefence(mod, selection, name, options, flags, locationIDs);
        }
      },
      parry: {
        icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" role="img" viewBox="0 0 512 512" style="width: 14px;"><path fill="currentColor" d="M507.31 462.06L448 402.75l31.64-59.03c3.33-6.22 2.2-13.88-2.79-18.87l-17.54-17.53c-6.25-6.25-16.38-6.25-22.63 0L420 324 112 16 18.27.16C8.27-1.27-1.42 7.17.17 18.26l15.84 93.73 308 308-16.69 16.69c-6.25 6.25-6.25 16.38 0 22.62l17.53 17.54a16 16 0 0 0 18.87 2.79L402.75 448l59.31 59.31c6.25 6.25 16.38 6.25 22.63 0l22.62-22.62c6.25-6.25 6.25-16.38 0-22.63zm-149.36-76.01L60.78 88.89l-5.72-33.83 33.84 5.72 297.17 297.16-28.12 28.11zm65.17-325.27l33.83-5.72-5.72 33.84L340.7 199.43l33.94 33.94L496.01 112l15.84-93.73c1.43-10-7.01-19.69-18.1-18.1l-93.73 15.84-121.38 121.36 33.94 33.94L423.12 60.78zM199.45 340.69l-45.38 45.38-28.12-28.12 45.38-45.38-33.94-33.94-45.38 45.38-16.69-16.69c-6.25-6.25-16.38-6.25-22.62 0l-17.54 17.53a16 16 0 0 0-2.79 18.87L64 402.75 4.69 462.06c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L109.25 448l59.03 31.64c6.22 3.33 13.88 2.2 18.87-2.79l17.53-17.54c6.25-6.25 6.25-16.38 0-22.63L188 420l45.38-45.38-33.93-33.93z" class=""></path></svg>',
        label: "Parry",
        callback: (html) => {
          let mod = html.find('#mod').val()
          let options = {
            feverishDefence: html.find('#feverishDefence')[0].checked,
            retreat: html.find('#retreat')[0].checked,
            sideslip: html.find('#sideslip')[0].checked,
            slip: html.find('#slip')[0].checked,
            drop: html.find('#drop')[0].checked,
            crossParry: html.find('#crossParry')[0].checked
          }
          let selection = html.find('#parrySelector').val()
          let name = html.find('#parrySelector')[0].innerText.split(":")[0]
          rollActiveDefence(mod, selection, name, options, flags, locationIDs);
        }
      }
    },
    default: "dodge",
    render: html => console.log("Register interactivity in the rendered dialog"),
    close: html => console.log("This always is logged no matter which option is chosen")
  })
  activeDefenceModal.render(true)
}

function rollActiveDefence(mod, selection, name, options, locationIDs) {
  console.log(mod)
  console.log(selection)
  console.log(name)
  console.log(options)
  console.log(locationIDs)
}

function filterChecked(item){
  return item.checked; // Return whatever the status of the checkbox is.
}
