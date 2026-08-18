//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.infiltration.md


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

const wnd = eval("window")
const doc = wnd["document"]


// Declaration
export class infiltration_obj {
    constructor() {
        this.loop = 0 
        this.available = true
        //https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.locationnameenumtype.md
        this.location = {
            "Aevum": ["AeroCorp", "Bachman & Associates", "Clarke Incorporated", "ECorp",
                "Fulcrum Technologies",
                "Galactic Cybersystems", "NetLink Technologies",
                "Aevum Police Headquarters", "Rho Construction", "Watchdog Security"
            ],
            "Chongqing": ["KuaiGong International", "Solaris Space Systems"],
            "Ishima": ["Nova Medical", "Omega Software", "Storm Technologies"],
            "New Tokyo": ["DefComm", "Global Pharmaceuticals", "Noodle Bar", "VitaLife"],
            "Sector-12": ["Alpha Enterprises", "Blade Industries", "Carmichael Security", "DeltaOne",
                "Four Sigma", "Icarus Microsystems", "Joe's Guns", "MegaCorp", "Universal Energy"
            ],
            "Volhaven": ["CompuTek", "Helios Labs", "LexoCorp", "NWO", "OmniTek Incorporated",
                "Omnia Cybersystems", "SysCore Securities"
            ],
        }
        this.market_demand_min = 0.5
    }


    init(ns) {
        //ns.disableLog("")
    }


