import * as CONSTANTS from "constants.js"
import * as CONFIG from "config.js"


import * as log from "scripts/util/log.js"


// Declaration
export class sleeve_obj {
    constructor() {}


    init(ns) {
        //disable logging
        log.disable(CONFIG.DISABLE_LOGGING)
    }

    
    manage(ns) {
      //stub
    }
}


//function that returns the activity of the sleeve
export function get_sleeve_activity(sleeve_number) {
    //get sleeve
    const sleeve = ns.sleeve.getSleeve(i)
    //get sleeve task
    const task = ns.sleeve.getTask(i)
    //variable to fill
    var data

    switch (task.type) {
        case "BLADEBURNER": //SleeveBladeburnerTask
            data = "Bladeburner " + task.actionType + ": " + task.actionName
            break
        case "CLASS": //SleeveClassTask
            data = "Training : " + task.classType
            break
        case "COMPANY": //SleeveCompanyTask
            data = "Faction: " + task.companyName
            break
        case "CRIME": //SleeveCrimeTask
            data = "Crime: " + task.crimeType
            break
        case "FACTION": //SleeveFactionTask:
            //get additional data
            data = "Faction: " + task.factionName + " (" + task.factionWorkType + ")"
            break
        case "INFILTRATE": //SleeveInfiltrateTask
            data = "Infiltrate"
            break
            //generic
        case "RECOVERY": //SleeveRecoveryTask
            data = "Recovery: " + sleeve.shock
            break
        case "SUPPORT": //SleeveSupportTask
            data = "Support"
            break
        case "SYNCHRO": //SleeveSynchroTask
            data = "Synchronization: " + sleeve.sync
            break
        default:
            //do nothing
            data = ""
    }
    //return the data
    return data
}
