export class economicHelpers {

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
}
