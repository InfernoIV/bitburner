

import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"

import * as log from "scripts/util/log.js"


// Declaration
export class hacknet_obj {
    constructor() {}


    init(ns) {
        //disable logging
        log.disable(ns, CONFIG.DISABLE_LOGGING)
    }   


    /*
    hacknet.numNodes        0.5
    hacknet.purchaseNode    0.5
    hacknet.getNodeStats    0.5
    upgradeRam              0.5
    upgradeLevel            0.5
    upgradeCore             0.5
    3 gb
    */
    manage(ns) {
        //get the number of nodes owned
        const nodes_owned = ns.hacknet.numNodes()
        //if we don't own anything
        if (nodes_owned < CONFIG.NODES_MAX) {
            //buy a node
            ns.hacknet.purchaseNode()
        }
        //for each node
        for (let i = 0; i < nodes_owned; i++) {
            //get stats
            const node_stats = ns.hacknet.getNodeStats(i)
            //if we need to increase ram
            if (node_stats.ram < CONFIG.RAM_MAX) {
                //upgrade ram
                ns.hacknet.upgradeRam(i)
            }
            //if we need to increase level
            if (node_stats.level < CONFIG.LEVELS_MAX) {
                //upgrade level
                ns.hacknet.upgradeLevel(i)
            }
            //if we need to increase cores
            if (node_stats.cores < CONFIG.CORES_MAX) {
                //upgrade cores
                ns.hacknet.upgradeCore(i)
            }
        }
    }
}
