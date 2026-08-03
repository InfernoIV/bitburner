import * as CONSTANTS from "scripts/constants.js"
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
    ram_manager.init(ns, CONSTANTS.RAM.MAIN)
    //log
    log.info(ns, "Main", "Starting main loop", true)

    // @ignore-infinite
    while (true) {
        //import functionality
        await ram_manager.import(ns)
        //let the manager manage all functionality
        await ram_manager.manage(ns)
        //wait a bit (what is the lowest time we can pick?)
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //disable generic logging
    ns.disableLog("disableLog")
    ns.disableLog("sleep")
    ns.disableLog("killall")
    //ns.disableLog("ALL")

    //open tail
    /*const [x, y] = ns.ui.windowSize()
    const width = x / 2
    const height = y / 3
    ns.ui.openTail()
    ns.ui.resizeTail(width, height)
    ns.ui.moveTail(x - width - 5, y - height - 5)*/
    //callback
    ns.atExit(() => {
        //log exit
        log.info(ns, "Main", "Exiting script")
        //ns.ui.closeTail()
    })
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


