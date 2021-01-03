
export class distanceHelpers {
    static convertToYards(dist, gridUnits) {
        let distance = 0;

        switch (gridUnits.toLowerCase()) {
            case undefined:
            case 'yard':
            case 'yrd':
            case 'yd':
            case 'y':
                distance = dist;
                break;
            case 'mile':
            case 'mi':
                distance = dist * 1760;
                break;
            case 'foot':
            case 'feet':
            case 'ft':
            case "'":
                distance = dist / 3;
                break;
            case 'inch':
            case 'in':
            case '"':
            case "''":
                distance = dist / 36;
                break;
            case 'cm':
            case 'centimeter':
            case 'centimetre':
                distance = dist / 91.44;
                break;
            case 'm':
            case 'metre':
            case 'meter':
                distance = dist / 0.9144;
                break;
            case 'km':
            case 'kilometre':
            case 'kilometer':
                distance = dist * 0.0009144;
                break;
            case 'link':
            case 'li':
                distance = dist * (33/50);
                break;
            case 'rod':
            case 'rd':
                distance = dist * (16.5/3);
                break;
            case 'chain':
            case 'ch':
                distance = dist * 11;
                break;
            case 'furlong':
            case 'fur':
                distance = dist * 110;
                break;
            case 'league':
            case 'lea':
                distance = dist * 1760 * 3;
                break;
            case 'sp':
            case 'span':
                distance = dist * 0.75;
                break;
            case 'fathom':
            case 'ftm':
                distance = dist * 2;
                break;
            case 'sh':
            case 'shackle':
                distance = dist * 2 * 15;
                break;
            case 'cable':
            case 'cb':
                distance = dist * 2 * 120;
                break;
            case 'nautical mile':
            case 'nm':
            case 'nmi':
                distance = dist * 1760 * 1.151;
                break;
            case 'pc':
            case 'pace':
                distance = dist * 3 * 2.5;
                break;
            case 'gd':
            case 'st':
            case 'grade':
            case 'step':
                distance = dist * 3 * 2.5 * 2;
                break;
            case 'rp':
            case 'rope':
                distance = dist * 3 * 2.5 * 2 * 4;
                break;
            default:
                throw new Error("Can't match expression to length and unit of measure");
        }

        return distance;
    }


}