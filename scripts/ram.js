

import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


// Declaration
export class ram_obj {
    constructor() {
        object_registered = {}
        source_files_owned = new Map()
        ram_used = 0
    }


    init(ns) {
        //ns.disableLog("")
    }   

    async manage(ns) {
        //for each functionality
        for (const functionality of this.object_registered) {
            //manage
            await functionality.manage(ns, this.object_registered)
        }
    }
    
    //function that registers a class to init and manage (assumes the object has both functions!)
    async register(ns, functionality_name, functionality_object, ram_cost) {
        //get ram left
        const ram_max = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
        //check if we can register
        if ((ram_used + ram_cost) > ram_max) {
            //not enough ram, stop
            return false
        } 
        //update ram
        this.ram_used += ram_cost
        //set to 2 decimals (round up)
        this.ram_used = Math.ceil(this.ram_used * 100) / 100
        //apply ram
        ns.ramOverride(this.ram_in_use)
        //register object
        object_registered[functionality_name] = functionality_object
        //init object
        await object_registered[functionality_name].init(ns, programs)
        //return success
        return true
    }
}