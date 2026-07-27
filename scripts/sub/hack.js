import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


// Declaration
export class hack_obj {
    constructor() {
        //keep track of changes and target
        this.hack_level_previous = -1
        this.hack_target = ""
        this.time_of_next_check = Date.now()
        this.available = true
    }

    
    init(ns) {
        //disable logging
        ns.disableLog("exec")
        //log
        log.info(ns, "Hack", "Init complete", true)
    }


    //function that target hacks a single server
    /** @param {NS} ns */
    async manage(ns, servers_ram, servers_money) {
        //if the timing has not yet passed
        if (Date.now() < this.time_of_next_check) {
            //stop
            return
        }
        //update the target, if needed (global variable)
        this.find_target(ns, servers_money)
        //check if we HAVE a target
        if (this.hack_target == "") {
            //debug
            log.warning(ns, "Hack", "No hack target found, waiting for next cycle (" + JSON.stringify(root_obj) + ")")
            //wait a bit before checking again
            this.time_of_next_check = Date.now() + CONSTANTS.TIME.SAFETY
        } else {
            //get the executing servers
            var execute_servers = servers_ram
            //re-set the wait time, to be set later
            var time_wait = 0
            //get server data
            const server_info = ns.getServer(this.hack_target)
            //check the state
            const state = this.check_target(ns, server_info)
            //get the timings
            const time_hack = ns.getHackTime(this.hack_target)
            const time_weaken = ns.getWeakenTime(this.hack_target)
            const time_grow = ns.getGrowTime(this.hack_target)
            //calc timings
            const delay_grow_1 = time_weaken - time_grow - CONSTANTS.TIME.SAFETY
            const delay_weaken = 0
            //calc timings
            var delay_hack = time_weaken - time_hack - CONSTANTS.TIME.SAFETY
            var delay_weaken1 = 0
            var delay_grow_2 = time_weaken - time_grow + CONSTANTS.TIME.SAFETY
            var delay_weaken2 = (2 * CONSTANTS.TIME.SAFETY)
            //job stuff
            var job_delay = 0
            var job_size = 0
            var threads = 1

            //depending on the state
            switch (state) {
                //if we need to weaken
                case CONSTANTS.STATE.HACK.WEAKEN:
                    //set the time to wait
                    time_wait = time_weaken + CONSTANTS.TIME.SAFETY
                    //do stuff
                    for (const [server, ram_available] of execute_servers) {
                        //copy the script
                        if (!ns.scp(CONSTANTS.SCRIPT.TO_COPY.HACK, server)) {
                            //debug
                            log.warning(ns, "Hack", "error copying '" + CONSTANTS.SCRIPT.TO_COPY.HACK + "' to " + server)
                        }
                        //get the number of threads we can run
                        const threads = Math.floor(ram_available / CONSTANTS.RAM.WORKER.WEAKEN)
                        //if possible to run
                        if (threads > 0) {
                            //run the script
                            var result = ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads, this.hack_target)
                            //check for result
                            if (result == false) {                    
                                log.warning(ns, "Hack", "W: Failed to start '" + CONSTANTS.SCRIPT.WORKER.GROW + "' on '" + server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads + " threads => " + threads * job_size + " GB", true)
                                log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                                ns.ui.openTail()
                            }
                            //debug
                            //log.info(ns, "Hack", "Started weaken on '" + server + "' (x" + threads + ")")
                        }
                    }
                    //debug
                    log.info(ns, "Hack", "Started weaken for '" + this.hack_target + "' = " + Math.ceil((server_info.hackDifficulty / server_info.minDifficulty) * 100) + "%", true)                                   
                    //stop
                    break

                    //if we need to grow
                case CONSTANTS.STATE.HACK.GROW:
                    //weaken > grow > hack (time needed)
                    /*
                        <------------->			grow = weaken - grow - buffer
                    <-------------------->		weaken = 0 + (2 * buffer)
                    */

                    //ram calc
                    job_size = CONSTANTS.RAM.WORKER.GROW + CONSTANTS.RAM.WORKER.WEAKEN
                    //do stuff
                    for (const [server, ram_available] of execute_servers) {
                        //copy the script
                        if (!ns.scp(CONSTANTS.SCRIPT.TO_COPY.HACK, server)) {
                            //debug
                            log.warning(ns, "Hack", "error copying '" + CONSTANTS.SCRIPT.TO_COPY.HACK + "' to " + server)
                        }
                        //if we can run the total job on this server
                        if (job_size < ram_available) {
                            //calc threads
                            threads = Math.floor(ram_available / job_size)
                            //execute scripts with the correct timing
                            var result = ns.exec(CONSTANTS.SCRIPT.WORKER.GROW, server, threads, this.hack_target, delay_grow_1 + job_delay)
                            //check for result
                            if (result == false) {
                                log.warning(ns, "Hack", "GW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.GROW + "' on '" + server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads + " threads => " + threads * job_size + " GB", true)
                                log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                            }
                            result = ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads, this.hack_target, delay_weaken + job_delay)
                            //check for result
                            if (result == false) {
                                log.warning(ns, "Hack", "GW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.WEAKEN + "' on '" + server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads + " threads => " + threads * job_size + " GB", true)
                                log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                            }
                            //increase job delay
                            job_delay += (2 * CONSTANTS.TIME.SAFETY)
                        }
                    }
                    //set the time to wait
                    time_wait = time_weaken + job_delay - CONSTANTS.TIME.SAFETY
                    //debug
                    log.info(ns, "Hack", "Started grow for '" + this.hack_target + "' = " + Math.floor((server_info.moneyAvailable / server_info.moneyMax) * 100) + "%", true)
                    //stop
                    break

                    //if we need to hack
                case CONSTANTS.STATE.HACK.HACK:
                    //weaken > grow > hack (time needed)
                    /*
                                <------->			hack = weaken - hack - buffer
                    <-------------------->			weaken = 0
                            <------------->			grow = weaken - grow + buffer
                    <-------------------->		weaken = 0 + (2 * buffer)
                    */

                    //ram calc
                    job_size = CONSTANTS.RAM.WORKER.HACK + CONSTANTS.RAM.WORKER.GROW + ( 2 * CONSTANTS.RAM.WORKER.WEAKEN)
                    //do stuff
                    for (var [server, ram_server] of execute_servers) {      
                        //save to local variable
                        var ram_available = ram_server    
                        //if we can run the total job on this server
                        //while (job_size < ram_available) {
                            //log.info(ns, ns.pid, "ram_available: " + ram_available, true)
                            //calc threads
                            threads = Math.floor(ram_available / job_size)

                            if (threads < 1) {
                                //go next
                                continue
                            }
                            //if threads higher than 100
                            /*if (threads > 100) {
                                //cap threads
                                threads = 100
                            } */
                            //execute scripts with the correct timing
                            var result = ns.exec(CONSTANTS.SCRIPT.WORKER.HACK, server, threads, this.hack_target, delay_hack + job_delay)
                            //check for result
                            if (result == false) {
                                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.HACK + "' on '" + server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads + " threads => " + threads * job_size + " GB", true)
                                log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                            }
                            result = ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads, this.hack_target, delay_weaken1 + job_delay)
                            //check for result
                            if (result == false) {
                                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.WEAKEN + "' on '" + server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads + " threads => " + threads * job_size + " GB", true)
                                log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                            }
                            result = ns.exec(CONSTANTS.SCRIPT.WORKER.GROW, server, threads, this.hack_target, delay_grow_2 + job_delay)
                            //check for result
                            if (result == false) {
                                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.GROW + "' on '" + server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads + " threads => " + threads * job_size + " GB", true)
                                log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                            }
                            result = ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads, this.hack_target, delay_weaken2 + job_delay)
                            //check for result
                            if (result == false) {
                                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.WEAKEN + "' on '" + server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads + " threads => " + threads * job_size + " GB", true)
                                log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                            }
                            //increase job delay
                            job_delay += 4 * CONSTANTS.TIME.SAFETY
                            //lower the ram available
                            ram_available = ram_available - (threads * job_size)
                        //}
                    }
                    //set the time to wait
                    time_wait = time_weaken + job_delay //- CONSTANTS.TIME.SAFETY
                    //debug
                    log.info(ns, "Hack", "Started hack for '" + this.hack_target + "'", true)
                    //stop
                    break
                    //any other scenario
                default:
                    //indicate issue
                    log.error(ns, "Hack", "Uncaught case of 'state': '" + state + "'")
            }
            //update the check time
            this.time_of_next_check = Date.now() + time_wait + CONSTANTS.TIME.SAFETY
        }
    }


    //function that finds a target
    find_target(ns, servers_money) {
        //get current hacking level
        var hacking_level_current = ns.getPlayer().skills.hacking
        //get list of servers with money
        const servers_target = servers_money
        //if change in situation
        if (hacking_level_current > this.hack_level_previous) {
            //update hack level
            this.hack_level_previous = hacking_level_current
            //clear hack target
            this.hack_target = ""
            //set a value to track the best server
            var best_value = -1
            //found servers with money?
            //log.info(ns, "Hack", "Found '" + JSON.stringify(servers_target) + "' servers with money")
            //for each server we can hack
            for (const [server, money_max] of servers_target) {
                //or use hackAnalyze(host)? -> requires mock server (and thus formula's)
                //get the time to hack            
                const time = ns.getHackTime(server)
                //get the chance for the hack
                const chance = ns.hackAnalyzeChance(server)
                //calculate the new value
                const new_value = money_max / time * chance
                //if better than what we have            
                if (new_value > best_value) {
                    //update the value
                    best_value = new_value
                    //update the server
                    this.hack_target = server
                }
            }
            //debug
            //log.info(ns, "Hack", this.hack_level_previous + " -> found hack target: '" + this.hack_target + "'")
        }
    }


    //function that checks the state of the target
    check_target(ns, server) {
        //get server data
        //const server = ns.getServer(this.hack_target)
        //debug
        /*
        log.info(ns, "Hack", "hack_target: '" + this.hack_target +
            "', security: " + Math.ceil((server.hackDifficulty / server.minDifficulty) * 100) + "%" +
            ", money: " + Math.floor((server.moneyAvailable / server.moneyMax) * 100) + "%",
            true) //+ log.format_number(server.moneyAvailable) + "/" + log.format_number(server.moneyMax) +
            */
        //if security is not min
        if (server.hackDifficulty > server.minDifficulty) {
            //lower security
            return CONSTANTS.STATE.HACK.WEAKEN
            //if money is not max
        } else if (server.moneyAvailable < server.moneyMax) {
            //grow money
            return CONSTANTS.STATE.HACK.GROW
        } else {
            //debug
            log.info(ns, "Hack", "hack target '" + this.hack_target + "' is prepared for hacking", true)
        }
        return CONSTANTS.STATE.HACK.HACK
    }
}