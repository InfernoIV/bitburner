import * as CONSTANTS from "scripts/constants.js"
import * as log from CONSTANTS.SCRIPT.LIBRARY.LOG


export function init(ns, hostname, script_ram, fill_ram = false, max_ram = script_ram) {
    //clear ports
    ns.getPortHandle(ns.pid).clear()
    //execute port script
    ns.exec(CONSTANTS.SCRIPT.EVAL.ORCHESTRATOR, hostname, scriptram, fill_ram, max_ram)
}


/** @param {NS} ns */
export async function exec(ns, command) {
    //get PID
    const port_id = ns.pid
    //create port object
    var port = ns.getPortHandle(port_id)
    //data input
    port.tryWrite(command)
    //wait until data is written
    while (port.peek() == CONSTANTS.PORT.NO_DATA) {
        //wait for data
        await ns.sleep(CONSTANTS.TIME.WAIT) //port_output.nextWrite()
    }
    //get the result
    var result = port.read()
    //return conversion
    return JSON.parse(result)
}