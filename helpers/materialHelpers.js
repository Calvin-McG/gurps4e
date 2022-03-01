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
                "wm": 0,
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
                "costLTTL": 4,
                "name": "No Armor",
                "wm": 0,
                "costLT": 0,
                "costHT": 0,
                "drPerIn": 0,
                "maxDR": 0,
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
                "costLTTL": 4,
                "name": "Bone",
                "wm": 1,
                "costLT": 12.5000,
                "costHT": 12.5000,
                "drPerIn": 8,
                "maxDR": 4,
                "semiablative": true,
                "scales": true,
                "solid": true
            },
            {
                "tl": 0,
                "costLTTL": 4,
                "name": "Cloth",
                "wm": 0.8500,
                "costLT": 8,
                "costHT": 8,
                "drPerIn": 4,
                "maxDR": 4,
                "combustible": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 0,
                "costLTTL": 4,
                "name": "Horn",
                "wm": 1,
                "costLT": 12.5000,
                "costHT": 12.5000,
                "drPerIn": 8,
                "maxDR": 4,
                "scales": true,
                "solid": true
            },
            {
                "tl": 0,
                "costLTTL": 4,
                "name": "Leather",
                "wm": 0.9000,
                "costLT": 10,
                "costHT": 10,
                "drPerIn": 8,
                "maxDR": 4,
                "combustible": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true,
                "scales": true
            },
            {
                "tl": 0,
                "costLTTL": 4,
                "name": "Wood",
                "wm": 1.4000,
                "costLT": 3,
                "costHT": 3,
                "drPerIn": 1.5000,
                "maxDR": 2,
                "combustible": true,
                "semiablative": true,
                "scales": true,
                "solid": true
            },
            {
                "tl": 1,
                "costLTTL": 4,
                "name": "Low Quality Bronze",
                "wm": 0.9000,
                "costLT": 60,
                "costHT": 12,
                "drPerIn": 48,
                "maxDR": 9,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 1,
                "costLTTL": 4,
                "name": "High Quality Bronze",
                "wm": 0.6000,
                "costLT": 100,
                "costHT": 20,
                "drPerIn": 68,
                "maxDR": 14,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 1,
                "costLTTL": 4,
                "name": "Copper",
                "wm": 1.6000,
                "costLT": 80,
                "costHT": 80,
                "drPerIn": 30,
                "maxDR": 5,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 1,
                "costLTTL": 4,
                "name": "Early Soda Glass",
                "wm": 2,
                "costLT": 2.1,
                "costHT": 2.1,
                "drPerIn": 5,
                "maxDR": 1,
                "ablative": true,
                "scales": true,
                "solid": true,
                "transparent": true,
            },
            {
                "tl": 1,
                "costLTTL": 4,
                "name": "Stone",
                "wm": 1.2000,
                "costLT": 12.5000,
                "costHT": 12.5000,
                "drPerIn": 13,
                "maxDR": 5,
                "scales": true,
                "solid": true
            },
            {
                "tl": 1,
                "costLTTL": 4,
                "name": "Jade",
                "wm": 1.2000,
                "costLT": 62.5000,
                "costHT": 62.5000,
                "drPerIn": 13,
                "maxDR": 5,
                "scales": true,
                "solid": true
            },
            {
                "tl": 1,
                "costLTTL": 4,
                "name": "Gem-Quality Jade",
                "wm": 1.2000,
                "costLT": 125,
                "costHT": 125,
                "drPerIn": 13,
                "maxDR": 5,
                "scales": true,
                "solid": true
            },
            {
                "tl": 2,
                "costLTTL": 4,
                "name": "Late Soda Glass",
                "wm": 2,
                "costLT": 2.1,
                "costHT": 2.1,
                "drPerIn": 6,
                "maxDR": (4/3),
                "ablative": true,
                "scales": true,
                "solid": true,
                "transparent": true,
            },
            {
                "tl": 2,
                "costLTTL": 4,
                "name": "Low Quality Iron",
                "wm": 0.8000,
                "costLT": 15,
                "costHT": 3,
                "drPerIn": 52,
                "maxDR": 10,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 2,
                "costLTTL": 4,
                "name": "High Quality Iron",
                "wm": 0.6000,
                "costLT": 25,
                "costHT": 5,
                "drPerIn": 68,
                "maxDR": 14,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 2,
                "name": "Lead",
                "costLTTL": 4,
                "wm": 2,
                "costLT": 12.5000,
                "costHT": 2.5000,
                "drPerIn": 30,
                "maxDR": 4,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 3,
                "name": "Steel",
                "costLTTL": 4,
                "wm": 0.5800,
                "costLT": 50,
                "costHT": 10,
                "drPerIn": 70,
                "maxDR": 14,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 3,
                "name": "Forest Glass",
                "costLTTL": 4,
                "wm": 2,
                "costLT": 2.1,
                "costHT": 2.1,
                "drPerIn": 7,
                "maxDR": (5/3),
                "ablative": true,
                "scales": true,
                "solid": true,
                "transparent": true,
            },
            {
                "tl": 4,
                "name": "Early Hardened Steel",
                "costLTTL": 4,
                "wm": 0.5000,
                "costLT": 250,
                "costHT": 50,
                "drPerIn": 81,
                "maxDR": 16,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 3,
                "name": "Borosilicate Glass",
                "costLTTL": 4,
                "wm": 2,
                "costLT": 2.1,
                "costHT": 2.1,
                "drPerIn": 8,
                "maxDR": 2,
                "ablative": true,
                "scales": true,
                "solid": true,
                "transparent": true,
            },
            {
                "tl": 5,
                "name": "Titanium",
                "costLTTL": 6,
                "wm": 0.4,
                "costLT": 500,
                "costHT": 50,
                "drPerIn": 57,
                "maxDR": 12,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 6,
                "name": "High Strength Steel",
                "costLTTL": 4,
                "wm": 0.5800,
                "costLT": 15,
                "costHT": 3,
                "drPerIn": 70,
                "maxDR": 14,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 6,
                "name": "Hardened Steel",
                "costLTTL": 4,
                "wm": 0.5000,
                "costLT": 17.5000,
                "costHT": 3.5000,
                "drPerIn": 82,
                "maxDR": 16,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 6,
                "name": "Rubber",
                "costLTTL": 4,
                "wm": 0.4500,
                "costLT": 25,
                "costHT": 5,
                "drPerIn": 14,
                "maxDR": 7,
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
                "costLTTL": 5,
                "wm": 0.4500,
                "costLT": 75,
                "costHT": 15,
                "drPerIn": 31,
                "maxDR": 5,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 6,
                "name": "Synthetic Quartz",
                "costLTTL": 6,
                "wm": 0.2000,
                "costLT": 200,
                "costHT": 100,
                "drPerIn": 83,
                "maxDR": 35,
                "semiablative": true,
                "scales": true,
                "solid": true,
                "transparent": true
            },
            {
                "tl": 7,
                "name": "Elastic Polymer",
                "costLTTL": 7,
                "wm": 0.1600,
                "costLT": 100,
                "costHT": 50,
                "drPerIn": 16,
                "maxDR": 8,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 7,
                "name": "Nomex",
                "costLTTL": 7,
                "wm": 0.0660,
                "costLT": 50,
                "costHT": 25,
                "drPerIn": 10,
                "maxDR": 5,
                "laser4": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 7,
                "name": "Nylon",
                "costLTTL": 7,
                "wm": 0.5000,
                "costLT": 25,
                "costHT": 6,
                "drPerIn": 6,
                "maxDR": 3,
                "ballistic2": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 7,
                "name": "Basic Ceramic",
                "costLTTL": 7,
                "wm": 0.2000,
                "costLT": 25,
                "costHT": 12,
                "drPerIn": 83,
                "maxDR": 35,
                "semiablative": true,
                "scales": true,
                "solid": true,
            },
            {
                "tl": 7,
                "name": "Ballistic Resin",
                "costLTTL": 7,
                "wm": 0.5500,
                "costLT": 2.5,
                "costHT": 2.5,
                "drPerIn": 15,
                "maxDR": 6,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Fiberglass",
                "costLTTL": 7,
                "wm": 0.6000,
                "costLT": 8,
                "costHT": 4,
                "drPerIn": 17,
                "maxDR": 7,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "High-Strength Aluminum",
                "costLTTL": 8,
                "wm": 0.4000,
                "costLT": 12,
                "costHT": 6,
                "drPerIn": 35,
                "maxDR": 10,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Plastic",
                "costLTTL": 4,
                "wm": 0.7500,
                "costLT": 1.8,
                "costHT": 1.8,
                "drPerIn": 12,
                "maxDR": 3,
                "scales": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 7,
                "name": "Transparent Plastic",
                "costLTTL": 4,
                "wm": 0.7500,
                "costLT": 3.6,
                "costHT": 3.6,
                "drPerIn": 12,
                "maxDR": 3,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": true
            },
            {
                "tl": 7,
                "name": "Polycarbonate",
                "costLTTL": 8,
                "wm": 0.4500,
                "costLT": 10,
                "costHT": 5,
                "drPerIn": 10,
                "maxDR": 3,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 7,
                "name": "Transparent Polycarbonate",
                "costLTTL": 8,
                "wm": 0.4500,
                "costLT": 20,
                "costHT": 10,
                "drPerIn": 10,
                "maxDR": 3,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": true
            },
            {
                "tl": 7,
                "name": "Steel, Very Hard",
                "costLTTL": 7,
                "wm": 0.4500,
                "costLT": 20,
                "costHT": 20,
                "drPerIn": 90,
                "maxDR": 18,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Titanium Alloy",
                "costLTTL": 8,
                "wm": 0.3500,
                "costLT": 50,
                "costHT": 10,
                "drPerIn": 66,
                "maxDR": 20,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 7,
                "name": "Corundum",
                "costLTTL": 7,
                "wm": 0.1500,
                "costLT": 400,
                "costHT": 200,
                "drPerIn": 111,
                "maxDR": 44,
                "semiablative": true,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": true,
            },
            {
                "tl": 8,
                "name": "Ballistic Polymer",
                "costLTTL": 8,
                "wm": 0.0600,
                "costLT": 200,
                "costHT": 50,
                "drPerIn": 48,
                "maxDR": 24,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Improved Ballistic Polymer",
                "costLTTL": 8,
                "wm": 0.0400,
                "costLT": 250,
                "costHT": 100,
                "drPerIn": 75,
                "maxDR": 36,
                "ballistic25": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Kevlar",
                "costLTTL": 8,
                "wm": 0.1000,
                "costLT": 80,
                "costHT": 20,
                "drPerIn": 33,
                "maxDR": 16,
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
                "costLTTL": 8,
                "wm": 0.0800,
                "costLT": 120,
                "costHT": 40,
                "drPerIn": 40,
                "maxDR": 20,
                "ballistic3": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Improved Nomex",
                "costLTTL": 8,
                "wm": 0.0550,
                "costLT": 35,
                "costHT": 20,
                "drPerIn": 10,
                "maxDR": 5,
                "flexible": true,
                "laser4": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Aramid Fiber",
                "costLTTL": 8,
                "wm": 0.1600,
                "costLT": 80,
                "costHT": 40,
                "drPerIn": 48,
                "maxDR": 24,
                "ballistic4": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 8,
                "name": "Improved Ceramic",
                "costLTTL": 8,
                "wm": 0.1500,
                "costLT": 100,
                "costHT": 20,
                "drPerIn": 111,
                "maxDR": 44,
                "semiablative": true,
                "scales": true,
                "solid": true,
            },
            {
                "tl": 8,
                "name": "Laminated Polycarbonate",
                "costLTTL": 8,
                "wm": 0.2500,
                "costLT": 25,
                "costHT": 12,
                "drPerIn": 12,
                "maxDR": 5,
                "semiablative": true,
                "scales": true,
                "solid": true,
            },
            {
                "tl": 8,
                "name": "Transparent Laminated Polycarbonate",
                "costLTTL": 8,
                "wm": 0.2500,
                "costLT": 50,
                "costHT": 25,
                "drPerIn": 12,
                "maxDR": 5,
                "semiablative": true,
                "scales": true,
                "solid": true,
                "transparent": true
            },
            {
                "tl": 8,
                "name": "Polyurethane",
                "costLTTL": 7,
                "wm": 0.25,
                "costLT": 500,
                "costHT": 100,
                "drPerIn": 25,
                "maxDR": 5,
                "scales": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 8,
                "name": "Transparent Polyurethane",
                "costLTTL": 7,
                "wm": 0.25,
                "costLT": 1000,
                "costHT": 200,
                "drPerIn": 25,
                "maxDR": 5,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": true
            },
            {
                "tl": 8,
                "name": "Laminated Polyurethane",
                "costLTTL": 7,
                "wm": 0.18,
                "costLT": 1000,
                "costHT": 200,
                "drPerIn": 35,
                "maxDR": 7,
                "scales": true,
                "semiablative": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 8,
                "name": "Transparent Laminated Polyurethane",
                "costLTTL": 7,
                "wm": 0.18,
                "costLT": 2000,
                "costHT": 400,
                "drPerIn": 35,
                "maxDR": 7,
                "scales": true,
                "semiablative": true,
                "plate": true,
                "solid": true,
                "transparent": true
            },
            {
                "tl": 8,
                "name": "Polymer Composite",
                "costLTTL": 8,
                "wm": 0.2200,
                "costLT": 40,
                "costHT": 10,
                "drPerIn": 28,
                "maxDR": 11,
                "scales": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 8,
                "name": "Titanium Composite",
                "costLTTL": 8,
                "wm": 0.2000,
                "costLT": 250,
                "costHT": 25,
                "drPerIn": 104,
                "maxDR": 42,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 8,
                "name": "Ultra-Strength Steel",
                "costLTTL": 8,
                "wm": 0.3500,
                "costLT": 30,
                "costHT": 80,
                "drPerIn": 116,
                "maxDR": 23,
                "scales": true,
                "mail": true,
                "plate": true,
                "solid": true
            },
            {
                "tl": 9,
                "name": "Arachnoweave",
                "costLTTL": 9,
                "wm": 0.0300,
                "costLT": 600,
                "costHT": 120,
                "drPerIn": 96,
                "maxDR": 48,
                "ballistic4": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Basic Nanoweave",
                "costLTTL": 9,
                "wm": 0.0300,
                "costLT": 750,
                "costHT": 150,
                "drPerIn": 110,
                "maxDR": 55,
                "ballistic3": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Laser-Ablative Polymer",
                "costLTTL": 9,
                "wm": 0.0180,
                "costLT": 150,
                "costHT": 75,
                "drPerIn": 128,
                "maxDR": 64,
                "laser6": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Magnetic Liquid Armor",
                "costLTTL": 9,
                "wm": 0.0320,
                "costLT": 200,
                "costHT": 100,
                "drPerIn": 90,
                "maxDR": 45,
                "ballistic2": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "STF Liquid Armor",
                "costLTTL": 9,
                "wm": 0.0320,
                "costLT": 150,
                "costHT": 75,
                "drPerIn": 90,
                "maxDR": 45,
                "ballistic3": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Ceramic Nanocomposite",
                "costLTTL": 9,
                "wm": 0.1,
                "costLT": 300,
                "costHT": 75,
                "drPerIn": 166,
                "maxDR": 66,
                "scales": true,
                "solid": true,
            },
            {
                "tl": 9,
                "name": "Transparent Ceramic Nanocomposite",
                "costLTTL": 9,
                "wm": 0.1,
                "costLT": 600,
                "costHT": 50,
                "drPerIn": 166,
                "maxDR": 66,
                "transparent": true,
                "scales": true,
                "solid": true,
            },
            {
                "tl": 9,
                "name": "Polymer Nanocomposite",
                "costLTTL": 9,
                "wm": 0.1,
                "costLT": 400,
                "costHT": 100,
                "drPerIn": 83,
                "maxDR": 33,
                "scales": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 9,
                "name": "Titanium Nanocomposite",
                "costLTTL": 9,
                "wm": 0.1,
                "costLT": 250,
                "costHT": 60,
                "drPerIn": 174,
                "maxDR": 70,
                "scales": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 9,
                "name": "Reflec",
                "costLTTL": 9,
                "wm": 0.005,
                "costLT": 150,
                "costHT": 150,
                "drPerIn": 833,
                "maxDR": 83,
                "laser0": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 9,
                "name": "Bioplas",
                "costLTTL": 9,
                "wm": 0.015,
                "costLT": 600,
                "costHT": 300,
                "drPerIn": 278,
                "maxDR": 92,
                "ballistic3Bio": true, // Like ballistic3, except supported damage types are pi / burn, not pi / cut
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 10,
                "name": "Transparent Bioplas",
                "costLTTL": 10,
                "wm": 0.015,
                "costLT": 1200,
                "costHT": 600,
                "drPerIn": 278,
                "maxDR": 92,
                "ballistic3Bio": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true,
                "transparent": true, // TODO - At TL 9+, transparent materials can be transparent at will for +25% cost.
            },
            {
                "tl": 10,
                "name": "Nano-Ablative Polymer",
                "costLTTL": 10,
                "wm": 0.012,
                "costLT": 150,
                "costHT": 75,
                "drPerIn": 275,
                "maxDR": 128,
                "laser6": true, // Divide non laser DR by 6
                "flexible": true,
                "eAblative": true, // Energy attacks treat this as ablative
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 10,
                "name": "Advanced Nanoweave",
                "costLTTL": 10,
                "wm": 0.024,
                "costLT": 150,
                "costHT": 75,
                "drPerIn": 138,
                "maxDR": 70,
                "ballistic3": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 10,
                "name": "Advanced Nano-Laminate",
                "costLTTL": 10,
                "wm": 0.04,
                "costLT": 200,
                "costHT": 100,
                "drPerIn": 166,
                "maxDR": 66,
                "scales": true,
                "plate": true,
                "solid": true,
                "cLaminate": true, // If this armour has at least half the max DR, it's DR is doubled vs shaped charges and plasma bolts
            },
            {
                "tl": 10,
                "name": "Advanced Polymer Nanocomposite",
                "costLTTL": 10,
                "wm": 0.08,
                "costLT": 50,
                "costHT": 25,
                "drPerIn": 104,
                "maxDR": 42,
                "scales": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 10,
                "name": "Transparent Advanced Polymer Nanocomposite",
                "costLTTL": 10,
                "wm": 0.08,
                "costLT": 100,
                "costHT": 50,
                "drPerIn": 104,
                "maxDR": 42,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": true,
            },
            {
                "tl": 10,
                "name": "Electromagnetic Armour",
                "costLTTL": 10,
                "wm": 0.01,
                "costLT": 100,
                "costHT": 50,
                "drPerIn": 666,
                "maxDR": 264,
                "scales": true,
                "plate": true,
                "solid": true,
                "magnetic": true, // Magnetic armour only provides DR vs Shaped Charge and Plasma bolts
            },
            {
                "tl": 11,
                "name": "Monocrys",
                "costLTTL": 11,
                "wm": 0.018,
                "costLT": 150,
                "costHT": 75,
                "drPerIn": 184,
                "maxDR": 92,
                "ballistic3": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 11,
                "name": "Retro-Reflective Armour",
                "costLTTL": 11,
                "wm": 0.0025,
                "superScience": true,
                "costLT": 1500,
                "costHT": 1500,
                "drPerIn": 1666,
                "maxDR": 166,
                "laser0": true,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 11,
                "name": "Diamondoid",
                "costLTTL": 11,
                "wm": 0.06,
                "costLT": 50,
                "costHT": 25,
                "drPerIn": 232,
                "maxDR": 93,
                "scales": true,
                "plate": true,
                "solid": true,
            },
            {
                "tl": 11,
                "name": "Transparent Diamondoid",
                "costLTTL": 11,
                "wm": 0.06,
                "costLT": 100,
                "costHT": 50,
                "drPerIn": 232,
                "maxDR": 93,
                "scales": true,
                "plate": true,
                "solid": true,
                "transparent": true,
            },
            {
                "tl": 11,
                "name": "Diamondoid Laminate",
                "costLTTL": 11,
                "wm": 0.03,
                "costLT": 200,
                "costHT": 100,
                "drPerIn": 420,
                "maxDR": 168,
                "scales": true,
                "plate": true,
                "solid": true,
                "cLaminate": true, // If this armour has at least half the max DR, it's DR is doubled vs shaped charges and plasma bolts
            },
            {
                "tl": 12,
                "name": "Energy Cloth",
                "costLTTL": 12,
                "wm": 0.014,
                "costLT": 500,
                "costHT": 500,
                "drPerIn": 240,
                "maxDR": 120,
                "flexible": true,
                "fabric": true,
                "layeredFabric": true,
                "optimizedFabric": true
            },
            {
                "tl": 12,
                "name": "Hyperdense",
                "costLTTL": 12,
                "wm": 0.04,
                "costLT": 50,
                "costHT": 50,
                "drPerIn": 2083,
                "maxDR": 417,
                "scales": true,
                "plate": true,
                "solid": true,
                "cLaminate": true, // If this armour has at least half the max DR, it's DR is doubled vs shaped charges and plasma bolts
            },
            {
                "tl": 12,
                "name": "Hyperdense Laminate",
                "costLTTL": 12,
                "wm": 0.02,
                "costLT": 200,
                "costHT": 200,
                "drPerIn": 1040,
                "maxDR": 278,
                "scales": true,
                "plate": true,
                "solid": true,
                "cLaminate": true, // If this armour has at least half the max DR, it's DR is doubled vs shaped charges and plasma bolts
            },
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
