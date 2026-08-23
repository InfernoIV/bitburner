import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"


import * as log from "scripts/util/log.js"


const wnd = eval("window")
const doc = wnd["document"]


// Declaration
export class infiltration_obj {
    constructor() {
        //debug
        this.loop = 0
        this.printOnce = true
    }


    init(ns) {
        //disable logging
        log.disable(ns, CONFIG.DISABLE_LOGGING)
    }


    async manage(ns) {
        //keep track if we did anything
        var performed_any_infiltration = false
        //debug
        if (this.loop >= CONFIG.LOOPS_MAX) {
            if(this.printOnce) {
                this.printOnce = false
                ns.alert("Stopping Infiltration")
                ns.toast("Stopping Infiltration")
            }
            //ns.exit()
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
            //log.info(ns, "Infiltration", "Difficulty: " + difficulty, true)
            //if impossible
            if (difficulty >= 100) {
                //go to next location
                continue
            }
            const market_demand = parseFloat(get_element("li", "Market demand").innerText.match(new RegExp(String
                .raw`\d{1,3}\.\d{1,3}`, "g"))[0])
            //get maxClearanceLevel
            const max_clearance_level = parseInt(get_element("h6", "clearance").innerText.match(new RegExp(String
                .raw`\d{1,}`, "g"))[0])

            //if market demand is too low
            if (market_demand < CONFIG.MARKET_DEMAND_MIN) {
                //go to next
                continue
            }

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
                //debug
                this.loop += 1
                //stop
                //ns.exit()
            }

            //debug
            this.loop += 1
            //stop (unblocks main)
            return
        }
        //debug
        this.loop += 1
        //stop (unblocks main)
        return
    }


    async manage_infiltration(ns, max_clearance_level) {
        try {
            //start infiltration
            click(get_element("button", "Start"))
            //loop 
            for (var i = 0; i < max_clearance_level; i++) {
                log.info(ns, "Singularity", "Round " + i, true)
                //wait a little bit
                await ns.sleep(CONFIG.TIME_BETWEEN_ROUNDS)
                var header = doc.getElementsByTagName("h4")[1]
                //get the type
                const type = header.innerText
                //placeholder
                var data = null
                //debug
                log.info(ns, "Infiltration", "Starting " + type, true)
                //check what to do
                switch (type) {





                    //single-key
                    case "Guarding ...":
                        //keep looping -> TODO: how to exit the loop when it fails / times out?
                        while (true) {
                            //get data
                            const status = doc.getElementsByTagName("h4")[1].innerText
                            log.info(ns, "Infiltration", "Guard: " + status, true)
                            //wait until
                            if (status.includes("Distracted")) { //should contain: Guarding / Distracted /  Alerted 
                                //attack
                                await pressKey(ns, CONSTANTS.KEY.SPACE)
                                //stop
                                break
                            }
                            //wait a little bit
                            await ns.sleep(CONSTANTS.TIME.WAIT)
                        }
                        //debug
                        ns.alert("Completed: 'Attack the sentinel'")
                        ns.ui.openTail()
                        await ns.sleep(CONSTANTS.TIME.WAIT)
                        ns.exit()
                        //stop
                        break





                    case "Say something nice about the guard":
                        //determine the element to press down on
                        const text_box = doc.getElementsByTagName("h5")[2]
                        //where to press down on?
                        for (let i = 0; i < 50; i++) { //while (true) {
                            const text = text_box.innerText
                            //log the information found
                            log.info(ns, "Infiltration", "Text: " + text + " (" + CONSTANTS.GUARD_COMPLIMENTS
                                .includes(text) + ") => " + JSON.stringify(CONSTANTS.GUARD_COMPLIMENTS), true)
                            //if this is a complement
                            if (CONSTANTS.GUARD_COMPLIMENTS.includes(text)) {
                                //send
                                await pressKey(ns, CONSTANTS.KEY.SPACE)
                                //debug
                                log.success(ns, "Infiltration", "Send compliment: " + text_box.innerText, true)
                                //next 
                                break
                            } else {
                                log.info(ns, "Infiltration", "Go to next compliment", true)
                                //go to next entry
                                await pressKey(ns, CONSTANTS.KEY.UP)
                            }
                        }
                        //debug
                        ns.alert("Completed: 'Say something nice'")
                        //stop (temporary)
                        ns.ui.openTail()
                        ns.exit()





                        //multi-key
                    case "Enter the Code!":
                        //get the data    
                        data = header.parentElement.children[1].innerText.split("\n")
                        log.info(ns, "Infiltration", "Code of " + data.length + ", data:  '" + data + "'", true)

                        for (let i = 0; i < data.length; i++) {
                            //get the direction
                            const direction = header.parentElement.children[1].innerText.split("\n")[i]
                        }
                        //click(get_element("button", "Cancel"))
                        ns.ui.openTail()
                        ns.exit()
                        //depending on the data: send key strokes
                        switch (direction) {
                            case "↑":
                                await pressKey(ns, CONSTANTS.KEY.UP)
                                break

                            case "←":
                                await pressKey(ns, CONSTANTS.KEY.LEFT)
                                break

                            case "→":
                                await pressKey(ns, CONSTANTS.KEY.RIGHT)
                                break

                            case "↓":
                                await pressKey(ns, CONSTANTS.KEY.DOWN)
                                break

                            default:
                                log.error(ns, "Infiltration", "Enter the Code uncaught: " + data, true)
                                click(get_element("button", "Cancel"))
                                ns.ui.openTail()
                                ns.exit()
                        }
                        //temporary
                        await ns.sleep(CONSTANTS.TIME.WAIT)

                        //debug
                        ns.alert("Completed: 'Enter the code'")
                        //stop                    
                        break


                    case "Cut the wires with the following properties! (keyboard 1 to 9)":
                        //determine the data (array of numbers between 1 to 9)
                        data = header.parentElement.children
                        for (const entry of data) {
                            log.info(ns, "Infiltration", "Cut the wires data entry: '" + entry.innerText + "'",
                                true)
                        }
                        //TODO: stop for now

                        //click(get_element("button", "Cancel"))
                        ns.ui.openTail()
                        await ns.sleep(CONSTANTS.TIME.WAIT)
                        ns.exit()

                        //should work when the correct data is selected
                        //press the keys in the data order
                        await press_keys(ns, data)
                        //debug
                        ns.alert("Completed: 'Cut the wires'")
                        //stop
                        break


                    case "Type it backward":
                        //get the data    
                        data = header.parentElement.children[1].innerText
                        //log
                        log.info(ns, "Infiltration", "Backward data: '" + data + "'", true)
                        //press the keys in the data order
                        await press_keys(ns, data)
                        await ns.sleep(5000)
                        //debug
                        ns.alert("Completed: 'Type it backward'")
                        //stop
                        break


                    case "Close the brackets":
                        //get the data    
                        data = header.parentNode.children[1].innerText
                        /*
                        for (const entry of data) {
                            log.info(ns, "Infiltration", "brackets entry: '" + entry.innerText + "'",
                                true)
                        }
                        ns.ui.openTail()
                        ns.exit()*/
                        //data = data.split('').reverse().join('')
                        //press the keys in the data order
                        await press_keys(ns, data)
                        //debug
                        ns.alert("Completed: 'Close the brackets'")
                        //stop
                        break





                        //advanced coordination
                    case "Match the symbols!":
                        //get the raw data
                        const data_raw = doc.getElementsByTagName("h5")[1].innerText
                        //remove the extra text
                        data = data_raw.replace("Targets: ", "")
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
                                await pressKey(ns, CONSTANTS.KEY.DOWN)
                            }
                            //move right to the column
                            for (let i = 0; i < column; i++) {
                                await pressKey(ns, CONSTANTS.KEY.RIGHT)
                            }
                            //select
                            await pressKey(ns, CONSTANTS.KEY.SPACE)
                        }
                        //debug
                        ns.alert("Completed: 'Match the symbols!'")
                        //stop
                        break

                    case "Remember all the mines!":
                        //list of mines and their coordinates?
                        data = []
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
                log.info(ns, "Infiltration", "Finished loop", true)
            }
        } catch (err) {
            //log
            log.error(ns, "Infiltration", "manage_infiltration error: " + err, true)
            await ns.sleep(CONSTANTS.TIME.WAIT)
            ns.ui.openTail()
            ns.exit()

            //indicate failure
            return false
        }
        //indicate success
        return true
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



