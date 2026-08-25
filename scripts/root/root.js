//config
import { DISABLE_LOGGING } from "./config.js"


//constants
import { TOOLS } from "scripts/constants/tools.js"
import { FILE_EXTENSION } from "scripts/constants/files.js"
import { SERVER } from "scripts/constants/servers.js"
import { SCRIPT } from "scripts/constants/scripts.js"
import { HANDLE } from "scripts/constants/handles.js"
import { PORT } from "scripts/constants/ports.js"


//functions
import * as log from "scripts/util/log.js"


// Declaration
export class root_obj {
    constructor() {
        //maps of servers
        this.servers_ram = new Map()
        this.servers_money = new Map()
    }


    //init
    init(ns, handles) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
        //if we have singularity
        if (handles.hasOwnProperty(HANDLE.SINGULARITY)) {
            //if worker is not running
            if (!ns.isRunning(SCRIPT.WORKER.BACKDOOR)) {
                //start worker to backdoor servers
                ns.exec(SCRIPT.WORKER.BACKDOOR, SERVER.HOME)
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
            if (hostname == SERVER.HOME) {
                //next
                continue
            }
            //ignore cloud servers, but add to ram
            if (hostname.includes(SERVER.CLOUD)) {
                //only save ram 
                this.servers_ram.set(hostname, server.maxRam)
                //next
                continue
            }
            //check files for coding contracts
            this.check_files(ns, hostname)

            //set flag to check after rooting a server for backdoor purposes
            let flag_server_rooted = false
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
                if (!server.backdoorInstalled && handles.hasOwnProperty(HANDLE.SINGULARITY)) {
                    //communicate that a backdoor is needed on this hostname
                    ns.tryWritePort(PORT.BACKDOOR, hostname)
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


    //function that wil check the files of a server
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
                case FILE_EXTENSION.CODING_CONTRACT:
                    //communicate to coding contract
                    ns.tryWritePort(PORT.CODING_CONTRACT, {
                        "hostname": hostname,
                        "filename": file_name,
                        "origin": "root",
                    })
                    //stop
                    break

                case FILE_EXTENSION.TEXT:
                case FILE_EXTENSION.SCRIPT:
                case FILE_EXTENSION.LITERATURE:
                    break

                case FILE_EXTENSION.EXECUTABLE:
                case FILE_EXTENSION.CACHE:
                default:
                    log.error(ns, ns.pid, "Uncaught condition 'file_extension': '" + file_extension + "'")
            }
        }
    }    
}


//function that returns the number of hacking tools owned
export function get_number_of_hacking_tools_owned(ns) {
        //counter for hacking tools
        let hacking_tools_owned = 0
        //get the available executables on home
        let executables = ns.ls(SERVER.HOME, FILE_EXTENSION.EXECUTABLE)
        //for each tool
        for (const tool of TOOLS.HACKING.LIST) {
            //if the list is found
            if (executables.includes(tool)) {
                //up the counter
                hacking_tools_owned++
            }
        }
        //return the counter
        return hacking_tools_owned
    }


//function that starts scanning of normal servers
export function scan_servers(ns) {
    //list to fill
    let server_list = []
    //start scanning
    server_list = scan_server(ns, server_list, SERVER.HOME)
    //return the list
    return server_list
}


//function that scans on the server and adds it to the list. Then scanning deeper
export function scan_server(ns, server_list, hostname) {
    //scan for servers
    let servers_found = ns.scan(hostname)
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
