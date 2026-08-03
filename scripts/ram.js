import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

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
import {
    share_exec
} from "scripts/sub/share.js"


// Declaration
export class ram_obj {
    constructor() {
        //keeps track of registered handles
        handles = {}
        //keep track of ram usage
        ram_used = 0
        //keep track of what claimed what
        registration = new Map()       
    }


    //sets the basic information
    init(ns, initial_ram_cost) {
        //ns.disableLog("")
        //save initial ram cost
        this.ram_used = initial_ram_cost
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
            //adjust ram (+4 GB)
            if (this.register_functionality(ns, CONSTANTS.HANDLE.INTELLIGENCE, {}, 4)) {
                //get bitnode multipliers
                this.bitnode_multipliers = ns.getBitNodeMultipliers()
            }
        }
    }   


    //function that kicks off all other manage functions
    async manage_functionalities(ns) {
        //for each functionality
        for (const handle of this.handles) {
            //check if it has an manage function
            if (typeof this.handles[handle].manage === "function") { 
                //manage the functionality
                await this.handles[handle].manage(ns, this.handles)
            }
        }
    }
    

    //function that registers a class to init and manage (assumes the object has both functions!)
    async register_handle(ns, handle, object, sf_required = 0, sf_level_required = 1, dependency = "") {
        //check if we already have this functionality handles
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
        //check if we can run this
        if (get_source_file_level(sf_required) < sf_level_required) {
            //not enough levels, stop
            return false
        }
        //get ram cost
        const ram_cost = CONSTANTS.RAM[functionality_name]
        //get ram left
        const ram_max = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
        //check if we can register
        if ((ram_used + ram_cost) > ram_max) {
            //not enough ram, stop
            return false
        } 
        //kill all other scripts (share.js)
        ns.killall(CONSTANTS.SERVER.HOME, true)

         //log
        log.success(ns, "Ram", "Registered handle '" + functionality_name + "' for " + ram_used + " + " + ram_cost + " = " + (ram_used + ram_cost) +  " / " + ram_max + " GB", true)
        //update ram
        this.ram_used += ram_cost
        //apply ram
        ns.ramOverride(this.ram_used)
        //register object
        this.handles[functionality_name] = functionality_object
        //register in registry as well
        this.registration.set(functionality_name, ram_cost)
        //check if it has an init function
        if (typeof this.handles[functionality_name].init === "function") { 
            //init object
            await this.handles[functionality_name].init(ns, this.handles)
        }
        
        //start share (again)
        share_exec(ns)

        //return success
        return true
    }


    //gets the source file level, including counting if you're in the bitnode
    get_source_file_level(source_file) {
        var level = 0
        //check if we have the source file
        if (this.source_files_owned.hasOwnProperty(source_file)) {
            //get the level
            level = this.source_files_owned[source_file]
        }
        //check if we are in the node
        if (this.current_node == source_file) {
            //add a level, but cap to 3
            level = Math.min(level+1, 3)
        }
        //return the level
        return level
    }


    //function that manages the imports (in this order)
    async import(ns) {
        //register each handle and return if not successfull (e.g. no ram)
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.ROOT, new root_obj())) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.HACK, new hack_obj())) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.DARKNET, new darknet_obj())) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.GO, new go_obj())) return
        
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.SINGULARITY, new singularity_obj(), 4)) return
        /*
         //check if we have beaten BN15
        const tor_owned = owned_source_files.hasOwnProperty(15)
        //if we have SF15, and therefore own TOR automatically
        if (tor_owned) {
            //lower the ram costs, since the function won't be used
            ram_needed -= 2.0
        }
            */
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.STANEK, new stanek_obj(), 13)) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.SLEEVE, new sleeve_obj(), 10)) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.GO_ANALYSIS, {}, 0, 0, CONSTANTS.HANDLE.GO)) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.GO_CHEAT, {}, 14, 2, CONSTANTS.HANDLE.GO_ANALYSIS)) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.CLOUD, new cloud_obj())) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.CODING_CONTRACT, new coding_contract_obj())) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.STOCK, new stock_obj())) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.INFILTRATION, new infiltration_obj())) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.BLADEBURNER, new bladeburner_obj(), 6) || 
            !await this.register_handle(ns, CONSTANTS.HANDLE.BLADEBURNER, new bladeburner_obj(), 7) ) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.GANG, new gang_obj(), 2)) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.HACKNET, new hacknet_obj(), 9)) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.CORPORATION, new corporation_obj(), 3)) return
        if (!await this.register_handle(ns, CONSTANTS.HANDLE.GRAFTING, new grafting_obj(), 10)) return
    }
}