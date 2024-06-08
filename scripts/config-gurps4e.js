const GURPS4E = {}

CONFIG.statusEffects = [
    {
        "img": "systems/gurps4e/icons/postures/standing.png",
        "name": "Standing",
        "id": "standing"
    },
    {
        "img": "systems/gurps4e/icons/postures/sitting.png",
        "name": "Sitting",
        "id": "sitting"
    },
    {
        "img": "systems/gurps4e/icons/postures/crouching.png",
        "name ": "Crouching",
        "id": "crouching"
    },
    {
        "img": "systems/gurps4e/icons/postures/crawling.png",
        "name": "Crawling",
        "id": "crawling"
    },
    {
        "img": "systems/gurps4e/icons/postures/kneeling.png",
        "name": "Kneeling",
        "id": "kneeling"
    },
    {
        "img": "systems/gurps4e/icons/postures/lyingback.png",
        "name": "Lying on back",
        "id": "lyingback"
    },
    {
        "img": "systems/gurps4e/icons/postures/lyingprone.png",
        "name": "Prone",
        "id": "lyingprone"
    },
    {
        "img": "systems/gurps4e/icons/postures/sittingchair.png",
        "name": "Sitting in a chair",
        "id": "sittingchair"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock1.png",
        "name": "Shock -1",
        "id": "shock1"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock2.png",
        "name": "Shock -2",
        "id": "shock2"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock3.png",
        "name": "Shock -3",
        "id": "shock3"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock4.png",
        "name": "Shock -4",
        "id": "shock4"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock6.png",
        "name": "Shock -6",
        "id": "shock6"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock8.png",
        "name": "Shock -8",
        "id": "shock8"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock12.png",
        "name": "Shock -12",
        "id": "shock12"
    },
    {
        "img": "systems/gurps4e/icons/conditions/shock16.png",
        "name": "Shock -16",
        "id": "shock16"
    },
    {
        "img": "systems/gurps4e/icons/conditions/reeling.png",
        "name": "Reeling",
        "id": "reeling"
    },
    {
        "img": "systems/gurps4e/icons/conditions/tired.png",
        "name": "Tired",
        "id": "tired"
    },
    {
        "img": "systems/gurps4e/icons/conditions/collapse.png",
        "name": "Collapse",
        "id": "collapse"
    },
    {
        "img": "systems/gurps4e/icons/conditions/unconscious.png",
        "name": "Unconscious",
        "id": "unconscious"
    },
    {
        "img": "systems/gurps4e/icons/conditions/minus1xhp.png",
        "name": "-1 x hp",
        "id": "minus1xhp"
    },
    {
        "img": "systems/gurps4e/icons/conditions/minus2xhp.png",
        "name": "-2 x hp",
        "id": "minus2xhp"
    },
    {
        "img": "systems/gurps4e/icons/conditions/minus3xhp.png",
        "name": "-3 x hp",
        "id": "minus3xhp"
    },
    {
        "img": "systems/gurps4e/icons/conditions/minus4xhp.png",
        "name": "-4 x hp",
        "id": "minus4xhp"
    },
    {
        "img": "systems/gurps4e/icons/conditions/stunned.png",
        "name": "Stunned",
        "id": "stunned"
    },
    {
        "img": "systems/gurps4e/icons/conditions/surprised.png",
        "name": "Surprised",
        "id": "surprised"
    },
    {
        "img": "systems/gurps4e/icons/defeated.png",
        "name": "Defeated",
        "id": "defeated"
    },
    {
        "img": "systems/gurps4e/icons/blank.png",
        "name": "Blank",
        "id": "blank"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledleftarm.png",
        "name": "Crippledleftarm",
        "id": "crippledleftarm"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledlefthand.png",
        "name": "Crippledlefthand",
        "id": "crippledlefthand"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledleftleg.png",
        "name": "Crippledleftleg",
        "id": "crippledleftleg"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledleftfoot.png",
        "name": "Crippledleftfoot",
        "id": "crippledleftfoot"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledrightarm.png",
        "name": "Crippledrightarm",
        "id": "crippledrightarm"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledrighthand.png",
        "name": "Crippledrighthand",
        "id": "crippledrighthand"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledrightleg.png",
        "name": "Crippledrightleg",
        "id": "crippledrightleg"
    },
    {
        "img": "systems/gurps4e/icons/crippled/crippledrightfoot.png",
        "name": "Crippledrightfoot",
        "id": "crippledrightfoot"
    }
]

CONFIG.controlIcons.defeated = "systems/gurps4e/icons/defeated.png";

