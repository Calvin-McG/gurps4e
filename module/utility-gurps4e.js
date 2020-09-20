/**
 * Provides general useful functions for various different parts of the system.
 *
 * This is basically a catch-all for useful functions that don't quite fit anywhere
 * else, but is used by many different areas of the system. Most of these functions
 * involve retrieving data from the configuration values or the compendia.
 *
 */
export class GURPS_Utility
{

  /**
   * Searches an object for a key that matches the given value.
   * 
   * @param {String} value  value whose key is being searched for
   * @param {Object} obj    object to be searched in
   */
  static findKey(value, obj)
  {
    for (let key in obj)
    {
      if (obj[key] == value)
        return key;
    }
    throw "Could not find key corresponding to " + value
  }

  // Used to sort arrays based on string value (used in organizing skills to be alphabetical - see ActorGurps4e.prepareItems())
  static nameSorter(a, b)
  {
    if (a.name.toLowerCase() < b.name.toLowerCase())
      return -1;
    if (a.name.toLowerCase() > b.name.toLowerCase())
      return 1;
    return 0;
  }

  /**
   * Helper function to easily find the property name
   * // Todo: regex?
   * @param {String} property 
   */
  static parsePropertyName(property)
  {
      property = property.trim();
      if (!isNaN(property[property.length-1]))
         return property.substring(0, property.length-2).trim()
      else
        return property;
  }

  /**
   * Helper function to set up chat data (set roll mode and content).
   * 
   * @param {String} content 
   * @param {String} modeOverride 
   * @param {Boolean} isRoll 
   */
  static chatDataSetup(content, modeOverride, isRoll = false, forceWhisper)
  {
    let chatData = {
      user: game.user._id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content: content
    };
    if (isRoll)
      chatData.sound = CONFIG.sounds.dice

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (chatData.rollMode === "blindroll") chatData["blind"] = true;
    else if (chatData.rollMode === "selfroll") chatData["whisper"] = [game.user];

    if ( forceWhisper ) { // Final force !
      chatData["speaker"] = ChatMessage.getSpeaker();
      chatData["whisper"] = ChatMessage.getWhisperRecipients(forceWhisper);
    }

    return chatData;
  }

  /**
   * Looks through object values and finds the one that most closely matches the query, returning the key.
   * 
   * Used by condition lookup.
   * 
   * @param {Object} Object Object being searched in
   * @param {*} query Value trying to match
   */
  static matchClosest(object, query)
  {
    query = query.toLowerCase();
    let keys = Object.keys(object)
    let match = [];
    for (let key of keys)
    {
      let percentage = 0;
      let matchCounter = 0;
      let myword = object[key].toLowerCase();
      for (let i = 0; i < myword.length; i++)
      {
        if ( myword[i] == query[i])
        {
          matchCounter++;
        }
      }
      percentage = matchCounter / key.length;
      match.push(percentage);
    }
    let maxIndex = match.indexOf(Math.max.apply(Math, match));
    return keys[maxIndex]
  }

  /**
   * Returns token speaker if available, otherwise, returns actor.
   * 
   * @param {Object} speaker  speaker object containing actor and otken
   */
  static getSpeaker(speaker)
  {
    let actor = game.actors.get(speaker.actor);
    if (speaker.token)
      actor = canvas.tokens.get(speaker.token).actor
    return actor
  }

  /**
   * Post condition when clicked.
   * 
   * @param {Object} event click event
   */
  static handleConditionClick(event)
  {
    let cond = $(event.currentTarget).attr("data-cond")
    if (!cond)
      cond = event.target.text.trim();
    cond = cond.split(" ")[0]
    let condkey = GURPS_Utility.findKey(cond, GURPS4E.conditions);
    let condDescr = GURPS4E.conditionDescriptions[condkey];
    let messageContent = `<b>${cond}</b><br>${condDescr}`

    let chatData = GURPS_Utility.chatDataSetup(messageContent)
    ChatMessage.create(chatData);
  }

  /**
   * Roll to chat when roll entity is clicked
   * 
   * @param {Object} event clicke event
   */
  static handleRollClick(event)
  {
    let roll = $(event.currentTarget).attr("data-roll")
    if (!roll)
      roll = event.target.text.trim();
    let rollMode = game.settings.get("core", "rollMode");
    new Roll(roll).roll().toMessage(
    {
      user: game.user._id,
      rollMode
    })
  }
}
