import * as CONSTANTS from "constants.js"
import * as CONFIG from "config.js"


import * as log from "scripts/util/log.js"


const wnd = eval("window")
const doc = wnd["document"]


// Declaration
export class infiltration_obj {
    constructor() {
        //debug
        this.loop = 0
    }


    init(ns) {
        //disable logging
        log.disable(CONFIG.DISABLE_LOGGING)
    }


    async manage(ns) {
        //debug
        if (this.loop >= CONFIG.LOOPS_MAX) {
            ns.exit()
            //stop
            return
        }
        // Get all locations that can be infiltrated where we are
        const locations = CONSTANTS.INFILTRATION_LOCATION[ns.getPlayer().city]
        //for each location
        for (const location of locations) {
            //go to location
            ns.singularity.goToLocation(location)
            //open infiltration menu
            click(get_element("button", "Infiltrate"))
            //get difficulty
            const difficulty = parseInt(get_element("h6", "Difficulty").innerText.match(new RegExp(String
                .raw`\d{1,}`, "g"))[0])
            //debug
            log.info(ns, "Infiltration", "Difficulty: " + difficulty, true)
            //if impossible
            if (difficulty >= 100) {
                //go to next location
                continue
            }
            //get maxClearanceLevel
            const max_clearance_level = parseInt(get_element("h6", "clearance").innerText.match(new RegExp(String
                .raw`\d{1,}`, "g"))[0])

            //TODO: check for market demand (between 0 and 1)
            //HOW TO CHECK?
            /*if (CONFIG.MARKET_DEMAND_MIN < 0 && false) {
                //go to next
                continue
            }*/

            try {
                //perform infiltration
                var result = await this.manage_infiltration(ns, max_clearance_level)
                //if successfull            
                if (result == true) {
                    //log
                    log.success(ns, "Infiltration", "Successfully infiltrated '" + location + "'", true)
                    //TODO: choose rewards
                    //faction rep? money? faction favor (applicable?)?

                    //stop for now
                    ns.ui.openTail()
                    ns.exit()

                    //failed
                } else {
                    log.warning(ns, "Infiltration", "Failed to infiltrate '" + location + "'", true)
                }
            } catch (err) {
                //log
                log.error(ns, "Infiltration", "Error with infiltration: " + err, true)
                //stop
                ns.exit()
            }

            //debug
            this.loop += 1
            //stop (unblocks main)
            return
        }
    }


