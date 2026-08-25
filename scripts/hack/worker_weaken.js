/** @param {NS} ns */
export async function main(ns) {
    //guard clause
    if (ns.args.length < 1) {
        //indicate issue
        ns.tprint(ns.args.length + " ARGUMENTS FOR 'weaken.js'!")
        //exit
        ns.exit()
    }
    //set hostname
    const hostname = ns.args[0]
     //set delay
    const delay = ns.args.length >= 2 ? ns.args[1] : 0
    //perform weaken
    await ns.weaken(hostname, {additionalMsec: delay} )
}