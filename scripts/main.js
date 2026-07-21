import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


//object imports
import { root_obj } from "scripts/sub/root.js"
import { hack_obj } from "scripts/sub/hack.js"
import { darknet_obj } from "scripts/sub/darknet.js"
import { cloud_obj } from "scripts/sub/cloud.js"
import { go_obj } from "scripts/sub/go.js"
import { coding_contract_obj } from "scripts/sub/coding_contract.js"
import { stock_obj } from "scripts/sub/stock.js"
import { ui_obj } from "scripts/sub/ui.js"
import { share_exec } from "scripts/sub/share.js"


//object imports: SF specific
import { singularity_obj } from "scripts/sub/singularity.js"
import { gang_obj } from "scripts/sub/gang.js"
import { stanek_obj } from "scripts/sub/stanek.js"
import { corporation_obj } from "scripts/sub/corporation.js"
import { bladeburner_obj } from "scripts/sub/bladeburner.js"
import { sleeve_obj } from "scripts/sub/sleeve.js"
import { hacknet_obj } from "scripts/sub/hacknet.js"
import { grafting_obj } from "scripts/sub/grafting.js"
import { infiltration_obj } from "scripts/sub/infiltration.js"


/** @param {NS} ns */
export async function main(ns) {
    ns.ui.openTail()

    //initialize main
    await init(ns)

    //create objects
    var root = new root_obj()
    var cloud = new cloud_obj()
    var hack = new hack_obj()
    var darknet = new darknet_obj()
    var go = new go_obj()
    var coding_contract = new coding_contract_obj()
    var stock = new stock_obj()
    var infiltration = new infiltration_obj()

    //init objects, where needed
    await cloud.init(ns)
    await root.init(ns)
    //await go.init(ns) 

    //create SF dependant objects
    /*
    var gang = new gang_obj()
    var stanek = new stanek_obj()
    var corporation = new corporation_obj()
    var bladeburner = new bladeburner_obj()
    var sleeve = new sleeve_obj()
    var grafting = new grafting_obj()
    var singularity = new singularity_obj()
    var hacknet = new hacknet_obj()
    */

    //get reset info
    const reset_information = ns.getResetInfo()
    //get source files
    const owned_source_files = reset_information.ownedSF
    //debug
    log.info(ns, "Main", "owned_source_files: " + JSON.stringify(owned_source_files), true)

/*
    //init where needed
    if (owned_source_files.hasOwnProperty(13)) {
        await stanek.init(ns)
    }
    if (owned_source_files.hasOwnProperty(2)) {
        await gang.init(ns)
    }
    //corporation
    if (owned_source_files.hasOwnProperty(3)) {
        await corporation.init(ns)
    }
    //singularity
    if (owned_source_files.hasOwnProperty(4)) {
        await singularity.init(ns)
    }
    //bladeburner
    if (owned_source_files.hasOwnProperty(6) || owned_source_files.hasOwnProperty(7)) {
        await bladeburner.init(ns)
    }
    if (owned_source_files.hasOwnProperty(9)) {
        await hacknet.init()
    }
    if (owned_source_files.hasOwnProperty(10)) {
        await sleeve.init(ns)
        await grafting.init(ns)
    }*/

    //start share
    //await share_exec(ns)
 
    //log
    log.info(ns, "Main", "Starting main loop", true)

    // @ignore-infinite
    while (true) {
        //start darknet main loop on darkweb
        darknet.deploy(ns)
        
        //play go
        //await go.play(ns)

        //check and add cloud servers
        await cloud.manage_servers(ns)
        //root servers
        await root.root_servers(ns)
        //hack servers
        hack.hack_server(ns, root, cloud)

        /*
        //SF specific unlocks
        if (owned_source_files.hasOwnProperty(4)) {
            //do stuff
            //await singularity.
            if (owned_source_files.hasOwnProperty(10)) {
                //do stuff
                //await sleeve //and grafting
            }
            if (owned_source_files.hasOwnProperty(6) || owned_source_files.hasOwnProperty(7)) {
            //do stuff
            //await bladeburner.
            }
        }        
        if (owned_source_files.hasOwnProperty(2)) {
            //do stuff
            //await gang.manage()
        }
        if (owned_source_files.hasOwnProperty(3)) {
            //do stuff
            //await corporation.
        }
        if (owned_source_files.hasOwnProperty(9)) {
            //do stuff
            //await hacknet.
        }
        if (owned_source_files.hasOwnProperty(13)) {
            //do stuff
            //await stanek.
        }

        //update ui
        //await ui.update(ns)
        */

        //wait a bit (what is the lowest time we can pick?)
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //static ram
    //ns.ramOverride(4)
    //disable generic logging
    ns.disableLog("disableLog")
    ns.disableLog("sleep")
    ns.disableLog("killall")
    ns.disableLog("dnet.probe")
    ns.disableLog("getServerMaxRam")
    ns.disableLog("scp")
    ns.disableLog("getHackingLevel")
    //ns.disableLog("exec")
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
        //ns.ui.closeTail()
    })
    //kill all other scripts 
    ns.killall(CONSTANTS.SERVER.HOME, true)
    //signal start of program
    log.success(ns, "Main", "Init complete!")
}