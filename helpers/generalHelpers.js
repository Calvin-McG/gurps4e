export class generalHelpers {
    static has(obj, key){ // obj is the Object you're checking, key is the nested key you're looking for.
        return key.split(".").every(function(x) {
            if(typeof obj != "object" || obj === null || ! x in obj)
                return false;
            obj = obj[x];
            return true;
        });
    }

    static rofToBonus(rof){
        let bonus = 0;
        if      (rof >= 2 && rof <= 4)  { bonus = 0}
        else if (rof >= 5 && rof <= 8)  { bonus = 1}
        else if (rof >= 9 && rof <= 12)  { bonus = 2}
        else if (rof >= 13 && rof <= 16)  { bonus = 3}
        else if (rof >= 17 && rof <= 24)  { bonus = 4}
        else if (rof >= 25)  { // At this point the scaling is logarithmic
            bonus = Math.floor(1.4427 * Math.log(rof) + 0.3562);
        }
        else {
            bonus = 0; // Make sure it doesn't return undefined.
        }

        return bonus;
    }
}
