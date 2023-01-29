import { getRulerSegmentLabel } from './ruler.js';
import { isMessageSRLookup, isMessageSMLookup, ssrtLookup } from './ssrt-lookup.js';

Hooks.on('chatMessage', (log, content, data) => {
    if (isMessageSRLookup(content) || isMessageSMLookup(content)) {
        ChatMessage.create({ content: ssrtLookup(content), user: game.user.id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
        return false;
    }
});

Hooks.on('ready', () => {
    Ruler.prototype._getSegmentLabel = getRulerSegmentLabel;
});
