import * as CONSTANTS from "scripts/constants.js"
import * as log from CONSTANTS.SCRIPT.LIBRARY.LOG
import * as evaluate from CONSTANTS.SCRIPT.LIBRARY.EVALUATE
import { root_obj } from CONSTANTS.SCRIPT.SUB.ROOT
import { hack_obj } from CONSTANTS.SCRIPT.SUB.HACK
import { darkweb_obj } from CONSTANTS.SCRIPT.SUB.DARKNET
import { share_exec } from CONSTANTS.SCRIPT.SUB.SHARE


/** @param {NS} ns */
export async function main(ns) {
    //initialize
    await init(ns)

    //do root
    var root = new root_obj()
    //init
    await root.init(ns)

    //hack
    var hack = new hack_obj()
    //darknet
    var darknet = new darkweb_obj()

    //start share
    //TODO
    //share_exec(ns)

    // @ignore-infinite
    while (true) {
        //start darknet main loop on darkweb
        await darknet.deploy(ns)

        //check and add cloud servers
        //TODO
        //await cloud.manage_servers(ns)
        
        //root servers
        await root.root_servers(ns)

        //create overview of servers
        //var ram_servers = cloud.get_servers()
        //hack servers
        await hack.hack_server(ns, root)

        //update ui
        //await ui.update(ns)

        //wait a bit (what is the lowest time we can pick?)
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //static ram
   // ns.ramOverride(4)

    //disable generic logging
    //ns.disableLog("disableLog")
    //ns.disableLog("ALL")

    //open tail
    const [x, y] = ns.ui.windowSize()
    const width = x / 2
    const height = y / 3
    ns.ui.openTail()
    ns.ui.resizeTail(width, height)
    ns.ui.moveTail(x - width - 5, y - height - 5)

    //callback
    ns.atExit(() => {
        //log exit
        log.info(ns, "Main", "Exiting script")
        ns.ui.closeTail()
    })

    //init logging, set to true if log to file is desired
    log.init(ns, false)

    //kill all other scripts 
    ns.killall(CONSTANTS.SERVER.HOME, true)

    //init eval
    evaluate.init(ns, CONSTANTS.SERVER.HOME, CONSTANTS.RAM.MAIN_EVAL)

    //wait a little bit
    await ns.sleep(CONSTANTS.TIME.WAIT)


    //signal start of program
    log.success(ns, "Main", "Init complete!")
}