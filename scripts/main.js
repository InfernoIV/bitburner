import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as format from "scripts/sub/format.js"


//object programs
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
    //log
    log.info(ns, "Main", "Starting with " + ram_in_use.toFixed(2) + "GB RAM in use", true)
    //initialize main
    await init(ns)

    //create dummy objet
    const dummy_object = {
        available: false,
        init: function () {},
        manage: function () {},
    }

    //object which contains all functionality
    var programs = {
        //basic
        root: new root_obj(),
        hack: new hack_obj(),
        //import

        darknet: dummy_object,
        cloud: dummy_object,
        go: dummy_object,
        coding_contract: dummy_object,
        stock: dummy_object,
        infiltration: dummy_object,
        intelligence: dummy_object,
        //imports
        singularity: dummy_object, 
        sleeve: dummy_object, 
        bladeburner: dummy_object, 
        stanek: dummy_object, 
        gang: dummy_object, 
        corporation: dummy_object, 
        grafting: dummy_object, 
        hacknet: dummy_object,
        ui: dummy_object,
        bitnode_multipliers: { //set to generic values, to be corrected later
             //1: cloud
            CloudServerLimit: 1,
            CloudServerMaxRam: 1,
            //2: gang
            GangSoftcap: 1,
            //3: corporation
            CorporationSoftcap: 1,
            //4: singularity
                //nothing
            //5: intelligence
                //nothing
            //6&7: bladeburner
            BladeburnerRank: 1,
            //8: stock
                //nothing
            //9: hacknet
                //HacknetNodeMoney can be 0
            //10: sleeve / grafting
                //nothing
            //13: stanek
            StaneksGiftExtraSize: 0,
            //14: go
                //GoPower
            //15: darknet
                //DarknetMoneyMultiplier
        },
    }
    //ram to start
    var previous_ram = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
    //manage programs
    ram_in_use = await manage_imports(ns, ram_in_use, programs)

    //init functions
    await programs.root.init(ns, programs.singularity.available) //hack exp, enable hack
    programs.hack.init(ns) //money, hack exp



    //ui test
    /*statusRegistry.register("Server", "homeMoney", ns => (ns.getServer(CONSTANTS.SERVER.HOME)).moneyAvailable)
    statusRegistry.register("Root", "Hacking Tools", (ns,programs) => programs.root.get_number_of_hacking_tools_owned(ns))
    /*
    statusRegistry.register('Gang','members', ns => ns.gang.getMemberNames().length)
    statusRegistry.register("Gang", "members", ns => ns.gang.getMemberNames().length)
    statusRegistry.register("Gang", "wanted", async ns => (await ns.gang.getGangInformation()).wantedLevel)
    */

    //const handle = await showComponentStatusMenus(ns, [], { useRegistry: true, layout: 'grid', refreshMs: 0 })



    //log
    log.info(ns, "Main", "Starting main loop", true)
    // @ignore-infinite
    while (true) {

        //manage stanek
        programs.stanek.manage(ns)

        //do stuff
        programs.singularity.manage(ns, programs)
        
        //check and add cloud servers
        //cloud.manage(ns)
        //manage hacknet
        programs.hacknet.manage(ns)

        //root servers
        await programs.root.manage(ns)
        //hack servers
        await programs.hack.manage(ns, programs.root.servers_ram, programs.root.servers_money)
        
        //start darknet main loop on darkweb
        programs.darknet.manage(ns)
        //manage stock
        programs.stock.manage(ns)

        //play go
        await programs.go.manage(ns)
        //manage gang
        await programs.gang.manage(ns)
        //manage corporation
        programs.corporation.manage(ns)
        

        //update ui
        //programs.ui.manage(ns, programs)
        //await handle.refresh()



        //get the max ram
        const max_ram = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
        //if changed since last time
        if (previous_ram != max_ram) {
            //update previous ram
            previous_ram = max_ram
            //manage programs
            ram_in_use = await manage_imports(ns, ram_in_use, programs)
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
async function manage_imports(ns, ram_in_use, programs) { 
    //get max ram
    const max_ram = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
    //get reset info
    const reset_information = ns.getResetInfo()
    //get source files
    const owned_source_files = reset_information.ownedSF
    //keep track of which node you are in (this also unlocks functionality)
    const current_node = reset_information.currentNode
    //kill all other scripts (share.js)
    ns.killall(CONSTANTS.SERVER.HOME, true)

    //Intelligence: bitnode multipliers (see what is effective and what is NOT effective)
    if ((current_node == 5 || owned_source_files.hasOwnProperty(5)) && !programs.intelligence.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.INTELLIGENCE) < max_ram ) {
            //log
            log_ram(ns, "Intelligence", ram_in_use, CONSTANTS.RAM.INTELLIGENCE, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.INTELLIGENCE
            //adjust ram
            ns.ramOverride(ram_in_use)
            //set flag to true
            programs.intelligence.available = true
            //get the bitnode multipliers
            programs.bitnode_multipliers = ns.getBitNodeMultipliers()
        }
    }

    //Singularity: automation
    if ((current_node == 4 || owned_source_files.hasOwnProperty(4)) && !programs.singularity.available) {
        //variable to keep track of ram
        var ram_needed = CONSTANTS.RAM.SINGULARITY
        //check if we have beaten BN15
        const tor_owned = owned_source_files.hasOwnProperty(15)
        //if we have SF15, and therefore own TOR automatically
        if(tor_owned) {
            //lower the ram costs, since the function won't be used
            ram_needed -= 2.0
        }
        //check ram
        if ((ram_in_use + ram_needed) < max_ram) {
            //log
            log_ram(ns, "Singularity", ram_in_use, CONSTANTS.RAM.SINGULARITY, max_ram)
            //up the ram    
            ram_in_use += ram_needed
            //change the RAM
            ns.ramOverride(ram_in_use)            
            //import scripts
            programs.singularity = new singularity_obj()
            //init
            programs.singularity.init(ns, tor_owned)
            //set flag for rooting
            programs.root.singularity_available = true
        }
    }

    //Stanek
    //StaneksGiftExtraSize can be -99
    if ((current_node == 13 || owned_source_files.hasOwnProperty(13)) && programs.bitnode_multipliers.StaneksGiftExtraSize > -99 && !programs.stanek.available) {
        //check if we can join using singularity
        if (programs.singularity.available) {
            //join stanek
            if (await programs.singularity.join_stanek(ns)) {
                //log
                log.success(ns, "Stanek", "Joined Church of the Machine God", true)
            //failed to join
            } else {
                //log
                log.warning(ns, "Stanek", "Failed to join Church of the Machine God", true)
            }
        }
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.STANEK) < max_ram) {
            //log
            log_ram(ns, "Stanek", ram_in_use, CONSTANTS.RAM.STANEK, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.STANEK
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.stanek = new stanek_obj()
            //init
            programs.stanek.init(ns) //boost
        }
    }


    //Sleeve: faster automation
    if ((current_node == 10 || owned_source_files.hasOwnProperty(10)) && !programs.sleeve.available) { 
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.SLEEVE) < max_ram ) {
            //log
            log_ram(ns, "Sleeve", ram_in_use, CONSTANTS.RAM.SLEEVE, max_ram)
            //up the ram
            ram_in_use += CONSTANTS.RAM.SLEEVE
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.sleeve = new sleeve_obj()
            //init
            programs.sleeve.init(ns) //automation
        }
    }

    //Darknet: charisma, tools, stocks, money
    if (!programs.darknet.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.DARKNET) < max_ram) {
            //log
            log_ram(ns, "Darknet", ram_in_use, CONSTANTS.RAM.DARKNET, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.DARKNET
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.darknet = new darknet_obj()
            //init
            programs.darknet.init(ns) //money, tools, charisma exp
        }
    }

    //Go: boost, money, rep -> favor (for some factions)
    if (!programs.go.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.GO) < max_ram) {
            //log
            log_ram(ns, "Go", ram_in_use, CONSTANTS.RAM.GO, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.GO
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.go = new go_obj()        
            //init
            programs.go.init(ns)
        }
    }

    //go analysis (+48 GB)
    if (programs.go.available && !programs.go.can_analyse) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.GO_ANALYSIS) < max_ram) {
            //log
            log_ram(ns, "Go (analysis)", ram_in_use, CONSTANTS.RAM.GO_ANALYSIS, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.GO_ANALYSIS
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.go.can_analyse = true
        }
    }

    //go cheat (+24 GB)
    if (programs.go.available && programs.go.can_analyse && !programs.go.can_cheat) {
        //keep track of go level
        var go_level = 0
        //check if we have beated BN14
        if (owned_source_files.hasOwnProperty(14)) {
            //get the level of source file
            go_level = owned_source_files[14]
        }
        //if we are in 14.2 or we have beaten 14.2
        if ((current_node == 14 && go_level == 1) || go_level >= 2) {
             //check ram
            if ((ram_in_use + CONSTANTS.RAM.GO_CHEAT) < max_ram) {
                //log
                log_ram(ns, "Go (cheat)", ram_in_use, CONSTANTS.RAM.GO_CHEAT, max_ram)
                //up the ram    
                ram_in_use += CONSTANTS.RAM.GO_CHEAT
                //change the RAM
                ns.ramOverride(ram_in_use)                
                //import scripts
                programs.go.can_cheat = true
            }
        }
    }

    //Cloud: improves hacking
    if (!programs.cloud.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.CLOUD) < max_ram) {
            //log
            log_ram(ns, "Cloud", ram_in_use, CONSTANTS.RAM.CLOUD, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.CLOUD
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.cloud = new cloud_obj()
            //init
            await programs.cloud.init(ns)
        }
    }

    //Coding contracts
    if (false && !programs.coding_contract.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.CODING_CONTRACT) < max_ram) {
            //log
            log_ram(ns, "Coding Contracts", ram_in_use, CONSTANTS.RAM.CODING_CONTRACT, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.CODING_CONTRACT
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.coding_contract = new coding_contract_obj()
            //init
            await programs.coding_contract.init(ns)
        }
    }
    
    //Stock
    if (!programs.stock.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.STOCK) < max_ram) {
            //log
            log_ram(ns, "Stock", ram_in_use, CONSTANTS.RAM.STOCK, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.STOCK
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.stock = new stock_obj()
            //init
            await programs.stock.init(ns) 
        }
    }
    
    //Infiltration
    if (false && !programs.infiltration.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.INFILTRATION) < max_ram) {
            //log
            log_ram(ns, "Infiltration", ram_in_use, CONSTANTS.RAM.INFILTRATION, max_ram)
            //up the ram    
            ram_in_use += CONSTANTS.RAM.INFILTRATION
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.infiltration = new infiltration_obj()
            //init
            await programs.infiltration.init(ns)
        }
    }

    //Bladeburner: other ways to beat bitnode
    //BladeburnerRank can be 0
    if((current_node == 6 || current_node == 7 || owned_source_files.hasOwnProperty(6) || owned_source_files.hasOwnProperty(7)) 
        && programs.bitnode_multipliers.BladeburnerRank > 0 && !programs.bladeburner.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.BLADEBURNER) < max_ram) {
            //log
            log_ram(ns, "Bladeburner", ram_in_use, CONSTANTS.RAM.BLADEBURNER, max_ram)
            //up the ram
            ram_in_use += CONSTANTS.RAM.BLADEBURNER
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.bladeburner = bladeburner_obj()
            //init
            programs.bladeburner.init(ns)
        }
    }

    //Gang: money
    //GangSoftcap can be 0
    if ((current_node == 2 || owned_source_files.hasOwnProperty(2)) && programs.bitnode_multipliers.GangSoftcap > 0 && !programs.gang.available) { 
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.GANG) < max_ram) {
            //log
            log_ram(ns, "Gang", ram_in_use, CONSTANTS.RAM.GANG, max_ram)
            //up the ram
            ram_in_use += CONSTANTS.RAM.GANG
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.gang = new gang_obj()
            //init
            programs.gang.init(ns) //boost
        }
    }

    //Hacknet
    //HacknetNodeMoney can be 0 (can be used for something different than money?)
    if ((true || current_node == 9 || owned_source_files.hasOwnProperty(9)) && !programs.hacknet.available) { 
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.HACKNET) < max_ram) {
            //log
            log_ram(ns, "Hacknet", ram_in_use, CONSTANTS.RAM.HACKNET, max_ram)
            //up the ram
            ram_in_use += CONSTANTS.RAM.HACKNET
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.hacknet = new hacknet_obj()
            //init
            programs.hacknet.init(ns) //boost
        }
    }

    //Corporation: money
    //requires bitnode multiplier of CorporationSoftcap above or equal to 0.15
    //https://github.com/bitburner-official/bitburner-src/blob/dev/src/Corporation/helpers.ts#L75
    if ((current_node == 3 || owned_source_files.hasOwnProperty(3)) && programs.bitnode_multipliers.CorporationSoftcap >= 0.15 && !programs.corporation.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.CORPORATION) < max_ram) {
            //log
            log_ram(ns, "Corporation", ram_in_use, CONSTANTS.RAM.CORPORATION, max_ram)
            //up the ram
            ram_in_use += CONSTANTS.RAM.CORPORATION
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.corporation = new corporation_obj()
            //init
            programs.corporation.init(ns)
        }
    }

    //Grafting: augmentations without installing
    if ((current_node == 10 || owned_source_files.hasOwnProperty(10)) && !programs.grafting.available) {
        //check ram
        if ((ram_in_use + CONSTANTS.RAM.GRAFTING) < max_ram) {
            //log
            log_ram(ns, "Grafting", ram_in_use, CONSTANTS.RAM.GRAFTING, max_ram)
            //set the object
            ram_in_use += CONSTANTS.RAM.GRAFTING
            //change the RAM
            ns.ramOverride(ram_in_use)
            //import scripts
            programs.grafting = new grafting_obj()
            //init
            programs.grafting.init(ns) //other
        }
    }

    //start share (scales with leftover ram)
    share_exec(ns)

    //return the ram in use and all objects
    return ram_in_use
}

function log_ram(ns, subject, ram_in_use, ram_script, max_ram) {
    //log
    log.success(ns, "Main", "Imported " + subject + ", RAM: " + format.float(ram_in_use) + " + " + format.float(ram_script) +
        " = " + format.float(ram_in_use + ram_script) + " / " + format.float(max_ram), true)
}