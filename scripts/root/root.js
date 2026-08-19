import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"

import * as log from "scripts/util/log.js"


// Declaration
export class root_obj {
    constructor() {
        this.available = true
        this.singularity_available = false
        //maps of servers
        this.servers_ram = new Map()
        this.servers_money = new Map()
    }


    init(ns, handles) {
        //disable logging
        log.disable(ns, CONFIG.DISABLE_LOGGING)
        //if we have singularity
        if (handles.hasOwnProperty(CONSTANTS.HANDLE.SINGULARITY)) {
            //if worker is not running
            if (!ns.isRunning(CONSTANTS.SCRIPT.WORKER.BACKDOOR)) {
                //start worker to backdoor servers
                ns.exec(CONSTANTS.SCRIPT.WORKER.BACKDOOR, CONSTANTS.SERVER.HOME)
            }
        }
        //debug
        log.info(ns, "Root", "Init complete")
    }


    /** @param {NS} ns */
    async manage(ns, handles) {
        //copy of list of servers found
        const servers = scan_servers(ns)
        //get number of hacking tools
        const hacking_tools_owned = get_number_of_hacking_tools_owned(ns)
        //get hacking level
        const level_hacking = ns.getPlayer().skills.hacking
        //for each server found
        for (const hostname of servers) {
            //get server information
            const server = ns.getServer(hostname)
            //ignore home server
            if (hostname == CONSTANTS.SERVER.HOME) {
                //next
                continue
            }
            //ignore cloud servers, but add to ram
            if (hostname.includes(CONSTANTS.HOSTNAME_CLOUD)) {
                //only save ram 
                this.servers_ram.set(hostname, server.maxRam)
                //next
                continue
            }
            //check files for coding contracts
            this.check_files(ns, hostname)

            //set flag to check after rooting a server for backdoor purposes
            var flag_server_rooted = false
            //if we don't have rights, but we have the hacking level and the tools
            if (!server.hasAdminRights && level_hacking >= server.requiredHackingSkill && hacking_tools_owned >=
                server.numOpenPortsRequired) {
                //check on what actions to perform
                switch (server.numOpenPortsRequired) {
                    case 5:
                        ns.sqlinject(hostname) //5th toool: hacking 750
                    case 4:
                        ns.httpworm(hostname) //4th toool: hacking 500
                    case 3:
                        ns.relaysmtp(hostname) //3rd tool: hacking 250
                    case 2:
                        ns.ftpcrack(hostname) //2nd tool: hacking 100
                    case 1:
                        ns.brutessh(hostname) //1st tool: hacking 50
                    case 0:
                        break //no action needed
                    default:
                        log.error(ns, "Root", "Uncaught condition on 'required_hacking_tools': '" +
                            JSON.stringify(server.required_hacking_tools) + "'");
                        break
                }
                //nuke to get root access
                if (ns.nuke(hostname)) {
                    //set flag
                    flag_server_rooted = true
                    //log success
                    log.success(ns, "Root", "Rooted '" + hostname + "'")
                }
            }
            //if it was already rooted or we have rooted it just now
            if (server.hasAdminRights || flag_server_rooted) {
                //check if we need to backdoor and we have singularity to backdoor
                if (!server.backdoorInstalled && handles.hasOwnProperty(CONSTANTS.HANDLE.SINGULARITY)) {
                    //communicate that a backdoor is needed on this hostname
                    ns.tryWritePort(CONSTANTS.PORT.BACKDOOR, hostname)
                }
                //check if there is money
                if (server.moneyMax > 0 || server.moneyMax != "0") {
                    //only save money
                    this.servers_money.set(hostname, server.moneyMax)
                }
                //check ram
                if (server.maxRam > 0) {
                    //only save ram 
                    this.servers_ram.set(hostname, server.maxRam)
                }
            }
        }
    }

    check_files(ns, hostname) {
        //get files on current server
        const files = ns.ls(hostname)
        //for each cache file found
        for (const file_name of files) {
            //get the extention
            const file_extension = "." + file_name.split('.').pop()
            //depending on the extention
            switch (file_extension) {
                //coding contract
                case CONSTANTS.FILE_EXTENSION.CODING_CONTRACT:
                    //communicate to coding contract
                    ns.tryWritePort(CONSTANTS.PORT.CODING_CONTRACT, {
                        "hostname": hostname,
                        "filename": file_name,
                        "origin": "root",
                    })
                    //stop
                    break

                case CONSTANTS.FILE_EXTENSION.TEXT:
                case CONSTANTS.FILE_EXTENSION.SCRIPT:
                case CONSTANTS.FILE_EXTENSION.LITERATURE:
                    break

                case CONSTANTS.FILE_EXTENSION.EXECUTABLE:
                case CONSTANTS.FILE_EXTENSION.CACHE:
                default:
                    log.error(ns, ns.pid, "Uncaught condition 'file_extension': '" + file_extension + "'")
            }
        }
    }    
}


export function get_number_of_hacking_tools_owned(ns) {
        //counter for hacking tools
        var hacking_tools_owned = 0
        //get the available executables on home
        var executables = ns.ls(CONSTANTS.SERVER.HOME, CONSTANTS.FILE_EXTENSION.EXECUTABLE)
        //for each tool
        for (const tool of CONSTANTS.TOOLS.HACKING.LIST) {
            //if the list is found
            if (executables.includes(tool)) {
                //up the counter
                hacking_tools_owned++
            }
        }
        //return the counter
        return hacking_tools_owned
    }


export function scan_servers(ns) {
    //list to fill
    var server_list = []
    //start scanning
    server_list = scan_server(ns, server_list, CONSTANTS.SERVER.HOME)
    //return the list
    return server_list
}


export function scan_server(ns, server_list, hostname) {
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
