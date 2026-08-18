import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


//enum to keep track of server status
export const STATE = {
    HACK: {
        HACK: "HACK",
        GROW: "GROW",
        WEAKEN: "WEAKEN"
    }
}

// Declaration
export class hack_obj {
    constructor() {
        //keep track of changes and target
        this.hack_level_previous = -1
        this.hack_target = ""
        this.time_of_next_check = Date.now()
        this.available = true
        //config
        this.hack_chance_min = 0.66
        this.formulas_available = false
    }


    init(ns, handles) {
        //disable logging
        ns.disableLog("exec")
        ns.disableLog("scp")
        //create port objects
        this.port_hack_request = ns.getPortHandle(CONSTANTS.PORT.HACK_REQUEST)
        this.port_hack_target = ns.getPortHandle(CONSTANTS.PORT.HACK_TARGET)
        //remove the data from the port
        this.port_hack_request.clear()
        //remove the data from the port
        this.port_hack_target.clear()
        //save if formula's are available to use
        this.formulas_available = handles.hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE)
        //wait a little bit before starting
        this.time_of_next_check = Date.now() + CONSTANTS.TIME.SAFETY
        //log
        log.info(ns, "Hack", "Init complete")
    }


    //function that target hacks a single server
    /** @param {NS} ns */
    async manage(ns, handles) {
        //if the timing has not yet passed
        if (Date.now() < this.time_of_next_check) {
            //stop
            return
        }
        //get player
        const player = ns.getPlayer()
        //set flag if we need to find a new target
        var flag_new_target = true
        //set flag if we need to empty the server
        var empty_the_server = false
        //if there is anything that should be done
        if (this.port_hack_request.peek() != CONSTANTS.PORT.NO_DATA) {
            //default to false
            flag_new_target = false
            //variable to fill
            var data = null
            //failsafe
            try {
                //while there is data in the port
                while (this.port_hack_request.peek() != CONSTANTS.PORT.NO_DATA) {
                    //get port data
                    data = this.port_hack_request.peek()
                    //log.info(ns, "Hack", "Data: " + JSON.stringify(data), true)
                    //if this is not a hack request
                    if (data.request != "hack") {
                        //we need to wait                        
                        flag_new_target = true
                        //stop
                        break
                    }
                    //if we dont' have enough stats & tools
                    if (!handles[CONSTANTS.HANDLE.ROOT].servers_money.has(data.hostname)) {
                        //log
                        log.warning(ns, "Hack", "Current skills/tools to low for stock target '" + data.hostname +
                            "'", true)
                        //write a message back
                        this.port_hack_request.tryWrite({
                            "request": "complete",
                            "hostname": data.hostname,
                            "symbol": data.symbol,
                            "type": data.type,
                        })
                        //remove the message
                        this.port_hack_request.read()
                        //next
                        continue
                    }
                    //if we take too long for a weaken cycle (>= 5 mins)
                    if (ns.getWeakenTime(data.hostname) >= 30000) {
                        //log
                        log.warning(ns, "Hack", "Weaken takes too long for stock target '" + data.hostname +
                            "'", true)
                        //write a message back
                        this.port_hack_request.tryWrite({
                            "request": "complete",
                            "hostname": data.hostname,
                            "symbol": data.symbol,
                            "type": data.type,
                        })
                        //remove the message
                        this.port_hack_request.read()
                        //next
                        continue
                    }


                    //parse data
                    this.hack_target = data.hostname
                    empty_the_server = (data.type == "short")
                    const server_info = ns.getServer(this.hack_target)
                    //debug
                    log.info(ns, "Hack", "Working on stock request: " + data.hostname + " (" + data.type + ")",
                        true)
                    //if the server is at required state
                    if ((empty_the_server && server_info.moneyAvailable == 0) ||
                        (!empty_the_server && server_info.moneyAvailable == server_info.moneyMax)) {

                        //write a message back
                        this.port_hack_request.tryWrite({
                            "request": "complete",
                            "hostname": data.hostname,
                            "symbol": data.symbol,
                            "type": data.type,
                        })
                        //log
                        log.success(ns, "Hack", "Prepared stock server " + this.hack_target, true)
                        //remove port data
                        this.port_hack_request.read()
                        //go to next
                        continue
                        //server is not ready
                    } else {
                        //stop
                        break
                    }
                }
            } catch (err) {
                //log
                log.error(ns, "Hack", "handle_port raw: " + data + ", err: " + err, true)
                //remove port data
                this.port_hack_request.read()
                //stop
                return
            }
        }
        //debug
        //log.info(ns, "Hack", "this.hack_target: " + this.hack_target + ", flag_new_target: " + flag_new_target, true)
        //if we aren't handling port requests
        if (flag_new_target) {
            //get target
            this.find_target(ns, handles[CONSTANTS.HANDLE.ROOT].servers_money, player)
        }

        //if there is no target
        if (this.hack_target == "") {
            //stop
            return
        }
        //calculate timings and ram
        this.calculate(ns, player)


        //check if we HAVE a target
        if (this.hack_target == "") {
            //debug
            log.warning(ns, "Hack", "No hack target found, waiting for next cycle)")
            //wait a bit before checking again
            this.time_of_next_check = Date.now() + CONSTANTS.TIME.SAFETY
        } else {
            //get the executing servers
            var execute_servers = handles[CONSTANTS.HANDLE.ROOT].servers_ram
            //re-set the wait time, to be set later
            var time_wait = 0
            //get server data
            const server_info = ns.getServer(this.hack_target)
            //check the state
            const state = this.check_target(ns, server_info, empty_the_server)
            var percentage = 0
            //depending on the state
            switch (state) {
                //if we need to weaken
                case STATE.HACK.WEAKEN:
                    //weaken the server
                    time_wait = this.weaken_server(ns, execute_servers)
                    //calc percentrage
                    percentage = Math.ceil((server_info
                        .hackDifficulty / server_info.minDifficulty) * 100)
                    //debug
                    log.info(ns, "Hack", "Started weaken for '" + this.hack_target + "' = " + percentage + "% => " +
                        format_time(
                            time_wait), true)
                    //write to port
                    this.write_data_to_port(ns, "Weaken " + percentage + "%")
                    //stop
                    break

                    //if we need to grow
                case STATE.HACK.GROW:
                    //set the time to wait
                    time_wait = this.grow_server(ns, execute_servers)
                    //calc percentrage
                    percentage = Math.floor((server_info
                        .moneyAvailable / server_info.moneyMax) * 100)
                    //debug
                    log.info(ns, "Hack", "Started grow for '" + this.hack_target + "' = " + percentage + "% => " +
                        format_time(time_wait),
                        true)
                    //write to port
                    this.write_data_to_port(ns, "Grow " + percentage + "%")
                    //stop
                    break

                    //if we need to hack
                case STATE.HACK.HACK:
                    //set the time to wait
                    time_wait = this.hack_server(ns, execute_servers)
                    //debug
                    log.info(ns, "Hack", "Started hack for '" + this.hack_target + "' => " + format_time(time_wait))
                    //write to port
                    this.write_data_to_port(ns, "Hack")
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


    //writes data to port for the UI to use
    write_data_to_port(ns, activity) {
        //remove the previous data
        this.port_hack_target.read()
        //save data to port 
        this.port_hack_target.tryWrite({
            target: this.hack_target,
            activity: " " + activity
        })
        //log.info(ns, "Hack", "Wrote to port: '" + this.hack_target + "','" + activity + "' => ", true)
    }

    //function that finds a target
    /*
    ns.getHackTime
    ns.hackAnalyzeChance
    */
    find_target(ns, servers_money, player) {
        //get current hacking level
        var hacking_level_current = player.skills.hacking
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
            for (const [server_name, money_max] of servers_money) {
                //placeholder
                var new_value = 0
                //or use hackAnalyze(host)? -> requires mock server (and thus formula's)
                //TODO: add calculation for ram / threads? (needed vs available?)
                //if formula's are available
                if (this.formulas_available) {
                    //get server
                    var server = ns.getServer(server_name)
                    //set money to max
                    server.moneyAvailable = server.moneyMax
                    //set security to min
                    server.hackDifficulty = server.minDifficulty

                    //get the chance
                    const chance = ns.formulas.hackChance(server, player)
                    //if not enough chance
                    if (chance < this.hack_chance_min) {
                        //go to next
                        continue
                    }

                    //get the time
                    const time = ns.formulas.weakenTime(server, player)
                    //calculate the new value
                    new_value = money_max / time * chance


                    //use normal functions
                } else {
                    //get the chance for the hack
                    const chance = ns.hackAnalyzeChance(server_name)
                    //if not enough chance
                    if (chance < this.hack_chance_min) {
                        //go to next
                        continue
                    }
                    //get the time to hack            
                    const time = ns.getHackTime(server_name)
                    //calculate the new value
                    new_value = money_max / time * chance
                }


                //if better than what we have            
                if (new_value > best_value) {
                    //update the value
                    best_value = new_value
                    //update the server_name
                    this.hack_target = server_name
                    //update the max money
                    this.money_target = money_max
                }
            }


            //debug
            //log.info(ns, "Hack", this.hack_level_previous + " -> found hack target: '" + this.hack_target + "'")
        }
    }

    calculate(ns, player) {
        //get server
        var server = ns.getServer(this.hack_target)
        //set money to max
        server.moneyAvailable = server.moneyMax
        //set security to min
        server.hackDifficulty = server.minDifficulty
        //calculate timings
        this.calculate_timings(ns, server, player)
        //calculate threads
        this.calculate_threads(ns, server, player)
    }


    /*
    ns.formulas.hackTime    0
    ns.formulas.weakenTime  0
    ns.formulas.growTime    0
    
    ns.getHackTime      0.05
    ns.getGrowTime      0.05
    ns.getWeakenTime    0.05
    
    */
    calculate_timings(ns, server, player) {
        //if we can use formulas
        if (this.formulas_available) {
            //should this be mock server?
            this.time = {
                hack: ns.formulas.hackTime(server, player),
                weaken: ns.formulas.weakenTime(server, player),
                grow: ns.formulas.growTime(server, player),
            }

            //use normal functions
        } else {
            this.time = {
                hack: ns.getHackTime(this.hack_target),
                weaken: ns.getWeakenTime(this.hack_target),
                grow: ns.getGrowTime(this.hack_target),
            }
        }
        //calc delay
        this.delay = {
            grow: {
                grow: this.time.weaken - this.time.grow - CONSTANTS.TIME.SAFETY,
                weaken: 0,
            },
            hack: {
                hack: this.time.weaken - this.time.hack - CONSTANTS.TIME.SAFETY,
                weaken_1: 0,
                grow: this.time.weaken - this.time.grow - CONSTANTS.TIME.SAFETY,
                weaken_2: (2 * CONSTANTS.TIME.SAFETY),
            },
        }
    }

    /*
    without formula's               1
        ns.hackAnalyze              1 

    with formula's:                 2
        ns.formulas.hackPercent     0
        ns.hackAnalyzeSecurity      1
        ns.formulas.growThreads     0
        ns.growthAnalyzeSecurity    1
        ns.formulas.weakenEffect    0
    */
    calculate_threads(ns, server, player) {
        //map which has key = ram, value = threads object
        this.ram_to_threads = new Map()
        //set min ram for a batch
        this.ram_min = CONSTANTS.RAM.WORKER.HACK + CONSTANTS.RAM.WORKER.GROW + (2 * CONSTANTS.RAM.WORKER.WEAKEN)
        //just let all servers work with max ram usage
        //this.threads.weaken = 1

        //just let all servers work with max ram usage
        //this.threads.grow.grow = 1
        //this.threads.grow.weaken = 1

        //calc max threads for hack
        //if formula's can be used: optimized hacking + saving of ram
        if (this.formulas_available) {
            //hack % per thread
            const hack_percent = ns.formulas.hackPercent(server, player)
            //calculate max hack threads (with a minimum of 1 thread (in case we steal more than 100%, if even possible))
            const max_hack_threads = Math.min(Math.ceil(1 / hack_percent), 1)
            //get weaken effect (scales linear, independent of server or player)
            const weaken_effect = ns.formulas.weakenEffect(1)
            //calc for ram cost
            for (const index = 1; index <= max_hack_threads; index++) {
                //calc base ratio (1:1:1:1)
                const ram_cost_base = job_size * index
                //if not yet existing
                if (!this.ram_to_threads.has(ram_cost_base)) {
                    //save to map
                    this.ram_to_threads.set(ram_cost_base, {
                        hack: index,
                        weaken_1: index,
                        grow: index,
                        weaken_2: index
                    })
                }
                //calc best ratio (1:?:?:?)
                //update money left on (mock) server: TODO: does this work? or do we need to build a mock server?
                server.moneyAvailable = server.moneyMax * (index * hack_percent)
                //analyze the impact of hack
                const impact_hack = ns.hackAnalyzeSecurity(index, this.money_target)
                //check security increase of hack
                const threads_weaken_1 = Math.ceil(impact_hack / weaken_effect)
                //calc best ratio
                const threads_grow = ns.formulas.growThreads(server, player, this.money_target)
                //calc the impact of grow
                const impact_grow = ns.growthAnalyzeSecurity(threads_grow, this.money_target)
                //check security increase of grow 
                const threads_weaken_2 = Math.ceil(impact_grow / weaken_effect)
                //calc ram cost
                const ram_cost_best = (index * CONSTANTS.RAM.WORKER.HACK) + (threads_grow * CONSTANTS.RAM.WORKER
                    .GROW) + ((threads_weaken_1 + threads_weaken_2) * CONSTANTS.RAM.WORKER.WEAKEN)
                //save to map (overwriting what exists: this should be better)
                this.ram_to_threads.set(ram_cost_best, {
                    hack: index,
                    weaken_1: threads_weaken_1,
                    grow: threads_grow,
                    weaken_2: threads_weaken_2,
                })
            }

            //formula's not available: cannot calculate grow..
        } else {
            //get money per hack thread
            const money_stolen = ns.hackAnalyze(this.hack_target)
            //set max hack threads
            var max_hack_threads = Math.ceil(this.money_target / money_stolen)
            //variable to set, cap to 100 threads
            var max_threads = Math.min(max_hack_threads, 100)
            //set job size on a 1:1:1:1 ratio
            const job_size = CONSTANTS.RAM.WORKER.HACK + CONSTANTS.RAM.WORKER.GROW + (2 * CONSTANTS.RAM.WORKER
                .WEAKEN)
            //calc for ram cost
            for (let index = 1; index < max_threads; index++) {
                //calc ram cost
                const ram_cost = job_size * index
                //save to map
                this.ram_to_threads.set(ram_cost, {
                    hack: index,
                    weaken_1: index,
                    grow: index,
                    weaken_2: index
                })
            }
        }
    }


    //function that checks the state of the target
    check_target(ns, server, money_is_empty = false) {
        //if security is not min
        if (server.hackDifficulty > server.minDifficulty) {
            //lower security
            return STATE.HACK.WEAKEN
            //if money is not max
        } else if (server.moneyAvailable < server.moneyMax) {
            //grow money
            return STATE.HACK.GROW
        }
        //ready for hacking
        return STATE.HACK.HACK
    }


    //script that will launch workers for weakening target server
    weaken_server(ns, execute_servers) {
        //for each server
        for (const [server, ram_available] of execute_servers) {
            //calc job size
            const job_size = CONSTANTS.RAM.WORKER.WEAKEN
            //get the number of threads we can run
            const threads = Math.floor(ram_available / job_size)
            //if possible to run
            if (threads > 0) {
                //copy the script
                if (!ns.scp(CONSTANTS.SCRIPT.TO_COPY.HACK, server)) {
                    //debug
                    log.warning(ns, "Hack", "error copying '" + CONSTANTS.SCRIPT.TO_COPY.HACK + "' to " + server)
                    ns.ui.openTail()
                    ns.exit()
                    //go to next
                    continue
                }
                //run the script
                var result = ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads, this.hack_target)
                //check for result
                if (result == false) {
                    log.warning(ns, "Hack", "W: Failed to start '" + CONSTANTS.SCRIPT.WORKER.GROW + "' on '" +
                        server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads +
                        " threads => " + threads * job_size + " GB", true)
                    log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                    ns.ui.openTail()
                }
                //debug
                //log.info(ns, "Hack", "Started weaken on '" + server + "' (x" + threads + ")")
            }
        }
        //return the time to wait
        return this.time.weaken + CONSTANTS.TIME.SAFETY
    }


    //function that will grow / weaken the server
    grow_server(ns, execute_servers) {
        //weaken > grow > hack (time needed)
        /*
            <------------->			grow = weaken - grow - buffer
        <-------------------->		weaken = 0 + (2 * buffer)
        */
        //keep track of job delay
        var job_delay = 0
        //ram calc
        const job_size = CONSTANTS.RAM.WORKER.GROW + CONSTANTS.RAM.WORKER.WEAKEN
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
                const threads = Math.floor(ram_available / job_size)
                //execute scripts with the correct timing
                var result = ns.exec(CONSTANTS.SCRIPT.WORKER.GROW, server, threads, this.hack_target, this.delay
                    .grow.grow +
                    job_delay)
                //check for result
                if (result == false) {
                    log.warning(ns, "Hack", "GW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.GROW + "' on '" +
                        server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads +
                        " threads => " + threads * job_size + " GB", true)
                    log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                }
                //start 2
                result = ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads, this.hack_target, this.delay.grow
                    .weaken +
                    job_delay)
                //check for result
                if (result == false) {
                    log.warning(ns, "Hack", "GW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.WEAKEN + "' on '" +
                        server + "' for " + threads + " threads (" + ram_available + ") GB with " + threads +
                        " threads => " + threads * job_size + " GB", true)
                    log.info(ns, ns.pid, "Server: '" + JSON.stringify(ns.getServer(server)) + "'")
                }
                //increase job delay
                job_delay += (2 * CONSTANTS.TIME.SAFETY)
            }
        }
        //return time to wait
        return this.time.weaken + job_delay - CONSTANTS.TIME.SAFETY
    }


    //function that will grow / weaken the server
    hack_server(ns, execute_servers) {
        //weaken > grow > hack (time needed)
        /*
                    <------->			hack = weaken - hack - buffer
        <-------------------->			weaken = 0
                <------------->			grow = weaken - grow + buffer
          <-------------------->		weaken = 0 + (2 * buffer)
        */
        //set the job delab
        var job_delay = 0
        //get the threads
        var ram_options = Array.from(this.ram_to_threads.keys())
        //log.info(ns, "Singularity", "ram_options: " + ram_options, true)
        //for each server
        for (var [server, ram_server] of execute_servers) {
            //save to local variable
            var ram_available = ram_server
            //log.info(ns, "Hack", "this.ram_min: " + this.ram_min)
            //ns.ui.openTail()
            //if not enough ram for basic version
            //while (ram_available < this.ram_min) {
            //get closest lower key, which provides the threads
            var ram_cost = getClosestValue(ram_options,
                ram_available
            ) //ram_options.filter( function(i, ram_available){ return i <= ram_available })//.pop()
            //log.info(ns, "Singularity", "ram_available: " + ram_available + ", ram_cost: " + ram_cost, true)
            //if not enough ram
            if (ram_cost > ram_available) {
                //get the index
                var index = ram_options.indexOf(ram_cost)
                //if this is the lowest index
                if (index == 0) {
                    //go to next
                    continue
                }
                //use 1 index lower
                ram_cost = ram_options[index]
            }
            //copy scripts
            //copy the script
            if (!ns.scp(CONSTANTS.SCRIPT.TO_COPY.HACK, server)) {
                //debug
                log.warning(ns, "Hack", "error copying '" + CONSTANTS.SCRIPT.TO_COPY.HACK + "' to " + server)
                //go to next
                continue
            }

            //get threads from ram_to_threads
            var threads = this.ram_to_threads.get(ram_cost)
            //log.info(ns, "Singularity", "Threads: " + JSON.stringify(threads), true)
            //execute scripts with the correct timing
            //hack
            if (!ns.exec(CONSTANTS.SCRIPT.WORKER.HACK, server, threads.hack, this.hack_target, this
                    .delay.hack.hack +
                    job_delay)) {
                //log if failed
                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.HACK + "' on '" +
                    server + "' for " + threads.hack + " threads  = " + (threads
                        .hack * CONSTANTS.RAM.WORKER.HACK) + "/" + ram_available + " GB => Server: " + JSON
                    .stringify(ns.getServer(server)) + "'", true)
            }

            //weaken 1
            if (!ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads.weaken_1, this.hack_target, this
                    .delay.hack.weaken_1 +
                    job_delay)) {
                //log if failed
                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.WEAKEN + "' on '" +
                    server + "' for " + threads.weaken_1 + " threads  = " + (threads
                        .weaken_1 * CONSTANTS.RAM.WORKER.WEAKEN) + "/" + ram_available + " GB => Server: " +
                    JSON.stringify(ns.getServer(server)) + "'", true)
            }

            //grow
            if (!ns.exec(CONSTANTS.SCRIPT.WORKER.GROW, server, threads.grow, this.hack_target, this.delay
                    .hack.grow +
                    job_delay)) {
                //log if failed
                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.GROW + "' on '" +
                    server + "' for " + threads.grow + " threads  = " + (threads
                        .grow * CONSTANTS.RAM.WORKER.GROW) + "/" + ram_available + " GB => Server: " + JSON
                    .stringify(ns.getServer(server)) + "'", true)
            }

            //weaken 2
            if (!ns.exec(CONSTANTS.SCRIPT.WORKER.WEAKEN, server, threads.weaken_2, this.hack_target, this
                    .delay.hack.weaken_2 +
                    job_delay)) {
                //log if failed
                log.warning(ns, "Hack", "HWGW: Failed to start '" + CONSTANTS.SCRIPT.WORKER.WEAKEN + "' on '" +
                    server + "' for " + threads.weaken_2 + " threads  = " + (threads
                        .weaken_2 * CONSTANTS.RAM.WORKER.WEAKEN) + "/" + ram_available + " GB => Server: " +
                    JSON.stringify(ns.getServer(server)) + "'", true)
            }

            //increase job delay
            job_delay += 4 * CONSTANTS.TIME.SAFETY
            //lower the ram available
            ram_available -= ram_cost
        }
        //}
        //return time to wait
        return this.time.weaken + job_delay
    }
}

function getClosestValue(myArray, myValue) {
    //optional
    var i = 0;

    while (myArray[++i] < myValue);

    return myArray[--i];
}

function format_time(time) {
    let ms = time % 1000
    let ss = Math.floor(time / 1000) % 60
    let mm = Math.floor(time / 1000 / 60) % 60
    let hh = Math.floor(time / 1000 / 60 / 60)
    return `${hh}:${mm}:${ss}`
}