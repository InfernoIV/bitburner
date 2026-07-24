import * as CONSTANTS from "scripts/constants.js"

/** @param {NS} ns */
export async function main(ns) {
  // @ignore-infinite 
  while (true) {
    await ns.share()
    //wait a bit
    await ns.sleep(CONSTANTS.TIME.WAIT)
  }
}

