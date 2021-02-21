/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */
Hooks.on("ready", async () => {

  console.log("Starting Ready");

  if (game.user.isGM) {
    let permissions = duplicate(game.permissions)
    if (permissions["FILES_BROWSE"].length < 4)
    permissions["FILES_BROWSE"] = [1, 2, 3, 4]
    game.settings.set("core", "permissions", permissions);
  }
})

Hooks.on("closePermissionConfig", () => {
  if (game.permissions["FILES_BROWSE"].length < 4) {
      ui.notifications.warn("WARNING: GURPS4E currently requires users to have \"Browse File Explorer\" Permission", {permanent: true})
      return
  }
})
