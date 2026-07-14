import * as log from 'scripts/sub/log.js'
import * as evaluate from 'scripts/sub/evaluate.js'
//import * as root from 'scripts/sub/root.js'
import {root_obj} from 'scripts/sub/root.js'
import {hack_obj} from 'scripts/sub/hack.js'
//import * as hack from 'scripts/sub/hack.js'
import * as darknet from 'scripts/sub/darkweb.js'
//import * as cloud from 'scripts/sub/cloud.js'
//import * as share from 'scripts/sub/share.js'
//import * as ui from 'scripts/sub/share.js'


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
    //init
    await hack.init(ns)

    // @ignore-infinite
    while (true) {
        //start darknet main loop on darkweb
        //await darknet.init(ns)

        //check and add cloud servers
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
        await ns.sleep(10)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //static ram
    ns.ramOverride(4)


    //disable generic logging
    //ns.disableLog("disableLog")
    ns.disableLog("ALL")

    //open tail
    const [x, y] = ns.ui.windowSize()
    const width = x / 2
    const height = y / 3
    ns.ui.openTail()
    ns.ui.resizeTail(width, height)
    ns.ui.moveTail(x-width-5,y-height-5)

    //callback
    ns.atExit(() => {
        //log exit
        log.info(ns, "Main", "Exiting script")
        ns.ui.closeTail()
    })

    //init logging, set to true if log to file is desired
    log.init(ns, false)

    //kill all scripts
    ns.killall("home", true)

    //init eval
    evaluate.init(ns)

    //wait a little bit
    await ns.sleep(100)

    //share (leftover) ram with factions
    //await share.exec(ns)

    //signal start of program
    log.success(ns, "Main", "Init complete!")
}