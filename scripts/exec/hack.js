/** @param {NS} ns */
export async function main(ns) {
    //initialize delay
    var delay = 0
    //initialize hostname
    var hostname = ""

    //check what to do with the args
    switch (ns.args.length) {
        //if there are 2 arguments (hostname, delay)
        case 2: 
            //get the delay
            delay = ns.args[1]
        //if there are 1 arguments (hostname)
        case 1: 
            //get the hostname
            hostname = ns.args[0]
            //no further data needed
            break
        //any other scenario
        default:
            //indicate issue
            ns.tprint(ns.args.length + " ARGUMENTS FOR 'weaken.js'!")
            //stop
            return
    }    
    
    //perform weaken
    await ns.hack(hostname, {additionalMsec: delay} )
}