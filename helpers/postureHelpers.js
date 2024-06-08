export class postureHelpers {

    /**
     *
     * Valid postures are found in CONFIG.statusEffects on config-gurps4e.js
     * @param actor An Actor object
     * @param postureString A string describing the posture to assume
     */
    static setPostureActor(actor, postureString) {
        // First, clear any existing postures
        this.removeAllPosture(actor);

        // Then normalize postureString to match how the file names are stored
        // First, drop to lowercase, then trim whitespace from edges, then remove whitespace from interior
        let filename = postureString.toLowerCase().trim().replace(/\s/g,'');

        actor.toggleStatusEffect(filename, { active: true }); // Toggle the selected posture on.
    }

    /**
     * This method strips all postures from the passed actor
     * @param actor An Actor object
     */
    static removeAllPosture(actor) {
        actor.toggleStatusEffect("standing",     { active: false });
        actor.toggleStatusEffect("sitting",      { active: false });
        actor.toggleStatusEffect("crouching",    { active: false });
        actor.toggleStatusEffect("crawling",     { active: false });
        actor.toggleStatusEffect("kneeling",     { active: false });
        actor.toggleStatusEffect("lyingback",    { active: false });
        actor.toggleStatusEffect("lyingprone",   { active: false });
        actor.toggleStatusEffect("sittingchair", { active: false });
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
            if (tokenEffects[x].img === ("systems/gurps4e/icons/postures/sitting.png")) {
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
            else if (tokenEffects[x].img === ("systems/gurps4e/icons/postures/crouching.png")) {
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
            else if (tokenEffects[x].img === ("systems/gurps4e/icons/postures/crawling.png")) {
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
            else if (tokenEffects[x].img === ("systems/gurps4e/icons/postures/kneeling.png")) {
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
            else if (tokenEffects[x].img === ("systems/gurps4e/icons/postures/lyingback.png")) {
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
            else if (tokenEffects[x].img === ("systems/gurps4e/icons/postures/lyingprone.png")) {
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
