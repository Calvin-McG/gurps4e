export class materialHelpers {

    static getBowMaterialByName(name) {
        const materials = this.fetchBowMaterials();
        let selectedMaterial;
        if (typeof name != "undefined"){
            materials.forEach( material => {
                if (material.name.toLowerCase() == name.toLowerCase()) {
                    selectedMaterial = material;
                }
            })
        }

        return selectedMaterial;
    }

    static essentializeBowMaterial(material) {
        const simpleEssentialMaterials = game.settings.get("gurps4e", "simpleEssentialMaterials");

        let essentialMaterial = material;

        if (simpleEssentialMaterials) {
            essentialMaterial.tensileStPsi = essentialMaterial.tensileStPsi * 3;
            essentialMaterial.a = essentialMaterial.a / 3;
        }
        else {
            essentialMaterial.tensileStPsi = essentialMaterial.tensileStPsi * 9;
            essentialMaterial.elasticModulusPsi = essentialMaterial.elasticModulusPsi * 9;
            essentialMaterial.tensileStPsi = essentialMaterial.tensileStPsi / 3;
        }

        return material;
    }

    static getArmourMaterialByName(name) {
        const materials = this.fetchArmourMaterials();
        let selectedMaterial;
        if (typeof name != "undefined"){
            materials.forEach( material => {
                if (material.name.toLowerCase() == name.toLowerCase()) {
                    selectedMaterial = material;
                }
            })
        }

        return selectedMaterial;
    }

    static getAndCalculateArmourMaterialByName(name, essential) {
        let selectedMaterial = this.getArmourMaterialByName(name);

        if (essential) {
            selectedMaterial = this.essentializeArmourMaterial(selectedMaterial);
        }

        return selectedMaterial;
    }

    static essentializeArmourMaterial(material) {
        let essentialMaterial = material;

        essentialMaterial.wm = essentialMaterial.wm / 3;
        essentialMaterial.maxDR = essentialMaterial.maxDR * 3;
        essentialMaterial.drPerIn = essentialMaterial.drPerIn * 3;
        essentialMaterial.costLT = essentialMaterial.costLT * 30;
        essentialMaterial.costHT = essentialMaterial.costHT * 30;
        essentialMaterial.essential = true;

        return material;
    }

    static getArmourConstructionMethodByName(name) {
        const constructionTypes = this.fetchArmourConstructionMethods();
        let selectedConstructionType;
        if (typeof name != "undefined"){
            constructionTypes.forEach( constructionType => {
                if (constructionType.name.toLowerCase() == name.toLowerCase()) {
                    selectedConstructionType = constructionType;
                }
            })
        }

        return selectedConstructionType;
    }

    static fetchArmourConstructionMethods() {
        const constructionMethods = [
            {
                "tl": 0,
                "name": "No Armour",
                "wm": 0.0000,
                "cm": 0,
                "don": 0,
                "minDR": 0,
                "flexible": true,
                "notes": ""
            },
            {
                "tl": 0,
                "name": "Fabric",
                "wm": 1,
                "cm": 1,
                "don": 2.14,
                "minDR": 1,
                "flexible": true,
                "notes": "-1 DR vs impaling damage"
            },
            {
                "tl": 0,
                "name": "Layered Fabric",
                "wm": 1.2,
                "cm": 2,
                "don": 4.28,
                "minDR": 2,
                "flexible": true,
                "notes": "Removes the -1 DR vs impaling damage penalty that Fabric has"
            },
            {
                "tl": 1,
                "name": "Scales",
                "wm": 1.1,
                "cm": 1,
                "don": 4.28,
                "minDR": 2,
                "flexible": true,
                "notes": "-1 DR vs crushing damage unless armour DR is 4+"
            },
            {
                "tl": 1,
                "name": "Early Plate",
                "wm": 0.8,
                "cm": 5,
                "don": 6.42,
                "minDR": 3,
                "flexible": false,
                "notes": "Not useable in certain locations like the abdomen. This option is TL3 for ferrous metals. " +
                    "Early Plate uses arming nails instead of sliding rivets. " +
                    "Weight and cost are the same but armour chinks are easier to target (-6 instead of -8, and -8 instead of -10)"
            },
            {
                "tl": 1,
                "name": "Solid",
                "wm": 1,
                "cm": 1,
                "don": 2,
                "minDR": 10,
                "flexible": false,
                "notes": "Rarely used in personal armour. Sees limited use in cheap helmets and pectoral plates. This option is TL4 for ferrous metals."
            },
            {
                "tl": 2,
                "name": "Mail",
                "wm": 0.9,
                "cm": 1,
                "don": 2.14,
                "minDR": 2,
                "flexible": true,
                "notes": "-2 DR vs crushing damage. If this location has more than 10DR then the penalty is -20%"
            },
            {
                "tl": 2,
                "name": "Segmented Plate",
                "wm": 1.45,
                "cm": 2,
                "don": 6.42,
                "minDR": 3,
                "flexible": false,
                "notes": ""
            },
            {
                "tl": 4,
                "name": "Plate",
                "wm": 0.8,
                "cm": 5,
                "don": 6.42,
                "minDR": 3,
                "flexible": false,
                "notes": "Not useable in certain locations like the abdomen."
            },
            {
                "tl": 6,
                "name": "Impact Absorbing",
                "wm": 0.65,
                "cm": 5,
                "don": 4.28,
                "minDR": 2,
                "flexible": false,
                "notes": "DR is halved against non-crushing attacks."
            },
            {
                "tl": 6,
                "name": "Optimized Fabric",
                "wm": 0.8,
                "cm": 2,
                "don": 2.14,
                "minDR": 1,
                "flexible": true,
                "notes": "Despite being flexible, optimised fabric is vulnerable to targeting armour chinks."
            },
        ];

        return constructionMethods;
    }

    static fetchArmourMaterials() {
        const materials = [
            {
                "tl": 0,
                "name": "No Armor",
                "wm": 0.0000,
                "costLT": 0.0000,
                "costHT": 0.0000,
                "drPerIn": 0.0000,
                "maxDR": 0.0000,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 0,
                "name": "Bone",
                "wm": 1.0000,
                "costLT": 12.5000,
                "costHT": 12.5000,
                "drPerIn": 8.0000,
                "maxDR": 4.0000,
                "semiablative": true,
                "scales": true,
                "solid": true
            },
            {
                "tl": 0,
                "name": "Cloth",
                "wm": 0.8500,
                "costLT": 8.0000,
                "costHT": 8.0000,
                "drPerIn": 4.0000,
                "maxDR": 4.0000,
                "combustible": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 0,
                "name": "Horn",
                "wm": 1.0000,
                "costLT": 12.5000,
                "costHT": 12.5000,
                "drPerIn": 8.0000,
                "maxDR": 4.0000,
                "scales": true,
                "solid": true
            },
            {
                "tl": 0,
                "name": "Leather",
                "wm": 0.9000,
                "costLT": 10.0000,
                "costHT": 10.0000,
                "drPerIn": 8.0000,
                "maxDR": 4.0000,
                "combustible": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true,
                "scales": true
            },
            {
                "tl": 0,
                "name": "Wood",
                "wm": 1.4000,
                "costLT": 3.0000,
                "costHT": 3.0000,
                "drPerIn": 1.5000,
                "maxDR": 2.0000,
                "combustible": true,
                "semiablative": true,
                "scales": true,
                "solid": true
            },
            {
                "tl": 1,
                "name": "Low Quality Bronze",
                "wm": 0.9000,
                "costLT": 60.0000,
                "costHT": 12.0000,
                "drPerIn": 48.0000,
                "maxDR": 9.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 1,
                "name": "High Quality Bronze",
                "wm": 0.6000,
                "costLT": 100.0000,
                "costHT": 20.0000,
                "drPerIn": 68.0000,
                "maxDR": 14.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 1,
                "name": "Copper",
                "wm": 1.6000,
                "costLT": 80.0000,
                "costHT": 80.0000,
                "drPerIn": 30.0000,
                "maxDR": 5.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 1,
                "name": "Stone",
                "wm": 1.2000,
                "costLT": 12.5000,
                "costHT": 12.5000,
                "drPerIn": 13.0000,
                "maxDR": 5.0000,
                "scales": true,
                "solid": true
            },
            {
                "tl": 2,
                "name": "Low Quality Iron",
                "wm": 0.8000,
                "costLT": 15.0000,
                "costHT": 3.0000,
                "drPerIn": 52.0000,
                "maxDR": 10.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 2,
                "name": "High Quality Iron",
                "wm": 0.6000,
                "costLT": 25.0000,
                "costHT": 5.0000,
                "drPerIn": 68.0000,
                "maxDR": 14.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 2,
                "name": "Lead",
                "wm": 2.0000,
                "costLT": 12.5000,
                "costHT": 2.5000,
                "drPerIn": 30.0000,
                "maxDR": 4.0000,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 3,
                "name": "Steel",
                "wm": 0.5800,
                "costLT": 50.0000,
                "costHT": 10.0000,
                "drPerIn": 70.0000,
                "maxDR": 14.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 4,
                "name": "Early Hardened Steel",
                "wm": 0.5000,
                "costLT": 250.0000,
                "costHT": 50.0000,
                "drPerIn": 81.0000,
                "maxDR": 16.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 6,
                "name": "High Strength Steel",
                "wm": 0.5800,
                "costLT": 10.0000,
                "costHT": 2.0000,
                "drPerIn": 70.0000,
                "maxDR": 14.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 6,
                "name": "Hardened Steel",
                "wm": 0.5000,
                "costLT": 17.5000,
                "costHT": 3.5000,
                "drPerIn": 82.0000,
                "maxDR": 16.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 6,
                "name": "Rubber",
                "wm": 0.4500,
                "costLT": 25.0000,
                "costHT": 5.0000,
                "drPerIn": 14.0000,
                "maxDR": 7.0000,
                "impact": true,
                "combustible": true,
                "flexible": true,
                "semiablative": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 6,
                "name": "Aluminium",
                "wm": 0.4500,
                "costLT": 75.0000,
                "costHT": 15.0000,
                "drPerIn": 31.0000,
                "maxDR": 5.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Elastic Polymer",
                "wm": 0.1600,
                "costLT": 500.0000,
                "costHT": 100.0000,
                "drPerIn": 16.0000,
                "maxDR": 8.0000,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 7,
                "name": "Nomex",
                "wm": 0.0660,
                "costLT": 250.0000,
                "costHT": 50.0000,
                "drPerIn": 10.0000,
                "maxDR": 5.0000,
                "fireResistant": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 7,
                "name": "Nylon",
                "wm": 0.5000,
                "costLT": 125.0000,
                "costHT": 25.0000,
                "drPerIn": 6.0000,
                "maxDR": 3.0000,
                "ballistic2": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 7,
                "name": "Basic Ceramic",
                "wm": 0.2000,
                "costLT": 125.0000,
                "costHT": 25.0000,
                "drPerIn": 83.0000,
                "maxDR": 35.0000,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": "TRUE"
            },
            {
                "tl": 7,
                "name": "Ballistic Resin",
                "wm": 0.5500,
                "costLT": 12.5000,
                "costHT": 2.5000,
                "drPerIn": 15.0000,
                "maxDR": 6.0000,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Fiberglass",
                "wm": 0.6000,
                "costLT": 40.0000,
                "costHT": 8.0000,
                "drPerIn": 17.0000,
                "maxDR": 7.0000,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "High-Strength Aluminum",
                "wm": 0.4000,
                "costLT": 60.0000,
                "costHT": 12.0000,
                "drPerIn": 35.0000,
                "maxDR": 10.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Plastic",
                "wm": 0.7500,
                "costLT": 9.0000,
                "costHT": 1.8000,
                "drPerIn": 12.0000,
                "maxDR": 3.0000,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": "TRUE"
            },
            {
                "tl": 7,
                "name": "Polycarbonate",
                "wm": 0.4500,
                "costLT": 50.0000,
                "costHT": 10.0000,
                "drPerIn": 10.0000,
                "maxDR": 3.0000,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": "TRUE"
            },
            {
                "tl": 7,
                "name": "Steel, Very Hard",
                "wm": 0.4500,
                "costLT": 100.0000,
                "costHT": 20.0000,
                "drPerIn": 90.0000,
                "maxDR": 18.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Titanium Alloy",
                "wm": 0.3500,
                "costLT": 250.0000,
                "costHT": 50.0000,
                "drPerIn": 57.0000,
                "maxDR": 12.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 8,
                "name": "Ballistic Polymer",
                "wm": 0.0600,
                "costLT": 1000.0000,
                "costHT": 200.0000,
                "drPerIn": 48.0000,
                "maxDR": 24.0000,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Improved Ballistic Polymer",
                "wm": 0.0400,
                "costLT": 1250.0000,
                "costHT": 250.0000,
                "drPerIn": 75.0000,
                "maxDR": 36.0000,
                "ballistic25": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Kevlar",
                "wm": 0.1000,
                "costLT": 400.0000,
                "costHT": 80.0000,
                "drPerIn": 33.0000,
                "maxDR": 16.0000,
                "ballistic4": true,
                "ballistic25": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Improved Kevlar",
                "wm": 0.0800,
                "costLT": 600.0000,
                "costHT": 120.0000,
                "drPerIn": 40.0000,
                "maxDR": 20.0000,
                "ballistic3": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Improved Nomex",
                "wm": 0.0550,
                "costLT": 175.0000,
                "costHT": 35.0000,
                "drPerIn": 10.0000,
                "maxDR": 5.0000,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Aramid Fiber",
                "wm": 0.1600,
                "costLT": 400.0000,
                "costHT": 80.0000,
                "drPerIn": 48.0000,
                "maxDR": 24.0000,
                "ballistic4": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Improved Ceramic",
                "wm": 0.1500,
                "costLT": 500.0000,
                "costHT": 100.0000,
                "drPerIn": 111.0000,
                "maxDR": 44.0000,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 8,
                "name": "Laminated Polycarbonate",
                "wm": 0.2500,
                "costLT": 125.0000,
                "costHT": 25.0000,
                "drPerIn": 12.0000,
                "maxDR": 5.0000,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": "TRUE"
            },
            {
                "tl": 8,
                "name": "Polymer Composite",
                "wm": 0.2200,
                "costLT": 200.0000,
                "costHT": 40.0000,
                "drPerIn": 28.0000,
                "maxDR": 11.0000,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 8,
                "name": "Titanium Composite",
                "wm": 0.2000,
                "costLT": 1250.0000,
                "costHT": 250.0000,
                "drPerIn": 104.0000,
                "maxDR": 42.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 8,
                "name": "Ultra-Strength Steel",
                "wm": 0.3500,
                "costLT": 150.0000,
                "costHT": 30.0000,
                "drPerIn": 116.0000,
                "maxDR": 23.0000,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 9,
                "name": "Arachnoweave",
                "wm": 0.0300,
                "costLT": 3000.0000,
                "costHT": 600.0000,
                "drPerIn": 96.0000,
                "maxDR": 48.0000,
                "ballistic4": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Basic Nanoweave",
                "wm": 0.0300,
                "costLT": 3750.0000,
                "costHT": 750.0000,
                "drPerIn": 110.0000,
                "maxDR": 55.0000,
                "ballistic3": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Laser-Ablative Polymer",
                "wm": 0.0180,
                "costLT": 750.0000,
                "costHT": 150.0000,
                "drPerIn": 128.0000,
                "maxDR": 64.0000,
                "laser": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Magnetic Liquid Armor",
                "wm": 0.0320,
                "costLT": 1000.0000,
                "costHT": 200.0000,
                "drPerIn": 90.0000,
                "maxDR": 45.0000,
                "ballistic2": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "STF Liquid Armor",
                "wm": 0.0320,
                "costLT": 750.0000,
                "costHT": 150.0000,
                "drPerIn": 90.0000,
                "maxDR": 45.0000,
                "ballistic3": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            }
        ]

        return materials;
    }

    static fetchBowMaterials() {
        const materials = [
            {
                "name": "Advanced Nanotube-Cellulose Compound",
                "densityLbsCuIn": 0.020,
                "tensileStPsi": 750000,
                "elasticModulusPsi": 30000000,
                "a": 0.34,
                "builtIn": true,
                "tl": 10
            },
            {
                "name": "Aluminum 7075-T6",
                "densityLbsCuIn": 0.101,
                "tensileStPsi": 72500,
                "elasticModulusPsi": 10400000,
                "a": 0.72,
                "builtIn": true,
                "tl": 6
            },
            {
                "name": "Bone - Antler",
                "densityLbsCuIn": 0.067,
                "tensileStPsi": 27267,
                "elasticModulusPsi": 2480145,
                "a": 1.02,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Bone - Cattle Femur",
                "densityLbsCuIn": 0.072,
                "tensileStPsi": 15664,
                "elasticModulusPsi": 2567168,
                "a": 1.03,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Carbon fiber composite",
                "densityLbsCuIn": 0.070,
                "tensileStPsi": 275500,
                "elasticModulusPsi": 16965000,
                "a": 0.34,
                "builtIn": true,
                "tl": 7
            },
            {
                "name": "Carbon Nano-Matrix",
                "densityLbsCuIn": 0.001,
                "tensileStPsi": 1000000,
                "elasticModulusPsi": 40000000,
                "a": 0.7,
                "builtIn": true,
                "tl": 11
            },
            {
                "name": "Fiberglass (E-glass standard fiberglass)",
                "densityLbsCuIn": 0.054,
                "tensileStPsi": 253750,
                "elasticModulusPsi": 6525000,
                "a": 0.65,
                "builtIn": true,
                "tl": 7
            },
            {
                "name": "Fiberglass (S-glass structural composite)",
                "densityLbsCuIn": 0.072,
                "tensileStPsi": 341000,
                "elasticModulusPsi": 7690000,
                "a": 0.70,
                "builtIn": true,
                "tl": 7
            },
            {
                "name": "Horn",
                "densityLbsCuIn": 0.047,
                "tensileStPsi": 18000,
                "elasticModulusPsi": 384000,
                "a": 1.20,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Ivory - Indian Elephant",
                "densityLbsCuIn": 0.061,
                "tensileStPsi": 15954,
                "elasticModulusPsi": 1812972,
                "a": 1.07,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Nanotube-Cellulose Compound",
                "densityLbsCuIn": 0.040,
                "tensileStPsi": 500000,
                "elasticModulusPsi": 20000000,
                "a": 0.34,
                "builtIn": true,
                "tl": 9
            },
            {
                "name": "Silk - Silkworm",
                "densityLbsCuIn": 0.048,
                "tensileStPsi": 37710,
                "elasticModulusPsi": 1435874,
                "a": 1.07,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Silk - Spider",
                "densityLbsCuIn": 0.040,
                "tensileStPsi": 26107,
                "elasticModulusPsi": 4931283,
                "a": 0.64,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Silver",
                "densityLbsCuIn": 0.373,
                "tensileStPsi": 60000,
                "elasticModulusPsi": 12000000,
                "a": 1.05,
                "builtIn": true,
                "tl": 1
            },
            {
                "name": "Sinew",
                "densityLbsCuIn": 0.047,
                "tensileStPsi": 20000,
                "elasticModulusPsi": 400000,
                "a": 1.19,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Steel (TL 3)",
                "densityLbsCuIn": 0.281,
                "tensileStPsi": 105000,
                "elasticModulusPsi": 30450000,
                "a": 0.70,
                "builtIn": true,
                "tl": 3
            },
            {
                "name": "Steel (TL 4)",
                "densityLbsCuIn": 0.281,
                "tensileStPsi": 145000,
                "elasticModulusPsi": 30450000,
                "a": 0.70,
                "builtIn": true,
                "tl": 4
            },
            {
                "name": "Steel (TL 5)",
                "densityLbsCuIn": 0.281,
                "tensileStPsi": 217500,
                "elasticModulusPsi": 30450000,
                "a": 0.70,
                "builtIn": true,
                "tl": 5
            },
            {
                "name": "Steel (TL 6)",
                "densityLbsCuIn": 0.281,
                "tensileStPsi": 319000,
                "elasticModulusPsi": 30450000,
                "a": 0.70,
                "builtIn": true,
                "tl": 6
            },
            {
                "name": "Steel (TL 7)",
                "densityLbsCuIn": 0.281,
                "tensileStPsi": 464000,
                "elasticModulusPsi": 30450000,
                "a": 0.70,
                "builtIn": true,
                "tl": 7
            },
            {
                "name": "Steel (TL 8)",
                "densityLbsCuIn": 0.281,
                "tensileStPsi": 507500,
                "elasticModulusPsi": 30450000,
                "a": 0.70,
                "builtIn": true,
                "tl": 8
            },
            {
                "name": "Titanium Ti-6Al-4V",
                "densityLbsCuIn": 0.159,
                "tensileStPsi": 128250,
                "elasticModulusPsi": 16675000,
                "a": 0.71,
                "builtIn": true,
                "tl": 7
            },
            {
                "name": "Wrought Iron (TL 2)",
                "densityLbsCuIn": 0.274,
                "tensileStPsi": 43500,
                "elasticModulusPsi": 28000000,
                "a": 0.72,
                "builtIn": true,
                "tl": 2
            },
            {
                "name": "Wrought Iron (TL 3)",
                "densityLbsCuIn": 0.274,
                "tensileStPsi": 72500,
                "elasticModulusPsi": 29000000,
                "a": 0.71,
                "builtIn": true,
                "tl": 3
            },
            {
                "name": "Wood - Apple",
                "densityLbsCuIn": 0.034,
                "tensileStPsi": 19250,
                "elasticModulusPsi": 1682000,
                "a": 0.95,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Horse apple",
                "densityLbsCuIn": 0.034,
                "tensileStPsi": 19250,
                "elasticModulusPsi": 1682000,
                "a": 0.95,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Hedge apple",
                "densityLbsCuIn": 0.034,
                "tensileStPsi": 19250,
                "elasticModulusPsi": 1682000,
                "a": 0.95,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Osage Orange",
                "densityLbsCuIn": 0.034,
                "tensileStPsi": 19250,
                "elasticModulusPsi": 1682000,
                "a": 0.95,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Ash",
                "densityLbsCuIn": 0.023,
                "tensileStPsi": 13000,
                "elasticModulusPsi": 1560000,
                "a": 0.87,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Birch",
                "densityLbsCuIn": 0.023,
                "tensileStPsi": 13000,
                "elasticModulusPsi": 1560000,
                "a": 0.87,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Elm",
                "densityLbsCuIn": 0.023,
                "tensileStPsi": 13000,
                "elasticModulusPsi": 1560000,
                "a": 0.87,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Aspen",
                "densityLbsCuIn": 0.014,
                "tensileStPsi": 8250,
                "elasticModulusPsi": 1260000,
                "a": 0.77,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Poplar",
                "densityLbsCuIn": 0.014,
                "tensileStPsi": 8250,
                "elasticModulusPsi": 1260000,
                "a": 0.77,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Bamboo",
                "densityLbsCuIn": 0.035,
                "tensileStPsi": 21750,
                "elasticModulusPsi": 2610000,
                "a": 0.84,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Cedar",
                "densityLbsCuIn": 0.012,
                "tensileStPsi": 7000,
                "elasticModulusPsi": 972000,
                "a": 0.81,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Ebony",
                "densityLbsCuIn": 0.031,
                "tensileStPsi": 9500,
                "elasticModulusPsi": 1624000,
                "a": 0.94,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Eucalyptus",
                "densityLbsCuIn": 0.029,
                "tensileStPsi": 16000,
                "elasticModulusPsi": 2320000,
                "a": 0.81,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Douglas Fir",
                "densityLbsCuIn": 0.016,
                "tensileStPsi": 9750,
                "elasticModulusPsi": 1525000,
                "a": 0.75,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Mountain Fir",
                "densityLbsCuIn": 0.016,
                "tensileStPsi": 9750,
                "elasticModulusPsi": 1525000,
                "a": 0.75,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Balsam Fir",
                "densityLbsCuIn": 0.016,
                "tensileStPsi": 9750,
                "elasticModulusPsi": 1525000,
                "a": 0.75,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Silver Fir",
                "densityLbsCuIn": 0.016,
                "tensileStPsi": 9750,
                "elasticModulusPsi": 1525000,
                "a": 0.75,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Hickory",
                "densityLbsCuIn": 0.032,
                "tensileStPsi": 19500,
                "elasticModulusPsi": 2100000,
                "a": 0.88,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Black Ironwood",
                "densityLbsCuIn": 0.043,
                "tensileStPsi": 25800,
                "elasticModulusPsi": 2990000,
                "a": 0.86,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Red Maple",
                "densityLbsCuIn": 0.022,
                "tensileStPsi": 14500,
                "elasticModulusPsi": 1740000,
                "a": 0.81,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Sugar Maple",
                "densityLbsCuIn": 0.022,
                "tensileStPsi": 14500,
                "elasticModulusPsi": 1740000,
                "a": 0.81,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Silver Maple",
                "densityLbsCuIn": 0.018,
                "tensileStPsi": 9000,
                "elasticModulusPsi": 1150000,
                "a": 0.89,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Mulberry",
                "densityLbsCuIn": 0.023,
                "tensileStPsi": 11000,
                "elasticModulusPsi": 1170000,
                "a": 0.95,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Oak",
                "densityLbsCuIn": 0.025,
                "tensileStPsi": 13775,
                "elasticModulusPsi": 1680000,
                "a": 0.87,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - White Pine",
                "densityLbsCuIn": 0.019,
                "tensileStPsi": 12250,
                "elasticModulusPsi": 1595000,
                "a": 0.79,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Red Pine",
                "densityLbsCuIn": 0.019,
                "tensileStPsi": 12250,
                "elasticModulusPsi": 1595000,
                "a": 0.79,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Longleaf Pine",
                "densityLbsCuIn": 0.019,
                "tensileStPsi": 12250,
                "elasticModulusPsi": 1595000,
                "a": 0.79,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Black Cherry",
                "densityLbsCuIn": 0.019,
                "tensileStPsi": 12250,
                "elasticModulusPsi": 1595000,
                "a": 0.79,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Spruce",
                "densityLbsCuIn": 0.016,
                "tensileStPsi": 10500,
                "elasticModulusPsi": 1443000,
                "a": 0.76,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Redwood",
                "densityLbsCuIn": 0.016,
                "tensileStPsi": 10500,
                "elasticModulusPsi": 1443000,
                "a": 0.76,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Black Walnut",
                "densityLbsCuIn": 0.020,
                "tensileStPsi": 14750,
                "elasticModulusPsi": 1682000,
                "a": 0.80,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - Black Willow",
                "densityLbsCuIn": 0.015,
                "tensileStPsi": 6200,
                "elasticModulusPsi": 725000,
                "a": 0.96,
                "builtIn": true,
                "tl": 0
            },
            {
                "name": "Wood - European Yew",
                "densityLbsCuIn": 0.024,
                "tensileStPsi": 15000,
                "elasticModulusPsi": 1320000,
                "a": 0.93,
                "builtIn": true,
                "tl": 0
            },
        ]

        return materials;
    }
}
