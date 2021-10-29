/**
 * Set default values for new actors' tokens
 */
Hooks.on("preCreateActor", (createData) =>{

  createData.data.update({"token.bar1" :{"attribute" : "reserves.hp"},        // Default Bar 1 to Hit Points
      "token.bar2" :{"attribute" : "reserves.fp"},         // Default Bar 2 to Fatigue Points
      "token.displayName" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display name to be on owner hover
      "token.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display bars to be on owner hover
      "token.disposition" : CONST.TOKEN_DISPOSITIONS.NEUTRAL,         // Default disposition to neutral
      "token.name" : createData.name                                  // Set token name to actor name
    })

  // Set custom default token
  if (!createData.img)
    createData.img = "systems/gurps4e/tokens/unknown.png"

  // Default characters to HasVision = true and Link Data = true
  if (createData.type == "minchar")
  {
    createData.token.vision = true;
    createData.token.actorLink = true;
  }
})
