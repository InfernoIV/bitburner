import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


//object imports
import {
    root_obj
} from "scripts/sub/root.js"
import {
    hack_obj
} from "scripts/sub/hack.js"
import {
    darknet_obj
} from "scripts/sub/darknet.js"
import {
    cloud_obj
} from "scripts/sub/cloud.js"
import {
    go_obj
} from "scripts/sub/go.js"
import {
    coding_contract_obj
} from "scripts/sub/coding_contract.js"
import {
    stock_obj
} from "scripts/sub/stock.js"
import {
    ui_obj
} from "scripts/sub/ui.js"
import {
    share_exec
} from "scripts/sub/share.js"
import {
    infiltration_obj
} from "scripts/sub/infiltration.js"

import {
    singularity_obj
} from "scripts/sub/singularity.js"
import {
    sleeve_obj
} from "scripts/sub/sleeve.js"
import {
    bladeburner_obj
} from "scripts/sub/bladeburner.js"
import {
    stanek_obj
} from "scripts/sub/stanek.js"
import {
    gang_obj
} from "scripts/sub/gang.js"
import {
    hacknet_obj
} from "scripts/sub/hacknet.js"
import {
    grafting_obj
} from "scripts/sub/grafting.js"
import {
    corporation_obj
} from "scripts/sub/corporation.js"



