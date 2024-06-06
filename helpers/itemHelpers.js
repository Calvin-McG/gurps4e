export class itemHelpers {

    /**
     *
     * @param firearmDesign A this.system.firearmDesign object
     * @param tl A number, the TL of the weapon
     * @param psiOverride Optional, a numerical psi override
     * @returns {{}}
     */
    static calcCustomFirearmStats(firearmDesign, tl, psiOverride) {
        let firearmStats = {}

        let psi                     = psiOverride ?? firearmDesign.chamberPressure; // If we have an override PSI, use that. Otherwise default to base pressure.
        firearmStats.barrelBoreMetres        = firearmDesign.projectileCalibre / 1000 // F21 / F14
        let chamberBoreMetres       = firearmDesign.chamberBore / 1000
        let chamberPressurePascals  = psi * 6896;
        let burnLengthMeters        = firearmDesign.burnLength / 1000;
        let boreCrossSection        = Math.PI * ( firearmStats.barrelBoreMetres / 2) ** 2; // I13
        let bulletCrossSection      = Math.PI * ( firearmStats.barrelBoreMetres / 2) ** 2; // I17
        firearmStats.barrelLengthMetres      = firearmDesign.barrelLength / 1000; // F17
        let caseLengthMetres        = firearmDesign.caseLength / 1000;
        let chamberCrossSection     = Math.PI * ( chamberBoreMetres / 2 ) ** 2
        let chamberVolume           = chamberCrossSection * ( caseLengthMetres * 7/8 - firearmStats.barrelBoreMetres);
        let fallOffVolume           = chamberVolume + boreCrossSection * burnLengthMeters;
        let acclerationDistance     = firearmStats.barrelLengthMetres - caseLengthMetres - burnLengthMeters + firearmStats.barrelBoreMetres;
        let totalAcceleratedKgs     = firearmDesign.projectileMass / 15430; // F22 or F18

        // Kinetic Energy in Joules
        firearmStats.kineticEnergy = Math.abs( chamberPressurePascals * ( boreCrossSection * burnLengthMeters + fallOffVolume * Math.log( boreCrossSection * acclerationDistance / fallOffVolume + 1) ) ); //Measured in joules - D27 or K12

        // Velocity
        let metresPerSecond = Math.sqrt((2* Math.abs(firearmStats.kineticEnergy) / totalAcceleratedKgs )); // D25
        let feetPerSecond = metresPerSecond * 1000 / (12 * 25.4); // D26
        firearmStats.yardsPerSecond = Math.floor(feetPerSecond / 3);

        // Decide whether or not this gun counts 4 to 8mm projectiles as pi or pi- (High/Low energy)
        if (firearmStats.kineticEnergy > 1000 || metresPerSecond > 800) { // HT holds an M1 carbine to be normal piercing, but a P90 to be pi-. These values are set to put the split between the two.
            firearmStats.highEnergy = true;
        }
        else {
            firearmStats.highEnergy = false;
        }

        firearmStats.baseDamage = Math.round(Math.sqrt(( firearmStats.kineticEnergy ** 1.04)/( bulletCrossSection ** 0.314))/13.3926);

        let projectileVolume = (Math.PI*(firearmStats.barrelBoreMetres/2) ** 3+Math.PI/12*firearmStats.barrelBoreMetres ** 2*(2 * firearmStats.barrelBoreMetres * firearmDesign.projectileAspectRatio - firearmStats.barrelBoreMetres)); // I21
        firearmStats.projectileDensity = totalAcceleratedKgs / projectileVolume / 1000 // I22 - Measured in g/cm^2

        // Base Wound Mod
        if (firearmDesign.projectileCalibre < 4) {
            firearmStats.baseWoundMod = 1;
        }
        else if (firearmDesign.projectileCalibre < 8) {
            if (firearmStats.highEnergy) { // If the projectile is moving quickly enough or carrying enough energy, count is as 'pi', otherwise it remains pi-
                firearmStats.baseWoundMod = 2;
            }
            else {
                firearmStats.baseWoundMod = 1;
            }
        }
        else if (firearmDesign.projectileCalibre < 10) {
            firearmStats.baseWoundMod = 2;
        }
        else if (firearmDesign.projectileCalibre < 15) {
            firearmStats.baseWoundMod = 3;
        }
        else {
            firearmStats.baseWoundMod = 4;
        }

        // Weight per shot
        let projectileWeight = firearmDesign.projectileMass * 0.000142857; // Take the projectile mass above (measured in grams) and convert to pounds.

        let propellantREF = 1;
        let propellantCost = 1; // We'll use this later to determine cost per shot
        let materialCost = 1; // We'll use this later to determine the weapon's material cost
        switch (tl) {
            case 1:
            case 2:
            case 3:
                propellantREF = 0.3;
                propellantCost = 5;
                materialCost = 50;
                break;
            case 4:
                propellantREF = 0.4;
                propellantCost = 5;
                materialCost = 50;
                break;
            case 5:
                propellantREF = 0.5;
                propellantCost = 5;
                materialCost = 50;
                break;
            case 6:
                propellantREF = 0.8;
                propellantCost = 7.5;
                materialCost = 3.50;
                break;
            case 7:
                propellantREF = 0.85;
                propellantCost = 7.5;
                break;
            case 8:
                propellantREF = 0.9;
                propellantCost = 7.5;
                break;
            case 9:
                propellantREF = 0.9 * 1.5;
                propellantCost = 7.5 * 1.5;
                break;
            case 10:
                propellantREF = 0.9 * 2;
                propellantCost = 7.5 * 2;
                break;
            case 11:
                propellantREF = 0.9 * 2.5;
                propellantCost = 7.5 * 2.5;
                break;
            case 12:
                propellantREF = 0.9 * 3;
                propellantCost = 7.5 * 3;
                break;
            default:
                propellantREF = 0.8;
                propellantCost = 7.5;
                break;
        }

        let powderWeight = firearmStats.kineticEnergy / 4184; // Dividing the kinetic energy by the number of joules in a single gram of TnT gives us the powder weight, assuming that powder is TnT or an equivalent
        powderWeight = powderWeight * 0.00220462; // Convert the above number to pounds
        powderWeight = powderWeight / propellantREF; // Correct the above number for the REF of the propellant

        powderWeight *= 18; // This number is entirely arbitrary, based on the fact that running the above calculations for a 5.56mm cartridge gives a powder weight roughly 1/18th what it should be.

        firearmStats.baseWeightPerShot = projectileWeight + powderWeight;

        // Weapon Weight
        let configWeightModifier = 45;

        if (firearmDesign.action === "auto") {
            // Do nothing.
        }
        else if (firearmDesign.action === "semi") {
            configWeightModifier = 1.5 / 0.9 * configWeightModifier;
        }
        else if (firearmDesign.action === "revolverSA" || firearmDesign.action === "revolverDA") {
            configWeightModifier = 5 * configWeightModifier;
        }
        else { // Else, use the modifier for bolt action weapons.
            configWeightModifier = 1.5 / 0.75 * configWeightModifier;
        }

        // Calculate the base receiver weight
        let receiverWeight = ((firearmStats.kineticEnergy ** 0.66) / configWeightModifier / 1.4 ** (tl - 7))

        // Add weight for revolver cylinder
        if (firearmDesign.action === "revolverSA" || firearmDesign.action === "revolverDA") {
            receiverWeight = (receiverWeight) + ((receiverWeight * (firearmDesign.capacity-1)) * 0.132)
        }

        if (firearmDesign.essentialMaterials) { // The gun is made of essential materials, modify receiverWeight weight accordingly.
            receiverWeight = receiverWeight / 3;
        }

        let h25 = 44000000 * ((1.4) ** (tl - 7));

        let wallThickness = firearmDesign.chamberPressure * firearmDesign.projectileCalibre / 2 / h25; // H27

        let barrelDiameter = 2 * (wallThickness) + firearmStats.barrelBoreMetres;

        let barrelWeight = (Math.PI * (firearmStats.barrelBoreMetres / 2 + wallThickness) ** 2 - Math.PI * (firearmStats.barrelBoreMetres / 2) ** 2) * firearmStats.barrelLengthMetres * 7860

        if (firearmDesign.essentialMaterials) { // The gun is made of essential materials, modify barrelWeight accordingly.
            barrelWeight = barrelWeight / 3;
        }

        // Add weight for magazine body
        let magazineWeightMultiplier = 1;
        if (firearmDesign.magazineStyle === "none" || firearmDesign.magazineStyle === "internal"){
            magazineWeightMultiplier = 1;
        }
        else if (firearmDesign.magazineMaterial === "steel"){
            if (firearmDesign.magazineStyle === "standard") {
                magazineWeightMultiplier = 1.2;
            }
            else if (firearmDesign.magazineStyle === "highDensity") {
                magazineWeightMultiplier = 1.3;
            }
            else if (firearmDesign.magazineStyle === "extended") {
                magazineWeightMultiplier = 1.5;
            }
            else if (firearmDesign.magazineStyle === "drum") {
                magazineWeightMultiplier = 1.6;
            }
        }
        else if (firearmDesign.magazineMaterial === "alloy" || firearmDesign.magazineMaterial === "plastic"){
            if (firearmDesign.magazineStyle === "standard") {
                magazineWeightMultiplier = 1.1;
            }
            else if (firearmDesign.magazineStyle === "highDensity") {
                magazineWeightMultiplier = 1.1;
            }
            else if (firearmDesign.magazineStyle === "extended") {
                magazineWeightMultiplier = 1.2;
            }
            else if (firearmDesign.magazineStyle === "drum") {
                magazineWeightMultiplier = 1.3;
            }
        }

        if (firearmDesign.essentialMaterials) { // The gun is made of essential materials, modify magazine weight accordingly.
            magazineWeightMultiplier = 1 + ((magazineWeightMultiplier - 1)/3);
        }

        let loadedRounds = firearmDesign.capacity;
        if (firearmDesign.capacity === 0) {
            loadedRounds = 1
        }
        else if (firearmDesign.bolt.toLowerCase() === "closed") {
            loadedRounds += 1;
        }

        loadedRounds = loadedRounds * firearmDesign.barrels;

        firearmStats.ammoWeight = loadedRounds * firearmStats.baseWeightPerShot * magazineWeightMultiplier;

        firearmStats.weightKgs = (receiverWeight + barrelWeight); // The base weight of the gun.
        firearmStats.weightKgs += (((receiverWeight + barrelWeight) * 0.8) * (firearmDesign.barrels - 1)); // Add the weight of any extra barrels.
        firearmStats.weightKgs *= firearmDesign.weightTweak; // Multiply by the weight tweak
        firearmStats.weight = firearmStats.weightKgs * 2.205; // Convert from kgs to lbs.

        firearmStats.loadedWeight = Math.floor((firearmStats.weight + firearmStats.ammoWeight) * 100) / 100;

        // Recoil
        let mv = totalAcceleratedKgs * metresPerSecond;
        firearmStats.rclRaw = mv / (firearmStats.loadedWeight * 0.453592);
        console.log(firearmStats.rclRaw, firearmStats.loadedWeight, mv, totalAcceleratedKgs, metresPerSecond)

        if (firearmStats.rclRaw < 2) {
            firearmStats.rcl = 2;
        }
        else {
            firearmStats.rcl = Math.round(firearmStats.rclRaw);
        }

        // Range
        let sectionalDensity = (firearmDesign.projectileMass/15.43)/(Math.PI*(firearmDesign.projectileCalibre/2) ** 2); // D37
        let lossCoefficient = 0.000178 * sectionalDensity ** - 1.1213 / Math.pow(firearmDesign.projectileAspectRatio,1/4)*1.65; // D38

        let someWeirdConstant = 0.5 * Math.round(Math.sqrt(firearmStats.kineticEnergy ** 1.04/bulletCrossSection ** 0.314)/13.3926);

        firearmStats.halfRange = Math.round((Math.log(13.3926)+Math.log(someWeirdConstant)-0.52*Math.log(totalAcceleratedKgs/2)+0.157*Math.log(bulletCrossSection))/(-1.04*lossCoefficient) + Math.log(metresPerSecond)/lossCoefficient);
        firearmStats.maxRange = Math.round((Math.log(13.3926)+Math.log(0.017)-0.52*Math.log(totalAcceleratedKgs/2)+0.157*Math.log(bulletCrossSection))/(-1.04*lossCoefficient) + Math.log(metresPerSecond)/lossCoefficient);



        // Cost per shot
        let costOfLead = tl >= 5 ? 1 : 2;
        firearmStats.cps = (projectileWeight * costOfLead) + (propellantCost * powderWeight);

        return firearmStats;
    }

    static calcAmmoWeight() {

    }

}
