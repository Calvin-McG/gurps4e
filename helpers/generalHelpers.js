export class generalHelpers {
    static has(obj, key){ // obj is the Object you're checking, key is the nested key you're looking for.
        return key.split(".").every(function(x) {
            if(typeof obj != "object" || obj === null || ! x in obj)
                return false;
            obj = obj[x];
            return true;
        });
    }
}
