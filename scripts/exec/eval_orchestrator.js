import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


/** @param {NS} ns */
export async function main(ns) {
    //log
    log.info(ns, ns.pid, "got arguments: " + JSON.stringify(ns.args))
    //get PID from args
    const PID = Number(ns.args[0]) //1
    //hostname
    const hostname = ns.args[1]
    //get RAM from args
    const RAM = Number(ns.args[2]) //1
    //boolean to check if we need to fill ram (convert string to bool)
    var fill_ram = eval(ns.args[3])
    //maximum amount of ram to be used
    var max_ram = Number(ns.args[4])
    

    //disable logging
    ns.disableLog("sleep")
    //data input
    var port_input = ns.getPortHandle(PID) //1)

    // @ignore-infinite
    while (true) {
        //check if we can read
        if (port_input.peek() != CONSTANTS.PORT.NO_DATA) {
            //save the variable
            var input = JSON.parse(port_input.peek())
            //if correct direction
            if (input.direction == "IN") {
                //remove the data
                port_input.read()
                //debug
                //log.info(ns, "Eval_orch", "Found: '" + input + "'")
                //keep track of threads, base is 1
                var threads = 1
                //check if we need to fill ram
                if (fill_ram) {
                    //calculate threads
                    threads = Math.floor(max_ram / RAM)
                }
                //debug
                log.info(ns, ns.pid, "Found max ram: '" + max_ram + "' and ram cost: '" + RAM + "', resulting into '" + threads + "' threads")
                //run script to do this
                var result = ns.exec(CONSTANTS.SCRIPT.EVAL.WORKER, hostname, {threads: threads, ramOverride: RAM, preventDuplicates: true}, 
                  PID, RAM, input.data)
                  //if failed
                  if (result == false && threads > 1) {
                    //try again with fewer threads
                    result = ns.exec(CONSTANTS.SCRIPT.EVAL.WORKER, hostname, {threads: threads-1, ramOverride: RAM, preventDuplicates: true}, 
                    PID, RAM, input.data)
                //if STILL failed
                  if (result == false) {
                    //open tail
                    ns.ui.openTail()
                    //stop
                    ns.exit()
                  }
                }
            }
        }
        //wait a little bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}