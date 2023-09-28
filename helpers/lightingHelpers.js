export class lightingHelpers {

    // This method returns an array, where the index of the array is the absolute value of the lighting penalty. (Yes, I know, that's very clever)
    static returnLightingTable() {
        let lightingTableType = game.settings.get("gurps4e", "lightingTableType");

        if (lightingTableType === "pes") {
            return [
                    {
                        "penalty": 0,
                        "artificial": "Surgical suite",
                        "natural": "Direct sunlight",
                        "lux": 100000
                    },
                    {
                        "penalty": -1,
                        "artificial": "TV studio",
                        "natural": "Full daylight",
                        "lux": 10000
                    },
                    {
                        "penalty": -2,
                        "artificial": "Office",
                        "natural": "Overcast",
                        "lux": 1000
                    },
                    {
                        "penalty": -3,
                        "artificial": "Living room",
                        "natural": " - ",
                        "lux": 100
                    },
                    {
                        "penalty": -4,
                        "artificial": "Street lighting, torchlight",
                        "natural": "Twilight",
                        "lux": 10
                    },
                    {
                        "penalty": -5,
                        "artificial": "Candlelight",
                        "natural": "Moonlight",
                        "lux": 1
                    },
                    {
                        "penalty": -6,
                        "artificial": "Indicator LED",
                        "natural": "Quarter moon",
                        "lux": 0.1
                    },
                    {
                        "penalty": -7,
                        "artificial": " - ",
                        "natural": "Crescent moon",
                        "lux": 0.01
                    },
                    {
                        "penalty": -8,
                        "artificial": " - ",
                        "natural": "Starlight",
                        "lux": 0.001
                    },
                    {
                        "penalty": -9,
                        "artificial": " - ",
                        "natural": "Overcast night",
                        "lux": 0.0001
                    },
                    {
                        "penalty": -10,
                        "artificial": "Total Darkness",
                        "natural": "Total Darkness",
                        "lux": 0
                    }
                ]
        }
        // This else block handles the output for the illumination levels errata. If anything fails, just pass the errata values.
        else {
            return [
                {
                    "penalty": 0,
                    "artificial": "120W bulb or a high quality flashlight",
                    "natural": "Very overcast day",
                    "lux": 100
                },
                {
                    "penalty": -1,
                    "artificial": "Street lights (Main road), or a torch, or standard flashlight",
                    "natural": "Sunrise or sunset",
                    "lux": 20
                },
                {
                    "penalty": -2,
                    "artificial": "Street lights (Side road), gaslight, or a cell phone screen",
                    "natural": "Civil twilight",
                    "lux": 5
                },
                {
                    "penalty": -3,
                    "artificial": "Candlelight",
                    "natural": "Civil twilight under heavy clouds, or nautical twilight",
                    "lux": 1
                },
                {
                    "penalty": -4,
                    "artificial": " - ",
                    "natural": "Full Moon, or nautical twilight under heavy clouds",
                    "lux": 0.2
                },
                {
                    "penalty": -5,
                    "artificial": "Indicator LED",
                    "natural": "Half moon, or full moon under heavy clouds",
                    "lux": 0.05
                },
                {
                    "penalty": -6,
                    "artificial": " - ",
                    "natural": "Quarter moon, or half moon under heavy clouds",
                    "lux": 0.01
                },
                {
                    "penalty": -7,
                    "artificial": " - ",
                    "natural": "Starlight, or quarter moon under heavy clouds",
                    "lux": 0.002
                },
                {
                    "penalty": -8,
                    "artificial": " - ",
                    "natural": "Starlight through clouds",
                    "lux": 0.0005
                },
                {
                    "penalty": -9,
                    "artificial": " - ",
                    "natural": "Overcast moonless night",
                    "lux": 0.0001
                },
                {
                    "penalty": -10,
                    "artificial": "Total Darkness",
                    "natural": "Total Darkness",
                    "lux": 0
                }
            ]
        }
    }

}
