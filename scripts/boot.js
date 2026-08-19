import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/util/log.js"
import {scan_servers, scan_server} from "scripts/root/root.js"


export async function main(ns) {
    //wait a little bit
    await ns.sleep(CONSTANTS.TIME.WAIT)
    //get servers
    const servers_found = scan_servers(ns)
    //for each server
    for (const server of servers_found) {
        //kill the scripts
        ns.killall(server, (server == CONSTANTS.SERVER.HOME))
    }
    //TODO: DARKNET SCRIPTS
    //HOW TO REACH ALL DARKNET SERVER OR DARKNET SCRIPTS RUNNING?

    //boot main
    ns.spawn(CONSTANTS.SCRIPT.MAIN, {threads: 1, spawnDelay: 0, ramOverride: CONSTANTS.RAM.MAIN})
}
