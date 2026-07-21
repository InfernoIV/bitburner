import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


export async function main(ns) {
    //debug
    log.info(ns, "Jump", "Received args: '" + ns.args + "' 0:'" + ns.args[0] + "', 1:'" + ns.args[1] + "'")
    //get script name
    const script_name = ns.args[0]
    //variable for ram_override
    var ram_override = 0
    //if there are more args
    if (ns.args.length > 1) {
        //get the ram override
        ram_override = parseFloat(ns.args[1])
    }
    //wait a little bit
    await ns.sleep(5)//CONSTANTS.TIME.WAIT)
    //debug
    log.info(ns, "Jump", "Starting '" + script_name + "' with ram_override: " + ram_override)
    //if there is no ram override
    if (ram_override == 0) {
        //launch script
        ns.exec(script_name, CONSTANTS.SERVER.HOME)
        //there is a ram override
    } else {
        //launch with ram override
        ns.exec(script_name, CONSTANTS.SERVER.HOME, {
            ramOverride: ram_override
        })
    }
}