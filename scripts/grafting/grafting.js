//config
import { DISABLE_LOGGING } from "./config.js"


//constants
//import { DISABLE_LOGGING } from "scripts/constants.js"


//functions
import * as log from "scripts/util/log.js"


// Declaration
export class grafting_obj {
    constructor() {}

    
    init(ns) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
    }

    
    manage(ns) {

    }
}
