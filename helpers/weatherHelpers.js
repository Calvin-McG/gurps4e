export class weatherHelpers {

    static returnBeaufortScale() {
        return [
            {
                "degree": 0,
                "category": 0,
                "f": -1,
                "description": "Calm",
                "windMphL": 0,
                "windMphH": 0,
                "avgWaveHeightFtL": 0,
                "avgWaveHeightFtH": 0,
                "sea": "Sea like a mirror",
                "land": "Smoke rises vertically"
            },
            {
                "degree": 1,
                "category": 0,
                "f": -1,
                "description": "Light Air",
                "windMphL": 1,
                "windMphH": 3,
                "avgWaveHeightFtL": 0,
                "avgWaveHeightFtH": 0,
                "sea": "Ripples with appearance of scales are formed, without foam crests",
                "land": "Direction shown by smoke drift but not by wind vanes"
            },
            {
                "degree": 2,
                "category": 0,
                "f": -1,
                "description": "Light Breeze",
                "windMphL": 4,
                "windMphH": 7,
                "avgWaveHeightFtL": 0,
                "avgWaveHeightFtH": 1,
                "sea": "Small wavelets still short but more pronounced; crests have a glassy appearance but do not break",
                "land": "Wind felt on face; leaves rustle; wind vane moved by wind"
            },
            {
                "degree": 3,
                "category": 0,
                "f": -1,
                "description": "Gentle Breeze",
                "windMphL": 8,
                "windMphH": 12,
                "avgWaveHeightFtL": 1,
                "avgWaveHeightFtH": 2,
                "sea": "Large wavelets; crests begin to break; foam of glassy appearance; perhaps scattered white horses",
                "land": "Leaves and small twigs in constant motion; light flags extended"
            },
            {
                "degree": 4,
                "category": 0,
                "f": -1,
                "description": "Moderate Breeze",
                "windMphL": 13,
                "windMphH": 18,
                "avgWaveHeightFtL": 2,
                "avgWaveHeightFtH": 4,
                "sea": "Small waves becoming longer; fairly frequent white horses",
                "land": "Raises dust and loose paper; small branches moved"
            },
            {
                "degree": 5,
                "category": 0,
                "f": -1,
                "description": "Fresh Breeze",
                "windMphL": 19,
                "windMphH": 24,
                "avgWaveHeightFtL": 4,
                "avgWaveHeightFtH": 8,
                "sea": "Moderate waves taking a more pronounced long form; many white horses are formed; chance of some spray",
                "land": "Small trees in leaf begin to sway; crested wavelets form on inland waters"
            },
            {
                "degree": 6,
                "category": 0,
                "f": -1,
                "description": "Strong Breeze",
                "windMphL": 25,
                "windMphH": 31,
                "avgWaveHeightFtL": 8,
                "avgWaveHeightFtH": 13,
                "sea": "Large waves begin to form; the white foam crests are more extensive everywhere; probably some spray",
                "land": "Large branches in motion; whistling heard in telegraph wires; umbrellas used with difficulty"
            },
            {
                "degree": 7,
                "category": 0,
                "f": -1,
                "description": "Near Gale",
                "windMphL": 32,
                "windMphH": 38,
                "avgWaveHeightFtL": 13,
                "avgWaveHeightFtH": 20,
                "sea": "Sea heaps up and white foam from breaking waves begins to be blown in streaks along the direction of the wind; spindrift begins to be seen",
                "land": "Whole trees in motion; inconvenience felt when walking against the wind"
            },
            {
                "degree": 8,
                "category": 0,
                "f": 0,
                "description": "Gale or F0 Tornado",
                "windMphL": 39,
                "windMphH": 46,
                "avgWaveHeightFtL": 13,
                "avgWaveHeightFtH": 20,
                "sea": "Moderately high waves of greater length; edges of crests break into spindrift; foam is blown in well-marked streaks along the direction of the wind",
                "land": "Twigs break off trees; generally impedes progress"
            },
            {
                "degree": 9,
                "category": 0,
                "f": 0,
                "description": "Severe Gale or F0 Tornado",
                "windMphL": 47,
                "windMphH": 54,
                "avgWaveHeightFtL": 13,
                "avgWaveHeightFtH": 20,
                "sea": "High waves; dense streaks of foam along the direction of the wind; sea begins to roll; spray affects visibility",
                "land": "Slight structural damage (chimney pots and slates removed)"
            },
            {
                "degree": 10,
                "category": 0,
                "f": 0,
                "description": "Storm or F0 Tornado",
                "windMphL": 55,
                "windMphH": 63,
                "avgWaveHeightFtL": 20,
                "avgWaveHeightFtH": 30,
                "sea": "Very high waves with long overhanging crests; resulting foam in great patches is blown in dense white streaks along the direction of the wind; on the whole the surface of the sea takes on a white appearance; rolling of the sea becomes heavy; visibility affected",
                "land": "Seldom experienced inland; trees uprooted; considerable structural damage"
            },
            {
                "degree": 11,
                "category": 0,
                "f": 0,
                "description": "Violent Storm or F0 Tornado",
                "windMphL": 64,
                "windMphH": 72,
                "avgWaveHeightFtL": 30,
                "avgWaveHeightFtH": 45,
                "sea": "Exceptionally high waves; small- and medium-sized ships might be for a long time lost to view behind the waves; sea is covered with long white patches of foam; everywhere the edges of the wave crests are blown into foam; visibility affected",
                "land": "Very rarely experienced; accompanied by widespread damage"
            },
            {
                "degree": 12,
                "category": 1,
                "f": 1,
                "description": "Category 1 Hurricane or F1 Tornado",
                "windMphL": 73,
                "windMphH": 95,
                "avgWaveHeightFtL": 45,
                "avgWaveHeightFtH": 45,
                "sea": "The air is filled with foam and spray. Sea completely white with driving spray; visibility very seriously affected.",
                "land": "Very dangerous winds will produce some damage: Well-constructed frame homes could have damage to roof, shingles, vinyl siding and gutters. Large branches of trees will snap and shallowly rooted trees may be toppled. Extensive damage to power lines and poles likely will result in power outages that could last a few to several days."
            },
            {
                "degree": 13,
                "category": 2,
                "f": 1,
                "description": "Category 2 Hurricane or F1 Tornado",
                "windMphL": 96,
                "windMphH": 110,
                "avgWaveHeightFtL": 45,
                "avgWaveHeightFtH": 45,
                "sea": "The air is filled with foam and spray. Sea completely white with driving spray; visibility very seriously affected.",
                "land": "Extremely dangerous winds will cause extensive damage: Well-constructed frame homes could sustain major roof and siding damage. Many shallowly rooted trees will be snapped or uprooted and block numerous roads. Near-total power loss is expected with outages that could last from several days to weeks."
            },
            {
                "degree": 14,
                "category": 3,
                "f": 2,
                "description": "Category 3 Hurricane or F2 Tornado",
                "windMphL": 111,
                "windMphH": 129,
                "avgWaveHeightFtL": 45,
                "avgWaveHeightFtH": 45,
                "sea": "The air is filled with foam and spray. Sea completely white with driving spray; visibility very seriously affected.",
                "land": "Devastating damage will occur: Well-built framed homes may incur major damage or removal of roof decking and gable ends. Many trees will be snapped or uprooted, blocking numerous roads. Electricity and water will be unavailable for several days to weeks after the storm passes."
            },
            {
                "degree": 15,
                "category": 4,
                "f": 3,
                "description": "Category 4 Hurricane or F3 Tornado",
                "windMphL": 130,
                "windMphH": 156,
                "avgWaveHeightFtL": 45,
                "avgWaveHeightFtH": 45,
                "sea": "The air is filled with foam and spray. Sea completely white with driving spray; visibility very seriously affected.",
                "land": "Catastrophic damage will occur: Well-built framed homes can sustain severe damage with loss of most of the roof structure and/or some exterior walls. Most trees will be snapped or uprooted and power poles downed. Fallen trees and power poles will isolate residential areas. Power outages will last weeks to possibly months. Most of the area will be uninhabitable for weeks or months."
            },
            {
                "degree": 16,
                "category": 5,
                "f": 4,
                "description": "Category 5 Hurricane or F4 Tornado",
                "windMphL": 157,
                "windMphH": 194,
                "avgWaveHeightFtL": 45,
                "avgWaveHeightFtH": 45,
                "sea": "The air is filled with foam and spray. Sea completely white with driving spray; visibility very seriously affected.",
                "land": "Catastrophic damage will occur: A high percentage of framed homes will be destroyed, with total roof failure and wall collapse. Fallen trees and power poles will isolate residential areas. Power outages will last for weeks to possibly months. Most of the area will be uninhabitable for weeks or months."
            },
            {
                "degree": 17,
                "category": 6,
                "f": 5,
                "description": "Category 6 Hurricane or F5 Tornado",
                "windMphL": 195,
                "windMphH": 229,
                "avgWaveHeightFtL": 45,
                "avgWaveHeightFtH": 45,
                "sea": "The air is filled with foam and spray. Sea completely white with driving spray; visibility very seriously affected.",
                "land": "Catastrophic damage will occur: A high percentage of framed homes will be destroyed, with total roof failure and wall collapse. Fallen trees and power poles will isolate residential areas. Power outages will last for weeks to possibly months. Most of the area will be uninhabitable for weeks or months."
            },
            {
                "degree": 18,
                "category": 7,
                "f": 6,
                "description": "Category 7 Hurricane or F6 Tornado",
                "windMphL": 230,
                "windMphH": 253,
                "avgWaveHeightFtL": 45,
                "avgWaveHeightFtH": 45,
                "sea": "The air is filled with foam and spray. Sea completely white with driving spray; visibility very seriously affected.",
                "land": "Catastrophic damage will occur: A high percentage of framed homes will be destroyed, with total roof failure and wall collapse. Fallen trees and power poles will isolate residential areas. Power outages will last for weeks to possibly months. Most of the area will be uninhabitable for weeks or months."
            }
        ]
    }

    static returnWeatherTypes() {
        return [
            {
                "type": "rain",
                "name": "Rain",
                "light": 500,
                "medium": 1000,
                "heavy": 2000
            }
        ]
    }

}
