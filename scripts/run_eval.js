/** @param {NS} ns */
export async function main(ns) {
  //TODO: (how) to make dynamic? or just take the highest ram usage?
  ns.ramOverride(8)
  //get port
  //const port = ns.args[0]
  //get command
  const command = ns.args[0]
  //debug
  ns.print("trying to execute: '" + command + "'") 
  //execute the command
  var result = await eval(command)
  //debug
  ns.print(command + " = '" + JSON.stringify(result) + "'")
  //failsafe
  if (result == undefined || result == null) {
    //set to any value
    result = "NOK"
  }
  ns.print("'" + command + "' resulted into '" + result + "'")
  //write to port
  ns.getPortHandle(2).tryWrite(JSON.stringify(result))
}
