//This API requires Source-File 10 to use.
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.grafting.md

import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


export function create_object(){
    return new grafting_obj
}


// Declaration
class grafting_obj {
    constructor() {
        this.available = true
    }

    
    init(ns) {
        
    }
}

/*
getAugmentationGraftPrice(augName)  Retrieve the grafting cost of an aug.
getAugmentationGraftTime(augName)   Retrieves the time required to graft an aug. Do not use this value to determine when the ongoing grafting finishes. The ongoing grafting is affected by current intelligence level and focus bonus. You should use waitForOngoingGrafting for that purpose.
getGraftableAugmentations()         Retrieves a list of augmentations that can be grafted.
graftAugmentation(augName, focus)   Begins grafting the named aug. You must be in New Tokyo to use this. When you call this API, the current work (grafting or other actions) will be canceled.
waitForOngoingGrafting()            Wait until the ongoing grafting finishes or is canceled.
*/