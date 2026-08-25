//config


//constants
import { SERVER } from "scripts/constants/servers.js"
import { SCRIPT } from "scripts/constants/scripts.js"
import { RAM } from "scripts/constants/ram.js"


//functions
import { scan_servers, scan_server } from "scripts/root/root.js"


//main
export async function main(ns) {
    //get servers
    const servers_found = scan_servers(ns)
    //for each server
    for (const server of servers_found) {
        //kill the scripts
        ns.killall(server, (server == SERVER.HOME))
    }
    //TODO: DARKNET SCRIPTS
    //HOW TO REACH ALL DARKNET SERVER OR DARKNET SCRIPTS RUNNING?
    //manipulate UI to get list of all servers?

    //boot main
    ns.spawn(SCRIPT.MAIN, {
        threads: 1,
        spawnDelay: 0,
        ramOverride: RAM.MAIN
    })
}