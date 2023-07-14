import {attributeHelpers} from "./attributeHelpers.js";

export class actorHelpers {

    static addSkull(actorData, id, brain) {

        let part = {
            label: "Skull",
            id: id,
            drBurn: 2,
            drCor: 2,
            drCr: 2,
            drCut: 2,
            drFat: 2,
            drImp: 2,
            drPi: 2,
            drTox: "",
            personalWoundMultBurn   : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            personalWoundMultCor    : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            personalWoundMultCr     : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            personalWoundMultCut    : actorData.injuryTolerances.homogenous ? 1.5 : brain ? 4 : 1.5,
            personalWoundMultFat    : 1,
            personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : brain ? 4 : 2,
            personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : brain ? 4 : 0.5,
            personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : brain ? 4 : 1,
            personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : brain ? 4 : 1.5,
            personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : brain ? 4 : 2,
            personalWoundMultTox    : 1,
            personalWoundMultTbb    : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            drHardening: 1,
            penaltyFront: -7,
            penaltyBack: -5,
            weightFront: 0.01851851852,
            weightBack: 0.02777777778,
            flexible: false,
            injuryCap: Infinity,
            injuryCapStrict: Infinity,
            stunAuto: true,
            stunAutoMod: 0,
            stunMod: -10,
            bleedRate: 30
        };
        return part;
    }

    static addBrain(actorData, id, brain) {
        let part = {
            label: "Brain",
            id: id,
            drBurn: "",
            drCor: "",
            drCr: "",
            drCut: "",
            drFat: "",
            drImp: "",
            drPi: "",
            drTox: "",
            personalWoundMultBurn   : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            personalWoundMultCor    : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            personalWoundMultCr     : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            personalWoundMultCut    : actorData.injuryTolerances.homogenous ? 1.5 : brain ? 4 : 1.5,
            personalWoundMultFat: 1,
            personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 4,
            personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 4,
            personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 4,
            personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 4,
            personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 4,
            personalWoundMultTox: 1,
            personalWoundMultTbb    : actorData.injuryTolerances.homogenous ? 1 : brain ? 4 : 1,
            drHardening: 1,
            penaltyFront: -7,
            penaltyBack: -5,
            weightFront: 0.01851851852,
            weightBack: 0.02777777778,
            flexible: false,
            injuryCap: Infinity,
            injuryCapStrict: Infinity,
            stunAuto: true,
            stunAutoMod: 0,
            stunMod: -10,
            bleedRate: 30
        };
        return part;
    }

