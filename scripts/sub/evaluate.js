import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


export function init(ns, hostname, script_ram, fill_ram = false, max_ram = 0) {
    //clear ports
    ns.getPortHandle(ns.pid).clear()
    //check
    if (max_ram == 0) {
        //use script ram
        max_ram = script_ram
    }
    //execute port script
    ns.exec(CONSTANTS.SCRIPT.EVAL.ORCHESTRATOR, hostname, 1, 
        ns.pid, hostname, script_ram, fill_ram, max_ram)
}


/** @param {NS} ns */
export async function exec(ns, command) {
    //get PID
    const port_id = ns.pid
    //create port object
    var port = ns.getPortHandle(port_id)
    //data input
    port.tryWrite(JSON.stringify({direction: "IN", data: command}))
    while (true) {
        //if there is data
        if (port.peek() != CONSTANTS.PORT.NO_DATA) {
            //get data
            var result = JSON.parse(port.peek())
            //check if response
            if (result.direction == "OUT") {
                //remove data
                port.read()
                //debug
                //log.info(ns, "Evaluate", "Found result: '" + result.data + "'", true )
                //return conversion
                return result.data
            }
        }
        //wait for data
        await ns.sleep(CONSTANTS.TIME.WAIT) //port_output.nextWrite()
    }    
}