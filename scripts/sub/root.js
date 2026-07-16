import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class root_obj {
    constructor() {
    }


    async init(ns) {
        //maps of servers
        this.servers_ram = new Map()
        this.servers_money = new Map()
        this.servers_found = new Map()
        //get the servers    
        var scan_results = await this.scan_servers(ns)

        //debug
        //log.info(ns, "Root", "Scan results: '" + scan_results + "'", true)
        
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
            const server = await evaluate.exec(ns, "ns.getServer('" + hostname + "')")
            //debug
            //log.info(ns, "Root", "Found '" + hostname + "' server: " + JSON.stringify(server))
            //add to the map (value is required hacking tools)
            this.servers_found.set(hostname, server)
            //log.info(ns, "Root", "Found server '" + hostname + "' with '" + JSON.stringify(server) + "'")
        }
        //debug
        log.info(ns, "Root", "Init fomplete, found '" + this.servers_found.size + "' servers", true)
    }


    //function that provides a list of servers
    async scan_servers(ns) {
        //create a list of servers
        var servers_found = [CONSTANTS.SERVER.HOME]
        //start scanning from home
        await this.scan_server(ns, servers_found, CONSTANTS.SERVER.HOME)
        //return
        return servers_found
    }


    //function that scans for servers
    async scan_server(ns, servers_found, server_name) {
        //get neighbours
        const neighbours = await evaluate.exec(ns, "ns.scan('" + server_name + "')")
        //for each neighbour found
        for (const neighbour of neighbours) {
            //if server is not yet found
            if (!servers_found.includes(neighbour)) {
                //add server to list
                servers_found.push(neighbour)
                //start scanning from this server
                await this.scan_server(ns, servers_found, neighbour)
            }
        }
    }

    /** @param {NS} ns */
    async root_servers(ns) {
        //copy of list of servers found
        const servers = this.servers_found
        //get number of hacking tools
        const hacking_tools_owned = await this.get_number_of_hacking_tools_owned(ns)
        //get hacking level
        const level_hacking = await evaluate.exec(ns, "ns.getHackingLevel()")
        //for each server found
        for (const [hostname, server] of servers) {
            //log.info(ns, "Root", "Checking '" + hostname + "': '" + server.requiredHackingSkill + "', '" + server.numOpenPortsRequired + "'")
            //check if we can hack it (according to hacking level)
            if (level_hacking >= server.requiredHackingSkill && hacking_tools_owned >= server.numOpenPortsRequired) {
                //flag to check to remove or not
                var flag_rooted = false
                //flag to check if backdoored
                //var flag_backdoored = false
                //if not yet rooted
                if (!server.hasAdminRights) {
                    //check on what actions to perform
                    switch (server.numOpenPortsRequired) {
                        case 5:
                            await evaluate.exec(ns, "ns.sqlinject('" + hostname + "')") //5th toool: hacking 750
                        case 4:
                            await evaluate.exec(ns, "ns.httpworm('" + hostname + "')") //4th toool: hacking 500
                        case 3:
                            await evaluate.exec(ns, "ns.relaysmtp('" + hostname + "')") //3rd tool: hacking 250
                        case 2:
                            await evaluate.exec(ns, "ns.ftpcrack('" + hostname + "')") //2nd tool: hacking 100
                        case 1:
                            await evaluate.exec(ns, "ns.brutessh('" + hostname + "')") //1st tool: hacking 50
                        case 0:
                            break //no action needed
                        default:
                            log.error(ns, "Root", "Uncaught condition on 'required_hacking_tools': '" +
                                JSON.stringify(required_hacking_tools) + "'");
                            break
                    }
                    //nuke to get root access
                    if (await evaluate.exec(ns, "ns.nuke('" + hostname + "')")) {
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
                    //copy scripts to server
                    for (const script of CONSTANTS.SCRIPT.HACK.TO_COPY) {
                        //copy script to server
                        await evaluate.exec(ns, "ns.scp('" + script + "', '" + hostname + "')")
                    }

                    //if backdoor not installed
                    if (false) { //!server.backdoorInstalled) {
                        //variable to save the target neighbour to
                        var target_neighbour = ""
                        //determine the neighbour of the server
                        var neighbours = await evaluate.exec(ns, "ns.scan('" + hostname + "')")
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
                    //log.info(ns, "Root", "Removed '" + hostname + "' from list of servers to root")
                    //}
                }
            }
        }
    }

    async get_number_of_hacking_tools_owned(ns) {
        //counter for hacking tools
        var hacking_tools_owned = 0
        //get the available executables on home
        var executables = await evaluate.exec(ns, "ns.ls('" + CONSTANTS.SERVER.HOME + "', '" + CONSTANTS.FILE_EXTENSION.EXECUTABLE + "')")
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

