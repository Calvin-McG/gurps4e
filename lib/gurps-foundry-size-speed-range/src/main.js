import { getRulerSegmentLabel } from './ruler.js';

Hooks.on('ready', () => {
    Ruler.prototype._getSegmentLabel = getRulerSegmentLabel;
});
