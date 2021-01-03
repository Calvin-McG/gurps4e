export const CM = 'centimetre';
export const FT = 'foot';
export const IN = 'inch';
export const KM = 'kilometre';
export const M = 'metre';
export const MI = 'mile';
export const YD = 'yard';
export const LI = 'link';
export const RD = 'rod';
export const CH = 'chain';
export const FUR = 'furlong';
export const LEA = 'league';
export const SP = 'span';
export const FTM = 'fathom';
export const SH = 'shackle';
export const CB = 'cable';
export const NM = 'nautical mile';
export const PC = 'pace';
export const ST = 'step';
export const GD = 'grade';
export const RP = 'rope';

export function isMetric(unit) {
    return [CM, KM, M].findIndex((metricUnit) => unit === metricUnit) > -1;
}
