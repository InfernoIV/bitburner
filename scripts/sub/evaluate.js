import {script_eval, port_no_data} from "scripts/constants.js"

//var port_command = 1
//var port_reply = 2


export function init(ns, hostname) { //, port_start = 1, hostname = "home") { 
  //clear ports
  ns.getPortHandle(ns.pid).clear() //1
  //ns.getPortHandle(2).clear()
  //execute port script
  ns.exec(script_eval, hostname)
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
  while (port.peek() == port_no_data) {
    //wait for data
    await ns.sleep(5) //port_output.nextWrite()
  }
  //get the result
  var result = port.read()
  //return conversion
  return JSON.parse(result)
}


