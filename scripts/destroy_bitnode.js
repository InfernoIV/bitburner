import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

/*
singularity.destroyW0r1dD43m0n   25
spawn       2
base        1.6
*/
/** @param {NS} ns */
export async function main(ns) {
    //get the next bitnode
    const next_bitnode = ns.args[0]
    //destroy world deamon and start with boot script on next target bitnode
    ns.singularity.destroyW0r1dD43m0n(next_bitnode, CONSTANTS.SCRIPT.BOOT) 
    //log
    log.error(ns, "DESTROY", "IF YOU SEE THIS MESSAGE, THEN DESTROY BITNODE WAS TRIGGERED BUT NOT SUCCESSFULL!", true)
    //failsafe: restart with boot script
    ns.spawn(CONSTANTS.SCRIPT.BOOT)

}