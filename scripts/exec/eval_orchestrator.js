import { port_no_data, script_eval_worker, server_home } from "scripts/constants.js"


/** @param {NS} ns */
export async function main(ns) {
  //get PID from args
  const PID = Number(ns.args[0]) //1
  //get RAM from args
  const RAM = Number(ns.args[1]) //1
  //boolean to check if we need to fill ram (convert string to bool)
  var fill_ram = eval(ns.args[2])
  //maximum amount of ram to be used
  var max_ram = Number(ns.args[3])
  
  //static ram, needed?
  //ns.ramOverride(2.9)
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
      //keep track of threads, base is 1
      var threads = 1
      //check if we need to fill ram
      if (fill_ram) {
        //calculate threads
        threads = Math.floor(max_ram/RAM)
      }
      //run script to do this
      ns.exec(script_eval_worker, server_home, threads, PID, RAM, input)
    }
    //wait a little bit
    await ns.sleep(5)
  }
} 
