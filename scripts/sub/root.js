import * as evaluate from 'scripts/sub/eval.js'
import * as log from 'scripts/sub/log.js'
import * as singularity from 'scripts/sub/singularity.js'
import * as hack from 'scripts/sub/hack.js'

//hostname of home server
const server_home = "home"

//map of servers found. Map object due to easy lookup and deletion
var servers_found
//list of servers that are rooted (to prevent rooting again) -> or just remove from the servers_found list?
var servers_rooted
//map of servers with ram (key: hostname, value: ram)
var servers_ram
//map of servers with money (key: hostname, value: server object)
var servers_money


//init function
export async function init(ns) {
    //empty the maps
    servers_ram = new Map()
    servers_money = new Map()
    servers_found = new Map()

    //get the servers    
    var scan_results = await scan_servers(ns)
    //for each server
    for (const hostname of scan_results) {
        //if home server
        if (hostname == server_home) {
            //do nothing
            continue
        }
        //kill all scripts on that server
        ns.killall(hostname)
        //get number of ports to open
        const server = await evaluate.exec(ns, "ns.getServer('" + hostname + "')")
        //add to the map (value is required hacking tools)
        servers_found.set(hostname, number_of_tools_required)
    }
}


/** @param {NS} ns */
export async function root_servers(ns) {
    //copy of list of servers found
    const servers = servers_found
    //get number of hacking tools
    const hacking_tools_owned = await get_number_of_hacking_tools_owned(ns)
    //get hacking level
    const level_hacking = await evaluate.exec(ns, "ns.getHackingLevel()")
    //for each server found
    for (const [hostname, server] of servers) {
        //check if we can hack it (according to hacking level)
        if (level_hacking >= server.requiredHackingSkill && hacking_tools_owned >= required_hacking_tools) {
            //flag to check to remove or not
            var flag_finished = false
            //if not yet rooted or backdoored
            if (!server.hasAdminRights) {
                //check on what actions to perform
                switch (required_hacking_tools) {
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
                            required_hacking_tools + "'");
                        break
                }
                //nuke to get root access
                if (await evaluate.exec(ns, "ns.nuke('" + hostname + "')")) {
                    //log success
                    log.success(ns, "Root", "Rooted '" + hostname + "'")
                    //copy scripts
                    for (const script in hack_scripts) {

                    }
                }
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
                    var backdoored = await singularity.backdoor_server(ns, target_neighbour, hostname)
                    //if successfully backdoored
                    if (backdoored) {
                        //signal this server can be removed
                        flag_finished = true
                        //log success
                    log.success(ns, "Root", "Backdoored '" + hostname + "'")
                    }
                }
            }

            //check if there is money
            if (server.moneyMax > 0) {
                //only save money
                servers_money.set(hostname, server.moneyMax)
            }
            //check ram
            if (server.maxRam > 0) {
                //only save ram 
                servers_ram.set(hostname, server.maxRam)
            }
            //if backdoored
            //if (flag_finished) {
            //remove from original list to prevent future checks
            servers_found.delete(hostname)
            //}
        }
    }
}


//function that provides a list of servers
async function scan_servers(ns) {
    //create a list of servers
    var servers_found = [server_home]
    //start scanning from home
    await scan_server(ns, servers_found, server_home)
    //return the list
    return servers_found
}


//function that scans for servers
async function scan_server(ns, servers_found, server_name) {
    //get neighbours
    const neighbours = await evaluate.exec(ns, "ns.scan('" + server_name + "')")
    //for each neighbour found
    for (const neighbour of neighbours) {
        //if server is not yet found
        if (!servers_found.includes(neighbour)) {
            //add server to list
            servers_found.push(neighbour)
            //start scanning from this server
            await scan_server(ns, servers_found, neighbour)
        }
    }
}


//function that returns servers with money
export function get_servers_money() {
    //return the map of servers with money (and other properties)
    return servers_money
}


//function that returns servers with money
export function get_servers_ram(ignore_home = false) {
    //if we want to ignore home
    if (ignore_home) {
        servers = servers_ram
        server.delete(server_home)
        return servers
    }
    //return the map of servers with ram
    return servers_ram
}

async function get_number_of_hacking_tools_owned(ns) {
    //counter for hacking tools
    var hacking_tools_owned = 0
    //dict of tools (key) and value (cost in dark web & hacking level for creating ourselves) 
    const hacking_tools = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"]
    //get the available executables on home
    var executables = await evaluate.exec(ns, "ns.ls('home', '.exe')")
    //for each tool
    for (const tool of hacking_tools) {
        if (executables.includes(tool)) {
            //up the counter
            hacking_tools_owned++
        }
    }
    return hacking_tools_owned
}