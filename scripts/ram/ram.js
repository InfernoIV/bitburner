//config
import { DISABLE_LOGGING } from "./config.js"


//constants
import { RAM } from "scripts/constants/ram.js"
import { SERVER } from "scripts/constants/servers.js"
import { HANDLE } from "scripts/constants/handles.js"
import { SCRIPT } from "scripts/constants/scripts.js"


//functions
import * as log from "scripts/util/log.js"
import * as format from "scripts/util/format.js"


//object programs
import {
    root_obj
} from "scripts/root/root.js"
import {
    hack_obj
} from "scripts/hack/hack.js"
import {
    darknet_obj
} from "scripts/darknet/darknet.js"
import {
    cloud_obj
} from "scripts/cloud/cloud.js"
import {
    go_obj
} from "scripts/go/go.js"
import {
    coding_contract_obj
} from "scripts/coding_contract/coding_contract.js"
import {
    stock_obj
} from "scripts/stock/stock.js"
import {
    ui_obj
} from "scripts/ui/ui.js"
import {
    infiltration_obj
} from "scripts/infiltration/infiltration.js"
import {
    singularity_light_obj
} from "scripts/singularity/singularity_light.js"
import {
    singularity_obj
} from "scripts/singularity/singularity.js"
import {
    sleeve_obj
} from "scripts/sleeve/sleeve.js"
import {
    bladeburner_obj
} from "scripts/bladeburner/bladeburner.js"
import {
    stanek_obj
} from "scripts/stanek/stanek.js"
import {
    gang_obj
} from "scripts/gang/gang.js"
import {
    hacknet_obj
} from "scripts/hacknet/hacknet.js"
import {
    grafting_obj
} from "scripts/grafting/grafting.js"
import {
    corporation_obj
} from "scripts/corporation/corporation.js"
import {
    share_exec
} from "scripts/share/share.js"


// Declaration
export class ram_obj {
    constructor() {
        //keeps track of registered handles
        this.handles = {}
        //keep track of ram usage
        this.ram_used = 0.0
        //keep track of what claimed what
        this.registration = new Map()
        //keep track of ram we need to reserver for workers on home (e.g. Stanek)
        this.ram_reserve = 0.0
        this.ram_start = 0
    }