    async manage(ns) {
        if (this.loop >= 10) {
            ns.exit()
            //stop
            return
        }
        // Get all locations that can be infiltrated where we are
        const locations = this.location[ns.getPlayer().city]
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
            /*if (this.market_demand_min < 0 && false) {
                //go to next
                continue
            }*/

            try {
                //perform infiltration
                var result = await this.manage_infiltration(ns, max_clearance_level)
                //if successfull            
                if (result == true) {
                    log.success(ns, "Infiltration", "Successfully infiltrated '" + location + "'", true)
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

            this.loop += 1
            //stop after 1 infiltration round?
            return
        }
    }


    async manage_infiltration(ns, max_clearance_level) {
        //start infiltration
        click(get_element("button", "Start"))
        //loop 
        for (var i = 0; i < max_clearance_level; i++) {
            //wait a little bit
            await ns.sleep(1000)
            click(get_element("button", "Cancel"))
            ns.ui.openTail()
            ns.exit()

            //TODO
            //get the data
            const containers = doc.getElementsByTagName("MuiContainer-root")
            const container_lower = containers.lastChild
            containers.style.color = "#fd0000"
            for (const child of container_lower.children) {
                log.info(ns, "Infiltration", "child: " + child.innerText, true)
            }
            

            //get the data
            const type = doc.getElementsByTagName("h4")[1].innerText
            //debug
            log.info(ns, "Infiltration", "Type: " + type, true)
            var data_raw
            var data = doc.getElementsByTagName("h5")
            for (const data_entry of data) {
                //log
                log.info(ns, "Infiltration", "data_entry: " + data_entry.innerText, true)
            }

            //check what to do
            switch (type) {

                case "Say something nice about the guard":
                    //determine the element to press down on
                    const element = doc.getElementsByTagName("h5")[2]
                    //where to press down on?
                    for (let i = 0; i < 50; i++) {
                        log.info(ns, "Infiltration", "Text: " + element.innerText, true)
                        
                        switch(element) {
                            //correct
                            /*case "":
                            pressKey(" ");
*/

                            //incorrect
                            case "obnoxious":
                            case "couch potato":
                            case "":
                                //view next
                                pressKey("w")
                                //go next
                                continue
                            default: 
                                ns.ui.opentail()
                                log.warning(ns, "Infiltration", "Say_something_nice uncaught: " + element, true)
                                //view next
                                pressKey("w")
                                //go next
                                continue
                        }
                        /*
                         //if incorrect (or only try correct?)
                        if (element.innerText == "obnoxious" || "couch potato") {
                            //press down to go to next
                            press_down(element)
                            //go to next
                            continue
                        }*/
                        //press_enter(element)
                        //otherwise stop
                        //break
                    }
                    ns.ui.openTail()
                    ns.exit()

                case "Match the symbols!":
                    /*
                    //get the required entries
                    data = doc.getElementsByTagName("h5")[1].innerText.replace("Targets: ", "").match(new RegExp(String
                .raw`[A-Za-z0-9]{2}`, "g"))
                    //debug
                    log.info(ns,"Infiltration", "Data: " + data, true)
                    log.info(ns,"Infiltration", "Data 0: " + data[0], true)
                    log.info(ns,"Infiltration", "Data 1: " + data[1], true)
                    log.info(ns,"Infiltration", "Data 2: " + data[2], true)
                    //e.g.: 46 F7 5D BE C4 C4 CA F7 A0

                    //stop for now
                    click(get_element("button", "Cancel"))
                    ns.ui.openTail()
                    ns.exit()
                    //this.match_the_symbols(ns)
                    //break*/

                case "Close the brackets":
                    //this.close_the_brackets(ns)
                    //break

                case "Type it backward":
                    //type_it_backward(ns)
                    //break

                
                    
                    //this.say_something_nice_about_the_guard(ns)
                    //break

                case "Enter the Code!":
                    //this.enter_the_code(ns)
                    //break


                case "Remember all the mines!":
                    //this.remember_all_the_mines(ns)
                    //break

                case "Cut the wires with the following properties! (keyboard 1 to 9)":
                    //this.cut_the_wires(ns)
                    //break

                case "Guarding ...":
                    //this.attack_the_distracted_sentinel(ns)
                    //break

                default:
                    //log
                    log.warning(ns, "Infiltration", "manage_infiltration uncaught: " + type, true)
                    //cancel for now
                    click(get_element("button", "Cancel"))
                    //stop?
                    return
            }
        }
    }




    /*
    Attack the distracted sentinel

    Press space bar to attack when the sentinel drops his guard and is distracted. Do not alert him!
    There are 3 phases:
        Guarding - The sentinel is guarding. Attacking will result in a failure.
        Distracted - The sentinel is distracted. Attacking will result in a victory.
        Alerted - The sentinel is alerted. Attacking will result in a failure.
    */
    attack_the_distracted_sentinel(ns) {

    }


    /*
    Close the brackets
    Enter all the matching brackets in reverse order.
    */
    close_the_brackets(ns) {}


    /*
    Type it backward
    Type the words that are written backward.
    */
    type_it_backward(ns) {}


    /*
    Say something nice about the guard.
    Use the arrows to find a compliment for the guard.
    */
    say_something_nice_about_the_guard(ns) {}


    /*
    Enter the Code!
    Match the arrows as they appear.
    */
    enter_the_code(ns) {

    }


    /*
    Match the symbols!
    Move the cursor to the matching symbol and press space to confirm.
    */
    match_the_symbols(ns) {}


    /*
    Remember all the mines!
    At first, the cursor cannot be moved - remember the positions of the mines.
    Next, move the cursor and press space to mark the mines on the board.
    */
    remember_all_the_mines(ns) {}

    /*
    Cut the wires
    Follow the instructions and press the numbers 1 through 9 to cut the appropriate wires.
    */
    cut_the_wires(ns) {

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

const CLICK_SLEEP_TIME = null;
const click = async elem => {
    await elem[Object.keys(elem)[1]].onClick({
        isTrusted: true
    });
    if (CLICK_SLEEP_TIME) await ns.sleep(CLICK_SLEEP_TIME);
};


function pressKey(keyOrCode) {
    let keyCode = 0;
    let key = "";
 
    if ("string" === typeof keyOrCode && keyOrCode.length > 0) {
        key = keyOrCode.toLowerCase().substr(0, 1);
        keyCode = key.charCodeAt(0);
    } else if ("number" === typeof keyOrCode) {
        keyCode = keyOrCode;
        key = String.fromCharCode(keyCode);
    }
 
    if (!keyCode || key.length !== 1) {
        return;
    }
 
    function sendEvent(event) {
        const keyboardEvent = new KeyboardEvent(event, {
            key,
            keyCode,
        });
 
        doc.dispatchEvent(keyboardEvent);
    }
 
    sendEvent("keydown");
}