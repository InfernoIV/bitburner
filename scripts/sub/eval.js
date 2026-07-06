const script_eval = "scripts/manage_eval.js"

export function init(ns) { 
  //clear ports
  ns.getPortHandle(1).clear()
  ns.getPortHandle(2).clear()
  //execute port script
  ns.exec(script_eval, "home")
}

/** @param {NS} ns */
export async function exec(ns, command) {
  //data input
  ns.getPortHandle(1).tryWrite(command)
  //debug
  //ns.print("Sent '" + command + "'")
  //data feedback
  var port_output = ns.getPortHandle(2)
  //wait until data is written
  while (port_output.peek() == "NULL PORT DATA") {
    //ns.print(port_output.peek())
    //wait for data
    await ns.sleep(5) //port_output.nextWrite()
  }
  //get the result
  var result = port_output.read()
  //return conversion
  return JSON.parse(result)
}


