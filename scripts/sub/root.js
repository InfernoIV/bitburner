import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class root_obj {
    constructor() {}


    async init(ns) {
        //maps of servers
        this.servers_ram = new Map()
        this.servers_money = new Map()
        this.servers_found = new Map()
        //get the servers    
        var scan_results = this.scan_servers(ns)
        //for each server
        for (const hostname of scan_results) {
            //if home server
            if (hostname == CONSTANTS.SERVER.HOME) {
                //do nothing
                continue
            }
            //kill all scripts on that server
            ns.killall(hostname)
            //get number of ports to open
            const server = ns.getServer(hostname)
            //add to the map (value is required hacking tools)
            this.servers_found.set(hostname, server)
            //log.info(ns, "Root", "Found server '" + hostname + "' with '" + JSON.stringify(server) + "'")
        }
        //debug
        log.info(ns, "Root", "Init fomplete, found '" + this.servers_found.size + "' servers", true)
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
        //debug
        log.info(ns, "Root", "Found neighbours: '" + neighbours + "'")
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
    async root_servers(ns) {
        //copy of list of servers found
        const servers = this.servers_found
        //get number of hacking tools
        const hacking_tools_owned = this.get_number_of_hacking_tools_owned(ns)
        //get hacking level
        const level_hacking = ns.getHackingLevel()
        //for each server found
        for (const [hostname, server] of servers) {
            //log.info(ns, "Root", "Checking '" + hostname + "': '" + server.requiredHackingSkill + "', '" + server.numOpenPortsRequired + "'")
            //check if we can hack it (according to hacking level)
            if (level_hacking >= server.requiredHackingSkill && hacking_tools_owned >= server
                .numOpenPortsRequired) {
                //flag to check to remove or not
                var flag_rooted = false
                //flag to check if backdoored
                //var flag_backdoored = false
                //if not yet rooted
                if (!server.hasAdminRights) {
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
                                JSON.stringify(required_hacking_tools) + "'");
                            break
                    }
                    //nuke to get root access
                    if (ns.nuke(hostname)) {
                        //set flag
                        flag_rooted = true
                        //log success
                        log.success(ns, "Root", "Rooted '" + hostname + "'")
                    }
                } else {
                    //set flag
                    flag_rooted = true
                    //log success
                    log.success(ns, "Root", "Already rooted '" + hostname + "'")
                }
                //if rooted
                if (flag_rooted) {
                    ns.scp(CONSTANTS.SCRIPT.HACK.TO_COPY, hostname)
                    //if backdoor not installed
                    if (false) { //!server.backdoorInstalled) {
                        //variable to save the target neighbour to
                        var target_neighbour = ""
                        //determine the neighbour of the server
                        var neighbours = ns.scan(hostname)
                        //for each neighbour found
                        for (const neighbour in neighbours) {
                            //if not in the todo list (and therefore rooted)
                            if (!servers.keys().includes(neighbour)) {
                                //set the target neighbour
                                target_neighbour = neighbour
                                //stop looking
                                break
                            }
                        }
                        //if a target neighbout is found
                        if (target_neighbour != "") {
                            //backdoor server
                            //var backdoored = await singularity.backdoor_server(ns, target_neighbour, hostname)
                            //if successfully backdoored
                            if (true) { //backdoored) {
                                //signal this server can be removed
                                flag_finished = true
                                //log success
                                log.success(ns, "Root", "Backdoored '" + hostname + "'")
                            }
                        }
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
                    //if backdoored
                    //if (flag_finished) {
                    //remove from original list to prevent future checks
                    this.servers_found.delete(hostname)
                    //}
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
}