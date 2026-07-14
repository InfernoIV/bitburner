/** @param {NS} ns */
export async function main(ns) {
  //static ram
  ns.ramOverride(2.9)
  //disable logging
  ns.disableLog("sleep")
  //get port command
  //const port_command = ns.args[0]
  //get port reply
  //const port_reply = ns.args[1]
  //data input
  var port_input = ns.getPortHandle(1)
  // @ignore-infinite
  while (true) {
    //check if we can read
    if (port_input.peek() != "NULL PORT DATA") {
      //save the variable
      var input = port_input.read()
      //debug
      ns.print("Found: '" + input + "'")
      //run script to do this
      ns.exec("scripts/run_eval.js", "home", 1, input)
      //no data
    }
    //wait a little bit
    await ns.sleep(5)
  }
} 
