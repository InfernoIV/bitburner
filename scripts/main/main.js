//config
import { DISABLE_LOGGING, TIME_WAIT } from "./config.js"


//constants
import { RAM } from "scripts/ram/constants.js"


//functions
import * as log from "scripts/util/log.js"


//ram manager
import {
    ram_obj
} from "scripts/ram/ram.js"


//get ui elements
const wnd = eval("window")
const doc = wnd["document"]


/** @param {NS} ns */
export async function main(ns) {
    //initialize main
    await init(ns)
    //init ram manager
    let ram_manager = new ram_obj()
    //init ram manager
    await ram_manager.init(ns, RAM.MAIN)
    //log
    log.info(ns, "Main", "Starting main loop", true)
    // @ignore-infinite
    while (true) {
        //import functionality
        await ram_manager.import(ns)
        //let the manager manage all functionality
        await ram_manager.manage_functionalities(ns)
        //wait a bit (what is the lowest time we can pick?)
        await ns.sleep(TIME_WAIT)
    }
}


/** @param {NS} ns */
async function init(ns) {
    //disable logging
    log.disable(ns, DISABLE_LOGGING)
    //go back to console
    click(get_element("p", "Active Scripts").parentElement.parentElement.parentElement.firstChild)
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