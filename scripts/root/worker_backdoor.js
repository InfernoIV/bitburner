import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/util/log.js"


/*
baseCost (misc)	1.60GB  -> covered in main
ns.scan 0.20
singularity.connect (fn)	2.00GB  -> covered in singularity
singularity.installBackdoor (fn)	2.00GB  -> covered in singularity
*/
/** @param {NS} ns */
export async function main(ns) {
    //disable logging
    log.disable("sleep")
    //keep track of backdoored servers
    var backdoored_server = []
    //get port object
    const port = ns.getPortHandle(CONSTANTS.PORT.BACKDOOR)
    //clear all existing data
    port.clear()
    //loop endless
    while (true) {
        //if there is any data
        if (port.peek() != CONSTANTS.PORT.NO_DATA) {
            //get the server name
            const server = port.read()
            //check if we need to ignore
            if (server == CONSTANTS.SERVER.WORLD_DEAMON) {
                //go to next
                continue
            }
            //if not already backdoored
            if (!backdoored_server.includes(server)) {
                //try
                try {
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
                        //add to list
                        backdoored_server.push(server)
                        //log information
                        log.success(ns, "Backdoor", "Backdoored server '" + server + "'", true)
                        //catch error
                    } catch (err) {
                        //log error
                        log.error(ns, "Backdoor", "Failed to backdoor server '" + server + "': " + err, true)
                    }
                    //connect to home
                    ns.singularity.connect(CONSTANTS.SERVER.HOME)

                } catch (err) {
                    //log error
                    log.error(ns, "Backdoor", "Error: '" + err + "'", true)
                }
            }
        }
        //wait a little bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}