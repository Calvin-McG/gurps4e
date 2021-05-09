/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class gurpsItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["gurps4e", "sheet", "item"],
      width: 635,
      height: 450,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "notes" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/gurps4e/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 300;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Roll handlers, click handlers, etc. would go here.
        // User clicked addRow
        html.find('.addRow').click(this._onAddRow.bind(this));
        html.find('.addRangedRow').click(this._onAddRangedRow.bind(this));
        html.find('.addDefaultRow').click(this._onAddDefaultRow.bind(this));

        //User clicked delete thingy on the row
        html.find('.attack-delete').click(this._onDeleteRow.bind(this));
        html.find('.ranged-delete').click(this._onDeleteRangedRow.bind(this));
        html.find('.default-delete').click(this._onDeleteDefaultRow.bind(this));

        // Update body type
        html.find('.bodyType').change(this._onBodyTypeChange.bind(this))
    }

    _onAddRow(event) {
        let keys = Object.keys(this.item.data.data.melee);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }

        let newRow = { "name": "" };
        this.item.update({ ["data.melee." + newKey]: newRow });
    }
    _onAddRangedRow(event) {
        let keys = Object.keys(this.item.data.data.ranged);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }

        let newRow = { "name": "" };
        this.item.update({ ["data.ranged." + newKey]: newRow });
    }
    _onAddDefaultRow(event) {
        let keys = Object.keys(this.item.data.data.defaults);
        let newKey = 0;
        if (keys.length){//Array is not empty
            newKey = (+keys[keys.length-1] + +1);
        }

        let newRow = { "skill": "" };
        this.item.update({ ["data.defaults." + newKey]: newRow });
    }

    _onDeleteRow(event) {
        let id = event.currentTarget.id.substring(6);
        this.item.update({ ["data.melee.-=" + id] : null});
    }

    _onDeleteRangedRow(event) {
        let id = event.currentTarget.id.substring(6);
        this.item.update({ ["data.ranged.-=" + id] : null});
    }

    _onDeleteDefaultRow(event) {
        let id = event.currentTarget.id.substring(7);
        this.item.update({ ["data.defaults.-=" + id] : null});
    }

    _onBodyTypeChange(event) {
        event.preventDefault();
        console.log(event.target.value);
        let bodyType = event.target.value;

        if(bodyType == ""){
            console.log("No type selected.")
            this.actor.update({ "data.bodyType.-=body" : null}).then( actor => {// Remove the old body
                console.log(actor);
            });
            return
        }

        let actorData = this.object.data.data
        console.log(actorData)

        let bodyObj = {};

        //Spoders and squids have a brain instead of a skull. Everyone else has a skull
        if (bodyType == "arachnoid" || bodyType == "octopod"){
            bodyObj.brain = this.addBrain();
        }
        else {
            bodyObj.skull = this.addSkull();
        }

        //Body parts that apply to all body types
        bodyObj.face = this.addFace();

        //The following body parts are specific to said body types
        if (bodyType == "humanoid"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        if (bodyType == "wingedHumanoid"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "quadruped"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "wingedQuadruped"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "hexapod"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Upper Thorax Arm");
            bodyObj.armRight = this.addArm("Right Upper Thorax Arm");
            bodyObj.lowerArmLeft = this.addArm("Left Lower Thorax Arm");
            bodyObj.lowerArmRight = this.addArm("Right Lower Thorax Arm");
            bodyObj.upperchest = this.addChest("Upper Thorax");
            bodyObj.lowerChest = this.addChest("Mid Thorax");
            bodyObj.abdomen = this.addAbdomen("Lower Thorax");
            bodyObj.handLeft = this.addExtremity("Left Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandLeft = this.addExtremity("Left Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandRight = this.addExtremity("Right Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "wingedHexapod"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.armLeft = this.addArm("Left Upper Thorax Arm");
            bodyObj.armRight = this.addArm("Right Upper Thorax Arm");
            bodyObj.lowerArmLeft = this.addArm("Left Lower Thorax Arm");
            bodyObj.lowerArmRight = this.addArm("Right Lower Thorax Arm");
            bodyObj.upperchest = this.addChest("Upper Thorax");
            bodyObj.lowerChest = this.addChest("Mid Thorax");
            bodyObj.abdomen = this.addAbdomen("Lower Thorax");
            bodyObj.handLeft = this.addExtremity("Left Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Upper Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandLeft = this.addExtremity("Left Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.lowerHandRight = this.addExtremity("Right Lower Thorax Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "centaur"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Humanoid Upper Chest");
            bodyObj.lowerChest = this.addChest("Humanoid Lower Chest");
            bodyObj.chestAnimal = this.addChest("Animal Chest");
            bodyObj.abdomen = this.addCentaurAbdomen("Humanoid Abdomen");
            bodyObj.animalAbdomen = this.addAbdomen("Animal Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "avian"){
            bodyObj.legLeft = this.addLeg("Left Leg");
            bodyObj.legRight = this.addLeg("Right Leg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.footLeft = this.addExtremity("Left Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
            bodyObj.tail = this.addTail("Tail");
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "vermiform"){
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "lamia"){
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "wingedLamia"){
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.handLeft = this.addExtremity("Left Hand", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Hand", "Hand", "Wrist", "Palm");
            bodyObj.neck = this.addNeck();
            bodyObj.wingLeft = this.addArm("Left Wing");
            bodyObj.wingRight = this.addArm("Right Wing");
        }
        else if (bodyType == "octopod"){
            bodyObj.upperChest = this.addInvertebrateChest("Upper Chest");
            bodyObj.lowerChest = this.addInvertebrateChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.tentacleLeft1 = this.addArm("Left Tentacle 1");
            bodyObj.tentacleLeft2 = this.addArm("Left Tentacle 2");
            bodyObj.tentacleLeft3 = this.addArm("Left Tentacle 3");
            bodyObj.tentacleLeft4 = this.addArm("Left Tentacle 4");
            bodyObj.tentacleRight1 = this.addArm("Right Tentacle 1");
            bodyObj.tentacleRight2 = this.addArm("Right Tentacle 2");
            bodyObj.tentacleRight3 = this.addArm("Right Tentacle 3");
            bodyObj.tentacleRight4 = this.addArm("Right Tentacle 4");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "cancroid"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.armLeft = this.addArm("Left Arm");
            bodyObj.armRight = this.addArm("Right Arm");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.handLeft = this.addExtremity("Left Claw", "Hand", "Wrist", "Palm");
            bodyObj.handRight = this.addExtremity("Right Claw", "Hand", "Wrist", "Palm");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }
        else if (bodyType == "ichthyoid"){
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.neck = this.addNeck();
            bodyObj.tail = this.addTail("Tail");
            bodyObj.fin1 = this.addExtremity("Dorsal Fin", "Fin", "Joint");
            bodyObj.fin2 = this.addExtremity("Left Fin", "Fin", "Joint");
            bodyObj.fin3 = this.addExtremity("Right Fin", "Fin", "Joint");
        }
        else if (bodyType == "arachnoid"){
            bodyObj.hindlegLeft = this.addLeg("Left Hind Leg");
            bodyObj.hindlegRight = this.addLeg("Right Hind Leg");
            bodyObj.hindmidlegLeft = this.addLeg("Left Mid Hind Leg");
            bodyObj.hindmidlegRight = this.addLeg("Right Mid Hind Leg");
            bodyObj.foremidlegLeft = this.addLeg("Left Mid Foreleg");
            bodyObj.foremidlegRight = this.addLeg("Right Mid Foreleg");
            bodyObj.legLeft = this.addLeg("Left Foreleg");
            bodyObj.legRight = this.addLeg("Right Foreleg");
            bodyObj.upperChest = this.addChest("Upper Chest");
            bodyObj.lowerChest = this.addChest("Lower Chest");
            bodyObj.abdomen = this.addAbdomen("Abdomen");
            bodyObj.footLeft = this.addExtremity("Left Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.footRight = this.addExtremity("Right Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.foremidFootLeft = this.addExtremity("Left Mid Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.foremidFootRight = this.addExtremity("Right Mid Fore Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindmidFootLeft = this.addExtremity("Left Mid Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindmidFootRight = this.addExtremity("Right Mid Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootLeft = this.addExtremity("Left Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.hindFootRight = this.addExtremity("Right Hind Foot", "Foot", "Ankle", "Sole");
            bodyObj.neck = this.addNeck();
        }

        console.log("Updating body on item")
        console.log(bodyObj)
        this.item.update({ "data.armour.bodyType.-=body" : null}).then( item => {// Remove the old body
            console.log(item);
            this.item.update({ "data.armour.bodyType.body" : bodyObj }) // Add the new body
        });
    }

    addSkull() {
        let part = {
            label: "Skull",
            drBurn: 2,
            drCor: 2,
            drCr: 2,
            drCut: 2,
            drFat: 2,
            drImp: 2,
            drPi: 2,
            drTox: 0,
            drHardeningBurn: 0,
            drHardeningCor: 0,
            drHardeningCr: 0,
            drHardeningCut: 0,
            drHardeningFat: 0,
            drHardeningImp: 0,
            drHardeningPi: 0,
            drHardeningTox: 0,
            flexible: false
        };
        return part;
    }

    addBrain() {
        let part = {
            label: "Brain",
            drBurn: 0,
            drCor: 0,
            drCr: 0,
            drCut: 0,
            drFat: 0,
            drImp: 0,
            drPi: 0,
            drTox: 0,
            drHardeningBurn: 0,
            drHardeningCor: 0,
            drHardeningCr: 0,
            drHardeningCut: 0,
            drHardeningFat: 0,
            drHardeningImp: 0,
            drHardeningPi: 0,
            drHardeningTox: 0,
            flexible: false
        };
        return part;
    }

    addFace() {
        let part = {
            label: "Face",
            subLocation: {
                jaw: {
                    label: "Jaw",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                nose: {
                    label: "Nose",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                ears: {
                    label: "Ears",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                cheek: {
                    label: "Cheek",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                eyes: {//Kromm's ruling on eyes http://forums.sjgames.com/showpost.php?p=733298&postcount=33
                    label: "Eyes",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }
        return part;
    }

    addLeg(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                shin: {
                    label: "Shin",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                thigh: {
                    label: "Thigh",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                insideThigh: {
                    label: "Inside Thigh",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                knee: {
                    label: "Knee",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                backOfKnee: {
                    label: "Back of Knee",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                artery: {
                    label: "Thigh Artery",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addTail(){
        let part = {
            label: "Tail",
            flexible: false,
            subLocation: {
                forearm: {
                    label: "Tail",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                shoulder: {
                    label: "Shoulder",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addArm(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                forearm: {
                    label: "Forearm",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                upperArm: {
                    label: "Upper Arm",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                elbow: {
                    label: "Elbow",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                insideElbow: {
                    label: "Inside Elbow",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                shoulder: {
                    label: "Shoulder",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                armpit: {
                    label: "Armpit",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addChest(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                chest: {
                    label: label,
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                vitals: {
                    label: "Vitals",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                spine: {
                    label: "Spine",
                    drBurn: 3,
                    drCor: 3,
                    drCr: 3,
                    drCut: 3,
                    drFat: 3,
                    drImp: 3,
                    drPi: 3,
                    drTox: 3,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addInvertebrateChest(hp, label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                chest: {
                    label: label,
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                vitals: {
                    label: "Vitals",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addCentaurAbdomen(label){ // This is the abdomen for the humanoid chest
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                digestiveTract: {
                    label: "Digestive Tract",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                vitals: {
                    label: "Vitals",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                pelvis: {
                    label: "Pelvis",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addAbdomen(label){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                digestiveTract: {
                    label: "Digestive Tract",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                vitals: {
                    label: "Vitals",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                pelvis: {
                    label: "Pelvis",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                groin: {
                    label: "Groin",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addExtremity(label, type, jointName, insideName){
        let part = {
            label: label,
            flexible: false,
            subLocation: {
                extremity: {
                    label: type,
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                extremityInterior: {
                    label: insideName,
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                joint: {
                    label: jointName,
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }

    addNeck(){
        let part = {
            label: "Neck",
            flexible: false,
            subLocation: {
                neck: {
                    label: "Neck",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                },
                vein: {
                    label: "Vein",
                    drBurn: 0,
                    drCor: 0,
                    drCr: 0,
                    drCut: 0,
                    drFat: 0,
                    drImp: 0,
                    drPi: 0,
                    drTox: 0,
                    drHardeningBurn: 0,
                    drHardeningCor: 0,
                    drHardeningCr: 0,
                    drHardeningCut: 0,
                    drHardeningFat: 0,
                    drHardeningImp: 0,
                    drHardeningPi: 0,
                    drHardeningTox: 0,
                    flexible: false
                }
            }
        }

        return part;
    }
}
