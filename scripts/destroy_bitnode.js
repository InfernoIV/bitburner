import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

/*
singularity.destroyW0r1dD43m0n   25
spawn       2
base        1.6
*/
/** @param {NS} ns */
export async function main(ns) {
    //get the next bitnode
    const next_bitnode = ns.args[0]
    //get if we need to hack
    const need_to_backdoor = ns.args[1]
    //if we need to backdoor
    if (need_to_backdoor) {
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

    //destroy world deamon and start with boot script on next target bitnode
    ns.singularity.destroyW0r1dD43m0n(next_bitnode, CONSTANTS.SCRIPT.BOOT)
    //log
    log.error(ns, "DESTROY", "IF YOU SEE THIS MESSAGE, THEN DESTROY BITNODE WAS TRIGGERED BUT NOT SUCCESSFULL!",
        true)
    //failsafe: restart with boot script
    ns.spawn(CONSTANTS.SCRIPT.BOOT)

}