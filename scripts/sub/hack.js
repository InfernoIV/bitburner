import * as evaluate from 'scripts/sub/eval.js'
import * as root from 'scripts/sub/root.js'
import * as log from 'scripts/sub/log.js'



var hack_level_previous = -1
var hack_target = ""

//script paths
const script_weaken = "scripts/exec/weaken.js"
const script_grow = "scripts/exec/grow.js"
const script_hack = "scripts/exec/hack.js"
const script_hack_exec = "scripts/exec/hack_self.js"
//ram of the scripts
var ram_weaken = 0
var ram_grow = 0
var ram_hack = 0
//or make it generic?
const script_ram = 1.75 //1.75, 1.75, 1.70

var time_of_next_check = Date.now()
var cycle = 0


//enum to keep track of server status
const STATUS = {
    WEAKEN: "WEAKEN",
    GROW: "GROW",
    HACK: "HACK"
}


//function that initializes
/** @param {NS} ns */
export async function init(ns) {
    //set the time for check to now
    time_of_next_check = Date.now()
    //keep track of the cycle (debugging purposes)
    cycle = 0
    //reset target
    hack_target = ""
    //get the ram of the weaken script
    ram_weaken = await evaluate.exec(ns, "ns.getScriptRam('" + script_weaken + "', 'home')")
    //get the ram of the grow script 
    ram_grow = await evaluate.exec(ns, "ns.getScriptRam('" + script_grow + "', 'home')")
    //get the ram of the hack script
    ram_hack = await evaluate.exec(ns, "ns.getScriptRam('" + script_hack + "', 'home')")
}


//function that target hacks a single server
/** @param {NS} ns */
export async function hack_server(ns) {
    //if the timing has not yet passed
    if (Date.now() < time_of_next_check) {
        //stop
        return
    }
    //up the cycle
    cycle += 1
    //debug
    log.info(ns, "Hack", "Starting next hack_server cycle (" + cycle + ")")
    //safety timing
    const time_safety = 20 //ms
    //update the target, if needed (global variable)
    await find_target(ns)
    //check if we HAVE a target
    if (hack_target != "") {
        //get the executing servers
        var execute_servers = root.get_servers_ram() //await get_execute_servers(ns)
        //re-set the wait time, to be set later
        var time_wait = 0
        //check the status
        const status = await check_target(ns)        
        //depending on the status
        switch (status) {
            //if we need to weaken
            case STATUS.WEAKEN:
                //set the time to wait
                time_wait = await evaluate.exec(ns, "ns.getWeakenTime('" + hack_target + "')")
                //do stuff
                for (const [server, ram_available] of execute_servers) {
                    //get the number of threads we can run
                    const threads = Math.floor(ram_available / ram_weaken)
                    //if possible to run
                    if (threads > 0) {
                        //copy the script
                        if (!await evaluate.exec(ns, "ns.scp('" + script_weaken + "','" + server + "')")) {
                            //debug
                            log.warning(ns, "Hack", "error copying '" + script_weaken + "' to " + server)
                        }
                        //run the script
                        ns.exec(script_weaken, server, threads, hack_target)
                        //debug
                        log.info(ns, "Hack", "Started weaken on '" + server + "' (x" + threads + ")")
                    }
                }
                //debug
                log.info(ns, "Hack", "Started weaken for '" + hack_target + "'", true)
                //stop
                break

                //if we need to grow
            case STATUS.GROW:
                //set the time to wait
                time_wait = await evaluate.exec(ns, "ns.getGrowTime('" + hack_target + "')")
                ///do stuff
                for (const [server, ram_available] of execute_servers) {
                    //get the number of threads we can run
                    const threads = Math.floor(ram_available / ram_grow)
                    //if possible to run
                    if (threads > 0) {
                        //copy the script
                        if (!await evaluate.exec(ns, "ns.scp('" + script_grow + "','" + server + "')")) {
                            //debug
                            log.error(ns, "Hack", "error copying '" + script_grow + "' to " + server)
                        }
                        //run the script
                        ns.exec(script_grow, server, threads, hack_target)
                        //debug
                        log.info(ns, "Hack", "Started grow on '" + server + "' (x" + threads + ")")
                    }
                }
                //debug
                log.info(ns, "Hack", "Started grow for '" + hack_target + "'", true)
                //stop
                break

                //if we need to hack
            case STATUS.HACK:
                //get the timings
                const time_hack = await evaluate.exec(ns, "ns.getHackTime('" + hack_target + "')")
                const time_weaken = await evaluate.exec(ns, "ns.getWeakenTime('" + hack_target + "')")
                const time_grow = await evaluate.exec(ns, "ns.getGrowTime(('" + hack_target + "')")
                //set the time to wait
                time_wait = time_weaken + time_safety + time_safety
                //do stuff
                //TODO
                //debug
                log.info(ns, "Hack", "Started hack for '" + hack_target + "'", true)
                //stop
                break
                //any other scenario
            default:
                //indicate issue
                log.error(ns, "Hack", "Uncaught case of 'status': '" + status + "'")
        }
        //update the check time
        time_of_next_check = Date.now() + time_wait + time_safety
        //create time string
        const time = time_of_next_check.getUTCHours() + ":" + time_of_next_check.getUTCMinutes() + ":" + time_of_next_check.getUTCSeconds()
        //debug
        log.info(ns, "Hack", "Next cycle (" + (cycle + 1) + ") @ " + time, true)
    }
}


