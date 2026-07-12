import * as evaluate from 'scripts/sub/eval.js'

const script_hack_exec = "scripts/exec/hack_self.js"

var print_once = true

var hack_level_previous = -1
var hack_target = ""

//script paths
const script_weaken = "scripts/exec/weaken.js"
const script_grow = "scripts/exec/grow.js"
const script_hack = "scripts/exec/hack.js"
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


export async function init(ns) {
    //debug
    print_once = true
    time_of_next_check = Date.now()
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


/** @param {NS} ns */
export async function exec(ns, servers_rooted) {
    //get ram script
    var ram_script = parseFloat(await evaluate.exec(ns, "ns.getScriptRam('" + script_hack_exec + "')"))
    //for each server we have root access
    for (const server of servers_rooted) {
        //if home server
        if (server == "home") {
            //skip
            continue
        }
        const ram_server_max = parseFloat(await evaluate.exec(ns, "ns.getServerMaxRam('" + server + "')"))
        const ram_server_used = parseFloat(await evaluate.exec(ns, "ns.getServerUsedRam('" + server + "')"))
        //get the available ram
        const ram_available = ram_server_max - ram_server_used
        //check how many times we can run the script
        const threads = Math.floor(ram_available / ram_script)
        //debug
        if (print_once) {
            ns.print(server + " has " + ram_server_used + "/" + ram_server_max + " in use, " + ram_available +
                " available, for " + threads + " threads")
        }

        //if possible to run
        if (threads > 0) {
            //copy the script
            if (!await evaluate.exec(ns, "ns.scp('" + script_hack_exec + "','" + server + "')")) {
                //debug
                ns.tprint("error copying '" + script_hack_exec + "' to " + server)
            }
            //run the script
            ns.exec(script_hack_exec, server, threads)
            //debug
            //ns.tprint("Started hack on '" + server + "' (x" + threads + ")")
        }
    }
    print_once = false
}


//function that target hacks a single server
export async function hack_server(ns, servers_rooted) {
    //check if we're allow to check (e.g. timings have passed)
    if (Date.now() > time_of_next_check) {
        cycle += 1
        //debug
        ns.tprint("Starting next hack_server cycle (" + cycle + ")")
        //safety timing
        const time_safety = 20 //ms
        //update the target, if needed
        await find_target(ns, servers_rooted)
        //check if we HAVE a target
        if (hack_target != "") {
            //check the status
            const status = await check_target(ns)
            //get the executing servers
            var execute_servers = await get_execute_servers(ns, servers_rooted)
            //re-set the wait time, to be set later
            var time_wait = 0
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
                                ns.tprint("error copying '" + script_weaken + "' to " + server)
                            }
                            //run the script
                            ns.exec(script_weaken, server, threads, hack_target)
                            //debug
                            ns.tprint("Started weaken on '" + server + "' (x" + threads + ")")
                        }
                    }
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
                                ns.tprint("error copying '" + script_grow + "' to " + server)
                            }
                            //run the script
                            ns.exec(script_grow, server, threads, hack_target)
                            //debug
                            ns.tprint("Started grow on '" + server + "' (x" + threads + ")")
                        }
                    }
                    break
                //if we need to hack
                case STATUS.HACK:
                    //get the timings
                    var time_hack = await evaluate.exec(ns, "ns.getHackTime('" + hack_target + "')")
                    var time_weaken = await evaluate.exec(ns, "ns.getWeakenTime('" + hack_target + "')")
                    var time_grow = await evaluate.exec(ns, "ns.getGrowTime(('" + hack_target + "')")
                    //set the time to wait
                    time_wait = time_weaken
                    //do stuff

                    //stop
                    break
                //any other scenario
                default:
                    //indicate issue
                    ns.tprint("hack_target: Invalid status!")
            }
            //update the check time
            time_of_next_check = Date.now() + time_wait + time_safety
            //debug
            //ns.tprint("Next hack_server cycle (" + (cycle + 1) + ") @ " + time_of_next_check.getHours() + ":" + time_of_next_check.getMinutes())
        }
    }
}


//function that finds a target
export async function find_target(ns, servers_rooted) {
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
        //for each server we can hack
        for (const server of servers_rooted) {
            //get the max money
            const money_max = await evaluate.exec(ns, "ns.getServerMaxMoney('" + server + "')")
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
        ns.tprint(hack_level_previous + " -> found hack target: '" + hack_target + "'")
    }
}


//function that checks the status of the target
export async function check_target(ns) {
    //get server data
    const server = await evaluate.exec(ns, "ns.getServer('" + hack_target + "')")
    //debug
    ns.tprint("hack_target: '" + hack_target + "', security: " + server.hackDifficulty + "/" + server.minDifficulty + ", money: " + server.moneyAvailable + "/" + server.moneyMax + "(" + Math.round(server.moneyAvailable/server.moneyMax) + "%)")
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
        ns.tprint("hack target '" + hack_target + "' is prepped")
    }
    return STATUS.HACK
}


//function that gets the servers that can execute scripts
export async function get_execute_servers(ns, servers_rooted) {
    //create a map to return
    var execute_servers = new Map()
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