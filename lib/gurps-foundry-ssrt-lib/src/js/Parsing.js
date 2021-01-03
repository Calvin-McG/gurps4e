import * as Units from './UnitsOfMeasure/Units.js';

export default function parseExpression(expression) {
    const match = expression.substr(expression.indexOf(" ") + 1);
    const distance = expression.substr(0, expression.indexOf(" "));

    if (match === null || match == undefined) {
        throw new Error("Can't match expression to length and unit of measure");
    }

    let unit = null;
    switch (match) {
        case undefined:
            unit = Units.YD;
            break;
        case 'mile':
        case 'mi':
            unit = Units.MI;
            break;
        case 'yard':
        case 'yd':
        case 'y':
            unit = Units.YD;
            break;
        case 'foot':
        case 'feet':
        case 'ft':
        case "'":
            unit = Units.FT;
            break;
        case 'inch':
        case 'in':
        case '"':
        case "''":
            unit = Units.IN;
            break;
        case 'cm':
        case 'centimetre':
        case 'centimeter':
            unit = Units.CM;
            break;
        case 'm':
        case 'metre':
        case 'meter':
            unit = Units.M;
            break;
        case 'km':
        case 'kilometre':
        case 'kilometer':
            unit = Units.KM;
            break;
        case 'link':
        case 'li':
            unit = Units.LI;
            break;
        case 'rod':
        case 'rd':
            unit = Units.RD;
            break;
        case 'chain':
        case 'ch':
            unit = Units.CH;
            break;
        case 'furlong':
        case 'fur':
            unit = Units.FUR;
            break;
        case 'league':
        case 'lea':
            unit = Units.LEA;
            break;
        case 'sp':
        case 'span':
            unit = Units.SP;
            break;
        case 'fathom':
        case 'ftm':
            unit = Units.FTM;
            break;
        case 'sh':
        case 'shackle':
            unit = Units.SH;
            break;
        case 'cable':
        case 'cb':
            unit = Units.CB;
            break;
        case 'nautical mile':
        case 'nm':
        case 'nmi':
            unit = Units.NM;
            break;
        case 'pc':
        case 'pace':
            unit = Units.PC;
            break;
        case 'st':
        case 'step':
            unit = Units.ST;
            break;
        case 'gd':
        case 'grade':
            unit = Units.GD;
            break;
        case 'rp':
        case 'rope':
            unit = Units.RP;
            break;
        default:
            throw new Error("Can't match expression to length and unit of measure");
    }

    return { linearMeasurement: distance, unit };
}
