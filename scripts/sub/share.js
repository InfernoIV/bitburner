import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


/** @param {NS} ns */
export async function share_exec(ns) {
    //the the ram available
    const ram_server_max = await parseFloat(await evaluate.exec(ns, "ns.getServerMaxRam('" + CONSTANTS.SERVER.HOME +
        "')"))
    //get the available ram
    const ram_available = ram_server_max - CONSTANTS.RAM.MAIN.ORCHESTRATOR - CONSTANTS.RAM.EVAL_ORCHESTRATOR -
        CONSTANTS.RAM.MAIN.EVAL
    //check how many times we can run the script
    const threads = Math.floor(ram_available / CONSTANTS.RAM.SHARE)
    //debug
    log.info(ns, "Share", "Home has " + ram_available + ", need " +
        CONSTANTS.RAM.SHARE + " => " + threads + " threads for sharing", true)
    //if there is a possibility to share
    if (threads > 0) {
        //share ram
        ns.exec(CONSTANTS.SCRIPT.SHARE_WORKER, CONSTANTS.SERVER.HOME, threads)
    }
}