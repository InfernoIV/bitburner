import * as CONSTANTS from "constants.js"
import * as CONFIG from "config.js"

import * as log from "scripts/sub/log.js"


//ram manager
import {
    ram_obj
} from "scripts/ram.js"


/** @param {NS} ns */
export async function main(ns) {
    //initialize main
    await init(ns)
    //init ram manager
    var ram_manager = new ram_obj()
    //init ram manager
    await ram_manager.init(ns, CONSTANTS.RAM.MAIN)
    //log
    log.info(ns, "Main", "Starting main loop", true)

    // @ignore-infinite
    while (true) {
        //import functionality
        await ram_manager.import(ns)
        //let the manager manage all functionality
        await ram_manager.manage_functionalities(ns)
        //wait a bit (what is the lowest time we can pick?)
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //disable logging
    log.disable(CONFIG.DISABLE_LOGGING)
}


/*
base                1.6
ns.killall          
ns.ui.openTail      0
ns.ui.resizeTail    0
ns.ui.moveTail      0
ns.disableLog       0
ns.ui.windowSize    0
ns.atExit           0
*/


