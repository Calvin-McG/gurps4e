export class postureHelpers {

    // Take the token document and update it's posture
    // Valid postures are found in CONFIG.postures on config-gurps4e.js
    static setPostureTokenDoc(tokenDoc, postureString) {
        this.setPostureTokenObj(tokenDoc.object, postureString);
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

}
