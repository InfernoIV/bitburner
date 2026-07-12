import * as evaluate from 'scripts/sub/eval.js'
import * as root from 'scripts/sub/root.js'
import * as hack from 'scripts/sub/hack.js'
import * as share from 'scripts/sub/share.js'
import * as ui from 'scripts/sub/share.js'

//var ram_script
var tools_owned = []


/** @param {NS} ns */
export async function main(ns) {
    //initialize
    await init(ns)
    //keep track of rooted servers
    var servers_rooted = []
    // @ignore-infinite
    while (true) {

        //root server
        servers_rooted = await root.exec(ns, servers_rooted)

        //debug
        //ns.tprint("servers_rooted: '" + JSON.stringify(servers_rooted) + "'")
        //ns.tprint("Found target: '" + hack.find_target(ns, servers_rooted) + "', status: " + hack.prep_target(ns))
        //start hacking
        await hack.hack_server(ns, servers_rooted) //hack.exec(ns, servers_rooted)

        //update ui
        //await ui.update(ns)
        //wait a bit
        await ns.sleep(100)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //static ram
    ns.ramOverride(4)
    //disable logging
    ns.disableLog("disableLog")
    ns.disableLog("sleep")
    ns.disableLog("scan")

    //kill all scripts
    ns.killall("home", true)
    //init eval
    evaluate.init(ns)

    //init ui
    //await ui.init(ns)
    //init root
    await root.init(ns)
    //init hack
    await hack.init(ns)

    //wait a little bit
    await ns.sleep(100)

    //share (leftover) ram with factions
    await share.exec(ns)
    //signal start of program
    ns.print("Init complete!")
}


/** @param {NS} ns */
async function manage_tools(ns) {
    //dict of tools (key) and value (cost in dark web & hacking level for creating ourselves) 
    const hacking_tools = new Map(
        ["BruteSSH.exe", 0], //augment: x
        ["FTPCrack.exe", 0], //augment: x
        ["relaySMTP.exe", 250], //augment: x
        ["HTTPWorm.exe", 500], //augment: x
        ["SQLInject.exe", 750] //augment: x
    )

    //check if we need to execute this function at all
    //if we don't have all the tools
    if (tools_owned.length < hacking_tools.size) {
        //check which tools still needs to be done
        var tools_to_get = hacking_tools
        //get the available executables on home
        var files = await evaluate.exec(ns, "ns.ls('home', '.exe')")
        //for each file found
        for (const file in files) {
            //if this is a hacking tool and not already found
            if (hacking_tools.has(file)) {
                //if not yet in the owned list
                if (!tools_owned.includes(file)) {
                    //add to the list
                    tools_owned.push(file)
                }
                //if this is a hacking tool
                if (tools_to_get.has(file)) {
                    //remove from TODO list
                    tools_to_get.delete(file)
                }
            }
        }

        //if we have access to the dark web (TODO: how to get automatically?)
        if (!await evaluate.exec(ns, "ns.hasTorRouter()")) {
            //buy tor
            await evaluate.exec(ns, "ns.singularity.purchaseTor()")
            //stop for now
            return
            //we have TOR
        } else {
            //buy the tools if possible
            //check per hacking level and tool
            for (const tool of tools_to_get.keys()) {
                //try to buy
                if (await evaluate.exec(ns, "ns.singularity.purchaseProgram('" + tool + "')")) {
                    //if we bought the tool, remove from todo list
                    tools_to_get.delete(tool)
                }
            }
        }
        //try to create manually
        //get hacking level
        const hacking_level = await evaluate.exec(ns, "ns.getHackingLevel()")
        //check per hacking level and tool
        for (const tool of tools_to_get.keys()) {
            //get the hacking requirement 
            const required_hacking_level = tools_to_get[tool]
            //if we can create
            if (hacking_level >= required_hacking_level) {
                //create tool
                await evaluate.exec(ns, "ns.singularity.createProgram('" + tool + "')")
            }
        }
    }
}


/** @param {NS} ns */
async function manage_servers(ns) {
    //hacknet?
}