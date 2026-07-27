//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.infiltration.md


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class infiltration_obj {
    constructor() {
        this.available = true
    }


    init(ns) {
        //ns.disableLog("")
    }

    /*
    infiltration.getPossibleLocations() 0
    Infiltration.getInfiltration()      15
    */
    manage(ns) {
        // Get all locations that can be infiltrated
        const locations = ns.infiltration.getPossibleLocations()
        //for each location
        for (const location of locations) {
            //Get all infiltrations with difficulty, location and rewards.
            //const infiltration_data = ns.infiltration.getInfiltration(location)       
            //do stuff
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
    close_the_brackets(ns) {
    }


    /*
    Type it backward
    Type the words that are written backward.
    */
    type_it_backward(ns) {
    }


    /*
    Say something nice about the guard.
    Use the arrows to find a compliment for the guard.
    */
    say_something_nice_about_the_guard(ns) {
    }
    

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
    match_the_symbols(ns) {
    }
    

    /*
    Remember all the mines!
    At first, the cursor cannot be moved - remember the positions of the mines.
    Next, move the cursor and press space to mark the mines on the board.
    */
   remember_all_the_mines(ns) {
   }
    
    /*
    Cut the wires
    Follow the instructions and press the numbers 1 through 9 to cut the appropriate wires.
    */
   cut_the_wires(ns) {
   }        
}

/*
getInfiltration(location)       Get all infiltrations with difficulty, location and rewards.
getPossibleLocations()          Get all locations that can be infiltrated.

Requires UI interactions
*/