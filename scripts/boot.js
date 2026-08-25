//config


//constants
import {
    SERVER
} from "scripts/constants/servers.js"
import {
    SCRIPT
} from "scripts/constants/scripts.js"
import {
    RAM
} from "scripts/constants/ram.js"


//functions
import {
    scan_servers
} from "scripts/root/root.js"


//get ui elements
const wnd = eval("window")
const doc = wnd["document"]


//the "BOOT" alias kills all scripts on home and starts this script
//this script sets an at exit script to boot main script
//then uses the UI to kill all scripts -> triggering the at exit of this script
export async function main(ns) {
    //log message
    log.info(ns, "Boot", "start Boot", true)

    /*
    //if the scripts exits
    ns.atExit(() => {
        //debug
        ns.ui.openTail()
        //get logs
        let logs = ns.getScriptLogs()
        if (logs == undefined) {
            return
        }
        //get the last log
        const last_log = logs.pop()
        if (last_log == undefined) {
            return
        }
        //if the script is killed (due to kill all button)
        if (last_log.includes("kill")) {
            //boot main
            ns.spawn(SCRIPT.MAIN, {
                threads: 1,
                spawnDelay: 0,
                ramOverride: RAM.MAIN
            })
        }
    })*/
    //go to the scripts menu
    //press the ui button to kill all scripts
    //press the ok button to kill all scripts

    //get servers
    const servers_found = scan_servers(ns)
    //for each server
    for (const server of servers_found) {
        //kill the scripts
        ns.killall(server, (server == SERVER.HOME))
    }
    //boot main
    ns.spawn(SCRIPT.MAIN, {
        threads: 1,
        spawnDelay: 0,
        ramOverride: RAM.MAIN
    })

}