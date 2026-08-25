//config


//constants
import { SERVER } from "scripts/constants/servers.js"
import { SCRIPT } from "scripts/constants/scripts.js"


//functions
import * as log from "scripts/util/log.js"


/*
singularity.destroyW0r1dD43m0n   25
spawn       2
base        1.6
*/
/** @param {NS} ns */
export async function main(ns) {
    //get the next bitnode
    const next_bitnode = ns.args.length >= 1 ? ns.args[0] : 12
    //get if we need to hack
    const need_to_root = ns.args.length >= 2 ? ns.args[1] : false
    //if we need to root
    if (need_to_root) {
        ns.sqlinject(SERVER.WORLD_DEAMON)                                    
        ns.httpworm(SERVER.WORLD_DEAMON)                          
        ns.relaysmtp(SERVER.WORLD_DEAMON)                          
        ns.ftpcrack(SERVER.WORLD_DEAMON)                   
        ns.brutessh(SERVER.WORLD_DEAMON)
        ns.nuke(SERVER.WORLD_DEAMON)
    }
    //destroy world deamon and start with boot script on next target bitnode
    ns.singularity.destroyW0r1dD43m0n(next_bitnode, SCRIPT.BOOT)
    //log
    log.error(ns, "DESTROY", "IF YOU SEE THIS MESSAGE, THEN DESTROY BITNODE WAS TRIGGERED BUT NOT SUCCESSFULL!",
        true)
    //failsafe: restart with boot script
    ns.spawn(SCRIPT.BOOT)
}
