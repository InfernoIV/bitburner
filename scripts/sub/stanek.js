//Requires SF 13
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stanek.md


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


export function create_object(){
    return new stanek_obj
}


// Declaration
class stanek_obj {
    constructor() {
        this.available = true
    }

    
    init(ns) {
        
    }

    
    manage(ns) {

    }
}


/*

Stanek		Stanek's Gift API.


acceptGift()											Accept Stanek's Gift by joining the Church of the Machine God
activeFragments()										List of fragments in Stanek's Gift.
canPlaceFragment(rootX, rootY, rotation, fragmentId)	Check if fragment can be placed at specified location.
chargeFragment(rootX, rootY)							Charge a fragment, increasing its power.
clearGift()												Clear the board of all fragments.
fragmentDefinitions()									List possible fragments.
getFragment(rootX, rootY)								Get placed fragment at location.
giftHeight()											Stanek's Gift height.
giftWidth()												Stanek's Gift width.
placeFragment(rootX, rootY, rotation, fragmentId)		Place fragment on Stanek's Gift.
removeFragment(rootX, rootY)							Remove fragment at location.

*/