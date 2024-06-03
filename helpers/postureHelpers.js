export class postureHelpers {

    // Take the token document and update it's posture
    // Valid postures are found in CONFIG.postures on config-gurps4e.js
    static setPostureTokenDoc(tokenDoc, postureString) {
        this.setPostureTokenObj(tokenDoc.object ?? tokenDoc, postureString);
    }

    // Take the token object and update it's posture
    // Valid postures are found in CONFIG.postures on config-gurps4e.js
    static setPostureTokenObj(tokenObj, postureString) {
        // First, clear existing posture
        this.removeAllPosture(tokenObj);

        // Then normalize postureString to match how the file names are stored
        // First, drop to lowercase, then trim whitespace from edges, then remove whitespace from interior
        let filename = postureString.toLowerCase().trim().replace(/\s/g,'');

        // Then assemble the path to the effect
        let posturePath = "systems/gurps4e/icons/postures/" + filename + ".png";

        tokenObj.toggleEffect(posturePath, { active: true });
    }

    // This method is used to the set the posture of a virtual token that is directly linked to an actor, instead of being a separate copy.
    static setPostureActor(actor, postureString, tokenId) {
        let dependentTokens = actor.getDependentTokens() // Get the full list of dependent tokens the actor has
        dependentTokens.forEach( dependentToken => { // Loop through them
            if (dependentToken.id === tokenId || typeof tokenId === "undefined") { // Find the one that matches the id of the token for which we are changing posture
                this.setPostureTokenDoc(dependentToken, postureString); // Call the method to change posture by token document
            }
        })
    }

    // This method removes all posture settings from the token
    static removeAllPosture(tokenObj) {
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/standing.png",        { active: false });
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/sitting.png",         { active: false });
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/crouching.png",       { active: false });
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/crawling.png",        { active: false });
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/kneeling.png",        { active: false });
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/lyingback.png",       { active: false });
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/lyingprone.png",      { active: false });
        tokenObj.toggleEffect("systems/gurps4e/icons/postures/sittingchair.png",    { active: false });
    }

    static getPosture(tokenEffects) {

        let posture = {
            name: "standing",
            defenceMod: 0,
            meleeAttackMod: 0,
            rangedToHitMod: 0,
            movementMultiplier: 1,
            mpPerHex: 1
        }

        for (let x = 0; x < tokenEffects.length; x++) {
            if (tokenEffects[x] === ("systems/gurps4e/icons/postures/sitting.png") || tokenEffects === ("systems/gurps4e/icons/postures/sittingchair.png")) {
                posture = {
                    name: "sitting",
                    desc: "sitting",
                    defenceMod: -2,
                    meleeAttackMod: -2,
                    rangedToHitMod: -2,
                    movementMultiplier: 0,
                    mpPerHex: 1000
                }
            }
            else if (tokenEffects[x] === ("systems/gurps4e/icons/postures/crouching.png")) {
                posture = {
                    name: "crouching",
                    desc: "crouching",
                    defenceMod: 0,
                    meleeAttackMod: -2,
                    rangedToHitMod: -2,
                    movementMultiplier: 2/3,
                    mpPerHex: 1.5
                }
            }
            else if (tokenEffects[x] === ("systems/gurps4e/icons/postures/crawling.png")) {
                posture = {
                    name: "crawling",
                    desc: "crawling",
                    defenceMod: -3,
                    meleeAttackMod: -4,
                    rangedToHitMod: -2,
                    movementMultiplier: 1/3,
                    mpPerHex: 3
                }
            }
            else if (tokenEffects[x] === ("systems/gurps4e/icons/postures/kneeling.png")) {
                posture = {
                    name: "kneeling",
                    desc: "kneeling",
                    defenceMod: -2,
                    meleeAttackMod: -2,
                    rangedToHitMod: -2,
                    movementMultiplier: 1/3,
                    mpPerHex: 3
                }
            }
            else if (tokenEffects[x] === ("systems/gurps4e/icons/postures/lyingback.png")) {
                posture = {
                    name: "lyingback",
                    desc: "lying supine",
                    defenceMod: -3,
                    meleeAttackMod: -4,
                    rangedToHitMod: -2,
                    movementMultiplier: 0.01,
                    mpPerHex: 100
                }
            }
            else if (tokenEffects[x] === ("systems/gurps4e/icons/postures/lyingprone.png")) {
                posture = {
                    name: "lyingprone",
                    desc: "lying prone",
                    defenceMod: -3,
                    meleeAttackMod: -4,
                    rangedToHitMod: -2,
                    movementMultiplier: 0.01,
                    mpPerHex: 100
                }
            }
            else {
                posture = {
                    name: "standing",
                    desc: "standing",
                    defenceMod: 0,
                    meleeAttackMod: 0,
                    rangedToHitMod: 0,
                    movementMultiplier: 1,
                    mpPerHex: 1
                }
            }
        }

        return posture;
    }

}