//function that finds a target
export async function find_target(ns) {
    //get current hacking level
    var hacking_level_current = await evaluate.exec(ns, "ns.getHackingLevel()")
    //if change in situation
    if (hacking_level_current > hack_level_previous) {
        //update hack level
        hack_level_previous = hacking_level_current
        //clear hack target
        hack_target = ""
        //set a value to track the best server
        var best_value = -1
        //get list of servers with money
        const servers_target = root.get_servers_money()
        //for each server we can hack
        for (const [server, money_max] of servers_target) {
            //or use hackAnalyze(host)? -> requires mock server (and thus formula's)
            //get the time to hack            
            const time = await evaluate.exec(ns, "ns.getHackTime('" + server + "')")
            //get the chance for the hack
            const chance = await evaluate.exec(ns, "ns.hackAnalyzeChance('" + server + "')")
            //calculate the new value
            const new_value = money_max / time * chance
            //if better than what we have            
            if (new_value > best_value) {
                //update the value
                best_value = new_value
                //update the server
                hack_target = server
            }
        }
        //debug
        log.info(ns, "Hack", hack_level_previous + " -> found hack target: '" + hack_target + "'")
    }
}


//function that checks the status of the target
export async function check_target(ns) {
    //get server data
    const server = await evaluate.exec(ns, "ns.getServer('" + hack_target + "')")
    //debug
    log.info(ns, "Hack", "hack_target: '" + hack_target + "', security: " + server.hackDifficulty + "/" + server
        .minDifficulty + ", money: " + server.moneyAvailable + "/" + server.moneyMax + "(" + Math.round(server
            .moneyAvailable / server.moneyMax) + "%)", true)
    //if security is not min
    if (server.hackDifficulty > server.minDifficulty) {
        //lower security
        return STATUS.WEAKEN
        //if money is not max
    } else if (server.moneyAvailable < server.moneyMax) {
        //grow money
        return STATUS.GROW
    } else {
        //debug
        log.info(ns, "Hack", "hack target '" + hack_target + "' is prepared for hacking", true)
    }
    return STATUS.HACK
}


//function to provides a list of hacking scripts
export async function copy_hack_scripts(ns, hostname) {
    return [script_weaken , script_grow, script_hack, script_hack_exec]
}
/*
//function that gets the servers that can execute scripts
export async function get_execute_servers(ns) {
    //just blindly return the list?
    return root.get_servers_ram()
    
    
    //create a map to return
    var execute_servers = new Map()
    //get the list of server
    const ram_servers = root.get_servers_ram()
    //config
    const ignore_home = true
    //for each server we have root access
    for (const server of servers_rooted) {
        //if the server is home and we want to ignore it (due to other scripts like EVAL
        if (server == "home" && ignore_home) {
            //skip
            continue
        }
        //get the max ram
        const ram_max = await evaluate.exec(ns, "ns.getServerMaxRam('" + server + "')")
        //get the used ram
        const ram_used = await evaluate.exec(ns, "ns.getServerUsedRam('" + server + "')")
        //get the available ram
        const ram_available = ram_max - ram_used
        //if we have available ram (at least the minumum for the script)
        if (ram_available > script_ram) {
            //add to the map
            execute_servers.set(server, ram_available)
        }
    }
    //return the map
    return execute_servers
    
}
*/
