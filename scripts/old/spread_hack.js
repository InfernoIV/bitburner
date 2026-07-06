const script_eval = "scripts/eval.js"
const script_hack_exec = "basic_hack.js"

var player
var servers_hacked = []

/** @param {NS} ns */
export async function main(ns) {
  //static ram
  ns.ramOverride(3.1)
  //clear ports
  ns.getPortHandle(1).clear()
  ns.getPortHandle(2).clear()
  //execute port script
  ns.exec(script_eval, "home")
  //empty to servers hacked
  servers_hacked = []
  // @ignore-infinite
  while (true) {
    //update the player every loop
    player = await run_eval(ns, "ns.getPlayer()")
    //ns.tprint("Skills: " + JSON.stringify(player.skills))
    //start from home
    await root_servers(ns, ["home"], "home")
    //wait a bit
    await ns.sleep(100)
  }
}


/** @param {NS} ns */
async function root_servers(ns, servers_found, server_name) {
  //for each neighbour found
  for (const neighbour of ns.scan(server_name)) {
    //if we already did this server
    if (!servers_hacked.includes(neighbour)) {
      //debug
      //ns.tprint(neighbour + ": '" + await run_eval(ns, "ns.hasRootAccess('" + neighbour + "')") + "'")

      //check for root access
      if (!await run_eval(ns, "ns.hasRootAccess('" + neighbour + "')")) {
        //ns.tprint("Starting hack of '" + neighbour + "'")
        //check if we can hack it
        if (player.skills.hacking >= await run_eval(ns, "ns.getServerRequiredHackingLevel('" + neighbour + "')")) {
          //1st tool: hacking 50
          await run_eval(ns, "ns.brutessh('" + neighbour + "')")
          //2nd tool: hacking 100
          await run_eval(ns, "ns.ftpcrack('" + neighbour + "')")
          //3rd tool: hacking 250
          await run_eval(ns, "ns.relaysmtp('" + neighbour + "')")
          //4th toool: hacking 500
          await run_eval(ns, "ns.httpworm('" + neighbour + "')")
          //5th toool: hacking 750
          await run_eval(ns, "ns.sqlinject('" + neighbour + "')")
          //nuke to get root access
          if (await run_eval(ns, "ns.nuke('" + neighbour + "')")) {
            //copy the script
            await run_eval(ns, "ns.scp('" + script_hack_exec + "','" + neighbour + "')")
            //run the script
            await run_eval(ns, "ns.exec('" + script_hack_exec + "','" + neighbour + "')")
            //debug           
            ns.toast("Hacked '" + neighbour + "'")
            ns.print("Hacked '" + neighbour + "'")
            //add to handled servers
            servers_hacked.push(neighbour)
          }
        }
        //already hacked
      } else {
        //debug   
        ns.toast("Already hacked '" + neighbour + "'")     
        ns.print("Already hacked '" + neighbour + "'")
        //add to handled servers
        servers_hacked.push(neighbour)

      }
    }
    //if we not yet scanned this server
    if (!servers_found.includes(neighbour)) {
      //add server to list to skip
      servers_found.push(neighbour)
      //go deeper
      await root_servers(ns, servers_found, neighbour)
    }
  }
}


/** @param {NS} ns */
async function arrange_hacking_tools(ns) {
  //check if we can buy
  if (await run_eval(ns, "ns.hasTorRouter()")) {
    //do stuff
    //ns.singularity.createProgram
  }
}


/** @param {NS} ns */
async function run_eval(ns, command) {
  //data feedback
  var port_output = ns.getPortHandle(2)
  //data input
  ns.getPortHandle(1).tryWrite(command)
  //wait until data is written
  await port_output.nextWrite()
  //get the result
  var result = port_output.read()
  //check for valid conversion
  if (result != "NULL PORT DATA") {
    //return conversion
    return JSON.parse(result)
  }
  //return the result
  return result
}