    static addFace(actorData, id, ears, eyeL, eyeR, biteyness, eyesVulnerable) {
        let hasEars = ears;
        let bornBiter = biteyness;

        if (typeof hasEars == "undefined"){ // If the ears weren't specifically set
            hasEars = true; // Give them ears
        }
        if (typeof eyeL == "undefined"){ // If the left eye wasn't specifically set
            eyeL = true; // Give them a left eye
        }
        if (typeof eyeR == "undefined"){ // If the right eye wasn't specifically set
            eyeR = true; // Give them a right eye
        }
        if (typeof biteyness == "undefined"){ // If the level of biteyness wasn't specifically set
            bornBiter = 0; // Default to zero
        }
        if (typeof eyesVulnerable == "undefined"){ // If eyesVulnerable wasn't specifically set
            eyesVulnerable = false; // Default to false
        }

        let hp = actorData.reserves.hp.max;
        let partHp = Math.ceil(hp/4);
        if (partHp <= hp/4){//Make sure that part hp is greater than one quarter HP
            partHp += 1;
        }

        let eyeHp = Math.ceil(hp/10);
        if (eyeHp <= hp/10){//Make sure that part hp is greater than one tenth HP
            eyeHp += 1;
        }

        let totalSubWeightFront = 6/6;
        let totalSubWeightBack = 4/6;

        if (bornBiter > 0) { // Having any level of born biter makes it more likely to hit the nose at random, so increase total weight
            totalSubWeightFront += 1/6;
        }

        if (eyesVulnerable) {
            totalSubWeightFront += 1/6
            totalSubWeightBack += 1/6
            if (!eyeL) { // Having no left eye reduces the weight
                totalSubWeightFront -= 1/6;
                totalSubWeightBack -= 1/6
            }
            if (!eyeR) { // Having no right eye reduces the weight
                totalSubWeightFront -= 1/6;
                totalSubWeightBack -= 1/6
            }
        }
        else {
            if (!eyeL) { // Having no left eye reduces the weight
                totalSubWeightFront -= 1/12;
                totalSubWeightBack -= 1/12;
            }
            if (!eyeR) { // Having no right eye reduces the weight
                totalSubWeightFront -= 1/12;
                totalSubWeightBack -= 1/12;
            }
        }

        if (!ears) { // Having no ears reduces the weight
            totalSubWeightFront -= 1/6;
            totalSubWeightBack -= 1/6;
        }

        let part = {
            label: "Face",
            id: id,
            penaltyFront: -5,
            penaltyBack: -7,
            weightFront: 0.02777777778,
            weightBack: 0.01851851852,
            totalSubWeightFront: totalSubWeightFront,
            totalSubWeightBack: totalSubWeightBack,
            subLocation: {
                jaw: {
                    label: "Jaw",
                    id: id + ".subLocation.jaw",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1.5,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -6 + +bornBiter, // Add levels of born biter to the penalty to hit the jaw
                    penaltyBack: -6 + +bornBiter,
                    weightFront: 1/6,
                    weightBack: 0,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: true,
                    stunAutoMod: -1,
                    stunMod: -6,
                    bleedRate: 60
                },
                nose: {
                    label: "Nose",
                    id: id + ".subLocation.nose",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1.5,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 4,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 4,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 4,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 4,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 4,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -7 + +bornBiter, // Add levels of born biter to the penalty to hit the nose
                    penaltyBack: -7 + +bornBiter,
                    weightFront: (bornBiter > 0) ? 2/6 : 1/6, // Having any level of born biter makes it more likely to hit the nose at random
                    weightBack: 0,
                    hp: {
                        max: partHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? (actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.nose.hp.value : partHp) : partHp
                    },
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: true,
                    stunAutoMod: 0,
                    stunMod: -5,
                    bleedRate: 60
                },
                cheek: {
                    label: "Cheek",
                    id: id + ".subLocation.cheek",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1.5,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -6,
                    penaltyBack: -6,
                    weightFront: 2/6,
                    weightBack: 2/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: true,
                    stunAutoMod: 0,
                    stunMod: -5,
                    bleedRate: 60
                }
            }
        }

        if (eyeL) {
            part.subLocation.eyeLeft = { // Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
                label: "Left Eye",
                id: id + ".subLocation.eyeLeft",
                drBurn: "",
                drCor: "",
                drCr: "",
                drCut: "",
                drFat: "",
                drImp: "",
                drPi: "",
                drTox: "",
                personalWoundMultBurn   : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                personalWoundMultCor    : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                personalWoundMultCr     : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                personalWoundMultCut    : actorData.injuryTolerances.homogenous ? 1.5 : actorData.injuryTolerances.noBrain ? 4 : 1.5,
                personalWoundMultFat: 1,
                personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 4,
                personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 4,
                personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 4,
                personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 4,
                personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 4,
                personalWoundMultTox: 1,
                personalWoundMultTbb    : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                drHardening: 1,
                penaltyFront: eyesVulnerable ? -6 : -9,
                penaltyBack: eyesVulnerable ? -6 : -9,
                weightFront: eyesVulnerable ? 1/6 : 1/12,
                weightBack: eyesVulnerable ? 1/6 : 1/12,
                hp: {
                    max: eyeHp,
                    state: "Fine",
                    value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.eyeLeft.hp.value : partHp : partHp
                },
                flexible: false,
                injuryCap: Infinity,
                injuryCapStrict: Infinity,
                stunAuto: true,
                stunAutoMod: 0,
                stunMod: -10,
                bleedRate: 30,
                bleedMod: -3
            }
        }
        if (eyeR) {
            part.subLocation.eyeRight = { // Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
                label: "Right Eye",
                id: id + ".subLocation.eyeRight",
                drBurn: "",
                drCor: "",
                drCr: "",
                drCut: "",
                drFat: "",
                drImp: "",
                drPi: "",
                drTox: "",
                personalWoundMultBurn   : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                personalWoundMultCor    : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                personalWoundMultCr     : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                personalWoundMultCut    : actorData.injuryTolerances.homogenous ? 1.5 : actorData.injuryTolerances.noBrain ? 4 : 1.5,
                personalWoundMultFat: 1,
                personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 4,
                personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 4,
                personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 4,
                personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 4,
                personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 4,
                personalWoundMultTox: 1,
                personalWoundMultTbb    : actorData.injuryTolerances.homogenous ? 1 : actorData.injuryTolerances.noBrain ? 4 : 1,
                drHardening: 1,
                penaltyFront: eyesVulnerable ? -6 : -9,
                penaltyBack: eyesVulnerable ? -6 : -9,
                weightFront: eyesVulnerable ? 1/6 : 1/12,
                weightBack: eyesVulnerable ? 1/6 : 1/12,
                hp: {
                    max: eyeHp,
                    state: "Fine",
                    value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.eyeRight.hp.value : partHp : partHp
                },
                flexible: false,
                injuryCap: Infinity,
                injuryCapStrict: Infinity,
                stunAuto: true,
                stunAutoMod: 0,
                stunMod: -10,
                bleedRate: 30,
                bleedMod: -3
            }
        }
        if (hasEars) {
            part.subLocation.ears = {
                label: "Ear",
                    id: id + ".subLocation.ears",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1.5,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -7,
                    penaltyBack: -7,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    hp: {
                    max: partHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? (actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.ears.hp.value : partHp) : partHp
                },
                flexible: false,
                injuryCap: Infinity,
                injuryCapStrict: Infinity,
                stunAuto: true,
                stunAutoMod: 0,
                stunMod: 0,
                bleedRate: 30
            }
        }

        return part;
    }