async function press_keys(ns, data) {
    //for each entry
    for (const entry of data) {
        //send this number
        const key = await pressKey(ns, entry)
        log.info(ns, "Infiltration", "Send key: '" + key + "'", true)
    }
}


async function pressKey(ns, char) {
   let charToSend = char.toLowerCase()

    if (char === '{') {
        charToSend = '%'

    } else if (char === '}') {
        charToSend = '&'

    } else if (char === 'Space') {
        charToSend = '_'

    } else if (char === 'Tab') {
        charToSend = '^'

    } else if (char === 'Up') {
        charToSend = '↑'

    } else if (char === 'Down') {
        charToSend = '↓'

    } else if (char === 'Left') {
        charToSend = '←'

    } else if (char === 'Right') {
        charToSend = '→'
        
    } else if (char === 'Enter') {
        charToSend = '§'
    }

    // ns.printf('charToSend: %s', JSON.stringify(charToSend, null, 4));
    const options = {
        method: 'GET',
        mode: 'no-cors'
    };
    const url = 'http://localhost:42800/send/SendKeyToBitburner' + charToSend;
    // console.log('Sending', charToSend);

    try {
        await fetch(url, options)
    } catch (error) {
        console.error(error)
    }

    await ns.sleep(120) //110
    //debug
    return char
}

async function pressKeyEvent(ns, char) {
    var keyboardEvent = document.createEvent('KeyboardEvent');
    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? 'initKeyboardEvent' : 'initKeyEvent';
    
    keyboardEvent[initMethod](
    'keydown', // event type: keydown, keyup, keypress
    true, // bubbles
    true, // cancelable
    window, // view: should be window
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    40, // keyCode: unsigned long - the virtual key code, else 0
    0, // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
    )
    document.dispatchEvent(keyboardEvent)

    
}


//https://github.com/bitburner-official/bitburner-src/blob/dev/src/Infiltration/ui/InfiltrationRoot.tsx#L75
/*
const press = (event: KeyboardEvent) => {
      if (!event.isTrusted || !(event instanceof KeyboardEvent)) {
        state.onFailure({ automated: true });
        return;
      }
        */