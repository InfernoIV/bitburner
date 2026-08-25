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
import * as log from "scripts/util/log.js"
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
    //trigger spawning of main on exit
    ns.atExit(() => {
        //boot main
        ns.spawn(SCRIPT.MAIN, {
            threads: 1,
            spawnDelay: 200,
            ramOverride: RAM.MAIN
        })
    })
    //go to active scripts
    click(get_element("p", "Active Scripts").parentElement.parentElement)
    //wait unti the window opens
    await ns.sleep(100)
    //press the ui button to kill all scripts
    click(get_element("button", "Kill All Scripts"))
}


function get_element(type, text = "") {
    //get the buttons
    const elements = doc.getElementsByTagName(type)
    //if we have only 1 element
    if (elements.length == 1) {
        return elements[0]
    }
    //for each button found
    for (const element of elements) {
        //if the correct button
        if (element.innerText.includes(text)) {
            //return the element
            return element
        }
    }
    return null
}


const click = async elem => {
    //click the element
    await elem[Object.keys(elem)[1]].onClick({
        isTrusted: true
    })
    //if we chose to wait: wait
    //if (CLICK_SLEEP_TIME) await ns.sleep(CLICK_SLEEP_TIME)
}