import * as CONSTANTS from "scripts/constants.js"
import * as log from CONSTANTS.SCRIPT.LIBRARY.LOG
import * as evaluate from CONSTANTS.SCRIPT.LIBRARY.EVALUATE


/** @param {NS} ns */
export async function share_exec(ns) {  
  //the the ram available
  const ram_server_max = parseFloat(await evaluate.exec(ns, "ns.getServerMaxRam('" + CONSTANTS.SERVER.HOME + "')"))
  //get the available ram
  const ram_available = ram_server_max  - CONSTANTS.RAM.MAIN.ORCHESTRATOR - CONSTANTS.RAM.EVAL_ORCHESTRATOR - CONSTANTS.RAM.MAIN.EVAL
  //check how many times we can run the script
  const threads = Math.floor(ram_available / CONSTANTS.RAM.SHARE)
  //debug
  log.info(ns, "Share", "Home has " + ram_server_used + "/" + ram_server_max + " = " + ram_available + ", need " + CONSTANTS.RAM.SHARE + " => " + threads + " threads for sharing")
  //if there is a possibility to share
  if (threads > 0) {
    //share ram
    ns.exec(CONSTANTS.SCRIPT.SHARE_WORKER, CONSTANTS.SERVER.HOME, threads)
  }
}
