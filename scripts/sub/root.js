import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


// Declaration
export class root_obj {
    constructor() {
        this.available = true
        this.singularity_available = false
        //maps of servers
        this.servers_ram = new Map()
        this.servers_money = new Map()
    }


    init(ns) {
        //disable logging
        ns.disableLog("brutessh")
        ns.disableLog("nuke")
        ns.disableLog("relaysmtp")
        ns.disableLog("ftpcrack")
        ns.disableLog("scan")
        //debug
        log.info(ns, "Root", "Init complete", true)
    }


    //function that provides a list of servers
    scan_servers(ns) {
        //create a list of servers
        var servers_found = [CONSTANTS.SERVER.HOME]
        //start scanning from home
        this.scan_server(ns, servers_found, CONSTANTS.SERVER.HOME)
        //return
        return servers_found
    }


    //function that scans for servers
    scan_server(ns, servers_found, server_name) {
        //get neighbours
        const neighbours = ns.scan(server_name)
        //for each neighbour found
        for (const neighbour of neighbours) {
            //if server is not yet found
            if (!servers_found.includes(neighbour)) {
                //add server to list
                servers_found.push(neighbour)
                //start scanning from this server
                this.scan_server(ns, servers_found, neighbour)
            }
        }
    }


    /** @param {NS} ns */
    async manage(ns) {
        //copy of list of servers found
        const servers = this.scan_servers(ns)
        //get number of hacking tools
        const hacking_tools_owned = this.get_number_of_hacking_tools_owned(ns)
        //get hacking level
        const level_hacking = ns.getPlayer().skills.hacking
        //for each server found
        for (const server of servers) {
            //ignore home server
            if (server.hostname == CONSTANTS.SERVER.HOME) {
                //next
                continue
            }
            //ignore cloud servers, but add to ram
            if (server.hostname.includes("cloud")) {
                //only save ram 
                this.servers_ram.set(server.hostname, server.maxRam)
                //next
                continue
            }
            //set flag to check after rooting a server for backdoor purposes
            var flag_server_rooted = false
            //if we don't have rights, but we have the hacking level and the tools
            if (!server.hasAdminRights && level_hacking >= server.requiredHackingSkill && hacking_tools_owned >=
                server.numOpenPortsRequired) {
                //check on what actions to perform
                switch (server.numOpenPortsRequired) {
                    case 5:
                        ns.sqlinject(server.hostname) //5th toool: hacking 750
                    case 4:
                        ns.httpworm(server.hostname) //4th toool: hacking 500
                    case 3:
                        ns.relaysmtp(server.hostname) //3rd tool: hacking 250
                    case 2:
                        ns.ftpcrack(server.hostname) //2nd tool: hacking 100
                    case 1:
                        ns.brutessh(server.hostname) //1st tool: hacking 50
                    case 0:
                        break //no action needed
                    default:
                        log.error(ns, "Root", "Uncaught condition on 'required_hacking_tools': '" +
                            JSON.stringify(server.required_hacking_tools) + "'");
                        break
                }
                //nuke to get root access
                if (ns.nuke(server.hostname)) {
                    //set flag
                    flag_server_rooted = true
                    //log success
                    log.success(ns, "Root", "Rooted '" + server.hostname + "'")
                }
            }
            //if it was already rooted or we have rooted it just now
            if (server.hasAdminRights || flag_server_rooted) {
                //check if we need to backdoor and we have singularity to backdoor
                if (!server.backdoorInstalled && this.singularity_available) {
                    //backdoor the server
                    await this.backdoor_server(ns, server.hostname)
                }
                //check if there is money
                if (server.moneyMax > 0 || server.moneyMax != "0") {
                    //only save money
                    this.servers_money.set(server.hostname, server.moneyMax)
                }
                //check ram
                if (server.maxRam > 0) {
                    //only save ram 
                    this.servers_ram.set(server.hostname, server.maxRam)
                }
            }
        }
    }


    get_number_of_hacking_tools_owned(ns) {
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


    async backdoor_server(ns, server) {
        //create a list to hold the route
        let route = []
        //create a variable to save current server, and set it to current hostname
        let step = server
        //while not found home
        while (step != CONSTANTS.SERVER.HOME) {
            //save the first scan result
            let nextStep = ns.scan(step)[0]
            //add current to the start of the list
            route.unshift(step)
            //update target for next scan
            step = nextStep
        }

        //for every jump of the route    
        for (let jump of route) {
            //connect to the step
            ns.singularity.connect(jump)
        }

        //try-catch to ensure script not crashing
        try {
            //install backdoor
            await ns.singularity.installBackdoor()
            //log information
            log.success(ns, "Root", "Backdoored server '" + server + "'")
            //catch error
        } catch (err) {
            //log error
            log.error(ns, "Root", "Failed to backdoor server '" + server + "': " + err, true)
        }
        //connect to home
        ns.singularity.connect(CONSTANTS.SERVER.HOME)
    }
}