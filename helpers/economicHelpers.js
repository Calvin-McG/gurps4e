export class economicHelpers {

    static getWealthLevels(){
        return [
            {
                "Name": "Dead Broke",
                "name": "dead broke",
                "code": "deadbroke",
                "points": -25,
                "multiplier": 0
            },
            {
                "Name": "Poor",
                "name": "poor",
                "code": "poor",
                "points": -15,
                "multiplier": 1/5
            },
            {
                "Name": "Struggling",
                "name": "struggling",
                "code": "struggling",
                "points": -10,
                "multiplier": 1/2
            },
            {
                "Name": "Average",
                "name": "average",
                "code": "average",
                "points": 0,
                "multiplier": 1
            },
            {
                "Name": "Comfortable",
                "name": "comfortable",
                "code": "comfortable",
                "points": 10,
                "multiplier": 2
            },
            {
                "Name": "Wealthy",
                "name": "wealthy",
                "code": "wealthy",
                "points": 20,
                "multiplier": 5
            },
            {
                "Name": "Very Wealthy",
                "name": "very wealthy",
                "code": "verywealthy",
                "points": 30,
                "multiplier": 20
            },
            {
                "Name": "Filthy Rich",
                "name": "filthy rich",
                "code": "filthyrich",
                "points": 50,
                "multiplier": 100
            },
            {
                "Name": "Multimillionaire",
                "name": "multimillionaire",
                "code": "multimillionaire",
                "points": 75,
                "multiplier": 1000
            }
        ]
    }

    static getColByStatus(status){
        let col = 0;
        switch(status) {
            case -2:
                col = 100;
                break;
            case -1:
                col = 300;
                break;
            case 0:
                col = 600;
                break;
            case 1:
                col = 1200;
                break;
            case 2:
                col = 3000;
                break;
            case 3:
                col = 12000;
                break;
            case 4:
                col = 60000;
                break;
            case 5:
                col = 600000;
                break;
            case 6:
                col = 6000000;
                break;
            case 7:
                col = 60000000;
                break;
            case 8:
                col = 600000000;
                break;
            default:
                col = 600;
                break;
        }

        return col;
    }

    static getStartingCashByTL(tl) {
        let cash = 0;
        switch(tl) {
            case 0:
                cash = 250;
                break;
            case 1:
                cash = 500;
                break;
            case 2:
                cash = 750;
                break;
            case 3:
                cash = 1000;
                break;
            case 4:
                cash = 2000;
                break;
            case 5:
                cash = 5000;
                break;
            case 6:
                cash = 10000;
                break;
            case 7:
                cash = 15000;
                break;
            case 8:
                cash = 20000;
                break;
            case 9:
                cash = 30000;
                break;
            case 10:
                cash = 50000;
                break;
            case 11:
                cash = 75000;
                break;
            case 12:
                cash = 100000;
                break;
            default:
                cash = 1;
                break;
        }

        return cash;
    }

    static getMonthlyPayByTL(tl) {
        let cash = 0;
        switch(tl) {
            case 0:
                cash = 625;
                break;
            case 1:
                cash = 650;
                break;
            case 2:
                cash = 675;
                break;
            case 3:
                cash = 700;
                break;
            case 4:
                cash = 800;
                break;
            case 5:
                cash = 1100;
                break;
            case 6:
                cash = 1600;
                break;
            case 7:
                cash = 2100;
                break;
            case 8:
                cash = 2600;
                break;
            case 9:
                cash = 3600;
                break;
            case 10:
                cash = 5600;
                break;
            case 11:
                cash = 8100;
                break;
            case 12:
                cash = 10600;
                break;
            default:
                cash = 1;
                break;
        }

        return cash;
    }
}