CONFIG.JournalEntry.noteIcons = {
    "Marker": "systems/gurps4e/icons/buildings/point_of_interest.png",
    "Apothecary": "systems/gurps4e/icons/buildings/apothecary.png",
    "Beastmen Herd 1": "systems/gurps4e/icons/buildings/beastmen_camp1.png",
    "Beastmen Herd 2": "systems/gurps4e/icons/buildings/beastmen_camp2.png",
    "Blacksmith": "systems/gurps4e/icons/buildings/blacksmith.png",
    "Bretonnian City 1": "systems/gurps4e/icons/buildings/bret_city1.png",
    "Bretonnian City 2": "systems/gurps4e/icons/buildings/bret_city2.png",
    "Bretonnian City 3": "systems/gurps4e/icons/buildings/bret_city3.png",
    "Bretonnian Worship": "systems/gurps4e/icons/buildings/bretonnia_worship.png",
    "Caste Hill 1": "systems/gurps4e/icons/buildings/castle_hill1.png",
    "Caste Hill 2": "systems/gurps4e/icons/buildings/castle_hill2.png",
    "Caste Hill 3": "systems/gurps4e/icons/buildings/castle_hill3.png",
    "Castle Wall": "systems/gurps4e/icons/buildings/castle_wall.png",
    "Cave 1": "systems/gurps4e/icons/buildings/cave1.png",
    "Cave 2": "systems/gurps4e/icons/buildings/cave2.png",
    "Cave 3": "systems/gurps4e/icons/buildings/cave3.png",
    "Cemetery": "systems/gurps4e/icons/buildings/cemetery.png",
    "Chaos Portal": "systems/gurps4e/icons/buildings/chaos_portal.png",
    "Chaos Worship": "systems/gurps4e/icons/buildings/chaos_worship.png",
    "Court": "systems/gurps4e/icons/buildings/court.png",
    "Dwarf Beer": "systems/gurps4e/icons/buildings/dwarf_beer.png",
    "Dwarf Hold 1": "systems/gurps4e/icons/buildings/dwarf_hold1.png",
    "Dwarf Hold 2": "systems/gurps4e/icons/buildings/dwarf_hold2.png",
    "Dwarf Hold 3": "systems/gurps4e/icons/buildings/dwarf_hold3.png",
    "Empire Barracks": "systems/gurps4e/icons/buildings/empire_barracks.png",
    "Empire City 1": "systems/gurps4e/icons/buildings/empire_city1.png",
    "Empire City 2": "systems/gurps4e/icons/buildings/empire_city2.png",
    "Empire City 3": "systems/gurps4e/icons/buildings/empire_city3.png",
    "Farm": "systems/gurps4e/icons/buildings/farms.png",
    "Food": "systems/gurps4e/icons/buildings/food.png",
    "Guard Post": "systems/gurps4e/icons/buildings/guards.png",
    "Haunted Hill": "systems/gurps4e/icons/buildings/haunted_hill.png",
    "Haunted Wood": "systems/gurps4e/icons/buildings/haunted_wood.png",
    "Inn 1": "systems/gurps4e/icons/buildings/inn1.png",
    "Inn 2": "systems/gurps4e/icons/buildings/inn2.png",
    "Kislev City 1": "systems/gurps4e/icons/buildings/kislev_city1.png",
    "Kislev City 2": "systems/gurps4e/icons/buildings/kislev_city2.png",
    "Kislev City 3": "systems/gurps4e/icons/buildings/kislev_city3.png",
    "Lumber": "systems/gurps4e/icons/buildings/lumber.png",
    "Magic": "systems/gurps4e/icons/buildings/magic.png",
    "Metal": "systems/gurps4e/icons/buildings/metal.png",
    "Mountain 1": "systems/gurps4e/icons/buildings/mountains1.png",
    "Mountain 2": "systems/gurps4e/icons/buildings/mountains2.png",
    "Orcs": "systems/gurps4e/icons/buildings/orcs.png",
    "Orc Camp": "systems/gurps4e/icons/buildings/orc_city.png",
    "Port": "systems/gurps4e/icons/buildings/port.png",
    "Road": "systems/gurps4e/icons/buildings/roads.png",
    "Ruins": "systems/gurps4e/icons/buildings/ruins.png",
    "Scroll": "systems/gurps4e/icons/buildings/scroll.png",
    "Sigmar": "systems/gurps4e/icons/buildings/sigmar_worship.png",
    "Stables": "systems/gurps4e/icons/buildings/stables.png",
    "Standing Stones": "systems/gurps4e/icons/buildings/standing_stones.png",
    "Swamp": "systems/gurps4e/icons/buildings/swamp.png",
    "Temple": "systems/gurps4e/icons/buildings/temple.png",
    "Textile": "systems/gurps4e/icons/buildings/textile.png",
    "Tower 1": "systems/gurps4e/icons/buildings/tower1.png",
    "Tower 2": "systems/gurps4e/icons/buildings/tower2.png",
    "Tower Hill": "systems/gurps4e/icons/buildings/tower_hill.png",
    "Wizard Tower": "systems/gurps4e/icons/buildings/wizard_tower.png",
    "Ulric": "systems/gurps4e/icons/buildings/ulric_worship.png",
    "Village 1": "systems/gurps4e/icons/buildings/village1.png",
    "Village 2": "systems/gurps4e/icons/buildings/village2.png",
    "Village 3": "systems/gurps4e/icons/buildings/village3.png",
    "Wood Elves 1": "systems/gurps4e/icons/buildings/welves1.png",
    "Wood Elves 2": "systems/gurps4e/icons/buildings/welves2.png",
    "Wood Elves 3": "systems/gurps4e/icons/buildings/welves3.png"
}
