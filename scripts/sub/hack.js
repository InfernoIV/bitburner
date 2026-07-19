import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"
import { root_obj } from "scripts/sub/root.js"

// Declaration
export class hack_obj {
    constructor() {
        //keep track of changes and target
        this.hack_level_previous = -1
        this.hack_target = ""
        this.time_of_next_check = Date.now()
    }


    //function that target hacks a single server
    /** @param {NS} ns */
    async hack_server(ns, root_obj, cloud_obj) {
        //if the timing has not yet passed
        if (Date.now() < this.time_of_next_check) {
            //stop
            return
        }
        //update the target, if needed (global variable)
        await this.find_target(ns, root_obj)
        //check if we HAVE a target
        if (this.hack_target == "") {
            //debug
            log.warning(ns, "Hack", "No hack target found, waiting for next cycle (" + JSON.stringify(root_obj) + ")")
            //wait a bit before checking again
            this.time_of_next_check = Date.now() + CONSTANTS.TIME.SAFETY
        } else {
            const root_servers = [...root_obj.servers_ram]
            const cloud_servers = [...cloud_obj.servers_owned]
            //debug
            //log.info(ns, "Hack", "Found root: '" + JSON.stringify(root_servers) + "', and cloud: '" + JSON.stringify(cloud_servers) + "' servers", true)
            //get the executing servers
            var execute_servers = [].concat(root_servers, cloud_servers)
            //re-set the wait time, to be set later
            var time_wait = 0
            //check the state
            const state = await this.check_target(ns)
            //get the timings
            const time_hack = await evaluate.exec(ns, "ns.getHackTime('" + this.hack_target + "')")
            const time_weaken = await evaluate.exec(ns, "ns.getWeakenTime('" + this.hack_target + "')")
            const time_grow = await evaluate.exec(ns, "ns.getGrowTime('" + this.hack_target + "')")
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
                        //get the number of threads we can run
                        const threads = Math.floor(ram_available / CONSTANTS.RAM.HACK.WEAKEN)
                        //if possible to run
                        if (threads > 0) {
                            //copy the script
                            if (!await evaluate.exec(ns, "ns.scp('" + CONSTANTS.SCRIPT.HACK.WEAKEN + "','" + server + "')")) {
                                //debug
                                log.warning(ns, "Hack", "error copying '" + CONSTANTS.SCRIPT.HACK.WEAKEN + "' to " + server)
                            }
                            //run the script
                            ns.exec(CONSTANTS.SCRIPT.HACK.WEAKEN, server, threads, this.hack_target)
                            //debug
                            //log.info(ns, "Hack", "Started weaken on '" + server + "' (x" + threads + ")")
                        }
                    }
                    //debug
                    log.info(ns, "Hack", "Started weaken for '" + this.hack_target + "'", true)
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
                    job_size = CONSTANTS.RAM.HACK.GROW + CONSTANTS.RAM.HACK.WEAKEN
                    //do stuff
                    for (const [server, ram_available] of execute_servers) {
                        //if we can run the total job on this server
                        if (job_size < ram_available) {
                            //calc threads
                            threads = Math.floor(ram_available / job_size)
                            //execute scripts with the correct timing
                            ns.exec(CONSTANTS.SCRIPT.HACK.GROW, server, threads, this.hack_target, delay_grow_1 + job_delay)
                            ns.exec(CONSTANTS.SCRIPT.HACK.WEAKEN, server, threads, this.hack_target, delay_weaken + job_delay)
                            //increase job delay
                            job_delay += (2 * CONSTANTS.TIME.SAFETY)
                        }
                    }
                    //set the time to wait
                    time_wait = time_weaken + job_delay - CONSTANTS.TIME.SAFETY
                    //debug
                    log.info(ns, "Hack", "Started grow for '" + this.hack_target + "'", true)
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
                    job_size = CONSTANTS.RAM.HACK.HACK + CONSTANTS.RAM.HACK.GROW + ( 2 * CONSTANTS.RAM.HACK.WEAKEN)
                    //do stuff
                    for (const [server, ram_available] of execute_servers) {
                        //if we can run the total job on this server
                        if (job_size < ram_available) {
                            //calc threads
                            threads = Math.floor(ram_available / job_size)
                            //execute scripts with the correct timing
                            ns.exec(CONSTANTS.SCRIPT.HACK.HACK, server, threads, this.hack_target, delay_hack + job_delay)
                            ns.exec(CONSTANTS.SCRIPT.HACK.WEAKEN, server, threads, this.hack_target, delay_weaken1 + job_delay)
                            ns.exec(CONSTANTS.SCRIPT.HACK.GROW, server, threads, this.hack_target, delay_grow_2 + job_delay)
                            ns.exec(CONSTANTS.SCRIPT.HACK.WEAKEN, server, threads, this.hack_target, delay_weaken2 + job_delay)
                            //increase job delay
                            job_delay += 4 * CONSTANTS.TIME.SAFETY
                        }
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
    async find_target(ns, root_obj) {
        //get current hacking level
        var hacking_level_current = await evaluate.exec(ns, "ns.getHackingLevel()")
        //get list of servers with money
        const servers_target = root_obj.servers_money
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
                    this.hack_target = server
                }
            }
            //debug
            log.info(ns, "Hack", this.hack_level_previous + " -> found hack target: '" + this.hack_target + "'")
        }
    }


    //function that checks the state of the target
    async check_target(ns) {
        //get server data
        const server = await evaluate.exec(ns, "ns.getServer('" + this.hack_target + "')")
        //debug
        log.info(ns, "Hack", "hack_target: '" + this.hack_target +
            "', security: " + Math.ceil((server.hackDifficulty / server.minDifficulty) * 100) + "%" +
            ", money: " + Math.floor((server.moneyAvailable / server.moneyMax) * 100) + "%",
            true) //+ log.format_number(server.moneyAvailable) + "/" + log.format_number(server.moneyMax) +
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