    static addLeg(actorData, label, id){
        let hp = actorData.reserves.hp.max;
        let partHp = Math.ceil(hp / 2);
        if (partHp <= hp / 2){//Make sure that part hp is greater than one half HP
            partHp += 1;
        }

        let jointHp = Math.ceil(hp / 3);
        if (jointHp <= hp / 3){//Make sure that part hp is greater than one third HP
            jointHp += 1;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -2,
            penaltyBack: -2,
            weightFront: 0.1412037037,
            weightBack: 0.1412037037,
            totalSubWeightFront: 1,
            totalSubWeightBack: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].hp.value : partHp : partHp
            },
            flexible: false,
            subLocation: {
                shin: {
                    label: "Shin",
                    id: id + ".subLocation.shin",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -4,
                    penaltyBack: -4,
                    weightFront: 3/6,
                    weightBack: 3/6,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                thigh: {
                    label: "Thigh",
                    id: id + ".subLocation.thigh",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                insideThigh: {
                    label: "Inside Thigh",
                    id: id + ".subLocation.insideThigh",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -8,
                    penaltyBack: -3,
                    weightFront: 0,
                    weightBack: 0,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                knee: {
                    label: "Knee",
                    id: id + ".subLocation.knee",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    hp: {
                        max: jointHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.knee.hp.value : jointHp : jointHp
                    },
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                backOfKnee: {
                    label: "Back of Knee",
                    id: id + ".subLocation.backOfKnee",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -8,
                    penaltyBack: -8,
                    weightFront: 0,
                    weightBack: 0,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                artery: {
                    label: "Thigh Artery",
                    id: id + ".subLocation.artery",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 2,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 1,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1.5,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 2,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1.5,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: -3
                }
            }
        }

        return part;
    }

    static addTail(actorData, id){
        let hp = actorData.reserves.hp.max;
        let partHp = Math.ceil(hp/2);
        if (partHp <= hp/2){//Make sure that part hp is greater than one half HP
            partHp += 1;
        }

        let part = {
            label: "Tail",
            id: id,
            penaltyFront: -2,
            penaltyBack: -2,
            weightFront: 0.106481481,
            weightBack: 0.106481481,
            totalSubWeightFront: 1,
            totalSubWeightBack: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].hp.value : partHp : partHp
            },
            flexible: false,
            subLocation: {
                forearm: {
                    label: "Tail",
                    id: id + ".subLocation.forearm",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -3,
                    penaltyBack: -3,
                    weightFront: 5/6,
                    weightBack: 5/6,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                shoulder: {
                    label: "Shoulder",
                    id: id + ".subLocation.shoulder",
                    penaltyFront: -5,
                    penaltyBack: -5,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 2,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 1,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1.5,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 2,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1.5,
                    drHardening: 1,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 30,
                    bleedMod: -3
                }
            }
        }

        return part;
    }

    static addArm(actorData, label, id){
        let hp = actorData.reserves.hp.max;
        let partHp = Math.ceil(hp/2);
        if (partHp <= hp/2){//Make sure that part hp is greater than one half HP
            partHp += 1;
        }

        let jointHp = Math.ceil(hp/3);
        if (jointHp <= hp/3){//Make sure that part hp is greater than one third HP
            jointHp += 1;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -2,
            penaltyBack: -2,
            weightFront: 0.106481481,
            weightBack: 0.106481481,
            totalSubWeightFront: 1,
            totalSubWeightBack: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].hp.value : partHp : partHp
            },
            flexible: false,
            subLocation: {
                forearm: {
                    label: "Forearm",
                    id: id + ".subLocation.forearm",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -4,
                    penaltyBack: -4,
                    weightFront: 3/6,
                    weightBack: 3/6,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                upperArm: {
                    label: "Upper Arm",
                    id: id + ".subLocation.upperArm",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                elbow: {
                    label: "Elbow",
                    id: id + ".subLocation.elbow",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    hp: {
                        max: jointHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.elbow.hp.value : jointHp : jointHp
                    },
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                insideElbow: {
                    label: "Inside Elbow",
                    id: id + ".subLocation.insideElbow",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -8,
                    penaltyBack: -8,
                    weightFront: 0,
                    weightBack: 0,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                shoulder: {
                    label: "Shoulder",
                    id: id + ".subLocation.shoulder",
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 2,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 1,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1.5,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 2,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1.5,
                    drHardening: 1,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 30,
                    bleedMod: -3
                },
                armpit: {
                    label: "Armpit",
                    id: id + ".subLocation.armpit",
                    penaltyFront: -8,
                    penaltyBack: -8,
                    weightFront: 0,
                    weightBack: 0,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn   : 1,
                    personalWoundMultCor    : 1,
                    personalWoundMultCr     : 1,
                    personalWoundMultCut    : 2,
                    personalWoundMultFat    : 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 1,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1.5,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 2,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 30,
                    bleedMod: -4
                }
            }
        }

        return part;
    }

    static addChest(actorData, label, id, vitals){
        let hp = actorData.reserves.hp.max;
        let spineHp = hp + 1;

        if (typeof vitals == "undefined") { // If they did not provide a setting for vitals, default true;
            vitals = true;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weightFront: 0.12037037,
            weightBack: 0.12037037,
            totalSubWeightFront: vitals ? 1 : 5/6,
            totalSubWeightBack: vitals ? 1 : 5/6,
            flexible: false,
            subLocation: {
                chest: {
                    label: label,
                    id: id + ".subLocation.chest",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -1,
                    penaltyBack: -1,
                    weightFront: 5/6,
                    weightBack: 5/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: hp * 2,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60
                },
                spine: {
                    label: "Spine",
                    id: id + ".subLocation.spine",
                    penaltyFront: Number.NEGATIVE_INFINITY,
                    penaltyBack: -8,
                    drBurn: 3,
                    drCor: 3,
                    drCr: 3,
                    drCut: 3,
                    drFat: 3,
                    drImp: 3,
                    drPi: 3,
                    drTox: 3,
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 0,
                    weightBack: 1/6,
                    hp: {
                        max: spineHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.spine.hp.value : spineHp : spineHp
                    },
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: hp * 2,
                    stunAuto: true,
                    stunAutoMod: 0,
                    stunMod: -5,
                    bleedRate: 60
                }
            }
        }

        if (vitals) {
            part.subLocation.vitals = {
                label: "Vitals",
                id: id + ".subLocation.vitals",
                penaltyFront: -3,
                penaltyBack: -3,
                drBurn: "",
                drCor: "",
                drCr: "",
                drCut: "",
                drFat: "",
                drImp: "",
                drPi: "",
                drTox: "",
                personalWoundMultBurn   : 1,
                personalWoundMultCor    : 1,
                personalWoundMultCr     : 1,
                personalWoundMultCut    : 1.5,
                personalWoundMultFat    : 1,
                personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 3,
                personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 3,
                personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 3,
                personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultTox    : 1,
                personalWoundMultTbb    : 2,
                drHardening: 1,
                weightFront: 1/6,
                weightBack: 0,
                flexible: false,
                injuryCap: Infinity,
                injuryCapStrict: Infinity,
                stunAuto: false,
                stunAutoMod: 0,
                stunMod: 0,
                bleedRate: 30,
                bleedMod: -4
            }
        }

        return part;
    }

    static addInvertebrateChest(actorData, label, id, vitals){
        let hp = actorData.reserves.hp.max;

        if (typeof vitals == "undefined") { // If they did not provide a setting for vitals, default true;
            vitals = true;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weightFront: 0.12037037,
            weightBack: 0.12037037,
            totalSubWeightFront: vitals ? 1 : 5/6,
            totalSubWeightBack: vitals ? 1 : 5/6,
            flexible: false,
            subLocation: {
                chest: {
                    label: label,
                    id: id + ".subLocation.chest",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    penaltyFront: -1,
                    penaltyBack: -1,
                    weightFront: 5/6,
                    weightBack: 5/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: 2 * hp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 30
                }
            }
        }

        if (vitals) {
            part.subLocation.vitals = {
                label: "Vitals",
                id: id + ".subLocation.vitals",
                penaltyFront: -3,
                penaltyBack: -3,
                drBurn: "",
                drCor: "",
                drCr: "",
                drCut: "",
                drFat: "",
                drImp: "",
                drPi: "",
                drTox: "",
                personalWoundMultBurn: 1,
                personalWoundMultCor: 1,
                personalWoundMultCr: 1,
                personalWoundMultCut: 1.5,
                personalWoundMultFat: 1,
                personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 3,
                personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 3,
                personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 3,
                personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultTox: 1,
                personalWoundMultTbb: 2,
                drHardening: 1,
                weightFront: 1/6,
                weightBack: 0,
                flexible: false,
                injuryCap: Infinity,
                injuryCapStrict: Infinity,
                stunAuto: true,
                stunAutoMod: 0,
                stunMod: -5,
                bleedRate: 30,
                bleedMod: -4
            }
        }

        return part;
    }

    static addCentaurAbdomen(actorData, label, id, vitals){ // This is the abdomen for the humanoid chest
        let hp = actorData.reserves.hp.max;
        let pelvisHp = Math.ceil(hp/2);
        if (pelvisHp <= hp/2){ // Make sure that part hp is greater than one half HP
            pelvisHp += 1;
        }

        if (typeof vitals == "undefined") { // If they did not provide a setting for vitals, default true;
            vitals = true;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weightFront: 0.125,
            weightBack: 0.125,
            totalSubWeightFront: vitals ? 5/6 : 4/6,
            totalSubWeightBack: vitals ? 5/6 : 4/6,
            flexible: false,
            subLocation: {
                digestiveTract: {
                    label: "Digestive Tract",
                    id: id + ".subLocation.digestiveTract",
                    penaltyFront: -3,
                    penaltyBack: -3,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 3/6,
                    weightBack: 3/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: hp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: 0
                },
                pelvis: {
                    label: "Pelvis",
                    id: id + ".subLocation.pelvis",
                    penaltyFront: -3,
                    penaltyBack: -3,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    hp: {
                        max: pelvisHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.pelvis.hp.value : pelvisHp : pelvisHp
                    },
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: hp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: 0
                }
            }
        }

        if (vitals) {
            part.subLocation.vitals = {
                label: "Vitals",
                id: id + ".subLocation.vitals",
                penaltyFront: -3,
                penaltyBack: -3,
                drBurn: "",
                drCor: "",
                drCr: "",
                drCut: "",
                drFat: "",
                drImp: "",
                drPi: "",
                drTox: "",
                personalWoundMultBurn: 1,
                personalWoundMultCor: 1,
                personalWoundMultCr: 1,
                personalWoundMultCut: 1.5,
                personalWoundMultFat: 1,
                personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 3,
                personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 3,
                personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 3,
                personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultTox: 1,
                personalWoundMultTbb: 2,
                drHardening: 1,
                weightFront: 1/6,
                weightBack: 0,
                flexible: false,
                injuryCap: Infinity,
                injuryCapStrict: Infinity,
                stunAuto: true,
                stunAutoMod: 0,
                stunMod: -5,
                bleedRate: 30,
                bleedMod: -3
            }
        }

        return part;
    }

    static addAbdomen(actorData, label, id, vitals){
        let hp = actorData.reserves.hp.max;
        let pelvisHp = Math.ceil(hp/2);
        if (pelvisHp <= hp/2){//Make sure that part hp is greater than one half HP
            pelvisHp += 1;
        }

        if (typeof vitals == "undefined") { // If they did not provide a setting for vitals, default true;
            vitals = true;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weightFront: 0.125,
            weightBack: 0.125,
            totalSubWeightFront: vitals ? 1 : 5/6,
            totalSubWeightBack: vitals ? 1 : 5/6,
            flexible: false,
            subLocation: {
                digestiveTract: {
                    label: "Digestive Tract",
                    id: id + ".subLocation.digestiveTract",
                    penaltyFront: -3,
                    penaltyBack: -3,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 3/6,
                    weightBack: 3/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: hp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: 0
                },
                pelvis: {
                    label: "Pelvis",
                    id: id + ".subLocation.pelvis",
                    penaltyFront: -3,
                    penaltyBack: -3,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    hp: {
                        max: pelvisHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.pelvis.hp.value : pelvisHp : pelvisHp
                    },
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: hp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: 0
                },
                groin: {
                    label: "Groin",
                    id: id + ".subLocation.groin",
                    penaltyFront: -3,
                    penaltyBack: -3,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: hp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: -5,
                    bleedRate: 60,
                    bleedMod: 0
                }
            }
        }

        if (vitals) {
            part.subLocation.vitals = {
                label: "Vitals",
                id: id + ".subLocation.vitals",
                penaltyFront: -3,
                penaltyBack: -3,
                drBurn: "",
                drCor: "",
                drCr: "",
                drCut: "",
                drFat: "",
                drImp: "",
                drPi: "",
                drTox: "",
                personalWoundMultBurn: 1,
                personalWoundMultCor: 1,
                personalWoundMultCr: 1,
                personalWoundMultCut: 1.5,
                personalWoundMultFat: 1,
                personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : 3,
                personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : 3,
                personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : 3,
                personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : 3,
                personalWoundMultTox: 1,
                personalWoundMultTbb: 2,
                drHardening: 1,
                weightFront: 1/6,
                weightBack: 0,
                flexible: false,
                injuryCap: Infinity,
                injuryCapStrict: Infinity,
                stunAuto: true,
                stunAutoMod: 0,
                stunMod: -5,
                bleedRate: 30,
                bleedMod: -3
            }
        }

        return part;
    }

    static addExtremity(actorData, label, id, type, jointName, insideName){
        let hp = actorData.reserves.hp.max;
        let partHp = Math.ceil(hp/3);
        let weight;
        if (partHp <= hp/3){ // Make sure that part hp is greater than one third HP
            partHp += 1;
        }

        let jointHp = Math.ceil(hp/4);
        if (jointHp <= hp/4){ // Make sure that part hp is greater than one quarter HP
            jointHp += 1;
        }

        // Hands and feet have different hit percentages
        if (label.toLowerCase().includes("hand")){
            weight = 0.023148148;
        }
        else if (label.toLowerCase().includes("foot")){
            weight = 0.013888889;
        }
        else {
            weight = 0.018518519; // The average of foot and hand weights
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -4,
            penaltyBack: -4,
            weightFront: weight,
            weightBack: weight,
            totalSubWeightFront: 1,
            totalSubWeightBack: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].hp.value : partHp : partHp
            },
            flexible: false,
            subLocation: {
                extremity: {
                    label: type,
                    id: id + ".subLocation.extremity",
                    penaltyFront: -4,
                    penaltyBack: -4,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 5/6,
                    weightBack: 5/6,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: 0
                },
                extremityInterior: {
                    label: insideName,
                    id: id + ".subLocation.extremityInterior",
                    penaltyFront: -8,
                    penaltyBack: -8,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 0,
                    weightBack: 0,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: 0
                },
                joint: {
                    label: jointName,
                    id: id + ".subLocation.joint",
                    penaltyFront: -7,
                    penaltyBack: -7,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 1.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 1,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    hp: {
                        max: jointHp,
                        state: "Fine",
                        value: actorData.bodyType.body ? actorData.bodyType.body[id] ? actorData.bodyType.body[id].subLocation.joint.hp.value : jointHp : jointHp
                    },
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: partHp,
                    injuryCapStrict: partHp,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 60,
                    bleedMod: 0
                }
            }
        }

        return part;
    }

    static addNeck(actorData, id){
        let part = {
            label: "Neck",
            id: id,
            penaltyFront: -5,
            penaltyBack: -5,
            weightFront: 0.018518519,
            weightBack: 0.018518519,
            totalSubWeightFront: 1,
            totalSubWeightBack: 1,
            flexible: false,
            subLocation: {
                neck: {
                    label: "Neck",
                    id: id + ".subLocation.neck",
                    penaltyFront: -5,
                    penaltyBack: -5,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 2,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 0.5,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 1.5,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1,
                    drHardening: 1,
                    weightFront: 5/6,
                    weightBack: 5/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 30,
                    bleedMod: -2
                },
                vein: {
                    label: "Vein",
                    id: id + ".subLocation.vein",
                    penaltyFront: -8,
                    penaltyBack: -8,
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 1,
                    personalWoundMultCor: 1,
                    personalWoundMultCr: 1,
                    personalWoundMultCut: 2.5,
                    personalWoundMultFat: 1,
                    personalWoundMultImp    : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultPim    : actorData.injuryTolerances.homogenous ? 1/10 : actorData.injuryTolerances.unliving ? 1/5 : 1,
                    personalWoundMultPi     : actorData.injuryTolerances.homogenous ? 1/5  : actorData.injuryTolerances.unliving ? 1/3 : 1.5,
                    personalWoundMultPip    : actorData.injuryTolerances.homogenous ? 1/3  : actorData.injuryTolerances.unliving ? 1/2 : 2,
                    personalWoundMultPipp   : actorData.injuryTolerances.homogenous ? 0.5  : actorData.injuryTolerances.unliving ? 1   : 2.5,
                    personalWoundMultTox: 1,
                    personalWoundMultTbb: 1.5,
                    drHardening: 1,
                    weightFront: 1/6,
                    weightBack: 1/6,
                    flexible: false,
                    injuryCap: Infinity,
                    injuryCapStrict: Infinity,
                    stunAuto: false,
                    stunAutoMod: 0,
                    stunMod: 0,
                    bleedRate: 30,
                    bleedMod: -3
                }
            }
        }

        return part;
    }

    static fetchStat(actor, stat) { // Actor should be the actor object, stat should be the string name of the stat in question.

        if (stat.toLowerCase() == "strength" || stat.toLowerCase() == "st") {
            let smDiscount = attributeHelpers.calcSMDiscount(actor.system.bio.sm)
            return attributeHelpers.calcStOrHt(actor.system.primaryAttributes.strength, smDiscount);
        }
        else if (stat.toLowerCase() == "dexterity" || stat.toLowerCase() == "dx") {
            return attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.dexterity);
        }
        else if (stat.toLowerCase() == "intelligence" || stat.toLowerCase() == "iq") {
            return attributeHelpers.calcDxOrIq(actor.system.primaryAttributes.intelligence);
        }
        else if (stat.toLowerCase() == "health" || stat.toLowerCase() == "ht") {
            return attributeHelpers.calcStOrHt(actor.system.primaryAttributes.health);
        }
        else if (stat.toLowerCase() == "will") {
            return attributeHelpers.calcPerOrWill(actor.system.primaryAttributes.will);
        }
        else if (stat.toLowerCase() == "perception" || stat.toLowerCase() == "per") {
            return attributeHelpers.calcPerOrWill(actor.system.primaryAttributes.perception);
        }
        else if (stat.toLowerCase() == "fright" || stat.toLowerCase() == "fr") {
            return attributeHelpers.calcFright(actor.system.primaryAttributes.fright);
        }
        else {
            console.error("actorHelpers.fetchStat found an incorrect stat name");
            return -99
        }
    }
}
