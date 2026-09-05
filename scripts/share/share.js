//config
import { DISABLE_LOGGING } from "./config.js"


//constants
import { SERVER } from "scripts/constants/servers.js"
import { RAM } from "scripts/constants/ram.js"
import { SCRIPT } from "scripts/constants/scripts.js"


//functions
import * as log from "scripts/util/log.js"


/** @param {NS} ns */
export function share_exec(ns, ram_reserve = 0) {
    //disable logging
    log.disable(ns, DISABLE_LOGGING)
    //get home information
    const server_home = ns.getServer(SERVER.HOME)
    //get the available ram
    const ram_available = server_home.maxRam - server_home.ramUsed - ram_reserve
    //check how many times we can run the script
    let threads = Math.floor(ram_available / RAM.WORKER.SHARE)
    //reduce by 1 (for autoexec reset reasons)
    threads -= 1
    //debug
    log.info(ns, "Share", "Home has " + ram_available + " GB left, need " +
        RAM.WORKER.SHARE + " GB per threads, resulting into " + threads + " threads for sharing")
    //if there is a possibility to share
    if (threads > 0) {
        //share ram
        ns.exec(SCRIPT.WORKER.SHARE, SERVER.HOME, threads)
    }
}