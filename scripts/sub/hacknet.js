//Not all these functions are immediately available. -> SF 9
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.hacknet.md


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


// Declaration
export class hacknet_obj {
    constructor() {
        this.available = true
    }


    init(ns) {
        //ns.disableLog("")
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
        if (nodes_owned == 0) {
            //buy a node
            ns.hacknet.purchaseNode()
        }
        //if we have a least 1 node
        if (nodes_owned > 0) {
            //get stats
            const node_stats = ns.hacknet.getNodeStats(0)
            //if we need to increase ram
            if (node_stats.ram < 8) {
                //upgrade ram
                ns.hacknet.upgradeRam(0)
            }
            //if we need to increase level
            if (node_stats.level < 100) {
                //upgrade lvel
                ns.hacknet.upgradeLevel(0)
            }
            //if we need to increase cores
            if (node_stats.cores < 4) {
                //upgrade cores
                ns.hacknet.upgradeCore(0)
            }
        }
    }
}
/*
Faction 'Netburners': '[{"type":"skills","skills":{"hacking":80}},
{"type":"hacknetRAM","hacknetRAM":8},
{"type":"hacknetCores","hacknetCores":4},
{"type":"hacknetLevels","hacknetLevels":100}]'
*/