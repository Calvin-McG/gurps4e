/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */
Hooks.on("ready", async () => {

  console.log("Starting Ready");

  // Localize strings in the GURPS4E object
  for (let obj in GURPS4E) {
    for (let el in GURPS4E[obj]) {
      if (typeof GURPS4E[obj][el] === "string") {
        GURPS4E[obj][el] = game.i18n.localize(GURPS4E[obj][el])
      }
    }
  }
  
  let activeModules = game.settings.get("core", "moduleConfiguration");
   
  // Load module tables if the module is active and if the module has tables
  for (let m in activeModules) {
    let module;
    if (activeModules[m]) {
    
      try {
        await FilePicker.browse("data", `modules/${m}/tables`).then(resp => {

          if (resp.error || !resp.target.includes("tables"))
            throw ""
          for (var file of resp.files) {
            try {
              if (!file.includes(".json"))
                continue
              let filename = file.substring(file.lastIndexOf("/")+1, file.indexOf(".json"));

              fetch(file).then(r=>r.json()).then(async records => {
              // If extension of a table, add it to the columns
              if(records.extend && GURPS_Tables[filename]) {
                GURPS_Tables[filename].columns = GURPS_Tables[filename].columns.concat(records.columns)
                  GURPS_Tables[filename].rows.forEach((obj, row) => {
                  for (let c of records.columns)
                    GURPS_Tables[filename].rows[row].range[c] = records.rows[row].range[c]
                  })
              }
              else // If not extension, load table as its filename
                GURPS_Tables[filename] = records;
              })
            }
            catch(error) {
              console.error("Error reading " + file + ": " + error)
            }
          }
        })
      }
      catch {
      }
    }
  }

  if (game.user.isGM) {
    let permissions = duplicate(game.permissions)
    if (permissions["FILES_BROWSE"].length < 4)
    permissions["FILES_BROWSE"] = [1, 2, 3, 4]
    game.settings.set("core", "permissions", permissions);
  }

  const NEEDS_MIGRATION_VERSION = 1.0;
  let needMigration
  try {
    needMigration = game.settings.get("gurps4e", "systemMigrationVersion") < NEEDS_MIGRATION_VERSION;
  }
  catch {
    needMigration = true;
  }
  if (needMigration && game.user.isGM ) {
    new Dialog({
      title: "Migration",
      content: `<p style="color:#000;">A migration process is recommended for version ${game.system.data.version}. Before you do so, <b>please backup your world folder</b>. You will be reprompted for migration upon reload.<br><br>
      Migration Details:<br>
      - Changes Weapon data structure. Weapon damage will have to be reentered if migration is skipped.<br>
      - Upon migration, check to verify if any existing unlinked tokens in scenes have their appropriate weapon damage values<br><br><br></p>`,
      buttons: {
        migrate: {
          label : "Begin Migration",
          callback : html => Migration.migrateWorld()
        },
        skip : {
          label : "Skip Migration",
          callback: html => {}
        }
      }
    }).render(true)
  }
})

Hooks.on("closePermissionConfig", () => {
  if (game.permissions["FILES_BROWSE"].length < 4) {
      ui.notifications.warn("WARNING: GURPS4E currently requires users to have \"Browse File Explorer\" Permission", {permanent: true})
      return
  }
})