    async manage_infiltration(ns, max_clearance_level) {
        try {
            //start infiltration
            click(get_element("button", "Start"))
            //loop 
            for (var i = 0; i < max_clearance_level; i++) {
                //wait a little bit
                await ns.sleep(CONFIG.TIME_BETWEEN_ROUNDS)
                //get the type
                const type = doc.getElementsByTagName("h4")[1].innerText
                //check what to do
                switch (type) {





                    //single-key
                    case "Guarding ...":
                        //keep looping -> TODO: how to exit the loop when it fails / times out?
                        while (true) {
                            //get the data
                            const data = doc.getElementsByTagName("h4")[1].innerText //should contain: Guarding / Distracted /  Alerted 
                            //TODO: stop for now
                            log.info(ns, "Infiltration", "Guarding data: '" + data + "'", true)
                            //click(get_element("button", "Cancel"))
                            //ns.ui.openTail()
                            //ns.exit()

                            //wait until
                            if (data.includes("Distracted")) {
                                //attack
                                pressKey(" ")
                                //stop
                                break
                            }
                            //wait a little bit
                            await ns.sleep(CONSTANTS.TIME.WAIT)
                        }
                        //debug
                        ns.alert("Completed: 'Attack the sentinel'")
                        //stop
                        break




                        
                    case "Say something nice about the guard":
                        //determine the element to press down on
                        const element = doc.getElementsByTagName("h5")[2]
                        //where to press down on?
                        for (let i = 0; i < 50; i++) { //while (true) {
                            //log the information found
                            log.info(ns, "Infiltration", "Text: " + element.innerText, true)
                            //if this is a complement
                            if (CONSTANTS.GUARD_COMPLIMENTS.includes(element.innerText)) {
                                //send
                                pressKey(CONSTANTS.KEY.UP)
                                //debug
                                log.success(ns, "Infiltration", "Send compliment: " + element.innerText, true)
                                //next 
                                break
                            } else {
                                //go to next entry
                                pressKey("w")
                                //TODO: needed? wait a little bit
                                await ns.sleep(CONSTANTS.TIME.WAIT)
                            }
                        }
                        //debug
                        ns.alert("Completed: 'Say something nice'")
                        //stop (temporary)
                        ns.ui.openTail()
                        ns.exit()





                        //multi-key
                    case "Enter the Code!":
                        //TODO: how to determine when we're done?
                        while (true) {
                            //TODO: get the code    
                            const data = ""
                            //TODO: stop for now
                            log.info(ns, "Infiltration", "Code data: '" + data + "'", true)
                            //click(get_element("button", "Cancel"))
                            ns.ui.openTail()
                            ns.exit()
                            //depending on the data: send key strokes
                            switch (data) {
                                case "":
                                    pressKey(CONSTANTS.KEY.UP)
                                    break

                                case "":
                                    pressKey(CONSTANTS.KEY.LEFT)
                                    break

                                case "":
                                    pressKey(CONSTANTS.KEY.RIGHT)
                                    break

                                case "":
                                    pressKey(CONSTANTS.KEY.DOWN)
                                    break

                                default:
                                    log.error(ns, "Infiltration", "Enter the Code uncaught: " + data, true)
                                    click(get_element("button", "Cancel"))
                                    ns.ui.openTail()
                                    ns.exit()
                            }
                            //temporary
                            await ns.sleep(CONSTANTS.TIME.WAIT)
                        }
                        //debug
                        ns.alert("Completed: 'Enter the code'")
                        //stop                    
                        break


                    case "Cut the wires with the following properties! (keyboard 1 to 9)":
                        //determine the data (array of numbers between 1 to 9)
                        const data = []
                        //TODO: stop for now
                        log.info(ns, "Infiltration", "Cut the wires data: '" + data + "'", true)
                        //click(get_element("button", "Cancel"))
                        ns.ui.openTail()
                        ns.exit()

                        //should work when the correct data is selected
                        //press the keys in the data order
                        press_keys(data)
                        //debug
                        ns.alert("Completed: 'Cut the wires'")
                        //stop
                        break


                    case "Type it backward":
                        //get the data    
                        var data = ""
                        //TODO: stop for now
                        log.info(ns, "Infiltration", "Backward data: '" + data + "'", true)
                        //click(get_element("button", "Cancel"))
                        ns.ui.openTail()
                        ns.exit()

                        //should work if the data is correct?

                        //reverse the data
                        data = data.split('').reverse().join('')
                        //press the keys in the data order
                        press_keys(data)
                        //debug
                        ns.alert("Completed: 'Type it backward'")
                        //stop
                        break


                    case "Close the brackets":
                        //get the data    
                        var data = ""
                        //TODO: stop for now
                        log.info(ns, "Infiltration", "Brackets data: '" + data + "'", true)
                        //click(get_element("button", "Cancel"))
                        ns.ui.openTail()
                        ns.exit()

                        //should work if the data is correct?

                        //press the keys in the data order
                        press_keys(data)
                        //debug
                        ns.alert("Completed: 'Close the brackets'")
                        //stop
                        break





                        //advanced coordination
                    case "Match the symbols!":
                        //get the raw data
                        const data_raw = doc.getElementsByTagName("h5")[1].innerText
                        //remove the extra text
                        var data = data_raw.replace("Targets: ", "")
                        //split into array
                        data = data.match(new RegExp(String.raw`[A-Za-z0-9]{2}`, "g"))
                        //TODO: stop for now
                        log.info(ns, "Infiltration", "Symbols data: '" + data + "'", true)
                        //click(get_element("button", "Cancel"))
                        ns.ui.openTail()
                        ns.exit()

                        //TODO
                        //get the matrix, e.g.:
                        const matrix = [
                            [0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0]
                        ]
                        //for each entry
                        for (const entry of data) {
                            //do something
                            //determine the row
                            const row = 0
                            //determine the column
                            const column = 0
                            //move down to the row
                            for (let i = 0; i < row; i++) {
                                pressKey(CONSTANTS.KEY.DOWN)
                            }
                            //move right to the column
                            for (let i = 0; i < column; i++) {
                                pressKey(CONSTANTS.KEY.RIGHT)
                            }
                            //select
                            pressKey(" ")
                        }
                        //debug
                        ns.alert("Completed: 'Match the symbols!'")
                        //stop
                        break

                    case "Remember all the mines!":
                        //list of mines and their coordinates?
                        const data = []
                        //TODO: stop for now
                        log.info(ns, "Infiltration", "Mines data: '" + data + "'", true)
                        //click(get_element("button", "Cancel"))
                        ns.ui.openTail()
                        ns.exit()

                        //requires more time, can learn from the symbols

                        //debug
                        ns.alert("Completed: 'Remember all the mines!'")
                        //stop
                        break





                        //should not be triggered
                    default:
                        //log
                        log.warning(ns, "Infiltration", "manage_infiltration uncaught: " + type, true)
                        //cancel for now
                        click(get_element("button", "Cancel"))
                        //indicate failure
                        return false
                }
            }
        } catch (err) {
            //log
            log.error(ns, "Infiltration", "manage_infiltration error: " + err, true)
            //indicate failure
            return false
        }
        //indicate success
        return true
    }
}


async function press_keys(data) {
    //for each entry
    for (const entry in data) {
        //send this number
        pressKey(entry)
        //wait a little bit
        await ns.sleep(CONFIG.TIME_BETWEEN_KEYS)
    }
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
    if (CONFIG.CLICK_SLEEP_TIME) await ns.sleep(CONFIG.CLICK_SLEEP_TIME)
}


function pressKey(keyOrCode) {
    //variables to fill
    let keyCode = 0
    let key = ""
    //if a string and set
    if ("string" === typeof keyOrCode && keyOrCode.length > 0) {
        //get the first character in lowercase
        key = keyOrCode.toLowerCase().substr(0, 1)
        //generate the keycode
        keyCode = key.charCodeAt(0)
        //if number
    } else if ("number" === typeof keyOrCode) {
        //copy the number
        keyCode = keyOrCode
        //generate the key
        key = String.fromCharCode(keyCode)
    }
    //if key is not set
    if (!keyCode || key.length !== 1) {
        //stop
        return
    }
    //function to send the event
    function sendEvent(event) {
        //create the keyboard event
        const keyboardEvent = new KeyboardEvent(event, {
            key,
            keyCode,
        });
        //dispatch the event with the key and key code
        doc.dispatchEvent(keyboardEvent)
    }
    //sent the actual event
    sendEvent("keydown")
}