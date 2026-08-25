//config
import {
    DISABLE_LOGGING,
    SHOCK_MAX,
    SYNC_MIN
} from "./config.js"


//constants
//import { } from "scripts/constants/.js"


//functions
import * as log from "scripts/util/log.js"
import {
    get_factions_to_work_for
} from "scripts/singularity/singularity.js"


// Declaration
export class sleeve_obj {
    constructor() {}


    init(ns) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
        //keep track of owned sleeves
        this.sleeves_owned = SLEEVES_OWNED
    }


    manage(ns) {
        //for each sleeve
        for (let i = 0; i < this.sleeves_owned; i++) {
            //manage the sleeve
            this.manage_sleeve(ns, i)
        }
        //stub
        //TODO: can a sleeve and character work on the same faction / company?
    }


    /*
    Sleeve.setToShockRecovery() 4 GB
    Sleeve.setToSynchronize()   4 GB    -> will be obsolete if memory is maxed on a sleeve
    */
    //function that manages the sleeve
    manage_sleeve(ns, sleeve_number) {
        //get sleeve
        const sleeve = ns.sleeve.getSleeve(sleeve_number)
        //if the sleeve has too much shock
        if (sleeve.shock >= SHOCK_MAX) {
            //recover
            ns.sleeve.setToShockRecovery(sleeve_number)
        }
        //if the sleeve has too little synchronisation
        /*
        if (sleeve.sync < SYNC_MIN) {
            //sync
            ns.sleeve.setToSynchronize(sleeve_number)
        }*/
        //get factions to work for
        const factions_to_work_for = get_factions_to_work_for(ns)
        //variable to put a target faction into
        let target_faction
        //for each faction
        for (const faction of factions_to_work_for) {
            //check for player and sleeves if not already doing this work
            //target_faction = 
        }
        //if we have a target faction
        if (target_faction != undefined) {
            //work for this faction
            this.work_for_faction(ns, sleeve_number, target_faction)
            //stop
            return
        }
        //get companies to work for
        const companies_to_work_for = get_companies_to_work_for(ns) 
         //variable to put a target company into
        let target_company
        //for each company
        for (const company of companies_to_work_for) {
            //check for player and sleeves if not already doing this work
            //target_company = 
        }
        //if we have a target faction
        if (target_company != undefined) {
            //work for this faction
            if(this.work_for_company(ns, sleeve_number, target_company)) {
                //stop
                return
            }
        }
    }

    work_for_faction(ns, sleeve_number, faction) {
        //determine faction work type
        //ns.sleeve.setToFactionWork(sleeve_number, faction, factionWorkType)
    }

    work_for_company(ns, sleeve_number, target_company) {
        //determine company work type
        //ns.sleeve.setToCompanyWork(sleeve_number, target_company)
    }
}


//function that returns the activity of the sleeve
export function get_sleeve_activity(sleeve_number) {
    //get sleeve
    const sleeve = ns.sleeve.getSleeve(sleeve_number)
    //get sleeve task
    const task = ns.sleeve.getTask(sleeve_number)

    switch (task.type) {

        //sleeve specific
        case "RECOVERY": //SleeveRecoveryTask
            return {
                type: task.type, task: sleeve.shock, sub: undefined
            }

        case "SYNCHRO": //SleeveSynchroTask
            return {
                type: task.type, task: sleeve.sync, sub: undefined
            }


            //generic
        case "CLASS": //SleeveClassTask
            return {
                type: task.type, task: task.classType, sub: undefined
            }

        case "FACTION": //SleeveFactionTask:
            return {
                type: task.type, task: task.factionName, sub: task.factionWorkType
            }

        case "COMPANY": //SleeveCompanyTask
            return {
                type: task.type, task: task.companyName, sub: undefined
            }

        case "CRIME": //SleeveCrimeTask
            return {
                type: task.type, task: task.crimeType, sub: undefined
            }


            //bladeburner
        case "BLADEBURNER": //SleeveBladeburnerTask
            return {
                type: task.type, task: task.actionType, sub: task.actionName
            }

        case "INFILTRATE": //SleeveInfiltrateTask -> Bladeburner?
            return {
                type: task.type, task: undefined, sub: undefined
            }

        case "SUPPORT": //SleeveSupportTask
            return {
                type: task.type, task: undefined, sub: undefined
            }

        default:
            return {
                type: task.type, task: undefined, sub: undefined
            }
    }
}