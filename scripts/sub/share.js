import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


/** @param {NS} ns */
export function share_exec(ns) {
    //get home information
    const server_home = ns.getServer(CONSTANTS.SERVER.HOME)
    //the the ram available
    //const ram_server_max = parseFloat(server_home.maxRam)
    //get the available ram
    const ram_available = server_home.maxRam - server_home.ramUsed  /*ram_server_max - CONSTANTS.RAM.MAIN.ORCHESTRATOR - CONSTANTS.RAM.EVAL_ORCHESTRATOR -
        CONSTANTS.RAM.MAIN.EVAL*/
    //check how many times we can run the script
    const threads = Math.floor(ram_available / CONSTANTS.RAM.WORKER.SHARE)
    //debug
    log.info(ns, "Share", "Home has " + ram_available + ", need " +
        CONSTANTS.RAM.WORKER.SHARE + " => " + threads + " threads for sharing", true)
    //if there is a possibility to share
    if (threads > 0) {
        //share ram
        ns.exec(CONSTANTS.SCRIPT.WORKER.SHARE, CONSTANTS.SERVER.HOME, threads)
    }
}