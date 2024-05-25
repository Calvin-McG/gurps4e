export const DAMAGETYPES = {};
export const TRAITTYPES = {};
export const ROLLABLETYPES = {};
export const ROLLABLEDIFFICULTY = {};
export const TECHNIQUEDIFFICULTY = {};
export const BASEATTR = {};
export const DEFENCETYPE = {};
export const DABBLEROPTIONS = {};
export const EQUIPSTATUS = {};
export const RELIEFTYPE = {};

DAMAGETYPES.dropdownChoices = {
    "burn": "Burning",
    "cor": "Corrosion",
    "cr": "Crushing",
    "cut": "Cutting",
    "fat": "Fatigue",
    "imp": "Impaling",
    "pi": "Piercing",
    "tox": "Toxic",
};

TRAITTYPES.dropdownChoices = {
    "advantage": "Advantage",
    "disadv": "Disadvantage",
    "perk": "Perk",
    "quirk": "Quirk",
};

ROLLABLETYPES.dropdownChoices = {
    "skill": "Skill",
    "technique": "Technique",
}

ROLLABLEDIFFICULTY.dropdownChoices = {
    "E": "Easy",
    "A": "Average",
    "H": "Hard",
    "VH": "Very Hard",
    "W": "Wildcard",
}

TECHNIQUEDIFFICULTY.dropdownChoices = {
    "A": "Average",
    "H": "Hard",
}

BASEATTR.dropdownChoices = {
    "ST": "ST",
    "DX": "DX",
    "IQ": "IQ",
    "HT": "HT",
    "Per": "Per",
    "Will": "Will",
}

DEFENCETYPE.dropdownChoices = {
    "": "No",
    "block": "Block",
    "parry": "Parry",
    "dodge": "Dodge",
}

DABBLEROPTIONS.dropdownChoices = {
    "0": "0: Default +0",
    "1": "1: Default +1",
    "2": "2: Default +2",
    "3": "4: Default +3",
}

EQUIPSTATUS.dropdownChoices = {
    "equipped": "Equipped",
    "carried": "Carried",
    "notCarried": "Not Carried",
}

RELIEFTYPE.dropdownChoices = {
    "none": "None",
    "simple": "Simple (CF: 1.5)",
    "extensive": "Extensive (CF: 4)",
}
