import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


export function main(ns) {
    //get servers
    const servers_found = scan_servers(ns)
    //for each server
    for (const server of servers_found) {
        //kill the scripts
        ns.killall(server, (server == CONSTANTS.SERVER.HOME))
    }
    //TODO: DARKNET SCRIPTS
    //HOW TO REACH ALL DARKNET SERVER OR DARKNET SCRIPTS RUNNING?

    //keep track of ram
    const ram_in_use = CONSTANTS.RAM.MAIN + CONSTANTS.RAM.ROOT + CONSTANTS.RAM.CLOUD + CONSTANTS.RAM.HACK + CONSTANTS
        .RAM.DARKNET + CONSTANTS.RAM.GO
    //boot main
    ns.exec(CONSTANTS.SCRIPT.JUMP, CONSTANTS.SERVER.HOME, 1,
        CONSTANTS.SCRIPT.MAIN, ram_in_use
    )
}


function scan_servers(ns) {
    //list to fill
    var server_list = []
    //start scanning
    server_list = scan_server(ns, server_list, CONSTANTS.SERVER.HOME)
    //return the list
    return server_list
}


function scan_server(ns, server_list, hostname) {
    //scan for servers
    var servers_found = ns.scan(hostname)
    //for each server found
    for (const server of servers_found) {
        //if not in the list
        if (!server_list.includes(server)) {
            //add to the list
            server_list.push(server)
            //scan deeper
            server_list = scan_server(ns, server_list, server)
        }
    }
    //return the list
    return server_list
}