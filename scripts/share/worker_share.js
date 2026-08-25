/** @param {NS} ns */
export async function main(ns) {
  // @ignore-infinite 
  while (true) {
    //perform share activity
    await ns.share()
  }
}
