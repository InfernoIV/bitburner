import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"

import * as log from "scripts/util/log.js"



// Declaration
export class corporation_obj {
    constructor() {}


    init(ns, handles) {
        //disable logging
        log.disable(ns, CONFIG.DISABLE_LOGGING)
        //maximum amount of divisions
        this.max_divisions = CONSTANTS.DIVISIONS_MAX //TODO: check how this works outside of BN3
        //this.investment_round = 0
    }


    manage(ns, handles) {
        const state = ""
        switch (state) {
            case "START": 
                this.manage_start(ns)
                break

            case "PURCHASE":
                this.manage_purchase(ns) 
                break

            case "PRODUCTION":
                this.manage_production(ns)
                break

            case "EXPORT":
                this.manage_export(ns)
                break

            case "SALE":
                this.manage_sale(ns)
                break
            
            default:
        }
        //bribe factions
        this.bribe_factions(ns)
    }


    manage_start(ns) {
        //stub
    }


    manage_purchase(ns) {
        //stub
    }


    manage_production(ns) {
        //stub
    }


    manage_export(ns) {
        //stub
    }


    manage_sale(ns) {
        //stub
    }

    
    bribe_factions(ns) {
        //stub
    }
}

