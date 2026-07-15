import { port_no_data, script_eval_worker, server_home } from "scripts/constants.js"


/** @param {NS} ns */
export async function main(ns) {
  //get PID from args
  const PID = ns.args[0] //1
  //static ram
  ns.ramOverride(2.9)
  //disable logging
  ns.disableLog("sleep")
  //get port command
  //const port_command = ns.args[0]
  //get port reply
  //const port_reply = ns.args[1]
  //data input
  var port_input = ns.getPortHandle(PID)//1)
  // @ignore-infinite
  while (true) {
    //check if we can read
    if (port_input.peek() != port_no_data) {
      //save the variable
      var input = port_input.read()
      //debug
      ns.print("Found: '" + input + "'")
      //run script to do this
      ns.exec(script_eval_worker, server_home, 1, PID, input)
      //no data
    }
    //wait a little bit
    await ns.sleep(5)
  }
} 
