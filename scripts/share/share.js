import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"

import * as log from "scripts/util/log.js"


/** @param {NS} ns */
export function share_exec(ns, ram_reserve = 0) {
    //disable logging
    log.disable(ns, CONFIG.DISABLE_LOGGING)
    //get home information
    const server_home = ns.getServer(CONSTANTS.SERVER.HOME)
    //get the available ram
    const ram_available = server_home.maxRam - server_home.ramUsed - ram_reserve
    //check how many times we can run the script
    const threads = Math.floor(ram_available / CONSTANTS.RAM.WORKER.SHARE)
    //debug
    log.info(ns, "Share", "Home has " + ram_available + " GB left, need " +
        CONSTANTS.RAM.WORKER.SHARE + " GB per threads, resulting into " + threads + " threads for sharing")
    //if there is a possibility to share
    if (threads > 0) {
        //share ram
        ns.exec(CONSTANTS.SCRIPT.WORKER.SHARE, CONSTANTS.SERVER.HOME, threads)
    }
}