    //sets the basic information
    async init(ns, handles) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
        //save initial ram cost
        this.ram_used = Math.ceil((RAM.MAIN + RAM.RAM) * 100) / 100
        //allocate ram
        ns.ramOverride(this.ram_used)
        //log
        log.info(ns, "Ram", "Starting with RAM: " + this.ram_used, true)
        //save the starting ram
        this.ram_start = ns.getServer(SERVER.HOME).maxRam
        //if running on low ram
        if (this.ram_start < 128) {
            //log 
            log.warning(ns, "Ram", "Low ram: " + this.ram_start + ", starting in low ram mode", true)
        }
        //get reset info
        const reset_information = ns.getResetInfo()
        //get source files
        this.source_files_owned = reset_information.ownedSF
        //keep track of which node you are in (this also unlocks functionality)
        this.current_node = reset_information.currentNode
        //set bitnode multipliers
        this.bitnode_multipliers = { //set to generic values, to be corrected later
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
        }
        //check if we have intelligence to fill bitnode multipliers
        if (this.get_source_file_level(5) > 0) {
            //register handle
            if (await this.register_handle(ns, HANDLE.INTELLIGENCE, {}, 4)) {
                //get bitnode multipliers
                this.bitnode_multipliers = ns.getBitNodeMultipliers()
            }
        }
    }


    //function that kicks off all other manage functions
    async manage_functionalities(ns) {
        //for each functionality
        for (const handle in this.handles) {
            //check if it has an manage function
            if (typeof this.handles[handle].manage === "function") {
                //manage the functionality
                await this.handles[handle].manage(ns, this.handles)
            }
        }
    }


    //function that registers a class to init and manage (assumes the object has both functions!)
    async register_handle(ns, handle, object, sf_required = 0, sf_level_required = 1, dependency = "", ram_worker =
        0.00) {
        //if we already registered the handle
        if (this.registration.has(handle)) {
            //stop
            return true
        }
        //check for dependencies
        if (dependency != "") {
            //if we don't have an object handles
            if (!this.registration.has(dependency)) {
                //stop
                return false
            }
        }
        //if it requires a source file
        if (sf_required > 0) {
            //get the level of the source source
            const level = this.get_source_file_level(sf_required)
            //if we don't have enough levels
            if (level < sf_level_required) {
                //not enough levels, stop
                return false
            }
        }
        //get ram cost
        const ram_cost = RAM[handle]
        //get ram left
        const ram_max = ns.getServer(SERVER.HOME).maxRam
        //calculate total usage / need
        const ram_need = format.float(this.ram_used + ram_cost + this.ram_reserve + ram_worker)
        //check if we can register
        if (ram_need > ram_max) {
            //not enough ram, stop
            return false
        }
        //kill share script on home
        ns.kill(SCRIPT.WORKER.SHARE)
        //create message
        let message = "Registered '" + handle + "' for " + this.ram_used + " + " + ram_cost
        //if we have reserved ram
        if (this.ram_reserve > 0.0) {
            //add to message
            message += " + " + this.ram_reserve
        }
        //if we have ram of worker to be added
        if (ram_worker > 0.0) {
            //add to message
            message += " + " + ram_worker
        }
        //calc percentage
        const percentage = Math.ceil((ram_need / ram_max) * 100)
        //log
        log.success(ns, "Ram", message + " = " + ram_need + " / " + ram_max + " GB (" + percentage + "%)", true)
        //update ram
        this.ram_used = format.float(ram_cost + this.ram_used)
        //update reservation for worker
        this.ram_reserve += ram_worker
        //apply ram
        ns.ramOverride(this.ram_used)
        //register object
        this.handles[handle] = object
        //register in registry as well
        this.registration.set(handle, ram_cost)
        //check if it has an init function
        if (typeof this.handles[handle].init === "function") {
            //init object
            await this.handles[handle].init(ns, this.handles)
        }
        //start share script (again), taking reserves for workers into account
        share_exec(ns, this.ram_reserve)
        //return success
        return true
    }


    //gets the source file level, including counting if you're in the bitnode
    get_source_file_level(source_file) {
        let level = 0
        //check if we have the source file
        if (this.source_files_owned.hasOwnProperty(source_file)) {
            //get the level
            level = this.source_files_owned[source_file]
        }
        //check if we are in the node
        if (this.current_node == source_file) {
            //add a level, but cap to 3
            level = Math.min(level + 1, 3)
        }
        //return the level
        return level
    }


    //function that manages the imports (in this order)
    async import(ns) {
        //register each handle and return if not successfull (e.g. no ram)
        //indicate if stanek is available to join asap
        await this.register_handle(ns, HANDLE.STANEK_AVAILABLE, {}, 13)
        //if we started on low ram and ram has grown bigger
        if (this.ram_start < 128 && ns.getServer(SERVER.HOME).maxRam >= 128) {
            //start boot script
            ns.spawn(SCRIPT.BOOT)
            //stop
            ns.exit()
        }
        
        
        //root for rooting servers, enabling hack
        if (ns.getServer(SERVER.HOME).maxRam <= 64) {
            //singularity for automating player training, actions and upgrading RAM 
            await this.register_handle(ns, HANDLE.SINGULARITY_LIGHT, new singularity_light_obj(), 4, 1)
            //root for rooting servers, enabling hack
            await this.register_handle(ns, HANDLE.ROOT, new root_obj())
            //hack for money
            await this.register_handle(ns, HANDLE.HACK, new hack_obj())
            //darknet for money (and is really cheap in ram cost)
            await this.register_handle(ns, HANDLE.DARKNET, new darknet_obj())
        } else {

            //AUTOMATION
            await this.register_handle(ns, HANDLE.SINGULARITY, new singularity_obj(), 4, 1, "", 5.8)
            //if darknet is available, we save 2 GBs (on singularity)
            await this.register_handle(ns, HANDLE.DARKNET_AVAILABLE, {}, 15, 1, HANDLE
                .SINGULARITY)

            //join stanek asap
            await this.register_handle(ns, HANDLE.STANEK, new stanek_obj(), 13, 1, "", 2.0)

            //IMPROVE AUTOMATION
            await this.register_handle(ns, HANDLE.SLEEVE, new sleeve_obj(), 10)

            //BASE
            await this.register_handle(ns, HANDLE.ROOT, new root_obj())
            await this.register_handle(ns, HANDLE.HACK, new hack_obj())
            await this.register_handle(ns, HANDLE.DARKNET, new darknet_obj())

            //GO
            await this.register_handle(ns, HANDLE.GO, new go_obj())

            //extend GO
            await this.register_handle(ns, HANDLE.GO_ANALYSIS, {}, 0, 0, HANDLE.GO)
            await this.register_handle(ns, HANDLE.GO_CHEAT, {}, 14, 2, HANDLE.GO_ANALYSIS)

            //EXTEND SINGULARITY
            await this.register_handle(ns, HANDLE.BLADEBURNER, new bladeburner_obj(), 6, 1, CONSTANTS
                .HANDLE.SINGULARITY)
            await this.register_handle(ns, HANDLE.BLADEBURNER, new bladeburner_obj(), 7, 1, CONSTANTS
                .HANDLE.SINGULARITY)
            await this.register_handle(ns, HANDLE.GRAFTING, new grafting_obj(), 10, 1, HANDLE
                .SINGULARITY)

            //EXTEND FUNCTIONALITY
            await this.register_handle(ns, HANDLE.CLOUD, new cloud_obj())
            //await this.register_handle(ns, HANDLE.CODING_CONTRACT, new coding_contract_obj())
            await this.register_handle(ns, HANDLE.STOCK, new stock_obj())
            await this.register_handle(ns, HANDLE.GANG, new gang_obj(), 2)
            //await this.register_handle(ns, HANDLE.HACKNET, new hacknet_obj())//, 9)
            await this.register_handle(ns, HANDLE.CORPORATION, new corporation_obj(), 3)

            //log.info(ns, "Ram", "Import complete: '" + [...this.registration.entries()] + "'", true)
        }
        //add ui
        await this.register_handle(ns, HANDLE.UI, new ui_obj())
    }
}
