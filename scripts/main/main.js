//config
import { DISABLE_LOGGING, TIME_WAIT } from "./config.js"


//constants
import { RAM } from "scripts/ram/constants.js"


//functions
import * as log from "scripts/util/log.js"


//ram manager
import {
    ram_obj
} from "scripts/ram/ram.js"


/** @param {NS} ns */
export async function main(ns) {
    //initialize main
    await init(ns)
    //init ram manager
    let ram_manager = new ram_obj()
    //init ram manager
    await ram_manager.init(ns, RAM.MAIN)
    //log
    log.info(ns, "Main", "Starting main loop", true)
    // @ignore-infinite
    while (true) {
        //import functionality
        await ram_manager.import(ns)
        //let the manager manage all functionality
        await ram_manager.manage_functionalities(ns)
        //wait a bit (what is the lowest time we can pick?)
        await ns.sleep(TIME_WAIT)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //disable logging
    log.disable(ns, DISABLE_LOGGING)
}

