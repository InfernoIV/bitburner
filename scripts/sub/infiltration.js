//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.infiltration.md


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class infiltration_obj {
    constructor() {
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

    /*
    infiltration.getPossibleLocations() 0
    Infiltration.getInfiltration()      15
    */
    manage(ns) {
        // Get all locations that can be infiltrated where we are
        const locations = this.location[ns.getPlayer().city]
        //for each location
        for (const location of locations) {
            //get data
            const infiltration_data = ns.infiltration.getInfiltration(location)
            //if impossible
            if (infiltration_data.difficulty >= 3.5) {
                //go to next location
                continue
            }
            //go to location
            ns.singularity.goToLocation(location)
            //TODO: check for market demand (between 0 and 1)
            //HOW TO CHECK?
            if (this.market_demand_min < 0 && false) {
                //go to next
                continue
            }
            //perform infiltration
            var result = await this.manage_infiltration(ns, infiltration_data.maxClearanceLevel)
            //if successfull            
            if (result == true) {
                log.success(ns, "Infiltration", "Successfully infiltrated '" + location + "'", true)
                //failed
            } else {
                log.warning(ns, "Infiltration", "Failed to infiltrate '" + location + "'", true)
            }
            //stop after 1 infiltration?
            return
        }
    }


    async manage_infiltration(ns, number_of_tests) {
        //start infiltration
        //document.getElementById("myCheck").click()

        //loop 
        for (const i = 0; i < number_of_tests; i++) {
            //wait until a window appears
            while (true) {
                //if we know what to do
                if (true) {
                    //go next
                    break
                }
                //wait a little bit
                await ns.sleep(CONSTANTS.TIME.WAIT)
            }
            //check what to do
            const type = ""
            switch (type) {
                case "":
                    this.attack_the_distracted_sentinel(ns)
                    break

                case "":
                    this.close_the_brackets(ns)
                    break

                case "":
                    type_it_backward(ns)
                    break

                case "":
                    this.say_something_nice_about_the_guard(ns)
                    break

                case "":
                    this.enter_the_code(ns)
                    break

                case "":
                    this.match_the_symbols(ns)
                    break

                case "":
                    this.remember_all_the_mines(ns)
                    break

                case "":
                    this.cut_the_wires(ns)
                    break

                default:
                    //log
                    log.warning(ns, "Infiltration", "manage_infiltration uncaught: " + type, true)
                    //stop?
                    return
            }
            //wait a little bit
            await ns.sleep(CONSTANTS.TIME.WAIT)
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

//https://www.delftstack.com/howto/javascript/javascript-simulate-keypress/
//keydown
//keyup
function enter(element) {

    element.dispatchEvent(new KeyboardEvent('keydown', {
        'key': "Enter"
    }))
}

function left(element) {
    element.dispatchEvent(new KeyboardEvent('keydown', {
        'key': "a"
    }))
}

function right(element) {
    element.dispatchEvent(new KeyboardEvent('keydown', {
        'key': "d"
    }))
}

function up(element) {
    element.dispatchEvent(new KeyboardEvent('keydown', {
        'key': "w"
    }))
}

function down(element) {
    element.dispatchEvent(new KeyboardEvent('keydown', {
        'key': "s"
    }))
}

function send(element, character) {
    element.dispatchEvent(new KeyboardEvent('keydown', {
        'key': character
    }))
}

/*
getInfiltration(location)       Get all infiltrations with difficulty, location and rewards.
getPossibleLocations()          Get all locations that can be infiltrated.

Requires UI interactions
*/