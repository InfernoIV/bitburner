import * as evaluate from 'scripts/sub/eval.js'
 
const script_hack_exec = "scripts/exec/hack_self.js"

var print_once = true


export function init() {
 print_once = true   
}


/** @param {NS} ns */
export async function exec(ns, servers_rooted) {
//get ram script
    var ram_script = parseFloat(await evaluate.exec(ns, "ns.getScriptRam('" + script_hack_exec + "')"))
  //for each server we have root access
  for (const server of servers_rooted) {
    //if home server
    if (server == "home") {
      //skip
      continue
    }
    const ram_server_max = parseFloat(await evaluate.exec(ns, "ns.getServerMaxRam('" + server + "')"))
    const ram_server_used = parseFloat(await evaluate.exec(ns, "ns.getServerUsedRam('" + server + "')"))
    //get the available ram
    const ram_available = ram_server_max - ram_server_used
    //check how many times we can run the script
    const threads = Math.floor(ram_available / ram_script)
    //debug
    if (print_once) {
      ns.print(server + " has " + ram_server_used + "/" + ram_server_max + " in use, " + ram_available + " available, for " + threads + " threads")
    } 
    
    //if possible to run
    if (threads > 0) {
      //copy the script
      if (!await evaluate.exec(ns, "ns.scp('" + script_hack_exec + "','" + server + "')")) {
        //debug
        ns.tprint("error copying '" + script_hack_exec + "' to " + server)
      }
      //run the script
      ns.exec(script_hack_exec, server, threads)
      //debug
      //ns.tprint("Started hack on '" + server + "' (x" + threads + ")")
    }
  }
  print_once = false
}