/** @param {NS} ns */
export async function main(ns) {
    //keep track of ram
    var ram_in_use = CONSTANTS.RAM.MAIN + CONSTANTS.RAM.ROOT + CONSTANTS.RAM.CLOUD + CONSTANTS.RAM.HACK + CONSTANTS
        .RAM.DARKNET + CONSTANTS.RAM.GO
    //set to 2 decimals
    ram_in_use = Math.round(ram_in_use * 100) / 100
    //set ram
    ns.ramOverride(ram_in_use)
    //open tail
    ns.ui.openTail()
    //log
    log.info(ns, "Main", "Starting with " + ram_in_use.toFixed(2) + "GB RAM in use", true)
    //initialize main
    await init(ns)

    //create objects
    var root = new root_obj()
    var hack = new hack_obj()
    var darknet = new darknet_obj()
    var cloud = new cloud_obj()
    var go = new go_obj() //TO IMPROVE
    var coding_contract = new coding_contract_obj() //TODO
    var stock = new stock_obj() //TODO
    var infiltration = new infiltration_obj() //TODO
    //create dummy objet
    const dummy_object = {
        available: false,
        init: function () {},
        manage: function () {},
    }

    var imports = {singularity: dummy_object, sleeve: dummy_object, bladeburner: dummy_object, stanek: dummy_object, gang: dummy_object, corporation: dummy_object, grafting: dummy_object, hacknet: dummy_object}
    //create SF dependant objects,
    var singularity = dummy_object //automation
    var sleeve = dummy_object //automation
    var bladeburner = dummy_object //automation / other way to boost bitnode / boost
    var stanek = dummy_object //boost
    var gang = dummy_object //boost
    var corporation = dummy_object //boost
    var grafting = dummy_object //alternative way for augments
    var hacknet = dummy_object //boost
    //create a dummy bitnode multipliers object
    const bitnode_multipliers = {
        //1: cloud
        CloudServerLimit: 1,
        CloudServerMaxRam: 1,
        //2: gang
        //3: corporation
        //4: singularity
        //5: intelligence
        //6&7: bladeburner
        //8: stock
        //9: hacknet
        //10: sleeve / grafting
        //13: stanek
        //14: go
        //15: darknet
    }

    //ram to start
    var previous_ram = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
    //manage imports
    ram_in_use = await manage_imports(ns, ram_in_use, imports) //singularity, sleeve, bladeburner, stanek, gang, hacknet, grafting, corporation)

    //init functions
    darknet.init(ns) //money, tools, charisma exp
    await root.init(ns, singularity.available) //hack exp, enable hack
    hack.init(ns) //money, hack exp
    go.init(ns) //boost, money, rep -> favor (for some factions)
    await cloud.init(ns) //improves hacking

    //log
    log.info(ns, "Main", "Starting main loop", true)
    // @ignore-infinite
    while (true) {

        //start darknet main loop on darkweb
        darknet.manage(ns)
        //play go
        await go.manage(ns)
        //check and add cloud servers
        //cloud.manage(ns)
        //root servers
        await root.manage(ns)
        //hack servers
        await hack.manage(ns, root, cloud)
        //do stuff
        imports.singularity.manage(ns, sleeve, bladeburner, grafting)
        //manage gang
        await imports.gang.manage(ns)
        //manage corporation
        imports.corporation.manage(ns)
        //manage hacknet
        imports.hacknet.manage(ns)
        //manage stanke
        imports.stanek.manage(ns)

        //update ui
        //await ui.update(ns)

        //get the max ram
        const max_ram = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
        //if changed since last time
        if (previous_ram != max_ram) {
            //update previous ram
            previous_ram = max_ram
            //manage imports
            ram_in_use = await manage_imports(ns, ram_in_use, imports)
        }

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


/*
base                1.6
ns.getResetInfo()
ns.killall          
ns.ui.openTail      0
ns.ui.resizeTail    0
ns.ui.moveTail      0
ns.disableLog       0
ns.ui.windowSize    0
ns.atExit           0
ns.ramOverride      0
*/


//function that manages the imports, based on if already imported, owned source files, bitnode multipliers (if available) and max ram
async function manage_imports(ns, ram_in_use, imports) { //singularity, sleeve, bladeburner, stanek, gang, hacknet, grafting, corporation) {
    //get max ram
    const max_ram = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
    //save the ram to check later
    const ram_previous = ram_in_use
    //get reset info
    const reset_information = ns.getResetInfo()
    //get source files
    const owned_source_files = reset_information.ownedSF
    
    //kill all other scripts (share.js)
    ns.killall(CONSTANTS.SERVER.HOME, true)


    //init where needed
    if (owned_source_files.hasOwnProperty(5) && (ram_in_use + CONSTANTS.RAM.SINGULARITY) < max_ram) {
        //log
        log.success(ns, "Main", "Imported Intelligence, RAM: " + ram_in_use + " + " + CONSTANTS.RAM
            .INTELLIGENCE + " = " + (
                ram_in_use + CONSTANTS.RAM.INTELLIGENCE) + " < " + max_ram, true)
        //up the ram    
        ram_in_use += CONSTANTS.RAM.SINGULARITY
        //adjust ram
        ns.ramOverride(ram_in_use)
        //get the bitnode multipliers
        bitnode_multipliers = eval("ns.getBitNodeMultipliers()")
    }
    //automation
    if ((owned_source_files.hasOwnProperty(4) || true) && (ram_in_use + CONSTANTS.RAM.SINGULARITY) < max_ram && !
        imports.singularity.available) {
        //import scripts
        imports.singularity = new singularity_obj()
        //log
        log.success(ns, "Main", "Imported Singularity, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.SINGULARITY +
            " = " + (
                ram_in_use + CONSTANTS.RAM.SINGULARITY) + " < " + max_ram, true)
        //up the ram    
        ram_in_use += CONSTANTS.RAM.SINGULARITY
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.singularity.init(ns) //automation
    }

    if (owned_source_files.hasOwnProperty(10) && (ram_in_use + CONSTANTS.RAM.SLEEVE) < max_ram && !sleeve
        .available) {
        //import scripts
        imports.sleeve = new sleeve_obj()
        //log
        log.success(ns, "Main", "Imported Sleeve, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.SLEEVE + " = " + (
            ram_in_use + CONSTANTS.RAM.SLEEVE) + " < " + max_ram, true)
        //up the ram
        ram_in_use += CONSTANTS.RAM.SLEEVE
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.sleeve.init(ns) //automation
    }
    if ((owned_source_files.hasOwnProperty(6) || owned_source_files.hasOwnProperty(7)) && (ram_in_use +
            CONSTANTS.RAM.BLADEBURNER) < max_ram && !bladeburner.available) {
        //import scripts
        imports.bladeburner = bladeburner_obj()
        //log
        log.success(ns, "Main", "Imported Bladeburner, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.BLADEBURNER +
            " = " + (
                ram_in_use + CONSTANTS.RAM.BLADEBURNER) + " < " + max_ram, true)
        //up the ram
        ram_in_use += CONSTANTS.RAM.BLADEBURNER
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.bladeburner.init(ns) //other ways to beat bitnode
    }
    //boost
    if (owned_source_files.hasOwnProperty(13) && (ram_in_use + CONSTANTS.RAM.STANEK) < max_ram && !stanek
        .available) {
        //import scripts
        imports.stanek = new stanek_obj()
        //log
        log.success(ns, "Main", "Imported Stanek, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.STANEK + " = " + (
            ram_in_use + CONSTANTS.RAM.STANEK) + " < " + max_ram, true)
        //up the ram    
        ram_in_use += CONSTANTS.RAM.STANEK
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.stanek.init(ns) //boost
    }
    if (owned_source_files.hasOwnProperty(2) && (ram_in_use + CONSTANTS.RAM.GANG) < max_ram && !gang.available) {
        //import scripts
        imports.gang = new gang_obj()
        //log
        log.success(ns, "Main", "Imported Gang, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.GANG + " = " + (
            ram_in_use + CONSTANTS.RAM.GANG) + " < " + max_ram, true)
        //up the ram
        ram_in_use += CONSTANTS.RAM.GANG
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.gang.init(ns) //boost
    }
    if (owned_source_files.hasOwnProperty(9) && (ram_in_use + CONSTANTS.RAM.HACKNET) < max_ram && !hacknet
        .available) {
        //import scripts
        imports.hacknet = new hacknet_obj()
        //log
        log.success(ns, "Main", "Imported Hacknet, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.HACKNET + " = " +
            (
                ram_in_use + CONSTANTS.RAM.HACKNET) + " < " + max_ram, true)
        //up the ram
        ram_in_use += CONSTANTS.RAM.HACKNET
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.hacknet.init(ns) //boost
    }
    if (owned_source_files.hasOwnProperty(10) && (ram_in_use + CONSTANTS.RAM.GRAFTING) < max_ram && !grafting
        .available) {
        //import scripts
        imports.grafting = new grafting_obj()
        //log
        log.success(ns, "Main", "Imported Grafting, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.GRAFTING +
            " = " + (
                ram_in_use + CONSTANTS.RAM.GRAFTING) + " < " + max_ram, true)
        //set the object
        ram_in_use += CONSTANTS.RAM.GRAFTING
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.grafting.init(ns) //other
    }
    if (owned_source_files.hasOwnProperty(3) && (ram_in_use + CONSTANTS.RAM.CORPORATION) < max_ram && !corporation
        .available) {
        //import scripts
        imports.corporation = new corporation_obj()
        //log
        log.success(ns, "Main", "Imported Corporation, RAM: " + ram_in_use + " + " + CONSTANTS.RAM.CORPORATION +
            " = " + (
                ram_in_use + CONSTANTS.RAM.CORPORATION) + " < " + max_ram, true)
        //up the ram
        ram_in_use += CONSTANTS.RAM.CORPORATION
        //change the RAM
        ns.ramOverride(ram_in_use)
        //init
        imports.corporation.init(ns) //other

    }

    //start share
    share_exec(ns)

    //return the ram in use and all objects
    return ram_in_use
}