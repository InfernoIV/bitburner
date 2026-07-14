import * as evaluate from 'scripts/sub/evaluate.js'

const script_share = "scripts/exec/share.js"


/** @param {NS} ns */
export async function exec(ns) {
  const ram_share = parseFloat(await evaluate.exec(ns, "ns.getScriptRam('" + script_share + "')"))
  //get the max ram of home, minus 8 for the evaluate.exec script
  const ram_server_max = parseFloat(await evaluate.exec(ns, "ns.getServerMaxRam('home')")) - 8.0
  const ram_server_used = parseFloat(await evaluate.exec(ns, "ns.getServerUsedRam('home')"))
  //get the available ram
  const ram_available = ram_server_max - ram_server_used
  //check how many times we can run the script
  const threads = Math.floor(ram_available / ram_share)
  //debug
  ns.print("Home has " + ram_server_used + "/" + ram_server_max + " = " + ram_available + ", need " + ram_share + " => " + threads + " threads for sharing")
  //if there is a possibility to share
  if (threads > 0) {
    //share ram
    ns.exec(script_share, "home", threads)
  }
}
