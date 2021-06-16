export class actorHelpers {

    static addSkull(id) {
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
            personalWoundMultBurn: 4,
            personalWoundMultCor: 4,
            personalWoundMultCr: 4,
            personalWoundMultCut: 4,
            personalWoundMultFat: 1,
            personalWoundMultImp: 4,
            personalWoundMultPim: 4,
            personalWoundMultPi: 4,
            personalWoundMultPip: 4,
            personalWoundMultPipp: 4,
            personalWoundMultTox: 1,
            drHardening: 1,
            penaltyFront: -7,
            penaltyBack: -5,
            weight: 0.01851851852,
            flexible: false
        };
        return part;
    }

    static addBrain(id) {
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
            personalWoundMultBurn: 4,
            personalWoundMultCor: 4,
            personalWoundMultCr: 4,
            personalWoundMultCut: 4,
            personalWoundMultFat: 1,
            personalWoundMultImp: 4,
            personalWoundMultPim: 4,
            personalWoundMultPi: 4,
            personalWoundMultPip: 4,
            personalWoundMultPipp: 4,
            personalWoundMultTox: 1,
            drHardening: 1,
            penaltyFront: -7,
            penaltyBack: -5,
            weight: 0.01851851852,
            flexible: false
        };
        return part;
    }

    static addFace(hp, id) {
        let partHp = Math.ceil(hp/4);
        if (partHp <= hp/4){//Make sure that part hp is greater than one quarter HP
            partHp += 1;
        }

        let eyeHp = Math.ceil(hp/10);
        if (eyeHp <= hp/10){//Make sure that part hp is greater than one tenth HP
            eyeHp += 1;
        }

        let part = {
            label: "Face",
            id: id,
            penaltyFront: -5,
            penaltyBack: -7,
            weight: 0.02777777778,
            totalSubWeight: 1,
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -6,
                    penaltyBack: -6,
                    weight: 1/6,
                    flexible: false
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
                    personalWoundMultImp: 4,
                    personalWoundMultPim: 4,
                    personalWoundMultPi: 4,
                    personalWoundMultPip: 4,
                    personalWoundMultPipp: 4,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -7,
                    penaltyBack: -7,
                    weight: 1/6,
                    hp: {
                        max: partHp,
                        state: "Fine",
                        value: partHp
                    },
                    flexible: false
                },
                ears: {
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -7,
                    penaltyBack: -7,
                    weight: 1/6,
                    hp: {
                        max: partHp,
                        state: "Fine",
                        value: partHp
                    },
                    flexible: false
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -6,
                    penaltyBack: -6,
                    weight: 2/6,
                    flexible: false
                },
                eyes: { // Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
                    label: "Eyes",
                    id: id + ".subLocation.eyes",
                    drBurn: "",
                    drCor: "",
                    drCr: "",
                    drCut: "",
                    drFat: "",
                    drImp: "",
                    drPi: "",
                    drTox: "",
                    personalWoundMultBurn: 4,
                    personalWoundMultCor: 4,
                    personalWoundMultCr: 4,
                    personalWoundMultCut: 4,
                    personalWoundMultFat: 4,
                    personalWoundMultImp: 4,
                    personalWoundMultPim: 4,
                    personalWoundMultPi: 4,
                    personalWoundMultPip: 4,
                    personalWoundMultPipp: 4,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -9,
                    penaltyBack: -9,
                    weight: 1/6,
                    hp: {
                        max: eyeHp,
                        state: "Fine",
                        value: eyeHp
                    },
                    flexible: false
                }
            }
        }
        return part;
    }

    static addLeg(hp, label, id){
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
            weight: 0.1412037037,
            totalSubWeight: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: partHp
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -4,
                    penaltyBack: -4,
                    weight: 3/6,
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weight: 1/6,
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -8,
                    penaltyBack: -3,
                    weight: 0,
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weight: 1/6,
                    hp: {
                        max: jointHp,
                        state: "Fine",
                        value: jointHp
                    },
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -8,
                    penaltyBack: -8,
                    weight: 0,
                    flexible: false
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
                    personalWoundMultImp: 2.5,
                    personalWoundMultPim: 1,
                    personalWoundMultPi: 1.5,
                    personalWoundMultPip: 2,
                    personalWoundMultPipp: 2.5,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weight: 1/6,
                    flexible: false
                }
            }
        }

        return part;
    }

    static addTail(hp, id){
        let partHp = Math.ceil(hp/2);
        if (partHp <= hp/2){//Make sure that part hp is greater than one half HP
            partHp += 1;
        }

        let part = {
            label: "Tail",
            id: id,
            penaltyFront: -2,
            penaltyBack: -2,
            weight: 0.106481481,
            totalSubWeight: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: partHp
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -3,
                    penaltyBack: -3,
                    weight: 5/6,
                    flexible: false
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
                    personalWoundMultImp: 2.5,
                    personalWoundMultPim: 1,
                    personalWoundMultPi: 1.5,
                    personalWoundMultPip: 2,
                    personalWoundMultPipp: 2.5,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    flexible: false
                }
            }
        }

        return part;
    }

    static addArm(hp, label, id){
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
            weight: 0.106481481,
            totalSubWeight: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: partHp
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -4,
                    penaltyBack: -4,
                    weight: 3/6,
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weight: 1/6,
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weight: 1/6,
                    hp: {
                        max: jointHp,
                        state: "Fine",
                        value: jointHp
                    },
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -8,
                    penaltyBack: -8,
                    weight: 0,
                    flexible: false
                },
                shoulder: {
                    label: "Shoulder",
                    id: id + ".subLocation.shoulder",
                    penaltyFront: -5,
                    penaltyBack: -5,
                    weight: 1/6,
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
                    personalWoundMultImp: 2.5,
                    personalWoundMultPim: 1,
                    personalWoundMultPi: 1.5,
                    personalWoundMultPip: 2,
                    personalWoundMultPipp: 2.5,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    flexible: false
                },
                armpit: {
                    label: "Armpit",
                    id: id + ".subLocation.armpit",
                    penaltyFront: -8,
                    penaltyBack: -8,
                    weight: 0,
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
                    personalWoundMultImp: 2.5,
                    personalWoundMultPim: 1,
                    personalWoundMultPi: 1.5,
                    personalWoundMultPip: 2,
                    personalWoundMultPipp: 2.5,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    flexible: false
                }
            }
        }

        return part;
    }

    static addChest(hp, label, id){
        let spineHp = hp + 1;

        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weight: 0.12037037,
            totalSubWeight: 1,
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -1,
                    penaltyBack: -1,
                    weight: 5/6,
                    flexible: false
                },
                vitals: {
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
                    personalWoundMultImp: 3,
                    personalWoundMultPim: 3,
                    personalWoundMultPi: 3,
                    personalWoundMultPip: 3,
                    personalWoundMultPipp: 3,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    flexible: false
                },
                spine: {
                    label: "Spine",
                    id: id + ".subLocation.spine",
                    penaltyFront: -8,
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 0,
                    hp: {
                        max: spineHp,
                        state: "Fine",
                        value: spineHp
                    },
                    flexible: false
                }
            }
        }

        return part;
    }

    static addInvertebrateChest(hp, label, id){
        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weight: 0.12037037,
            totalSubWeight: 1,
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    penaltyFront: -1,
                    penaltyBack: -1,
                    weight: 5/6,
                    flexible: false
                },
                vitals: {
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
                    personalWoundMultImp: 3,
                    personalWoundMultPim: 3,
                    personalWoundMultPi: 3,
                    personalWoundMultPip: 3,
                    personalWoundMultPipp: 3,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    flexible: false
                }
            }
        }

        return part;
    }

    static addCentaurAbdomen(hp, label, id){ // This is the abdomen for the humanoid chest
        let pelvisHp = Math.ceil(hp/2);
        if (pelvisHp <= hp/2){ // Make sure that part hp is greater than one half HP
            pelvisHp += 1;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weight: 0.125,
            totalSubWeight: 5/6,
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 3/6,
                    flexible: false
                },
                vitals: {
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
                    personalWoundMultImp: 3,
                    personalWoundMultPim: 3,
                    personalWoundMultPi: 3,
                    personalWoundMultPip: 3,
                    personalWoundMultPipp: 3,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    flexible: false
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    hp: {
                        max: pelvisHp,
                        state: "Fine",
                        value: pelvisHp
                    },
                    flexible: false
                }
            }
        }

        return part;
    }

    static addAbdomen(hp, label, id){
        let pelvisHp = Math.ceil(hp/2);
        if (pelvisHp <= hp/2){//Make sure that part hp is greater than one half HP
            pelvisHp += 1;
        }

        let part = {
            label: label,
            id: id,
            penaltyFront: -1,
            penaltyBack: -1,
            weight: 0.125,
            totalSubWeight: 1,
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 3/6,
                    flexible: false
                },
                vitals: {
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
                    personalWoundMultImp: 3,
                    personalWoundMultPim: 3,
                    personalWoundMultPi: 3,
                    personalWoundMultPip: 3,
                    personalWoundMultPipp: 3,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    flexible: false
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    hp: {
                        max: pelvisHp,
                        state: "Fine",
                        value: pelvisHp
                    },
                    weight: 1/6,
                    flexible: false
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    flexible: false
                }
            }
        }

        return part;
    }

    static addExtremity(hp, label, id, type, jointName, insideName){
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
            weight: weight,
            totalSubWeight: 1,
            hp: {
                max: partHp,
                state: "Fine",
                value: partHp
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 5/6,
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 0,
                    flexible: false
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
                    personalWoundMultImp: 1,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1,
                    personalWoundMultPipp: 1,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    hp: {
                        max: jointHp,
                        state: "Fine",
                        value: jointHp
                    },
                    weight: 1/6,
                    flexible: false
                }
            }
        }

        return part;
    }

    static addNeck(id){
        let part = {
            label: "Neck",
            id: id,
            penaltyFront: -5,
            penaltyBack: -5,
            weight: 0.018518519,
            totalSubWeight: 1,
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
                    personalWoundMultImp: 2,
                    personalWoundMultPim: 0.5,
                    personalWoundMultPi: 1,
                    personalWoundMultPip: 1.5,
                    personalWoundMultPipp: 2,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 5/6,
                    flexible: false
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
                    personalWoundMultImp: 2.5,
                    personalWoundMultPim: 1,
                    personalWoundMultPi: 1.5,
                    personalWoundMultPip: 2,
                    personalWoundMultPipp: 2.5,
                    personalWoundMultTox: 1,
                    drHardening: 1,
                    weight: 1/6,
                    flexible: false
                }
            }
        }

        return part;
    }
}
