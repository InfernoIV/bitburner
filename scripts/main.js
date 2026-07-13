import * as log from 'scripts/sub/log.js'
import * as root from 'scripts/sub/root.js'
import * as hack from 'scripts/sub/hack.js'
import * as cloud from 'scripts/sub/cloud`.js'
//import * as share from 'scripts/sub/share.js'
//import * as ui from 'scripts/sub/share.js'


/** @param {NS} ns */
export async function main(ns) {
    //initialize
    await init(ns, servers_rooted)
    // @ignore-infinite
    while (true) {
        //check and add cloud servers
        await cloud.manage_servers(ns)
        //root servers
        await root.root_servers(ns, servers_rooted)

        //create overview of servers
        var ram_servers = cloud.get_servers()
        //hack servers
        await hack.hack_server(ns, servers_rooted)

        //update ui
        //await ui.update(ns)

        //wait a bit (what is the lowest time we can pick?)
        await ns.sleep(10)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //static ram
    ns.ramOverride(4)

    //disable generic logging
    ns.disableLog("disableLog")
    ns.disableLog("*")
    
    //init logging, set to true if log to file is desired
    log.init(ns, false)

    //kill all scripts
    ns.killall("home", true)

    //init eval
    evaluate.init(ns)

    //init other scripts
    //init ui
    //await ui.init(ns)

    //init cloud
    await cloud.init(ns)
    //init root
    await root.init(ns)
    //init hack
    await hack.init(ns)

    //wait a little bit
    await ns.sleep(100)

    //share (leftover) ram with factions
    //await share.exec(ns)

    //signal start of program
    log.success(ns, "Main", "Init complete!")
}
